import {
  CameraPresetId,
  EyeLabState,
  MirrorLabState,
} from '../types/optics';

export interface ChoreographyFrame {
  mirrorPatch?: Partial<MirrorLabState>;
  eyePatch?: Partial<EyeLabState>;
  cameraPreset?: CameraPresetId;
  autoRotate?: boolean;
}

function lerp(a: number, b: number, t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return a + (b - a) * c;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / Math.max(0.0001, edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Computes real-time 3D scene choreography synced to voiceover progress (0..1)
 * for each of the 9 Grade 5 IPAS narration chapters.
 */
export function evaluateChapterChoreography(
  segmentId: string,
  p: number
): ChoreographyFrame {
  const t = Math.max(0, Math.min(1, p));

  switch (segmentId) {
    // 01. Kenalan Cermin Cekung: lampu senter naik-turun + putar cermin lembut + orbit 3D
    case 'mirror-intro': {
      const lampY =
        t < 0.45
          ? lerp(10, -2, smoothstep(0.12, 0.45, t))
          : lerp(-2, 9, smoothstep(0.45, 0.78, t));
      const tilt =
        t > 0.62
          ? Math.sin(smoothstep(0.62, 0.96, t) * Math.PI * 2) * 8
          : 0;
      return {
        mirrorPatch: {
          mirrorType: 'concave',
          focalLengthCm: 12,
          objectDistanceCm: 32,
          objectType: 'robot',
          lightSourceYCm: Math.round(lampY),
          mirrorRotationDeg: Math.round(tilt),
          showPrincipalRays: true,
          showLightSourceRays: true,
          showScreen: true,
        },
        autoRotate: t > 0.55 && t < 0.92,
        cameraPreset: t < 0.15 ? 'perspective' : undefined,
      };
    }

    // 02. Bayangan Nyata & Terbalik: robot bergeser dari jauh ke sedang sehingga bayangan terbalik ikut membesar
    case 'mirror-concave-real': {
      const dist =
        t < 0.65
          ? lerp(42, 24, smoothstep(0.08, 0.65, t))
          : lerp(24, 34, smoothstep(0.65, 0.95, t));
      return {
        mirrorPatch: {
          mirrorType: 'concave',
          focalLengthCm: 12,
          objectDistanceCm: Math.round(dist),
          objectType: 'robot',
          mirrorRotationDeg: 0,
          showPrincipalRays: true,
          showLightSourceRays: false,
          showScreen: true,
        },
        autoRotate: false,
        cameraPreset: t < 0.55 ? 'side' : 'perspective',
      };
    }

    // 03. Sulap Jadi Raksasa (Cermin Rias): lilin meluncur melewati Titik Fokus F (14cm -> 7cm)!
    case 'mirror-concave-virtual': {
      const dist =
        t < 0.35
          ? lerp(18, 7, smoothstep(0.05, 0.35, t))
          : t < 0.75
          ? lerp(7, 9, smoothstep(0.35, 0.75, t))
          : 8;
      return {
        mirrorPatch: {
          mirrorType: 'concave',
          focalLengthCm: 14,
          objectDistanceCm: Math.round(dist),
          objectType: 'candle',
          mirrorRotationDeg: 0,
          showPrincipalRays: true,
          showLightSourceRays: false,
          showVirtualExtensions: true,
          showScreen: false,
        },
        autoRotate: t > 0.5 && t < 0.9,
        cameraPreset: t < 0.4 ? 'perspective' : undefined,
      };
    }

    // 04. Cermin Cembung (Kaca Spion): pohon apel digeser mendekat & menjauh, bayangan tetap tegak & kecil!
    case 'mirror-convex': {
      const dist =
        t < 0.55
          ? lerp(36, 10, smoothstep(0.15, 0.55, t))
          : lerp(10, 28, smoothstep(0.55, 0.9, t));
      return {
        mirrorPatch: {
          mirrorType: 'convex',
          focalLengthCm: 12,
          objectDistanceCm: Math.round(dist),
          objectType: 'tree',
          mirrorRotationDeg: 0,
          showPrincipalRays: true,
          showLightSourceRays: true,
          showVirtualExtensions: true,
          showScreen: false,
        },
        autoRotate: false,
        cameraPreset: t < 0.5 ? 'perspective' : 'side',
      };
    }

    // 05. Mata Sehat: mulai sudut samping, lalu zoom ke Layar Retina 3D yang tajam!
    case 'eye-normal': {
      return {
        eyePatch: {
          condition: 'normal',
          lensEnabled: false,
          lensPowerDiopter: 0,
          objectDistanceFactor: 1.0,
          cutawayMode: true,
          showRays: true,
          showLabels: true,
        },
        autoRotate: false,
        cameraPreset: t < 0.52 ? 'perspective' : 'retina',
      };
    }

    // 06. Miopia (Rabun Jauh): tampak samping sinar jatuh di depan retina, lalu zoom ke Layar Retina yang buram!
    case 'eye-myopia': {
      return {
        eyePatch: {
          condition: 'myopia',
          lensEnabled: false,
          lensPowerDiopter: -2.5,
          objectDistanceFactor: 1.0,
          cutawayMode: true,
          showRays: true,
          showLabels: true,
        },
        autoRotate: false,
        cameraPreset: t < 0.55 ? 'side' : 'retina',
      };
    }

    // 07. Koreksi Miopia: kacamata minus meluncur turun di 20%, dioptri bergerak -0.5 -> -2.5D hingga tajam, lalu zoom Retina!
    case 'eye-myopia-correction': {
      const glassesOn = t >= 0.18;
      const diopter = glassesOn
        ? -Math.round(lerp(0.5, 2.5, smoothstep(0.2, 0.62, t)) * 4) / 4
        : -2.5;
      return {
        eyePatch: {
          condition: 'myopia',
          lensEnabled: glassesOn,
          lensPowerDiopter: diopter,
          objectDistanceFactor: 1.0,
          cutawayMode: true,
          showRays: true,
          showLabels: true,
        },
        autoRotate: false,
        cameraPreset: t < 0.65 ? 'perspective' : 'retina',
      };
    }

    // 08. Hipermetropia (Rabun Dekat): target mendekat ke jarak baca buku, fokus mundur ke belakang retina, lalu zoom Retina buram!
    case 'eye-hyperopia': {
      const distFactor = lerp(0.75, 0.0, smoothstep(0.15, 0.45, t));
      return {
        eyePatch: {
          condition: 'hyperopia',
          lensEnabled: false,
          lensPowerDiopter: 3.0,
          objectDistanceFactor: Math.round(distFactor * 20) / 20,
          cutawayMode: true,
          showRays: true,
          showLabels: true,
        },
        autoRotate: false,
        cameraPreset: t < 0.58 ? 'side' : 'retina',
      };
    }

    // 09. Koreksi Hipermetropia: kacamata plus turun di 18%, dioptri +0.5 -> +3.0D menarik fokus maju ke retina, lalu zoom Retina tajam!
    case 'eye-hyperopia-correction': {
      const glassesOn = t >= 0.18;
      const diopter = glassesOn
        ? Math.round(lerp(0.5, 3.0, smoothstep(0.2, 0.62, t)) * 4) / 4
        : 3.0;
      return {
        eyePatch: {
          condition: 'hyperopia',
          lensEnabled: glassesOn,
          lensPowerDiopter: diopter,
          objectDistanceFactor: 0.0,
          cutawayMode: true,
          showRays: true,
          showLabels: true,
        },
        autoRotate: false,
        cameraPreset: t < 0.65 ? 'perspective' : 'retina',
      };
    }

    default:
      return {};
  }
}
