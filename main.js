document.addEventListener('DOMContentLoaded', () => {
    // 1. Scroll-triggered fade-in animations
    const fadeElements = document.querySelectorAll('.fade-in, .fade-in-left');
    
    // Apply staggered delays
    const staggerChildren = document.querySelectorAll('[data-delay]');
    staggerChildren.forEach(el => {
        el.style.transitionDelay = `${el.dataset.delay}ms`;
    });

    const fadeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Run once
            }
        });
    }, {
        threshold: 0.1
    });

    fadeElements.forEach(el => fadeObserver.observe(el));


    // 7. Mobile menu toggle (declared early so smooth scroll can reference it)
    const navHamburger = document.querySelector('.nav_hamburger');
    const navMenu = document.querySelector('.nav_links');

    if (navHamburger && navMenu) {
        navHamburger.addEventListener('click', () => {
            navMenu.classList.toggle('is-open');
            navHamburger.classList.toggle('is-active');
        });
    }

    // 2. Smooth scroll for navigation links & close menu on link click
    const navLinks = document.querySelectorAll('nav a[href^="#"], .nav a[href^="#"]');
    const headerOffset = 80;

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (navMenu && navMenu.classList.contains('is-open')) {
                    navMenu.classList.remove('is-open');
                }
            }
        });
    });


    // 3. Navbar background on scroll (ultra-lightweight boolean check)
    const nav = document.querySelector('.nav');
    let isScrolled = false;
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY > 40;
        if (scrolled !== isScrolled) {
            isScrolled = scrolled;
            if (nav) nav.classList.toggle('scrolled', isScrolled);
        }
    }, { passive: true });

    // 4. Active nav link highlighting using IntersectionObserver (Zero layout thrashing!)
    const sections = document.querySelectorAll('section[id]');
    if (sections.length > 0) {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
                    });
                }
            });
        }, {
            rootMargin: '-20% 0px -70% 0px'
        });

        sections.forEach(section => sectionObserver.observe(section));
    }

    // 5. Counter animation for the speed section
    const counterElements = document.querySelectorAll('.speed_card-metric[data-count]');
    const speedSection = document.querySelector('.speed');
    let countersAnimated = false;
    
    // easeOutExpo timing function
    const easeOutExpo = (t) => {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    };

    const animateCounter = (el) => {
        const targetValue = parseFloat(el.getAttribute('data-count'));
        if (isNaN(targetValue)) return;

        const duration = 1800;
        let startTime = null;

        const updateCounter = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutExpo(progress);
            
            // Format with wpm suffix
            el.innerText = Math.round(targetValue * easedProgress) + ' wpm';

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                el.innerText = targetValue + ' wpm'; // Ensure exact final value
            }
        };

        requestAnimationFrame(updateCounter);
    };

    const triggerAllCounters = () => {
        if (countersAnimated) return;
        countersAnimated = true;
        counterElements.forEach(el => animateCounter(el));
    };

    if (speedSection) {
        const speedObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    triggerAllCounters();
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -20px 0px'
        });

        speedObserver.observe(speedSection);
    } else {
        triggerAllCounters();
    }


    // 7. Mobile menu toggle — already handled above


    // 8. Button hover ripple effect
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.classList.add('ripple-active');
        });
        
        btn.addEventListener('mouseleave', function() {
            // Remove the class after a short delay so animation can finish
            setTimeout(() => {
                this.classList.remove('ripple-active');
            }, 300);
        });
    });

    // 9. Interactive Mockup Card Simulation
    const casualSpeechEl = document.getElementById('typed-casual-speech');
    const textareaEl = document.getElementById('mockup-textarea');
    const shimmerEl = document.getElementById('mockup-shimmer');
    const waveEl = document.getElementById('voice-wave-mini');
    const rolePills = document.querySelectorAll('.role_pill');

    const casualSpeechText = "yeah the form filler works pretty good but the button text is kind of confusing";
    
    const roleOutputs = {
        executive: "The Form Filler feature operates with high accuracy. Recommend simplifying the button labels to enhance user navigation.",
        developer: "UI Refactor: Form filler input validation is complete. Modify button copy from 'Submit' to clear call-to-actions for improved clarity.",
        creative: "Pebbles automatically fills forms with zero effort! Let's make the buttons clear and crisp so visitors are absolutely wowed."
    };

    let activeRole = 'executive';
    let simulationTimeout = null;

    const triggerShimmerRewrite = (targetText) => {
        if (shimmerEl) {
            shimmerEl.classList.remove('active');
            void shimmerEl.offsetWidth; // trigger reflow
            shimmerEl.classList.add('active');
        }
        setTimeout(() => {
            if (textareaEl) textareaEl.value = targetText;
        }, 300);
    };

    rolePills.forEach(pill => {
        pill.addEventListener('click', function(e) {
            e.stopPropagation();
            rolePills.forEach(p => p.classList.remove('active'));
            this.classList.add('active');
            activeRole = this.getAttribute('data-role');
            
            // If typing is finished, instantly rewrite to selected role style
            if (waveEl && waveEl.classList.contains('paused')) {
                triggerShimmerRewrite(roleOutputs[activeRole]);
            }
        });
    });

    const startMockupSimulation = () => {
        // Reset state
        if (casualSpeechEl) casualSpeechEl.textContent = "";
        if (textareaEl) textareaEl.value = "Listening to speech...";
        if (waveEl) {
            waveEl.classList.remove('paused');
        }

        let charIndex = 0;
        
        const typeSpeech = () => {
            if (charIndex < casualSpeechText.length) {
                if (casualSpeechEl) {
                    casualSpeechEl.textContent += casualSpeechText.charAt(charIndex);
                }
                charIndex++;
                simulationTimeout = setTimeout(typeSpeech, 40 + Math.random() * 20);
            } else {
                // Done speaking
                if (waveEl) {
                    waveEl.classList.add('paused');
                }
                
                // Show professional rewrite trigger
                setTimeout(() => {
                    triggerShimmerRewrite(roleOutputs[activeRole]);
                    
                    // Restart simulation after 8 seconds
                    simulationTimeout = setTimeout(startMockupSimulation, 8000);
                }, 1000);
            }
        };

        // Small delay before typing starts
        simulationTimeout = setTimeout(typeSpeech, 1500);
    };

    // Run the simulation
    startMockupSimulation();
});
