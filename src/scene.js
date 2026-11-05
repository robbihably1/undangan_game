// =========================================================================
// SCENE.JS - PENGATURAN THREE.JS SCENE, KAMERA TOP-DOWN ANGLED & RENDERER
// Sudut pandang kamera jernih, cerah, tanpa fog berlebih
// =========================================================================

import * as THREE from 'three';

export class GameScene {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xdceee2); // Hijau alam pastel cerah

    // Gunakan Fog linier yang jauh agar seluruh elemen taman tampak tajam dan jernih
    this.scene.fog = new THREE.Fog(0xdceee2, 45, 110);

    this.initCamera();
    this.initRenderer();
    this.initResizeListener();
  }

  initCamera() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    const aspect = width / height;

    this.camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 150);

    // Offset kamera top-down angled (Karakter & seluruh taman tampak jelas)
    if (width < height) {
      // Tampilan portrait smartphone
      this.cameraOffset = new THREE.Vector3(0, 16.0, 11.5);
    } else {
      // Tampilan landscape desktop
      this.cameraOffset = new THREE.Vector3(0, 13.5, 10.0);
    }

    // Kamera mulai fokus di posisi awal karakter (x: 0, z: 9)
    this.cameraTarget = new THREE.Vector3(0, 0, 9);
    this.camera.position.copy(this.cameraTarget).add(this.cameraOffset);
    this.camera.lookAt(this.cameraTarget);
  }

  initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });

    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2.0);

    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = false;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    // Pastikan canvas berukuran penuh
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.display = 'block';

    this.container.appendChild(this.renderer.domElement);
  }

  initResizeListener() {
    const handleResize = () => {
      if (!this.container) return;
      const width = this.container.clientWidth || window.innerWidth;
      const height = this.container.clientHeight || window.innerHeight;

      this.camera.aspect = width / height;

      if (width < height) {
        this.cameraOffset.set(0, 16.0, 11.5);
      } else {
        this.cameraOffset.set(0, 13.5, 10.0);
      }

      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', () => {
      setTimeout(handleResize, 100);
    });
  }

  updateCamera(targetPosition, delta) {
    if (!targetPosition) return;

    const posY = (typeof targetPosition.y === 'number' && !isNaN(targetPosition.y)) ? targetPosition.y : 0;
    const posX = (typeof targetPosition.x === 'number' && !isNaN(targetPosition.x)) ? targetPosition.x : 0;
    const posZ = (typeof targetPosition.z === 'number' && !isNaN(targetPosition.z)) ? targetPosition.z : 0;

    // Batasi pergerakan kamera agar tetap di dalam dunia taman
    const clampedX = Math.max(-16, Math.min(16, posX));
    const clampedZ = Math.max(-16, Math.min(18, posZ));
    const targetLookAt = new THREE.Vector3(clampedX, posY + 0.6, clampedZ);

    const lerpFactor = Math.min(1.0, Math.max(0.01, 1.0 - Math.exp(-delta * 7.5)));
    this.cameraTarget.lerp(targetLookAt, lerpFactor);

    const desiredCameraPos = new THREE.Vector3().copy(this.cameraTarget).add(this.cameraOffset);
    this.camera.position.lerp(desiredCameraPos, lerpFactor);

    this.camera.lookAt(this.cameraTarget);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}
