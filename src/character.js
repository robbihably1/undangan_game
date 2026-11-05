// =========================================================================
// CHARACTER.JS - MODEL KARAKTER 3D STYLIZED & SISTEM ANIMASI BERJALAN LENGKAP
// Menghasilkan karakter 3D (Pria & Wanita) dengan rigging hierarkis & animasi
// =========================================================================

import * as THREE from 'three';

// Helper untuk membuat tekstur bayangan radial halus (soft contact shadow)
let sharedShadowTexture = null;
function getSoftShadowTexture() {
  if (sharedShadowTexture) return sharedShadowTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(15, 23, 42, 0.65)');
  gradient.addColorStop(0.35, 'rgba(15, 23, 42, 0.42)');
  gradient.addColorStop(0.7, 'rgba(15, 23, 42, 0.15)');
  gradient.addColorStop(1, 'rgba(15, 23, 42, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  sharedShadowTexture = new THREE.CanvasTexture(canvas);
  return sharedShadowTexture;
}

export class Character3D {
  constructor(gender = 'boy') {
    this.gender = gender;
    this.group = new THREE.Group();
    this.walkCycle = 0;
    this.idleTime = 0;
    this.walkBlend = 0;
    this.currentSpeed = 0;
    this.facingAngle = 0;
    this.targetFacingAngle = 0;

    this.parts = {};
    this.buildModel();
  }

  buildModel() {
    const skinColor = 0xffdfc4;
    const blushColor = 0xf472b6;
    const eyeIrisColor = 0x312e81; // Iris biru navy tajam
    const eyePupilColor = 0x0f172a;

    const boySuitColor = 0x1e293b;
    const boyPantsColor = 0x0f172a;
    const boyShirtColor = 0xf8fafc;
    const boyTieColor = 0xd97706;
    const boyHairColor = 0x2b1d14;

    const girlDressColor = 0xffffff;
    const girlTrimColor = 0xfce7f3;
    const girlHairColor = 0x3f2314;
    const girlTiaraColor = 0xfbbf24;

    const matSkin = new THREE.MeshLambertMaterial({ color: skinColor });
    const matBlush = new THREE.MeshBasicMaterial({ color: blushColor, transparent: true, opacity: 0.6 });
    const matIris = new THREE.MeshBasicMaterial({ color: eyeIrisColor });
    const matPupil = new THREE.MeshBasicMaterial({ color: eyePupilColor });
    const matEyeWhite = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const matEyeShine = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const root = new THREE.Group();
    root.name = 'character_root';
    this.group.add(root);
    this.parts.root = root;

    // Contact Shadow halus dengan gradient radial
    const shadowGeo = new THREE.PlaneGeometry(1.2, 1.2);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: getSoftShadowTexture(),
      transparent: true,
      opacity: 0.75,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.position.y = 0.02;
    this.group.add(shadowMesh);

    // Body Group (bobbing naik-turun)
    const bodyGroup = new THREE.Group();
    bodyGroup.position.y = 0;
    root.add(bodyGroup);
    this.parts.bodyGroup = bodyGroup;

    // 1. KAKI (LEGS & FEET)
    const legGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.45, 12);
    const shoeGeo = new THREE.BoxGeometry(0.16, 0.1, 0.22);
    shoeGeo.translate(0, -0.02, 0.04);

    const legMat = this.gender === 'boy'
      ? new THREE.MeshLambertMaterial({ color: boyPantsColor })
      : new THREE.MeshLambertMaterial({ color: skinColor });

    const shoeMat = new THREE.MeshLambertMaterial({
      color: this.gender === 'boy' ? 0x111827 : 0xf8fafc
    });

    // Kaki Kiri
    const leftLegPivot = new THREE.Group();
    leftLegPivot.position.set(0.16, 0.5, 0);
    bodyGroup.add(leftLegPivot);
    this.parts.leftLegPivot = leftLegPivot;

    const leftLegMesh = new THREE.Mesh(legGeo, legMat);
    leftLegMesh.position.y = -0.22;
    leftLegPivot.add(leftLegMesh);

    const leftShoeMesh = new THREE.Mesh(shoeGeo, shoeMat);
    leftShoeMesh.position.y = -0.42;
    leftLegPivot.add(leftShoeMesh);

    // Kaki Kanan
    const rightLegPivot = new THREE.Group();
    rightLegPivot.position.set(-0.16, 0.5, 0);
    bodyGroup.add(rightLegPivot);
    this.parts.rightLegPivot = rightLegPivot;

    const rightLegMesh = new THREE.Mesh(legGeo, legMat);
    rightLegMesh.position.y = -0.22;
    rightLegPivot.add(rightLegMesh);

    const rightShoeMesh = new THREE.Mesh(shoeGeo, shoeMat);
    rightShoeMesh.position.y = -0.42;
    rightLegPivot.add(rightShoeMesh);

    // 2. BADAN / TORSO & OUTFIT
    const torsoGroup = new THREE.Group();
    torsoGroup.position.set(0, 0.65, 0);
    bodyGroup.add(torsoGroup);
    this.parts.torsoGroup = torsoGroup;

    if (this.gender === 'boy') {
      const torsoGeo = new THREE.BoxGeometry(0.42, 0.44, 0.26);
      const torsoMat = new THREE.MeshLambertMaterial({ color: boySuitColor });
      const torsoMesh = new THREE.Mesh(torsoGeo, torsoMat);
      torsoGroup.add(torsoMesh);

      const shirtGeo = new THREE.PlaneGeometry(0.18, 0.32);
      const shirtMat = new THREE.MeshLambertMaterial({ color: boyShirtColor });
      const shirtMesh = new THREE.Mesh(shirtGeo, shirtMat);
      shirtMesh.position.set(0, 0.04, 0.132);
      torsoGroup.add(shirtMesh);

      const tieGeo = new THREE.BoxGeometry(0.12, 0.06, 0.04);
      const tieMat = new THREE.MeshLambertMaterial({ color: boyTieColor });
      const tieMesh = new THREE.Mesh(tieGeo, tieMat);
      tieMesh.position.set(0, 0.16, 0.145);
      torsoGroup.add(tieMesh);

      const rosePin = new THREE.Mesh(
        new THREE.SphereGeometry(0.03, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xec4899 })
      );
      rosePin.position.set(0.13, 0.12, 0.14);
      torsoGroup.add(rosePin);

    } else {
      const corsetGeo = new THREE.CylinderGeometry(0.18, 0.2, 0.36, 16);
      const corsetMat = new THREE.MeshLambertMaterial({ color: girlDressColor });
      const corsetMesh = new THREE.Mesh(corsetGeo, corsetMat);
      torsoGroup.add(corsetMesh);

      const pearlGeo = new THREE.TorusGeometry(0.14, 0.02, 8, 16);
      pearlGeo.rotateX(Math.PI / 2);
      const pearlMesh = new THREE.Mesh(pearlGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
      pearlMesh.position.set(0, 0.14, 0);
      torsoGroup.add(pearlMesh);

      const skirtGeo = new THREE.ConeGeometry(0.48, 0.52, 18, 1, true);
      const skirtMat = new THREE.MeshLambertMaterial({
        color: girlDressColor,
        side: THREE.DoubleSide
      });
      const skirtMesh = new THREE.Mesh(skirtGeo, skirtMat);
      skirtMesh.position.set(0, -0.22, 0);
      torsoGroup.add(skirtMesh);
      this.parts.skirt = skirtMesh;

      const laceGeo = new THREE.TorusGeometry(0.46, 0.03, 8, 20);
      laceGeo.rotateX(Math.PI / 2);
      const laceMesh = new THREE.Mesh(laceGeo, new THREE.MeshLambertMaterial({ color: girlTrimColor }));
      laceMesh.position.set(0, -0.47, 0);
      torsoGroup.add(laceMesh);
    }

    // 3. TANGAN (ARMS & HANDS)
    const armGeo = new THREE.CylinderGeometry(0.065, 0.06, 0.38, 10);
    const handGeo = new THREE.SphereGeometry(0.065, 10, 10);
    const armColor = this.gender === 'boy' ? boySuitColor : girlDressColor;
    const armMat = new THREE.MeshLambertMaterial({ color: armColor });

    // Lengan Kiri
    const leftArmPivot = new THREE.Group();
    leftArmPivot.position.set(0.27, 0.8, 0);
    bodyGroup.add(leftArmPivot);
    this.parts.leftArmPivot = leftArmPivot;

    const leftArmMesh = new THREE.Mesh(armGeo, armMat);
    leftArmMesh.position.y = -0.18;
    leftArmPivot.add(leftArmMesh);

    const leftHandMesh = new THREE.Mesh(handGeo, matSkin);
    leftHandMesh.position.y = -0.36;
    leftArmPivot.add(leftHandMesh);

    // Lengan Kanan
    const rightArmPivot = new THREE.Group();
    rightArmPivot.position.set(-0.27, 0.8, 0);
    bodyGroup.add(rightArmPivot);
    this.parts.rightArmPivot = rightArmPivot;

    const rightArmMesh = new THREE.Mesh(armGeo, armMat);
    rightArmMesh.position.y = -0.18;
    rightArmPivot.add(rightArmMesh);

    const rightHandMesh = new THREE.Mesh(handGeo, matSkin);
    rightHandMesh.position.y = -0.36;
    rightArmPivot.add(rightHandMesh);

    if (this.gender === 'girl') {
      const bouquetGroup = new THREE.Group();
      const bStem = new THREE.Mesh(
        new THREE.ConeGeometry(0.06, 0.12, 8),
        new THREE.MeshLambertMaterial({ color: 0x86efac })
      );
      bStem.rotation.x = Math.PI;
      bouquetGroup.add(bStem);

      const flower = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.08),
        new THREE.MeshLambertMaterial({ color: 0xf472b6 })
      );
      flower.position.y = 0.08;
      bouquetGroup.add(flower);

      bouquetGroup.position.set(0, -0.36, 0.08);
      leftArmPivot.add(bouquetGroup);
    }

    // 4. KEPALA, WAJAH, & RAMBUT (Desain Cantik & Tampan Bergaya Chibi Anime/RPG)
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.05, 0);
    bodyGroup.add(headGroup);
    this.parts.headGroup = headGroup;

    // Struktur Kepala Lembut
    const headGeo = new THREE.SphereGeometry(0.28, 24, 24);
    headGeo.scale(1.0, 1.06, 0.98);
    const headMesh = new THREE.Mesh(headGeo, matSkin);
    headGroup.add(headMesh);

    // Hidung Mungil Menggemaskan
    const noseGeo = new THREE.SphereGeometry(0.022, 8, 8);
    const noseMesh = new THREE.Mesh(noseGeo, matSkin);
    noseMesh.position.set(0, -0.015, 0.28);
    noseMesh.scale.set(0.9, 0.8, 1.2);
    headGroup.add(noseMesh);

    // Alis Karakter
    const browMat = new THREE.MeshBasicMaterial({ color: this.gender === 'boy' ? 0x1f140e : 0x2e190e });
    const browGeo = new THREE.BoxGeometry(0.075, 0.015, 0.02);

    const browL = new THREE.Mesh(browGeo, browMat);
    browL.position.set(0.1, 0.1, 0.255);
    browL.rotation.z = this.gender === 'boy' ? -0.1 : 0.06;
    browL.rotation.y = 0.18;
    headGroup.add(browL);

    const browR = new THREE.Mesh(browGeo, browMat);
    browR.position.set(-0.1, 0.1, 0.255);
    browR.rotation.z = this.gender === 'boy' ? 0.1 : -0.06;
    browR.rotation.y = -0.18;
    headGroup.add(browR);

    // Mata Bertingkat (Sclera Putih + Iris Berwarna + Pupil Gelap + Highlight Bintang)
    const eyeWhiteGeo = new THREE.CapsuleGeometry(0.046, 0.038, 8, 12);
    const eyeIrisGeo = new THREE.SphereGeometry(0.036, 12, 12);
    const eyePupilGeo = new THREE.SphereGeometry(0.022, 10, 10);

    // Mata Kiri
    const eyeLGroup = new THREE.Group();
    eyeLGroup.position.set(0.098, 0.015, 0.25);
    eyeLGroup.rotation.y = 0.18;
    headGroup.add(eyeLGroup);

    const scleraL = new THREE.Mesh(eyeWhiteGeo, matEyeWhite);
    eyeLGroup.add(scleraL);

    const irisL = new THREE.Mesh(eyeIrisGeo, matIris);
    irisL.scale.set(1, 1.1, 0.35);
    irisL.position.set(0, -0.005, 0.024);
    eyeLGroup.add(irisL);

    const pupilL = new THREE.Mesh(eyePupilGeo, matPupil);
    pupilL.scale.set(1, 1.1, 0.4);
    pupilL.position.set(0, -0.005, 0.032);
    eyeLGroup.add(pupilL);

    const shineL1 = new THREE.Mesh(new THREE.SphereGeometry(0.013, 8, 8), matEyeShine);
    shineL1.position.set(0.012, 0.015, 0.038);
    eyeLGroup.add(shineL1);

    const shineL2 = new THREE.Mesh(new THREE.SphereGeometry(0.007, 6, 6), matEyeShine);
    shineL2.position.set(-0.01, -0.012, 0.038);
    eyeLGroup.add(shineL2);

    // Mata Kanan
    const eyeRGroup = new THREE.Group();
    eyeRGroup.position.set(-0.098, 0.015, 0.25);
    eyeRGroup.rotation.y = -0.18;
    headGroup.add(eyeRGroup);

    const scleraR = new THREE.Mesh(eyeWhiteGeo, matEyeWhite);
    eyeRGroup.add(scleraR);

    const irisR = new THREE.Mesh(eyeIrisGeo, matIris);
    irisR.scale.set(1, 1.1, 0.35);
    irisR.position.set(0, -0.005, 0.024);
    eyeRGroup.add(irisR);

    const pupilR = new THREE.Mesh(eyePupilGeo, matPupil);
    pupilR.scale.set(1, 1.1, 0.4);
    pupilR.position.set(0, -0.005, 0.032);
    eyeRGroup.add(pupilR);

    const shineR1 = new THREE.Mesh(new THREE.SphereGeometry(0.013, 8, 8), matEyeShine);
    shineR1.position.set(-0.012, 0.015, 0.038);
    eyeRGroup.add(shineR1);

    const shineR2 = new THREE.Mesh(new THREE.SphereGeometry(0.007, 6, 6), matEyeShine);
    shineR2.position.set(0.01, -0.012, 0.038);
    eyeRGroup.add(shineR2);

    // Bulu Mata untuk Pengantin Wanita
    if (this.gender === 'girl') {
      const lashMat = new THREE.MeshBasicMaterial({ color: 0x18181b });
      const lashGeo = new THREE.BoxGeometry(0.045, 0.008, 0.01);
      const lashL = new THREE.Mesh(lashGeo, lashMat);
      lashL.position.set(0.025, 0.032, 0.028);
      lashL.rotation.z = -0.3;
      eyeLGroup.add(lashL);

      const lashR = new THREE.Mesh(lashGeo, lashMat);
      lashR.position.set(-0.025, 0.032, 0.028);
      lashR.rotation.z = 0.3;
      eyeRGroup.add(lashR);
    }

    // Pipi Merona Halus (Blush On)
    const blushGeo = new THREE.CircleGeometry(0.046, 16);
    const blushL = new THREE.Mesh(blushGeo, matBlush);
    blushL.position.set(0.145, -0.05, 0.235);
    blushL.rotation.y = 0.32;
    headGroup.add(blushL);

    const blushR = new THREE.Mesh(blushGeo, matBlush);
    blushR.position.set(-0.145, -0.05, 0.235);
    blushR.rotation.y = -0.32;
    headGroup.add(blushR);

    // Senyum Manis Melengkung
    const smileGeo = new THREE.TorusGeometry(0.036, 0.007, 8, 16, Math.PI * 0.9);
    const smileMat = new THREE.MeshBasicMaterial({ color: this.gender === 'girl' ? 0xe11d48 : 0x9f1239 });
    const smileMesh = new THREE.Mesh(smileGeo, smileMat);
    smileMesh.position.set(0, -0.075, 0.265);
    smileMesh.rotation.x = Math.PI;
    headGroup.add(smileMesh);

    // RAMBUT & AKSESORIS
    if (this.gender === 'boy') {
      const hairMat = new THREE.MeshLambertMaterial({ color: boyHairColor });
      // Helm rambut utama
      const hairBaseGeo = new THREE.SphereGeometry(0.305, 20, 20);
      hairBaseGeo.scale(1.02, 1.06, 1.06);
      const hairBase = new THREE.Mesh(hairBaseGeo, hairMat);
      hairBase.position.set(0, 0.065, -0.025);
      headGroup.add(hairBase);

      // Poni samping modis (side-parted cool anime style)
      const bang1 = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.25, 6), hairMat);
      bang1.position.set(0.12, 0.19, 0.2);
      bang1.rotation.set(0.2, 0, -0.5);
      headGroup.add(bang1);

      const bang2 = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.22, 6), hairMat);
      bang2.position.set(0.01, 0.22, 0.22);
      bang2.rotation.set(0.2, 0, -0.2);
      headGroup.add(bang2);

      const bang3 = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 6), hairMat);
      bang3.position.set(-0.11, 0.2, 0.2);
      bang3.rotation.set(0.2, 0, 0.4);
      headGroup.add(bang3);

      // Sisi samping jambang rapi
      const sideburnL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.16, 0.1), hairMat);
      sideburnL.position.set(0.26, 0.02, 0.1);
      headGroup.add(sideburnL);

      const sideburnR = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.16, 0.1), hairMat);
      sideburnR.position.set(-0.26, 0.02, 0.1);
      headGroup.add(sideburnR);

    } else {
      const hairMat = new THREE.MeshLambertMaterial({ color: girlHairColor });
      // Rambut dasar pengantin wanita
      const hairBaseGeo = new THREE.SphereGeometry(0.315, 20, 20);
      hairBaseGeo.scale(1.03, 1.06, 1.08);
      const hairBase = new THREE.Mesh(hairBaseGeo, hairMat);
      hairBase.position.set(0, 0.055, -0.035);
      headGroup.add(hairBase);

      // Poni depan melengkung manis (soft curtain bangs)
      const bangC = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.03, 0.18, 8), hairMat);
      bangC.position.set(0, 0.2, 0.23);
      bangC.rotation.z = Math.PI / 2;
      headGroup.add(bangC);

      const bangL = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.02, 0.38, 8), hairMat);
      bangL.position.set(0.22, -0.06, 0.14);
      bangL.rotation.z = -0.18;
      bangL.rotation.x = 0.1;
      headGroup.add(bangL);

      const bangR = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.02, 0.38, 8), hairMat);
      bangR.position.set(-0.22, -0.06, 0.14);
      bangR.rotation.z = 0.18;
      bangR.rotation.x = 0.1;
      headGroup.add(bangR);

      // Sanggul Mewah di Belakang (Bridal Bun)
      const bunMesh = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), hairMat);
      bunMesh.position.set(0, 0.14, -0.28);
      headGroup.add(bunMesh);

      // Mahkota / Tiara Emas Berkilau
      const tiaraGeo = new THREE.TorusGeometry(0.17, 0.02, 8, 16, Math.PI);
      tiaraGeo.rotateX(Math.PI / 2);
      const tiaraMesh = new THREE.Mesh(tiaraGeo, new THREE.MeshLambertMaterial({ color: girlTiaraColor }));
      tiaraMesh.position.set(0, 0.27, 0.06);
      headGroup.add(tiaraMesh);

      // Permata Tiara
      const gemGeo = new THREE.OctahedronGeometry(0.035);
      const gemMesh = new THREE.Mesh(gemGeo, new THREE.MeshBasicMaterial({ color: 0x67e8f9 }));
      gemMesh.position.set(0, 0.33, 0.12);
      headGroup.add(gemMesh);

      // Cadar / Veil Pengantin Transparan Melayang
      const veilGeo = new THREE.PlaneGeometry(0.48, 0.85, 4, 4);
      const veilMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.52,
        side: THREE.DoubleSide
      });
      const veilMesh = new THREE.Mesh(veilGeo, veilMat);
      veilMesh.position.set(0, -0.08, -0.34);
      veilMesh.rotation.x = -0.18;
      headGroup.add(veilMesh);
      this.parts.veil = veilMesh;
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
        this.parts.veil.rotation.x = -0.2 - (this.walkBlend * 0.15) + Math.sin(this.walkCycle * 2) * 0.05 * this.walkBlend;
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
