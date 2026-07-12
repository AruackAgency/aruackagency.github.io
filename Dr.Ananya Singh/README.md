# Dr. Ananya Singh Ayurvedic Clinic — Website

A complete, modern, responsive Doctor Clinic Website built with **HTML5**, **CSS3**, and **Vanilla JavaScript**.

![Clinic Website Screenshot](images/screenshot.png)

---

## 📁 Folder Structure

```
clinic-website/
│
├── index.html              ← Main HTML file (all sections)
│
├── css/
│   ├── style.css           ← Main stylesheet (design system + all sections)
│   └── responsive.css      ← Responsive breakpoints (1400px → 400px)
│
├── js/
│   └── script.js           ← All JavaScript features
│
├── images/                 ← Add your clinic/doctor images here
├── icons/                  ← Custom icons (if any)
└── assets/                 ← Other assets (videos, PDFs, etc.)
```

---

## ✅ Features Implemented

### Design
- ✅ Premium color theme (#0077B6, #00B4D8, #48CAE4)
- ✅ Poppins Google Font (300–700 weights)
- ✅ Glassmorphism cards
- ✅ Smooth gradients
- ✅ Soft shadows & rounded corners
- ✅ Micro-animations on hover
- ✅ SVG medical illustrations (no external images needed)

### Sections
- ✅ Sticky Navbar (shrinks on scroll)
- ✅ Hero with floating icons, animated shapes
- ✅ Why Choose Us (8 cards)
- ✅ About Doctor (complete profile)
- ✅ Services (12 cards)
- ✅ Specialities (6 cards)
- ✅ Doctor's Timings (schedule table)
- ✅ Book Appointment (form with validation)
- ✅ Testimonials (auto-play slider)
- ✅ Health Tips (blog cards)
- ✅ Photo Gallery (lightbox effect)
- ✅ FAQ (accordion)
- ✅ Contact (map + quick form)
- ✅ Footer (newsletter + links)

### JavaScript Features
- ✅ Loader animation
- ✅ Dark mode toggle (persists in localStorage)
- ✅ Mobile hamburger menu
- ✅ Scroll progress bar
- ✅ Scroll reveal animations (IntersectionObserver)
- ✅ Counter animation (hero stats)
- ✅ Typing effect
- ✅ Form validation with real-time feedback
- ✅ Appointment success modal
- ✅ Testimonial auto-play slider with touch/swipe
- ✅ Gallery lightbox with keyboard navigation
- ✅ FAQ accordion
- ✅ Back to top button
- ✅ Ripple button effect
- ✅ Floating WhatsApp, Call, Emergency buttons
- ✅ Toast notifications
- ✅ Scroll spy (active nav link)
- ✅ Mouse parallax on floating icons
- ✅ Skip to content (accessibility)

### SEO
- ✅ Meta title, description, keywords
- ✅ Open Graph tags
- ✅ Twitter Card tags
- ✅ JSON-LD structured data (Physician schema)
- ✅ Semantic HTML5 elements
- ✅ ARIA labels & roles

### Accessibility
- ✅ ARIA labels throughout
- ✅ Keyboard navigation (Tab, Enter, Space, Arrow keys, Escape)
- ✅ High contrast media query support
- ✅ Reduced motion support
- ✅ Alt text on all images
- ✅ Focus management in modals

### Responsive
- ✅ Desktop (1400px+)
- ✅ Large Desktop (1200px)
- ✅ Tablet (992px)
- ✅ Small Tablet (768px)
- ✅ Mobile (576px)
- ✅ Small Mobile (400px)

---

## 🚀 Quick Start

1. Open `index.html` in any modern browser
2. No build step required — pure HTML, CSS, JavaScript
3. Works offline (no CDN dependencies except Google Fonts)

---

## 🎨 Customization

### Change Doctor Details
Edit `index.html` — search for "Dr. Ananya Singh" and replace with actual doctor details.

### Change Colors
Edit CSS variables in `css/style.css` (`:root` block):
```css
--primary:   #0077B6;
--secondary: #00B4D8;
--accent:    #48CAE4;
```

### Add Real Images
Place images in the `images/` folder and update `src` attributes in `index.html`.

### Connect Form to Backend
In `js/script.js`, find `initAppointmentForm()` and replace the `setTimeout` mock with an actual `fetch()` call to your backend API.

---

## 🌐 Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

---

Designed with ❤️ for better healthcare
