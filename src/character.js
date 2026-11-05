// =========================================================================
// CHARACTER.JS - MODEL KARAKTER 3D STYLIZED & SISTEM ANIMASI BERJALAN LENGKAP
// Menghasilkan karakter 3D (Pria & Wanita) dengan rigging hierarkis & animasi
// =========================================================================

import * as THREE from 'three';

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
    const skinColor = 0xffe0bd;
    const blushColor = 0xffa3a3;
    const eyeColor = 0x242424;

    const boySuitColor = 0x1e293b;
    const boyPantsColor = 0x0f172a;
    const boyShirtColor = 0xf8fafc;
    const boyTieColor = 0xd97706;
    const boyHairColor = 0x3b2416;

    const girlDressColor = 0xffffff;
    const girlTrimColor = 0xfce7f3;
    const girlHairColor = 0x543622;
    const girlTiaraColor = 0xfbbf24;

    const matSkin = new THREE.MeshLambertMaterial({ color: skinColor });
    const matBlush = new THREE.MeshBasicMaterial({ color: blushColor });
    const matEye = new THREE.MeshBasicMaterial({ color: eyeColor });
    const matEyeShine = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const root = new THREE.Group();
    root.name = 'character_root';
    this.group.add(root);
    this.parts.root = root;

    // Contact Shadow di bawah kaki
    const shadowGeo = new THREE.CircleGeometry(0.48, 24);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.35,
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

    // 4. KEPALA, WAJAH, & RAMBUT
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.05, 0);
    bodyGroup.add(headGroup);
    this.parts.headGroup = headGroup;

    const headGeo = new THREE.SphereGeometry(0.28, 20, 20);
    headGeo.scale(1, 1.06, 1);
    const headMesh = new THREE.Mesh(headGeo, matSkin);
    headGroup.add(headMesh);

    const eyeGeo = new THREE.CapsuleGeometry(0.038, 0.04, 8, 8);
    const eyeL = new THREE.Mesh(eyeGeo, matEye);
    eyeL.position.set(0.1, 0.02, 0.245);
    eyeL.rotation.y = 0.15;
    headGroup.add(eyeL);

    const eyeR = new THREE.Mesh(eyeGeo, matEye);
    eyeR.position.set(-0.1, 0.02, 0.245);
    eyeR.rotation.y = -0.15;
    headGroup.add(eyeR);

    const shineGeo = new THREE.SphereGeometry(0.015, 6, 6);
    const shineL = new THREE.Mesh(shineGeo, matEyeShine);
    shineL.position.set(0.108, 0.045, 0.272);
    headGroup.add(shineL);

    const shineR = new THREE.Mesh(shineGeo, matEyeShine);
    shineR.position.set(-0.092, 0.045, 0.272);
    headGroup.add(shineR);

    const blushGeo = new THREE.CircleGeometry(0.045, 12);
    const blushL = new THREE.Mesh(blushGeo, matBlush);
    blushL.position.set(0.15, -0.05, 0.245);
    blushL.rotation.y = 0.35;
    headGroup.add(blushL);

    const blushR = new THREE.Mesh(blushGeo, matBlush);
    blushR.position.set(-0.15, -0.05, 0.245);
    blushR.rotation.y = -0.35;
    headGroup.add(blushR);

    const smileGeo = new THREE.TorusGeometry(0.04, 0.008, 6, 12, Math.PI);
    const smileMesh = new THREE.Mesh(smileGeo, new THREE.MeshBasicMaterial({ color: 0x9f1239 }));
    smileMesh.position.set(0, -0.07, 0.265);
    smileMesh.rotation.x = Math.PI;
    headGroup.add(smileMesh);

    if (this.gender === 'boy') {
      const hairMat = new THREE.MeshLambertMaterial({ color: boyHairColor });
      const hairBaseGeo = new THREE.SphereGeometry(0.3, 16, 16);
      hairBaseGeo.scale(1.02, 1.05, 1.05);
      const hairBase = new THREE.Mesh(hairBaseGeo, hairMat);
      hairBase.position.set(0, 0.06, -0.03);
      headGroup.add(hairBase);

      const bangGeo = new THREE.ConeGeometry(0.12, 0.22, 6);
      bangGeo.rotateZ(0.3);
      const bangL = new THREE.Mesh(bangGeo, hairMat);
      bangL.position.set(0.12, 0.2, 0.18);
      headGroup.add(bangL);

      const bangR = new THREE.Mesh(bangGeo, hairMat);
      bangR.position.set(-0.08, 0.22, 0.19);
      bangR.rotation.z = -0.4;
      headGroup.add(bangR);

    } else {
      const hairMat = new THREE.MeshLambertMaterial({ color: girlHairColor });
      const hairBaseGeo = new THREE.SphereGeometry(0.31, 18, 18);
      hairBaseGeo.scale(1.03, 1.05, 1.08);
      const hairBase = new THREE.Mesh(hairBaseGeo, hairMat);
      hairBase.position.set(0, 0.05, -0.04);
      headGroup.add(hairBase);

      const sideBangGeo = new THREE.CylinderGeometry(0.04, 0.02, 0.32, 8);
      const bangL = new THREE.Mesh(sideBangGeo, hairMat);
      bangL.position.set(0.24, -0.05, 0.12);
      bangL.rotation.z = -0.15;
      headGroup.add(bangL);

      const bangR = new THREE.Mesh(sideBangGeo, hairMat);
      bangR.position.set(-0.24, -0.05, 0.12);
      bangR.rotation.z = 0.15;
      headGroup.add(bangR);

      const bunMesh = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 14), hairMat);
      bunMesh.position.set(0, 0.14, -0.28);
      headGroup.add(bunMesh);

      const tiaraGeo = new THREE.TorusGeometry(0.18, 0.02, 8, 16, Math.PI);
      tiaraGeo.rotateX(Math.PI / 2);
      const tiaraMesh = new THREE.Mesh(tiaraGeo, new THREE.MeshLambertMaterial({ color: girlTiaraColor }));
      tiaraMesh.position.set(0, 0.26, 0.06);
      headGroup.add(tiaraMesh);

      const veilGeo = new THREE.PlaneGeometry(0.44, 0.72, 4, 4);
      const veilMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide
      });
      const veilMesh = new THREE.Mesh(veilGeo, veilMat);
      veilMesh.position.set(0, -0.05, -0.32);
      veilMesh.rotation.x = -0.2;
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
