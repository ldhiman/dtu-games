'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CAMPUS_BOUNDARY,
  CAMPUS_PARKS,
  DTU_LAKE_DATA,
  CAMPUS_PITCHES,
  CAMPUS_ROADS,
  CAMPUS_BUILDINGS,
} from './dtuOsmData';

const MINIMAP_MAIN_ROADS = new Set([
  1075767311, 1074977781, 1074977780, 300016774, 297400779, 297400806,
  297400875, 111215279, 1075767312, 1075767310, 1075767309, 1075767305,
  1190346881, 1073834440, 111215278, 297400847, 1074147572, 1073831994, 1075752628,
]);
import {
  Compass,
  Sun,
  Moon,
  HelpCircle,
  Maximize,
  Minimize,
  MapPin,
  X,
  Keyboard,
  Smartphone,
  CheckCircle2,
  ExternalLink,
  Award,
  BookOpen,
  Map,
} from 'lucide-react';

/**
 * Enhanced GameHUD for DTU 3D Campus Tour
 * 
 * Features:
 * - Authentic DTU Landmark Hotspots with deep links
 * - 2D Radar Minimap depicting accurate North/South DTU orientation from Google Maps
 * - Collectible notification card with funny authentic DTU lore flavor text
 * - DTU Campus Quests & Heritage Badges modal
 * - Dynamic GPS Zone detection & coordinate readout
 * - Day / Night lighting toggle
 * - Responsive desktop & mobile touch controls
 */
export default function GameHUD({
  playerPos = { x: 0, z: 20 },
  playerAngle = 0,
  landmarks = [],
  activeLandmark = null,
  badgesCollected = 0,
  totalBadges = 10,
  collectibles = [],
  collectedBadgeIds = [],
  unlockedBadge = null,
  onDismissBadgeNotification = () => {},
  isNight = false,
  onToggleDayNight = () => {},
  onJoystickMove = () => {},
  onJump = () => {},
  isFullscreen = false,
  onToggleFullscreen = () => {},
  onTeleportLandmark = () => {},
}) {
  const router = useRouter();
  const [showHelp, setShowHelp] = useState(false);
  const [showQuestsModal, setShowQuestsModal] = useState(false);
  const [badgePulse, setBadgePulse] = useState(false);
  const [hoveredLandmark, setHoveredLandmark] = useState(null);
  const [isTacticalMapOpen, setIsTacticalMapOpen] = useState(false);

  // Auto-dismiss unlocked badge card after 6.5s
  useEffect(() => {
    if (unlockedBadge) {
      const timer = setTimeout(() => {
        onDismissBadgeNotification();
      }, 6500);
      return () => clearTimeout(timer);
    }
  }, [unlockedBadge, onDismissBadgeNotification]);

  // Trigger pulse animation when badgesCollected updates
  const prevBadgesRef = useRef(badgesCollected);
  useEffect(() => {
    if (badgesCollected > prevBadgesRef.current) {
      setBadgePulse(true);
      const timer = setTimeout(() => setBadgePulse(false), 900);
      return () => clearTimeout(timer);
    }
    prevBadgesRef.current = badgesCollected;
  }, [badgesCollected]);

  // Listen for 'E' or 'e' key to enter nearby landmark
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'e' || e.key === 'E') && activeLandmark?.link) {
        e.preventDefault();
        router.push(activeLandmark.link);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLandmark, router]);

  // Virtual Joystick State
  const joystickBaseRef = useRef(null);
  const [joystickThumb, setJoystickThumb] = useState({ x: 0, y: 0 });
  const [isDraggingJoystick, setIsDraggingJoystick] = useState(false);
  const touchIdRef = useRef(null);

  const maxRadius = 42; // Joystick knob travel radius in pixels

  const handleJoystickPointerDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingJoystick(true);
    touchIdRef.current = e.pointerId;
    if (joystickBaseRef.current) {
      joystickBaseRef.current.setPointerCapture(e.pointerId);
    }
    updateJoystickPosition(e.clientX, e.clientY);
  };

  const handleJoystickPointerMove = (e) => {
    if (!isDraggingJoystick || e.pointerId !== touchIdRef.current) return;
    updateJoystickPosition(e.clientX, e.clientY);
  };

  const handleJoystickPointerUp = (e) => {
    if (e.pointerId !== touchIdRef.current && isDraggingJoystick) return;
    setIsDraggingJoystick(false);
    touchIdRef.current = null;
    setJoystickThumb({ x: 0, y: 0 });
    onJoystickMove(0, 0);
  };

  const updateJoystickPosition = (clientX, clientY) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    const distance = Math.hypot(deltaX, deltaY);

    if (distance <= maxRadius) {
      setJoystickThumb({ x: deltaX, y: deltaY });
      onJoystickMove(deltaX / maxRadius, deltaY / maxRadius);
    } else {
      const angle = Math.atan2(deltaY, deltaX);
      const clampedX = Math.cos(angle) * maxRadius;
      const clampedY = Math.sin(angle) * maxRadius;
      setJoystickThumb({ x: clampedX, y: clampedY });
      onJoystickMove(clampedX / maxRadius, clampedY / maxRadius);
    }
  };

  // ==========================================================================
  // 1:1 REAL DTU OPENSTREETMAP RADAR & TACTICAL MAP PROJECTION
  // True equal-aspect 1040m x 1040m metric projection matching Google Maps
  // ==========================================================================
  const radarSize = isTacticalMapOpen ? 360 : 184;
  const radarRadius = radarSize / 2;

  // Compact radar zooms around player (±175m) for crystal-clear road/building navigation;
  // Expanded Tactical Map renders the entire 1040m x 1040m DTU Bawana campus.
  const localRadius = 175;
  const minX = isTacticalMapOpen ? -560 : playerPos.x - localRadius;
  const maxX = isTacticalMapOpen ? 480 : playerPos.x + localRadius;
  const minZ = isTacticalMapOpen ? -460 : playerPos.z - localRadius;
  const maxZ = isTacticalMapOpen ? 580 : playerPos.z + localRadius;

  const worldToRadarUnclamped = (wx, wz) => {
    const pad = isTacticalMapOpen ? 14 : 6;
    const normX = (wx - minX) / (maxX - minX);
    const normY = (wz - minZ) / (maxZ - minZ);
    return {
      x: pad + normX * (radarSize - 2 * pad),
      y: pad + normY * (radarSize - 2 * pad),
    };
  };

  const worldToRadar = (wx, wz) => {
    const pt = worldToRadarUnclamped(wx, wz);
    const pad = isTacticalMapOpen ? 14 : 10;
    return {
      x: Math.max(pad, Math.min(radarSize - pad, pt.x)),
      y: Math.max(pad, Math.min(radarSize - pad, pt.y)),
    };
  };

  const toSvgPoints = (pts) =>
    pts
      .map(([x, z]) => {
        const pt = worldToRadarUnclamped(x, z);
        return `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
      })
      .join(' ');

  const playerRadar = worldToRadarUnclamped(playerPos.x, playerPos.z);
  const playerDeg = (playerAngle * 180) / Math.PI;

  // Real-time 1:1 DTU Campus Zone Name
  const getCampusZoneName = (x, z) => {
    if (z > 460) return 'DTU Main Gate (T-Canopy) · Bawana Rd';
    if (z > 200) return 'DSM · Girls Hostels & Residential Wing';
    if (x < -390 && z > -20 && z < 130) return 'DTU Lake Promenade';
    if (x < -250 && z >= -35 && z <= 110) return 'Academic Blocks 3 & 4 (CSE/IT/SWE)';
    if (x < -240 && z >= -115 && z < -35) return "Raj Soin Hall & Domino's Food Court";
    if (x < -240 && z < -115) return 'Boys Hostel Quad (VVS, HJB, CVR, JCB)';
    if (z < -200 && x >= -270 && x <= 40) return 'DTU Sports Complex & 400m Track';
    if (x >= 180 && z >= 20 && z <= 170) return 'Pragya Bhawan & SPS 9–12';
    if (x >= 45 && z >= 45 && z <= 145) return 'DTU Central Canteen (Mic-Mac)';
    if (x >= 40 && z >= -60 && z < 45) return 'Dept. of Mechanical Engineering';
    if (x >= -55 && x <= 60 && z < -32) return 'Arched Wings (CS · EE · CE · ENE)';
    if (x >= -175 && x <= -85 && z >= -95 && z <= -45) return 'B.R. Ambedkar Central Library';
    if (x >= -175 && x <= -85 && z > -45 && z <= 65) return 'Admin Block & Dr. B.R. Ambedkar Audi';
    if (x > -65 && x <= 25 && z >= 0 && z <= 70) return 'Open Air Theatre (Wind Point)';
    return 'DTU Campus Academic Promenade';
  };

  const currentZone = getCampusZoneName(playerPos.x, playerPos.z);

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-20 font-sans">
      {/* ==================================================================== */}
      {/* TOP BAR: BADGES TRACKER + CAMPUS TITLE + HUD BUTTONS                 */}
      {/* ==================================================================== */}
      <header className="absolute top-4 left-4 right-4 flex items-center justify-between gap-3 pointer-events-none">
        {/* Left Side: Badges Counter Button (Clickable to open Lore Guide) */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowQuestsModal(true)}
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-2 rounded-xl bg-paper-surface border border-hairline text-ink-primary transition-colors hover:border-cobalt ${
              badgePulse ? 'ring-2 ring-cobalt' : ''
            }`}
            title="Click to view DTU Campus Lore & Quests"
          >
            <Award size={18} strokeWidth={1.5} className="text-cobalt shrink-0" />
            <div className="flex flex-col text-left">
              <span className="text-xs font-mono uppercase tracking-wider text-ink-muted flex items-center gap-1">
                DTU Badges
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-mono font-medium tabular-nums text-ink-primary">
                  {badgesCollected}
                </span>
                <span className="text-xs font-mono tabular-nums text-ink-muted">
                  / {totalBadges}
                </span>
                {badgesCollected === totalBadges ? (
                  <CheckCircle2 size={14} strokeWidth={1.5} className="text-status-ok inline ml-1" />
                ) : (
                  <span className="text-xs text-cobalt underline font-normal ml-1">
                    Guide
                  </span>
                )}
              </div>
            </div>
          </button>

          {/* Quick instructions on desktop */}
          <div className="hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-paper-surface border border-hairline text-xs text-ink-secondary">
            <span className="px-1.5 py-0.5 rounded bg-paper-raised border border-hairline text-[11px] font-mono font-medium text-cobalt">
              WASD
            </span>
            <span>Move</span>
            <span className="text-ink-muted">·</span>
            <span className="px-1.5 py-0.5 rounded bg-paper-raised border border-hairline text-[11px] font-mono font-medium text-cobalt">
              Shift
            </span>
            <span>Sprint</span>
            <span className="text-ink-muted">·</span>
            <span className="px-1.5 py-0.5 rounded bg-paper-raised border border-hairline text-[11px] font-mono font-medium text-cobalt">
              Space
            </span>
            <span>Jump</span>
          </div>
        </div>

        {/* Right Side: Quick Action HUD Buttons */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Day / Night Toggle */}
          <button
            onClick={onToggleDayNight}
            aria-label={isNight ? 'Switch to Day Mode' : 'Switch to Night Mode'}
            title={isNight ? 'Switch to Day Mode' : 'Switch to Night Mode'}
            className="p-2.5 rounded-lg bg-paper-surface hover:bg-paper-raised text-ink-primary border border-hairline transition-colors"
          >
            {isNight ? (
              <Moon size={16} strokeWidth={1.5} className="text-cobalt" />
            ) : (
              <Sun size={16} strokeWidth={1.5} className="text-cobalt" />
            )}
          </button>

          {/* Quests Guide Button */}
          <button
            onClick={() => setShowQuestsModal(true)}
            aria-label="DTU Lore & Quests Guide"
            title="DTU Lore & Badges Guide"
            className="p-2.5 rounded-lg bg-paper-surface hover:bg-paper-raised text-cobalt border border-hairline transition-colors"
          >
            <Award size={16} strokeWidth={1.5} />
          </button>

          {/* Controls Help Button */}
          <button
            onClick={() => setShowHelp(true)}
            aria-label="Controls and Campus Guide"
            title="Controls & Guide"
            className="p-2.5 rounded-lg bg-paper-surface hover:bg-paper-raised text-ink-primary border border-hairline transition-colors"
          >
            <HelpCircle size={16} strokeWidth={1.5} />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={onToggleFullscreen}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            className="p-2.5 rounded-lg bg-paper-surface hover:bg-paper-raised text-ink-primary border border-hairline transition-colors"
          >
            {isFullscreen ? <Minimize size={16} strokeWidth={1.5} /> : <Maximize size={16} strokeWidth={1.5} />}
          </button>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* 2D MINIMAP RADAR (TOP RIGHT)                                         */}
      {/* Depicting Authentic DTU North/South Cartography & Real Landmark Pins */}
      {/* ==================================================================== */}
      <div className="absolute top-20 right-4 pointer-events-auto flex flex-col items-end gap-1.5">
        <div className="relative" style={{ width: `${radarSize}px`, height: `${radarSize}px` }}>
          <div
            className={`w-full h-full p-1 bg-paper-surface border border-hairline overflow-hidden transition-all shadow-lg ${
              isTacticalMapOpen ? 'rounded-xl ring-2 ring-cobalt' : 'rounded-full ring-1 ring-cobalt/40'
            }`}
          >
          {/* SVG Map Canvas */}
          <svg
            className="w-full h-full"
            viewBox={`0 0 ${radarSize} ${radarSize}`}
          >
            <defs>
              <clipPath id="mapClip">
                <rect
                  x="0"
                  y="0"
                  width={radarSize}
                  height={radarSize}
                  rx={isTacticalMapOpen ? 10 : radarRadius}
                />
              </clipPath>
              <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0f172a" stopOpacity="0.92" />
                <stop offset="75%" stopColor="#09111f" stopOpacity="0.96" />
                <stop offset="100%" stopColor="#020617" stopOpacity="1" />
              </radialGradient>
            </defs>

            <g clipPath="url(#mapClip)">
              {/* Background fill */}
              <rect width={radarSize} height={radarSize} fill="url(#radarGlow)" />

              {/* Real DTU Campus Perimeter Polygon */}
              <polygon
                points={toSvgPoints(CAMPUS_BOUNDARY)}
                fill="#0b1f18"
                fillOpacity="0.85"
                stroke="#334155"
                strokeWidth="1.2"
              />

              {/* Parks & Lawns */}
              {CAMPUS_PARKS.map((park, i) => (
                <polygon
                  key={`park-${i}`}
                  points={toSvgPoints(park.worldPoly || park.shapePts.map(([x, z]) => [park.cx + x, park.cz - z]))}
                  fill="#14532d"
                  fillOpacity="0.65"
                />
              ))}

              {/* DTU Lake Water Polygon */}
              {DTU_LAKE_DATA?.worldPoly && (
                <polygon
                  points={toSvgPoints(DTU_LAKE_DATA.worldPoly)}
                  fill="#0284c7"
                  fillOpacity="0.82"
                  stroke="#38bdf8"
                  strokeWidth="1"
                />
              )}

              {/* Sports Pitches & 400m Track */}
              {CAMPUS_PITCHES.map((p) => (
                <polygon
                  key={p.id}
                  points={toSvgPoints(p.worldPoly)}
                  fill={p.sport === 'soccer' || p.sport === 'cricket' ? '#15803d' : p.sport === 'athletics' ? '#9a3412' : '#1d4ed8'}
                  fillOpacity="0.58"
                  stroke={p.sport === 'soccer' ? '#4ade80' : p.sport === 'athletics' ? '#fb923c' : '#60a5fa'}
                  strokeWidth="0.65"
                />
              ))}

              {/* Road Hierarchy: Side Lanes, Main Avenues, and Footpaths */}
              {CAMPUS_ROADS.map((road) => {
                const isFoot = road.kind === 'footway' || road.kind === 'path' || road.kind === 'cycleway';
                const isMain = road.kind === 'secondary' || road.kind === 'tertiary' || MINIMAP_MAIN_ROADS.has(road.id) || !!road.name;
                return (
                  <polyline
                    key={road.id}
                    points={toSvgPoints(road.pts)}
                    fill="none"
                    stroke={isFoot ? '#a8a29e' : isMain ? '#cbd5e1' : '#475569'}
                    strokeOpacity={isFoot ? 0.55 : isMain ? 0.92 : 0.7}
                    strokeDasharray={isFoot ? '2,2' : undefined}
                    strokeWidth={
                      isFoot
                        ? isTacticalMapOpen ? 0.8 : 1.0
                        : isMain
                          ? isTacticalMapOpen ? 2.4 : 4.2
                          : isTacticalMapOpen ? 1.1 : 2.1
                    }
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                );
              })}

              {/* All 71 Real DTU Building Footprints */}
              {CAMPUS_BUILDINGS.map((b) => {
                const isArch = [350525514, 965246607, 965246608, 1549671758].includes(b.id);
                const fill =
                  isArch || b.archetype === 'admin' || b.archetype === 'audi'
                    ? '#dc2626'
                    : b.archetype === 'academic_tall' || b.archetype === 'library'
                      ? '#2563eb'
                      : b.archetype === 'oat'
                        ? '#9333ea'
                        : b.archetype === 'hostel'
                          ? '#0d9488'
                          : '#64748b';
                return (
                  <polygon
                    key={b.id}
                    points={toSvgPoints(b.worldPoly)}
                    fill={fill}
                    fillOpacity="0.86"
                    stroke="#e2e8f0"
                    strokeOpacity="0.55"
                    strokeWidth={isTacticalMapOpen ? '0.45' : '0.7'}
                  />
                );
              })}

              {/* Radar Range Rings (Compact Mode) */}
              {!isTacticalMapOpen && (
                <>
                  <circle
                    cx={radarRadius}
                    cy={radarRadius}
                    r={radarRadius * 0.45}
                    fill="none"
                    stroke="#38bdf8"
                    strokeOpacity="0.16"
                    strokeWidth="0.7"
                    strokeDasharray="3,3"
                  />
                  <circle
                    cx={radarRadius}
                    cy={radarRadius}
                    r={radarRadius * 0.85}
                    fill="none"
                    stroke="#38bdf8"
                    strokeOpacity="0.14"
                    strokeWidth="0.7"
                  />
                </>
              )}

              {/* Uncollected Badges Diamond Markers */}
              {collectibles.map((col) => {
                const isCollected = collectedBadgeIds.includes(col.id);
                if (isCollected) return null;
                const pt = worldToRadar(col.position[0], col.position[2]);

                return (
                  <g key={col.id} className="cursor-pointer">
                    <polygon
                      points={`${pt.x},${pt.y - 3.5} ${pt.x + 3.5},${pt.y} ${pt.x},${pt.y + 3.5} ${pt.x - 3.5},${pt.y}`}
                      fill="#fbbf24"
                      stroke="#78350f"
                      strokeWidth="0.8"
                    />
                  </g>
                );
              })}

              {/* Authentic DTU Landmark Hotspot Pins (Clean Non-Overlapping Dots) */}
              {landmarks.map((lm) => {
                const pt = worldToRadar(lm.position[0], lm.position[2]);
                const isNearby = activeLandmark?.id === lm.id;
                const isHovered = hoveredLandmark?.id === lm.id;

                return (
                  <g
                    key={lm.id}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredLandmark(lm)}
                    onMouseLeave={() => setHoveredLandmark(null)}
                    onClick={() => onTeleportLandmark(lm)}
                  >
                    {(isNearby || isHovered) && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isTacticalMapOpen ? '9' : '6.5'}
                        fill="#38bdf8"
                        fillOpacity="0.4"
                      />
                    )}
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isNearby || isHovered ? (isTacticalMapOpen ? '5.2' : '4.0') : (isTacticalMapOpen ? '4.0' : '3.0')}
                      fill={isNearby ? '#38bdf8' : lm.color ? `#${lm.color.toString(16).padStart(6, '0')}` : '#f59e0b'}
                      stroke="#ffffff"
                      strokeWidth="1.1"
                    />
                  </g>
                );
              })}

              {/* Player Marker */}
              <g transform={`translate(${playerRadar.x}, ${playerRadar.y}) rotate(${playerDeg})`}>
                <polygon points="0,-20 -8,-4 8,-4" fill="#34d399" fillOpacity="0.28" />
                <circle cx="0" cy="0" r="6.5" fill="#10b981" fillOpacity="0.28" />
                <circle cx="0" cy="0" r="3.6" fill="#10b981" stroke="#ffffff" strokeWidth="1.3" />
                <polygon points="0,-8.5 -3.6,-3 3.6,-3" fill="#34d399" />
              </g>
            </g>

            {/* Cardinal Direction Indicators */}
            <circle cx={radarRadius} cy="10" r="7.5" fill="#020617" stroke="#38bdf8" strokeWidth="0.8" />
            <text
              x={radarRadius}
              y="12.5"
              textAnchor="middle"
              fontSize="8.5"
              fontWeight="bold"
              fill="#38bdf8"
              className="select-none font-mono"
            >
              N
            </text>
            {isTacticalMapOpen && (
              <>
                <text x={radarRadius} y={radarSize - 4} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#cbd5e1" className="select-none font-mono">
                  S · BAWANA ROAD MAIN GATE
                </text>
                <text x="10" y={radarRadius + 3} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#94a3b8" className="select-none font-mono">
                  W
                </text>
                <text x={radarSize - 10} y={radarRadius + 3} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#94a3b8" className="select-none font-mono">
                  E
                </text>
              </>
            )}
          </svg>
          </div>

          {/* Minimap View Toggle (unclipped outside circular radar frame) */}
          <button
            onClick={() => setIsTacticalMapOpen((prev) => !prev)}
            aria-label={isTacticalMapOpen ? 'Collapse Radar' : 'Expand Campus Tactical Map'}
            title={isTacticalMapOpen ? 'Collapse Radar' : 'Expand Campus Map'}
            className="absolute bottom-0 right-0 z-10 px-2.5 py-1 rounded-lg bg-paper-surface hover:bg-paper-raised text-ink-primary border border-hairline transition-colors text-[10px] flex items-center gap-1 font-mono shadow-md"
          >
            <Map size={11} className="text-cobalt" />
            <span>{isTacticalMapOpen ? 'Radar' : 'Map'}</span>
          </button>
        </div>

        {/* Quick Teleport Zone Pills when Expanded Tactical Map is Open */}
        {isTacticalMapOpen && (
          <div className="w-[360px] p-2 rounded-xl bg-paper-surface border border-hairline flex flex-wrap gap-1 justify-end shadow-lg">
            {landmarks.map((lm) => (
              <button
                key={`tp-${lm.id}`}
                onClick={() => onTeleportLandmark(lm)}
                onMouseEnter={() => setHoveredLandmark(lm)}
                onMouseLeave={() => setHoveredLandmark(null)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-medium border transition-colors ${
                  activeLandmark?.id === lm.id
                    ? 'bg-cobalt text-white border-cobalt'
                    : 'bg-paper-raised text-ink-secondary border-hairline hover:border-cobalt hover:text-ink-primary'
                }`}
              >
                {lm.id === 'gate'
                  ? 'Main Gate'
                  : lm.id === 'arch_depts'
                    ? 'CS/EE/CE Arch'
                    : lm.id === 'oat'
                      ? 'OAT Wind Pt'
                      : lm.id === 'ab_towers'
                        ? 'AB-3/4'
                        : lm.name.split(' ')[0]}
              </button>
            ))}
          </div>
        )}

        {/* GPS Campus Zone & Coordinates Readout */}
        <div className="flex flex-col items-end gap-1">
          <div className="px-3 py-1 rounded-lg bg-paper-surface border border-hairline text-right">
            <p className="text-[11px] font-medium text-cobalt leading-tight flex items-center gap-1 justify-end">
              <Compass size={11} strokeWidth={1.5} />
              <span>{currentZone}</span>
            </p>
            <p className="text-[10px] text-ink-muted font-mono tabular-nums">
              GPS: X {Math.round(playerPos.x)}, Z {Math.round(playerPos.z)}
            </p>
          </div>

          {/* Hovered or Active Landmark Tooltip */}
          {(hoveredLandmark || activeLandmark) && (
            <div className="px-3 py-1.5 rounded-lg bg-paper-surface border border-cobalt text-right max-w-[220px]">
              <p className="text-[11px] font-medium text-ink-primary leading-tight">
                {(hoveredLandmark || activeLandmark).name}
              </p>
              <p className="text-[10px] text-ink-secondary mt-0.5">
                {(hoveredLandmark || activeLandmark).tag}
              </p>
              <p className="text-[10px] text-cobalt mt-0.5">
                {hoveredLandmark ? 'Click pin to Teleport here' : 'Press E to open route →'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* COLLECTIBLE NOTIFICATION CARD (EASTER EGG UNLOCKED POPUP)            */}
      {/* ==================================================================== */}
      {unlockedBadge && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-auto max-w-lg w-[92%] sm:w-auto z-40">
          <div className="p-4 sm:p-5 rounded-xl bg-paper-surface border border-cobalt text-ink-primary relative">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3.5">
                {/* Collectible Icon */}
                <div className="w-12 h-12 rounded-lg bg-cobalt-soft border border-cobalt/30 flex items-center justify-center text-2xl flex-shrink-0">
                  {unlockedBadge.icon}
                </div>

                <div className="text-left">
                  <span className="catalog-stamp">
                    DTU Heritage Collectible Unlocked
                  </span>
                  <h3 className="text-base sm:text-lg font-medium text-ink-primary mt-1.5">
                    {unlockedBadge.name}
                  </h3>
                  <p className="text-xs text-cobalt font-medium">
                    {unlockedBadge.locationName}
                  </p>
                </div>
              </div>

              {/* Dismiss Button */}
              <button
                onClick={onDismissBadgeNotification}
                className="p-1.5 rounded-lg bg-paper-raised text-ink-muted hover:text-ink-primary transition-colors"
                aria-label="Close notification"
              >
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>

            {/* Authentic DTU Student Lore */}
            <div className="mt-3 pt-3 border-t border-hairline text-left">
              <p className="text-xs text-ink-secondary leading-relaxed">
                {unlockedBadge.lore}
              </p>
              {unlockedBadge.quote && (
                <p className="text-xs text-cobalt font-mono mt-1.5">
                  {unlockedBadge.quote}
                </p>
              )}
            </div>

            {/* Badges Progress Counter */}
            <div className="mt-3 flex items-center justify-between text-xs text-ink-muted pt-2 border-t border-hairline">
              <span className="font-mono font-medium text-cobalt tabular-nums">
                Badge {badgesCollected} of {totalBadges} Collected
              </span>
              <span className="text-xs font-mono text-ink-muted">
                +100 DTU Karma
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* PROXIMITY PROMPT: NEAR LANDMARK INTERACTION BANNER                   */}
      {/* ==================================================================== */}
      {activeLandmark && (
        <div className="absolute bottom-28 md:bottom-8 left-1/2 -translate-x-1/2 pointer-events-auto max-w-md w-[92%] sm:w-auto">
          <div className="p-4 sm:p-5 rounded-xl bg-paper-surface border border-cobalt flex flex-col sm:flex-row items-center justify-between gap-4 text-ink-primary">
            <div className="flex items-center gap-3 text-left w-full sm:w-auto">
              <div className="p-2.5 rounded-lg bg-cobalt-soft text-cobalt border border-cobalt/20 flex-shrink-0 text-xl">
                {activeLandmark.icon || <MapPin size={20} strokeWidth={1.5} />}
              </div>
              <div>
                <span className="catalog-stamp">
                  {activeLandmark.tag}
                </span>
                <h4 className="text-sm sm:text-base font-medium text-ink-primary mt-1 line-clamp-1">
                  {activeLandmark.name}
                </h4>
                {activeLandmark.description && (
                  <p className="text-xs text-ink-secondary line-clamp-1 hidden sm:block">
                    {activeLandmark.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Link
                href={activeLandmark.link}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-btn-primary hover:bg-cobalt-hover text-btn-primary-fg font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <span>Enter & Explore</span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white/20 text-[10px] font-mono">
                  Press E
                </span>
                <ExternalLink size={14} strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MOBILE TOUCH CONTROLS (VISIBLE ON MOBILE / TOUCH DEVICES)            */}
      {/* ==================================================================== */}
      <div className="lg:hidden pointer-events-none absolute inset-x-0 bottom-6 px-6 flex items-end justify-between">
        {/* Virtual Joystick (Bottom Left) */}
        <div
          ref={joystickBaseRef}
          data-joystick="true"
          onPointerDown={handleJoystickPointerDown}
          onPointerMove={handleJoystickPointerMove}
          onPointerUp={handleJoystickPointerUp}
          onPointerCancel={handleJoystickPointerUp}
          className="pointer-events-auto relative w-28 h-28 rounded-full bg-paper-surface border border-hairline flex items-center justify-center touch-none select-none active:border-cobalt"
        >
          {/* Center deadzone mark */}
          <div className="w-4 h-4 rounded-full border border-hairline" />

          {/* Draggable thumb knob */}
          <div
            className="absolute w-12 h-12 rounded-full bg-btn-primary border border-hairline pointer-events-none transition-transform duration-75 flex items-center justify-center"
            style={{
              transform: `translate(${joystickThumb.x}px, ${joystickThumb.y}px)`,
            }}
          >
            <div className="w-3 h-3 rounded-full bg-btn-primary-fg/60" />
          </div>
        </div>

        {/* Action & Jump Buttons (Bottom Right) */}
        <div className="pointer-events-auto flex items-end gap-3 pb-1">
          {/* Action / Enter Button (Active when near a landmark) */}
          {activeLandmark && (
            <button
              onClick={() => router.push(activeLandmark.link)}
              className="w-14 h-14 rounded-xl bg-cobalt text-btn-primary-fg font-medium text-xs flex flex-col items-center justify-center border border-hairline"
            >
              <ExternalLink size={16} strokeWidth={1.5} />
              <span className="text-[10px] font-mono mt-0.5">EXPLORE</span>
            </button>
          )}

          {/* Jump Button */}
          <button
            onClick={onJump}
            className="w-16 h-16 rounded-2xl bg-btn-primary text-btn-primary-fg font-medium text-xs flex flex-col items-center justify-center border border-hairline"
            aria-label="Jump"
          >
            <span className="text-[11px] font-mono uppercase tracking-wider">
              Jump
            </span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* DTU CAMPUS QUESTS & LORE BADGES GUIDE MODAL                          */}
      {/* ==================================================================== */}
      {showQuestsModal && (
        <div className="fixed inset-0 z-50 pointer-events-auto bg-black/65 flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl bg-paper-surface border border-hairline p-6 sm:p-8 text-ink-primary">
            {/* Close Button */}
            <button
              onClick={() => setShowQuestsModal(false)}
              className="absolute top-5 right-5 p-2 rounded-lg bg-paper-raised text-ink-muted hover:text-ink-primary transition-colors"
              aria-label="Close dialog"
            >
              <X size={18} strokeWidth={1.5} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-lg bg-cobalt-soft text-cobalt border border-cobalt/20">
                <Award size={22} strokeWidth={1.5} />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-medium text-ink-primary">
                  DTU Campus Lore & Quests
                </h3>
                <p className="text-xs text-ink-secondary">
                  Collect all 10 DTU heritage badges across the campus
                </p>
              </div>
            </div>

            {/* Badges Progress Summary */}
            <div className="p-4 rounded-xl bg-paper-raised border border-hairline mb-6 flex items-center justify-between">
              <div>
                <span className="catalog-stamp">
                  Collection Status
                </span>
                <p className="text-base font-mono font-medium text-ink-primary tabular-nums mt-1">
                  {badgesCollected} / {totalBadges} Badges Discovered
                </p>
              </div>
              <div className="w-36 h-2.5 bg-paper-deep border border-hairline rounded-full overflow-hidden">
                <div
                  className="h-full bg-cobalt transition-all duration-500"
                  style={{ width: `${(badgesCollected / totalBadges) * 100}%` }}
                />
              </div>
            </div>

            {/* 10 DTU Student Badges List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              {collectibles.map((item) => {
                const isCollected = collectedBadgeIds.includes(item.id);

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border transition-colors ${
                      isCollected
                        ? 'bg-cobalt-soft/50 border-cobalt/40 text-ink-primary'
                        : 'bg-paper-raised border-hairline text-ink-secondary'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${
                          isCollected
                            ? 'bg-cobalt-soft border border-cobalt/30'
                            : 'bg-paper-deep opacity-60'
                        }`}
                      >
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-medium text-ink-primary truncate">
                            {item.name}
                          </h4>
                          {isCollected ? (
                            <span className="text-[10px] font-medium text-status-ok flex items-center gap-0.5">
                              <CheckCircle2 size={12} strokeWidth={1.5} /> Found
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-ink-muted">
                              Locked
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-cobalt font-medium">
                          {item.locationName}
                        </p>
                        <p className="text-xs text-ink-secondary mt-1 line-clamp-2">
                          {item.lore}
                        </p>
                        {item.quote && (
                          <p className="text-[10px] text-ink-muted font-mono mt-0.5 truncate">
                            {item.quote}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowQuestsModal(false)}
              className="w-full mt-6 py-2.5 rounded-lg bg-btn-primary hover:bg-cobalt-hover font-medium text-sm text-btn-primary-fg transition-colors"
            >
              Back to Campus
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* CONTROLS & HELP MODAL                                                */}
      {/* ==================================================================== */}
      {showHelp && (
        <div className="fixed inset-0 z-50 pointer-events-auto bg-black/65 flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg rounded-xl bg-paper-surface border border-hairline p-6 sm:p-8 text-ink-primary">
            {/* Close Button */}
            <button
              onClick={() => setShowHelp(false)}
              className="absolute top-5 right-5 p-2 rounded-lg bg-paper-raised text-ink-muted hover:text-ink-primary transition-colors"
              aria-label="Close dialog"
            >
              <X size={18} strokeWidth={1.5} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-lg bg-cobalt-soft text-cobalt border border-cobalt/20">
                <Compass size={22} strokeWidth={1.5} />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-medium text-ink-primary">
                  DTU Campus Tour & Controls
                </h3>
                <p className="text-xs text-ink-secondary">
                  Interactive 3D Campus Map Guide
                </p>
              </div>
            </div>

            {/* Desktop Controls */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-2.5 text-xs font-medium text-cobalt">
                <Keyboard size={15} strokeWidth={1.5} />
                <span>Desktop Controls</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-paper-raised border border-hairline flex items-center justify-between">
                  <span className="text-ink-secondary">Move Around</span>
                  <span className="px-2 py-0.5 rounded bg-paper-surface border border-hairline font-mono text-ink-primary">
                    W A S D
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-paper-raised border border-hairline flex items-center justify-between">
                  <span className="text-ink-secondary">Sprint Speed</span>
                  <span className="px-2 py-0.5 rounded bg-paper-surface border border-hairline font-mono text-ink-primary">
                    Shift
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-paper-raised border border-hairline flex items-center justify-between">
                  <span className="text-ink-secondary">Jump</span>
                  <span className="px-2 py-0.5 rounded bg-paper-surface border border-hairline font-mono text-ink-primary">
                    Spacebar
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-paper-raised border border-hairline flex items-center justify-between">
                  <span className="text-ink-secondary">Orbit Camera</span>
                  <span className="px-2 py-0.5 rounded bg-paper-surface border border-hairline font-mono text-ink-primary">
                    Mouse Drag
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-paper-raised border border-hairline flex items-center justify-between col-span-2">
                  <span className="text-ink-secondary">Interact with Landmark</span>
                  <span className="px-2 py-0.5 rounded bg-paper-surface border border-hairline font-mono text-ink-primary">
                    Press E
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile Controls */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2.5 text-xs font-medium text-cobalt">
                <Smartphone size={15} strokeWidth={1.5} />
                <span>Mobile & Touch Controls</span>
              </div>
              <div className="p-3 rounded-lg bg-paper-raised border border-hairline text-xs text-ink-secondary space-y-1.5 text-left">
                <p>• <strong className="text-ink-primary font-medium">Left Joystick:</strong> Drag to steer the student avatar.</p>
                <p>• <strong className="text-ink-primary font-medium">Jump Button:</strong> Tap to hop over fences and walkways.</p>
                <p>• <strong className="text-ink-primary font-medium">Touch Drag Screen:</strong> Orbit camera 360° around campus.</p>
                <p>• <strong className="text-ink-primary font-medium">Explore Button:</strong> Appears when approaching a building.</p>
              </div>
            </div>

            {/* Objective & Badges */}
            <div className="p-3.5 rounded-xl bg-cobalt-soft border border-cobalt/20 text-xs text-ink-secondary mb-6 flex items-start gap-3 text-left">
              <Award size={18} strokeWidth={1.5} className="text-cobalt flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-ink-primary block font-medium mb-0.5">
                  Explore & Collect 10 DTU Heritage Badges
                </strong>
                Search around Admin Block, Library, Wind Point, Nescafe, Mech-C, and the Sports Arena to discover all 10 hidden cultural badges.
              </div>
            </div>

            {/* Close CTA */}
            <button
              onClick={() => setShowHelp(false)}
              className="w-full py-2.5 rounded-lg bg-btn-primary hover:bg-cobalt-hover font-medium text-sm text-btn-primary-fg transition-colors"
            >
              Ready to Explore
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
