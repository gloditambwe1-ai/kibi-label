document.addEventListener('DOMContentLoaded', () => {

    // ==========================================================
    // --- UTILITAIRES ---
    // ==========================================================

    // Échappe le contenu venu de Sanity avant toute insertion via innerHTML.
    // Sans ça, une simple apostrophe dans un nom de service casse la page.
    const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[c]);

    // Ne laisse passer qu'un code hexadécimal ; toute autre saisie retombe
    // sur la variable de thème, pour ne pas injecter de CSS arbitraire.
    const safeColor = (value, fallback) =>
        /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(String(value ?? '').trim()) ? value.trim() : fallback;

    // Message visible si le back-office ne répond pas, pour ne jamais
    // laisser le visiteur devant une page vide et muette.
    const showLoadingError = () => {
        const containers = [
            document.getElementById('services-container'),
            document.getElementById('guide-container'),
            document.getElementById('portfolio-container')
        ].filter(el => el && !el.dataset.contentLoaded);

        containers.forEach(el => {
            const notice = document.createElement('p');
            notice.className = 'loading-error';
            notice.textContent = "Le contenu n'a pas pu être chargé pour le moment. "
                + "Merci de réessayer dans quelques instants ou de nous joindre au 418-900-1191.";
            el.appendChild(notice);
        });
    };

    // ==========================================================
    // --- NAVIGATION ACTIVE (Garantie 100% Netlify & Local) ---
    // ==========================================================
    
    // On extrait proprement le dernier segment de l'URL en ignorant les slashs finaux (ex: Netlify)
    let pathArray = window.location.pathname.replace(/^\/+|\/+$/g, '').split('/');
    let currentPage = pathArray.pop() || 'index';
    currentPage = currentPage.replace(/\.html$/, '');

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
        let linkHref = link.getAttribute('href');
        
        if (linkHref) {
            // Même nettoyage pour les liens du menu HTML
            let linkArray = linkHref.replace(/^\/+|\/+$/g, '').split('/');
            let cleanLink = linkArray.pop() || 'index';
            cleanLink = cleanLink.replace(/\.html$/, '');

            // Comparaison finale
            if (currentPage === cleanLink) {
                link.classList.add('active');
            }
        }
    });

    // --- MODE SOMBRE ---
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;

    // Le <html> porte déjà la classe si le script d'amorçage du <head> l'a posée
    // (anti-flash) ; on aligne simplement le <body>, ciblé par le CSS.
    const isDarkStored = document.documentElement.classList.contains('dark-mode')
        || localStorage.getItem('theme') === 'dark';

    const applyTheme = (isDark) => {
        body.classList.toggle('dark-mode', isDark);
        document.documentElement.classList.toggle('dark-mode', isDark);
        if (themeIcon) {
            themeIcon.classList.toggle('fa-sun', isDark);
            themeIcon.classList.toggle('fa-moon', !isDark);
        }
        if (themeToggle) themeToggle.setAttribute('aria-pressed', String(isDark));
    };

    applyTheme(isDarkStored);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDark = !body.classList.contains('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            applyTheme(isDark);
        });
    }

    // ==========================================================
    // --- LAZY LOADING GLOBAL (Intersection Observer) ---
    // ==========================================================
    function initLazyScrollReveal() {
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
        if(menuOpen) menuOpen.setAttribute('aria-expanded', String(show));
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
                    // Chargement de l'image Haute Définition stockée dans l'attribut data-full-res
                    lightboxImg.src = img.getAttribute('data-full-res') || img.src;
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
    // --- GESTION MODAL DE POLITIQUE DE RENDEZ-VOUS ---
    // ==========================================================
    let targetCalendlyUrl = '#';

    window.triggerPolicyModal = (url) => {
        const modal = document.getElementById('policy-modal');
        const checkbox = document.getElementById('policy-checkbox');
        const nextBtn = document.getElementById('policy-next-btn');
        
        if (modal) {
            targetCalendlyUrl = url;
            if (checkbox) checkbox.checked = false;
            if (nextBtn) nextBtn.disabled = true;
            
            modal.classList.add('active');
            modal.style.display = 'flex';
        }
    };

    // Délégation d'événement : les boutons « Réserver » sont créés dynamiquement,
    // et cette approche évite les gestionnaires onclick inline (requis pour la CSP).
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-calendly]');
        if (btn) {
            e.preventDefault();
            window.triggerPolicyModal(btn.getAttribute('data-calendly'));
        }
    });

    const policyModal = document.getElementById('policy-modal');
    const policyClose = document.getElementById('policy-modal-close');
    const policyCheckbox = document.getElementById('policy-checkbox');
    const policyNextBtn = document.getElementById('policy-next-btn');

    if (policyClose && policyModal) {
        policyClose.onclick = () => {
            policyModal.classList.remove('active');
            setTimeout(() => { policyModal.style.display = 'none'; }, 400);
        };
    }

    if (policyCheckbox && policyNextBtn) {
        policyCheckbox.addEventListener('change', (e) => {
            policyNextBtn.disabled = !e.target.checked;
        });
    }

    if (policyNextBtn) {
        policyNextBtn.onclick = () => {
            if (policyModal) {
                policyModal.classList.remove('active');
                setTimeout(() => { policyModal.style.display = 'none'; }, 400);
            }
            window.openCalendly(targetCalendlyUrl);
        };
    }

    // ==========================================================
    // --- CONNEXION SANITY (BACK-OFFICE) ---
    // ==========================================================
    const PROJECT_ID = 'mq2u95ip';
    const DATASET = 'production';
    const QUERY_URL = `https://${PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${DATASET}?query=`;

    const sanityFetch = async (query) => {
        const res = await fetch(QUERY_URL + encodeURIComponent(query));
        if (!res.ok) throw new Error(`Sanity a répondu ${res.status}`);
        return (await res.json()).result;
    };

    async function fetchSanityData() {
        // Les requêtes utiles à la page courante sont lancées d'un bloc :
        // en série, chaque page attendait inutilement la précédente.
        const path = window.location.pathname;
        const heroSection = document.querySelector('.hero-section');
        const servicesContainer = document.getElementById('services-container');
        const guideContainer = document.getElementById('guide-container');
        const portfolioContainer = document.getElementById('portfolio-container');
        const aboutContainer = document.querySelector('.about-container');

        const wantsServices = servicesContainer && path.includes('services');
        const wantsGuide = guideContainer && path.includes('guide');
        const wantsPortfolio = portfolioContainer && path.includes('realisation');
        const wantsAbout = aboutContainer && path.includes('a-propos');

        const settingsPromise = sanityFetch('*[_type == "siteSettings"][0]{phone, email, instagram, snapchat, tiktok, "policyImg": appointmentPolicy.asset->url}');
        const homePromise = heroSection
            ? sanityFetch('*[_type == "homePage"][0]{heroTitle, ctaText, "heroImg": heroImage.asset->url, "avantImg": avantImage.asset->url, "apresImg": apresImage.asset->url}')
            : null;
        const servicesPromise = wantsServices
            ? sanityFetch('*[_type == "serviceCategory"] | order(_createdAt asc) {title, calendlyLink, colorStyle, customBgColor, customTextColor, subServices[]{name, price, subSubServices[]{name, price}}}')
            : null;
        const guidePromise = wantsGuide
            ? sanityFetch('*[_type == "serviceGuide"] | order(coalesce(order, 9999) asc, _createdAt asc) {title, intro, "mainImg": mainImage.asset->url, subSections[]{name, description, "img": image.asset->url}}')
            : null;
        const portfolioPromise = wantsPortfolio
            ? sanityFetch('*[_type == "portfolioCategory"] | order(_createdAt asc) {title, "images": images[].asset->url}')
            : null;
        const aboutPromise = wantsAbout
            ? sanityFetch('*[_type == "aboutPage"][0]{title, paragraphs, "imgUrl": image.asset->url}')
            : null;

        // Évite un « unhandled rejection » si une requête échoue avant son await.
        [homePromise, servicesPromise, guidePromise, portfolioPromise, aboutPromise]
            .forEach(p => p && p.catch(() => {}));

        try {
            // 1. PARAMÈTRES GLOBAUX
            const settingsResult = await settingsPromise;

            if (settingsResult) {
                const s = settingsResult;
                if(s.phone) {
                    let displayPhone = s.phone;
                    let digits = s.phone.replace(/\D/g, ''); 
                    if(digits.length === 10) {
                        displayPhone = `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
                    }

                    document.querySelectorAll('.contact-item[href^="tel:"]').forEach(el => {
                        el.href = `tel:+1${digits}`; 
                        const span = el.querySelector('span');
                        if(span) span.textContent = displayPhone;
                    });
                }
                if(s.instagram) {
                    document.querySelectorAll('.contact-item[href*="instagram"]').forEach(el => el.href = s.instagram);
                }
                if(s.snapchat) {
                    document.querySelectorAll('.contact-item[href*="snapchat"]').forEach(el => el.href = s.snapchat);
                }
                if(s.tiktok) {
                    document.querySelectorAll('.contact-item[href*="tiktok"]').forEach(el => el.href = s.tiktok);
                }
                if(s.policyImg) {
                    const modalImg = document.getElementById('policy-modal-img');
                    // Optimisation de l'image de la politique (largeur 800px)
                    if (modalImg) modalImg.src = `${s.policyImg}?auto=format&q=80&w=800`;
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
            if (homePromise) {
                const h = await homePromise;

                if (h) {
                    const heroTitleEl = document.querySelector('.hero-title');
                    const heroCtaEl = document.querySelector('.hero-section .cta-button');

                    if(h.heroTitle && heroTitleEl) {
                        // Seul le saut de ligne est autorisé : le reste est échappé.
                        heroTitleEl.innerHTML = escapeHtml(h.heroTitle).replace(/\\n/g, '<br>');
                    }
                    if(h.ctaText && heroCtaEl) heroCtaEl.textContent = h.ctaText;

                    if(h.heroImg) {
                        const img = document.querySelector('.hero-image-side img');
                        if (img) {
                            // Suppression de l'attribut lazy pour un chargement immédiat (LCP)
                            img.removeAttribute('loading');
                            // Optimisation à 1200px de large
                            img.src = `${h.heroImg}?auto=format&q=80&w=1200`;
                        }
                    }
                    if(h.avantImg) {
                        const img = document.querySelector('.img-background');
                        if (img) img.src = `${h.avantImg}?auto=format&q=80&w=1200`;
                    }
                    if(h.apresImg) {
                        const img = document.querySelector('.img-foreground');
                        if (img) img.src = `${h.apresImg}?auto=format&q=80&w=1200`;
                    }
                }
            }

            // 3. PAGE SERVICES
            const pageHeader = document.getElementById('dynamic-page-header');

            if (servicesPromise) {
                const categories = await servicesPromise;

                if (categories && categories.length > 0) {
                    servicesContainer.dataset.contentLoaded = 'true';

                    const renderCategories = () => {
                        if(pageHeader) {
                            pageHeader.innerHTML = `
                                <h2 class="page-title">Nos services</h2>
                                <p class="page-subtitle">Sélectionnez une catégorie pour voir les prestations</p>
                            `;
                        }
                        
                        if (window.location.hash === '#prestation') {
                            history.replaceState(null, '', window.location.pathname);
                        }

                        servicesContainer.innerHTML = '<div class="services-grid" id="main-categories-grid"></div>';
                        const grid = document.getElementById('main-categories-grid');

                        categories.forEach((cat) => {
                            let themeClass = 'service-card';
                            let inlineStyle = '';
                            
                            if (cat.colorStyle === 'peche') {
                                themeClass += ' light-card';
                            } else if (cat.colorStyle === 'custom') {
                                inlineStyle = `background-color: ${safeColor(cat.customBgColor, 'var(--creme)')}; color: ${safeColor(cat.customTextColor, 'var(--noir-profond)')}; border: 2px solid rgba(189,106,89,0.2);`;
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
                                <h3 style="font-family: 'Playfair Display', serif; font-size: 26px; text-align: center; margin-bottom: 10px;">${escapeHtml(cat.title)}</h3>
                                <div style="font-family: 'Montserrat', sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; border-bottom: 1px solid currentColor; padding-bottom: 2px; opacity: 0.8;">
                                    Voir les prestations
                                </div>
                            `;
                            
                            catCard.onclick = () => {
                                history.pushState({ view: 'subServices' }, '', window.location.pathname + '#prestation');
                                renderSubServices(cat);
                            };
                            grid.appendChild(catCard);
                        });
                        
                        initLazyScrollReveal();
                    };

                    const renderSubServices = (cat) => {
                        if(pageHeader) {
                            pageHeader.innerHTML = `
                                <button type="button" id="btn-back-categories" class="back-btn">
                                    <i class="fa-solid fa-arrow-left"></i> Retour aux catégories
                                </button>
                                <h2 class="page-title">${escapeHtml(cat.title)}</h2>
                                <p class="page-subtitle">Sélectionnez votre prestation pour réserver</p>
                            `;
                            
                            document.getElementById('btn-back-categories').addEventListener('click', (e) => {
                                e.preventDefault();
                                if (window.location.hash === '#prestation') {
                                    history.back();
                                } else {
                                    renderCategories();
                                }
                            });
                        }

                        servicesContainer.innerHTML = '<div class="sub-services-grid" id="sub-services-grid"></div>';
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
                                    cardStyle = `background-color: ${safeColor(cat.customBgColor, 'var(--creme)')}; color: ${safeColor(cat.customTextColor, 'var(--noir-profond)')}; border: 2px solid rgba(189,106,89,0.2);`;

                                    if (cat.customTextColor === '#ffffff') {
                                        btnStyle = `background: #ffffff; color: ${safeColor(cat.customBgColor, 'var(--terracotta)')}; border: none;`;
                                    } else {
                                        btnStyle = `background: ${safeColor(cat.customBgColor, 'var(--terracotta)')}; color: #ffffff; border: none;`;
                                    }
                                } else {
                                    themeClass += ' dark-card';
                                }

                                const subCard = document.createElement('div');
                                subCard.className = themeClass;
                                if (cardStyle) subCard.setAttribute('style', cardStyle);
                                
                                if (sub.subSubServices && sub.subSubServices.length > 0) {
                                    let subSubHtml = `<h3 style="text-align:center; margin-bottom:20px; font-family: 'Playfair Display', serif;">${escapeHtml(sub.name)}</h3>`;
                                    
                                    subSubHtml += `<div class="sub-sub-list-container">`;
                                    
                                    sub.subSubServices.forEach((subSub, index, array) => {
                                        if (subSub.name) {
                                            const isLast = index === array.length - 1;
                                            const borderStyle = isLast ? '' : 'border-bottom: 1px solid rgba(189,106,89,0.15); padding-bottom: 15px;';
                                            
                                            subSubHtml += `
                                                <div style="${borderStyle} display: flex; flex-direction: column; gap: 10px;">
                                                    <div class="price-row">
                                                        <span class="service-name" style="font-weight: 500;">${escapeHtml(subSub.name)}</span>
                                                        <span class="dots"></span>
                                                        <span class="price-amount">${escapeHtml(subSub.price || 'Sur devis')}</span>
                                                        <button type="button" data-calendly="${escapeHtml(cat.calendlyLink || '#')}" class="service-btn service-btn-small" ${btnStyle ? `style="${btnStyle}"` : ''}>Réserver</button>
                                                    </div>
                                                </div>
                                            `;
                                        }
                                    });
                                    
                                    subSubHtml += `</div>`;
                                    subCard.innerHTML = subSubHtml;
                                } else {
                                    subCard.innerHTML = `
                                        <h3 style="text-align:center; margin-bottom:20px; font-family: 'Playfair Display', serif;">${escapeHtml(sub.name)}</h3>
                                        <div class="price-list">
                                            <div class="price-row">
                                                <span class="service-name">Prestation</span>
                                                <span class="dots"></span>
                                                <span class="price-amount">${escapeHtml(sub.price || 'Sur devis')}</span>
                                                <button type="button" data-calendly="${escapeHtml(cat.calendlyLink || '#')}" class="service-btn service-btn-small" ${btnStyle ? `style="${btnStyle}"` : ''}>Réserver</button>
                                            </div>
                                        </div>
                                    `;
                                }
                                
                                grid.appendChild(subCard);
                            });
                            
                            initLazyScrollReveal();
                        } else {
                            grid.innerHTML = `<p style="text-align: center; width: 100%; font-family: 'Montserrat', sans-serif;">Aucune prestation disponible pour le moment.</p>`;
                        }
                    };

                    window.addEventListener('popstate', (event) => {
                        if (window.location.hash !== '#prestation') {
                            renderCategories();
                        }
                    });

                    if (window.location.hash === '#prestation') {
                        history.replaceState(null, '', window.location.pathname);
                    }

                    renderCategories();
                } else {
                    servicesContainer.innerHTML =
                        '<p class="empty-state">Aucun service n\'est publié pour le moment.</p>';
                    servicesContainer.dataset.contentLoaded = 'true';
                }
            }

            // 3bis. PAGE GUIDE DES SOINS
            if (guidePromise) {
                const guideCategories = await guidePromise;
                guideContainer.dataset.contentLoaded = 'true';

                // On ne garde que ce qui a réellement quelque chose à expliquer :
                // une intro/photo de soin, ou des sous-sections décrites/illustrées.
                const renderableCategories = (guideCategories || []).map(cat => {
                    const items = (cat.subSections || []).filter(sub => sub.name && (sub.description || sub.img));
                    return { ...cat, items };
                }).filter(cat => cat.intro || cat.mainImg || cat.items.length > 0);

                if (renderableCategories.length > 0) {
                    renderableCategories.forEach(cat => {
                        const article = document.createElement('article');
                        article.className = 'guide-category reveal-on-scroll';

                        const coverHtml = cat.mainImg
                            ? `<img class="guide-category-cover" src="${escapeHtml(cat.mainImg)}?auto=format&q=80&w=1200" alt="${escapeHtml(cat.title)}" loading="lazy">`
                            : '';
                        const introHtml = cat.intro
                            ? `<p class="guide-category-intro">${escapeHtml(cat.intro)}</p>`
                            : '';

                        let itemsHtml = '';
                        cat.items.forEach((sub, index) => {
                            const hasImg = Boolean(sub.img);
                            const mediaHtml = hasImg
                                ? `<div class="guide-item-media"><img src="${escapeHtml(sub.img)}?auto=format&q=80&w=800" alt="${escapeHtml(sub.name)}" loading="lazy"></div>`
                                : '';
                            // Alternance gauche/droite pour les blocs illustrés.
                            const reversed = hasImg && index % 2 === 1 ? ' reversed' : '';
                            const noMedia = hasImg ? '' : ' no-media';
                            const descHtml = sub.description
                                ? `<p>${escapeHtml(sub.description)}</p>`
                                : '';

                            itemsHtml += `
                                <div class="guide-item${reversed}${noMedia}">
                                    ${mediaHtml}
                                    <div class="guide-item-text">
                                        <h4>${escapeHtml(sub.name)}</h4>
                                        ${descHtml}
                                    </div>
                                </div>
                            `;
                        });

                        article.innerHTML = `
                            <div class="guide-category-head">
                                ${coverHtml}
                                <h3 class="guide-category-title">${escapeHtml(cat.title)}</h3>
                                ${introHtml}
                            </div>
                            ${itemsHtml ? `<div class="guide-items">${itemsHtml}</div>` : ''}
                        `;
                        guideContainer.appendChild(article);
                    });

                    const cta = document.createElement('div');
                    cta.className = 'guide-cta';
                    cta.innerHTML = `<a href="/services" class="cta-button">Voir les tarifs et réserver</a>`;
                    guideContainer.appendChild(cta);

                    initLazyScrollReveal();
                } else {
                    guideContainer.innerHTML =
                        '<p class="empty-state">Le guide des soins sera disponible très prochainement.</p>';
                }
            }

            // 4. PAGE RÉALISATIONS
            if (portfolioPromise) {
                const portfolioCategories = await portfolioPromise;
                // Une catégorie sans photo n'afficherait qu'un titre suivi du vide.
                const filledCategories = (portfolioCategories || [])
                    .filter(cat => cat.images && cat.images.length > 0);

                portfolioContainer.dataset.contentLoaded = 'true';

                if (filledCategories.length > 0) {
                    document.querySelectorAll('.portfolio-category').forEach(el => el.remove());

                    filledCategories.forEach(cat => {
                        const catDiv = document.createElement('div');
                        catDiv.className = 'portfolio-category';
                        let imgsHtml = '';
                        {
                            cat.images.forEach(imgUrl => {
                                // Génération des deux formats : miniature allégée (w=600) et Full HD pour la lightbox (w=1600)
                                const thumbnail = `${imgUrl}?auto=format&q=80&w=600`;
                                const fullRes = `${imgUrl}?auto=format&q=80&w=1600`;
                                imgsHtml += `<div class="gallery-item"><img src="${escapeHtml(thumbnail)}" data-full-res="${escapeHtml(fullRes)}" alt="Réalisation ${escapeHtml(cat.title)}" loading="lazy"></div>`;
                            });
                        }
                        catDiv.innerHTML = `
                            <h3>${escapeHtml(cat.title)}</h3>
                            <div class="gallery-grid">${imgsHtml}</div>
                        `;
                        portfolioContainer.appendChild(catDiv);
                    });
                    initLightbox();
                    initLazyScrollReveal();
                } else {
                    const notice = document.createElement('p');
                    notice.className = 'empty-state';
                    notice.textContent = 'Nos réalisations seront publiées très prochainement. '
                        + 'En attendant, retrouvez notre travail sur Instagram.';
                    portfolioContainer.appendChild(notice);
                }
            }

            // 5. PAGE À PROPOS
            if (aboutPromise) {
                const ab = await aboutPromise;

                if (ab) {
                    if(ab.imgUrl) {
                        const img = document.querySelector('.about-image-wrapper img');
                        if (img) img.src = `${ab.imgUrl}?auto=format&q=80&w=800`;
                    }

                    const aboutHeading = document.querySelector('.about-text h3');
                    if(ab.title && aboutHeading) aboutHeading.textContent = ab.title;

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
            // Le contenu statique de secours reste affiché ; on prévient
            // seulement là où la page dépendait entièrement du back-office.
            showLoadingError();
        }
    }

    fetchSanityData();

});