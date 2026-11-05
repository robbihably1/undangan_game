// ==============================================================
// COLLISION.JS - SISTEM COLLISION DAN JALAN SETAPAK (WALKABLE AREA)
// Mengatur batas jalan, sliding collision, dan visual debug mode
// Sesuai layout visual referensi peta taman RPG
// ==============================================================

import * as THREE from 'three';

export class CollisionSystem {
  constructor() {
    this.playerRadius = 0.38; // Radius collision pemain
    this.pathElements = [];
    this.debugGroup = new THREE.Group();
    this.debugGroup.visible = false;
    this.debugMesh = null;

    this.initPathNetwork();
  }

  // Inisialisasi segmen jalan setapak sesuai layout referensi
  initPathNetwork() {
    // 1. Gerbang Masuk & Lorong Bawah (Entrance Trail)
    this.addSegment(0, 22, 0, 14, 1.35);
    this.addCircle(0, 18, 1.35); // Gerbang

    // 2. Persimpangan Tamu Kehadiran (Buku Tamu & RSVP dijaga Pagar Ayu di x = 0, z = 6)
    this.addSegment(0, 14, 0, 6, 1.35);
    this.addCircle(0, 6, 1.35); // Check point Tamu Kehadiran & RSVP

    // 3. Area Resepsi & Akad (Check point di lingkaran x = -9, z = 7)
    this.addSegment(0, 6, -6, 6.5, 1.3);
    this.addSegment(-6, 6.5, -9, 7, 1.3);
    this.addCircle(-9, 7, 1.35); // Check point bersih kompak

    // 4. Area Photobooth (Check point di lingkaran x = 8, z = 7)
    this.addSegment(0, 6, 5, 6.5, 1.3);
    this.addSegment(5, 6.5, 8, 7, 1.3);
    this.addCircle(8, 7, 1.35); // Check point bersih kompak

    // 5. Jalur Utama Tengah ke Atas (Menuju Pos Peta & Panduan Lokasi di x = 0, z = -2)
    this.addSegment(0, 6, 0, -2, 1.35);
    this.addCircle(0, -2, 1.4); // Check point Pos Peta & Penunjuk Arah 3D

    // 6. Lingkaran Galeri Lukisan Pasangan (Kiri Atas / Barat Laut: x = -8, z = -10)
    // Jalur melingkar (Circular ring path)
    this.addSegment(0, -2, -5, -4, 1.3);
    this.addSegment(-5, -4, -8, -6, 1.3);
    this.addSegment(-8, -6, -8, -10, 1.3);
    this.addCircle(-8, -10, 1.35); // Check point pameran lukisan pasangan

    // 7. Panggung Galeri Foto (Check point di lingkaran x = 8, z = -5)
    this.addSegment(0, -2, 5, -3, 1.3);
    this.addSegment(5, -3, 8, -5, 1.3);
    this.addCircle(8, -5, 1.35); // Check point galeri foto

    // 8. Jembatan Kayu Melintasi Kolam Teratai (Atas Timur: x = 6, z = -12)
    this.addSegment(8, -5, 7, -9, 1.3);
    this.addSegment(7, -9, 4, -13, 1.3); // Jembatan melengkung
    this.addCircle(4, -13, 1.35);

    // 9. Jalur Penghubung Melingkar Atas (Dari Jembatan ke Taman Pasangan)
    this.addSegment(4, -13, -2, -13, 1.3);
    this.addSegment(-2, -13, -8, -10, 1.3);

    // 10. Jalur Sisi Luar (Outer Loop Barat & Timur)
    this.addSegment(-9, 7, -11, 1, 1.2);
    this.addSegment(-11, 1, -8, -6, 1.2);

    this.addSegment(8, 7, 10, 1, 1.2);
    this.addSegment(10, 1, 8, -5, 1.2);
  }

  addSegment(x1, z1, x2, z2, radius) {
    this.pathElements.push({
      type: 'segment',
      x1, z1, x2, z2,
      radius
    });
  }

  addCircle(x, z, radius) {
    this.pathElements.push({
      type: 'circle',
      x, z,
      radius
    });
  }

  distToSegment(px, pz, x1, z1, x2, z2) {
    const l2 = (x2 - x1) * (x2 - x1) + (z2 - z1) * (z2 - z1);
    if (l2 === 0) return Math.hypot(px - x1, pz - z1);
    let t = ((px - x1) * (x2 - x1) + (pz - z1) * (z2 - z1)) / l2;
    t = Math.max(0, Math.min(1, t));
    const projX = x1 + t * (x2 - x1);
    const projZ = z1 + t * (z2 - z1);
    return Math.hypot(px - projX, pz - projZ);
  }

  isWalkable(x, z, playerRadius = this.playerRadius) {
    for (let i = 0; i < this.pathElements.length; i++) {
      const elem = this.pathElements[i];
      if (elem.type === 'circle') {
        const dist = Math.hypot(x - elem.x, z - elem.z);
        if (dist <= elem.radius - playerRadius * 0.65) {
          return true;
        }
      } else if (elem.type === 'segment') {
        const dist = this.distToSegment(x, z, elem.x1, elem.z1, elem.x2, elem.z2);
        if (dist <= elem.radius - playerRadius * 0.65) {
          return true;
        }
      }
    }
    return false;
  }

  // Menentukan ketinggian permukaan tanah / lantai (Jembatan Kayu Melintasi Kolam)
  getSurfaceHeight(x, z) {
    // Jembatan Melengkung di atas Kolam Teratai (Jalur dari (7, -9) ke (4, -13))
    const distToBridge = this.distToSegment(x, z, 7, -9, 4, -13);
    if (distToBridge <= 1.5) {
      const dx = 4 - 7;
      const dz = -13 - (-9);
      const l2 = dx * dx + dz * dz;
      let t = ((x - 7) * dx + (z - (-9)) * dz) / l2;
      t = Math.max(0, Math.min(1, t));
      // Parabola: arch height naik anggun melengkung di atas air kolam hingga 0.45
      const arch = Math.sin(t * Math.PI) * 0.35 + 0.15;
      return arch;
    }

    return 0;
  }

  resolveMovement(currentX, currentZ, deltaX, deltaZ) {
    if (deltaX === 0 && deltaZ === 0) {
      return { x: currentX, z: currentZ, moved: false };
    }

    const targetX = currentX + deltaX;
    const targetZ = currentZ + deltaZ;

    // 1. Coba gerakan diagonal penuh
    if (this.isWalkable(targetX, targetZ)) {
      return { x: targetX, z: targetZ, moved: true };
    }

    // 2. Sliding collision: Coba gerakan pada sumbu X saja
    const canMoveX = this.isWalkable(targetX, currentZ);
    // 3. Sliding collision: Coba gerakan pada sumbu Z saja
    const canMoveZ = this.isWalkable(currentX, targetZ);

    if (canMoveX && !canMoveZ) {
      return { x: targetX, z: currentZ, moved: true };
    } else if (!canMoveX && canMoveZ) {
      return { x: currentX, z: targetZ, moved: true };
    } else if (canMoveX && canMoveZ) {
      if (Math.abs(deltaX) >= Math.abs(deltaZ)) {
        return { x: targetX, z: currentZ, moved: true };
      } else {
        return { x: currentX, z: targetZ, moved: true };
      }
    }

    // Micro step untuk kehalusan tepi
    const microStep = 0.5;
    if (this.isWalkable(currentX + deltaX * microStep, currentZ)) {
      return { x: currentX + deltaX * microStep, z: currentZ, moved: true };
    }
    if (this.isWalkable(currentX, currentZ + deltaZ * microStep)) {
      return { x: currentX, z: currentZ + deltaZ * microStep, moved: true };
    }

    return { x: currentX, z: currentZ, moved: false };
  }

  createDebugMesh(scene) {
    if (this.debugMesh) return;

    const gridSize = 44;
    const step = 0.7;
    const halfGrid = gridSize / 2;

    const walkableInstances = [];
    const nonWalkableInstances = [];

    const geom = new THREE.PlaneGeometry(step * 0.85, step * 0.85);
    geom.rotateX(-Math.PI / 2);

    const walkableMat = new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      transparent: true,
      opacity: 0.55,
      depthWrite: false
    });

    const nonWalkableMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.25,
      depthWrite: false
    });

    for (let x = -halfGrid; x <= halfGrid; x += step) {
      for (let z = -halfGrid; z <= halfGrid; z += step) {
        if (this.isWalkable(x, z, 0.1)) {
          walkableInstances.push({ x, z });
        } else if (Math.hypot(x, z) < 22) {
          nonWalkableInstances.push({ x, z });
        }
      }
    }

    const walkableMesh = new THREE.InstancedMesh(geom, walkableMat, walkableInstances.length);
    const nonWalkableMesh = new THREE.InstancedMesh(geom, nonWalkableMat, nonWalkableInstances.length);

    const dummy = new THREE.Object3D();

    walkableInstances.forEach((pos, idx) => {
      dummy.position.set(pos.x, 0.08, pos.z);
      dummy.updateMatrix();
      walkableMesh.setMatrixAt(idx, dummy.matrix);
    });

    nonWalkableInstances.forEach((pos, idx) => {
      dummy.position.set(pos.x, 0.05, pos.z);
      dummy.updateMatrix();
      nonWalkableMesh.setMatrixAt(idx, dummy.matrix);
    });

    walkableMesh.instanceMatrix.needsUpdate = true;
    nonWalkableMesh.instanceMatrix.needsUpdate = true;

    this.debugGroup.add(walkableMesh);
    this.debugGroup.add(nonWalkableMesh);

    scene.add(this.debugGroup);
    this.debugMesh = this.debugGroup;
  }

  toggleDebug(scene) {
    if (!this.debugMesh) {
      this.createDebugMesh(scene);
    }
    this.debugGroup.visible = !this.debugGroup.visible;
    return this.debugGroup.visible;
  }
}
