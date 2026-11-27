import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  CameraPresetId,
  EyeLabState,
  LabModule,
  MirrorLabState,
  MirrorObjectType,
  MirrorType,
} from '../types/optics';
import {
  cmToUnits,
  computeEyeOptics,
  computeMirrorOptics,
  CORRECTIVE_LENS_X,
  EYE_CORNEA_X,
  EYE_LENS_X,
} from '../utils/opticsMath';
import {
  buildCorrectiveLensGeometry,
  buildSphericalMirrorGeometries,
  createEyeLabAssembly,
  createLabelSprite,
  createLightSourceAssembly,
  createMirrorAssembly,
  createOpticalBench,
  createOpticalSubjectModel,
  createProjectionScreenAssembly,
  createRailCarriage,
  createScienceClassroomEnvironment,
  EyeAssemblyRefs,
  OPTICAL_AXIS_Y,
  RAIL_TOP_Y,
  renderRetinaProjectionCanvas,
  updateLabelSpriteText,
} from './proceduralAssets';

interface PhotonSegment {
  start: THREE.Vector3;
  end: THREE.Vector3;
  color: THREE.Color;
}

const _vA = new THREE.Vector3();
const _vB = new THREE.Vector3();
const _pos = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _scale = new THREE.Vector3(1, 1, 1);
const _mat4 = new THREE.Matrix4();
const _rayUp = new THREE.Vector3(0, 1, 0);
const _rayDir = new THREE.Vector3();
const _rayNorm = new THREE.Vector3();

function detectSoftwareWebGL(): boolean {
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

function detectMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isTouchMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isCoarseSmall =
    Boolean(window.matchMedia?.('(pointer: coarse)').matches) &&
    Math.min(window.innerWidth, window.innerHeight) <= 920;
  return isTouchMobile || isCoarseSmall;
}

export class OpticsSceneManager {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private isSoftwareGl: boolean;
  private isMobile: boolean;
  private isLowPower: boolean;
  private maxAnisotropy: number;
  private maxPhotons: number;

  // Shared GPU resources for zero-allocation ray rebuilds during slider drags
  private rayUnitCylinderGeo: THREE.CylinderGeometry;
  private raySolidMatCache = new Map<number, THREE.MeshBasicMaterial>();
  private rayDashedMatCache = new Map<string, THREE.LineDashedMaterial>();

  private activeModule: LabModule = 'mirror';
  private mirrorState: MirrorLabState;
  private eyeState: EyeLabState;
  private autoRotateEnabled = false;

  private mirrorLabGroup = new THREE.Group();
  private eyeLabGroup = new THREE.Group();

  // Mirror Lab dynamic references
  private mirrorHolder!: ReturnType<typeof createMirrorAssembly>;
  private lastMirrorType: MirrorType;
  private lastMirrorFocalCm: number;
  private objectCarriage = new THREE.Group();
  private objectModelHolder = new THREE.Group();
  private imageModelHolder = new THREE.Group();
  private objectLabelSprite!: THREE.Sprite;
  private imageLabelSprite!: THREE.Sprite;
  private lastImageLabelText = '';
  private objectFlameMesh?: THREE.Mesh;
  private imageFlameMesh?: THREE.Mesh;
  private objectFlameLight: THREE.PointLight;
  private lastObjectType: MirrorObjectType;
  private lastImageVirtual = false;

  private lightSource!: ReturnType<typeof createLightSourceAssembly>;
  private projectionScreen!: THREE.Group;
  private mirrorRaysGroup = new THREE.Group();
  private mirrorMarkersGroup = new THREE.Group();
  private markerF!: THREE.Group;
  private markerM!: THREE.Group;
  private markerO!: THREE.Group;

  // Eye Lab dynamic references
  private eyeAssembly!: EyeAssemblyRefs;
  private eyeRaysGroup = new THREE.Group();
  private eyeLabelsGroup = new THREE.Group();
  private eyeFocusMarker!: THREE.Mesh;
  private eyeFocusLabel!: THREE.Sprite;
  private eyeLensLabel!: THREE.Sprite;
  private eyeRetinaLabel!: THREE.Sprite;
  private eyeNerveLabel!: THREE.Sprite;
  private lastCorrectiveDiopter = -2.5;
  private currentRetinaX = 2.1;
  private targetRetinaX = 2.1;
  private lastRetinaBlurKey = '';
  private currentLensY = 2.65;
  private targetLensY = 2.65;
  private currentTargetX = -6.8;
  private targetStimulusX = -6.8;

  private photonMesh: THREE.InstancedMesh;
  private photonSegments: PhotonSegment[] = [];

  private camTransitionActive = false;
  private camTargetPos = new THREE.Vector3(-2.5, 5.2, 13.5);
  private camTargetLook = new THREE.Vector3(-2.0, 2.35, 0);

  private clock = new THREE.Clock();
  private elapsed = 0;
  private frameId = 0;
  private disposed = false;
  private isPageHidden = false;
  private resizeObserver: ResizeObserver;
  private handleContextLost: (e: Event) => void;
  private handleContextRestored: () => void;
  private handleVisibilityChange: () => void;

  constructor(
    container: HTMLElement,
    initialModule: LabModule,
    initialMirror: MirrorLabState,
    initialEye: EyeLabState
  ) {
    this.container = container;
    this.activeModule = initialModule;
    this.mirrorState = { ...initialMirror };
    this.eyeState = { ...initialEye };
    this.lastMirrorType = initialMirror.mirrorType;
    this.lastMirrorFocalCm = initialMirror.focalLengthCm;
    this.lastObjectType = initialMirror.objectType;

    this.isSoftwareGl = detectSoftwareWebGL();
    this.isMobile = detectMobileDevice();
    this.isLowPower = this.isSoftwareGl || this.isMobile;
    this.maxPhotons = this.isLowPower ? 36 : 72;

    this.rayUnitCylinderGeo = new THREE.CylinderGeometry(1, 1, 1, 6, 1, true);

    // 1. Renderer setup (mobile-optimized: capped DPR, no MSAA/shadows on phone GPUs)
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isLowPower,
      powerPreference: this.isMobile ? 'default' : 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.02;
    this.renderer.setPixelRatio(
      this.isSoftwareGl
        ? 1
        : this.isMobile
        ? Math.min(window.devicePixelRatio || 1, 1.25)
        : Math.min(window.devicePixelRatio || 1, 2)
    );
    this.renderer.shadowMap.enabled = !this.isLowPower;
    if (!this.isLowPower) {
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    this.maxAnisotropy = Math.min(
      this.isLowPower ? 2 : 8,
      this.renderer.capabilities.getMaxAnisotropy()
    );

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    this.renderer.setSize(width, height);
    container.appendChild(this.renderer.domElement);

    this.handleContextLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(this.frameId);
      clearTimeout(this.frameId);
    };
    this.handleContextRestored = () => {
      if (!this.disposed && !this.isPageHidden) this.startLoop();
    };
    this.handleVisibilityChange = () => {
      this.isPageHidden = document.hidden;
      if (this.isPageHidden) {
        cancelAnimationFrame(this.frameId);
        clearTimeout(this.frameId);
      } else if (!this.disposed) {
        this.clock.getDelta();
        this.startLoop();
      }
    };
    this.renderer.domElement.addEventListener(
      'webglcontextlost',
      this.handleContextLost
    );
    this.renderer.domElement.addEventListener(
      'webglcontextrestored',
      this.handleContextRestored
    );
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    // 2. Indoor Science Classroom Backdrop, Matching Subtle Fog & Studio RoomEnvironment
    this.scene = new THREE.Scene();
    const bgHex = 0x1b2738;
    this.scene.background = new THREE.Color(bgHex);
    this.scene.fog = new THREE.FogExp2(bgHex, 0.014);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(
      new RoomEnvironment(),
      0.04
    ).texture;
    this.scene.environmentIntensity = 0.72;
    pmrem.dispose();

    // 3. Camera & OrbitControls (framed nicely inside the science classroom looking over the lab desk)
    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    this.camera.position.set(-2.5, 5.2, 13.8);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = !this.isSoftwareGl;
    this.controls.dampingFactor = 0.08;
    this.controls.maxPolarAngle = Math.PI * 0.49;
    this.controls.minDistance = 4.2;
    this.controls.maxDistance = 19.5;
    this.controls.target.set(-2.2, 2.35, 0);
    this.controls.addEventListener('start', () => {
      this.camTransitionActive = false;
    });

    // 4. Calibrated Indoor Science Room Lighting (lightweight on mobile, 3-point on desktop)
    const hemiLight = new THREE.HemisphereLight(
      0xa5c8eb,
      0x3b2c1e,
      this.isLowPower ? 0.74 : 0.62
    );
    this.scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(
      0xffe8cc,
      this.isLowPower ? 1.88 : 1.55
    );
    keyLight.position.set(5.5, 11.5, 7.5);
    keyLight.castShadow = !this.isLowPower;
    if (!this.isLowPower) {
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 32;
      const d = 12;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    this.scene.add(keyLight);

    // Subtle cool indoor window fill from left
    const windowFill = new THREE.DirectionalLight(0x93c5fd, 0.58);
    windowFill.position.set(-12, 6.5, -4);
    this.scene.add(windowFill);

    // Warm overhead desk pendant point light (desktop only; folded into keyLight on mobile)
    if (!this.isLowPower) {
      const pendantLight = new THREE.PointLight(0xfff0d4, 1.25, 22, 1.6);
      pendantLight.position.set(-1.6, 9.6, 0.5);
      this.scene.add(pendantLight);
    }

    // 5. Complete 3D Indoor Elementary Science Classroom & Oak Lab Table (top surface at y = 0)
    const classroomEnv = createScienceClassroomEnvironment(
      this.maxAnisotropy,
      this.isLowPower
    );
    this.scene.add(classroomEnv);

    this.objectFlameLight = new THREE.PointLight(0xffb444, 1.2, 7, 2);

    this.initMirrorLab();
    this.initEyeLab();

    this.scene.add(this.mirrorLabGroup);
    this.scene.add(this.eyeLabGroup);

    // 6. Bright traveling light-pulse balls along rays (compact geometry)
    const photonGeo = new THREE.SphereGeometry(0.068, 6, 6);
    const photonMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.photonMesh = new THREE.InstancedMesh(
      photonGeo,
      photonMat,
      this.maxPhotons
    );
    this.photonMesh.frustumCulled = false;
    this.photonMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.scene.add(this.photonMesh);

    this.applyModuleVisibility();
    this.updateMirrorScene();
    this.updateEyeScene();
    this.setCameraPreset('perspective', true);

    if (!this.isLowPower) {
      this.renderer.compile(this.scene, this.camera);
    }

    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(container);

    this.startLoop();
  }

  private getSolidRayMaterial(hex: number): THREE.MeshBasicMaterial {
    let mat = this.raySolidMatCache.get(hex);
    if (!mat) {
      mat = new THREE.MeshBasicMaterial({
        color: hex,
        transparent: true,
        opacity: 0.9,
      });
      this.raySolidMatCache.set(hex, mat);
    }
    return mat;
  }

  private getDashedRayMaterial(
    hex: number,
    dashSize: number,
    gapSize: number
  ): THREE.LineDashedMaterial {
    const key = `${hex}_${dashSize}_${gapSize}`;
    let mat = this.rayDashedMatCache.get(key);
    if (!mat) {
      mat = new THREE.LineDashedMaterial({
        color: hex,
        dashSize,
        gapSize,
      });
      this.rayDashedMatCache.set(key, mat);
    }
    return mat;
  }

  private clearRayGroup(group: THREE.Group): void {
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if (child instanceof THREE.Line) {
        child.geometry.dispose();
      }
      // Solid ray meshes share rayUnitCylinderGeo and raySolidMatCache — zero GPU churn!
    }
  }

  private initMirrorLab(): void {
    const bench = createOpticalBench(this.maxAnisotropy, this.isLowPower);
    this.mirrorLabGroup.add(bench);

    // Principal optical axis guide line
    const axisPoints = [
      new THREE.Vector3(-12.5, OPTICAL_AXIS_Y, 0),
      new THREE.Vector3(8.5, OPTICAL_AXIS_Y, 0),
    ];
    const axisGeo = new THREE.BufferGeometry().setFromPoints(axisPoints);
    const axisLine = new THREE.Line(
      axisGeo,
      new THREE.LineDashedMaterial({
        color: 0x475569,
        dashSize: 0.25,
        gapSize: 0.18,
        transparent: true,
        opacity: 0.72,
      })
    );
    axisLine.computeLineDistances();
    this.mirrorLabGroup.add(axisLine);

    this.mirrorHolder = createMirrorAssembly(
      this.mirrorState.mirrorType,
      cmToUnits(this.mirrorState.focalLengthCm),
      this.isLowPower
    );
    this.mirrorLabGroup.add(this.mirrorHolder.root);

    // Object sliding carriage + post + object model holder
    const objCarriageBase = createRailCarriage(0.68);
    objCarriageBase.position.y = RAIL_TOP_Y;
    this.objectCarriage.add(objCarriageBase);

    const objPost = new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.055,
        0.055,
        OPTICAL_AXIS_Y - RAIL_TOP_Y - 0.35,
        16
      ),
      new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        roughness: 0.2,
        metalness: 0.85,
      })
    );
    objPost.position.y =
      RAIL_TOP_Y + 0.35 + (OPTICAL_AXIS_Y - RAIL_TOP_Y - 0.35) / 2;
    objPost.castShadow = true;
    this.objectCarriage.add(objPost);

    this.objectModelHolder.position.y = OPTICAL_AXIS_Y;
    this.objectCarriage.add(this.objectModelHolder);
    this.objectCarriage.add(this.objectFlameLight);

    // Kid-friendly floating label right above the real object
    this.objectLabelSprite = createLabelSprite('Benda Asli', '#2563eb', 0.82);
    this.objectCarriage.add(this.objectLabelSprite);

    this.mirrorLabGroup.add(this.objectCarriage);

    // Formed Image Holder + dynamic kid-friendly floating label
    this.imageModelHolder.position.y = OPTICAL_AXIS_Y;
    this.mirrorLabGroup.add(this.imageModelHolder);

    this.imageLabelSprite = createLabelSprite('Bayangan', '#ea580c', 0.86);
    this.mirrorLabGroup.add(this.imageLabelSprite);

    this.rebuildObjectModels(this.mirrorState.objectType, false);

    // Friendly School Flashlight Light Source
    this.lightSource = createLightSourceAssembly();
    this.mirrorLabGroup.add(this.lightSource.root);

    // Classroom Projection Screen
    this.projectionScreen = createProjectionScreenAssembly();
    this.mirrorLabGroup.add(this.projectionScreen);

    // Axis Markers with clear SD Kelas 5 labels
    this.markerO = this.createAxisMarker('Cermin (O)', '#475569', 0.78);
    this.markerF = this.createAxisMarker('Titik Fokus (F)', '#ea580c', 0.92);
    this.markerM = this.createAxisMarker('Pusat (M)', '#059669', 0.82);
    this.mirrorMarkersGroup.add(this.markerO, this.markerF, this.markerM);
    this.mirrorLabGroup.add(this.mirrorMarkersGroup);

    this.mirrorLabGroup.add(this.mirrorRaysGroup);
  }

  private createAxisMarker(
    label: string,
    colorHex: string,
    scale = 0.9
  ): THREE.Group {
    const g = new THREE.Group();
    const color = new THREE.Color(colorHex);
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.13, 16, 16),
      new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.35,
        roughness: 0.25,
      })
    );
    dot.position.y = OPTICAL_AXIS_Y;
    g.add(dot);

    const dropGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, OPTICAL_AXIS_Y - 0.12, 0),
      new THREE.Vector3(0, RAIL_TOP_Y + 0.02, 0),
    ]);
    const dropLine = new THREE.Line(
      dropGeo,
      new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.65,
      })
    );
    g.add(dropLine);

    const sprite = createLabelSprite(label, colorHex, scale);
    sprite.position.set(0, OPTICAL_AXIS_Y - 0.56, 0.38);
    g.add(sprite);
    return g;
  }

  private rebuildObjectModels(
    objectType: MirrorObjectType,
    isVirtual: boolean
  ): void {
    this.disposeGroupChildren(this.objectModelHolder);
    this.disposeGroupChildren(this.imageModelHolder);

    const objBuilt = createOpticalSubjectModel(objectType, false, false);
    this.objectModelHolder.add(objBuilt.group);
    this.objectFlameMesh = objBuilt.flameMesh;

    const imgBuilt = createOpticalSubjectModel(objectType, true, isVirtual);
    this.imageModelHolder.add(imgBuilt.group);
    this.imageFlameMesh = imgBuilt.flameMesh;

    this.lastObjectType = objectType;
    this.lastImageVirtual = isVirtual;
  }

  private initEyeLab(): void {
    this.eyeAssembly = createEyeLabAssembly({
      isSoftwareGl: this.isSoftwareGl,
      isLowPower: this.isLowPower,
      maxAnisotropy: this.maxAnisotropy,
    });
    this.eyeLabGroup.add(this.eyeAssembly.root);

    const eyeAxisY = 2.65;
    const axisGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-8.0, eyeAxisY, 0),
      new THREE.Vector3(4.5, eyeAxisY, 0),
    ]);
    const axisLine = new THREE.Line(
      axisGeo,
      new THREE.LineDashedMaterial({
        color: 0x64748b,
        dashSize: 0.22,
        gapSize: 0.16,
        transparent: true,
        opacity: 0.6,
      })
    );
    axisLine.computeLineDistances();
    this.eyeLabGroup.add(axisLine);

    // High-contrast focal point intersection sphere
    this.eyeFocusMarker = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 18, 18),
      new THREE.MeshBasicMaterial({ color: 0xea580c })
    );
    this.eyeFocusMarker.position.set(2.1, eyeAxisY, 0);
    this.eyeLabGroup.add(this.eyeFocusMarker);

    // Friendly SD Kelas 5 Anatomical 3D Labels (positioned cleanly around the open optical parts)
    const corneaLbl = createLabelSprite('Kornea (Pintu Cahaya)', '#0284c7', 0.84);
    corneaLbl.position.set(-2.12, eyeAxisY + 1.48, 0.15);

    const lensEyeLbl = createLabelSprite('Lensa Mata', '#0369a1', 0.78);
    lensEyeLbl.position.set(-1.35, eyeAxisY - 1.38, 0.15);

    this.eyeRetinaLabel = createLabelSprite('Layar Retina', '#ea580c', 0.92);
    this.eyeRetinaLabel.position.set(2.1, eyeAxisY + 1.88, 0.15);

    this.eyeNerveLabel = createLabelSprite('Saraf ke Otak', '#d97706', 0.76);
    this.eyeNerveLabel.position.set(3.4, eyeAxisY - 1.72, -0.25);

    this.eyeFocusLabel = createLabelSprite('Titik Temu Cahaya', '#ea580c', 0.85);
    this.eyeFocusLabel.position.set(1.8, eyeAxisY - 0.84, 0.35);

    this.eyeLensLabel = createLabelSprite('Kacamata Koreksi', '#059669', 0.88);
    this.eyeLensLabel.position.set(CORRECTIVE_LENS_X, eyeAxisY + 1.78, 0.15);

    this.eyeLabelsGroup.add(
      corneaLbl,
      lensEyeLbl,
      this.eyeRetinaLabel,
      this.eyeNerveLabel,
      this.eyeFocusLabel,
      this.eyeLensLabel
    );
    this.eyeLabGroup.add(this.eyeLabelsGroup);
    this.eyeLabGroup.add(this.eyeRaysGroup);
  }

  public setModule(module: LabModule): void {
    if (this.activeModule === module) return;
    this.activeModule = module;
    this.applyModuleVisibility();
    if (module === 'mirror') {
      this.updateMirrorScene();
    } else {
      this.updateEyeScene();
    }
    this.setCameraPreset('perspective', false);
  }

  private applyModuleVisibility(): void {
    this.mirrorLabGroup.visible = this.activeModule === 'mirror';
    this.eyeLabGroup.visible = this.activeModule === 'eye';
  }

  public setAutoRotate(enabled: boolean): void {
    this.autoRotateEnabled = enabled;
    this.controls.autoRotate = !this.isSoftwareGl && enabled;
    this.controls.autoRotateSpeed = 1.6;
  }

  public setCameraPreset(preset: CameraPresetId, immediate = false): void {
    if (this.activeModule === 'mirror') {
      switch (preset) {
        case 'side':
          this.camTargetPos.set(-2.6, OPTICAL_AXIS_Y + 0.15, 13.5);
          this.camTargetLook.set(-2.6, OPTICAL_AXIS_Y, 0);
          break;
        case 'top':
          this.camTargetPos.set(-2.5, 14.5, 1.8);
          this.camTargetLook.set(-2.5, OPTICAL_AXIS_Y - 0.5, 0);
          break;
        case 'front':
          this.camTargetPos.set(-12.2, 3.6, 4.2);
          this.camTargetLook.set(0.0, OPTICAL_AXIS_Y, 0);
          break;
        case 'perspective':
        default:
          this.camTargetPos.set(-3.2, 5.4, 13.2);
          this.camTargetLook.set(-2.2, 2.35, 0);
          break;
      }
    } else {
      const retinaX = computeEyeOptics(this.eyeState).retinaX;
      switch (preset) {
        case 'side':
          this.camTargetPos.set(-0.9, 2.75, 10.6);
          this.camTargetLook.set(-0.9, 2.65, 0);
          break;
        case 'retina':
          // Direct 3/4 view straight onto the unobstructed 3D Retina Projection Screen face!
          this.camTargetPos.set(retinaX - 3.1, 3.05, 3.9);
          this.camTargetLook.set(retinaX, 2.65, 0);
          break;
        case 'top':
          this.camTargetPos.set(-0.8, 11.4, 2.4);
          this.camTargetLook.set(-0.8, 2.65, 0);
          break;
        case 'front':
          this.camTargetPos.set(-8.6, 3.45, 4.6);
          this.camTargetLook.set(-0.8, 2.65, 0);
          break;
        case 'perspective':
        default:
          // Balanced 3/4 perspective angled toward the front face of the 3D Retina Screen
          this.camTargetPos.set(-3.1, 4.15, 9.6);
          this.camTargetLook.set(-0.35, 2.65, 0);
          break;
      }
    }

    if (immediate) {
      this.camera.position.copy(this.camTargetPos);
      this.controls.target.copy(this.camTargetLook);
      this.controls.update();
      this.camTransitionActive = false;
    } else {
      this.camTransitionActive = true;
    }
  }

  public updateMirrorState(next: MirrorLabState): void {
    this.mirrorState = { ...next };
    if (this.activeModule === 'mirror') {
      this.updateMirrorScene();
    }
  }

  public updateEyeState(next: EyeLabState): void {
    this.eyeState = { ...next };
    if (this.activeModule === 'eye') {
      this.updateEyeScene();
    }
  }

  private updateMirrorScene(): void {
    const st = this.mirrorState;
    const optics = computeMirrorOptics(st);

    if (
      st.mirrorType !== this.lastMirrorType ||
      Math.abs(st.focalLengthCm - this.lastMirrorFocalCm) > 0.05
    ) {
      const fUnits = cmToUnits(st.focalLengthCm);
      const { frontGeo, backGeo, rimOffsetX } = buildSphericalMirrorGeometries(
        st.mirrorType,
        fUnits,
        1.65,
        this.isLowPower
      );
      this.mirrorHolder.frontMesh.geometry.dispose();
      this.mirrorHolder.backMesh.geometry.dispose();
      this.mirrorHolder.frontMesh.geometry = frontGeo;
      this.mirrorHolder.backMesh.geometry = backGeo;
      this.mirrorHolder.bezelRing.position.x = rimOffsetX + 0.04;
      this.lastMirrorType = st.mirrorType;
      this.lastMirrorFocalCm = st.focalLengthCm;
    }

    const isVirtual = !optics.isReal && !optics.isAtInfinity;
    if (
      st.objectType !== this.lastObjectType ||
      isVirtual !== this.lastImageVirtual
    ) {
      this.rebuildObjectModels(st.objectType, isVirtual);
    }

    const sUnits = cmToUnits(st.objectDistanceCm);
    const objX = -sUnits;
    const objHUnits = cmToUnits(st.objectHeightCm);
    this.objectCarriage.position.x = objX;
    this.objectModelHolder.scale.setScalar(objHUnits / 1.6);
    this.objectLabelSprite.position.set(0, OPTICAL_AXIS_Y + objHUnits + 0.55, 0);
    this.objectLabelSprite.visible = st.showLabels;

    this.objectFlameLight.visible = !this.isLowPower && st.objectType === 'candle';
    this.objectFlameLight.position.set(0, OPTICAL_AXIS_Y + objHUnits * 0.85, 0.35);

    const signedFUnits = cmToUnits(optics.signedFocalCm);
    const fx = -signedFUnits;
    const mx = -2 * signedFUnits;
    this.markerO.position.x = 0;
    this.markerF.position.x = THREE.MathUtils.clamp(fx, -11.5, 7.5);
    this.markerM.position.x = THREE.MathUtils.clamp(mx, -11.5, 7.5);
    this.mirrorMarkersGroup.visible = st.showLabels;

    const mirrorTiltRad = THREE.MathUtils.degToRad(st.mirrorRotationDeg);
    if (
      optics.isAtInfinity ||
      optics.imageDistanceCm === null ||
      optics.magnification === null
    ) {
      this.imageModelHolder.visible = false;
      this.imageLabelSprite.visible = false;
      this.projectionScreen.visible = false;
    } else {
      const sPrimeUnits = cmToUnits(optics.imageDistanceCm);
      const imgXRaw = -sPrimeUnits;
      const inRange = imgXRaw > -14 && imgXRaw < 10.5;
      this.imageModelHolder.visible = inRange;

      if (inRange) {
        const clampedMag = THREE.MathUtils.clamp(optics.magnification, -3.0, 3.0);
        const absMag = Math.max(0.18, Math.abs(clampedMag));
        const signY = clampedMag >= 0 ? 1 : -1;
        const baseScale = objHUnits / 1.6;

        const imgZ = Math.sin(mirrorTiltRad * 2) * Math.abs(sPrimeUnits) * 0.55;
        this.imageModelHolder.position.set(imgXRaw, OPTICAL_AXIS_Y, imgZ);
        this.imageModelHolder.scale.set(
          baseScale * absMag,
          baseScale * absMag * signY,
          baseScale * absMag
        );

        // Dynamic kid-friendly floating label right by the formed image!
        const imgLabelText = optics.isReal
          ? 'Bayangan (Nyata · Terbalik)'
          : 'Bayangan (Maya · Tegak)';
        if (imgLabelText !== this.lastImageLabelText) {
          updateLabelSpriteText(
            this.imageLabelSprite,
            imgLabelText,
            optics.isReal ? '#ea580c' : '#7c3aed'
          );
          this.lastImageLabelText = imgLabelText;
        }
        const labelOffsetY =
          signY > 0
            ? OPTICAL_AXIS_Y + objHUnits * absMag + 0.52
            : OPTICAL_AXIS_Y - objHUnits * absMag - 0.52;
        this.imageLabelSprite.position.set(
          imgXRaw,
          THREE.MathUtils.clamp(labelOffsetY, 1.05, 6.2),
          imgZ
        );
        this.imageLabelSprite.visible = st.showLabels;
      } else {
        this.imageLabelSprite.visible = false;
      }

      this.projectionScreen.visible =
        st.showScreen && optics.isReal && imgXRaw > -10.8 && imgXRaw < -0.4;
      if (this.projectionScreen.visible) {
        this.projectionScreen.position.set(imgXRaw - 0.04, 0, 0);
      }
    }

    const lightX = -cmToUnits(st.lightSourceXCm);
    const lightY = OPTICAL_AXIS_Y + cmToUnits(st.lightSourceYCm);
    const clampedLightY = Math.max(RAIL_TOP_Y + 0.72, lightY);
    this.lightSource.root.position.set(lightX, 0, 0.95);
    const postH = clampedLightY - (RAIL_TOP_Y + 0.35);
    this.lightSource.postMesh.scale.y = Math.max(0.25, postH);
    this.lightSource.postMesh.position.y = RAIL_TOP_Y + 0.35 + postH / 2;
    this.lightSource.lampHead.position.set(0, clampedLightY, 0);
    const aimYaw = Math.atan2(0.95, Math.max(1.2, -lightX));
    const aimPitch = Math.atan2(
      OPTICAL_AXIS_Y - clampedLightY,
      Math.max(1.2, -lightX)
    );
    this.lightSource.lampHead.rotation.set(0, aimYaw, aimPitch);
    this.lightSource.root.visible = st.showLightSourceRays;

    this.rebuildMirrorRays(
      objX,
      objHUnits,
      fx,
      optics,
      mirrorTiltRad,
      lightX,
      clampedLightY
    );
  }

  private rebuildMirrorRays(
    objX: number,
    objH: number,
    fx: number,
    optics: ReturnType<typeof computeMirrorOptics>,
    mirrorTiltRad: number,
    lightX: number,
    lightY: number
  ): void {
    this.clearRayGroup(this.mirrorRaysGroup);
    this.photonSegments = [];

    const st = this.mirrorState;
    const tipY = OPTICAL_AXIS_Y + objH;
    const R = Math.max(1.65 * 1.38, Math.abs(cmToUnits(st.focalLengthCm)) * 2);
    const mirrorDir = st.mirrorType === 'concave' ? -1 : 1;

    const surfaceXAtY = (yRel: number): number => {
      const r = Math.min(1.62, Math.abs(yRel));
      const sag = R - Math.sqrt(Math.max(0.01, R * R - r * r));
      return mirrorDir * sag;
    };

    // Zero-allocation shared cylinder geometry + cached ray materials!
    const addSolidRay = (
      p1: THREE.Vector3,
      p2: THREE.Vector3,
      hex: number,
      withPhotons = true
    ) => {
      _rayDir.subVectors(p2, p1);
      const len = _rayDir.length();
      if (len > 0.05) {
        const tube = new THREE.Mesh(
          this.rayUnitCylinderGeo,
          this.getSolidRayMaterial(hex)
        );
        tube.position.copy(p1).addScaledVector(_rayDir, 0.5);
        _rayNorm.copy(_rayDir).divideScalar(len);
        tube.quaternion.setFromUnitVectors(_rayUp, _rayNorm);
        tube.scale.set(0.026, len, 0.026);
        this.mirrorRaysGroup.add(tube);
      }

      if (withPhotons) {
        this.photonSegments.push({
          start: p1.clone(),
          end: p2.clone(),
          color: new THREE.Color(hex),
        });
      }
    };

    const addDashedRay = (p1: THREE.Vector3, p2: THREE.Vector3, hex: number) => {
      const geo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
      const line = new THREE.Line(
        geo,
        this.getDashedRayMaterial(hex, 0.24, 0.16)
      );
      line.computeLineDistances();
      this.mirrorRaysGroup.add(line);
    };

    const applyMirrorTilt = (
      origin: THREE.Vector3,
      target: THREE.Vector3
    ): THREE.Vector3 => {
      if (Math.abs(mirrorTiltRad) < 0.001) return target;
      const offset = target.clone().sub(origin);
      offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), mirrorTiltRad * 2);
      return origin.clone().add(offset);
    };

    if (st.showPrincipalRays) {
      const tip = new THREE.Vector3(objX, tipY, 0);
      const focusPt = new THREE.Vector3(fx, OPTICAL_AXIS_Y, 0);

      const imgX =
        optics.imageDistanceCm !== null ? -cmToUnits(optics.imageDistanceCm) : null;
      const imgTipY =
        optics.imageHeightCm !== null
          ? OPTICAL_AXIS_Y + cmToUnits(optics.imageHeightCm)
          : null;
      const imgZ =
        optics.imageDistanceCm !== null
          ? Math.sin(mirrorTiltRad * 2) *
            Math.abs(cmToUnits(optics.imageDistanceCm)) *
            0.55
          : 0;
      const imgTip =
        imgX !== null && imgTipY !== null
          ? new THREE.Vector3(imgX, imgTipY, imgZ)
          : null;

      // Sinar 1 (Luminous Warm Amber #fbbf24): Parallel -> Focus F
      const hit1 = new THREE.Vector3(surfaceXAtY(objH), tipY, 0);
      addSolidRay(tip, hit1, 0xfbbf24);

      const refl1Dir =
        st.mirrorType === 'concave'
          ? focusPt.clone().sub(hit1).normalize()
          : hit1.clone().sub(focusPt).normalize();
      const refl1End = applyMirrorTilt(
        hit1,
        hit1.clone().addScaledVector(refl1Dir, 12.5)
      );
      addSolidRay(hit1, refl1End, 0xfbbf24);

      if (
        st.showVirtualExtensions &&
        (st.mirrorType === 'convex' || !optics.isReal)
      ) {
        const vEnd = imgTip && !optics.isReal ? imgTip : focusPt.clone();
        addDashedRay(hit1, vEnd, 0xfbbf24);
        if (st.mirrorType === 'convex') {
          addDashedRay(hit1, focusPt, 0xfbbf24);
        }
      }

      // Sinar 2 (Bright Sky Cyan #38bdf8): Through Focus F -> Parallel
      let hit2Y = OPTICAL_AXIS_Y;
      const dxF = fx - objX;
      if (Math.abs(dxF) > 0.15) {
        const slope = (OPTICAL_AXIS_Y - tipY) / dxF;
        hit2Y = tipY + slope * (0 - objX);
      }
      if (Math.abs(hit2Y - OPTICAL_AXIS_Y) <= 2.35 && !optics.isAtInfinity) {
        const clampedYRel = THREE.MathUtils.clamp(
          hit2Y - OPTICAL_AXIS_Y,
          -1.62,
          1.62
        );
        const hit2 = new THREE.Vector3(
          surfaceXAtY(clampedYRel),
          OPTICAL_AXIS_Y + clampedYRel,
          0
        );
        addSolidRay(tip, hit2, 0x38bdf8);

        const refl2End = applyMirrorTilt(
          hit2,
          new THREE.Vector3(hit2.x - 11.5, hit2.y, 0)
        );
        addSolidRay(hit2, refl2End, 0x38bdf8);

        if (st.showVirtualExtensions && !optics.isReal && imgTip) {
          addDashedRay(hit2, imgTip, 0x38bdf8);
        }
      }

      // Sinar 3 (Luminous Mint Emerald #34d399): Aimed at Mirror Center O
      const hit3 = new THREE.Vector3(0, OPTICAL_AXIS_Y, 0);
      addSolidRay(tip, hit3, 0x34d399);
      const refl3Dir = new THREE.Vector3(objX, OPTICAL_AXIS_Y - objH, 0)
        .sub(hit3)
        .normalize();
      const refl3End = applyMirrorTilt(
        hit3,
        hit3.clone().addScaledVector(refl3Dir, 12.0)
      );
      addSolidRay(hit3, refl3End, 0x34d399);

      if (st.showVirtualExtensions && !optics.isReal && imgTip) {
        addDashedRay(hit3, imgTip, 0x34d399);
      }
    }

    // Flashlight Controllable Beams (Bright Sun Yellow & Warm Orange reflection)
    if (st.showLightSourceRays) {
      const lampOrigin = new THREE.Vector3(lightX + 0.38, lightY, 0.95);
      const spreadRad = THREE.MathUtils.degToRad(st.lightBeamAngleDeg);
      const angles = [-spreadRad, 0, spreadRad];

      const sphereCenter = new THREE.Vector3(
        st.mirrorType === 'concave' ? -R : R,
        OPTICAL_AXIS_Y,
        0
      );

      for (const deltaAngle of angles) {
        const targetY =
          OPTICAL_AXIS_Y + Math.tan(deltaAngle) * Math.max(2.0, -lightX) * 0.65;
        const clampedY = THREE.MathUtils.clamp(
          targetY,
          OPTICAL_AXIS_Y - 1.45,
          OPTICAL_AXIS_Y + 1.45
        );
        const hitPt = new THREE.Vector3(
          surfaceXAtY(clampedY - OPTICAL_AXIS_Y),
          clampedY,
          0.12
        );

        const incidentDir = hitPt.clone().sub(lampOrigin).normalize();

        let normal =
          st.mirrorType === 'concave'
            ? sphereCenter.clone().sub(hitPt).normalize()
            : hitPt.clone().sub(sphereCenter).normalize();

        if (Math.abs(mirrorTiltRad) > 0.001) {
          normal.applyAxisAngle(new THREE.Vector3(0, 1, 0), mirrorTiltRad);
        }
        if (normal.dot(incidentDir) > 0) normal.negate();

        const reflectedDir = incidentDir
          .clone()
          .sub(normal.clone().multiplyScalar(2 * incidentDir.dot(normal)))
          .normalize();

        const reflectEnd = hitPt.clone().addScaledVector(reflectedDir, 10.0);

        addSolidRay(lampOrigin, hitPt, 0xfef08a, true);
        addSolidRay(hitPt, reflectEnd, 0xfb923c, true);
      }
    }
  }

  private updateEyeScene(): void {
    const st = this.eyeState;
    const optics = computeEyeOptics(st);

    this.targetRetinaX = optics.retinaX;
    this.eyeAssembly.eyeOutlineGroup.visible = st.cutawayMode;

    const accommodationBulge = 1.0 + (1 - st.objectDistanceFactor) * 0.24;
    this.eyeAssembly.crystallineLens.scale.set(accommodationBulge, 1, 1);

    this.targetLensY = st.lensEnabled ? 2.65 : 6.4;
    if (Math.abs(st.lensPowerDiopter - this.lastCorrectiveDiopter) > 0.05) {
      const nextGeo = buildCorrectiveLensGeometry(
        st.lensPowerDiopter,
        this.isLowPower
      );
      this.eyeAssembly.correctiveLensGlass.geometry.dispose();
      this.eyeAssembly.correctiveLensGlass.geometry = nextGeo;
      this.lastCorrectiveDiopter = st.lensPowerDiopter;

      const mat = this.eyeAssembly.correctiveLensGlass
        .material as THREE.MeshStandardMaterial;
      if (st.lensPowerDiopter < -0.05) {
        mat.color.setHex(0x38bdf8);
      } else if (st.lensPowerDiopter > 0.05) {
        mat.color.setHex(0x34d399);
      } else {
        mat.color.setHex(0xe2e8f0);
      }
    }

    this.targetStimulusX = THREE.MathUtils.lerp(
      -5.0,
      -7.6,
      st.objectDistanceFactor
    );

    // Update live 3D Retina Projection Screen image & frame status color
    this.eyeAssembly.retinaFrameMat.color.setHex(
      optics.isSharp ? 0x10b981 : 0xf43f5e
    );

    const statusShort = optics.isSharp
      ? 'TAJAM ✓'
      : optics.focalPointX < optics.retinaX
      ? 'BURAM (Di Depan)'
      : 'BURAM (Di Belakang)';
    const blurKey = `${optics.isSharp ? 1 : 0}_${Math.round(
      optics.blurRadius * 40
    )}_${statusShort}`;
    if (blurKey !== this.lastRetinaBlurKey) {
      renderRetinaProjectionCanvas(
        this.eyeAssembly.retinaProjectionCanvas,
        optics.blurRadius,
        optics.isSharp,
        statusShort
      );
      this.eyeAssembly.retinaProjectionTex.needsUpdate = true;
      this.lastRetinaBlurKey = blurKey;
    }

    const blurScale = 0.48 + optics.blurRadius * 3.6;
    this.eyeAssembly.blurDisc.scale.setScalar(blurScale);
    const blurMat = this.eyeAssembly.blurDisc.material as THREE.MeshBasicMaterial;
    if (optics.isSharp) {
      blurMat.color.setHex(0x34d399);
      blurMat.opacity = 0.85;
    } else {
      blurMat.color.setHex(0xfb7185);
      blurMat.opacity = 0.42;
    }

    const eyeAxisY = 2.65;
    this.eyeLabelsGroup.visible = st.showLabels;
    this.eyeLensLabel.visible = st.showLabels && st.lensEnabled;
    this.eyeRetinaLabel.position.x = optics.retinaX;
    this.eyeNerveLabel.position.x = optics.retinaX + 1.3;
    this.eyeFocusMarker.position.set(optics.focalPointX, eyeAxisY, 0);
    this.eyeFocusMarker.visible = st.showRays;
    (this.eyeFocusMarker.material as THREE.MeshBasicMaterial).color.setHex(
      optics.isSharp ? 0x34d399 : 0xfb7185
    );
    this.eyeFocusLabel.position.set(optics.focalPointX, eyeAxisY - 0.84, 0.35);
    this.eyeFocusLabel.visible = st.showLabels && st.showRays;

    this.rebuildEyeRays(st, optics);
  }

  private rebuildEyeRays(
    st: EyeLabState,
    optics: ReturnType<typeof computeEyeOptics>
  ): void {
    this.clearRayGroup(this.eyeRaysGroup);
    this.photonSegments = [];

    if (!st.showRays) return;

    const eyeAxisY = 2.65;
    const startX = THREE.MathUtils.lerp(-5.0, -7.6, st.objectDistanceFactor);
    const yOffsets = [-0.58, -0.29, 0, 0.29, 0.58];
    const focusX = optics.focalPointX;
    const retinaX = optics.retinaX;

    const rayColor = optics.isSharp ? 0x34d399 : 0x38bdf8;
    const alertColor = 0xfb7185;

    const addBeam = (
      p1: THREE.Vector3,
      p2: THREE.Vector3,
      hex: number,
      withPhoton = true
    ) => {
      _rayDir.subVectors(p2, p1);
      const len = _rayDir.length();
      if (len > 0.04) {
        const tube = new THREE.Mesh(
          this.rayUnitCylinderGeo,
          this.getSolidRayMaterial(hex)
        );
        tube.position.copy(p1).addScaledVector(_rayDir, 0.5);
        _rayNorm.copy(_rayDir).divideScalar(len);
        tube.quaternion.setFromUnitVectors(_rayUp, _rayNorm);
        tube.scale.set(0.022, len, 0.022);
        this.eyeRaysGroup.add(tube);
      }

      if (withPhoton) {
        this.photonSegments.push({
          start: p1.clone(),
          end: p2.clone(),
          color: new THREE.Color(hex),
        });
      }
    };

    const addDashedBeam = (p1: THREE.Vector3, p2: THREE.Vector3, hex: number) => {
      const geo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
      const line = new THREE.Line(
        geo,
        this.getDashedRayMaterial(hex, 0.18, 0.12)
      );
      line.computeLineDistances();
      this.eyeRaysGroup.add(line);
    };

    for (const yOff of yOffsets) {
      const sourceY =
        eyeAxisY +
        THREE.MathUtils.lerp(yOff * 0.18, yOff, st.objectDistanceFactor);

      let lensHitY = eyeAxisY + yOff;
      let corneaY = eyeAxisY + yOff;
      let crystalY = eyeAxisY + yOff * 0.92;

      if (st.lensEnabled && Math.abs(st.lensPowerDiopter) > 0.05) {
        const bendFactor = -st.lensPowerDiopter * 0.055;
        corneaY = eyeAxisY + yOff * (1 + bendFactor);
        crystalY = eyeAxisY + yOff * (0.94 + bendFactor * 1.18);
      }

      const pStart = new THREE.Vector3(startX, sourceY, 0);
      const pLens = new THREE.Vector3(CORRECTIVE_LENS_X, lensHitY, 0);
      const pCornea = new THREE.Vector3(EYE_CORNEA_X, corneaY, 0);
      const pCrystal = new THREE.Vector3(EYE_LENS_X, crystalY, 0);

      if (st.lensEnabled) {
        addBeam(pStart, pLens, 0xfde047, true);
        addBeam(pLens, pCornea, rayColor, true);
        addBeam(pCornea, pCrystal, rayColor, false);
      } else {
        addBeam(pStart, pCornea, 0xfde047, true);
        addBeam(pCornea, pCrystal, rayColor, false);
      }

      const dxFocus = focusX - EYE_LENS_X;
      const slope = (eyeAxisY - crystalY) / Math.max(0.25, dxFocus);
      const yAtRetina = crystalY + slope * (retinaX - EYE_LENS_X);
      const pRetina = new THREE.Vector3(retinaX, yAtRetina, 0);
      const pFocus = new THREE.Vector3(focusX, eyeAxisY, 0);

      if (focusX < retinaX - 0.05) {
        addBeam(pCrystal, pFocus, rayColor, true);
        addBeam(pFocus, pRetina, alertColor, true);
      } else if (focusX > retinaX + 0.08) {
        addBeam(pCrystal, pRetina, rayColor, true);
        addDashedBeam(pRetina, pFocus, alertColor);
      } else {
        addBeam(pCrystal, pRetina, 0x34d399, true);
      }
    }
  }

  private disposeGroupChildren(group: THREE.Group): void {
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      child.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else {
            mesh.material.dispose();
          }
        }
      });
    }
  }

  private startLoop(): void {
    this.clock.start();
    const tick = () => {
      if (this.disposed || this.isPageHidden) return;
      const dt = Math.min(this.clock.getDelta(), 0.05);
      this.elapsed += dt;
      this.stepSimulation(dt);
      this.renderer.render(this.scene, this.camera);

      if (this.isSoftwareGl) {
        this.afterDraw(tick);
      } else {
        this.frameId = requestAnimationFrame(tick);
      }
    };
    this.frameId = requestAnimationFrame(tick);
  }

  private afterDraw(cb: () => void): void {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    if (!gl || typeof gl.fenceSync !== 'function') {
      this.frameId = window.setTimeout(cb, 80);
      return;
    }
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (this.disposed) {
        if (sync) gl.deleteSync(sync);
        return;
      }
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private stepSimulation(dt: number): void {
    if (this.camTransitionActive) {
      const alpha = 1 - Math.exp(-6.5 * dt);
      this.camera.position.lerp(this.camTargetPos, alpha);
      this.controls.target.lerp(this.camTargetLook, alpha);
      if (
        this.camera.position.distanceTo(this.camTargetPos) < 0.03 &&
        this.controls.target.distanceTo(this.camTargetLook) < 0.03
      ) {
        this.camTransitionActive = false;
      }
    }

    if (this.autoRotateEnabled && this.isSoftwareGl) {
      const angle = dt * 0.4;
      _vA.copy(this.camera.position).sub(this.controls.target);
      _vA.applyAxisAngle(_vB.set(0, 1, 0), angle);
      this.camera.position.copy(this.controls.target).add(_vA);
    }

    this.controls.update();

    if (this.activeModule === 'mirror') {
      const targetRotY = THREE.MathUtils.degToRad(
        this.mirrorState.mirrorRotationDeg
      );
      this.mirrorHolder.gimbalHead.rotation.y = THREE.MathUtils.damp(
        this.mirrorHolder.gimbalHead.rotation.y,
        targetRotY,
        9,
        dt
      );

      if (this.objectFlameMesh) {
        const flicker =
          1 +
          Math.sin(this.elapsed * 14) * 0.055 +
          Math.cos(this.elapsed * 23) * 0.03;
        this.objectFlameMesh.scale.set(1, flicker, 1);
        this.objectFlameLight.intensity = 1.2 + Math.sin(this.elapsed * 12) * 0.16;
      }
      if (this.imageFlameMesh) {
        const flicker = 1 + Math.sin(this.elapsed * 14) * 0.055;
        this.imageFlameMesh.scale.set(1, flicker, 1);
      }
    } else {
      this.currentRetinaX = THREE.MathUtils.damp(
        this.currentRetinaX,
        this.targetRetinaX,
        7.5,
        dt
      );
      this.eyeAssembly.retinaScreenGroup.position.x = this.currentRetinaX;

      // Anchor optional non-blocking eye contour smoothly from Cornea (-2.12) to sliding Retina
      const outlineCenterX = (EYE_CORNEA_X + this.currentRetinaX) * 0.5;
      const outlineHalfSpan = Math.max(
        1.4,
        (this.currentRetinaX - EYE_CORNEA_X) * 0.5
      );
      this.eyeAssembly.eyeOutlineGroup.position.x = outlineCenterX;
      this.eyeAssembly.eyeOutlineGroup.scale.set(
        outlineHalfSpan / 2.1,
        1,
        1
      );

      this.currentLensY = THREE.MathUtils.damp(
        this.currentLensY,
        this.targetLensY,
        8.5,
        dt
      );
      this.eyeAssembly.correctiveLensGroup.position.y = this.currentLensY;
      this.eyeAssembly.correctiveLensGroup.visible = this.currentLensY < 6.15;

      this.currentTargetX = THREE.MathUtils.damp(
        this.currentTargetX,
        this.targetStimulusX,
        8,
        dt
      );
      this.eyeAssembly.targetStimulusGroup.position.x = this.currentTargetX;
    }

    const segCount = this.photonSegments.length;
    if (segCount === 0) {
      this.photonMesh.count = 0;
    } else {
      let idx = 0;
      const photonsPerSeg = Math.max(
        1,
        Math.min(this.isLowPower ? 2 : 3, Math.floor(this.maxPhotons / segCount))
      );
      for (let s = 0; s < segCount && idx < this.maxPhotons; s++) {
        const seg = this.photonSegments[s];
        for (let p = 0; p < photonsPerSeg && idx < this.maxPhotons; p++) {
          const t = (this.elapsed * 0.52 + p / photonsPerSeg + s * 0.13) % 1;
          _pos.lerpVectors(seg.start, seg.end, t);
          const pulse = 0.88 + Math.sin(t * Math.PI) * 0.32;
          _scale.setScalar(pulse);
          _mat4.compose(_pos, _quat, _scale);
          this.photonMesh.setMatrixAt(idx, _mat4);
          this.photonMesh.setColorAt(idx, seg.color);
          idx++;
        }
      }
      this.photonMesh.count = idx;
      this.photonMesh.instanceMatrix.needsUpdate = true;
      if (this.photonMesh.instanceColor) {
        this.photonMesh.instanceColor.needsUpdate = true;
      }
    }
  }

  private onResize(): void {
    if (this.disposed) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
    this.resizeObserver.disconnect();
    this.controls.dispose();
    document.removeEventListener(
      'visibilitychange',
      this.handleVisibilityChange
    );
    this.renderer.domElement.removeEventListener(
      'webglcontextlost',
      this.handleContextLost
    );
    this.renderer.domElement.removeEventListener(
      'webglcontextrestored',
      this.handleContextRestored
    );
    this.clearRayGroup(this.mirrorRaysGroup);
    this.clearRayGroup(this.eyeRaysGroup);
    this.rayUnitCylinderGeo.dispose();
    this.raySolidMatCache.forEach((m) => m.dispose());
    this.raySolidMatCache.clear();
    this.rayDashedMatCache.forEach((m) => m.dispose());
    this.rayDashedMatCache.clear();
    this.eyeAssembly.retinaProjectionTex.dispose();
    this.disposeGroupChildren(this.mirrorLabGroup);
    this.disposeGroupChildren(this.eyeLabGroup);
    this.photonMesh.geometry.dispose();
    (this.photonMesh.material as THREE.Material).dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
