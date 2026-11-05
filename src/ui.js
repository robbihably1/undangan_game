// =========================================================================
// UI.JS - TAMPILAN INTERFACE RPG, SELEKSI KARAKTER, TOOLBAR, & MODAL
// Mengelola Character Selection 3D, Bottom Toolbar, Speech Bubble, & Dialog
// =========================================================================

import confetti from 'canvas-confetti';
import * as THREE from 'three';
import { Character3D } from './character.js';
import { WEDDING_CONFIG } from './config.js';

export class UISystem {
  constructor(audioSystem) {
    this.audio = audioSystem;
    this.selectedGender = 'boy';
    this.hasSelectedCharacter = false;
    this.onStartGameCallback = null;
    this.onChangeCharacterCallback = null;

    // Cache elemen UI
    this.charSelectOverlay = document.getElementById('char-select-screen');
    this.modalOverlay = document.getElementById('modal-overlay');
    this.modalContent = document.getElementById('modal-card-content');
    this.questProgressEl = document.getElementById('quest-progress-text');
    this.questProgressBar = document.getElementById('quest-progress-fill');
    this.minimapCanvas = document.getElementById('minimap-canvas');
    this.bubbleText = document.getElementById('bubble-text');
    this.speechBubbleBtn = document.getElementById('btn-speech-bubble');

    this.initCharacterSelectScene();
    this.initEventListeners();
    this.initBottomToolbar();
    this.initMinimap();
    this.loadGuestWishes();
  }

  // 1. Preview 3D Karakter di Halaman Pemilihan
  initCharacterSelectScene() {
    const canvasBoy = document.getElementById('preview-boy-canvas');
    const canvasGirl = document.getElementById('preview-girl-canvas');

    if (!canvasBoy || !canvasGirl) return;

    this.boyPreview = this.createPreviewInstance(canvasBoy, 'boy');
    this.girlPreview = this.createPreviewInstance(canvasGirl, 'girl');

    const animatePreviews = () => {
      requestAnimationFrame(animatePreviews);
      const delta = 0.016;

      if (this.boyPreview) {
        this.boyPreview.character.updateAnimation(delta, { x: 0, z: 0 }, false);
        this.boyPreview.renderer.render(this.boyPreview.scene, this.boyPreview.camera);
      }
      if (this.girlPreview) {
        this.girlPreview.character.updateAnimation(delta, { x: 0, z: 0 }, false);
        this.girlPreview.renderer.render(this.girlPreview.scene, this.girlPreview.camera);
      }
    };
    animatePreviews();
  }

  createPreviewInstance(canvas, gender) {
    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 20);
    camera.position.set(0, 1.0, 3.2);
    camera.lookAt(0, 0.75, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true
    });
    renderer.setSize(canvas.clientWidth || 200, canvas.clientHeight || 240);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const amb = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(amb);
    const dir = new THREE.DirectionalLight(0xfffaed, 0.9);
    dir.position.set(3, 5, 4);
    scene.add(dir);

    const character = new Character3D(gender);
    scene.add(character.group);

    return { scene, camera, renderer, character };
  }

  // 2. Event Listener Pilihan Karakter & Tombol Game
  initEventListeners() {
    const cardBoy = document.getElementById('card-boy');
    const cardGirl = document.getElementById('card-girl');
    const btnSelect = document.getElementById('btn-select-character');
    const btnStart = document.getElementById('btn-start-game');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const btnSound = document.getElementById('btn-toggle-sound');
    const btnMenu = document.getElementById('btn-open-menu');

    if (cardBoy) {
      cardBoy.addEventListener('click', () => {
        this.selectedGender = 'boy';
        cardBoy.classList.add('selected');
        cardGirl.classList.remove('selected');
        this.audio.playClick();
      });
    }

    if (cardGirl) {
      cardGirl.addEventListener('click', () => {
        this.selectedGender = 'girl';
        cardGirl.classList.add('selected');
        cardBoy.classList.remove('selected');
        this.audio.playClick();
      });
    }

    if (btnSelect) {
      btnSelect.addEventListener('click', () => {
        this.hasSelectedCharacter = true;
        this.audio.playClick();
        btnSelect.style.display = 'none';
        btnStart.style.display = 'inline-flex';
      });
    }

    if (btnStart) {
      btnStart.addEventListener('click', () => {
        this.audio.playClick();
        this.audio.startBGM();

        this.charSelectOverlay.classList.add('fade-out');
        setTimeout(() => {
          this.charSelectOverlay.style.display = 'none';
        }, 500);

        if (this.onStartGameCallback) {
          this.onStartGameCallback(this.selectedGender);
        }
      });
    }

    if (btnCloseModal) {
      btnCloseModal.addEventListener('click', () => this.closeModal());
    }
    if (this.modalOverlay) {
      this.modalOverlay.addEventListener('click', (e) => {
        if (e.target === this.modalOverlay) this.closeModal();
      });
    }

    // Toggle Sound BGM
    if (btnSound) {
      btnSound.addEventListener('click', () => {
        const isMuted = this.audio.toggleMute();
        btnSound.innerHTML = `
          <span class="music-icon">${isMuted ? '🔇' : '🎵'}</span>
          <span class="music-label">${isMuted ? 'MUSIK OFF' : 'MUSIK ON'}</span>
        `;
      });
    }

    if (btnMenu) {
      btnMenu.addEventListener('click', () => {
        this.audio.playClick();
        this.charSelectOverlay.style.display = 'flex';
        this.charSelectOverlay.classList.remove('fade-out');
        btnSelect.style.display = 'inline-flex';
        btnStart.style.display = 'none';
      });
    }

    // Speech bubble click
    if (this.speechBubbleBtn) {
      this.speechBubbleBtn.addEventListener('click', () => {
        if (window.gameInstance && window.gameInstance.interaction) {
          window.gameInstance.interaction.triggerInteraction();
        }
      });
    }
  }

  // 3. Inisialisasi Bottom RPG Navigation Toolbar (Seperti di Referensi Gambar)
  initBottomToolbar() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const action = item.getAttribute('data-action');
        this.audio.playClick();

        navItems.forEach(n => n.classList.remove('active'));
        item.classList.add('active');

        // Buka modal sesuai tombol toolbar yang diklik
        const loc = WEDDING_CONFIG.locations.find(l => l.id === action) || {
          type: action === 'gift' ? 'rsvp' : action,
          title: item.querySelector('.nav-label').textContent
        };

        this.openModal(loc);
      });
    });
  }

  // Update speech bubble text saat dekat objek
  updateSpeechBubble(activeLocation) {
    if (!this.bubbleText || !this.speechBubbleBtn) return;

    if (activeLocation) {
      this.bubbleText.textContent = `BUKA: ${activeLocation.label || activeLocation.title}`;
      this.speechBubbleBtn.classList.add('active');
    } else {
      this.bubbleText.textContent = 'SAPA TAMU';
      this.speechBubbleBtn.classList.remove('active');
    }
  }

  updateQuestProgress(visitedCount, totalCount) {
    if (this.questProgressEl) {
      this.questProgressEl.textContent = `${visitedCount}/${totalCount} Lokasi`;
    }
    if (this.questProgressBar) {
      const pct = (visitedCount / totalCount) * 100;
      this.questProgressBar.style.width = `${pct}%`;
    }

    if (visitedCount === totalCount && !this.allExplored) {
      this.allExplored = true;
      this.fireConfetti();
      this.audio.playCelebration();
    }
  }

  fireConfetti() {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  }

  // Minimap Render
  initMinimap() {
    if (!this.minimapCanvas) return;
    this.mmCtx = this.minimapCanvas.getContext('2d');
  }

  updateMinimap(playerPosition, locations, collisionSystem) {
    if (!this.mmCtx || !playerPosition) return;
    const ctx = this.mmCtx;
    const w = this.minimapCanvas.width;
    const h = this.minimapCanvas.height;

    ctx.clearRect(0, 0, w, h);

    const scale = w / 44;
    const toScreenX = (x) => (x + 22) * scale;
    const toScreenY = (z) => (z + 20) * scale;

    // Gambar Jalan Setapak
    ctx.strokeStyle = '#deb887';
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';

    collisionSystem.pathElements.forEach(elem => {
      if (elem.type === 'segment') {
        ctx.beginPath();
        ctx.moveTo(toScreenX(elem.x1), toScreenY(elem.z1));
        ctx.lineTo(toScreenX(elem.x2), toScreenY(elem.z2));
        ctx.stroke();
      } else if (elem.type === 'circle') {
        ctx.fillStyle = '#deb887';
        ctx.beginPath();
        ctx.arc(toScreenX(elem.x), toScreenY(elem.z), elem.radius * scale * 0.9, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Gambar Titik Lokasi Acara
    locations.forEach(loc => {
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.arc(toScreenX(loc.position.x), toScreenY(loc.position.z), 3.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Gambar Titik Pemain
    ctx.fillStyle = '#be123c';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(toScreenX(playerPosition.x), toScreenY(playerPosition.z), 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // 4. Modal Dialog Informasi Undangan
  openModal(location) {
    if (!this.modalOverlay || !this.modalContent) return;

    let html = '';
    const { couple, event, loveStory, gallery, gifts } = WEDDING_CONFIG;

    switch (location.type) {
      case 'welcome':
      case 'gate':
        html = `
          <div class="modal-header">
            <span class="modal-badge">SAMBUTAN HANGAT</span>
            <h2>${couple.groom.nickname} & ${couple.bride.nickname}</h2>
            <p class="modal-subtitle">${event.displayDate}</p>
          </div>
          <div class="modal-body text-center">
            <p class="quote-text">${couple.quote}</p>
            <div class="welcome-box">
              <p>Selamat datang di taman pernikahan petualangan kami! Jelajahi setiap sudut jalan setapak untuk melihat informasi akad nikah, resepsi, potret bahagia, kisah cinta, hingga menitipkan doa restu di altar buku tamu.</p>
            </div>
            <button class="btn-primary" onclick="window.gameUI.closeModal()">Mulai Menjelajah Taman 🌿</button>
          </div>
        `;
        break;

      case 'couple':
        html = `
          <div class="modal-header">
            <span class="modal-badge">KEDUA MEMPELAI</span>
            <h2>Profil Mempelai</h2>
          </div>
          <div class="modal-body">
            <div class="couple-cards">
              <div class="profile-card">
                <div class="avatar-circle groom-circle">🤵</div>
                <h3>${couple.groom.fullName}</h3>
                <p class="profile-parents">${couple.groom.role}<br>Putra dari ${couple.groom.father} & ${couple.groom.mother}</p>
                <p class="profile-bio">${couple.groom.bio}</p>
                <a href="https://instagram.com" target="_blank" class="social-link">📸 ${couple.groom.instagram}</a>
              </div>
              <div class="profile-card">
                <div class="avatar-circle bride-circle">👰</div>
                <h3>${couple.bride.fullName}</h3>
                <p class="profile-parents">${couple.bride.role}<br>Putri dari ${couple.bride.father} & ${couple.bride.mother}</p>
                <p class="profile-bio">${couple.bride.bio}</p>
                <a href="https://instagram.com" target="_blank" class="social-link">📸 ${couple.bride.instagram}</a>
              </div>
            </div>
          </div>
        `;
        break;

      case 'resepsi':
      case 'akad':
        this.fireConfetti();
        html = `
          <div class="modal-header">
            <span class="modal-badge">JADWAL PERAYAAN</span>
            <h2>Rangkaian Acara Pernikahan</h2>
          </div>
          <div class="modal-body">
            <div class="event-detail-card">
              <div class="event-icon">💍</div>
              <div class="event-info">
                <h4>${event.akad.title}</h4>
                <p><strong>${event.displayDate}</strong></p>
                <p>Pukul ${event.akad.time}</p>
                <p style="font-size:0.8rem; color:#78583c;">${event.akad.location} • Dresscode: ${event.akad.dresscode}</p>
              </div>
            </div>
            <div class="event-detail-card">
              <div class="event-icon">🥂</div>
              <div class="event-info">
                <h4>${event.resepsi.title}</h4>
                <p><strong>${event.displayDate}</strong></p>
                <p>Pukul ${event.resepsi.time}</p>
                <p style="font-size:0.8rem; color:#78583c;">${event.resepsi.location}</p>
              </div>
            </div>
            <div class="rundown-box">
              <h4>Rundown Resepsi:</h4>
              <ul>
                <li><strong>11:00</strong> - Penyambutan Tamu & Jamuan Musik</li>
                <li><strong>11:30</strong> - Kirab Pengantin & Pemotongan Kue</li>
                <li><strong>12:15</strong> - Ramah Tamah, Doa, & Foto Bersama</li>
                <li><strong>14:00</strong> - Penutupan Pesta</li>
              </ul>
            </div>
            <div style="margin-top:14px;">
              <a href="https://calendar.google.com" target="_blank" class="btn-primary full-width">📅 Simpan ke Google Calendar</a>
            </div>
          </div>
        `;
        break;

      case 'photobooth':
      case 'gallery':
        html = `
          <div class="modal-header">
            <span class="modal-badge">GALERI FOTO PREWEDDING</span>
            <h2>Momen Bahagia Arya & Nadia</h2>
          </div>
          <div class="modal-body">
            <div class="gallery-grid">
              ${gallery.map(img => `
                <div class="gallery-item">
                  <img src="${img.url}" alt="${img.caption}" loading="lazy" />
                  <span class="gallery-caption">${img.caption}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `;
        break;

      case 'venue':
        html = `
          <div class="modal-header">
            <span class="modal-badge">PANDUAN LOKASI</span>
            <h2>${event.venue.name}</h2>
          </div>
          <div class="modal-body">
            <p><strong>Alamat:</strong> ${event.venue.address}</p>
            <p class="venue-note" style="margin: 10px 0;">💡 ${event.venue.note}</p>
            <div class="map-actions">
              <a href="${event.venue.googleMapsUrl}" target="_blank" class="btn-primary full-width">🗺️ Buka di Google Maps</a>
            </div>
          </div>
        `;
        break;

      case 'lovestory':
      case 'bridge':
        html = `
          <div class="modal-header">
            <span class="modal-badge">KISAH CINTA KAMI</span>
            <h2>Perjalanan Cinta</h2>
          </div>
          <div class="modal-body">
            <div class="timeline">
              ${loveStory.map(item => `
                <div class="timeline-item">
                  <div class="timeline-year">${item.year}</div>
                  <div class="timeline-content">
                    <h4>${item.title}</h4>
                    <p>${item.description}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
        break;

      case 'rsvp':
        html = `
          <div class="modal-header">
            <span class="modal-badge">BUKU TAMU & DOA RESTU</span>
            <h2>Konfirmasi Kehadiran & Doa</h2>
          </div>
          <div class="modal-body">
            <form id="rsvp-form" class="rsvp-form" onsubmit="window.gameUI.handleRSVPSubmit(event)">
              <div class="form-group">
                <label>Nama Lengkap</label>
                <input type="text" id="rsvp-name" placeholder="Masukkan nama Anda..." required />
              </div>
              <div class="form-group">
                <label>Konfirmasi Kehadiran</label>
                <select id="rsvp-status" required>
                  <option value="Hadir">🎉 Ya, Saya akan Hadir</option>
                  <option value="Tidak Hadir">🙏 Maaf, Belum Dapat Hadir</option>
                  <option value="Ragu-ragu">✨ Masih Ragu-ragu</option>
                </select>
              </div>
              <div class="form-group">
                <label>Jumlah Tamu</label>
                <select id="rsvp-count">
                  <option value="1">1 Orang</option>
                  <option value="2">2 Orang</option>
                  <option value="3">3 Orang atau Lebih</option>
                </select>
              </div>
              <div class="form-group">
                <label>Ucapan & Doa Restu</label>
                <textarea id="rsvp-message" rows="3" placeholder="Tuliskan ucapan dan doa terbaik untuk kedua mempelai..." required></textarea>
              </div>
              <button type="submit" class="btn-primary full-width">Kirim Ucapan & Konfirmasi 💌</button>
            </form>

            <div class="digital-gift-section">
              <h4>Kado Pernikahan Digital</h4>
              <p>Doa restu Anda adalah karunia terindah bagi kami. Namun jika berkenan memberi tanda kasih, dapat disalurkan melalui:</p>
              ${gifts.map(g => `
                <div class="gift-card">
                  <div>
                    <div class="gift-bank">${g.bank}</div>
                    <div class="gift-number">${g.accountNumber}</div>
                    <div class="gift-name">a.n ${g.accountName}</div>
                  </div>
                  <button class="btn-copy" onclick="navigator.clipboard.writeText('${g.accountNumber}'); alert('Nomor rekening berhasil disalin!');">Salin No. Rekening</button>
                </div>
              `).join('')}
            </div>

            <div class="wishes-list-container">
              <h4>Doa & Ucapan Tamu Undangan</h4>
              <div id="wishes-list" class="wishes-list"></div>
            </div>
          </div>
        `;
        break;
    }

    this.modalContent.innerHTML = html;
    this.modalOverlay.style.display = 'flex';
    this.modalOverlay.classList.remove('fade-out');

    if (location.type === 'rsvp') {
      this.renderGuestWishes();
    }
  }

  closeModal() {
    if (this.modalOverlay) {
      this.modalOverlay.classList.add('fade-out');
      setTimeout(() => {
        this.modalOverlay.style.display = 'none';
      }, 200);
    }
  }

  loadGuestWishes() {
    const saved = localStorage.getItem('wedding_rpg_wishes');
    if (saved) {
      try {
        this.wishes = JSON.parse(saved);
      } catch (e) {
        this.wishes = [];
      }
    } else {
      this.wishes = [
        {
          name: "Dimas & Sarah",
          status: "Hadir",
          message: "Selamat untuk Arya dan Nadia! Semoga sakinah, mawaddah, warahmah selamanya. Aamiin!",
          time: "Baru saja"
        },
        {
          name: "Rizky Pratama",
          status: "Hadir",
          message: "Keren banget konsep gamenya! Selamat menempuh hidup baru sahabatku!",
          time: "1 jam lalu"
        }
      ];
    }
  }

  handleRSVPSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('rsvp-name').value.trim();
    const status = document.getElementById('rsvp-status').value;
    const message = document.getElementById('rsvp-message').value.trim();

    if (!name || !message) return;

    this.wishes.unshift({
      name,
      status,
      message,
      time: "Baru saja"
    });

    localStorage.setItem('wedding_rpg_wishes', JSON.stringify(this.wishes));
    this.renderGuestWishes();
    this.fireConfetti();
    this.audio.playCelebration();

    alert(`Terima kasih atas ucapan dan doa restunya, ${name}!`);
    document.getElementById('rsvp-form').reset();
  }

  renderGuestWishes() {
    const container = document.getElementById('wishes-list');
    if (!container) return;

    container.innerHTML = this.wishes.map(w => `
      <div class="wish-item">
        <div class="wish-header">
          <strong>${w.name}</strong>
          <span class="wish-status ${w.status === 'Hadir' ? 'attend' : 'absent'}">${w.status}</span>
        </div>
        <p class="wish-text">"${w.message}"</p>
        <span class="wish-time">${w.time}</span>
      </div>
    `).join('');
  }
}
