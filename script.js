document.addEventListener('DOMContentLoaded', () => {
    
    console.log("Kibi Label - Connecté à Sanity !");

    // ==========================================================
    // --- NAVIGATION ACTIVE (Garantie 100% Netlify & Local) ---
    // ==========================================================
    
    // 1. On récupère le chemin de la page actuelle et on retire le slash final
    let currentPath = window.location.pathname.replace(/\/$/, '');
    
    // 2. Si on est sur la page d'accueil (chemin vide), on force le nom "index"
    if (currentPath === '') {
        currentPath = '/index';
    }
    
    // 3. On nettoie l'extension .html si elle est présente (pour le local)
    currentPath = currentPath.replace('.html', '');

    // 4. On compare avec chaque lien du menu
    document.querySelectorAll('.nav-links a').forEach(link => {
        
        // On récupère le chemin absolu du bouton cliqué
        let linkPath = new URL(link.href).pathname.replace(/\/$/, '');
        
        if (linkPath === '') {
            linkPath = '/index';
        }
        
        linkPath = linkPath.replace('.html', '');

        // 5. Comparaison stricte
        if (currentPath === linkPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
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

    // ==========================================================
    // --- TRANSITIONS DE PAGES & SÉCURITÉ BOUTON RETOUR ---
    // ==========================================================
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

    window.addEventListener('pageshow', (event) => {
        const overlayReset = document.getElementById('page-transition');
        if (overlayReset) {
            overlayReset.classList.remove('is-leaving');
            overlayReset.classList.add('is-loaded');
        }
    });

    // ==========================================================
    // --- LAZY LOADING GLOBAL (Intersection Observer) ---
    // ==========================================================
    function initLazyScrollReveal() {
        // Nettoyage de la référence à l'ancien conteneur Instagram
        const elementsToReveal = document.querySelectorAll('.reveal-on-scroll, .service-card, .portfolio-category');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.1
        });

        elementsToReveal.forEach(el => {
            el.classList.add('reveal-on-scroll');
            observer.observe(el);
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
            // 1. PARAMÈTRES GLOBAUX
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
                    
                    const contactForm = document.getElementById('contact-form');
                    const nextUrlInput = document.getElementById('form-next-url');
                    if (contactForm) {
                        contactForm.action = `https://formsubmit.co/${s.email}`;
                        if (nextUrlInput) {
                            nextUrlInput.value = window.location.href;
                        }
                    }
                }
            }

            // 2. PAGE ACCUEIL
            const heroSection = document.querySelector('.hero-section');
            if (heroSection) {
                const homeQuery = encodeURIComponent('*[_type == "homePage"][0]{heroTitle, ctaText, "heroImg": heroImage.asset->url, "avantImg": avantImage.asset->url, "apresImg": apresImage.asset->url}');
                const homeRes = await fetch(QUERY_URL + homeQuery);
                const homeData = await homeRes.json();
                
                if (homeData.result) {
                    const h = homeData.result;
                    if(h.heroTitle) document.querySelector('.hero-title').innerHTML = h.heroTitle.replace(/\\n/g, '<br>');
                    if(h.ctaText) document.querySelector('.hero-section .cta-button').textContent = h.ctaText;
                    
                    if(h.heroImg) {
                        const img = document.querySelector('.hero-image-side img');
                        img.loading = "lazy";
                        img.src = h.heroImg;
                    }
                    if(h.avantImg) {
                        const img = document.querySelector('.img-background');
                        img.loading = "lazy";
                        img.src = h.avantImg;
                    }
                    if(h.apresImg) {
                        const img = document.querySelector('.img-foreground');
                        img.loading = "lazy";
                        img.src = h.apresImg;
                    }
                }
            }

            // 3. PAGE SERVICES
            const servicesContainer = document.getElementById('services-container');
            const pageHeader = document.getElementById('dynamic-page-header');
            
            if (servicesContainer && window.location.pathname.includes('services')) {
                const srvQuery = encodeURIComponent('*[_type == "serviceCategory"] | order(_createdAt asc) {title, colorStyle, customBgColor, customTextColor, subServices[]{name, price, calendlyLink}}');
                const srvRes = await fetch(QUERY_URL + srvQuery);
                const srvData = await srvRes.json();
                
                if (srvData.result && srvData.result.length > 0) {
                    const categories = srvData.result;

                    const renderCategories = () => {
                        if(pageHeader) {
                            pageHeader.innerHTML = `
                                <h2 class="page-title">Nos tarifs</h2>
                                <p class="page-subtitle">Sélectionnez une catégorie pour voir les prestations</p>
                            `;
                        }
                        
                        servicesContainer.innerHTML = '<div class="services-grid" id="main-categories-grid"></div>';
                        const grid = document.getElementById('main-categories-grid');

                        categories.forEach((cat) => {
                            let themeClass = 'service-card';
                            let inlineStyle = '';
                            
                            if (cat.colorStyle === 'peche') {
                                themeClass += ' light-card';
                            } else if (cat.colorStyle === 'custom') {
                                inlineStyle = `background-color: ${cat.customBgColor || 'var(--creme)'}; color: ${cat.customTextColor || 'var(--noir-profond)'}; border: 2px solid rgba(189,106,89,0.2);`;
                            } else {
                                themeClass += ' dark-card'; 
                            }

                            const catCard = document.createElement('div');
                            catCard.className = themeClass;
                            if (inlineStyle) catCard.setAttribute('style', inlineStyle);
                            
                            catCard.style.cursor = 'pointer';
                            catCard.style.display = 'flex';
                            catCard.style.flexDirection = 'column';
                            catCard.style.justifyContent = 'center';
                            catCard.style.alignItems = 'center';
                            catCard.style.minHeight = '180px';
                            
                            catCard.innerHTML = `
                                <h3 style="font-family: 'Playfair Display', serif; font-size: 26px; text-align: center; margin-bottom: 10px;">${cat.title}</h3>
                                <div style="font-family: 'Montserrat', sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; border-bottom: 1px solid currentColor; padding-bottom: 2px; opacity: 0.8;">
                                    Voir les prestations
                                </div>
                            `;
                            
                            catCard.onclick = () => renderSubServices(cat);
                            grid.appendChild(catCard);
                        });
                        
                        initLazyScrollReveal();
                    };

                    const renderSubServices = (cat) => {
                        if(pageHeader) {
                            pageHeader.innerHTML = `
                                <button type="button" id="btn-back-categories" style="background:none; border:none; color: inherit; font-family: 'Montserrat', sans-serif; font-size: 14px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; margin-bottom: 15px; opacity: 0.7; transition: opacity 0.3s;">
                                    <i class="fa-solid fa-arrow-left"></i> Retour
                                </button>
                                <h2 class="page-title">${cat.title}</h2>
                                <p class="page-subtitle">Sélectionnez votre prestation pour réserver</p>
                            `;
                            
                            document.getElementById('btn-back-categories').addEventListener('click', (e) => {
                                e.preventDefault();
                                renderCategories();
                            });
                        }

                        servicesContainer.innerHTML = '<div class="services-grid" id="sub-services-grid"></div>';
                        const grid = document.getElementById('sub-services-grid');

                        const validSubs = cat.subServices ? cat.subServices.filter(sub => sub.name) : [];

                        if (validSubs.length > 0) {
                            validSubs.forEach((sub) => {
                                let themeClass = 'service-card';
                                let cardStyle = '';
                                let btnStyle = '';
                                
                                if (cat.colorStyle === 'peche') {
                                    themeClass += ' light-card';
                                } else if (cat.colorStyle === 'custom') {
                                    cardStyle = `background-color: ${cat.customBgColor || 'var(--creme)'}; color: ${cat.customTextColor || 'var(--noir-profond)'}; border: 2px solid rgba(189,106,89,0.2);`;
                                    
                                    if (cat.customTextColor === '#ffffff') {
                                        btnStyle = `background: #ffffff; color: ${cat.customBgColor || 'var(--terracotta)'}; border: none;`;
                                    } else {
                                        btnStyle = `background: ${cat.customBgColor || 'var(--terracotta)'}; color: #ffffff; border: none;`;
                                    }
                                } else {
                                    themeClass += ' dark-card';
                                }

                                const subCard = document.createElement('div');
                                subCard.className = themeClass;
                                if (cardStyle) subCard.setAttribute('style', cardStyle);
                                
                                subCard.innerHTML = `
                                    <h3 style="text-align:center; margin-bottom:20px;">${sub.name}</h3>
                                    <div class="price-list">
                                        <div class="price-row">
                                            <span>Prestation</span>
                                            <span class="dots"></span>
                                            <span>${sub.price || 'Sur devis'}</span>
                                        </div>
                                    </div>
                                    <button onclick="openCalendly('${sub.calendlyLink || '#'}')" class="service-btn" ${btnStyle ? `style="${btnStyle}"` : ''}>Réserver</button>
                                `;
                                grid.appendChild(subCard);
                            });
                            
                            initLazyScrollReveal();
                        } else {
                            grid.innerHTML = `<p style="text-align: center; width: 100%; font-family: 'Montserrat', sans-serif;">Aucune prestation disponible pour le moment.</p>`;
                        }
                    };

                    renderCategories();
                }
            }

            // 4. PAGE RÉALISATIONS
            const portfolioContainer = document.querySelector('.page-section');
            if (portfolioContainer && window.location.pathname.includes('realisation')) {
                const portQuery = encodeURIComponent('*[_type == "portfolioCategory"] | order(_createdAt asc) {title, "images": images[].asset->url}');
                const portRes = await fetch(QUERY_URL + portQuery);
                const portData = await portRes.json();
                
                if (portData.result && portData.result.length > 0) {
                    document.querySelectorAll('.portfolio-category').forEach(el => el.remove());
                    
                    portData.result.forEach(cat => {
                        const catDiv = document.createElement('div');
                        catDiv.className = 'portfolio-category';
                        let imgsHtml = '';
                        if(cat.images) {
                            cat.images.forEach(imgUrl => {
                                imgsHtml += `<div class="gallery-item"><img src="${imgUrl}" alt="Réalisation ${cat.title}" loading="lazy"></div>`;
                            });
                        }
                        catDiv.innerHTML = `
                            <h3>${cat.title}</h3>
                            <div class="gallery-grid">${imgsHtml}</div>
                        `;
                        portfolioContainer.appendChild(catDiv);
                    });
                    initLightbox();
                    initLazyScrollReveal();
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
                    if(ab.imgUrl) {
                        const img = document.querySelector('.about-image-wrapper img');
                        img.loading = "lazy";
                        img.src = ab.imgUrl;
                    }
                    if(ab.title) document.querySelector('.about-text h3').textContent = ab.title;
                    
                    if(ab.paragraphs && ab.paragraphs.length > 0) {
                        document.querySelectorAll('.about-text p').forEach(p => p.remove());
                        const aboutTextDiv = document.querySelector('.about-text');
                        const cta = aboutTextDiv.querySelector('.cta-button'); 
                        
                        ab.paragraphs.forEach(pText => {
                            const p = document.createElement('p');
                            p.textContent = pText;
                            aboutTextDiv.insertBefore(p, cta);
                        });
                    }
                    initLazyScrollReveal();
                }
            }

            initLazyScrollReveal();

        } catch(error) {
            console.error("Erreur de récupération depuis Sanity :", error);
        }
    }

    fetchSanityData();

});