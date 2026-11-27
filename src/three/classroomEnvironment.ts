import * as THREE from 'three';

/**
 * Procedural warm oak/teak wood-grain laboratory workbench tabletop texture with subtle measurement grid.
 */
function createLabTableTexture(
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

  const baseGrad = ctx.createLinearGradient(0, 0, 1024, 0);
  baseGrad.addColorStop(0, '#6b472a');
  baseGrad.addColorStop(0.5, '#7c5332');
  baseGrad.addColorStop(1, '#634025');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, 1024, 1024);

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
 * Procedural tiled school laboratory terrazzo floor texture.
 */
function createClassroomFloorTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(0.5, 0.5);

  // Dark charcoal grout seams
  ctx.fillStyle = '#1f2937';
  ctx.fillRect(0, 0, 512, 512);

  // Distinct dark-gray checkered tile motif (kotak-kotak abu-abu tua)
  const tile = 128;
  for (let x = 0; x < 512; x += tile) {
    for (let y = 0; y < 512; y += tile) {
      const alt = (x / tile + y / tile) % 2 === 0;
      ctx.fillStyle = alt ? '#374151' : '#4b5563';
      ctx.fillRect(x + 3, y + 3, tile - 6, tile - 6);

      // Subtle inner tile bevel highlight for realistic ceramic floor read
      ctx.strokeStyle = alt
        ? 'rgba(255, 255, 255, 0.06)'
        : 'rgba(255, 255, 255, 0.09)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 6, y + 6, tile - 12, tile - 12);
    }
  }

  for (let i = 0; i < 160; i++) {
    ctx.fillStyle =
      i % 2 === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.14)';
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 4, 4);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(14, 18);
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Procedural warm wood-motif wall paneling wallpaper ("wallpaper motif kayu")
 * covering the lower half of all four laboratory walls.
 */
function createWoodWallpaperTexture(
  maxAnisotropy: number,
  isLowPower = false
): THREE.CanvasTexture {
  const size = isLowPower ? 256 : 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const s = size / 512;
  ctx.scale(s, s);

  // Warm honey-oak vertical wood wallpaper base
  ctx.fillStyle = '#b48252';
  ctx.fillRect(0, 0, 512, 512);

  const plankCount = 8;
  const plankW = 512 / plankCount;
  const tones = [
    '#b88656',
    '#aa7849',
    '#be8e5e',
    '#a37144',
    '#b58353',
    '#ad7b4c',
    '#c09060',
    '#a77547',
  ];

  for (let p = 0; p < plankCount; p++) {
    const px = p * plankW;
    ctx.fillStyle = tones[p % tones.length];
    ctx.fillRect(px, 0, plankW, 512);

    // Subtle vertical wood grain streaks & soft cathedral waves
    const streaks = isLowPower ? 14 : 26;
    for (let i = 0; i < streaks; i++) {
      const gx = px + 3 + Math.random() * (plankW - 6);
      const gy = Math.random() * 512;
      const gh = 70 + Math.random() * 240;
      ctx.fillStyle =
        i % 3 === 0 ? 'rgba(72, 42, 18, 0.14)' : 'rgba(255, 232, 198, 0.09)';
      ctx.fillRect(gx, gy, 1.5 + Math.random() * 2, gh);
    }

    // Subtle warm wood-panel bevel groove between vertical planks
    ctx.fillStyle = 'rgba(62, 34, 14, 0.34)';
    ctx.fillRect(px, 0, 2.2, 512);
    ctx.fillStyle = 'rgba(255, 236, 206, 0.14)';
    ctx.fillRect(px + 2.2, 0, 1.5, 512);
  }

  // Delicate horizontal wallpaper panel accent band near top & bottom
  ctx.fillStyle = 'rgba(62, 34, 14, 0.14)';
  ctx.fillRect(0, 0, 512, 14);
  ctx.fillRect(0, 496, 512, 16);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(9, 1);
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Crisp educational school wall poster: "BAGIAN-BAGIAN MATA MANUSIA"
 * Shows a colorful anatomical cross-section of the eye with clear Bahasa Indonesia labels.
 */
function createEyeAnatomyPosterTexture(
  maxAnisotropy: number,
  isLowPower = false
): THREE.CanvasTexture {
  const w = isLowPower ? 512 : 768;
  const h = isLowPower ? 640 : 960;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  const s = w / 768;
  ctx.scale(s, s);

  // Cream educational chart paper background
  ctx.fillStyle = '#fefce8';
  ctx.fillRect(0, 0, 768, 960);

  // Outer poster border
  ctx.strokeStyle = '#0369a1';
  ctx.lineWidth = 12;
  ctx.strokeRect(18, 18, 732, 924);
  ctx.strokeStyle = '#bae6fd';
  ctx.lineWidth = 4;
  ctx.strokeRect(32, 32, 704, 896);

  // Header banner
  ctx.fillStyle = '#0c4a6e';
  ctx.fillRect(34, 34, 700, 128);
  ctx.fillStyle = '#fde047';
  ctx.font = '800 32px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('POSTER IPA SD KELAS 5', 384, 82);
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 42px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('BAGIAN-BAGIAN MATA', 384, 134);

  // Center of eye cross-section
  const cx = 365;
  const cy = 475;
  const R = 185;

  // Outer sclera (white shell)
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fillStyle = '#f8fafc';
  ctx.fill();
  ctx.lineWidth = 14;
  ctx.strokeStyle = '#cbd5e1';
  ctx.stroke();

  // Choroid layer (red-brown middle ring)
  ctx.beginPath();
  ctx.arc(cx, cy, R - 13, -Math.PI * 0.78, Math.PI * 0.78);
  ctx.strokeStyle = '#b91c1c';
  ctx.lineWidth = 11;
  ctx.stroke();

  // Retina inner golden-amber lining
  ctx.beginPath();
  ctx.arc(cx, cy, R - 24, -Math.PI * 0.72, Math.PI * 0.72);
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 10;
  ctx.stroke();

  // Vitreous humor soft tint
  ctx.beginPath();
  ctx.arc(cx, cy, R - 29, 0, Math.PI * 2);
  ctx.fillStyle = '#fef3c7';
  ctx.fill();

  // Optic nerve exiting to the right
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.moveTo(cx + R - 18, cy - 34);
  ctx.lineTo(cx + R + 90, cy - 48);
  ctx.lineTo(cx + R + 90, cy + 28);
  ctx.lineTo(cx + R - 18, cy + 24);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Optic nerve internal fiber lines
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 3;
  for (const oy of [-20, -4, 10]) {
    ctx.beginPath();
    ctx.moveTo(cx + R - 10, cy + oy);
    ctx.lineTo(cx + R + 82, cy + oy - 6);
    ctx.stroke();
  }

  // Cornea bulge on the left side
  ctx.beginPath();
  ctx.arc(cx - 125, cy, 118, Math.PI * 0.62, Math.PI * 1.38);
  ctx.fillStyle = 'rgba(125, 211, 252, 0.42)';
  ctx.fill();
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#0284c7';
  ctx.stroke();

  // Upper & lower Iris (colored curtain)
  ctx.fillStyle = '#0ea5e9';
  ctx.strokeStyle = '#0369a1';
  ctx.lineWidth = 4;
  // Upper iris
  ctx.beginPath();
  ctx.roundRect(cx - 170, cy - 118, 22, 80, 8);
  ctx.fill();
  ctx.stroke();
  // Lower iris
  ctx.beginPath();
  ctx.roundRect(cx - 170, cy + 38, 22, 80, 8);
  ctx.fill();
  ctx.stroke();

  // Pupil dark aperture indicator
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(cx - 165, cy - 36, 12, 72);

  // Crystalline Lens (biconvex translucent blue-white oval)
  ctx.beginPath();
  ctx.ellipse(cx - 110, cy, 34, 82, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#bae6fd';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#0284c7';
  ctx.stroke();

  // Subtle light rays entering from left focusing onto retina
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 3.5;
  ctx.setLineDash([8, 6]);
  for (const ry of [-44, 0, 44]) {
    ctx.beginPath();
    ctx.moveTo(76, cy + ry);
    ctx.lineTo(cx - 110, cy + ry * 0.85);
    ctx.lineTo(cx + R - 26, cy);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Upper & lower eye muscles
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.roundRect(cx - 40, cy - R - 20, 125, 22, 10);
  ctx.roundRect(cx - 40, cy + R - 2, 125, 22, 10);
  ctx.fill();
  ctx.restore();

  // Helper to draw clean callout labels
  const drawCallout = (
    tx: number,
    ty: number,
    lx: number,
    ly: number,
    title: string,
    sub: string,
    align: CanvasTextAlign
  ) => {
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(lx, ly);
    ctx.stroke();

    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(tx, ty, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.textAlign = align;
    ctx.fillStyle = '#0f172a';
    ctx.font = '800 25px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(title, lx + (align === 'left' ? 8 : -8), ly + 4);
    ctx.fillStyle = '#475569';
    ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(sub, lx + (align === 'left' ? 8 : -8), ly + 26);
  };

  drawCallout(cx - 224, cy - 42, 165, 240, 'Kornea', 'Pintu cahaya', 'right');
  drawCallout(cx - 158, cy - 86, 260, 200, 'Iris', 'Warna mata', 'left');
  drawCallout(cx - 158, cy + 8, 175, 675, 'Pupil', 'Lubang cahaya', 'right');
  drawCallout(cx - 110, cy + 72, 275, 735, 'Lensa Mata', 'Fokuskan sinar', 'left');
  drawCallout(cx + 150, cy - 95, 575, 235, 'Retina', 'Layar bayangan', 'left');
  drawCallout(cx + R + 55, cy - 10, 565, 675, 'Saraf Optik', 'Kirim ke otak', 'left');

  // Footer summary strip
  ctx.fillStyle = '#e0f2fe';
  ctx.fillRect(46, 825, 676, 86);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 3;
  ctx.strokeRect(46, 825, 676, 86);
  ctx.fillStyle = '#0c4a6e';
  ctx.textAlign = 'center';
  ctx.font = '700 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Cahaya masuk melalui Kornea & Pupil → difokuskan Lensa', 384, 860);
  ctx.fillText('tepat di Retina agar benda terlihat jelas!', 384, 892);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Calm afternoon schoolyard vista seen through the laboratory windows (low-glare so indoor 3D rays stay vibrant).
 */
function createWindowViewTexture(
  maxAnisotropy: number,
  isLowPower = false
): THREE.CanvasTexture {
  const size = isLowPower ? 256 : 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const s = size / 512;
  ctx.scale(s, s);

  // Soft muted daytime sky (calibrated so it doesn't overpower the dark optical room)
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 512);
  skyGrad.addColorStop(0, '#5b92c7');
  skyGrad.addColorStop(0.55, '#9ec5e8');
  skyGrad.addColorStop(0.75, '#cde2f2');
  skyGrad.addColorStop(1, '#4c7c57');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 512, 512);

  // Soft clouds
  ctx.fillStyle = 'rgba(255, 255, 255, 0.58)';
  const drawCloud = (x: number, y: number, r: number) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.arc(x + r * 0.85, y - r * 0.2, r * 0.8, 0, Math.PI * 2);
    ctx.arc(x + r * 1.65, y, r * 0.72, 0, Math.PI * 2);
    ctx.fill();
  };
  drawCloud(85, 115, 34);
  drawCloud(310, 95, 28);

  // Distant neighboring school roof silhouette
  ctx.fillStyle = '#9a4e36';
  ctx.beginPath();
  ctx.moveTo(20, 345);
  ctx.lineTo(140, 295);
  ctx.lineTo(265, 345);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#d6d3d1';
  ctx.fillRect(42, 345, 200, 75);

  // Schoolyard green trees & bushes
  const treeColors = ['#2d6a4f', '#40916c', '#1b4332', '#52b788'];
  const puffs: Array<[number, number, number, number]> = [
    [60, 395, 58, 0],
    [135, 385, 48, 1],
    [290, 370, 68, 2],
    [370, 345, 78, 0],
    [455, 378, 66, 1],
    [410, 415, 55, 3],
  ];
  for (const [tx, ty, tr, ci] of puffs) {
    ctx.fillStyle = treeColors[ci];
    ctx.beginPath();
    ctx.arc(tx, ty, tr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Courtyard lawn strip
  ctx.fillStyle = '#3b7346';
  ctx.fillRect(0, 425, 512, 87);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

/**
 * School laboratory entrance door plaque ("PINTU MASUK · LAB IPA").
 */
function createDoorPlaqueTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 96;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0c4a6e';
  ctx.fillRect(0, 0, 320, 96);
  ctx.strokeStyle = '#fde047';
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, 308, 84);

  ctx.fillStyle = '#fde047';
  ctx.font = '800 20px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PINTU KELUAR', 160, 31);

  ctx.fillStyle = '#ffffff';
  ctx.font = '800 30px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('LAB IPA', 160, 66);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Classic classroom analog wall clock face.
 */
function createWallClockTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const c = size / 2;

  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.arc(c, c, 120, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const r1 = i % 3 === 0 ? 90 : 98;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = i % 3 === 0 ? 6 : 3;
    ctx.beginPath();
    ctx.moveTo(c + Math.cos(a) * r1, c + Math.sin(a) * r1);
    ctx.lineTo(c + Math.cos(a) * 112, c + Math.sin(a) * 112);
    ctx.stroke();
  }

  // Hour & minute hands (09:10 classroom time)
  ctx.strokeStyle = '#0f172a';
  ctx.lineCap = 'round';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(c, c);
  ctx.lineTo(c - 54, c - 10);
  ctx.stroke();

  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(c, c);
  ctx.lineTo(c + 64, c - 46);
  ctx.stroke();

  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.arc(c, c, 8, 0, Math.PI * 2);
  ctx.fill();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Builds a realistic multi-pane School Laboratory Window with recessed frame, mullions,
 * windowsill, outdoor courtyard view, glass reflection sheen, and top valance.
 */
function createLabWindowAssembly(
  width: number,
  height: number,
  windowViewTex: THREE.CanvasTexture,
  frameMat: THREE.Material,
  sillMat: THREE.Material,
  glassMat: THREE.Material,
  addPlant = false
): THREE.Group {
  const group = new THREE.Group();

  // Outdoor sky/courtyard view recessed slightly behind mullions
  const backdrop = new THREE.Mesh(
    new THREE.PlaneGeometry(width - 0.34, height - 0.34),
    new THREE.MeshBasicMaterial({ map: windowViewTex })
  );
  backdrop.position.z = 0.02;
  group.add(backdrop);

  // Subtle translucent glass pane with specular sheen
  const glassPane = new THREE.Mesh(
    new THREE.PlaneGeometry(width - 0.32, height - 0.32),
    glassMat
  );
  glassPane.position.z = 0.08;
  group.add(glassPane);

  // Outer window casing frame (top, bottom, left, right)
  const frameDepth = 0.28;
  const bar = 0.2;
  const topBar = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.16, bar, frameDepth),
    frameMat
  );
  topBar.position.set(0, height / 2, frameDepth / 2);

  const botBar = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.16, bar, frameDepth),
    frameMat
  );
  botBar.position.set(0, -height / 2, frameDepth / 2);

  const leftBar = new THREE.Mesh(
    new THREE.BoxGeometry(bar, height + bar, frameDepth),
    frameMat
  );
  leftBar.position.set(-width / 2, 0, frameDepth / 2);

  const rightBar = leftBar.clone();
  rightBar.position.x = width / 2;

  // Interior muntin / mullion grid (2 vertical + 1 horizontal transom)
  const mullionV1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.11, height - 0.2, 0.16),
    frameMat
  );
  mullionV1.position.set(-width * 0.16, 0, 0.11);

  const mullionV2 = mullionV1.clone();
  mullionV2.position.x = width * 0.16;

  const mullionH = new THREE.Mesh(
    new THREE.BoxGeometry(width - 0.2, 0.12, 0.16),
    frameMat
  );
  mullionH.position.set(0, height * 0.18, 0.11);

  // Extended lab windowsill ledge
  const sill = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.45, 0.18, 0.58),
    sillMat
  );
  sill.position.set(0, -height / 2 - 0.08, 0.28);

  // Simple rolled-up school roller blind housing at top
  const blindMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.78,
    metalness: 0.05,
  });
  const blindRoll = new THREE.Mesh(
    new THREE.BoxGeometry(width - 0.1, 0.34, 0.22),
    blindMat
  );
  blindRoll.position.set(0, height / 2 - 0.24, 0.22);

  group.add(
    topBar,
    botBar,
    leftBar,
    rightBar,
    mullionV1,
    mullionV2,
    mullionH,
    sill,
    blindRoll
  );

  // Small potted science plant on the windowsill for warm classroom life
  if (addPlant) {
    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.17, 0.38, 12),
      new THREE.MeshStandardMaterial({ color: 0xc2410c, roughness: 0.78 })
    );
    pot.position.set(width * 0.3, -height / 2 + 0.2, 0.32);
    const foliage = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.32, 0),
      new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.72 })
    );
    foliage.position.set(width * 0.3, -height / 2 + 0.54, 0.32);
    group.add(pot, foliage);
  }

  return group;
}

/**
 * Builds a complete School Laboratory Entrance Door ("Pintu Masuk LAB IPA")
 * grounded at y = 0 (bottom-center pivot).
 */
function createLabDoorAssembly(
  maxAnisotropy: number,
  frameMat: THREE.Material,
  glassMat: THREE.Material
): THREE.Group {
  const door = new THREE.Group();
  const doorW = 3.2;
  const doorH = 7.9;

  const woodDoorMat = new THREE.MeshStandardMaterial({
    color: 0x7c4a26,
    roughness: 0.62,
    metalness: 0.06,
  });
  const woodPanelMat = new THREE.MeshStandardMaterial({
    color: 0x673c1e,
    roughness: 0.68,
    metalness: 0.05,
  });
  const metalHandleMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.22,
    metalness: 0.85,
  });
  const kickPlateMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.34,
    metalness: 0.75,
  });

  // Door outer jamb frame
  const jambLeft = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, doorH + 0.24, 0.34),
    frameMat
  );
  jambLeft.position.set(-doorW / 2 - 0.1, doorH / 2, 0.17);
  const jambRight = jambLeft.clone();
  jambRight.position.x = doorW / 2 + 0.1;
  const jambTop = new THREE.Mesh(
    new THREE.BoxGeometry(doorW + 0.44, 0.26, 0.36),
    frameMat
  );
  jambTop.position.set(0, doorH + 0.12, 0.18);
  door.add(jambLeft, jambRight, jambTop);

  // Main wooden door leaf
  const leaf = new THREE.Mesh(
    new THREE.BoxGeometry(doorW, doorH, 0.18),
    woodDoorMat
  );
  leaf.position.set(0, doorH / 2, 0.12);
  door.add(leaf);

  // Lower recessed decorative wood panel
  const lowerPanel = new THREE.Mesh(
    new THREE.BoxGeometry(doorW - 0.75, 2.55, 0.06),
    woodPanelMat
  );
  lowerPanel.position.set(0, 2.15, 0.22);
  door.add(lowerPanel);

  // Upper observation window inside door (frosted hallway light)
  const hallGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.75, 2.35),
    new THREE.MeshBasicMaterial({ color: 0x93c5fd })
  );
  hallGlow.position.set(0, 5.65, 0.22);
  const doorGlass = new THREE.Mesh(
    new THREE.PlaneGeometry(1.75, 2.35),
    glassMat
  );
  doorGlass.position.set(0, 5.65, 0.24);
  // Window trim bezel
  const winTrimTop = new THREE.Mesh(
    new THREE.BoxGeometry(1.92, 0.12, 0.1),
    frameMat
  );
  winTrimTop.position.set(0, 6.86, 0.23);
  const winTrimBot = winTrimTop.clone();
  winTrimBot.position.y = 4.44;
  const winTrimL = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 2.5, 0.1),
    frameMat
  );
  winTrimL.position.set(-0.92, 5.65, 0.23);
  const winTrimR = winTrimL.clone();
  winTrimR.position.x = 0.92;
  door.add(hallGlow, doorGlass, winTrimTop, winTrimBot, winTrimL, winTrimR);

  // Stainless steel bottom kickplate
  const kickPlate = new THREE.Mesh(
    new THREE.BoxGeometry(doorW - 0.2, 0.65, 0.04),
    kickPlateMat
  );
  kickPlate.position.set(0, 0.38, 0.22);
  door.add(kickPlate);

  // Chrome lever handle + lock backplate on left side of leaf
  const backplate = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.68, 0.05),
    metalHandleMat
  );
  backplate.position.set(-doorW / 2 + 0.36, 3.65, 0.23);
  const spindle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 0.2, 10),
    metalHandleMat
  );
  spindle.rotation.x = Math.PI / 2;
  spindle.position.set(-doorW / 2 + 0.36, 3.74, 0.32);
  const lever = new THREE.Mesh(
    new THREE.BoxGeometry(0.46, 0.08, 0.07),
    metalHandleMat
  );
  lever.position.set(-doorW / 2 + 0.56, 3.74, 0.4);
  door.add(backplate, spindle, lever);

  // Door hinges on right edge
  for (const hy of [1.4, 4.0, 6.6]) {
    const hinge = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.32, 8),
      metalHandleMat
    );
    hinge.position.set(doorW / 2 - 0.02, hy, 0.23);
    door.add(hinge);
  }

  // "LAB IPA" school room header plaque above the door
  const plaqueTex = createDoorPlaqueTexture(maxAnisotropy);
  const plaque = new THREE.Mesh(
    new THREE.BoxGeometry(2.35, 0.78, 0.1),
    [
      frameMat,
      frameMat,
      frameMat,
      frameMat,
      new THREE.MeshStandardMaterial({ map: plaqueTex, roughness: 0.45 }),
      frameMat,
    ]
  );
  plaque.position.set(0, doorH + 0.85, 0.12);
  door.add(plaque);

  return door;
}

/**
 * Builds a School IPA Glass-Front Science Apparatus Cabinet ("Lemari Alat IPA")
 * grounded at y = 0 (bottom-center pivot), height = 8.4 units.
 */
function createLabCabinetAssembly(
  glassMat: THREE.Material,
  isLowPower = false
): THREE.Group {
  const cab = new THREE.Group();
  const w = 3.5;
  const h = 8.4;
  const d = 1.65;

  const oakBodyMat = new THREE.MeshStandardMaterial({
    color: 0x8a5a32,
    roughness: 0.62,
    metalness: 0.05,
  });
  const oakDarkMat = new THREE.MeshStandardMaterial({
    color: 0x5c3a1e,
    roughness: 0.72,
    metalness: 0.05,
  });
  const interiorBackMat = new THREE.MeshStandardMaterial({
    color: 0xd6cfc2,
    roughness: 0.85,
    metalness: 0.02,
  });
  const brassHandleMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.28,
    metalness: 0.78,
  });

  // Lower wooden closed cupboard section (y = 0 to 3.1)
  const lowerBox = new THREE.Mesh(
    new THREE.BoxGeometry(w, 3.1, d),
    oakBodyMat
  );
  lowerBox.position.set(0, 1.55, 0);
  cab.add(lowerBox);

  // Recessed wooden base plinth
  const plinth = new THREE.Mesh(
    new THREE.BoxGeometry(w - 0.16, 0.28, d - 0.12),
    oakDarkMat
  );
  plinth.position.set(0, 0.14, 0.02);
  cab.add(plinth);

  // Lower double door faces + brass handles
  for (const sx of [-1, 1]) {
    const lDoor = new THREE.Mesh(
      new THREE.BoxGeometry(w / 2 - 0.14, 2.55, 0.08),
      oakDarkMat
    );
    lDoor.position.set(sx * (w / 4), 1.68, d / 2 + 0.03);
    cab.add(lDoor);

    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 0.42, 8),
      brassHandleMat
    );
    handle.position.set(sx * 0.2, 2.35, d / 2 + 0.12);
    cab.add(handle);
  }

  // Upper display cabinet carcass (y = 3.1 to 8.4)
  const upperH = h - 3.1;
  const backPanel = new THREE.Mesh(
    new THREE.BoxGeometry(w - 0.16, upperH, 0.12),
    interiorBackMat
  );
  backPanel.position.set(0, 3.1 + upperH / 2, -d / 2 + 0.08);
  cab.add(backPanel);

  const sideLeft = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, upperH, d),
    oakBodyMat
  );
  sideLeft.position.set(-w / 2 + 0.08, 3.1 + upperH / 2, 0);
  const sideRight = sideLeft.clone();
  sideRight.position.x = w / 2 - 0.08;
  cab.add(sideLeft, sideRight);

  // Crown top cornice
  const topCornice = new THREE.Mesh(
    new THREE.BoxGeometry(w + 0.22, 0.28, d + 0.18),
    oakDarkMat
  );
  topCornice.position.set(0, h - 0.06, 0.04);
  cab.add(topCornice);

  // 3 Interior wooden shelves (y = 3.2, 4.9, 6.6)
  const shelfYs = [3.18, 4.88, 6.58];
  for (const sy of shelfYs) {
    const shelf = new THREE.Mesh(
      new THREE.BoxGeometry(w - 0.3, 0.12, d - 0.28),
      oakBodyMat
    );
    shelf.position.set(0, sy, -0.04);
    cab.add(shelf);
  }

  // === INTERIOR SCIENCE APPARATUS ===
  const segs = isLowPower ? 10 : 16;

  // Shelf 3 (Top, y = 6.64): Colorful Erlenmeyer flasks & reagent bottles
  const flaskProfile = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.28, 0.0),
    new THREE.Vector2(0.26, 0.16),
    new THREE.Vector2(0.09, 0.56),
    new THREE.Vector2(0.09, 0.8),
    new THREE.Vector2(0.12, 0.84),
  ];
  const flaskGeo = new THREE.LatheGeometry(flaskProfile, segs);
  const flaskColors = [0x38bdf8, 0x34d399, 0xf59e0b, 0xf43f5e];
  flaskColors.forEach((hex, idx) => {
    const flask = new THREE.Mesh(
      flaskGeo,
      new THREE.MeshStandardMaterial({
        color: hex,
        roughness: 0.22,
        metalness: 0.1,
        transparent: true,
        opacity: 0.88,
      })
    );
    flask.position.set(-1.05 + idx * 0.7, 6.64, 0.02);
    cab.add(flask);
  });

  // Shelf 2 (Middle, y = 4.94): Classic School Microscope + Test-Tube Rack
  const scopeBaseMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.35,
    metalness: 0.55,
  });
  const scopeChromeMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.2,
    metalness: 0.85,
  });
  const scopeGroup = new THREE.Group();
  scopeGroup.position.set(-0.82, 4.94, 0.06);
  const sBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.62, 0.12, 0.72),
    scopeBaseMat
  );
  sBase.position.y = 0.06;
  const sArm = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.86, 0.16),
    scopeBaseMat
  );
  sArm.position.set(0, 0.52, -0.22);
  const sStage = new THREE.Mesh(
    new THREE.BoxGeometry(0.46, 0.06, 0.44),
    scopeBaseMat
  );
  sStage.position.set(0, 0.46, 0.06);
  const sTube = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.09, 0.78, segs),
    scopeChromeMat
  );
  sTube.rotation.x = 0.28;
  sTube.position.set(0, 0.96, 0.05);
  scopeGroup.add(sBase, sArm, sStage, sTube);
  cab.add(scopeGroup);

  // Test-tube rack on middle-right
  const rackBase = new THREE.Mesh(
    new THREE.BoxGeometry(1.18, 0.08, 0.34),
    oakDarkMat
  );
  rackBase.position.set(0.66, 4.98, 0.05);
  const rackTop = new THREE.Mesh(
    new THREE.BoxGeometry(1.18, 0.06, 0.32),
    oakDarkMat
  );
  rackTop.position.set(0.66, 5.44, 0.05);
  cab.add(rackBase, rackTop);
  const tubeColors = [0xef4444, 0x3b82f6, 0x22c55e, 0xeab308, 0xa855f7];
  const tubeGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.76, 8);
  tubeColors.forEach((hex, idx) => {
    const tube = new THREE.Mesh(
      tubeGeo,
      new THREE.MeshStandardMaterial({ color: hex, roughness: 0.25 })
    );
    tube.position.set(0.22 + idx * 0.22, 5.38, 0.05);
    cab.add(tube);
  });

  // Shelf 1 (Lower Display, y = 3.24): Science Encyclopedia Books + Large Beaker + Globe
  const bookColors = [0xdc2626, 0x2563eb, 0x16a34a, 0xd97706, 0x7c3aed];
  bookColors.forEach((hex, i) => {
    const bk = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 1.02, 0.76),
      new THREE.MeshStandardMaterial({ color: hex, roughness: 0.75 })
    );
    bk.position.set(-1.18 + i * 0.24, 3.75, 0.04);
    cab.add(bk);
  });

  // Mini classroom globe inside cabinet
  const globeStand = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.26, 0.16, 12),
    oakDarkMat
  );
  globeStand.position.set(0.75, 3.32, 0.05);
  const globeBall = new THREE.Mesh(
    new THREE.SphereGeometry(0.46, segs, segs),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.45 })
  );
  globeBall.position.set(0.75, 3.92, 0.05);
  const globeRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.54, 0.035, 8, 20, Math.PI * 1.15),
    brassHandleMat
  );
  globeRing.rotation.z = -0.35;
  globeRing.position.set(0.75, 3.92, 0.05);
  cab.add(globeStand, globeBall, globeRing);

  // Upper wooden-framed glass double doors
  const uDoorH = upperH - 0.24;
  const uDoorCenterY = 3.1 + uDoorH / 2;
  const doorFrameThickness = 0.13;
  for (const sx of [-1, 1]) {
    const cx = sx * (w / 4);
    const doorW = w / 2 - 0.08;
    const zFront = d / 2 - 0.02;

    const glass = new THREE.Mesh(
      new THREE.PlaneGeometry(doorW - 0.22, uDoorH - 0.22),
      glassMat
    );
    glass.position.set(cx, uDoorCenterY, zFront);
    cab.add(glass);

    // Door frame rails
    const railT = new THREE.Mesh(
      new THREE.BoxGeometry(doorW, doorFrameThickness, 0.08),
      oakDarkMat
    );
    railT.position.set(cx, uDoorCenterY + uDoorH / 2 - 0.06, zFront + 0.01);
    const railB = railT.clone();
    railB.position.y = uDoorCenterY - uDoorH / 2 + 0.06;
    const stileL = new THREE.Mesh(
      new THREE.BoxGeometry(doorFrameThickness, uDoorH, 0.08),
      oakDarkMat
    );
    stileL.position.set(cx - doorW / 2 + 0.06, uDoorCenterY, zFront + 0.01);
    const stileR = stileL.clone();
    stileR.position.x = cx + doorW / 2 - 0.06;

    const uHandle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.032, 0.032, 0.44, 8),
      brassHandleMat
    );
    uHandle.position.set(sx * 0.16, 4.45, zFront + 0.11);

    cab.add(railT, railB, stileL, stileR, uHandle);
  }

  return cab;
}

/**
 * Builds an unmistakable School Science Lab 3D Human Skeleton Model ("Kerangka Manusia")
 * mounted on a rolling 5-caster chrome medical stand.
 * Grounded at y = 0 (bottom-center pivot), total height ≈ 8.55 units
 * (proportionally matched to the 4.2-unit tall laboratory workbench!).
 */
function createHumanSkeletonAssembly(isLowPower = false): THREE.Group {
  const skel = new THREE.Group();
  const seg = isLowPower ? 8 : 12;

  const boneMat = new THREE.MeshStandardMaterial({
    color: 0xf1ece0, // Warm anatomical ivory bone
    roughness: 0.58,
    metalness: 0.04,
  });
  const jointMat = new THREE.MeshStandardMaterial({
    color: 0xd8d0be,
    roughness: 0.72,
    metalness: 0.05,
  });
  const cavityMat = new THREE.MeshStandardMaterial({
    color: 0x1e242b, // Deep dark eye sockets & nasal cavity for crisp iconic skull read
    roughness: 0.92,
  });
  const standChromeMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    roughness: 0.22,
    metalness: 0.85,
  });
  const casterMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.85,
  });

  // === 1. ROLLING 5-SPOKE LAB STAND (y = 0 to 4.75) ===
  const hub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.2, 0.22, 10),
    standChromeMat
  );
  hub.position.y = 0.24;
  skel.add(hub);

  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const leg = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.08, 1.05),
      standChromeMat
    );
    leg.position.set(Math.sin(a) * 0.52, 0.22, Math.cos(a) * 0.52);
    leg.rotation.y = a;
    skel.add(leg);

    const wheel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 0.08, 8),
      casterMat
    );
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(Math.sin(a) * 0.98, 0.1, Math.cos(a) * 0.98);
    skel.add(wheel);
  }

  // Vertical chrome support rod entering pelvis from below
  const rod = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.065, 4.7, 10),
    standChromeMat
  );
  rod.position.set(0, 2.55, -0.14);
  skel.add(rod);

  // === 2. PELVIS (y ≈ 4.35 to 4.95) ===
  const sacrum = new THREE.Mesh(
    new THREE.ConeGeometry(0.24, 0.48, 8),
    boneMat
  );
  sacrum.rotation.x = Math.PI;
  sacrum.position.set(0, 4.55, -0.1);
  skel.add(sacrum);

  for (const sx of [-1, 1]) {
    const ilium = new THREE.Mesh(
      new THREE.TorusGeometry(0.26, 0.095, 7, seg, Math.PI * 1.3),
      boneMat
    );
    ilium.position.set(sx * 0.34, 4.68, 0.02);
    ilium.rotation.y = sx * 0.35;
    ilium.rotation.z = sx * -0.45;
    skel.add(ilium);

    const hipSocket = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, seg, seg),
      jointMat
    );
    hipSocket.position.set(sx * 0.42, 4.44, 0.04);
    skel.add(hipSocket);
  }

  // === 3. LEGS (Femur, Kneecap, Tibia/Fibula, Feet: y = 0.72 to 4.44) ===
  const femurGeo = new THREE.CylinderGeometry(0.085, 0.075, 1.72, seg);
  const tibiaGeo = new THREE.CylinderGeometry(0.072, 0.058, 1.62, seg);
  const fibulaGeo = new THREE.CylinderGeometry(0.032, 0.028, 1.54, 6);
  const kneeGeo = new THREE.SphereGeometry(0.12, seg, seg);

  for (const sx of [-1, 1]) {
    const femur = new THREE.Mesh(femurGeo, boneMat);
    femur.position.set(sx * 0.38, 3.56, 0.04);
    femur.rotation.z = sx * -0.05;
    skel.add(femur);

    const knee = new THREE.Mesh(kneeGeo, jointMat);
    knee.position.set(sx * 0.33, 2.66, 0.06);
    skel.add(knee);

    const tibia = new THREE.Mesh(tibiaGeo, boneMat);
    tibia.position.set(sx * 0.31, 1.82, 0.05);
    skel.add(tibia);

    const fibula = new THREE.Mesh(fibulaGeo, boneMat);
    fibula.position.set(sx * 0.41, 1.82, 0.02);
    skel.add(fibula);

    // Skeletal foot
    const foot = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.14, 0.56),
      boneMat
    );
    foot.position.set(sx * 0.33, 0.96, 0.2);
    skel.add(foot);
  }

  // === 4. SPINE & VERTEBRAE (y = 4.8 to 7.45) ===
  const vertGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.14, 8);
  for (let i = 0; i < 14; i++) {
    const vy = 4.86 + i * 0.19;
    const v = new THREE.Mesh(vertGeo, i % 2 === 0 ? boneMat : jointMat);
    // Subtle natural S-curve of human spine
    const zCurve = Math.sin((i / 13) * Math.PI * 1.4) * 0.08 - 0.1;
    v.position.set(0, vy, zCurve);
    skel.add(v);
  }

  // === 5. RIBCAGE & STERNUM (y = 5.45 to 7.02 — HIGHLY VISIBLE ABOVE TABLE!) ===
  const sternum = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 1.12, 0.08),
    boneMat
  );
  sternum.position.set(0, 6.45, 0.42);
  skel.add(sternum);

  // 7 Anatomical pairs of curved ribs wrapping cleanly from spine to sternum
  const ribcageGroup = new THREE.Group();
  ribcageGroup.position.set(0, 0, 0.08);
  ribcageGroup.scale.set(1.0, 1.0, 0.76);
  const ribWidths = [0.46, 0.56, 0.62, 0.64, 0.62, 0.56, 0.48];
  ribWidths.forEach((rw, idx) => {
    const ry = 6.96 - idx * 0.22;
    const ribArc = new THREE.Mesh(
      new THREE.TorusGeometry(
        rw,
        0.045,
        6,
        isLowPower ? 14 : 20,
        idx < 5 ? Math.PI * 1.82 : Math.PI * 1.42
      ),
      boneMat
    );
    ribArc.rotation.x = Math.PI / 2 + 0.14;
    ribArc.rotation.z = idx < 5 ? Math.PI * 0.59 : Math.PI * 0.79;
    ribArc.position.set(0, ry, 0);
    ribcageGroup.add(ribArc);
  });
  skel.add(ribcageGroup);

  // Clavicles (collarbones) & Shoulder joints
  for (const sx of [-1, 1]) {
    const clavicle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.042, 0.042, 0.72, 8),
      boneMat
    );
    clavicle.rotation.z = Math.PI / 2 - sx * 0.12;
    clavicle.position.set(sx * 0.44, 7.12, 0.24);
    skel.add(clavicle);

    const shoulder = new THREE.Mesh(
      new THREE.SphereGeometry(0.135, seg, seg),
      jointMat
    );
    shoulder.position.set(sx * 0.84, 7.02, 0.08);
    skel.add(shoulder);
  }

  // === 6. ARMS (Humerus, Elbow, Radius/Ulna, Hands) ===
  const humerusGeo = new THREE.CylinderGeometry(0.068, 0.06, 1.32, seg);
  const forearmGeo = new THREE.CylinderGeometry(0.042, 0.036, 1.2, 6);
  const elbowGeo = new THREE.SphereGeometry(0.095, seg, seg);

  for (const sx of [-1, 1]) {
    const humerus = new THREE.Mesh(humerusGeo, boneMat);
    humerus.position.set(sx * 0.9, 6.32, 0.08);
    humerus.rotation.z = sx * 0.08;
    skel.add(humerus);

    const elbow = new THREE.Mesh(elbowGeo, jointMat);
    elbow.position.set(sx * 0.96, 5.62, 0.08);
    skel.add(elbow);

    const radius = new THREE.Mesh(forearmGeo, boneMat);
    radius.position.set(sx * 0.94, 4.98, 0.14);
    radius.rotation.x = -0.08;
    const ulna = new THREE.Mesh(forearmGeo, boneMat);
    ulna.position.set(sx * 1.03, 4.98, 0.08);
    ulna.rotation.x = -0.08;
    skel.add(radius, ulna);

    // Hand palm + skeletal finger cluster
    const hand = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.42, 0.22),
      boneMat
    );
    hand.position.set(sx * 0.98, 4.22, 0.16);
    skel.add(hand);
  }

  // === 7. ICONIC ANATOMICAL SKULL (y = 7.45 to 8.52) ===
  const skullGroup = new THREE.Group();
  skullGroup.position.set(0, 7.98, 0.04);

  // Cranium dome
  const cranium = new THREE.Mesh(
    new THREE.SphereGeometry(0.46, seg + 4, seg + 2),
    boneMat
  );
  cranium.scale.set(0.92, 1.08, 1.05);
  cranium.position.set(0, 0.12, -0.04);
  skullGroup.add(cranium);

  // Cheekbones & upper jaw (maxilla)
  const maxilla = new THREE.Mesh(
    new THREE.BoxGeometry(0.56, 0.34, 0.44),
    boneMat
  );
  maxilla.position.set(0, -0.18, 0.18);
  skullGroup.add(maxilla);

  // Lower jawbone (mandible)
  const mandible = new THREE.Mesh(
    new THREE.BoxGeometry(0.46, 0.22, 0.38),
    boneMat
  );
  mandible.position.set(0, -0.44, 0.16);
  skullGroup.add(mandible);

  // Deep dark eye sockets (instantly recognizable!)
  const socketGeo = new THREE.SphereGeometry(0.125, seg, seg);
  for (const sx of [-1, 1]) {
    const socket = new THREE.Mesh(socketGeo, cavityMat);
    socket.scale.set(1.05, 0.95, 0.55);
    socket.position.set(sx * 0.17, -0.02, 0.39);
    skullGroup.add(socket);
  }

  // Triangular nasal cavity
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.16, 3), cavityMat);
  nose.position.set(0, -0.17, 0.41);
  skullGroup.add(nose);

  // Tooth separation seam line
  const teethLine = new THREE.Mesh(
    new THREE.BoxGeometry(0.36, 0.045, 0.05),
    cavityMat
  );
  teethLine.position.set(0, -0.33, 0.38);
  skullGroup.add(teethLine);

  skel.add(skullGroup);

  return skel;
}

/**
 * Crisp educational school wall poster: "BAGIAN-BAGIAN TELINGA"
 * Shows a colorful Indonesian SD Kelas 5 anatomical cross-section of the human ear
 * (Telinga Luar, Telinga Tengah, Telinga Dalam) with clear labels.
 */
function createEarAnatomyPosterTexture(
  maxAnisotropy: number,
  isLowPower = false
): THREE.CanvasTexture {
  const w = isLowPower ? 512 : 768;
  const h = isLowPower ? 640 : 960;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  const s = w / 768;
  ctx.scale(s, s);

  // Warm cream educational chart background
  ctx.fillStyle = '#fefce8';
  ctx.fillRect(0, 0, 768, 960);

  // Outer poster borders
  ctx.strokeStyle = '#0f766e';
  ctx.lineWidth = 12;
  ctx.strokeRect(18, 18, 732, 924);
  ctx.strokeStyle = '#99f6e4';
  ctx.lineWidth = 4;
  ctx.strokeRect(32, 32, 704, 896);

  // Header banner
  ctx.fillStyle = '#115e59';
  ctx.fillRect(34, 34, 700, 128);
  ctx.fillStyle = '#fde047';
  ctx.font = '800 30px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('POSTER IPA SD KELAS 5', 384, 80);
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 40px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('BAGIAN-BAGIAN TELINGA', 384, 132);

  // Three subtle vertical zone bands (Telinga Luar | Tengah | Dalam)
  const zones: Array<[number, number, string, string]> = [
    [46, 232, 'rgba(254, 243, 199, 0.72)', 'TELINGA LUAR'],
    [278, 178, 'rgba(224, 242, 254, 0.75)', 'TELINGA TENGAH'],
    [456, 266, 'rgba(209, 250, 229, 0.75)', 'TELINGA DALAM'],
  ];
  for (const [zx, zw, bg, label] of zones) {
    ctx.fillStyle = bg;
    ctx.fillRect(zx, 176, zw, 620);
    ctx.fillStyle = '#0f172a';
    ctx.font = '800 18px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, zx + zw / 2, 206);
  }

  // === ANATOMICAL EAR CROSS-SECTION DRAWING ===
  ctx.save();

  // 1. Daun Telinga (Outer Ear Pinna) on the left
  ctx.fillStyle = '#f5cba7';
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(155, 370);
  ctx.bezierCurveTo(68, 340, 56, 485, 95, 565);
  ctx.bezierCurveTo(118, 618, 174, 622, 185, 558);
  ctx.bezierCurveTo(188, 520, 152, 512, 160, 470);
  ctx.bezierCurveTo(168, 435, 196, 420, 155, 370);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Inner ear fold curve
  ctx.strokeStyle = '#c27848';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(124, 465, 36, Math.PI * 0.75, Math.PI * 1.9);
  ctx.stroke();

  // 2. Liang / Saluran Telinga (Ear Canal)
  ctx.fillStyle = '#f9d6b8';
  ctx.strokeStyle = '#9a3412';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(164, 462);
  ctx.quadraticCurveTo(235, 456, 306, 468);
  ctx.lineTo(306, 514);
  ctx.quadraticCurveTo(235, 502, 164, 508);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Sound wave arcs entering ear canal
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 4;
  for (const r of [24, 42, 60]) {
    ctx.beginPath();
    ctx.arc(62, 485, r, -0.55, 0.55);
    ctx.stroke();
  }

  // 3. Middle Ear Chamber + Eustachian Tube (Saluran Eustachius)
  ctx.fillStyle = '#fde68a';
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(314, 444);
  ctx.lineTo(445, 444);
  ctx.lineTo(445, 540);
  ctx.lineTo(408, 668);
  ctx.lineTo(378, 658);
  ctx.lineTo(395, 540);
  ctx.lineTo(314, 528);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 4. Gendang Telinga (Tympanic Membrane - tilted blue-white oval)
  ctx.save();
  ctx.translate(314, 492);
  ctx.rotate(-0.22);
  ctx.fillStyle = '#7dd3fc';
  ctx.strokeStyle = '#0369a1';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.ellipse(0, 0, 14, 42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 5. Tulang Pendengaran (Ossicles: Martil, Landasan, Sanggurdi)
  ctx.strokeStyle = '#78350f';
  ctx.fillStyle = '#fffbeb';
  ctx.lineWidth = 5;
  // Martil (Malleus)
  ctx.beginPath();
  ctx.roundRect(324, 446, 22, 46, 8);
  ctx.fill();
  ctx.stroke();
  // Landasan (Incus)
  ctx.beginPath();
  ctx.roundRect(352, 444, 34, 28, 8);
  ctx.fill();
  ctx.stroke();
  // Sanggurdi (Stapes stirrup)
  ctx.beginPath();
  ctx.arc(412, 468, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // 6. Saluran Setengah Lingkaran (3 Semicircular Balance Canals)
  ctx.strokeStyle = '#0d9488';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.arc(492, 415, 42, Math.PI * 0.85, Math.PI * 2.15);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(536, 434, 34, Math.PI * 1.15, Math.PI * 2.35);
  ctx.stroke();
  ctx.strokeStyle = '#99f6e4';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(492, 415, 42, Math.PI * 0.85, Math.PI * 2.15);
  ctx.stroke();

  // 7. Rumah Siput / Koklea (Iconic Spiral Cochlea!)
  const spiralCx = 562;
  const spiralCy = 524;
  ctx.beginPath();
  for (let t = 0; t <= Math.PI * 4.4; t += 0.12) {
    const rad = 64 - t * 3.8;
    const sx = spiralCx + Math.cos(t) * rad;
    const sy = spiralCy + Math.sin(t) * rad;
    if (t === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  }
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 22;
  ctx.lineCap = 'round';
  ctx.stroke();

  ctx.strokeStyle = '#fde68a';
  ctx.lineWidth = 10;
  ctx.stroke();

  // 8. Saraf Pendengaran (Auditory Nerve Bundle to Brain)
  ctx.fillStyle = '#eab308';
  ctx.strokeStyle = '#a16207';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(618, 496);
  ctx.lineTo(705, 476);
  ctx.lineTo(705, 532);
  ctx.lineTo(618, 534);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Clean callout pointer helper
  const drawCallout = (
    tx: number,
    ty: number,
    lx: number,
    ly: number,
    title: string,
    sub: string,
    align: CanvasTextAlign
  ) => {
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(lx, ly);
    ctx.stroke();

    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(tx, ty, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.textAlign = align;
    ctx.fillStyle = '#0f172a';
    ctx.font = '800 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(title, lx + (align === 'left' ? 8 : -8), ly + 3);
    ctx.fillStyle = '#475569';
    ctx.font = '600 17px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(sub, lx + (align === 'left' ? 8 : -8), ly + 24);
  };

  drawCallout(115, 388, 175, 260, 'Daun Telinga', 'Tangkap bunyi', 'left');
  drawCallout(238, 486, 175, 685, 'Liang Telinga', 'Salurkan bunyi', 'right');
  drawCallout(314, 520, 314, 745, 'Gendang Telinga', 'Bergetar saat bunyi', 'center');
  drawCallout(368, 452, 345, 320, 'Tulang Pendengaran', 'Martil·Landasan·Sanggurdi', 'center');
  drawCallout(495, 376, 515, 260, 'Sal. 1/2 Lingkaran', 'Keseimbangan tubuh', 'left');
  drawCallout(572, 548, 560, 685, 'Rumah Siput (Koklea)', 'Ubah getaran', 'left');
  drawCallout(400, 622, 415, 650, 'Eustachius', 'Atur tekanan', 'left');
  drawCallout(668, 502, 695, 390, 'Saraf Pendengaran', 'Kirim ke otak', 'right');

  // Footer summary strip
  ctx.fillStyle = '#ccfbf1';
  ctx.fillRect(46, 822, 676, 88);
  ctx.strokeStyle = '#14b8a6';
  ctx.lineWidth = 3;
  ctx.strokeRect(46, 822, 676, 88);
  ctx.fillStyle = '#115e59';
  ctx.textAlign = 'center';
  ctx.font = '700 21px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('Bunyi masuk Daun & Liang Telinga → menggetarkan Gendang Telinga', 384, 858);
  ctx.fillText('→ diteruskan Tulang Pendengaran & Rumah Siput ke Otak!', 384, 890);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Reusable Indonesian school wall chart with wooden top & bottom hanging dowels.
 */
function createWallPosterAssembly(
  width: number,
  height: number,
  texture: THREE.CanvasTexture,
  woodTrimMat: THREE.Material
): THREE.Group {
  const posterGroup = new THREE.Group();

  const posterSheet = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.65,
      metalness: 0.02,
    })
  );
  posterGroup.add(posterSheet);

  const dowelGeo = new THREE.CylinderGeometry(0.065, 0.065, width + 0.26, 10);
  dowelGeo.rotateZ(Math.PI / 2);
  const topDowel = new THREE.Mesh(dowelGeo, woodTrimMat);
  topDowel.position.set(0, height / 2 + 0.04, 0.04);
  const botDowel = new THREE.Mesh(dowelGeo, woodTrimMat);
  botDowel.position.set(0, -height / 2 - 0.04, 0.04);
  posterGroup.add(topDowel, botDowel);

  return posterGroup;
}

/**
 * Builds a School Chemistry Side Workbench ("Meja Praktikum Kimia") grounded at y = 0,
 * topped with colorful 3D laboratory glassware:
 * - Beakers (Gelas Kimia) with measurement bands & colored solutions
 * - Conical Erlenmeyer Flasks (Labu Erlenmeyer)
 * - Tall Graduated Cylinder (Gelas Ukur)
 * - Wooden Test-Tube Rack with 5 colorful Test Tubes
 * - Tripod + Bunsen Burner + Round-Bottom Boiling Flask (on select variants)
 * - Stoppered Glass Reagent Bottles & Lower Shelf Storage
 */
function createChemistryLabTableAssembly(
  tableW: number,
  tableD: number,
  variant: number,
  isLowPower = false
): THREE.Group {
  const group = new THREE.Group();
  const tableH = 3.85;
  const seg = isLowPower ? 10 : 16;

  const topMat = new THREE.MeshStandardMaterial({
    color: 0x263242, // Classic dark epoxy chemical-resistant tabletop
    roughness: 0.48,
    metalness: 0.14,
  });
  const trimWoodMat = new THREE.MeshStandardMaterial({
    color: 0x7c5332,
    roughness: 0.64,
    metalness: 0.05,
  });
  const legSteelMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.42,
    metalness: 0.65,
  });
  const clearGlassMat = new THREE.MeshStandardMaterial({
    color: 0xe0f2fe,
    roughness: 0.12,
    metalness: 0.22,
    transparent: true,
    opacity: 0.36,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const glassRimMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.18,
    metalness: 0.35,
    transparent: true,
    opacity: 0.68,
  });

  // Main chemical tabletop slab (top face at y = tableH)
  const slab = new THREE.Mesh(
    new THREE.BoxGeometry(tableW, 0.24, tableD),
    topMat
  );
  slab.position.set(0, tableH - 0.12, 0);
  group.add(slab);

  // Wooden front & side apron rim
  const apron = new THREE.Mesh(
    new THREE.BoxGeometry(tableW - 0.24, 0.36, tableD - 0.24),
    trimWoodMat
  );
  apron.position.set(0, tableH - 0.42, 0);
  group.add(apron);

  // 4 Steel legs + lower wooden storage shelf
  const lxOff = tableW / 2 - 0.26;
  const lzOff = tableD / 2 - 0.26;
  const legGeo = new THREE.BoxGeometry(0.18, tableH - 0.24, 0.18);
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const leg = new THREE.Mesh(legGeo, legSteelMat);
      leg.position.set(sx * lxOff, (tableH - 0.24) / 2, sz * lzOff);
      group.add(leg);
    }
  }

  const lowerShelf = new THREE.Mesh(
    new THREE.BoxGeometry(tableW - 0.5, 0.12, tableD - 0.5),
    trimWoodMat
  );
  lowerShelf.position.set(0, 1.08, 0);
  group.add(lowerShelf);

  // Spare translucent white reagent jugs sitting on lower shelf
  const jugMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.55,
  });
  const jugCapMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.4,
  });
  for (let j = 0; j < 2; j++) {
    const jx = -tableW * 0.28 + j * 0.78;
    const jug = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.26, 0.72, 10),
      jugMat
    );
    jug.position.set(jx, 1.5, 0);
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.11, 0.14, 8),
      jugCapMat
    );
    cap.position.set(jx, 1.92, 0);
    group.add(jug, cap);
  }

  // === HELPER: GELAS KIMIA / BEAKER WITH COLORED LIQUID ===
  const addBeaker = (
    x: number,
    z: number,
    radius: number,
    height: number,
    fillFrac: number,
    liquidHex: number
  ) => {
    const liqH = height * fillFrac;
    const liq = new THREE.Mesh(
      new THREE.CylinderGeometry(radius * 0.88, radius * 0.88, liqH, seg),
      new THREE.MeshStandardMaterial({
        color: liquidHex,
        emissive: liquidHex,
        emissiveIntensity: 0.16,
        roughness: 0.2,
        transparent: true,
        opacity: 0.86,
      })
    );
    liq.position.set(x, tableH + 0.03 + liqH / 2, z);
    group.add(liq);

    const wall = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, height, seg, 1, true),
      clearGlassMat
    );
    wall.position.set(x, tableH + height / 2, z);
    group.add(wall);

    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.018, 6, seg),
      glassRimMat
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.set(x, tableH + height, z);
    group.add(rim);

    // Subtle white measurement graduation rings on front
    const mark = new THREE.Mesh(
      new THREE.TorusGeometry(radius + 0.005, 0.009, 4, seg, Math.PI * 0.65),
      glassRimMat
    );
    mark.rotation.x = Math.PI / 2;
    mark.rotation.z = Math.PI * 0.18;
    mark.position.set(x, tableH + height * 0.58, z);
    group.add(mark);
  };

  // === HELPER: LABU ERLENMEYER (CONICAL FLASK) ===
  const flaskProfile = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.32, 0.0),
    new THREE.Vector2(0.3, 0.16),
    new THREE.Vector2(0.1, 0.64),
    new THREE.Vector2(0.1, 0.9),
    new THREE.Vector2(0.13, 0.95),
  ];
  const flaskGlassGeo = new THREE.LatheGeometry(flaskProfile, seg);

  const addErlenmeyer = (
    x: number,
    z: number,
    scale: number,
    liquidHex: number
  ) => {
    const liqCone = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16 * scale, 0.27 * scale, 0.36 * scale, seg),
      new THREE.MeshStandardMaterial({
        color: liquidHex,
        emissive: liquidHex,
        emissiveIntensity: 0.18,
        roughness: 0.22,
        transparent: true,
        opacity: 0.88,
      })
    );
    liqCone.position.set(x, tableH + 0.2 * scale, z);
    group.add(liqCone);

    const shell = new THREE.Mesh(flaskGlassGeo, clearGlassMat);
    shell.scale.setScalar(scale);
    shell.position.set(x, tableH, z);
    group.add(shell);
  };

  // === HELPER: GELAS UKUR (TALL GRADUATED CYLINDER) ===
  const addGraduatedCylinder = (x: number, z: number, liquidHex: number) => {
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.24, 0.06, 6),
      glassRimMat
    );
    base.position.set(x, tableH + 0.03, z);
    const liq = new THREE.Mesh(
      new THREE.CylinderGeometry(0.095, 0.095, 0.82, seg),
      new THREE.MeshStandardMaterial({
        color: liquidHex,
        emissive: liquidHex,
        emissiveIntensity: 0.14,
        roughness: 0.2,
        transparent: true,
        opacity: 0.86,
      })
    );
    liq.position.set(x, tableH + 0.45, z);
    const tube = new THREE.Mesh(
      new THREE.CylinderGeometry(0.115, 0.115, 1.32, seg, 1, true),
      clearGlassMat
    );
    tube.position.set(x, tableH + 0.68, z);
    group.add(base, liq, tube);
  };

  // === HELPER: RAK TABUNG REAKSI (WOODEN TEST-TUBE RACK WITH 5 TUBES) ===
  const addTestTubeRack = (x: number, z: number) => {
    const rGroup = new THREE.Group();
    rGroup.position.set(x, tableH, z);
    const rBot = new THREE.Mesh(
      new THREE.BoxGeometry(1.24, 0.08, 0.34),
      trimWoodMat
    );
    rBot.position.y = 0.04;
    const rTop = new THREE.Mesh(
      new THREE.BoxGeometry(1.24, 0.06, 0.32),
      trimWoodMat
    );
    rTop.position.y = 0.56;
    for (const sx of [-0.56, 0.56]) {
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.54, 0.28),
        trimWoodMat
      );
      post.position.set(sx, 0.3, 0);
      rGroup.add(post);
    }
    rGroup.add(rBot, rTop);

    const colors = [0xef4444, 0x38bdf8, 0x22c55e, 0xf59e0b, 0xa855f7];
    const tGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.86, 8);
    colors.forEach((hex, idx) => {
      const tube = new THREE.Mesh(
        tGeo,
        new THREE.MeshStandardMaterial({
          color: hex,
          emissive: hex,
          emissiveIntensity: 0.16,
          roughness: 0.22,
          transparent: true,
          opacity: 0.85,
        })
      );
      tube.position.set(-0.44 + idx * 0.22, 0.52, 0);
      rGroup.add(tube);
    });
    group.add(rGroup);
  };

  // === HELPER: KAKI TIGA + PEMBAKAR BUNSEN + LABU DIDIH ===
  const addBoilingRig = (x: number, z: number, liquidHex: number) => {
    const rig = new THREE.Group();
    rig.position.set(x, tableH, z);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.32, 0.028, 6, 14),
      legSteelMat
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.64;
    rig.add(ring);

    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      const tLeg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 0.68, 6),
        legSteelMat
      );
      tLeg.position.set(Math.cos(a) * 0.33, 0.33, Math.sin(a) * 0.33);
      tLeg.rotation.z = Math.cos(a) * 0.12;
      tLeg.rotation.x = -Math.sin(a) * 0.12;
      rig.add(tLeg);
    }

    // Small Bunsen burner beneath tripod
    const burnerBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.18, 0.07, 10),
      legSteelMat
    );
    burnerBase.position.y = 0.035;
    const burnerPipe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.045, 0.38, 8),
      legSteelMat
    );
    burnerPipe.position.y = 0.24;
    rig.add(burnerBase, burnerPipe);

    // Round-bottom boiling flask resting on tripod ring
    const bulbLiquid = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, seg, seg),
      new THREE.MeshStandardMaterial({
        color: liquidHex,
        emissive: liquidHex,
        emissiveIntensity: 0.2,
        roughness: 0.22,
        transparent: true,
        opacity: 0.86,
      })
    );
    bulbLiquid.position.y = 0.94;
    const bulbGlass = new THREE.Mesh(
      new THREE.SphereGeometry(0.33, seg, seg),
      clearGlassMat
    );
    bulbGlass.position.y = 0.96;
    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, 0.44, seg, 1, true),
      clearGlassMat
    );
    neck.position.y = 1.44;
    rig.add(bulbLiquid, bulbGlass, neck);
    group.add(rig);
  };

  // Populate glassware nicely based on variant so every side table feels distinct & lively
  const liquidPalettes = [
    [0x0ea5e9, 0x10b981, 0xf59e0b, 0xa855f7, 0xf43f5e],
    [0x22c55e, 0x38bdf8, 0xf43f5e, 0xeab308, 0x6366f1],
    [0xf59e0b, 0x06b6d4, 0xec4899, 0x10b981, 0x3b82f6],
  ];
  const pal = liquidPalettes[variant % liquidPalettes.length];

  addBeaker(-tableW * 0.36, 0.22, 0.28, 0.72, 0.68, pal[0]);
  addBeaker(-tableW * 0.22, -0.18, 0.22, 0.56, 0.6, pal[1]);
  addErlenmeyer(-tableW * 0.08, 0.24, 1.05, pal[2]);
  addGraduatedCylinder(tableW * 0.04, -0.25, pal[3]);

  if (variant % 2 === 0) {
    addBoilingRig(tableW * 0.16, 0.18, pal[4]);
    addTestTubeRack(tableW * 0.34, -0.05);
  } else {
    addTestTubeRack(tableW * 0.16, 0.12);
    addErlenmeyer(tableW * 0.33, -0.16, 0.95, pal[4]);
    addBeaker(tableW * 0.38, 0.34, 0.24, 0.62, 0.72, pal[0]);
  }

  return group;
}

/**
 * Builds an authentic Indonesian School Student Lab Desk + Matching Chair set
 * ("Meja & Kursi Siswa Lab IPA"), grounded at y = 0 (bottom-center pivot).
 * Desk faces -Z (toward the chalkboard); chair is neatly placed on the +Z side.
 */
function createStudentDeskAndChairAssembly(variant = 0): THREE.Group {
  const set = new THREE.Group();

  const oakLightMat = new THREE.MeshStandardMaterial({
    color: 0xc8955c, // Classic bright Indonesian school wooden desk finish
    roughness: 0.62,
    metalness: 0.04,
  });
  const oakEdgeMat = new THREE.MeshStandardMaterial({
    color: 0x9c6c3b,
    roughness: 0.68,
    metalness: 0.04,
  });
  const steelFrameMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.42,
    metalness: 0.65,
  });
  const footMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.88,
  });

  // === 1. PROPORTIONAL STUDENT LAB DESK (5.8 × 4.05 × 3.6 — matched to 4.2-tall main workbench) ===
  const deskW = 5.8;
  const deskH = 4.05;
  const deskD = 3.6;
  const topT = 0.26;

  const desktop = new THREE.Mesh(
    new THREE.BoxGeometry(deskW, topT, deskD),
    oakLightMat
  );
  desktop.position.set(0, deskH - topT / 2, 0);
  set.add(desktop);

  // Protective edge trim around tabletop (echoing main workbench construction)
  const trimFront = new THREE.Mesh(
    new THREE.BoxGeometry(deskW + 0.08, topT + 0.02, 0.09),
    oakEdgeMat
  );
  trimFront.position.set(0, deskH - topT / 2, deskD / 2 + 0.02);
  const trimBack = trimFront.clone();
  trimBack.position.z = -(deskD / 2 + 0.02);
  set.add(trimFront, trimBack);

  // Under-desk book drawer/cubby shelf & front modesty panel
  const cubbyShelf = new THREE.Mesh(
    new THREE.BoxGeometry(deskW - 0.56, 0.12, deskD - 0.56),
    oakEdgeMat
  );
  cubbyShelf.position.set(0, deskH - 0.78, 0);
  const modesty = new THREE.Mesh(
    new THREE.BoxGeometry(deskW - 0.5, 1.65, 0.12),
    oakEdgeMat
  );
  modesty.position.set(0, deskH - 1.12, -deskD / 2 + 0.22);
  set.add(cubbyShelf, modesty);

  // 4 Sturdy Steel Desk Legs + Horizontal Foot Stretchers
  const legH = deskH - topT;
  const dLegGeo = new THREE.BoxGeometry(0.24, legH, 0.24);
  const lx = deskW / 2 - 0.34;
  const lz = deskD / 2 - 0.32;
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const leg = new THREE.Mesh(dLegGeo, steelFrameMat);
      leg.position.set(sx * lx, legH / 2, sz * lz);
      set.add(leg);

      const cap = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.1, 0.28), footMat);
      cap.position.set(sx * lx, 0.05, sz * lz);
      set.add(cap);
    }
    const sideTie = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.14, deskD - 0.64),
      steelFrameMat
    );
    sideTie.position.set(sx * lx, 0.85, 0);
    set.add(sideTie);
  }

  // Proportional open Grade 5 IPA notebook & colored pen on desk surface
  const coverColors = [0x0284c7, 0x16a34a, 0xd97706, 0xe11d48];
  const bookCover = new THREE.Mesh(
    new THREE.BoxGeometry(1.38, 0.08, 1.02),
    new THREE.MeshStandardMaterial({
      color: coverColors[variant % coverColors.length],
      roughness: 0.72,
    })
  );
  bookCover.position.set(-0.85, deskH + 0.04, 0.18);
  bookCover.rotation.y = (variant % 2 === 0 ? 1 : -1) * 0.08;
  const pages = new THREE.Mesh(
    new THREE.BoxGeometry(1.26, 0.09, 0.9),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.85 })
  );
  pages.position.set(-0.85, deskH + 0.065, 0.18);
  pages.rotation.y = bookCover.rotation.y;
  set.add(bookCover, pages);

  // Proportional colored lab beaker on right side of desk
  const miniBeaker = new THREE.Mesh(
    new THREE.CylinderGeometry(0.26, 0.26, 0.68, 12),
    new THREE.MeshStandardMaterial({
      color: coverColors[(variant + 1) % coverColors.length],
      roughness: 0.25,
      transparent: true,
      opacity: 0.8,
    })
  );
  miniBeaker.position.set(1.42, deskH + 0.34, -0.32);
  set.add(miniBeaker);

  // === 2. PROPORTIONAL SCHOOL CHAIR (tucked neatly on +Z side facing -Z chalkboard) ===
  const chair = new THREE.Group();
  chair.position.set(0, 0, 2.35);
  const seatW = 2.7;
  const seatD = 2.45;
  const seatH = 2.45;

  const seat = new THREE.Mesh(
    new THREE.BoxGeometry(seatW, 0.18, seatD),
    oakLightMat
  );
  seat.position.set(0, seatH, 0);
  chair.add(seat);

  // 4 Sturdy Steel Chair Legs + Rubber Glides
  const cLegGeo = new THREE.BoxGeometry(0.16, seatH, 0.16);
  const cx = seatW / 2 - 0.22;
  const cz = seatD / 2 - 0.22;
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const cLeg = new THREE.Mesh(cLegGeo, steelFrameMat);
      cLeg.position.set(sx * cx, seatH / 2, sz * cz);
      chair.add(cLeg);

      const cFoot = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.08, 0.19), footMat);
      cFoot.position.set(sx * cx, 0.04, sz * cz);
      chair.add(cFoot);
    }
    // Tall backrest upright tubes rising from rear (+Z) legs
    const upright = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 2.72, 0.15),
      steelFrameMat
    );
    upright.position.set(sx * cx, seatH + 1.32, cz + 0.06);
    upright.rotation.x = 0.07;
    chair.add(upright);
  }

  // Ergonomic double wooden backrest slats (clearly visible above desktop!)
  const backUpper = new THREE.Mesh(
    new THREE.BoxGeometry(seatW - 0.08, 0.8, 0.16),
    oakLightMat
  );
  backUpper.position.set(0, seatH + 2.22, cz + 0.16);
  backUpper.rotation.x = 0.07;
  const backLower = new THREE.Mesh(
    new THREE.BoxGeometry(seatW - 0.08, 0.48, 0.14),
    oakEdgeMat
  );
  backLower.position.set(0, seatH + 1.32, cz + 0.09);
  backLower.rotation.x = 0.07;
  chair.add(backUpper, backLower);

  set.add(chair);
  return set;
}

/**
 * Builds the complete Indoor School IPA Science Laboratory Environment:
 * - Oak Science Lab Workbench Table (top surface flush at y = 0)
 * - Tiled school laboratory floor (y = -4.2) & ceiling with fluorescent light panels
 * - Back & side classroom walls with wooden wainscot & chair rail
 * - Classic Green Classroom Chalkboard ("LABORATORIUM IPA SEKOLAH")
 * - Framed Wall Poster: "BAGIAN-BAGIAN MATA" with labeled eyeball cross-section
 * - 3D Anatomical Human Skeleton ("Kerangka Manusia") on rolling stand right next to the cabinet
 * - Glass-front Science Apparatus Cabinet ("Lemari Alat IPA") filled with flasks, microscope & books
 * - Multi-pane Laboratory Windows ("Jendela Laboratorium") on back & left walls with schoolyard view
 * - School Laboratory Entrance Door ("Pintu Masuk LAB IPA") with glass pane, handle & room sign
 * - Analog Classroom Wall Clock & Overhead Desk Pendant Lamp
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
  const floorY = -tableHeight;

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

  const tabletop = new THREE.Mesh(
    new THREE.BoxGeometry(tableWidth, topThickness, tableDepth),
    woodTopMat
  );
  tabletop.position.set(tableCenterX, -topThickness / 2, 0);
  tabletop.receiveShadow = true;
  tabletop.castShadow = true;
  room.add(tabletop);

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

  const apron = new THREE.Mesh(
    new THREE.BoxGeometry(tableWidth - 1.2, 0.52, tableDepth - 1.2),
    steelLegMat
  );
  apron.position.set(tableCenterX, -topThickness - 0.26, 0);
  room.add(apron);

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
        new THREE.CylinderGeometry(0.24, 0.28, 0.12, 12),
        rubberFootMat
      );
      glide.position.set(lx, floorY + 0.06, lz);
      room.add(glide);
    }

    const sideBar = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.16, legOffsetZ * 2),
      steelLegMat
    );
    sideBar.position.set(tableCenterX + sx * legOffsetX, floorY + 0.9, 0);
    room.add(sideBar);
  }

  const backStretcher = new THREE.Mesh(
    new THREE.BoxGeometry(legOffsetX * 2, 0.16, 0.16),
    steelLegMat
  );
  backStretcher.position.set(tableCenterX, floorY + 0.9, -legOffsetZ);
  room.add(backStretcher);

  // === 2. CLASSROOM CHECKERED DARK-GRAY FLOOR & BRIGHT CEILING ===
  const roomWidth = 40.0; // X spans from -21.5 to +18.5
  const roomCenterX = -1.5;
  const backWallZ = -14.0;
  const frontWallZ = 37.0; // Spacious depth so full zoom-out stays cleanly inside the room
  const roomDepth = frontWallZ - backWallZ; // 51.0 units deep
  const roomCenterZ = (backWallZ + frontWallZ) / 2;
  const wallHeight = 16.4; // Y from -4.2 to +12.2
  const ceilingY = floorY + wallHeight;

  const floorTex = createClassroomFloorTexture(maxAnisotropy);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(roomWidth + 2, roomDepth + 2),
    new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.68,
      metalness: 0.08,
    })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(roomCenterX, floorY, roomCenterZ);
  floor.receiveShadow = true;
  room.add(floor);

  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(roomWidth + 2, roomDepth + 2),
    new THREE.MeshStandardMaterial({
      color: 0xf4f6f9,
      roughness: 0.92,
      metalness: 0.01,
    })
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(roomCenterX, ceilingY, roomCenterZ);
  room.add(ceiling);

  // Recessed school lab fluorescent ceiling light panels
  const panelFrameMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.45,
    metalness: 0.25,
  });
  const panelGlowMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  for (const lx of [-10.5, -1.5, 7.5]) {
    for (const lz of [-8.5, 1.5, 11.5, 21.5, 30.5]) {
      const fixture = new THREE.Mesh(
        new THREE.BoxGeometry(4.2, 0.12, 1.15),
        panelFrameMat
      );
      fixture.position.set(lx, ceilingY - 0.08, lz);
      const tube = new THREE.Mesh(
        new THREE.PlaneGeometry(3.85, 0.85),
        panelGlowMat
      );
      tube.rotation.x = Math.PI / 2;
      tube.position.set(lx, ceilingY - 0.15, lz);
      room.add(fixture, tube);
    }
  }

  // === 3. LIGHT-GRAY UPPER WALLS ("ABU MUDA") & LOWER-HALF WOOD WALLPAPER ("MOTIF KAYU") ===
  const upperWallMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1, // Clean soft light gray (abu muda) classroom upper wall
    roughness: 0.9,
    metalness: 0.0,
  });
  const woodWallpaperTex = createWoodWallpaperTexture(maxAnisotropy, isLowPower);
  const wainscotMat = new THREE.MeshStandardMaterial({
    map: woodWallpaperTex, // Full lower-half warm wood-motif wallpaper across all 4 walls
    roughness: 0.68,
    metalness: 0.04,
  });
  const woodTrimMat = new THREE.MeshStandardMaterial({
    color: 0x7c4f29,
    roughness: 0.58,
    metalness: 0.06,
  });
  const windowFrameMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    roughness: 0.42,
    metalness: 0.25,
  });
  const sharedGlassMat = new THREE.MeshStandardMaterial({
    color: 0xe0f2fe,
    roughness: 0.12,
    metalness: 0.25,
    transparent: true,
    opacity: 0.24,
    depthWrite: false,
  });

  // Lower-half wood wallpaper rises to y = +2.60 (6.8 units tall — clearly half of the room wall!)
  const woodWallHeight = 6.8;

  // Back classroom wall (z = -14.0)
  const backWall = new THREE.Mesh(
    new THREE.PlaneGeometry(roomWidth, wallHeight),
    upperWallMat
  );
  backWall.position.set(roomCenterX, floorY + wallHeight / 2, backWallZ);
  backWall.receiveShadow = true;
  room.add(backWall);

  const backWainscot = new THREE.Mesh(
    new THREE.BoxGeometry(roomWidth, woodWallHeight, 0.1),
    wainscotMat
  );
  backWainscot.position.set(
    roomCenterX,
    floorY + woodWallHeight / 2,
    backWallZ + 0.05
  );
  const backChairRail = new THREE.Mesh(
    new THREE.BoxGeometry(roomWidth, 0.22, 0.18),
    woodTrimMat
  );
  backChairRail.position.set(
    roomCenterX,
    floorY + woodWallHeight + 0.06,
    backWallZ + 0.09
  );
  const backBaseboard = new THREE.Mesh(
    new THREE.BoxGeometry(roomWidth, 0.32, 0.16),
    darkEdgeMat
  );
  backBaseboard.position.set(roomCenterX, floorY + 0.16, backWallZ + 0.08);
  room.add(backWainscot, backChairRail, backBaseboard);

  // Front enclosure wall behind camera (z = +21.5) with matching light-gray + wood wallpaper
  const frontWall = new THREE.Mesh(
    new THREE.PlaneGeometry(roomWidth, wallHeight),
    upperWallMat
  );
  frontWall.rotation.y = Math.PI;
  frontWall.position.set(roomCenterX, floorY + wallHeight / 2, frontWallZ);
  const frontWainscot = backWainscot.clone();
  frontWainscot.position.z = frontWallZ - 0.05;
  const frontRail = backChairRail.clone();
  frontRail.position.z = frontWallZ - 0.09;
  const frontBaseboard = backBaseboard.clone();
  frontBaseboard.position.z = frontWallZ - 0.08;
  room.add(frontWall, frontWainscot, frontRail, frontBaseboard);

  // Left & Right side light-gray walls with full lower-half wood-motif wallpaper
  const leftWallX = roomCenterX - roomWidth / 2; // -20.0
  const rightWallX = roomCenterX + roomWidth / 2; // +17.0

  const leftWall = new THREE.Mesh(
    new THREE.PlaneGeometry(roomDepth, wallHeight),
    upperWallMat
  );
  leftWall.rotation.y = Math.PI / 2;
  leftWall.position.set(leftWallX, floorY + wallHeight / 2, roomCenterZ);
  room.add(leftWall);

  const leftWainscot = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, woodWallHeight, roomDepth),
    wainscotMat
  );
  leftWainscot.position.set(
    leftWallX + 0.05,
    floorY + woodWallHeight / 2,
    roomCenterZ
  );
  const leftRail = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.22, roomDepth),
    woodTrimMat
  );
  leftRail.position.set(
    leftWallX + 0.09,
    floorY + woodWallHeight + 0.06,
    roomCenterZ
  );
  const leftBaseboard = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.32, roomDepth),
    darkEdgeMat
  );
  leftBaseboard.position.set(leftWallX + 0.08, floorY + 0.16, roomCenterZ);
  room.add(leftWainscot, leftRail, leftBaseboard);

  const rightWall = new THREE.Mesh(
    new THREE.PlaneGeometry(roomDepth, wallHeight),
    upperWallMat
  );
  rightWall.rotation.y = -Math.PI / 2;
  rightWall.position.set(rightWallX, floorY + wallHeight / 2, roomCenterZ);
  room.add(rightWall);

  const rightWainscot = leftWainscot.clone();
  rightWainscot.position.x = rightWallX - 0.05;
  const rightRail = leftRail.clone();
  rightRail.position.x = rightWallX - 0.09;
  const rightBaseboard = leftBaseboard.clone();
  rightBaseboard.position.x = rightWallX - 0.08;
  room.add(rightWainscot, rightRail, rightBaseboard);

  // === 4. LABORATORY WINDOWS (Sitting cleanly above the wood-wallpaper chair rail!) ===
  const windowViewTex = createWindowViewTexture(maxAnisotropy, isLowPower);

  const backWindow = createLabWindowAssembly(
    4.4,
    5.2,
    windowViewTex,
    windowFrameMat,
    woodTrimMat,
    sharedGlassMat,
    true
  );
  backWindow.position.set(-16.0, 5.45, backWallZ + 0.06);
  room.add(backWindow);

  // Five large side laboratory windows evenly spaced along the light-gray left wall
  for (const wz of [-7.5, 0.5, 8.5, 16.5, 24.5]) {
    const sideWin = createLabWindowAssembly(
      5.4,
      5.2,
      windowViewTex,
      windowFrameMat,
      woodTrimMat,
      sharedGlassMat,
      wz === 0.5 || wz === 16.5
    );
    sideWin.rotation.y = Math.PI / 2;
    sideWin.position.set(leftWallX + 0.06, 5.45, wz);
    room.add(sideWin);
  }

  // === 5. FRAMED CLASSROOM CHALKBOARD (Center-Left Back Wall) ===
  const chalkCanvas = document.createElement('canvas');
  chalkCanvas.width = isLowPower ? 512 : 1024;
  chalkCanvas.height = isLowPower ? 256 : 512;
  const cCtx = chalkCanvas.getContext('2d')!;
  if (isLowPower) cCtx.scale(0.5, 0.5);
  cCtx.fillStyle = '#183a2d';
  cCtx.fillRect(0, 0, 1024, 512);

  const chalkSpecks = isLowPower ? 140 : 360;
  for (let i = 0; i < chalkSpecks; i++) {
    cCtx.fillStyle = 'rgba(255, 255, 255, 0.025)';
    cCtx.fillRect(
      Math.random() * 1024,
      Math.random() * 512,
      20 + Math.random() * 50,
      4
    );
  }

  cCtx.fillStyle = 'rgba(248, 250, 252, 0.9)';
  cCtx.font = '700 46px "Plus Jakarta Sans", sans-serif';
  cCtx.textAlign = 'center';
  cCtx.fillText('LABORATORIUM IPA SEKOLAH', 512, 92);

  cCtx.fillStyle = 'rgba(253, 224, 71, 0.88)';
  cCtx.font = '600 30px "Plus Jakarta Sans", sans-serif';
  cCtx.fillText('Materi Cahaya: Cermin Cekung · Cermin Cembung · Mata', 512, 148);

  // Simple chalk diagrams on chalkboard
  cCtx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  cCtx.lineWidth = 4;
  cCtx.beginPath();
  cCtx.arc(285, 305, 82, -0.72, 0.72);
  cCtx.stroke();
  cCtx.beginPath();
  cCtx.moveTo(150, 305);
  cCtx.lineTo(380, 305);
  cCtx.stroke();
  cCtx.fillStyle = 'rgba(186, 230, 253, 0.85)';
  cCtx.font = '600 24px "Plus Jakarta Sans", sans-serif';
  cCtx.fillText('Cermin Cekung (F)', 265, 425);

  cCtx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  cCtx.beginPath();
  cCtx.arc(745, 305, 74, 0, Math.PI * 2);
  cCtx.stroke();
  cCtx.fillStyle = 'rgba(253, 186, 116, 0.88)';
  cCtx.fillText('Retina & Lensa', 745, 425);

  const chalkTex = new THREE.CanvasTexture(chalkCanvas);
  chalkTex.colorSpace = THREE.SRGBColorSpace;
  chalkTex.anisotropy = maxAnisotropy;

  const boardGroup = new THREE.Group();
  boardGroup.position.set(-4.8, 5.0, backWallZ + 0.18);

  const boardW = 8.4;
  const boardH = 4.5;
  const boardFace = new THREE.Mesh(
    new THREE.PlaneGeometry(boardW, boardH),
    new THREE.MeshStandardMaterial({ map: chalkTex, roughness: 0.92 })
  );
  boardGroup.add(boardFace);

  const fTop = new THREE.Mesh(
    new THREE.BoxGeometry(boardW + 0.4, 0.22, 0.22),
    woodTrimMat
  );
  fTop.position.set(0, boardH / 2 + 0.1, 0.04);
  const fBot = new THREE.Mesh(
    new THREE.BoxGeometry(boardW + 0.4, 0.26, 0.42),
    woodTrimMat
  );
  fBot.position.set(0, -boardH / 2 - 0.12, 0.14);
  const fLeft = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, boardH + 0.44, 0.22),
    woodTrimMat
  );
  fLeft.position.set(-boardW / 2 - 0.1, 0, 0.04);
  const fRight = fLeft.clone();
  fRight.position.x = boardW / 2 + 0.1;
  boardGroup.add(fTop, fBot, fLeft, fRight);
  room.add(boardGroup);

  // === 6. WALL POSTERS: "BAGIAN-BAGIAN MATA" & "BAGIAN-BAGIAN TELINGA" ===
  const eyePosterTex = createEyeAnatomyPosterTexture(maxAnisotropy, isLowPower);
  const eyePoster = createWallPosterAssembly(3.2, 4.0, eyePosterTex, woodTrimMat);
  eyePoster.position.set(1.65, 5.05, backWallZ + 0.16);
  room.add(eyePoster);

  const earPosterTex = createEarAnatomyPosterTexture(maxAnisotropy, isLowPower);
  const earPosterBack = createWallPosterAssembly(3.1, 4.0, earPosterTex, woodTrimMat);
  earPosterBack.position.set(-11.35, 5.05, backWallZ + 0.16);
  room.add(earPosterBack);

  const earPosterRight = createWallPosterAssembly(4.1, 5.0, earPosterTex, woodTrimMat);
  earPosterRight.rotation.y = -Math.PI / 2;
  earPosterRight.position.set(rightWallX - 0.16, 5.2, -4.5);
  room.add(earPosterRight);

  // === 6B. 4 PROPORTIONAL STUDENT DESKS & CHAIRS BACK NEAR THE REAR WALL & ALIGNED WITH EXIT DOOR ===
  // Positioned further back near the rear wall (frontWallZ = 37.0) with realistic aisle clearance behind chairs,
  // and cleanly lined up in a straight row aligned with the laboratory exit door on the right wall!
  const exitDoorZ = 30.8;
  const studentDeskXs = [-13.5, -6.1, 1.3, 8.7];
  studentDeskXs.forEach((sx, idx) => {
    const deskChairSet = createStudentDeskAndChairAssembly(idx);
    deskChairSet.position.set(sx, floorY, exitDoorZ);
    room.add(deskChairSet);
  });

  // === 6C. SIDE CHEMISTRY WORKBENCHES WITH LAB GLASSWARE ("Meja Praktikum Kimia") ===
  // 1) Back-Left chemistry table under the back window
  const backChemTable = createChemistryLabTableAssembly(4.4, 2.0, 0, isLowPower);
  backChemTable.position.set(-16.2, floorY, backWallZ + 1.55);
  room.add(backChemTable);

  // 2) Two chemistry tables lining the Left Side Wall beneath the laboratory windows
  const leftChemTable1 = createChemistryLabTableAssembly(4.8, 2.0, 1, isLowPower);
  leftChemTable1.rotation.y = Math.PI / 2;
  leftChemTable1.position.set(leftWallX + 1.45, floorY, -5.5);
  room.add(leftChemTable1);

  const leftChemTable2 = createChemistryLabTableAssembly(4.8, 2.0, 2, isLowPower);
  leftChemTable2.rotation.y = Math.PI / 2;
  leftChemTable2.position.set(leftWallX + 1.45, floorY, 1.4);
  room.add(leftChemTable2);

  // 3) Two chemistry tables lining the Right Side Wall beneath & beside the Ear Poster
  const rightChemTable1 = createChemistryLabTableAssembly(4.8, 2.0, 2, isLowPower);
  rightChemTable1.rotation.y = -Math.PI / 2;
  rightChemTable1.position.set(rightWallX - 1.45, floorY, -5.2);
  room.add(rightChemTable1);

  const rightChemTable2 = createChemistryLabTableAssembly(4.8, 2.0, 0, isLowPower);
  rightChemTable2.rotation.y = -Math.PI / 2;
  rightChemTable2.position.set(rightWallX - 1.45, floorY, 1.4);
  room.add(rightChemTable2);

  // === 7. 3D HUMAN SKELETON ON ROLLING STAND ("Kerangka Manusia") ===
  // Standing proudly on the floor right beside the glass apparatus cabinet!
  const skeleton = createHumanSkeletonAssembly(isLowPower);
  skeleton.position.set(6.4, floorY, backWallZ + 1.85);
  skeleton.rotation.y = -0.32;
  room.add(skeleton);

  // === 8. GLASS-FRONT LAB APPARATUS CABINET ("Lemari Alat IPA") ===
  const cabinet = createLabCabinetAssembly(sharedGlassMat, isLowPower);
  cabinet.position.set(10.5, floorY, backWallZ + 0.95);
  room.add(cabinet);

  // === 9. LABORATORY EXIT / ENTRANCE DOOR ("Pintu Keluar LAB IPA") ===
  // Cleanly positioned on the right wall aligned with the 4 rear student desks & chairs (no door next to cabinet!)
  const entranceDoorSide = createLabDoorAssembly(
    maxAnisotropy,
    woodTrimMat,
    sharedGlassMat
  );
  entranceDoorSide.rotation.y = -Math.PI / 2;
  entranceDoorSide.position.set(rightWallX - 0.12, floorY, exitDoorZ);
  room.add(entranceDoorSide);

  // === 10. ANALOG CLASSROOM WALL CLOCK (Above Chalkboard / Poster) ===
  const clockGroup = new THREE.Group();
  clockGroup.position.set(-0.6, 8.85, backWallZ + 0.14);
  const clockRim = new THREE.Mesh(
    new THREE.CylinderGeometry(0.66, 0.68, 0.18, 24),
    darkEdgeMat
  );
  clockRim.rotation.x = Math.PI / 2;
  const clockFace = new THREE.Mesh(
    new THREE.CircleGeometry(0.58, 24),
    new THREE.MeshStandardMaterial({
      map: createWallClockTexture(maxAnisotropy),
      roughness: 0.45,
    })
  );
  clockFace.position.z = 0.1;
  clockGroup.add(clockRim, clockFace);
  room.add(clockGroup);

  // === 11. OVERHEAD LAB PENDANT LIGHT SHADE (High above table) ===
  const lampGroup = new THREE.Group();
  lampGroup.position.set(tableCenterX, 11.1, 0);
  const cord = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 3.2, 8),
    darkEdgeMat
  );
  cord.position.y = 1.6;
  const shade = new THREE.Mesh(
    new THREE.ConeGeometry(1.35, 0.72, isLowPower ? 16 : 24, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
      metalness: 0.5,
      side: THREE.DoubleSide,
    })
  );
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xfff7ed })
  );
  bulb.position.y = -0.22;
  lampGroup.add(cord, shade, bulb);
  room.add(lampGroup);

  return room;
}
