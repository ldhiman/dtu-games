'use client';

import * as THREE from 'three';
import React, { useEffect, useRef } from 'react';

/**
 * CharacterController
 * 
 * High-performance, modular character controller for the DTU Campus Game.
 * Features:
 * - Stylized low-poly DTU student avatar (hoodie, backpack, accessories, shadows)
 * - Procedural locomotion animation (idle breathing, walking, sprinting, jump/fall poses)
 * - Smooth camera tracking with 3rd-person mouse/touch orbit controls
 * - Camera-relative directional movement (WASD / Arrows)
 * - Sprinting (Shift) & Jump vertical gravity physics
 * - Mobile virtual joystick (`setVirtualJoystick`) and jump trigger (`triggerJump`)
 * - Campus boundary clamping (-100 to +100 default)
 * - Comprehensive memory cleanup on unmount
 */

// Default configuration parameters
export const DEFAULT_CHARACTER_CONFIG = {
  // Kinematics & Speeds
  walkSpeed: 12.0,
  sprintSpeed: 24.0,
  groundAcceleration: 55.0,
  groundDeceleration: 45.0,
  airAcceleration: 20.0,
  turnSpeed: 14.0,

  // Jump & Gravity Physics
  gravity: -34.0,
  jumpImpulse: 13.0,
  groundY: 0.0,
  jumpBufferTime: 0.15,
  coyoteTime: 0.12,

  // Campus Boundaries (1:1 Metric DTU Bawana Bounds)
  boundaries: {
    minX: -540,
    maxX: 480,
    minZ: -450,
    maxZ: 565,
  },

  // Camera Orbit & Tracking
  camera: {
    defaultDistance: 7.2,
    minDistance: 3.5,
    maxDistance: 26.0,
    defaultPitch: 0.28, // ~16 degrees elevated
    minPitch: 0.05,     // ~3 degrees (prevents underground clipping)
    maxPitch: 1.35,     // ~77 degrees (birds eye)
    mouseSensitivity: 0.0035,
    touchSensitivity: 0.0055,
    zoomSensitivity: 0.002,
    followDamping: 10.0,
    lookDamping: 12.0,
    targetHeightOffset: 1.45, // Focuses on student chest/head
  },

  // Avatar Customization
  colors: {
    hoodie: 0x8b1e2d,    // DTU Crimson / Maroon
    hoodiePocket: 0x751624,
    hoodieStrings: 0xf1f5f9,
    backpack: 0x1e293b,  // Slate-800
    backpackStraps: 0x334155,
    waterBottle: 0x06b6d4, // Cyan
    skin: 0xf6c89f,      // Warm student skin tone
    hair: 0x1c1917,      // Dark espresso / black
    pants: 0x1e3a8a,     // Denim navy
    shoes: 0xf8fafc,     // White sneakers
    shoeSole: 0x0f172a,  // Dark rubber sole
    shoeStripe: 0x8b1e2d,// DTU Maroon accent
    headphones: 0x0f172a,// Matte dark
    headphoneTrim: 0x94a3b8 // Silver
  }
};

export class CharacterController {
  /**
   * @param {Object} options
   * @param {THREE.Scene} options.scene - The Three.js scene
   * @param {THREE.Camera} options.camera - The perspective camera
   * @param {HTMLElement} [options.domElement] - DOM element for mouse/touch inputs (defaults to window)
   * @param {Object} [options.config] - Override default character config
   * @param {THREE.Vector3} [options.initialPosition] - Starting position (default: 0, 0, 0)
   * @param {Function} [options.getGroundHeight] - Optional custom height query function (x, z) => y
   * @param {Function} [options.onBoundaryHit] - Optional callback when hitting campus edge
   */
  constructor(options = {}) {
    if (!options.scene) {
      throw new Error('CharacterController requires a THREE.Scene instance.');
    }
    if (!options.camera) {
      throw new Error('CharacterController requires a THREE.Camera instance.');
    }

    this.scene = options.scene;
    this.camera = options.camera;
    this.domElement = options.domElement || (typeof window !== 'undefined' ? window : null);
    this.getGroundHeight = options.getGroundHeight || null;
    this.checkCollision = options.checkCollision || null;
    this.onBoundaryHit = options.onBoundaryHit || null;

    // Merge configurations
    this.config = {
      ...DEFAULT_CHARACTER_CONFIG,
      ...(options.config || {}),
      boundaries: {
        ...DEFAULT_CHARACTER_CONFIG.boundaries,
        ...(options.config?.boundaries || {}),
        ...(options.boundaries || {})
      },
      camera: {
        ...DEFAULT_CHARACTER_CONFIG.camera,
        ...(options.config?.camera || {})
      },
      colors: {
        ...DEFAULT_CHARACTER_CONFIG.colors,
        ...(options.config?.colors || {})
      }
    };

    // State & Kinematics
    this.position = new THREE.Vector3();
    if (options.initialPosition) {
      this.position.copy(options.initialPosition);
    }
    this.position.y = this._computeGroundHeight(this.position.x, this.position.z);

    this.velocity = new THREE.Vector3(0, 0, 0);
    this.horizontalVelocity = new THREE.Vector2(0, 0);
    this.verticalVelocity = 0.0;
    this.isGrounded = true;
    this.isSprinting = false;
    this.groundY = this.position.y;

    // Input States
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      sprint: false,
      jump: false,
    };

    // Virtual Joystick & Mobile inputs
    this.virtualJoystick = { x: 0, y: 0, active: false };
    this.jumpRequested = false;
    this.jumpBufferTimer = 0.0;
    this.coyoteTimer = 0.0;

    // Camera Orbit State
    this.cameraDistance = this.config.camera.defaultDistance;
    this.cameraYaw = 0.0; // Azimuth angle around avatar
    this.cameraPitch = this.config.camera.defaultPitch; // Elevation angle
    this.cameraLookTarget = new THREE.Vector3().copy(this.position);
    this.cameraLookTarget.y += this.config.camera.targetHeightOffset;
    this.desiredCameraPos = new THREE.Vector3();

    // Mouse & Touch Tracking State
    this.isOrbitDragging = false;
    this.activePointerId = null;
    this.pointerStartPos = { x: 0, y: 0 };
    this.lastPointerPos = { x: 0, y: 0 };

    // Procedural Animation State
    this.animTime = 0.0;
    this.idleTime = 0.0;
    this.currentSpeed = 0.0;
    this.landingDip = 0.0;
    this.targetRotationY = 0.0;

    // Build Student Avatar Mesh
    this._initAvatar();

    // Attach Event Listeners
    this._boundOnKeyDown = this._onKeyDown.bind(this);
    this._boundOnKeyUp = this._onKeyUp.bind(this);
    this._boundOnBlur = this._onBlur.bind(this);
    this._boundOnPointerDown = this._onPointerDown.bind(this);
    this._boundOnPointerMove = this._onPointerMove.bind(this);
    this._boundOnPointerUp = this._onPointerUp.bind(this);
    this._boundOnWheel = this._onWheel.bind(this);
    this._boundOnContextMenu = (e) => e.preventDefault();

    this._setupInputListeners();

    // Sync initial camera position
    this._snapCamera();
  }

  // ==========================================
  // 1. 3D STUDENT AVATAR CONSTRUCTION
  // ==========================================

  _initAvatar() {
    this.characterGroup = new THREE.Group();
    this.characterGroup.name = 'DTU_Student_Avatar';
    this.characterGroup.position.copy(this.position);

    const c = this.config.colors;

    // Shared Materials (optimized for standard PBR lighting)
    this.materials = {
      hoodie: new THREE.MeshStandardMaterial({
        color: c.hoodie,
        roughness: 0.65,
        metalness: 0.08,
      }),
      hoodiePocket: new THREE.MeshStandardMaterial({
        color: c.hoodiePocket,
        roughness: 0.7,
      }),
      hoodieAccent: new THREE.MeshStandardMaterial({
        color: c.hoodieStrings,
        roughness: 0.4,
      }),
      dtuGold: new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.6,
        roughness: 0.3,
      }),
      backpack: new THREE.MeshStandardMaterial({
        color: c.backpack,
        roughness: 0.85,
      }),
      backpackStraps: new THREE.MeshStandardMaterial({
        color: c.backpackStraps,
        roughness: 0.9,
      }),
      waterBottle: new THREE.MeshStandardMaterial({
        color: c.waterBottle,
        roughness: 0.2,
        metalness: 0.7,
      }),
      skin: new THREE.MeshStandardMaterial({
        color: c.skin,
        roughness: 0.6,
      }),
      hair: new THREE.MeshStandardMaterial({
        color: c.hair,
        roughness: 0.9,
      }),
      pants: new THREE.MeshStandardMaterial({
        color: c.pants,
        roughness: 0.75,
      }),
      shoes: new THREE.MeshStandardMaterial({
        color: c.shoes,
        roughness: 0.3,
      }),
      shoeSole: new THREE.MeshStandardMaterial({
        color: c.shoeSole,
        roughness: 0.9,
      }),
      shoeStripe: new THREE.MeshStandardMaterial({
        color: c.shoeStripe,
        roughness: 0.5,
      }),
      headphones: new THREE.MeshStandardMaterial({
        color: c.headphones,
        roughness: 0.3,
        metalness: 0.2,
      }),
      headphoneTrim: new THREE.MeshStandardMaterial({
        color: c.headphoneTrim,
        metalness: 0.8,
        roughness: 0.25,
      }),
      eyes: new THREE.MeshBasicMaterial({
        color: 0x0f172a,
      }),
      shadow: new THREE.MeshBasicMaterial({
        color: 0x05070a,
        transparent: true,
        opacity: 0.4,
        depthWrite: false,
      }),
    };

    // Shared Geometries to cleanly dispose later
    this.geometries = [];
    const registerGeo = (geo) => {
      this.geometries.push(geo);
      return geo;
    };

    // ------------------------------------------
    // Ground Contact Shadow Disk
    // ------------------------------------------
    const shadowGeo = registerGeo(new THREE.CircleGeometry(0.55, 24));
    shadowGeo.rotateX(-Math.PI / 2);
    this.shadowMesh = new THREE.Mesh(shadowGeo, this.materials.shadow);
    this.shadowMesh.position.y = 0.02;
    this.characterGroup.add(this.shadowMesh);

    // ------------------------------------------
    // Body Hierarchy
    // ------------------------------------------
    this.bodyGroup = new THREE.Group();
    this.characterGroup.add(this.bodyGroup);

    // Pelvis Group (root for upper torso, arms, head, backpack)
    this.pelvisGroup = new THREE.Group();
    this.pelvisGroup.position.y = 0.88;
    this.bodyGroup.add(this.pelvisGroup);

    // Main Torso / Hoodie
    const torsoGeo = registerGeo(new THREE.BoxGeometry(0.54, 0.56, 0.34));
    this.torsoMesh = new THREE.Mesh(torsoGeo, this.materials.hoodie);
    this.torsoMesh.position.y = 0.28;
    this.torsoMesh.castShadow = true;
    this.torsoMesh.receiveShadow = true;
    this.pelvisGroup.add(this.torsoMesh);

    // Front Kangaroo Pocket
    const pocketGeo = registerGeo(new THREE.BoxGeometry(0.38, 0.18, 0.08));
    const pocketMesh = new THREE.Mesh(pocketGeo, this.materials.hoodiePocket);
    pocketMesh.position.set(0, 0.16, 0.17);
    pocketMesh.castShadow = true;
    this.pelvisGroup.add(pocketMesh);

    // DTU Crest / Gold Chest Badge
    const badgeGeo = registerGeo(new THREE.BoxGeometry(0.12, 0.09, 0.02));
    const badgeMesh = new THREE.Mesh(badgeGeo, this.materials.dtuGold);
    badgeMesh.position.set(-0.14, 0.38, 0.18);
    this.pelvisGroup.add(badgeMesh);

    // Hoodie Drawstrings
    const stringGeo = registerGeo(new THREE.CylinderGeometry(0.012, 0.012, 0.18, 8));
    const stringLeft = new THREE.Mesh(stringGeo, this.materials.hoodieAccent);
    stringLeft.position.set(-0.06, 0.38, 0.18);
    this.pelvisGroup.add(stringLeft);

    const stringRight = new THREE.Mesh(stringGeo, this.materials.hoodieAccent);
    stringRight.position.set(0.06, 0.38, 0.18);
    this.pelvisGroup.add(stringRight);

    // Folded Hood on Back
    const hoodGeo = registerGeo(new THREE.BoxGeometry(0.42, 0.22, 0.14));
    const hoodMesh = new THREE.Mesh(hoodGeo, this.materials.hoodie);
    hoodMesh.position.set(0, 0.44, -0.2);
    hoodMesh.rotation.x = -0.25;
    hoodMesh.castShadow = true;
    this.pelvisGroup.add(hoodMesh);

    // ------------------------------------------
    // Student College Backpack
    // ------------------------------------------
    this.backpackGroup = new THREE.Group();
    this.backpackGroup.position.set(0, 0.26, -0.24);

    const bagGeo = registerGeo(new THREE.BoxGeometry(0.42, 0.46, 0.22));
    const bagMesh = new THREE.Mesh(bagGeo, this.materials.backpack);
    bagMesh.castShadow = true;
    this.backpackGroup.add(bagMesh);

    // Backpack Outer Zipper Pocket
    const bagPocketGeo = registerGeo(new THREE.BoxGeometry(0.32, 0.22, 0.08));
    const bagPocketMesh = new THREE.Mesh(bagPocketGeo, this.materials.backpackStraps);
    bagPocketMesh.position.set(0, -0.09, -0.12);
    bagPocketMesh.castShadow = true;
    this.backpackGroup.add(bagPocketMesh);

    // Water Bottle in Side Pocket
    const bottleGeo = registerGeo(new THREE.CylinderGeometry(0.05, 0.05, 0.26, 12));
    const bottleMesh = new THREE.Mesh(bottleGeo, this.materials.waterBottle);
    bottleMesh.position.set(0.23, -0.03, 0);
    bottleMesh.rotation.z = -0.12;
    bottleMesh.castShadow = true;
    this.backpackGroup.add(bottleMesh);

    // Shoulder Straps
    const strapGeo = registerGeo(new THREE.BoxGeometry(0.08, 0.48, 0.04));
    const strapL = new THREE.Mesh(strapGeo, this.materials.backpackStraps);
    strapL.position.set(-0.16, 0.06, 0.22);
    this.backpackGroup.add(strapL);

    const strapR = new THREE.Mesh(strapGeo, this.materials.backpackStraps);
    strapR.position.set(0.16, 0.06, 0.22);
    this.backpackGroup.add(strapR);

    this.pelvisGroup.add(this.backpackGroup);

    // ------------------------------------------
    // Neck & Head
    // ------------------------------------------
    const neckGeo = registerGeo(new THREE.CylinderGeometry(0.09, 0.1, 0.12, 10));
    const neckMesh = new THREE.Mesh(neckGeo, this.materials.skin);
    neckMesh.position.y = 0.6;
    this.pelvisGroup.add(neckMesh);

    this.headGroup = new THREE.Group();
    this.headGroup.position.y = 0.82;
    this.pelvisGroup.add(this.headGroup);

    // Low-poly Head Mesh
    const headGeo = registerGeo(new THREE.BoxGeometry(0.38, 0.4, 0.38));
    const headMesh = new THREE.Mesh(headGeo, this.materials.skin);
    headMesh.castShadow = true;
    this.headGroup.add(headMesh);

    // Stylized Student Hair (Modern fade / undercut)
    const hairGeo = registerGeo(new THREE.BoxGeometry(0.42, 0.18, 0.42));
    const hairMesh = new THREE.Mesh(hairGeo, this.materials.hair);
    hairMesh.position.set(0, 0.18, -0.02);
    hairMesh.castShadow = true;
    this.headGroup.add(hairMesh);

    // Hair Fringe / Front Bangs
    const fringeGeo = registerGeo(new THREE.BoxGeometry(0.4, 0.12, 0.12));
    const fringeMesh = new THREE.Mesh(fringeGeo, this.materials.hair);
    fringeMesh.position.set(0, 0.16, 0.18);
    fringeMesh.rotation.x = -0.15;
    this.headGroup.add(fringeMesh);

    // Stylized Eyes
    const eyeGeo = registerGeo(new THREE.BoxGeometry(0.05, 0.05, 0.02));
    const eyeLeft = new THREE.Mesh(eyeGeo, this.materials.eyes);
    eyeLeft.position.set(-0.1, 0.02, 0.2);
    this.headGroup.add(eyeLeft);

    const eyeRight = new THREE.Mesh(eyeGeo, this.materials.eyes);
    eyeRight.position.set(0.1, 0.02, 0.2);
    this.headGroup.add(eyeRight);

    // Over-Ear Headphones around neck
    const hpBandGeo = registerGeo(new THREE.TorusGeometry(0.19, 0.028, 8, 20, Math.PI * 1.25));
    hpBandGeo.rotateX(Math.PI / 2);
    const hpBand = new THREE.Mesh(hpBandGeo, this.materials.headphones);
    hpBand.position.set(0, -0.22, 0);
    this.headGroup.add(hpBand);

    const cupGeo = registerGeo(new THREE.CylinderGeometry(0.07, 0.07, 0.06, 12));
    const cupL = new THREE.Mesh(cupGeo, this.materials.headphoneTrim);
    cupL.rotation.z = Math.PI / 2;
    cupL.position.set(-0.21, -0.22, 0);
    this.headGroup.add(cupL);

    const cupR = new THREE.Mesh(cupGeo, this.materials.headphoneTrim);
    cupR.rotation.z = Math.PI / 2;
    cupR.position.set(0.21, -0.22, 0);
    this.headGroup.add(cupR);

    // ------------------------------------------
    // Left & Right Arms
    // ------------------------------------------
    const armUpperGeo = registerGeo(new THREE.BoxGeometry(0.15, 0.28, 0.15));
    const forearmGeo = registerGeo(new THREE.BoxGeometry(0.13, 0.26, 0.13));
    const handGeo = registerGeo(new THREE.BoxGeometry(0.11, 0.12, 0.11));

    // Left Arm Hierarchy
    this.leftShoulderGroup = new THREE.Group();
    this.leftShoulderGroup.position.set(-0.35, 0.44, 0);
    this.pelvisGroup.add(this.leftShoulderGroup);

    const leftUpperArm = new THREE.Mesh(armUpperGeo, this.materials.hoodie);
    leftUpperArm.position.y = -0.14;
    leftUpperArm.castShadow = true;
    this.leftShoulderGroup.add(leftUpperArm);

    this.leftElbowGroup = new THREE.Group();
    this.leftElbowGroup.position.y = -0.28;
    this.leftShoulderGroup.add(this.leftElbowGroup);

    const leftForearm = new THREE.Mesh(forearmGeo, this.materials.hoodie);
    leftForearm.position.y = -0.13;
    leftForearm.castShadow = true;
    this.leftElbowGroup.add(leftForearm);

    const leftHand = new THREE.Mesh(handGeo, this.materials.skin);
    leftHand.position.y = -0.3;
    this.leftElbowGroup.add(leftHand);

    // Right Arm Hierarchy
    this.rightShoulderGroup = new THREE.Group();
    this.rightShoulderGroup.position.set(0.35, 0.44, 0);
    this.pelvisGroup.add(this.rightShoulderGroup);

    const rightUpperArm = new THREE.Mesh(armUpperGeo, this.materials.hoodie);
    rightUpperArm.position.y = -0.14;
    rightUpperArm.castShadow = true;
    this.rightShoulderGroup.add(rightUpperArm);

    this.rightElbowGroup = new THREE.Group();
    this.rightElbowGroup.position.y = -0.28;
    this.rightShoulderGroup.add(this.rightElbowGroup);

    const rightForearm = new THREE.Mesh(forearmGeo, this.materials.hoodie);
    rightForearm.position.y = -0.13;
    rightForearm.castShadow = true;
    this.rightElbowGroup.add(rightForearm);

    const rightHand = new THREE.Mesh(handGeo, this.materials.skin);
    rightHand.position.y = -0.3;
    this.rightElbowGroup.add(rightHand);

    // ------------------------------------------
    // Left & Right Legs (Jeans & Sneakers)
    // ------------------------------------------
    const thighGeo = registerGeo(new THREE.BoxGeometry(0.18, 0.4, 0.18));
    const shinGeo = registerGeo(new THREE.BoxGeometry(0.16, 0.38, 0.16));
    const shoeGeo = registerGeo(new THREE.BoxGeometry(0.17, 0.12, 0.28));
    const soleGeo = registerGeo(new THREE.BoxGeometry(0.18, 0.04, 0.3));
    const shoeStripeGeo = registerGeo(new THREE.BoxGeometry(0.175, 0.03, 0.2));

    // Left Leg Hierarchy
    this.leftHipGroup = new THREE.Group();
    this.leftHipGroup.position.set(-0.16, 0.88, 0);
    this.bodyGroup.add(this.leftHipGroup);

    const leftThigh = new THREE.Mesh(thighGeo, this.materials.pants);
    leftThigh.position.y = -0.2;
    leftThigh.castShadow = true;
    this.leftHipGroup.add(leftThigh);

    this.leftKneeGroup = new THREE.Group();
    this.leftKneeGroup.position.y = -0.4;
    this.leftHipGroup.add(this.leftKneeGroup);

    const leftShin = new THREE.Mesh(shinGeo, this.materials.pants);
    leftShin.position.y = -0.19;
    leftShin.castShadow = true;
    this.leftKneeGroup.add(leftShin);

    const leftShoe = new THREE.Mesh(shoeGeo, this.materials.shoes);
    leftShoe.position.set(0, -0.42, 0.05);
    leftShoe.castShadow = true;
    this.leftKneeGroup.add(leftShoe);

    const leftStripe = new THREE.Mesh(shoeStripeGeo, this.materials.shoeStripe);
    leftStripe.position.set(0, -0.41, 0.05);
    this.leftKneeGroup.add(leftStripe);

    const leftSole = new THREE.Mesh(soleGeo, this.materials.shoeSole);
    leftSole.position.set(0, -0.47, 0.05);
    this.leftKneeGroup.add(leftSole);

    // Right Leg Hierarchy
    this.rightHipGroup = new THREE.Group();
    this.rightHipGroup.position.set(0.16, 0.88, 0);
    this.bodyGroup.add(this.rightHipGroup);

    const rightThigh = new THREE.Mesh(thighGeo, this.materials.pants);
    rightThigh.position.y = -0.2;
    rightThigh.castShadow = true;
    this.rightHipGroup.add(rightThigh);

    this.rightKneeGroup = new THREE.Group();
    this.rightKneeGroup.position.y = -0.4;
    this.rightHipGroup.add(this.rightKneeGroup);

    const rightShin = new THREE.Mesh(shinGeo, this.materials.pants);
    rightShin.position.y = -0.19;
    rightShin.castShadow = true;
    this.rightKneeGroup.add(rightShin);

    const rightShoe = new THREE.Mesh(shoeGeo, this.materials.shoes);
    rightShoe.position.set(0, -0.42, 0.05);
    rightShoe.castShadow = true;
    this.rightKneeGroup.add(rightShoe);

    const rightStripe = new THREE.Mesh(shoeStripeGeo, this.materials.shoeStripe);
    rightStripe.position.set(0, -0.41, 0.05);
    this.rightKneeGroup.add(rightStripe);

    const rightSole = new THREE.Mesh(soleGeo, this.materials.shoeSole);
    rightSole.position.set(0, -0.47, 0.05);
    this.rightKneeGroup.add(rightSole);

    // Add character to scene
    this.scene.add(this.characterGroup);
  }

  // ==========================================
  // 2. INPUT & EVENT LISTENERS
  // ==========================================

  _setupInputListeners() {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', this._boundOnKeyDown);
    window.addEventListener('keyup', this._boundOnKeyUp);
    window.addEventListener('blur', this._boundOnBlur);

    // Pointer events on domElement for Camera Orbit
    const target = this.domElement || window;
    target.addEventListener('pointerdown', this._boundOnPointerDown, { passive: false });
    window.addEventListener('pointermove', this._boundOnPointerMove, { passive: true });
    window.addEventListener('pointerup', this._boundOnPointerUp, { passive: true });
    window.addEventListener('pointercancel', this._boundOnPointerUp, { passive: true });
    target.addEventListener('wheel', this._boundOnWheel, { passive: false });
    target.addEventListener('contextmenu', this._boundOnContextMenu);
  }

  _cleanupInputListeners() {
    if (typeof window === 'undefined') return;

    window.removeEventListener('keydown', this._boundOnKeyDown);
    window.removeEventListener('keyup', this._boundOnKeyUp);
    window.removeEventListener('blur', this._boundOnBlur);

    const target = this.domElement || window;
    if (target) {
      target.removeEventListener('pointerdown', this._boundOnPointerDown);
      target.removeEventListener('wheel', this._boundOnWheel);
      target.removeEventListener('contextmenu', this._boundOnContextMenu);
    }
    window.removeEventListener('pointermove', this._boundOnPointerMove);
    window.removeEventListener('pointerup', this._boundOnPointerUp);
    window.removeEventListener('pointercancel', this._boundOnPointerUp);
  }

  _onKeyDown(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
      return;
    }

    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.forward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.backward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = true;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.keys.sprint = true;
        break;
      case 'Space':
        e.preventDefault();
        this.keys.jump = true;
        this.triggerJump();
        break;
    }
  }

  _onKeyUp(e) {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.forward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.backward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = false;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.keys.sprint = false;
        break;
      case 'Space':
        this.keys.jump = false;
        break;
    }
  }

  _onBlur() {
    // Reset inputs when tab loses focus to prevent stuck movement
    this.keys.forward = false;
    this.keys.backward = false;
    this.keys.left = false;
    this.keys.right = false;
    this.keys.sprint = false;
    this.keys.jump = false;
    this.isOrbitDragging = false;
    this.activePointerId = null;
  }

  _onPointerDown(e) {
    // Check if pointer is on a UI button/joystick
    const target = e.target;
    if (target && target.closest && (target.closest('button') || target.closest('[data-joystick]') || target.closest('.no-orbit'))) {
      return;
    }

    if (!this.isOrbitDragging) {
      this.isOrbitDragging = true;
      this.activePointerId = e.pointerId;
      this.pointerStartPos.x = e.clientX;
      this.pointerStartPos.y = e.clientY;
      this.lastPointerPos.x = e.clientX;
      this.lastPointerPos.y = e.clientY;
    }
  }

  _onPointerMove(e) {
    if (!this.isOrbitDragging || e.pointerId !== this.activePointerId) return;

    const deltaX = e.clientX - this.lastPointerPos.x;
    const deltaY = e.clientY - this.lastPointerPos.y;

    this.lastPointerPos.x = e.clientX;
    this.lastPointerPos.y = e.clientY;

    const sens = e.pointerType === 'touch' 
      ? this.config.camera.touchSensitivity 
      : this.config.camera.mouseSensitivity;

    // Orbit Yaw (Horizontal rotation)
    this.cameraYaw -= deltaX * sens;

    // Orbit Pitch (Vertical elevation)
    this.cameraPitch += deltaY * sens;
    this.cameraPitch = Math.max(
      this.config.camera.minPitch,
      Math.min(this.config.camera.maxPitch, this.cameraPitch)
    );
  }

  _onPointerUp(e) {
    if (this.isOrbitDragging && e.pointerId === this.activePointerId) {
      this.isOrbitDragging = false;
      this.activePointerId = null;
    }
  }

  _onWheel(e) {
    e.preventDefault();
    this.cameraDistance += e.deltaY * this.config.camera.zoomSensitivity;
    this.cameraDistance = Math.max(
      this.config.camera.minDistance,
      Math.min(this.config.camera.maxDistance, this.cameraDistance)
    );
  }

  // ==========================================
  // 3. PUBLIC MOBILE CONTROLS & API
  // ==========================================

  /**
   * Set on-screen virtual joystick direction.
   * @param {number} dx - Horizontal axis (-1.0 to 1.0)
   * @param {number} dy - Vertical axis (-1.0 to 1.0, forward is negative or positive, normalized)
   */
  setVirtualJoystick(dx, dy) {
    const len = Math.hypot(dx, dy);
    const deadzone = 0.08;

    if (len < deadzone) {
      this.virtualJoystick.x = 0;
      this.virtualJoystick.y = 0;
      this.virtualJoystick.active = false;
      return;
    }

    // Normalized joystick vector
    const norm = len > 1.0 ? 1.0 / len : 1.0;
    this.virtualJoystick.x = dx * norm;
    this.virtualJoystick.y = dy * norm;
    this.virtualJoystick.active = true;

    // If pushed beyond 85%, automatically activate sprint for smooth mobile ergonomics
    if (len > 0.85) {
      this.virtualJoystick.autoSprint = true;
    } else {
      this.virtualJoystick.autoSprint = false;
    }
  }

  /**
   * Triggers jump immediately (works for mobile jump button or touch tap).
   */
  triggerJump() {
    this.jumpRequested = true;
    this.jumpBufferTimer = this.config.jumpBufferTime;
  }

  /**
   * Explicitly toggle sprint mode (e.g. mobile Sprint button).
   * @param {boolean} active 
   */
  setSprint(active) {
    this.isSprinting = Boolean(active);
  }

  /**
   * Teleport character to a new position.
   * @param {number} x 
   * @param {number} y 
   * @param {number} z 
   */
  setPosition(x, y, z) {
    this.position.set(x, y, z);
    this.groundY = this._computeGroundHeight(x, z);
    this.characterGroup.position.copy(this.position);
    this.verticalVelocity = 0;
    this._snapCamera();
  }

  /**
   * Returns current world position of character.
   * @returns {THREE.Vector3}
   */
  getPosition() {
    return this.position.clone();
  }

  /**
   * Returns current velocity vector.
   * @returns {THREE.Vector3}
   */
  getVelocity() {
    return this.velocity.clone();
  }

  /**
   * Returns Three.js avatar group for custom attachments / effects.
   * @returns {THREE.Group}
   */
  getMesh() {
    return this.characterGroup;
  }

  /**
   * Dynamically update campus boundary clamping.
   * @param {Object} bounds - { minX, maxX, minZ, maxZ }
   */
  setBoundaries(bounds) {
    this.config.boundaries = {
      ...this.config.boundaries,
      ...bounds
    };
  }

  // ==========================================
  // 4. KINEMATICS & PHYSICS UPDATE LOOP
  // ==========================================

  _computeGroundHeight(x, z) {
    if (typeof this.getGroundHeight === 'function') {
      try {
        return this.getGroundHeight(x, z);
      } catch (e) {
        return this.config.groundY;
      }
    }
    return this.config.groundY;
  }

  /**
   * Main per-frame update method.
   * @param {number} delta - Frame delta time in seconds (e.g. 1/60)
   */
  update(delta) {
    if (!delta || delta <= 0) return;

    // Clamp huge delta spikes from background tab throttling
    const dt = Math.min(delta, 0.08);

    // 1. Gather directional input
    let inputX = 0;
    let inputZ = 0;

    if (this.keys.forward) inputZ += 1;
    if (this.keys.backward) inputZ -= 1;
    if (this.keys.left) inputX -= 1;
    if (this.keys.right) inputX += 1;

    // Combine with virtual joystick if active
    if (this.virtualJoystick.active) {
      inputX += this.virtualJoystick.x;
      // Joystick standard: negative Y on screen is up/forward
      inputZ += -this.virtualJoystick.y;
    }

    const inputLength = Math.hypot(inputX, inputZ);
    if (inputLength > 1.0) {
      inputX /= inputLength;
      inputZ /= inputLength;
    }

    // Determine sprint state
    const wantsSprint = this.keys.sprint || this.virtualJoystick.autoSprint || this.isSprinting;
    const targetMaxSpeed = wantsSprint ? this.config.sprintSpeed : this.config.walkSpeed;

    // 2. Camera-Relative Movement Computation
    // Forward vector in horizontal X-Z plane
    const camAngle = this.cameraYaw;
    const forwardX = -Math.sin(camAngle);
    const forwardZ = -Math.cos(camAngle);
    const rightX = -forwardZ;
    const rightZ = forwardX;

    // World-space desired movement direction
    let moveDirX = (rightX * inputX) + (forwardX * inputZ);
    let moveDirZ = (rightZ * inputX) + (forwardZ * inputZ);

    const moveMag = Math.hypot(moveDirX, moveDirZ);
    if (moveMag > 0.001) {
      moveDirX /= moveMag;
      moveDirZ /= moveMag;
    }

    const targetSpeed = Math.min(1.0, inputLength) * targetMaxSpeed;
    const targetVelX = moveDirX * targetSpeed;
    const targetVelZ = moveDirZ * targetSpeed;

    // 3. Horizontal Acceleration & Deceleration Inertia
    const accelRate = this.isGrounded 
      ? (inputLength > 0.01 ? this.config.groundAcceleration : this.config.groundDeceleration)
      : this.config.airAcceleration;

    this.horizontalVelocity.x = THREE.MathUtils.damp(
      this.horizontalVelocity.x,
      targetVelX,
      accelRate,
      dt
    );
    this.horizontalVelocity.y = THREE.MathUtils.damp(
      this.horizontalVelocity.y,
      targetVelZ,
      accelRate,
      dt
    );

    this.currentSpeed = this.horizontalVelocity.length();

    // 4. Smooth Character Yaw Orientation
    if (this.currentSpeed > 0.3) {
      this.targetRotationY = Math.atan2(this.horizontalVelocity.x, this.horizontalVelocity.y);
      
      // Shortest angle difference wrap-around
      let angleDiff = this.targetRotationY - this.characterGroup.rotation.y;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      this.characterGroup.rotation.y += angleDiff * Math.min(1.0, dt * this.config.turnSpeed);
    }

    // 5. Jump & Vertical Gravity Physics
    this.groundY = this._computeGroundHeight(this.position.x, this.position.z);

    if (this.isGrounded) {
      this.coyoteTimer = this.config.coyoteTime;
    } else {
      this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);
    }

    if (this.jumpRequested) {
      this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - dt);
      if (this.jumpBufferTimer <= 0) {
        this.jumpRequested = false;
      }
    }

    // Execute Jump if buffered & within coyote window
    if (this.jumpRequested && this.coyoteTimer > 0) {
      this.verticalVelocity = this.config.jumpImpulse;
      this.isGrounded = false;
      this.jumpRequested = false;
      this.jumpBufferTimer = 0;
      this.coyoteTimer = 0;
    }

    // Apply Gravity in air
    if (!this.isGrounded) {
      this.verticalVelocity += this.config.gravity * dt;
      this.position.y += this.verticalVelocity * dt;

      // Ground Collision Check
      if (this.position.y <= this.groundY) {
        this.position.y = this.groundY;
        this.verticalVelocity = 0;
        this.isGrounded = true;
        // Impact squash dip
        this.landingDip = 0.12;
      }
    } else {
      // Smooth terrain adherence
      this.position.y = this.groundY;
    }

    // Apply Horizontal Velocity to Position with smooth wall sliding
    const nextX = this.position.x + this.horizontalVelocity.x * dt;
    if (typeof this.checkCollision === 'function' && this.checkCollision(nextX, this.position.z, 0.55)) {
      this.horizontalVelocity.x = 0;
    } else {
      this.position.x = nextX;
    }

    const nextZ = this.position.z + this.horizontalVelocity.y * dt;
    if (typeof this.checkCollision === 'function' && this.checkCollision(this.position.x, nextZ, 0.55)) {
      this.horizontalVelocity.y = 0;
    } else {
      this.position.z = nextZ;
    }

    // 6. Campus Boundary Clamping
    this._enforceBoundaries();

    // Update root group position
    this.characterGroup.position.copy(this.position);

    // Sync composite velocity vector
    this.velocity.set(this.horizontalVelocity.x, this.verticalVelocity, this.horizontalVelocity.y);

    // 7. Procedural Locomotion Animations
    this._updateProceduralAnimation(dt);

    // 8. Smooth 3rd-Person Camera Tracking
    this._updateCamera(dt);
  }

  // ==========================================
  // 5. CAMPUS BOUNDARY CLAMPING
  // ==========================================

  _enforceBoundaries() {
    const b = this.config.boundaries;
    let hit = false;

    if (this.position.x < b.minX) {
      this.position.x = b.minX;
      if (this.horizontalVelocity.x < 0) this.horizontalVelocity.x = 0;
      hit = true;
    } else if (this.position.x > b.maxX) {
      this.position.x = b.maxX;
      if (this.horizontalVelocity.x > 0) this.horizontalVelocity.x = 0;
      hit = true;
    }

    if (this.position.z < b.minZ) {
      this.position.z = b.minZ;
      if (this.horizontalVelocity.y < 0) this.horizontalVelocity.y = 0;
      hit = true;
    } else if (this.position.z > b.maxZ) {
      this.position.z = b.maxZ;
      if (this.horizontalVelocity.y > 0) this.horizontalVelocity.y = 0;
      hit = true;
    }

    if (hit && typeof this.onBoundaryHit === 'function') {
      this.onBoundaryHit({ x: this.position.x, z: this.position.z });
    }
  }

  // ==========================================
  // 6. PROCEDURAL LOCOMOTION ANIMATION
  // ==========================================

  _updateProceduralAnimation(dt) {
    this.idleTime += dt;

    // Recover from landing squash
    if (this.landingDip > 0.001) {
      this.landingDip = THREE.MathUtils.damp(this.landingDip, 0, 15, dt);
    } else {
      this.landingDip = 0;
    }

    const isRunning = this.currentSpeed > (this.config.walkSpeed + 2.0);
    const isMoving = this.currentSpeed > 0.15;

    // ------------------------------------------
    // In-Air / Jump State
    // ------------------------------------------
    if (!this.isGrounded) {
      // Dynamic ground shadow scaling & opacity based on height
      const heightAboveGround = Math.max(0, this.position.y - this.groundY);
      const shadowScale = Math.max(0.2, 1.0 - heightAboveGround * 0.16);
      this.shadowMesh.scale.set(shadowScale, shadowScale, shadowScale);
      this.shadowMesh.position.y = 0.02 - heightAboveGround;
      this.materials.shadow.opacity = Math.max(0.08, 0.4 - heightAboveGround * 0.08);

      // Jump Pose: Arms up, legs tuck/trail
      const isRising = this.verticalVelocity > 0;
      const targetArmX = isRising ? -0.7 : -0.3;
      const targetLegX = isRising ? 0.35 : 0.15;

      this.leftShoulderGroup.rotation.x = THREE.MathUtils.damp(this.leftShoulderGroup.rotation.x, targetArmX, 8, dt);
      this.rightShoulderGroup.rotation.x = THREE.MathUtils.damp(this.rightShoulderGroup.rotation.x, targetArmX, 8, dt);
      this.leftShoulderGroup.rotation.z = THREE.MathUtils.damp(this.leftShoulderGroup.rotation.z, -0.3, 8, dt);
      this.rightShoulderGroup.rotation.z = THREE.MathUtils.damp(this.rightShoulderGroup.rotation.z, 0.3, 8, dt);

      this.leftHipGroup.rotation.x = THREE.MathUtils.damp(this.leftHipGroup.rotation.x, targetLegX, 8, dt);
      this.rightHipGroup.rotation.x = THREE.MathUtils.damp(this.rightHipGroup.rotation.x, -targetLegX * 0.6, 8, dt);
      this.leftKneeGroup.rotation.x = THREE.MathUtils.damp(this.leftKneeGroup.rotation.x, 0.5, 8, dt);
      this.rightKneeGroup.rotation.x = THREE.MathUtils.damp(this.rightKneeGroup.rotation.x, 0.2, 8, dt);

      this.pelvisGroup.position.y = THREE.MathUtils.damp(this.pelvisGroup.position.y, 0.88, 10, dt);
      this.pelvisGroup.rotation.x = THREE.MathUtils.damp(this.pelvisGroup.rotation.x, 0.1, 8, dt);
      return;
    }

    // Reset shadow on ground
    this.shadowMesh.scale.set(1.0, 1.0, 1.0);
    this.shadowMesh.position.y = 0.02;
    this.materials.shadow.opacity = 0.4;

    // ------------------------------------------
    // Moving: Walk or Sprint State
    // ------------------------------------------
    if (isMoving) {
      const strideRate = isRunning ? 0.62 : 0.72;
      this.animTime += dt * (this.currentSpeed * strideRate);

      const armAmp = isRunning ? 0.85 : 0.52;
      const legAmp = isRunning ? 0.95 : 0.62;
      const bobAmp = isRunning ? 0.09 : 0.055;
      const leanX = isRunning ? 0.16 : 0.06;

      // Limb swings (Opposite arms and legs)
      const swing = Math.sin(this.animTime);
      this.leftHipGroup.rotation.x = swing * legAmp;
      this.rightHipGroup.rotation.x = -swing * legAmp;

      // Knee bending on backswing
      this.leftKneeGroup.rotation.x = Math.max(0, -swing * (isRunning ? 0.85 : 0.55));
      this.rightKneeGroup.rotation.x = Math.max(0, swing * (isRunning ? 0.85 : 0.55));

      // Arm swings
      this.leftShoulderGroup.rotation.x = -swing * armAmp;
      this.rightShoulderGroup.rotation.x = swing * armAmp;
      this.leftShoulderGroup.rotation.z = -0.06;
      this.rightShoulderGroup.rotation.z = 0.06;

      // Elbow flex
      const elbowBase = isRunning ? -0.65 : -0.25;
      this.leftElbowGroup.rotation.x = elbowBase - Math.abs(swing) * 0.2;
      this.rightElbowGroup.rotation.x = elbowBase - Math.abs(swing) * 0.2;

      // Pelvis vertical footfall bobbing
      const bob = Math.abs(Math.sin(this.animTime)) * bobAmp;
      this.pelvisGroup.position.y = 0.88 + bob - this.landingDip;

      // Torso athletic lean and slight yaw counter-twist
      this.pelvisGroup.rotation.x = leanX;
      this.pelvisGroup.rotation.z = Math.sin(this.animTime) * 0.03;
      this.pelvisGroup.rotation.y = Math.sin(this.animTime) * 0.04;

      // Dynamic backpack sway
      this.backpackGroup.rotation.x = -0.08 + Math.sin(this.animTime * 2) * (isRunning ? 0.06 : 0.03);

    } else {
      // ------------------------------------------
      // Idle Breathing & Relaxation State
      // ------------------------------------------
      const breath = Math.sin(this.idleTime * 2.2);
      this.pelvisGroup.position.y = THREE.MathUtils.damp(
        this.pelvisGroup.position.y,
        0.88 + breath * 0.012 - this.landingDip,
        8,
        dt
      );

      // Return limbs smoothly to rest
      this.leftHipGroup.rotation.x = THREE.MathUtils.damp(this.leftHipGroup.rotation.x, 0, 10, dt);
      this.rightHipGroup.rotation.x = THREE.MathUtils.damp(this.rightHipGroup.rotation.x, 0, 10, dt);
      this.leftKneeGroup.rotation.x = THREE.MathUtils.damp(this.leftKneeGroup.rotation.x, 0, 10, dt);
      this.rightKneeGroup.rotation.x = THREE.MathUtils.damp(this.rightKneeGroup.rotation.x, 0, 10, dt);

      // Subtle gentle arm sway
      this.leftShoulderGroup.rotation.x = THREE.MathUtils.damp(this.leftShoulderGroup.rotation.x, breath * 0.03, 6, dt);
      this.rightShoulderGroup.rotation.x = THREE.MathUtils.damp(this.rightShoulderGroup.rotation.x, -breath * 0.03, 6, dt);
      this.leftShoulderGroup.rotation.z = THREE.MathUtils.damp(this.leftShoulderGroup.rotation.z, -0.04, 6, dt);
      this.rightShoulderGroup.rotation.z = THREE.MathUtils.damp(this.rightShoulderGroup.rotation.z, 0.04, 6, dt);

      this.leftElbowGroup.rotation.x = THREE.MathUtils.damp(this.leftElbowGroup.rotation.x, -0.1, 6, dt);
      this.rightElbowGroup.rotation.x = THREE.MathUtils.damp(this.rightElbowGroup.rotation.x, -0.1, 6, dt);

      this.pelvisGroup.rotation.x = THREE.MathUtils.damp(this.pelvisGroup.rotation.x, 0, 8, dt);
      this.pelvisGroup.rotation.y = THREE.MathUtils.damp(this.pelvisGroup.rotation.y, 0, 8, dt);
      this.pelvisGroup.rotation.z = THREE.MathUtils.damp(this.pelvisGroup.rotation.z, 0, 8, dt);
      this.backpackGroup.rotation.x = THREE.MathUtils.damp(this.backpackGroup.rotation.x, 0, 8, dt);
    }
  }

  // ==========================================
  // 7. SMOOTH 3RD-PERSON CAMERA TRACKING
  // ==========================================

  _updateCamera(dt) {
    // Target position above student avatar (chest/head height)
    const targetLookPoint = new THREE.Vector3(
      this.position.x,
      this.position.y + this.config.camera.targetHeightOffset,
      this.position.z
    );

    // Calculate spherical offset from pitch, yaw, and distance
    const cosPitch = Math.cos(this.cameraPitch);
    const sinPitch = Math.sin(this.cameraPitch);
    const sinYaw = Math.sin(this.cameraYaw);
    const cosYaw = Math.cos(this.cameraYaw);

    const offsetX = this.cameraDistance * cosPitch * sinYaw;
    const offsetY = this.cameraDistance * sinPitch;
    const offsetZ = this.cameraDistance * cosPitch * cosYaw;

    this.desiredCameraPos.set(
      targetLookPoint.x + offsetX,
      targetLookPoint.y + offsetY,
      targetLookPoint.z + offsetZ
    );

    // Frame-rate independent exponential lerp smoothing (prevents micro-stutter)
    const camLerp = 1.0 - Math.exp(-this.config.camera.followDamping * dt);
    const lookLerp = 1.0 - Math.exp(-this.config.camera.lookDamping * dt);

    this.camera.position.lerp(this.desiredCameraPos, camLerp);
    this.cameraLookTarget.lerp(targetLookPoint, lookLerp);
    this.camera.lookAt(this.cameraLookTarget);
  }

  _snapCamera() {
    const targetLookPoint = new THREE.Vector3(
      this.position.x,
      this.position.y + this.config.camera.targetHeightOffset,
      this.position.z
    );

    const cosPitch = Math.cos(this.cameraPitch);
    const sinPitch = Math.sin(this.cameraPitch);
    const sinYaw = Math.sin(this.cameraYaw);
    const cosYaw = Math.cos(this.cameraYaw);

    this.desiredCameraPos.set(
      targetLookPoint.x + this.cameraDistance * cosPitch * sinYaw,
      targetLookPoint.y + this.cameraDistance * sinPitch,
      targetLookPoint.z + this.cameraDistance * cosPitch * cosYaw
    );

    this.camera.position.copy(this.desiredCameraPos);
    this.cameraLookTarget.copy(targetLookPoint);
    this.camera.lookAt(this.cameraLookTarget);
  }

  // ==========================================
  // 8. CLEANUP & MEMORY DISPOSAL
  // ==========================================

  /**
   * Disposes all meshes, geometries, materials, and removes all DOM event listeners.
   */
  dispose() {
    this._cleanupInputListeners();

    // Remove avatar mesh from scene
    if (this.characterGroup && this.characterGroup.parent) {
      this.characterGroup.parent.remove(this.characterGroup);
    }

    // Traverse and dispose all child geometries & materials
    if (this.characterGroup) {
      this.characterGroup.traverse((child) => {
        if (child.isMesh) {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((m) => m.dispose());
            } else {
              child.material.dispose();
            }
          }
        }
      });
    }

    // Dispose cached shared geometries
    if (this.geometries && Array.isArray(this.geometries)) {
      this.geometries.forEach((g) => {
        try { g.dispose(); } catch (e) { /* ignore already disposed */ }
      });
      this.geometries = [];
    }

    // Dispose cached shared materials
    if (this.materials) {
      Object.values(this.materials).forEach((m) => {
        try { m.dispose(); } catch (e) { /* ignore */ }
      });
      this.materials = null;
    }

    this.characterGroup = null;
    this.scene = null;
    this.camera = null;
    this.domElement = null;
  }
}

// ==========================================
// 9. REACT COMPONENT & HOOK INTEGRATIONS
// ==========================================

/**
 * Custom React Hook for initializing and accessing the CharacterController.
 */
export function useCharacterController({
  scene,
  camera,
  domElement,
  config,
  initialPosition,
  boundaries,
  getGroundHeight,
  onBoundaryHit
}) {
  const controllerRef = useRef(null);

  useEffect(() => {
    if (!scene || !camera) return;

    const controller = new CharacterController({
      scene,
      camera,
      domElement,
      config,
      initialPosition,
      boundaries,
      getGroundHeight,
      onBoundaryHit
    });

    controllerRef.current = controller;

    return () => {
      if (controllerRef.current) {
        controllerRef.current.dispose();
        controllerRef.current = null;
      }
    };
  }, [scene, camera, domElement]);

  return controllerRef;
}

/**
 * React Component Wrapper for CharacterController.
 * Mounts cleanly and exposes controller instance via onInit callback or ref.
 */
export const CharacterControllerComponent = React.forwardRef(function CharacterControllerComponent(
  {
    scene,
    camera,
    domElement,
    config,
    initialPosition,
    boundaries,
    getGroundHeight,
    onBoundaryHit,
    onInit
  },
  ref
) {
  const controllerRef = useCharacterController({
    scene,
    camera,
    domElement,
    config,
    initialPosition,
    boundaries,
    getGroundHeight,
    onBoundaryHit
  });

  useEffect(() => {
    if (controllerRef.current) {
      if (typeof onInit === 'function') {
        onInit(controllerRef.current);
      }
      if (ref) {
        if (typeof ref === 'function') {
          ref(controllerRef.current);
        } else {
          ref.current = controllerRef.current;
        }
      }
    }
  }, [controllerRef.current, onInit, ref]);

  return null; // Logic & Three.js visualization component only
});

CharacterController.Component = CharacterControllerComponent;
CharacterController.useController = useCharacterController;

export default CharacterController;
