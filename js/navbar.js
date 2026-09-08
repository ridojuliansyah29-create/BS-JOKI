/* ============================================
   BS JOKI - NAVBAR JS
   Mobile menu, active nav, Escape handling
   ============================================ */

(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        var navbar = document.getElementById('navbar');
        var toggle = document.getElementById('navbarToggle');
        var menu = document.getElementById('navbarMenu');

        if (!navbar || !toggle || !menu) return;

        /* Mobile menu toggle */
        toggle.addEventListener('click', function() {
            var isOpen = menu.classList.contains('open');
            menu.classList.toggle('open');
            toggle.classList.toggle('active');
            toggle.setAttribute('aria-expanded', !isOpen);
        });

        /* Close menu on Escape */
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && menu.classList.contains('open')) {
                menu.classList.remove('open');
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });

        /* Close menu when clicking outside */
        document.addEventListener('click', function(e) {
            if (!navbar.contains(e.target) && menu.classList.contains('open')) {
                menu.classList.remove('open');
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });

        /* Close menu on window resize (if desktop) */
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768 && menu.classList.contains('open')) {
                menu.classList.remove('open');
                toggle.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });

        /* Navbar scroll effect */
        window.addEventListener('scroll', function() {
            if (window.scrollY > 20) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
        // Initial check
        if (window.scrollY > 20) {
            navbar.classList.add('scrolled');
        }

        /* Close menu when a nav link is clicked */
        menu.querySelectorAll('a').forEach(function(link) {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    menu.classList.remove('open');
                    toggle.classList.remove('active');
                    toggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
    });

})();