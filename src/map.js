// =========================================================================
// MAP.JS - PEMBUATAN DUNIA 3D TAMAN PERNIKAHAN LENGKAP (SESUAI GAMBAR REFERENSI)
// Menyediakan jalan berliku, tenda resepsi, bilik photobooth, taman cincin bunga,
// panggung galeri kayu, jembatan kolam teratai, pagar taman, & papan nama RPG.
// =========================================================================

import * as THREE from 'three';
import { WEDDING_CONFIG } from './config.js';

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

  // 2. Membangun Area-Area Sesuai Gambar Referensi
  buildReferenceLocations() {
    this.buildWelcomeGate(0, 18);
    this.buildReceptionTent(-9, 7);      // Tenda Pelaminan (+ ACARA)
    this.buildWoodenPhotoBooth(8, 7);    // Bilik Foto Kayu (+ PHOTOBOOTH)
    this.buildCoupleFlowerRing(-8, -10); // Cincin Bunga (+ PASANGAN)
    this.buildGalleryDeck(8, -5);        // Panggung Galeri (+ GALERI)
    this.buildPondAndBridge(5, -12);     // Kolam Teratai & Jembatan Lengkung
    this.buildRsvpAltar(0, -2);          // Altar Buku Tamu (+ UCAPAN & RSVP)
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

  // B. TENDA RESEPSI & AKAD NIKAH (Kiri Bawah at -9, 7) - Sama persis dengan referensi
  buildReceptionTent(x, z) {
    const tentGroup = new THREE.Group();
    tentGroup.position.set(x, 0, z);
    this.scene.add(tentGroup);

    // Panggung Kayu Tenda
    const deckGeo = new THREE.CylinderGeometry(3.2, 3.4, 0.35, 16);
    const deck = new THREE.Mesh(deckGeo, this.materials.woodWarm);
    deck.position.y = 0.175;
    tentGroup.add(deck);

    // 4 Tiang Penyangga Tenda Kayu
    const posts = [
      [-2.2, -1.8], [2.2, -1.8],
      [-2.0, 1.5], [2.0, 1.5]
    ];
    posts.forEach(p => {
      const col = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.14, 2.8, 8),
        this.materials.woodWarm
      );
      col.position.set(p[0], 1.4, p[1]);
      tentGroup.add(col);
    });

    // Kanopi Atap Tenda Kain Melengkung (Fabric Dome Canopy)
    const roofGeo = new THREE.ConeGeometry(3.5, 1.5, 16);
    const roof = new THREE.Mesh(roofGeo, this.materials.tentRoof);
    roof.position.y = 3.4;
    tentGroup.add(roof);

    // Tirai & Drapery Putih Elegan
    const drapeGeo = new THREE.TorusGeometry(2.6, 0.16, 6, 16);
    drapeGeo.rotateX(Math.PI / 2);
    const drape = new THREE.Mesh(drapeGeo, this.materials.tentFabric);
    drape.position.y = 2.7;
    tentGroup.add(drape);

    // Lengkungan Bunga di Bagian Depan Tenda
    const flowerArchGeo = new THREE.TorusGeometry(1.9, 0.18, 6, 16, Math.PI);
    const flowerArch = new THREE.Mesh(flowerArchGeo, this.materials.foliageGreen);
    flowerArch.position.set(0, 2.1, 1.6);
    tentGroup.add(flowerArch);

    for (let i = 0; i < 10; i++) {
      const angle = (i / 9) * Math.PI;
      const fl = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 6, 6),
        i % 2 === 0 ? this.materials.flowerRose : this.materials.flowerPink
      );
      fl.position.set(Math.cos(angle) * 1.9, 2.1 + Math.sin(angle) * 1.9, 1.68);
      tentGroup.add(fl);
    }

    // Meja Pelaminan & Jamuan di Dalam Tenda
    const table = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 0.7, 0.8),
      this.materials.tentFabric
    );
    table.position.set(0, 0.525, -0.6);
    tentGroup.add(table);

    // Kursi Pelaminan Mempelai
    const chairL = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.5), this.materials.woodWarm);
    chairL.position.set(-0.6, 0.45, -1.3);
    tentGroup.add(chairL);

    const chairR = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.5), this.materials.woodWarm);
    chairR.position.set(0.6, 0.45, -1.3);
    tentGroup.add(chairR);

    // Barel Kayu Pot Bunga di Kiri & Kanan Depan
    this.addBarrelFlower(tentGroup, -2.5, 0.35, 1.8);
    this.addBarrelFlower(tentGroup, 2.5, 0.35, 1.8);
  }

  // C. BILIK PHOTOBOOTH KAYU ANTIK (Kanan Bawah at 8, 7) - Sama persis dengan referensi
  buildWoodenPhotoBooth(x, z) {
    const pbGroup = new THREE.Group();
    pbGroup.position.set(x, 0, z);
    this.scene.add(pbGroup);

    // Pondasi Kayu Bilik
    const baseGeo = new THREE.BoxGeometry(2.4, 0.25, 2.4);
    const base = new THREE.Mesh(baseGeo, this.materials.woodWarm);
    base.position.y = 0.125;
    pbGroup.add(base);

    // Rumah Bilik Foto (Wooden Photobooth Box)
    const boothGeo = new THREE.BoxGeometry(1.8, 2.6, 1.8);
    const booth = new THREE.Mesh(boothGeo, this.materials.woodDark);
    booth.position.set(0, 1.425, 0);
    pbGroup.add(booth);

    // Atap Miring Bilik
    const roofGeo = new THREE.ConeGeometry(1.5, 0.6, 4);
    roofGeo.rotateY(Math.PI / 4);
    const roof = new THREE.Mesh(roofGeo, this.materials.woodWarm);
    roof.position.y = 2.95;
    pbGroup.add(roof);

    // Pintu / Tirai Photobooth Terbuka
    const curtainGeo = new THREE.PlaneGeometry(0.7, 1.8);
    const curtainMat = new THREE.MeshLambertMaterial({ color: 0xfef3c7 });
    const curtain = new THREE.Mesh(curtainGeo, curtainMat);
    curtain.position.set(0.35, 1.4, 0.92);
    pbGroup.add(curtain);

    // Lubang Lensa Kamera Antik & Lampu Flash
    const lensRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.2, 0.05, 8, 16),
      this.materials.goldAcsent
    );
    lensRing.position.set(-0.35, 1.7, 0.92);
    pbGroup.add(lensRing);

    // Lampu Lentera Gantung di Sudut Bilik
    this.addLantern(pbGroup, -1.0, 2.2, 0.95);
    this.addLantern(pbGroup, 1.0, 2.2, 0.95);

    // Keranjang Bunga di Kaki Bilik
    this.addBarrelFlower(pbGroup, 1.2, 0.25, 1.2);
  }

  // D. TAMAN CINCIN BUNGA PASANGAN (Kiri Atas at -8, -10) - Sama persis dengan referensi
  buildCoupleFlowerRing(x, z) {
    const ringGroup = new THREE.Group();
    ringGroup.position.set(x, 0, z);
    this.scene.add(ringGroup);

    // Cincin Rumput & Bunga Ganda (Double Circular Flower Ring)
    const ringRadius = 2.2;
    const ringGeo = new THREE.TorusGeometry(ringRadius, 0.35, 8, 32);
    ringGeo.rotateX(Math.PI / 2);
    const ringMesh = new THREE.Mesh(ringGeo, this.materials.foliageGreen);
    ringMesh.position.y = 0.3;
    ringGroup.add(ringMesh);

    // Pagar Kayu Melingkari Cincin Bunga (Mini Circular Picket Fence)
    const fenceCount = 18;
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
    for (let i = 0; i < 28; i++) {
      const angle = (i / 28) * Math.PI * 2;
      const fx = Math.cos(angle) * ringRadius;
      const fz = Math.sin(angle) * ringRadius;
      const flower = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 6, 6),
        i % 2 === 0 ? this.materials.flowerRose : this.materials.flowerWhite
      );
      flower.position.set(fx, 0.5, fz);
      ringGroup.add(flower);
    }

    // Altar Tengah / Patung Merpati Romantis
    const centerPedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.7, 0.5, 16),
      this.materials.pathBorder
    );
    centerPedestal.position.y = 0.25;
    ringGroup.add(centerPedestal);

    const coupleHeart = new THREE.Mesh(
      new THREE.TorusGeometry(0.4, 0.09, 8, 16),
      this.materials.flowerRose
    );
    coupleHeart.position.set(0, 0.8, 0);
    coupleHeart.rotation.z = Math.PI / 4;
    ringGroup.add(coupleHeart);
  }

  // E. PANGGUNG GALERI FOTO (Kanan Atas at 8, -5) - Sama persis dengan referensi
  buildGalleryDeck(x, z) {
    const galGroup = new THREE.Group();
    galGroup.position.set(x, 0, z);
    this.scene.add(galGroup);

    // Dek Panggung Kayu Bertingkat dengan Tangga Depan
    const deckGeo = new THREE.BoxGeometry(3.6, 0.4, 3.2);
    const deck = new THREE.Mesh(deckGeo, this.materials.woodWarm);
    deck.position.y = 0.2;
    galGroup.add(deck);

    // Tangga Masuk
    const stepGeo = new THREE.BoxGeometry(1.6, 0.2, 0.6);
    const step = new THREE.Mesh(stepGeo, this.materials.woodWarm);
    step.position.set(0, 0.1, 1.8);
    galGroup.add(step);

    // Pergola Kayu dengan Hiasan Rangka Daun
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
    this.addBarrelFlower(galGroup, -1.6, 0.4, 1.4);
    this.addBarrelFlower(galGroup, 1.6, 0.4, 1.4);
  }

  // F. KOLAM TERATAI & JEMBATAN KAYU MELENGKUNG (Atas Timur at 5, -12)
  buildPondAndBridge(x, z) {
    const pondGroup = new THREE.Group();
    pondGroup.position.set(x, 0, z);
    this.scene.add(pondGroup);

    // Kolam Air Tenang Oval
    const pondGeo = new THREE.CylinderGeometry(3.2, 3.2, 0.15, 24);
    pondGeo.scale(1.3, 1, 0.85);
    const pond = new THREE.Mesh(pondGeo, this.materials.waterPond);
    pond.position.y = 0.08;
    pondGroup.add(pond);

    // Batuan Alam Mengelilingi Kolam
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2;
      const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.3 + Math.random() * 0.15),
        this.materials.pathBorder
      );
      rock.position.set(
        Math.cos(angle) * 3.8 * 1.05,
        0.18,
        Math.sin(angle) * 2.6 * 1.05
      );
      pondGroup.add(rock);
    }

    // Daun Teratai (Lilypads)
    const lilyCount = 8;
    for (let i = 0; i < lilyCount; i++) {
      const pad = new THREE.Mesh(
        new THREE.CircleGeometry(0.35, 12),
        this.materials.lilypad
      );
      pad.rotateX(-Math.PI / 2);
      pad.position.set(
        (Math.random() - 0.5) * 4.5,
        0.16,
        (Math.random() - 0.5) * 2.8
      );
      pondGroup.add(pad);
    }

    // Jembatan Kayu Melengkung (Arched Bridge)
    const bridgeGeo = new THREE.CylinderGeometry(1.6, 1.6, 1.4, 16, 1, false, 0, Math.PI);
    bridgeGeo.rotateZ(Math.PI / 2);
    bridgeGeo.scale(1, 0.35, 1.8);
    const bridge = new THREE.Mesh(bridgeGeo, this.materials.woodWarm);
    bridge.position.set(-1.0, 0.3, -1.0);
    pondGroup.add(bridge);

    // Pegangan Jembatan (Bridge Railing)
    const railGeo = new THREE.TorusGeometry(1.6, 0.06, 6, 16, Math.PI);
    railGeo.scale(1, 0.35, 1);
    const railL = new THREE.Mesh(railGeo, this.materials.woodFence);
    railL.position.set(-1.0, 0.6, -0.2);
    pondGroup.add(railL);

    const railR = new THREE.Mesh(railGeo, this.materials.woodFence);
    railR.position.set(-1.0, 0.6, -1.8);
    pondGroup.add(railR);
  }

  // G. ALTAR BUKU TAMU & RSVP (Tengah at 0, -2)
  buildRsvpAltar(x, z) {
    const rsvpGroup = new THREE.Group();
    rsvpGroup.position.set(x, 0, z);
    this.scene.add(rsvpGroup);

    // Meja Resepsionis Kayu Pedesaan
    const deskGeo = new THREE.BoxGeometry(1.8, 0.75, 0.9);
    const desk = new THREE.Mesh(deskGeo, this.materials.woodWarm);
    desk.position.y = 0.375;
    rsvpGroup.add(desk);

    // Kotak Surat Emas / Buku Tamu
    const mailbox = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.5, 0.35),
      this.materials.goldAcsent
    );
    mailbox.position.set(-0.5, 0.95, 0);
    rsvpGroup.add(mailbox);

    const book = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.08, 0.4),
      this.materials.plaqueBg
    );
    book.position.set(0.35, 0.79, 0);
    rsvpGroup.add(book);

    // Lentera Hangat Meja
    this.addLantern(rsvpGroup, 0.7, 1.1, 0);
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

    // Animasi naik-turun halus pada papan penanda RPG
    if (this.floatingLabels) {
      const time = Date.now() * 0.0025;
      this.floatingLabels.forEach((label, idx) => {
        label.position.y = 3.2 + Math.sin(time + idx) * 0.08;
      });
    }
  }
}
