# bris-milah.com — Rabbi Shlome Ekstein, Certified Mohel

A nine-page static website. No build step, no framework, no dependencies.
Double-click `index.html` to preview it locally.

## Pages

| File | Page | In the menu under |
|---|---|---|
| `index.html` | Home | Home |
| `about.html` | My Story | About |
| `experience.html` | Training and Experience | About |
| `infant-bris.html` | Infant Bris Milah | Services |
| `adult-bris.html` | Adult Bris Milah | Services |
| `other-services.html` | Hatafas Dam, Teens and Revisions | Services |
| `travel.html` | Travel and Destination | Services |
| `what-to-expect.html` | What to Expect | For Families |
| `ceremony.html` | The Ceremony | For Families |
| `checklists.html` | Checklists and Aftercare | For Families |
| `faq.html` | FAQ | FAQ |
| `contact.html` | Contact | Contact |

### The checklists page
`checklists.html` is built to be printed — the header, menu, footer and buttons all drop
away and the form fields become writable lines. It holds four things: the before-the-Bris
checklist, the "About the baby" health form, the aftercare instructions, and what adults
should have ready.

The health form sends to you by **email or WhatsApp**, whichever the parent prefers.
Nothing is stored anywhere and nothing is sent until they press a button — the answers go
straight into their own mail app or WhatsApp, addressed to you.

Shared files: `styles.css`, `script.js`, `assets/`.

Your details are already filled in everywhere:

- **845-467-8595** — your cell phone. This is the only number anyone is invited to call.
- **347-831-6196** — WhatsApp only. It never appears as a `tel:` link, so nobody taps it
  expecting to reach you by voice.
- **rabbisekstein@bris-milah.com** — email links and the contact form.

---

## Still to do

### 1. A share image (optional)
Add `assets/og-image.jpg` at 1200×630px — the picture that appears when someone shares
your link on WhatsApp. Your portrait is square, so it would be cropped oddly; a wider
image with your name on it works better. Without one, shared links show no picture,
which is not a problem, just plainer.

### 2. Testimonials
`index.html` has three placeholders reading `[TESTIMONIAL 1]` etc. Replace them with
real messages from families, with their permission, and put a name and city underneath.
If you would rather not have them yet, delete that whole `<section>` — the page reads
fine without it.

### 3. Pricing — deliberately absent
There is no mention of cost anywhere on the site, by choice. The FAQ question was removed
and the `priceRange` field was taken out of the structured data on all nine pages, so
nothing signals a price to search engines either. Anyone who wants to discuss it calls.
Do not add a pricing section back in.

### 4. A note on the header
Each page has its own copy of the header and footer. If you change a menu item, change
it in all nine files (a find-and-replace across the folder does it in one go).

---

## The contact form

It currently opens the visitor's email app with the message pre-filled. That works
everywhere with no setup, but some people abandon it.

To have messages delivered straight to your inbox instead, sign up at
[formspree.io](https://formspree.io) (the free tier is plenty), then in `contact.html`
change the form tag to:

```html
<form class="contact-form reveal" id="contactForm" action="https://formspree.io/f/YOUR_ID" method="POST">
```

and in `script.js` delete the `form.addEventListener("submit", ...)` block so the
browser submits it normally.

## Putting it online

Easiest options, all free for a site like this:

- **Netlify Drop** — go to [app.netlify.com/drop](https://app.netlify.com/drop) and drag
  this folder onto the page. Live in about ten seconds.
- **Cloudflare Pages** or **GitHub Pages** — same idea, needs an account.

Then point `bris-milah.com` at it — each host has a one-page guide for connecting a
domain. The site already declares `bris-milah.com` as its address in the page metadata.

## Notes

- The site works with JavaScript switched off. JS only adds the mobile menu, the
  dropdowns, the fade-ins and the contact form shortcut.
- Responsive down to small phones, with a fixed Call / WhatsApp bar on mobile.
- Colors live at the top of `styles.css` under `:root`. Change `--gold` and `--ink`
  there and the whole site follows.
