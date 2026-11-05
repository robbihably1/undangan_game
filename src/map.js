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

        // Pinggiran batu bata / tanah halus
        const borderGeo = new THREE.RingGeometry(elem.radius - 0.15, elem.radius + 0.08, 32);
        borderGeo.rotateX(-Math.PI / 2);
        const borderMesh = new THREE.Mesh(borderGeo, this.materials.pathBorder);
        borderMesh.position.set(elem.x, 0.025, elem.z);
        pathGroup.add(borderMesh);

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

  // 2. Membangun Area-Area Sesuai Gambar Referensi (Pos Berada di Samping Jalur Check Point)
  buildReferenceLocations() {
    this.buildWelcomeGate(0, 18);
    this.buildReceptionTent(-11.2, 7);    // Pos Pelaminan berada di samping check point (-9, 7)
    this.buildWoodenPhotoBooth(10.2, 7);   // Pos Photobooth berada di samping check point (8, 7)
    this.buildCoupleFlowerRing(-8, -10); // Cincin Bunga (+ PASANGAN)
    this.buildGalleryDeck(10.2, -5);      // Panggung Galeri berada di samping check point (8, -5)
    this.buildPondAndBridge(5, -12);     // Kolam Teratai & Jembatan Lengkung
    this.buildRsvpAltar(2.4, -2);        // Altar Buku Tamu berada di samping check point (0, -2)
  }

  // A. GERBANG SELAMAT DATANG (WELCOME GATE at 0, 18)
  buildWelcomeGate(x, z) {
    const gateGroup = new THREE.Group();
    gateGroup.position.set(x, 0, z);
    this.scene.add(gateGroup);

    // Dua Tiang Gerbang Kayu Rustic
    const postGeo = new THREE.CylinderGeometry(0.2, 0.25, 3.4, 8);
    const p1 = new THREE.Mesh(postGeo, this.materials.woodWarm);
    p1.position.set(-2.0, 1.7, 0);
    gateGroup.add(p1);

    const p2 = new THREE.Mesh(postGeo, this.materials.woodWarm);
    p2.position.set(2.0, 1.7, 0);
    gateGroup.add(p2);

    // Lengkungan Bunga Mawar Gerbang
    const archGeo = new THREE.TorusGeometry(2.0, 0.22, 8, 20, Math.PI);
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
    const carpetGeo = new THREE.PlaneGeometry(2.0, 5.0);
    carpetGeo.rotateX(-Math.PI / 2);
    const carpet = new THREE.Mesh(carpetGeo, new THREE.MeshLambertMaterial({ color: 0xa83232 }));
    carpet.position.set(0, 0.028, 0);
    gateGroup.add(carpet);
  }

  // B. POS TENDA RESEPSI TERBUKA & AKAD NIKAH (Bisa Dilalui Pemain + Mempelai Sedang Resepsi)
  buildReceptionTent(x, z) {
    const tentGroup = new THREE.Group();
    tentGroup.position.set(x, 0, z);
    this.scene.add(tentGroup);

    // Lantai Panggung Kayu Pos (Rendah & bisa dipijak pemain)
    const deckGeo = new THREE.CylinderGeometry(3.3, 3.5, 0.28, 20);
    const deck = new THREE.Mesh(deckGeo, this.materials.woodWarm);
    deck.position.y = 0.14;
    tentGroup.add(deck);

    // Karpet Merah Megah di Atas Lantai Pos
    const carpetGeo = new THREE.CircleGeometry(2.4, 20);
    carpetGeo.rotateX(-Math.PI / 2);
    const carpetMat = new THREE.MeshLambertMaterial({ color: 0x991b1b });
    const carpet = new THREE.Mesh(carpetGeo, carpetMat);
    carpet.position.y = 0.285;
    tentGroup.add(carpet);

    // Tiang-tiang Pos di Tepi Luar (Tengahnya plong lapang agar karakter leluasa lewat)
    const postAngles = [Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75];
    postAngles.forEach(ang => {
      const px = Math.cos(ang) * 2.8;
      const pz = Math.sin(ang) * 2.8;
      const col = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.12, 3.2, 8),
        this.materials.woodWarm
      );
      col.position.set(px, 1.6, pz);
      tentGroup.add(col);

      // Lentera di tiang pos
      this.addLantern(tentGroup, px * 0.85, 2.6, pz * 0.85);
    });

    // Atap Kanopi Pos Melengkung Tinggi (Pemain bebas lewat di bawahnya)
    const roofGeo = new THREE.ConeGeometry(3.8, 1.5, 18);
    const roof = new THREE.Mesh(roofGeo, this.materials.tentRoof);
    roof.position.y = 3.9;
    tentGroup.add(roof);

    // Tirai & Drapery Putih Elegan di Sekeliling Atas
    const drapeGeo = new THREE.TorusGeometry(3.0, 0.14, 6, 20);
    drapeGeo.rotateX(Math.PI / 2);
    const drape = new THREE.Mesh(drapeGeo, this.materials.tentFabric);
    drape.position.y = 3.1;
    tentGroup.add(drape);

    // Lengkungan Bunga di Atas Pintu Masuk Pos
    const flowerArchGeo = new THREE.TorusGeometry(2.2, 0.18, 6, 20, Math.PI);
    const flowerArch = new THREE.Mesh(flowerArchGeo, this.materials.foliageGreen);
    flowerArch.position.set(0, 2.6, 1.8);
    tentGroup.add(flowerArch);

    for (let i = 0; i < 11; i++) {
      const angle = (i / 10) * Math.PI;
      const fl = new THREE.Mesh(
        new THREE.SphereGeometry(0.14, 6, 6),
        i % 2 === 0 ? this.materials.flowerRose : this.materials.flowerPink
      );
      fl.position.set(Math.cos(angle) * 2.2, 2.6 + Math.sin(angle) * 2.2, 1.88);
      tentGroup.add(fl);
    }

    // Backdrop Pelaminan di Sisi Belakang (x = 0, z = -2.1)
    const backdropGeo = new THREE.BoxGeometry(2.6, 2.2, 0.15);
    const backdropMat = new THREE.MeshLambertMaterial({ color: 0xfef3c7 });
    const backdrop = new THREE.Mesh(backdropGeo, backdropMat);
    backdrop.position.set(0, 1.35, -2.1);
    tentGroup.add(backdrop);

    // Bunga Backdrop
    const decorRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.8, 0.1, 8, 16),
      this.materials.flowerRose
    );
    decorRing.position.set(0, 1.6, -2.0);
    tentGroup.add(decorRing);

    // Kursi Pelaminan Mempelai
    const sofaGeo = new THREE.BoxGeometry(1.6, 0.65, 0.6);
    const sofaMat = new THREE.MeshLambertMaterial({ color: 0xb45309 });
    const sofa = new THREE.Mesh(sofaGeo, sofaMat);
    sofa.position.set(0, 0.55, -1.8);
    tentGroup.add(sofa);

    // Mempelai Pria (Arya) & Wanita (Nadia) Sedang Berdiri Ramah Menyambut Tamu di Pos Pelaminan
    const groomNpc = new Character3D('boy');
    groomNpc.group.position.set(-0.55, 0.28, -1.2);
    groomNpc.group.rotation.y = 0.2; // Sedikit menghadap tengah/depan
    tentGroup.add(groomNpc.group);
    this.animatedDecorations.push(groomNpc);

    const brideNpc = new Character3D('girl');
    brideNpc.group.position.set(0.55, 0.28, -1.2);
    brideNpc.group.rotation.y = -0.2;
    tentGroup.add(brideNpc.group);
    this.animatedDecorations.push(brideNpc);

    // Barel Bunga di Kiri & Kanan Depan Tangga Pos
    this.addBarrelFlower(tentGroup, -2.8, 0.28, 2.0);
    this.addBarrelFlower(tentGroup, 2.8, 0.28, 2.0);
  }

  // C. POS PHOTOBOOTH KAYU TERBUKA (Bisa Dilalui / Dilewati Pemain)
  buildWoodenPhotoBooth(x, z) {
    const pbGroup = new THREE.Group();
    pbGroup.position.set(x, 0, z);
    this.scene.add(pbGroup);

    // Lantai Kayu Pos Photobooth
    const baseGeo = new THREE.BoxGeometry(2.8, 0.25, 2.8);
    const base = new THREE.Mesh(baseGeo, this.materials.woodWarm);
    base.position.y = 0.125;
    pbGroup.add(base);

    // 4 Tiang Gazebo Photobooth Terbuka (Depan & Belakang Terbuka Plong)
    const postCoords = [
      [-1.2, -1.2], [1.2, -1.2],
      [-1.2, 1.2], [1.2, 1.2]
    ];
    postCoords.forEach(c => {
      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.1, 2.8, 8),
        this.materials.woodDark
      );
      pole.position.set(c[0], 1.4, c[1]);
      pbGroup.add(pole);
    });

    // Atap Gazebo Pos Cantik
    const roofGeo = new THREE.ConeGeometry(2.2, 0.9, 4);
    roofGeo.rotateY(Math.PI / 4);
    const roof = new THREE.Mesh(roofGeo, this.materials.woodWarm);
    roof.position.y = 3.25;
    pbGroup.add(roof);

    // Backdrop Photo Stand di Sisi Kanan (Bukan menghalangi jalan tengah)
    const frameStand = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 2.0, 1.8),
      this.materials.woodFence
    );
    frameStand.position.set(1.15, 1.25, 0);
    pbGroup.add(frameStand);

    // Kamera Antik Vintage di Atas Tripod di Sisi Kiri
    const tripod = new THREE.Mesh(
      new THREE.ConeGeometry(0.3, 1.2, 3, 1, true),
      this.materials.woodDark
    );
    tripod.position.set(-0.95, 0.6, 0);
    pbGroup.add(tripod);

    const cameraBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.25, 0.35),
      this.materials.goldAcsent
    );
    cameraBox.position.set(-0.95, 1.3, 0);
    pbGroup.add(cameraBox);

    const cameraLens = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, 0.15, 12),
      this.materials.woodDark
    );
    cameraLens.rotateZ(Math.PI / 2);
    cameraLens.position.set(-0.75, 1.3, 0);
    pbGroup.add(cameraLens);

    // Lampu Lentera Gantung & Bunga
    this.addLantern(pbGroup, -1.15, 2.5, 1.15);
    this.addLantern(pbGroup, 1.15, 2.5, 1.15);
    this.addBarrelFlower(pbGroup, 1.4, 0.25, 1.4);
  }

  // D. TAMAN CINCIN BUNGA PASANGAN (Kiri Atas at -8, -10) - Menampilkan Pasangan Bahagia
  buildCoupleFlowerRing(x, z) {
    const ringGroup = new THREE.Group();
    ringGroup.position.set(x, 0, z);
    this.scene.add(ringGroup);

    // Cincin Rumput & Bunga Ganda (Double Circular Flower Ring)
    const ringRadius = 2.4;
    const ringGeo = new THREE.TorusGeometry(ringRadius, 0.35, 8, 32);
    ringGeo.rotateX(Math.PI / 2);
    const ringMesh = new THREE.Mesh(ringGeo, this.materials.foliageGreen);
    ringMesh.position.y = 0.3;
    ringGroup.add(ringMesh);

    // Pagar Kayu Melingkari Cincin Bunga (Mini Circular Picket Fence)
    const fenceCount = 20;
    for (let i = 0; i < fenceCount; i++) {
      const angle = (i / fenceCount) * Math.PI * 2;
      const px = Math.cos(angle) * (ringRadius + 0.55);
      const pz = Math.sin(angle) * (ringRadius + 0.55);
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.5, 0.08),
        this.materials.woodFence
      );
      post.position.set(px, 0.25, pz);
      post.rotation.y = -angle;
      ringGroup.add(post);
    }

    // Taburan Bunga Mawar Merah & Putih di Sepanjang Cincin
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2;
      const fx = Math.cos(angle) * ringRadius;
      const fz = Math.sin(angle) * ringRadius;
      const flower = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 6, 6),
        i % 2 === 0 ? this.materials.flowerRose : this.materials.flowerWhite
      );
      flower.position.set(fx, 0.5, fz);
      ringGroup.add(flower);
    }

    // Altar Tengah / Pedestal Hati
    const centerPedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.7, 0.8, 0.4, 16),
      this.materials.pathBorder
    );
    centerPedestal.position.y = 0.2;
    ringGroup.add(centerPedestal);

    const coupleHeart = new THREE.Mesh(
      new THREE.TorusGeometry(0.48, 0.1, 8, 16),
      this.materials.flowerRose
    );
    coupleHeart.position.set(0, 0.85, 0);
    coupleHeart.rotation.z = Math.PI / 4;
    ringGroup.add(coupleHeart);
  }

  // E. PANGGUNG GALERI FOTO (Kanan Atas at 8, -5)
  buildGalleryDeck(x, z) {
    const galGroup = new THREE.Group();
    galGroup.position.set(x, 0, z);
    this.scene.add(galGroup);

    // Dek Panggung Kayu Bertingkat
    const deckGeo = new THREE.BoxGeometry(3.6, 0.35, 3.2);
    const deck = new THREE.Mesh(deckGeo, this.materials.woodWarm);
    deck.position.y = 0.175;
    galGroup.add(deck);

    // Tangga Masuk Miring Landai
    const stepGeo = new THREE.BoxGeometry(1.8, 0.18, 0.8);
    const step = new THREE.Mesh(stepGeo, this.materials.woodWarm);
    step.position.set(0, 0.09, 1.85);
    galGroup.add(step);

    // Pergola Kayu dengan Tiang di Sudut
    const postGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.6, 8);
    const posts = [
      [-1.5, -1.3], [1.5, -1.3],
      [-1.5, 1.3], [1.5, 1.3]
    ];
    posts.forEach(p => {
      const col = new THREE.Mesh(postGeo, this.materials.woodWarm);
      col.position.set(p[0], 1.4, p[1]);
      galGroup.add(col);
    });

    // Balok Atap Pergola
    const beamGeo = new THREE.BoxGeometry(3.6, 0.15, 3.2);
    const beam = new THREE.Mesh(beamGeo, this.materials.woodWarm);
    beam.position.y = 2.7;
    galGroup.add(beam);

    // Sulur Daun & Bunga Gantung di Atap Pergola
    const foliageRoof = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 0.2, 3.4),
      this.materials.foliageGreen
    );
    foliageRoof.position.y = 2.85;
    galGroup.add(foliageRoof);

    // Bingkai Foto Terpajang di Belakang (Photo Frames Gallery)
    const frameGeo = new THREE.BoxGeometry(1.2, 1.4, 0.08);
    const frame = new THREE.Mesh(frameGeo, this.materials.woodFence);
    frame.position.set(0, 1.6, -1.1);
    galGroup.add(frame);

    // Pot Bunga di Sudut Panggung
    this.addBarrelFlower(galGroup, -1.6, 0.35, 1.4);
    this.addBarrelFlower(galGroup, 1.6, 0.35, 1.4);
  }

  // F. KOLAM RENANG / TERATAI & JEMBATAN LENGKUNG DI ATAS TREK JALAN
  buildPondAndBridge(x, z) {
    const pondGroup = new THREE.Group();
    pondGroup.position.set(x, 0, z);
    this.scene.add(pondGroup);

    // Kolam Air Biru Jernih Oval di Sisi Jalur (x = 5.5, z = -11.5)
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
    // Offset relatif terhadap pondGroup (5, -12):
    // Titik A: (7-5, -9 - (-12)) = (2, 3)
    // Titik B: (4-5, -13 - (-12)) = (-1, -1)
    const bridgeGroup = new THREE.Group();
    bridgeGroup.position.set(0.5, 0, 1.0);
    const bridgeAngle = Math.atan2(-3, -4); // Arah jembatan diagonal
    bridgeGroup.rotation.y = bridgeAngle;
    pondGroup.add(bridgeGroup);

    // Lantai Papan Jembatan Melengkung
    const plankCount = 14;
    const bridgeLength = 5.0;
    const bridgeWidth = 1.6;

    for (let i = 0; i < plankCount; i++) {
      const t = i / (plankCount - 1);
      const bz = (t - 0.5) * bridgeLength;
      // Parabola lengkungan jembatan
      const by = Math.sin(t * Math.PI) * 0.38 + 0.12;

      const plank = new THREE.Mesh(
        new THREE.BoxGeometry(bridgeWidth, 0.08, 0.32),
        i % 2 === 0 ? this.materials.woodWarm : this.materials.woodDark
      );
      plank.position.set(0, by, bz);
      // Sudut miring plank mengikuti turunan kurva
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

      // Balok pegangan atas jembatan
      const topRail = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.08, bridgeLength),
        this.materials.woodDark
      );
      topRail.position.set(sideX, 0.8, 0);
      bridgeGroup.add(topRail);
    });
  }

  // G. ALTAR BUKU TAMU & RSVP (Tengah at 0, -2) - Dijaga Pagar Ayu Cantik
  buildRsvpAltar(x, z) {
    const rsvpGroup = new THREE.Group();
    rsvpGroup.position.set(x, 0, z);
    this.scene.add(rsvpGroup);

    // Meja Resepsionis Kayu Pedesaan
    const deskGeo = new THREE.BoxGeometry(2.0, 0.75, 0.9);
    const desk = new THREE.Mesh(deskGeo, this.materials.woodWarm);
    desk.position.set(0, 0.375, -0.4);
    rsvpGroup.add(desk);

    // Taplak Meja Krem Elegan
    const clothGeo = new THREE.BoxGeometry(2.05, 0.4, 0.95);
    const cloth = new THREE.Mesh(clothGeo, this.materials.tentFabric);
    cloth.position.set(0, 0.58, -0.4);
    rsvpGroup.add(cloth);

    // Kotak Surat Emas & Buku Tamu
    const mailbox = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.45, 0.35),
      this.materials.goldAcsent
    );
    mailbox.position.set(-0.55, 0.95, -0.4);
    rsvpGroup.add(mailbox);

    const book = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.06, 0.35),
      this.materials.plaqueBg
    );
    book.position.set(0.45, 0.81, -0.4);
    rsvpGroup.add(book);

    // Lentera Meja
    this.addLantern(rsvpGroup, 0.8, 1.1, -0.4);

    // PAGAR AYU (Penerima Tamu Berbusana Anggun Cantik Tradisional yang Menjaga Meja RSVP)
    const pagarAyuL = new Character3D('pagar_ayu');
    pagarAyuL.group.position.set(-0.7, 0, -1.1);
    pagarAyuL.group.rotation.y = 0.15; // Menghadap tamu yang datang dari arah depan
    rsvpGroup.add(pagarAyuL.group);
    this.animatedDecorations.push(pagarAyuL);

    const pagarAyuR = new Character3D('pagar_ayu');
    pagarAyuR.group.position.set(0.7, 0, -1.1);
    pagarAyuR.group.rotation.y = -0.15;
    rsvpGroup.add(pagarAyuR.group);
    this.animatedDecorations.push(pagarAyuR);
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
  buildFloatingPlaques() {
    const plaqueGroup = new THREE.Group();
    this.scene.add(plaqueGroup);

    WEDDING_CONFIG.locations.forEach(loc => {
      if (!loc.label) return;

      const plaque = new THREE.Group();
      plaque.position.set(loc.position.x, 3.2, loc.position.z);

      // Papan Kayu Krem RPG
      const boardGeo = new THREE.BoxGeometry(2.0, 0.5, 0.08);
      const board = new THREE.Mesh(boardGeo, this.materials.plaqueBg);
      plaque.add(board);

      // Bingkai Emas / Kayu Gelap
      const frameGeo = new THREE.BoxGeometry(2.08, 0.56, 0.06);
      const frame = new THREE.Mesh(frameGeo, this.materials.woodDark);
      frame.position.z = -0.01;
      plaque.add(frame);

      // Canvas Tekstur Tulisan Label (misal "+ PASANGAN", "+ PHOTOBOOTH")
      const textCanvas = document.createElement('canvas');
      textCanvas.width = 256;
      textCanvas.height = 64;
      const ctx = textCanvas.getContext('2d');
      ctx.fillStyle = '#fef6e4';
      ctx.fillRect(0, 0, 256, 64);
      ctx.font = 'bold 26px sans-serif';
      ctx.fillStyle = '#881337';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(loc.label, 128, 32);

      const textTexture = new THREE.CanvasTexture(textCanvas);
      const labelMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1.9, 0.45),
        new THREE.MeshBasicMaterial({ map: textTexture })
      );
      labelMesh.position.z = 0.045;
      plaque.add(labelMesh);

      // Billboard agar menghadap sudut kamera
      plaque.rotation.x = -Math.PI / 6;

      plaqueGroup.add(plaque);
      this.floatingLabels.push(plaque);
    });
  }

  // 5. Alam & Pepohonan Subur (Cherry Blossoms & Pohon Rindang Rimbun)
  buildFloraAndNature() {
    const treePositions = [
      { x: -4.8, z: 15 }, { x: 4.8, z: 15 },
      { x: -5.0, z: 10 }, { x: 5.0, z: 10 },
      { x: -5.2, z: 3 }, { x: 5.2, z: 3 },
      { x: -4.5, z: -4 }, { x: 4.5, z: -4 },
      { x: -14, z: 12 }, { x: 13, z: 12 },
      { x: -15, z: 2 }, { x: 14, z: 2 },
      { x: -14, z: -15 }, { x: 13, z: -15 },
      { x: -2, z: -16 }, { x: 10, z: -16 },
      { x: -10, z: -2 }, { x: 10, z: -2 }
    ];

    treePositions.forEach(pos => {
      this.createShadedTree(pos.x, pos.z);
    });

    // Semak Bunga Berwarna-Warni di Sepanjang Pagar
    this.createLushBushes();

    // Partikel Kelopak Bunga Berterbangan
    this.createFloatingPetals();
  }

  createLushBushes() {
    const bushGeo = new THREE.DodecahedronGeometry(0.45);
    const colors = [this.materials.flowerRose, this.materials.flowerPink, this.materials.flowerWhite, this.materials.flowerYellow];

    // Semak di sisi kiri dan kanan jalan
    for (let z = 16; z >= 2; z -= 1.8) {
      // Sisi kiri (x ~ -2.6 s/d -3.6)
      const bL = new THREE.Mesh(bushGeo, colors[Math.abs(Math.floor(z)) % colors.length]);
      bL.position.set(-2.8 - Math.random() * 0.4, 0.35, z);
      this.scene.add(bL);

      // Sisi kanan (x ~ 2.6 s/d 3.6)
      const bR = new THREE.Mesh(bushGeo, colors[(Math.abs(Math.floor(z)) + 1) % colors.length]);
      bR.position.set(2.8 + Math.random() * 0.4, 0.35, z);
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
