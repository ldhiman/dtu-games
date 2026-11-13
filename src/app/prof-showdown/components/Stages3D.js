// src/app/prof-showdown/components/Stages3D.js
/**
 * 2.5D High-Fidelity 3D Fighting Stages for Prof Showdown
 *
 * Implements rich, authentic DTU campus architectures with dynamic atmospheric lighting,
 * procedural canvas floor textures, cheering crowd silhouettes, and scenic backdrops:
 *  - Open Air Theatre (Wind Point): Concentric sandstone tiers, tensile canopy, cheering crowd, evening sunset sky
 *  - Admin Block & Tricolor Lawn: Clock tower cupola with working clock, waving Indian flag, colonnades, lush lawn
 *  - Mech-C Lathe Bay: Industrial saw-tooth bays, overhead steel trusses, Formula Student car, spark particles
 *  - Dr. B.R. Ambedkar Audi: Proscenium stage, velvet curtains, stage spotlights with volumetric cones
 *  - DTU Main Gate (Bawana Rd): Cantilevered T-canopy, guard rooms, boom barriers, campus entrance avenue
 */

import * as THREE from 'three';

// Procedural Canvas Texture Generators
function createStageTexture(type) {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (type === 'sandstone_pavers') {
    canvas.width = 512;
    canvas.height = 512;
    ctx.fillStyle = '#b45309';
    ctx.fillRect(0, 0, 512, 512);

    // Stone block grid
    const cols = 8;
    const rows = 16;
    const cw = 512 / cols;
    const rh = 512 / rows;

    for (let r = 0; r < rows; r++) {
      const xOffset = (r % 2) * (cw / 2);
      for (let c = -1; c <= cols; c++) {
        const x = c * cw + xOffset;
        const y = r * rh;
        const shade = Math.floor(180 + Math.random() * 50);
        ctx.fillStyle = `rgb(${shade + 20}, ${shade - 30}, ${Math.floor(shade * 0.3)})`;
        ctx.fillRect(x + 2, y + 2, cw - 4, rh - 4);
      }
    }
  } else if (type === 'asphalt_road') {
    canvas.width = 512;
    canvas.height = 512;
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 512, 512);

    // Subtle asphalt grain
    for (let i = 0; i < 4000; i++) {
      const gx = Math.random() * 512;
      const gy = Math.random() * 512;
      ctx.fillStyle = Math.random() > 0.5 ? '#334155' : '#0f172a';
      ctx.fillRect(gx, gy, 2, 2);
    }

    // Yellow arena perimeter line
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 12;
    ctx.strokeRect(24, 24, 464, 464);
  } else if (type === 'workshop_concrete') {
    canvas.width = 512;
    canvas.height = 512;
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, 512, 512);

    // Industrial floor caution stripes
    ctx.fillStyle = '#eab308';
    for (let x = -512; x < 1024; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 32, 0);
      ctx.lineTo(x + 32 - 120, 512);
      ctx.lineTo(x - 120, 512);
      ctx.closePath();
      ctx.fill();
    }
    // Gray center fighting zone
    ctx.fillStyle = '#475569';
    ctx.fillRect(64, 64, 384, 384);
  } else if (type === 'audi_wood') {
    canvas.width = 512;
    canvas.height = 512;
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, 0, 512, 512);

    // Polished stage wooden planks
    for (let y = 0; y < 512; y += 24) {
      ctx.fillStyle = y % 48 === 0 ? '#92400e' : '#78350f';
      ctx.fillRect(0, y, 512, 22);
      ctx.fillStyle = '#451a03';
      ctx.fillRect(0, y + 22, 512, 2);
    }
  } else if (type === 'grass_lawn') {
    canvas.width = 512;
    canvas.height = 512;
    ctx.fillStyle = '#166534';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 3000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#15803d' : '#14532d';
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 3, 3);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

export function createStage3D(stageConfig) {
  const group = new THREE.Group();
  group.name = `Stage_${stageConfig.id}`;

  // Procedural Materials
  const floorTex =
    stageConfig.id === 'oat'
      ? createStageTexture('sandstone_pavers')
      : stageConfig.id === 'admin'
      ? createStageTexture('grass_lawn')
      : stageConfig.id === 'mech'
      ? createStageTexture('workshop_concrete')
      : stageConfig.id === 'audi'
      ? createStageTexture('audi_wood')
      : createStageTexture('asphalt_road');

  if (floorTex) floorTex.repeat.set(4, 3);

  const matFloor = new THREE.MeshStandardMaterial({
    map: floorTex,
    roughness: stageConfig.id === 'audi' ? 0.35 : 0.75,
    metalness: stageConfig.id === 'audi' ? 0.2 : 0.05,
  });

  const matBrick = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.82, metalness: 0.05 });
  const matCream = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6, metalness: 0.1 });
  const matSandstone = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.75, metalness: 0.05 });
  const matCurbYellow = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5, metalness: 0.1 });
  const matCurbBlack = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7, metalness: 0.1 });
  const matSteel = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.35, metalness: 0.8 });
  const matGlowGold = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
  const matCrowd = new THREE.MeshBasicMaterial({ color: 0x1e1b4b });

  // --------------------------------------------------------------------------
  // 1. SKY DOME BACKDROP (Sunset / Night Atmosphere)
  // --------------------------------------------------------------------------
  const skyRadius = 45;
  const skyGeo = new THREE.SphereGeometry(skyRadius, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
  const skyMat = new THREE.MeshBasicMaterial({
    color:
      stageConfig.id === 'oat'
        ? 0x2e1065 // Deep twilight violet
        : stageConfig.id === 'admin'
        ? 0x0f172a // Navy twilight
        : stageConfig.id === 'mech'
        ? 0x18181b // Industrial dark
        : stageConfig.id === 'audi'
        ? 0x1e1b4b // Dramatic stage dark
        : 0x172554, // Deep blue
    side: THREE.BackSide,
  });
  const skyDome = new THREE.Mesh(skyGeo, skyMat);
  skyDome.position.y = -2;
  group.add(skyDome);

  // Distant glowing stars / streetlights in sky
  const starsGroup = new THREE.Group();
  for (let s = 0; s < 45; s++) {
    const starMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.12, 0.12),
      new THREE.MeshBasicMaterial({ color: Math.random() > 0.4 ? 0xfef08a : 0x38bdf8 })
    );
    const ang = (s / 45) * Math.PI * 1.8 - Math.PI * 0.9;
    const dist = 32 + Math.random() * 8;
    const h = 8 + Math.random() * 16;
    starMesh.position.set(Math.sin(ang) * dist, h, -Math.cos(ang) * dist);
    starsGroup.add(starMesh);
  }
  group.add(starsGroup);

  // --------------------------------------------------------------------------
  // 2. STAGE FLOOR DECK & ARENA PERIMETER
  // --------------------------------------------------------------------------
  const floorGeo = new THREE.PlaneGeometry(26, 16);
  floorGeo.rotateX(-Math.PI / 2);
  const floorMesh = new THREE.Mesh(floorGeo, matFloor);
  floorMesh.receiveShadow = true;
  group.add(floorMesh);

  // Raised Fighting Ring Platform Edges
  for (let x = -10.5; x <= 10.5; x += 1.0) {
    const curbGeo = new THREE.BoxGeometry(0.95, 0.16, 0.32);
    const curbMat = Math.round(Math.abs(x)) % 2 === 0 ? matCurbYellow : matCurbBlack;

    // Front boundary
    const curbFront = new THREE.Mesh(curbGeo, curbMat);
    curbFront.position.set(x, 0.08, 3.4);
    curbFront.receiveShadow = true;

    // Back boundary
    const curbBack = curbFront.clone();
    curbBack.position.z = -3.4;

    group.add(curbFront, curbBack);
  }

  // DTU Center Ring Decal (Octagon Arena Emblem)
  const ringGeo = new THREE.RingGeometry(1.7, 1.85, 8);
  ringGeo.rotateX(-Math.PI / 2);
  const ringMesh = new THREE.Mesh(ringGeo, matGlowGold);
  ringMesh.position.y = 0.02;
  group.add(ringMesh);

  // Center Inner Ring
  const innerRing = new THREE.Mesh(
    new THREE.RingGeometry(0.5, 0.58, 16).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  );
  innerRing.position.y = 0.022;
  group.add(innerRing);

  // --------------------------------------------------------------------------
  // 3. STAGE-SPECIFIC ARCHITECTURES & CROWD ANIMATIONS
  // --------------------------------------------------------------------------
  if (stageConfig.id === 'oat') {
    // ========================================================================
    // OPEN AIR THEATRE (WIND POINT)
    // ========================================================================
    // Semicircular stepped amphitheatre tiers
    for (let t = 0; t < 7; t++) {
      const r = 9.0 + t * 1.55;
      const step = new THREE.Mesh(
        new THREE.CylinderGeometry(r, r + 0.35, 0.6, 36, 1, false, Math.PI * 0.12, Math.PI * 0.76),
        t % 2 === 0 ? matSandstone : matBrick
      );
      step.position.set(0, 0.3 + t * 0.5, -5.8);
      step.receiveShadow = true;
      group.add(step);

      // Cheering student crowd silhouettes on tiers!
      for (let c = -14; c <= 14; c += 2.2) {
        if (Math.random() > 0.25) {
          const student = createCrowdMember(c, 0.6 + t * 0.5, -5.8 - (t * 1.1 + Math.sin(c * 0.2) * 1.5));
          group.add(student);
        }
      }
    }

    // Cantilevered white tensile canopy shell overhead
    const canopyGeo = new THREE.CylinderGeometry(12, 12, 18, 28, 1, true, -Math.PI * 0.3, Math.PI * 0.6);
    canopyGeo.rotateZ(Math.PI / 2);
    canopyGeo.scale(1.15, 0.38, 1.0);
    const canopy = new THREE.Mesh(canopyGeo, matCream);
    canopy.position.set(0, 7.2, -4.8);
    canopy.rotation.x = -0.22;
    canopy.castShadow = true;
    group.add(canopy);

    // Twin steel support masts with floodlights
    [-8.0, 8.0].forEach((mx) => {
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 11, 8), matSteel);
      mast.position.set(mx, 5.5, -3.2);
      mast.rotation.z = mx > 0 ? -0.15 : 0.15;
      group.add(mast);

      // Warm amber floodlight fixture
      const flood = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.45, 0.6), matSteel);
      flood.position.set(mx, 10.2, -3.0);
      const lens = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.35), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
      lens.position.set(mx, 10.2, -2.68);
      group.add(flood, lens);

      // Volumetric Light Cone
      const cone = createLightCone(mx, 10.2, -2.6, 0.8, 8.5, 0xfef08a, 0.12);
      group.add(cone);
    });
  } else if (stageConfig.id === 'admin') {
    // ========================================================================
    // ADMIN BLOCK & TRICOLOR LAWN
    // ========================================================================
    // Red-brick administrative facade with cornice
    const facade = new THREE.Mesh(new THREE.BoxGeometry(22, 8.5, 3.0), matBrick);
    facade.position.set(0, 4.25, -6.5);
    facade.castShadow = true;
    group.add(facade);

    // White cornices & parapet
    const cornice = new THREE.Mesh(new THREE.BoxGeometry(22.8, 0.45, 3.4), matCream);
    cornice.position.set(0, 8.6, -6.5);
    group.add(cornice);

    // Grand Entrance Colonnade Pillars
    for (let px = -7.2; px <= 7.2; px += 2.4) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.32, 6.2, 12), matCream);
      col.position.set(px, 3.1, -4.8);
      col.castShadow = true;
      group.add(col);
    }

    // 4-Sided Clock Tower Cupola
    const tower = new THREE.Mesh(new THREE.BoxGeometry(4.2, 5.5, 3.8), matBrick);
    tower.position.set(0, 11.2, -6.5);
    const towerRoof = new THREE.Mesh(new THREE.ConeGeometry(3.2, 2.5, 4), matSandstone);
    towerRoof.position.set(0, 15.2, -6.5);
    towerRoof.rotation.y = Math.PI / 4;
    group.add(tower, towerRoof);

    // Illuminated Clock Dial with Hour/Minute Hands
    const clockFace = new THREE.Mesh(new THREE.CircleGeometry(1.1, 24), matCream);
    clockFace.position.set(0, 11.4, -4.58);
    const centerPin = new THREE.Mesh(new THREE.CircleGeometry(0.12, 12), matCurbBlack);
    centerPin.position.set(0, 11.4, -4.57);
    const handH = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.65), matCurbBlack);
    handH.position.set(0.18, 11.6, -4.56);
    handH.rotation.z = -0.6;
    const handM = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.9), matCurbBlack);
    handM.position.set(0, 11.8, -4.56);
    group.add(clockFace, centerPin, handH, handM);

    // 15m Stainless Steel Flagpole with Indian National Flag (Tiranga)
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.14, 14, 8), matSteel);
    pole.position.set(-7.5, 7.0, -3.2);
    group.add(pole);

    // Tricolor flag stripes (Saffron, White with Ashoka Chakra, Green)
    const saffron = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.42), new THREE.MeshBasicMaterial({ color: 0xff9933 }));
    saffron.position.set(-6.4, 13.6, -3.2);
    const white = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.42), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    white.position.set(-6.4, 13.18, -3.2);
    const chakra = new THREE.Mesh(new THREE.CircleGeometry(0.14, 16), new THREE.MeshBasicMaterial({ color: 0x000080 }));
    chakra.position.set(-6.4, 13.18, -3.19);
    const green = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.42), new THREE.MeshBasicMaterial({ color: 0x138808 }));
    green.position.set(-6.4, 12.76, -3.2);
    group.add(saffron, white, chakra, green);

    // Cheering students on the Admin Lawn edge
    for (let c = -11; c <= 11; c += 2.4) {
      if (Math.abs(c) > 3.0) {
        const student = createCrowdMember(c, 0.6, -5.0);
        group.add(student);
      }
    }
  } else if (stageConfig.id === 'mech') {
    // ========================================================================
    // MECH-C WORKSHOP BAY
    // ========================================================================
    const bayWall = new THREE.Mesh(new THREE.BoxGeometry(24, 9.5, 2.0), matSteel);
    bayWall.position.set(0, 4.75, -7.0);
    group.add(bayWall);

    // Industrial overhead roof trusses
    for (let tx = -10; tx <= 10; tx += 4.0) {
      const truss = new THREE.Mesh(new THREE.BoxGeometry(0.28, 4.2, 7.5), matSteel);
      truss.position.set(tx, 7.8, -3.0);
      group.add(truss);
    }

    // Industrial Lathe Machines in backdrop
    [-6.5, 6.5].forEach((lx) => {
      const latheBed = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.2, 1.1), matCurbBlack);
      latheBed.position.set(lx, 0.6, -4.8);
      const headstock = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.0, 0.9), matSteel);
      headstock.position.set(lx - 0.9, 1.2, -4.8);
      const chuck = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.25, 12), matSteel);
      chuck.rotation.z = Math.PI / 2;
      chuck.position.set(lx - 0.35, 1.3, -4.8);
      group.add(latheBed, headstock, chuck);
    });

    // Formula Student Racecar on workshop stands in center-left
    const carGroup = new THREE.Group();
    carGroup.position.set(-4.5, 0.6, -4.2);
    const carBody = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.55, 1.2), new THREE.MeshStandardMaterial({ color: 0xdc2626 }));
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.2, 4), new THREE.MeshStandardMaterial({ color: 0xdc2626 }));
    nose.rotation.z = -Math.PI / 2;
    nose.position.set(1.8, -0.05, 0);
    const wing = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.65, 1.6), matCurbBlack);
    wing.position.set(-1.4, 0.5, 0);
    // Wheels
    [[-1.0, 0.65], [-1.0, -0.65], [1.1, 0.65], [1.1, -0.65]].forEach(([wx, wz]) => {
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.24, 12), matCurbBlack);
      tire.rotation.x = Math.PI / 2;
      tire.position.set(wx, -0.15, wz);
      carGroup.add(tire);
    });
    carGroup.add(carBody, nose, wing);
    group.add(carGroup);

    // Industrial pendant hanging lights
    [-5, 0, 5].forEach((hx) => {
      const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.5, 6), matSteel);
      wire.position.set(hx, 8.5, -2.5);
      const shade = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.4, 10), matSteel);
      shade.position.set(hx, 7.1, -2.5);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
      bulb.position.set(hx, 6.9, -2.5);
      group.add(wire, shade, bulb);
      group.add(createLightCone(hx, 6.9, -2.5, 0.4, 6.5, 0xfef08a, 0.08));
    });
  } else if (stageConfig.id === 'audi') {
    // ========================================================================
    // DR. B.R. AMBEDKAR AUDITORIUM (CONVOCATION STAGE)
    // ========================================================================
    // Raised stage plinth
    const stagePlinth = new THREE.Mesh(new THREE.BoxGeometry(24, 1.4, 5.0), matBrick);
    stagePlinth.position.set(0, 0.7, -5.2);
    group.add(stagePlinth);

    // Grand velvet proscenium curtains on left and right
    [-8.8, 8.8].forEach((cx) => {
      const curtain = new THREE.Mesh(new THREE.BoxGeometry(4.2, 11, 1.4), matBrick);
      curtain.position.set(cx, 5.5, -5.0);
      group.add(curtain);

      // Gold curtain tie tassel
      const tie = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.08, 8, 16), matGlowGold);
      tie.position.set(cx > 0 ? cx - 1.2 : cx + 1.2, 4.2, -4.2);
      group.add(tie);
    });

    // Convocation Ceremonial Golden Banner
    const bannerSlab = new THREE.Mesh(new THREE.BoxGeometry(16, 1.6, 0.3), matGlowGold);
    bannerSlab.position.set(0, 9.2, -5.0);
    group.add(bannerSlab);

    // Concert stage moving lights with overhead truss
    const stageTruss = new THREE.Mesh(new THREE.BoxGeometry(18, 0.35, 0.35), matSteel);
    stageTruss.position.set(0, 8.2, -3.2);
    group.add(stageTruss);

    [-6, -2, 2, 6].forEach((sx) => {
      const mover = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.45, 8), matCurbBlack);
      mover.position.set(sx, 7.9, -3.2);
      mover.rotation.x = 0.3;
      group.add(mover);

      const color = sx < 0 ? 0x38bdf8 : 0xf43f5e;
      const cone = createLightCone(sx, 7.8, -3.1, 0.5, 7.8, color, 0.16);
      group.add(cone);
    });
  } else {
    // ========================================================================
    // DTU MAIN GATE (BAWANA ROAD)
    // ========================================================================
    // Concrete Cantilevered T-Canopy
    const tCanopy = new THREE.Mesh(new THREE.BoxGeometry(22, 1.4, 5.5), matCream);
    tCanopy.position.set(0, 7.2, -5.0);
    tCanopy.castShadow = true;
    group.add(tCanopy);

    // Central Pillar Pier with red brick band
    const centerPier = new THREE.Mesh(new THREE.BoxGeometry(2.4, 7.2, 2.8), matCream);
    centerPier.position.set(0, 3.6, -5.0);
    centerPier.castShadow = true;
    const brickBand = new THREE.Mesh(new THREE.BoxGeometry(2.45, 1.6, 2.85), matBrick);
    brickBand.position.set(0, 4.2, -5.0);
    group.add(centerPier, brickBand);

    // Yellow and black automated boom barriers
    [-4.5, 4.5].forEach((bx) => {
      const barrierBox = new THREE.Mesh(new THREE.BoxGeometry(0.65, 1.2, 0.65), matCurbYellow);
      barrierBox.position.set(bx > 0 ? bx + 2.5 : bx - 2.5, 0.6, -3.2);

      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 5.2, 8), matCurbYellow);
      arm.rotation.z = Math.PI / 2;
      arm.position.set(bx, 1.15, -3.2);

      // Flashing red warning LED
      const led = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
      led.position.set(bx > 0 ? bx + 2.5 : bx - 2.5, 1.3, -3.2);

      group.add(barrierBox, arm, led);
    });

    // Campus Avenue Streetlamps
    [-8.5, 8.5].forEach((lx) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 6.5, 8), matSteel);
      post.position.set(lx, 3.25, -2.8);
      const lantern = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.4), new THREE.MeshBasicMaterial({ color: 0xfef08a }));
      lantern.position.set(lx, 6.4, -2.8);
      group.add(post, lantern);
      group.add(createLightCone(lx, 6.4, -2.8, 0.5, 6.2, 0xfef08a, 0.12));
    });
  }

  return group;
}

// Helper to create a stylized volumetric spotlight cone
function createLightCone(x, y, z, topR, height, colorHex, opacity = 0.15) {
  const geo = new THREE.ConeGeometry(topR * 3.5, height, 16, 1, true);
  geo.rotateX(Math.PI);
  const mat = new THREE.MeshBasicMaterial({
    color: colorHex,
    transparent: true,
    opacity: opacity,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const cone = new THREE.Mesh(geo, mat);
  cone.position.set(x, y - height * 0.5, z);
  return cone;
}

// Helper to create a cheering crowd student silhouette
function createCrowdMember(x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);

  const colors = [0x1e1b4b, 0x1e293b, 0x0f172a, 0x312e81, 0x172554];
  const mat = new THREE.MeshBasicMaterial({
    color: colors[Math.floor(Math.random() * colors.length)],
  });

  // Torso
  const torso = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.55, 0.22), mat);
  torso.position.y = 0.4;

  // Head
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), mat);
  head.position.y = 0.8;

  // Raised Cheering Arms
  const armL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.08), mat);
  armL.position.set(0.24, 0.65, 0);
  armL.rotation.z = -0.5 - Math.random() * 0.4;

  const armR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.08), mat);
  armR.position.set(-0.24, 0.65, 0);
  armR.rotation.z = 0.5 + Math.random() * 0.4;

  g.add(torso, head, armL, armR);
  return g;
}
