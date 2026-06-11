document.addEventListener('DOMContentLoaded', () => {
    
    console.log("Kibi Label - Connecté à Sanity !");

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

    async function fetchSanityData() {
        try {
            // 1. PARAMÈTRES GLOBAUX
            const settingsQuery = encodeURIComponent('*[_type == "siteSettings"][0]{phone, email, instagram, snapchat, tiktok, "policyImg": appointmentPolicy.asset->url}');
            const settingsRes = await fetch(QUERY_URL + settingsQuery);
            const settingsData = await settingsRes.json();
            
            if (settingsData.result) {
                const s = settingsData.result;
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
                        // Suppression de l'attribut lazy pour un chargement immédiat (LCP)
                        img.removeAttribute('loading');
                        // Optimisation à 1200px de large
                        img.src = `${h.heroImg}?auto=format&q=80&w=1200`;
                    }
                    if(h.avantImg) {
                        const img = document.querySelector('.img-background');
                        img.loading = "lazy";
                        img.src = `${h.avantImg}?auto=format&q=80&w=1200`;
                    }
                    if(h.apresImg) {
                        const img = document.querySelector('.img-foreground');
                        img.loading = "lazy";
                        img.src = `${h.apresImg}?auto=format&q=80&w=1200`;
                    }
                }
            }

            // 3. PAGE SERVICES
            const servicesContainer = document.getElementById('services-container');
            const pageHeader = document.getElementById('dynamic-page-header');
            
            if (servicesContainer && window.location.pathname.includes('services')) {
                const srvQuery = encodeURIComponent('*[_type == "serviceCategory"] | order(_createdAt asc) {title, colorStyle, customBgColor, customTextColor, subServices[]{name, price, calendlyLink, subSubServices[]{name, price, calendlyLink}}}');
                const srvRes = await fetch(QUERY_URL + srvQuery);
                const srvData = await srvRes.json();
                
                if (srvData.result && srvData.result.length > 0) {
                    const categories = srvData.result;

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
                                <h2 class="page-title">${cat.title}</h2>
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
                                
                                if (sub.subSubServices && sub.subSubServices.length > 0) {
                                    let subSubHtml = `<h3 style="text-align:center; margin-bottom:20px; font-family: 'Playfair Display', serif;">${sub.name}</h3>`;
                                    
                                    subSubHtml += `<div class="sub-sub-list-container">`;
                                    
                                    sub.subSubServices.forEach((subSub, index, array) => {
                                        if (subSub.name) {
                                            const isLast = index === array.length - 1;
                                            const borderStyle = isLast ? '' : 'border-bottom: 1px solid rgba(189,106,89,0.15); padding-bottom: 15px;';
                                            
                                            subSubHtml += `
                                                <div style="${borderStyle} display: flex; flex-direction: column; gap: 10px;">
                                                    <div class="price-row">
                                                        <span class="service-name" style="font-weight: 500;">${subSub.name}</span>
                                                        <span class="dots"></span>
                                                        <div class="price-action">
                                                            <span class="price-amount">${subSub.price || 'Sur devis'}</span>
                                                            <button onclick="triggerPolicyModal('${subSub.calendlyLink || '#'}')" class="service-btn service-btn-small" ${btnStyle ? `style="${btnStyle}"` : ''}>Réserver</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            `;
                                        }
                                    });
                                    
                                    subSubHtml += `</div>`;
                                    subCard.innerHTML = subSubHtml;
                                } else {
                                    subCard.innerHTML = `
                                        <h3 style="text-align:center; margin-bottom:20px; font-family: 'Playfair Display', serif;">${sub.name}</h3>
                                        <div class="price-list">
                                            <div class="price-row">
                                                <span class="service-name">Prestation</span>
                                                <span class="dots"></span>
                                                <div class="price-action">
                                                    <span class="price-amount">${sub.price || 'Sur devis'}</span>
                                                    <button onclick="triggerPolicyModal('${sub.calendlyLink || '#'}')" class="service-btn service-btn-small" ${btnStyle ? `style="${btnStyle}"` : ''}>Réserver</button>
                                                </div>
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
                                // Génération des deux formats : miniature allégée (w=600) et Full HD pour la lightbox (w=1600)
                                const thumbnail = `${imgUrl}?auto=format&q=80&w=600`;
                                const fullRes = `${imgUrl}?auto=format&q=80&w=1600`;
                                imgsHtml += `<div class="gallery-item"><img src="${thumbnail}" data-full-res="${fullRes}" alt="Réalisation ${cat.title}" loading="lazy"></div>`;
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
                        // Optimisation à 800px pour la page à propos
                        img.src = `${ab.imgUrl}?auto=format&q=80&w=800`;
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