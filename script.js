document.addEventListener('DOMContentLoaded', () => {
    
    console.log("Kibi Label - Connecté à Sanity !");

    // --- NAVIGATION ACTIVE ---
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.getAttribute('href') === currentPath) link.classList.add('active');
    });

    // --- MODE SOMBRE ---
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;

    if (localStorage.getItem('theme') === 'dark') {
        body.classList.add('dark-mode');
        if (themeIcon) { themeIcon.classList.replace('fa-moon', 'fa-sun'); }
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            const isDark = body.classList.contains('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            themeIcon.classList.replace(isDark ? 'fa-moon' : 'fa-sun', isDark ? 'fa-sun' : 'fa-moon');
        });
    }

    // --- TRANSITIONS DE PAGES ---
    const overlay = document.getElementById('page-transition');
    if (overlay) {
        setTimeout(() => overlay.classList.add('is-loaded'), 50);
        document.querySelectorAll('a[href]:not([target="_blank"]):not([href^="tel:"]):not([href^="mailto:"]):not([href^="#"])').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                overlay.classList.remove('is-loaded');
                overlay.classList.add('is-leaving');
                setTimeout(() => window.location.href = link.href, 500);
            });
        });
    }

    // --- MENU SIDEBAR ---
    const menuOpen = document.getElementById('menu-open');
    const menuClose = document.getElementById('menu-close');
    const sidebar = document.getElementById('sidebar');
    const pageOverlay = document.getElementById('page-overlay');

    const toggleMenu = (show) => {
        if(sidebar) sidebar.classList.toggle('active', show);
        if(pageOverlay) pageOverlay.classList.toggle('active', show);
    };

    if (menuOpen) menuOpen.onclick = () => toggleMenu(true);
    if (menuClose) menuClose.onclick = () => toggleMenu(false);
    if (pageOverlay) pageOverlay.onclick = () => toggleMenu(false);

    // --- WIDGET AVANT/APRÈS ---
    const slider = document.getElementById('ba-slider');
    const foregroundWrapper = document.getElementById('foreground-wrapper');
    const sliderLine = document.getElementById('slider-line');

    if (slider && foregroundWrapper && sliderLine) {
        slider.addEventListener('input', (e) => {
            const sliderValue = e.target.value;
            foregroundWrapper.style.width = `${sliderValue}%`;
            sliderLine.style.left = `${sliderValue}%`;
        });
    }

    // --- FONCTION TILT 3D SERVICES ---
    function initTiltEffect() {
        document.querySelectorAll('.service-card').forEach(card => {
            card.onmousemove = (e) => {
                const r = card.getBoundingClientRect();
                const x = e.clientX - r.left - r.width/2;
                const y = e.clientY - r.top - r.height/2;
                card.style.transform = `perspective(1000px) rotateX(${y/-10}deg) rotateY(${x/10}deg) scale(1.02)`;
            };
            card.onmouseleave = () => card.style.transform = '';
        });
    }
    initTiltEffect(); // Initialisation sur les cartes de base

    // --- FONCTION LIGHTBOX PORTFOLIO ---
    function initLightbox() {
        const galleryItems = document.querySelectorAll('.gallery-item img');
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        const lightboxClose = document.getElementById('lightbox-close');

        if (lightbox && lightboxImg && galleryItems.length > 0) {
            galleryItems.forEach(img => {
                img.onclick = () => {
                    lightboxImg.src = img.src;
                    lightbox.classList.add('active');
                };
            });
            if(lightboxClose) lightboxClose.onclick = () => lightbox.classList.remove('active');
            lightbox.onclick = (e) => {
                if (e.target !== lightboxImg) lightbox.classList.remove('active');
            };
        }
    }
    initLightbox(); // Initialisation sur les photos de base

    // --- LOGIQUE POP-UP CALENDLY ---
    window.openCalendly = (url) => {
        if (typeof Calendly !== 'undefined' && url && url !== '#') {
            Calendly.initPopupWidget({ url: url });
        } else if (url && url !== '#') {
            window.open(url, '_blank');
        }
        return false;
    };

    // ==========================================================
    // --- CONNEXION SANITY (BACK-OFFICE) ---
    // ==========================================================
    const PROJECT_ID = 'mq2u95ip';
    const DATASET = 'production';
    const QUERY_URL = `https://${PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${DATASET}?query=`;

    async function fetchSanityData() {
        try {
            // 1. PARAMÈTRES GLOBAUX (Contact & Réseaux)
            const settingsQuery = encodeURIComponent('*[_type == "siteSettings"][0]');
            const settingsRes = await fetch(QUERY_URL + settingsQuery);
            const settingsData = await settingsRes.json();
            
            if (settingsData.result) {
                const s = settingsData.result;
                if(s.phone) {
                    document.querySelectorAll('.contact-item[href^="tel:"]').forEach(el => {
                        el.href = `tel:${s.phone.replace(/\\s/g, '')}`;
                        const span = el.querySelector('span');
                        if(span) span.textContent = s.phone;
                    });
                }
                if(s.instagram) {
                    document.querySelectorAll('.contact-item[href*="instagram"]').forEach(el => el.href = s.instagram);
                }
                if(s.snapchat) {
                    document.querySelectorAll('.contact-item[href*="snapchat"]').forEach(el => el.href = s.snapchat);
                }
                if(s.email) {
                    document.querySelectorAll('.contact-item[href^="mailto:"]').forEach(el => {
                        el.href = `mailto:${s.email}`;
                        const span = el.querySelector('span');
                        if(span) span.textContent = s.email;
                    });
                }
            }

            // 2. PAGE ACCUEIL
            if (document.querySelector('.hero-section')) {
                const homeQuery = encodeURIComponent('*[_type == "homePage"][0]{heroTitle, ctaText, "heroImg": heroImage.asset->url, "avantImg": avantImage.asset->url, "apresImg": apresImage.asset->url}');
                const homeRes = await fetch(QUERY_URL + homeQuery);
                const homeData = await homeRes.json();
                
                if (homeData.result) {
                    const h = homeData.result;
                    if(h.heroTitle) document.querySelector('.hero-title').innerHTML = h.heroTitle.replace(/\\n/g, '<br>');
                    if(h.ctaText) document.querySelector('.hero-section .cta-button').textContent = h.ctaText;
                    if(h.heroImg) document.querySelector('.hero-image-side img').src = h.heroImg;
                    if(h.avantImg) document.querySelector('.img-background').src = h.avantImg;
                    if(h.apresImg) document.querySelector('.img-foreground').src = h.apresImg;
                }
            }

            // 3. PAGE SERVICES
            const servicesGrid = document.querySelector('.services-grid');
            if (servicesGrid && window.location.pathname.includes('services')) {
                const srvQuery = encodeURIComponent('*[_type == "service"] | order(_createdAt asc)');
                const srvRes = await fetch(QUERY_URL + srvQuery);
                const srvData = await srvRes.json();
                
                if (srvData.result && srvData.result.length > 0) {
                    servicesGrid.innerHTML = ''; // Efface les cartes d'origine
                    srvData.result.forEach(srv => {
                        let pricesHtml = '';
                        if(srv.prices) {
                            srv.prices.forEach(p => {
                                pricesHtml += `<div class="price-row"><span>${p.label}</span><span class="dots"></span><span class="price-val">${p.price}</span></div>`;
                            });
                        }
                        const card = document.createElement('div');
                        card.className = `service-card ${srv.theme || 'light-card'}`;
                        if (srv.title && srv.title.toLowerCase().includes('méga')) {
                            card.classList.add('mega-volume');
                        }
                        card.innerHTML = `
                            <h3 class="service-name-center">${srv.title}</h3>
                            <div class="price-list">${pricesHtml}</div>
                            <button onclick="openCalendly('${srv.calendlyLink || '#'}')" class="service-btn">Réserver</button>
                        `;
                        servicesGrid.appendChild(card);
                    });
                    initTiltEffect(); // Relance l'animation 3D sur les nouvelles cartes
                }
            }

            // 4. PAGE RÉALISATIONS (PORTFOLIO)
            const portfolioContainer = document.querySelector('.page-section');
            if (portfolioContainer && window.location.pathname.includes('realisation')) {
                const portQuery = encodeURIComponent('*[_type == "portfolioCategory"] | order(_createdAt asc) {title, "images": images[].asset->url}');
                const portRes = await fetch(QUERY_URL + portQuery);
                const portData = await portRes.json();
                
                if (portData.result && portData.result.length > 0) {
                    document.querySelectorAll('.portfolio-category').forEach(el => el.remove()); // Efface l'ancien
                    
                    portData.result.forEach(cat => {
                        const catDiv = document.createElement('div');
                        catDiv.className = 'portfolio-category';
                        let imgsHtml = '';
                        if(cat.images) {
                            cat.images.forEach(imgUrl => {
                                imgsHtml += `<div class="gallery-item"><img src="${imgUrl}" alt="Réalisation ${cat.title}"></div>`;
                            });
                        }
                        catDiv.innerHTML = `
                            <h3>${cat.title}</h3>
                            <div class="gallery-grid">${imgsHtml}</div>
                        `;
                        portfolioContainer.appendChild(catDiv);
                    });
                    initLightbox(); // Relance le clic d'agrandissement sur les nouvelles images
                }
            }

            // 5. PAGE À PROPOS
            const aboutContainer = document.querySelector('.about-container');
            if (aboutContainer && window.location.pathname.includes('a-propos')) {
                const aboutQuery = encodeURIComponent('*[_type == "aboutPage"][0]{title, paragraphs, "imgUrl": image.asset->url}');
                const aboutRes = await fetch(QUERY_URL + aboutQuery);
                const aboutData = await aboutRes.json();
                
                if (aboutData.result) {
                    const ab = aboutData.result;
                    if(ab.imgUrl) document.querySelector('.about-image-wrapper img').src = ab.imgUrl;
                    if(ab.title) document.querySelector('.about-text h3').textContent = ab.title;
                    
                    if(ab.paragraphs && ab.paragraphs.length > 0) {
                        document.querySelectorAll('.about-text p').forEach(p => p.remove()); // Supprime les anciens textes
                        const aboutTextDiv = document.querySelector('.about-text');
                        const cta = aboutTextDiv.querySelector('.cta-button'); 
                        
                        ab.paragraphs.forEach(pText => {
                            const p = document.createElement('p');
                            p.textContent = pText;
                            aboutTextDiv.insertBefore(p, cta); // Insère le nouveau texte juste au-dessus du bouton
                        });
                    }
                }
            }

        } catch(error) {
            console.error("Erreur de récupération depuis Sanity :", error);
        }
    }

    fetchSanityData();

});