# 🎨 DESIGN.md: Claymorphism Design System Specification
**Project:** Expense Tracker & Monthly Budget Management  
**Version:** 1.0 (Claymorphism Edition)  
**Author:** UI/UX Design & Frontend Architecture Team  
**Tech Stack Alignment:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide/Heroicons SVG  

---

## 1. 🌟 Design Vision & Philosophy

### Mengapa Claymorphism untuk Aplikasi Finansial?
Aplikasi pencatatan keuangan tradisional sering kali terasa kaku, dingin, dan menyerupai spreadsheet akuntansi yang membosankan. **Claymorphism** mengubah paradigma tersebut dengan menghadirkan antarmuka yang:
- **Friendly & Approachable (Ramah & Menyenangkan):** Mengurangi kecemasan (*financial anxiety*) saat mengelola uang dengan visual yang empuk, hangat, dan playful.
- **Tactile Affordance (Nyata & Menyenangkan untuk Disentuh):** Menggunakan ilusi 3D lembut menyerupai tanah liat (*matte clay / marshmallow*) yang memberikan umpan balik visual instan saat tombol ditekan (*press/depress*).
- **Modern & Premium:** Berbeda dengan Neumorphism klasik yang memiliki masalah kontras, Claymorphism memadukan warna latar pastel yang kontras dengan tipografi tajam, sehingga tetap **100% patuh aksesibilitas (WCAG 2.1 AA)**.

---

## 2. 📐 Anatomi Visual Claymorphism (The Clay Formula)

Karakteristik utama Claymorphism dibentuk oleh 4 lapisan visual yang saling melengkapi:

```
┌────────────────────────────────────────────────────────┐
│  (1) Outer Soft Shadow: Efek melayang di atas kanvas  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ (2) Top-Left Inset Highlight: Pantulan cahaya     │  │
│  │                                                  │  │
│  │                     KONTEN                       │  │
│  │                                                  │  │
│  │ (3) Bottom-Right Inset Depth: Bayangan lekukan   │  │
│  └──────────────────────────────────────────────────┘  │
│  (4) High Corner Radius: Sudut membulat empuk (16-28px)│
└────────────────────────────────────────────────────────┘
```

### Rumus CSS Multi-Layered Shadow
Untuk menciptakan efek tanah liat 3D yang nyata, digunakan kombinasi **1 Drop Shadow eksternal** + **2 Inset Shadow internal**:
```css
/* Card Standar (Floating Clay) */
box-shadow: 
  /* 1. Drop shadow eksternal (mengapung) */
  8px 12px 24px -4px rgba(100, 116, 139, 0.12),
  /* 2. Highlight cahaya sudut kiri atas */
  inset 3px 3px 6px rgba(255, 255, 255, 0.9),
  /* 3. Kedalaman sudut kanan bawah */
  inset -4px -4px 8px rgba(148, 163, 184, 0.25);
```

---

## 3. 🎨 Design Tokens

### A. Palet Warna (Color Palette)

#### 1. Background Kanvas
- **Light Canvas:** `#F7F4EA` (Warm Organic Cream / Alabaster Linen) — menghadirkan kesan hangat, bersahabat, dan menenangkan mata.
- **Dark Canvas:** `#0C1524` (Deep Midnight Oceanic Navy) — latar gelap bernuansa biru safir malam pekat (*non-monotonous*), elegan tanpa kesan monoton hitam-putih pekat.

#### 2. Permukaan Clay (Surfaces)
| Token | Light Mode (Warm Cream) | Dark Mode (Midnight Sapphire) | Fungsi |
|---|---|---|---|
| `clay-surface-card` | `#FFFFFF` | `#152238` | Kartu metrik, widget anggaran, tabel |
| `clay-surface-sunken` | `#F0ECE1` | `#0E1829` | Ruang input, background progress bar (cekung) |
| `clay-surface-raised` | `#FFFFFF` | `#1D2D47` | Floating modal, dropdown, tombol sekunder |

#### 3. Tipografi & Tingkat Kontras (WCAG 2.1 AA & AAA)
| Elemen Teks | Light Mode | Dark Mode | Rasio Kontras |
|---|---|---|---|
| **Primary Text (Heading/Value)** | `#1C1917` (Deep Warm Espresso) | `#EDF4FC` (Moonlit Ice-Silver) | $\ge 14:1$ (AAA Compliant) |
| **Secondary Text (Muted/Sub)** | `#57534E` (Warm Stone Muted) | `#91A5C2` (Soft Periwinkle Slate) | $\ge 5.8:1$ (AA Compliant) |

#### 4. Warna Aksen & Semantik Finansial
| Semantik | Hex Utama | Nilai Clay (Light) | Nilai Clay (Dark) | Penerapan |
|---|---|---|---|---|
| **Brand Primary** | `#4F46E5` | Indigo Cream `#EEF2FF` | Deep Sapphire `#1E293B` | Tombol utama, tab aktif, navigasi |
| **Success / Safe** | `#10B981` | Mint Puff `#ECFDF5` | Deep Forest `#064E3B` | Pemasukan, status anggaran `<80%` |
| **Warning** | `#F59E0B` | Honey Pastel `#FFFBEB` | Deep Amber `#78350F` | Status anggaran `80%-100%` |
| **Danger / Over** | `#F43F5E` | Rose Berry `#FFF1F2` | Deep Rose `#881337` | Pengeluaran, status anggaran `>100%` |

---

### B. Sudut Lengkung (Border Radii)
Claymorphism mengandalkan sudut membulat dramatis (*super-elliptical squircle*):
- **Kartu Besar / Container (`rounded-3xl`):** `24px` – `28px`
- **Widget / Card Metrik (`rounded-2xl`):** `16px` – `20px`
- **Tombol & Input Field (`rounded-xl`):** `12px` – `14px`
- **Badge, Tag, & Avatar (`rounded-full`):** `9999px`

---

### C. Tipografi
- **Headings:** Font tebal (*Font Weight 700 / 800*) memberikan kontras kokoh terhadap kelembutan elemen 3D tanah liat di sekitarnya.
- **Angka Finansial (Monospace / Tabular):** Menggunakan `tabular-nums tracking-tight font-extrabold` agar angka mata uang mudah dibaca saat berbaris vertikal.
- **Body Text:** Font netral sans-serif (Geist / Inter) dengan tingkat keterbacaan tinggi.

---

## 4. 🧩 Blueprint Komponen Sistem

### 1. Kartu Metrik Keuangan (Saldo, Pemasukan, Pengeluaran)
- **Bentuk:** Kartu clay tebal dengan sudut `rounded-2xl`.
- **Ikon & Komponen Wadah (Clay Water Pod - Air Jernih Alami):** Berbentuk reservoir berair jernih (*translucent liquid pod*) dengan warna biru akuatik cerah yang lembut (*soft luminous sky-cyan*), menyatu secara gradual ke arah warna dasar tanah liat krem (`#f0ece1`), sehingga tidak berkesan "berlubang/cekung kosong", melainkan tampak terisi air tenang sebening kristal secara alami. Dilengkapi pantulan meniskus kaca halus (`::before`) dan refraksi 3D.
- **Efek Interaktif:** Saat hover, kartu naik sedikit (`-translate-y-1`) dengan bayangan yang sedikit melebar (*lifted clay effect*), dan water pod mengapung lembut (`translate-y-[-2px]`).

#### Spesifikasi Visual Clay Water Pod (Air Jernih Alami):
```
┌────────────────────────────────────────────────────────┐
│  Seamless Borderless: border none                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Meniskus Kaca Halus (::before): Highlight lengkung│  │
│  │                                                  │  │
│  │              [  IKON / KONTEN METRIK ]           │  │
│  │    Air Jernih Murni (Soft Aqua -> Warm Cream)    │  │
│  │                                                  │  │
│  │ Gradien Air: radial-gradient(rgba(200,238,255)...│  │
│  └──────────────────────────────────────────────────┘  │
│  Refraksi Lembut: inset 0 -2px 5px rgba(147,197,253)   │
└────────────────────────────────────────────────────────┘
```

```tsx
/* Contoh Struktur Tailwind Card */
<div className="rounded-2xl bg-white dark:bg-slate-900 p-6 
  shadow-[8px_12px_24px_-4px_rgba(100,116,139,0.12),inset_3px_3px_6px_rgba(255,255,255,0.9),inset_-4px_-4px_8px_rgba(148,163,184,0.2)]
  dark:shadow-[8px_12px_24px_-4px_rgba(0,0,0,0.5),inset_2px_2px_4px_rgba(255,255,255,0.1),inset_-4px_-4px_8px_rgba(0,0,0,0.6)]
  transition-all duration-200 hover:-translate-y-1">
  {/* Konten Saldo */}
</div>
```

---

### 2. Widget Monitoring Anggaran Bulanan (SRS-13 & SRS-14)
- **Container Utama:** Kartu clay dominan di Dashboard dengan border lembut tanpa garis tajam.
- **Modul Progres Pemakaian Anggaran (`clay-pod-white`):**
  - Mengusung kartu 3D putih alami (`clay-pod-white p-5 rounded-2xl`) yang serasi dengan 3 kartu metrik di bawahnya, lengkap dengan elevasi 3D dan hover lift.
- **Progress Bar Alur Cekung Putih (Sunken White 3D Clay Track):**
  - Track background menggunakan putih bersih `#ffffff` dengan border halus `rgba(225, 218, 204, 0.8)` dan bayangan cekung 3D (`inset 2px 2px 5px rgba(148, 134, 118, 0.22), inset -1px -1px 3px rgba(255, 255, 255, 1)`), memberikan kedalaman alur yang nyata di dalam kartu putih.
- **Progress Fill (Raised Clay Pill):**
  - Batang isi (*fill*) dibuat menggembung seperti pil timbul 3D dengan kilau specular highlight dan warna dinamis:
    - 🟢 **Aman (<80%):** Emerald Clay Pill
    - 🟡 **Waspada (80%-100%):** Honey Amber Clay Pill
    - 🔴 **Melebihi Anggaran (>100%):** Vivid Rose Clay Pill dengan denyut lembut (*soft pulse*)
- **Badge Status:** Berbentuk pil clay bulat (`rounded-full`) dengan efek mengembang empuk.
- **3 Kartu Metrik Anggaran (Batas Anggaran, Realisasi Pengeluaran, Sisa Anggaran - `clay-pod-white`):**
  - Mengusung permukaan putih 3D Claymorphism berlatar putih `#ffffff` dengan border halus `rgba(225, 218, 204, 0.75)` dan **efek bayangan 3D ganda lengkap**:
    - *Outer drop shadow* hangat (`6px 10px 20px -3px rgba(120, 105, 88, 0.15)`) dan ambient light glow (`-3px -3px 10px rgba(255, 255, 255, 0.95)`).
    - *Inner highlight* specular 3D (`inset 2px 2px 4px rgba(255, 255, 255, 1)`) dan bevel lengkung bawah (`inset -2.5px -2.5px 5px rgba(175, 160, 142, 0.18)`).
    - Efek interaktif hover lift (`translateY(-2px)`) yang responsif dan empuk.

---

### 3. Formulir & Elemen Input (Debossed Clay Form)
- **Input Text & Dropdown:**
  - Bukan sekadar kotak datar dengan border garis 1px!
  - Dirancang seperti rongga tanah liat yang ditekan ke dalam (*carved clay effect*):
    ```css
    background: #F1F5F9;
    box-shadow: inset 3px 3px 6px rgba(148, 163, 184, 0.3),
                inset -2px -2px 4px rgba(255, 255, 255, 0.8);
    ```
  - Saat `:focus`, muncul cincin cahaya lembut (*soft outer rim glow*) sesuai warna aksen brand.
- **Tombol Aksi (Raised Clay Button):**
  - Timbul dengan bayangan tebal.
  - **Efek Ditekan (`:active`):** Turun 2px (`translate-y-0.5`) dan bayangan merapat, memberi kepuasan taktil seperti menekan tombol karet kenyal.

---

### 4. Navigasi & Header (Floating Clay Island)
- Mengambang di atas halaman sebagai pulau tersendiri (*floating island*) dengan margin dari tepi atas.
- Tombol navigasi aktif tampak seperti tombol yang tertekan empuk (*pressed pill*), sedangkan tombol nonaktif tampak datar halus.
- Pengalih tema (Theme Toggle) berbentuk saklar kapsul kenyal.

---

### 5. Modal Dialog & Bottom Sheets
- Mengambang dengan bayangan besar (*deep floating clay shadow*).
- Tombol tutup (X) berbentuk tombol koin clay bundar kecil yang menyenangkan untuk diklik.

---

## 5. 🌙 Strategi Dark Mode (Midnight Clay)

Banyak implementasi claymorphism gagal pada mode gelap karena terlihat seperti abu-abu flat kusam. Untuk menjaga keindahan 3D pada mode gelap:
1. **Pewarnaan Kaya (Rich Undertone):** Bukan abu-abu netral `#111111`, melainkan biru malam pekat (*Deep Midnight Slate*) `#10172A` atau `#141C2E`.
2. **Rim Lighting:** Sudut kiri atas diberi highlight tipis putih transparan (`rgba(255, 255, 255, 0.08) s/d 0.12`), mensimulasikan kilau cahaya bulan pada tanah liat gelap.
3. **Deep Cavity Shadow:** Bayangan sudut bawah menggunakan hitam pekat (`rgba(0, 0, 0, 0.6)`).
4. **Neon Accent Pop:** Warna semantik (hijau, amber, rose) sedikit dinaikkan saturasinya agar menyala lembut di atas permukaan gelap.

---

## 6. 💻 Panduan Implementasi Teknis (Tailwind CSS v4)

Berikut adalah utility kelas yang dapat ditambahkan langsung ke `src/app/globals.css` untuk digunakan di seluruh komponen:

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

@layer utilities {
  /* 1. Kartu Clay Standar */
  .clay-card {
    border-radius: 1.25rem;
    background-color: #ffffff;
    box-shadow: 
      8px 12px 20px -4px rgba(100, 116, 139, 0.12),
      inset 2px 2px 5px rgba(255, 255, 255, 0.9),
      inset -3px -3px 7px rgba(148, 163, 184, 0.22);
    transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .dark .clay-card {
    background-color: #141c2e;
    box-shadow: 
      10px 14px 28px -4px rgba(0, 0, 0, 0.6),
      inset 1.5px 1.5px 3px rgba(255, 255, 255, 0.1),
      inset -4px -4px 8px rgba(0, 0, 0, 0.5);
  }

  /* 2. Tombol Clay Interaktif (Timbul & Kenyal) */
  .clay-btn-primary {
    border-radius: 0.875rem;
    background: linear-gradient(135deg, #6366f1, #4f46e5);
    color: #ffffff;
    font-weight: 600;
    box-shadow: 
      0 6px 14px -2px rgba(79, 70, 229, 0.4),
      inset 2px 2px 3px rgba(255, 255, 255, 0.4),
      inset -2px -2px 4px rgba(30, 27, 75, 0.4);
    transition: all 0.15s ease-out;
  }

  .clay-btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 10px 20px -2px rgba(79, 70, 229, 0.5),
      inset 2px 2px 4px rgba(255, 255, 255, 0.5),
      inset -2px -2px 4px rgba(30, 27, 75, 0.5);
  }

  .clay-btn-primary:active {
    transform: translateY(1px);
    box-shadow: 
      0 2px 6px rgba(79, 70, 229, 0.4),
      inset 2px 2px 4px rgba(30, 27, 75, 0.6);
  }

  /* 3. Input Cekung (Sunken Clay Cavity) */
  .clay-input {
    border-radius: 0.75rem;
    background-color: #f1f5f9;
    color: #0f172a;
    box-shadow: 
      inset 3px 3px 6px rgba(148, 163, 184, 0.35),
      inset -2px -2px 4px rgba(255, 255, 255, 0.9);
    transition: box-shadow 0.2s ease;
    border: none;
    outline: none;
  }

  .dark .clay-input {
    background-color: #0d131f;
    color: #f8fafc;
    box-shadow: 
      inset 3px 3px 6px rgba(0, 0, 0, 0.6),
      inset -1.5px -1.5px 3px rgba(255, 255, 255, 0.05);
  }

  .clay-input:focus {
    box-shadow: 
      inset 3px 3px 6px rgba(148, 163, 184, 0.4),
      0 0 0 3px rgba(99, 102, 241, 0.25);
  }

  /* 4. Alur Progress Bar Cekung */
  .clay-progress-track {
    border-radius: 9999px;
    background-color: #e2e8f0;
    box-shadow: 
      inset 2px 2px 4px rgba(100, 116, 139, 0.3),
      inset -1px -1px 2px rgba(255, 255, 255, 0.8);
  }

  .dark .clay-progress-track {
    background-color: #0d131f;
    box-shadow: 
      inset 2px 2px 5px rgba(0, 0, 0, 0.7),
      inset -1px -1px 2px rgba(255, 255, 255, 0.05);
  }

  /* 5. Isi Progress Bar Timbul */
  .clay-progress-fill {
    border-radius: 9999px;
    box-shadow: 
      inset 1.5px 1.5px 3px rgba(255, 255, 255, 0.6),
      inset -1.5px -1.5px 3px rgba(0, 0, 0, 0.25),
      0 2px 6px rgba(0, 0, 0, 0.15);
  }
}
```

---

## 7. ♿ Aksesibilitas & Performa (Prinsip Terpenting)

1. **Rasio Kontras Teks (WCAG 2.1 AA):**
   - Teks hitam `#0F172A` di atas kartu clay putih memiliki kontras `16.5:1` (jauh melampaui standar minimal `4.5:1`).
   - Teks putih `#F8FAFC` di atas kartu dark clay `#141C2E` memiliki kontras `14.2:1`.
2. **Performa Rendering 60 FPS:**
   - **TIDAK menggunakan `backdrop-filter: blur()` berlebih** atau filter SVG rumit yang membebani GPU render loop.
   - Semua efek murni direalisasikan dengan **CSS Box-Shadow**, yang sangat ringan dan diakselerasi oleh hardware browser.
3. **Dukungan `prefers-reduced-motion`:**
   - Animasi hover scale atau tombol tekan otomatis dimatikan bagi pengguna yang mengaktifkan preferensi pengurangan gerakan pada sistem operasinya:
   ```css
   @media (prefers-reduced-motion: reduce) {
     .clay-card, .clay-btn-primary {
       transition: none !important;
       transform: none !important;
     }
   }
   ```

---

## 8. 🗺️ Tahapan Rencana Migrasi (Implementation Roadmap)

Untuk menerapkan desain Claymorphism ini secara bertahap tanpa mengganggu fungsionalitas yang sudah ada:

- [ ] **Fase 1: Definisi Global Tokens (`globals.css`)**  
  Menambahkan variabel warna clay dan utility classes dasar (`clay-card`, `clay-btn-primary`, `clay-input`, `clay-progress-track`).
- [ ] **Fase 2: Header & Navigasi (`src/components/navbar.tsx`)**  
  Mengubah navbar menjadi pulau clay terapung (*floating clay island*) dengan logo bertekstur empuk.
- [ ] **Fase 3: Kartu Dashboard & Widget Anggaran (`dashboard/page.tsx` & `budget-summary-widget.tsx`)**  
  Menerapkan bentuk clay pada 3 kartu metrik dan widget indikator status anggaran (SRS-13 & SRS-14).
- [ ] **Fase 4: Modal & Input Transaksi (`transaction-modal.tsx` & `transactions/page.tsx`)**  
  Menerapkan efek cekung (*sunken*) pada input formulir dan efek kenyal timbul pada tombol simpan/hapus.
- [ ] **Fase 5: Workspace Anggaran & Alokasi (`budgets/workspace.tsx`)**  
  Mengubah chip rekening dan pos kategori menjadi *clay chips* interaktif.
- [ ] **Fase 6: QA Visual & Uji Responsif Perangkat**  
  Memverifikasi tampilan pada mode terang, mode gelap, layar mobile, serta desktop.

---
*Dokumen ini merupakan panduan acuan standar desain antarmuka (Design System Guide) resmi untuk tim pengembang aplikasi Expense Tracker.*
