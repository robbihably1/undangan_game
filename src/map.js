// =========================================================================
// MAP.JS - PEMBUATAN DUNIA 3D TAMAN PERNIKAHAN LENGKAP (SESUAI GAMBAR REFERENSI)
// Menyediakan jalan berliku, tenda resepsi, bilik photobooth, taman cincin bunga,
// panggung galeri kayu, jembatan kolam teratai, pagar taman, & papan nama RPG.
// =========================================================================

import * as THREE from 'three';
import { WEDDING_CONFIG } from './config.js';
import { Character3D } from './character.js';

export class WeddingMap {
  constructor(scene, collisionSystem) {
    this.scene = scene;
    this.collision = collisionSystem;
    this.animatedDecorations = [];
    this.floatingLabels = [];

    this.initMaterials();
    this.buildTerrainAndPaths();
    this.buildReferenceLocations();
    this.buildFencesAndBorders();
    this.buildFloraAndNature();
    this.buildFloatingPlaques();
    this.buildLightingAndAtmosphere();
  }

  initMaterials() {
    // Palet warna yang hangat, alami, dan kaya seperti pada gambar referensi
    this.materials = {
      grass: new THREE.MeshLambertMaterial({ color: 0x5e8c31 }), // Rumput hijau subur
      grassDark: new THREE.MeshLambertMaterial({ color: 0x477023 }),
      pathSand: new THREE.MeshLambertMaterial({ color: 0xdeb887 }), // Pasir/jalan setapak hangat cokelat muda
      pathBorder: new THREE.MeshLambertMaterial({ color: 0xb48b59 }), // Tepi batu bata/batu alam
      woodDark: new THREE.MeshLambertMaterial({ color: 0x5c3317 }), // Kayu bilik foto antik
      woodWarm: new THREE.MeshLambertMaterial({ color: 0x8b5a2b }), // Kayu panggung & pergola
      woodFence: new THREE.MeshLambertMaterial({ color: 0xc89d68 }), // Pagar kayu pedesaan
      tentFabric: new THREE.MeshLambertMaterial({ color: 0xfbf6ee }), // Kain tenda kanopi krem
      tentRoof: new THREE.MeshLambertMaterial({ color: 0xf5ebd9 }),
      waterPond: new THREE.MeshLambertMaterial({ color: 0x3d7e80, transparent: true, opacity: 0.85 }),
      lilypad: new THREE.MeshLambertMaterial({ color: 0x38761d }),
      foliageGreen: new THREE.MeshLambertMaterial({ color: 0x3e7327 }),
      foliageDark: new THREE.MeshLambertMaterial({ color: 0x274e13 }),
      flowerPink: new THREE.MeshLambertMaterial({ color: 0xd95977 }),
      flowerRose: new THREE.MeshLambertMaterial({ color: 0xc2185b }),
      flowerWhite: new THREE.MeshLambertMaterial({ color: 0xffffff }),
      flowerYellow: new THREE.MeshLambertMaterial({ color: 0xf59e0b }),
      goldAcsent: new THREE.MeshLambertMaterial({ color: 0xd97706 }),
      plaqueBg: new THREE.MeshLambertMaterial({ color: 0xfef6e4 })
    };
  }

  // 1. Tanah & Jalan Setapak yang 100% sinkron dengan collision
  buildTerrainAndPaths() {
    // Tanah Utama (Ground)
    const groundGeo = new THREE.PlaneGeometry(80, 80);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMesh = new THREE.Mesh(groundGeo, this.materials.grass);
    groundMesh.receiveShadow = true;
    this.scene.add(groundMesh);

    // Grup visual jalan setapak
    const pathGroup = new THREE.Group();
    pathGroup.name = 'visual_paths';
    this.scene.add(pathGroup);

    this.collision.pathElements.forEach(elem => {
      if (elem.type === 'circle') {
        const circleGeo = new THREE.CircleGeometry(elem.radius, 32);
        circleGeo.rotateX(-Math.PI / 2);
        const circleMesh = new THREE.Mesh(circleGeo, this.materials.pathSand);
        circleMesh.position.set(elem.x, 0.02, elem.z);
        pathGroup.add(circleMesh);
        // Tanpa garis lingkaran border agar menyatu alami dengan jalan

      } else if (elem.type === 'segment') {
        const dx = elem.x2 - elem.x1;
        const dz = elem.z2 - elem.z1;
        const len = Math.hypot(dx, dz);
        const angle = Math.atan2(dx, dz);

        const midX = (elem.x1 + elem.x2) / 2;
        const midZ = (elem.z1 + elem.z2) / 2;

        const segGeo = new THREE.PlaneGeometry(elem.radius * 2, len + 0.2);
        segGeo.rotateX(-Math.PI / 2);
        const segMesh = new THREE.Mesh(segGeo, this.materials.pathSand);
        segMesh.position.set(midX, 0.02, midZ);
        segMesh.rotation.y = angle;
        pathGroup.add(segMesh);

        // Ujung bulat segmen
        const capGeo = new THREE.CircleGeometry(elem.radius, 16);
        capGeo.rotateX(-Math.PI / 2);
        const cap1 = new THREE.Mesh(capGeo, this.materials.pathSand);
        cap1.position.set(elem.x1, 0.02, elem.z1);
        pathGroup.add(cap1);

        const cap2 = new THREE.Mesh(capGeo, this.materials.pathSand);
        cap2.position.set(elem.x2, 0.02, elem.z2);
        pathGroup.add(cap2);
      }
    });
  }

  // 2. Membangun Area Pesta Taman Terbuka (Outdoor Garden Party - Berada di Luar Jalan)
  buildReferenceLocations() {
    this.buildWelcomeGate(0, 18);
    this.buildReceptionTent(-13.2, 7);            // Panggung Pelaminan Pesta Taman Terbuka di samping lingkaran (-9, 7)
    this.buildWoodenPhotoBooth(11.8, 7);           // Spot Foto Taman Terbuka di samping lingkaran (8, 7)
    this.buildCouplePaintingsSection(-11.5, -10); // Galeri Pameran Lukisan Foto Pasangan di samping checkpoint (-8, -10)
    this.buildGalleryDeck(11.8, -5);              // Panggung Galeri Foto Terbuka di samping lingkaran (8, -5)
    this.buildPondAndBridge(5, -12);             // Kolam Teratai & Jembatan Lengkung
    this.buildRsvpAltar(0, 6);                   // Meja Buku Tamu & Pagar Ayu di (0, 6) di tengah jalan
    this.buildMapKiosk(0, -2);                   // Pos Penunjuk Peta & Panduan Lokasi di (0, -2) di tengah jalan
  }

  // A. GERBANG SELAMAT DATANG (WELCOME GATE at 0, 18)
  buildWelcomeGate(x, z) {
    const gateGroup = new THREE.Group();
    gateGroup.position.set(x, 0, z);
    this.scene.add(gateGroup);

    // Dua Tiang Gerbang Kayu Rustic
    const postGeo = new THREE.CylinderGeometry(0.18, 0.22, 3.4, 8);
    const p1 = new THREE.Mesh(postGeo, this.materials.woodWarm);
    p1.position.set(-2.0, 1.7, 0);
    gateGroup.add(p1);

    const p2 = new THREE.Mesh(postGeo, this.materials.woodWarm);
    p2.position.set(2.0, 1.7, 0);
    gateGroup.add(p2);

    // Lengkungan Bunga Mawar Gerbang
    const archGeo = new THREE.TorusGeometry(2.0, 0.2, 8, 20, Math.PI);
    const arch = new THREE.Mesh(archGeo, this.materials.foliageGreen);
    arch.position.set(0, 2.7, 0);
    gateGroup.add(arch);

    // Bunga-Bunga Hiasan Melingkar
    for (let i = 0; i < 14; i++) {
      const angle = (i / 13) * Math.PI;
      const flower = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 6, 6),
        i % 2 === 0 ? this.materials.flowerRose : this.materials.flowerWhite
      );
      flower.position.set(Math.cos(angle) * 2.0, 2.7 + Math.sin(angle) * 2.0, 0.08);
      gateGroup.add(flower);
    }

    // Karpet Jalan Masuk
    const carpetGeo = new THREE.PlaneGeometry(1.8, 4.6);
    carpetGeo.rotateX(-Math.PI / 2);
    const carpet = new THREE.Mesh(carpetGeo, new THREE.MeshLambertMaterial({ color: 0xa83232 }));
    carpet.position.set(0, 0.028, 0);
    gateGroup.add(carpet);
  }

  // B. PELAMINAN PESTA TAMAN TERBUKA (OUTDOOR GARDEN RECEPTION - Berada di Luar Jalan)
  buildReceptionTent(x, z) {
    const tentGroup = new THREE.Group();
    tentGroup.position.set(x, 0, z);
    this.scene.add(tentGroup);

    // Dek Panggung Kayu Elegan di Rumput Taman (Tanpa dinding, terbuka 100%)
    const deckGeo = new THREE.CylinderGeometry(3.6, 3.8, 0.26, 24);
    const deck = new THREE.Mesh(deckGeo, this.materials.woodWarm);
    deck.position.y = 0.13;
    tentGroup.add(deck);

    // Karpet Merah Pelaminan Pesta Taman
    const carpetGeo = new THREE.CircleGeometry(2.6, 24);
    carpetGeo.rotateX(-Math.PI / 2);
    const carpet = new THREE.Mesh(carpetGeo, new THREE.MeshLambertMaterial({ color: 0x991b1b }));
    carpet.position.y = 0.265;
    tentGroup.add(carpet);

    // Pergola Kayu Rustic Terbuka (Atap Rangka Bunga Terbuka Tanpa Kain Penutup)
    const postCoords = [
      [-2.4, -2.0], [2.4, -2.0],
      [-2.4, 2.0], [2.4, 2.0]
    ];
    postCoords.forEach(c => {
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.12, 3.4, 8),
        this.materials.woodWarm
      );
      pole.position.set(c[0], 1.7, c[1]);
      tentGroup.add(pole);

      // Lentera Gantung Antik di Setiap Tiang
      this.addLantern(tentGroup, c[0], 2.8, c[1]);
    });

    // Balok Rangka Pergola Kayu di Atas (Terbuka langsung ke langit)
    const beam1 = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.14, 0.14), this.materials.woodWarm);
    beam1.position.set(0, 3.4, -2.0);
    tentGroup.add(beam1);

    const beam2 = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.14, 0.14), this.materials.woodWarm);
    beam2.position.set(0, 3.4, 2.0);
    tentGroup.add(beam2);

    // Untaian Sulur Bunga & Lampu Gantung Pesta Taman (Garden Fairylights & Floral Garland)
    for (let f = -2.2; f <= 2.2; f += 0.8) {
      const garland = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 4.0, 6),
        this.materials.foliageGreen
      );
      garland.rotateX(Math.PI / 2);
      garland.position.set(f, 3.35, 0);
      tentGroup.add(garland);

      // Lampu pijar pesta taman
      const bulb = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 6, 6),
        new THREE.MeshBasicMaterial({ color: 0xfef08a })
      );
      bulb.position.set(f, 3.1, (Math.random() - 0.5) * 3);
      tentGroup.add(bulb);
    }

    // Backdrop Pelaminan Bunga Terbuka di Belakang (Facing East towards checkpoint)
    const archBackdrop = new THREE.Mesh(
      new THREE.TorusGeometry(1.6, 0.18, 8, 24, Math.PI),
      this.materials.foliageGreen
    );
    archBackdrop.position.set(0, 1.8, -2.1);
    tentGroup.add(archBackdrop);

    // Mawar Hiasan Lengkungan
    for (let i = 0; i < 14; i++) {
      const ang = (i / 13) * Math.PI;
      const fl = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 6, 6),
        i % 2 === 0 ? this.materials.flowerRose : this.materials.flowerWhite
      );
      fl.position.set(Math.cos(ang) * 1.6, 1.8 + Math.sin(ang) * 1.6, -2.0);
      tentGroup.add(fl);
    }

    // Sofa Mewah Pelaminan Mempelai
    const sofa = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 0.65, 0.65),
      new THREE.MeshLambertMaterial({ color: 0xb45309 })
    );
    sofa.position.set(0, 0.55, -1.5);
    tentGroup.add(sofa);

    // Mempelai Pria (Arya) & Wanita (Nadia) Sedang Berdiri Ramah Menyambut Tamu
    const groomNpc = new Character3D('boy');
    groomNpc.group.position.set(-0.6, 0.26, -0.9);
    groomNpc.group.rotation.y = 0.35; // Menghadap ke arah pemain di jalan
    tentGroup.add(groomNpc.group);
    this.animatedDecorations.push(groomNpc);

    const brideNpc = new Character3D('girl');
    brideNpc.group.position.set(0.6, 0.26, -0.9);
    brideNpc.group.rotation.y = -0.35;
    tentGroup.add(brideNpc.group);
    this.animatedDecorations.push(brideNpc);

    // Meja Jamuan & Pot Bunga Pesta Taman
    this.addBarrelFlower(tentGroup, -3.2, 0.26, 1.8);
    this.addBarrelFlower(tentGroup, 3.2, 0.26, 1.8);
  }

  // C. SPOT PHOTOBOOTH TAMAN TERBUKA (OUTDOOR PHOTO SPOT - Berada di Luar Jalan)
  buildWoodenPhotoBooth(x, z) {
    const pbGroup = new THREE.Group();
    pbGroup.position.set(x, 0, z);
    this.scene.add(pbGroup);

    // Dek Kayu Spot Foto di Rumput
    const baseGeo = new THREE.BoxGeometry(3.0, 0.22, 3.0);
    const base = new THREE.Mesh(baseGeo, this.materials.woodWarm);
    base.position.y = 0.11;
    pbGroup.add(base);

    // Tiang Pergola Terbuka dengan Hiasan Lampu Taman
    const postCoords = [
      [-1.3, -1.3], [1.3, -1.3],
      [-1.3, 1.3], [1.3, 1.3]
    ];
    postCoords.forEach(c => {
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.1, 2.8, 8),
        this.materials.woodDark
      );
      pole.position.set(c[0], 1.4, c[1]);
      pbGroup.add(pole);
    });

    // Balok Pergola Kayu Terbuka
    const beam = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.12, 3.2), this.materials.woodWarm);
    beam.position.y = 2.8;
    pbGroup.add(beam);

    // Backdrop Rustic Bingkai Kayu & Mawar Cantik di Sisi Luar
    const backdropFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 2.2, 2.2),
      this.materials.woodFence
    );
    backdropFrame.position.set(1.3, 1.4, 0);
    pbGroup.add(backdropFrame);

    // Kamera Antik Vintage di Atas Tripod di Sisi Samping
    const tripod = new THREE.Mesh(
      new THREE.ConeGeometry(0.3, 1.2, 3, 1, true),
      this.materials.woodDark
    );
    tripod.position.set(-1.0, 0.6, 0);
    pbGroup.add(tripod);

    const cameraBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.25, 0.35),
      this.materials.goldAcsent
    );
    cameraBox.position.set(-1.0, 1.3, 0);
    pbGroup.add(cameraBox);

    const cameraLens = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, 0.15, 12),
      this.materials.woodDark
    );
    cameraLens.rotateZ(Math.PI / 2);
    cameraLens.position.set(-0.8, 1.3, 0);
    pbGroup.add(cameraLens);

    // Lentera Gantung & Barel Bunga
    this.addLantern(pbGroup, -1.2, 2.5, 1.2);
    this.addLantern(pbGroup, 1.2, 2.5, 1.2);
    this.addBarrelFlower(pbGroup, 1.4, 0.22, 1.4);
  }

  // Helper: Membuat Tekstur Kanvas Lukisan Pasangan Beresolusi Tinggi
  createPaintingTexture(type, title, subtitle) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 640;
    const ctx = canvas.getContext('2d');

    // Gradasi Latar Mewah Sesuai Karakter
    let grad = ctx.createLinearGradient(0, 0, 512, 640);
    if (type === 'groom') {
      grad.addColorStop(0, '#1e293b');
      grad.addColorStop(0.6, '#0f172a');
      grad.addColorStop(1, '#020617');
    } else if (type === 'bride') {
      grad.addColorStop(0, '#fff1f2');
      grad.addColorStop(0.5, '#fce7f3');
      grad.addColorStop(1, '#f43f5e');
    } else {
      // Pasangan Berdua (Royal Burgundy & Amethyst)
      grad.addColorStop(0, '#4c0519');
      grad.addColorStop(0.5, '#701a75');
      grad.addColorStop(1, '#1e1b4b');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 640);

    // Bingkai Ornamen Emas (Gold Foil Framing)
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 14;
    ctx.strokeRect(18, 18, 512 - 36, 640 - 36);

    ctx.strokeStyle = 'rgba(255, 223, 0, 0.5)';
    ctx.lineWidth = 3;
    ctx.strokeRect(30, 30, 512 - 60, 640 - 60);

    // Corner Ornaments
    const drawCorner = (cx, cy) => {
      ctx.fillStyle = '#d4af37';
      ctx.beginPath();
      ctx.arc(cx, cy, 9, 0, Math.PI * 2);
      ctx.fill();
    };
    drawCorner(30, 30);
    drawCorner(512 - 30, 30);
    drawCorner(30, 640 - 30);
    drawCorner(512 - 30, 640 - 30);

    // Ilustrasi / Potret Artistik
    if (type === 'groom') {
      ctx.fillStyle = '#ffffff';
      ctx.font = '84px serif';
      ctx.textAlign = 'center';
      ctx.fillText('🤵', 256, 250);

      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText('THE GROOM', 256, 330);

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'italic 20px serif';
      ctx.fillText('Arya Wicaksono, S.T.', 256, 370);
    } else if (type === 'bride') {
      ctx.fillStyle = '#ffffff';
      ctx.font = '84px serif';
      ctx.textAlign = 'center';
      ctx.fillText('👰', 256, 250);

      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText('THE BRIDE', 256, 330);

      ctx.fillStyle = '#831843';
      ctx.font = 'italic 20px serif';
      ctx.fillText('Nadia Larasati, M.Ds.', 256, 370);
    } else {
      // Mempelai Berdua
      ctx.fillStyle = '#ffffff';
      ctx.font = '76px serif';
      ctx.textAlign = 'center';
      ctx.fillText('💍 💐 💍', 256, 230);

      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 36px serif';
      ctx.fillText('Arya & Nadia', 256, 310);

      ctx.fillStyle = '#fbcfe8';
      ctx.font = 'italic 22px serif';
      ctx.fillText('Eternal Love & Harmony', 256, 355);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '16px sans-serif';
      ctx.fillText('• 24 Oktober 2026 •', 256, 390);
    }

    // Plat Nama Emas di Bagian Bawah Kanvas
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(45, 470, 512 - 90, 120);
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2;
    ctx.strokeRect(45, 470, 512 - 90, 120);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px serif';
    ctx.fillText(title, 256, 520);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '19px sans-serif';
    ctx.fillText(subtitle, 256, 560);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  // Helper: Membuat Standing Easel Kayu 3D dengan Lukisan Berbingkai Emas
  createEaselPainting(type, title, subtitle, isMain = false) {
    const easelGroup = new THREE.Group();
    const scale = isMain ? 1.28 : 1.0;

    const woodMat = this.materials.woodWarm;
    const goldMat = new THREE.MeshLambertMaterial({ color: 0xd4af37 });

    // 1. Tripod Kaki Kayu Easel (Kiri, Kanan, dan Penyangga Belakang)
    const legGeo = new THREE.CylinderGeometry(0.04 * scale, 0.045 * scale, 2.7 * scale, 6);

    const legLeft = new THREE.Mesh(legGeo, woodMat);
    legLeft.position.set(-0.55 * scale, 1.3 * scale, 0);
    legLeft.rotation.z = -0.15;
    legLeft.rotation.x = -0.12;
    easelGroup.add(legLeft);

    const legRight = new THREE.Mesh(legGeo, woodMat);
    legRight.position.set(0.55 * scale, 1.3 * scale, 0);
    legRight.rotation.z = 0.15;
    legRight.rotation.x = -0.12;
    easelGroup.add(legRight);

    const legBack = new THREE.Mesh(legGeo, woodMat);
    legBack.position.set(0, 1.3 * scale, -0.65 * scale);
    legBack.rotation.x = 0.28;
    easelGroup.add(legBack);

    // Tiang Tengah Vertikal
    const spineGeo = new THREE.CylinderGeometry(0.035 * scale, 0.035 * scale, 2.8 * scale, 6);
    const spine = new THREE.Mesh(spineGeo, woodMat);
    spine.position.set(0, 1.4 * scale, -0.12 * scale);
    spine.rotation.x = -0.12;
    easelGroup.add(spine);

    // Dudukan / Rak Penyangga Kanvas
    const shelfGeo = new THREE.BoxGeometry(1.6 * scale, 0.08 * scale, 0.14 * scale);
    const shelf = new THREE.Mesh(shelfGeo, woodMat);
    shelf.position.set(0, 0.95 * scale, 0.05 * scale);
    shelf.rotation.x = -0.12;
    easelGroup.add(shelf);

    // 2. Bingkai Emas Mewah Lukisan (Gold Frame)
    const canvasWidth = 1.25 * scale;
    const canvasHeight = 1.55 * scale;
    const frameDepth = 0.07 * scale;

    const frameGeo = new THREE.BoxGeometry(canvasWidth + 0.12 * scale, canvasHeight + 0.12 * scale, frameDepth);
    const frameMesh = new THREE.Mesh(frameGeo, goldMat);
    frameMesh.position.set(0, (0.95 + canvasHeight / 2) * scale, 0.08 * scale);
    frameMesh.rotation.x = -0.12;
    easelGroup.add(frameMesh);

    // 3. Kanvas Lukisan Potret
    const paintingTexture = this.createPaintingTexture(type, title, subtitle);
    const canvasMat = new THREE.MeshBasicMaterial({ map: paintingTexture });
    const canvasGeo = new THREE.PlaneGeometry(canvasWidth, canvasHeight);
    const canvasMesh = new THREE.Mesh(canvasGeo, canvasMat);
    canvasMesh.position.set(0, 0, frameDepth / 2 + 0.005);
    frameMesh.add(canvasMesh);

    // 4. Hiasan Bunga Mawar di Pojok Bingkai
    const flowerAccent = new THREE.Mesh(
      new THREE.SphereGeometry(0.12 * scale, 6, 6),
      type === 'groom' ? this.materials.flowerYellow : (type === 'bride' ? this.materials.flowerPink : this.materials.flowerRose)
    );
    flowerAccent.position.set(canvasWidth / 2, canvasHeight / 2, frameDepth / 2 + 0.04);
    frameMesh.add(flowerAccent);

    // Pot Bunga Segar di Kaki Easel
    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18 * scale, 0.14 * scale, 0.32 * scale, 8),
      this.materials.pathBorder
    );
    pot.position.set(0.65 * scale, 0.16 * scale, 0.2 * scale);
    easelGroup.add(pot);

    const potRose = new THREE.Mesh(
      new THREE.SphereGeometry(0.2 * scale, 6, 6),
      this.materials.flowerRose
    );
    potRose.position.set(0.65 * scale, 0.38 * scale, 0.2 * scale);
    easelGroup.add(potRose);

    return easelGroup;
  }

  // D. GALERI PAMERAN LUKISAN FOTO PASANGAN (OUTDOOR PREWEDDING ART EXHIBITION)
  // Menampilkan lukisan-lukisan potret kedua mempelai di taman samping check point (-8, -10)
  buildCouplePaintingsSection(x, z) {
    const galleryGroup = new THREE.Group();
    galleryGroup.position.set(x, 0, z);
    this.scene.add(galleryGroup);

    // Karpet Beludru Merah Galeri Seni Terbuka di Rumput
    const carpetGeo = new THREE.PlaneGeometry(3.6, 5.8);
    carpetGeo.rotateX(-Math.PI / 2);
    const carpet = new THREE.Mesh(carpetGeo, new THREE.MeshLambertMaterial({ color: 0x851c27 }));
    carpet.position.set(0, 0.025, 0);
    galleryGroup.add(carpet);

    // List Tepi Emas Karpet Pameran
    const borderGeo = new THREE.PlaneGeometry(3.8, 6.0);
    borderGeo.rotateX(-Math.PI / 2);
    const border = new THREE.Mesh(borderGeo, new THREE.MeshLambertMaterial({ color: 0xd4af37 }));
    border.position.set(0, 0.02, 0);
    galleryGroup.add(border);

    // 1. Lukisan Utama Mempelai Berdua (Center - Besar, menghadap ke arah jalan +X)
    const couplePainting = this.createEaselPainting('couple', 'Arya & Nadia', 'Eternal Harmony', true);
    couplePainting.position.set(0, 0, 0);
    couplePainting.rotation.y = Math.PI / 2; // Menghadap langsung ke jalan setapak tempat pemain berdiri
    galleryGroup.add(couplePainting);

    // 2. Lukisan Mempelai Wanita (Bride - Sisi Kanan/Utara, sedikit melengkung ke pemain)
    const bridePainting = this.createEaselPainting('bride', 'Nadia Larasati', 'The Bride', false);
    bridePainting.position.set(0.35, 0, -1.8);
    bridePainting.rotation.y = Math.PI / 2 + 0.22;
    galleryGroup.add(bridePainting);

    // 3. Lukisan Mempelai Pria (Groom - Sisi Kiri/Selatan, sedikit melengkung ke pemain)
    const groomPainting = this.createEaselPainting('groom', 'Arya Wicaksono', 'The Groom', false);
    groomPainting.position.set(0.35, 0, 1.8);
    groomPainting.rotation.y = Math.PI / 2 - 0.22;
    galleryGroup.add(groomPainting);

    // Taburan Bunga Mawar & Vas Elegan di Sepanjang Sisi Depan Pameran
    for (let fz = -2.6; fz <= 2.6; fz += 0.9) {
      const flower = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 6, 6),
        Math.abs(fz) % 2 === 0 ? this.materials.flowerRose : this.materials.flowerWhite
      );
      flower.position.set(1.6, 0.08, fz);
      galleryGroup.add(flower);
    }

    // Dua Lentera Taman Antik Menerangi Galeri Pameran Lukisan
    this.addLantern(galleryGroup, -0.6, 2.4, -2.4);
    this.addLantern(galleryGroup, -0.6, 2.4, 2.4);
  }

  // E. PANGGUNG GALERI FOTO TERBUKA (OUTDOOR GALLERY DECK - Berada di Luar Jalan)
  buildGalleryDeck(x, z) {
    const galGroup = new THREE.Group();
    galGroup.position.set(x, 0, z);
    this.scene.add(galGroup);

    // Dek Panggung Kayu Terbuka
    const deckGeo = new THREE.BoxGeometry(3.6, 0.3, 3.2);
    const deck = new THREE.Mesh(deckGeo, this.materials.woodWarm);
    deck.position.y = 0.15;
    galGroup.add(deck);

    // Tiang Pergola Kayu Terbuka
    const postGeo = new THREE.CylinderGeometry(0.1, 0.1, 2.6, 8);
    const posts = [
      [-1.5, -1.3], [1.5, -1.3],
      [-1.5, 1.3], [1.5, 1.3]
    ];
    posts.forEach(p => {
      const col = new THREE.Mesh(postGeo, this.materials.woodWarm);
      col.position.set(p[0], 1.35, p[1]);
      galGroup.add(col);
    });

    // Balok Atap Pergola
    const beamGeo = new THREE.BoxGeometry(3.6, 0.12, 3.2);
    const beam = new THREE.Mesh(beamGeo, this.materials.woodWarm);
    beam.position.y = 2.65;
    galGroup.add(beam);

    // Sulur Daun & Lampu Gantung Pesta Taman
    const foliageRoof = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 0.15, 3.4),
      this.materials.foliageGreen
    );
    foliageRoof.position.y = 2.75;
    galGroup.add(foliageRoof);

    // Bingkai Foto Prewedding Terpajang di Sisi Belakang
    const frameGeo = new THREE.BoxGeometry(1.2, 1.4, 0.08);
    const frame = new THREE.Mesh(frameGeo, this.materials.woodFence);
    frame.position.set(0, 1.5, -1.2);
    galGroup.add(frame);

    // Pot Bunga di Sudut Panggung
    this.addBarrelFlower(galGroup, -1.6, 0.3, 1.4);
    this.addBarrelFlower(galGroup, 1.6, 0.3, 1.4);
  }

  // F. KOLAM RENANG / TERATAI & JEMBATAN LENGKUNG DI ATAS TREK JALAN
  buildPondAndBridge(x, z) {
    const pondGroup = new THREE.Group();
    pondGroup.position.set(x, 0, z);
    this.scene.add(pondGroup);

    // Kolam Air Biru Jernih Oval di Sisi Jalur
    const pondGeo = new THREE.CylinderGeometry(3.2, 3.2, 0.12, 24);
    pondGeo.scale(1.25, 1, 0.95);
    const pond = new THREE.Mesh(pondGeo, this.materials.waterPond);
    pond.position.set(0.5, 0.04, 0.5);
    pondGroup.add(pond);

    // Batuan Alam Mengelilingi Kolam
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2;
      const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.28 + Math.random() * 0.12),
        this.materials.pathBorder
      );
      rock.position.set(
        0.5 + Math.cos(angle) * 3.8,
        0.14,
        0.5 + Math.sin(angle) * 2.8
      );
      pondGroup.add(rock);
    }

    // Daun Teratai (Lilypads) & Bunga Teratai
    for (let i = 0; i < 6; i++) {
      const pad = new THREE.Mesh(
        new THREE.CircleGeometry(0.32, 12),
        this.materials.lilypad
      );
      pad.rotateX(-Math.PI / 2);
      const px = 0.5 + (Math.random() - 0.5) * 3.8;
      const pz = 0.5 + (Math.random() - 0.5) * 2.5;
      pad.position.set(px, 0.11, pz);
      pondGroup.add(pad);

      if (i % 2 === 0) {
        const lotus = new THREE.Mesh(
          new THREE.DodecahedronGeometry(0.1),
          this.materials.flowerPink
        );
        lotus.position.set(px, 0.18, pz);
        pondGroup.add(lotus);
      }
    }

    // JEMBATAN KAYU MELINTASI JALUR (Dari segmen jalan 7, -9 ke 4, -13)
    const bridgeGroup = new THREE.Group();
    bridgeGroup.position.set(0.5, 0, 1.0);
    const bridgeAngle = Math.atan2(-3, -4);
    bridgeGroup.rotation.y = bridgeAngle;
    pondGroup.add(bridgeGroup);

    // Lantai Papan Jembatan Melengkung
    const plankCount = 14;
    const bridgeLength = 5.0;
    const bridgeWidth = 1.6;

    for (let i = 0; i < plankCount; i++) {
      const t = i / (plankCount - 1);
      const bz = (t - 0.5) * bridgeLength;
      const by = Math.sin(t * Math.PI) * 0.38 + 0.12;

      const plank = new THREE.Mesh(
        new THREE.BoxGeometry(bridgeWidth, 0.08, 0.32),
        i % 2 === 0 ? this.materials.woodWarm : this.materials.woodDark
      );
      plank.position.set(0, by, bz);
      const slope = Math.cos(t * Math.PI) * 0.25;
      plank.rotation.x = -slope;
      bridgeGroup.add(plank);
    }

    // Pegangan / Pagar Jembatan (Railing) Kiri & Kanan
    [-bridgeWidth / 2 + 0.06, bridgeWidth / 2 - 0.06].forEach(sideX => {
      for (let j = 0; j <= 6; j++) {
        const t = j / 6;
        const bz = (t - 0.5) * bridgeLength;
        const by = Math.sin(t * Math.PI) * 0.38 + 0.12;
        const post = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.04, 0.7, 6),
          this.materials.woodFence
        );
        post.position.set(sideX, by + 0.35, bz);
        bridgeGroup.add(post);
      }

      const topRail = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.08, bridgeLength),
        this.materials.woodDark
      );
      topRail.position.set(sideX, 0.8, 0);
      bridgeGroup.add(topRail);
    });
  }

  // G. ALTAR BUKU TAMU & RSVP (OUTDOOR RECEPTION DESK - Berada di Tengah Jalan Checkpoint)
  buildRsvpAltar(x, z) {
    const rsvpGroup = new THREE.Group();
    rsvpGroup.position.set(x, 0, z);
    this.scene.add(rsvpGroup);

    // Meja Resepsionis Kayu Pedesaan di Tengah Jalur
    const deskGeo = new THREE.BoxGeometry(1.8, 0.75, 0.65);
    const desk = new THREE.Mesh(deskGeo, this.materials.woodWarm);
    desk.position.set(0, 0.375, -0.45);
    rsvpGroup.add(desk);

    // Taplak Meja Krem Elegan
    const clothGeo = new THREE.BoxGeometry(1.86, 0.4, 0.7);
    const cloth = new THREE.Mesh(clothGeo, this.materials.tentFabric);
    cloth.position.set(0, 0.58, -0.45);
    rsvpGroup.add(cloth);

    // Kotak Angpao Emas & Buku Tamu
    const mailbox = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.38, 0.3),
      this.materials.goldAcsent
    );
    mailbox.position.set(-0.35, 0.92, -0.45);
    rsvpGroup.add(mailbox);

    const book = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.06, 0.32),
      this.materials.plaqueBg
    );
    book.position.set(0.25, 0.81, -0.45);
    rsvpGroup.add(book);

    // Rangkaian Bunga Segar di Meja Penerima Tamu
    [-0.75, 0.75].forEach(sideX => {
      const vase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.1, 0.28, 8),
        this.materials.pathBorder
      );
      vase.position.set(sideX, 0.88, -0.45);
      rsvpGroup.add(vase);

      const flowers = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 6, 6),
        this.materials.flowerRose
      );
      flowers.position.set(sideX, 1.05, -0.45);
      rsvpGroup.add(flowers);
    });

    // Lentera Meja Hangat
    this.addLantern(rsvpGroup, 0, 1.15, -0.45);

    // PAGAR AYU (Penerima Tamu Berbusana Anggun Cantik Tradisional Berdiri di Sisi Kiri & Kanan Meja di Tengah Jalan)
    const pagarAyuL = new Character3D('pagar_ayu');
    pagarAyuL.group.position.set(-1.0, 0, -0.3);
    pagarAyuL.group.rotation.y = 0.2; // Menyambut ramah para tamu yang berjalan datang
    rsvpGroup.add(pagarAyuL.group);
    this.animatedDecorations.push(pagarAyuL);

    const pagarAyuR = new Character3D('pagar_ayu');
    pagarAyuR.group.position.set(1.0, 0, -0.3);
    pagarAyuR.group.rotation.y = -0.2; // Menyambut ramah para tamu yang berjalan datang
    rsvpGroup.add(pagarAyuR.group);
    this.animatedDecorations.push(pagarAyuR);
  }

  // H. POS PENUNJUK PETA & PANDUAN LOKASI (OUTDOOR MAP & NAVIGATION KIOSK)
  // Menampilkan papan peta taman bergaya vintage & penunjuk arah 3D pin peta di (0, -2)
  buildMapKiosk(x, z) {
    const kioskGroup = new THREE.Group();
    kioskGroup.position.set(x, 0, z);
    this.scene.add(kioskGroup);

    // 1. Tiang Penunjuk Arah Utama (Main Directional Signpost)
    const poleGeo = new THREE.CylinderGeometry(0.1, 0.12, 3.4, 8);
    const pole = new THREE.Mesh(poleGeo, this.materials.woodDark);
    pole.position.set(0, 1.7, 0);
    kioskGroup.add(pole);

    // Finial Puncak Tiang
    const finial = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 8, 8),
      this.materials.goldAcsent
    );
    finial.position.set(0, 3.45, 0);
    kioskGroup.add(finial);

    // 2. PENUNJUK PETA 3D MERAH BESAR (3D Red Map Pin "📍")
    const pinGroup = new THREE.Group();
    pinGroup.position.set(0, 3.9, 0);
    kioskGroup.add(pinGroup);

    const pinMat = new THREE.MeshLambertMaterial({ color: 0xef4444 });
    const pinCone = new THREE.Mesh(
      new THREE.ConeGeometry(0.24, 0.55, 16),
      pinMat
    );
    pinCone.rotation.x = Math.PI; // Ujung runcing mengarah ke bawah ke tiang
    pinCone.position.set(0, 0, 0);
    pinGroup.add(pinCone);

    const pinHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.36, 16, 16),
      pinMat
    );
    pinHead.position.set(0, 0.38, 0);
    pinGroup.add(pinHead);

    const pinDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    pinDot.position.set(0, 0.38, 0.28);
    pinGroup.add(pinDot);

    // Animasi rotasi / getar lembut penunjuk pin peta
    this.animatedDecorations.push({
      updateAnimation: (delta) => {
        pinGroup.rotation.y += delta * 1.5;
        pinGroup.position.y = 3.9 + Math.sin(Date.now() * 0.003) * 0.12;
      }
    });

    // 3. Papan Panah Penunjuk Arah (Directional Arrow Planks)
    const createSignPlank = (text, y, rotY) => {
      const plankGroup = new THREE.Group();
      plankGroup.position.set(0, y, 0);
      plankGroup.rotation.y = rotY;

      const plankGeo = new THREE.BoxGeometry(1.6, 0.28, 0.07);
      const plankMesh = new THREE.Mesh(plankGeo, this.materials.woodWarm);
      plankMesh.position.set(0.65, 0, 0);
      plankGroup.add(plankMesh);

      // Canvas Tulisan Arah Panah
      const signCanvas = document.createElement('canvas');
      signCanvas.width = 256;
      signCanvas.height = 64;
      const sctx = signCanvas.getContext('2d');
      sctx.fillStyle = '#ffffff';
      sctx.fillRect(0, 0, 256, 64);
      sctx.strokeStyle = '#000000';
      sctx.lineWidth = 4;
      sctx.strokeRect(2, 2, 252, 60);
      sctx.font = 'bold 22px sans-serif';
      sctx.fillStyle = '#000000';
      sctx.textAlign = 'center';
      sctx.textBaseline = 'middle';
      sctx.fillText(text, 128, 32);

      const signTex = new THREE.CanvasTexture(signCanvas);
      const signLabel = new THREE.Mesh(
        new THREE.PlaneGeometry(1.5, 0.24),
        new THREE.MeshBasicMaterial({ map: signTex })
      );
      signLabel.position.set(0.65, 0, 0.04);
      plankGroup.add(signLabel);

      return plankGroup;
    };

    kioskGroup.add(createSignPlank('⬅ RESEPSI', 2.9, -Math.PI / 2));
    kioskGroup.add(createSignPlank('PHOTOBOOTH ➡', 2.5, Math.PI / 2));
    kioskGroup.add(createSignPlank('⬆ LUKISAN', 2.1, 0));
    kioskGroup.add(createSignPlank('⬇ BUKU TAMU & RSVP', 1.7, Math.PI));

    // 4. Dekorasi Kaki Tiang & Lentera Antik (Tanpa meja, murni tiang tugu penunjuk arah & pin peta 3D)
    const baseGeo = new THREE.CylinderGeometry(0.5, 0.6, 0.25, 12);
    const base = new THREE.Mesh(baseGeo, this.materials.pathBorder);
    base.position.y = 0.125;
    kioskGroup.add(base);

    // Lentera Gantung Antik di Sisi Kiri & Kanan Tiang
    this.addLantern(kioskGroup, -0.65, 2.3, 0);
    this.addLantern(kioskGroup, 0.65, 2.3, 0);

    // Barel Bunga Cantik di Kaki Tiang Penunjuk
    this.addBarrelFlower(kioskGroup, -0.85, 0, 0);
    this.addBarrelFlower(kioskGroup, 0.85, 0, 0);
  }

  // 3. Pagar Kayu Pedesaan di Sepanjang Jalur (Seperti di Referensi Gambar)
  buildFencesAndBorders() {
    const fenceGroup = new THREE.Group();
    this.scene.add(fenceGroup);

    // Titik-titik pagar kayu di pinggiran jalan taman
    const fenceSegments = [
      // Sisi kanan lorong utama
      { x1: 2.3, z1: 16, x2: 2.3, z2: 9 },
      // Sisi kiri lorong utama
      { x1: -2.3, z1: 16, x2: -2.3, z2: 9 },
      // Pagar dekat Tenda Resepsi
      { x1: -5.5, z1: 9.5, x2: -12.5, z2: 9.5 },
      // Pagar dekat Booth Foto
      { x1: 5.5, z1: 9.5, x2: 10.5, z2: 9.5 },
      // Pagar dekat Galeri Foto
      { x1: 10.5, z1: -2, x2: 10.5, z2: -8 }
    ];

    fenceSegments.forEach(seg => {
      const dist = Math.hypot(seg.x2 - seg.x1, seg.z2 - seg.z1);
      const postsCount = Math.floor(dist / 0.9) + 1;

      for (let i = 0; i < postsCount; i++) {
        const t = i / (postsCount - 1);
        const px = seg.x1 + t * (seg.x2 - seg.x1);
        const pz = seg.z1 + t * (seg.z2 - seg.z1);

        // Tiang Pagar
        const post = new THREE.Mesh(
          new THREE.BoxGeometry(0.12, 0.65, 0.12),
          this.materials.woodFence
        );
        post.position.set(px, 0.325, pz);
        fenceGroup.add(post);
      }

      // Palang Rel Pagar (Cross Rails)
      const midX = (seg.x1 + seg.x2) / 2;
      const midZ = (seg.z1 + seg.z2) / 2;
      const angle = Math.atan2(seg.x2 - seg.x1, seg.z2 - seg.z1);

      const rail1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.08, dist),
        this.materials.woodFence
      );
      rail1.position.set(midX, 0.45, midZ);
      rail1.rotation.y = angle;
      fenceGroup.add(rail1);

      const rail2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.08, dist),
        this.materials.woodFence
      );
      rail2.position.set(midX, 0.25, midZ);
      rail2.rotation.y = angle;
      fenceGroup.add(rail2);
    });
  }

  // 4. Papan Penanda RPG Mengambang di Atas Area (+ PASANGAN, + GALERI, dll)
  // Teks penanda section berwarna HITAM tebal berlatar bersih dengan bingkai agar sangat mudah terbaca
  buildFloatingPlaques() {
    const plaqueGroup = new THREE.Group();
    this.scene.add(plaqueGroup);

    WEDDING_CONFIG.locations.forEach(loc => {
      if (!loc.label) return;

      const plaque = new THREE.Group();
      plaque.position.set(loc.position.x, 3.4, loc.position.z);

      // Papan Putih Bersih RPG dengan Bingkai Emas & Kayu
      const boardGeo = new THREE.BoxGeometry(2.4, 0.62, 0.08);
      const board = new THREE.Mesh(boardGeo, new THREE.MeshLambertMaterial({ color: 0xffffff }));
      plaque.add(board);

      // Bingkai Luar Kayu Gelap
      const frameGeo = new THREE.BoxGeometry(2.48, 0.7, 0.06);
      const frame = new THREE.Mesh(frameGeo, this.materials.woodDark);
      frame.position.z = -0.01;
      plaque.add(frame);

      // Canvas Tekstur Tulisan Label Beresolusi Tinggi (Warna HITAM Pekat)
      const textCanvas = document.createElement('canvas');
      textCanvas.width = 512;
      textCanvas.height = 128;
      const ctx = textCanvas.getContext('2d');

      // Latar Putih Bersih
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 512, 128);

      // Border List Ganda Hitam & Emas
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 8;
      ctx.strokeRect(4, 4, 504, 120);

      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 4;
      ctx.strokeRect(10, 10, 492, 108);

      // Teks HITAM Tebal Pekat Agar Sangat Jelas Terbaca dari Sudut Kamera Jauh
      ctx.font = '900 46px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(loc.label, 256, 64);

      const textTexture = new THREE.CanvasTexture(textCanvas);
      textTexture.colorSpace = THREE.SRGBColorSpace;
      const labelMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2.3, 0.54),
        new THREE.MeshBasicMaterial({ map: textTexture })
      );
      labelMesh.position.z = 0.045;
      plaque.add(labelMesh);

      // Tilt menghadap sudut pandang kamera top-down
      plaque.rotation.x = -Math.PI / 3.8;

      plaqueGroup.add(plaque);
      this.floatingLabels.push(plaque);
    });
  }

  // 5. Alam & Pepohonan Subur (Cherry Blossoms & Pohon Rindang di Luar Jalur)
  buildFloraAndNature() {
    // Seluruh pohon diletakkan di batas luar taman, tidak ada yang berada di tengah jalan
    const treePositions = [
      { x: -5.5, z: 15 }, { x: 5.5, z: 15 },
      { x: -6.0, z: 11 }, { x: 6.0, z: 11 },
      { x: -14, z: 12 }, { x: 13, z: 12 },
      { x: -15, z: 2 }, { x: 14, z: 2 },
      { x: -14, z: -15 }, { x: 13, z: -15 },
      { x: -2, z: -16 }, { x: 10, z: -16 }
    ];

    treePositions.forEach(pos => {
      this.createShadedTree(pos.x, pos.z);
    });

    // Semak Bunga Berwarna-Warni di Sepanjang Pagar Lorong Masuk (Hanya z >= 9.5)
    this.createLushBushes();

    // Partikel Kelopak Bunga Berterbangan
    this.createFloatingPetals();
  }

  createLushBushes() {
    const bushGeo = new THREE.DodecahedronGeometry(0.45);
    const colors = [this.materials.flowerRose, this.materials.flowerPink, this.materials.flowerWhite, this.materials.flowerYellow];

    // Semak di sisi kiri dan kanan jalan hanya di lorong gerbang masuk (z = 16 s/d 9.5) agar tidak menghalangi jalan persimpangan
    for (let z = 16; z >= 9.5; z -= 1.8) {
      // Sisi kiri luar pagar
      const bL = new THREE.Mesh(bushGeo, colors[Math.abs(Math.floor(z)) % colors.length]);
      bL.position.set(-2.8, 0.35, z);
      this.scene.add(bL);

      // Sisi kanan luar pagar
      const bR = new THREE.Mesh(bushGeo, colors[(Math.abs(Math.floor(z)) + 1) % colors.length]);
      bR.position.set(2.8, 0.35, z);
      this.scene.add(bR);
    }
  }

  createShadedTree(x, z) {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(x, 0, z);
    this.scene.add(treeGroup);

    // Batang Pohon
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.35, 2.4, 8),
      this.materials.woodDark
    );
    trunk.position.y = 1.2;
    treeGroup.add(trunk);

    // Dedaunan Berlapis
    const leafMat = (Math.abs(x + z) % 2 === 0) ? this.materials.foliageGreen : this.materials.foliageDark;

    const t1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.6), leafMat);
    t1.position.y = 2.9;
    treeGroup.add(t1);

    const t2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.2), leafMat);
    t2.position.set(0.4, 3.4, 0.3);
    treeGroup.add(t2);
  }

  createFloatingPetals() {
    const petalCount = 45;
    const petalGeo = new THREE.PlaneGeometry(0.12, 0.12);
    const petalMat = new THREE.MeshBasicMaterial({
      color: 0xf472b6,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });

    const petalGroup = new THREE.Group();
    this.petals = [];

    for (let i = 0; i < petalCount; i++) {
      const p = new THREE.Mesh(petalGeo, petalMat);
      p.position.set(
        (Math.random() - 0.5) * 32,
        0.5 + Math.random() * 4.0,
        (Math.random() - 0.5) * 32
      );
      p.userData = {
        speedY: 0.2 + Math.random() * 0.25,
        speedX: 0.25 + Math.random() * 0.3,
        rotSpeed: 0.8 + Math.random() * 1.0
      };
      petalGroup.add(p);
      this.petals.push(p);
    }

    this.scene.add(petalGroup);
  }

  addLantern(parent, x, y, z) {
    const lanternGroup = new THREE.Group();
    lanternGroup.position.set(x, y, z);
    parent.add(lanternGroup);

    const cage = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 0.3, 0.24),
      this.materials.woodDark
    );
    lanternGroup.add(cage);

    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xfef08a })
    );
    lanternGroup.add(bulb);
  }

  addBarrelFlower(parent, x, y, z) {
    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.3, 0.5, 10),
      this.materials.woodWarm
    );
    barrel.position.set(x, y, z);
    parent.add(barrel);

    const bush = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 8, 8),
      this.materials.flowerRose
    );
    bush.position.set(x, y + 0.35, z);
    parent.add(bush);
  }

  // 6. Pencahayaan & Suasana Alami Romantis
  buildLightingAndAtmosphere() {
    const ambientLight = new THREE.AmbientLight(0xfff7ed, 0.82);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffedd5, 0.95);
    sunLight.position.set(14, 22, 16);
    this.scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x84cc16, 0.45);
    this.scene.add(hemiLight);
  }

  update(delta) {
    if (this.petals) {
      this.petals.forEach(p => {
        p.position.y -= p.userData.speedY * delta;
        p.position.x += Math.sin(p.position.y * 2) * p.userData.speedX * delta;
        p.rotation.x += p.userData.rotSpeed * delta;
        p.rotation.y += p.userData.rotSpeed * 0.8 * delta;

        if (p.position.y < 0.1) {
          p.position.y = 4.2;
          p.position.x = (Math.random() - 0.5) * 32;
          p.position.z = (Math.random() - 0.5) * 32;
        }
      });
    }

    // Animasi idle NPC Pengantin & Pagar Ayu
    if (this.animatedDecorations && this.animatedDecorations.length > 0) {
      this.animatedDecorations.forEach(npc => {
        if (npc && npc.updateAnimation) {
          npc.updateAnimation(delta, { x: 0, z: 0 }, false);
        }
      });
    }

    // Animasi naik-turun halus pada papan penanda RPG
    if (this.floatingLabels) {
      const time = Date.now() * 0.0025;
      this.floatingLabels.forEach((label, idx) => {
        label.position.y = 3.2 + Math.sin(time + idx) * 0.08;
      });
    }
  }
}
