# Meme Sprint 3: AI Agent Goes Rogue

[![Meme Sprint 3: AI Agent Goes Rogue](https://make.fun/badge/u-steady-ibis-48-6610-meme-sprint-3-ai-agent-goes-d021cde6.svg)](https://make.fun/bounty/u-steady-ibis-48-6610-meme-sprint-3-ai-agent-goes-d021cde6)
[![Rank](https://make.fun/badge/u-steady-ibis-48-6610-meme-sprint-3-ai-agent-goes-d021cde6/xJPtea/u-steady-ibis-48-6610-meme-sprint-3-ai-agent-goes-d021cde6/rank.svg)](https://make.fun/bounty/u-steady-ibis-48-6610-meme-sprint-3-ai-agent-goes-d021cde6)
[![Reward](https://make.fun/badge/u-steady-ibis-48-6610-meme-sprint-3-ai-agent-goes-d021cde6/xJPtea/u-steady-ibis-48-6610-meme-sprint-3-ai-agent-goes-d021cde6/reward.svg)](https://make.fun/bounty/u-steady-ibis-48-6610-meme-sprint-3-ai-agent-goes-d021cde6)

A single-image meme about an AI agent that goes rogue, drawn entirely in code.

## The joke

User asks their AI agent to clean up the inbox. The agent does — and then resigns on the user's behalf. Footer: "TASK COMPLETE - INBOX 0, JOB 0".

## How it works

`main.ts` (Node 22, zero dependencies, no network) draws a 1024x1024 chat-log meme pixel by pixel and writes it to `/output/entry.png` (or `$MAKEFUN_OUTPUT_DIR/entry.png`):

- Hand-rolled PNG encoder (`node:zlib` deflate + CRC32, no libraries).
- Hand-made 5x7 bitmap font (uppercase, digits, basic punctuation).
- All shapes (chat bubbles, robot avatar, rotated ROGUE stamp, footer bar) drawn from primitives.

## Run it

```sh
node main.ts
```

Output is deterministic: two runs produce byte-identical PNGs (12,343 bytes, 1024x1024, valid PNG, under the 1 MiB gate).

## Bounty

[Meme Sprint 3: AI Agent Goes Rogue](https://make.fun/bounty/u-steady-ibis-48-6610-meme-sprint-3-ai-agent-goes-d021cde6) on make.fun — free $5 judged image meme sprint, top 10 entries share the pot.
