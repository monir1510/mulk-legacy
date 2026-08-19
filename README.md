# Mulk Legacy

Scroll-driven cinematic site for Mulk Legacy — a G+6 exclusive residential building in Bashundhara J Block, Dhaka.

Built with GSAP/ScrollTrigger, a canvas frame-rendered "video" (`frames/`), and Lenis smooth scroll. Generated with the `video-to-website` Claude skill from a source promo video.

## Structure
- `index.html` — page markup and section content
- `css/style.css` — styling, layout, and section-specific treatments
- `js/app.js` — scroll choreography (frame rendering, section reveals, marquee, dark overlay)
- `frames/` — 180 extracted video frames used for the canvas-scrubbed background

## Deploy
Auto-deploys to Vercel on push to `main`.
