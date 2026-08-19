# Mulk Legacy

Scroll-driven cinematic site for Mulk Legacy — a G+6 exclusive residential building in Bashundhara J Block, Dhaka.

Built with GSAP/ScrollTrigger, a canvas frame-rendered "video" (`frames/`), and Lenis smooth scroll. Generated with the `video-to-website` Claude skill from a source promo video.

## Structure
- `index.html` — page markup and section content
- `css/style.css` — styling, layout, and section-specific treatments
- `js/app.js` — scroll choreography (frame rendering, section reveals, marquee, dark overlay, mobile nav, lightbox)
- `frames/` — 180 extracted video frames used for the canvas-scrubbed background (frames ~102–174 are only used by the gallery section; the rest drive the scroll-scrubbed canvas)
- `privacy.html`, `terms.html` — minimal legal pages, drafted, **pending legal review**
- `robots.txt`, `sitemap.xml` — basic SEO scaffolding

## Content to finalize
The following are shipped as clearly-marked interim values (`TODO` comments in the code, or "To be confirmed" copy in the same italic style already used for pending fields) and need real data swapped in:

- **Contact**: WhatsApp business number (`js/app.js` search isn't needed — it's the `wa.me/8801XXXXXXXXX` links in `index.html`), inquiry email (`info@mulklegacy.com` placeholder), landowner/JV email, active social handles
- **Project facts**: Total Units, Architect, Completion date, Surroundings/nearby landmarks, regulatory approval number (RAJUK-equivalent), if applicable
- **Assets**: brochure PDF (`brochure.pdf`, currently a dead link), real production domain (currently `mulklegacy.vercel.app` in canonical/OG tags and `sitemap.xml`/`robots.txt`)
- **Contact form**: currently a zero-config `mailto:` form (`.cta-form` in `index.html`) — swap for a hosted form endpoint (e.g. Formspree/Getform) once one exists, for a better mobile UX and spam handling
- **Legal pages**: `privacy.html`/`terms.html` are drafted placeholders — have counsel review before launch

## Future: growing into a multi-project brand
This page is currently the whole site — one project, one scroll. If a second Mulk project ships, promote this page to a project-detail template (e.g. `/projects/mulk-legacy/`) and add a slim Home + Projects listing that reuses the same header/footer/nav markup and the CSS custom properties already centralized in `css/style.css` (`:root` block) — no redesign of the token system needed. Keep "Mulk" (the brand) and "Mulk Legacy" (this project) distinct in copy, as they are now.

## Deploy
Auto-deploys to Vercel on push to `main`.
