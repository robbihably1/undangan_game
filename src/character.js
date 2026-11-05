// =========================================================================
// CHARACTER.JS - MODEL KARAKTER 3D STYLIZED ESTETIK, TAMPAN & CANTIK
// Dilengkapi Rigging Hierarkis, Animasi Berjalan Halus & Wajah Detail
// =========================================================================

import * as THREE from 'three';

let sharedShadowTexture = null;
function getSoftShadowTexture() {
  if (sharedShadowTexture) return sharedShadowTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(15, 23, 42, 0.65)');
  gradient.addColorStop(0.35, 'rgba(15, 23, 42, 0.38)');
  gradient.addColorStop(0.7, 'rgba(15, 23, 42, 0.12)');
  gradient.addColorStop(1, 'rgba(15, 23, 42, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  sharedShadowTexture = new THREE.CanvasTexture(canvas);
  return sharedShadowTexture;
}

export class Character3D {
  constructor(role = 'boy') {
    // role: 'boy', 'girl' (mempelai), 'pagar_ayu'
    this.role = role;
    this.gender = (role === 'boy') ? 'boy' : 'girl';
    this.group = new THREE.Group();
    this.walkCycle = 0;
    this.idleTime = Math.random() * 5;
    this.walkBlend = 0;
    this.currentSpeed = 0;
    this.facingAngle = 0;
    this.targetFacingAngle = 0;

    this.parts = {};
    this.buildModel();
  }

  buildModel() {
    // Warna Kulit Cerah Halus Alami
    const skinColor = (this.role === 'boy') ? 0xffdfc4 : 0xffebd9;
    const blushColor = 0xf472b6;
    const eyeIrisColor = (this.role === 'boy') ? 0x1e3a8a : 0x4338ca;
    const eyePupilColor = 0x0f172a;

    // Busana Pria: Jas Mewah & Dasi Kupu-Kupu
    const boySuitColor = 0x1e293b;
    const boyPantsColor = 0x0f172a;
    const boyShirtColor = 0xf8fafc;
    const boyTieColor = 0xd97706;
    const boyHairColor = 0x271912;

    // Busana Wanita Mempelai (Gaun Putih) vs Pagar Ayu (Kebaya Pastel Rose/Peach)
    const isPagarAyu = (this.role === 'pagar_ayu');
    const dressColor = isPagarAyu ? 0xfbcfe8 : 0xffffff;
    const dressTrimColor = isPagarAyu ? 0xf472b6 : 0xfef08a;
    const girlHairColor = isPagarAyu ? 0x221710 : 0x3d2314;
    const girlTiaraColor = isPagarAyu ? 0xf59e0b : 0xfbbf24;

    const matSkin = new THREE.MeshLambertMaterial({ color: skinColor });
    const matBlush = new THREE.MeshBasicMaterial({ color: blushColor, transparent: true, opacity: 0.55 });
    const matIris = new THREE.MeshBasicMaterial({ color: eyeIrisColor });
    const matPupil = new THREE.MeshBasicMaterial({ color: eyePupilColor });
    const matEyeWhite = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const matEyeShine = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const root = new THREE.Group();
    root.name = 'character_root';
    this.group.add(root);
    this.parts.root = root;

    // Contact Shadow Lembut
    const shadowGeo = new THREE.PlaneGeometry(1.2, 1.2);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: getSoftShadowTexture(),
      transparent: true,
      opacity: 0.72,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.position.y = 0.02;
    this.group.add(shadowMesh);

    // Body Group (untuk bobbing & breathing)
    const bodyGroup = new THREE.Group();
    bodyGroup.position.y = 0;
    root.add(bodyGroup);
    this.parts.bodyGroup = bodyGroup;

    // 1. KAKI & SEPATU
    const legGeo = new THREE.CylinderGeometry(0.075, 0.065, 0.46, 12);
    const shoeGeo = new THREE.BoxGeometry(0.15, 0.09, 0.22);
    shoeGeo.translate(0, -0.02, 0.04);

    const legMat = this.gender === 'boy'
      ? new THREE.MeshLambertMaterial({ color: boyPantsColor })
      : new THREE.MeshLambertMaterial({ color: skinColor });

    const shoeMat = new THREE.MeshLambertMaterial({
      color: this.gender === 'boy' ? 0x0f172a : (isPagarAyu ? 0xd97706 : 0xf8fafc)
    });

    // Kaki Kiri
    const leftLegPivot = new THREE.Group();
    leftLegPivot.position.set(0.14, 0.5, 0);
    bodyGroup.add(leftLegPivot);
    this.parts.leftLegPivot = leftLegPivot;

    const leftLegMesh = new THREE.Mesh(legGeo, legMat);
    leftLegMesh.position.y = -0.23;
    leftLegPivot.add(leftLegMesh);

    const leftShoeMesh = new THREE.Mesh(shoeGeo, shoeMat);
    leftShoeMesh.position.y = -0.44;
    leftLegPivot.add(leftShoeMesh);

    // Kaki Kanan
    const rightLegPivot = new THREE.Group();
    rightLegPivot.position.set(-0.14, 0.5, 0);
    bodyGroup.add(rightLegPivot);
    this.parts.rightLegPivot = rightLegPivot;

    const rightLegMesh = new THREE.Mesh(legGeo, legMat);
    rightLegMesh.position.y = -0.23;
    rightLegPivot.add(rightLegMesh);

    const rightShoeMesh = new THREE.Mesh(shoeGeo, shoeMat);
    rightShoeMesh.position.y = -0.44;
    rightLegPivot.add(rightShoeMesh);

    // 2. BADAN & OUTFIT BERBENTUK RAMPING PROPORSIONAL
    const torsoGroup = new THREE.Group();
    torsoGroup.position.set(0, 0.68, 0);
    bodyGroup.add(torsoGroup);
    this.parts.torsoGroup = torsoGroup;

    if (this.gender === 'boy') {
      // Jas Formal Ganteng (V-Shape Dada bidang & ramping di pinggang)
      const suitGeo = new THREE.BoxGeometry(0.38, 0.46, 0.24);
      const suitMat = new THREE.MeshLambertMaterial({ color: boySuitColor });
      const suitMesh = new THREE.Mesh(suitGeo, suitMat);
      torsoGroup.add(suitMesh);

      // Kemeja Putih & Dasi Kupu-Kupu
      const shirtGeo = new THREE.PlaneGeometry(0.16, 0.36);
      const shirtMesh = new THREE.Mesh(shirtGeo, new THREE.MeshLambertMaterial({ color: boyShirtColor }));
      shirtMesh.position.set(0, 0.04, 0.122);
      torsoGroup.add(shirtMesh);

      const tie = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.05, 0.03), new THREE.MeshLambertMaterial({ color: boyTieColor }));
      tie.position.set(0, 0.17, 0.13);
      torsoGroup.add(tie);

      // Bunga Saku Jas (Boutonniere)
      const rosePin = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), new THREE.MeshBasicMaterial({ color: 0xf43f5e }));
      rosePin.position.set(0.12, 0.13, 0.13);
      torsoGroup.add(rosePin);

    } else {
      // Gaun / Kebaya Anggun Cantik
      const corsetGeo = new THREE.CylinderGeometry(0.16, 0.18, 0.38, 16);
      const corsetMat = new THREE.MeshLambertMaterial({ color: dressColor });
      const corsetMesh = new THREE.Mesh(corsetGeo, corsetMat);
      torsoGroup.add(corsetMesh);

      // Kalung Mutiara Cantik
      const necklace = new THREE.Mesh(
        new THREE.TorusGeometry(0.13, 0.018, 8, 16),
        new THREE.MeshBasicMaterial({ color: 0xffffff })
      );
      necklace.rotation.x = Math.PI / 2;
      necklace.position.set(0, 0.14, 0);
      torsoGroup.add(necklace);

      // Rok Mengembang Anggun
      const skirtGeo = new THREE.ConeGeometry(0.44, 0.52, 18, 1, true);
      const skirtMat = new THREE.MeshLambertMaterial({ color: dressColor, side: THREE.DoubleSide });
      const skirtMesh = new THREE.Mesh(skirtGeo, skirtMat);
      skirtMesh.position.set(0, -0.22, 0);
      torsoGroup.add(skirtMesh);
      this.parts.skirt = skirtMesh;

      // Pita Renda Bawah
      const trimMesh = new THREE.Mesh(
        new THREE.TorusGeometry(0.43, 0.024, 8, 20),
        new THREE.MeshLambertMaterial({ color: dressTrimColor })
      );
      trimMesh.rotation.x = Math.PI / 2;
      trimMesh.position.set(0, -0.47, 0);
      torsoGroup.add(trimMesh);

      // Selendang Anggun untuk Pagar Ayu
      if (isPagarAyu) {
        const sashGeo = new THREE.TorusGeometry(0.24, 0.03, 6, 16);
        const sashMesh = new THREE.Mesh(sashGeo, new THREE.MeshLambertMaterial({ color: 0xf43f5e }));
        sashMesh.position.set(0, 0.02, 0);
        sashMesh.rotation.set(0.3, 0.2, 0.6);
        torsoGroup.add(sashMesh);
      }
    }

    // 3. TANGAN & BUKET BUNGA
    const armGeo = new THREE.CylinderGeometry(0.055, 0.05, 0.40, 10);
    const handGeo = new THREE.SphereGeometry(0.055, 10, 10);
    const armColor = this.gender === 'boy' ? boySuitColor : dressColor;
    const armMat = new THREE.MeshLambertMaterial({ color: armColor });

    // Lengan Kiri
    const leftArmPivot = new THREE.Group();
    leftArmPivot.position.set(0.25, 0.82, 0);
    bodyGroup.add(leftArmPivot);
    this.parts.leftArmPivot = leftArmPivot;

    const leftArmMesh = new THREE.Mesh(armGeo, armMat);
    leftArmMesh.position.y = -0.19;
    leftArmPivot.add(leftArmMesh);

    const leftHandMesh = new THREE.Mesh(handGeo, matSkin);
    leftHandMesh.position.y = -0.38;
    leftArmPivot.add(leftHandMesh);

    // Lengan Kanan
    const rightArmPivot = new THREE.Group();
    rightArmPivot.position.set(-0.25, 0.82, 0);
    bodyGroup.add(rightArmPivot);
    this.parts.rightArmPivot = rightArmPivot;

    const rightArmMesh = new THREE.Mesh(armGeo, armMat);
    rightArmMesh.position.y = -0.19;
    rightArmPivot.add(rightArmMesh);

    const rightHandMesh = new THREE.Mesh(handGeo, matSkin);
    rightHandMesh.position.y = -0.38;
    rightArmPivot.add(rightHandMesh);

    // Buket Bunga Cantik di Tangan Pengantin Wanita / Bros Bunga Pagar Ayu
    if (this.gender === 'girl') {
      const bouquetGroup = new THREE.Group();
      const bStem = new THREE.Mesh(
        new THREE.ConeGeometry(0.05, 0.12, 8),
        new THREE.MeshLambertMaterial({ color: 0x86efac })
      );
      bStem.rotation.x = Math.PI;
      bouquetGroup.add(bStem);

      const flower = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.08),
        new THREE.MeshLambertMaterial({ color: isPagarAyu ? 0xf43f5e : 0xf472b6 })
      );
      flower.position.y = 0.08;
      bouquetGroup.add(flower);

      bouquetGroup.position.set(0, -0.38, 0.08);
      leftArmPivot.add(bouquetGroup);
    }

    // 4. LEHER, KEPALA, WAJAH CANTIK & TAMPAN
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.12, 10), matSkin);
    neck.position.set(0, 0.94, 0);
    bodyGroup.add(neck);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.08, 0);
    bodyGroup.add(headGroup);
    this.parts.headGroup = headGroup;

    // Bentuk Kepala Oval Ramping Halus
    const headGeo = new THREE.SphereGeometry(0.26, 24, 24);
    headGeo.scale(0.96, 1.08, 0.95);
    const headMesh = new THREE.Mesh(headGeo, matSkin);
    headGroup.add(headMesh);

    // Hidung Mungil Mancung Halus
    const noseGeo = new THREE.ConeGeometry(0.02, 0.04, 6);
    noseGeo.rotateX(Math.PI / 2);
    const noseMesh = new THREE.Mesh(noseGeo, matSkin);
    noseMesh.position.set(0, -0.015, 0.255);
    headGroup.add(noseMesh);

    // Alis Rapi Melengkung
    const browMat = new THREE.MeshBasicMaterial({ color: this.gender === 'boy' ? 0x1f140e : 0x2e190e });
    const browGeo = new THREE.BoxGeometry(0.072, 0.014, 0.02);

    const browL = new THREE.Mesh(browGeo, browMat);
    browL.position.set(0.092, 0.092, 0.235);
    browL.rotation.z = (this.gender === 'boy') ? -0.08 : 0.04;
    browL.rotation.y = 0.16;
    headGroup.add(browL);

    const browR = new THREE.Mesh(browGeo, browMat);
    browR.position.set(-0.092, 0.092, 0.235);
    browR.rotation.z = (this.gender === 'boy') ? 0.08 : -0.04;
    browR.rotation.y = -0.16;
    headGroup.add(browR);

    // Mata Lebar Berbinar Indah (Sclera + Iris Biru Bergradasi + Pupil + 2 Highlight Cahaya)
    const eyeWhiteGeo = new THREE.CapsuleGeometry(0.042, 0.034, 8, 12);
    const eyeIrisGeo = new THREE.SphereGeometry(0.034, 12, 12);
    const eyePupilGeo = new THREE.SphereGeometry(0.02, 10, 10);

    // Mata Kiri
    const eyeLGroup = new THREE.Group();
    eyeLGroup.position.set(0.09, 0.018, 0.232);
    eyeLGroup.rotation.y = 0.16;
    headGroup.add(eyeLGroup);

    eyeLGroup.add(new THREE.Mesh(eyeWhiteGeo, matEyeWhite));

    const irisL = new THREE.Mesh(eyeIrisGeo, matIris);
    irisL.scale.set(1, 1.1, 0.35);
    irisL.position.set(0, -0.004, 0.022);
    eyeLGroup.add(irisL);

    const pupilL = new THREE.Mesh(eyePupilGeo, matPupil);
    pupilL.scale.set(1, 1.1, 0.4);
    pupilL.position.set(0, -0.004, 0.029);
    eyeLGroup.add(pupilL);

    const shineL1 = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), matEyeShine);
    shineL1.position.set(0.011, 0.013, 0.035);
    eyeLGroup.add(shineL1);

    const shineL2 = new THREE.Mesh(new THREE.SphereGeometry(0.006, 6, 6), matEyeShine);
    shineL2.position.set(-0.009, -0.011, 0.035);
    eyeLGroup.add(shineL2);

    // Mata Kanan
    const eyeRGroup = new THREE.Group();
    eyeRGroup.position.set(-0.09, 0.018, 0.232);
    eyeRGroup.rotation.y = -0.16;
    headGroup.add(eyeRGroup);

    eyeRGroup.add(new THREE.Mesh(eyeWhiteGeo, matEyeWhite));

    const irisR = new THREE.Mesh(eyeIrisGeo, matIris);
    irisR.scale.set(1, 1.1, 0.35);
    irisR.position.set(0, -0.004, 0.022);
    eyeRGroup.add(irisR);

    const pupilR = new THREE.Mesh(eyePupilGeo, matPupil);
    pupilR.scale.set(1, 1.1, 0.4);
    pupilR.position.set(0, -0.004, 0.029);
    eyeRGroup.add(pupilR);

    const shineR1 = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 8), matEyeShine);
    shineR1.position.set(-0.011, 0.013, 0.035);
    eyeRGroup.add(shineR1);

    const shineR2 = new THREE.Mesh(new THREE.SphereGeometry(0.006, 6, 6), matEyeShine);
    shineR2.position.set(0.009, -0.011, 0.035);
    eyeRGroup.add(shineR2);

    // Bulu Mata Lentik untuk Karakter Wanita
    if (this.gender === 'girl') {
      const lashMat = new THREE.MeshBasicMaterial({ color: 0x111827 });
      const lashGeo = new THREE.BoxGeometry(0.044, 0.007, 0.01);
      const lashL = new THREE.Mesh(lashGeo, lashMat);
      lashL.position.set(0.022, 0.03, 0.027);
      lashL.rotation.z = -0.28;
      eyeLGroup.add(lashL);

      const lashR = new THREE.Mesh(lashGeo, lashMat);
      lashR.position.set(-0.022, 0.03, 0.027);
      lashR.rotation.z = 0.28;
      eyeRGroup.add(lashR);
    }

    // Pipi Merona Lembut (Blush On)
    const blushGeo = new THREE.CircleGeometry(0.044, 16);
    const blushL = new THREE.Mesh(blushGeo, matBlush);
    blushL.position.set(0.138, -0.046, 0.22);
    blushL.rotation.y = 0.3;
    headGroup.add(blushL);

    const blushR = new THREE.Mesh(blushGeo, matBlush);
    blushR.position.set(-0.138, -0.046, 0.22);
    blushR.rotation.y = -0.3;
    headGroup.add(blushR);

    // Bibir Senyum Cantik & Tampan
    const smileGeo = new THREE.TorusGeometry(0.034, 0.0065, 8, 16, Math.PI * 0.9);
    const smileMat = new THREE.MeshBasicMaterial({ color: (this.gender === 'girl') ? 0xf43f5e : 0x9f1239 });
    const smileMesh = new THREE.Mesh(smileGeo, smileMat);
    smileMesh.position.set(0, -0.07, 0.246);
    smileMesh.rotation.x = Math.PI;
    headGroup.add(smileMesh);

    // 5. GAYA RAMBUT BERKUALITAS TINGGI
    if (this.gender === 'boy') {
      // Rambut Pria Ganteng & Modis (Modern K-Pop / Anime Groom)
      const hairMat = new THREE.MeshLambertMaterial({ color: boyHairColor });
      const hairBaseGeo = new THREE.SphereGeometry(0.285, 20, 20);
      hairBaseGeo.scale(1.02, 1.06, 1.05);
      const hairBase = new THREE.Mesh(hairBaseGeo, hairMat);
      hairBase.position.set(0, 0.065, -0.02);
      headGroup.add(hairBase);

      // Layer Poni Modis
      const bang1 = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.24, 6), hairMat);
      bang1.position.set(0.11, 0.18, 0.19);
      bang1.rotation.set(0.2, 0, -0.45);
      headGroup.add(bang1);

      const bang2 = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.21, 6), hairMat);
      bang2.position.set(0.01, 0.2, 0.21);
      bang2.rotation.set(0.2, 0, -0.15);
      headGroup.add(bang2);

      const bang3 = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.19, 6), hairMat);
      bang3.position.set(-0.1, 0.18, 0.19);
      bang3.rotation.set(0.2, 0, 0.35);
      headGroup.add(bang3);

      // Jambang Samping Rapi
      const sideburnL = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.15, 0.09), hairMat);
      sideburnL.position.set(0.24, 0.02, 0.09);
      headGroup.add(sideburnL);

      const sideburnR = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.15, 0.09), hairMat);
      sideburnR.position.set(-0.24, 0.02, 0.09);
      headGroup.add(sideburnR);

    } else {
      // Rambut Wanita Cantik & Anggun (Bridal Bun & Tiara / Pagar Ayu Hairdo)
      const hairMat = new THREE.MeshLambertMaterial({ color: girlHairColor });
      const hairBaseGeo = new THREE.SphereGeometry(0.295, 20, 20);
      hairBaseGeo.scale(1.03, 1.06, 1.07);
      const hairBase = new THREE.Mesh(hairBaseGeo, hairMat);
      hairBase.position.set(0, 0.055, -0.03);
      headGroup.add(hairBase);

      // Poni Depan Lembut
      const bangC = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.025, 0.17, 8), hairMat);
      bangC.position.set(0, 0.19, 0.21);
      bangC.rotation.z = Math.PI / 2;
      headGroup.add(bangC);

      const bangL = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.02, 0.36, 8), hairMat);
      bangL.position.set(0.2, -0.05, 0.13);
      bangL.rotation.z = -0.16;
      bangL.rotation.x = 0.1;
      headGroup.add(bangL);

      const bangR = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.02, 0.36, 8), hairMat);
      bangR.position.set(-0.2, -0.05, 0.13);
      bangR.rotation.z = 0.16;
      bangR.rotation.x = 0.1;
      headGroup.add(bangR);

      // Sanggul Mewah di Belakang
      const bunMesh = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 16), hairMat);
      bunMesh.position.set(0, 0.13, -0.26);
      headGroup.add(bunMesh);

      // Mahkota Tiara Emas
      const tiaraGeo = new THREE.TorusGeometry(0.16, 0.018, 8, 16, Math.PI);
      tiaraGeo.rotateX(Math.PI / 2);
      const tiaraMesh = new THREE.Mesh(tiaraGeo, new THREE.MeshLambertMaterial({ color: girlTiaraColor }));
      tiaraMesh.position.set(0, 0.25, 0.05);
      headGroup.add(tiaraMesh);

      const gemGeo = new THREE.OctahedronGeometry(0.032);
      const gemMesh = new THREE.Mesh(gemGeo, new THREE.MeshBasicMaterial({ color: isPagarAyu ? 0xf43f5e : 0x38bdf8 }));
      gemMesh.position.set(0, 0.31, 0.11);
      headGroup.add(gemMesh);

      // Hiasan Melati untuk Pagar Ayu / Cadar Transparan untuk Mempelai Wanita
      if (isPagarAyu) {
        // Untaian Bunga Melati di Samping Sanggul
        for (let m = 0; m < 5; m++) {
          const melati = new THREE.Mesh(
            new THREE.SphereGeometry(0.03, 6, 6),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
          );
          melati.position.set(0.14, 0.1 - (m * 0.05), -0.2 + (m * 0.02));
          headGroup.add(melati);
        }
      } else {
        // Cadar / Veil Melayang Pengantin Wanita
        const veilGeo = new THREE.PlaneGeometry(0.46, 0.82, 4, 4);
        const veilMat = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.52,
          side: THREE.DoubleSide
        });
        const veilMesh = new THREE.Mesh(veilGeo, veilMat);
        veilMesh.position.set(0, -0.07, -0.32);
        veilMesh.rotation.x = -0.18;
        headGroup.add(veilMesh);
        this.parts.veil = veilMesh;
      }
    }
  }

  updateAnimation(delta, moveVector, isMoving, speedMultiplier = 1.0) {
    if (isMoving && (moveVector.x !== 0 || moveVector.z !== 0)) {
      this.targetFacingAngle = Math.atan2(moveVector.x, moveVector.z);
    }

    let diff = (this.targetFacingAngle - this.facingAngle) % (Math.PI * 2);
    if (diff < -Math.PI) diff += Math.PI * 2;
    if (diff > Math.PI) diff -= Math.PI * 2;
    this.facingAngle += diff * Math.min(1, delta * 12);
    this.parts.root.rotation.y = this.facingAngle;

    const targetBlend = isMoving ? 1.0 : 0.0;
    this.walkBlend += (targetBlend - this.walkBlend) * Math.min(1, delta * 10);

    const strideCadence = 9.5 * speedMultiplier;
    if (isMoving) {
      this.walkCycle += delta * strideCadence;
    } else {
      this.walkCycle += (0 - (this.walkCycle % (Math.PI * 2))) * Math.min(1, delta * 8);
    }

    this.idleTime += delta;

    const legSwing = Math.sin(this.walkCycle) * 0.65 * this.walkBlend;
    const armSwing = Math.sin(this.walkCycle) * 0.6 * this.walkBlend;

    // A. Kaki bergantian
    this.parts.leftLegPivot.rotation.x = legSwing;
    this.parts.rightLegPivot.rotation.x = -legSwing;
    this.parts.leftLegPivot.rotation.z = Math.sin(this.walkCycle * 0.5) * 0.03 * this.walkBlend;
    this.parts.rightLegPivot.rotation.z = -Math.sin(this.walkCycle * 0.5) * 0.03 * this.walkBlend;

    // B. Tangan mengayun berlawanan
    this.parts.leftArmPivot.rotation.x = -armSwing;
    this.parts.rightArmPivot.rotation.x = armSwing;
    this.parts.leftArmPivot.rotation.z = 0.12 + Math.cos(this.walkCycle) * 0.05 * this.walkBlend;
    this.parts.rightArmPivot.rotation.z = -0.12 - Math.cos(this.walkCycle) * 0.05 * this.walkBlend;

    // C. Badan naik-turun (bobbing)
    const bodyBob = Math.abs(Math.sin(this.walkCycle)) * 0.055 * this.walkBlend;
    const idleBreathe = Math.sin(this.idleTime * 2.4) * 0.015 * (1 - this.walkBlend);
    this.parts.bodyGroup.position.y = bodyBob + idleBreathe;

    // D. Kepala stabil & natural
    this.parts.headGroup.rotation.x = -bodyBob * 0.4 + Math.sin(this.idleTime * 1.8) * 0.02 * (1 - this.walkBlend);
    this.parts.headGroup.rotation.z = Math.sin(this.walkCycle * 0.5) * 0.025 * this.walkBlend;

    // E. Goyangan rok & veil
    if (this.gender === 'girl') {
      if (this.parts.skirt) {
        this.parts.skirt.rotation.x = Math.sin(this.walkCycle) * 0.08 * this.walkBlend;
        this.parts.skirt.rotation.z = Math.cos(this.walkCycle * 0.5) * 0.04 * this.walkBlend;
      }
      if (this.parts.veil) {
        this.parts.veil.rotation.x = -0.18 - (this.walkBlend * 0.15) + Math.sin(this.walkCycle * 2) * 0.05 * this.walkBlend;
      }
    }
  }

  setPosition(x, y, z) {
    this.group.position.set(x, y, z);
  }

  getPosition() {
    return this.group.position;
  }
}
