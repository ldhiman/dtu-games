// src/app/prof-showdown/components/Fighter3D.js
/**
 * 2.5D Articulated Procedural 3D Character Model for Prof Showdown
 *
 * Richly detailed, authentic DTU (Delhi Technological University) faculty & student archetypes:
 * - Dean of Detain (Prof. Sharma): Formal maroon 3-piece blazer with lapels, DTU crest pin, pocket square,
 *   receding gray hair, spectacles, formal black Oxford shoes, official DTU Attendance & Detention Register with red stamp.
 * - Dr. Math Matrix (Prof. Gupta): Khadi kurta with mandarin collar, Nehru waistcoat (Sadri), swinging DTU Faculty
 *   ID card lanyard, silver Parker fountain pen, round silver spectacles, precision laser engineering compass.
 * - The Lab In-Charge (Ustadji Mech-C): Industrial navy boiler suit with grease smudges, yellow DTU safety hardhat,
 *   tinted flip-down visor, heavy leather work gloves, steel-toed workboots, massive 24-inch workshop pipe wrench.
 * - The DSA Wizard (Prof. Verma / ACM Lead): Streetwear oversized black hoodie with 3D hood & drawstrings,
 *   RGB over-ear gaming headphones around neck, fingerless gloves, hype sneakers, custom 60% RGB mechanical keyboard.
 * - External Viva Examiner (Dr. Rao): Vintage tweed blazer with suede elbow patches, grading pens, visitor pass,
 *   thick mustache, retro horn-rimmed glasses, exam clipboard with question papers & leather briefcase.
 * - The Vice-Chancellor (Chancellor Sahab): Royal crimson convocation velvet robe with gold brocade trims,
 *   wide golden Chancellor's stole, ceremonial convocation medal, imperial DTU brass mace with four-lion capital.
 *
 * Features:
 * - Expressive facial anatomy: sculpted head, jaw, ears, 3D eyes (sclera + pupils), 3D nose, mustache/beards,
 *   and DYNAMIC ANIMATED EYEBROWS that furrow into aggressive warrior brows during attacks and arch in shock during hitstun!
 * - Complete articulated keyframe animation poses (idle, walk, crouch, jump, jab, kick, heavy, grab, block, hitstun, knockdown, shakti, win).
 * - Real-time procedural accessories: swinging ID lanyards, cycling RGB keyboard backlights, pulsing laser beams.
 */

import * as THREE from 'three';

// Helper to create sharp procedural canvas textures
function createProceduralTexture(type, options = {}) {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (type === 'register_cover') {
    canvas.width = 256;
    canvas.height = 340;
    // Deep maroon leatherette texture
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(0, 0, 256, 340);
    // Gold embossed frame
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 6;
    ctx.strokeRect(12, 12, 232, 316);
    ctx.lineWidth = 2;
    ctx.strokeRect(18, 18, 220, 304);
    // Gold text
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DELHI TECHNOLOGICAL', 128, 65);
    ctx.fillText('UNIVERSITY', 128, 85);
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('ATTENDANCE REGISTER', 128, 120);
    ctx.font = '10px sans-serif';
    ctx.fillText('DEPT. OF STUDENT AFFAIRS', 128, 140);
    // Red DETAINED Stamp
    ctx.save();
    ctx.translate(128, 220);
    ctx.rotate(-0.25);
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 4;
    ctx.strokeRect(-75, -28, 150, 56);
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('< 75% DETAINED', 0, 8);
    ctx.restore();
  } else if (type === 'faculty_id') {
    canvas.width = 128;
    canvas.height = 180;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 128, 180);
    // Purple header
    ctx.fillStyle = '#6b21a8';
    ctx.fillRect(0, 0, 128, 42);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DTU FACULTY', 64, 26);
    // Photo box
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(24, 52, 80, 75);
    ctx.fillStyle = '#0284c7';
    ctx.font = '32px sans-serif';
    ctx.fillText('👨‍🏫', 64, 105);
    // Details
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 8px sans-serif';
    ctx.fillText('PROF. GUPTA · MATH', 64, 142);
    // Barcode lines
    for (let i = 20; i < 110; i += 6) {
      ctx.fillRect(i, 155, 3, 14);
    }
  } else if (type === 'hoodie_logo') {
    canvas.width = 256;
    canvas.height = 160;
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, 256, 160);
    // Cyan cyber logo
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, 216, 120);
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('<DTU_CODERS />', 128, 70);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '14px monospace';
    ctx.fillText('ACM STUDENT CHAPTER', 128, 105);
  } else if (type === 'exam_paper') {
    canvas.width = 180;
    canvas.height = 250;
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 180, 250);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DTU END-TERM EXAM 2026', 90, 28);
    ctx.font = '8px sans-serif';
    ctx.fillText('MAX MARKS: 100 · TIME: 3 HRS', 90, 44);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    for (let y = 62; y < 230; y += 14) {
      ctx.beginPath();
      ctx.moveTo(15, y);
      ctx.lineTo(165, y);
      ctx.stroke();
    }
    // Red checkmarks / question marks
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('Q1. [15M]', 35, 95);
    ctx.fillText('Q5. [20M] ⚠️', 45, 165);
  } else if (type === 'vc_stole') {
    canvas.width = 64;
    canvas.height = 256;
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(0, 0, 64, 256);
    ctx.fillStyle = '#b45309';
    // Diamond embroidery pattern
    for (let y = 16; y < 240; y += 32) {
      ctx.beginPath();
      ctx.moveTo(32, y);
      ctx.lineTo(52, y + 16);
      ctx.lineTo(32, y + 32);
      ctx.lineTo(12, y + 16);
      ctx.closePath();
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export class Fighter3D {
  constructor(config, isPlayer1 = true) {
    this.config = config;
    this.isPlayer1 = isPlayer1;

    this.root = new THREE.Group();
    this.root.name = `Fighter_${config.id}`;

    // Combat physics state (meters)
    this.x = isPlayer1 ? -3.2 : 3.2;
    this.y = 0;
    this.z = 0;
    this.vx = 0;
    this.vy = 0;
    this.isGrounded = true;
    this.facingRight = isPlayer1;

    // Combat attributes
    this.hp = config.stats?.hp || 100;
    this.maxHp = this.hp;
    this.guard = 100;
    this.maxGuard = 100;
    this.guardCrushTimer = 0;
    this.hitstopTimer = 0;
    this.specialCooldown = 0;
    this.swingTrailTimer = 0;
    this.shakti = 0; // 0 - 100
    this.state = 'IDLE'; // IDLE, WALK_FWD, WALK_BACK, CROUCH, JUMP, ATTACK, SPECIAL, BLOCK, GUARD_CRUSH, HITSTUN, KNOCKDOWN, SHAKTI, WIN
    this.attackType = null; // 'punch', 'kick', 'heavy', 'grab', 'special', 'shakti'
    this.attackFrame = 0;
    this.hitstunTimer = 0;
    this.invincibleTimer = 0;
    this.comboCount = 0;
    this.comboTimer = 0;
    this.hasHitThisAttack = false;

    // Internal animation & visual effect timers
    this.animTime = Math.random() * 10;
    this.rgbHue = 0;

    // Build rich DTU 3D articulated rig
    this.buildMeshRig();
    this.updateTransform();
  }

  buildMeshRig() {
    const { id, skinTone, coatColor, tieColor, pantColor, weaponType } = this.config;

    // Base shared materials
    this.matSkin = new THREE.MeshStandardMaterial({ color: skinTone, roughness: 0.72, metalness: 0.05 });
    this.matCoat = new THREE.MeshStandardMaterial({ color: coatColor, roughness: 0.8, metalness: 0.08 });
    this.matPant = new THREE.MeshStandardMaterial({ color: pantColor, roughness: 0.85, metalness: 0.05 });
    this.matTie = new THREE.MeshStandardMaterial({ color: tieColor, roughness: 0.65, metalness: 0.1 });
    this.matShirt = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.85, metalness: 0.05 });
    this.matShoe = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.5, metalness: 0.2 });
    this.matShoeSole = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9, metalness: 0.05 });
    this.matHair = new THREE.MeshStandardMaterial({
      color: id === 'secret_vc' ? 0xe2e8f0 : id === 'dean_detain' ? 0x64748b : 0x18181b,
      roughness: 0.9,
      metalness: 0.05,
    });
    this.matEyes = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.1 });
    this.matPupil = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.2, metalness: 0.8 });
    this.matGold = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.35, metalness: 0.85 });
    this.matSteel = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.32, metalness: 0.85 });
    this.matGlass = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.15, metalness: 0.9, transparent: true, opacity: 0.7 });
    this.matLeather = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7, metalness: 0.1 });

    // ------------------------------------------------------------------------
    // 1. HIPS & PELVIS (Center of gravity at y ~ 0.95m)
    // ------------------------------------------------------------------------
    this.hips = new THREE.Group();
    this.hips.position.y = 0.95;
    this.root.add(this.hips);

    const pelvisMesh = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.24, 0.28), this.matPant);
    pelvisMesh.castShadow = true;
    this.hips.add(pelvisMesh);

    // Leather belt with gold/steel buckle
    const belt = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.06, 0.3), this.matLeather);
    belt.position.y = 0.1;
    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.07, 0.04), this.matGold);
    buckle.position.set(0, 0.1, 0.155);
    this.hips.add(belt, buckle);

    // ------------------------------------------------------------------------
    // 2. TORSO & CLOTHING LAYERS
    // ------------------------------------------------------------------------
    this.torso = new THREE.Group();
    this.torso.position.y = 0.12;
    this.hips.add(this.torso);

    // Core chest mesh
    const chestMesh = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.58, 0.33), this.matCoat);
    chestMesh.position.y = 0.29;
    chestMesh.castShadow = true;
    this.torso.add(chestMesh);

    // Inner shirt collar peeking above chest
    const innerShirt = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 0.05), this.matShirt);
    innerShirt.position.set(0, 0.46, 0.165);
    this.torso.add(innerShirt);

    // Character-specific torso detailing
    this.buildCharacterTorsoDetails(id);

    // ------------------------------------------------------------------------
    // 3. NECK & SCULPTED HEAD WITH FACIAL DETAILS
    // ------------------------------------------------------------------------
    this.neck = new THREE.Group();
    this.neck.position.y = 0.58;
    this.torso.add(this.neck);

    const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.16, 8), this.matSkin);
    neckMesh.position.y = 0.08;
    this.neck.add(neckMesh);

    this.head = new THREE.Group();
    this.head.position.y = 0.16;
    this.neck.add(this.head);

    // Sculpted Head Cranium & Jaw
    const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.34, 0.32), this.matSkin);
    headMesh.position.y = 0.14;
    headMesh.castShadow = true;
    const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.12, 0.22), this.matSkin);
    jaw.position.set(0, 0.02, 0.06);
    this.head.add(headMesh, jaw);

    // Ears (Left and Right)
    const earGeo = new THREE.BoxGeometry(0.04, 0.1, 0.06);
    const earL = new THREE.Mesh(earGeo, this.matSkin);
    earL.position.set(0.17, 0.14, 0);
    const earR = new THREE.Mesh(earGeo, this.matSkin);
    earR.position.set(-0.17, 0.14, 0);
    this.head.add(earL, earR);

    // 3D Eyes (Sclera + Dark Pupils)
    const eyeGeo = new THREE.BoxGeometry(0.065, 0.04, 0.02);
    const pupilGeo = new THREE.BoxGeometry(0.03, 0.03, 0.025);

    const eyeL = new THREE.Mesh(eyeGeo, this.matEyes);
    eyeL.position.set(0.07, 0.15, 0.165);
    const pupilL = new THREE.Mesh(pupilGeo, this.matPupil);
    pupilL.position.set(0.07, 0.15, 0.17);

    const eyeR = new THREE.Mesh(eyeGeo, this.matEyes);
    eyeR.position.set(-0.07, 0.15, 0.165);
    const pupilR = new THREE.Mesh(pupilGeo, this.matPupil);
    pupilR.position.set(-0.07, 0.15, 0.17);

    this.head.add(eyeL, pupilL, eyeR, pupilR);

    // 3D Animated Eyebrows (tilt dynamically during attacks and hitstun!)
    const browGeo = new THREE.BoxGeometry(0.09, 0.025, 0.03);
    this.browL = new THREE.Mesh(browGeo, this.matHair);
    this.browL.position.set(0.075, 0.19, 0.17);
    this.browR = new THREE.Mesh(browGeo, this.matHair);
    this.browR.position.set(-0.075, 0.19, 0.17);
    this.head.add(this.browL, this.browR);

    // 3D Nose Bridge & Tip
    const nose = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.08, 0.06), this.matSkin);
    nose.position.set(0, 0.11, 0.185);
    this.head.add(nose);

    // Character-Specific Hair, Beard, Mustache & Eyewear
    this.buildCharacterHeadDetails(id);

    // ------------------------------------------------------------------------
    // 4. ARTICULATED ARMS WITH SLEEVE CUFFS & HANDS
    // ------------------------------------------------------------------------
    this.armL = this.createArm(-0.33, false, id);
    this.torso.add(this.armL.shoulder);

    this.armR = this.createArm(0.33, true, id);
    this.torso.add(this.armR.shoulder);

    // ------------------------------------------------------------------------
    // 5. ARTICULATED LEGS & CHARACTER SHOES
    // ------------------------------------------------------------------------
    this.legL = this.createLeg(-0.14, id);
    this.hips.add(this.legL.hip);

    this.legR = this.createLeg(0.14, id);
    this.hips.add(this.legR.hip);

    // ------------------------------------------------------------------------
    // 6. WEAPON / SIGNATURE PROP IN LEAD HAND
    // ------------------------------------------------------------------------
    this.prop = this.createWeaponProp(weaponType, id);
    if (this.prop) {
      this.armR.hand.add(this.prop);
    }

    // ------------------------------------------------------------------------
    // 7. DEFENSIVE SHIELD, SHAKTI AURA & SHADOW
    // ------------------------------------------------------------------------
    // Defensive Guard Energy Shield (visible when blocking)
    const shieldGeo = new THREE.RingGeometry(0.48, 0.9, 32);
    this.shieldMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });
    this.shieldMesh = new THREE.Mesh(shieldGeo, this.shieldMat);
    this.shieldMesh.position.set(0.42, 0.85, 0);
    this.shieldMesh.rotation.y = Math.PI / 2;
    this.root.add(this.shieldMesh);

    // Dizzy Stars Halo (active during GUARD_CRUSH)
    this.dizzyStarsGroup = new THREE.Group();
    this.dizzyStarsGroup.position.set(0, 0.42, 0);
    this.dizzyStarsGroup.visible = false;
    for (let s = 0; s < 4; s++) {
      const star = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.065, 0),
        new THREE.MeshBasicMaterial({ color: 0xfacc15 })
      );
      const ang = (s / 4) * Math.PI * 2;
      star.position.set(Math.cos(ang) * 0.26, 0, Math.sin(ang) * 0.26);
      this.dizzyStarsGroup.add(star);
    }
    this.head.add(this.dizzyStarsGroup);

    // Dynamic Slash Trail Arc Ribbon
    const trailGeo = new THREE.RingGeometry(0.55, 1.15, 20, 1, 0, Math.PI * 0.65);
    trailGeo.rotateX(-Math.PI / 2);
    this.matSlashTrail = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.slashTrailMesh = new THREE.Mesh(trailGeo, this.matSlashTrail);
    this.slashTrailMesh.position.set(0.3, 0.9, 0);
    this.root.add(this.slashTrailMesh);

    // Shakti Super Golden Aura Ring (visible at 100% or during ultimate)
    const auraGeo = new THREE.TorusGeometry(0.95, 0.045, 12, 36);
    this.auraMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0,
    });
    this.auraMesh = new THREE.Mesh(auraGeo, this.auraMat);
    this.auraMesh.rotation.x = Math.PI / 2;
    this.auraMesh.position.y = 0.12;
    this.root.add(this.auraMesh);

    // Ground Shadow Blob
    const shadowGeo = new THREE.CircleGeometry(0.58, 20);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.38,
    });
    this.shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowMesh.position.y = 0.01;
    this.root.add(this.shadowMesh);
  }

  buildCharacterTorsoDetails(id) {
    if (id === 'dean_detain') {
      // Formal 3-Piece Maroon Blazer Lapels
      const lapelGeo = new THREE.BoxGeometry(0.08, 0.42, 0.04);
      const lapelL = new THREE.Mesh(lapelGeo, this.matCoat);
      lapelL.position.set(0.14, 0.32, 0.17);
      lapelL.rotation.z = -0.15;
      const lapelR = new THREE.Mesh(lapelGeo, this.matCoat);
      lapelR.position.set(-0.14, 0.32, 0.17);
      lapelR.rotation.z = 0.15;

      // Golden DTU Crest Lapel Pin on left lapel
      const crestPin = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.02, 8), this.matGold);
      crestPin.rotation.x = Math.PI / 2;
      crestPin.position.set(-0.18, 0.42, 0.18);

      // White Silk Pocket Square
      const pocketSquare = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.03, 0.02), this.matShirt);
      pocketSquare.position.set(0.17, 0.38, 0.18);

      // Striped Necktie
      const tieMesh = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.4, 0.03), this.matTie);
      tieMesh.position.set(0, 0.28, 0.18);

      this.torso.add(lapelL, lapelR, crestPin, pocketSquare, tieMesh);
    } else if (id === 'math_matrix') {
      // Khadi Kurta Mandarin Collar + Nehru Waistcoat (Sadri)
      const sadriL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.52, 0.03), this.matTie);
      sadriL.position.set(0.12, 0.28, 0.175);
      const sadriR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.52, 0.03), this.matTie);
      sadriR.position.set(-0.12, 0.28, 0.175);

      // Wooden Buttons down Sadri center
      for (let y = 0.12; y <= 0.46; y += 0.09) {
        const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.02, 8), this.matLeather);
        btn.rotation.x = Math.PI / 2;
        btn.position.set(0, y, 0.185);
        this.torso.add(btn);
      }

      // Silver Fountain Pen clipped in chest pocket
      const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.12, 8), this.matSteel);
      pen.position.set(0.18, 0.38, 0.19);
      this.torso.add(pen);

      // Purple DTU Faculty ID Card Lanyard swinging around neck
      const lanyardTex = createProceduralTexture('faculty_id');
      const lanyardMat = lanyardTex
        ? new THREE.MeshStandardMaterial({ map: lanyardTex, roughness: 0.5 })
        : this.matShirt;
      const lanyardStrap = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.32, 0.02), this.matTie);
      lanyardStrap.position.set(-0.04, 0.38, 0.185);

      const idBadge = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.19, 0.01), lanyardMat);
      idBadge.position.set(-0.04, 0.18, 0.195);
      this.lanyardBadge = idBadge; // Will sway dynamically!

      this.torso.add(sadriL, sadriR, lanyardStrap, idBadge);
    } else if (id === 'lab_incharge') {
      // Industrial Boiler Suit Zipper & Tool Pouch
      const zip = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.52, 0.02), this.matSteel);
      zip.position.set(0, 0.28, 0.175);

      const toolPouch = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.15, 0.05), this.matLeather);
      toolPouch.position.set(0.16, 0.18, 0.18);

      // Industrial grease smudge badge
      const smudge = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.01), this.matShoe);
      smudge.position.set(-0.14, 0.38, 0.175);

      // Shop rag hanging from hip
      const rag = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.18, 0.02), this.matShirt);
      rag.position.set(-0.25, 0.05, 0.1);
      rag.rotation.z = 0.2;

      this.torso.add(zip, toolPouch, smudge, rag);
    } else if (id === 'dsa_wizard') {
      // Streetwear Oversized Hoodie with Kangaroo Pocket
      const hoodTex = createProceduralTexture('hoodie_logo');
      const hoodMat = hoodTex
        ? new THREE.MeshStandardMaterial({ map: hoodTex, roughness: 0.85 })
        : this.matCoat;

      // Front Logo Panel
      const logoPanel = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.22, 0.02), hoodMat);
      logoPanel.position.set(0, 0.36, 0.175);

      // Kangaroo front pouch
      const pouch = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.16, 0.06), this.matCoat);
      pouch.position.set(0, 0.14, 0.18);

      // White drawstring cords hanging down
      const cordGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.22, 6);
      const cordL = new THREE.Mesh(cordGeo, this.matShirt);
      cordL.position.set(0.06, 0.36, 0.19);
      const cordR = new THREE.Mesh(cordGeo, this.matShirt);
      cordR.position.set(-0.06, 0.36, 0.19);

      // 3D Hood draped on back of neck
      const hoodBack = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), this.matCoat);
      hoodBack.scale.set(1.1, 0.8, 0.7);
      hoodBack.position.set(0, 0.46, -0.16);

      this.torso.add(logoPanel, pouch, cordL, cordR, hoodBack);
    } else if (id === 'viva_examiner') {
      // Vintage Tweed Blazer with Wide Lapels
      const lapelGeo = new THREE.BoxGeometry(0.09, 0.44, 0.03);
      const lapelL = new THREE.Mesh(lapelGeo, this.matCoat);
      lapelL.position.set(0.14, 0.32, 0.17);
      const lapelR = new THREE.Mesh(lapelGeo, this.matCoat);
      lapelR.position.set(-0.14, 0.32, 0.17);

      const tie = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.42, 0.03), this.matTie);
      tie.position.set(0, 0.27, 0.175);

      // Red and blue pens in breast pocket
      const redPen = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.12, 6), new THREE.MeshBasicMaterial({ color: 0xdc2626 }));
      redPen.position.set(0.16, 0.42, 0.185);
      const bluePen = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.12, 6), new THREE.MeshBasicMaterial({ color: 0x2563eb }));
      bluePen.position.set(0.19, 0.42, 0.185);

      // DTU External Visitor Pass clip
      const visitorPass = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.02), this.matShirt);
      visitorPass.position.set(-0.16, 0.4, 0.18);

      this.torso.add(lapelL, lapelR, tie, redPen, bluePen, visitorPass);
    } else if (id === 'secret_vc') {
      // Regal Convocation Ceremonial Velvet Gown with Gold Stole
      const stoleTex = createProceduralTexture('vc_stole');
      const stoleMat = stoleTex
        ? new THREE.MeshStandardMaterial({ map: stoleTex, roughness: 0.4, metalness: 0.3 })
        : this.matGold;

      // Golden Stole Draped over shoulders
      const stoleL = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.58, 0.03), stoleMat);
      stoleL.position.set(0.16, 0.26, 0.18);
      const stoleR = new THREE.Mesh(stoleL.geometry, stoleMat);
      stoleR.position.set(-0.16, 0.26, 0.18);

      // Gold Convocation Medallion hanging in center
      const medal = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.02, 16), this.matGold);
      medal.rotation.x = Math.PI / 2;
      medal.position.set(0, 0.18, 0.19);

      this.torso.add(stoleL, stoleR, medal);
    }
  }

  buildCharacterHeadDetails(id) {
    if (id === 'dean_detain') {
      // Receding gray hair: bald shiny crown with side and back hair fringe
      const hairSideL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.22, 0.32), this.matHair);
      hairSideL.position.set(0.16, 0.14, -0.02);
      const hairSideR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.22, 0.32), this.matHair);
      hairSideR.position.set(-0.16, 0.14, -0.02);
      const hairBack = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.22, 0.06), this.matHair);
      hairBack.position.set(0, 0.14, -0.15);

      // Distinguished gray mustache
      const mustache = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.04), this.matHair);
      mustache.position.set(0, 0.05, 0.18);

      // Gold wire spectacles
      const glasses = this.createGlasses(this.matGold, false);
      glasses.position.set(0, 0.15, 0.175);

      this.head.add(hairSideL, hairSideR, hairBack, mustache, glasses);
    } else if (id === 'math_matrix') {
      // Neatly parted black hair with silver temples
      const hairTop = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.12, 0.34), this.matHair);
      hairTop.position.set(0, 0.26, 0);
      const hairPart = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.32), this.matSkin);
      hairPart.position.set(0.08, 0.31, 0);

      // Refined intellectual mustache & small chin goatee
      const stache = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.035, 0.03), this.matHair);
      stache.position.set(0, 0.055, 0.18);
      const goatee = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.06, 0.03), this.matHair);
      goatee.position.set(0, -0.01, 0.17);

      // Round silver wire spectacles
      const glasses = this.createGlasses(this.matSteel, true);
      glasses.position.set(0, 0.15, 0.175);

      this.head.add(hairTop, hairPart, stache, goatee, glasses);
    } else if (id === 'lab_incharge') {
      // Yellow DTU Safety Hardhat with flip-down tinted welding visor
      const helmetMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4, metalness: 0.1 });
      const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), helmetMat);
      helmet.scale.set(1.0, 0.65, 1.15);
      helmet.position.set(0, 0.28, -0.02);

      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.03, 16), helmetMat);
      brim.position.set(0, 0.22, 0.04);

      // Tinted Welding Visor pushed up on helmet front
      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.08, 0.04), this.matGlass);
      visor.position.set(0, 0.24, 0.17);

      // Rugged thick mustache + 5 o'clock stubble
      const stache = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 0.04), this.matHair);
      stache.position.set(0, 0.05, 0.185);

      // Safety earmuffs on sides
      const muffsMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 });
      const muffL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 8), muffsMat);
      muffL.rotation.z = Math.PI / 2;
      muffL.position.set(0.19, 0.14, 0);
      const muffR = new THREE.Mesh(muffL.geometry, muffsMat);
      muffR.rotation.z = Math.PI / 2;
      muffR.position.set(-0.19, 0.14, 0);

      this.head.add(helmet, brim, visor, stache, muffL, muffR);
    } else if (id === 'dsa_wizard') {
      // Stylish spiked/layered anime coder hair with bangs
      const hairBase = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.14, 0.35), this.matHair);
      hairBase.position.set(0, 0.27, 0);

      // Front bangs covering upper forehead
      const bang1 = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.14, 4), this.matHair);
      bang1.rotation.set(Math.PI, 0, 0.2);
      bang1.position.set(0.08, 0.24, 0.18);
      const bang2 = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.16, 4), this.matHair);
      bang2.rotation.set(Math.PI, 0, -0.15);
      bang2.position.set(-0.04, 0.23, 0.18);
      const bang3 = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.12, 4), this.matHair);
      bang3.rotation.set(Math.PI, 0, -0.4);
      bang3.position.set(-0.11, 0.24, 0.17);

      // Over-Ear RGB Gaming Headphones resting around neck
      this.rgbMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.025, 8, 16), this.matHair);
      band.rotation.x = Math.PI / 2;
      band.position.set(0, -0.06, 0.02);

      const cupL = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.04, 12), this.rgbMat);
      cupL.rotation.z = Math.PI / 2;
      cupL.position.set(0.18, -0.06, 0.05);
      const cupR = new THREE.Mesh(cupL.geometry, this.rgbMat);
      cupR.rotation.z = Math.PI / 2;
      cupR.position.set(-0.18, -0.06, 0.05);

      this.head.add(hairBase, bang1, bang2, bang3, band, cupL, cupR);
    } else if (id === 'viva_examiner') {
      // Classic comb-over hair with distinct part
      const hair = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.12, 0.34), this.matHair);
      hair.position.set(0, 0.26, 0);

      // Heavy classic Indian professor mustache
      const mustache = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.055, 0.04), this.matHair);
      mustache.position.set(0, 0.05, 0.185);

      // Retro black horn-rimmed glasses
      const glasses = this.createGlasses(this.matShoe, false);
      glasses.position.set(0, 0.15, 0.175);

      this.head.add(hair, mustache, glasses);
    } else if (id === 'secret_vc') {
      // Full sculpted regal silver hair
      const hair = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.16, 0.36), this.matHair);
      hair.position.set(0, 0.26, -0.01);

      // Majestic sculpted silver beard & mustache
      const beard = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.16, 0.14), this.matHair);
      beard.position.set(0, -0.04, 0.12);
      const mustache = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.04), this.matHair);
      mustache.position.set(0, 0.05, 0.185);

      // Golden rimless spectacles
      const glasses = this.createGlasses(this.matGold, true);
      glasses.position.set(0, 0.15, 0.175);

      this.head.add(hair, beard, mustache, glasses);
    }
  }

  createGlasses(frameMat, isRound = false) {
    const g = new THREE.Group();
    const rimGeo = isRound
      ? new THREE.CylinderGeometry(0.045, 0.045, 0.02, 12)
      : new THREE.BoxGeometry(0.11, 0.065, 0.025);

    const rimL = new THREE.Mesh(rimGeo, frameMat);
    rimL.position.x = 0.07;
    const lensL = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.05, 0.015), this.matGlass);
    lensL.position.x = 0.07;

    const rimR = new THREE.Mesh(rimGeo, frameMat);
    rimR.position.x = -0.07;
    const lensR = new THREE.Mesh(lensL.geometry, this.matGlass);
    lensR.position.x = -0.07;

    if (isRound) {
      rimL.rotation.x = Math.PI / 2;
      rimR.rotation.x = Math.PI / 2;
    }

    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.015, 0.025), frameMat);
    g.add(rimL, lensL, rimR, lensR, bridge);
    return g;
  }

  createArm(offsetX, isLead = false, id = '') {
    const shoulder = new THREE.Group();
    shoulder.position.set(offsetX, 0.48, 0);

    const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.32, 8), this.matCoat);
    upperArm.position.y = -0.16;
    upperArm.castShadow = true;
    shoulder.add(upperArm);

    const elbow = new THREE.Group();
    elbow.position.y = -0.32;
    shoulder.add(elbow);

    // Elbow patch for Viva Examiner
    if (id === 'viva_examiner') {
      const patch = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.04), this.matLeather);
      patch.position.set(0, 0, -0.06);
      elbow.add(patch);
    }

    const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.3, 8), this.matCoat);
    forearm.position.y = -0.15;
    forearm.castShadow = true;
    elbow.add(forearm);

    // Sleeve Cuff detailing (white shirt peeking out)
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.072, 0.065, 0.05, 8), this.matShirt);
    cuff.position.y = -0.28;
    elbow.add(cuff);

    const hand = new THREE.Group();
    hand.position.y = -0.32;
    elbow.add(hand);

    // Gloves / Hands
    let handMat = this.matSkin;
    if (id === 'lab_incharge') handMat = this.matLeather; // Heavy welding gloves
    else if (id === 'dsa_wizard') handMat = this.matShoe; // Fingerless black typing gloves

    const fist = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.12, 0.11), handMat);
    fist.castShadow = true;
    hand.add(fist);

    // If fingerless gloves, add skin-tone fingertip highlights
    if (id === 'dsa_wizard') {
      const tips = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.03, 0.1), this.matSkin);
      tips.position.y = -0.065;
      hand.add(tips);
    }

    return { shoulder, elbow, hand, isLead };
  }

  createLeg(offsetX, id = '') {
    const hip = new THREE.Group();
    hip.position.set(offsetX, -0.05, 0);

    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.42, 8), this.matPant);
    thigh.position.y = -0.21;
    thigh.castShadow = true;
    hip.add(thigh);

    const knee = new THREE.Group();
    knee.position.y = -0.42;
    hip.add(knee);

    const calf = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.4, 8), this.matPant);
    calf.position.y = -0.2;
    calf.castShadow = true;
    knee.add(calf);

    // Distinct character shoes
    const shoeGroup = new THREE.Group();
    shoeGroup.position.set(0, -0.42, 0.08);

    if (id === 'dsa_wizard') {
      // Hype Streetwear High-Top Sneaker
      const sole = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.04, 0.32), this.matShirt);
      sole.position.y = -0.04;
      const upper = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.3), this.matTie); // Colorful upper
      upper.position.y = 0.03;
      const swoosh = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.03, 0.18), this.matShirt);
      swoosh.position.y = 0.03;
      shoeGroup.add(sole, upper, swoosh);
    } else if (id === 'lab_incharge') {
      // Heavy Steel-Toed Workboot
      const sole = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.06, 0.34), this.matShoeSole);
      sole.position.y = -0.04;
      const boot = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.12, 0.32), this.matLeather);
      boot.position.y = 0.04;
      const steelCap = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.08, 0.1), this.matSteel);
      steelCap.position.set(0, 0.02, 0.12);
      shoeGroup.add(sole, boot, steelCap);
    } else {
      // Formal Oxford / Brogue with distinct leather heel
      const sole = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 0.3), this.matShoeSole);
      sole.position.y = -0.04;
      const heel = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.1), this.matShoeSole);
      heel.position.set(0, -0.02, -0.09);
      const shoeUpper = new THREE.Mesh(new THREE.BoxGeometry(0.135, 0.09, 0.28), this.matShoe);
      shoeUpper.position.y = 0.02;
      shoeGroup.add(sole, heel, shoeUpper);
    }

    knee.add(shoeGroup);
    return { hip, knee };
  }

  createWeaponProp(type, id = '') {
    const g = new THREE.Group();

    if (type === 'register') {
      // Massive Official DTU Hardbound Attendance & Detention Register
      const coverTex = createProceduralTexture('register_cover');
      const coverMat = coverTex
        ? new THREE.MeshStandardMaterial({ map: coverTex, roughness: 0.6 })
        : this.matCoat;

      const book = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.54, 0.12), coverMat);
      const pageEdges = new THREE.Mesh(new THREE.BoxGeometry(0.39, 0.51, 0.09), this.matShirt);
      book.add(pageEdges);

      // Red Grading Ballpoint Pen tucked into spine
      const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.56, 8), new THREE.MeshBasicMaterial({ color: 0xdc2626 }));
      pen.position.set(-0.21, 0, 0);

      g.add(book, pen);
      g.position.set(0, 0, 0.16);
      g.rotation.y = 0.35;
    } else if (type === 'wrench') {
      // Heavy 24-inch Cast-Iron Workshop Pipe Wrench
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.68, 8), this.matSteel);
      const jawHead = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.2, 0.08), this.matSteel);
      jawHead.position.set(0.06, 0.32, 0);

      // Knurled adjustment nut & teeth
      const nut = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.06, 12), this.matGold);
      nut.position.set(0, 0.2, 0);
      const teeth = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 0.07), this.matSteel);
      teeth.position.set(0.1, 0.38, 0);

      g.add(handle, jawHead, nut, teeth);
      g.rotation.x = Math.PI / 2;
    } else if (type === 'keyboard') {
      // Custom 60% RGB Mechanical Keyboard with aviator cable
      const caseMesh = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.52, 0.07), this.matHair);

      // Glowing RGB Keycaps Grid
      this.keycapMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
      const keyGrid = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.48, 0.02), this.keycapMat);
      keyGrid.position.z = 0.04;

      // Braided aviator coiled cable
      const cable = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 6, 16), this.matTie);
      cable.position.set(0, 0.28, 0);

      g.add(caseMesh, keyGrid, cable);
      g.rotation.y = Math.PI / 2;
    } else if (type === 'clipboard') {
      // DTU Viva Exam Clipboard with Question Papers
      const paperTex = createProceduralTexture('exam_paper');
      const paperMat = paperTex
        ? new THREE.MeshStandardMaterial({ map: paperTex, roughness: 0.8 })
        : this.matShirt;

      const board = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.48, 0.035), this.matLeather);
      const paper = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.44, 0.01), paperMat);
      paper.position.z = 0.022;

      const clip = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.07, 0.05), this.matSteel);
      clip.position.set(0, 0.22, 0.03);

      g.add(board, paper, clip);
      g.rotation.x = 0.4;
    } else if (type === 'mace') {
      // Imperial Ceremonial DTU Brass Convocation Mace
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.82, 10), this.matGold);
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), this.matGold);
      orb.position.y = 0.42;

      // Four-Lion Capital Finial Crown
      const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.12, 8), this.matGold);
      crown.position.y = 0.58;

      // Ceremonial maroon tassel
      const tassel = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 8), this.matCoat);
      tassel.position.set(0, 0.32, 0.1);

      g.add(shaft, orb, crown, tassel);
      g.rotation.x = 0.35;
    } else {
      // Precision Laser Engineering Compass & Stylus
      const compassLeg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.012, 0.46, 8), this.matSteel);
      compassLeg1.position.x = 0.05;
      compassLeg1.rotation.z = -0.15;

      const compassLeg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.012, 0.46, 8), this.matSteel);
      compassLeg2.position.x = -0.05;
      compassLeg2.rotation.z = 0.15;

      const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 8), this.matGold);
      hinge.position.y = 0.22;

      // Glowing Cyan Laser Guide Beam
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.7, 6), this.matGlass);
      beam.position.set(0.08, -0.4, 0);

      g.add(compassLeg1, compassLeg2, hinge, beam);
      g.rotation.x = Math.PI / 2;
    }

    return g;
  }

  updateTransform() {
    this.root.position.set(this.x, this.y, this.z);
    this.root.rotation.y = this.facingRight ? Math.PI / 2 : -Math.PI / 2;
  }

  // Skeletal procedural animation state machine
  updateAnimation(delta) {
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= delta;
      return; // Freeze animation on impact frame for crunch feel!
    }

    this.animTime += delta * 6;
    const t = this.animTime;

    // Reset baseline joint rotations
    this.torso.rotation.set(0, 0, 0);
    this.hips.position.y = 0.95;
    this.neck.rotation.set(0, 0, 0);
    this.armL.shoulder.rotation.set(0, 0, 0);
    this.armL.elbow.rotation.set(0, 0, 0);
    this.armR.shoulder.rotation.set(0, 0, 0);
    this.armR.elbow.rotation.set(0, 0, 0);
    this.legL.hip.rotation.set(0, 0, 0);
    this.legL.knee.rotation.set(0, 0, 0);
    this.legR.hip.rotation.set(0, 0, 0);
    this.legR.knee.rotation.set(0, 0, 0);

    // Baseline animated eyebrows: neutral
    let browAngle = 0;
    let browYOffset = 0;

    // Cycling RGB lighting for DSA Wizard's keyboard and headphones
    if (this.keycapMat) {
      this.rgbHue = (this.rgbHue + delta * 0.8) % 1.0;
      this.keycapMat.color.setHSL(this.rgbHue, 1.0, 0.55);
      if (this.rgbMat) this.rgbMat.color.setHSL(this.rgbHue, 1.0, 0.55);
    }

    // Swaying DTU Faculty ID Badge
    if (this.lanyardBadge) {
      this.lanyardBadge.rotation.z = Math.sin(t * 1.5) * 0.12;
      this.lanyardBadge.rotation.x = Math.cos(t * 1.2) * 0.08;
    }

    // Guard shield visibility & color degradation (cyan -> amber -> red)
    const isBlocking = this.state === 'BLOCK';
    this.shieldMat.opacity = THREE.MathUtils.lerp(this.shieldMat.opacity, isBlocking ? 0.78 : 0, 0.25);
    if (isBlocking) {
      this.shieldMesh.rotation.z = Math.sin(t * 4) * 0.18;
      if (this.guard > 50) this.shieldMat.color.setHex(0x38bdf8);
      else if (this.guard > 25) this.shieldMat.color.setHex(0xf59e0b);
      else this.shieldMat.color.setHex(Math.sin(t * 10) > 0 ? 0xef4444 : 0xffffff);
    }

    // Slash weapon trail ribbon update
    if (this.swingTrailTimer > 0) {
      this.swingTrailTimer -= delta;
      this.matSlashTrail.opacity = THREE.MathUtils.lerp(this.matSlashTrail.opacity, 0.85, 0.35);
      this.slashTrailMesh.rotation.y = this.facingRight ? 0 : Math.PI;
    } else {
      this.matSlashTrail.opacity = THREE.MathUtils.lerp(this.matSlashTrail.opacity, 0, 0.25);
    }

    // Dizzy stars visibility & orbit rotation during GUARD_CRUSH
    const isDizzy = this.state === 'GUARD_CRUSH';
    this.dizzyStarsGroup.visible = isDizzy;
    if (isDizzy) {
      this.dizzyStarsGroup.rotation.y += delta * 5.0;
    }

    // Shakti Aura glow & spin
    const isSuperCharged = this.shakti >= 100 || this.state === 'SHAKTI';
    this.auraMat.opacity = THREE.MathUtils.lerp(this.auraMat.opacity, isSuperCharged ? 0.85 : 0, 0.2);
    if (isSuperCharged) {
      this.auraMesh.rotation.z += delta * 3.5;
      const pulse = 1.0 + Math.sin(t * 5) * 0.14;
      this.auraMesh.scale.set(pulse, pulse, pulse);
    }

    // Dynamic ground shadow scaling
    const groundDist = Math.max(0, -this.y);
    const shadowScale = Math.max(0.35, 1.0 - groundDist * 0.25);
    this.shadowMesh.scale.set(shadowScale, shadowScale, shadowScale);
    this.shadowMesh.position.y = -this.y + 0.02;

    switch (this.state) {
      case 'IDLE': {
        const breathe = Math.sin(t * 0.8) * 0.035;
        this.torso.position.y = 0.12 + breathe;
        this.torso.rotation.x = Math.sin(t * 0.8) * 0.03;
        this.neck.rotation.x = -Math.sin(t * 0.8) * 0.02;

        // Ready fighting stance
        this.armL.shoulder.rotation.x = 0.55 + Math.sin(t * 0.8) * 0.08;
        this.armL.elbow.rotation.x = -1.1;
        this.armR.shoulder.rotation.x = 0.75 + Math.cos(t * 0.8) * 0.08;
        this.armR.elbow.rotation.x = -1.35;

        this.legL.hip.rotation.x = 0.12;
        this.legR.hip.rotation.x = -0.15;
        break;
      }

      case 'WALK_FWD': {
        const stride = Math.sin(t * 1.8);
        this.hips.position.y = 0.95 + Math.abs(Math.sin(t * 1.8)) * 0.05;
        this.torso.rotation.x = 0.1;

        this.legL.hip.rotation.x = stride * 0.55;
        this.legL.knee.rotation.x = Math.max(0, -stride * 0.65);
        this.legR.hip.rotation.x = -stride * 0.55;
        this.legR.knee.rotation.x = Math.max(0, stride * 0.65);

        this.armL.shoulder.rotation.x = 0.5 - stride * 0.45;
        this.armL.elbow.rotation.x = -0.9;
        this.armR.shoulder.rotation.x = 0.7 + stride * 0.45;
        this.armR.elbow.rotation.x = -1.1;
        break;
      }

      case 'WALK_BACK': {
        const stride = Math.sin(t * 1.5);
        this.hips.position.y = 0.95 + Math.abs(Math.sin(t * 1.5)) * 0.04;
        this.torso.rotation.x = -0.06;

        this.legL.hip.rotation.x = -stride * 0.45;
        this.legR.hip.rotation.x = stride * 0.45;

        // Defensive guard raised high
        this.armL.shoulder.rotation.x = 1.1;
        this.armL.elbow.rotation.x = -1.4;
        this.armR.shoulder.rotation.x = 1.3;
        this.armR.elbow.rotation.x = -1.5;
        break;
      }

      case 'CROUCH': {
        this.hips.position.y = 0.65;
        this.torso.rotation.x = 0.28;
        this.legL.hip.rotation.x = -0.85;
        this.legL.knee.rotation.x = 1.5;
        this.legR.hip.rotation.x = -0.75;
        this.legR.knee.rotation.x = 1.4;

        this.armL.shoulder.rotation.x = 0.8;
        this.armL.elbow.rotation.x = -1.5;
        this.armR.shoulder.rotation.x = 0.95;
        this.armR.elbow.rotation.x = -1.6;
        break;
      }

      case 'JUMP': {
        this.torso.rotation.x = -0.15;
        this.legL.hip.rotation.x = 0.45;
        this.legL.knee.rotation.x = 0.85;
        this.legR.hip.rotation.x = 0.35;
        this.legR.knee.rotation.x = 0.75;

        this.armL.shoulder.rotation.x = -0.8;
        this.armR.shoulder.rotation.x = -0.9;
        break;
      }

      case 'ATTACK': {
        // Furrow eyebrows down into aggressive warrior V-shape!
        browAngle = -0.28;
        browYOffset = -0.02;

        if (this.attackType === 'punch') {
          // Sharp jab extension
          this.torso.rotation.y = -0.35;
          this.torso.rotation.x = 0.12;
          this.armR.shoulder.rotation.x = 1.55;
          this.armR.elbow.rotation.x = -0.15; // Extended punch arm!
          this.armL.shoulder.rotation.x = 0.8;
          this.armL.elbow.rotation.x = -1.4;
        } else if (this.attackType === 'kick') {
          // High roundhouse kick
          this.torso.rotation.z = -0.35;
          this.torso.rotation.x = -0.15;
          this.legR.hip.rotation.x = 1.45; // High forward leg
          this.legR.knee.rotation.x = 0.1;
          this.legL.hip.rotation.x = -0.2;
          this.armL.shoulder.rotation.x = 0.9;
          this.armR.shoulder.rotation.x = -0.5;
        } else if (this.attackType === 'heavy') {
          // Overhead crushing strike
          this.torso.rotation.x = 0.45;
          this.armR.shoulder.rotation.x = 2.1;
          this.armR.elbow.rotation.x = -0.6;
          this.armL.shoulder.rotation.x = 1.8;
          this.armL.elbow.rotation.x = -0.8;
          this.legR.hip.rotation.x = 0.4;
        } else if (this.attackType === 'grab') {
          // Both arms lunging forward to grab
          this.torso.rotation.x = 0.25;
          this.armL.shoulder.rotation.x = 1.45;
          this.armL.elbow.rotation.x = -0.3;
          this.armR.shoulder.rotation.x = 1.45;
          this.armR.elbow.rotation.x = -0.3;
        } else if (this.attackType === 'special') {
          // Signature Special Pose per character archetype
          this.torso.rotation.x = 0.35;
          this.torso.rotation.y = -0.4;
          this.armR.shoulder.rotation.set(1.9, -0.2, 0);
          this.armR.elbow.rotation.x = -0.3;
          this.armL.shoulder.rotation.set(0.6, 0.4, 0);
          this.legR.hip.rotation.x = 0.6;
        }
        break;
      }

      case 'SPECIAL': {
        browAngle = -0.32;
        browYOffset = -0.025;
        this.torso.rotation.x = 0.35;
        this.torso.rotation.y = -0.45;
        this.armR.shoulder.rotation.set(2.0, -0.3, 0);
        this.armR.elbow.rotation.x = -0.2;
        this.armL.shoulder.rotation.set(0.6, 0.4, 0);
        this.legR.hip.rotation.x = 0.65;
        break;
      }

      case 'GUARD_CRUSH': {
        // Dizzy, helpless guard broken state
        browAngle = 0.45;
        browYOffset = 0.03;
        this.torso.rotation.x = -0.35;
        this.torso.rotation.y = Math.sin(t * 3.0) * 0.25;
        this.neck.rotation.x = 0.35 + Math.sin(t * 3.5) * 0.18;
        this.armL.shoulder.rotation.set(-0.2, 0, Math.sin(t * 3.0) * 0.2);
        this.armR.shoulder.rotation.set(-0.2, 0, -Math.sin(t * 3.0) * 0.2);
        this.legL.hip.rotation.x = 0.15;
        this.legR.hip.rotation.x = -0.15;
        break;
      }

      case 'BLOCK': {
        this.torso.rotation.x = -0.12;
        // Cross arms tightly in front of face
        this.armL.shoulder.rotation.set(1.35, -0.4, 0);
        this.armL.elbow.rotation.x = -1.6;
        this.armR.shoulder.rotation.set(1.45, 0.4, 0);
        this.armR.elbow.rotation.x = -1.65;
        break;
      }

      case 'HITSTUN': {
        // Arch eyebrows high in shock / pain!
        browAngle = 0.35;
        browYOffset = 0.025;

        // Dramatic hit reaction
        this.torso.rotation.x = -0.55;
        this.torso.rotation.y = (Math.random() - 0.5) * 0.3;
        this.neck.rotation.x = 0.45;
        this.armL.shoulder.rotation.x = -0.4;
        this.armR.shoulder.rotation.x = -0.6;
        this.legL.hip.rotation.x = 0.35;
        this.legR.hip.rotation.x = -0.35;
        break;
      }

      case 'KNOCKDOWN': {
        // Shocked brow
        browAngle = 0.4;
        browYOffset = 0.03;

        // Horizontal back-fall on the mat
        this.hips.position.y = 0.22;
        this.root.rotation.x = -Math.PI / 2;
        break;
      }

      case 'SHAKTI': {
        // Fierce glowing ascendant posture
        browAngle = -0.35;
        browYOffset = -0.025;

        this.torso.rotation.x = -0.22;
        this.armL.shoulder.rotation.set(1.8, -0.5, 0);
        this.armR.shoulder.rotation.set(1.8, 0.5, 0);
        this.neck.rotation.x = -0.35;
        break;
      }

      case 'WIN': {
        // Victory pose holding weapon high!
        this.torso.rotation.x = -0.1;
        this.armR.shoulder.rotation.set(2.4, 0.3, 0);
        this.armR.elbow.rotation.x = -0.2;
        this.armL.shoulder.rotation.x = -0.2;
        this.neck.rotation.x = -0.25;
        break;
      }
    }

    // Apply animated eyebrow rotations
    if (this.browL && this.browR) {
      this.browL.rotation.z = browAngle;
      this.browR.rotation.z = -browAngle;
      this.browL.position.y = 0.19 + browYOffset;
      this.browR.position.y = 0.19 + browYOffset;
    }
  }

  dispose() {
    this.root.traverse((obj) => {
      if (obj.isMesh) {
        if (obj.geometry) obj.geometry.dispose();
      }
    });
    [
      this.matSkin,
      this.matCoat,
      this.matPant,
      this.matTie,
      this.matShirt,
      this.matShoe,
      this.matShoeSole,
      this.matHair,
      this.matEyes,
      this.matPupil,
      this.matGold,
      this.matSteel,
      this.matGlass,
      this.matLeather,
      this.keycapMat,
      this.rgbMat,
      this.matSlashTrail,
      this.shieldMat,
      this.auraMat,
    ].forEach((m) => m && m.dispose && m.dispose());
  }
}
