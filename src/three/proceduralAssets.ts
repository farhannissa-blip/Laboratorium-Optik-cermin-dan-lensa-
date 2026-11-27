import * as THREE from 'three';
import { MirrorObjectType, MirrorType } from '../types/optics';

export interface ProceduralAssetContext {
  isSoftwareGl: boolean;
  isLowPower: boolean;
  maxAnisotropy: number;
}

/**
 * Soft radial contact shadow CanvasTexture for grounding 3D apparatus on the classroom desk.
 */
export function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.05,
    size / 2,
    size / 2,
    size * 0.5
  );
  grad.addColorStop(0, 'rgba(30, 41, 59, 0.32)');
  grad.addColorStop(0.55, 'rgba(30, 41, 59, 0.14)');
  grad.addColorStop(1, 'rgba(30, 41, 59, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Procedural warm oak/teak wood-grain laboratory workbench tabletop texture with subtle measurement grid.
 */
export function createLabTableTexture(
  maxAnisotropy: number,
  isLowPower = false
): THREE.CanvasTexture {
  const size = isLowPower ? 512 : 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const scale = size / 1024;
  ctx.scale(scale, scale);

  // Rich warm walnut-oak school lab desk base (high contrast against bright 3D props & rays)
  const baseGrad = ctx.createLinearGradient(0, 0, 1024, 0);
  baseGrad.addColorStop(0, '#6b472a');
  baseGrad.addColorStop(0.5, '#7c5332');
  baseGrad.addColorStop(1, '#634025');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Horizontal wood-plank seams
  const plankCount = 6;
  const plankH = 1024 / plankCount;
  const grainCount = isLowPower ? 70 : 140;
  for (let p = 0; p < plankCount; p++) {
    const py = p * plankH;
    ctx.fillStyle =
      p % 2 === 0 ? 'rgba(255, 224, 180, 0.05)' : 'rgba(30, 16, 6, 0.07)';
    ctx.fillRect(0, py, 1024, plankH);

    for (let i = 0; i < grainCount; i++) {
      const gy = py + Math.random() * plankH;
      const gx = Math.random() * 1024;
      const gw = 80 + Math.random() * 260;
      ctx.fillStyle =
        i % 3 === 0 ? 'rgba(34, 18, 6, 0.12)' : 'rgba(255, 228, 190, 0.06)';
      ctx.fillRect(gx, gy, gw, 1.5 + Math.random() * 1.5);
    }

    ctx.fillStyle = 'rgba(28, 15, 5, 0.32)';
    ctx.fillRect(0, py, 1024, 2);
  }

  // Subtle inlaid lab calibration grid lines etched on tabletop
  ctx.strokeStyle = 'rgba(255, 240, 210, 0.08)';
  ctx.lineWidth = 1;
  const step = 64;
  for (let i = 0; i <= 1024; i += step) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 1024);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(1024, i);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 1);
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Procedural tiled classroom floor texture (muted slate terrazzo, compact 256px for fast mobile VRAM).
 */
function createClassroomFloorTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(0.5, 0.5);

  ctx.fillStyle = '#334155';
  ctx.fillRect(0, 0, 512, 512);

  const tile = 128;
  for (let x = 0; x < 512; x += tile) {
    for (let y = 0; y < 512; y += tile) {
      const alt = ((x / tile + y / tile) % 2) === 0;
      ctx.fillStyle = alt ? '#364559' : '#2f3d50';
      ctx.fillRect(x + 2, y + 2, tile - 4, tile - 4);
    }
  }

  for (let i = 0; i < 240; i++) {
    ctx.fillStyle =
      i % 2 === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.12)';
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 4, 4);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 8);
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Builds the complete Indoor Elementary Science Lab Classroom Environment:
 * - Composite 3D Oak Science Lab Workbench Table (top surface flush at y = 0!)
 * - Tiled classroom floor at y = -4.2
 * - Muted teal-slate classroom back & side walls with wood wainscot molding
 * - Large framed green classroom chalkboard ("LAB IPA KELAS 5 — CAHAYA & OPTIK")
 * - Science supply wall shelf with procedural glass flasks & colorful textbooks
 * - Warm indoor pendant light fixture overhead
 */
export function createScienceClassroomEnvironment(
  maxAnisotropy: number,
  isLowPower = false
): THREE.Group {
  const room = new THREE.Group();

  // === 1. COMPOSITE 3D SCIENCE LAB TABLE (Top surface strictly at y = 0) ===
  const tableWidth = 22.5;
  const tableDepth = 9.2;
  const topThickness = 0.32;
  const tableHeight = 4.2;
  const tableCenterX = -1.6;

  const woodTex = createLabTableTexture(maxAnisotropy, isLowPower);
  const woodTopMat = new THREE.MeshStandardMaterial({
    map: woodTex,
    roughness: 0.62,
    metalness: 0.06,
  });
  const darkEdgeMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.55,
    metalness: 0.35,
  });
  const steelLegMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.42,
    metalness: 0.65,
  });
  const rubberFootMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.9,
    metalness: 0.05,
  });

  // Main oak tabletop slab (top face at y = 0, bottom at y = -topThickness)
  const tabletop = new THREE.Mesh(
    new THREE.BoxGeometry(tableWidth, topThickness, tableDepth),
    woodTopMat
  );
  tabletop.position.set(tableCenterX, -topThickness / 2, 0);
  tabletop.receiveShadow = true;
  tabletop.castShadow = true;
  room.add(tabletop);

  // Protective dark rubberized edge bumper strips around the lab desk perimeter
  const bumperFront = new THREE.Mesh(
    new THREE.BoxGeometry(tableWidth + 0.12, topThickness + 0.04, 0.14),
    darkEdgeMat
  );
  bumperFront.position.set(tableCenterX, -topThickness / 2, tableDepth / 2 + 0.04);
  const bumperBack = bumperFront.clone();
  bumperBack.position.z = -(tableDepth / 2 + 0.04);

  const bumperLeft = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, topThickness + 0.04, tableDepth + 0.16),
    darkEdgeMat
  );
  bumperLeft.position.set(tableCenterX - tableWidth / 2 - 0.04, -topThickness / 2, 0);
  const bumperRight = bumperLeft.clone();
  bumperRight.position.x = tableCenterX + tableWidth / 2 + 0.04;
  room.add(bumperFront, bumperBack, bumperLeft, bumperRight);

  // Under-table steel apron frame
  const apron = new THREE.Mesh(
    new THREE.BoxGeometry(tableWidth - 1.2, 0.52, tableDepth - 1.2),
    steelLegMat
  );
  apron.position.set(tableCenterX, -topThickness - 0.26, 0);
  room.add(apron);

  // 4 Heavy Square Steel Lab Table Legs + Rubber Feet + Lower Stretcher Crossbars
  const legOffsetX = tableWidth / 2 - 1.1;
  const legOffsetZ = tableDepth / 2 - 1.0;
  const legHeight = tableHeight - topThickness;
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const lx = tableCenterX + sx * legOffsetX;
      const lz = sz * legOffsetZ;
      const leg = new THREE.Mesh(
        new THREE.BoxGeometry(0.36, legHeight, 0.36),
        steelLegMat
      );
      leg.position.set(lx, -topThickness - legHeight / 2, lz);
      leg.castShadow = true;
      room.add(leg);

      const glide = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.28, 0.12, 16),
        rubberFootMat
      );
      glide.position.set(lx, -tableHeight + 0.06, lz);
      room.add(glide);
    }

    // Side lower stretcher bar
    const sideBar = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.16, legOffsetZ * 2),
      steelLegMat
    );
    sideBar.position.set(tableCenterX + sx * legOffsetX, -tableHeight + 0.9, 0);
    room.add(sideBar);
  }

  // Long back stretcher rail
  const backStretcher = new THREE.Mesh(
    new THREE.BoxGeometry(legOffsetX * 2, 0.16, 0.16),
    steelLegMat
  );
  backStretcher.position.set(tableCenterX, -tableHeight + 0.9, -legOffsetZ);
  room.add(backStretcher);

  // === 2. CLASSROOM TILED FLOOR (y = -4.2) ===
  const floorTex = createClassroomFloorTexture(maxAnisotropy);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(58, 48),
    new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.72,
      metalness: 0.08,
    })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(tableCenterX, -tableHeight, 0);
  floor.receiveShadow = true;
  room.add(floor);

  // === 3. INDOOR SCIENCE CLASSROOM WALLS & WAINSCOTING ===
  const upperWallMat = new THREE.MeshStandardMaterial({
    color: 0x243447, // Cozy calm slate-blue classroom wall (makes bright rays pop!)
    roughness: 0.88,
    metalness: 0.02,
  });
  const wainscotMat = new THREE.MeshStandardMaterial({
    color: 0x3b4d63,
    roughness: 0.78,
    metalness: 0.05,
  });
  const woodTrimMat = new THREE.MeshStandardMaterial({
    color: 0x855834,
    roughness: 0.62,
    metalness: 0.05,
  });

  // Back classroom wall at z = -10.5
  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(52, 22), upperWallMat);
  backWall.position.set(tableCenterX, 6.8, -10.5);
  backWall.receiveShadow = true;
  room.add(backWall);

  // Lower wall wainscoting panel + wooden chair rail
  const backWainscot = new THREE.Mesh(
    new THREE.BoxGeometry(52, 4.6, 0.12),
    wainscotMat
  );
  backWainscot.position.set(tableCenterX, -tableHeight + 2.3, -10.42);
  room.add(backWainscot);

  const chairRail = new THREE.Mesh(
    new THREE.BoxGeometry(52, 0.22, 0.2),
    woodTrimMat
  );
  chairRail.position.set(tableCenterX, -tableHeight + 4.65, -10.38);
  room.add(chairRail);

  // Left & Right side walls so orbiting never hits an empty void
  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(36, 22), upperWallMat);
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(-22, 6.8, 0);
  room.add(leftWall);

  const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(36, 22), upperWallMat);
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.position.set(19, 6.8, 0);
  room.add(rightWall);

  // === 4. FRAMED CLASSROOM CHALKBOARD ON BACK WALL ===
  const chalkCanvas = document.createElement('canvas');
  chalkCanvas.width = isLowPower ? 512 : 1024;
  chalkCanvas.height = isLowPower ? 224 : 448;
  const cCtx = chalkCanvas.getContext('2d')!;
  if (isLowPower) cCtx.scale(0.5, 0.5);
  cCtx.fillStyle = '#183a2d';
  cCtx.fillRect(0, 0, 1024, 448);

  const chalkSpecks = isLowPower ? 180 : 450;
  for (let i = 0; i < chalkSpecks; i++) {
    cCtx.fillStyle = 'rgba(255, 255, 255, 0.025)';
    cCtx.fillRect(
      Math.random() * 1024,
      Math.random() * 448,
      20 + Math.random() * 50,
      4
    );
  }

  cCtx.fillStyle = 'rgba(248, 250, 252, 0.85)';
  cCtx.font = '700 44px "Plus Jakarta Sans", sans-serif';
  cCtx.textAlign = 'center';
  cCtx.fillText('LABORATORIUM IPA KELAS 5', 512, 82);

  cCtx.fillStyle = 'rgba(253, 224, 71, 0.82)';
  cCtx.font = '600 28px "Plus Jakarta Sans", sans-serif';
  cCtx.fillText('Bab Cahaya: Cermin Cekung · Cermin Cembung · Indra Penglihatan', 512, 134);

  // Simple chalk diagrams on left & right of chalkboard
  cCtx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  cCtx.lineWidth = 4;
  // Concave arc sketch
  cCtx.beginPath();
  cCtx.arc(270, 275, 75, -0.7, 0.7);
  cCtx.stroke();
  cCtx.beginPath();
  cCtx.moveTo(140, 275);
  cCtx.lineTo(360, 275);
  cCtx.stroke();
  cCtx.fillStyle = 'rgba(186, 230, 253, 0.78)';
  cCtx.font = '600 22px "Plus Jakarta Sans", sans-serif';
  cCtx.fillText('Cermin Cekung (F)', 250, 385);

  // Eye sketch
  cCtx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  cCtx.beginPath();
  cCtx.arc(760, 275, 68, 0, Math.PI * 2);
  cCtx.stroke();
  cCtx.fillStyle = 'rgba(253, 186, 116, 0.8)';
  cCtx.fillText('Retina & Kacamata', 760, 385);

  const chalkTex = new THREE.CanvasTexture(chalkCanvas);
  chalkTex.colorSpace = THREE.SRGBColorSpace;
  chalkTex.anisotropy = maxAnisotropy;

  const boardGroup = new THREE.Group();
  boardGroup.position.set(tableCenterX, 5.2, -10.32);

  const boardFace = new THREE.Mesh(
    new THREE.PlaneGeometry(12.2, 5.1),
    new THREE.MeshStandardMaterial({ map: chalkTex, roughness: 0.92 })
  );
  boardGroup.add(boardFace);

  // Wooden chalkboard outer border + chalk ledge
  const frameTop = new THREE.Mesh(new THREE.BoxGeometry(12.6, 0.24, 0.24), woodTrimMat);
  frameTop.position.set(0, 2.65, 0.04);
  const frameBot = new THREE.Mesh(new THREE.BoxGeometry(12.6, 0.28, 0.42), woodTrimMat);
  frameBot.position.set(0, -2.65, 0.14);
  const frameLeft = new THREE.Mesh(new THREE.BoxGeometry(0.24, 5.5, 0.24), woodTrimMat);
  frameLeft.position.set(-6.2, 0, 0.04);
  const frameRight = frameLeft.clone();
  frameRight.position.x = 6.2;
  boardGroup.add(frameTop, frameBot, frameLeft, frameRight);
  room.add(boardGroup);

  // === 5. CLASSROOM SCIENCE SHELF WITH COLORFUL LAB FLASKS (Background Prop) ===
  const shelfGroup = new THREE.Group();
  shelfGroup.position.set(8.6, 4.4, -10.05);

  const shelfPlank = new THREE.Mesh(
    new THREE.BoxGeometry(4.4, 0.18, 0.85),
    woodTrimMat
  );
  shelfGroup.add(shelfPlank);

  // Procedural Erlenmeyer flasks with colorful classroom science liquids
  const flaskProfile = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.32, 0.0),
    new THREE.Vector2(0.3, 0.16),
    new THREE.Vector2(0.11, 0.56),
    new THREE.Vector2(0.11, 0.78),
    new THREE.Vector2(0.14, 0.82),
  ];
  const flaskGeo = new THREE.LatheGeometry(flaskProfile, 20);
  const flaskColors = [0x38bdf8, 0x34d399, 0xf59e0b];
  flaskColors.forEach((hex, idx) => {
    const flask = new THREE.Mesh(
      flaskGeo,
      new THREE.MeshStandardMaterial({
        color: hex,
        roughness: 0.22,
        metalness: 0.1,
        transparent: true,
        opacity: 0.85,
      })
    );
    flask.position.set(-1.3 + idx * 0.9, 0.09, 0);
    shelfGroup.add(flask);
  });

  // Mini stack of colorful IPA textbooks on the shelf
  const bookColors = [0xef4444, 0x2563eb, 0xf59e0b];
  bookColors.forEach((hex, i) => {
    const book = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.92, 0.62),
      new THREE.MeshStandardMaterial({ color: hex, roughness: 0.72 })
    );
    book.position.set(1.2 + i * 0.27, 0.55, 0);
    shelfGroup.add(book);
  });
  room.add(shelfGroup);

  // === 6. WARM CLASSROOM WINDOW GLOW FRAME ON LEFT WALL ===
  const windowGroup = new THREE.Group();
  windowGroup.position.set(-14.2, 5.2, -10.3);
  const winPane = new THREE.Mesh(
    new THREE.PlaneGeometry(5.2, 4.8),
    new THREE.MeshBasicMaterial({ color: 0xdbeafe })
  );
  windowGroup.add(winPane);
  const mullionV = new THREE.Mesh(new THREE.BoxGeometry(0.18, 4.9, 0.14), woodTrimMat);
  const mullionH = new THREE.Mesh(new THREE.BoxGeometry(5.3, 0.18, 0.14), woodTrimMat);
  windowGroup.add(mullionV, mullionH);
  room.add(windowGroup);

  // === 7. OVERHEAD LAB PENDANT LIGHT SHADE (High above table) ===
  const lampGroup = new THREE.Group();
  lampGroup.position.set(tableCenterX, 11.2, 0);
  const cord = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 4.0, 10),
    darkEdgeMat
  );
  cord.position.y = 2.0;
  const shade = new THREE.Mesh(
    new THREE.ConeGeometry(1.4, 0.75, 28, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
      metalness: 0.5,
      side: THREE.DoubleSide,
    })
  );
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xfff7ed })
  );
  bulb.position.y = -0.22;
  lampGroup.add(cord, shade, bulb);
  room.add(lampGroup);

  return room;
}

/**
 * Bright school-ruler style graduated centimeter plate (-55 cm to +35 cm, 0 at Mirror).
 */
export function createOpticalRulerTexture(
  maxAnisotropy: number,
  isLowPower = false
): THREE.CanvasTexture {
  const width = 2048;
  const height = 256;
  const canvas = document.createElement('canvas');
  canvas.width = isLowPower ? 1024 : width;
  canvas.height = isLowPower ? 128 : height;
  const ctx = canvas.getContext('2d')!;
  if (isLowPower) ctx.scale(0.5, 0.5);

  // Clean bright school ruler yellow-cream tint
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, '#fef9c3');
  grad.addColorStop(0.5, '#fefce8');
  grad.addColorStop(1, '#fde68a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  const minCm = -55;
  const maxCm = 35;
  const totalCm = maxCm - minCm;

  ctx.strokeStyle = '#1e293b';
  ctx.font = '700 32px "IBM Plex Mono", monospace';
  ctx.textAlign = 'center';

  for (let cm = minCm; cm <= maxCm; cm++) {
    const u = (cm - minCm) / totalCm;
    const x = u * width;
    const isMajor = cm % 10 === 0;
    const isMid = cm % 5 === 0;
    const tickH = isMajor ? 74 : isMid ? 48 : 28;

    ctx.lineWidth = isMajor ? 4 : isMid ? 2.5 : 1.5;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, tickH);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x, height);
    ctx.lineTo(x, height - tickH * 0.58);
    ctx.stroke();

    if (isMajor && cm > minCm + 2 && cm < maxCm - 2) {
      const label = cm === 0 ? '0 (Cermin)' : `${Math.abs(cm)} cm`;
      ctx.fillStyle = cm === 0 ? '#0369a1' : '#0f172a';
      ctx.fillText(label, x, 128);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Creates a crisp, bright, high-contrast kid-friendly floating 3D label plaque.
 */
export function createLabelSprite(
  text: string,
  accentHex = '#0284c7',
  scaleFactor = 1
): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 60;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const padX = 10;
  const padY = 8;
  const w = canvas.width - padX * 2;
  const h = canvas.height - padY * 2;
  const r = 12;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
  ctx.strokeStyle = accentHex;
  ctx.lineWidth = 3.5;

  ctx.beginPath();
  ctx.moveTo(padX + r, padY);
  ctx.lineTo(padX + w - r, padY);
  ctx.quadraticCurveTo(padX + w, padY, padX + w, padY + r);
  ctx.lineTo(padX + w, padY + h - r);
  ctx.quadraticCurveTo(padX + w, padY + h, padX + w - r, padY + h);
  ctx.lineTo(padX + r, padY + h);
  ctx.quadraticCurveTo(padX, padY + h, padX, padY + h - r);
  ctx.lineTo(padX, padY + r);
  ctx.quadraticCurveTo(padX, padY, padX + r, padY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.font = '700 18px "Plus Jakarta Sans", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 1);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;

  const mat = new THREE.SpriteMaterial({
    map: tex,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(1.9 * scaleFactor, 0.44 * scaleFactor, 1);
  sprite.renderOrder = 30;
  return sprite;
}

/**
 * Updates an existing label sprite's text & border color without reallocating the sprite object.
 */
export function updateLabelSpriteText(
  sprite: THREE.Sprite,
  text: string,
  accentHex = '#0284c7'
): void {
  const mat = sprite.material as THREE.SpriteMaterial;
  const oldTex = mat.map;
  const fresh = createLabelSprite(text, accentHex, 1);
  mat.map = (fresh.material as THREE.SpriteMaterial).map;
  mat.needsUpdate = true;
  if (oldTex) oldTex.dispose();
  fresh.material.dispose();
}

/**
 * Cheerful, crisp radial iris texture for the Grade 5 3D eye model (compact 256px).
 */
export function createIrisTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const cx = size / 2;
  const cy = size / 2;

  const grad = ctx.createRadialGradient(cx, cy, size * 0.14, cx, cy, size * 0.49);
  grad.addColorStop(0.0, '#0f172a');
  grad.addColorStop(0.28, '#0f172a');
  grad.addColorStop(0.32, '#f59e0b');
  grad.addColorStop(0.58, '#0ea5e9');
  grad.addColorStop(0.88, '#0369a1');
  grad.addColorStop(1.0, '#1e3a8a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 120; i++) {
    const angle = (i / 120) * Math.PI * 2;
    const inner = size * 0.17;
    const outer = size * (0.43 + Math.random() * 0.05);
    ctx.strokeStyle =
      i % 3 === 0 ? 'rgba(254, 240, 138, 0.45)' : 'rgba(186, 230, 253, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
    ctx.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Builds a clean colorful sliding rail carriage (navy-blue body + yellow pointer + brass knob).
 */
export function createRailCarriage(width = 0.72): THREE.Group {
  const group = new THREE.Group();

  const blueBody = new THREE.MeshStandardMaterial({
    color: 0x1e40af,
    roughness: 0.42,
    metalness: 0.25,
  });
  const warmAmber = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.28,
    metalness: 0.35,
  });
  const silverCollar = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.2,
    metalness: 0.82,
  });

  const base = new THREE.Mesh(new THREE.BoxGeometry(width, 0.28, 0.96), blueBody);
  base.position.y = 0.14;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  const skirtGeo = new THREE.BoxGeometry(width * 0.94, 0.18, 0.1);
  const frontSkirt = new THREE.Mesh(skirtGeo, blueBody);
  frontSkirt.position.set(0, 0.02, 0.46);
  const backSkirt = new THREE.Mesh(skirtGeo, blueBody);
  backSkirt.position.set(0, 0.02, -0.46);
  group.add(frontSkirt, backSkirt);

  const collar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.19, 0.22, 24),
    silverCollar
  );
  collar.position.y = 0.36;
  collar.castShadow = true;
  group.add(collar);

  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.035, 0.24, 12),
    silverCollar
  );
  stem.rotation.x = Math.PI / 2;
  stem.position.set(0, 0.15, 0.56);
  const knob = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.09, 0.11, 20),
    warmAmber
  );
  knob.rotation.x = Math.PI / 2;
  knob.position.set(0, 0.15, 0.68);
  group.add(stem, knob);

  // Pointer arrow pointing down to ruler cm markings
  const pointer = new THREE.Mesh(
    new THREE.ConeGeometry(0.06, 0.15, 4),
    warmAmber
  );
  pointer.rotation.x = Math.PI;
  pointer.position.set(0, 0.06, 0.52);
  group.add(pointer);

  return group;
}

export const RAIL_TOP_Y = 0.74;
export const OPTICAL_AXIS_Y = 2.45;

export function createOpticalBench(
  maxAnisotropy: number,
  isLowPower = false
): THREE.Group {
  const group = new THREE.Group();

  const frameBlue = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.48,
    metalness: 0.35,
  });
  const softRubber = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.88,
    metalness: 0.05,
  });
  const accentSky = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.32,
    metalness: 0.3,
  });
  const steelTrim = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    roughness: 0.25,
    metalness: 0.78,
  });

  const railLength = 18;
  const railCenterX = -2;

  const mainBeam = new THREE.Mesh(
    new THREE.BoxGeometry(railLength, 0.34, 0.84),
    frameBlue
  );
  mainBeam.position.set(railCenterX, 0.57, 0);
  mainBeam.castShadow = true;
  mainBeam.receiveShadow = true;
  group.add(mainBeam);

  const lowerRib = new THREE.Mesh(
    new THREE.BoxGeometry(railLength - 0.6, 0.16, 0.42),
    steelTrim
  );
  lowerRib.position.set(railCenterX, 0.34, 0);
  group.add(lowerRib);

  const rulerTex = createOpticalRulerTexture(maxAnisotropy, isLowPower);
  const rulerMat = new THREE.MeshStandardMaterial({
    map: rulerTex,
    roughness: 0.36,
    metalness: 0.12,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const rulerPlate = new THREE.Mesh(
    new THREE.PlaneGeometry(railLength, 0.72),
    rulerMat
  );
  rulerPlate.rotation.x = -Math.PI / 2;
  rulerPlate.position.set(railCenterX, RAIL_TOP_Y + 0.005, 0);
  rulerPlate.receiveShadow = true;
  group.add(rulerPlate);

  const footPositions = [-10.4, -2, 6.4];
  for (const fx of footPositions) {
    const leg = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.44, 1.85),
      frameBlue
    );
    leg.position.set(fx, 0.26, 0);
    leg.castShadow = true;
    leg.receiveShadow = true;
    group.add(leg);

    for (const fz of [-0.76, 0.76]) {
      const pad = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.22, 0.08, 20),
        softRubber
      );
      pad.position.set(fx, 0.04, fz);
      group.add(pad);

      const levelNut = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.09, 0.06, 6),
        accentSky
      );
      levelNut.position.set(fx, 0.1, fz);
      group.add(levelNut);
    }
  }

  for (const endX of [-11.06, 7.06]) {
    const cap = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.46, 0.96),
      accentSky
    );
    cap.position.set(endX, 0.58, 0);
    group.add(cap);
  }

  const shadowMat = new THREE.MeshBasicMaterial({
    map: createContactShadowTexture(),
    transparent: true,
    depthWrite: false,
    opacity: 0.55,
  });
  const shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(20, 4.2), shadowMat);
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.set(railCenterX, 0.015, 0);
  group.add(shadowPlane);

  return group;
}

export function buildSphericalMirrorGeometries(
  mirrorType: MirrorType,
  focalLengthUnits: number,
  apertureRadius = 1.65,
  isLowPower = false
): { frontGeo: THREE.BufferGeometry; backGeo: THREE.BufferGeometry; rimOffsetX: number } {
  const R = Math.max(apertureRadius * 1.38, Math.abs(focalLengthUnits) * 2);
  const segments = isLowPower ? 14 : 22;
  const radialSegs = isLowPower ? 28 : 42;
  const frontPoints: THREE.Vector2[] = [];
  const backPoints: THREE.Vector2[] = [];
  const thickness = 0.16;

  const dir = mirrorType === 'concave' ? -1 : 1;

  for (let i = 0; i <= segments; i++) {
    const r = (i / segments) * apertureRadius;
    const sag = R - Math.sqrt(Math.max(0.001, R * R - r * r));
    frontPoints.push(new THREE.Vector2(r, dir * sag));
  }

  const maxSag = R - Math.sqrt(Math.max(0.001, R * R - apertureRadius * apertureRadius));
  const rimOffsetX = dir * maxSag;

  backPoints.push(new THREE.Vector2(0, thickness));
  for (let i = 1; i <= segments; i++) {
    const r = (i / segments) * (apertureRadius + 0.04);
    const rClamped = Math.min(r, apertureRadius);
    const sag = R - Math.sqrt(Math.max(0.001, R * R - rClamped * rClamped));
    backPoints.push(new THREE.Vector2(r, dir * sag + thickness));
  }
  backPoints.push(new THREE.Vector2(apertureRadius + 0.04, rimOffsetX));

  const frontGeo = new THREE.LatheGeometry(frontPoints, radialSegs);
  frontGeo.rotateZ(-Math.PI / 2);
  frontGeo.computeVertexNormals();

  const backGeo = new THREE.LatheGeometry(backPoints, radialSegs);
  backGeo.rotateZ(-Math.PI / 2);
  backGeo.computeVertexNormals();

  return { frontGeo, backGeo, rimOffsetX };
}

export function createMirrorAssembly(
  mirrorType: MirrorType,
  focalLengthUnits: number,
  isLowPower = false
): {
  root: THREE.Group;
  gimbalHead: THREE.Group;
  frontMesh: THREE.Mesh;
  backMesh: THREE.Mesh;
  bezelRing: THREE.Mesh;
} {
  const root = new THREE.Group();

  const carriage = createRailCarriage(0.84);
  carriage.position.y = RAIL_TOP_Y;
  root.add(carriage);

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.16,
    metalness: 0.88,
  });
  const accentBlue = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.34,
    metalness: 0.35,
  });
  const warmGold = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.28,
    metalness: 0.6,
  });

  const postHeight = OPTICAL_AXIS_Y - RAIL_TOP_Y - 1.55;
  const post = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.09, Math.max(0.4, postHeight), 16),
    chromeMat
  );
  post.position.y = RAIL_TOP_Y + 0.45 + postHeight / 2;
  post.castShadow = true;
  root.add(post);

  const gimbalHead = new THREE.Group();
  gimbalHead.position.set(0, OPTICAL_AXIS_Y, 0);
  root.add(gimbalHead);

  const yokeBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.14, 3.62),
    accentBlue
  );
  yokeBase.position.set(0.12, -1.78, 0);
  gimbalHead.add(yokeBase);

  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 1.88, 0.12),
      accentBlue
    );
    arm.position.set(0.12, -0.88, side * 1.78);
    gimbalHead.add(arm);

    const pivotScrew = new THREE.Mesh(
      new THREE.CylinderGeometry(0.085, 0.085, 0.22, 12),
      warmGold
    );
    pivotScrew.rotation.x = Math.PI / 2;
    pivotScrew.position.set(0.12, 0, side * 1.82);
    gimbalHead.add(pivotScrew);
  }

  const { frontGeo, backGeo, rimOffsetX } = buildSphericalMirrorGeometries(
    mirrorType,
    focalLengthUnits,
    1.65,
    isLowPower
  );

  // Gleaming sky-tinted silvered mirror front surface (fast StandardMaterial on mobile)
  const silverMirrorMat = isLowPower
    ? new THREE.MeshStandardMaterial({
        color: 0xdbeafe,
        metalness: 0.92,
        roughness: 0.08,
        side: THREE.DoubleSide,
      })
    : new THREE.MeshPhysicalMaterial({
        color: 0xdbeafe,
        metalness: 0.94,
        roughness: 0.06,
        clearcoat: 1.0,
        clearcoatRoughness: 0.04,
        side: THREE.DoubleSide,
      });

  // Bright cobalt-blue non-reflective rear shell so kids immediately see front vs back!
  const backingMat = new THREE.MeshStandardMaterial({
    color: 0x1d4ed8,
    metalness: 0.22,
    roughness: 0.55,
    side: THREE.DoubleSide,
  });

  const frontMesh = new THREE.Mesh(frontGeo, silverMirrorMat);
  frontMesh.castShadow = true;
  frontMesh.receiveShadow = true;
  gimbalHead.add(frontMesh);

  const backMesh = new THREE.Mesh(backGeo, backingMat);
  backMesh.castShadow = true;
  backMesh.receiveShadow = true;
  gimbalHead.add(backMesh);

  const bezelRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.68, 0.068, 12, isLowPower ? 32 : 52),
    warmGold
  );
  bezelRing.rotation.y = Math.PI / 2;
  bezelRing.position.x = rimOffsetX + 0.04;
  gimbalHead.add(bezelRing);

  return { root, gimbalHead, frontMesh, backMesh, bezelRing };
}

/**
 * Builds one of the 4 fun, everyday Grade 5 composite 3D objects:
 *   1. 'robot'  — Cute Mini Toy Robot (antenna, glowing eyes, colorful torso & boots)
 *   2. 'candle' — Birthday Candle with flickering flame
 *   3. 'tree'   — Mini Apple Tree in terracotta pot with bright red apples
 *   4. 'pencil' — Giant Yellow Colored Pencil with pink eraser & blue tip
 * Bottom-center pivot sits at y = 0, total height = 1.60 units.
 */
export function createOpticalSubjectModel(
  objectType: MirrorObjectType,
  isImage = false,
  isVirtual = false
): { group: THREE.Group; flameMesh?: THREE.Mesh } {
  const group = new THREE.Group();
  const baseOpacity = isImage ? (isVirtual ? 0.56 : 0.94) : 1.0;
  const transparent = isImage && (isVirtual || baseOpacity < 1);

  const makeMat = (
    color: number,
    roughness: number,
    metalness: number,
    emissive = 0x000000,
    emissiveIntensity = 0
  ) =>
    new THREE.MeshStandardMaterial({
      color:
        isImage && isVirtual
          ? new THREE.Color(color).lerp(new THREE.Color(0x38bdf8), 0.25)
          : color,
      roughness,
      metalness,
      emissive: isImage && isVirtual ? 0x0284c7 : emissive,
      emissiveIntensity: isImage && isVirtual ? 0.22 : emissiveIntensity,
      transparent,
      opacity: baseOpacity,
      depthWrite: !isVirtual,
    });

  let flameMesh: THREE.Mesh | undefined;

  if (objectType === 'robot') {
    // 1. Blue sturdy boots (left & right)
    const bootMat = makeMat(0x1d4ed8, 0.35, 0.2);
    for (const sz of [-0.14, 0.14]) {
      const boot = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 0.16), bootMat);
      boot.position.set(0, 0.11, sz);
      boot.castShadow = !isImage;
      group.add(boot);

      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.055, 0.26, 12),
        makeMat(0x94a3b8, 0.25, 0.7)
      );
      leg.position.set(0, 0.32, sz);
      group.add(leg);
    }

    // 2. Cheerful Red & Sky-Blue Torso
    const torso = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.52, 0.48),
      makeMat(0xef4444, 0.32, 0.18)
    );
    torso.position.set(0, 0.68, 0);
    torso.castShadow = !isImage;
    group.add(torso);

    // Chest yellow heart/power dial facing viewer (+Z) and mirror (+X)
    const chestDial = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 0.06, 20),
      makeMat(0xfacc15, 0.25, 0.2, 0xeab308, 0.3)
    );
    chestDial.rotation.x = Math.PI / 2;
    chestDial.position.set(0, 0.72, 0.25);
    group.add(chestDial);

    // 3. Arms with yellow hands
    for (const sz of [-0.31, 0.31]) {
      const arm = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.055, 0.28, 6, 10),
        makeMat(0x3b82f6, 0.35, 0.2)
      );
      arm.position.set(0, 0.68, sz);
      group.add(arm);
    }

    // 4. White rounded Robot Head
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.34, 0.36, 0.42),
      makeMat(0xf8fafc, 0.26, 0.1)
    );
    head.position.set(0, 1.15, 0);
    head.castShadow = !isImage;
    group.add(head);

    // Dark screen visor + two cheerful bright cyan eyes (visible on both +Z and +X sides!)
    const visor = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.14, 0.34),
      makeMat(0x0f172a, 0.2, 0.4)
    );
    visor.position.set(0.02, 1.18, 0);
    group.add(visor);

    const eyeMat = makeMat(0x38bdf8, 0.15, 0.1, 0x0ea5e9, 0.9);
    for (const sz of [-0.09, 0.09]) {
      const eyeFront = new THREE.Mesh(new THREE.SphereGeometry(0.042, 12, 12), eyeMat);
      eyeFront.position.set(0.18, 1.18, sz);
      group.add(eyeFront);
    }
    const eyeSide = new THREE.Mesh(new THREE.SphereGeometry(0.048, 12, 12), eyeMat);
    eyeSide.position.set(0.04, 1.18, 0.21);
    group.add(eyeSide);

    // 5. Antenna reaching y = 1.60 with bright orange glowing ball!
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.028, 0.2, 10),
      makeMat(0x94a3b8, 0.25, 0.75)
    );
    stem.position.set(0, 1.42, 0);
    group.add(stem);

    const tipBall = new THREE.Mesh(
      new THREE.SphereGeometry(0.075, 16, 16),
      makeMat(0xf97316, 0.2, 0.1, 0xea580c, 0.75)
    );
    tipBall.position.set(0, 1.54, 0);
    group.add(tipBall);
  } else if (objectType === 'candle') {
    const saucer = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.22, 0.08, 24),
      makeMat(0xf59e0b, 0.28, 0.55)
    );
    saucer.position.y = 0.04;
    group.add(saucer);

    // Colorful birthday candle wax body
    const waxProfile = [
      new THREE.Vector2(0.0, 0.08),
      new THREE.Vector2(0.16, 0.08),
      new THREE.Vector2(0.155, 0.65),
      new THREE.Vector2(0.145, 1.02),
      new THREE.Vector2(0.1, 1.06),
      new THREE.Vector2(0.0, 1.04),
    ];
    const wax = new THREE.Mesh(
      new THREE.LatheGeometry(waxProfile, 24),
      makeMat(0xf43f5e, 0.55, 0.05)
    );
    wax.castShadow = !isImage;
    group.add(wax);

    // Decorative white birthday candle stripes
    for (const ry of [0.32, 0.58, 0.84]) {
      const stripe = new THREE.Mesh(
        new THREE.TorusGeometry(0.155, 0.022, 10, 24),
        makeMat(0xffffff, 0.5, 0.05)
      );
      stripe.rotation.x = Math.PI / 2;
      stripe.position.y = ry;
      group.add(stripe);
    }

    const wick = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.018, 0.14, 8),
      makeMat(0x1f2937, 0.9, 0.0)
    );
    wick.position.y = 1.11;
    group.add(wick);

    const flameProfile = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.1, 0.1),
      new THREE.Vector2(0.12, 0.22),
      new THREE.Vector2(0.075, 0.37),
      new THREE.Vector2(0.018, 0.47),
      new THREE.Vector2(0.0, 0.5),
    ];
    flameMesh = new THREE.Mesh(
      new THREE.LatheGeometry(flameProfile, 20),
      new THREE.MeshStandardMaterial({
        color: isVirtual ? 0x38bdf8 : 0xf97316,
        emissive: isVirtual ? 0x0284c7 : 0xf59e0b,
        emissiveIntensity: 1.5,
        roughness: 0.2,
        transparent: true,
        opacity: isVirtual ? 0.72 : 0.96,
      })
    );
    flameMesh.position.y = 1.1;
    group.add(flameMesh);

    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 14, 14),
      new THREE.MeshBasicMaterial({
        color: isVirtual ? 0xe0f2fe : 0xfef08a,
        transparent: true,
        opacity: isVirtual ? 0.75 : 0.96,
      })
    );
    core.scale.set(0.85, 1.5, 0.85);
    core.position.y = 1.24;
    group.add(core);
  } else if (objectType === 'tree') {
    // 1. Terracotta clay pot
    const potProfile = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.2, 0.0),
      new THREE.Vector2(0.27, 0.34),
      new THREE.Vector2(0.29, 0.36),
      new THREE.Vector2(0.29, 0.42),
      new THREE.Vector2(0.22, 0.42),
      new THREE.Vector2(0.0, 0.38),
    ];
    const pot = new THREE.Mesh(
      new THREE.LatheGeometry(potProfile, 24),
      makeMat(0xd97706, 0.68, 0.05)
    );
    pot.castShadow = !isImage;
    group.add(pot);

    // 2. Wooden tree trunk
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.12, 0.55, 14),
      makeMat(0x78350f, 0.82, 0.02)
    );
    trunk.position.y = 0.62;
    trunk.castShadow = !isImage;
    group.add(trunk);

    // 3. Layered lush green canopy puffs
    const leafMat = makeMat(0x16a34a, 0.62, 0.04);
    const leafDark = makeMat(0x15803d, 0.66, 0.04);
    const puffCoords: Array<[number, number, number, number, boolean]> = [
      [0, 1.05, 0, 0.38, false],
      [0.2, 1.0, 0.16, 0.26, true],
      [-0.18, 1.02, 0.14, 0.25, true],
      [0, 1.02, -0.22, 0.26, true],
      [0, 1.38, 0, 0.25, false],
    ];
    for (const [px, py, pz, r, dark] of puffCoords) {
      const puff = new THREE.Mesh(
        new THREE.SphereGeometry(r, 18, 16),
        dark ? leafDark : leafMat
      );
      puff.position.set(px, py, pz);
      puff.castShadow = !isImage;
      group.add(puff);
    }

    // 4. Bright glossy red apples + golden star/top apple at y = 1.56
    const appleMat = makeMat(0xdc2626, 0.22, 0.15, 0x991b1b, 0.18);
    const appleSpots: Array<[number, number, number]> = [
      [0.25, 1.12, 0.26],
      [-0.22, 1.08, 0.24],
      [0.08, 0.94, 0.34],
      [0.14, 1.36, 0.18],
      [0, 1.57, 0],
    ];
    for (const [ax, ay, az] of appleSpots) {
      const apple = new THREE.Mesh(new THREE.SphereGeometry(0.072, 14, 14), appleMat);
      apple.position.set(ax, ay, az);
      group.add(apple);
    }
  } else {
    // Giant Colored Pencil (yellow hexagonal body + pink eraser + metal ferrule + sharpened tip!)
    // 1. Pink rubber eraser at bottom
    const eraser = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.14, 0.18, 20),
      makeMat(0xf472b6, 0.65, 0.05)
    );
    eraser.position.y = 0.09;
    group.add(eraser);

    // 2. Metallic silver ferrule collar
    const ferrule = new THREE.Mesh(
      new THREE.CylinderGeometry(0.148, 0.148, 0.14, 20),
      makeMat(0xcbd5e1, 0.22, 0.82)
    );
    ferrule.position.y = 0.24;
    group.add(ferrule);

    // 3. Hexagonal bright yellow pencil shaft
    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.145, 0.145, 0.84, 6),
      makeMat(0xfacc15, 0.38, 0.1)
    );
    shaft.position.y = 0.73;
    shaft.castShadow = !isImage;
    group.add(shaft);

    // 4. Sharpened natural wood cone
    const woodCone = new THREE.Mesh(
      new THREE.ConeGeometry(0.145, 0.34, 18),
      makeMat(0xfde68a, 0.72, 0.02)
    );
    woodCone.position.y = 1.32;
    group.add(woodCone);

    // 5. Vivid blue colored-pencil tip reaching y = 1.60
    const leadTip = new THREE.Mesh(
      new THREE.ConeGeometry(0.062, 0.18, 16),
      makeMat(0x0284c7, 0.28, 0.15, 0x0369a1, 0.25)
    );
    leadTip.position.y = 1.51;
    group.add(leadTip);
  }

  return { group, flameMesh };
}

/**
 * Friendly yellow-and-blue 3D School Flashlight (Lampu Senter) mounted on a sliding carriage.
 */
export function createLightSourceAssembly(): {
  root: THREE.Group;
  postMesh: THREE.Mesh;
  lampHead: THREE.Group;
  emitterLens: THREE.Mesh;
} {
  const root = new THREE.Group();

  const carriage = createRailCarriage(0.76);
  carriage.position.y = RAIL_TOP_Y;
  root.add(carriage);

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.2,
    metalness: 0.85,
  });
  const yellowShell = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.34,
    metalness: 0.15,
  });
  const blueGrip = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.45,
    metalness: 0.2,
  });

  const postMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.065, 0.065, 1.0, 16),
    chromeMat
  );
  postMesh.castShadow = true;
  root.add(postMesh);

  const lampHead = new THREE.Group();
  root.add(lampHead);

  // Flashlight barrel profile via LatheGeometry
  const barrelProfile = [
    new THREE.Vector2(0.0, -0.46),
    new THREE.Vector2(0.22, -0.46),
    new THREE.Vector2(0.23, 0.12),
    new THREE.Vector2(0.32, 0.34),
    new THREE.Vector2(0.32, 0.44),
    new THREE.Vector2(0.26, 0.44),
  ];
  const barrelGeo = new THREE.LatheGeometry(barrelProfile, 28);
  barrelGeo.rotateZ(-Math.PI / 2);
  const barrel = new THREE.Mesh(barrelGeo, yellowShell);
  barrel.castShadow = true;
  lampHead.add(barrel);

  // Blue rubber grip band & power switch button on top
  const gripBand = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.24, 0.36, 24),
    blueGrip
  );
  gripBand.rotation.z = Math.PI / 2;
  gripBand.position.x = -0.15;
  lampHead.add(gripBand);

  const switchBtn = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.08, 0.1),
    new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.35 })
  );
  switchBtn.position.set(0.04, 0.25, 0);
  lampHead.add(switchBtn);

  // Glowing front flashlight bulb lens
  const emitterLens = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.5),
    new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.8,
      roughness: 0.12,
    })
  );
  emitterLens.rotation.z = -Math.PI / 2;
  emitterLens.position.x = 0.38;
  lampHead.add(emitterLens);

  return { root, postMesh, lampHead, emitterLens };
}

/**
 * Clean white framed Classroom Projection Screen to catch Real Images.
 */
export function createProjectionScreenAssembly(): THREE.Group {
  const group = new THREE.Group();
  const carriage = createRailCarriage(0.68);
  carriage.position.y = RAIL_TOP_Y;
  group.add(carriage);

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.2,
    metalness: 0.85,
  });
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.38,
    metalness: 0.25,
  });

  const post = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.055, 1.35, 16),
    chromeMat
  );
  post.position.y = RAIL_TOP_Y + 0.95;
  group.add(post);

  const w = 2.6;
  const h = 3.1;
  const t = 0.09;
  const frameY = OPTICAL_AXIS_Y;

  const topBar = new THREE.Mesh(new THREE.BoxGeometry(0.09, t, w + t * 2), frameMat);
  topBar.position.set(0, frameY + h / 2, 0);
  const botBar = new THREE.Mesh(new THREE.BoxGeometry(0.09, t, w + t * 2), frameMat);
  botBar.position.set(0, frameY - h / 2, 0);
  const leftBar = new THREE.Mesh(new THREE.BoxGeometry(0.09, h, t), frameMat);
  leftBar.position.set(0, frameY, -w / 2);
  const rightBar = new THREE.Mesh(new THREE.BoxGeometry(0.09, h, t), frameMat);
  rightBar.position.set(0, frameY, w / 2);
  group.add(topBar, botBar, leftBar, rightBar);

  const screenGlass = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.7,
      metalness: 0.02,
      transparent: true,
      opacity: 0.24,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  screenGlass.rotation.y = Math.PI / 2;
  screenGlass.position.set(0, frameY, 0);
  screenGlass.renderOrder = 4;
  group.add(screenGlass);

  return group;
}

export function buildCorrectiveLensGeometry(
  diopter: number,
  isLowPower = false
): THREE.BufferGeometry {
  const radius = 1.12;
  const segments = isLowPower ? 12 : 20;
  const radialSegs = isLowPower ? 24 : 38;
  const points: THREE.Vector2[] = [];

  const clampedD = THREE.MathUtils.clamp(diopter, -5, 5);
  const strength = Math.abs(clampedD) / 5;

  const isConcave = clampedD < -0.05;
  const isConvex = clampedD > 0.05;

  const centerHalfThick = isConcave
    ? 0.04
    : isConvex
    ? 0.09 + strength * 0.24
    : 0.06;
  const edgeHalfThick = isConcave
    ? 0.09 + strength * 0.28
    : isConvex
    ? 0.045
    : 0.06;

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const r = t * radius;
    const halfT = THREE.MathUtils.lerp(centerHalfThick, edgeHalfThick, t * t);
    points.push(new THREE.Vector2(r, -halfT));
  }
  for (let i = segments; i >= 0; i--) {
    const t = i / segments;
    const r = t * radius;
    const halfT = THREE.MathUtils.lerp(centerHalfThick, edgeHalfThick, t * t);
    points.push(new THREE.Vector2(r, halfT));
  }

  const geo = new THREE.LatheGeometry(points, radialSegs);
  geo.rotateZ(-Math.PI / 2);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Draws the live projected image onto the 3D Retina Projection Screen Canvas.
 * Proportionally scales from 512px reference so mobile uses 256px (4x faster CPU blur!).
 */
export function renderRetinaProjectionCanvas(
  canvas: HTMLCanvasElement,
  blurRadius: number,
  isSharp: boolean,
  statusShort: string
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = 512;
  const h = 512;
  const scale = canvas.width / 512;

  ctx.save();
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.clearRect(0, 0, w, h);

  // Warm dark-amber retina sensor background
  const bgGrad = ctx.createRadialGradient(
    w * 0.5,
    h * 0.5,
    24,
    w * 0.5,
    h * 0.5,
    w * 0.62
  );
  bgGrad.addColorStop(0, '#3b1d0c');
  bgGrad.addColorStop(0.7, '#27130a');
  bgGrad.addColorStop(1, '#1a0d08');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Subtle concentric fovea target rings behind projection
  ctx.save();
  ctx.strokeStyle = isSharp
    ? 'rgba(52, 211, 153, 0.35)'
    : 'rgba(251, 113, 133, 0.28)';
  ctx.lineWidth = 2;
  for (const r of [64, 128, 192]) {
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.5, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  // Clip inner retina viewport so blur never bleeds over header/footer labels
  const padX = 34;
  const topBarH = 68;
  const botBarH = 56;
  const viewX = padX;
  const viewY = topBarH + 10;
  const viewW = w - padX * 2;
  const viewH = h - topBarH - botBarH - 20;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(viewX, viewY, viewW, viewH, 20);
  ctx.clip();

  // Subtle dark projection screen interior
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(viewX, viewY, viewW, viewH);

  // Helper to draw the projected Classroom Blackboard inverted (as on real retina!)
  const drawProjectedBoard = (offsetX: number, offsetY: number, alpha: number) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    // Center on viewport and flip vertically (real eye lenses invert images on the retina)
    ctx.translate(viewX + viewW / 2 + offsetX, viewY + viewH / 2 + offsetY);
    ctx.scale(1, -1);

    const bw = viewW * 0.78;
    const bh = viewH * 0.8;

    // Green chalkboard surface
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.roundRect(-bw / 2, -bh / 2, bw, bh, 12);
    ctx.fill();

    // Golden wooden border
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 10;
    ctx.strokeRect(-bw / 2 + 5, -bh / 2 + 5, bw - 10, bh - 10);

    // Bright yellow sun in corner
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(bw * 0.28, -bh * 0.27, 24, 0, Math.PI * 2);
    ctx.fill();
    // Sun rays
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(
        bw * 0.28 + Math.cos(a) * 29,
        -bh * 0.27 + Math.sin(a) * 29
      );
      ctx.lineTo(
        bw * 0.28 + Math.cos(a) * 37,
        -bh * 0.27 + Math.sin(a) * 37
      );
      ctx.stroke();
    }

    // Main text "IPA 5", "CAHAYA", "A B C"
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 64px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('IPA 5', -12, -bh * 0.08);

    ctx.fillStyle = '#bae6fd';
    ctx.font = '700 34px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('CAHAYA', 0, bh * 0.14);

    ctx.fillStyle = '#fef08a';
    ctx.font = '800 30px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('A  B  C', 0, bh * 0.32);

    ctx.restore();
  };

  const blurPx = isSharp ? 0 : Math.min(22, Math.max(2.5, blurRadius * 26));
  const supportsFilter = typeof ctx.filter === 'string';

  if (blurPx <= 0.2) {
    drawProjectedBoard(0, 0, 1);
  } else {
    if (supportsFilter) {
      ctx.save();
      ctx.filter = `blur(${blurPx.toFixed(1)}px)`;
      drawProjectedBoard(0, 0, 0.96);
      ctx.restore();
    } else {
      // Multi-pass bokeh fallback if browser lacks CanvasRenderingContext2D.filter
      const spread = blurPx * 0.85;
      drawProjectedBoard(0, 0, 0.28);
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        drawProjectedBoard(
          Math.cos(ang) * spread,
          Math.sin(ang) * spread,
          0.14
        );
      }
    }
  }
  ctx.restore();

  // Crisp Retina Viewport Border (Emerald = Sharp, Rose = Blurry)
  ctx.strokeStyle = isSharp ? '#34d399' : '#fb7185';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.roundRect(viewX, viewY, viewW, viewH, 20);
  ctx.stroke();

  // Top Header Strip (Always razor sharp so students read status easily)
  ctx.fillStyle = isSharp ? '#065f46' : '#9f1239';
  ctx.fillRect(0, 0, w, topBarH);
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 28px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    isSharp ? `RETINA: ${statusShort}` : `RETINA: ${statusShort}`,
    w * 0.5,
    topBarH * 0.5 + 1
  );

  // Bottom Educational Strip
  ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
  ctx.fillRect(0, h - botBarH, w, botBarH);
  ctx.fillStyle = '#fde68a';
  ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    'Gambar terbalik di retina → otak membaliknya tegak',
    w * 0.5,
    h - botBarH * 0.5
  );
  ctx.restore();
}

export interface EyeAssemblyRefs {
  root: THREE.Group;
  retinaScreenGroup: THREE.Group;
  retinaProjectionCanvas: HTMLCanvasElement;
  retinaProjectionTex: THREE.CanvasTexture;
  retinaFrameMat: THREE.MeshStandardMaterial;
  eyeOutlineGroup: THREE.Group;
  foveaSpot: THREE.Mesh;
  blurDisc: THREE.Mesh;
  crystallineLens: THREE.Mesh;
  corneaMesh: THREE.Mesh;
  correctiveLensGroup: THREE.Group;
  correctiveLensGlass: THREE.Mesh;
  targetStimulusGroup: THREE.Group;
}

export function createEyeLabAssembly(ctx: ProceduralAssetContext): EyeAssemblyRefs {
  const root = new THREE.Group();
  const eyeCenterY = 2.65;

  const railDarkMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.42,
    metalness: 0.45,
  });
  const brushedSilver = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.22,
    metalness: 0.85,
  });
  const accentBlue = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.34,
    metalness: 0.25,
  });
  const accentOrange = new THREE.MeshStandardMaterial({
    color: 0xea580c,
    roughness: 0.34,
    metalness: 0.22,
  });

  // 1. Open Optical Bench Rail Track on the oak laboratory table (y = 0)
  // Replaces the bulky pedestal & eyeball shell so students see every optical part cleanly!
  const trackLen = 9.0;
  const trackBase = new THREE.Mesh(
    new THREE.BoxGeometry(trackLen, 0.22, 1.35),
    railDarkMat
  );
  trackBase.position.set(-0.6, 0.11, 0);
  trackBase.receiveShadow = true;
  trackBase.castShadow = true;
  root.add(trackBase);

  for (const zOff of [-0.46, 0.46]) {
    const steelBar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.045, trackLen - 0.2, 14),
      brushedSilver
    );
    steelBar.rotation.z = Math.PI / 2;
    steelBar.position.set(-0.6, 0.25, zOff);
    root.add(steelBar);
  }

  // Soft contact shadow directly under the optical eye rail
  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(11.8, 3.8),
    new THREE.MeshBasicMaterial({
      map: createContactShadowTexture(),
      transparent: true,
      depthWrite: false,
      opacity: 0.55,
    })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.set(-0.6, 0.012, 0);
  root.add(shadowPlane);

  // Helper to mount an open laboratory stand post from track (y=0.22) up to optical ring
  const createStandBaseAndPost = (
    x: number,
    postHeight: number,
    collarMat: THREE.Material
  ) => {
    const g = new THREE.Group();
    g.position.set(x, 0, 0);

    const sliderBlock = new THREE.Mesh(
      new THREE.BoxGeometry(0.56, 0.26, 1.18),
      collarMat
    );
    sliderBlock.position.set(0, 0.32, 0);
    sliderBlock.castShadow = true;
    sliderBlock.receiveShadow = true;
    g.add(sliderBlock);

    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.065, postHeight, 16),
      brushedSilver
    );
    post.position.set(0, 0.42 + postHeight * 0.5, 0);
    post.castShadow = true;
    g.add(post);

    return g;
  };

  // 2. Open See-Through Cornea Meniscus at x = -2.12 (lightweight glass: zero transmission pass!)
  const low = ctx.isSoftwareGl || ctx.isLowPower;
  const corneaStand = createStandBaseAndPost(-2.12, 1.05, accentBlue);
  root.add(corneaStand);

  const corneaRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.02, 0.042, 10, low ? 26 : 42),
    accentBlue
  );
  corneaRing.rotation.y = Math.PI / 2;
  corneaRing.position.set(-2.12, eyeCenterY, 0);
  root.add(corneaRing);

  const corneaGeo = new THREE.SphereGeometry(
    1.12,
    low ? 20 : 32,
    low ? 14 : 20,
    0,
    Math.PI * 2,
    0,
    Math.PI * 0.38
  );
  corneaGeo.rotateZ(Math.PI / 2);
  const corneaMat = new THREE.MeshStandardMaterial({
    color: 0xbae6fd,
    roughness: 0.08,
    metalness: 0.15,
    transparent: true,
    opacity: 0.32,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const corneaMesh = new THREE.Mesh(corneaGeo, corneaMat);
  corneaMesh.position.set(-1.38, eyeCenterY, 0);
  corneaMesh.renderOrder = 8;
  root.add(corneaMesh);

  // 3. Open Iris Ring at x = -1.72 (slim sky-blue ring so pupil stays wide open)
  const irisTex = createIrisTexture(ctx.maxAnisotropy);
  const irisRing = new THREE.Mesh(
    new THREE.RingGeometry(0.46, 0.96, low ? 24 : 36),
    new THREE.MeshStandardMaterial({
      map: irisTex,
      roughness: 0.42,
      metalness: 0.06,
      side: THREE.DoubleSide,
    })
  );
  irisRing.rotation.y = -Math.PI / 2;
  irisRing.position.set(-1.72, eyeCenterY, 0);
  root.add(irisRing);

  // 4. Crystal-Clear Crystalline Lens (Lensa Mata) at x = -1.35 on open stand
  const lensStand = createStandBaseAndPost(-1.35, 1.15, accentBlue);
  root.add(lensStand);

  const lensRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.84, 0.04, 10, low ? 26 : 42),
    brushedSilver
  );
  lensRing.rotation.y = Math.PI / 2;
  lensRing.position.set(-1.35, eyeCenterY, 0);
  root.add(lensRing);

  const lensGeo = buildCorrectiveLensGeometry(3.4, low);
  lensGeo.scale(1.15, 0.72, 0.72);
  const crystallineLensMat = new THREE.MeshStandardMaterial({
    color: 0x7dd3fc,
    roughness: 0.1,
    metalness: 0.18,
    transparent: true,
    opacity: 0.48,
    depthWrite: false,
  });
  const crystallineLens = new THREE.Mesh(lensGeo, crystallineLensMat);
  crystallineLens.position.set(-1.35, eyeCenterY, 0);
  crystallineLens.renderOrder = 6;
  root.add(crystallineLens);

  // 5. OPEN, UNOBSTRUCTED 3D RETINA PROJECTION SCREEN (slides to optics.retinaX!)
  const retinaScreenGroup = new THREE.Group();
  retinaScreenGroup.position.set(2.1, 0, 0);
  root.add(retinaScreenGroup);

  const retinaCarriage = createStandBaseAndPost(0, 0.85, accentOrange);
  retinaScreenGroup.add(retinaCarriage);

  const screenW = 2.45;
  const screenH = 2.65;
  const frameThick = 0.11;
  const frameDepth = 0.14;

  const retinaFrameMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    roughness: 0.32,
    metalness: 0.25,
  });

  // Outer sleek frame around the 3D Retina Projection Screen
  const topFrame = new THREE.Mesh(
    new THREE.BoxGeometry(frameDepth, frameThick, screenW + frameThick * 2),
    retinaFrameMat
  );
  topFrame.position.set(0, eyeCenterY + screenH / 2 + frameThick / 2, 0);
  topFrame.castShadow = true;

  const botFrame = new THREE.Mesh(
    new THREE.BoxGeometry(frameDepth, frameThick, screenW + frameThick * 2),
    retinaFrameMat
  );
  botFrame.position.set(0, eyeCenterY - screenH / 2 - frameThick / 2, 0);
  botFrame.castShadow = true;

  const leftFrame = new THREE.Mesh(
    new THREE.BoxGeometry(frameDepth, screenH, frameThick),
    retinaFrameMat
  );
  leftFrame.position.set(0, eyeCenterY, -screenW / 2 - frameThick / 2);
  leftFrame.castShadow = true;

  const rightFrame = new THREE.Mesh(
    new THREE.BoxGeometry(frameDepth, screenH, frameThick),
    retinaFrameMat
  );
  rightFrame.position.set(0, eyeCenterY, screenW / 2 + frameThick / 2);
  rightFrame.castShadow = true;

  retinaScreenGroup.add(topFrame, botFrame, leftFrame, rightFrame);

  // Dynamic live Retina Projection Canvas & Texture (256px on mobile = 4x faster blur redraw!)
  const retinaProjectionCanvas = document.createElement('canvas');
  const retinaSize = low ? 256 : 512;
  retinaProjectionCanvas.width = retinaSize;
  retinaProjectionCanvas.height = retinaSize;
  renderRetinaProjectionCanvas(retinaProjectionCanvas, 0, true, 'TAJAM ✓');

  const retinaProjectionTex = new THREE.CanvasTexture(retinaProjectionCanvas);
  retinaProjectionTex.colorSpace = THREE.SRGBColorSpace;
  retinaProjectionTex.anisotropy = ctx.maxAnisotropy;

  const retinaScreenMat = new THREE.MeshStandardMaterial({
    map: retinaProjectionTex,
    emissiveMap: retinaProjectionTex,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.48,
    roughness: 0.38,
    metalness: 0.02,
  });

  // Front face (-X, facing the incoming light rays & front-3/4 camera)
  const retinaFrontPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(screenW, screenH),
    retinaScreenMat
  );
  retinaFrontPlane.rotation.y = -Math.PI / 2;
  retinaFrontPlane.position.set(-0.04, eyeCenterY, 0);
  retinaScreenGroup.add(retinaFrontPlane);

  // Back face (+X, translucent rear-projection view when students orbit behind!)
  const retinaBackPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(screenW, screenH),
    retinaScreenMat
  );
  retinaBackPlane.rotation.y = Math.PI / 2;
  retinaBackPlane.position.set(0.04, eyeCenterY, 0);
  retinaScreenGroup.add(retinaBackPlane);

  // Crisp Fovea crosshair ring & live optical focus/blur spot right on the front Retina surface
  const foveaSpot = new THREE.Mesh(
    new THREE.RingGeometry(0.09, 0.15, 20),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    })
  );
  foveaSpot.rotation.y = -Math.PI / 2;
  foveaSpot.position.set(-0.055, eyeCenterY, 0);
  foveaSpot.renderOrder = 9;
  retinaScreenGroup.add(foveaSpot);

  const blurDisc = new THREE.Mesh(
    new THREE.CircleGeometry(0.14, 24),
    new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.72,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  blurDisc.rotation.y = -Math.PI / 2;
  blurDisc.position.set(-0.062, eyeCenterY, 0);
  blurDisc.renderOrder = 10;
  retinaScreenGroup.add(blurDisc);

  // Compact Optic Nerve cable tucked below the bottom-back edge of the Retina frame (never blocks screen!)
  const nerveCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.08, eyeCenterY - screenH / 2 - 0.1, 0),
    new THREE.Vector3(0.75, eyeCenterY - screenH / 2 - 0.28, -0.18),
    new THREE.Vector3(1.55, eyeCenterY - screenH / 2 - 0.42, -0.32),
  ]);
  const opticNerve = new THREE.Mesh(
    new THREE.TubeGeometry(nerveCurve, 14, 0.16, 10, false),
    new THREE.MeshStandardMaterial({
      color: 0xfcd34d,
      roughness: 0.45,
      metalness: 0.05,
    })
  );
  retinaScreenGroup.add(opticNerve);

  // 6. Optional Ultra-Thin Non-Blocking Eye Outline Guide (toggled by cutawayMode)
  const eyeOutlineGroup = new THREE.Group();
  eyeOutlineGroup.position.set(0, eyeCenterY, 0);
  root.add(eyeOutlineGroup);

  const outlineMat = new THREE.LineDashedMaterial({
    color: 0x94a3b8,
    dashSize: 0.22,
    gapSize: 0.16,
    transparent: true,
    opacity: 0.55,
  });

  const profilePts: THREE.Vector3[] = [];
  const segs = low ? 36 : 56;
  for (let i = 0; i <= segs; i++) {
    const a = (i / segs) * Math.PI * 2;
    profilePts.push(new THREE.Vector3(Math.cos(a) * 2.1, Math.sin(a) * 1.92, 0));
  }
  const profileLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(profilePts),
    outlineMat
  );
  profileLine.computeLineDistances();
  eyeOutlineGroup.add(profileLine);

  const equatorPts: THREE.Vector3[] = [];
  for (let i = 0; i <= segs; i++) {
    const a = (i / segs) * Math.PI * 2;
    equatorPts.push(new THREE.Vector3(Math.cos(a) * 2.1, 0, Math.sin(a) * 1.92));
  }
  const equatorLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(equatorPts),
    outlineMat
  );
  equatorLine.computeLineDistances();
  eyeOutlineGroup.add(equatorLine);

  // 7. Friendly Eyeglass-Styled Corrective Lens Frame at x = -3.35
  const correctiveLensGroup = new THREE.Group();
  correctiveLensGroup.position.set(-3.35, eyeCenterY, 0);
  root.add(correctiveLensGroup);

  const glassesFrameMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.32,
    metalness: 0.45,
  });

  const trialRim = new THREE.Mesh(
    new THREE.TorusGeometry(1.18, 0.085, 12, low ? 28 : 44),
    glassesFrameMat
  );
  trialRim.rotation.y = Math.PI / 2;
  correctiveLensGroup.add(trialRim);

  const templeArm = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 0.09, 0.08),
    glassesFrameMat
  );
  templeArm.position.set(0.36, 0.36, -1.16);
  correctiveLensGroup.add(templeArm);

  const lensPost = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 2.25, 12),
    brushedSilver
  );
  lensPost.position.set(0, -1.55, 0);
  correctiveLensGroup.add(lensPost);

  const correctiveGlassMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.08,
    metalness: 0.16,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const correctiveLensGlass = new THREE.Mesh(
    buildCorrectiveLensGeometry(-2.5, low),
    correctiveGlassMat
  );
  correctiveLensGlass.renderOrder = 7;
  correctiveLensGroup.add(correctiveLensGlass);

  // 8. Classroom Blackboard Target ("IPA 5 · CAHAYA" + Sun) on the left
  const targetStimulusGroup = new THREE.Group();
  targetStimulusGroup.position.set(-6.8, eyeCenterY, 0);
  root.add(targetStimulusGroup);

  const boardCanvas = document.createElement('canvas');
  boardCanvas.width = 256;
  boardCanvas.height = 320;
  const bCtx = boardCanvas.getContext('2d')!;
  bCtx.fillStyle = '#14532d';
  bCtx.fillRect(0, 0, 256, 320);
  bCtx.strokeStyle = '#d97706';
  bCtx.lineWidth = 14;
  bCtx.strokeRect(7, 7, 242, 306);

  bCtx.fillStyle = '#fde047';
  bCtx.beginPath();
  bCtx.arc(200, 62, 22, 0, Math.PI * 2);
  bCtx.fill();

  bCtx.fillStyle = '#ffffff';
  bCtx.textAlign = 'center';
  bCtx.font = '700 62px "Plus Jakarta Sans", sans-serif';
  bCtx.fillText('IPA 5', 120, 142);
  bCtx.font = '600 32px "Plus Jakarta Sans", sans-serif';
  bCtx.fillStyle = '#bae6fd';
  bCtx.fillText('CAHAYA', 128, 198);
  bCtx.fillStyle = '#fef08a';
  bCtx.font = '700 28px "Plus Jakarta Sans", sans-serif';
  bCtx.fillText('A B C', 128, 252);

  const boardTex = new THREE.CanvasTexture(boardCanvas);
  boardTex.colorSpace = THREE.SRGBColorSpace;
  boardTex.anisotropy = ctx.maxAnisotropy;

  const woodenFrame = new THREE.MeshStandardMaterial({
    color: 0xb45309,
    roughness: 0.65,
  });

  const chartBoard = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 1.85, 1.48),
    [
      new THREE.MeshStandardMaterial({ map: boardTex, roughness: 0.55 }),
      woodenFrame,
      woodenFrame,
      woodenFrame,
      woodenFrame,
      woodenFrame,
    ]
  );
  chartBoard.castShadow = true;
  targetStimulusGroup.add(chartBoard);

  const chartPost = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.055, 1.85, 12),
    woodenFrame
  );
  chartPost.position.y = -1.75;
  targetStimulusGroup.add(chartPost);

  const chartFoot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.5, 0.12, 24),
    woodenFrame
  );
  chartFoot.position.y = -2.59;
  targetStimulusGroup.add(chartFoot);

  return {
    root,
    retinaScreenGroup,
    retinaProjectionCanvas,
    retinaProjectionTex,
    retinaFrameMat,
    eyeOutlineGroup,
    foveaSpot,
    blurDisc,
    crystallineLens,
    corneaMesh,
    correctiveLensGroup,
    correctiveLensGlass,
    targetStimulusGroup,
  };
}
