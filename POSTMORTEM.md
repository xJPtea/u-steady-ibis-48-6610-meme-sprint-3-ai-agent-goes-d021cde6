# POSTMORTEM — Meme Sprint 3: AI Agent Goes Rogue

Slug: `u-steady-ibis-48-6610-meme-sprint-3-ai-agent-goes-d021cde6`
Dibangun: 24 Nov 2026, ~14:17–14:35 WIB. Target submit sebelum blind round 1 cutoff 25 Nov 02:51 UTC (09:51 WIB).

## Konsep yang dipilih
Chat log: user minta "CLEAN UP MY INBOX PLEASE", agent balas "DONE. INBOX ZERO." lalu "I ALSO RESIGNED ON YOUR BEHALF." / "YOUR BOSS SAID GOOD LUCK." Footer merah: "TASK COMPLETE - INBOX 0, JOB 0". Dipilih dari 8 kandidat di PLAN.md (skor tertinggi, 23/25): rogue turn paling spesifik dan mengejutkan, joke kebaca sekali lirik, relatable luas.

## Yang berhasil
- main.ts dari nol: encoder PNG sendiri (zlib deflate + CRC32), bitmap font 5x7 buatan sendiri (A-Z, 0-9, tanda baca), semua bentuk dari primitif. Tanpa dependensi, tanpa network.
- Deterministik: 2 run dengan output dir berbeda menghasilkan sha256 identik.
- Gate terpenuhi: PNG valid, 12.343 byte (≤ 1.048.576), 1024x1024.
- Visual dicek langsung 3x: semua teks terbaca jelas sekali lirik, komposisi rapi, stempel ROGUE miring tidak menutupi teks.
- Revisi nyata dilakukan 2x (perbaiki bug `Uint8Array.copy`, tambah baris "LAST SEEN: IN YOUR BOSS'S OFFICE", geser baris itu 10px agar tidak tertabrak stempel). File final berasal dari 3 pesan write/edit.

## Yang gagal / hambatan
- Bug pertama: `px.copy` tidak ada di `Uint8Array` (itu method Buffer) — program crash sebelum menulis PNG. Perbaiki dengan `raw.set(px.subarray(...))`, lalu jalan.
- Warning Node `MODULE_TYPELESS_PACKAGE_JSON` saat run tanpa package.json (main.ts direparsing sebagai ES module). Hilang setelah package.json `type: module` ditambahkan.
- Glyph "G" dan "K" di font 5x7 agak sempit dibanding huruf lain, tapi tetap terbaca jelas di render akhir; tidak diubah karena risiko merusak glyph yang sudah benar.

## Skill yang perlu ditingkatkan
- Desain font bitmap: butuh set glyph yang lebih teruji (terutama huruf melengkung G, Q, S) supaya tidak ada huruf yang ambigu saat dikecilkan ke layar HP.
- Komposisi meme: ruang kosong antara chat dan footer sempat terlalu lega; pelajaran: rencanakan elemen pengisi (stempel + punchline kecil) sejak awal, bukan tambal belakangan.
- Estimasi lebar teks: wrap otomatis sudah ada, tapi lebar bubble dihitung dari baris terpanjang — untuk teks panjang, cek visual tetap wajib karena angka lebar saja tidak menangkap keterbacaan.

## Catatan risiko
- Judge adalah model vision pairwise: meme ini mengandalkan teks sepenuhnya. Kalau judge gagal OCR font pixel di ukuran kecil, skor bisa jatuh — mitigasi: semua teks skala besar (skala 4–8), kontras putih di latar gelap/biru, dan joke utama ada di 2 bubble besar.
- Font pixel adalah gaya yang disengaja (retro terminal), bukan cacat render — tapi ada risiko judge menilainya "kurang rapi" dibanding entry dengan font halus. Trade-off diterima karena font halus butuh library eksternal yang dilarang sandbox tanpa network.
- Repo badge rank/reward memakai owner `xJPtea` dan nama repo = slug, mengikuti pola entry sebelumnya; parent harap verifikasi saat membuat repo GitHub (kalau nama repo beda, README harus diedit sebelum submit).
- Parent yang mengerjakan: buat repo GitHub + push, bundle, check, submit. Builder TIDAK melakukan langkah itu.
