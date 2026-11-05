// ==========================================
// CONFIG.JS - DATA UNDANGAN PERNIKAHAN
// Silakan edit data di bawah ini sesuai kebutuhan
// ==========================================

export const WEDDING_CONFIG = {
  // Informasi Pasangan
  couple: {
    groom: {
      name: "Arya Wicaksono",
      fullName: "Arya Wicaksono, S.T.",
      nickname: "Arya",
      role: "Mempelai Pria",
      father: "Bpk. Bambang Wicaksono",
      mother: "Ibu Sri Rahayu",
      avatar: "boy",
      instagram: "@arya.wicaksono",
      bio: "Putra pertama yang berdedikasi, pecinta teknologi, dan penjelajah petualangan hidup bersama Nadia."
    },
    bride: {
      name: "Nadia Larasati",
      fullName: "Nadia Larasati, S.Ds.",
      nickname: "Nadia",
      role: "Mempelai Wanita",
      father: "Bpk. Hendra Gunawan",
      mother: "Ibu Dewi Lestari",
      avatar: "girl",
      instagram: "@nadia.larasati",
      bio: "Putri bungsu yang ceria, desainer penuh warna, dan partner petualangan terbaik bagi Arya."
    },
    hashtag: "#AryaNadiaMenikah",
    quote: "\"Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.\" (QS. Ar-Rum: 21)"
  },

  // Tanggal & Waktu Acara
  event: {
    weddingDate: "2026-10-24T08:00:00",
    displayDate: "Sabtu, 24 Oktober 2026",
    
    akad: {
      title: "Akad Nikah",
      time: "08:00 - 10:00 WIB",
      location: "Paviliun Kaca Taman Firdaus",
      dresscode: "Putih / Pastel Tradisional",
      description: "Momen sakral pengucapan janji suci pernikahan di hadapan penghulu, keluarga, dan para saksi tercinta."
    },

    resepsi: {
      title: "Resepsi Pernikahan",
      time: "11:00 - 14:00 WIB",
      location: "Grand Ballroom & Royal Garden Taman Firdaus",
      dresscode: "Formal Elegance / Batik Modern",
      description: "Perayaan penuh kebahagiaan, jamuan hidangan istimewa, musik akustik, serta ramah tamah bersama sanak saudara dan sahabat."
    },

    venue: {
      name: "Taman Firdaus Heritage & Garden",
      address: "Jl. Lembah Pinus No. 88, Cilandak Barat, Jakarta Selatan",
      googleMapsUrl: "https://maps.google.com/?q=Jakarta+Selatan",
      embedMapQuery: "Jakarta Selatan",
      note: "Tersedia area parkir luas & layanan valet untuk kenyamanan para tamu undangan."
    }
  },

  // Love Story Timeline
  loveStory: [
    {
      year: "2020",
      title: "Pertemuan Pertama",
      description: "Berawal dari pertemuan tak sengaja di sebuah proyek kreatif kampus. Obrolan ringan tentang kopi dan seni menjadi awal dari segalanya."
    },
    {
      year: "2022",
      title: "Menjalin Komitmen",
      description: "Setelah melewati banyak cerita suka dan duka bersama, kami memutuskan untuk saling melangkah beriringan dengan tujuan yang sama."
    },
    {
      year: "2025",
      title: "Momen Lamaran (The Proposal)",
      description: "Di bawah langit senja pantai yang tenang, Arya meminta restu Nadia untuk menjadi teman hidup selamanya. She said YES!"
    },
    {
      year: "2026",
      title: "Hari Bahagia (The Wedding)",
      description: "Kini kami siap memulai babak baru petualangan cinta kami sebagai suami dan istri. Kehadiran Anda adalah berkah bagi kami."
    }
  ],

  // Galeri Foto Photobooth
  gallery: [
    {
      url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
      caption: "Our Prewedding Moments - In The Bloom"
    },
    {
      url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80",
      caption: "A Warm Afternoon - Sharing Smiles"
    },
    {
      url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80",
      caption: "Hand in Hand, Walking Together"
    },
    {
      url: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80",
      caption: "Promises Under The Sunset"
    },
    {
      url: "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=800&q=80",
      caption: "Elegance & Heritage"
    },
    {
      url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80",
      caption: "Forever and Always"
    }
  ],

  // Rekening Hadiah / Digital Gift
  gifts: [
    {
      bank: "Bank BCA",
      accountNumber: "8735-0192-34",
      accountName: "Arya Wicaksono",
      qrCodeText: "BCA-ARYA-8735019234"
    },
    {
      bank: "Bank Mandiri",
      accountNumber: "137-00-198421-9",
      accountName: "Nadia Larasati",
      qrCodeText: "MANDIRI-NADIA-137001984219"
    }
  ],

  // Titik Interaksi Map (Diselaraskan dengan Referensi Visual Peta)
  locations: [
    {
      id: "gate",
      name: "Gerbang Selamat Datang",
      type: "welcome",
      icon: "🚪",
      label: "+ GERBANG",
      position: { x: 0, z: 18 },
      radius: 2.8,
      title: "Selamat Datang di Taman Pernikahan",
      subtitle: "Gerbang Masuk & Sambutan Mempelai"
    },
    {
      id: "resepsi",
      name: "Tenda Akad & Resepsi",
      type: "resepsi",
      icon: "🥂",
      label: "+ ACARA",
      position: { x: -9, z: 7 },
      radius: 3.2,
      title: "Akad & Resepsi Pernikahan",
      subtitle: "Jadwal Acara, Waktu & Lokasi Resepsi"
    },
    {
      id: "photobooth",
      name: "Bilik Foto Photobooth",
      type: "photobooth",
      icon: "📸",
      label: "+ PHOTOBOOTH",
      position: { x: 8, z: 7 },
      radius: 2.8,
      title: "Bilik Foto & Photobooth",
      subtitle: "Spot Foto Seru & Souvenir Tamu"
    },
    {
      id: "rsvp",
      name: "Altar Buku Tamu & RSVP",
      type: "rsvp",
      icon: "💌",
      label: "+ UCAPAN & RSVP",
      position: { x: 0, z: -2 },
      radius: 2.8,
      title: "Buku Tamu & Konfirmasi Kehadiran",
      subtitle: "Kirim Doa Restu & Konfirmasi RSVP"
    },
    {
      id: "couple",
      name: "Taman Bunga Pasangan",
      type: "couple",
      icon: "💍",
      label: "+ PASANGAN",
      position: { x: -8, z: -10 },
      radius: 3.2,
      title: "Profil Kedua Mempelai",
      subtitle: "Kisah Arya Wicaksono & Nadia Larasati"
    },
    {
      id: "gallery",
      name: "Panggung Galeri Foto",
      type: "gallery",
      icon: "🖼️",
      label: "+ GALERI",
      position: { x: 8, z: -5 },
      radius: 2.8,
      title: "Galeri Foto Prewedding",
      subtitle: "Koleksi Momen Bahagia Arya & Nadia"
    },
    {
      id: "bridge",
      name: "Jembatan Kolam Teratai",
      type: "lovestory",
      icon: "🌉",
      label: "+ KISAH CINTA",
      position: { x: 4, z: -13 },
      radius: 2.8,
      title: "Jembatan Kisah Cinta",
      subtitle: "Perjalanan Kasih 2020 - 2026"
    },
    {
      id: "venue",
      name: "Peta & Lokasi Acara",
      type: "venue",
      icon: "📍",
      label: "+ PANDUAN PETA",
      position: { x: 0, z: 6 },
      radius: 2.6,
      title: "Peta & Panduan Lokasi",
      subtitle: "Navigasi Google Maps & Alamat Acara"
    }
  ]
};
