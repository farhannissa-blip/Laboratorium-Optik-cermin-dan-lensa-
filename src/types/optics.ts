export type LabModule = 'mirror' | 'eye';

export type MirrorType = 'concave' | 'convex';

export type MirrorObjectType = 'candle' | 'robot' | 'tree' | 'pencil';

export type CameraPresetId =
  | 'perspective'
  | 'side'
  | 'top'
  | 'front'
  | 'retina';

export interface MirrorLabState {
  mirrorType: MirrorType;
  /** Focal length magnitude in cm (positive value, sign determined by mirrorType) */
  focalLengthCm: number;
  /** Object distance in cm (positive, in front of mirror) */
  objectDistanceCm: number;
  /** Object height in cm */
  objectHeightCm: number;
  /** Selected 3D object model */
  objectType: MirrorObjectType;
  /** Mirror Y-axis rotation in degrees (-20 to +20) */
  mirrorRotationDeg: number;
  /** Light source horizontal distance in cm in front of mirror (10 to 50) */
  lightSourceXCm: number;
  /** Light source elevation height relative to optical axis in cm (-10 to +14) */
  lightSourceYCm: number;
  /** Light source beam spread angle in degrees (4 to 22) */
  lightBeamAngleDeg: number;
  /** Toggle principal rays (3 Sinar Istimewa) */
  showPrincipalRays: boolean;
  /** Toggle controllable light source beams */
  showLightSourceRays: boolean;
  /** Toggle dashed virtual ray extensions */
  showVirtualExtensions: boolean;
  /** Toggle translucent projection screen for real images */
  showScreen: boolean;
  /** Toggle 3D F, M, O axis labels */
  showLabels: boolean;
}

export interface MirrorOpticsResult {
  signedFocalCm: number;
  radiusOfCurvatureCm: number;
  imageDistanceCm: number | null; // null when at infinity (s === f)
  magnification: number | null;
  imageHeightCm: number | null;
  isReal: boolean;
  isUpright: boolean;
  sizeCategory: 'Diperbesar' | 'Diperkecil' | 'Sama Besar' | 'Tak Hingga';
  natureLabel: string;
  objectRegion: string;
  imageRegion: string;
  isAtInfinity: boolean;
}

export type EyeCondition = 'normal' | 'myopia' | 'hyperopia';

export interface EyeLabState {
  condition: EyeCondition;
  /** Whether the corrective glasses lens is positioned in front of cornea */
  lensEnabled: boolean;
  /** Corrective lens optical power in Diopters (-5.0 to +5.0) */
  lensPowerDiopter: number;
  /** Target distance slider: 0 = Dekat (25 cm), 1 = Jauh (Tak hingga / >6m) */
  objectDistanceFactor: number;
  /** Toggle cutaway cross-section view of eyeball */
  cutawayMode: boolean;
  /** Toggle 3D refractive light rays */
  showRays: boolean;
  /** Toggle 3D anatomical callout labels */
  showLabels: boolean;
}

export interface EyeOpticsResult {
  /** Axial length of the eyeball in mm */
  axialLengthMm: number;
  /** Target retina X coordinate in eye local units */
  retinaX: number;
  /** Computed focal point X coordinate in eye local units */
  focalPointX: number;
  /** Signed focus error relative to retina (+ means behind retina, - means in front) */
  focusErrorUnits: number;
  /** Normalized blur radius on retina (0 = razor sharp, 1 = heavily blurred) */
  blurRadius: number;
  /** Recommended optimal corrective lens diopter */
  optimalDiopter: number;
  /** Recommended lens type name */
  recommendedLensLabel: string;
  /** Human-readable focus status */
  focusStatusLabel: string;
  /** Whether focus is currently sharp on the retina */
  isSharp: boolean;
}

export interface ScenePresetPatch {
  module: LabModule;
  mirrorPatch?: Partial<MirrorLabState>;
  eyePatch?: Partial<EyeLabState>;
  cameraPreset?: CameraPresetId;
}

export interface NarrationSegment {
  id: string;
  order: number;
  module: LabModule;
  sectionLabel: string;
  title: string;
  durationHint: string;
  keyConcepts: string[];
  defaultScript: string;
  defaultAudioUrl?: string;
  defaultAudioLabel?: string;
  scenePreset: ScenePresetPatch;
}

export interface UploadedVoiceoverRecord {
  segmentId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  updatedAt: number;
  blob: Blob;
}
