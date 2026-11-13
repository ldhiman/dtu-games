'use client';

import React from 'react';
import Link from 'next/link';
import { Swords, Compass, Sparkles, GitBranch, Terminal, Shield, Trophy, Users, Heart } from 'lucide-react';

export default function ArcadeHome() {
  return (
    <main className="w-full min-h-screen bg-slate-950 text-white flex flex-col items-center justify-start p-4 sm:p-8 font-sans">
      {/* Hero Header */}
      <header className="w-full max-w-5xl py-8 flex flex-col items-center text-center space-y-3 border-b border-slate-800">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono">
          <Sparkles size={14} />
          <span>DTU Open Source 3D Arcade</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 bg-clip-text text-transparent">
          DTU WebGL Games Hub
        </h1>
        <p className="max-w-2xl text-slate-300 text-sm sm:text-base leading-relaxed">
          Open-source 3D WebGL games made by and for Delhi Technological University students. Zero backend, zero external tracking, purely procedural Three.js.
        </p>
      </header>

      {/* Featured Games Grid */}
      <section className="w-full max-w-5xl py-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Game 1: Prof Showdown 2.5D */}
        <div className="group relative rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-amber-500/60 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Swords size={26} />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">2.5D Fighting Game</span>
              <h2 className="text-2xl font-black text-white group-hover:text-amber-400 transition-colors">Prof Showdown 2.5D</h2>
              <p className="text-slate-400 text-xs mt-1">The Great CGPA Fight</p>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Street Fighter & Tekken-style 2.5D combat between iconic DTU faculty personas. Features Guard Meters, Guard Crush, Hitstop freeze-frames, wall bounces, projectile zoning, and signature Shakti Supers!
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">6 Roster Characters</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">5 DTU Stages</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">Local 2P & CPU AI</span>
            </div>
          </div>

          <div className="pt-6">
            <Link
              href="/prof-showdown"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
            >
              <Swords size={18} />
              <span>PLAY PROF SHOWDOWN</span>
            </Link>
          </div>
        </div>

        {/* Game 2: 3D Campus Explorer */}
        <div className="group relative rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-sky-500/60 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-sky-500/10">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
              <Compass size={26} />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-sky-400 font-bold">3D Open-World</span>
              <h2 className="text-2xl font-black text-white group-hover:text-sky-400 transition-colors">3D DTU Campus Explorer</h2>
              <p className="text-slate-400 text-xs mt-1">Full 164-Acre Virtual Campus</p>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Explore Delhi Technological University in third-person 3D! Built using real OpenStreetMap spatial coordinates for OAT, Admin Block, Mech Block, Library, Lake, and Hostels with dynamic day/night cycles.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">164-Acre Map</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">OSM Coordinates</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">Day / Sunset / Night</span>
            </div>
          </div>

          <div className="pt-6">
            <Link
              href="/campus-game"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
            >
              <Compass size={18} />
              <span>EXPLORE 3D CAMPUS</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Open Source Contribution Section */}
      <section className="w-full max-w-5xl py-8 px-6 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-left">
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs">
            <GitBranch size={16} />
            <span>Open Source Community Project</span>
          </div>
          <h3 className="text-lg font-bold text-white">Want to add a professor, stage, or 3D campus feature?</h3>
          <p className="text-xs text-slate-400 max-w-xl">
            This repository is 100% open for contributions! Fork the repository, add your custom characters or stages, test locally with zero credentials required, and submit a PR!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/ldhiman/dtu-games"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 border border-slate-700 transition-colors shadow"
          >
            <GitBranch size={16} className="text-amber-400" />
            <span>GitHub Repository</span>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-5xl py-8 mt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
        <p>Built with Three.js, React & Next.js for Delhi Technological University.</p>
        <p className="flex items-center gap-1">
          <span>Crafted with</span>
          <Heart size={12} className="text-rose-500 fill-rose-500" />
          <span>by DTU Students</span>
        </p>
      </footer>
    </main>
  );
}
