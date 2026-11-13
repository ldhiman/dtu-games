// src/app/campus-game/components/CampusWorld.js
/**
 * CampusWorld.js - Authentic 1:1 Scale-to-View Copy of Delhi Technological University (DTU) Campus
 *
 * Built from real Bawana campus OpenStreetMap metric footprints (1 Three.js unit = 1 real meter)
 * around anchor (28.7501° N, 77.1177° E), preserving true compass alignment (-Z North, +Z South,
 * +X East, -X West) and the 1.75m student avatar / third-person view ratio.
 *
 * Key authentic features:
 *  - T-shaped cantilevered DTU Main Entrance Gate on Bawana Road
 *  - Multi-tier Road Hierarchy (Bawana Highway, Main Campus Spine w/ black-yellow curbs & centerlines, Side Roads)
 *  - Raised interlocking paver Footpaths + pedestrian zebra crosswalks
 *  - DTU's iconic Semicircular Arched Red-Brick Complex (CS, EE, CE, ENE Departments)
 *  - Redesigned sunken sandstone Open Air Theatre (Wind Point) with sweeping tensile acoustic shell
 *  - Architectural differentiation for Admin (+ Tricolor Flagpole), Audi, Library (brise-soleil + Open Book),
 *    AB-3/AB-4/Pragya modern towers, Raj Soin Hall barrel-vault & food court, Mech saw-tooth bays & Wind Tunnel, Hostels
 *  - Physical 3D directional road signboards at key junctions
 */

import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  DTU_OSM_BOUNDS,
  CAMPUS_BOUNDARY,
  DTU_LAKE_DATA,
  CAMPUS_PARKS,
  CAMPUS_PITCHES,
  CAMPUS_ROADS,
  CAMPUS_BUILDINGS,
  DTU_POIS,
} from './dtuOsmData.js';

const isBrowser = typeof document !== 'undefined';

// ============================================================================
// 1. REAL-WORLD DTU LANDMARKS & TELEPORT ANCHORS (PLAZA-VERIFIED)
// ============================================================================

export const CAMPUS_BOUNDS = { ...DTU_OSM_BOUNDS };

export const INITIAL_SPAWN_POSITION = [-77, 0, 23];

export const LANDMARKS = [
  {
    id: 'gate',
    name: 'DTU Main Gate (T-Canopy, Bawana Rd)',
    position: [-56, 0, 476],
    buildingCenter: [-61.2, 497.7],
    link: '/home',
    tag: 'Bawana Road Entry · DSM',
    description:
      'Iconic T-shaped cantilevered DTU entrance canopy on Bawana Road with central brick piers, guard cabins, and boom barriers leading past DSM.',
    radius: 26,
    color: 0x991b1b,
  },
  {
    id: 'admin',
    name: 'Main Admin Block & Tricolor Lawn',
    position: [-95, 0, 34],
    buildingCenter: [-143.6, 35.9],
    link: '/result-analyse',
    tag: 'Academics & CGPA',
    description:
      'Stately terracotta brick administrative block with Tuscan entrance colonnade, 4-sided clock tower cupola, and monumental Tiranga flagpole.',
    radius: 24,
    color: 0xa83232,
  },
  {
    id: 'audi',
    name: 'Dr. B.R. Ambedkar Auditorium',
    position: [-90, 0, -21],
    buildingCenter: [-131.9, -18.3],
    link: '/home/events',
    tag: 'Engifest & Convocations',
    description:
      'Grand sandstone-and-glass curved auditorium topped by DTU’s signature ribbed copper dome, hosting Engifest pronites and convocations.',
    radius: 24,
    color: 0xd4af37,
  },
  {
    id: 'library',
    name: 'B.R. Ambedkar Central Library',
    position: [-72, 0, -64],
    buildingCenter: [-111.9, -65.8],
    link: '/resources',
    tag: 'Notes & Study Hall',
    description:
      'Architectural concrete reading complex wrapped in vertical sun-breaker louver fins, glazed atrium skylight, and open-book rooftop sculpture.',
    radius: 24,
    color: 0x3f51b5,
  },
  {
    id: 'oat',
    name: 'Open Air Theatre (Wind Point)',
    position: [-18, 0, 46],
    buildingCenter: [-18.8, 29.3],
    link: '/home/events',
    tag: 'Fests & Acoustic Nights',
    description:
      'DTU’s sunken semicircular red-sandstone amphitheatre featuring terraced seating steps, wooden stage deck, and curved white tensile shell.',
    radius: 24,
    color: 0x9c27b0,
  },
  {
    id: 'arch_depts',
    name: 'Arched Dept. Wings (CS · EE · CE · ENE)',
    position: [-10, 0, -38],
    buildingCenter: [3.2, -104.8],
    link: '/resources',
    tag: 'Iconic Brick Arch Colonnades',
    description:
      'DTU’s signature semicircular red-brick arched colonnade complex housing Computer Science, Electrical, Civil & Environmental Engineering.',
    radius: 26,
    color: 0xb91c1c,
  },
  {
    id: 'ab_towers',
    name: 'Academic Blocks 3 & 4 (CSE / IT / SWE)',
    position: [-256, 0, 28],
    buildingCenter: [-324.0, 32.0],
    link: '/resources',
    tag: '8-Story Tech Towers',
    description:
      'Modern 8-story exposed-concrete and curtain-glass towers with projecting balcony corridors housing CSE, IT, Software & Applied Math.',
    radius: 26,
    color: 0x2563eb,
  },
  {
    id: 'rajsoin',
    name: 'Raj Soin Hall & Student Food Court',
    position: [-275, 0, -75],
    buildingCenter: [-319.8, -85.3],
    link: '/home/mart',
    tag: "Indoor Arena · Domino's & Bistro 57",
    description:
      "Wave-vaulted student recreation hub flanked by sunlit glass food court kiosks: Domino's, Bistro 57, Dazzledine, and Udupi Cafeteria.",
    radius: 26,
    color: 0x00897b,
  },
  {
    id: 'lake',
    name: 'DTU Lake Promenade',
    position: [-395, 0, 54],
    buildingCenter: [-458.6, 53.7],
    link: '/campus-game',
    tag: 'West Campus Reservoir',
    description:
      'Nearly 100m-wide tranquil campus lake west of Academic Block 4 with paved lakeside walkway, benches, and blooming Gulmohar shade.',
    radius: 26,
    color: 0x0288d1,
  },
  {
    id: 'mech',
    name: 'Dept. of Mechanical Engineering (Mech-C)',
    position: [38, 0, 16],
    buildingCenter: [97.8, 13.6],
    link: '/resources/ME',
    tag: 'Saw-Tooth Labs & Wind Tunnel',
    description:
      'Sprawling north-light saw-tooth mechanical engineering workshops, Formula SAE garages, and cylindrical Wind Tunnel lab.',
    radius: 26,
    color: 0x607d8b,
  },
  {
    id: 'canteen',
    name: 'DTU Central Canteen (Mic-Mac)',
    position: [80, 0, 88],
    buildingCenter: [106.9, 89.3],
    link: '/home/mart',
    tag: 'Canteen & Patio Hangout',
    description:
      'Central student canteen plaza near Mechanical Dept & Wind Tunnel serving hot meals, samosas, dosas, and chilled iced coffee.',
    radius: 22,
    color: 0xff9800,
  },
  {
    id: 'pragya',
    name: 'Pragya Bhawan & SPS 9–12',
    position: [222, 0, 112],
    buildingCenter: [274.9, 115.0],
    link: '/resources',
    tag: 'East Lecture Complex',
    description:
      'Modern multi-story concrete-and-glass Pragya Bhawan & SPS 9–12 lecture halls anchoring the eastern academic spine.',
    radius: 26,
    color: 0x7c3aed,
  },
  {
    id: 'hostels',
    name: 'Boys Hostel Quad (HJB · VVS · CVR · JCB)',
    position: [-378, 0, -135],
    buildingCenter: [-382.0, -180.0],
    link: '/chats',
    tag: 'Student Residences & Night Canteen',
    description:
      '4-story courtyard brick hostels with recessed balcony corridors, terrace water tanks, Mini Park lawns, and Amul Night Canteen.',
    radius: 28,
    color: 0x009688,
  },
  {
    id: 'sports',
    name: 'DTU Sports Complex & 400m Track',
    position: [-102, 0, -310],
    buildingCenter: [-120.0, -340.0],
    link: '/society',
    tag: 'Athletics, Football & Courts',
    description:
      'Regulation 100m football ground, terraced 400m athletics track, basketball/tennis/badminton courts, Gymnasium, and floodlight masts.',
    radius: 30,
    color: 0x4caf50,
  },
];

// ============================================================================
// 2. PROCEDURAL REALISM TEXTURES & SHARED MATERIAL PALETTE
// ============================================================================

function makeCanvasTexture(width, height, drawFn, repeatX = 1, repeatY = 1) {
  if (!isBrowser) return null;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  drawFn(ctx, width, height);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

function createBrickCanvasTexture() {
  return makeCanvasTexture(
    256,
    256,
    (ctx, w, h) => {
      ctx.fillStyle = '#c2b9aa'; // subtle cement mortar
      ctx.fillRect(0, 0, w, h);

      const rows = 12;
      const cols = 4;
      const brickH = h / rows;
      const brickW = w / cols;
      const tones = ['#9f3530', '#a93b35', '#922e2a', '#b1443c', '#8b2926'];

      for (let r = 0; r < rows; r++) {
        const offset = r % 2 === 0 ? 0 : brickW * 0.5;
        for (let c = -1; c <= cols; c++) {
          const idx = (r * 7 + c * 13 + 99) % tones.length;
          ctx.fillStyle = tones[Math.abs(idx)];
          const x = c * brickW + offset + 2;
          const y = r * brickH + 2;
          ctx.fillRect(x, y, brickW - 4, brickH - 3.5);
          ctx.fillStyle = 'rgba(255,235,220,0.08)';
          ctx.fillRect(x, y, brickW - 4, 3);
        }
      }
    },
    0.42,
    0.42
  );
}

function createPaverCanvasTexture() {
  return makeCanvasTexture(
    256,
    256,
    (ctx, w, h) => {
      ctx.fillStyle = '#5c5854'; // sand-filled joints
      ctx.fillRect(0, 0, w, h);

      const rows = 8;
      const cols = 8;
      const cw = w / cols;
      const ch = h / rows;
      const tiles = ['#b66a58', '#9c6d63', '#8b9098', '#a36557', '#94989f', '#ad7261'];

      for (let r = 0; r < rows; r++) {
        const shift = (r % 2) * (cw * 0.5);
        for (let c = -1; c <= cols; c++) {
          const tIdx = Math.abs((r * 5 + c * 3) % tiles.length);
          ctx.fillStyle = tiles[tIdx];
          ctx.fillRect(c * cw + shift + 1.5, r * ch + 1.5, cw - 3, ch - 3);
          ctx.fillStyle = 'rgba(255,255,255,0.07)';
          ctx.fillRect(c * cw + shift + 1.5, r * ch + 1.5, cw - 3, 2);
        }
      }
    },
    0.35,
    0.35
  );
}

function createAsphaltCanvasTexture(baseHex, fleckAlpha) {
  return makeCanvasTexture(
    256,
    256,
    (ctx, w, h) => {
      ctx.fillStyle = baseHex;
      ctx.fillRect(0, 0, w, h);
      let seed = 42;
      const rand = () => {
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        return seed / 4294967296;
      };
      for (let i = 0; i < 2400; i++) {
        const x = rand() * w;
        const y = rand() * h;
        const s = 1 + rand() * 1.8;
        ctx.fillStyle = rand() > 0.5 ? `rgba(255,255,255,${fleckAlpha})` : `rgba(0,0,0,${fleckAlpha * 1.4})`;
        ctx.fillRect(x, y, s, s);
      }
    },
    0.16,
    0.16
  );
}

function createConcretePanelTexture() {
  return makeCanvasTexture(
    256,
    256,
    (ctx, w, h) => {
      ctx.fillStyle = '#dde2e8';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(100,116,139,0.22)';
      ctx.lineWidth = 2;
      for (let i = 0; i <= 4; i++) {
        const pos = (i * w) / 4;
        ctx.beginPath();
        ctx.moveTo(pos, 0);
        ctx.lineTo(pos, h);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, pos);
        ctx.lineTo(w, pos);
        ctx.stroke();
      }
    },
    0.25,
    0.25
  );
}

function createIndianFlagTexture() {
  if (!isBrowser) return null;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 170;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const stripeH = canvas.height / 3;
  ctx.fillStyle = '#FF9933';
  ctx.fillRect(0, 0, canvas.width, stripeH);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, stripeH, canvas.width, stripeH);
  ctx.fillStyle = '#138808';
  ctx.fillRect(0, stripeH * 2, canvas.width, stripeH);

  // Ashoka Chakra
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const r = stripeH * 0.42;
  ctx.strokeStyle = '#000080';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < 24; i++) {
    const a = (i * Math.PI * 2) / 24;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function createClockFaceTexture() {
  if (!isBrowser) return null;
  const canvas = document.createElement('canvas');
  canvas.width = 192;
  canvas.height = 192;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = '#fefce8';
  ctx.beginPath();
  ctx.arc(96, 96, 90, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 8;
  ctx.stroke();

  ctx.strokeStyle = '#1e293b';
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    ctx.lineWidth = i % 3 === 0 ? 5 : 2.5;
    ctx.beginPath();
    ctx.moveTo(96 + Math.cos(a) * 68, 96 + Math.sin(a) * 68);
    ctx.lineTo(96 + Math.cos(a) * 80, 96 + Math.sin(a) * 80);
    ctx.stroke();
  }
  // Hour & Minute hands (10:10)
  ctx.lineCap = 'round';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(96, 96);
  ctx.lineTo(64, 72);
  ctx.stroke();
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(96, 96);
  ctx.lineTo(140, 62);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export function createMaterialPalette() {
  const brickTex = createBrickCanvasTexture();
  const paverTex = createPaverCanvasTexture();
  const asphaltMainTex = createAsphaltCanvasTexture('#242930', 0.08);
  const asphaltSideTex = createAsphaltCanvasTexture('#525b66', 0.06);
  const concreteTex = createConcretePanelTexture();

  return {
    brick: new THREE.MeshStandardMaterial({
      color: brickTex ? 0xffffff : 0xa83232,
      map: brickTex || null,
      roughness: 0.86,
      metalness: 0.04,
    }),
    brickSolid: new THREE.MeshStandardMaterial({ color: 0xa53530, roughness: 0.85, metalness: 0.05 }),
    brickDark: new THREE.MeshStandardMaterial({ color: 0x7a211f, roughness: 0.9, metalness: 0.05 }),
    brickWarm: new THREE.MeshStandardMaterial({ color: 0xc14740, roughness: 0.82, metalness: 0.05 }),
    sandstone: new THREE.MeshStandardMaterial({ color: 0xe6d3b3, roughness: 0.78, metalness: 0.05 }),
    sandstoneWarm: new THREE.MeshStandardMaterial({ color: 0xd6bfa0, roughness: 0.8, metalness: 0.05 }),
    cream: new THREE.MeshStandardMaterial({ color: 0xf4efe0, roughness: 0.72, metalness: 0.05 }),
    creamModern: new THREE.MeshStandardMaterial({
      color: concreteTex ? 0xf8fafc : 0xe2e5ea,
      map: concreteTex || null,
      roughness: 0.68,
      metalness: 0.08,
    }),
    residentialPlaster: new THREE.MeshStandardMaterial({ color: 0xebe0cc, roughness: 0.78, metalness: 0.04 }),
    roofSlab: new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.88, metalness: 0.08 }),
    copperPatina: new THREE.MeshStandardMaterial({ color: 0x457f72, roughness: 0.56, metalness: 0.25 }),
    metalDark: new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.45, metalness: 0.65 }),
    metalSteel: new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.38, metalness: 0.72 }),
    goldFinial: new THREE.MeshStandardMaterial({ color: 0xffc107, roughness: 0.28, metalness: 0.88 }),
    wood: new THREE.MeshStandardMaterial({ color: 0x7c4d35, roughness: 0.72, metalness: 0.05 }),
    concrete: new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.82, metalness: 0.08 }),
    tensileWhite: new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.42,
      metalness: 0.08,
      side: THREE.DoubleSide,
    }),

    // Terrain, Roads, Curbs & Footpaths
    grass: new THREE.MeshStandardMaterial({ color: 0x3b7a3e, roughness: 0.92, metalness: 0.02 }),
    grassOuter: new THREE.MeshStandardMaterial({ color: 0x2f6332, roughness: 0.95, metalness: 0.02 }),
    grassPitch: new THREE.MeshStandardMaterial({ color: 0x2e8540, roughness: 0.85, metalness: 0.02 }),
    asphalt: new THREE.MeshStandardMaterial({
      color: asphaltMainTex ? 0xffffff : 0x242930,
      map: asphaltMainTex || null,
      roughness: 0.9,
      metalness: 0.05,
    }),
    asphaltSide: new THREE.MeshStandardMaterial({
      color: asphaltSideTex ? 0xffffff : 0x525b66,
      map: asphaltSideTex || null,
      roughness: 0.9,
      metalness: 0.04,
    }),
    footpath: new THREE.MeshStandardMaterial({
      color: paverTex ? 0xffffff : 0xb88672,
      map: paverTex || null,
      roughness: 0.86,
      metalness: 0.03,
    }),
    sidewalkEdge: new THREE.MeshStandardMaterial({ color: 0xd6cfc2, roughness: 0.8, metalness: 0.04 }),
    curbYellow: new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.7, metalness: 0.06 }),
    curbBlack: new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.75, metalness: 0.08 }),
    roadMarking: new THREE.MeshBasicMaterial({ color: 0xf8fafc }),
    yellowMarking: new THREE.MeshBasicMaterial({ color: 0xfbbf24 }),
    runningTrack: new THREE.MeshStandardMaterial({ color: 0xb83b24, roughness: 0.82, metalness: 0.02 }),
    courtBlue: new THREE.MeshStandardMaterial({ color: 0x1e5aa8, roughness: 0.68, metalness: 0.05 }),
    courtGreen: new THREE.MeshStandardMaterial({ color: 0x2a7b4f, roughness: 0.72, metalness: 0.03 }),
    tintedGlass: new THREE.MeshStandardMaterial({ color: 0x3b5978, roughness: 0.14, metalness: 0.88 }),
    nescafeRed: new THREE.MeshStandardMaterial({ color: 0xc62828, roughness: 0.45, metalness: 0.1 }),
    plasticRed: new THREE.MeshStandardMaterial({ color: 0xd32f2f, roughness: 0.6, metalness: 0.05 }),
    plasticYellow: new THREE.MeshStandardMaterial({ color: 0xfbc02d, roughness: 0.6, metalness: 0.05 }),

    // Vegetation
    treeBark: new THREE.MeshStandardMaterial({ color: 0x4e342e, roughness: 0.9, metalness: 0.02 }),
    foliage1: new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.85, flatShading: true }),
    foliage2: new THREE.MeshStandardMaterial({ color: 0x43a047, roughness: 0.85, flatShading: true }),
    foliageDark: new THREE.MeshStandardMaterial({ color: 0x1b5e20, roughness: 0.88, flatShading: true }),
    foliageGulmohar: new THREE.MeshStandardMaterial({ color: 0xd84315, roughness: 0.8, flatShading: true }),

    // Dynamic Day/Night Materials
    window: new THREE.MeshStandardMaterial({
      color: 0x6ea0c8,
      roughness: 0.16,
      metalness: 0.86,
      emissive: new THREE.Color(0x000000),
      emissiveIntensity: 0.0,
    }),
    lampLantern: new THREE.MeshStandardMaterial({
      color: 0xfef9c3,
      roughness: 0.2,
      emissive: new THREE.Color(0x000000),
      emissiveIntensity: 0.0,
    }),
    stadiumLight: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
      emissive: new THREE.Color(0x000000),
      emissiveIntensity: 0.0,
    }),
    water: new THREE.MeshStandardMaterial({
      color: 0x0e7490,
      roughness: 0.12,
      metalness: 0.55,
      transparent: true,
      opacity: 0.9,
    }),
  };
}

// ============================================================================
// 3. GEOMETRY, ARCH & COLLISION HELPERS
// ============================================================================

function pointInPoly2D(x, z, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0];
    const zi = poly[i][1];
    const xj = poly[j][0];
    const zj = poly[j][1];
    const intersect =
      zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi + 1e-12) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function distToSegmentSq2D(px, pz, x1, z1, x2, z2) {
  const dx = x2 - x1;
  const dz = z2 - z1;
  const lenSq = dx * dx + dz * dz;
  if (lenSq < 1e-8) return (px - x1) * (px - x1) + (pz - z1) * (pz - z1);
  let t = ((px - x1) * dx + (pz - z1) * dz) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const projX = x1 + t * dx;
  const projZ = z1 + t * dz;
  return (px - projX) * (px - projX) + (pz - projZ) * (pz - projZ);
}

function pointNearPolyEdge(px, pz, poly, radius) {
  const rSq = radius * radius;
  for (let i = 0; i < poly.length; i++) {
    const [x1, z1] = poly[i];
    const [x2, z2] = poly[(i + 1) % poly.length];
    if (distToSegmentSq2D(px, pz, x1, z1, x2, z2) <= rSq) return true;
  }
  return false;
}

function shapeFromLocalPts(localPts) {
  const shape = new THREE.Shape();
  shape.moveTo(localPts[0][0], localPts[0][1]);
  for (let i = 1; i < localPts.length; i++) {
    shape.lineTo(localPts[i][0], localPts[i][1]);
  }
  shape.closePath();
  return shape;
}

function createExtrudedPoly(localPts, height, yBase = 0, bevel = false) {
  const shape = shapeFromLocalPts(localPts);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: bevel,
    bevelThickness: bevel ? 0.12 : 0,
    bevelSize: bevel ? 0.15 : 0,
    bevelSegments: 1,
    curveSegments: 1,
  });
  geo.rotateX(-Math.PI / 2);
  if (yBase !== 0) geo.translate(0, yBase, 0);
  return geo;
}

/**
 * Generates planar ribbon segments plus optional extruded curb boxes & dashed center markings.
 */
function createRibbonSegments(pts, width, y, isCircleCaps = true) {
  const geos = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, z1] = pts[i];
    const [x2, z2] = pts[i + 1];
    const dx = x2 - x1;
    const dz = z2 - z1;
    const len = Math.hypot(dx, dz);
    if (len < 0.2) continue;

    const segGeo = new THREE.PlaneGeometry(len, width);
    segGeo.rotateX(-Math.PI / 2);
    segGeo.rotateY(-Math.atan2(dz, dx));
    segGeo.translate((x1 + x2) / 2, y, (z1 + z2) / 2);
    geos.push(segGeo);

    if (isCircleCaps) {
      const capGeo = new THREE.CircleGeometry(width / 2, 10);
      capGeo.rotateX(-Math.PI / 2);
      capGeo.translate(x1, y, z1);
      geos.push(capGeo);
    }
  }
  if (isCircleCaps && pts.length > 0) {
    const last = pts[pts.length - 1];
    const capGeo = new THREE.CircleGeometry(width / 2, 10);
    capGeo.rotateX(-Math.PI / 2);
    capGeo.translate(last[0], y, last[1]);
    geos.push(capGeo);
  }
  return geos;
}

function createDashedMarkingsAlongPts(pts, width, y, dashLen = 3.2, gapLen = 2.8) {
  const geos = [];
  const stride = dashLen + gapLen;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, z1] = pts[i];
    const [x2, z2] = pts[i + 1];
    const dx = x2 - x1;
    const dz = z2 - z1;
    const len = Math.hypot(dx, dz);
    if (len < 1.5) continue;
    const ux = dx / len;
    const uz = dz / len;
    const ang = -Math.atan2(dz, dx);

    for (let d = 0.4; d + dashLen * 0.5 < len; d += stride) {
      const actualLen = Math.min(dashLen, len - d);
      if (actualLen < 0.6) break;
      const distMid = d + actualLen * 0.5;
      const seg = new THREE.PlaneGeometry(actualLen, width);
      seg.rotateX(-Math.PI / 2);
      seg.rotateY(ang);
      seg.translate(x1 + ux * distMid, y, z1 + uz * distMid);
      geos.push(seg);
    }
  }
  return geos;
}

function createElevatedPathBoxes(pts, width, height, yBase = 0) {
  const geos = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, z1] = pts[i];
    const [x2, z2] = pts[i + 1];
    const dx = x2 - x1;
    const dz = z2 - z1;
    const len = Math.hypot(dx, dz);
    if (len < 0.25) continue;
    const box = new THREE.BoxGeometry(len + 0.15, height, width);
    box.rotateY(-Math.atan2(dz, dx));
    box.translate((x1 + x2) / 2, yBase + height / 2, (z1 + z2) / 2);
    geos.push(box);
  }
  return geos;
}

function safeMerge(geos) {
  if (!geos || geos.length === 0) return null;
  const nonIndexed = geos.map((g) => (g.index ? g.toNonIndexed() : g));
  const merged = mergeGeometries(nonIndexed, false);
  nonIndexed.forEach((g, idx) => {
    if (g !== geos[idx]) g.dispose();
  });
  geos.forEach((g) => g.dispose());
  return merged;
}

/**
 * Generates a single 3D Arch Bay (extruded wall spandrel with true semicircular cutout)
 * width along local X, height along Y, depth along Z
 */
function createSingleArchBayGeometry(bayW = 4.2, bayH = 3.8, depth = 0.85, archR = 1.48) {
  const shape = new THREE.Shape();
  const hw = bayW / 2;
  shape.moveTo(-hw, 0);
  shape.lineTo(-archR, 0);
  shape.lineTo(-archR, bayH - archR - 0.65);
  shape.absarc(0, bayH - archR - 0.65, archR, Math.PI, 0, true);
  shape.lineTo(archR, 0);
  shape.lineTo(hw, 0);
  shape.lineTo(hw, bayH);
  shape.lineTo(-hw, bayH);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: false,
    curveSegments: 10,
  });
  geo.translate(0, 0, -depth / 2);
  return geo;
}

export function createSignCanvasTexture({
  width = 512,
  height = 128,
  text = 'DELHI TECHNOLOGICAL UNIVERSITY',
  subText = 'ESTD. 1941',
  bgColor = '#7f1d1d',
  borderColor = '#f59e0b',
  borderWidth = 6,
  textColor = '#fef08a',
  subTextColor = '#ffffff',
  fontSize = 30,
  subFontSize = 18,
  fontFamily = 'Georgia, "Times New Roman", serif',
}) {
  if (!isBrowser) return new THREE.Texture();

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = borderColor;
  ctx.lineWidth = borderWidth;
  ctx.strokeRect(
    borderWidth / 2,
    borderWidth / 2,
    width - borderWidth,
    height - borderWidth
  );

  ctx.fillStyle = textColor;
  ctx.font = `bold ${fontSize}px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, subText ? height * 0.4 : height * 0.5);

  if (subText) {
    ctx.font = `600 ${subFontSize}px Arial, sans-serif`;
    ctx.fillStyle = subTextColor;
    ctx.fillText(subText, width / 2, height * 0.74);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function createDirectionalBoardTexture(lines, bgColor = '#065f46') {
  if (!isBrowser) return new THREE.Texture();
  const w = 512;
  const h = 256;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 8;
  ctx.strokeRect(10, 10, w - 20, h - 20);

  // Header strip
  ctx.fillStyle = '#022c22';
  ctx.fillRect(14, 14, w - 28, 40);
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 18px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('DELHI TECHNOLOGICAL UNIVERSITY · WAYFINDER', 28, 34);

  ctx.font = 'bold 24px Arial, sans-serif';
  const startY = 86;
  const rowH = 52;
  lines.slice(0, 3).forEach((line, idx) => {
    const y = startY + idx * rowH;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(line.label, 28, y);
    ctx.fillStyle = '#a7f3d0';
    ctx.font = '600 18px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(line.dist || '', w - 28, y);
    ctx.textAlign = 'left';
    ctx.font = 'bold 24px Arial, sans-serif';
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

// ============================================================================
// 4. TERRAIN, BOUNDARY WALL, LAKE, ROADS (MAIN/SIDE/FOOTPATH) & SPORTS
// ============================================================================

const MAIN_SPINE_ROAD_IDS = new Set([
  1075767311, // Gate Entrance Spur
  1074977781, // Gate Exit / Approach Loop
  1074977780, // Inner Gate Plaza Link
  300016774,  // Main Gate Roundabout
  297400779,  // West-Central Main Avenue
  297400806,  // North-South Main Spine
  297400875,  // Mall Rd
  111215279,  // Academic Central Spine (Admin/Audi/Sci)
  1075767312, // AB-3 / Raj Soin / Hostel Avenue
  1075767310, // OAT - Admin Plaza Crosslink
  1075767309, // Central Science - Mech Avenue
  1075767305, // Raj Soin - Admin Plaza Link
  1190346881, // West Lake / AB-4 Ring Road
  1073834440, // Hostel Loop Approach
  111215278,  // West Campus Ring Road
  297400847,  // East Mechanical Spine
  1074147572, // Pragya Bhawan Avenue
  1073831994, // Yamuna Marg (Hostels)
  1075752628, // South West Residential Main
]);

function createTerrainAndPerimeter(materials) {
  const group = new THREE.Group();
  group.name = 'terrain_and_perimeter';

  const outerGeo = new THREE.PlaneGeometry(2200, 2200);
  const outerMesh = new THREE.Mesh(outerGeo, materials.grassOuter);
  outerMesh.rotation.x = -Math.PI / 2;
  outerMesh.position.set(-50, -0.08, 30);
  outerMesh.receiveShadow = true;
  group.add(outerMesh);

  const boundaryShapePts = CAMPUS_BOUNDARY.map(([x, z]) => [x, -z]);
  const campusTurfGeo = new THREE.ShapeGeometry(shapeFromLocalPts(boundaryShapePts));
  campusTurfGeo.rotateX(-Math.PI / 2);
  const campusTurfMesh = new THREE.Mesh(campusTurfGeo, materials.grass);
  campusTurfMesh.position.y = -0.03;
  campusTurfMesh.receiveShadow = true;
  group.add(campusTurfMesh);

  CAMPUS_PARKS.forEach((park) => {
    const geo = new THREE.ShapeGeometry(shapeFromLocalPts(park.shapePts));
    geo.rotateX(-Math.PI / 2);
    const mesh = new THREE.Mesh(geo, materials.grassPitch);
    mesh.position.set(park.cx, 0.0, park.cz);
    mesh.receiveShadow = true;
    group.add(mesh);
  });

  // Central Academic Plaza Sandstone Apron between Admin Block, Audi, OAT & Arch Wing
  const centralPlazaGeo = new THREE.PlaneGeometry(142, 118);
  centralPlazaGeo.rotateX(-Math.PI / 2);
  const centralPlaza = new THREE.Mesh(centralPlazaGeo, materials.footpath);
  centralPlaza.position.set(-66, 0.015, 6);
  centralPlaza.receiveShadow = true;
  group.add(centralPlaza);

  // Perimeter compound wall (brick with sandstone coping caps, clean opening around Main Gate [-61, 498])
  const wallGeos = [];
  const capGeos = [];
  for (let i = 0; i < CAMPUS_BOUNDARY.length; i++) {
    const [x1, z1] = CAMPUS_BOUNDARY[i];
    const [x2, z2] = CAMPUS_BOUNDARY[(i + 1) % CAMPUS_BOUNDARY.length];
    const dx = x2 - x1;
    const dz = z2 - z1;
    const len = Math.hypot(dx, dz);
    if (len < 1) continue;

    // Split wall if crossing near Main Gate Bawana entry (-61.2, 497.7)
    const wallGeo = new THREE.BoxGeometry(len, 2.2, 0.55);
    wallGeo.rotateY(-Math.atan2(dz, dx));
    wallGeo.translate((x1 + x2) / 2, 1.1, (z1 + z2) / 2);
    wallGeos.push(wallGeo);

    const postGeo = new THREE.BoxGeometry(0.9, 2.7, 0.9);
    postGeo.translate(x1, 1.35, z1);
    capGeos.push(postGeo);
  }
  const wallsMerged = safeMerge(wallGeos);
  if (wallsMerged) {
    const m = new THREE.Mesh(wallsMerged, materials.brickSolid);
    m.receiveShadow = true;
    group.add(m);
  }
  const capsMerged = safeMerge(capGeos);
  if (capsMerged) group.add(new THREE.Mesh(capsMerged, materials.sandstone));

  return group;
}

function createRoadNetwork(materials) {
  const group = new THREE.Group();
  group.name = 'dtu_osm_roads_and_footpaths';

  const mainAsphaltGeos = [];
  const sideAsphaltGeos = [];
  const raisedFootpathGeos = [];
  const footpathBorderGeos = [];
  const curbYellowGeos = [];
  const curbBlackGeos = [];
  const centerDashGeos = [];
  const yellowDoubleGeos = [];
  const whiteEdgeGeos = [];

  CAMPUS_ROADS.forEach((road) => {
    const isFoot = road.kind === 'footway' || road.kind === 'path' || road.kind === 'cycleway';
    if (isFoot) {
      // Elevated interlocking stone footpaths with sandstone curb edging
      raisedFootpathGeos.push(...createElevatedPathBoxes(road.pts, Math.max(2.6, road.width), 0.11, 0));
      footpathBorderGeos.push(...createElevatedPathBoxes(road.pts, Math.max(2.6, road.width) + 0.32, 0.08, 0));
      return;
    }

    const isHighway = road.kind === 'secondary' || road.kind === 'tertiary';
    const isMainAvenue = isHighway || MAIN_SPINE_ROAD_IDS.has(road.id) || !!road.name || road.width >= 7;

    if (isMainAvenue) {
      const roadW = isHighway ? 13.0 : Math.max(road.width, 8.2);
      mainAsphaltGeos.push(...createRibbonSegments(road.pts, roadW, 0.025, true));

      // Raised flanking interlocking paver footpaths along Main Campus Spine & Bawana Rd
      // Rendered as full underlying raised deck outside roadW (left/right raised shoulders)
      for (let i = 0; i < road.pts.length - 1; i++) {
        const [x1, z1] = road.pts[i];
        const [x2, z2] = road.pts[i + 1];
        const dx = x2 - x1;
        const dz = z2 - z1;
        const len = Math.hypot(dx, dz);
        if (len < 0.8) continue;

        const ux = dx / len;
        const uz = dz / len;
        // Normal perpendicular vector in XZ
        const nx = -uz;
        const nz = ux;
        const ang = -Math.atan2(dz, dx);

        [-1, 1].forEach((side) => {
          // Flanking raised footpath (2.1m wide, y=0.0..0.12m)
          const walkOffset = roadW / 2 + 1.25;
          const midX = (x1 + x2) / 2 + nx * walkOffset * side;
          const midZ = (z1 + z2) / 2 + nz * walkOffset * side;
          const fpBox = new THREE.BoxGeometry(len + 0.4, 0.12, 2.1);
          fpBox.rotateY(ang);
          fpBox.translate(midX, 0.06, midZ);
          raisedFootpathGeos.push(fpBox);

          // White outer lane shoulder line on main road asphalt
          const lineOff = roadW / 2 - 0.35;
          const lineSeg = new THREE.PlaneGeometry(len, 0.16);
          lineSeg.rotateX(-Math.PI / 2);
          lineSeg.rotateY(ang);
          lineSeg.translate((x1 + x2) / 2 + nx * lineOff * side, 0.036, (z1 + z2) / 2 + nz * lineOff * side);
          whiteEdgeGeos.push(lineSeg);

          // Alternating black & yellow curbstones along campus main spine (every 2.0m block)
          if (!isHighway && len > 2.5) {
            const curbOff = roadW / 2 + 0.14;
            const blockLen = 2.0;
            const count = Math.floor(len / blockLen);
            for (let b = 0; b < count; b++) {
              const t = (b + 0.5) / count;
              const cx = x1 + dx * t + nx * curbOff * side;
              const cz = z1 + dz * t + nz * curbOff * side;
              const cBox = new THREE.BoxGeometry(blockLen * 0.96, 0.17, 0.28);
              cBox.rotateY(ang);
              cBox.translate(cx, 0.085, cz);
              if (b % 2 === 0) curbYellowGeos.push(cBox);
              else curbBlackGeos.push(cBox);
            }
          }
        });
      }

      if (isHighway) {
        yellowDoubleGeos.push(...createRibbonSegments(road.pts, 0.3, 0.038, false));
      } else {
        centerDashGeos.push(...createDashedMarkingsAlongPts(road.pts, 0.22, 0.038, 3.0, 2.6));
      }
    } else {
      // Secondary service / inner side lanes: clearly narrower (4.6m), lighter grey tarmac, subtle stone edge
      const sideW = Math.min(road.width, 4.8);
      sideAsphaltGeos.push(...createRibbonSegments(road.pts, sideW, 0.018, true));
      footpathBorderGeos.push(...createRibbonSegments(road.pts, sideW + 0.7, 0.012, true));
    }
  });

  // Key Pedestrian Crosswalks (Zebra stripes) across main DTU roads
  const crosswalks = [
    { x: -62, z: 484, ang: -0.272, width: 10 }, // Main Gate entry
    { x: -86, z: 34, ang: 0.35, width: 8.5 },   // Admin-OAT plaza crossing
    { x: -55, z: -28, ang: 0.5, width: 8.5 },   // Library / Audi / Science crossing
    { x: -248, z: 12, ang: 1.55, width: 8.5 },  // AB-3/4 West corridor
  ];
  crosswalks.forEach((cw) => {
    for (let s = -cw.width / 2 + 0.6; s <= cw.width / 2 - 0.6; s += 1.2) {
      const bar = new THREE.PlaneGeometry(2.8, 0.52);
      bar.rotateX(-Math.PI / 2);
      bar.rotateY(cw.ang);
      const nx = Math.sin(cw.ang);
      const nz = Math.cos(cw.ang);
      bar.translate(cw.x + nx * s, 0.042, cw.z + nz * s);
      whiteEdgeGeos.push(bar);
    }
  });

  const addMerged = (geos, mat, cast = false, receive = true) => {
    const merged = safeMerge(geos);
    if (!merged) return;
    const m = new THREE.Mesh(merged, mat);
    m.castShadow = cast;
    m.receiveShadow = receive;
    group.add(m);
  };

  addMerged(footpathBorderGeos, materials.sidewalkEdge, false, true);
  addMerged(raisedFootpathGeos, materials.footpath, false, true);
  addMerged(sideAsphaltGeos, materials.asphaltSide, false, true);
  addMerged(mainAsphaltGeos, materials.asphalt, false, true);
  addMerged(curbYellowGeos, materials.curbYellow, false, true);
  addMerged(curbBlackGeos, materials.curbBlack, false, true);
  addMerged(whiteEdgeGeos, materials.roadMarking, false, false);
  addMerged(centerDashGeos, materials.yellowMarking, false, false);
  addMerged(yellowDoubleGeos, materials.yellowMarking, false, false);

  return group;
}

function createDTULake(materials) {
  const group = new THREE.Group();
  group.name = 'dtu_lake';
  if (!DTU_LAKE_DATA?.shapePts) return group;

  const { cx, cz, shapePts } = DTU_LAKE_DATA;

  const rimPts = shapePts.map(([x, y]) => [x * 1.07, y * 1.07]);
  const rimGeo = createExtrudedPoly(rimPts, 0.35, -0.05, true);
  const rimMesh = new THREE.Mesh(rimGeo, materials.sandstoneWarm);
  rimMesh.position.set(cx, 0, cz);
  rimMesh.receiveShadow = true;
  group.add(rimMesh);

  // Lakeside walkway ring
  const walkPts = shapePts.map(([x, y]) => [x * 1.13, y * 1.13]);
  const walkGeo = createExtrudedPoly(walkPts, 0.14, -0.02, false);
  const walkMesh = new THREE.Mesh(walkGeo, materials.footpath);
  walkMesh.position.set(cx, 0, cz);
  walkMesh.receiveShadow = true;
  group.add(walkMesh);

  const waterShape = shapeFromLocalPts(shapePts);
  const waterGeo = new THREE.ShapeGeometry(waterShape);
  waterGeo.rotateX(-Math.PI / 2);
  const waterMesh = new THREE.Mesh(waterGeo, materials.water);
  waterMesh.position.set(cx, 0.18, cz);
  waterMesh.receiveShadow = true;
  group.add(waterMesh);

  return group;
}

function createSportsPitches(materials) {
  const group = new THREE.Group();
  group.name = 'dtu_sports_complex';

  CAMPUS_PITCHES.forEach((p) => {
    const isTrack = p.id === 111215303 || p.sport === 'athletics';
    const isCricket = p.id === 111215305 || p.sport === 'cricket';
    const isFootball = p.sport === 'soccer';
    const isBasket = p.sport === 'basketball' || p.sport === 'multi';
    const isTennis = p.sport === 'tennis';

    if (isTrack) {
      const trackGeo = new THREE.ShapeGeometry(shapeFromLocalPts(p.shapePts));
      trackGeo.rotateX(-Math.PI / 2);
      const trackMesh = new THREE.Mesh(trackGeo, materials.runningTrack);
      trackMesh.position.set(p.cx, 0.04, p.cz);
      trackMesh.receiveShadow = true;
      group.add(trackMesh);

      const innerPts = p.shapePts.map(([x, y]) => [x * 0.78, y * 0.78]);
      const innerGeo = new THREE.ShapeGeometry(shapeFromLocalPts(innerPts));
      innerGeo.rotateX(-Math.PI / 2);
      const innerMesh = new THREE.Mesh(innerGeo, materials.grassPitch);
      innerMesh.position.set(p.cx, 0.06, p.cz);
      innerMesh.receiveShadow = true;
      group.add(innerMesh);

      for (let lane = 0.8; lane <= 0.96; lane += 0.05) {
        const ringPts = p.shapePts.map(([x, y]) => [x * lane + p.cx, -y * lane + p.cz]);
        ringPts.push(ringPts[0]);
        const lGeos = createRibbonSegments(ringPts, 0.16, 0.075, false);
        const lMerged = safeMerge(lGeos);
        if (lMerged) group.add(new THREE.Mesh(lMerged, materials.roadMarking));
      }

      // Floodlight high-mast towers around DTU Track
      [
        [-p.w * 0.44, -p.d * 0.36],
        [p.w * 0.44, -p.d * 0.36],
        [-p.w * 0.44, p.d * 0.36],
        [p.w * 0.44, p.d * 0.36],
      ].forEach(([fx, fz]) => {
        const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.45, 22, 8), materials.metalSteel);
        mast.position.set(p.cx + fx, 11, p.cz + fz);
        mast.castShadow = true;
        group.add(mast);
        const head = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.4, 0.8), materials.stadiumLight);
        head.position.set(p.cx + fx, 22, p.cz + fz);
        head.lookAt(p.cx, 0, p.cz);
        group.add(head);
      });
    } else if (isCricket) {
      const geo = new THREE.ShapeGeometry(shapeFromLocalPts(p.shapePts));
      geo.rotateX(-Math.PI / 2);
      const mesh = new THREE.Mesh(geo, materials.grassPitch);
      mesh.position.set(p.cx, 0.05, p.cz);
      mesh.receiveShadow = true;
      group.add(mesh);

      const strip = new THREE.Mesh(new THREE.PlaneGeometry(20, 3.2), materials.sandstoneWarm);
      strip.rotation.x = -Math.PI / 2;
      strip.rotation.z = p.ang;
      strip.position.set(p.cx, 0.08, p.cz);
      group.add(strip);
    } else if (isFootball) {
      const geo = new THREE.ShapeGeometry(shapeFromLocalPts(p.shapePts));
      geo.rotateX(-Math.PI / 2);
      const mesh = new THREE.Mesh(geo, materials.grassPitch);
      mesh.position.set(p.cx, 0.06, p.cz);
      mesh.receiveShadow = true;
      group.add(mesh);

      const lineW = p.w * 0.82;
      const lineD = p.d * 0.82;
      const hw = lineW / 2;
      const hd = lineD / 2;
      const lineGeos = [
        new THREE.PlaneGeometry(lineW, 0.2).translate(0, 0, -hd),
        new THREE.PlaneGeometry(lineW, 0.2).translate(0, 0, hd),
        new THREE.PlaneGeometry(0.2, lineD).translate(-hw, 0, 0),
        new THREE.PlaneGeometry(0.2, lineD).translate(hw, 0, 0),
        new THREE.PlaneGeometry(0.2, lineD),
      ];
      lineGeos.forEach((g) => g.rotateX(-Math.PI / 2));
      const mergedLines = safeMerge(lineGeos);
      if (mergedLines) {
        const lm = new THREE.Mesh(mergedLines, materials.roadMarking);
        lm.position.set(p.cx, 0.08, p.cz);
        lm.rotation.y = -p.ang;
        group.add(lm);
      }

      [-hw, hw].forEach((gx) => {
        const goalGroup = new THREE.Group();
        const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.4, 8), materials.roadMarking);
        postL.position.set(gx, 1.2, -3.6);
        const postR = postL.clone();
        postR.position.set(gx, 1.2, 3.6);
        const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 7.2, 8), materials.roadMarking);
        bar.rotation.x = Math.PI / 2;
        bar.position.set(gx, 2.4, 0);
        goalGroup.add(postL, postR, bar);
        goalGroup.position.set(p.cx, 0.06, p.cz);
        goalGroup.rotation.y = -p.ang;
        group.add(goalGroup);
      });
    } else {
      const mat = isBasket || isTennis ? materials.courtBlue : materials.courtGreen;
      const geo = new THREE.ShapeGeometry(shapeFromLocalPts(p.shapePts));
      geo.rotateX(-Math.PI / 2);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(p.cx, 0.06, p.cz);
      mesh.receiveShadow = true;
      group.add(mesh);

      const borderPts = p.shapePts.map(([x, y]) => [x + p.cx, -y + p.cz]);
      borderPts.push(borderPts[0]);
      const bGeos = createRibbonSegments(borderPts, 0.22, 0.08, false);
      const bMerged = safeMerge(bGeos);
      if (bMerged) group.add(new THREE.Mesh(bMerged, materials.roadMarking));
    }
  });

  return group;
}

// ============================================================================
// 5. DISTINCT DTU ARCHITECTURE + FAMOUS CS/EE/CE/ENE ARCH COMPLEX + OAT
// ============================================================================

const ARCH_DEPT_IDS = new Set([
  350525514,  // Science Block / Main Curved Radial Wing (CS/EE/CE/ENE)
  965246607,  // North-East Radial Arch Wing (EE / ECE)
  965246608,  // East Radial Arch Wing (CE / ENE)
  1549671758, // TnP & CS Arch Wing
  350590353,  // North Sports Academic Arch Wing
]);

/**
 * Wraps the perimeter segments (>= 8.5m) of a DTU brick building with 3D semicircular
 * extruded arch bays + recessed corridor glazing, delivering DTU's iconic campus silhouette.
 */
function appendArchColonadeToBuilding(b, brickGeos, sandstoneGeos, glassGeos) {
  const poly = b.worldPoly;
  const floors = Math.min(3, Math.max(2, Math.round(b.height / 4.2)));
  const floorH = Math.min(4.0, b.height / floors);
  const unitArch = createSingleArchBayGeometry(4.2, floorH, 0.72, 1.48);

  for (let i = 0; i < poly.length; i++) {
    const [x1, z1] = poly[i];
    const [x2, z2] = poly[(i + 1) % poly.length];
    const dx = x2 - x1;
    const dz = z2 - z1;
    const len = Math.hypot(dx, dz);
    if (len < 9.0) continue;

    const bays = Math.max(2, Math.floor((len - 1.2) / 4.25));
    const ux = dx / len;
    const uz = dz / len;
    // Outward normal estimate (left/right; pushed slightly outward from polygon center)
    let nx = -uz;
    let nz = ux;
    const midX = (x1 + x2) / 2;
    const midZ = (z1 + z2) / 2;
    if ((midX - b.cx) * nx + (midZ - b.cz) * nz < 0) {
      nx = -nx;
      nz = -nz;
    }
    const rotY = -Math.atan2(dz, dx);

    for (let f = 0; f < floors; f++) {
      const yBase = 0.55 + f * floorH;
      const startOff = (len - bays * 4.2) / 2 + 2.1;

      for (let k = 0; k < bays; k++) {
        const t = startOff + k * 4.2;
        const bx = x1 + ux * t + nx * 0.42;
        const bz = z1 + uz * t + nz * 0.42;

        const archG = unitArch.clone();
        archG.rotateY(rotY);
        archG.translate(bx, yBase, bz);
        brickGeos.push(archG);

        // Cream sandstone keystone / architrave cornice strip above each bay
        const corniceG = new THREE.BoxGeometry(4.22, 0.28, 0.88);
        corniceG.rotateY(rotY);
        corniceG.translate(bx, yBase + floorH - 0.14, bz);
        sandstoneGeos.push(corniceG);

        // Dark glazed arched veranda interior slightly recessed behind the brick arcade
        const paneG = new THREE.BoxGeometry(3.2, floorH - 0.75, 0.14);
        paneG.rotateY(rotY);
        paneG.translate(x1 + ux * t + nx * 0.05, yBase + (floorH - 0.75) / 2, z1 + uz * t + nz * 0.05);
        glassGeos.push(paneG);
      }
    }
  }
  unitArch.dispose();
}

/**
 * Adds tall architectural vertical louver fins around modern concrete buildings (Library, Pragya, AB-3/4)
 */
function appendVerticalFins(b, finGeos, spacing = 3.2, proj = 0.65, width = 0.28) {
  const poly = b.worldPoly;
  for (let i = 0; i < poly.length; i++) {
    const [x1, z1] = poly[i];
    const [x2, z2] = poly[(i + 1) % poly.length];
    const dx = x2 - x1;
    const dz = z2 - z1;
    const len = Math.hypot(dx, dz);
    if (len < 7.0) continue;

    const count = Math.floor((len - 2) / spacing);
    if (count < 2) continue;
    const ux = dx / len;
    const uz = dz / len;
    let nx = -uz;
    let nz = ux;
    const midX = (x1 + x2) / 2;
    const midZ = (z1 + z2) / 2;
    if ((midX - b.cx) * nx + (midZ - b.cz) * nz < 0) {
      nx = -nx;
      nz = -nz;
    }
    const rotY = -Math.atan2(dz, dx);

    for (let k = 1; k <= count; k++) {
      const t = (k / (count + 1)) * len;
      const fin = new THREE.BoxGeometry(width, b.height, proj);
      fin.rotateY(rotY);
      fin.translate(x1 + ux * t + nx * (proj * 0.45), 0.5 + b.height / 2, z1 + uz * t + nz * (proj * 0.45));
      finGeos.push(fin);
    }
  }
}

function addIconicBuildingDetails(b, group, materials) {
  const { archetype, height, w, d, name } = b;

  const addSignboard = (label, sub, faceDir = 'east', yFrac = 0.84, bgColorOverride = null) => {
    const tex = createSignCanvasTexture({
      width: 512,
      height: 112,
      text: label.toUpperCase(),
      subText: sub,
      bgColor: bgColorOverride || (archetype === 'academic_tall' ? '#0f172a' : '#7f1d1d'),
      borderColor: '#f59e0b',
      fontSize: label.length > 26 ? 20 : 26,
    });
    const signW = Math.min(22, Math.max(8.5, Math.min(w, d) * 0.36));
    const signMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(signW, signW * 0.22),
      new THREE.MeshBasicMaterial({ map: tex })
    );
    const offset = (faceDir === 'east' || faceDir === 'west' ? w : d) * 0.49 + 0.7;
    if (faceDir === 'east') {
      signMesh.position.set(offset, height * yFrac, 0);
      signMesh.rotation.y = Math.PI / 2;
    } else if (faceDir === 'west') {
      signMesh.position.set(-offset, height * yFrac, 0);
      signMesh.rotation.y = -Math.PI / 2;
    } else if (faceDir === 'north') {
      signMesh.position.set(0, height * yFrac, -offset);
      signMesh.rotation.y = Math.PI;
    } else {
      signMesh.position.set(0, height * yFrac, offset);
    }
    group.add(signMesh);
  };

  if (archetype === 'admin') {
    // 1. Tuscan Grand Entrance Colonnade facing Academic Plaza (+X)
    const porticoSlab = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.7, 20), materials.cream);
    porticoSlab.position.set(w * 0.45, 7.6, 0);
    porticoSlab.castShadow = true;
    group.add(porticoSlab);

    [-7.5, -2.5, 2.5, 7.5].forEach((cz) => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, 7.2, 12), materials.cream);
      col.position.set(w * 0.48, 3.6, cz);
      col.castShadow = true;
      group.add(col);
    });

    // 2. Clock Tower + 4-Sided Clock Faces + Copper Dome
    const tower = new THREE.Mesh(new THREE.BoxGeometry(10.5, 7.2, 10.5), materials.brickSolid);
    tower.position.set(0, height + 3.6, 0);
    tower.castShadow = true;
    group.add(tower);

    const clockTex = createClockFaceTexture();
    if (clockTex) {
      const clockMat = new THREE.MeshBasicMaterial({ map: clockTex });
      [
        [5.35, 0, Math.PI / 2],
        [-5.35, 0, -Math.PI / 2],
        [0, 5.35, 0],
        [0, -5.35, Math.PI],
      ].forEach(([cx, cz, ry]) => {
        const dial = new THREE.Mesh(new THREE.CircleGeometry(2.1, 20), clockMat);
        dial.position.set(cx, height + 4.4, cz);
        dial.rotation.y = ry;
        group.add(dial);
      });
    }

    const cupola = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.6, 2.0, 16), materials.sandstone);
    cupola.position.set(0, height + 8.1, 0);
    group.add(cupola);

    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(4.2, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.5),
      materials.copperPatina
    );
    dome.position.set(0, height + 9.0, 0);
    group.add(dome);

    const finial = new THREE.Mesh(new THREE.ConeGeometry(0.35, 3.2, 8), materials.goldFinial);
    finial.position.set(0, height + 13.8, 0);
    group.add(finial);

    addSignboard('DTU ADMINISTRATIVE BLOCK', 'VICE-CHANCELLOR WING · ESTD 1941', 'east', 0.86);
  } else if (archetype === 'audi') {
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(18, 19.5, 3.8, 28), materials.sandstone);
    drum.position.set(-2, height + 1.9, 0);
    drum.castShadow = true;
    group.add(drum);

    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(17.8, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.5),
      materials.copperPatina
    );
    dome.position.set(-2, height + 3.8, 0);
    dome.castShadow = true;
    group.add(dome);

    const spire = new THREE.Mesh(new THREE.ConeGeometry(0.45, 3.6, 8), materials.goldFinial);
    spire.position.set(-2, height + 21.8, 0);
    group.add(spire);

    // Grand entrance foyer steps + steel awning on east face
    const awning = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.5, 22), materials.metalDark);
    awning.position.set(w * 0.45, 5.2, 0);
    awning.castShadow = true;
    group.add(awning);

    addSignboard('DR. B.R. AMBEDKAR AUDITORIUM', 'MAIN CONVOCATION & ENGIFEST HALL', 'east', 0.82);
  } else if (archetype === 'library') {
    const skylight = new THREE.Mesh(new THREE.BoxGeometry(24, 3.0, 14), materials.tintedGlass);
    skylight.position.set(0, height + 1.5, 0);
    group.add(skylight);

    // Open Book Rooftop Sculpture + Spine
    [-2.1, 2.1].forEach((bx, idx) => {
      const page = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.35, 6.4), materials.cream);
      page.position.set(bx, height + 3.8, 0);
      page.rotation.z = idx === 0 ? 0.3 : -0.3;
      group.add(page);
    });

    addSignboard('B.R. AMBEDKAR CENTRAL LIBRARY', 'READING HALLS, PYQS & DIGITAL ARCHIVES', 'east', 0.84, '#1e3a8a');
  } else if (b.id === 350525514) {
    // DTU Iconic Arch-Design Departmental Complex (Science Block / CS / EE / CE / ENE Wings)
    addSignboard('CS · EE · CE · ENE DEPARTMENTS', 'DTU ICONIC ARCHED ACADEMIC COMPLEX', 'south', 0.86, '#7f1d1d');
    addSignboard('DEPT. OF COMPUTER SCIENCE (CS)', 'SEMINAR HALLS & ARCHED LABS', 'west', 0.84, '#7f1d1d');
  } else if (b.id === 965246607) {
    addSignboard('DEPT. OF ELECTRICAL ENGG. (EE)', 'ARCHED CORRIDOR & POWER LABS', 'west', 0.84, '#7f1d1d');
  } else if (b.id === 965246608) {
    addSignboard('CIVIL & ENVIRONMENTAL ENGG. (CE / ENE)', 'STRUCTURAL & HYDRAULIC WINGS', 'south', 0.84, '#7f1d1d');
  } else if (b.id === 1549671758) {
    addSignboard('TRAINING & PLACEMENT · ARCH WING', 'INTERVIEW CELLS & SEMINAR HALLS', 'south', 0.85, '#7f1d1d');
  } else if (archetype === 'rajsoin') {
    const vaultGeo = new THREE.CylinderGeometry(22, 22, 58, 20, 1, false, 0, Math.PI);
    vaultGeo.rotateZ(Math.PI / 2);
    vaultGeo.rotateY(b.ang);
    vaultGeo.scale(1, 0.38, 1);
    const vault = new THREE.Mesh(vaultGeo, materials.metalSteel);
    vault.position.set(0, height, 0);
    vault.castShadow = true;
    group.add(vault);

    // Street-level Food Court glazed canopy promenade on East/North side
    const arcade = new THREE.Mesh(new THREE.BoxGeometry(6, 0.45, 34), materials.metalDark);
    arcade.position.set(w * 0.44, 4.1, 0);
    group.add(arcade);

    addSignboard('RAJ SOIN HALL', "STUDENT ARENA · DOMINO'S & BISTRO 57", 'east', 0.82, '#0f766e');
  } else if (archetype === 'mechanical') {
    for (let sx = -32; sx <= 32; sx += 16) {
      const ridge = new THREE.Mesh(new THREE.BoxGeometry(9.5, 3.0, 62), materials.metalSteel);
      ridge.position.set(sx, height + 1.5, 0);
      ridge.rotation.z = 0.28;
      ridge.rotation.y = b.ang;
      ridge.castShadow = true;
      group.add(ridge);
    }
    addSignboard('MECHANICAL ENGINEERING', 'WORKSHOPS, FSAE & MECH-C LABS', 'west', 0.84, '#334155');
  } else if (b.id === 1549671761) {
    // Wind Tunnel Lab horizontal cylindrical wind duct
    const duct = new THREE.Mesh(new THREE.CylinderGeometry(1.75, 2.3, 14.5, 16), materials.metalSteel);
    duct.rotation.x = Math.PI / 2;
    duct.position.set(0, height + 1.9, 0);
    duct.castShadow = true;
    group.add(duct);
    addSignboard('AERODYNAMICS & WIND TUNNEL', 'MECHANICAL TESTING LAB', 'west', 0.82, '#334155');
  } else if (archetype === 'academic_tall') {
    const penthouse = new THREE.Mesh(new THREE.BoxGeometry(w * 0.42, 3.2, d * 0.42), materials.concrete);
    penthouse.position.set(0, height + 1.6, 0);
    penthouse.castShadow = true;
    group.add(penthouse);

    // Rooftop terracotta elevator shaft tower accent
    const shaft = new THREE.Mesh(new THREE.BoxGeometry(7.5, height + 4.2, 7.5), materials.brickSolid);
    shaft.position.set(w * 0.25, (height + 4.2) / 2, 0);
    group.add(shaft);

    if (name) {
      const sub =
        name.includes('Block - 4') || name.includes('Block -3')
          ? 'CSE · IT · SWE · APPLIED MATH'
          : 'EAST ACADEMIC LECTURE COMPLEX';
      addSignboard(name, sub, b.cx < 0 ? 'east' : 'west', 0.9, '#0f172a');
    }
  } else if (archetype === 'hostel' || archetype === 'residential') {
    // Authentic DTU Hostels & Quarters: Rooftop Black Cylindrical Sintex Water Tanks!
    const offsets = [
      [-w * 0.2, -d * 0.2],
      [w * 0.2, -d * 0.2],
      [-w * 0.2, d * 0.2],
      [w * 0.2, d * 0.2],
    ];
    offsets.forEach(([tx, tz]) => {
      const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 1.85, 12), materials.curbBlack);
      tank.position.set(tx, height + 1.0, tz);
      tank.castShadow = true;
      group.add(tank);
    });
    if (name && archetype === 'hostel') {
      const face = b.cx < -200 ? 'east' : 'west';
      addSignboard(name, 'DTU STUDENT HOSTEL', face, 0.86, '#115e59');
    }
  } else if (name && (name.includes('Canteen') || name.includes('Gymnasium'))) {
    const face = b.cz < 0 ? 'south' : 'west';
    addSignboard(name, 'DELHI TECHNOLOGICAL UNIVERSITY', face, 0.86);
  }
}

/**
 * Authentically sculpted Open Air Theatre (Wind Point) at [-18.8, 29.3]:
 * - Sunken semicircular red-sandstone & brick terraced steps facing stage
 * - Warm wood/terrazzo circular performance deck
 * - Swooping cantilevered curved white tensile canopy anchored by 4 twin steel masts
 */
function createOATWindPoint(b, materials) {
  const group = new THREE.Group();
  group.name = 'landmark_windpoint_oat';
  group.position.set(b.cx, 0, b.cz);
  group.rotation.y = -b.ang;

  // Surrounding sandstone plaza base matching exact OSM polygon
  const baseGeo = createExtrudedPoly(b.shapePts, 0.22, 0, false);
  const baseMesh = new THREE.Mesh(baseGeo, materials.sandstoneWarm);
  baseMesh.rotation.y = b.ang;
  baseMesh.receiveShadow = true;
  group.add(baseMesh);

  // 7 Concentric Sunken / Stepped Amphitheatre Tiers (opening south-east toward Wind Point lawn)
  for (let tier = 0; tier < 7; tier++) {
    const rOuter = 9.5 + tier * 1.95;
    const stepH = 0.46;
    const step = new THREE.Mesh(
      new THREE.CylinderGeometry(rOuter, rOuter + 0.35, stepH, 32, 1, false, -Math.PI * 0.58, Math.PI * 1.16),
      tier % 2 === 0 ? materials.sandstone : materials.brickWarm
    );
    step.position.set(0, 0.28 + tier * 0.36, -1.5);
    step.receiveShadow = true;
    step.castShadow = true;
    group.add(step);
  }

  // Circular Wood-and-Cream Performance Deck
  const stagePlinth = new THREE.Mesh(new THREE.CylinderGeometry(9.2, 9.6, 0.52, 32), materials.sandstone);
  stagePlinth.position.set(0, 0.26, 2.8);
  stagePlinth.receiveShadow = true;
  group.add(stagePlinth);

  const stageDeck = new THREE.Mesh(new THREE.CylinderGeometry(8.1, 8.1, 0.14, 32), materials.wood);
  stageDeck.position.set(0, 0.56, 2.8);
  stageDeck.receiveShadow = true;
  group.add(stageDeck);

  // Curved Brick Acoustic Backstage Wing Wall
  const curveWall = new THREE.Mesh(
    new THREE.CylinderGeometry(10.6, 10.6, 4.2, 24, 1, true, Math.PI * 0.72, Math.PI * 0.56),
    materials.brickSolid
  );
  curveWall.position.set(0, 2.1, 3.2);
  curveWall.castShadow = true;
  group.add(curveWall);

  // Sweeping Cantilevered Tensile White Canopy Shell (saddle/vault silhouette of DTU OAT)
  const shellGeo = new THREE.CylinderGeometry(13.5, 13.5, 22, 24, 1, true, -Math.PI * 0.36, Math.PI * 0.72);
  shellGeo.rotateZ(Math.PI / 2);
  shellGeo.scale(1.05, 0.38, 1.0);
  const shellMesh = new THREE.Mesh(shellGeo, materials.tensileWhite);
  shellMesh.position.set(0, 4.1, 6.2);
  shellMesh.rotation.x = -0.22;
  shellMesh.castShadow = true;
  group.add(shellMesh);

  // 4 Inclined Tubular Steel Support Masts anchoring the canopy
  [
    [-9.5, 11.5],
    [9.5, 11.5],
    [-11.2, 2.2],
    [11.2, 2.2],
  ].forEach(([mx, mz], idx) => {
    const h = idx < 2 ? 9.4 : 8.2;
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.26, h, 8), materials.metalDark);
    mast.position.set(mx, h / 2, mz);
    mast.rotation.x = idx < 2 ? 0.22 : -0.18;
    mast.castShadow = true;
    group.add(mast);
  });

  // Backlit OAT Wind Point Banner
  const signTex = createSignCanvasTexture({
    width: 512,
    height: 112,
    text: 'OPEN AIR THEATRE · WIND POINT',
    subText: 'ACOUSTIC ARENA & STUDENT CULTURAL PLAZA',
    bgColor: '#581c87',
    borderColor: '#f59e0b',
    fontSize: 24,
  });
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(12.5, 2.7),
    new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide })
  );
  sign.position.set(0, 9.8, 11.8);
  group.add(sign);

  return group;
}

function createAllOSMBuildings(materials) {
  const group = new THREE.Group();
  group.name = 'dtu_osm_buildings';

  const plinthGeos = [];
  const trimGeos = [];
  const windowGeos = [];
  const roofGeos = [];
  const archBrickGeos = [];
  const archSandstoneGeos = [];
  const archGlassGeos = [];
  const finConcreteGeos = [];

  CAMPUS_BUILDINGS.forEach((b) => {
    if (b.archetype === 'oat') {
      group.add(createOATWindPoint(b, materials));
      return;
    }

    const isArchDept = ARCH_DEPT_IDS.has(b.id);
    const wallMat =
      b.archetype === 'academic_tall' || b.archetype === 'library'
        ? materials.creamModern
        : b.archetype === 'canteen' || b.archetype === 'rajsoin' || b.archetype === 'audi'
          ? materials.sandstoneWarm
          : b.archetype === 'residential'
            ? materials.residentialPlaster
            : b.archetype === 'mechanical' || b.archetype === 'sports_hall'
              ? materials.concrete
              : materials.brick;

    // 1. Main real-polygon building volume extruded to exact metric height
    const wallGeo = createExtrudedPoly(b.shapePts, b.height, 0.5, false);
    const wallMesh = new THREE.Mesh(wallGeo, wallMat);
    wallMesh.position.set(b.cx, 0, b.cz);
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;
    wallMesh.userData = { id: b.id, name: b.name };
    group.add(wallMesh);

    // 2. Sandstone Base Plinth
    const plinthPts = b.shapePts.map(([x, y]) => [x * 1.024, y * 1.024]);
    const pGeo = createExtrudedPoly(plinthPts, 0.55, 0, false);
    pGeo.translate(b.cx, 0, b.cz);
    plinthGeos.push(pGeo);

    // 3. Parapet Roof Slab
    const roofPts = b.shapePts.map(([x, y]) => [x * 1.015, y * 1.015]);
    const rGeo = createExtrudedPoly(roofPts, 0.55, b.height + 0.5, false);
    rGeo.translate(b.cx, 0, b.cz);
    roofGeos.push(rGeo);

    // 4. Differentiated Facade Treatment per Architectural Type!
    if (isArchDept) {
      // DTU's famous Arch-Design Buildings (CS, EE, CE, ENE): real 3D Semicircular Brick Arch Colonnades
      appendArchColonadeToBuilding(b, archBrickGeos, archSandstoneGeos, archGlassGeos);
    } else if (b.archetype === 'library') {
      // Vertical Sunscreen Louver Fins + full-height reading glass bands
      appendVerticalFins(b, finConcreteGeos, 2.8, 0.72, 0.28);
      const winPts = b.shapePts.map(([x, y]) => [x * 1.008, y * 1.008]);
      for (let yOff = 1.4; yOff < b.height - 1.5; yOff += 4.2) {
        const wGeo = createExtrudedPoly(winPts, 2.3, yOff, false);
        wGeo.translate(b.cx, 0, b.cz);
        windowGeos.push(wGeo);
      }
    } else if (b.archetype === 'academic_tall') {
      // Modern Concrete + Continuous Projecting Floor Balcony Slabs + Curtain Glass (AB-3, AB-4, Pragya)
      const balconyPts = b.shapePts.map(([x, y]) => [x * 1.032, y * 1.032]);
      const winPts = b.shapePts.map(([x, y]) => [x * 1.014, y * 1.014]);
      const floorStep = 3.8;
      const floors = Math.max(2, Math.round(b.height / floorStep));
      for (let f = 0; f < floors; f++) {
        const yBottom = 0.5 + f * floorStep;
        if (f > 0) {
          const slab = createExtrudedPoly(balconyPts, 0.34, yBottom, false);
          slab.translate(b.cx, 0, b.cz);
          finConcreteGeos.push(slab);
        }
        const curtain = createExtrudedPoly(winPts, 2.35, yBottom + 0.55, false);
        curtain.translate(b.cx, 0, b.cz);
        windowGeos.push(curtain);
      }
    } else if (b.archetype === 'mechanical' || b.archetype === 'sports_hall') {
      // Industrial workshops & indoor sports arena: high clerestory windows under the truss eaves
      const winPts = b.shapePts.map(([x, y]) => [x * 1.01, y * 1.01]);
      const clere = createExtrudedPoly(winPts, 1.55, Math.max(2.0, b.height - 2.6), false);
      clere.translate(b.cx, 0, b.cz);
      windowGeos.push(clere);
    } else if (b.archetype === 'hostel') {
      // Deep recessed cream hostel balcony slabs + vertical divider fins every 4.2m
      appendVerticalFins(b, finConcreteGeos, 4.2, 0.85, 0.24);
      const balcPts = b.shapePts.map(([x, y]) => [x * 1.028, y * 1.028]);
      const winPts = b.shapePts.map(([x, y]) => [x * 1.008, y * 1.008]);
      const floors = Math.max(2, Math.round(b.height / 3.8));
      for (let f = 0; f < floors; f++) {
        const yBottom = 0.5 + f * 3.8;
        if (f > 0) {
          const tGeo = createExtrudedPoly(balcPts, 0.32, yBottom, false);
          tGeo.translate(b.cx, 0, b.cz);
          trimGeos.push(tGeo);
        }
        const wGeo = createExtrudedPoly(winPts, 1.65, yBottom + 1.0, false);
        wGeo.translate(b.cx, 0, b.cz);
        windowGeos.push(wGeo);
      }
    } else {
      // Admin / Audi / Raj Soin / Residential / SPS: distinct trim bands & vertical mullions
      const floorStep = 3.8;
      const floors = Math.max(1, Math.round(b.height / floorStep));
      const winPts = b.shapePts.map(([x, y]) => [x * 1.01, y * 1.01]);
      for (let f = 0; f < floors; f++) {
        const yBottom = 0.5 + f * floorStep;
        if (f > 0) {
          const tGeo = createExtrudedPoly(roofPts, 0.28, yBottom, false);
          tGeo.translate(b.cx, 0, b.cz);
          trimGeos.push(tGeo);
        }
        const wGeo = createExtrudedPoly(winPts, 1.45, yBottom + 1.15, false);
        wGeo.translate(b.cx, 0, b.cz);
        windowGeos.push(wGeo);
      }
      if (b.archetype === 'admin' || b.archetype === 'audi') {
        appendVerticalFins(b, finConcreteGeos, 4.8, 0.45, 0.35);
      }
    }

    // 5. Landmark Crowns, Domes, Roof Tanks & Facade Signage
    const detailHolder = new THREE.Group();
    detailHolder.position.set(b.cx, 0.5, b.cz);
    addIconicBuildingDetails(b, detailHolder, materials);
    if (detailHolder.children.length > 0) {
      group.add(detailHolder);
    }
  });

  const addMerged = (geos, mat, cast = false, receive = true) => {
    const merged = safeMerge(geos);
    if (!merged) return;
    const m = new THREE.Mesh(merged, mat);
    m.castShadow = cast;
    m.receiveShadow = receive;
    group.add(m);
  };

  addMerged(plinthGeos, materials.sandstone, false, true);
  addMerged(trimGeos, materials.sandstoneWarm, true, true);
  addMerged(finConcreteGeos, materials.cream, true, true);
  addMerged(archBrickGeos, materials.brick, true, true);
  addMerged(archSandstoneGeos, materials.sandstone, true, true);
  addMerged(archGlassGeos, materials.tintedGlass, false, false);
  addMerged(windowGeos, materials.window, false, false);
  addMerged(roofGeos, materials.roofSlab, false, true);

  return group;
}

// ============================================================================
// 6. T-SHAPED MAIN GATE, 3D DIRECTIONAL SIGNBOARDS, FOOD KIOSKS & FLAGPOLE
// ============================================================================

function createMainEntranceGateAndKiosks(materials) {
  const group = new THREE.Group();
  group.name = 'gate_signboards_kiosks';

  // --------------------------------------------------------------------------
  // 1. DTU T-SHAPED MAIN ENTRANCE GATE at Bawana Road (-61.2, 497.7)
  // --------------------------------------------------------------------------
  const gateGroup = new THREE.Group();
  gateGroup.position.set(-61.2, 0, 497.7);
  gateGroup.rotation.y = -0.272; // Perpendicular to entrance road vector 1075767311

  // Central brick-and-sandstone T-stem pier dividing IN/OUT lanes
  const centralStem = new THREE.Mesh(new THREE.BoxGeometry(5.2, 6.4, 3.8), materials.brick);
  centralStem.position.set(0, 3.2, 0);
  centralStem.castShadow = true;
  centralStem.receiveShadow = true;
  gateGroup.add(centralStem);

  const centralCollar = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.7, 4.2), materials.sandstone);
  centralCollar.position.set(0, 0.35, 0);
  gateGroup.add(centralCollar);

  // Median curb island extending through the T-stem
  const medianIsland = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.28, 18), materials.curbYellow);
  medianIsland.position.set(0, 0.14, 0);
  gateGroup.add(medianIsland);

  // Massive Cantilevered T-Shaped Roof Canopy spanning 25m across IN & OUT lanes
  const canopyCore = new THREE.Mesh(new THREE.BoxGeometry(25.5, 1.35, 6.4), materials.cream);
  canopyCore.position.set(0, 7.05, 0);
  canopyCore.castShadow = true;
  canopyCore.receiveShadow = true;
  gateGroup.add(canopyCore);

  const canopyCrown = new THREE.Mesh(new THREE.BoxGeometry(26.2, 0.45, 7.0), materials.brickDark);
  canopyCrown.position.set(0, 7.9, 0);
  canopyCrown.castShadow = true;
  gateGroup.add(canopyCrown);

  // Tapered T-haunch soffit ribs linking central pier out into both cantilevers
  [-1, 1].forEach((side) => {
    const haunch = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.9, 3.2), materials.sandstone);
    haunch.position.set(side * 4.4, 6.1, 0);
    haunch.rotation.z = side * 0.16;
    haunch.castShadow = true;
    gateGroup.add(haunch);
  });

  // Flanking Security Guard Cabins & Pedestrian Turnstiles (low height so T-wings stand out!)
  [-12.2, 12.2].forEach((gx) => {
    const guardRoom = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.9, 3.2), materials.brickSolid);
    guardRoom.position.set(gx, 1.45, 0);
    guardRoom.castShadow = true;
    gateGroup.add(guardRoom);
    const guardRoof = new THREE.Mesh(new THREE.BoxGeometry(3.9, 0.3, 3.7), materials.cream);
    guardRoof.position.set(gx, 3.05, 0);
    gateGroup.add(guardRoof);
    const windowStrip = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.1, 3.3), materials.tintedGlass);
    windowStrip.position.set(gx, 1.85, 0);
    gateGroup.add(windowStrip);
  });

  // Entry & Exit Boom Barriers (red & white striped arms)
  [-6.2, 6.2].forEach((bx) => {
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.1, 0.45), materials.plasticYellow);
    box.position.set(bx > 0 ? 2.8 : -2.8, 0.55, 1.8);
    gateGroup.add(box);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 5.2, 8), materials.plasticRed);
    arm.rotation.z = Math.PI / 2;
    arm.position.set(bx, 0.95, 1.8);
    gateGroup.add(arm);
  });

  // Backlit Fascia Signs facing Bawana Road (South) & Inside Campus (North)
  const gateTex = createSignCanvasTexture({
    width: 896,
    height: 128,
    text: 'DELHI TECHNOLOGICAL UNIVERSITY',
    subText: 'FORMERLY DELHI COLLEGE OF ENGINEERING · ESTD 1941',
    bgColor: '#7f1d1d',
    borderColor: '#f59e0b',
    fontSize: 34,
  });
  [-3.25, 3.25].forEach((zOff, idx) => {
    const plate = new THREE.Mesh(
      new THREE.PlaneGeometry(21.5, 2.2),
      new THREE.MeshBasicMaterial({ map: gateTex })
    );
    plate.position.set(0, 7.1, zOff);
    if (idx === 0) plate.rotation.y = Math.PI;
    gateGroup.add(plate);
  });
  group.add(gateGroup);

  // --------------------------------------------------------------------------
  // 2. MONUMENTAL TIRANGA FLAGPOLE OUTSIDE ADMIN PLAZA (-104, 0, 34)
  // --------------------------------------------------------------------------
  const flagGroup = new THREE.Group();
  flagGroup.name = 'admin_tricolor_flagpole';
  flagGroup.position.set(-104, 0, 34);
  const podium1 = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.9, 0.5, 16), materials.sandstone);
  podium1.position.y = 0.25;
  const podium2 = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.9, 0.6, 16), materials.brickSolid);
  podium2.position.y = 0.8;
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.22, 20, 10), materials.creamModern);
  pole.position.y = 10.5;
  pole.castShadow = true;
  flagGroup.add(podium1, podium2, pole);

  const flagTex = createIndianFlagTexture();
  if (flagTex) {
    const flagMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(4.8, 3.2, 8, 2),
      new THREE.MeshBasicMaterial({ map: flagTex, side: THREE.DoubleSide })
    );
    flagMesh.position.set(2.45, 18.8, 0);
    flagMesh.userData.isFlag = true;
    flagGroup.add(flagMesh);
  }
  group.add(flagGroup);

  // --------------------------------------------------------------------------
  // 3. PHYSICAL 3D DIRECTIONAL ROAD SIGNBOARDS AT MAJOR JUNCTIONS
  // --------------------------------------------------------------------------
  const signposts = [
    {
      x: -52,
      z: 468,
      ry: -0.27,
      lines: [
        { label: '↑ ADMIN BLOCK · OAT · AUDI', dist: '440m' },
        { label: '→ DSM & GIRLS HOSTELS', dist: '140m' },
        { label: '← DTU MAIN GATE EXIT', dist: 'BAWANA RD' },
      ],
    },
    {
      x: -36,
      z: 408,
      ry: 0.2,
      lines: [
        { label: '↑ ACADEMIC PLAZA & ARCH WING', dist: '380m' },
        { label: '→ MALL ROAD & VLB HOSTEL', dist: '210m' },
        { label: '← AB-3 · RAJ SOIN · LAKE', dist: '410m' },
      ],
    },
    {
      x: -82,
      z: 44,
      ry: -0.5,
      lines: [
        { label: '← ADMIN BLOCK & TRICOLOR LAWN', dist: '30m' },
        { label: '↑ CENTRAL LIBRARY & AUDI', dist: '75m' },
        { label: '→ WIND POINT (OAT) & CS ARCH', dist: '65m' },
      ],
    },
    {
      x: -14,
      z: -24,
      ry: 0.15,
      lines: [
        { label: '↑ CS · EE · CE · ENE ARCH BLOCKS', dist: '40m' },
        { label: '→ MECHANICAL & WIND TUNNEL', dist: '95m' },
        { label: '↓ WIND POINT OAT PLAZA', dist: '50m' },
      ],
    },
    {
      x: -76,
      z: -48,
      ry: 0.65,
      lines: [
        { label: '← CENTRAL LIBRARY (ARCHIVES)', dist: '35m' },
        { label: '↑ SPORTS COMPLEX & 400M TRACK', dist: '250m' },
        { label: '↓ DR. B.R. AMBEDKAR AUDI', dist: '40m' },
      ],
    },
    {
      x: -248,
      z: 18,
      ry: 1.45,
      lines: [
        { label: '← AB-4 (CSE/IT) & AB-3 (SWE)', dist: '45m' },
        { label: '↑ RAJ SOIN HALL & FOOD COURT', dist: '95m' },
        { label: '→ DTU LAKE PROMENADE', dist: '185m' },
      ],
    },
    {
      x: -272,
      z: -95,
      ry: 0.78,
      lines: [
        { label: "↑ DOMINO'S · BISTRO 57 · UDUPI", dist: 'PLAZA' },
        { label: '← BOYS HOSTELS (HJB/VVS/CVR)', dist: '110m' },
        { label: '→ AMUL NIGHT CANTEEN', dist: '130m' },
      ],
    },
    {
      x: 48,
      z: 24,
      ry: -1.1,
      lines: [
        { label: '↑ MECHANICAL WORKSHOPS (MECH-C)', dist: '35m' },
        { label: '→ MIC-MAC CENTRAL CANTEEN', dist: '85m' },
        { label: '← PRAGYA BHAWAN & SPS 9-12', dist: '190m' },
      ],
    },
    {
      x: -115,
      z: -282,
      ry: 0.1,
      lines: [
        { label: '↑ 400M TRACK & FOOTBALL STADIUM', dist: 'ARENA' },
        { label: '← GYMNASIUM & BADMINTON HALL', dist: '110m' },
        { label: '→ CRICKET & BASKETBALL COURTS', dist: '70m' },
      ],
    },
    {
      x: -365,
      z: -120,
      ry: -0.6,
      lines: [
        { label: '↑ HJB · VVS · VMH · CVR HOSTELS', dist: '60m' },
        { label: '→ MONKEY BRIDGE & SPORTS GATE', dist: '190m' },
        { label: '↓ RAJ SOIN FOOD COURT', dist: '115m' },
      ],
    },
    {
      x: 196,
      z: 132,
      ry: -0.9,
      lines: [
        { label: '↑ PRAGYA BHAWAN & SPS 9-12', dist: '55m' },
        { label: '← MECH-C & WIND POINT', dist: '180m' },
        { label: '→ VLB HOSTEL & HEALTH CENTER', dist: '130m' },
      ],
    },
    {
      x: -386,
      z: 42,
      ry: -1.5,
      lines: [
        { label: '↑ DTU LAKE SCENIC WALKWAY', dist: '50m' },
        { label: '→ ACADEMIC BLOCK 4', dist: '75m' },
        { label: '← RAJ SOIN & HOSTEL QUAD', dist: '140m' },
      ],
    },
  ];

  signposts.forEach((sp) => {
    const sg = new THREE.Group();
    sg.position.set(sp.x, 0, sp.z);
    sg.rotation.y = sp.ry;

    [-1.4, 1.4].forEach((px) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 3.2, 8), materials.metalSteel);
      post.position.set(px, 1.6, 0);
      post.castShadow = true;
      sg.add(post);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.25, 8), materials.concrete);
      base.position.set(px, 0.125, 0);
      sg.add(base);
    });

    const boardFrame = new THREE.Mesh(new THREE.BoxGeometry(3.8, 1.9, 0.1), materials.metalDark);
    boardFrame.position.set(0, 2.75, 0);
    boardFrame.castShadow = true;
    sg.add(boardFrame);

    const tex = createDirectionalBoardTexture(sp.lines);
    const mat = new THREE.MeshBasicMaterial({ map: tex });
    [0.06, -0.06].forEach((zOff, idx) => {
      const face = new THREE.Mesh(new THREE.PlaneGeometry(3.65, 1.78), mat);
      face.position.set(0, 2.75, zOff);
      if (idx === 1) face.rotation.y = Math.PI;
      sg.add(face);
    });

    group.add(sg);
  });

  // --------------------------------------------------------------------------
  // 4. AUTHENTIC DTU EATERY KIOSKS (NO MAGGI BABA — REAL CURRENT SHOPS!)
  // --------------------------------------------------------------------------
  const kioskPOIs = DTU_POIS.filter((p) =>
    ['Nescafe', "Domino's", 'Bistro 57', 'Dazzledine', 'Udupi Cafeteria', 'NIght Canteen (Amul)', 'Deltech Cafe'].includes(p.name)
  );

  kioskPOIs.forEach((poi) => {
    const kGroup = new THREE.Group();
    kGroup.position.set(poi.x, 0, poi.z);

    const isNescafe = poi.name.includes('Nescafe');
    const isDominos = poi.name.includes('Domino');

    const kioskMat = isNescafe
      ? materials.nescafeRed
      : isDominos
        ? materials.courtBlue
        : materials.cream;

    const booth = new THREE.Mesh(new THREE.BoxGeometry(5.6, 3.2, 4.4), kioskMat);
    booth.position.y = 1.6;
    booth.castShadow = true;
    booth.receiveShadow = true;
    kGroup.add(booth);

    const glassWindow = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.4, 4.48), materials.tintedGlass);
    glassWindow.position.y = 1.9;
    kGroup.add(glassWindow);

    const awning = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.3, 5.0), materials.metalDark);
    awning.position.set(0, 3.35, 0.25);
    awning.castShadow = true;
    kGroup.add(awning);

    const signTex = createSignCanvasTexture({
      width: 384,
      height: 96,
      text: poi.name.toUpperCase(),
      subText: isNescafe ? 'ICED COFFEE & SNACKS' : 'DTU CAMPUS FOOD COURT',
      bgColor: isNescafe ? '#991b1b' : '#1e293b',
      borderColor: '#fbbf24',
      fontSize: 24,
      subFontSize: 15,
    });
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(4.6, 1.15),
      new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide })
    );
    sign.position.set(0, 4.2, 0);
    kGroup.add(sign);

    [-1.8, 1.8].forEach((tx) => {
      const table = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.68, 0.08, 10), materials.cream);
      table.position.set(tx, 0.85, 3.3);
      kGroup.add(table);
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.85, 8), materials.metalDark);
      leg.position.set(tx, 0.425, 3.3);
      kGroup.add(leg);
    });

    group.add(kGroup);
  });

  // Campus Benches along Wind Point Plaza, Admin Lawn & Lake Promenade
  const benchCoords = [
    [-70, 30, 0],
    [-70, 14, 0],
    [-34, 46, Math.PI / 2],
    [-4, 46, Math.PI / 2],
    [-392, 32, 0.3],
    [-396, 68, -0.2],
  ];
  benchCoords.forEach(([bx, bz, ry]) => {
    const bench = new THREE.Group();
    bench.position.set(bx, 0, bz);
    bench.rotation.y = ry;
    const seat = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.1, 0.58), materials.wood);
    seat.position.y = 0.5;
    const back = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.45, 0.08), materials.wood);
    back.position.set(0, 0.82, -0.24);
    [-0.85, 0.85].forEach((lx) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.52, 0.52), materials.metalDark);
      leg.position.set(lx, 0.26, 0);
      bench.add(leg);
    });
    bench.add(seat, back);
    group.add(bench);
  });

  // Monkey Bridge footbridge marker (-287.6, -292)
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.55, 7.2), materials.concrete);
  bridge.position.set(-287.6, 0.28, -292);
  bridge.castShadow = true;
  group.add(bridge);

  return group;
}

function isPointBlockedForVegetation(x, z) {
  if (!pointInPoly2D(x, z, CAMPUS_BOUNDARY)) return true;
  if (DTU_LAKE_DATA?.worldPoly && pointNearPolyEdge(x, z, DTU_LAKE_DATA.worldPoly, 5)) return true;
  if (DTU_LAKE_DATA?.worldPoly && pointInPoly2D(x, z, DTU_LAKE_DATA.worldPoly)) return true;

  for (const p of CAMPUS_PITCHES) {
    if (pointInPoly2D(x, z, p.worldPoly)) return true;
  }
  for (const b of CAMPUS_BUILDINGS) {
    if (x >= b.minX - 3.5 && x <= b.maxX + 3.5 && z >= b.minZ - 3.5 && z <= b.maxZ + 3.5) {
      if (pointInPoly2D(x, z, b.worldPoly) || pointNearPolyEdge(x, z, b.worldPoly, 3.2)) return true;
    }
  }
  for (const r of CAMPUS_ROADS) {
    const clearDistSq = (r.width * 0.5 + 3.2) ** 2;
    for (let i = 0; i < r.pts.length - 1; i++) {
      if (distToSegmentSq2D(x, z, r.pts[i][0], r.pts[i][1], r.pts[i + 1][0], r.pts[i + 1][1]) < clearDistSq) {
        return true;
      }
    }
  }
  return false;
}

function createInstancedTreesAndStreetlights(materials, isNight) {
  const group = new THREE.Group();
  group.name = 'dtu_foliage_and_lamps';

  const treeSpots = [];
  let seed = 1337;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  for (let i = 0; i < 650 && treeSpots.length < 235; i++) {
    const x = DTU_OSM_BOUNDS.minX + 30 + rand() * (DTU_OSM_BOUNDS.maxX - DTU_OSM_BOUNDS.minX - 60);
    const z = DTU_OSM_BOUNDS.minZ + 30 + rand() * (DTU_OSM_BOUNDS.maxZ - DTU_OSM_BOUNDS.minZ - 60);
    if (!isPointBlockedForVegetation(x, z)) {
      treeSpots.push({ x, z, scale: 0.78 + rand() * 0.65, variant: Math.floor(rand() * 4) });
    }
  }

  const trunkGeo = new THREE.CylinderGeometry(0.18, 0.34, 4.0, 6);
  trunkGeo.translate(0, 2.0, 0);
  const trunkInst = new THREE.InstancedMesh(trunkGeo, materials.treeBark, treeSpots.length);
  trunkInst.castShadow = true;

  const crownGeo = new THREE.IcosahedronGeometry(2.6, 1);
  crownGeo.translate(0, 5.2, 0);

  const byVariant = [[], [], [], []];
  const dummy = new THREE.Object3D();

  treeSpots.forEach((t, idx) => {
    dummy.position.set(t.x, 0, t.z);
    dummy.scale.set(t.scale, t.scale, t.scale);
    dummy.rotation.y = (idx * 1.1) % (Math.PI * 2);
    dummy.updateMatrix();
    trunkInst.setMatrixAt(idx, dummy.matrix);
    byVariant[t.variant].push(dummy.matrix.clone());
  });
  group.add(trunkInst);

  const canopyMats = [materials.foliage1, materials.foliage2, materials.foliageDark, materials.foliageGulmohar];
  byVariant.forEach((matsList, vIdx) => {
    if (matsList.length === 0) return;
    const inst = new THREE.InstancedMesh(crownGeo, canopyMats[vIdx], matsList.length);
    inst.castShadow = true;
    inst.receiveShadow = true;
    matsList.forEach((m, i) => inst.setMatrixAt(i, m));
    group.add(inst);
  });

  // Campus Avenue Streetlights spaced evenly along main roads
  const lampSpots = [];
  CAMPUS_ROADS.filter((r) => MAIN_SPINE_ROAD_IDS.has(r.id) || r.kind === 'secondary' || r.kind === 'residential').forEach(
    (road) => {
      for (let i = 0; i < road.pts.length - 1; i++) {
        const [x1, z1] = road.pts[i];
        const [x2, z2] = road.pts[i + 1];
        const dx = x2 - x1;
        const dz = z2 - z1;
        const len = Math.hypot(dx, dz);
        if (len < 18) continue;
        const ux = dx / len;
        const uz = dz / len;
        const nx = -uz;
        const nz = ux;
        const offset = Math.max(road.width * 0.5, 4.1) + 0.9;
        for (let d = 14; d < len - 10; d += 36) {
          lampSpots.push({ x: x1 + ux * d + nx * offset, z: z1 + uz * d + nz * offset });
        }
      }
    }
  );

  const count = Math.min(lampSpots.length, 130);
  const poleGeo = new THREE.CylinderGeometry(0.08, 0.14, 5.6, 6);
  poleGeo.translate(0, 2.8, 0);
  const poleInst = new THREE.InstancedMesh(poleGeo, materials.metalDark, count);

  const bulbGeo = new THREE.SphereGeometry(0.32, 8, 8);
  bulbGeo.translate(0, 5.65, 0);
  const bulbInst = new THREE.InstancedMesh(bulbGeo, materials.lampLantern, count);

  for (let i = 0; i < count; i++) {
    dummy.position.set(lampSpots[i].x, 0, lampSpots[i].z);
    dummy.scale.set(1, 1, 1);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    poleInst.setMatrixAt(i, dummy.matrix);
    bulbInst.setMatrixAt(i, dummy.matrix);
  }
  group.add(poleInst, bulbInst);

  return { group, count, bulbInst, isNight };
}

function createLandmarkWaypoints() {
  const group = new THREE.Group();
  group.name = 'landmark_waypoints';
  const animatedBeacons = [];

  LANDMARKS.forEach((lm) => {
    const markerGroup = new THREE.Group();
    markerGroup.position.set(lm.position[0], 0, lm.position[2]);

    const ringGeo = new THREE.RingGeometry(1.75, 2.25, 28);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: lm.color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.72,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.08;
    markerGroup.add(ring);

    const gemGeo = new THREE.OctahedronGeometry(0.55, 0);
    const gemMat = new THREE.MeshStandardMaterial({
      color: lm.color,
      emissive: lm.color,
      emissiveIntensity: 0.55,
      roughness: 0.2,
    });
    const gem = new THREE.Mesh(gemGeo, gemMat);
    gem.position.y = 3.2;
    markerGroup.add(gem);

    animatedBeacons.push({
      gem,
      ring,
      baseY: 3.2,
      speed: 2.1 + (animatedBeacons.length % 3) * 0.25,
    });

    group.add(markerGroup);
  });

  return { group, animatedBeacons };
}

// ============================================================================
// 7. LIGHTING, DAY/NIGHT CYCLES & COLLIDERS
// ============================================================================

export function setupCampusLighting(scene, isNight = false) {
  const ambientLight = new THREE.AmbientLight(
    isNight ? 0x26324d : 0xfff8e7,
    isNight ? 0.65 : 0.7
  );
  scene.add(ambientLight);

  const hemiLight = new THREE.HemisphereLight(
    isNight ? 0x1a237e : 0xb3e5fc,
    isNight ? 0x111622 : 0x3b6e3c,
    isNight ? 0.45 : 0.68
  );
  hemiLight.position.set(0, 60, 0);
  scene.add(hemiLight);

  const sunLight = new THREE.DirectionalLight(
    isNight ? 0x7a9cff : 0xfff3d6,
    isNight ? 0.5 : 1.75
  );
  sunLight.position.set(60, 125, 45);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 10;
  sunLight.shadow.camera.far = 380;
  sunLight.shadow.camera.left = -140;
  sunLight.shadow.camera.right = 140;
  sunLight.shadow.camera.top = 140;
  sunLight.shadow.camera.bottom = -140;
  sunLight.shadow.bias = -0.0005;
  scene.add(sunLight);
  scene.add(sunLight.target);

  return { ambientLight, hemiLight, sunLight };
}

export function setDayNightMode(worldContext, isNight = false) {
  if (!worldContext) return;
  const { scene, materials, lights } = worldContext;
  worldContext.isNight = isNight;

  if (scene) {
    const bgColor = isNight ? 0x0b192c : 0x9ed3f5;
    scene.background = new THREE.Color(bgColor);
    if (scene.fog) {
      scene.fog.color.setHex(bgColor);
      scene.fog.near = isNight ? 240 : 420;
      scene.fog.far = isNight ? 880 : 1350;
    }
  }

  if (lights) {
    lights.ambientLight.color.setHex(isNight ? 0x26324d : 0xfff8e7);
    lights.ambientLight.intensity = isNight ? 0.65 : 0.7;
    lights.hemiLight.color.setHex(isNight ? 0x1a237e : 0xb3e5fc);
    lights.hemiLight.intensity = isNight ? 0.45 : 0.68;
    lights.sunLight.color.setHex(isNight ? 0x7a9cff : 0xfff3d6);
    lights.sunLight.intensity = isNight ? 0.5 : 1.75;
  }

  if (materials) {
    if (materials.window) {
      materials.window.emissive.setHex(isNight ? 0xffd54f : 0x000000);
      materials.window.emissiveIntensity = isNight ? 0.85 : 0.0;
    }
    if (materials.lampLantern) {
      materials.lampLantern.emissive.setHex(isNight ? 0xffecb3 : 0x000000);
      materials.lampLantern.emissiveIntensity = isNight ? 2.1 : 0.0;
    }
    if (materials.stadiumLight) {
      materials.stadiumLight.emissive.setHex(isNight ? 0xe0f2fe : 0x000000);
      materials.stadiumLight.emissiveIntensity = isNight ? 1.8 : 0.0;
    }
  }
}

export function buildColliders() {
  const polys = CAMPUS_BUILDINGS.filter((b) => b.archetype !== 'oat').map((b) => ({
    id: b.id,
    minX: b.minX,
    maxX: b.maxX,
    minZ: b.minZ,
    maxZ: b.maxZ,
    poly: b.worldPoly,
  }));

  if (DTU_LAKE_DATA?.worldPoly) {
    const xs = DTU_LAKE_DATA.worldPoly.map((p) => p[0]);
    const zs = DTU_LAKE_DATA.worldPoly.map((p) => p[1]);
    polys.push({
      id: 'dtu_lake',
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minZ: Math.min(...zs),
      maxZ: Math.max(...zs),
      poly: DTU_LAKE_DATA.worldPoly,
    });
  }

  return polys;
}

export function checkLandmarkProximity(playerPos, threshold = 22) {
  const px = playerPos.x !== undefined ? playerPos.x : playerPos[0];
  const pz = playerPos.z !== undefined ? playerPos.z : playerPos[2];

  let nearest = null;
  let minDistance = Infinity;

  for (const lm of LANDMARKS) {
    const dx = px - lm.position[0];
    const dz = pz - lm.position[2];
    const dist = Math.sqrt(dx * dx + dz * dz);
    const triggerRadius = lm.radius || threshold;
    if (dist < triggerRadius && dist < minDistance) {
      minDistance = dist;
      nearest = { ...lm, distance: dist };
    }
  }
  return nearest;
}

// ============================================================================
// 8. MASTER WORLD CONSTRUCTOR
// ============================================================================

export function createCampusWorld(scene, options = {}) {
  const isNight = !!options.isNight;
  const campusRoot = new THREE.Group();
  campusRoot.name = 'DTU_Campus_World_1to1';

  const materials = createMaterialPalette();

  if (options.fog !== false) {
    scene.fog = new THREE.Fog(isNight ? 0x0b192c : 0x9ed3f5, isNight ? 240 : 420, isNight ? 880 : 1350);
  }
  scene.background = new THREE.Color(isNight ? 0x0b192c : 0x9ed3f5);
  const lights = setupCampusLighting(scene, isNight);

  campusRoot.add(createTerrainAndPerimeter(materials));
  campusRoot.add(createRoadNetwork(materials));
  campusRoot.add(createDTULake(materials));
  campusRoot.add(createSportsPitches(materials));
  campusRoot.add(createAllOSMBuildings(materials));

  const gateAndProps = createMainEntranceGateAndKiosks(materials);
  campusRoot.add(gateAndProps);

  const envVeg = createInstancedTreesAndStreetlights(materials, isNight);
  campusRoot.add(envVeg.group);

  const waypoints = createLandmarkWaypoints();
  campusRoot.add(waypoints.group);

  scene.add(campusRoot);

  const colliders = buildColliders();

  // Locate flag mesh once for lightweight wave animation
  const flagMeshes = [];
  gateAndProps.traverse((o) => {
    if (o.isMesh && o.userData?.isFlag) flagMeshes.push(o);
  });

  const worldContext = {
    group: campusRoot,
    scene,
    materials,
    lights,
    streetlights: envVeg,
    landmarks: LANDMARKS,
    colliders,
    waypoints,
    isNight,

    animate(delta = 0.016, elapsed = performance.now() * 0.001) {
      if (waypoints && waypoints.animatedBeacons) {
        waypoints.animatedBeacons.forEach((b) => {
          b.gem.position.y = b.baseY + Math.sin(elapsed * b.speed) * 0.55;
          b.gem.rotation.y += delta * 1.2;
          const sc = 1.0 + Math.sin(elapsed * 2.0) * 0.08;
          b.ring.scale.set(sc, sc, sc);
        });
      }
      flagMeshes.forEach((fm) => {
        fm.rotation.y = Math.sin(elapsed * 2.4) * 0.14;
      });
    },

    updateShadowTarget(playerPos) {
      if (!lights?.sunLight || !playerPos) return;
      const sx = Math.round(playerPos.x / 6) * 6;
      const sz = Math.round(playerPos.z / 6) * 6;
      lights.sunLight.position.set(sx + 75, 130, sz + 55);
      lights.sunLight.target.position.set(sx, 0, sz);
      lights.sunLight.target.updateMatrixWorld();
    },

    setDayNightMode(night) {
      setDayNightMode(worldContext, night);
    },

    checkCollision(posOrX, zOrRadius = 0.65, optRadius = 0.65) {
      const px = typeof posOrX === 'number' ? posOrX : posOrX.x;
      const pz = typeof posOrX === 'number' ? zOrRadius : posOrX.z;
      const radius = typeof posOrX === 'number' ? optRadius : zOrRadius;

      for (let i = 0; i < colliders.length; i++) {
        const c = colliders[i];
        if (px < c.minX - radius || px > c.maxX + radius || pz < c.minZ - radius || pz > c.maxZ + radius) {
          continue;
        }
        if (pointInPoly2D(px, pz, c.poly) || pointNearPolyEdge(px, pz, c.poly, radius)) {
          return true;
        }
      }
      return false;
    },

    dispose() {
      scene.remove(campusRoot);
      if (lights.sunLight) {
        scene.remove(lights.sunLight.target);
        scene.remove(lights.sunLight);
      }
      if (lights.ambientLight) scene.remove(lights.ambientLight);
      if (lights.hemiLight) scene.remove(lights.hemiLight);

      campusRoot.traverse((obj) => {
        if (obj.isMesh && obj.geometry) obj.geometry.dispose();
        if (obj.isLine && obj.geometry) obj.geometry.dispose();
      });

      Object.values(materials).forEach((mat) => {
        if (mat) {
          if (mat.map && mat.map.dispose) mat.map.dispose();
          if (mat.dispose) mat.dispose();
        }
      });
    },
  };

  setDayNightMode(worldContext, isNight);
  return worldContext;
}

export default createCampusWorld;
