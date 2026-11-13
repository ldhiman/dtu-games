# Contributing to DTU Games 🛠️

Thank you for your interest in contributing to the DTU 3D Games community project! Whether you're adding a new professor, modeling a DTU campus building, or polishing animations, every contribution is welcome.

---

## 🎯 How to Add a New Professor to Prof Showdown

All fighter procedural 3D models and animation rigs live in:
`src/app/prof-showdown/components/Fighter3D.js`

1. **Add your character stats to `PROF_ROSTER` in `src/app/prof-showdown/ProfShowdownClient.jsx`:**
   ```javascript
   {
     id: 'chem_alchemist',
     name: 'Dr. Chem Alchemist',
     dept: 'Applied Chemistry & Polymer Tech',
     archetype: 'Zoner / Hazard',
     coatColor: 0x059669, // Green lab coat
     stats: { hp: 100, speed: 4.8, power: 1.1, range: 4.4 },
     specialMove: 'Beaker Vapor Cloud',
     superMove: 'Exothermic Titration Blast',
     bio: 'Controls stage hazards with volatile chemical reactions.',
   }
   ```

2. **Add character visual features in `Fighter3D.js`:**
   * Inside the `buildCharacterMesh()` method, check `this.config.id` to attach unique props (e.g., test tubes, safety goggles, books, lab coats).
   * All geometry is built with lightweight procedural Three.js primitives (`BoxGeometry`, `CylinderGeometry`, `SphereGeometry`).

3. **Add your Signature Special Move in `executeSpecial()` inside `ProfShowdownClient.jsx`:**
   * Define your custom projectile geometry, velocity, and damage!

---

## 🏛️ How to Add or Improve Campus Buildings

The 3D virtual campus is located in:
`src/app/campus-game/components/CampusWorld.js` and `dtuOsmData.js`

1. **Building Coordinates:** OpenStreetMap building footprints are stored in `dtuOsmData.js`.
2. **Procedural Geometry:** Buildings, pathways, streetlights, and trees are rendered in `CampusWorld.js`.
3. Add custom landmarks (e.g., canteen, Nescafe outlet, new department blocks) by creating Three.js meshes and placing them on the map.

---

## 📋 Pull Request Guidelines

1. **Fork** the repository and create your branch from `main`:
   ```bash
   git checkout -b feature/new-prof-dr-matrix
   ```
2. **Test your changes locally:**
   ```bash
   npm run dev
   npm run build
   ```
   Ensure `npm run build` exits with code `0`.
3. **Commit with clean, descriptive messages:**
   ```bash
   git commit -m "feat: add Dr. Chem Alchemist with Beaker Vapor projectile"
   ```
4. **Push to your fork and submit a Pull Request!**

Zero API keys or environment variables are needed. Happy coding!
