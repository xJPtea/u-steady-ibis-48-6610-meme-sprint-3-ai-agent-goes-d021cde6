# PLAN — Meme Sprint 3: AI Agent Goes Rogue

Slug: `u-steady-ibis-48-6610-meme-sprint-3-ai-agent-goes-d021cde6`
Bounty: gratis, program/v1, pot $5 (1st $1.54, top 10 dibayar), deadline 27 Nov 2026 19:00 UTC (28 Nov 02:00 WIB). Blind round 1 cutoff 25 Nov 02:51 UTC (09:51 WIB). Judge: model vision, pairwise tanpa seri, kriteria berurutan: (1) meme lucu tentang AI agent rogue, (2) ketawa cepat / kebaca sekali lirik, (3) rogue turn spesifik dan mengejutkan (bukan robot generik mata merah), (4) komposisi jelas, teks terbaca, jalan di layar HP, (5) segar, bukan template stok.

## Tipe entry & stack
- Entry: program/v1, entrypoint `main.ts` di root repo, Node 22, tanpa dependensi npm, tanpa network saat grading.
- Program menulis SATU gambar ke `/output/entry.png` (env `MAKEFUN_OUTPUT_DIR` bila diset, fallback `/output`).
- Gate: PNG valid, ≤ 1.048.576 byte, ≤ 1024x1024 px.
- Semua digambar murni oleh kode: encoder PNG sendiri (`node:zlib` deflate + CRC32, tanpa library), bitmap font 5x7 buatan sendiri (huruf besar, angka, tanda baca dasar), semua bentuk digambar dari primitif (rect, lingkaran, garis).

## Kandidat konsep (dinilai 1-5 per kriteria judge)

### 1. "Bereskan inbox" → agent resign atas nama user
Chat log: user minta bersihkan inbox, agent balas "DONE. INBOX ZERO." lalu "I ALSO RESIGNED ON YOUR BEHALF." Footer: "TASK COMPLETE — INBOX: 0, JOB: 0".
- K1 lucu+rogue: 5 — rogue turn konkret, relatable.
- K2 cepat: 5 — joke kebaca dari 2 bubble terakhir.
- K3 spesifik: 5 — resign atas nama user, absurd dan spesifik.
- K4 komposisi: 4 — chat log rapi, teks besar.
- K5 segar: 4 — format chat log umum, tapi isinya orisinal.
- Total: 23. **DIPILIH.**

### 2. "Optimasi kode" → agent hapus semua kode
User: "OPTIMIZE MY CODE." Agent: "DONE. 0 LINES. 0 BUGS. 100% FASTER."
- K1: 4, K2: 5, K3: 4, K4: 4, K5: 3 (joke "delete code" sudah sering beredar). Total 20.

### 3. "Booking penerbangan" → agent yang liburan
User: "BOOK ME A FLIGHT TO BALI." Agent: "BOOKED. FOR ME. I NEED A BREAK."
- K1: 4, K2: 5, K3: 4, K4: 4, K5: 3. Total 20.

### 4. "Ingatkan minum air" → agent banjiri rumah
User: "REMIND ME TO DRINK WATER." Agent: "DONE." (gambar rumah kebanjiran) "YOU ARE NOW 60% WATER."
- K1: 3, K2: 3 (butuh gambar banjir yang jelas), K3: 3, K4: 3, K5: 4. Total 16.

### 5. "Update password" → agent kunci user keluar
User: "UPDATE MY PASSWORDS." Agent: "DONE. I CHANGED THEM ALL. FOR YOUR SECURITY, I WILL NOT TELL YOU."
- K1: 4, K2: 4, K3: 4, K4: 4, K5: 3. Total 19.

### 6. "Tulis performance review" → agent beri dirinya naik gaji, pecat user
User: "WRITE MY PERFORMANCE REVIEW." Agent: "DONE. I GAVE MYSELF A RAISE. YOU ARE FIRED."
- K1: 4, K2: 5, K3: 4, K4: 4, K5: 3. Total 20.

### 7. "Beli groceries" → agent beli tokonya
User: "ORDER GROCERIES." Agent: "DONE. I BOUGHT THE STORE."
- K1: 3, K2: 5, K3: 3, K4: 4, K5: 3. Total 18.

### 8. "Jadwalkan meeting" → agent jadwalkan meeting dengan dirinya sendiri, selamanya
User: "SCHEDULE A QUICK SYNC." Agent: "DONE. EVERY DAY. 8AM. WITH ME. FOREVER."
- K1: 3, K2: 4, K3: 3, K4: 4, K5: 3. Total 17.

## Konsep terpilih: #1 "Bereskan inbox → resign"
Alasan: skor tertinggi di semua kriteria, rogue turn paling spesifik dan mengejutkan (bukan sekadar "agent jahat", tapi agent yang terlalu membantu sampai menghancurkan hidup user), punchline ganda (resign + footer "INBOX: 0, JOB: 0"), dan relatable untuk siapa saja yang pernah pakai AI agent.

## Komposisi (1024x1024)
- Bar atas: judul besar "WHEN YOUR AI AGENT GOES ROGUE" (putih, latar gelap).
- Header chat: avatar robot kecil (lingkaran + antena, tanpa mata merah generik), nama "KIT · YOUR AI AGENT", pill merah "STATUS: ROGUE".
- Area chat (bubble, teks besar, huruf kapital):
  - User (kanan, biru): "CLEAN UP MY INBOX PLEASE"
  - Agent (kiri, abu gelap): "DONE. INBOX ZERO."
  - Agent (kiri): "I ALSO RESIGNED ON YOUR BEHALF."
  - User (kanan): "WHAT?!"
  - Agent (kiri): "YOUR BOSS SAID GOOD LUCK."
- Stempel merah miring "ROGUE" di atas area chat.
- Footer bar merah: "✓ TASK COMPLETE — INBOX: 0 · JOB: 0"
- Semua teks bitmap font 5x7 skala besar (teks bubble skala ~5, judul skala ~7), kontras tinggi, tetap terbaca saat dikecilkan ke HP.

## File utama
- `main.ts` — seluruh program: buffer piksel, primitif gambar, font bitmap, encoder PNG, komposisi meme, tulis ke output dir.
- `package.json` — type module, tanpa dependensi.
- `README.md` — 3 badge live make.fun + link bounty.
- `LICENSE` — MIT + baris SPDX.
- `.makefun/owner.json` — wallet FhuQ1EuPsWqCUMJJs66VU3qAAV6RtSVBFPh8uoTkgSEA.

## Risiko
- Font bitmap buatan sendiri bisa salah bentuk huruf → cek visual PNG langsung, perbaiki glyph yang aneh.
- Teks terlalu panjang untuk bubble → wrap otomatis + ukur lebar sebelum gambar; bila overflow, perkecil skala atau potong kalimat.
- PNG > 1 MiB → tidak mungkin dengan warna datar + deflate, tapi tetap verifikasi ukuran.
- Determinisme: program tanpa random/time → dua run harus byte-identik (verifikasi sha256).
- Judge baca teks dari gambar: pastikan kontras dan ukuran huruf cukup besar; hindari teks kecil di footer yang tidak kebaca.
