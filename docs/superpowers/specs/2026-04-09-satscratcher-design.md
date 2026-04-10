# SatScratcher — Design & Business Plan

**Version:** 1.0  
**Date:** 2026-04-09  
**Status:** Brainstormed, pending implementation plan  
**Repo:** https://github.com/jasonpersinger/satscratcher  
**Primary domain:** satscratcher.shop  

---

## Executive Summary

SatScratcher is a pre-flashed, pixel-art-branded Bitcoin "lottery" miner sold as a desk toy through a single-page Snipcart-checkout site with a mirrored Etsy listing. The physical product is an ESP32-2432S028R "CYD" board sourced from AliExpress at ~$14 shipped, running a lightly customized NMMiner firmware with SatScratcher branding, mascot-based idle screens, and a branded WiFi provisioning portal.

The brand is honest about the math ("odds: worse than terrible") and sells on vibes, not winning. Target audience is the novelty/curiosity impulse buyer — non-crypto-native, gift-adjacent, vibes-driven. The hustle is scoped as **beer money**: ~5 sales per month is the success bar; ~20 per month is aspirational. No path to full-time income, and no design decision should add ongoing operational overhead in pursuit of scale.

---

## 1. Overview & Product Definition

**One-sentence definition:** A pre-flashed, SatScratcher-branded CYD-board Bitcoin lottery miner sold as a desk toy through a single-page Snipcart-checkout site, a mirrored Etsy listing, and future marketplaces as opportunity allows.

**Primary audience:** Novelty/curiosity impulse buyers — non-crypto-native, gift-adjacent, vibes-driven. Discovered via TikTok, Instagram, Etsy browsing, word-of-mouth.

**Secondary audience:** Bitcoin-nerd gift buyers — someone buying for a friend or partner who's "into Bitcoin."

**Not targeted:** Bitcoin maximalists self-buying, serious hobbyist tinkerers, commercial miners.

### 1.1 The Physical Product

- **Hardware:** ESP32-2432S028R "CYD" (Cheap Yellow Display) board with its included plastic case, sourced from AliExpress at approximately $14 shipped. 2.8" resistive touchscreen, ESP32-WROOM-32 MCU, 240×320 display.
- **Firmware:** A SatScratcher fork of NMMiner (`github.com/NMminer1024/NMMiner`) with four customizations — renamed access point SSID, branded boot splash, mascot-state idle screens, and a restyled config portal.
- **Packaging:** USPS padded mailer containing the board in its plastic case and a 4×6" MOO-printed 2-sided cardstock quickstart card with a QR code linking to the online setup guide. No branded outer box.
- **Fulfillment:** Flash-to-order or small batches of 8 via a powered USB hub. Ships from Jason's address.

### 1.2 Positioning Promise

> Mine Bitcoin. Win (Maybe). Look Cool Regardless.

### 1.3 Explicit Non-Goals for v1

- Multiple SKUs, product variants, seasonal editions
- A blog, email capture, loyalty program, referral codes, abandoned-cart email
- A "did you win?" checker tool on the website
- Custom outer packaging beyond the padded mailer and card
- Paid advertising of any kind
- Any decision that requires ongoing creative or operational labor to sustain
- Any path that turns the hustle into a full-time business

### 1.4 Success Criteria

- Healthy margin per unit after bill-of-materials, shipping, platform fees, and printed collateral
- Sustained beer-money-level volume: ~5 sales per month is the success bar, ~20 per month is aspirational
- No ongoing maintenance beyond printing shipping labels, flashing boards, and the occasional support email
- A site that survives cold traffic without constant tending

---

## 2. Brand System

### 2.1 Identity Foundation

The brand identity is **pixel-art retro-gaming kawaii** — not moody-modern, not terminal-industrial, not Bitcoin-maxi. The core visual motif is an orange pixel-art cat mascot that exists in four states — Neutral, Scratching, Winning, Losing — each of which maps directly to a firmware event on the physical device. **The mascot is the face of the brand and the user interface simultaneously.**

**Locked assets (from `brandingexample.jpeg`, produced by Jason):**

- Pixel-cat mascot in four states
- Primary logo lockup: mascot + "SatScratcher" pixel wordmark
- Compact logo: cat head with a pixel Bitcoin coin
- Motif elements: pixel Bitcoin coins, scratch-panel texture, device-as-sticker
- Tagline: *Mine Bitcoin. Win (Maybe). Look Cool Regardless.*
- Subtitle: *A desk toy lottery miner.*
- Voice sample: the Info Card ("Hashrate: Basically nothing / Odds: Worse than terrible / Vibes: Immaculate")

### 2.2 Color Palette

| Token | Hex | Role |
|---|---|---|
| `--bg` | `#252627` | Page background, primary surface |
| `--bg-elevated` | `#2E3032` | Card backgrounds, elevated surfaces |
| `--text` | `#CDD3D5` | Body text, secondary UI |
| `--primary` | `#FB6107` | CTAs, logo, active links, primary interactive |
| `--jackpot` | `#F5A623` | Prices, "WIN" moments, celebrations, the mascot's base color |
| `--signal` | `#1B998B` | Mining-active indicator, success states, dividers |
| `--photo-bg` | `#FFFFFF` | Product photography backgrounds only |
| `--danger` | `#C2402C` | Form errors, introduced if/when needed |

**Usage allocation rule of thumb:**

- `--bg`: ~80% of surface area
- `--text`: ~15%
- `--primary`: ~3% — CTAs and logo
- `--jackpot`: ~1% — prices and celebration moments
- `--signal`: <1% — status dots and dividers

**Critical rule:** `--primary` is what the eye *acts on* (buy buttons, links). `--jackpot` is what the eye *celebrates* (prices, prizes, wins). **Never put both on the same element** — they will scream at each other.

**Caveat:** `--signal` (#1B998B) on `--bg` (#252627) is approximately 4:1 contrast — fine for large decorative elements, dividers, and success states, but borderline for body text per WCAG AA. Do not use it as a link color for inline prose. Reserve it for chunky elements.

### 2.3 Typography

**Display (headlines, numerics, device readouts):** **Press Start 2P** (Google Fonts, SIL OFL, free for commercial use). The definitive 8-bit arcade font. Self-hosted. Renders crisply at integer multiples of its native size (8px, 16px, 24px, 32px). Use sparingly — never for runs longer than ~8 words.

**Body (FAQ, setup guide, paragraph text, UI chrome):** **Inter** at 400/500/700. Self-hosted from Google Fonts. Pairs cleanly with any display font. The same font used on `nixkey.shop`, for portfolio consistency.

**Rendering rule for pixel assets:** apply `image-rendering: pixelated` to all mascot/coin/sprite images so browsers scale them correctly without blurring.

### 2.4 Voice

The voice sample from the Info Card — *"Hashrate: Basically nothing / Odds: Worse than terrible / Vibes: Immaculate"* — is the template for all copy on all surfaces. Distilled into rules:

1. **Honest about the math.** Never claim the buyer will win. Never use "2000% win boost" Amazon-listing slop. The joke *is* the honesty.
2. **Self-deprecating confidence.** You know it won't win. They know it won't win. The device still looks cool on a desk. That's the whole deal and everyone's in on it.
3. **Short, punchy, dry.** If a sentence can be cut in half, cut it in half. If a word can be cut, cut it.
4. **Kawaii + deadpan.** The mascot is cute; the copy is dry. The contrast is the comedy.
5. **Never cringe-maxi.** No "stack sats," no "have fun staying poor," no laser eyes. This is a gift shop, not a Twitter thread.
6. **Name the feeling, not the feature.** "Your desk, but luckier" beats "1000 KH/s ESP32 Bitcoin Miner."

### 2.5 Taglines

**Primary:**
> Mine Bitcoin. Win (Maybe). Look Cool Regardless.

**Secondary / rotational:**
> The world's slowest lottery ticket.  
> A desk toy for your Bitcoin delusions.  
> 0.0000000001% of the fun at 100% of the price.  
> It will probably not win. That is the feature.  
> Plug it in. Forget about it. Stay hopeful.

### 2.6 Brand DON'Ts

- No laser eyes, no "HODL," no Dogecoin, no Shiba mascots. The cat's territory is sacred.
- No orange-on-dark theme on other people's terms (avoid Hacker News orange, Home Depot orange). Always the `#FB6107` in context with the full palette.
- No stretching, recoloring, or rotating the mascot.
- No serif fonts anywhere, ever.
- No testimonials that sound like "I'm rich now" — only "this made me smile."
- No cringe of any kind. The bar is high because the premise is silly; the execution has to compensate.

---

## 3. Storefront Site

### 3.1 Tech Stack

- **Static site generator:** [Eleventy (11ty)](https://www.11ty.dev) — markdown-driven content, minimal config, outputs plain HTML.
- **Styling:** plain CSS with CSS custom properties for the palette tokens. No Tailwind, no preprocessors. One `styles.css`, one `critical.css` inlined into `<head>`.
- **JavaScript:** vanilla, minimal. Only what Snipcart requires, plus lazy-loading for Snipcart itself.
- **Fonts:** self-hosted WOFF2 for Press Start 2P and Inter, preloaded via `<link rel="preload">`.
- **Hosting:** Cloudflare Pages free tier with git-push deploys. Backup: Netlify free tier.
- **Repo location:** `/site/` subdirectory within the main SatScratcher repo.

**Precedent:** If `nixkey.shop` uses a different static-site generator, this stack will mirror it instead for portfolio consistency. Absent that constraint, 11ty is the pick.

### 3.2 Page Map

| Route | Purpose |
|---|---|
| `/` | Main shop page (hero, product, how it works, FAQ) |
| `/guide/` | Setup guide hub |
| `/guide/quickstart/` | 5-minute plug-and-play setup |
| `/guide/get-a-bitcoin-address/` | Audience-D unlock: how to get a BTC address with zero prior crypto experience |
| `/guide/what-if-i-win/` | The joke-serious "you won't, but just in case" page |
| `/guide/troubleshooting/` | Top 5 common issues |
| `/faq/` | Full FAQ with deep-linkable anchors |
| `/terms/` | Terms of sale |
| `/privacy/` | Privacy policy |
| `/shipping-and-returns/` | Shipping and return policy |

### 3.3 Main Page Section Breakdown

**1. Topbar** — Sticky. Compact logo left. Anchor nav center: `What It Is`, `How It Works`, `FAQ`, `Guide`. Snipcart cart button right with item count badge.

**2. Hero** — Full-viewport. Left column: large Press Start 2P headline ("Mine Bitcoin. Win (Maybe). Look Cool Regardless."), Inter subline ("A desk toy lottery miner. Plug it in. Forget about it. Stay hopeful."), primary CTA button in `--primary` ("GRAB ONE — $39"), secondary link ("How it works ↓"). Right column: photo/render of the device running with the Scratching mascot visible on screen, surrounded by subtle scratch-panel texture.

**3. What It Is** — Three-column grid, one mascot state per column. Column headers: *"It mines Bitcoin."* / *"It (probably) won't win."* / *"It looks rad on your desk."* Short paragraph under each. The honesty moment.

**4. Product Card** — Single SKU, prominently displayed. Device photo plus the Info Card metadata in voice, price tag in `--jackpot`, Snipcart add-to-cart button styled as primary CTA. Directly below: four small tiles showing what's in the box.

**5. How It Works** — Four horizontal steps with pixel-art iconography: **1. Unbox.** **2. Plug into any USB.** **3. Add your Bitcoin address.** **4. Wait forever.** The last step's caption is the joke: *"Some customers have been waiting since 2024. They seem happy."*

**6. FAQ** — 5–7 anxiety-addressing questions, collapsible, deep-linkable anchors.

**7. Footer** — Wordmark, tagline, columns: `Shop` (main, guide, FAQ) / `Fine Print` (terms, privacy, shipping) / `Say Hi` (support email). Copyright. Small mascot in corner.

### 3.4 Snipcart Integration

- Public API key in a `<meta>` tag in the shared layout head.
- Product button: `button.snipcart-add-item` with data attributes for `item-id`, `item-name`, `item-price`, `item-url`, `item-description`, `item-image`, `item-weight`, `item-shippable="true"`.
- Snipcart JS lazy-loaded on first user interaction (focus, mouseover, scroll, touchstart) with a 2750ms `setTimeout` fallback — the same pattern `nixkey.shop` uses.
- Cart modal: side position.
- Shipping configured in the Snipcart dashboard, not in code. Flat-rate US first-class padded mailer.
- Tax: Snipcart's built-in US sales tax handling. International excluded in v1.

### 3.5 Performance Target

Lighthouse 95+ on mobile, LCP under 2 seconds, zero cumulative layout shift. The pixel-art aesthetic is naturally lightweight (tiny PNGs, pixelated upscaling). Primary risk is font loading, mitigated by self-hosting and preload hints.

---

## 4. Content — Setup Guide, FAQ & Quickstart Card

All content in the voice from §2.4. Sample copy below is production-ready and can be committed to the site as written.

### 4.1 Quickstart Card (Physical)

**Spec:**
- **Size:** 4" × 6" postcard, landscape orientation
- **Stock:** MOO Luxe or equivalent matte cardstock, ~350 gsm
- **Print:** CMYK, 300 DPI, 0.125" bleed on all sides, 0.25" safe margin for text
- **Per-unit cost:** ~$0.30–0.45 at MOO quantities of 50–200

**Front (reveal side):**
- Full-bleed `--bg` background with a low-opacity scratch-panel texture
- Large centered Scratching mascot
- Press Start 2P headline in `--jackpot`: **"YOU BOUGHT A LOTTERY TICKET."**
- Inter subline in `--text`: *"It is the slowest one in the world. Welcome."*
- Compact logo in the bottom-right corner

**Back (instructions side):**
- Same background
- Three numbered steps:
    - **01. PLUG IT IN.** *Any USB port. Computer, phone charger, power bank — it doesn't care.*
    - **02. CONNECT WIFI.** *Join the "SatScratcher" network on your phone and pick your home WiFi from the list.*
    - **03. ADD YOUR ADDRESS.** *Paste a Bitcoin address and tap save. Don't have one? Scan the QR below.*
- Centered QR code (in `--primary` on `--bg`) linking to `satscratcher.shop/guide`
- Footer: `satscratcher.shop` · *Stuck? [support email]*

### 4.2 Setup Guide

**`/guide/quickstart/`:**

> # Five minutes to a slowly-mining desk toy.
>
> This will probably take less time than picking a WiFi password.
>
> **1. Plug it in.** Any USB port. You'll see a pixel cat appear on the screen. Give it about 15 seconds — on first boot it'll automatically enter setup mode and broadcast its own WiFi network.
>
> **2. Join its WiFi.** On your phone or laptop, look for a network called **SatScratcher** and connect to it. You'll be dropped onto a tiny setup page served by the device itself. *(Yes, the device is briefly its own WiFi router. Welcome to embedded electronics.)*
>
> **3. Pick your home WiFi** from the list and type the password. The device will disconnect from its own network and reconnect through yours.
>
> **4. Paste a Bitcoin address.** Got one? Great, skip to step 5. Don't have one? [Here's how to get one in 5 minutes](/guide/get-a-bitcoin-address/).
>
> **5. That's it.** The cat will start Scratching. You'll see a hashrate counter climb to ~1000 KH/s. That's your lottery ticket doing its best.

**`/guide/get-a-bitcoin-address/`:**

> # How to get a Bitcoin address in 5 minutes, with zero prior experience.
>
> You need something called a *receiving address* — a long string of letters and numbers that the SatScratcher sends your winnings to (in the cosmically unlikely event that you win). You don't need to buy any Bitcoin. You don't need to verify your identity at a bank. You just need a spot to receive.
>
> We recommend two apps, depending on how much setup you want to do.
>
> **Path A: Cash App** *(easiest, US only)* — Cash App is the grocery-store-checkout-line of Bitcoin apps. You probably already have it. [Numbered steps + screenshots to follow during implementation.]
>
> **Path B: Strike** *(cleanest, also US)* — Strike is built specifically around Bitcoin and has a cleaner address interface. [Numbered steps + screenshots to follow.]
>
> **Path C: You already know what you're doing** — Use any wallet you want. Self-custody is great. We're not going to lecture you about it.
>
> ⚠️ **One rule:** Only send Bitcoin to a Bitcoin address. It's easy to accidentally paste the wrong thing. If the SatScratcher app says the address is invalid, don't override it — go back and copy it again.

**`/guide/what-if-i-win/`:**

> # What if I actually win?
>
> First: you won't.
>
> Second: if you do, we want to hear about it, because it'll be the most improbable thing to ever happen to anyone who bought a thing on the internet for $39.
>
> Third — if somehow a real block is found — here's what actually happens:
>
> - Your device will land on the **Winning** mascot screen (the cat with coin eyes).
> - The block reward (~3.125 BTC at the current halving, worth roughly however-many-dollars Bitcoin is worth today) will be sent to the Bitcoin address you entered during setup.
> - It will appear in whatever wallet owns that address, the same way any other Bitcoin arrives.
> - You will owe taxes on it. We are not your accountant. Get one.
>
> The probability of this happening in your lifetime, with one SatScratcher running 24/7, is approximately the same as being struck by lightning while also being attacked by a shark. Do not plan your finances around it.
>
> The point of the SatScratcher is not the winning. The point is that it's running.

**`/guide/troubleshooting/`:**

> 1. **The screen is blank.** Unplug, wait 5 seconds, plug back in. If still blank, try a different USB cable (90% of the time this is the cable).
> 2. **I can't find the SatScratcher WiFi network.** It disappears after you've connected to your home WiFi once. If you want to change networks, hold the top button for 5 seconds to reset.
> 3. **The hashrate is lower than advertised.** Normal fluctuation; it depends on the firmware's work cycle and your room temperature. Anything from 700–1100 KH/s is fine.
> 4. **The mascot is stuck on Losing.** This means the device can't reach a mining pool. Check WiFi. If your WiFi is fine, the public pool is probably having a bad day — give it an hour.
> 5. **Something else is broken.** [support email]. We respond within a day or two. We are one human.

### 4.3 FAQ

Six questions, deep-linkable anchors.

> **Is this a scam?**
> No, and we'll prove it: we're openly telling you that this thing will not win. Scams promise wins. We promise vibes. The SatScratcher is a real ESP32-based Bitcoin miner running open-source firmware (NMMiner). It hashes Bitcoin the same way any other miner does — just very, very slowly.

> **Will I actually win Bitcoin?**
> Technically: yes, maybe. Practically: no. Mathematically: the odds are roughly one in three hundred billion per block attempt. The Bitcoin network produces a block every ten minutes. We leave the full calculation to you as an exercise.

> **Do I need to know anything about Bitcoin to use this?**
> Nope. You need to be able to plug in a USB cable and copy-paste a string of text. We wrote a guide that walks you through getting a Bitcoin address in 5 minutes if you've never touched crypto.

> **What happens if it wins?**
> We wrote a whole page about this, because we thought it was funny. Short version: the block reward goes to the address you set up, and you owe taxes on it.

> **How much electricity does this use?**
> About 1 watt — less than an LED nightlight. Running it 24/7 for a year costs around a dollar in electricity in the US. Cheaper than most hobbies.

> **Can I return it?**
> Yes. 30 days, undamaged, in the case. Shipping back is on you. We'll refund the purchase price, no hard feelings. We'd rather have happy customers than reluctant owners.

> **Is this the same as the ones on Amazon?**
> The board is similar. The firmware, the branding, the mascot, the setup guide, the quickstart card, and the human who answers support emails are not. You're paying for the thing *and* the experience of the thing. If you just want a bare board and can handle flashing firmware yourself, Amazon is a valid choice and we won't be offended.

---

## 5. Firmware Customization

### 5.1 Starting Point

- **Upstream:** [NMMiner](https://github.com/NMminer1024/NMMiner), MIT-licensed (verify before release).
- **Fork:** `github.com/jasonpersinger/NMMiner-SatScratcher` — a direct GitHub fork, not a submodule. Simpler operational model for a project this size.
- **Toolchain:** PlatformIO, Arduino framework for ESP32, board target `esp32-2432S028R`.

### 5.2 The Four Changes

**1. Rename the access point SSID.** From NMMiner's default `nmap-2.4g` to `SatScratcher` (open, no password). A one-line source change. This is the single highest-UX-payoff change in the entire firmware scope: the buyer's WiFi list shows "SatScratcher" on first boot, which is a trust signal, a branding moment, and a legibility win simultaneously.

**2. Replace the boot splash.** NMMiner draws a boot logo via TFT_eSPI on startup. Replace the image asset with a C header generated from a SatScratcher splash PNG (mascot + wordmark, centered on `--bg`, ~240×160 px within the 240×320 display), shown for ~2 seconds on boot.

**3. Replace the idle/mining screens** with the four mascot states driven by mining events:

- **Neutral** — shown for the first ~5 seconds after boot, before hashing starts
- **Scratching** — the default active-mining state. Cycle between 2–3 pixel frames at ~2 fps so the cat looks alive
- **Winning** — shown on valid share accepted (not just block-found, which will never happen; valid shares give the buyer regular small dopamine hits)
- **Losing** — shown on pool disconnect, WiFi disconnect, or rejected share

On-screen HUD below the mascot:
- Hashrate in `--jackpot` using Press Start 2P
- Pool status dot (`--signal` teal when connected, `--primary` orange when reconnecting, `--danger` red on failure)
- Small scrolling "MINING…" ticker in `--text` gray

**4. Restyle the config portal page template.** The web page NMMiner serves at `192.168.4.1` during provisioning gets a SatScratcher skin: same palette, Press Start 2P headline, Inter body, mascot in the corner, same three-step instructions as the quickstart card. Form fields stay unchanged (WiFi SSID dropdown, password field, BTC address field, optional pool selector). Single HTML template file in the NMMiner source.

### 5.3 Explicit Firmware Non-Goals for v1

- No new mining features or optimizations (use NMMiner's hashrate as-is)
- No OTA update support, remote management, telemetry, or analytics
- No button-driven on-device menu beyond what NMMiner ships with
- No screen-saver rotation beyond the four mascot states
- No sound (the CYD board has no speaker)
- No upstreaming changes back to NMMiner (private fork; no obligation)

### 5.4 Build & Flash Workflow

1. **One-time toolchain setup** — install PlatformIO, clone fork, confirm the board builds and flashes cleanly with stock NMMiner config before applying any SatScratcher changes. Budget 1–2 hours the first time; most of it is driver/port detection.
2. **Asset pipeline** — PNG mascots at 240×320 (or smaller, centered) get converted to RGB565 C headers via a small Python tool at `/firmware/tools/png-to-header.py`. Generated headers are committed to the firmware fork.
3. **Per-batch flash** — plug 8 CYD boards into a powered USB hub, run `pio run -t upload --upload-port /dev/ttyUSB<n>` per board (or a `flash-batch.sh` wrapper). Budget ~10 minutes for 8 boards once the rhythm is established.
4. **Pre-pack verification** — each flashed unit gets plugged in briefly: splash appears, AP SSID is "SatScratcher," AP is joinable, config portal loads. ~30s per board. Catches the 1% of boards with bad flash or dead flash chip before they become returns.

---

## 6. Channels, Pricing & Unit Economics

### 6.1 Channel Strategy

**Primary: `satscratcher.shop` with Snipcart** — own domain, own brand, best margin, long-term home of the brand.

**Secondary: Etsy listing** — duplicates the product at the same $39 price, launches within a week or two of the site.

- **Listing title:** *SatScratcher Bitcoin Lottery Miner — Pre-flashed ESP32 Desk Toy, Pixel Art Miner Gift for Crypto Fans*
- **Tags (13 max):** `bitcoin miner`, `nerdminer`, `esp32`, `crypto gift`, `bitcoin lottery`, `solo miner`, `lottery ticket`, `desk toy`, `pixel art`, `bitcoin gift`, `cyberpunk`, `novelty gift`, `nerd gift`
- **Photos (10 slots):** (1) hero device shot with Scratching mascot on screen, (2) styled desk scene for scale, (3) Info Card metadata graphic, (4) what's-in-the-box flatlay, (5) display closeup, (6–10) the four mascot states and any social proof
- **Shop announcement:** *"Pre-flashed Bitcoin lottery miners. Mine Bitcoin. Win (maybe). Look cool regardless. One human, one workshop, ships within 2 business days."*
- **Shop policies:** 30-day returns mirroring the site policy; ships from US; processing time 1–3 business days

**Tertiary / opportunistic (post-launch only):**

- **eBay** — if Etsy produces signal, list on the same terms with slightly more spec-oriented copy
- **Tindie** — nerd/maker audience, high trust, low volume. Good fit for the "pre-flashed with custom firmware" positioning. Consider after the first 20 sales
- **Amazon** — **explicit non-goal for beer money.** Requires seller account, FBA logistics, and defending against Chinese sellers who will copy the listing photos
- **Reddit** (r/Bitcoin, r/nerdminer, r/EDC, r/battlestations), **TikTok, Instagram** — treat as marketing surfaces, not channels. No paid spend in v1

### 6.2 Unit Economics

**Fulfillment cost per unit:**

| Line item | Cost |
|---|---|
| CYD board + case (AliExpress) | $14.00 |
| Padded USPS mailer (bulk) | $0.40 |
| MOO 2-sided quickstart card | $0.35 |
| USPS First-Class padded mailer label (up to 8 oz) | $4.50 |
| Jason's time flashing + packing (~5 min/unit) | unpriced |
| **Fulfillment subtotal** | **$19.25** |

**Platform fees (per sale at $39 flat pricing):**

| Channel | Fees | Effective take |
|---|---|---|
| Site | Snipcart 2% + Stripe 2.9% + $0.30 | ~$2.21 (5.7%) |
| Etsy | Etsy listing $0.20 + transaction 6.5% + payment processing 3% + $0.25 | ~$4.30 (11.0%) |

**Net margin per unit at $39 flat pricing:**

| Channel | Sale price | Fulfillment | Fees | Net margin |
|---|---|---|---|---|
| Site | $39.00 | $19.25 | $2.21 | **$17.54** |
| Etsy | $39.00 | $19.25 | $4.30 | **$15.45** |

**Volume targets:**

- **Success bar:** 5 sales per month across channels. Below this, reassess positioning or pause.
- **Aspirational:** 20 sales per month. At roughly $330/mo net, this is comfortable beer money.
- **Above 50/mo:** revisit flash-to-order assumption and consider moving to a small batch model.

### 6.3 Pricing Philosophy

- **One flat price across all channels.** $39. No variants, no sales, no discount codes in v1.
- **Never race Amazon to the bottom.** Amazon competitors live at $30–40 for the same board with stock firmware. The SatScratcher premium is the brand, the guide, the support, and the cat. Buyers who want the cheapest option should buy from Amazon, and that is fine.
- **If $39 doesn't move units after a month**, the lever is not price. It's photos and listing copy. Drop price only as a last resort.

### 6.4 Shipping Strategy

- **Domestic only for v1.** US padded mailer, USPS First-Class, ~$4.50 flat rate built into the product price ("free shipping" reads better in listings)
- **International** handled as a manual quote via a `mailto:` link in the footer. No real international shipping logic in Snipcart for v1
- **Etsy international** — allow it, set international shipping to cover actual USPS First-Class International (~$18–22 to most countries). Etsy buyers expect this

---

## 7. Repository Structure

```
/home/jason/satscratcher/
├── README.md                              Top-level project overview
├── .gitignore
├── brandingexample.jpeg                   Jason's original reference sheet
│
├── docs/
│   ├── superpowers/
│   │   └── specs/
│   │       └── 2026-04-09-satscratcher-design.md   This document
│   ├── satscratcher-design.pdf            Branded PDF render of this doc
│   ├── branding-guide.md                  Brand system reference (extract of §2)
│   ├── unit-economics.md                  Pricing/margin detail (extract of §6)
│   └── copy/
│       ├── site.md                        Site hero, product, how-it-works, FAQ
│       ├── etsy-listing.md                Etsy title, tags, description
│       ├── quickstart-card.md             Exact words on the physical card
│       └── support-email-templates.md
│
├── site/                                  Eleventy static site
│   ├── package.json
│   ├── .eleventy.js
│   ├── .env.example                       Snipcart public key placeholder
│   ├── README.md
│   └── src/
│       ├── _data/site.js
│       ├── _includes/
│       │   ├── layouts/
│       │   │   ├── base.njk
│       │   │   └── page.njk
│       │   └── partials/
│       │       ├── topbar.njk
│       │       ├── footer.njk
│       │       ├── product-card.njk
│       │       ├── faq-accordion.njk
│       │       └── mascot.njk
│       ├── assets/
│       │   ├── css/
│       │   │   ├── critical.css
│       │   │   ├── styles.css
│       │   │   └── tokens.css
│       │   ├── js/snipcart-lazy.js
│       │   ├── fonts/
│       │   │   ├── PressStart2P-Regular.woff2
│       │   │   ├── Inter-Regular.woff2
│       │   │   ├── Inter-Medium.woff2
│       │   │   └── Inter-Bold.woff2
│       │   └── img/
│       │       ├── mascot/{neutral,scratching,winning,losing}.png
│       │       ├── logo/{primary,compact,wordmark,favicon}.png
│       │       ├── product/{hero,styled-desk,whats-in-box,display-closeup}.jpg
│       │       └── decor/{pixel-coin,scratch-panel}.png
│       ├── index.njk
│       ├── guide/
│       │   ├── index.njk
│       │   ├── quickstart.md
│       │   ├── get-a-bitcoin-address.md
│       │   ├── what-if-i-win.md
│       │   └── troubleshooting.md
│       ├── faq.md
│       ├── terms.md
│       ├── privacy.md
│       └── shipping-and-returns.md
│
├── firmware/                              Assets + tools that feed the fork
│   ├── README.md                          Links to fork, build/flash instructions
│   ├── assets-source/
│   │   ├── splash.png
│   │   ├── mascot-neutral.png
│   │   ├── mascot-scratching-01.png
│   │   ├── mascot-scratching-02.png
│   │   ├── mascot-winning.png
│   │   └── mascot-losing.png
│   └── tools/
│       ├── png-to-header.py               PNG → RGB565 C header
│       └── flash-batch.sh                 Batch flash wrapper
│
├── print/                                 Print-ready files for MOO
│   └── quickstart-card/
│       ├── front.pdf
│       ├── back.pdf
│       ├── front.svg
│       └── back.svg
│
└── build/                                 PDF render pipeline
    ├── fonts/                             Bundled fonts for the PDF
    ├── template.html.j2                   Jinja2 HTML template
    └── render.py                          Markdown → HTML → PDF pipeline
```

**The firmware fork is a separate GitHub repo** at `github.com/jasonpersinger/NMMiner-SatScratcher`. This main repo's `/firmware/` directory holds only the source art, pipeline tools, and build documentation — the actual C code lives in the fork. This keeps the main repo focused on brand/content/site work (frequent changes) and isolates firmware (rare, discrete updates).

---

## Appendix A — Market Research Summary

Conducted 2026-04-09 during brainstorming. Key findings:

- **Etsy has no assembled NerdMiner devices.** Every Etsy result for "nerdminer" and similar terms is accessories — 3D-printed stands, cases, display mounts. This confirms the market gap SatScratcher is addressing.
- **Amazon and eBay are saturated** with pre-flashed units from Chinese sellers (Heltec, DIYmalls, MinerXpert, Altair) marketed as "BTC lottery" or "lucky miner" gifts. The product category exists and has buyers; the opening is the channel (Etsy) and the presentation, not the concept.
- **Dedicated hobbyist storefronts exist:** `powermining.io`, `nerdminers.com`, `bitronics.store`, `getlottominer.com`, `solosatoshi.com`, `cryptominerbros.com`, `bitcoinstuffstore.com`. "Lotto Miner" is already a competitor brand name; "SatScratcher" is unclaimed in the current market.
- **Hash rate claims vary wildly.** Mainline NerdMiner v2 on T-Display S3 does ~55–78 KH/s. The CYD board with NMMiner is where the "1000 KH/s" Amazon claims come from. This is a marketing number, not a competitive moat — at current Bitcoin network difficulty, the honest odds are effectively zero regardless of which number you put on the box.
- **The marketing language is already cringe.** Listings routinely claim "2000% win boost," "lucky miner," and similar. The SatScratcher brand's honest voice is directly contrarian to this and is a real positioning lever.

## Appendix B — Decisions Log

| Decision | Resolved | Note |
|---|---|---|
| Board model | CYD (ESP32-2432S028R) | 2x cheaper than T-Display S3, bigger display |
| Firmware base | NMMiner | Better hash rate on CYD; mainline NerdMiner v2 has better market recognition but worse CYD support |
| Fork strategy | Direct GitHub fork | Simpler than submodule+patches for beer-money scope |
| Primary audience | D (novelty/curiosity) + A (gift buyer) secondary | B (maxi self-buyer) and C (tinkerer) ruled out |
| Channels | Site primary + Etsy + future marketplaces | Dual-channel from launch |
| Domain | satscratcher.shop | Matches nixkey portfolio pattern; .com as optional defensive redirect |
| Pricing | $39 flat across all channels | Consistency over margin optimization |
| Launch ambition | Soft Approach B | Lean MVP + splash screen + MOO card; defer video loop, variants, blog |
| Packaging | Padded mailer + device in case + card | No branded outer box |
| Success target | 5/mo bar, 20/mo aspirational | Beer money, not scaling curve |

## Appendix C — Open Questions & Risks

- **NMMiner license** needs verification (assumed MIT) before commercial use of a modified fork
- **PlatformIO + CYD toolchain setup** is the single largest launch-blocker risk; first-time setup can be finicky
- **Etsy offsite-ads threshold** policy needs verification at listing time; forced enrollment could change unit economics at the $10K/yr revenue level
- **Product photography** is self-shot in v1 and will be a noticeable quality ceiling on the listing; can be upgraded later
- **Support volume** at v1 is one human answering email; if volume grows past beer-money level this becomes a scaling bottleneck
