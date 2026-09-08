/* ============================================
   BS JOKI - JOKIS JS
   Render jokis, search, filter, sort, detail
   ============================================ */

(function() {
    'use strict';

    var jokisData = window.BS_JOKI_JOKIS || [];
    var currentCategory = 'all';
    var currentSearch = '';
    var currentSort = 'recommended';

    document.addEventListener('DOMContentLoaded', function() {
        var jokiGrid = document.getElementById('jokiGrid');
        var homeJokiGrid = document.getElementById('homeJokiGrid');
        var jokiDetailContainer = document.getElementById('jokiDetailContainer');

        /* Homepage joki preview */
        if (homeJokiGrid) {
            renderHomeJokis(homeJokiGrid);
        }

        /* Jokis page */
        if (jokiGrid) {
            initJokisPage(jokiGrid);
        }

        /* Joki detail page */
        if (jokiDetailContainer) {
            initJokiDetail(jokiDetailContainer);
        }
    });

    function renderHomeJokis(grid) {
        if (!grid || !jokisData || jokisData.length === 0) return;
        
        var html = '';
        var previewJokis = jokisData.slice(0, 4);
        
        previewJokis.forEach(function(joki) {
            html += '<div class="joki-preview-card" data-joki-id="' + escapeAttr(joki.id) + '" role="button" tabindex="0" aria-label="' + escapeAttr(joki.name) + '">' +
                '<div class="joki-avatar ' + escapeAttr(joki.avatarStyle) + '" aria-hidden="true">' + escapeHtml(joki.name.charAt(0)) + '</div>' +
                '<div class="joki-preview-name">' + escapeHtml(joki.name) + '</div>' +
                '<div class="joki-preview-rating">★ ' + joki.rating.toFixed(1) + '</div>' +
                '<div class="joki-preview-spec">' + escapeHtml(joki.specialization) + '</div>' +
                '<span class="joki-preview-status">COMING SOON</span>' +
                '</div>';
        });
        
        grid.innerHTML = html;
        
        grid.querySelectorAll('.joki-preview-card').forEach(function(card) {
            card.addEventListener('click', function() {
                var jokiId = this.getAttribute('data-joki-id');
                if (jokiId) {
                    window.location.href = 'pages/joki-detail.html?id=' + encodeURIComponent(jokiId);
                }
            });
        });
    }

    function initJokisPage(grid) {
        if (!grid || !jokisData || jokisData.length === 0) return;

        var searchInput = document.getElementById('jokiSearchInput');
        var categoryFilter = document.getElementById('jokiCategoryFilter');
        var sortSelect = document.getElementById('jokiSortSelect');
        var emptyState = document.getElementById('jokiEmptyState');

        function applyJokiFilters() {
            currentSearch = searchInput ? searchInput.value.toLowerCase().trim() : '';
            currentSort = sortSelect ? sortSelect.value : 'recommended';
            renderJokis(grid, emptyState);
        }

        if (searchInput) searchInput.addEventListener('input', applyJokiFilters);
        if (sortSelect) sortSelect.addEventListener('change', applyJokiFilters);

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
                currentCategory = chip.getAttribute('data-category');
                renderJokis(grid, emptyState);
            });
        }

        renderJokis(grid, emptyState);
    }

    function renderJokis(grid, emptyState) {
        var filtered = jokisData.filter(function(joki) {
            var matchesCategory = currentCategory === 'all' || joki.specialization === currentCategory;
            var matchesSearch = currentSearch === '' || 
                joki.name.toLowerCase().includes(currentSearch) ||
                joki.specialization.toLowerCase().includes(currentSearch);
            return matchesCategory && matchesSearch;
        });

        switch (currentSort) {
            case 'rating-high':
                filtered.sort(function(a, b) { return b.rating - a.rating; });
                break;
            case 'orders-high':
                filtered.sort(function(a, b) { return b.orders - a.orders; });
                break;
            case 'speed-fast':
                filtered.sort(function(a, b) { 
                    var aSpeed = parseFloat(a.speed) || 0;
                    var bSpeed = parseFloat(b.speed) || 0;
                    return bSpeed - aSpeed;
                });
                break;
            default:
                filtered.sort(function(a, b) { return b.rating - a.rating; });
        }

        if (filtered.length === 0) {
            grid.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

        var html = '';
        filtered.forEach(function(joki) {
            html += createJokiCardHtml(joki);
        });

        grid.innerHTML = html;

        grid.querySelectorAll('.joki-card').forEach(function(card) {
            card.addEventListener('click', function() {
                var jokiId = this.getAttribute('data-joki-id');
                if (jokiId) {
                    window.location.href = 'joki-detail.html?id=' + encodeURIComponent(jokiId);
                }
            });
            card.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    var jokiId = this.getAttribute('data-joki-id');
                    if (jokiId) {
                        window.location.href = 'joki-detail.html?id=' + encodeURIComponent(jokiId);
                    }
                }
            });
        });
    }

    function createJokiCardHtml(joki) {
        return '<div class="joki-card" data-joki-id="' + escapeAttr(joki.id) + '" role="button" tabindex="0" aria-label="' + escapeAttr(joki.name) + '">' +
            '<div class="joki-card-avatar ' + escapeAttr(joki.avatarStyle) + '" aria-hidden="true">' + escapeHtml(joki.name.charAt(0)) + '</div>' +
            '<div class="joki-card-name">' + escapeHtml(joki.name) + '</div>' +
            '<div class="joki-card-rating">★ ' + joki.rating.toFixed(1) + '</div>' +
            '<div class="joki-card-orders">' + joki.orders + ' Orders</div>' +
            '<span class="joki-card-spec">' + escapeHtml(joki.specialization) + '</span>' +
            '<span class="joki-card-speed">Speed: ' + escapeHtml(joki.speed) + '</span>' +
            '<span class="joki-card-status">COMING SOON</span>' +
            '</div>';
    }

    function initJokiDetail(container) {
        if (!container) return;

        var jokiId = window.BSJokiUtils ? window.BSJokiUtils.getQueryParam('id') : null;
        
        if (!jokiId) {
            renderJokiEmptyState(container);
            return;
        }

        var joki = null;
        for (var i = 0; i < jokisData.length; i++) {
            if (jokisData[i].id === jokiId) {
                joki = jokisData[i];
                break;
            }
        }

        if (!joki) {
            renderJokiEmptyState(container);
            return;
        }

        var jokiReviews = [];
        if (window.BS_JOKI_REVIEWS) {
            jokiReviews = window.BS_JOKI_REVIEWS.slice(0, 3);
        }

        var reviewsHtml = '';
        if (jokiReviews.length > 0) {
            reviewsHtml = '<div class="joki-detail-reviews"><h3>Simulated Reviews</h3>';
            jokiReviews.forEach(function(review) {
                reviewsHtml += '<div class="joki-detail-review-item">' +
                    '<div class="joki-detail-review-name">' + escapeHtml(review.name) + ' — <span style="color:var(--warning);">★ ' + review.rating + '</span></div>' +
                    '<p class="joki-detail-review-comment">' + escapeHtml(review.comment) + '</p>' +
                    '</div>';
            });
            reviewsHtml += '</div>';
        }

        var html = '<div class="joki-detail-card">' +
            '<div class="joki-detail-avatar ' + escapeAttr(joki.avatarStyle) + '" aria-hidden="true">' + escapeHtml(joki.name.charAt(0)) + '</div>' +
            '<h1 class="joki-detail-name">' + escapeHtml(joki.name) + '</h1>' +
            '<div class="joki-detail-rating">★ ' + joki.rating.toFixed(1) + ' / 5.0</div>' +
            '<div class="joki-detail-orders">' + joki.orders + ' Orders Selesai</div>' +
            '<span class="joki-detail-spec">' + escapeHtml(joki.specialization) + '</span>' +
            '<div class="joki-detail-speed">Speed: ' + escapeHtml(joki.speed) + '</div>' +
            '<p class="joki-detail-desc">' + escapeHtml(joki.description) + '</p>' +
            '<span class="joki-detail-status">COMING SOON</span>' +
            '<p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:16px;">Joki belum tersedia untuk pekerjaan nyata.</p>' +
            '<div class="joki-detail-actions">' +
            '<a href="order.html" class="btn btn-accent">LANJUT SIMULASI</a>' +
            '<a href="mailto:Ridojulian77@gmail.com" class="btn btn-outline">HUBUNGI VIA GMAIL</a>' +
            '</div>' +
            reviewsHtml +
            '</div>';

        container.innerHTML = html;
    }

    function renderJokiEmptyState(container) {
        container.innerHTML = '<div class="empty-state" style="max-width:500px;margin:40px auto;">' +
            '<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
            '<circle cx="30" cy="30" r="28" stroke="#2a2a3a" stroke-width="2" fill="none"/>' +
            '<path d="M18 18l24 24M42 18L18 42" stroke="#2a2a3a" stroke-width="2" stroke-linecap="round"/>' +
            '</svg>' +
            '<h2 class="empty-state-title">JOKI TIDAK DITEMUKAN</h2>' +
            '<p class="empty-state-text">Joki dengan ID tersebut tidak ditemukan.</p>' +
            '<a href="jokis.html" class="btn btn-accent">Lihat Semua Joki</a>' +
            '</div>';
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

})();