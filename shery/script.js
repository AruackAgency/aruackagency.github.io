/* ===================================================================
   script.js — Will You Date Me, Shreya? ❤️
   Premium Romantic Proposal — Pure Vanilla JS
   =================================================================== */

(function () {
  'use strict';

  // ───────── DOM ELEMENTS ─────────
  const loadingScreen = document.getElementById('loading-screen');
  const mainContent = document.getElementById('main-content');
  const btnYes = document.getElementById('btn-yes');
  const btnNo = document.getElementById('btn-no');
  const btnContainer = document.getElementById('buttons-container');
  const noMessage = document.getElementById('no-message');
  const musicToggle = document.getElementById('music-toggle');
  const celebOverlay = document.getElementById('celebration-overlay');
  const confettiCanvas = document.getElementById('confetti-canvas');
  const letterContent = document.getElementById('letter-content');
  const letterHearts = document.getElementById('letter-hearts');
  const particlesCanvas = document.getElementById('particles-canvas');

  // ───────── STATE ─────────
  let noClickCount = 0;
  let yesBtnScale = 1;
  let musicPlaying = false;
  let audioCtx = null;

  const noMessages = [
    'Are you sure? 🥺',
    'Please think again ❤️',
    'Just one chance? 🌹',
    'You mean a lot to me 💕',
    'Maybe reconsider? 🥰',
    'I really like you ❤️',
    'Pretty please? 🌸',
    'Don\'t break my heart 💔',
    'One date is all I ask 🌷',
    'I promise to make you smile 😊'
  ];

  const loveLetter = [
    'My Dearest Shreya,',
    '',
    'Babu, apke eyes pyare hai, apke smile pyare hai,cute and hot bhi ho😘 .',
    '',
    'Apke voice, nature , look सब मुझे पसंद है, .',
    '',
    'Apke lips to kissable hai😘 😘 .',
    '',
    'Apki body to ekdum perfect hai😘😘😘 .',
    '',
    'Thank you for saying YES.',
    '',
    'With all my love,',
    '',
    'Cutie ❤️'
  ];

  // ═══════════════════════════════════════
  // 1. LOADING SCREEN
  // ═══════════════════════════════════════
  window.addEventListener('load', () => {
    setTimeout(() => {
      loadingScreen.classList.add('hidden');
      mainContent.classList.add('visible');
      startParticles();
      startFloatingEmoji();
    }, 2800);
  });

  // ═══════════════════════════════════════
  // 2. BACKGROUND PARTICLES (Hearts, Petals, Sparkles)
  // ═══════════════════════════════════════
  function startParticles() {
    const ctx = particlesCanvas.getContext('2d');
    let w, h, particles = [];

    function resize() {
      w = particlesCanvas.width = window.innerWidth;
      h = particlesCanvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * w;
        this.y = Math.random() * h + h;
        this.size = Math.random() * 14 + 6;
        this.speedY = Math.random() * 0.8 + 0.3;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.4 + 0.1;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 2;
        this.type = Math.random();
      }
      update() {
        this.y -= this.speedY;
        this.x += this.speedX + Math.sin(this.y * 0.005) * 0.3;
        this.rotation += this.rotationSpeed;
        if (this.y < -30) this.reset();
      }
      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.globalAlpha = this.opacity;

        if (this.type < 0.4) {
          // Heart
          this.drawHeart(this.size);
        } else if (this.type < 0.7) {
          // Rose petal
          this.drawPetal(this.size);
        } else {
          // Sparkle
          this.drawSparkle(this.size * 0.6);
        }
        ctx.restore();
      }
      drawHeart(s) {
        ctx.beginPath();
        const topY = -s / 2;
        ctx.moveTo(0, topY + s * 0.35);
        ctx.bezierCurveTo(-s * 0.5, topY, -s * 0.5, topY + s * 0.6, 0, topY + s);
        ctx.bezierCurveTo(s * 0.5, topY + s * 0.6, s * 0.5, topY, 0, topY + s * 0.35);
        ctx.fillStyle = `hsla(${340 + Math.random() * 20}, 80%, 65%, 1)`;
        ctx.fill();
      }
      drawPetal(s) {
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.35, s * 0.6, 0, 0, Math.PI * 2);
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 0.6);
        g.addColorStop(0, 'rgba(244, 114, 182, 0.9)');
        g.addColorStop(1, 'rgba(251, 113, 133, 0.3)');
        ctx.fillStyle = g;
        ctx.fill();
      }
      drawSparkle(s) {
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          const angle = (i * Math.PI) / 2;
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(angle) * s, Math.sin(angle) * s);
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fill();
      }
    }

    const count = Math.min(50, Math.floor((w * h) / 25000));
    for (let i = 0; i < count; i++) {
      const p = new Particle();
      p.y = Math.random() * h;
      particles.push(p);
    }

    function animate() {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(animate);
    }
    animate();
  }

  // ═══════════════════════════════════════
  // 3. FLOATING EMOJI
  // ═══════════════════════════════════════
  function startFloatingEmoji() {
    const emojis = ['🌹', '💕', '✨', '💖', '🌸', '💗', '🦋', '💐'];
    setInterval(() => {
      const el = document.createElement('span');
      el.className = 'floating-emoji';
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      el.style.left = Math.random() * 100 + 'vw';
      el.style.fontSize = (Math.random() * 1 + 0.8) + 'rem';
      const dur = Math.random() * 8 + 8;
      el.style.animationDuration = dur + 's';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), dur * 1000);
    }, 2500);
  }

  // ═══════════════════════════════════════
  // 4. CURSOR HEART TRAIL
  // ═══════════════════════════════════════
  let lastTrail = 0;
  document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastTrail < 80) return;
    lastTrail = now;
    createCursorHeart(e.clientX, e.clientY);
  });

  document.addEventListener('touchmove', (e) => {
    const now = Date.now();
    if (now - lastTrail < 120) return;
    lastTrail = now;
    const t = e.touches[0];
    createCursorHeart(t.clientX, t.clientY);
  }, { passive: true });

  function createCursorHeart(x, y) {
    const heart = document.createElement('span');
    heart.className = 'cursor-heart';
    heart.textContent = ['💖', '💕', '💗', '♥'][Math.floor(Math.random() * 4)];
    heart.style.left = x + 'px';
    heart.style.top = y + 'px';
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 1000);
  }

  // ═══════════════════════════════════════
  // 5. NO BUTTON LOGIC
  // ═══════════════════════════════════════
  btnNo.addEventListener('click', handleNo);
  btnNo.addEventListener('touchend', (e) => { e.preventDefault(); handleNo(); });

  function handleNo() {
    noClickCount++;

    // Show message
    const msg = noMessages[(noClickCount - 1) % noMessages.length];
    noMessage.style.display = 'block';
    noMessage.textContent = msg;
    noMessage.style.animation = 'none';
    // Force reflow
    void noMessage.offsetWidth;
    noMessage.style.animation = 'popIn 0.5s ease-out';

    // Grow YES button
    yesBtnScale += 0.08;
    btnYes.style.transform = `scale(${Math.min(yesBtnScale, 1.6)})`;

    // Move NO button to random position
    const card = document.getElementById('proposal-card');
    const cardRect = card.getBoundingClientRect();
    const btnRect = btnNo.getBoundingClientRect();

    const maxX = cardRect.width - btnRect.width - 20;
    const maxY = 60;

    const randX = Math.random() * maxX - maxX / 2;
    const randY = Math.random() * maxY - maxY / 2;

    btnNo.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    btnNo.style.transform = `translate(${randX}px, ${randY}px)`;

    // Shrink NO button slightly
    const noScale = Math.max(0.6, 1 - noClickCount * 0.05);
    btnNo.style.transform = `translate(${randX}px, ${randY}px) scale(${noScale})`;

    // After many clicks, change NO text
    if (noClickCount >= 5) {
      btnNo.textContent = 'Okay fine... 🥺';
      btnNo.style.opacity = Math.max(0.4, 1 - noClickCount * 0.08);
    }
  }

  // ═══════════════════════════════════════
  // 6. YES BUTTON LOGIC
  // ═══════════════════════════════════════
  btnYes.addEventListener('click', handleYes);

  function handleYes() {
    // Prevent double-click
    btnYes.disabled = true;
    btnNo.style.display = 'none';

    // Start celebration
    launchCelebration();
    startConfetti();
    spawnCelebrationHearts();

    // Start music
    if (!musicPlaying) toggleMusic();

    // Show overlay
    setTimeout(() => {
      celebOverlay.classList.add('active');
      typewriterLetter();
    }, 600);
  }

  // ═══════════════════════════════════════
  // 7. CELEBRATION EFFECTS
  // ═══════════════════════════════════════
  function launchCelebration() {
    // Burst of sparkles at button position
    const rect = btnYes.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    for (let i = 0; i < 30; i++) {
      setTimeout(() => {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        const colors = ['#ec4899', '#f43f5e', '#f472b6', '#fb7185', '#fbbf24', '#ffffff'];
        sparkle.style.background = colors[Math.floor(Math.random() * colors.length)];
        sparkle.style.left = cx + (Math.random() - 0.5) * 100 + 'px';
        sparkle.style.top = cy + (Math.random() - 0.5) * 100 + 'px';
        sparkle.style.width = Math.random() * 8 + 4 + 'px';
        sparkle.style.height = sparkle.style.width;
        document.body.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 1500);
      }, i * 30);
    }
  }

  function spawnCelebrationHearts() {
    const hearts = ['💖', '💕', '💗', '❤️', '🌹', '💐', '✨', '🎉'];
    for (let i = 0; i < 25; i++) {
      setTimeout(() => {
        const heart = document.createElement('span');
        heart.className = 'celebration-heart';
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.bottom = '-20px';
        heart.style.fontSize = (Math.random() * 1.5 + 1) + 'rem';
        heart.style.animationDuration = (Math.random() * 2 + 2) + 's';
        document.body.appendChild(heart);
        setTimeout(() => heart.remove(), 4000);
      }, i * 120);
    }
  }

  // ═══════════════════════════════════════
  // 8. CONFETTI
  // ═══════════════════════════════════════
  function startConfetti() {
    const ctx = confettiCanvas.getContext('2d');
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;

    const pieces = [];
    const colors = [
      '#ec4899', '#f43f5e', '#f472b6', '#fb7185',
      '#fbbf24', '#a78bfa', '#ffffff', '#fda4af',
      '#c084fc', '#f9a8d4'
    ];

    class Confetti {
      constructor() {
        this.x = Math.random() * confettiCanvas.width;
        this.y = Math.random() * -confettiCanvas.height;
        this.w = Math.random() * 10 + 5;
        this.h = Math.random() * 6 + 3;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.speedY = Math.random() * 3 + 2;
        this.speedX = (Math.random() - 0.5) * 2;
        this.rotation = Math.random() * 360;
        this.rotSpeed = (Math.random() - 0.5) * 10;
        this.opacity = 1;
      }
      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotSpeed;
        if (this.y > confettiCanvas.height + 20) {
          this.opacity -= 0.02;
        }
      }
      draw() {
        if (this.opacity <= 0) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
        ctx.restore();
      }
    }

    // Create confetti bursts
    for (let i = 0; i < 150; i++) {
      pieces.push(new Confetti());
    }

    let running = true;
    function animate() {
      if (!running) return;
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      let allDone = true;
      pieces.forEach(p => {
        p.update();
        p.draw();
        if (p.opacity > 0) allDone = false;
      });
      if (allDone) { running = false; return; }
      requestAnimationFrame(animate);
    }
    animate();

    // Second burst after delay
    setTimeout(() => {
      for (let i = 0; i < 80; i++) {
        pieces.push(new Confetti());
      }
      running = true;
      animate();
    }, 2000);
  }

  // ═══════════════════════════════════════
  // 9. TYPEWRITER LOVE LETTER
  // ═══════════════════════════════════════
  function typewriterLetter() {
    letterContent.innerHTML = '';
    let lineIdx = 0;
    let charIdx = 0;
    let currentP = null;

    function type() {
      if (lineIdx >= loveLetter.length) {
        // Show hearts at end
        letterHearts.style.display = 'block';
        return;
      }

      const line = loveLetter[lineIdx];

      if (charIdx === 0) {
        currentP = document.createElement('p');
        letterContent.appendChild(currentP);

        // Style the signature line
        if (line.startsWith('Cutie')) {
          currentP.className = 'letter-signature';
        }
        if (line.startsWith('With all my love')) {
          currentP.className = 'letter-signature';
          currentP.style.fontSize = '0.95rem';
        }
        if (line.startsWith('My Dearest')) {
          currentP.style.fontFamily = 'var(--font-script)';
          currentP.style.fontSize = '1.2rem';
          currentP.style.color = 'var(--pink-600)';
        }
      }

      if (line === '') {
        lineIdx++;
        charIdx = 0;
        setTimeout(type, 100);
        return;
      }

      if (charIdx < line.length) {
        currentP.textContent += line[charIdx];
        charIdx++;
        // Scroll to bottom
        letterContent.parentElement.scrollTop = letterContent.parentElement.scrollHeight;
        setTimeout(type, 28);
      } else {
        lineIdx++;
        charIdx = 0;
        setTimeout(type, 200);
      }
    }

    setTimeout(type, 500);
  }

  // ═══════════════════════════════════════
  // 10. ROMANTIC BACKGROUND MUSIC (Web Audio API — Synth)
  // ═══════════════════════════════════════
  function createRomanticMusic() {
    if (audioCtx) return audioCtx;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // Master gain
    const master = audioCtx.createGain();
    master.gain.value = 0.15;
    master.connect(audioCtx.destination);

    // Reverb-like effect using delay
    const delay = audioCtx.createDelay();
    delay.delayTime.value = 0.3;
    const feedback = audioCtx.createGain();
    feedback.gain.value = 0.3;
    const delayFilter = audioCtx.createBiquadFilter();
    delayFilter.type = 'lowpass';
    delayFilter.frequency.value = 2000;

    delay.connect(delayFilter);
    delayFilter.connect(feedback);
    feedback.connect(delay);
    delay.connect(master);

    // Soft pad notes — romantic chord progression
    // C major → Am → F → G → Em → Am → Dm → G
    const chords = [
      [261.63, 329.63, 392.00],  // C
      [220.00, 261.63, 329.63],  // Am
      [174.61, 220.00, 261.63],  // F
      [196.00, 246.94, 293.66],  // G
      [164.81, 196.00, 246.94],  // Em
      [220.00, 261.63, 329.63],  // Am
      [146.83, 174.61, 220.00],  // Dm
      [196.00, 246.94, 293.66],  // G
    ];

    // Melody — simple romantic pattern
    const melodyNotes = [
      523.25, 587.33, 659.26, 587.33, 523.25, 493.88, 440.00, 493.88,
      523.25, 659.26, 783.99, 659.26, 587.33, 523.25, 493.88, 523.25,
    ];

    let chordIndex = 0;
    let melodyIndex = 0;

    function playChord() {
      if (!musicPlaying) return;
      const chord = chords[chordIndex % chords.length];
      chord.forEach(freq => {
        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const env = audioCtx.createGain();
        env.gain.setValueAtTime(0, audioCtx.currentTime);
        env.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 0.3);
        env.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + 1.5);
        env.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 2.8);
        osc.connect(env);
        env.connect(master);
        env.connect(delay);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 3);
      });
      chordIndex++;
      setTimeout(playChord, 3000);
    }

    function playMelody() {
      if (!musicPlaying) return;
      const freq = melodyNotes[melodyIndex % melodyNotes.length];
      const osc = audioCtx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const env = audioCtx.createGain();
      env.gain.setValueAtTime(0, audioCtx.currentTime);
      env.gain.linearRampToValueAtTime(0.06, audioCtx.currentTime + 0.1);
      env.gain.linearRampToValueAtTime(0.03, audioCtx.currentTime + 0.5);
      env.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.2);
      osc.connect(env);
      env.connect(master);
      env.connect(delay);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 1.3);
      melodyIndex++;
      setTimeout(playMelody, 750);
    }

    playChord();
    setTimeout(playMelody, 500);
    return audioCtx;
  }

  function toggleMusic() {
    musicPlaying = !musicPlaying;
    if (musicPlaying) {
      createRomanticMusic();
      musicToggle.textContent = '🔊';
      musicToggle.classList.remove('muted');
    } else {
      musicToggle.textContent = '🔇';
      musicToggle.classList.add('muted');
      if (audioCtx) {
        audioCtx.close();
        audioCtx = null;
      }
    }
  }

  musicToggle.addEventListener('click', toggleMusic);

  // ═══════════════════════════════════════
  // 11. HANDLE RESIZE FOR CONFETTI CANVAS
  // ═══════════════════════════════════════
  window.addEventListener('resize', () => {
    if (confettiCanvas) {
      confettiCanvas.width = window.innerWidth;
      confettiCanvas.height = window.innerHeight;
    }
  });

})();
