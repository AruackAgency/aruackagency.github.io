import { LOGO_PATH, BRAND_SUBTITLE } from './data.js';

// Setup Mock Authentication
export function getStoredUser() {
    const stored = localStorage.getItem('aruack_user');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            return null;
        }
    }
    return null;
}

export function logout() {
    localStorage.removeItem('aruack_user');
    window.location.href = '/';
}

// Generate Header
export function renderHeader(activePath) {
    const user = getStoredUser();
    const isActive = (path) => activePath === path || activePath === path.replace(/^\/|\/$/g, '') || activePath === path + '/';
    
    // Create header element
    const headerHtml = `
      <nav id="mainNav" class="fixed top-0 left-0 right-0 z-[110] transition-all duration-500 ease-in-out bg-transparent py-5 md:py-8">
        <div class="responsive-container flex items-center justify-between">
          <a href="/" class="flex items-center space-x-3 group relative z-[120]">
            <img 
              src="${LOGO_PATH}" 
              alt="Aruack" 
              class="w-9 h-9 md:w-10 md:h-10 object-contain transition-transform duration-500 group-hover:scale-110" 
            />
            <div class="flex flex-col">
              <span class="text-lg md:text-xl font-black tracking-tighter text-white uppercase leading-none">ARUACK</span>
              <span class="text-[7px] md:text-[8px] font-black tracking-[0.4em] text-cyan-500 uppercase mt-0.5">${BRAND_SUBTITLE}</span>
            </div>
          </a>

          <div class="hidden lg:flex items-center space-x-8 lg:space-x-10">
            <a href="/" class="text-[11px] font-black uppercase tracking-widest relative py-2 transition-all duration-300 ${isActive('/') ? 'text-cyan-400' : 'text-gray-400 hover:text-white'} group">
              Home
              <span class="absolute bottom-0 left-0 h-[1.5px] bg-cyan-400 transition-all duration-300 ${isActive('/') ? 'w-full' : 'w-0 group-hover:w-full'}"></span>
            </a>
            <a href="/products/" class="text-[11px] font-black uppercase tracking-widest relative py-2 transition-all duration-300 ${isActive('products') ? 'text-cyan-400' : 'text-gray-400 hover:text-white'} group">
              Products
              <span class="absolute bottom-0 left-0 h-[1.5px] bg-cyan-400 transition-all duration-300 ${isActive('products') ? 'w-full' : 'w-0 group-hover:w-full'}"></span>
            </a>
            <a href="/services/" class="text-[11px] font-black uppercase tracking-widest relative py-2 transition-all duration-300 ${isActive('services') ? 'text-cyan-400' : 'text-gray-400 hover:text-white'} group">
              Services
              <span class="absolute bottom-0 left-0 h-[1.5px] bg-cyan-400 transition-all duration-300 ${isActive('services') ? 'w-full' : 'w-0 group-hover:w-full'}"></span>
            </a>
            <a href="/contact/" class="text-[11px] font-black uppercase tracking-widest relative py-2 transition-all duration-300 ${isActive('contact') ? 'text-cyan-400' : 'text-gray-400 hover:text-white'} group">
              Contact
              <span class="absolute bottom-0 left-0 h-[1.5px] bg-cyan-400 transition-all duration-300 ${isActive('contact') ? 'w-full' : 'w-0 group-hover:w-full'}"></span>
            </a>
            
              <a href="/booking/" class="bg-white text-black px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-cyan-50 transition-all shadow-xl shadow-white/5 active:scale-95">
                Booking
              </a>
          </div>

          <div class="flex lg:hidden items-center space-x-4 md:space-x-6 z-[120]">
             <div class="hidden sm:block" id="mobilePreviewButton">
                <a href="/booking/" class="bg-white text-black px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest">Booking</a>
              </div>
            
            <button id="menuButton" class="flex items-center justify-center p-2.5 focus:outline-none bg-white/5 rounded-xl border border-white/10 active:scale-90 transition-transform">
              <div class="nav-icon" id="navIcon">
                <span></span><span></span><span></span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      <!-- Mobile Menu -->
      <div id="mobileMenu" class="fixed inset-0 z-[105] bg-[#030712]/98 backdrop-blur-[32px] transition-all duration-500 ease-in-out lg:hidden opacity-0 invisible pointer-events-none">
        <div class="h-full flex flex-col justify-center px-8 sm:px-12 relative">
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>

          <div class="flex flex-col space-y-7 sm:space-y-10 relative z-10" id="mobileLinks">
            <span class="text-[11px] font-black text-gray-700 uppercase tracking-[0.7em] mb-4">Navigation</span>
            <a href="/" class="block text-5xl sm:text-7xl font-black uppercase tracking-tighter transition-all duration-700 -translate-x-12 opacity-0 ${isActive('/') ? 'text-cyan-400' : 'text-white hover:text-cyan-500'}" style="transition-delay: 0ms">Home</a>
            <a href="/products/" class="block text-5xl sm:text-7xl font-black uppercase tracking-tighter transition-all duration-700 -translate-x-12 opacity-0 ${isActive('products') ? 'text-cyan-400' : 'text-white hover:text-cyan-500'}" style="transition-delay: 80ms">Products</a>
            <a href="/services/" class="block text-5xl sm:text-7xl font-black uppercase tracking-tighter transition-all duration-700 -translate-x-12 opacity-0 ${isActive('services') ? 'text-cyan-400' : 'text-white hover:text-cyan-500'}" style="transition-delay: 160ms">Services</a>
            <a href="/contact/" class="block text-5xl sm:text-7xl font-black uppercase tracking-tighter transition-all duration-700 -translate-x-12 opacity-0 ${isActive('contact') ? 'text-cyan-400' : 'text-white hover:text-cyan-500'}" style="transition-delay: 240ms">Contact</a>
            
            <div id="mobileBottomSection" class="pt-12 mt-12 border-t border-white/5 transition-all duration-1000 delay-500 translate-y-12 opacity-0">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <a href="/booking/" class="w-full text-center py-6 bg-cyan-600 text-white rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl shadow-cyan-600/20 active:scale-[0.98] transition-all">
                  Booking
                </a>
              </div>
            </div>
          </div>
          
          <div class="absolute bottom-12 left-8 right-8 flex justify-between items-center text-[10px] font-black text-gray-800 uppercase tracking-[0.6em]">
            <span>GLOBAL_AGENCY</span>
            <span>EST_2021</span>
          </div>
        </div>
      </div>
    `;

    document.getElementById('header-container').innerHTML = headerHtml;

    // Attach Interactivity
    const nav = document.getElementById('mainNav');
    const menuBtn = document.getElementById('menuButton');
    const navIcon = document.getElementById('navIcon');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileLinks = document.getElementById('mobileLinks').querySelectorAll('a');
    const mobileBottomSection = document.getElementById('mobileBottomSection');
    const mobilePreviewButton = document.getElementById('mobilePreviewButton');

    let isMenuOpen = false;

    // Scroll Effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20 || isMenuOpen) {
            nav.classList.add('bg-[#030712]/90', 'backdrop-blur-xl', 'border-b', 'border-white/5', 'py-3', 'md:py-4');
            nav.classList.remove('bg-transparent', 'py-5', 'md:py-8');
        } else {
            nav.classList.remove('bg-[#030712]/90', 'backdrop-blur-xl', 'border-b', 'border-white/5', 'py-3', 'md:py-4');
            nav.classList.add('bg-transparent', 'py-5', 'md:py-8');
        }
    });

    // Mobile Menu Toggle
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        isMenuOpen = !isMenuOpen;
        
        if (isMenuOpen) {
            navIcon.classList.add('open');
            mobileMenu.classList.remove('opacity-0', 'invisible', 'pointer-events-none');
            mobileMenu.classList.add('opacity-100', 'visible');
            document.body.style.overflow = 'hidden';
            if (mobilePreviewButton) mobilePreviewButton.classList.add('hidden');
            
            nav.classList.add('bg-[#030712]/90', 'backdrop-blur-xl', 'border-b', 'border-white/5', 'py-3', 'md:py-4');
            nav.classList.remove('bg-transparent', 'py-5', 'md:py-8');

            mobileLinks.forEach(link => {
                link.classList.remove('-translate-x-12', 'opacity-0');
                link.classList.add('translate-x-0', 'opacity-100');
            });
            mobileBottomSection.classList.remove('translate-y-12', 'opacity-0');
            mobileBottomSection.classList.add('translate-y-0', 'opacity-100');
        } else {
            closeMobileMenu();
        }
    });

    // Menu close on click outside
    mobileMenu.addEventListener('click', (e) => {
        if (isMenuOpen && e.target === mobileMenu) closeMobileMenu();
    });

    mobileMenu.children[0].addEventListener('click', (e) => e.stopPropagation());

    function closeMobileMenu() {
        isMenuOpen = false;
        navIcon.classList.remove('open');
        mobileMenu.classList.add('opacity-0', 'invisible', 'pointer-events-none');
        mobileMenu.classList.remove('opacity-100', 'visible');
        document.body.style.overflow = 'unset';
        if (mobilePreviewButton) mobilePreviewButton.classList.remove('hidden');

        if (window.scrollY <= 20) {
            nav.classList.remove('bg-[#030712]/90', 'backdrop-blur-xl', 'border-b', 'border-white/5', 'py-3', 'md:py-4');
            nav.classList.add('bg-transparent', 'py-5', 'md:py-8');
        }

        mobileLinks.forEach(link => {
            link.classList.add('-translate-x-12', 'opacity-0');
            link.classList.remove('translate-x-0', 'opacity-100');
        });
        mobileBottomSection.classList.add('translate-y-12', 'opacity-0');
        mobileBottomSection.classList.remove('translate-y-0', 'opacity-100');
    }

    if (user) {
        const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
        if (mobileLogoutBtn) {
            mobileLogoutBtn.addEventListener('click', logout);
        }
    }
}

export function renderFooter() {
    const footerHtml = `
      <footer class="bg-[#050b14] border-t border-white/[0.06] mt-auto">
        <div class="max-w-7xl mx-auto px-6 md:px-10 py-20 md:py-24">

          <!-- Top Row: Brand + Nav Columns -->
          <div class="flex flex-col lg:flex-row gap-16 lg:gap-20 justify-between">

            <!-- Brand Block -->
            <div class="max-w-sm w-full flex-shrink-0">
              <a href="index.html" class="inline-flex items-center gap-4 mb-7 group">
                <img src="${LOGO_PATH}" alt="Aruack Logo" class="w-11 h-11 object-contain transition-transform duration-700 group-hover:rotate-[360deg]" />
                <div class="flex flex-col">
                  <span class="text-2xl font-black text-white uppercase tracking-tight leading-none">ARUACK</span>
                  <span class="text-[10px] font-bold tracking-[0.35em] text-cyan-400 uppercase mt-1.5">${BRAND_SUBTITLE}</span>
                </div>
              </a>
              <p class="text-sm text-gray-400 leading-relaxed mb-8 max-w-xs">
                Premium digital solutions for ambitious brands — from engineering and design to cutting-edge tech consulting.
              </p>
              <!-- Social Links -->
              <div class="flex items-center gap-3">
                <a href="https://www.instagram.com/aruack_official" target="_blank" rel="noreferrer" aria-label="Instagram" class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-pink-400 hover:border-pink-400/30 hover:bg-pink-400/5 transition-all duration-300">
                  <i class="fab fa-instagram"></i>
                </a>
                <a href="https://www.youtube.com/@aruack" target="_blank" rel="noreferrer" aria-label="YouTube" class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/5 transition-all duration-300">
                  <i class="fab fa-youtube"></i>
                </a>
                <a href="https://github.com/Aruack" target="_blank" rel="noreferrer" aria-label="GitHub" class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all duration-300">
                  <i class="fab fa-github"></i>
                </a>
                <a href="https://www.linkedin.com/in/aruack/" target="_blank" rel="noreferrer" aria-label="LinkedIn" class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-blue-400 hover:border-blue-400/30 hover:bg-blue-400/5 transition-all duration-300">
                  <i class="fab fa-linkedin"></i>
                </a>
              </div>
            </div>

            <!-- Nav Columns -->
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-10 md:gap-12 w-full lg:max-w-2xl">

              <div>
                <h4 class="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-5 pb-3 border-b border-white/5">Navigate</h4>
                <ul class="space-y-3.5">
                  <li><a href="/" class="text-sm text-gray-400 hover:text-white transition-colors duration-200">Home</a></li>
                  <li><a href="/products/" class="text-sm text-gray-400 hover:text-white transition-colors duration-200">Products</a></li>
                  <li><a href="/services/" class="text-sm text-gray-400 hover:text-white transition-colors duration-200">Services</a></li>
                  <li><a href="/contact/" class="text-sm text-gray-400 hover:text-white transition-colors duration-200">Contact Us</a></li>
                </ul>
              </div>

              <div>
                <h4 class="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-5 pb-3 border-b border-white/5">Services</h4>
                <ul class="space-y-3.5">
                  <li><a href="/web-app-dev/" class="text-sm text-gray-400 hover:text-white transition-colors duration-200">Web & App Dev</a></li>
                  <li><a href="/design-services/" class="text-sm text-gray-400 hover:text-white transition-colors duration-200">Design Services</a></li>
                  <li><a href="/custom-software/" class="text-sm text-gray-400 hover:text-white transition-colors duration-200">Custom Software</a></li>
                  <li><a href="/android/" class="text-sm text-gray-400 hover:text-white transition-colors duration-200">Android & ROMs</a></li>
                  <li><a href="/tech-insights/" class="text-sm text-gray-400 hover:text-white transition-colors duration-200">Tech Insights</a></li>
                </ul>
              </div>

              <div>
                <h4 class="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-5 pb-3 border-b border-white/5">Company</h4>
                <ul class="space-y-3.5">
                  <li><a href="/booking/" class="text-sm text-gray-400 hover:text-white transition-colors duration-200">Book a Consultation</a></li>
                  <li><a href="/contact/" class="text-sm text-gray-400 hover:text-white transition-colors duration-200">Get in Touch</a></li>
                  <li><a href="/legal/" class="text-sm text-gray-400 hover:text-white transition-colors duration-200">Privacy Policy</a></li>
                  <li><a href="/legal/" class="text-sm text-gray-400 hover:text-white transition-colors duration-200">Terms of Service</a></li>
                </ul>
              </div>

            </div>
          </div>

          <!-- Bottom Bar -->
          <div class="border-t border-white/[0.06] mt-16 pt-8 flex justify-center items-center">
            <p class="text-sm text-gray-500">
              &copy; <span id="currentYear"></span> <strong class="text-gray-400">Aruack Agency</strong>. All rights reserved.
            </p>
          </div>

        </div>
      </footer>
    `;

    const footerContainer = document.getElementById('footer-container');
    if (footerContainer) {
        footerContainer.innerHTML = footerHtml;
        document.getElementById('currentYear').textContent = new Date().getFullYear();
    }
}

// Global Smooth Page Transitions
function initPageTransitions() {
    // Inject transition overlay
    const overlay = document.createElement('div');
    overlay.className = 'page-transition-overlay';
    document.body.appendChild(overlay);

    // Fade in when page loads
    requestAnimationFrame(() => {
        setTimeout(() => overlay.classList.add('loaded'), 50);
    });

    // Intercept internal link clicks to fade out before navigating
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;
        
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || link.target === '_blank') return;
        
        // Ensure it's an internal local link
        const isInternal = href.indexOf(window.location.host) !== -1 || href.indexOf('://') === -1;
        if (isInternal) {
            e.preventDefault();
            overlay.classList.remove('loaded');
            overlay.classList.add('navigating');
            
            // Wait for CSS animation to finish before actually changing location
            setTimeout(() => {
                window.location.href = href;
            }, 400);
        }
    });
}

initPageTransitions();