// =========================================================================
// INTERACTION.JS - SISTEM INTERAKSI OBJEK LOKASI, PROXIMITY, & MODAL POPUP
// Mendeteksi jarak ke titik acara, menampilkan badge interaksi, & memicu modal
// =========================================================================

import { WEDDING_CONFIG } from './config.js';

export class InteractionSystem {
  constructor(uiSystem, audioSystem) {
    this.ui = uiSystem;
    this.audio = audioSystem;
    this.locations = WEDDING_CONFIG.locations;
    this.activeLocation = null;
    this.visitedLocations = new Set();

    this.interactBadgeEl = document.getElementById('interact-badge');
    this.mobileInteractBtn = document.getElementById('btn-mobile-interact');
  }

  update(playerPosition) {
    if (!playerPosition) return;

    let closestLoc = null;
    let closestDist = Infinity;

    for (let i = 0; i < this.locations.length; i++) {
      const loc = this.locations[i];
      const dist = Math.hypot(
        playerPosition.x - loc.position.x,
        playerPosition.z - loc.position.z
      );

      if (dist <= loc.radius && dist < closestDist) {
        closestDist = dist;
        closestLoc = loc;
      }
    }

    if (closestLoc !== this.activeLocation) {
      this.activeLocation = closestLoc;
      this.updateUIBadge();
      this.ui.updateSpeechBubble(this.activeLocation);
    }
  }

  updateUIBadge() {
    if (this.activeLocation) {
      if (this.interactBadgeEl) {
        this.interactBadgeEl.innerHTML = `
          <div class="badge-icon">${this.activeLocation.icon}</div>
          <div class="badge-content">
            <span class="badge-key">[E] / Ketuk</span>
            <span class="badge-title">${this.activeLocation.title}</span>
          </div>
        `;
        this.interactBadgeEl.classList.add('visible');
      }

      if (this.mobileInteractBtn) {
        this.mobileInteractBtn.classList.add('active');
        this.mobileInteractBtn.setAttribute('title', `Buka ${this.activeLocation.title}`);
      }
    } else {
      if (this.interactBadgeEl) {
        this.interactBadgeEl.classList.remove('visible');
      }
      if (this.mobileInteractBtn) {
        this.mobileInteractBtn.classList.remove('active');
      }
    }
  }

  triggerInteraction() {
    // Jika ada lokasi aktif di dekatnya, buka lokasi tersebut
    // Jika tidak ada lokasi aktif tapi pemain menekan 'E' atau SAPA TAMU, buka pesan selamat datang
    const targetLoc = this.activeLocation || this.locations.find(l => l.id === 'gate');

    if (this.audio) {
      this.audio.playChime();
    }

    if (this.activeLocation) {
      this.visitedLocations.add(this.activeLocation.id);
      this.ui.updateQuestProgress(this.visitedLocations.size, this.locations.length);
    }

    this.ui.openModal(targetLoc);
    return true;
  }
}
