/* ============================================
   BS JOKI - ORDER JS
   Order form, price calculation, LocalStorage
   ============================================ */

(function() {
    'use strict';

    var servicesData = window.BS_JOKI_SERVICES || [];
    var jokisData = window.BS_JOKI_JOKIS || [];

    document.addEventListener('DOMContentLoaded', function() {
        /* Push Rank Configurator */
        var currentRank = document.getElementById('currentRank');
        var targetRank = document.getElementById('targetRank');
        var gameMode = document.getElementById('gameMode');
        var priority = document.getElementById('priority');
        var server = document.getElementById('server');
        var jokiSelect = document.getElementById('jokiSelect');
        var continueBtn = document.getElementById('continueToOrder');
        var summaryPrice = document.getElementById('summaryPrice');
        var summaryDuration = document.getElementById('summaryDuration');

        if (currentRank && targetRank && continueBtn) {
            initPushRankCalculator();
        }

        /* Weapon Mastery */
        var wmCurrent = document.getElementById('currentMastery');
        var wmTarget = document.getElementById('targetMastery');
        var wmPriority = document.getElementById('wmPriority');
        var wmContinue = document.getElementById('wmContinueToOrder');

        if (wmCurrent && wmTarget && wmContinue) {
            initWeaponMasteryCalculator();
        }

        /* Battle Pass */
        var bpCurrent = document.getElementById('bpCurrentLevel');
        var bpTarget = document.getElementById('bpTargetLevel');
        var bpPriority = document.getElementById('bpPriority');
        var bpContinue = document.getElementById('bpContinueToOrder');

        if (bpCurrent && bpTarget && bpContinue) {
            initBattlePassCalculator();
        }

        /* Order Form Page */
        var orderForm = document.getElementById('orderForm');
        if (orderForm) {
            initOrderForm();
        }
    });

    /* ============ PUSH RANK CALCULATOR ============ */
    function initPushRankCalculator() {
        var currentRank = document.getElementById('currentRank');
        var targetRank = document.getElementById('targetRank');
        var gameMode = document.getElementById('gameMode');
        var priority = document.getElementById('priority');
        var server = document.getElementById('server');
        var jokiSelect = document.getElementById('jokiSelect');
        var continueBtn = document.getElementById('continueToOrder');
        var summaryPrice = document.getElementById('summaryPrice');
        var summaryDuration = document.getElementById('summaryDuration');

        // Populate joki select
        if (jokiSelect && jokisData) {
            jokisData.forEach(function(joki) {
                var option = document.createElement('option');
                option.value = joki.id;
                option.textContent = joki.name;
                jokiSelect.appendChild(option);
            });
        }

        function calculate() {
            var current = parseInt(currentRank.value);
            var target = parseInt(targetRank.value);

            if (target <= current) {
                if (summaryPrice) summaryPrice.textContent = 'Rp 0';
                if (summaryDuration) summaryDuration.textContent = '-';
                if (document.getElementById('summaryTargetRank')) {
                    document.getElementById('summaryTargetRank').textContent = 'Invalid';
                }
                window.BSJokiUtils.showToast('Target rank harus lebih tinggi dari current rank', 'warning');
                return;
            }

            var rankDiff = target - current;
            var basePrice = 50000;
            var rankPriceMultiplier = [1, 1.5, 2, 2.5, 3, 4][rankDiff - 1] || (3 + rankDiff * 0.5);

            var modeMultiplier = { solo: 1, squad: 1.2, ranked: 1.5 }[gameMode.value] || 1;
            var priorityMultiplier = { standard: 1, fast: 1.5, express: 2.5 }[priority.value] || 1;
            var serverMultiplier = { asia: 1, other: 1.3 }[server.value] || 1;

            var totalPrice = Math.round(basePrice * rankPriceMultiplier * modeMultiplier * priorityMultiplier * serverMultiplier / 5000) * 5000;

            var baseDuration = rankDiff * 1;
            var durationMultiplier = { standard: 1, fast: 0.6, express: 0.3 }[priority.value] || 1;
            var totalDays = Math.max(1, Math.ceil(baseDuration * durationMultiplier));

            var durationText = totalDays + (totalDays === 1 ? ' hari' : ' hari');

            if (summaryPrice) summaryPrice.textContent = window.BSJokiUtils.formatCurrency(totalPrice);
            if (summaryDuration) summaryDuration.textContent = durationText;

            if (document.getElementById('summaryCurrentRank')) {
                document.getElementById('summaryCurrentRank').textContent = currentRank.options[currentRank.selectedIndex].text;
            }
            if (document.getElementById('summaryTargetRank')) {
                document.getElementById('summaryTargetRank').textContent = targetRank.options[targetRank.selectedIndex].text;
            }
            if (document.getElementById('summaryMode')) {
                document.getElementById('summaryMode').textContent = gameMode.options[gameMode.selectedIndex].text;
            }
            if (document.getElementById('summaryPriority')) {
                document.getElementById('summaryPriority').textContent = priority.options[priority.selectedIndex].text;
            }
            if (document.getElementById('summaryServer')) {
                document.getElementById('summaryServer').textContent = server.options[server.selectedIndex].text;
            }

            // Store for order
            window._pushRankConfig = {
                currentRank: currentRank.options[currentRank.selectedIndex].text,
                targetRank: targetRank.options[targetRank.selectedIndex].text,
                mode: gameMode.value,
                priority: priority.value,
                server: server.value,
                price: totalPrice,
                duration: durationText
            };
        }

        [currentRank, targetRank, gameMode, priority, server].forEach(function(el) {
            el.addEventListener('change', calculate);
        });

        // Set default target to Silver (index 1)
        if (targetRank) targetRank.value = '1';

        continueBtn.addEventListener('click', function() {
            calculate();
            if (window._pushRankConfig && window._pushRankConfig.targetRank !== 'Invalid') {
                window.location.href = 'order.html?service=push-rank&config=' + encodeURIComponent(JSON.stringify(window._pushRankConfig));
            }
        });

        calculate();
    }

    /* ============ WEAPON MASTERY CALCULATOR ============ */
    function initWeaponMasteryCalculator() {
        var wmCategory = document.getElementById('weaponCategory');
        var wmWeapon = document.getElementById('weaponName');
        var wmCurrent = document.getElementById('currentMastery');
        var wmTarget = document.getElementById('targetMastery');
        var wmPriority = document.getElementById('wmPriority');
        var wmJoki = document.getElementById('wmJokiSelect');
        var wmContinue = document.getElementById('wmContinueToOrder');
        var wmPrice = document.getElementById('wmSummaryPrice');
        var wmDuration = document.getElementById('wmSummaryDuration');

        if (wmJoki && jokisData) {
            jokisData.forEach(function(joki) {
                var option = document.createElement('option');
                option.value = joki.id;
                option.textContent = joki.name;
                wmJoki.appendChild(option);
            });
        }

        var weaponPrices = {
            'AR': 30000, 'SMG': 28000, 'Sniper': 35000, 'Shotgun': 28000, 'Pistol': 22000, 'Melee': 18000
        };

        function wmCalculate() {
            var cat = wmCategory.value;
            var current = parseInt(wmCurrent.value);
            var target = parseInt(wmTarget.value);

            if (target <= current) {
                if (wmPrice) wmPrice.textContent = 'Rp 0';
                window.BSJokiUtils.showToast('Target mastery harus lebih tinggi', 'warning');
                return;
            }

            var diff = target - current;
            var basePrice = weaponPrices[cat] || 30000;
            var priorityMultiplier = { standard: 1, fast: 1.4, express: 2.2 }[wmPriority.value] || 1;
            var totalPrice = Math.round(basePrice * diff * priorityMultiplier / 5000) * 5000;
            var durationDays = Math.max(1, Math.ceil(diff * { standard: 1, fast: 0.5, express: 0.3 }[wmPriority.value] || 1));

            if (wmPrice) wmPrice.textContent = window.BSJokiUtils.formatCurrency(totalPrice);
            if (wmDuration) wmDuration.textContent = durationDays + (durationDays === 1 ? ' hari' : ' hari');

            window._wmConfig = {
                service: 'Weapon Mastery',
                category: wmCategory.options[wmCategory.selectedIndex].text,
                weapon: wmWeapon.options[wmWeapon.selectedIndex].text,
                currentMastery: 'Level ' + (current + 1),
                targetMastery: 'Level ' + (target + 1),
                priority: wmPriority.value,
                price: totalPrice,
                duration: durationDays + ' hari'
            };
        }

        [wmCategory, wmWeapon, wmCurrent, wmTarget, wmPriority].forEach(function(el) {
            el.addEventListener('change', wmCalculate);
        });

        if (wmTarget) wmTarget.value = '1';

        wmContinue.addEventListener('click', function() {
            wmCalculate();
            if (window._wmConfig) {
                window.location.href = 'order.html?service=weapon-mastery&config=' + encodeURIComponent(JSON.stringify(window._wmConfig));
            }
        });

        wmCalculate();
    }

    /* ============ BATTLE PASS CALCULATOR ============ */
    function initBattlePassCalculator() {
        var bpType = document.getElementById('bpType');
        var bpCurrent = document.getElementById('bpCurrentLevel');
        var bpTarget = document.getElementById('bpTargetLevel');
        var bpMission = document.getElementById('bpMissionType');
        var bpPriority = document.getElementById('bpPriority');
        var bpJoki = document.getElementById('bpJokiSelect');
        var bpContinue = document.getElementById('bpContinueToOrder');
        var bpPrice = document.getElementById('bpSummaryPrice');
        var bpDuration = document.getElementById('bpSummaryDuration');

        if (bpJoki && jokisData) {
            jokisData.forEach(function(joki) {
                var option = document.createElement('option');
                option.value = joki.id;
                option.textContent = joki.name;
                bpJoki.appendChild(option);
            });
        }

        function bpCalculate() {
            var current = parseInt(bpCurrent.value) || 0;
            var target = parseInt(bpTarget.value) || 0;

            if (target <= current) {
                if (bpPrice) bpPrice.textContent = 'Rp 0';
                window.BSJokiUtils.showToast('Target level harus lebih tinggi', 'warning');
                return;
            }

            var diff = target - current;
            var typeMultiplier = { free: 1, premium: 1.3, elite: 1.8 }[bpType.value] || 1;
            var missionMultiplier = { daily: 1, weekly: 0.8, event: 0.7, all: 1.2 }[bpMission.value] || 1;
            var priorityMultiplier = { standard: 1, fast: 1.5, express: 2.5 }[bpPriority.value] || 1;
            var totalPrice = Math.round(20000 * diff * typeMultiplier * missionMultiplier * priorityMultiplier / 5000) * 5000;
            var durationDays = Math.max(1, Math.ceil(diff * 0.5 * { standard: 1, fast: 0.5, express: 0.3 }[bpPriority.value] || 1));

            if (bpPrice) bpPrice.textContent = window.BSJokiUtils.formatCurrency(totalPrice);
            if (bpDuration) bpDuration.textContent = durationDays + (durationDays === 1 ? ' hari' : ' hari');

            window._bpConfig = {
                service: 'Battle Pass',
                passType: bpType.options[bpType.selectedIndex].text,
                currentLevel: current,
                targetLevel: target,
                missionType: bpMission.options[bpMission.selectedIndex].text,
                priority: bpPriority.value,
                price: totalPrice,
                duration: durationDays + ' hari'
            };
        }

        [bpType, bpCurrent, bpTarget, bpMission, bpPriority].forEach(function(el) {
            el.addEventListener('input', bpCalculate);
            el.addEventListener('change', bpCalculate);
        });

        bpContinue.addEventListener('click', function() {
            bpCalculate();
            if (window._bpConfig) {
                window.location.href = 'order.html?service=battle-pass&config=' + encodeURIComponent(JSON.stringify(window._bpConfig));
            }
        });

        bpCalculate();
    }

    /* ============ ORDER FORM ============ */
    function initOrderForm() {
        var form = document.getElementById('orderForm');
        var serviceSelect = document.getElementById('serviceSelect');
        var jokiSelect = document.getElementById('jokiSelect');
        var currentRank = document.getElementById('currentRank');
        var targetRank = document.getElementById('targetRank');
        var gameMode = document.getElementById('gameMode');
        var server = document.getElementById('server');
        var priority = document.getElementById('priority');
        var playerId = document.getElementById('playerId');
        var contactName = document.getElementById('contactName');
        var email = document.getElementById('email');
        var notes = document.getElementById('notes');
        var formError = document.getElementById('formError');
        var summaryService = document.getElementById('summaryService');
        var summaryCurrentRank = document.getElementById('summaryCurrentRank');
        var summaryTargetRank = document.getElementById('summaryTargetRank');
        var summaryMode = document.getElementById('summaryMode');
        var summaryServer = document.getElementById('summaryServer');
        var summaryPriority = document.getElementById('summaryPriority');
        var summaryJoki = document.getElementById('summaryJoki');
        var summaryPrice = document.getElementById('summaryPrice');
        var summaryTime = document.getElementById('summaryTime');

        /* Populate service select */
        if (serviceSelect && servicesData) {
            servicesData.forEach(function(service) {
                var option = document.createElement('option');
                option.value = service.id;
                option.textContent = service.name;
                serviceSelect.appendChild(option);
            });
        }

        /* Populate joki select */
        if (jokiSelect && jokisData) {
            jokisData.forEach(function(joki) {
                var option = document.createElement('option');
                option.value = joki.id;
                option.textContent = joki.name;
                jokiSelect.appendChild(option);
            });
        }

        /* Check for query params */
        var serviceParam = window.BSJokiUtils.getQueryParam('service');
        var configParam = window.BSJokiUtils.getQueryParam('config');

        if (serviceParam && serviceSelect) {
            for (var i = 0; i < serviceSelect.options.length; i++) {
                if (serviceSelect.options[i].value === serviceParam) {
                    serviceSelect.selectedIndex = i;
                    break;
                }
            }
        }

        if (configParam) {
            try {
                var config = JSON.parse(configParam);
                if (config.currentRank && currentRank) currentRank.value = config.currentRank;
                if (config.targetRank && targetRank) targetRank.value = config.targetRank;
                if (config.mode && gameMode) gameMode.value = config.mode;
                if (config.server && server) server.value = config.server;
                if (config.priority && priority) priority.value = config.priority;
            } catch (e) {
                console.warn('Invalid config param:', e.message);
            }
        }

        function updateSummary() {
            var selectedService = serviceSelect ? serviceSelect.options[serviceSelect.selectedIndex].text : '-';
            var selCurrentRank = currentRank ? currentRank.value : '-';
            var selTargetRank = targetRank ? targetRank.value : '-';
            var selMode = gameMode ? gameMode.value : '-';
            var selServer = server ? server.value : '-';
            var selPriority = priority ? priority.value : '-';
            var selJoki = jokiSelect && jokiSelect.value ? jokiSelect.options[jokiSelect.selectedIndex].text : 'Auto Assign';

            if (summaryService) summaryService.textContent = selectedService;
            if (summaryCurrentRank) summaryCurrentRank.textContent = selCurrentRank || '-';
            if (summaryTargetRank) summaryTargetRank.textContent = selTargetRank || '-';
            if (summaryMode) summaryMode.textContent = selMode || '-';
            if (summaryServer) summaryServer.textContent = selServer || '-';
            if (summaryPriority) summaryPriority.textContent = selPriority || '-';
            if (summaryJoki) summaryJoki.textContent = selJoki;

            /* Calculate price */
            var price = 0;
            var timeEstimate = '-';

            if (selectedService && selCurrentRank && selTargetRank && selMode && selPriority) {
                var currentRankIdx = currentRank.selectedIndex;
                var targetRankIdx = targetRank.selectedIndex;

                if (targetRankIdx > currentRankIdx) {
                    var rankDiff = targetRankIdx - currentRankIdx;
                    var basePrice = 50000;
                    var rankMult = [1, 1.5, 2, 2.5, 3, 4][rankDiff - 1] || (3 + rankDiff * 0.5);
                    var modeMult = { Solo: 1, Squad: 1.2, Ranked: 1.5 }[selMode] || 1;
                    var priorityMult = { Standard: 1, Fast: 1.5, Express: 2.5 }[selPriority] || 1;
                    var serverMult = { Asia: 1, Other: 1.3 }[selServer] || 1;
                    price = Math.round(basePrice * rankMult * modeMult * priorityMult * serverMult / 5000) * 5000;
                    timeEstimate = Math.max(1, Math.ceil(rankDiff * { Standard: 1, Fast: 0.6, Express: 0.3 }[selPriority] || 1)) + ' hari';
                }
            }

            if (summaryPrice) summaryPrice.textContent = window.BSJokiUtils.formatCurrency(price);
            if (summaryTime) summaryTime.textContent = timeEstimate;

            return price;
        }

        var allFields = [serviceSelect, currentRank, targetRank, gameMode, server, priority, jokiSelect, playerId, contactName, email].filter(Boolean);
        allFields.forEach(function(el) {
            el.addEventListener('change', updateSummary);
            el.addEventListener('input', updateSummary);
        });

        if (notes) notes.addEventListener('input', updateSummary);

        updateSummary();

        /* Form submit */
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            if (formError) formError.style.display = 'none';

            var selectedService = serviceSelect ? serviceSelect.value : '';
            var selCurrentRank = currentRank ? currentRank.value : '';
            var selTargetRank = targetRank ? targetRank.value : '';
            var selMode = gameMode ? gameMode.value : '';
            var selServer = server ? server.value : '';
            var selPriority = priority ? priority.value : '';
            var selJoki = jokiSelect ? jokiSelect.value : '';
            var selPlayerId = playerId ? playerId.value.trim() : '';
            var selContactName = contactName ? contactName.value.trim() : '';
            var selEmail = email ? email.value.trim() : '';
            var selNotes = notes ? notes.value.trim() : '';

            /* Validation */
            if (!selectedService || !selCurrentRank || !selTargetRank || !selMode || !selServer || !selPriority || !selPlayerId || !selContactName || !selEmail) {
                if (formError) {
                    formError.style.display = 'flex';
                }
                window.BSJokiUtils.showToast('Mohon lengkapi semua field yang wajib diisi', 'error');
                return;
            }

            if (selCurrentRank === selTargetRank) {
                window.BSJokiUtils.showToast('Current rank dan target rank tidak boleh sama', 'error');
                return;
            }

            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(selEmail)) {
                window.BSJokiUtils.showToast('Format email tidak valid', 'error');
                return;
            }

            /* Calculate price */
            var price = updateSummary();

            /* Generate Order ID */
            var orderId = generateOrderId();

            /* Create order object */
            var order = {
                id: orderId,
                service: serviceSelect ? serviceSelect.options[serviceSelect.selectedIndex].text : '',
                currentRank: selCurrentRank,
                targetRank: selTargetRank,
                mode: selMode,
                server: selServer,
                priority: selPriority,
                joki: selJoki || 'Auto Assign',
                playerId: selPlayerId,
                contactName: selContactName,
                email: selEmail,
                notes: selNotes,
                price: price,
                estimatedTime: timeEstimate || '1 hari',
                status: 'pending',
                progress: 0,
                createdAt: new Date().toISOString()
            };

            /* Save to LocalStorage */
            var orders = window.BSJokiUtils.getFromStorage('bsjoki_orders', []);
            orders.push(order);
            window.BSJokiUtils.saveToStorage('bsjoki_orders', orders);

            /* Show success modal */
            var modalHtml = '<div class="order-success-icon" aria-hidden="true">✓</div>' +
                '<h3 class="order-success-title">ORDER CREATED</h3>' +
                '<p style="text-align:center;color:var(--text-secondary);font-size:0.85rem;">Your Order ID</p>' +
                '<p class="order-success-id">' + orderId + '</p>' +
                '<p style="text-align:center;color:var(--text-secondary);font-size:0.8rem;margin-bottom:12px;">Simpan Order ID ini untuk melacak order kamu.</p>';

            window.BSJokiUtils.openModal({
                title: '',
                content: modalHtml,
                buttons: [
                    { text: 'TRACK ORDER', class: 'btn-accent', action: 'navigate', href: 'tracking.html?order=' + orderId },
                    { text: 'COPY ORDER ID', class: 'btn-outline', action: 'copy', copy: orderId },
                    { text: 'BACK HOME', class: 'btn-outline', action: 'navigate', href: '../index.html' }
                ]
            });

            window.BSJokiUtils.showToast('Order created successfully', 'success');

            /* Reset form */
            form.reset();
            updateSummary();
        });
    }

    function generateOrderId() {
        var randomNum = Math.floor(100000 + Math.random() * 900000);
        return 'BS-' + randomNum;
    }

    /* ============ EXPOSE ============ */
    window.BSJokiOrder = {
        generateOrderId: generateOrderId
    };

})();