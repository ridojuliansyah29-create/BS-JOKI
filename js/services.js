/* ============================================
   BS JOKI - SERVICES JS
   Render services, search, filter, sort
   ============================================ */

(function() {
    'use strict';

    var servicesData = window.BS_JOKI_SERVICES || [];
    var currentCategory = 'all';
    var currentSearch = '';
    var currentSort = 'recommended';
    var currentMaxPrice = 500000;
    var visibleCount = 6;

    document.addEventListener('DOMContentLoaded', function() {
        var servicesGrid = document.getElementById('servicesGrid');
        var homeServicesGrid = document.getElementById('homeServicesGrid');
        
        /* Homepage - render preview */
        if (homeServicesGrid) {
            renderHomeServices(homeServicesGrid);
        }

        /* Services page - full catalog */
        if (servicesGrid) {
            initServicesPage(servicesGrid);
        }

        /* Review page - render reviews */
        var reviewList = document.getElementById('reviewList');
        if (reviewList && window.BS_JOKI_REVIEWS) {
            initReviewsPage(reviewList);
        }

        /* FAQ page - handled inline */
    });

    function renderHomeServices(grid) {
        if (!grid || !servicesData || servicesData.length === 0) return;
        
        var html = '';
        var previewServices = servicesData.slice(0, 6);
        
        previewServices.forEach(function(service) {
            html += createServiceCardHtml(service, true);
        });
        
        grid.innerHTML = html;
        
        // Add click handlers
        grid.querySelectorAll('.service-card, .service-card-full').forEach(function(card) {
            card.addEventListener('click', function() {
                var serviceId = this.getAttribute('data-service-id');
                if (serviceId) {
                    navigateToService(serviceId);
                }
            });
        });
    }

    function createServiceCardHtml(service, isPreview) {
        var badges = '';
        if (service.popular) {
            badges += '<span class="service-card-badge badge-popular">POPULAR</span>';
        }
        if (service.isNew) {
            badges += '<span class="service-card-badge badge-new">NEW</span>';
        }

        if (isPreview) {
            return '<div class="service-card" data-service-id="' + service.id + '" role="button" tabindex="0" aria-label="' + escapeAttr(service.name) + '">' +
                '<div class="service-card-icon" aria-hidden="true">' + (service.icon || '⚔') + '</div>' +
                '<div class="service-card-top">' +
                '<h3 class="service-card-title">' + escapeHtml(service.name) + '</h3>' +
                '<div class="service-card-badges">' + badges + '</div>' +
                '</div>' +
                '<p class="service-card-desc">' + escapeHtml(service.description) + '</p>' +
                '<div class="service-card-footer">' +
                '<span class="service-card-price">' + formatCurrency(service.basePrice) + '</span>' +
                '<span class="service-card-duration">' + escapeHtml(service.estimatedTime) + '</span>' +
                '</div>' +
                '</div>';
        } else {
            return '<div class="service-card-full" data-service-id="' + service.id + '" role="button" tabindex="0" aria-label="' + escapeAttr(service.name) + '">' +
                '<div class="service-card-top">' +
                '<div class="service-card-icon-svg" aria-hidden="true">' + (service.icon || '⚔') + '</div>' +
                '<div class="service-card-badges">' + badges + '</div>' +
                '</div>' +
                '<h3 class="service-card-title-full">' + escapeHtml(service.name) + '</h3>' +
                '<p class="service-card-desc-full">' + escapeHtml(service.description) + '</p>' +
                '<div class="service-card-meta">' +
                '<span class="service-card-price-full">' + formatCurrency(service.basePrice) + '</span>' +
                '<span class="service-card-duration-full">' + escapeHtml(service.estimatedTime) + '</span>' +
                '</div>' +
                '</div>';
        }
    }

    function initServicesPage(grid) {
        if (!grid || !servicesData || servicesData.length === 0) return;

        var searchInput = document.getElementById('searchInput');
        var sortSelect = document.getElementById('sortSelect');
        var priceRange = document.getElementById('priceRange');
        var priceRangeValue = document.getElementById('priceRangeValue');
        var categoryFilter = document.getElementById('categoryFilter');
        var resetBtn = document.getElementById('resetFilters');
        var emptyState = document.getElementById('emptyState');
        var emptyStateReset = document.getElementById('emptyStateReset');

        function updatePriceDisplay() {
            if (priceRangeValue) {
                priceRangeValue.textContent = formatCurrency(parseInt(priceRange.value));
            }
        }

        function applyFilters() {
            currentCategory = document.querySelector('#categoryFilter .filter-chip.active')?.getAttribute('data-category') || 'all';
            currentSearch = searchInput ? searchInput.value.toLowerCase().trim() : '';
            currentSort = sortSelect ? sortSelect.value : 'recommended';
            currentMaxPrice = priceRange ? parseInt(priceRange.value) : 500000;
            updatePriceDisplay();
            renderServices(grid, emptyState);
        }

        if (searchInput) {
            searchInput.addEventListener('input', applyFilters);
        }

        if (sortSelect) {
            sortSelect.addEventListener('change', applyFilters);
        }

        if (priceRange) {
            priceRange.addEventListener('input', applyFilters);
        }

        if (categoryFilter) {
            categoryFilter.addEventListener('click', function(e) {
                var chip = e.target.closest('.filter-chip');
                if (!chip) return;
                categoryFilter.querySelectorAll('.filter-chip').forEach(function(c) {
                    c.classList.remove('active');
                    c.setAttribute('aria-pressed', 'false');
                });
                chip.classList.add('active');
                chip.setAttribute('aria-pressed', 'true');
                applyFilters();
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                if (searchInput) searchInput.value = '';
                if (sortSelect) sortSelect.value = 'recommended';
                if (priceRange) {
                    priceRange.value = 500000;
                    updatePriceDisplay();
                }
                categoryFilter.querySelectorAll('.filter-chip').forEach(function(c) {
                    c.classList.remove('active');
                    c.setAttribute('aria-pressed', 'false');
                    if (c.getAttribute('data-category') === 'all') {
                        c.classList.add('active');
                        c.setAttribute('aria-pressed', 'true');
                    }
                });
                applyFilters();
                window.BSJokiUtils.showToast('Filter direset', 'info');
            });
        }

        if (emptyStateReset) {
            emptyStateReset.addEventListener('click', function() {
                if (resetBtn) resetBtn.click();
            });
        }

        // Initial render
        updatePriceDisplay();
        renderServices(grid, emptyState);
    }

    function renderServices(grid, emptyState) {
        var filtered = servicesData.filter(function(service) {
            var matchesCategory = currentCategory === 'all' || service.category === currentCategory;
            var matchesSearch = currentSearch === '' || 
                service.name.toLowerCase().includes(currentSearch) || 
                service.description.toLowerCase().includes(currentSearch) ||
                service.category.toLowerCase().includes(currentSearch);
            var matchesPrice = service.basePrice <= currentMaxPrice;
            return matchesCategory && matchesSearch && matchesPrice;
        });

        // Sort
        switch (currentSort) {
            case 'price-low':
                filtered.sort(function(a, b) { return a.basePrice - b.basePrice; });
                break;
            case 'price-high':
                filtered.sort(function(a, b) { return b.basePrice - a.basePrice; });
                break;
            case 'fastest':
                filtered.sort(function(a, b) { 
                    return getDurationHours(a.estimatedTime) - getDurationHours(b.estimatedTime); 
                });
                break;
            case 'popular':
                filtered.sort(function(a, b) { 
                    return (b.popular ? 1 : 0) - (a.popular ? 1 : 0) || a.basePrice - b.basePrice;
                });
                break;
            default:
                // Recommended: popular first, then by price
                filtered.sort(function(a, b) { 
                    return (b.popular ? 1 : 0) - (a.popular ? 1 : 0) || a.basePrice - b.basePrice;
                });
        }

        if (filtered.length === 0) {
            grid.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        var html = '';
        filtered.forEach(function(service) {
            html += createServiceCardHtml(service, false);
        });

        grid.innerHTML = html;

        grid.querySelectorAll('.service-card-full').forEach(function(card) {
            card.addEventListener('click', function() {
                var serviceId = this.getAttribute('data-service-id');
                if (serviceId) {
                    navigateToService(serviceId);
                }
            });
            card.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    var serviceId = this.getAttribute('data-service-id');
                    if (serviceId) navigateToService(serviceId);
                }
            });
        });
    }

    function navigateToService(serviceId) {
        var pageMap = {
            'push-rank': 'push-rank.html',
            'weapon-mastery': 'weapon-mastery.html',
            'battle-pass': 'battle-pass.html',
            'mission-completion': 'order.html?service=mission-completion',
            'event-completion': 'order.html?service=event-completion',
            'level-up': 'order.html?service=level-up',
            'rank-maintenance': 'order.html?service=rank-maintenance',
            'weapon-leveling': 'order.html?service=weapon-leveling',
            'ranked-placement': 'order.html?service=ranked-placement',
            'challenge-completion': 'order.html?service=challenge-completion',
            'daily-mission': 'order.html?service=daily-mission',
            'custom-request': 'order.html?service=custom-request'
        };
        var target = pageMap[serviceId] || 'services.html';
        window.location.href = target;
    }

    function getDurationHours(timeStr) {
        if (!timeStr) return 999;
        var match = timeStr.match(/(\d+)/);
        if (match) return parseInt(match[1]);
        return 999;
    }

    function escapeAttr(str) {
        return String(str || '').replace(/"/g, '&quot;');
    }

    function escapeHtml(str) {
        if (window.BSJokiUtils && window.BSJokiUtils.escapeHtml) {
            return window.BSJokiUtils.escapeHtml(str);
        }
        var div = document.createElement('div');
        div.textContent = String(str || '');
        return div.innerHTML;
    }

    function formatCurrency(amount) {
        if (window.BSJokiUtils && window.BSJokiUtils.formatCurrency) {
            return window.BSJokiUtils.formatCurrency(amount);
        }
        return 'Rp ' + amount.toLocaleString('id-ID');
    }

    /* ============ REVIEWS PAGE ============ */
    function initReviewsPage(reviewList) {
        var reviews = window.BS_JOKI_REVIEWS || [];
        var currentRating = 'all';
        var currentService = 'all';
        var currentSearch = '';
        var currentSort = 'newest';
        var visibleCount = 5;
        var loadMoreBtn = document.getElementById('loadMoreBtn');
        var emptyState = document.getElementById('reviewEmptyState');

        var searchInput = document.getElementById('reviewSearchInput');
        var ratingFilter = document.getElementById('ratingFilter');
        var serviceFilter = document.getElementById('serviceFilter');
        var sortSelect = document.getElementById('reviewSortSelect');

        function applyReviewFilters() {
            currentSearch = searchInput ? searchInput.value.toLowerCase().trim() : '';
            currentSort = sortSelect ? sortSelect.value : 'newest';
            visibleCount = 5;
            renderReviews();
        }

        function renderReviews() {
            var filtered = reviews.filter(function(review) {
                var matchesRating = currentRating === 'all' || review.rating === parseInt(currentRating);
                var matchesService = currentService === 'all' || review.service === currentService;
                var matchesSearch = currentSearch === '' || 
                    review.name.toLowerCase().includes(currentSearch) ||
                    review.comment.toLowerCase().includes(currentSearch) ||
                    review.service.toLowerCase().includes(currentSearch);
                return matchesRating && matchesService && matchesSearch;
            });

            switch (currentSort) {
                case 'oldest':
                    filtered.sort(function(a, b) { return new Date(a.date) - new Date(b.date); });
                    break;
                case 'rating-high':
                    filtered.sort(function(a, b) { return b.rating - a.rating; });
                    break;
                case 'rating-low':
                    filtered.sort(function(a, b) { return a.rating - b.rating; });
                    break;
                default:
                    filtered.sort(function(a, b) { return new Date(b.date) - new Date(a.date); });
            }

            if (filtered.length === 0) {
                reviewList.innerHTML = '';
                if (emptyState) emptyState.style.display = 'block';
                if (loadMoreBtn) loadMoreBtn.style.display = 'none';
                return;
            }

            if (emptyState) emptyState.style.display = 'none';

            var showCount = Math.min(visibleCount, filtered.length);
            var html = '';
            for (var i = 0; i < showCount; i++) {
                html += createReviewCardHtml(filtered[i]);
            }

            reviewList.innerHTML = html;

            if (filtered.length > visibleCount) {
                if (loadMoreBtn) {
                    loadMoreBtn.style.display = 'block';
                    loadMoreBtn.onclick = function() {
                        visibleCount += 5;
                        renderReviews();
                    };
                }
            } else {
                if (loadMoreBtn) loadMoreBtn.style.display = 'none';
            }
        }

        function createReviewCardHtml(review) {
            var stars = '';
            for (var i = 1; i <= 5; i++) {
                stars += i <= review.rating ? '★' : '☆';
            }
            var avatarColors = ['avatar-gradient-1', 'avatar-gradient-2', 'avatar-gradient-3', 'avatar-gradient-4', 'avatar-gradient-5', 'avatar-gradient-6'];
            var avatarColor = avatarColors[review.id.charCodeAt(0) % avatarColors.length];
            var initial = review.name.charAt(0).toUpperCase();

            return '<div class="review-card">' +
                '<div class="review-header">' +
                '<div class="review-author">' +
                '<div class="review-avatar-sm ' + avatarColor + '" aria-hidden="true">' + initial + '</div>' +
                '<div>' +
                '<div class="review-name">' + escapeHtml(review.name) + '</div>' +
                '<div class="review-date">' + formatDate(review.date) + '</div>' +
                '</div>' +
                '</div>' +
                '<div class="review-rating" aria-label="Rating: ' + review.rating + ' out of 5">' + stars + '</div>' +
                '</div>' +
                '<span class="review-service">' + escapeHtml(review.service) + '</span>' +
                '<p class="review-comment">' + escapeHtml(review.comment) + '</p>' +
                '<span class="review-sim-badge">SIMULATED REVIEW</span>' +
                '</div>';
        }

        if (searchInput) searchInput.addEventListener('input', applyReviewFilters);
        if (sortSelect) sortSelect.addEventListener('change', applyReviewFilters);

        if (ratingFilter) {
            ratingFilter.addEventListener('click', function(e) {
                var chip = e.target.closest('.filter-chip');
                if (!chip) return;
                ratingFilter.querySelectorAll('.filter-chip').forEach(function(c) {
                    c.classList.remove('active');
                    c.setAttribute('aria-pressed', 'false');
                });
                chip.classList.add('active');
                chip.setAttribute('aria-pressed', 'true');
                currentRating = chip.getAttribute('data-rating');
                visibleCount = 5;
                renderReviews();
            });
        }

        if (serviceFilter) {
            serviceFilter.addEventListener('click', function(e) {
                var chip = e.target.closest('.filter-chip');
                if (!chip) return;
                serviceFilter.querySelectorAll('.filter-chip').forEach(function(c) {
                    c.classList.remove('active');
                    c.setAttribute('aria-pressed', 'false');
                });
                chip.classList.add('active');
                chip.setAttribute('aria-pressed', 'true');
                currentService = chip.getAttribute('data-service');
                visibleCount = 5;
                renderReviews();
            });
        }

        renderReviews();
    }

    function formatDate(dateStr) {
        if (window.BSJokiUtils && window.BSJokiUtils.formatDate) {
            return window.BSJokiUtils.formatDate(dateStr);
        }
        return dateStr || '';
    }

})();