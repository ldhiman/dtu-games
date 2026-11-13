'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  createCampusWorld,
  checkLandmarkProximity,
  LANDMARKS,
  CAMPUS_BOUNDS,
  INITIAL_SPAWN_POSITION,
} from './CampusWorld';
import { CharacterController } from './CharacterController';
import GameHUD from './GameHUD';
import { Loader2 } from 'lucide-react';

/**
 * 10 Authentic DTU Student Badges & Collectibles
 * Distributed at authentic campus lore locations
 */
export const DTU_COLLECTIBLES = [
  {
    id: 'badge_crest',
    name: 'DCE Heritage Crest',
    icon: '📜',
    locationName: 'Inside DTU Main Gate (Bawana Road)',
    position: [-61, 1.4, 486],
    color: 0xf59e0b,
    lore: 'Rooted at Kashmere Gate since 1941! Legend says paying respect to the historic crest grants an instant +0.5 GPA boost in your first semester.',
    quote: '"From 1941 to eternity — Proud DCEite!"',
    type: 'crest',
  },
  {
    id: 'badge_nescafe',
    name: 'Nescafe Iced Frappe',
    icon: '🥤',
    locationName: 'At Wind Point Nescafe & Student Patio',
    position: [-93, 1.4, 46],
    color: 0xef4444,
    lore: 'Chilled iced coffee in a red Nescafe cup, grabbed right after an end-sem test or between back-to-back lectures at the Audi.',
    quote: '"Bhaiya, ek extra thick cold coffee with chocolate drizzle please!"',
    type: 'nescafe',
  },
  {
    id: 'badge_guitar',
    name: 'Wind Point Guitar',
    icon: '🎸',
    locationName: 'At Open Air Theatre (Wind Point)',
    position: [-26, 1.4, 20],
    color: 0xec4899,
    lore: 'Strumming "Gulabi Aankhen" under the stars at OAT Wind Point — the beating acoustic heart of every DTU fest and society circle.',
    quote: '"Ek acoustic jam session to banta hai boss."',
    type: 'guitar',
  },
  {
    id: 'badge_pyqs',
    name: 'Semester PYQ Bundle',
    icon: '📚',
    locationName: 'Outside B.R. Ambedkar Central Library',
    position: [-72, 1.4, -60],
    color: 0x3b82f6,
    lore: 'The Holy Grail of DTU academics: 10 years of past-year papers bound in yellow tape. Study this on exam eve and pass with flying colors.',
    quote: '"Question 3 is repeated literally every alternate year, mark my words!"',
    type: 'pyqs',
  },
  {
    id: 'badge_pass',
    name: 'Engifest Pronite Pass',
    icon: '🎫',
    locationName: 'At Dr. B.R. Ambedkar Auditorium (The Audi)',
    position: [-90, 1.4, -22],
    color: 0xa855f7,
    lore: 'All-access Engifest backstage pass! Bypass the 2-kilometer Bawana Road queue while artists set the Audi & OAT stage on fire.',
    quote: '"Main pass dila sakta hu, par treat deni padegi Mic-Mac pe!"',
    type: 'pass',
  },
  {
    id: 'badge_chai',
    name: 'Mech-C Samosa & Chai',
    icon: '☕',
    locationName: 'At DTU Central Canteen (Mic-Mac Plaza)',
    position: [78, 1.4, 84],
    color: 0xd97706,
    lore: 'Piping hot samosa with sweet tamarind chutney and steaming cutting chai. The official fuel powering students through all eight semesters.',
    quote: '"Do garam samose aur cutting chai, jaldi bhaiya!"',
    type: 'chai',
  },
  {
    id: 'badge_gear',
    name: 'Workshop Golden Gear',
    icon: '⚙️',
    locationName: 'At Dept. of Mechanical Engineering',
    position: [36, 1.4, 12],
    color: 0xf59e0b,
    lore: 'Turned and faced on lathe #4 during first-year carpentry & smithy workshop. Keep it safe or the lab technician deducts file marks!',
    quote: '"Sir, tolerance exactly 0.02 mm hai!"',
    type: 'gear',
  },
  {
    id: 'badge_trophy',
    name: 'DTU Arena Championship Trophy',
    icon: '⚽',
    locationName: 'At DTU Sports Complex & 400m Track',
    position: [-110, 1.4, -345],
    color: 0x22c55e,
    lore: 'Inter-hostel sports champions cup! Bragging rights valid across the entire campus until next year\'s Arena showdown.',
    quote: '"Under the floodlights at 10 PM — penalties on the synthetic turf!"',
    type: 'trophy',
  },
  {
    id: 'badge_pitch_deck',
    name: 'AB-3 Innovation Pitch Deck',
    icon: '💡',
    locationName: 'At Academic Block 3 & 4 Courtyard',
    position: [-255, 1.4, 10],
    color: 0x14b8a6,
    lore: '"It\'s like Uber, but for iced cold coffee & Raj Soin Domino\'s delivered straight to Pragya Bhawan during lectures." Seed funding pitched near AB-3!',
    quote: '"Valuation: 10 Crores. Unit economics: pending."',
    type: 'pitch_deck',
  },
  {
    id: 'badge_key',
    name: 'Hostel Room Key',
    icon: '🔑',
    locationName: 'At Boys Hostel Quad (VVS, HJB & CVR)',
    position: [-382, 1.4, -160],
    color: 0x06b6d4,
    lore: 'Room 304 brass key. Opening this door after 11 PM reveals late-night hostel chatter, LAN Valorant, and assignment sprints.',
    quote: '"Bhai room lock mat karna, main Night Canteen se aa raha hu!"',
    type: 'key',
  },
];

/**
 * Synthesizes a bright, crisp coin collection chime arpeggio with Web Audio API.
 * Requires zero audio files.
 */
function playCoinAudio() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    // Ascending arpeggio: C6 (1046.50Hz), E6 (1318.51Hz), G6 (1567.98Hz), C7 (2093.00Hz)
    const notes = [1046.5, 1318.51, 1567.98, 2093.0];

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      // Volume envelope with exponential decay
      gain.gain.setValueAtTime(0.28, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.38);
    });
  } catch (err) {
    // Silently continue if audio context is blocked
  }
}

/**
 * Builds a unique 3D procedural mesh for each DTU collectible item
 */
function createCollectible3D(badge) {
  const group = new THREE.Group();

  // Floating rotating orbit ring
  const ringGeo = new THREE.TorusGeometry(0.85, 0.035, 12, 32);
  const ringMat = new THREE.MeshStandardMaterial({
    color: badge.color,
    roughness: 0.2,
    metalness: 0.85,
    emissive: badge.color,
    emissiveIntensity: 0.45,
  });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  group.add(ringMesh);

  // Ground beacon ring
  const groundRingGeo = new THREE.RingGeometry(0.7, 0.85, 24);
  const groundRingMat = new THREE.MeshBasicMaterial({
    color: badge.color,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.4,
  });
  const groundRing = new THREE.Mesh(groundRingGeo, groundRingMat);
  groundRing.rotation.x = -Math.PI / 2;
  groundRing.position.y = -1.25;
  group.add(groundRing);

  // Specific 3D model per collectible type
  switch (badge.type) {
    case 'crest': {
      // 1. DCE Heritage Crest
      const shieldGeo = new THREE.CylinderGeometry(0.55, 0.4, 0.12, 6);
      shieldGeo.rotateX(Math.PI / 2);
      const goldMat = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 0.9,
        roughness: 0.15,
        emissive: 0xb45309,
        emissiveIntensity: 0.35,
      });
      const shield = new THREE.Mesh(shieldGeo, goldMat);
      group.add(shield);

      const starGeo = new THREE.OctahedronGeometry(0.24, 0);
      const starMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xfef08a,
        emissiveIntensity: 0.75,
      });
      const star = new THREE.Mesh(starGeo, starMat);
      star.position.z = 0.08;
      group.add(star);
      break;
    }

    case 'nescafe': {
      // 2. Nescafe Iced Frappe Cup
      const cupGeo = new THREE.CylinderGeometry(0.28, 0.2, 0.62, 16);
      const cupMat = new THREE.MeshStandardMaterial({
        color: 0xdc2626,
        emissive: 0x991b1b,
        emissiveIntensity: 0.25,
        roughness: 0.35,
      });
      const cup = new THREE.Mesh(cupGeo, cupMat);
      group.add(cup);

      const bandGeo = new THREE.CylinderGeometry(0.26, 0.23, 0.14, 16);
      const bandMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
      const band = new THREE.Mesh(bandGeo, bandMat);
      band.position.y = 0.08;
      group.add(band);

      const lidGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.06, 16);
      const lid = new THREE.Mesh(lidGeo, bandMat);
      lid.position.y = 0.34;
      group.add(lid);

      const strawGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.42, 8);
      const strawMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.4 });
      const straw = new THREE.Mesh(strawGeo, strawMat);
      straw.position.set(0.08, 0.48, 0);
      straw.rotation.z = -0.22;
      group.add(straw);
      break;
    }

    case 'guitar': {
      // 3. Wind Point Guitar
      const lowerBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, 0.12, 20),
        new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.4 })
      );
      lowerBody.rotateX(Math.PI / 2);
      lowerBody.position.y = -0.15;
      group.add(lowerBody);

      const upperBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.24, 0.12, 20),
        new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.4 })
      );
      upperBody.rotateX(Math.PI / 2);
      upperBody.position.y = 0.2;
      group.add(upperBody);

      const neck = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.55, 0.08),
        new THREE.MeshStandardMaterial({ color: 0x78350f })
      );
      neck.position.y = 0.52;
      group.add(neck);

      const head = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.16, 0.06),
        new THREE.MeshStandardMaterial({ color: 0x451a03 })
      );
      head.position.y = 0.84;
      group.add(head);

      const hole = new THREE.Mesh(
        new THREE.CircleGeometry(0.09, 16),
        new THREE.MeshBasicMaterial({ color: 0x111111 })
      );
      hole.position.set(0, 0.12, 0.065);
      group.add(hole);
      break;
    }

    case 'pyqs': {
      // 4. Semester PYQ Bundle
      const colors = [0xd97706, 0x2563eb, 0xdc2626];
      colors.forEach((c, idx) => {
        const book = new THREE.Mesh(
          new THREE.BoxGeometry(0.55, 0.12, 0.42),
          new THREE.MeshStandardMaterial({ color: c, roughness: 0.5 })
        );
        book.position.y = -0.18 + idx * 0.14;
        book.rotation.y = (idx - 1) * 0.15;
        group.add(book);
      });

      const ribbon = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.44, 0.44),
        new THREE.MeshStandardMaterial({
          color: 0xffd700,
          emissive: 0xd97706,
          emissiveIntensity: 0.5,
          metalness: 0.8,
        })
      );
      ribbon.position.y = -0.04;
      group.add(ribbon);
      break;
    }

    case 'pass': {
      // 5. Engifest Pronite Pass
      const card = new THREE.Mesh(
        new THREE.BoxGeometry(0.46, 0.65, 0.04),
        new THREE.MeshStandardMaterial({
          color: 0x7c3aed,
          emissive: 0x9333ea,
          emissiveIntensity: 0.45,
          metalness: 0.6,
          roughness: 0.2,
        })
      );
      group.add(card);

      const emblem = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.18, 0.05),
        new THREE.MeshStandardMaterial({
          color: 0xfacc15,
          emissive: 0xeab308,
          emissiveIntensity: 0.6,
        })
      );
      emblem.position.y = 0.08;
      group.add(emblem);

      const lanyard = new THREE.Mesh(
        new THREE.TorusGeometry(0.24, 0.025, 8, 20, Math.PI),
        new THREE.MeshStandardMaterial({ color: 0x1e1b4b })
      );
      lanyard.position.y = 0.45;
      group.add(lanyard);
      break;
    }

    case 'chai': {
      // 6. Mech-C Samosa & Chai
      const glass = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.16, 0.44, 12),
        new THREE.MeshStandardMaterial({
          color: 0x94a3b8,
          transparent: true,
          opacity: 0.55,
          roughness: 0.1,
        })
      );
      group.add(glass);

      const tea = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.15, 0.32, 12),
        new THREE.MeshStandardMaterial({
          color: 0xb45309,
          emissive: 0x78350f,
          emissiveIntensity: 0.35,
        })
      );
      tea.position.y = -0.04;
      group.add(tea);

      const samosaGeo = new THREE.ConeGeometry(0.2, 0.22, 3);
      const samosa = new THREE.Mesh(
        samosaGeo,
        new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 })
      );
      samosa.position.set(0.32, -0.1, 0);
      samosa.rotation.z = -0.3;
      group.add(samosa);
      break;
    }

    case 'gear': {
      // 7. Workshop Golden Gear
      const gearBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.42, 0.42, 0.14, 18),
        new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          metalness: 0.9,
          roughness: 0.2,
          emissive: 0xb45309,
          emissiveIntensity: 0.4,
        })
      );
      gearBody.rotateX(Math.PI / 2);
      group.add(gearBody);

      for (let t = 0; t < 8; t++) {
        const a = (t * Math.PI) / 4;
        const tooth = new THREE.Mesh(
          new THREE.BoxGeometry(0.14, 0.18, 0.14),
          new THREE.MeshStandardMaterial({
            color: 0xfbbf24,
            metalness: 0.85,
            roughness: 0.2,
          })
        );
        tooth.position.set(Math.sin(a) * 0.48, Math.cos(a) * 0.48, 0);
        tooth.rotation.z = -a;
        group.add(tooth);
      }

      const hole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.16, 12),
        new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.8 })
      );
      hole.rotateX(Math.PI / 2);
      group.add(hole);
      break;
    }

    case 'trophy': {
      // 8. Raj Soin Championship Trophy
      const cup = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.14, 0.42, 16),
        new THREE.MeshStandardMaterial({
          color: 0xffd700,
          metalness: 0.92,
          roughness: 0.15,
          emissive: 0xd97706,
          emissiveIntensity: 0.45,
        })
      );
      cup.position.y = 0.12;
      group.add(cup);

      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.08, 0.2, 12),
        new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9 })
      );
      stem.position.y = -0.16;
      group.add(stem);

      const base = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, 0.14, 0.32),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 })
      );
      base.position.y = -0.28;
      group.add(base);

      [-0.32, 0.32].forEach((hx) => {
        const handle = new THREE.Mesh(
          new THREE.TorusGeometry(0.12, 0.025, 8, 16),
          new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9 })
        );
        handle.position.set(hx, 0.15, 0);
        handle.rotation.y = Math.PI / 2;
        group.add(handle);
      });
      break;
    }

    case 'pitch_deck': {
      // 9. E-Hub Pitch Deck
      const tablet = new THREE.Mesh(
        new THREE.BoxGeometry(0.62, 0.44, 0.035),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.3 })
      );
      group.add(tablet);

      const screen = new THREE.Mesh(
        new THREE.PlaneGeometry(0.56, 0.38),
        new THREE.MeshBasicMaterial({ color: 0x06b6d4 })
      );
      screen.position.z = 0.02;
      group.add(screen);

      const rocket = new THREE.Mesh(
        new THREE.ConeGeometry(0.08, 0.22, 8),
        new THREE.MeshStandardMaterial({
          color: 0x10b981,
          emissive: 0x10b981,
          emissiveIntensity: 0.85,
        })
      );
      rocket.position.set(0, 0, 0.1);
      group.add(rocket);
      break;
    }

    case 'key': {
      // 10. Hostel Room Key
      const keyBow = new THREE.Mesh(
        new THREE.TorusGeometry(0.16, 0.04, 8, 16),
        new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 })
      );
      keyBow.position.y = 0.22;
      group.add(keyBow);

      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.035, 0.42, 10),
        new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 })
      );
      shaft.position.y = -0.05;
      group.add(shaft);

      const bit = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.14, 0.035),
        new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.2 })
      );
      bit.position.set(0.06, -0.18, 0);
      group.add(bit);

      const tag = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.44, 0.03),
        new THREE.MeshStandardMaterial({
          color: 0xef4444,
          emissive: 0x991b1b,
          emissiveIntensity: 0.3,
          roughness: 0.3,
        })
      );
      tag.position.set(-0.25, 0.05, 0);
      tag.rotation.z = 0.2;
      group.add(tag);
      break;
    }

    default: {
      const disc = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 0.1, 24),
        new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.9 })
      );
      disc.rotateX(Math.PI / 2);
      group.add(disc);
    }
  }

  return group;
}

export default function DTUCampusGame() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  // References for Three.js instance
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const worldRef = useRef(null);
  const controllerRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const clockRef = useRef(null);
  const collectiblesRef = useRef([]);

  // React HUD States
  const [loading, setLoading] = useState(true);
  const [playerPos, setPlayerPos] = useState({
    x: INITIAL_SPAWN_POSITION[0],
    z: INITIAL_SPAWN_POSITION[2],
  });
  const [playerAngle, setPlayerAngle] = useState(0);
  const [activeLandmark, setActiveLandmark] = useState(null);
  const [badgesCollected, setBadgesCollected] = useState(0);
  const [collectedBadgeIds, setCollectedBadgeIds] = useState([]);
  const [unlockedBadge, setUnlockedBadge] = useState(null);
  const [isNight, setIsNight] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Load collected badges from localStorage if available
  useEffect(() => {
    try {
      const savedCount = localStorage.getItem('dtu_campus_badges');
      if (savedCount) {
        const count = parseInt(savedCount, 10);
        if (!isNaN(count)) setBadgesCollected(Math.min(count, DTU_COLLECTIBLES.length));
      }

      const savedIds = localStorage.getItem('dtu_collected_badge_ids');
      if (savedIds) {
        const parsed = JSON.parse(savedIds);
        if (Array.isArray(parsed)) setCollectedBadgeIds(parsed);
      }
    } catch (e) {}
  }, []);

  // Handle Mobile Virtual Joystick Input
  const handleJoystickMove = useCallback((dx, dy) => {
    if (controllerRef.current) {
      controllerRef.current.setVirtualJoystick(dx, dy);
    }
  }, []);

  // Handle Jump
  const handleJump = useCallback(() => {
    if (controllerRef.current) {
      controllerRef.current.triggerJump();
    }
  }, []);

  // Handle Day/Night Toggle
  const handleToggleDayNight = useCallback(() => {
    setIsNight((prev) => {
      const nextMode = !prev;
      if (worldRef.current) {
        worldRef.current.setDayNightMode(nextMode);
      }
      if (sceneRef.current) {
        sceneRef.current.background = new THREE.Color(nextMode ? 0x0b192c : 0x87ceeb);
        if (sceneRef.current.fog) {
          sceneRef.current.fog.color.setHex(nextMode ? 0x0b192c : 0x87ceeb);
        }
      }
      return nextMode;
    });
  }, []);

  // Fast-travel teleport to a DTU campus landmark from Tactical Map
  const handleTeleportLandmark = useCallback((landmark) => {
    if (!controllerRef.current || !landmark?.position) return;
    const [lx, , lz] = landmark.position;
    controllerRef.current.setPosition(lx, 0, lz);
    setPlayerPos({ x: lx, z: lz });
    if (worldRef.current?.updateShadowTarget) {
      worldRef.current.updateShadowTarget({ x: lx, y: 0, z: lz });
    }
  }, []);

  // Handle Fullscreen
  const handleToggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Initialize Three.js Campus Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || (window.innerHeight - 70);

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    sceneRef.current = scene;

    // 2. Camera (Preserve 55deg FOV view ratio; extend far plane for 1km 1:1 campus)
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 2400);
    camera.position.set(
      INITIAL_SPAWN_POSITION[0],
      8,
      INITIAL_SPAWN_POSITION[2] + 10
    );
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance',
      stencil: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    // 4. Clock
    const clock = new THREE.Clock();
    clockRef.current = clock;

    // 5. Build Campus World (Procedural Buildings, Roads, Lighting, Trees)
    const campusWorld = createCampusWorld(scene, { isNight: false, fog: true });
    worldRef.current = campusWorld;

    // 6. Character Controller (Student Avatar + Camera Orbit tracking)
    const startingPos = new THREE.Vector3(...INITIAL_SPAWN_POSITION);
    const controller = new CharacterController({
      scene,
      camera,
      domElement: container,
      initialPosition: startingPos,
      boundaries: CAMPUS_BOUNDS,
      checkCollision: (x, z, radius) => campusWorld.checkCollision(x, z, radius),
    });
    controllerRef.current = controller;

    // 7. Spawn 10 DTU Student Badges / Collectibles
    const spawnedCollectibles = DTU_COLLECTIBLES.map((badge, idx) => {
      const colGroup = createCollectible3D(badge);
      colGroup.position.set(badge.position[0], badge.position[1], badge.position[2]);

      colGroup.userData = {
        badge,
        id: badge.id,
        index: idx,
        title: badge.name,
        baseY: badge.position[1],
        rotSpeed: 2.2 + (idx % 3) * 0.3,
        collected: false,
      };

      scene.add(colGroup);
      return colGroup;
    });
    collectiblesRef.current = spawnedCollectibles;

    setLoading(false);

    // 8. Animation & Render Loop
    let frameCount = 0;

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Animate world elements (waypoint beacons, pulsating rings)
      if (campusWorld.animate) {
        campusWorld.animate(delta, elapsed);
      }

      // Update character controller kinematics & camera
      controller.update(delta);

      // Animate collectible badges & check collection proximity
      const playerCurrentPos = controller.getPosition();

      for (let i = 0; i < spawnedCollectibles.length; i++) {
        const item = spawnedCollectibles[i];
        if (item.userData.collected) continue;

        // Rotation & floating bobbing
        item.rotation.y += delta * item.userData.rotSpeed;
        item.position.y = item.userData.baseY + Math.sin(elapsed * 2.8 + item.userData.index) * 0.22;

        // Distance check (< 2.2 units)
        const distToPlayer = playerCurrentPos.distanceTo(item.position);
        if (distToPlayer < 2.2) {
          item.userData.collected = true;
          scene.remove(item);
          playCoinAudio();

          const collectedBadge = item.userData.badge;
          setUnlockedBadge(collectedBadge);

          setCollectedBadgeIds((prev) => {
            const next = Array.from(new Set([...prev, collectedBadge.id]));
            try {
              localStorage.setItem('dtu_collected_badge_ids', JSON.stringify(next));
            } catch (e) {}
            return next;
          });

          setBadgesCollected((prev) => {
            const nextCount = prev + 1;
            try {
              localStorage.setItem('dtu_campus_badges', String(nextCount));
            } catch (e) {}
            return nextCount;
          });
        }
      }

      // Update follow-player directional shadow frustum + HUD state every 3 frames
      frameCount++;
      if (frameCount % 3 === 0) {
        if (campusWorld.updateShadowTarget) {
          campusWorld.updateShadowTarget(playerCurrentPos);
        }
        setPlayerPos({ x: playerCurrentPos.x, z: playerCurrentPos.z });
        if (controller.characterGroup) {
          setPlayerAngle(controller.characterGroup.rotation.y);
        }

        // Proximity to DTU Landmarks (< 22 units)
        const nearLandmark = checkLandmarkProximity(playerCurrentPos, 22);
        setActiveLandmark(nearLandmark);
      }

      renderer.render(scene, camera);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    // 9. Resize Listener
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    };

    window.addEventListener('resize', handleResize);

    // 10. Clean Unmount
    return () => {
      window.removeEventListener('resize', handleResize);

      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }

      if (controller) {
        controller.dispose();
      }

      if (campusWorld && campusWorld.dispose) {
        campusWorld.dispose();
      }

      spawnedCollectibles.forEach((item) => {
        scene.remove(item);
      });

      if (renderer) {
        renderer.dispose();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[calc(100vh-68px)] min-h-[600px] overflow-hidden bg-slate-950 select-none touch-none focus:outline-none"
      tabIndex={0}
    >
      {/* Three.js Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block focus:outline-none" />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center gap-4 z-40 text-white">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <div className="text-center">
            <h3 className="text-lg font-bold">Loading DTU 3D Campus World...</h3>
            <p className="text-xs text-slate-400 mt-1">
              Building T-Shaped Main Gate, CS/EE Arched Wings, Wind Point OAT & Real Metric Roads...
            </p>
          </div>
        </div>
      )}

      {/* Game HUD Overlay */}
      {!loading && (
        <GameHUD
          playerPos={playerPos}
          playerAngle={playerAngle}
          landmarks={LANDMARKS}
          activeLandmark={activeLandmark}
          badgesCollected={badgesCollected}
          totalBadges={DTU_COLLECTIBLES.length}
          collectibles={DTU_COLLECTIBLES}
          collectedBadgeIds={collectedBadgeIds}
          unlockedBadge={unlockedBadge}
          onDismissBadgeNotification={() => setUnlockedBadge(null)}
          isNight={isNight}
          onToggleDayNight={handleToggleDayNight}
          onJoystickMove={handleJoystickMove}
          onJump={handleJump}
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
          onTeleportLandmark={handleTeleportLandmark}
        />
      )}
    </div>
  );
}
