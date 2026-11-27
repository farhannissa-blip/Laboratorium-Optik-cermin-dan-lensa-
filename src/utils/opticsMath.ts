import {
  EyeCondition,
  EyeLabState,
  EyeOpticsResult,
  MirrorLabState,
  MirrorOpticsResult,
} from '../types/optics';

/** Scale: 1 Three.js world unit = 5 cm on the optical bench */
export const CM_PER_UNIT = 5;

export function cmToUnits(cm: number): number {
  return cm / CM_PER_UNIT;
}

export function computeMirrorOptics(state: MirrorLabState): MirrorOpticsResult {
  const f =
    state.mirrorType === 'concave'
      ? Math.abs(state.focalLengthCm)
      : -Math.abs(state.focalLengthCm);
  const R = 2 * f;
  const s = Math.max(1, state.objectDistanceCm);

  // Determine Dalil Esbach object region for concave mirror
  let objectRegion = 'Depan Cermin';
  if (state.mirrorType === 'concave') {
    const absF = Math.abs(f);
    if (Math.abs(s - absF) < 0.35) {
      objectRegion = 'Tepat di Titik F';
    } else if (Math.abs(s - 2 * absF) < 0.35) {
      objectRegion = 'Tepat di Pusat M (2f)';
    } else if (s < absF) {
      objectRegion = 'Ruang I (0 < s < f)';
    } else if (s < 2 * absF) {
      objectRegion = 'Ruang II (f < s < 2f)';
    } else {
      objectRegion = 'Ruang III (s > 2f)';
    }
  } else {
    objectRegion = 'Ruang IV (Depan Cermin Cembung)';
  }

  // Check if object is right on focal point of concave mirror
  if (state.mirrorType === 'concave' && Math.abs(s - f) < 0.35) {
    return {
      signedFocalCm: f,
      radiusOfCurvatureCm: R,
      imageDistanceCm: null,
      magnification: null,
      imageHeightCm: null,
      isReal: false,
      isUpright: true,
      sizeCategory: 'Tak Hingga',
      natureLabel: 'Bayangan di Tak Hingga (Sinar Pantul Sejajar)',
      objectRegion,
      imageRegion: 'Tak Hingga (∞)',
      isAtInfinity: true,
    };
  }

  // Thin spherical mirror equation: 1/s' = 1/f - 1/s
  const invSPrime = 1 / f - 1 / s;
  const sPrime = 1 / invSPrime;
  const magnification = -sPrime / s;
  const imageHeightCm = magnification * state.objectHeightCm;

  const isReal = sPrime > 0;
  const isUpright = magnification > 0;
  const absM = Math.abs(magnification);

  let sizeCategory: MirrorOpticsResult['sizeCategory'] = 'Sama Besar';
  if (absM > 1.04) {
    sizeCategory = 'Diperbesar';
  } else if (absM < 0.96) {
    sizeCategory = 'Diperkecil';
  }

  const natureLabel = `${isReal ? 'Nyata' : 'Maya'}, ${
    isUpright ? 'Tegak' : 'Terbalik'
  }, ${sizeCategory}`;

  let imageRegion = '';
  if (state.mirrorType === 'concave') {
    const absF = Math.abs(f);
    if (!isReal) {
      imageRegion = 'Ruang IV (Belakang Cermin)';
    } else if (Math.abs(sPrime - 2 * absF) < 0.5) {
      imageRegion = 'Tepat di Pusat M (2f)';
    } else if (sPrime < 2 * absF) {
      imageRegion = 'Ruang II (f < s\' < 2f)';
    } else {
      imageRegion = 'Ruang III (s\' > 2f)';
    }
  } else {
    imageRegion = 'Ruang I (Belakang Cermin, antara O dan F)';
  }

  return {
    signedFocalCm: f,
    radiusOfCurvatureCm: R,
    imageDistanceCm: sPrime,
    magnification,
    imageHeightCm,
    isReal,
    isUpright,
    sizeCategory,
    natureLabel,
    objectRegion,
    imageRegion,
    isAtInfinity: false,
  };
}

/**
 * Optical geometry & refractive model for the 3D cutaway human eyeball.
 * Eyeball center sits around x = 0.
 * Cornea apex around x = -2.15, Crystalline lens center at x = -1.35.
 * Retina posterior pole moves depending on axial length:
 *   - Normal:    retinaX = +2.10 (axial length ~24.0 mm)
 *   - Myopia:    retinaX = +2.68 (axial length ~27.2 mm, elongated)
 *   - Hyperopia: retinaX = +1.56 (axial length ~20.8 mm, shortened)
 */
export const EYE_LENS_X = -1.35;
export const EYE_CORNEA_X = -2.12;
export const CORRECTIVE_LENS_X = -3.35;

export function getOptimalDiopter(
  condition: EyeCondition,
  objectDistanceFactor: number
): number {
  if (condition === 'normal') return 0;
  if (condition === 'myopia') {
    // Distant vision requires ~ -2.50 D; closer objects need slightly less negative power
    return Number((-2.5 + (1 - objectDistanceFactor) * 0.45).toFixed(2));
  }
  // Hyperopia: near vision stresses accommodation more, needing ~ +2.50 D to +3.00 D
  return Number((2.25 + (1 - objectDistanceFactor) * 0.75).toFixed(2));
}

export function computeEyeOptics(state: EyeLabState): EyeOpticsResult {
  const { condition, lensEnabled, lensPowerDiopter, objectDistanceFactor } = state;

  let axialLengthMm = 24.0;
  let retinaX = 2.1;

  if (condition === 'myopia') {
    axialLengthMm = 27.2;
    retinaX = 2.68;
  } else if (condition === 'hyperopia') {
    axialLengthMm = 20.8;
    retinaX = 1.56;
  }

  // Baseline eye optical focal length (distance from crystalline lens at x = -1.35)
  // Normal eye accommodates cleanly across near & far objects so it focuses at x = 2.10
  // Myopic eye has strong refractive power + long eyeball -> focuses in front of retina (~1.72 to 1.98)
  // Hyperopic eye has weak refractive power / short eyeball -> focuses behind retina (~2.25 to 2.58)
  let baseFocusX = 2.1;
  if (condition === 'normal') {
    // Healthy ciliary accommodation keeps focus crisp right on retina
    baseFocusX = 2.1;
  } else if (condition === 'myopia') {
    // Distant objects (factor=1) focus well in front of retina; near objects shift focus slightly backward
    baseFocusX = 1.72 + (1 - objectDistanceFactor) * 0.24;
  } else {
    // Near objects (factor=0) push focal point further behind the short retina
    baseFocusX = 2.24 + (1 - objectDistanceFactor) * 0.34;
  }

  // Corrective lens shifts focal point:
  // Negative diopter (concave / diverging) pushes focal point BACKWARD (+X toward elongated retina)
  // Positive diopter (convex / converging) pulls focal point FORWARD (-X toward shortened retina)
  const effectiveDiopter = lensEnabled ? lensPowerDiopter : 0;
  // Calibrated so -2.5 D moves focus +0.96 units (1.72 -> 2.68) and +2.75 D moves focus -0.96 units
  const shiftPerDiopter = -0.384;
  const focalPointX = Math.max(
    0.35,
    Math.min(4.2, baseFocusX + effectiveDiopter * shiftPerDiopter)
  );

  const focusErrorUnits = focalPointX - retinaX;
  const absError = Math.abs(focusErrorUnits);
  const blurRadius = Math.min(1, absError / 1.05);
  const isSharp = absError < 0.14;

  const optimalDiopter = getOptimalDiopter(condition, objectDistanceFactor);

  let recommendedLensLabel = 'Tidak Memerlukan Lensa Koreksi';
  if (condition === 'myopia') {
    recommendedLensLabel = 'Lensa Cekung / Negatif (Divergen)';
  } else if (condition === 'hyperopia') {
    recommendedLensLabel = 'Lensa Cembung / Positif (Konvergen)';
  }

  let focusStatusLabel = 'Fokus Tajam Tepat di Retina';
  if (!isSharp) {
    if (focusErrorUnits < 0) {
      focusStatusLabel = 'Titik Fokus Jatuh di Depan Retina (Bayangan Kabur)';
    } else {
      focusStatusLabel = 'Titik Fokus Jatuh di Belakang Retina (Bayangan Kabur)';
    }
  } else if (lensEnabled && Math.abs(effectiveDiopter) > 0.1) {
    focusStatusLabel = 'Terkoreksi — Fokus Tajam Kembali Tepat di Retina';
  }

  return {
    axialLengthMm,
    retinaX,
    focalPointX,
    focusErrorUnits,
    blurRadius,
    optimalDiopter,
    recommendedLensLabel,
    focusStatusLabel,
    isSharp,
  };
}
