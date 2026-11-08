# Pixel 10 Pro XL field card

An interactive, phone-first field guide for shooting cinematic video on a **Pixel 10 Pro XL** rigged on the **OM 7P gimbal** with a **SmallRig 5174** clamp and **K&F 67mm ND** filters. Built from the *Pocket Field Card* Google Doc.

## What's in it

- **Expose** – pick the light, lens (1x main or 0.5x ultra-wide) and frame rate; read the ND filter, shutter, ISO and white balance, with notes only when they apply.
- **Rig** – the four-step rigging checklist, tickable (remembered on your phone).
- **Apps** – Blackmagic Camera and MotionCam Pro steps, filled in with the values from the dial.

It works offline after the first visit (service worker), so it still opens with no signal. Add it to your home screen from Chrome for one-tap access.

## Run locally

```bash
python3 -m http.server 4173
```

Then open http://localhost:4173. No build step: plain HTML, CSS and JS.

## Credits

- “Athmuqam waterfall (Long Exposure)” by Sharjeel Ahmed Khan, CC BY-SA 4.0, via Wikimedia Commons
- Field photographs by Cornelia Büchse, Crucifix Jean-Luc, Martin Dörsch and elizabeth lies (Unsplash licence, via picsum.photos)
- Type: League Spartan and Figtree (Google Fonts)
