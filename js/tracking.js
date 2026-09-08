/* ============================================
   BS JOKI - TRACKING JS
   Order lookup, progress, timeline, simulation
   ============================================ */

(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        var trackInput = document.getElementById('trackingInput');
        var trackBtn = document.getElementById('trackOrderBtn');
        var trackingResult = document.getElementById('trackingResult');
        var trackingNotFound = document.getElementById('trackingNotFound');

        if (!trackInput || !trackBtn || !trackingResult) return;

        /* Check for order param in URL */
        var orderParam = window.BSJokiUtils ? window.BSJokiUtils.getQueryParam('order') : null;
        if (orderParam) {
            trackInput.value = orderParam;
            trackOrder(orderParam);
        }

        trackBtn.addEventListener('click', function() {
            var orderId = trackInput.value.trim().toUpperCase();
            if (!orderId) {
                window.BSJokiUtils.showToast('Masukkan Order ID terlebih dahulu', 'warning');
                return;
            }
            trackOrder(orderId);
        });

        trackInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                var orderId = trackInput.value.trim().toUpperCase();
                if (orderId) trackOrder(orderId);
            }
        });
    });

    function trackOrder(orderId) {
        var trackingResult = document.getElementById('trackingResult');
        var trackingNotFound = document.getElementById('trackingNotFound');

        if (!orderId || !orderId.match(/^BS-\d{6}$/)) {
            if (trackingNotFound) {
                trackingNotFound.style.display = 'block';
                trackingNotFound.querySelector('.empty-state-title').textContent = 'Order Not Found';
                trackingNotFound.querySelector('.empty-state-text').textContent = 'Format Order ID tidak valid. Gunakan format BS-XXXXXX.';
            }
            if (trackingResult) trackingResult.style.display = 'none';
            window.BSJokiUtils.showToast('Order ID tidak valid', 'error');
            return;
        }

        var orders = window.BSJokiUtils.getFromStorage('bsjoki_orders', []);
        var order = null;

        for (var i = 0; i < orders.length; i++) {
            if (orders[i].id === orderId) {
                order = orders[i];
                break;
            }
        }

        if (!order) {
            if (trackingNotFound) {
                trackingNotFound.style.display = 'block';
                trackingNotFound.querySelector('.empty-state-title').textContent = 'Order Not Found';
                trackingNotFound.querySelector('.empty-state-text').textContent = 'Check your Order ID and try again.';
            }
            if (trackingResult) trackingResult.style.display = 'none';
            window.BSJokiUtils.showToast('Order tidak ditemukan', 'error');
            return;
        }

        if (trackingNotFound) trackingNotFound.style.display = 'none';
        if (trackingResult) {
            trackingResult.style.display = 'block';
            renderTrackingResult(trackingResult, order);
        }
    }

    function renderTrackingResult(container, order) {
        var progress = order.progress || 0;
        var status = order.status || 'pending';

        var statusClass = 'status-pending';
        var statusText = 'PENDING';
        if (status === 'in-progress') {
            statusClass = 'status-in-progress';
            statusText = 'IN PROGRESS';
        } else if (status === 'completed') {
            statusClass = 'status-completed';
            statusText = 'COMPLETED';
        }

        var timelineSteps = [
            { label: 'Order Created', done: progress >= 0, active: progress < 15 && progress >= 0 },
            { label: 'Order Confirmed', done: progress >= 25, active: progress >= 15 && progress < 25 },
            { label: 'Joki Assigned', done: progress >= 40, active: progress >= 25 && progress < 40 },
            { label: 'In Progress', done: progress >= 60, active: progress >= 40 && progress < 60 },
            { label: 'Almost Done', done: progress >= 85, active: progress >= 60 && progress < 85 },
            { label: 'Completed', done: progress >= 100, active: progress >= 85 && progress < 100 }
        ];

        if (progress >= 100) {
            status = 'completed';
            statusText = 'COMPLETED';
            statusClass = 'status-completed';
        }

        var timelineHtml = '';
        timelineSteps.forEach(function(step, index) {
            var dotClass = 'timeline-dot';
            var contentClass = 'timeline-content';
            var dotContent = index + 1;

            if (step.done) {
                dotClass += ' done';
                contentClass += ' done';
                dotContent = '✓';
            } else if (step.active) {
                dotClass += ' active';
                contentClass += ' active';
            }

            timelineHtml += '<div class="timeline-item">' +
                '<div class="' + dotClass + '" aria-hidden="true">' + dotContent + '</div>' +
                '<div class="' + contentClass + '">' + step.label + '</div>' +
                '</div>';
        });

        var progressFillClass = 'tracking-progress-fill';
        if (progress >= 100) {
            progressFillClass += ' completed';
        }

        var simulateBtn = '';
        if (progress < 100) {
            simulateBtn = '<button class="btn btn-accent" id="simulateBtn">SIMULATE PROGRESS</button>';
        }

        var copyBtn = '<button class="btn btn-outline" id="copyOrderIdBtn">COPY ORDER ID</button>';

        var html = '<div class="tracking-order-header">' +
            '<div class="tracking-order-id">ORDER #' + window.BSJokiUtils.escapeHtml(order.id) + '</div>' +
            '<div class="tracking-order-service">' + window.BSJokiUtils.escapeHtml(order.service) + '</div>' +
            '<div class="tracking-order-detail">' + window.BSJokiUtils.escapeHtml(order.currentRank) + ' &rarr; ' + window.BSJokiUtils.escapeHtml(order.targetRank) + '</div>' +
            '</div>' +
            '<div style="text-align:center;">' +
            '<span class="tracking-status ' + statusClass + '">' + statusText + '</span>' +
            '</div>' +
            '<div class="tracking-progress-section">' +
            '<div class="tracking-progress-label">' +
            '<span>Progress</span>' +
            '<span id="progressPercent">' + progress + '%</span>' +
            '</div>' +
            '<div class="tracking-progress-bar">' +
            '<div class="' + progressFillClass + '" id="progressFill" style="width:' + progress + '%;"></div>' +
            '</div>' +
            '</div>' +
            '<div class="summary-row"><span>Joki</span><span>' + window.BSJokiUtils.escapeHtml(order.joki) + '</span></div>' +
            '<div class="summary-row"><span>Estimated Price</span><span>' + window.BSJokiUtils.formatCurrency(order.price) + '</span></div>' +
            '<div class="summary-row"><span>Estimated completion</span><span>' + window.BSJokiUtils.escapeHtml(order.estimatedTime) + '</span></div>' +
            '<div class="summary-row"><span>Created</span><span>' + window.BSJokiUtils.formatDate(order.createdAt) + '</span></div>' +
            '<div class="tracking-timeline">' +
            '<h3 class="tracking-timeline-title">Timeline</h3>' +
            timelineHtml +
            '</div>' +
            '<div class="tracking-actions">' +
            simulateBtn +
            copyBtn +
            '</div>';

        container.innerHTML = html;

        /* Attach event listeners */
        var simBtn = document.getElementById('simulateBtn');
        if (simBtn) {
            simBtn.addEventListener('click', function() {
                simulateProgress(order.id);
            });
        }

        var copyBtnEl = document.getElementById('copyOrderIdBtn');
        if (copyBtnEl) {
            copyBtnEl.addEventListener('click', function() {
                window.BSJokiUtils.copyToClipboard(order.id, function(success) {
                    if (success) {
                        window.BSJokiUtils.showToast('✓ Order ID copied', 'success');
                    } else {
                        window.BSJokiUtils.showToast('Gagal copy order ID', 'error');
                    }
                });
            });
        }
    }

    function simulateProgress(orderId) {
        var orders = window.BSJokiUtils.getFromStorage('bsjoki_orders', []);
        var order = null;
        var orderIndex = -1;

        for (var i = 0; i < orders.length; i++) {
            if (orders[i].id === orderId) {
                order = orders[i];
                orderIndex = i;
                break;
            }
        }

        if (!order) return;

        var currentProgress = order.progress || 0;
        var newProgress = currentProgress;

        if (currentProgress < 15) {
            newProgress = 15;
        } else if (currentProgress < 32) {
            newProgress = 32;
        } else if (currentProgress < 48) {
            newProgress = 48;
        } else if (currentProgress < 67) {
            newProgress = 67;
        } else if (currentProgress < 82) {
            newProgress = 82;
        } else if (currentProgress < 100) {
            newProgress = 100;
        }

        order.progress = newProgress;
        if (newProgress >= 100) {
            order.status = 'completed';
        } else if (newProgress >= 25) {
            order.status = 'in-progress';
        } else {
            order.status = 'pending';
        }

        orders[orderIndex] = order;
        window.BSJokiUtils.saveToStorage('bsjoki_orders', orders);

        /* Re-render */
        var trackingResult = document.getElementById('trackingResult');
        if (trackingResult) {
            renderTrackingResult(trackingResult, order);
        }

        var msg = newProgress >= 100 ? 'Order completed!' : 'Progress updated to ' + newProgress + '%';
        window.BSJokiUtils.showToast(msg, newProgress >= 100 ? 'success' : 'info');
    }

})();