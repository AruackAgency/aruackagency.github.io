# Happy Birthday Sherya 💖

A modern, premium, fully responsive Birthday Wish Website built using HTML, CSS, and Vanilla JavaScript.

## 🌟 Features
- **Premium Glassmorphism Design:** Soft pink, lavender, and peach themes with glass effects.
- **Animations:** Floating hearts, smooth scroll reveals, and typewriter effects.
- **Interactive Canvases:** Fireworks and confetti animations.
- **Music Controller:** Background audio with play, pause, and volume controls.
- **Responsive:** Looks beautiful on desktop, tablet, and mobile.
- **Dark/Light Mode:** Toggleable theme.

## 📂 Project Structure
```
├── assets/
│   ├── icons/     # (Optional) Store local icons here
│   ├── images/    # Place your actual photos here
│   └── music/     # Place background music here
├── index.html     # Main HTML structure
├── style.css      # Styling, variables, animations, responsive rules
├── script.js      # Interactions, canvas rendering, logic
└── README.md
```

## 🛠️ Setup Instructions

### 1. Adding Music
1. Obtain an `.mp3` file that you want to play in the background.
2. Place the file inside the `assets/music/` folder.
3. Rename the file to `music.mp3` (or update the `<source>` tag in `index.html` to match your filename).

### 2. Adding Photos
The current photo gallery uses beautiful placeholder images from Unsplash. To use real photos of Sherya:
1. Place your photo files (`.jpg`, `.png`, etc.) inside the `assets/images/` folder.
2. Open `index.html` and search for the `id="gallery"` section.
3. Replace the Unsplash URLs in the `<img src="...">` tags with local paths. Example:
   ```html
   <img src="assets/images/photo1.jpg" alt="Memory 1">
   ```

### 3. Running the Website
Since this project uses plain HTML, CSS, and JS, you do not need any build tools or frameworks.
- Simply double-click the `index.html` file to open it in your web browser.
- _Note: Some browsers might block autoplaying audio or local canvas execution due to CORS policies. If you experience issues, it's best to run this via a local server (like the VS Code "Live Server" extension)._

## 🎨 Customization
- **Theme Colors:** You can modify the CSS variables in the `:root` pseudo-class in `style.css` (e.g., `--primary-color`, `--bg-gradient`).
- **Text:** You can directly modify any headings, paragraphs, or the Typewriter message in `index.html` and `script.js`.

---
*Made with ❤️ by Aruack*
