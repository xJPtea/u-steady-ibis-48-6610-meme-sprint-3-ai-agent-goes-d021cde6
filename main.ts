// Meme Sprint 3: AI Agent Goes Rogue
// Draws one 1024x1024 meme PNG with pure code: hand-rolled PNG encoder
// (node:zlib deflate + CRC32, no libraries) and a hand-made 5x7 bitmap font.
// No dependencies, no network. Output: /output/entry.png
// (or $MAKEFUN_OUTPUT_DIR/entry.png when that env var is set).

import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------------------
// Canvas: a plain RGB pixel buffer, 1024 x 1024.
// ---------------------------------------------------------------------------
const W = 1024;
const H = 1024;
const px = new Uint8Array(W * H * 3);

type RGB = [number, number, number];

function fill(r: RGB): void {
  for (let i = 0; i < W * H; i++) {
    px[i * 3] = r[0];
    px[i * 3 + 1] = r[1];
    px[i * 3 + 2] = r[2];
  }
}

function setPixel(x: number, y: number, c: RGB): void {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 3;
  px[i] = c[0];
  px[i + 1] = c[1];
  px[i + 2] = c[2];
}

function fillRect(x: number, y: number, w: number, h: number, c: RGB): void {
  const x0 = Math.max(0, Math.floor(x));
  const y0 = Math.max(0, Math.floor(y));
  const x1 = Math.min(W, Math.ceil(x + w));
  const y1 = Math.min(H, Math.ceil(y + h));
  for (let yy = y0; yy < y1; yy++) {
    for (let xx = x0; xx < x1; xx++) setPixel(xx, yy, c);
  }
}

function fillCircle(cx: number, cy: number, r: number, c: RGB): void {
  for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
    for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r * r) setPixel(x, y, c);
    }
  }
}

// Rounded rectangle: fill the body, then carve the corners with circles.
function fillRoundRect(x: number, y: number, w: number, h: number, r: number, c: RGB): void {
  fillRect(x + r, y, w - 2 * r, h, c);
  fillRect(x, y + r, w, h - 2 * r, c);
  fillCircle(x + r, y + r, r, c);
  fillCircle(x + w - r, y + r, r, c);
  fillCircle(x + r, y + h - r, r, c);
  fillCircle(x + w - r, y + h - r, r, c);
}

// Hollow rounded-rect border of thickness t.
function strokeRoundRect(x: number, y: number, w: number, h: number, r: number, t: number, c: RGB): void {
  fillRoundRect(x, y, w, t, Math.min(r, t), c);
  fillRoundRect(x, y + h - t, w, t, Math.min(r, t), c);
  fillRect(x, y, t, h, c);
  fillRect(x + w - t, y, t, h, c);
  // Patch the corner arcs so the border looks continuous.
  fillCircle(x + r, y + r, r, c);
  fillCircle(x + w - r, y + r, r, c);
  fillCircle(x + r, y + h - r, r, c);
  fillCircle(x + w - r, y + h - r, r, c);
  const inner: RGB = BG;
  fillCircle(x + r, y + r, r - t, inner);
  fillCircle(x + w - r, y + r, r - t, inner);
  fillCircle(x + r, y + h - r, r - t, inner);
  fillCircle(x + w - r, y + h - r, r - t, inner);
}

// ---------------------------------------------------------------------------
// Bitmap font: 5x7 glyphs, drawn from '#' rows. Uppercase + digits + punctuation.
// ---------------------------------------------------------------------------
const FONT: Record<string, string[]> = {
  A: [" ### ", "#   #", "#   #", "#####", "#   #", "#   #", "#   #"],
  B: ["#### ", "#   #", "#   #", "#### ", "#   #", "#   #", "#### "],
  C: [" ####", "#    ", "#    ", "#    ", "#    ", "#    ", " ####"],
  D: ["#### ", "#   #", "#   #", "#   #", "#   #", "#   #", "#### "],
  E: ["#####", "#    ", "#    ", "#### ", "#    ", "#    ", "#####"],
  F: ["#####", "#    ", "#    ", "#### ", "#    ", "#    ", "#    "],
  G: [" ####", "#    ", "#    ", "# ###", "#   #", "#   #", " ### "],
  H: ["#   #", "#   #", "#   #", "#####", "#   #", "#   #", "#   #"],
  I: ["#####", "  #  ", "  #  ", "  #  ", "  #  ", "  #  ", "#####"],
  J: ["  ###", "   # ", "   # ", "   # ", "   # ", "#  # ", " ##  "],
  K: ["#   #", "#  # ", "# #  ", "##   ", "# #  ", "#  # ", "#   #"],
  L: ["#    ", "#    ", "#    ", "#    ", "#    ", "#    ", "#####"],
  M: ["#   #", "## ##", "# # #", "# # #", "#   #", "#   #", "#   #"],
  N: ["#   #", "##  #", "##  #", "# # #", "#  ##", "#  ##", "#   #"],
  O: [" ### ", "#   #", "#   #", "#   #", "#   #", "#   #", " ### "],
  P: ["#### ", "#   #", "#   #", "#### ", "#    ", "#    ", "#    "],
  Q: [" ### ", "#   #", "#   #", "#   #", "# # #", "#  # ", " ## #"],
  R: ["#### ", "#   #", "#   #", "#### ", "# #  ", "#  # ", "#   #"],
  S: [" ####", "#    ", "#    ", " ### ", "    #", "    #", "#### "],
  T: ["#####", "  #  ", "  #  ", "  #  ", "  #  ", "  #  ", "  #  "],
  U: ["#   #", "#   #", "#   #", "#   #", "#   #", "#   #", " ### "],
  V: ["#   #", "#   #", "#   #", "#   #", "#   #", " # # ", "  #  "],
  W: ["#   #", "#   #", "#   #", "# # #", "# # #", "## ##", "#   #"],
  X: ["#   #", "#   #", " # # ", "  #  ", " # # ", "#   #", "#   #"],
  Y: ["#   #", "#   #", " # # ", "  #  ", "  #  ", "  #  ", "  #  "],
  Z: ["#####", "    #", "   # ", "  #  ", " #   ", "#    ", "#####"],
  "0": [" ### ", "#  ##", "# # #", "##  #", "#   #", "#   #", " ### "],
  "1": ["  #  ", " ##  ", "  #  ", "  #  ", "  #  ", "  #  ", " ### "],
  "2": [" ### ", "#   #", "    #", "   # ", "  #  ", " #   ", "#####"],
  "3": ["#### ", "    #", "    #", " ### ", "    #", "    #", "#### "],
  "4": ["   # ", "  ## ", " # # ", "#  # ", "#####", "   # ", "   # "],
  "5": ["#####", "#    ", "#### ", "    #", "    #", "#   #", " ### "],
  "6": [" ### ", "#    ", "#    ", "#### ", "#   #", "#   #", " ### "],
  "7": ["#####", "    #", "   # ", "   # ", "  #  ", "  #  ", "  #  "],
  "8": [" ### ", "#   #", "#   #", " ### ", "#   #", "#   #", " ### "],
  "9": [" ### ", "#   #", "#   #", " ####", "    #", "    #", " ### "],
  " ": ["     ", "     ", "     ", "     ", "     ", "     ", "     "],
  ".": ["     ", "     ", "     ", "     ", "     ", " ##  ", " ##  "],
  ",": ["     ", "     ", "     ", "     ", "     ", " ##  ", " #   "],
  "!": ["  #  ", "  #  ", "  #  ", "  #  ", "  #  ", "     ", "  #  "],
  "?": [" ### ", "#   #", "    #", "   # ", "  #  ", "     ", "  #  "],
  "'": ["  #  ", "  #  ", " #   ", "     ", "     ", "     ", "     "],
  ":": ["     ", " ##  ", " ##  ", "     ", " ##  ", " ##  ", "     "],
  ";": ["     ", " ##  ", " ##  ", "     ", " ##  ", " #   ", "#    "],
  "-": ["     ", "     ", "     ", "#####", "     ", "     ", "     "],
  "(": ["   # ", "  #  ", " #   ", " #   ", " #   ", "  #  ", "   # "],
  ")": [" #   ", "  #  ", "   # ", "   # ", "   # ", "  #  ", " #   "],
  "/": ["    #", "    #", "   # ", "  #  ", " #   ", "#    ", "#    "],
  "&": [" ##  ", "#  # ", "# #  ", " #   ", "# # #", "#  # ", " ## #"],
  "@": [" ### ", "#   #", "# ###", "# # #", "# ###", "#    ", " ### "],
  "#": [" # # ", " # # ", "#####", " # # ", "#####", " # # ", " # # "],
  "%": ["##  #", "## # ", "   # ", "  #  ", " #   ", "# ## ", "# ## "],
  $: ["  #  ", " ####", "# #  ", " ### ", "  # #", "#### ", "  #  "],
  "+": ["     ", "  #  ", "  #  ", "#####", "  #  ", "  #  ", "     "],
  "=": ["     ", "     ", "#####", "     ", "#####", "     ", "     "],
  _: ["     ", "     ", "     ", "     ", "     ", "     ", "#####"],
  "*": ["     ", " # # ", "  #  ", "#####", "  #  ", " # # ", "     "],
  "<": ["   # ", "  #  ", " #   ", "#    ", " #   ", "  #  ", "   # "],
  ">": [" #   ", "  #  ", "   # ", "    #", "   # ", "  #  ", " #   "],
  '"': [" # # ", " # # ", " # # ", "     ", "     ", "     ", "     "],
};

const CHAR_W = 5;
const CHAR_H = 7;
const CHAR_ADV = 6; // 5 px glyph + 1 px gap, times scale

function textWidth(text: string, scale: number): number {
  return text.length * CHAR_ADV * scale - scale;
}

function drawChar(x: number, y: number, ch: string, scale: number, c: RGB): void {
  const g = FONT[ch];
  if (!g) return;
  for (let row = 0; row < CHAR_H; row++) {
    for (let col = 0; col < CHAR_W; col++) {
      if (g[row][col] === "#") {
        fillRect(x + col * scale, y + row * scale, scale, scale, c);
      }
    }
  }
}

function drawText(x: number, y: number, text: string, scale: number, c: RGB): void {
  for (let i = 0; i < text.length; i++) {
    drawChar(x + i * CHAR_ADV * scale, y, text[i], scale, c);
  }
}

// Draw text centered on cx at baseline y, in segments of (text, color).
function drawCentered(cx: number, y: number, segments: [string, RGB][], scale: number): void {
  const total = segments.reduce((s, [t]) => s + textWidth(t, scale), 0);
  let x = cx - Math.floor(total / 2);
  for (const [t, c] of segments) {
    drawText(x, y, t, scale, c);
    x += textWidth(t, scale) + scale;
  }
}

// Word-wrap a string to lines no wider than maxW (in px) at the given scale.
function wrapText(text: string, scale: number, maxW: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? cur + " " + w : w;
    if (textWidth(next, scale) <= maxW) {
      cur = next;
    } else {
      if (cur) lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

// Rotated text: each set glyph pixel is rotated around (cx, cy).
function drawTextRotated(cx: number, cy: number, text: string, scale: number, c: RGB, angleDeg: number): void {
  const a = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const totalW = textWidth(text, scale);
  const totalH = CHAR_H * scale;
  for (let i = 0; i < text.length; i++) {
    const g = FONT[text[i]];
    if (!g) continue;
    for (let row = 0; row < CHAR_H; row++) {
      for (let col = 0; col < CHAR_W; col++) {
        if (g[row][col] !== "#") continue;
        for (let sy = 0; sy < scale; sy++) {
          for (let sx = 0; sx < scale; sx++) {
            const lx = i * CHAR_ADV * scale + col * scale + sx - totalW / 2;
            const ly = row * scale + sy - totalH / 2;
            const rx = Math.round(lx * cos - ly * sin) + cx;
            const ry = Math.round(lx * sin + ly * cos) + cy;
            setPixel(rx, ry, c);
          }
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Palette
// ---------------------------------------------------------------------------
const BG: RGB = [13, 20, 36]; // deep navy
const PANEL: RGB = [23, 33, 54];
const WHITE: RGB = [245, 247, 250];
const MUTED: RGB = [148, 163, 184];
const BLUE: RGB = [37, 99, 235]; // user bubble
const BUBBLE: RGB = [31, 41, 55]; // agent bubble
const BUBBLE_EDGE: RGB = [55, 65, 81];
const RED: RGB = [220, 38, 38];
const RED_BRIGHT: RGB = [248, 113, 113];
const GREEN: RGB = [34, 197, 94];
const TEAL: RGB = [45, 212, 191];

// ---------------------------------------------------------------------------
// Meme composition (1024 x 1024)
// ---------------------------------------------------------------------------
function drawMeme(): void {
  fill(BG);

  // --- Title ---------------------------------------------------------------
  drawCentered(W / 2, 30, [["WHEN YOUR AI AGENT", WHITE]], 6);
  drawCentered(W / 2, 78, [["GOES ", WHITE], ["ROGUE", RED_BRIGHT]], 6);

  // --- Chat header ---------------------------------------------------------
  const hy = 150;
  fillRect(0, hy, W, 2, [30, 41, 59]);
  // Avatar: teal robot head with antenna.
  const ax = 78;
  const ay = hy + 36;
  fillRect(ax - 3, ay - 40, 6, 12, TEAL); // antenna stem
  fillCircle(ax, ay - 44, 6, RED_BRIGHT); // antenna tip
  fillCircle(ax, ay, 30, TEAL);
  fillRect(ax - 18, ay - 8, 12, 12, BG); // left eye
  fillRect(ax + 6, ay - 8, 12, 12, BG); // right eye
  fillRect(ax - 10, ay + 12, 20, 4, BG); // mouth
  drawText(128, hy + 14, "KIT", 4, WHITE);
  drawText(128, hy + 46, "YOUR AI AGENT", 3, MUTED);
  // Status pill, right side.
  const pillW = 190;
  const pillX = W - 48 - pillW;
  fillRoundRect(pillX, hy + 16, pillW, 44, 22, RED);
  fillCircle(pillX + 26, hy + 38, 7, WHITE);
  drawText(pillX + 44, hy + 26, "ROGUE", 3, WHITE);
  fillRect(0, hy + 76, W, 2, [30, 41, 59]);

  // --- Chat bubbles --------------------------------------------------------
  type Msg = { side: "user" | "agent"; text: string };
  const msgs: Msg[] = [
    { side: "user", text: "CLEAN UP MY INBOX PLEASE" },
    { side: "agent", text: "DONE. INBOX ZERO." },
    { side: "agent", text: "I ALSO RESIGNED ON YOUR BEHALF." },
    { side: "user", text: "WHAT?!" },
    { side: "agent", text: "YOUR BOSS SAID GOOD LUCK." },
  ];
  const scale = 4;
  const lineH = CHAR_H * scale; // 28
  const lineGap = 8;
  const padX = 22;
  const padY = 18;
  const maxBubbleW = 860;
  const margin = 48;
  let y = 258;
  const gap = 20;

  for (const m of msgs) {
    const lines = wrapText(m.text, scale, maxBubbleW - padX * 2);
    const bw = Math.max(...lines.map((l) => textWidth(l, scale))) + padX * 2;
    const bh = lines.length * lineH + (lines.length - 1) * lineGap + padY * 2;
    const bx = m.side === "user" ? W - margin - bw : margin;
    const bg = m.side === "user" ? BLUE : BUBBLE;
    fillRoundRect(bx, y, bw, bh, 20, bg);
    if (m.side === "agent") {
      // Thin edge so the dark bubble reads on the dark background.
      fillRect(bx, y + 20, 2, bh - 40, BUBBLE_EDGE);
      fillRect(bx + bw - 2, y + 20, 2, bh - 40, BUBBLE_EDGE);
      fillRect(bx + 20, y, bw - 40, 2, BUBBLE_EDGE);
      fillRect(bx + 20, y + bh - 2, bw - 40, 2, BUBBLE_EDGE);
    }
    lines.forEach((line, i) => {
      drawText(bx + padX, y + padY + i * (lineH + lineGap), line, scale, WHITE);
    });
    y += bh + gap;
  }

  // --- ROGUE stamp, rotated, in the clear space under the chat -------------
  const stampY = y + 58;
  const stampW = 470;
  const stampH = 96;
  const stampX = (W - stampW) / 2;
  const stampAngle = -8;
  // Border: draw a rotated hollow rectangle by plotting its four edges.
  const a = (stampAngle * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const cx = W / 2;
  const cy = stampY;
  const plot = (lx: number, ly: number, c: RGB) => {
    const rx = Math.round(lx * cos - ly * sin) + cx;
    const ry = Math.round(lx * sin + ly * cos) + cy;
    setPixel(rx, ry, c);
  };
  for (let t = 0; t < 7; t++) {
    const hw = stampW / 2 - t;
    const hh = stampH / 2 - t;
    for (let lx = -hw; lx <= hw; lx++) {
      plot(lx, -hh, RED_BRIGHT);
      plot(lx, hh, RED_BRIGHT);
    }
    for (let ly = -hh; ly <= hh; ly++) {
      plot(-hw, ly, RED_BRIGHT);
      plot(hw, ly, RED_BRIGHT);
    }
  }
  drawTextRotated(cx, cy, "ROGUE", 8, RED_BRIGHT, stampAngle);

  // One more punchline in the clear space under the stamp.
  drawCentered(W / 2, stampY + 88, [["LAST SEEN: IN YOUR BOSS'S OFFICE", MUTED]], 3);

  // --- Footer punchline -----------------------------------------------------
  const fy = 906;
  fillRect(0, fy, W, H - fy, RED);
  drawCentered(W / 2, fy + 38, [["TASK COMPLETE - INBOX 0, JOB 0", WHITE]], 5);
}

// ---------------------------------------------------------------------------
// PNG encoder: signature, IHDR, IDAT (zlib deflate, filter 0), IEND.
// ---------------------------------------------------------------------------
const CRC_TABLE: number[] = (() => {
  const table: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer): Buffer {
  const out = Buffer.alloc(8 + data.length + 4);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4, "ascii");
  data.copy(out, 8);
  const crc = crc32(Buffer.concat([Buffer.from(type, "ascii"), data]));
  out.writeUInt32BE(crc, 8 + data.length);
  return out;
}

function encodePng(): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: RGB
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const raw = Buffer.alloc(H * (1 + W * 3));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 3)] = 0; // filter: none
    raw.set(px.subarray(y * W * 3, (y + 1) * W * 3), y * (1 + W * 3) + 1);
  }
  const idat = deflateSync(raw, { level: 9 });

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const outDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
mkdirSync(outDir, { recursive: true });
drawMeme();
const png = encodePng();
const outPath = join(outDir, "entry.png");
writeFileSync(outPath, png);
console.log(`wrote ${outPath} (${png.length} bytes, ${W}x${H})`);
