// =========================================================================
// MAIN.JS - INISIALISASI UTAMA GAME UNDANGAN PERNIKAHAN 3D RPG
// Mengintegrasikan modul scene, karakter, pergerakan, peta, interaksi, & UI
// =========================================================================

import * as THREE from 'three';
import { GameAudio } from './audio.js';
import { Character3D } from './character.js';
import { CollisionSystem } from './collision.js';
import { WEDDING_CONFIG } from './config.js';
import { GameControls } from './controls.js';
import { InteractionSystem } from './interaction.js';
import { WeddingMap } from './map.js';
import { MovementSystem } from './movement.js';
import { GameScene } from './scene.js';
import { UISystem } from './ui.js';

class WeddingRPGGame {
  constructor() {
    this.canvasContainer = document.getElementById('game-container');
    this.clock = new THREE.Clock();
    this.gameStarted = false;

    window.gameInstance = this;
    this.init();
  }

  init() {
    // 1. Audio System
    this.audio = new GameAudio();

    // 2. Scene, Kamera Top-Down Angled & Renderer
    this.gameScene = new GameScene(this.canvasContainer);

    // 3. Sistem Batas Jalan (Collision & Walkable Area)
    this.collision = new CollisionSystem();

    // 4. Peta Taman Pernikahan 3D
    this.map = new WeddingMap(this.gameScene.scene, this.collision);

    // 5. Kontrol Keyboard & Mobile Joystick
    this.controls = new GameControls();

    // 6. UI System
    this.ui = new UISystem(this.audio);
    window.gameUI = this.ui;

    // 7. Interaction System
    this.interaction = new InteractionSystem(this.ui, this.audio);

    // Hubungkan tombol Escape untuk menutup modal
    this.controls.onEscape = () => this.ui.closeModal();

    // Hubungkan tombol 'H' untuk toggle Debug Mode batas jalan
    this.controls.onDebugToggle = () => {
      const isDebugOn = this.collision.toggleDebug(this.gameScene.scene);
      console.log(`[Debug Mode] Walkable Area: ${isDebugOn ? 'ON' : 'OFF'}`);
    };

    // Hubungkan tombol aksi [A] vintage pada layar
    const btnMobileInteract = document.getElementById('btn-mobile-interact');
    if (btnMobileInteract) {
      btnMobileInteract.addEventListener('click', () => {
        this.interaction.triggerInteraction();
      });
    }

    // 8. Penanganan Pemilihan Karakter
    this.ui.onStartGameCallback = (gender) => {
      this.spawnPlayer(gender);
      this.gameStarted = true;
    };

    // Jalankan render loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  spawnPlayer(gender) {
    if (this.playerCharacter) {
      this.gameScene.scene.remove(this.playerCharacter.group);
    }

    // Buat model karakter 3D
    this.playerCharacter = new Character3D(gender);
    this.gameScene.scene.add(this.playerCharacter.group);

    // Hubungkan ke Movement System
    if (!this.movement) {
      this.movement = new MovementSystem(
        this.playerCharacter,
        this.collision,
        this.controls
      );
    } else {
      this.movement.setCharacter(this.playerCharacter);
    }

    // Langsung arahkan kamera ke karakter
    this.gameScene.updateCamera(this.movement.getPosition(), 1.0);
  }

  animate() {
    requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.1);

    // Update animasi kelopak bunga & papan nama di peta
    if (this.map) {
      this.map.update(delta);
    }

    if (this.gameStarted && this.movement) {
      // 1. Update Pergerakan & Animasi Langkah Kaki Karakter 3D
      this.movement.update(delta);

      const playerPos = this.movement.getPosition();

      // 2. Update Proximity Interaksi Lokasi
      this.interaction.update(playerPos);

      // Cek tombol [E] / Space ditekan
      if (this.controls.consumeInteract()) {
        this.interaction.triggerInteraction();
      }

      // 3. Update Kamera Mengikuti Karakter
      this.gameScene.updateCamera(playerPos, delta);

      // 4. Update Minimap
      this.ui.updateMinimap(playerPos, WEDDING_CONFIG.locations, this.collision);
    } else {
      // Render scene idle sebelum permainan dimulai
      this.gameScene.updateCamera({ x: 0, y: 0, z: 9 }, delta);
    }

    // Render Scene 3D
    this.gameScene.render();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new WeddingRPGGame();
});
