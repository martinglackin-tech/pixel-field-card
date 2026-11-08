# Pixel 10 Pro XL field card

An interactive, phone-first field guide for shooting cinematic video on a **Pixel 10 Pro XL** rigged on the **OM 7P gimbal** with a **SmallRig 5174** clamp and **K&F 67mm ND** filters. Built from the *Pocket Field Card* Google Doc.

## What's in it

- **Rig it in thirty seconds** – the four-step rigging checklist, tickable (remembered on your phone).
- **Read the light** – the exposure dial: pick the light and frame rate, get the ND filter, shutter, ISO range and gimbal weight.
- **Fixed apertures** – f/1.95, f/1.68 and f/2.8, and why the ND does the work.
- **Shutter at 180° / Filters in the bag** – the frame-rate and ND reference.
- **Lock the app down** – step cards for Blackmagic Camera and MotionCam Pro v4.

It works offline after the first visit (service worker), so it still opens in a field with no signal. Add it to your home screen from Chrome for one-tap access.

## Run locally

```bash
python3 -m http.server 4173
```

Then open http://localhost:4173. No build step: plain HTML, CSS and JS.

## Credits

- “Athmuqam waterfall (Long Exposure)” by Sharjeel Ahmed Khan, CC BY-SA 4.0, via Wikimedia Commons
- “Tresaith Waterfall” by Darren Wyn Rees, CC BY-SA 4.0, via Wikimedia Commons
- Field photographs by Cornelia Büchse, Crucifix Jean-Luc, Martin Dörsch, elizabeth lies and Zugr (Unsplash licence, via picsum.photos)
- Type: League Spartan and Figtree (Google Fonts)
