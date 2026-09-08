/* ============================================
   BS JOKI - MAIN JS
   Global utilities: toast, modal, storage, helpers
   ============================================ */

(function() {
    'use strict';

    /* ============ TOAST SYSTEM ============ */
    function showToast(message, type) {
        type = type || 'info';
        var container = document.getElementById('toastContainer');
        if (!container) return;

        var toast = document.createElement('div');
        toast.className = 'toast toast-' + type;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'polite');

        var icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        toast.innerHTML = '<span aria-hidden="true">' + (icons[type] || icons.info) + '</span> ' + escapeHtml(message);

        container.appendChild(toast);

        setTimeout(function() {
            toast.classList.add('toast-hiding');
            setTimeout(function() {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    /* ============ MODAL SYSTEM ============ */
    function openModal(options) {
        var container = document.getElementById('modalContainer');
        if (!container) return;

        var title = options.title || '';
        var content = options.content || '';
        var buttons = options.buttons || [];

        var buttonHtml = '';
        buttons.forEach(function(btn) {
            var btnClass = btn.class || 'btn-outline';
            var btnId = btn.id || '';
            var btnText = btn.text || 'OK';
            buttonHtml += '<button class="btn ' + btnClass + '" id="' + btnId + '" data-modal-action="' + (btn.action || 'close') + '">' + btnText + '</button>';
        });

        var overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', title);

        overlay.innerHTML = 
            '<div class="modal-content">' +
            '<button class="modal-close" aria-label="Close modal">&times;</button>' +
            (title ? '<h3 style="margin-bottom:12px;font-size:1.2rem;">' + escapeHtml(title) + '</h3>' : '') +
            '<div style="margin-bottom:16px;">' + content + '</div>' +
            (buttonHtml ? '<div style="display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;">' + buttonHtml + '</div>' : '') +
            '</div>';

        container.innerHTML = '';
        container.appendChild(overlay);
        container.setAttribute('aria-hidden', 'false');

        function closeModal() {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
            container.setAttribute('aria-hidden', 'true');
            document.removeEventListener('keydown', handleEscape);
        }

        function handleEscape(e) {
            if (e.key === 'Escape') {
                closeModal();
            }
        }

        document.addEventListener('keydown', handleEscape);

        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeModal();
            }
        });

        var closeBtn = overlay.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }

        var actionButtons = overlay.querySelectorAll('[data-modal-action]');
        actionButtons.forEach(function(btn) {
            btn.addEventListener('click', function() {
                var action = btn.getAttribute('data-modal-action');
                if (action === 'close') {
                    closeModal();
                } else if (action === 'navigate' && btn.getAttribute('data-href')) {
                    window.location.href = btn.getAttribute('data-href');
                } else if (action === 'copy' && btn.getAttribute('data-copy')) {
                    copyToClipboard(btn.getAttribute('data-copy'));
                    showToast('Order ID copied', 'success');
                }
            });
        });
    }

    function closeModal() {
        var container = document.getElementById('modalContainer');
        if (container) {
            container.innerHTML = '';
            container.setAttribute('aria-hidden', 'true');
        }
    }

    /* ============ STORAGE HELPERS ============ */
    function saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.warn('Failed to save to LocalStorage:', e.message);
            return false;
        }
    }

    function getFromStorage(key, fallback) {
        try {
            var data = localStorage.getItem(key);
            if (data === null || data === undefined) return fallback;
            return JSON.parse(data);
        } catch (e) {
            console.warn('Failed to read from LocalStorage:', e.message);
            return fallback;
        }
    }

    function removeFromStorage(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.warn('Failed to remove from LocalStorage:', e.message);
        }
    }

    /* ============ FORMAT HELPERS ============ */
    function formatCurrency(amount) {
        if (typeof amount !== 'number' || isNaN(amount)) return 'Rp 0';
        return 'Rp ' + amount.toLocaleString('id-ID');
    }

    function formatDate(dateStr) {
        if (!dateStr) return '-';
        try {
            var d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch (e) {
            return dateStr;
        }
    }

    function escapeHtml(str) {
        if (!str) return '';
        var div = document.createElement('div');
        div.textContent = String(str);
        return div.innerHTML;
    }

    /* ============ QUERY PARAMETER HELPERS ============ */
    function getQueryParam(param) {
        var urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    function getAllQueryParams() {
        var urlParams = new URLSearchParams(window.location.search);
        var params = {};
        urlParams.forEach(function(value, key) {
            params[key] = value;
        });
        return params;
    }

    /* ============ CLIPBOARD HELPERS ============ */
    function copyToClipboard(text, callback) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function() {
                if (callback) callback(true);
            }).catch(function() {
                fallbackCopy(text, callback);
            });
        } else {
            fallbackCopy(text, callback);
        }
    }

    function fallbackCopy(text, callback) {
        var textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        textarea.setSelectionRange(0, textarea.value.length);
        try {
            document.execCommand('copy');
            if (callback) callback(true);
        } catch (e) {
            if (callback) callback(false);
        }
        document.body.removeChild(textarea);
    }

    /* ============ SMOOTH SCROLL ============ */
    function smoothScrollTo(targetY, duration) {
        duration = duration || 400;
        var startY = window.pageYOffset;
        var diff = targetY - startY;
        var startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            var timeElapsed = currentTime - startTime;
            var progress = Math.min(timeElapsed / duration, 1);
            var ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
            window.scrollTo(0, startY + diff * ease);
            if (progress < 1) {
                requestAnimationFrame(animation);
            }
        }

        requestAnimationFrame(animation);
    }

    /* ============ COUNTER ANIMATION ============ */
    function animateCounters() {
        var counters = document.querySelectorAll('.stat-number[data-count]');
        if (!counters || counters.length === 0) return;

        counters.forEach(function(counter) {
            var target = parseFloat(counter.getAttribute('data-count'));
            var suffix = counter.getAttribute('data-suffix') || '';
            var decimal = parseInt(counter.getAttribute('data-decimal')) || 0;
            var duration = 1200;
            var startTime = null;
            var startValue = 0;

            function updateCounter(currentTime) {
                if (startTime === null) startTime = currentTime;
                var elapsed = currentTime - startTime;
                var progress = Math.min(elapsed / duration, 1);
                var ease = 1 - Math.pow(1 - progress, 3);
                var currentValue = startValue + (target - startValue) * ease;

                if (decimal > 0) {
                    counter.textContent = currentValue.toFixed(decimal) + suffix;
                } else {
                    counter.textContent = Math.round(currentValue).toLocaleString('id-ID') + suffix;
                }

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    if (decimal > 0) {
                        counter.textContent = target.toFixed(decimal) + suffix;
                    } else {
                        counter.textContent = target.toLocaleString('id-ID') + suffix;
                    }
                }
            }

            requestAnimationFrame(updateCounter);
        });
    }

    /* ============ INITIALIZATION ============ */
    document.addEventListener('DOMContentLoaded', function() {
        // Animate counters on home page
        if (document.querySelector('.stat-number[data-count]')) {
            animateCounters();
        }

        // Handle any [data-smooth-scroll] elements
        document.querySelectorAll('[data-smooth-scroll]').forEach(function(el) {
            el.addEventListener('click', function(e) {
                e.preventDefault();
                var targetId = this.getAttribute('data-smooth-scroll');
                var target = document.querySelector(targetId);
                if (target) {
                    smoothScrollTo(target.getBoundingClientRect().top + window.pageYOffset - 80);
                }
            });
        });

        // Handle modal close on Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                var container = document.getElementById('modalContainer');
                if (container && container.children.length > 0) {
                    closeModal();
                }
            }
        });
    });

    /* ============ EXPOSE GLOBALS ============ */
    window.BSJokiUtils = {
        showToast: showToast,
        openModal: openModal,
        closeModal: closeModal,
        saveToStorage: saveToStorage,
        getFromStorage: getFromStorage,
        removeFromStorage: removeFromStorage,
        formatCurrency: formatCurrency,
        formatDate: formatDate,
        escapeHtml: escapeHtml,
        getQueryParam: getQueryParam,
        getAllQueryParams: getAllQueryParams,
        copyToClipboard: copyToClipboard,
        smoothScrollTo: smoothScrollTo,
        animateCounters: animateCounters
    };

})();