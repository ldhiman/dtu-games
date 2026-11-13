'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import * as THREE from 'three';
import {
  Volume2,
  VolumeX,
  Play,
  HelpCircle,
  Trophy,
  ArrowLeft,
  Home,
  ExternalLink,
  Maximize2,
  Swords,
  Users,
  Bot,
  Flame,
  CheckCircle,
  Sparkles,
} from 'lucide-react';

import { Fighter3D } from './components/Fighter3D';
import { createStage3D } from './components/Stages3D';

// ============================================================================
// 1. SOUND ENGINE (PROCEDURAL WEB AUDIO SYNTHESIZER)
// ============================================================================

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.isMusicPlaying = false;
    this.musicTimer = null;
    this.musicStep = 0;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    } catch {
      // AudioContext unavailable
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playPunch() {
    if (this.isMuted || !this.ctx) return;
    this.resume();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(55, t + 0.11);
    gain.gain.setValueAtTime(0.38, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.11);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  playWhoosh() {
    if (this.isMuted || !this.ctx) return;
    this.resume();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.12);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.13);
  }

  playHeavyHit() {
    if (this.isMuted || !this.ctx) return;
    this.resume();
    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(140, t);
    osc1.frequency.exponentialRampToValueAtTime(32, t + 0.28);
    gain1.gain.setValueAtTime(0.65, t);
    gain1.gain.exponentialRampToValueAtTime(0.01, t + 0.28);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(t);
    osc1.stop(t + 0.29);

    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(350, t);
    osc2.frequency.exponentialRampToValueAtTime(45, t + 0.14);
    gain2.gain.setValueAtTime(0.35, t);
    gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.14);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(t);
    osc2.stop(t + 0.15);
  }

  playSpecial() {
    if (this.isMuted || !this.ctx) return;
    this.resume();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.linearRampToValueAtTime(880, t + 0.15);
    osc.frequency.exponentialRampToValueAtTime(160, t + 0.35);
    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.36);
  }

  playGuardCrush() {
    if (this.isMuted || !this.ctx) return;
    this.resume();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(980, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.42);
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.42);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.43);
  }

  playCheer() {
    if (this.isMuted || !this.ctx) return;
    this.resume();
    const t = this.ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220 + i * 85, t + i * 0.06);
      osc.frequency.linearRampToValueAtTime(440 + i * 95, t + 0.45);
      gain.gain.setValueAtTime(0.18, t + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.85);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + i * 0.06);
      osc.stop(t + 0.88);
    }
  }

  playKick() {
    if (this.isMuted || !this.ctx) return;
    this.resume();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.18);
    gain.gain.setValueAtTime(0.48, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.19);
  }

  playBlock() {
    if (this.isMuted || !this.ctx) return;
    this.resume();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(650, t);
    osc.frequency.exponentialRampToValueAtTime(950, t + 0.08);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  playShakti() {
    if (this.isMuted || !this.ctx) return;
    this.resume();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.linearRampToValueAtTime(520, t + 0.35);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.7);
    gain.gain.setValueAtTime(0.55, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.7);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.72);
  }

  playKO() {
    if (this.isMuted || !this.ctx) return;
    this.resume();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(240, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 1.1);
    gain.gain.setValueAtTime(0.65, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 1.1);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 1.15);
  }

  startMusic() {
    if (this.isMusicPlaying || this.isMuted || !this.ctx) return;
    this.resume();
    this.isMusicPlaying = true;
    const bass = [110, 110, 130.8, 146.8, 110, 110, 164.8, 146.8];
    const lead = [220, 261.6, 293.7, 329.6, 293.7, 261.6, 329.6, 392];
    this.musicStep = 0;

    const tick = () => {
      if (!this.isMusicPlaying || !this.ctx) return;
      const t = this.ctx.currentTime;
      const bFreq = bass[this.musicStep % bass.length];
      const lFreq = lead[this.musicStep % lead.length];

      const bOsc = this.ctx.createOscillator();
      const bGain = this.ctx.createGain();
      bOsc.type = 'triangle';
      bOsc.frequency.setValueAtTime(bFreq * 0.5, t);
      bGain.gain.setValueAtTime(0.11, t);
      bGain.gain.exponentialRampToValueAtTime(0.005, t + 0.16);
      bOsc.connect(bGain);
      bGain.connect(this.ctx.destination);
      bOsc.start(t);
      bOsc.stop(t + 0.17);

      if (this.musicStep % 2 === 0) {
        const lOsc = this.ctx.createOscillator();
        const lGain = this.ctx.createGain();
        lOsc.type = 'square';
        lOsc.frequency.setValueAtTime(lFreq, t);
        lGain.gain.setValueAtTime(0.045, t);
        lGain.gain.exponentialRampToValueAtTime(0.003, t + 0.14);
        lOsc.connect(lGain);
        lGain.connect(this.ctx.destination);
        lOsc.start(t);
        lOsc.stop(t + 0.15);
      }

      this.musicStep++;
      this.musicTimer = setTimeout(tick, 185);
    };
    tick();
  }

  stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) this.stopMusic();
    else this.startMusic();
    return this.isMuted;
  }
}

// ============================================================================
// 2. DTU PROFESSOR ROSTER & STAGES
// ============================================================================

export const PROF_ROSTER = [
  {
    id: 'dean_detain',
    name: 'Dean of Detain',
    facultyTitle: 'Prof. Sharma · Attendance & Detention Wing',
    style: 'Heavy Brawler / Guard Crusher',
    stats: { hp: 105, speed: 4.8, power: 1.25, range: 4.2 },
    color: '#991b1b',
    signatureMove: 'Register Slap & Chalk Shuriken',
    shaktiMove: '74.9% Short Attendance Detain',
    quote: '"Admit card to bhool hi jao beta!"',
    avatar: '👨‍🏫',
    skinTone: '#e0a96d',
    coatColor: '#7f1d1d',
    tieColor: '#f59e0b',
    pantColor: '#1e293b',
    weaponType: 'register',
  },
  {
    id: 'math_matrix',
    name: 'Dr. Math Matrix',
    facultyTitle: 'Prof. Gupta · Applied Mathematics & Calculus',
    style: 'Zoning Striker & Energy Vectors',
    stats: { hp: 95, speed: 5.6, power: 1.15, range: 5.0 },
    color: '#0284c7',
    signatureMove: 'Sine Wave Sweep & Compass Jab',
    shaktiMove: 'Eigenvalue Collapse',
    quote: '"Assume x approaches 0, and accept your fate!"',
    avatar: '📐',
    skinTone: '#f3c59a',
    coatColor: '#f1f5f9',
    tieColor: '#0284c7',
    pantColor: '#334155',
    weaponType: 'stylus',
  },
  {
    id: 'lab_incharge',
    name: 'The Lab In-Charge',
    facultyTitle: 'Ustadji · Mechanical Workshops (Mech-C)',
    style: 'Heavy Armored Powerhouse & Grapples',
    stats: { hp: 115, speed: 4.2, power: 1.35, range: 4.0 },
    color: '#d97706',
    signatureMove: 'Lathe Spin Kick & Pipe Wrench Smash',
    shaktiMove: '0.001mm Tolerance Crush',
    quote: '"Workshop mein file todoge toh zero milega!"',
    avatar: '🔧',
    skinTone: '#c68642',
    coatColor: '#1e3a8a',
    tieColor: '#ea580c',
    pantColor: '#0f172a',
    weaponType: 'wrench',
  },
  {
    id: 'dsa_wizard',
    name: 'The DSA Wizard',
    facultyTitle: 'Prof. Verma · Computer Science & Algorithmic Design',
    style: 'High-Agility Ninja & Teleport Combos',
    stats: { hp: 90, speed: 6.4, power: 1.05, range: 4.6 },
    color: '#10b981',
    signatureMove: 'Binary Dash Slash & Pointer Strike',
    shaktiMove: 'O(N!) Runtime Crash',
    quote: '"Your defense runs in worst-case O(N^3) time!"',
    avatar: '💻',
    skinTone: '#e7bc91',
    coatColor: '#090d16',
    tieColor: '#10b981',
    pantColor: '#1e293b',
    weaponType: 'keyboard',
  },
  {
    id: 'viva_examiner',
    name: 'External Viva Examiner',
    facultyTitle: 'Dr. Rao · External Evaluation Board',
    style: 'Tricky Trapper & Confusion Stunner',
    stats: { hp: 95, speed: 5.0, power: 1.15, range: 4.6 },
    color: '#7c3aed',
    signatureMove: 'Question Paper Shuriken & Clipboard Poke',
    shaktiMove: 'Derive from First Principles',
    quote: '"Draw the circuit diagram on page 412 right now!"',
    avatar: '📋',
    skinTone: '#dfa373',
    coatColor: '#475569',
    tieColor: '#7c3aed',
    pantColor: '#1e293b',
    weaponType: 'clipboard',
  },
  {
    id: 'secret_vc',
    name: 'The Vice-Chancellor',
    facultyTitle: 'Chancellor Sahab · Supreme Campus Authority',
    style: 'Final Boss / Supreme Convocation Aura',
    stats: { hp: 140, speed: 5.8, power: 1.4, range: 4.8 },
    color: '#b91c1c',
    signatureMove: 'Ceremonial Mace Strike & Convocation Ray',
    shaktiMove: 'Supreme Degree Revocation',
    quote: '"I hereby dissolve your semester with immediate effect!"',
    avatar: '🏛️',
    skinTone: '#e3ad7b',
    coatColor: '#7f1d1d',
    tieColor: '#f59e0b',
    pantColor: '#090d16',
    weaponType: 'mace',
    isBoss: true,
  },
];

export const STAGES = [
  {
    id: 'oat',
    name: 'Open Air Theatre (Wind Point)',
    subtitle: 'Sunken Sandstone Tiers & Evening Fest Crowd',
    bgColor: 0x1e1b4b,
  },
  {
    id: 'admin',
    name: 'Admin Block & Tricolor Lawn',
    subtitle: 'Clock Tower Backdrop & Indian National Flagpole',
    bgColor: 0x0f172a,
  },
  {
    id: 'mech',
    name: 'Mech-C Workshops & Lathe Bay',
    subtitle: 'Industrial Trusses & Formula SAE Racecars',
    bgColor: 0x18181b,
  },
  {
    id: 'audi',
    name: 'Dr. B.R. Ambedkar Audi',
    subtitle: 'Engifest Convocation Stage & Laser Lights',
    bgColor: 0x311042,
  },
  {
    id: 'gate',
    name: 'DTU Main Gate (Bawana Road)',
    subtitle: 'Iconic T-Canopy & Striped Curbstones',
    bgColor: 0x022c22,
  },
];

// ============================================================================
// 3. MAIN REACT COMPONENT (2.5D THREE.JS FIGHTER)
// ============================================================================

export default function ProfShowdownClient() {
  const containerRef = useRef(null);
  const soundRef = useRef(null);

  // UI States
  const [gameState, setGameState] = useState('SELECT'); // 'SELECT' | 'FIGHT' | 'GAMEOVER'
  const [gameMode, setGameMode] = useState('CPU'); // 'CPU' | '2P'
  const [difficulty, setDifficulty] = useState('NORMAL'); // 'EASY' | 'NORMAL' | 'HARD'
  const [selectedP1, setSelectedP1] = useState(PROF_ROSTER[0]);
  const [selectedP2, setSelectedP2] = useState(PROF_ROSTER[3]);
  const [selectedStage, setSelectedStage] = useState(STAGES[0]);
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showMoveList, setShowMoveList] = useState(false);

  // Match HUD React States
  const [p1Hp, setP1Hp] = useState(100);
  const [p2Hp, setP2Hp] = useState(100);
  const [p1Guard, setP1Guard] = useState(100);
  const [p2Guard, setP2Guard] = useState(100);
  const [p1Shakti, setP1Shakti] = useState(0);
  const [p2Shakti, setP2Shakti] = useState(0);
  const [p1SpecialCooldown, setP1SpecialCooldown] = useState(0);
  const [roundTimer, setRoundTimer] = useState(60);
  const [p1Wins, setP1Wins] = useState(0);
  const [p2Wins, setP2Wins] = useState(0);
  // Refs for win counts so handleRoundWin (inside useEffect) always reads fresh values
  const p1WinsRef = useRef(0);
  const p2WinsRef = useRef(0);
  const syncWins = (nP1, nP2) => {
    p1WinsRef.current = nP1;
    p2WinsRef.current = nP2;
    setP1Wins(nP1);
    setP2Wins(nP2);
  };
  const [matchWinner, setMatchWinner] = useState(null);
  const [bannerMessage, setBannerMessage] = useState('ROUND 1');
  const [streak, setStreak] = useState(0);
  const [comboBanner, setComboBanner] = useState(null);

  // Three.js & Combat Engine References
  const threeRef = useRef({
    scene: null,
    camera: null,
    renderer: null,
    stageGroup: null,
    dirLight: null,
    spotLight: null,
    p1: null,
    p2: null,
    particles: [],
    projectiles: [],
    hitstop: 0,
    shake: 0,
    timeDilation: 1.0,
    roundOver: false,
    timer: 60,
    keys: {},
    gameMode: 'CPU',  // mirror of gameMode state for stale-closure-safe access
    difficulty: 'NORMAL',
  });

  // Keep threeRef.gameMode & difficulty in sync with React state
  useEffect(() => { threeRef.current.gameMode = gameMode; }, [gameMode]);
  useEffect(() => { threeRef.current.difficulty = difficulty; }, [difficulty]);

  // Sound Engine Setup
  useEffect(() => {
    soundRef.current = new SoundEngine();
    soundRef.current.init();
    return () => {
      if (soundRef.current) soundRef.current.stopMusic();
    };
  }, []);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      threeRef.current.keys[e.code] = true;
      if (soundRef.current) soundRef.current.resume();

      if (e.code === 'KeyP') setIsPaused((prev) => !prev);
      if (e.code === 'KeyM') {
        if (soundRef.current) setIsMuted(soundRef.current.toggleMute());
      }
    };
    const handleKeyUp = (e) => {
      threeRef.current.keys[e.code] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Handle URL Query Params for Autostart in New Window
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const p1Id = params.get('p1');
      const p2Id = params.get('p2');
      const stageId = params.get('stage');
      const diff = params.get('diff');
      const mode = params.get('mode');
      const autostart = params.get('autostart');

      if (p1Id) {
        const found = PROF_ROSTER.find((p) => p.id === p1Id);
        if (found) setSelectedP1(found);
      }
      if (p2Id) {
        const found = PROF_ROSTER.find((p) => p.id === p2Id);
        if (found) setSelectedP2(found);
      }
      if (stageId) {
        const found = STAGES.find((s) => s.id === stageId);
        if (found) setSelectedStage(found);
      }
      if (diff && ['EASY', 'NORMAL', 'HARD'].includes(diff)) setDifficulty(diff);
      if (mode && ['CPU', '2P'].includes(mode)) setGameMode(mode);

      if (autostart === '1') {
        setP1Wins(0);
        setP2Wins(0);
        setGameState('FIGHT');
      }
    } catch {
      // url param fallback
    }
  }, []);

  // Launch Standalone Match in Clean Popup Window without Header & Footer
  const openMatchInNewWindow = () => {
    if (typeof window === 'undefined') return;
    const w = 1280;
    const h = 820;
    const left = Math.max(0, Math.round((window.screen.width - w) / 2));
    const top = Math.max(0, Math.round((window.screen.height - h) / 2));
    const url = `/prof-showdown?autostart=1&p1=${selectedP1.id}&p2=${selectedP2.id}&stage=${selectedStage.id}&diff=${difficulty}&mode=${gameMode}`;
    const win = window.open(
      url,
      'ProfShowdownArena',
      `width=${w},height=${h},top=${top},left=${left},resizable=yes,scrollbars=no,status=no,toolbar=no,menubar=no,location=no`
    );
    if (win) win.focus();
  };

  // Spawn 3D Hit VFX (Shockwave ring, starburst octahedrons, and spark splinters)
  const spawn3DHitVFX = (x, y, isCrit = false, isBlock = false) => {
    const scene = threeRef.current.scene;
    if (!scene) return;

    // Expanding shockwave ring
    const ringGeo = new THREE.RingGeometry(0.12, 0.22, 16);
    const ringMat = new THREE.MeshBasicMaterial({
      color: isBlock ? 0x38bdf8 : isCrit ? 0xf59e0b : 0xef4444,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(x, y, 0.05);
    scene.add(ring);
    threeRef.current.particles.push({
      mesh: ring,
      vx: 0,
      vy: 0,
      vz: 0,
      life: 1.0,
      decay: 0.07,
      scaleSpeed: 8.5,
      isRing: true,
    });

    // Starburst octahedrons & directional sparks
    const count = isCrit ? 18 : isBlock ? 8 : 12;
    for (let i = 0; i < count; i++) {
      const isStar = i % 2 === 0;
      const geo = isStar ? new THREE.OctahedronGeometry(0.08) : new THREE.BoxGeometry(0.06, 0.06, 0.06);
      const mat = new THREE.MeshBasicMaterial({
        color: isBlock
          ? (i % 2 === 0 ? 0x38bdf8 : 0x93c5fd)
          : isCrit
            ? (i % 2 === 0 ? 0xf59e0b : 0xfde047)
            : (i % 2 === 0 ? 0xef4444 : 0xf97316),
      });
      const spark = new THREE.Mesh(geo, mat);
      spark.position.set(x + (Math.random() - 0.5) * 0.15, y + (Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2);

      const angle = Math.random() * Math.PI * 2;
      const speed = (isCrit ? 6.0 : isBlock ? 3.5 : 4.5) + Math.random() * 3.5;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed + 2.0;
      const vz = (Math.random() - 0.5) * 3.0;

      scene.add(spark);
      threeRef.current.particles.push({
        mesh: spark,
        vx,
        vy,
        vz,
        life: 1.0,
        decay: 0.04 + Math.random() * 0.03,
      });
    }
  };

  // Start / Reset Round
  const startFight = useCallback(
    (p1Config = selectedP1, p2Config = selectedP2, stageConfig = selectedStage) => {
      const t = threeRef.current;
      setGameState('FIGHT');
      setIsPaused(false);
      setMatchWinner(null);
      setComboBanner(null);

      t.roundOver = false;
      t.timeDilation = 1.0;
      t.hitstop = 0;
      t.timer = 60;
      setRoundTimer(60);

      // Clean up active projectiles
      if (t.projectiles && t.projectiles.length > 0) {
        t.projectiles.forEach((p) => {
          if (p.mesh && t.scene) {
            t.scene.remove(p.mesh);
            if (p.mesh.geometry) p.mesh.geometry.dispose();
          }
        });
        t.projectiles = [];
      }

      // Re-create or reset 3D fighters in scene
      if (t.scene) {
        if (t.p1) {
          t.scene.remove(t.p1.root);
          t.p1.dispose();
        }
        if (t.p2) {
          t.scene.remove(t.p2.root);
          t.p2.dispose();
        }

        t.p1 = new Fighter3D(p1Config, true);
        t.p2 = new Fighter3D(p2Config, false);
        t.scene.add(t.p1.root);
        t.scene.add(t.p2.root);

        // Update Stage
        if (t.stageGroup) t.scene.remove(t.stageGroup);
        t.stageGroup = createStage3D(stageConfig);
        t.scene.add(t.stageGroup);
        t.scene.background = new THREE.Color(stageConfig.bgColor);
      }

      setP1Hp(100);
      setP2Hp(100);
      setP1Guard(100);
      setP2Guard(100);
      setP1Shakti(0);
      setP2Shakti(0);
      setP1SpecialCooldown(0);

      setBannerMessage(`ROUND ${p1WinsRef.current + p2WinsRef.current + 1}`);
      setTimeout(() => {
        setBannerMessage('FIGHT!');
        setTimeout(() => setBannerMessage(null), 900);
      }, 1100);

      if (soundRef.current && !isMuted) {
        soundRef.current.startMusic();
      }
    },
    [selectedP1, selectedP2, selectedStage, isMuted]
  );

  // Initialize Three.js WebGL Scene on Mounting / Mode Switch
  useEffect(() => {
    if (gameState !== 'FIGHT' && gameState !== 'GAMEOVER') return;
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Camera (2.5D Perspective Camera)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(selectedStage.bgColor);
    const camera = new THREE.PerspectiveCamera(42, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 2.2, 9.8);
    camera.lookAt(0, 1.2, 0);

    // 2. Renderer with soft shadows
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff3d6, 1.4);
    dirLight.position.set(5, 12, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    const spotLight = new THREE.SpotLight(0x38bdf8, 1.2, 25, Math.PI / 4, 0.5);
    spotLight.position.set(0, 10, 4);
    scene.add(spotLight);

    threeRef.current.scene = scene;
    threeRef.current.camera = camera;
    threeRef.current.renderer = renderer;
    threeRef.current.dirLight = dirLight;
    threeRef.current.spotLight = spotLight;

    // Start fight round
    startFight();

    // 60-second round clock
    const clockInterval = setInterval(() => {
      const t = threeRef.current;
      if (!isPaused && !t.roundOver) {
        t.timer = Math.max(0, t.timer - 1);
        setRoundTimer(t.timer);

        if (t.timer === 0 && t.p1 && t.p2) {
          if (t.p1.hp > t.p2.hp) handleRoundWin('P1', 'TIME OVER · P1 WINS');
          else if (t.p2.hp > t.p1.hp) handleRoundWin('P2', 'TIME OVER · P2 WINS');
          else handleRoundWin('DRAW', 'TIME OVER · DRAW');
        }
      }
    }, 1000);

    const handleRoundWin = (winner, banner) => {
      const t = threeRef.current;
      if (t.roundOver) return; // Guard against multiple K.O. invocations
      t.roundOver = true;
      t.hitstop = 0;
      t.timeDilation = 1.0;

      // STOP GAME IMMEDIATELY: Halt both fighters and lock poses
      if (t.p1) {
        t.p1.vx = 0;
        t.p1.vy = 0;
        t.p1.state = winner === 'P1' ? 'WIN' : 'KNOCKDOWN';
        t.p1.updateTransform();
      }
      if (t.p2) {
        t.p2.vx = 0;
        t.p2.vy = 0;
        t.p2.state = winner === 'P2' ? 'WIN' : 'KNOCKDOWN';
        t.p2.updateTransform();
      }

      // Immediately purge all active projectiles so nothing hits after K.O.
      if (t.projectiles && t.projectiles.length > 0) {
        t.projectiles.forEach((p) => {
          if (p.mesh && t.scene) {
            t.scene.remove(p.mesh);
            if (p.mesh.geometry) p.mesh.geometry.dispose();
          }
        });
        t.projectiles = [];
      }

      if (soundRef.current) soundRef.current.playKO();

      // Compute updated win counts using live refs
      const nextP1 = p1WinsRef.current + (winner === 'P1' ? 1 : 0);
      const nextP2 = p2WinsRef.current + (winner === 'P2' ? 1 : 0);
      syncWins(nextP1, nextP2);

      // Check if either player reached 2 K.O.s (Best of 3 Match Winner)
      if (nextP1 >= 2 || nextP2 >= 2) {
        const isP1MatchWinner = nextP1 >= 2;
        const winnerName = isP1MatchWinner
          ? (t.gameMode === '2P' ? 'PLAYER 1' : (selectedP1?.name || 'PLAYER 1'))
          : (t.gameMode === '2P' ? 'PLAYER 2' : (selectedP2?.name || 'CPU'));

        setBannerMessage(`🏆 ${winnerName.toUpperCase()} WINS! 🏆`);
        setMatchWinner(winnerName);
        if (isP1MatchWinner) setStreak((s) => s + 1);
        else setStreak(0);

        // After 2 K.O.s, automatically declare winner and return to selection screen
        setTimeout(() => {
          syncWins(0, 0);
          setBannerMessage(null);
          setMatchWinner(null);
          setGameState('SELECT');
        }, 2500);
      } else {
        // Round 1 K.O. — show banner, pause briefly and start round 2
        setBannerMessage(banner || (winner === 'P1' ? 'K.O. · PLAYER 1 WINS' : 'K.O. · PLAYER 2 WINS'));
        setTimeout(() => {
          startFight();
        }, 1900);
      }
    };

    // 4. Main 60 FPS 2.5D Combat Loop
    let animId;
    let lastTime = performance.now();

    const loop = (currentTime) => {
      const rawDelta = (currentTime - lastTime) * 0.001;
      lastTime = currentTime;
      const delta = Math.min(0.05, rawDelta) * threeRef.current.timeDilation;

      if (!isPaused) {
        updateCombatPhysics(delta, handleRoundWin);
      }

      // Update 2.5D Tracking Camera
      updateDynamicCamera(delta);

      // Render Three.js Scene
      renderer.render(scene, camera);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(clockInterval);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [gameState, selectedStage, isPaused, startFight]);

  // Combat Physics, Frame-Data & Pushbox Engine
  const updateCombatPhysics = (delta, onRoundWin) => {
    const t = threeRef.current;
    const { p1, p2, keys } = t;
    if (!p1 || !p2) return;

    // IMMEDIATE GAME STOP ON K.O. / ROUND OVER
    if (t.roundOver) {
      if (p1) {
        p1.vx = 0;
        p1.updateTransform();
        p1.updateAnimation(delta);
      }
      if (p2) {
        p2.vx = 0;
        p2.updateTransform();
        p2.updateAnimation(delta);
      }
      if (t.projectiles && t.projectiles.length > 0) {
        t.projectiles.forEach((p) => {
          if (p.mesh && t.scene) {
            t.scene.remove(p.mesh);
            if (p.mesh.geometry) p.mesh.geometry.dispose();
          }
        });
        t.projectiles = [];
      }
      for (let i = t.particles.length - 1; i >= 0; i--) {
        const pt = t.particles[i];
        pt.life -= pt.decay;
        if (pt.life <= 0) {
          t.scene.remove(pt.mesh);
          pt.mesh.geometry.dispose();
          t.particles.splice(i, 1);
        }
      }
      return;
    }

    // Hitstop micro-freeze (Tekken-style impact freeze frames)
    // Only freeze player/CPU input, NOT projectiles/particles/gravity
    const inHitstop = t.hitstop > 0;
    if (inHitstop) {
      t.hitstop -= delta;
      // Still tick fighter timers during hitstop so state doesn't get stuck
      [p1, p2].forEach((f) => {
        if (!f) return;
        if (f.hitstopTimer > 0) f.hitstopTimer -= delta;
        if (f.specialCooldown > 0) f.specialCooldown -= delta;
        if (f.attackFrame > 0) {
          f.attackFrame--;
          if (f.attackFrame === 0) f.state = f.isGrounded ? 'IDLE' : 'JUMP';
        }
        // Still apply gravity so airborne fighters don't float
        if (!f.isGrounded) {
          f.vy -= 22 * delta;
          f.y += f.vy * delta;
          if (f.y <= 0) { f.y = 0; f.vy = 0; f.isGrounded = true; if (f.state === 'JUMP') f.state = 'IDLE'; }
        }
        f.updateTransform();
      });
      // Fall through to projectile/particle update (no return here)
    }

    // Skip player input & hitbox resolution during hitstop
    if (!inHitstop) {

    // ------------------------------------------------------------------------
    // P1 INPUT CONTROLS (WASD + J/K/U/I/O/L)
    // ------------------------------------------------------------------------
    if (p1.state !== 'HITSTUN' && p1.state !== 'KNOCKDOWN' && p1.state !== 'SHAKTI' && p1.state !== 'GUARD_CRUSH' && p1.state !== 'WIN') {
      const canAct = p1.state !== 'ATTACK' && p1.state !== 'SPECIAL';

      if (canAct) {
        if (keys['KeyA']) {
          p1.vx = -p1.config.stats.speed;
          p1.state = p1.facingRight ? 'WALK_BACK' : 'WALK_FWD';
        } else if (keys['KeyD']) {
          p1.vx = p1.config.stats.speed;
          p1.state = p1.facingRight ? 'WALK_FWD' : 'WALK_BACK';
        } else {
          p1.vx = 0;
          if (p1.isGrounded && p1.state !== 'CROUCH') p1.state = 'IDLE';
        }

        // Jump
        if (keys['KeyW'] && p1.isGrounded) {
          p1.vy = 8.8;
          p1.isGrounded = false;
          p1.state = 'JUMP';
        }

        // Crouch
        if (keys['KeyS'] && p1.isGrounded) {
          p1.state = 'CROUCH';
          p1.vx = 0;
        }

        // Auto-block logic: holding back while opponent attacks
        const isHoldingBack = p1.facingRight ? keys['KeyA'] : keys['KeyD'];
        if (isHoldingBack && (p2.state === 'ATTACK' || p2.state === 'SPECIAL' || p2.state === 'SHAKTI')) {
          p1.state = 'BLOCK';
        }

        // Attack triggers
        if (keys['KeyJ']) executeAttack(p1, 'punch');
        else if (keys['KeyK']) executeAttack(p1, 'kick');
        else if (keys['KeyU']) executeAttack(p1, 'heavy');
        else if (keys['KeyI']) executeGrab(p1, p2, onRoundWin);
        else if (keys['KeyO'] && p1.specialCooldown <= 0) executeSpecial(p1, p2, onRoundWin);
        else if ((keys['KeyL'] || keys['Space']) && p1.shakti >= 100) executeShakti(p1, p2, onRoundWin);
      }
    }

    // ------------------------------------------------------------------------
    // P2 INPUT OR CPU AI CONTROLS
    // ------------------------------------------------------------------------
    if (t.gameMode === '2P') {
      if (p2.state !== 'HITSTUN' && p2.state !== 'KNOCKDOWN' && p2.state !== 'SHAKTI' && p2.state !== 'GUARD_CRUSH' && p2.state !== 'WIN') {
        const canAct2 = p2.state !== 'ATTACK' && p2.state !== 'SPECIAL';
        if (canAct2) {
          if (keys['ArrowLeft']) {
            p2.vx = -p2.config.stats.speed;
            p2.state = p2.facingRight ? 'WALK_BACK' : 'WALK_FWD';
          } else if (keys['ArrowRight']) {
            p2.vx = p2.config.stats.speed;
            p2.state = p2.facingRight ? 'WALK_FWD' : 'WALK_BACK';
          } else {
            p2.vx = 0;
            if (p2.isGrounded && p2.state !== 'CROUCH') p2.state = 'IDLE';
          }

          if (keys['ArrowUp'] && p2.isGrounded) {
            p2.vy = 8.8;
            p2.isGrounded = false;
            p2.state = 'JUMP';
          }
          if (keys['ArrowDown'] && p2.isGrounded) {
            p2.state = 'CROUCH';
            p2.vx = 0;
          }

          const isHoldingBack2 = p2.facingRight ? keys['ArrowLeft'] : keys['ArrowRight'];
          if (isHoldingBack2 && (p1.state === 'ATTACK' || p1.state === 'SPECIAL' || p1.state === 'SHAKTI')) {
            p2.state = 'BLOCK';
          }

          if (keys['Numpad1'] || keys['Digit7']) executeAttack(p2, 'punch');
          else if (keys['Numpad2'] || keys['Digit8']) executeAttack(p2, 'kick');
          else if (keys['Numpad4'] || keys['Digit9']) executeAttack(p2, 'heavy');
          else if (keys['Numpad5'] || keys['Digit0']) executeGrab(p2, p1, onRoundWin);
          else if ((keys['Numpad6'] || keys['Digit6']) && p2.specialCooldown <= 0) executeSpecial(p2, p1, onRoundWin);
          else if ((keys['Numpad3'] || keys['Enter']) && p2.shakti >= 100) executeShakti(p2, p1, onRoundWin);
        }
      }
    } else {
      // Intelligent CPU Fighter AI
      runCpuCombatAI(p2, p1, t.difficulty, onRoundWin, delta);
    }

    // ------------------------------------------------------------------------
    // PHYSICS INTEGRATION, PUSHBOX & BOUNDARY CLAMPING
    // ------------------------------------------------------------------------
    [p1, p2].forEach((f) => {
      const opp = f === p1 ? p2 : p1;

      // Always turn to face opponent
      if (f.state !== 'ATTACK' && f.state !== 'SPECIAL' && f.state !== 'SHAKTI' && f.state !== 'KNOCKDOWN') {
        f.facingRight = f.x < opp.x;
      }

      // Gravity integration
      if (!f.isGrounded) {
        f.vy -= 22 * delta; // Realistic 22 m/s^2 fighting game gravity
        f.y += f.vy * delta;
        if (f.y <= 0) {
          f.y = 0;
          f.vy = 0;
          f.isGrounded = true;
          if (f.state === 'JUMP') f.state = 'IDLE';
        }
      }

      // Horizontal velocity
      f.x += f.vx * delta;

      // Wall Bounce Slam at arena perimeter (±8.1m)
      if (f.x <= -8.1 || f.x >= 8.1) {
        if (Math.abs(f.vx) > 3.0) {
          f.vx = -f.vx * 0.65; // bounce back into the arena
          f.vy = Math.max(f.vy, 4.6); // pop up for airborne juggle
          f.isGrounded = false;
          t.shake = 0.5;
          spawn3DHitVFX(f.x, 1.4, true, false);
          if (soundRef.current) soundRef.current.playHeavyHit();
        }
        f.x = Math.max(-8.15, Math.min(8.15, f.x));
      }

      // Timers & cooldowns
      if (f.state === 'GUARD_CRUSH') {
        f.guardCrushTimer -= delta;
        f.vx = 0;
        if (f.guardCrushTimer <= 0) {
          f.state = f.isGrounded ? 'IDLE' : 'JUMP';
          f.guard = 40; // recovers with partial guard
        }
      } else if (f.state !== 'BLOCK') {
        // Regenerate guard meter when not blocking
        if (f.guard < 100) {
          f.guard = Math.min(100, f.guard + 14 * delta);
        }
      }

      if (f.specialCooldown > 0) {
        f.specialCooldown -= delta;
      }
      if (f.hitstopTimer > 0) {
        f.hitstopTimer -= delta;
      }
      if (f.swingTrailTimer > 0) {
        f.swingTrailTimer -= delta;
      }
      if (f.attackFrame > 0) {
        f.attackFrame--;
        if (f.attackFrame === 0) f.state = f.isGrounded ? 'IDLE' : 'JUMP';
      }
      if (f.hitstunTimer > 0) {
        f.hitstunTimer -= delta;
        if (f.hitstunTimer <= 0) f.state = f.isGrounded ? 'IDLE' : 'JUMP';
      }
      if (f.invincibleTimer > 0) f.invincibleTimer -= delta;
      if (f.comboTimer > 0) {
        f.comboTimer -= delta;
        if (f.comboTimer <= 0) f.comboCount = 0;
      }

      f.updateTransform();
      f.updateAnimation(delta);
    });

    // Pushbox Collision: Fighters cannot pass through each other!
    const dist = Math.abs(p1.x - p2.x);
    const minPushDist = 0.88;
    if (dist < minPushDist && Math.abs(p1.y - p2.y) < 1.2) {
      const overlap = (minPushDist - dist) * 0.5;
      if (p1.x < p2.x) {
        p1.x = Math.max(-8.2, p1.x - overlap);
        p2.x = Math.min(8.2, p2.x + overlap);
      } else {
        p1.x = Math.min(8.2, p1.x + overlap);
        p2.x = Math.max(-8.2, p2.x - overlap);
      }
      p1.updateTransform();
      p2.updateTransform();
    }

    // Resolve Attacks Hitboxes
    checkHitboxOverlap(p1, p2, onRoundWin);
    checkHitboxOverlap(p2, p1, onRoundWin);

    } // end if (!inHitstop)

    // ------------------------------------------------------------------------
    // PROJECTILE PHYSICS & COLLISION (always runs — not frozen by hitstop)
    // ------------------------------------------------------------------------
    for (let i = t.projectiles.length - 1; i >= 0; i--) {
      const p = t.projectiles[i];
      p.life -= delta;

      if (p.isWave) {
        p.time = (p.time || 0) + delta;
        p.mesh.position.x += p.vx * delta;
        p.mesh.position.y = p.baseY + Math.sin(p.time * 14) * 0.45;
        p.mesh.rotation.z += 12 * delta;
      } else if (p.isTrap) {
        p.mesh.rotation.y += 2 * delta;
      } else if (p.isBeam) {
        if (p.mesh.material) p.mesh.material.opacity = Math.max(0.2, p.life * 2.2);
      } else {
        p.mesh.position.x += p.vx * delta;
        p.mesh.rotation.x += 15 * delta;
        p.mesh.rotation.y += 12 * delta;
      }

      // Check collision against opponent
      const target = p.owner === p1 ? p2 : p1;
      const pDist = Math.abs(p.mesh.position.x - target.x);
      const pVertDist = Math.abs(p.mesh.position.y - (1.1 + target.y));

      const hitThreshold = p.isBeam ? 4.8 : p.isTrap ? 0.85 : 0.65;
      const hitVertThreshold = p.isBeam ? 0.9 : p.isTrap ? 0.6 : 0.75;

      if (pDist < hitThreshold && pVertDist < hitVertThreshold && target.invincibleTimer <= 0) {
        // Projectile Impact!
        const isBlocked = target.state === 'BLOCK';
        if (isBlocked) {
          target.guard = Math.max(0, target.guard - (p.guardDmg || 25));
          target.hp = Math.max(0, target.hp - 2.5);
          target.vx = p.vx > 0 ? 2.5 : -2.5;

          if (target.guard <= 0) {
            target.state = 'GUARD_CRUSH';
            target.guardCrushTimer = 2.4;
            t.shake = 0.6;
            setComboBanner('GUARD CRUSH! DIZZY!');
            setTimeout(() => setComboBanner(null), 1400);
            if (soundRef.current) soundRef.current.playGuardCrush();
          } else {
            if (soundRef.current) soundRef.current.playBlock();
          }
        } else {
          target.hp = Math.max(0, target.hp - p.damage);
          target.state = 'HITSTUN';
          target.hitstunTimer = 0.55;
          target.vx = (p.vx > 0 || (p.isTrap && p.mesh.position.x < target.x)) ? 4.5 : -4.5;
          target.vy = 3.5;
          target.isGrounded = false;
          t.shake = 0.45;
          if (soundRef.current) soundRef.current.playHeavyHit();
        }

        spawn3DHitVFX(target.x, 1.2 + target.y, true, isBlocked);
        if (target.hp <= 0) onRoundWin(p.owner === p1 ? 'P1' : 'P2');

        // Remove projectile
        t.scene.remove(p.mesh);
        if (p.mesh.geometry) p.mesh.geometry.dispose();
        t.projectiles.splice(i, 1);
        continue;
      }

      // Boundary removal or expiration
      if (p.life <= 0 || Math.abs(p.mesh.position.x) > 9.2) {
        t.scene.remove(p.mesh);
        if (p.mesh.geometry) p.mesh.geometry.dispose();
        t.projectiles.splice(i, 1);
      }
    }

    // Particle FX Simulation (also called during hitstop)
    for (let i = t.particles.length - 1; i >= 0; i--) {
      const pt = t.particles[i];
      if (pt.isRing) {
        pt.mesh.scale.x += (pt.scaleSpeed || 8.5) * delta;
        pt.mesh.scale.y += (pt.scaleSpeed || 8.5) * delta;
        if (pt.mesh.material) pt.mesh.material.opacity = pt.life;
      } else {
        pt.mesh.position.x += pt.vx * delta;
        pt.mesh.position.y += pt.vy * delta;
        pt.mesh.position.z += pt.vz * delta;
        pt.vy -= 9.8 * delta;
        pt.mesh.scale.set(pt.life, pt.life, pt.life);
      }
      pt.life -= pt.decay;
      if (pt.life <= 0) {
        t.scene.remove(pt.mesh);
        pt.mesh.geometry.dispose();
        t.particles.splice(i, 1);
      }
    }

    // Screen Shake decay
    if (t.shake > 0) {
      t.shake *= 0.88;
      if (t.shake < 0.02) t.shake = 0;
    }

    // Synchronize HUD React States
    setP1Hp(Math.round(p1.hp));
    setP2Hp(Math.round(p2.hp));
    setP1Guard(Math.round(p1.guard));
    setP2Guard(Math.round(p2.guard));
    setP1Shakti(Math.round(p1.shakti));
    setP2Shakti(Math.round(p2.shakti));
    setP1SpecialCooldown(Math.max(0, Number(p1.specialCooldown.toFixed(1))));
  };

  const executeAttack = (f, type) => {
    f.state = 'ATTACK';
    f.attackType = type;
    f.attackFrame = type === 'punch' ? 14 : type === 'kick' ? 18 : 26;
    f.hasHitThisAttack = false;
    f.swingTrailTimer = type === 'heavy' ? 0.35 : 0.22;
    if (soundRef.current) {
      if (type === 'punch') soundRef.current.playPunch();
      else if (type === 'kick') soundRef.current.playKick();
      else soundRef.current.playWhoosh();
    }
  };

  const executeGrab = (attacker, defender, onRoundWin) => {
    const dist = Math.abs(attacker.x - defender.x);
    if (dist < 1.25 && Math.abs(attacker.y - defender.y) < 0.6) {
      attacker.state = 'ATTACK';
      attacker.attackType = 'grab';
      attacker.attackFrame = 24;

      defender.hp = Math.max(0, defender.hp - 16 * attacker.config.stats.power);
      defender.state = 'KNOCKDOWN';
      defender.hitstunTimer = 0.8;
      defender.vx = attacker.facingRight ? 4.5 : -4.5;
      defender.vy = 4.0;
      defender.isGrounded = false;

      attacker.shakti = Math.min(100, attacker.shakti + 15);
      threeRef.current.shake = 0.45;
      spawn3DHitVFX(defender.x, 1.2, true, false);

      if (soundRef.current) soundRef.current.playKick();
      if (defender.hp <= 0) onRoundWin(attacker === threeRef.current.p1 ? 'P1' : 'P2');
    }
  };

  const executeSpecial = (attacker, defender, onRoundWin) => {
    if (attacker.specialCooldown > 0) return;
    if (attacker.state === 'HITSTUN' || attacker.state === 'KNOCKDOWN' || attacker.state === 'SHAKTI' || attacker.state === 'GUARD_CRUSH') return;

    attacker.state = 'SPECIAL';
    attacker.attackFrame = 28;
    attacker.specialCooldown = 3.5;
    attacker.hasHitThisAttack = false;
    attacker.swingTrailTimer = 0.4;
    threeRef.current.shake = 0.35;

    if (soundRef.current) soundRef.current.playSpecial();

    const t = threeRef.current;
    const scene = t.scene;
    if (!scene) return;

    const charId = attacker.config.id;
    const dir = attacker.facingRight ? 1 : -1;

    if (charId === 'dean_detain') {
      // 1. Chalk Shuriken Barrage: 2 fast spinning white cylinder chalk projectiles
      for (let i = 0; i < 2; i++) {
        setTimeout(() => {
          if (!attacker || attacker.state === 'HITSTUN' || !t.scene) return;
          const chalkGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.32, 8);
          chalkGeo.rotateZ(Math.PI / 2);
          const chalkMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.9,
            emissive: 0x94a3b8,
            emissiveIntensity: 0.3,
          });
          const chalk = new THREE.Mesh(chalkGeo, chalkMat);
          chalk.position.set(attacker.x + dir * 0.7, 1.25 + (i === 0 ? 0.15 : -0.15), 0);
          scene.add(chalk);
          t.projectiles.push({
            mesh: chalk,
            owner: attacker,
            vx: dir * 11.5,
            vy: 0,
            damage: 13,
            guardDmg: 32,
            life: 1.2,
            type: 'chalk',
          });
          if (soundRef.current) soundRef.current.playWhoosh();
        }, i * 140);
      }
    } else if (charId === 'math_matrix') {
      // 2. Fourier Sine Wave: glowing cyan torus oscillating vertically as a traveling wave
      const waveGeo = new THREE.TorusGeometry(0.35, 0.08, 12, 24);
      waveGeo.rotateY(Math.PI / 2);
      const waveMat = new THREE.MeshBasicMaterial({
        color: 0x06b6d4,
        wireframe: true,
      });
      const waveMesh = new THREE.Mesh(waveGeo, waveMat);
      waveMesh.position.set(attacker.x + dir * 0.8, 1.2, 0);
      scene.add(waveMesh);
      t.projectiles.push({
        mesh: waveMesh,
        owner: attacker,
        vx: dir * 9.5,
        vy: 0,
        baseY: 1.2,
        time: 0,
        isWave: true,
        damage: 17,
        guardDmg: 38,
        life: 1.4,
        type: 'sine_wave',
      });
      if (soundRef.current) soundRef.current.playWhoosh();
    } else if (charId === 'lab_incharge') {
      // 3. Lathe Cyclone Rush: high-speed forward charge spinning with heavy pipe wrench
      attacker.vx = dir * 8.5;
      attacker.attackFrame = 32;
      attacker.hasHitThisAttack = false;
      if (soundRef.current) soundRef.current.playWhoosh();
    } else if (charId === 'dsa_wizard') {
      // 4. NullPointer Teleport Behind: Disappears in cyan glitch particles & appears behind opponent!
      spawn3DHitVFX(attacker.x, 1.2, true, true);
      setTimeout(() => {
        if (!attacker || !defender || attacker.state === 'HITSTUN') return;
        const targetX = Math.max(-8.0, Math.min(8.0, defender.x + (defender.facingRight ? -1.35 : 1.35)));
        attacker.x = targetX;
        attacker.facingRight = attacker.x < defender.x;
        attacker.updateTransform();
        spawn3DHitVFX(attacker.x, 1.2, true, true);
        executeAttack(attacker, 'punch');
      }, 160);
    } else if (charId === 'viva_examiner') {
      // 5. Exam Paper Mine Trap: Drops 2 spinning question paper traps on stage
      for (let i = 0; i < 2; i++) {
        const paperGeo = new THREE.PlaneGeometry(0.35, 0.45);
        paperGeo.rotateX(-Math.PI / 2);
        const paperMat = new THREE.MeshBasicMaterial({
          color: 0xf1f5f9,
          side: THREE.DoubleSide,
        });
        const paper = new THREE.Mesh(paperGeo, paperMat);
        const trapX = Math.max(-7.8, Math.min(7.8, attacker.x + dir * (1.6 + i * 1.5)));
        paper.position.set(trapX, 0.04, 0);
        scene.add(paper);
        t.projectiles.push({
          mesh: paper,
          owner: attacker,
          vx: 0,
          vy: 0,
          isTrap: true,
          damage: 16,
          guardDmg: 35,
          life: 4.8,
          type: 'exam_trap',
        });
      }
      if (soundRef.current) soundRef.current.playWhoosh();
    } else if (charId === 'secret_vc') {
      // 6. Convocation Ray: wide golden horizontal beam cylinder across the stage
      const beamGeo = new THREE.CylinderGeometry(0.28, 0.28, 9.5, 16);
      beamGeo.rotateZ(Math.PI / 2);
      const beamMat = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0.85,
      });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.set(attacker.x + dir * 4.8, 1.25, 0);
      scene.add(beam);
      t.projectiles.push({
        mesh: beam,
        owner: attacker,
        vx: 0,
        vy: 0,
        isBeam: true,
        damage: 24,
        guardDmg: 55,
        life: 0.45,
        type: 'convocation_beam',
      });
      threeRef.current.shake = 0.65;
      if (soundRef.current) soundRef.current.playHeavyHit();
    }
  };

  const executeShakti = (f, opponent, onRoundWin) => {
    f.state = 'SHAKTI';
    f.shakti = 0;
    f.attackFrame = 48;
    threeRef.current.shake = 0.85;
    if (soundRef.current) soundRef.current.playShakti();

    setTimeout(() => {
      const dmg = 38 * f.config.stats.power;
      opponent.hp = Math.max(0, opponent.hp - dmg);
      opponent.state = 'HITSTUN';
      opponent.hitstunTimer = 0.95;
      opponent.vx = f.facingRight ? 9 : -9;
      opponent.vy = 6.5;
      opponent.isGrounded = false;

      spawn3DHitVFX(opponent.x, 1.4, true, false);
      if (soundRef.current) soundRef.current.playHeavyHit();
      if (opponent.hp <= 0) onRoundWin(f === threeRef.current.p1 ? 'P1' : 'P2');
    }, 400);
  };

  const checkHitboxOverlap = (attacker, defender, onRoundWin) => {
    if (attacker.state !== 'ATTACK' && attacker.state !== 'SPECIAL') return;
    if (attacker.hasHitThisAttack) return;
    if (defender.invincibleTimer > 0) return;

    // Frame active check: active window is frames 3..maxFrame
    // punch=14, kick=18, heavy=26 — use type to determine max startup frame
    const maxStartupFrame = attacker.attackType === 'punch' ? 14 : attacker.attackType === 'kick' ? 18 : 26;
    if (attacker.state === 'ATTACK' && (attacker.attackFrame > maxStartupFrame || attacker.attackFrame < 3)) return;

    const reach = (attacker.attackType === 'punch' ? 1.15 : attacker.attackType === 'kick' ? 1.45 : 1.75) * (attacker.config.stats.range / 4.0);
    const isFacing = attacker.facingRight ? defender.x > attacker.x : defender.x < attacker.x;
    const dist = Math.abs(attacker.x - defender.x);
    const vertDist = Math.abs(attacker.y - defender.y);

    if (isFacing && dist < reach && vertDist < 1.1) {
      attacker.hasHitThisAttack = true;
      const isBlocked = defender.state === 'BLOCK';

      if (isBlocked) {
        // Guard Damage & Block Stun
        const guardDamage = attacker.attackType === 'punch' ? 14 : attacker.attackType === 'kick' ? 22 : 36;
        defender.guard = Math.max(0, defender.guard - guardDamage);
        defender.hp = Math.max(0, defender.hp - 1.5); // Minimal chip damage
        defender.vx = attacker.facingRight ? 2.2 : -2.2;

        if (defender.guard <= 0) {
          // GUARD CRUSH TRIGGER!
          defender.state = 'GUARD_CRUSH';
          defender.guardCrushTimer = 2.4;
          defender.vx = attacker.facingRight ? 3.5 : -3.5;
          threeRef.current.shake = 0.6;
          spawn3DHitVFX(defender.x, 1.2 + defender.y, true, true);
          if (soundRef.current) soundRef.current.playGuardCrush();
          setComboBanner('GUARD CRUSH! DIZZY!');
          setTimeout(() => setComboBanner(null), 1400);
        } else {
          if (soundRef.current) soundRef.current.playBlock();
          spawn3DHitVFX(defender.x, 1.2 + defender.y, false, true);
        }
      } else {
        // Clean Hit with Hitstop micro-freeze!
        const isHeavy = attacker.attackType === 'heavy';
        threeRef.current.hitstop = isHeavy ? 0.10 : 0.06;
        attacker.hitstopTimer = isHeavy ? 0.12 : 0.07;
        defender.hitstopTimer = isHeavy ? 0.12 : 0.07;

        const baseDmg = attacker.attackType === 'punch' ? 7.5 : attacker.attackType === 'kick' ? 12 : 18;
        const dmg = baseDmg * attacker.config.stats.power;
        defender.hp = Math.max(0, defender.hp - dmg);

        // Airborne Juggle vs Grounded Knockback
        if (!defender.isGrounded && defender.y > 0.2) {
          defender.state = 'HITSTUN';
          defender.vy = Math.max(defender.vy, 3.8) + 1.2;
          defender.vx = attacker.facingRight ? 2.8 : -2.8;
          defender.hitstunTimer = 0.45;
        } else {
          defender.state = isHeavy ? 'KNOCKDOWN' : 'HITSTUN';
          defender.hitstunTimer = isHeavy ? 0.65 : 0.32;
          defender.vx = attacker.facingRight ? (isHeavy ? 5.8 : 3.0) : (isHeavy ? -5.8 : -3.0);
          if (isHeavy) {
            defender.vy = 4.8;
            defender.isGrounded = false;
          }
        }

        // Combo & Shakti meter gain
        attacker.comboCount++;
        attacker.shakti = Math.min(100, attacker.shakti + 10);
        defender.shakti = Math.min(100, defender.shakti + 14);
        threeRef.current.shake = isHeavy ? 0.48 : 0.24;

        if (attacker.comboCount > 1) {
          setComboBanner(`${attacker.comboCount} HITS! ${attacker.comboCount >= 4 ? 'CGPA 10.0!' : 'EXCELLENT!'}`);
          setTimeout(() => setComboBanner(null), 1200);
        }

        spawn3DHitVFX(defender.x, 1.2 + defender.y, isHeavy, false);
        if (soundRef.current) {
          if (isHeavy) soundRef.current.playHeavyHit();
          else if (attacker.attackType === 'kick') soundRef.current.playKick();
          else soundRef.current.playPunch();
        }

        if (defender.hp <= 0) onRoundWin(attacker === threeRef.current.p1 ? 'P1' : 'P2');
      }
    }
  };

  const runCpuCombatAI = (cpu, player, diff, onRoundWin, delta) => {
    if (cpu.state === 'HITSTUN' || cpu.state === 'KNOCKDOWN' || cpu.state === 'SHAKTI' || cpu.state === 'GUARD_CRUSH' || cpu.state === 'WIN') {
      return;
    }

    // Initialize AI Brain Memory
    if (!cpu.aiMemory) {
      cpu.aiMemory = {
        decisionTimer: 0,
        currentIntent: 'SPACING',
        targetDistance: 1.6,
        playerTurtleFrames: 0,
        reactionBuffer: 0,
        comboQueue: null,
        antiAirCooldown: 0,
      };
    }

    const mem = cpu.aiMemory;
    const dist = Math.abs(cpu.x - player.x);
    const isPlayerJumping = !player.isGrounded && player.y > 0.45;
    const isPlayerAttacking = player.state === 'ATTACK' || player.state === 'SPECIAL';
    const isPlayerBlocking = player.state === 'BLOCK';
    const isPlayerHitstun = player.state === 'HITSTUN' || player.state === 'KNOCKDOWN';
    const isPlayerGuardCrush = player.state === 'GUARD_CRUSH';

    // Tick cooldown timers
    if (mem.decisionTimer > 0) mem.decisionTimer -= delta;
    if (mem.reactionBuffer > 0) mem.reactionBuffer -= delta;
    if (mem.antiAirCooldown > 0) mem.antiAirCooldown -= delta;

    // Track player turtling behind block
    if (isPlayerBlocking) {
      mem.playerTurtleFrames++;
    } else {
      mem.playerTurtleFrames = Math.max(0, mem.playerTurtleFrames - 2);
    }

    // Difficulty parameters (balanced for fair, fun arcade combat)
    const isHard = diff === 'HARD';
    const isNormal = diff === 'NORMAL';
    const blockThreshold = isHard ? 0.65 : isNormal ? 0.16 : 0.05; // Normal CPU only blocks ~16% of hits
    const turtleGrabLimit = isHard ? 28 : isNormal ? 80 : 150; // frames of block before CPU grabs

    // Archetype traits
    const archId = cpu.config.id;
    const isZoner = archId === 'math_matrix' || archId === 'viva_examiner';
    const isRushdown = archId === 'dsa_wizard';
    const isGrappler = archId === 'dean_detain' || archId === 'lab_incharge';
    const isBoss = archId === 'secret_vc';

    // Base preferred spacing by archetype
    const baseSpacing = isZoner ? 2.4 : isRushdown ? 1.3 : isGrappler ? 1.4 : isBoss ? 1.6 : 1.5;

    // ----------------------------------------------------------------------
    // 0. PUNISH GUARD CRUSH (Stunned Opponent)
    // ----------------------------------------------------------------------
    if (isPlayerGuardCrush && cpu.state !== 'ATTACK' && cpu.state !== 'SPECIAL') {
      const crushPunishRoll = isHard ? 0.95 : isNormal ? 0.35 : 0.12;
      if (Math.random() < crushPunishRoll) {
        if (cpu.shakti >= 100 && isHard) {
          executeShakti(cpu, player, onRoundWin);
          return;
        }
        if (dist < 1.4) {
          executeAttack(cpu, isHard ? 'heavy' : 'punch');
          return;
        } else {
          cpu.vx = cpu.x < player.x ? cpu.config.stats.speed : -cpu.config.stats.speed;
          cpu.state = cpu.facingRight ? 'WALK_FWD' : 'WALK_BACK';
          return;
        }
      }
    }

    // ----------------------------------------------------------------------
    // 1. COMBO CANCEL / HIT CONFIRM EXECUTION
    // ----------------------------------------------------------------------
    if (mem.comboQueue && cpu.state === 'ATTACK' && cpu.hasHitThisAttack) {
      const nextMove = mem.comboQueue;
      mem.comboQueue = null;
      if (nextMove === 'shakti' && cpu.shakti >= 100) {
        executeShakti(cpu, player, onRoundWin);
        return;
      } else if (nextMove === 'kick' || nextMove === 'heavy') {
        executeAttack(cpu, nextMove);
        return;
      }
    }

    // ----------------------------------------------------------------------
    // 2. SIGNATURE SPECIAL MOVE EXECUTION (gated to decision timer)
    // ----------------------------------------------------------------------
    if (cpu.specialCooldown <= 0 && cpu.state !== 'ATTACK' && cpu.state !== 'SPECIAL' && mem.decisionTimer <= 0) {
      const specialChance = isHard ? 0.15 : isNormal ? 0.04 : 0.01;
      const shouldSpecial = Math.random() < specialChance;
      if (shouldSpecial) {
        if (isZoner && dist > 1.8) {
          executeSpecial(cpu, player, onRoundWin);
          return;
        } else if ((isRushdown || isGrappler) && dist < 2.8) {
          executeSpecial(cpu, player, onRoundWin);
          return;
        } else if (isBoss && dist > 1.5) {
          executeSpecial(cpu, player, onRoundWin);
          return;
        }
      }
    }

    // ----------------------------------------------------------------------
    // 3. SMART SHAKTI SUPER EXECUTION (Hit-Confirm or Desperation)
    // ----------------------------------------------------------------------
    if (cpu.shakti >= 100) {
      const playerWhiffingHeavy = isPlayerAttacking && player.attackType === 'heavy' && player.attackFrame < 8 && !player.hasHitThisAttack;
      const cpuDesperation = cpu.hp < 28 && !isPlayerBlocking && dist < 3.0;

      if (isPlayerHitstun || playerWhiffingHeavy || (isHard && cpuDesperation)) {
        executeShakti(cpu, player, onRoundWin);
        return;
      }
    }

    // ----------------------------------------------------------------------
    // 4. ANTI-AIR REACTION (Knock jumping opponent out of the air)
    // ----------------------------------------------------------------------
    if (isPlayerJumping && dist < 2.4 && mem.antiAirCooldown <= 0) {
      const shouldAntiAir = isHard ? Math.random() < 0.75 : isNormal ? Math.random() < 0.18 : Math.random() < 0.05;
      if (shouldAntiAir && cpu.isGrounded && cpu.state !== 'ATTACK' && cpu.state !== 'SPECIAL') {
        mem.antiAirCooldown = 0.8;
        cpu.vx = 0;
        if (Math.random() < 0.65) executeAttack(cpu, 'kick');
        else executeAttack(cpu, 'heavy');
        return;
      }
    }

    // ----------------------------------------------------------------------
    // 5. GUARD BREAK / COMMAND GRAB vs TURTLING PLAYERS
    // ----------------------------------------------------------------------
    if (mem.playerTurtleFrames > turtleGrabLimit && cpu.isGrounded && cpu.state !== 'ATTACK' && cpu.state !== 'SPECIAL') {
      if (dist < 1.25) {
        executeGrab(cpu, player, onRoundWin);
        mem.playerTurtleFrames = 0;
        return;
      } else {
        cpu.vx = cpu.x < player.x ? cpu.config.stats.speed * 1.15 : -cpu.config.stats.speed * 1.15;
        cpu.state = cpu.facingRight ? 'WALK_FWD' : 'WALK_BACK';
        return;
      }
    }

    // ----------------------------------------------------------------------
    // 6. REACTIVE AUTO-BLOCKING (significantly lowered on Normal so player hits connect)
    // ----------------------------------------------------------------------
    if (isPlayerAttacking && !player.hasHitThisAttack) {
      const reach = (player.attackType === 'punch' ? 1.15 : player.attackType === 'kick' ? 1.45 : 1.75) * (player.config.stats.range / 4.0);
      if (dist < reach + 0.35) {
        if (Math.random() < blockThreshold && cpu.state !== 'ATTACK') {
          cpu.vx = 0;
          cpu.state = 'BLOCK';
          return;
        }
      }
    }

    // ----------------------------------------------------------------------
    // 7. WHIFF PUNISH SYSTEM (relaxed on Normal with human reaction gap)
    // ----------------------------------------------------------------------
    const isPlayerWhiffing = isPlayerAttacking && !player.hasHitThisAttack && player.attackFrame < 8 && dist < 2.6;
    if (isPlayerWhiffing && cpu.isGrounded && cpu.state !== 'ATTACK') {
      const shouldPunish = isHard ? Math.random() < 0.70 : isNormal ? Math.random() < 0.14 : Math.random() < 0.04;
      if (shouldPunish) {
        cpu.vx = cpu.x < player.x ? cpu.config.stats.speed : -cpu.config.stats.speed;
        if (dist < 1.3) {
          executeAttack(cpu, isHard ? 'heavy' : 'punch');
          if (isHard) mem.comboQueue = 'kick';
        } else {
          executeAttack(cpu, 'kick');
        }
        return;
      }
    }

    // ----------------------------------------------------------------------
    // 8. FOOTSIES, SPACING & HUMAN-LIKE DECISION PACING
    // ----------------------------------------------------------------------
    if (cpu.state === 'ATTACK') return;

    if (mem.decisionTimer <= 0) {
      // Natural human reaction hesitation delay (0.40 - 0.75s on Normal)
      mem.decisionTimer = isHard ? 0.15 + Math.random() * 0.15 : 0.42 + Math.random() * 0.32;
      const jitter = (Math.random() - 0.5) * 0.6;
      mem.targetDistance = Math.max(1.1, baseSpacing + jitter);

      const roll = Math.random();
      if (roll < 0.45) mem.currentIntent = 'SPACING';
      else if (roll < 0.72) mem.currentIntent = 'ADVANCE';
      else if (roll < 0.88) mem.currentIntent = 'BAIT_STEP';
      else mem.currentIntent = isRushdown ? 'ADVANCE' : 'SPACING';
    }

    const speed = cpu.config.stats.speed;
    const desired = mem.currentIntent === 'BAIT_STEP' ? mem.targetDistance + 0.7 : mem.targetDistance;

    if (dist > desired + 0.35) {
      cpu.vx = cpu.x < player.x ? speed * 0.95 : -speed * 0.95;
      cpu.state = cpu.facingRight ? 'WALK_FWD' : 'WALK_BACK';
    } else if (dist < desired - 0.35) {
      cpu.vx = cpu.x < player.x ? -speed * 0.8 : speed * 0.8;
      cpu.state = cpu.facingRight ? 'WALK_BACK' : 'WALK_FWD';
    } else {
      cpu.vx = 0;
      if (cpu.isGrounded) cpu.state = 'IDLE';

      const attackChance = isHard ? 0.22 : isNormal ? 0.07 : 0.02;
      if (Math.random() < attackChance) {
        const atkRoll = Math.random();

        if (dist < 1.25 && isGrappler && Math.random() < 0.35) {
          executeGrab(cpu, player, onRoundWin);
        } else if (dist < 1.3) {
          executeAttack(cpu, 'punch');
          if (isHard) {
            mem.comboQueue = Math.random() < 0.6 ? 'kick' : 'heavy';
          }
        } else if (dist < 1.8) {
          if (atkRoll < 0.65) executeAttack(cpu, 'kick');
          else executeAttack(cpu, 'heavy');
        } else if (isZoner) {
          executeAttack(cpu, 'kick');
        } else if (isRushdown && Math.random() < 0.35 && cpu.isGrounded) {
          cpu.vy = 8.8;
          cpu.isGrounded = false;
          cpu.state = 'JUMP';
        }
      }
    }
  };

  // Dynamic 2.5D Camera Tracking Both Fighters
  const updateDynamicCamera = (delta) => {
    const t = threeRef.current;
    const { camera, p1, p2, shake } = t;
    if (!camera || !p1 || !p2) return;

    // Track midpoint between fighters
    const midX = (p1.x + p2.x) * 0.5;
    const dist = Math.abs(p1.x - p2.x);
    const desiredDistance = Math.max(7.2, Math.min(13.2, dist * 0.85 + 4.8));
    const targetY = 1.45 + Math.max(0, (p1.y + p2.y) * 0.35);

    // Smooth Lerp
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, midX, delta * 4.5);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, delta * 3.5);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, desiredDistance, delta * 3.5);

    // Apply Screen Shake
    if (shake > 0) {
      camera.position.x += (Math.random() - 0.5) * shake;
      camera.position.y += (Math.random() - 0.5) * shake;
    }

    camera.lookAt(camera.position.x, 1.25, 0);
  };

  // Mobile Touch Action Trigger
  const handleTouchAction = (action) => {
    const t = threeRef.current;
    if (!t.p1) return;
    if (soundRef.current) soundRef.current.resume();

    if (action === 'punch') executeAttack(t.p1, 'punch');
    else if (action === 'kick') executeAttack(t.p1, 'kick');
    else if (action === 'heavy') executeAttack(t.p1, 'heavy');
    else if (action === 'grab') executeGrab(t.p1, t.p2, () => {});
    else if (action === 'special' && t.p1.specialCooldown <= 0) executeSpecial(t.p1, t.p2, () => {});
    else if (action === 'shakti' && t.p1.shakti >= 100) executeShakti(t.p1, t.p2, () => {});
  };

  return (
    <div className="relative w-full min-h-screen bg-slate-950 text-white flex flex-col items-center justify-start select-none font-sans overflow-x-hidden">
      {/* ==================================================================== */}
      {/* 1. TOP HEADER / TITLE BAR                                            */}
      {/* ==================================================================== */}
      <div className="w-full max-w-6xl px-4 py-3 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-sm group"
            title="Return to DTU Connect Home"
          >
            <Home size={14} className="group-hover:scale-110 transition-transform" />
            <span>Home</span>
          </Link>

          <Link
            href="/campus-game"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 border border-slate-700 transition-colors"
            title="Explore 3D DTU Campus"
          >
            <ArrowLeft size={13} />
            <span>3D Campus</span>
          </Link>

          <div className="flex items-center gap-2">
            <Swords size={20} className="text-amber-400" />
            <h1 className="text-sm sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span>Prof Showdown 2.5D</span>
              <span className="hidden md:inline text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                The Great CGPA Fight
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Launch New Window button */}
          <button
            onClick={openMatchInNewWindow}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-sky-400 border border-slate-700 hover:border-sky-500 transition-colors"
            title="Launch match in standalone window without header & footer"
          >
            <ExternalLink size={13} />
            <span>New Window</span>
          </button>

          {/* Mute Button */}
          <button
            onClick={() => {
              if (soundRef.current) setIsMuted(soundRef.current.toggleMute());
            }}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* Move List Help */}
          <button
            onClick={() => setShowMoveList(true)}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700 transition-colors"
            title="Move List & Controls"
          >
            <HelpCircle size={16} />
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. CHARACTER SELECT SCREEN                                           */}
      {/* ==================================================================== */}
      {gameState === 'SELECT' && (
        <div className="w-full max-w-5xl px-4 py-6 flex flex-col items-center gap-6">
          <div className="text-center space-y-1">
            <span className="text-xs uppercase tracking-widest font-mono text-amber-400">
              2.5D Real Three.js Fighting Game · Inspired by FightKaro
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Choose Your DTU Professor
            </h2>
            <p className="text-xs text-slate-400 max-w-lg">
              Battle through legendary faculty archetypes in true 2.5D perspective with articulated 3D character rigs, stage depth, dynamic camera, and Shakti super moves!
            </p>
          </div>

          {/* Mode & Difficulty Toggles */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-1 text-xs font-medium">
              <button
                onClick={() => setGameMode('CPU')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                  gameMode === 'CPU' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Bot size={14} />
                <span>Solo vs CPU</span>
              </button>
              <button
                onClick={() => setGameMode('2P')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                  gameMode === '2P' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users size={14} />
                <span>Local 2-Player</span>
              </button>
            </div>

            {gameMode === 'CPU' && (
              <div className="flex items-center rounded-lg bg-slate-900 border border-slate-800 p-1 text-xs font-medium">
                {['EASY', 'NORMAL', 'HARD'].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`px-2.5 py-1.5 rounded-md transition-colors ${
                      difficulty === diff ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Fighter Select Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 w-full">
            {PROF_ROSTER.map((prof) => {
              const isP1 = selectedP1.id === prof.id;
              const isP2 = selectedP2.id === prof.id;

              return (
                <div
                  key={prof.id}
                  onClick={() => {
                    if (gameMode === '2P' && isP1) setSelectedP2(prof);
                    else setSelectedP1(prof);
                  }}
                  className={`relative p-3.5 rounded-xl border flex flex-col items-center text-center cursor-pointer transition-all ${
                    isP1
                      ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/50 scale-[1.02]'
                      : isP2
                        ? 'bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/50 scale-[1.02]'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {isP1 && (
                    <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-bold">
                      P1
                    </span>
                  )}
                  {isP2 && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-blue-500 text-white text-[10px] font-bold">
                      P2
                    </span>
                  )}

                  <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-3xl mb-2 border border-slate-700">
                    {prof.avatar}
                  </div>
                  <h3 className="text-xs font-bold text-white leading-tight">{prof.name}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{prof.style}</p>
                </div>
              );
            })}
          </div>

          {/* Selected Fighter Details & Stage Selector */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
            {/* P1 Stats */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono text-amber-400">Player 1 Fighter</span>
                  <h4 className="text-base font-bold text-white">{selectedP1.name}</h4>
                  <p className="text-xs text-slate-400">{selectedP1.facultyTitle}</p>
                </div>
                <div className="text-3xl">{selectedP1.avatar}</div>
              </div>

              <p className="text-xs italic text-amber-300/80 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                {selectedP1.quote}
              </p>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Attack Power:</span>
                  <span className="font-mono text-amber-400">{Math.round(selectedP1.stats.power * 100)}%</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Movement Speed:</span>
                  <span className="font-mono text-blue-400">{selectedP1.stats.speed} m/s</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Shakti Move:</span>
                  <span className="font-semibold text-rose-400">{selectedP1.shaktiMove}</span>
                </div>
              </div>
            </div>

            {/* Stage Selector */}
            <div className="space-y-2 md:border-l md:border-slate-800 md:pl-4">
              <span className="text-[10px] uppercase font-mono text-blue-400">Battle Stage</span>
              <div className="grid grid-cols-1 gap-1.5">
                {STAGES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStage(s)}
                    className={`px-3 py-2 rounded-lg text-left text-xs transition-colors flex items-center justify-between ${
                      selectedStage.id === s.id
                        ? 'bg-blue-600/30 border border-blue-500 text-white font-medium'
                        : 'bg-slate-800/60 border border-slate-700/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div>
                      <span className="block font-semibold text-white">{s.name}</span>
                      <span className="text-[10px] text-slate-400">{s.subtitle}</span>
                    </div>
                    {selectedStage.id === s.id && <CheckCircle size={14} className="text-blue-400 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Fight Start CTA */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-lg">
            <button
              onClick={() => {
                setP1Wins(0);
                setP2Wins(0);
                setGameState('FIGHT');
              }}
              className="flex-1 w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-extrabold text-sm sm:text-base tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-rose-900/40 transition-all hover:scale-[1.02]"
            >
              <Play size={18} fill="currentColor" />
              <span>Start Match</span>
            </button>

            <button
              onClick={openMatchInNewWindow}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-white border border-amber-500/40 font-bold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.02]"
              title="Launch match in clean standalone gaming window without browser header/footer"
            >
              <ExternalLink size={16} />
              <span>Start in New Window</span>
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 3. ACTIVE FIGHT ARENA (2.5D THREE.JS VIEWPORT & ARCADE HUD)          */}
      {/* ==================================================================== */}
      {(gameState === 'FIGHT' || gameState === 'GAMEOVER') && (
        <div className="relative w-full max-w-5xl flex flex-col items-center my-auto p-2">
          {/* Arena Control Bar with Back to Home & Pause */}
          <div className="w-full flex items-center justify-between px-3 py-1.5 mb-1 bg-slate-900/90 border border-slate-800 rounded-lg text-xs backdrop-blur-md">
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors shadow-sm"
                title="Return to DTU Connect Home"
              >
                <Home size={13} />
                <span>Home</span>
              </Link>

              <button
                onClick={() => setGameState('SELECT')}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                title="Return to Character Selection"
              >
                <ArrowLeft size={13} />
                <span>Change Fighters</span>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-slate-400">
              <span className="font-semibold text-slate-200">{selectedStage.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 font-mono">
                {gameMode === 'CPU' ? `VS CPU (${difficulty})` : 'LOCAL 2-PLAYER'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsPaused((prev) => !prev)}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold"
                title="Pause / Resume Match (Key P)"
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>

              <button
                onClick={() => {
                  if (soundRef.current) setIsMuted(soundRef.current.toggleMute());
                }}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                title={isMuted ? 'Unmute Sound (M)' : 'Mute Sound (M)'}
              >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>

              <button
                onClick={() => setShowMoveList(true)}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700"
                title="View Combat Controls"
              >
                <HelpCircle size={14} />
              </button>
            </div>
          </div>

          {/* Top HUD: Health Bars, Guard Meters, Round Pips, and Timer */}
          <div className="w-full flex items-center justify-between gap-2 px-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-t-xl relative z-10">
            {/* P1 Health, Guard & Avatar */}
            <div className="flex items-center gap-2 flex-1">
              <div className="w-10 h-10 rounded-lg bg-slate-800 border-2 border-amber-500 flex items-center justify-center text-xl shrink-0 shadow-md">
                {selectedP1.avatar}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-amber-400">{selectedP1.name}</span>
                  <div className="flex gap-1">
                    {[0, 1].map((pip) => (
                      <span
                        key={pip}
                        className={`w-2.5 h-2.5 rounded-full ${pip < p1Wins ? 'bg-amber-400 ring-2 ring-amber-400/50' : 'bg-slate-700'}`}
                      />
                    ))}
                  </div>
                </div>
                {/* Health Bar (gradient drain) */}
                <div className="w-full h-3.5 bg-slate-800 rounded-sm overflow-hidden border border-slate-700 shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 transition-all duration-75"
                    style={{ width: `${Math.max(0, p1Hp)}%` }}
                  />
                </div>
                {/* Guard Bar */}
                <div className="w-full flex items-center gap-1.5 mt-0.5">
                  <span className="text-[9px] font-mono font-bold text-cyan-400">GUARD</span>
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700 shadow-inner">
                    <div
                      className={`h-full transition-all duration-75 ${
                        p1Guard > 50
                          ? 'bg-cyan-400'
                          : p1Guard > 25
                            ? 'bg-amber-400'
                            : 'bg-rose-500 animate-pulse'
                      }`}
                      style={{ width: `${Math.max(0, p1Guard)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 60s Round Timer */}
            <div className="px-4 py-1 rounded-lg bg-slate-950 border border-slate-700 text-center shrink-0 shadow-lg">
              <span className="text-2xl font-mono font-black tabular-nums text-amber-400">
                {roundTimer}
              </span>
            </div>

            {/* P2 Health, Guard & Avatar */}
            <div className="flex items-center gap-2 flex-1 flex-row-reverse">
              <div className="w-10 h-10 rounded-lg bg-slate-800 border-2 border-blue-500 flex items-center justify-center text-xl shrink-0 shadow-md">
                {selectedP2.avatar}
              </div>
              <div className="flex-1 space-y-1 text-right">
                <div className="flex justify-between text-xs font-bold flex-row-reverse">
                  <span className="text-blue-400">{selectedP2.name}</span>
                  <div className="flex gap-1">
                    {[0, 1].map((pip) => (
                      <span
                        key={pip}
                        className={`w-2.5 h-2.5 rounded-full ${pip < p2Wins ? 'bg-blue-400 ring-2 ring-blue-400/50' : 'bg-slate-700'}`}
                      />
                    ))}
                  </div>
                </div>
                {/* Health Bar */}
                <div className="w-full h-3.5 bg-slate-800 rounded-sm overflow-hidden border border-slate-700 flex justify-end shadow-inner">
                  <div
                    className="h-full bg-gradient-to-l from-rose-500 via-amber-400 to-emerald-400 transition-all duration-75"
                    style={{ width: `${Math.max(0, p2Hp)}%` }}
                  />
                </div>
                {/* Guard Bar */}
                <div className="w-full flex items-center gap-1.5 mt-0.5 flex-row-reverse">
                  <span className="text-[9px] font-mono font-bold text-cyan-400">GUARD</span>
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700 flex justify-end shadow-inner">
                    <div
                      className={`h-full transition-all duration-75 ${
                        p2Guard > 50
                          ? 'bg-cyan-400'
                          : p2Guard > 25
                            ? 'bg-amber-400'
                            : 'bg-rose-500 animate-pulse'
                      }`}
                      style={{ width: `${Math.max(0, p2Guard)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive 2.5D Three.js Viewport (Aspect ratio 16:9) */}
          <div className="relative w-full aspect-[16/9] bg-black border-x border-slate-800 overflow-hidden shadow-2xl">
            <div ref={containerRef} className="w-full h-full block" />

            {/* Banner Messages ("ROUND 1", "FIGHT!", "K.O.!") */}
            {bannerMessage && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <div className="px-8 py-3.5 rounded-2xl bg-black/80 border-2 border-amber-400 text-center shadow-2xl backdrop-blur-sm animate-pulse">
                  <span className="text-3xl sm:text-5xl font-black tracking-widest text-amber-400 font-mono">
                    {bannerMessage}
                  </span>
                </div>
              </div>
            )}

            {/* Floating Combo Counter Banner */}
            {comboBanner && (
              <div className="absolute top-6 left-8 pointer-events-none z-20 animate-bounce">
                <span className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-black text-xs sm:text-sm tracking-wider uppercase shadow-lg">
                  {comboBanner}
                </span>
              </div>
            )}

            {/* Pause Overlay */}
            {isPaused && (
              <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center gap-3.5 z-30 p-4">
                <h3 className="text-2xl font-black text-white tracking-widest font-mono">MATCH PAUSED</h3>
                <div className="flex flex-col gap-2 w-full max-w-xs text-center">
                  <button
                    onClick={() => setIsPaused(false)}
                    className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm shadow"
                  >
                    Resume Match (Key P)
                  </button>
                  <button
                    onClick={() => {
                      setIsPaused(false);
                      setP1Wins(0);
                      setP2Wins(0);
                      startFight();
                    }}
                    className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700"
                  >
                    Restart Round
                  </button>
                  <button
                    onClick={() => {
                      setIsPaused(false);
                      setGameState('SELECT');
                    }}
                    className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700"
                  >
                    Change Fighters
                  </button>
                  <Link
                    href="/"
                    className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-white font-bold text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition-colors shadow"
                  >
                    <Home size={14} />
                    <span>Back to DTU Connect Home</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Bottom HUD: Shakti Super Meters & Mobile Touch Controls */}
          <div className="w-full p-3 bg-slate-900/90 border border-slate-800 rounded-b-xl flex flex-col gap-2">
            <div className="flex items-center justify-between gap-4">
              {/* P1 Shakti Meter */}
              <div className="flex-1 space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-amber-400 flex items-center gap-1">
                    <Flame size={12} />
                    <span>CGPA SHAKTI METER</span>
                  </span>
                  <span className="font-mono text-slate-300">{p1Shakti}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className={`h-full transition-all duration-75 ${
                      p1Shakti >= 100
                        ? 'bg-gradient-to-r from-amber-400 to-rose-500 animate-pulse'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, p1Shakti)}%` }}
                  />
                </div>
              </div>

              {/* P2 Shakti Meter */}
              <div className="flex-1 space-y-1 text-right">
                <div className="flex justify-between text-[11px] font-bold flex-row-reverse">
                  <span className="text-blue-400 flex items-center gap-1">
                    <Flame size={12} />
                    <span>SHAKTI METER</span>
                  </span>
                  <span className="font-mono text-slate-300">{p2Shakti}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700 flex justify-end">
                  <div
                    className={`h-full transition-all duration-75 ${
                      p2Shakti >= 100
                        ? 'bg-gradient-to-l from-blue-400 to-rose-500 animate-pulse'
                        : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min(100, p2Shakti)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Mobile Touch Action Buttons */}
            <div className="flex md:hidden items-center justify-between gap-2 pt-2 border-t border-slate-800">
              <div className="flex gap-2">
                <button
                  onTouchStart={() => {
                    threeRef.current.keys['KeyA'] = true;
                  }}
                  onTouchEnd={() => {
                    threeRef.current.keys['KeyA'] = false;
                  }}
                  className="w-11 h-11 rounded-lg bg-slate-800 border border-slate-700 active:bg-slate-700 flex items-center justify-center font-bold text-sm"
                >
                  ◀
                </button>
                <button
                  onTouchStart={() => {
                    threeRef.current.keys['KeyD'] = true;
                  }}
                  onTouchEnd={() => {
                    threeRef.current.keys['KeyD'] = false;
                  }}
                  className="w-11 h-11 rounded-lg bg-slate-800 border border-slate-700 active:bg-slate-700 flex items-center justify-center font-bold text-sm"
                >
                  ▶
                </button>
                <button
                  onTouchStart={() => {
                    threeRef.current.keys['KeyW'] = true;
                  }}
                  onTouchEnd={() => {
                    threeRef.current.keys['KeyW'] = false;
                  }}
                  className="w-11 h-11 rounded-lg bg-slate-800 border border-slate-700 active:bg-slate-700 flex items-center justify-center font-bold text-sm"
                >
                  ▲
                </button>
              </div>

              <div className="flex gap-1.5 flex-wrap">
                <button
                  onClick={() => handleTouchAction('punch')}
                  className="px-2.5 py-2 rounded-lg bg-amber-600 active:bg-amber-500 text-slate-950 font-bold text-xs"
                >
                  Punch (J)
                </button>
                <button
                  onClick={() => handleTouchAction('kick')}
                  className="px-2.5 py-2 rounded-lg bg-rose-600 active:bg-rose-500 text-white font-bold text-xs"
                >
                  Kick (K)
                </button>
                <button
                  onClick={() => handleTouchAction('heavy')}
                  className="px-2.5 py-2 rounded-lg bg-purple-600 active:bg-purple-500 text-white font-bold text-xs"
                >
                  Heavy (U)
                </button>
                <button
                  onClick={() => handleTouchAction('special')}
                  className={`px-2.5 py-2 rounded-lg font-bold text-xs transition-all ${
                    p1SpecialCooldown <= 0
                      ? 'bg-emerald-600 active:bg-emerald-500 text-white shadow-md ring-1 ring-emerald-400'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                  title="Signature Special Move (Key O)"
                >
                  {p1SpecialCooldown <= 0 ? 'Special (O)' : `SP (${p1SpecialCooldown}s)`}
                </button>
                <button
                  onClick={() => handleTouchAction('shakti')}
                  className={`px-3 py-2 rounded-lg font-black text-xs ${
                    p1Shakti >= 100
                      ? 'bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 animate-bounce'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  SHAKTI
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 4. VICTORY / GAMEOVER MODAL                                          */}
      {/* ==================================================================== */}
      {gameState === 'GAMEOVER' && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border-2 border-amber-500 text-center space-y-4 shadow-2xl">
            <Trophy size={48} className="text-amber-400 mx-auto animate-bounce" />
            <h3 className="text-2xl font-black text-white">{matchWinner} VICTORIOUS!</h3>
            <p className="text-sm text-slate-300">
              Current Win Streak: <span className="font-mono font-bold text-amber-400">{streak}</span>
            </p>

            <div className="flex flex-col gap-2.5 pt-2">
              <div className="flex gap-2.5">
                <button
                  onClick={() => {
                    setP1Wins(0);
                    setP2Wins(0);
                    startFight();
                  }}
                  className="flex-1 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-colors shadow"
                >
                  Rematch
                </button>
                <button
                  onClick={() => setGameState('SELECT')}
                  className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-colors border border-slate-700"
                >
                  Change Fighter
                </button>
              </div>

              <Link
                href="/"
                className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors shadow"
              >
                <Home size={15} />
                <span>Back to DTU Connect Home</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 5. MOVE LIST & CONTROLS GUIDE MODAL                                  */}
      {/* ==================================================================== */}
      {showMoveList && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-lg p-5 rounded-2xl bg-slate-900 border border-slate-700 text-left space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Swords size={18} className="text-amber-400" />
                <span>Move List & Combat Mechanics</span>
              </h3>
              <button
                onClick={() => setShowMoveList(false)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
              >
                Close (ESC)
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Core Mechanics Callout */}
              <div className="p-3 rounded-lg bg-slate-950 border border-cyan-500/30 space-y-1.5">
                <span className="font-bold text-cyan-400 block mb-1">Advanced 2.5D Combat Mechanics:</span>
                <p>• <strong>Guard Meter & Guard Crush:</strong> Blocking absorbs 85% damage but degrades your Guard meter (Cyan → Amber → Flashing Red). If Guard hits 0, shield shatters and triggers a 2.4s Dizzy Stun!</p>
                <p>• <strong>Hitstop Micro-Freeze:</strong> Clean impacts freeze time for 0.06s - 0.12s for crunchy arcade weight.</p>
                <p>• <strong>Wall Bounce Slam:</strong> Knocking an opponent hard into the stage perimeter (±8.1m) bounces them back into the air!</p>
                <p>• <strong>Airborne Juggles:</strong> Hitting airborne enemies pops them up, extending combo chains.</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-bold text-amber-400 block mb-1">Player 1 (Left Side):</span>
                <p>• <strong>A / D:</strong> Walk Left / Walk Right</p>
                <p>• <strong>W:</strong> Jump (with airborne jump kicks & juggles)</p>
                <p>• <strong>S:</strong> Crouch</p>
                <p>• <strong>Hold Back (A):</strong> Auto-Block (drains Guard Meter)</p>
                <p>• <strong>J:</strong> Light Punch (Fast 4-frame jab, safe on block)</p>
                <p>• <strong>K:</strong> High Kick (Mid range, poke)</p>
                <p>• <strong>U:</strong> Heavy Strike (Launcher knockdown / wall bounce slam)</p>
                <p>• <strong>I:</strong> Close Command Grab (Bypasses guard)</p>
                <p>• <strong>O:</strong> Signature Special Move (Chalk shurikens, Fourier wave, cyclone, etc.)</p>
                <p>• <strong>L or Space:</strong> Shakti Super Move (At 100% CGPA Meter)</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-bold text-blue-400 block mb-1">Player 2 (Local 2P Mode):</span>
                <p>• <strong>Arrow Keys:</strong> Movement & Jump</p>
                <p>• <strong>Numpad 1 / 7:</strong> Punch</p>
                <p>• <strong>Numpad 2 / 8:</strong> Kick</p>
                <p>• <strong>Numpad 4 / 9:</strong> Heavy Strike</p>
                <p>• <strong>Numpad 5 / 0:</strong> Grab</p>
                <p>• <strong>Numpad 6 / 6:</strong> Signature Special Move</p>
                <p>• <strong>Numpad 3 / Enter:</strong> Shakti Super Move</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
