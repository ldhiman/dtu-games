# DTU Arcade · Open-Source 3D WebGL Games 🎮

Welcome to **DTU Games**, the community-driven open-source 3D WebGL gaming playground for Delhi Technological University!

This repository contains two complete 3D interactive web games powered by **Next.js**, **Three.js**, and procedural Web Audio:
1. **Prof Showdown 2.5D** (`/prof-showdown`): Fighting game featuring iconic DTU faculty personas with guard crush, hitstop, signature specials, and wall bounces.
2. **3D DTU Campus Explorer** (`/campus-game`): Third-person 3D open-world exploration of DTU's 164-acre campus using real OpenStreetMap spatial coordinates.

> **Zero Backend & Zero Secret Keys:** These games run 100% in-browser on client WebGL. Anyone can clone, run, modify, and contribute with zero API keys or environment variables required!

---

## 🚀 Quickstart

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ldhiman/dtu-games.git
   cd dtu-games
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local dev server:**
   ```bash
   npm run dev
   ```

4. **Play:**
   * Arcade Hub: `http://localhost:3000`
   * Prof Showdown: `http://localhost:3000/prof-showdown`
   * 3D Campus Explorer: `http://localhost:3000/campus-game`

---

## 🕹️ Game 1: Prof Showdown 2.5D

### Roster
* **Dean of Detain** (Grappler): Maroon coat, attendance registry shield, detention notices, and Chalk Shuriken Barrage.
* **Dr. Math Matrix** (Zoner): Grey suit, Fourier Sine Wave energy torus, matrix determinants, and vector strikes.
* **Lab Incharge** (Heavy Brawler): Khaki workshop jacket, lathe cyclone rush, safety goggle flash, pipe wrench swings.
* **DSA Wizard** (Speed Rushdown): Cyan hoodie, terminal glitch effects, NullPointer teleport, binary punch storm.
* **Viva Examiner** (Trap / Mindgame): Tweed jacket, Question Paper Mines, red pen slash, external scrutiny beam.
* **Secret VC** (Secret Boss): Velvet convocation robe, golden medallion, Convocation Ray, ultimate decree.

### Stages
* Open Air Theatre (OAT)
* DTU Raj Soin Hall (Sports Complex)
* Central Library Lawns
* Mech Workshop & Production Lathes
* Convocation Ground & Mic-Drop Stage

---

## 🏛️ Game 2: 3D DTU Campus Explorer

* **164-Acre Scale:** Uses real OpenStreetMap latitude/longitude coordinates transformed into Three.js local space.
* **Key Landmarks:** Admin Block, Open Air Theatre (OAT), Mech Block, Central Library, DTU Lake, Hostels, and Main Gate.
* **Features:** Third-person character controller, day/sunset/night lighting cycles, interactive minimap, and ambient campus audio.

---

## 🤝 How to Contribute

We welcome contributions from students, game developers, and 3D artists!

Check out our [**CONTRIBUTING.md**](./CONTRIBUTING.md) guide to learn how to:
* Add a new Professor to the fighter roster (`src/app/prof-showdown/components/Fighter3D.js`)
* Design a new Stage arena (`src/app/prof-showdown/components/Stages3D.js`)
* Add new campus buildings or interactive zones (`src/app/campus-game/components/CampusWorld.js`)
* Balance combat damage, frames, and AI logic

---

## 📜 License

MIT License. Open-source for all Delhi Technological University students and creators.
