document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------
    // 1. Loading Screen & Init
    // ----------------------------------------
    const loader = document.getElementById('loader');
    
    // Simulate loading time, then hide loader
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.visibility = 'hidden';
            loader.style.display = 'none';
            // Trigger initial animations
            triggerScrollAnimations();
        }, 500);
    }, 2500);

    // ----------------------------------------
    // 2. Custom Cursor
    // ----------------------------------------
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');
    
    // Only apply custom cursor on non-touch devices
    if (window.matchMedia("(pointer: fine)").matches) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            
            // Add slight delay for follower
            setTimeout(() => {
                cursorFollower.style.left = e.clientX + 'px';
                cursorFollower.style.top = e.clientY + 'px';
            }, 50);
        });

        // Hover effects on clickable elements
        const clickables = document.querySelectorAll('a, button, .interactive-element, .social-icon, .gift-box');
        clickables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('hovering');
                cursorFollower.style.opacity = '0';
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('hovering');
                cursorFollower.style.opacity = '1';
            });
        });
    }

    // ----------------------------------------
    // 3. Navigation & Scroll Progress
    // ----------------------------------------
    const nav = document.querySelector('.glass-nav');
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links a');
    const scrollProgress = document.getElementById('scroll-progress');
    const backToTop = document.getElementById('back-to-top');

    // Hamburger menu toggle
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = hamburger.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Close menu when link clicked
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.querySelector('i').classList.remove('fa-times');
            hamburger.querySelector('i').classList.add('fa-bars');
        });
    });

    window.addEventListener('scroll', () => {
        // Sticky nav
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }

        // Scroll Progress
        const totalScroll = document.documentElement.scrollTop;
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scroll = `${totalScroll / windowHeight * 100}%`;
        scrollProgress.style.width = scroll;

        // Back to Top button
        if (window.scrollY > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }

        // Active Nav Link mapping
        let current = '';
        document.querySelectorAll('section, header').forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href').includes(current)) {
                item.classList.add('active');
            }
        });
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ----------------------------------------
    // 4. Greeting by Time
    // ----------------------------------------
    const greetingEl = document.getElementById('greeting');
    const hour = new Date().getHours();
    if (hour < 12) greetingEl.textContent = 'Good Morning,';
    else if (hour < 18) greetingEl.textContent = 'Good Afternoon,';
    else greetingEl.textContent = 'Good Evening,';

    // ----------------------------------------
    // 5. Scroll Reveal Animations
    // ----------------------------------------
    function triggerScrollAnimations() {
        const reveals = document.querySelectorAll('.fade-up, .slide-left, .slide-right');
        
        for (let i = 0; i < reveals.length; i++) {
            const windowHeight = window.innerHeight;
            const elementTop = reveals[i].getBoundingClientRect().top;
            const elementVisible = 100;

            if (elementTop < windowHeight - elementVisible) {
                reveals[i].classList.add('visible');
                
                // Trigger Typewriter when message section is visible
                if (reveals[i].classList.contains('message-card') && !isTypewriterDone) {
                    startTypewriter();
                }
            }
        }
    }

    window.addEventListener('scroll', triggerScrollAnimations);

    // ----------------------------------------
    // 6. Typewriter Effect
    // ----------------------------------------
    const messageText = `Happy Birthday, Sherya! 💖\n\nYou are one of the sweetest, kindest, and most beautiful souls I have ever known.\n\nYour smile has the power to brighten even the darkest day.\n\nI hope this year brings you endless happiness, good health, success, beautiful memories, and all the dreams you've wished for.\n\nMay you always keep smiling because your smile makes the world brighter.\n\nThank you for being such an amazing friend.\n\nEnjoy every moment of your special day.\n\nHappy Birthday once again!\n\nStay blessed.\nStay happy.\nKeep shining forever. ✨`;
    
    const typeWriterEl = document.getElementById('typewriter-text');
    let i = 0;
    let isTypewriterDone = false;

    function startTypewriter() {
        isTypewriterDone = true; // Prevent re-triggering
        typeWriterEl.innerHTML = '';
        typeWrite();
    }

    function typeWrite() {
        if (i < messageText.length) {
            let char = messageText.charAt(i);
            if (char === '\n') {
                typeWriterEl.innerHTML += '<br>';
            } else {
                typeWriterEl.innerHTML += char;
            }
            i++;
            setTimeout(typeWrite, 50); // Speed of typing
        }
    }

    // ----------------------------------------
    // 7. Interactive Button & Random Messages
    // ----------------------------------------
    const interactiveBtn = document.getElementById('interactive-btn');
    const randomMessageEl = document.getElementById('random-message');
    const sweetMessages = [
        "You are amazing ❤️",
        "Never stop smiling 😊",
        "You deserve all happiness 🌸",
        "Stay beautiful 🌷",
        "Happy Birthday 🎂",
        "You are special ✨",
        "You are loved ❤️",
        "Keep shining bright 🌟",
        "You make the world better 🦋"
    ];

    interactiveBtn.addEventListener('click', () => {
        const randomIndex = Math.floor(Math.random() * sweetMessages.length);
        
        // Fade effect
        randomMessageEl.style.opacity = 0;
        setTimeout(() => {
            randomMessageEl.textContent = sweetMessages[randomIndex];
            randomMessageEl.style.opacity = 1;
        }, 300);
        
        // Trigger small confetti explosion at button position
        const rect = interactiveBtn.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        createConfetti(x, y);
    });

    // ----------------------------------------
    // 8. Surprise Box (Fireworks & Confetti)
    // ----------------------------------------
    const giftBox = document.getElementById('gift-box');
    const surpriseContent = document.getElementById('surprise-content');
    const celebrateBtn = document.getElementById('celebrate-btn');

    giftBox.addEventListener('click', () => {
        giftBox.classList.add('hidden');
        surpriseContent.classList.remove('hidden');
        
        // Start massive fireworks and confetti
        startFireworks();
        setInterval(() => {
            createConfetti(Math.random() * window.innerWidth, -20);
        }, 200);
    });

    celebrateBtn.addEventListener('click', () => {
        createConfetti(window.innerWidth / 2, window.innerHeight / 2, 100);
    });

    // ----------------------------------------
    // 9. Music Player
    // ----------------------------------------
    const bgMusic = document.getElementById('bg-music');
    const musicBtn = document.getElementById('music-btn');
    const volumeSlider = document.getElementById('volume-slider');
    let isPlaying = false;

    // Set initial volume
    bgMusic.volume = volumeSlider.value;

    musicBtn.addEventListener('click', () => {
        if (isPlaying) {
            bgMusic.pause();
            musicBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        } else {
            bgMusic.play().catch(e => console.log("Audio play failed:", e));
            musicBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        }
        isPlaying = !isPlaying;
    });

    volumeSlider.addEventListener('input', (e) => {
        bgMusic.volume = e.target.value;
    });

    // ----------------------------------------
    // 10. Background Floating Elements Canvas
    // ----------------------------------------
    const bgCanvas = document.getElementById('bg-canvas');
    const bgCtx = bgCanvas.getContext('2d');
    
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        bgCanvas.width = window.innerWidth;
        bgCanvas.height = window.innerHeight;
    });

    const particlesArray = [];
    const colors = ['rgba(255, 183, 178, 0.6)', 'rgba(255, 255, 255, 0.6)', 'rgba(226, 187, 253, 0.6)'];

    class Particle {
        constructor() {
            this.x = Math.random() * bgCanvas.width;
            this.y = Math.random() * bgCanvas.height;
            this.size = Math.random() * 5 + 1;
            this.speedX = Math.random() * 1 - 0.5;
            this.speedY = Math.random() * -1 - 0.5; // Float upwards
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.type = Math.random() > 0.5 ? 'circle' : 'heart';
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Reset if out of bounds
            if (this.y < -10) {
                this.y = bgCanvas.height + 10;
                this.x = Math.random() * bgCanvas.width;
            }
        }
        
        draw() {
            bgCtx.fillStyle = this.color;
            if (this.type === 'circle') {
                bgCtx.beginPath();
                bgCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                bgCtx.fill();
            } else {
                // Draw heart
                bgCtx.beginPath();
                const d = this.size * 2;
                bgCtx.moveTo(this.x, this.y + d / 4);
                bgCtx.quadraticCurveTo(this.x, this.y, this.x + d / 4, this.y);
                bgCtx.quadraticCurveTo(this.x + d / 2, this.y, this.x + d / 2, this.y + d / 4);
                bgCtx.quadraticCurveTo(this.x + d / 2, this.y, this.x + d / 4, this.y + d / 1.5);
                bgCtx.lineTo(this.x, this.y + d);
                bgCtx.lineTo(this.x - d / 4, this.y + d / 1.5);
                bgCtx.quadraticCurveTo(this.x - d / 2, this.y, this.x - d / 2, this.y + d / 4);
                bgCtx.quadraticCurveTo(this.x - d / 2, this.y, this.x, this.y);
                bgCtx.fill();
            }
        }
    }

    function initParticles() {
        for (let i = 0; i < 50; i++) {
            particlesArray.push(new Particle());
        }
    }

    function animateParticles() {
        bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
            particlesArray[i].draw();
        }
        requestAnimationFrame(animateParticles);
    }

    initParticles();
    animateParticles();

    // ----------------------------------------
    // 11. Confetti Canvas
    // ----------------------------------------
    const confettiCanvas = document.getElementById('confetti-canvas');
    const confCtx = confettiCanvas.getContext('2d');
    
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
    
    const confettis = [];
    const confettiColors = ['#fce18a', '#ff726d', '#b48def', '#f4306d'];
    
    class Confetti {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 10 + 5;
            this.speedX = Math.random() * 6 - 3;
            this.speedY = Math.random() * -5 - 2;
            this.gravity = 0.1;
            this.color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
            this.rotation = Math.random() * 360;
            this.rotationSpeed = Math.random() * 10 - 5;
        }
        
        update() {
            this.speedY += this.gravity;
            this.x += this.speedX;
            this.y += this.speedY;
            this.rotation += this.rotationSpeed;
        }
        
        draw() {
            confCtx.save();
            confCtx.translate(this.x, this.y);
            confCtx.rotate((this.rotation * Math.PI) / 180);
            confCtx.fillStyle = this.color;
            confCtx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
            confCtx.restore();
        }
    }
    
    function createConfetti(x, y, count = 30) {
        for (let i = 0; i < count; i++) {
            confettis.push(new Confetti(x, y));
        }
    }
    
    function animateConfetti() {
        confCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        for (let i = 0; i < confettis.length; i++) {
            confettis[i].update();
            confettis[i].draw();
            // Remove if off screen
            if (confettis[i].y > confettiCanvas.height) {
                confettis.splice(i, 1);
                i--;
            }
        }
        requestAnimationFrame(animateConfetti);
    }
    
    animateConfetti();

    // ----------------------------------------
    // 12. Fireworks Canvas
    // ----------------------------------------
    const fwCanvas = document.getElementById('fireworks-canvas');
    const fwCtx = fwCanvas.getContext('2d');
    
    fwCanvas.width = window.innerWidth;
    fwCanvas.height = window.innerHeight;
    
    const fireworks = [];
    const fwParticles = [];
    
    class Firework {
        constructor(x, targetY) {
            this.x = x;
            this.y = fwCanvas.height;
            this.targetY = targetY;
            this.speed = 8;
            this.angle = Math.atan2(targetY - this.y, x - this.x);
            this.velocity = {
                x: Math.cos(this.angle) * this.speed,
                y: Math.sin(this.angle) * this.speed
            };
            this.trail = [];
            this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        }
        
        update() {
            this.trail.push({x: this.x, y: this.y});
            if (this.trail.length > 5) this.trail.shift();
            
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            
            // Explode when near target
            if (this.y <= this.targetY) {
                createExplosion(this.x, this.y, this.color);
                return false; // Dead
            }
            return true; // Alive
        }
        
        draw() {
            fwCtx.beginPath();
            if (this.trail.length > 0) {
                fwCtx.moveTo(this.trail[0].x, this.trail[0].y);
            } else {
                fwCtx.moveTo(this.x, this.y);
            }
            fwCtx.lineTo(this.x, this.y);
            fwCtx.strokeStyle = this.color;
            fwCtx.lineWidth = 3;
            fwCtx.stroke();
        }
    }
    
    class FWParticle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 1;
            this.velocity = {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            };
            this.gravity = 0.05;
            this.friction = 0.95;
            this.alpha = 1;
            this.decay = Math.random() * 0.015 + 0.005;
        }
        
        update() {
            this.velocity.x *= this.friction;
            this.velocity.y *= this.friction;
            this.velocity.y += this.gravity;
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            this.alpha -= this.decay;
            
            return this.alpha > 0;
        }
        
        draw() {
            fwCtx.save();
            fwCtx.globalAlpha = this.alpha;
            fwCtx.beginPath();
            fwCtx.arc(this.x, this.y, 2, 0, Math.PI * 2);
            fwCtx.fillStyle = this.color;
            fwCtx.fill();
            fwCtx.restore();
        }
    }
    
    function createExplosion(x, y, color) {
        for (let i = 0; i < 50; i++) {
            fwParticles.push(new FWParticle(x, y, color));
        }
    }
    
    let fwAnimationId;
    let fwIntervalId;
    
    function animateFireworks() {
        // Clear with slight trailing effect
        fwCtx.fillStyle = 'rgba(0,0,0,0.1)'; 
        fwCtx.clearRect(0, 0, fwCanvas.width, fwCanvas.height);
        
        for (let i = 0; i < fireworks.length; i++) {
            if (!fireworks[i].update()) {
                fireworks.splice(i, 1);
                i--;
            } else {
                fireworks[i].draw();
            }
        }
        
        for (let i = 0; i < fwParticles.length; i++) {
            if (!fwParticles[i].update()) {
                fwParticles.splice(i, 1);
                i--;
            } else {
                fwParticles[i].draw();
            }
        }
        
        fwAnimationId = requestAnimationFrame(animateFireworks);
    }
    
    function startFireworks() {
        fwCanvas.style.zIndex = "9998"; // Bring to front
        if (!fwAnimationId) {
            animateFireworks();
        }
        
        fwIntervalId = setInterval(() => {
            const x = Math.random() * fwCanvas.width;
            const targetY = Math.random() * (fwCanvas.height / 2);
            fireworks.push(new Firework(x, targetY));
        }, 800);
        
        // Stop after 10 seconds
        setTimeout(() => {
            clearInterval(fwIntervalId);
        }, 10000);
    }

    // ----------------------------------------
    // 13. Current Date & Time for Footer
    // ----------------------------------------
    function updateDateTime() {
        const dateEl = document.getElementById('current-date');
        const timeEl = document.getElementById('current-time');
        
        const now = new Date();
        const dateStr = now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const timeStr = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        
        if (dateEl) dateEl.textContent = dateStr;
        if (timeEl) timeEl.textContent = timeStr;
    }
    
    setInterval(updateDateTime, 1000);
    updateDateTime();

    // ----------------------------------------
    // 14. Theme Toggle (Dark/Light mode)
    // ----------------------------------------
    const themeToggle = document.querySelector('.theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    
    themeToggle.addEventListener('click', () => {
        const body = document.body;
        if (body.hasAttribute('data-theme')) {
            body.removeAttribute('data-theme');
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        } else {
            body.setAttribute('data-theme', 'dark');
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
    });
});
