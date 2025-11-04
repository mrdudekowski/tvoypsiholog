/**
 * Модуль управления холстом карт Таро (DRY архитектура)
 * Карты привязаны к позиции в документе напротив карточек Process
 */

(function() {
    'use strict';
    
    /**
     * Конфигурация карт Таро
     * Single Source of Truth для всех параметров анимации
     */
    const CARD_CONFIG = {
        left: {
            selector: '.tarot-card-left',
            targetSelector: '#process-title',  // ИЗМЕНЕНО: было '.step-title'
            targetText: null,                   // ИЗМЕНЕНО: было 'Знакомство'
            horizontalPosition: '3vw',
            horizontalProperty: 'left',
            initialRotation: -15,
            finalRotation: -10,
            levitationRotationStart: -10,
            levitationRotationEnd: -12
        },
        right: {
            selector: '.tarot-card-right',
            targetSelector: '#process-title',  // ИЗМЕНЕНО: было '.process-step'
            targetText: null,                   // ИЗМЕНЕНО: был null (последний элемент)
            horizontalPosition: '3vw',
            horizontalProperty: 'right',
            initialRotation: 15,
            finalRotation: 10,
            levitationRotationStart: 10,
            levitationRotationEnd: 12
        },
        testimonials: {
            selector: '.tarot-card-testimonials',
            targetSelector: '#services-title',  // ИЗМЕНЕНО: перемещено к "Путь трансформации"
            targetText: null,
            horizontalPosition: '3vw',
            horizontalProperty: 'left',
            initialRotation: -12,
            finalRotation: -8,
            levitationRotationStart: -8,
            levitationRotationEnd: -10
        },
        lovers: {
            selector: '.tarot-card-lovers',
            targetSelector: '#services-title',  // ИЗМЕНЕНО: перемещено к "Путь трансформации"
            targetText: null,
            horizontalPosition: '3vw',
            horizontalProperty: 'right',
            initialRotation: 12,
            finalRotation: 8,
            levitationRotationStart: 8,
            levitationRotationEnd: 10
        }
    };
    
    /**
     * Универсальная функция инициализации карты Таро
     * @param {Object} config - Конфигурация карты из CARD_CONFIG
     */
    function initTarotCard(config) {
        const card = document.querySelector(config.selector);
        
        if (!card) {
            console.warn(`⚠️ Не найдена карта: ${config.selector}`);
            return;
        }
        
        // Поиск целевого элемента для привязки
        const targetElement = findTargetElement(config);
        
        if (!targetElement) {
            console.warn(`⚠️ Не найден целевой элемент для ${config.selector}`);
            return;
        }
        
        /**
         * Вычисление и установка финальной позиции карты
         */
        function setCardFinalPosition() {
            requestAnimationFrame(() => {
                const targetRect = targetElement.getBoundingClientRect();
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const targetTopInDocument = targetRect.top + scrollTop;
                
                // Динамическое определение высоты карты через CSS переменные
                function getCardHeight() {
                    const cardElement = document.querySelector('.tarot-card');
                    if (cardElement) {
                        const computedStyle = getComputedStyle(cardElement);
                        return parseInt(computedStyle.height);
                    }
                    
                    // Fallback через matchMedia
                    if (window.matchMedia('(min-width: 1921px)').matches) return 336;
                    if (window.matchMedia('(min-width: 1440px)').matches) return 336;
                    if (window.matchMedia('(min-width: 1200px)').matches) return 302;
                    if (window.matchMedia('(min-width: 1024px)').matches) return 269;
                    if (window.matchMedia('(min-width: 769px)').matches) return 235;
                    return 336;
                }

                const cardHeight = getCardHeight();
                const targetHeight = targetRect.height;
                const finalTop = targetTopInDocument + (targetHeight / 2) - (cardHeight / 2);
                
                // Устанавливаем базовую позицию top один раз, затем используем только для resize
                // Это предотвращает постоянные reflow при скролле
                const baseTop = card.dataset.baseTop ? parseFloat(card.dataset.baseTop) : finalTop;
                
                if (!card.dataset.baseTop) {
                    card.style.top = `${finalTop}px`;
                    card.dataset.baseTop = finalTop;
                } else if (Math.abs(baseTop - finalTop) > 1) {
                    // Обновляем только если позиция значительно изменилась (при resize)
                    card.style.top = `${finalTop}px`;
                    card.dataset.baseTop = finalTop;
                }
                
                // Вычисляем горизонтальное смещение для transform вместо left/right
                // Это предотвращает layout reflow
                const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
                const horizontalOffset = (parseFloat(config.horizontalPosition) / 100) * viewportWidth;
                
                if (!card.dataset.baseHorizontalOffset) {
                    // Устанавливаем базовую позицию left/right один раз для начального позиционирования
                    if (config.horizontalProperty === 'left') {
                        card.style.left = config.horizontalPosition;
                        card.style.right = 'auto';
                    } else {
                        card.style.right = config.horizontalPosition;
                        card.style.left = 'auto';
                    }
                    card.dataset.baseHorizontalOffset = horizontalOffset;
                }
                
                console.log(`📍 ${config.selector} позиция:`, {
                    top: `${finalTop}px`,
                    [config.horizontalProperty]: config.horizontalPosition,
                    transformOffset: `${horizontalOffset}px`,
                    target: config.targetSelector
                });
            });
        }
        
        /**
         * Intersection Observer для активации анимации
         */
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Устанавливаем финальную позицию через requestAnimationFrame
                    setCardFinalPosition();
                    
                    // Активируем slide анимацию через requestAnimationFrame для синхронизации
                    // НЕ меняем left/right - они уже установлены, используем только CSS класс для анимации
                    requestAnimationFrame(() => {
                        setTimeout(() => {
                            requestAnimationFrame(() => {
                                // Добавляем класс active - CSS transition анимирует opacity и transform
                                // left/right уже установлены в setCardFinalPosition, не меняем их здесь
                                card.classList.add('active');
                                
                                console.log(`🎴 ${config.selector} активирована`);
                                
                                // Запуск левитации через 2s после slide
                                setTimeout(() => {
                                    requestAnimationFrame(() => {
                                        card.classList.add('levitating');
                                        console.log(`✨ ${config.selector} левитация`);
                                    });
                                }, 2000);
                            });
                        }, 100);
                    });
                    
                    // Отключаем observer после первой активации
                    observer.unobserve(targetElement);
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '0px'
        });
        
        /**
         * Пересчет позиции при ресайзе окна
         * Только для активных карт
         * Используем requestAnimationFrame для синхронизации
         */
        resizeManager.addHandler(() => {
            if (card.classList.contains('active')) {
                requestAnimationFrame(() => {
                    setCardFinalPosition();
                    // Пересчитываем горизонтальную позицию только при resize
                    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
                    const horizontalOffset = (parseFloat(config.horizontalPosition) / 100) * viewportWidth;
                    card.dataset.baseHorizontalOffset = horizontalOffset;
                    
                    // Обновляем left/right только при resize, не при каждом скролле
                    if (config.horizontalProperty === 'left') {
                        card.style.left = config.horizontalPosition;
                    } else {
                        card.style.right = config.horizontalPosition;
                    }
                });
            }
        });
        
        // Запуск наблюдения
        observer.observe(targetElement);
        console.log(`✅ Триггер установлен для ${config.selector}`);
    }
    
    /**
     * Поиск целевого элемента для привязки карты
     * @param {Object} config - Конфигурация карты
     * @returns {Element|null} Найденный элемент или null
     */
    function findTargetElement(config) {
        // Для элементов с ID используем прямой селектор
        if (config.targetSelector.startsWith('#')) {
            const element = document.querySelector(config.targetSelector);
            return element;
        }
        
        // Fallback для других селекторов (не используется в текущей конфигурации)
        const elements = document.querySelectorAll(config.targetSelector);
        
        if (config.targetText) {
            for (const element of elements) {
                if (element.textContent.includes(config.targetText)) {
                    return element.closest('.process-step') || element;
                }
            }
        }
        
        return elements[0] || elements[elements.length - 1];
    }
    
    /**
     * Мобильная логика (≤768px): карты как оверлей, привязка к секциям
     */
    function initMobileTarotCards() {
        if (window.innerWidth > 768) return;

// Позиционирование пары карт по центру заголовка (горизонтально и вертикально)
function positionCardsAtTitle(titleEl, leftCardSelector, rightCardSelector) {
    if (!titleEl) return;
    const titleRect = titleEl.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docLeft = window.pageXOffset || document.documentElement.scrollLeft || 0;

    const centerY = titleRect.top + scrollTop + titleRect.height / 2;
    const centerX = titleRect.left + docLeft + titleRect.width / 2;

    const gap = Math.max(30, Math.min(60, Math.round(window.innerWidth * 0.15))); // Увеличен gap

    const leftCard = document.querySelector(leftCardSelector);
    const rightCard = document.querySelector(rightCardSelector);
    if (!leftCard || !rightCard) return;

    // измерения карт
    const cardW = leftCard.getBoundingClientRect().width || Math.max(120, Math.min(160, window.innerWidth * 0.28));
    const cardH = leftCard.getBoundingClientRect().height || Math.round(cardW * (336/196));

    const viewportW = document.documentElement.clientWidth;
    const viewportH = document.documentElement.clientHeight;
    const edgeMargin = 4; // Отступ от края экрана
    const minX = edgeMargin;
    const maxX = viewportW - cardW - edgeMargin;

    // Позиционируем ближе к краям, сохраняя центр как ориентир
    let leftX = Math.max(minX, centerX - cardW - gap);
    let rightX = Math.min(maxX, centerX + gap);

    // Проверка, чтобы карты не выходили за пределы viewport по вертикали
    const docH = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight
    );
    const topY = Math.max(edgeMargin, Math.min(centerY - cardH / 2, docH - cardH - edgeMargin));
    
    // Дополнительная проверка: если карта не помещается, уменьшаем gap
    if (leftX + cardW > viewportW - edgeMargin || rightX < edgeMargin) {
        gap = Math.max(20, Math.round(window.innerWidth * 0.1));
        leftX = Math.max(minX, centerX - cardW - gap);
        rightX = Math.min(maxX, centerX + gap);
    }

    // Используем requestAnimationFrame для синхронизации изменений DOM
    requestAnimationFrame(() => {
        // Устанавливаем базовую позицию top один раз
        if (!leftCard.dataset.baseTop) {
            leftCard.style.top = `${topY}px`;
            leftCard.dataset.baseTop = topY;
        }
        if (!rightCard.dataset.baseTop) {
            rightCard.style.top = `${topY}px`;
            rightCard.dataset.baseTop = topY;
        }
        
        // Переопределяем позиционирование через left (для симметрии) и убираем возможные конфликты
        leftCard.style.right = 'auto';
        rightCard.style.right = 'auto';
        leftCard.style.left = `${leftX}px`;
        rightCard.style.left = `${rightX}px`;
    });
}

        // Наблюдатели для карт - синхронизировано с desktop версией
        // Первая пара карт: left и right привязаны к #process-title
        // Вторая пара карт: testimonials и lovers привязаны к #services-title
        const processTitle = document.querySelector('#process-title');
        const servicesTitle = document.querySelector('#services-title');

        if (processTitle) {
            // Триггер для первой пары карт (left и right) у process-title
            let firedGap1 = false;
            const onScrollGap1 = () => {
                if (firedGap1) return;
                const titleTop = processTitle.getBoundingClientRect().top;
                // Срабатывание когда заголовок достигает 75% высоты экрана
                if (titleTop <= window.innerHeight * 0.75) {
                    firedGap1 = true;
                    positionCardsAtTitle(processTitle, '.tarot-card-left', '.tarot-card-right');
                    const left = document.querySelector('.tarot-card-left');
                    const right = document.querySelector('.tarot-card-right');
                    // устранение мерцаний: сначала расставляем позиции, затем в следующем кадре добавляем класс
                    requestAnimationFrame(() => {
                        setTimeout(() => {
                            requestAnimationFrame(() => {
                                if (left && !left.dataset.activated) {
                                    left.classList.add('active');
                                    left.dataset.activated = 'true';
                                }
                                if (right && !right.dataset.activated) {
                                    right.classList.add('active');
                                    right.dataset.activated = 'true';
                                }
                            });
                        }, 100); // Синхронизировано с desktop
                    });
                    window.removeEventListener('scroll', onScrollGap1);
                }
            };
            window.addEventListener('scroll', onScrollGap1, { passive: true });

            // Ресайз/ориентация — актуализировать позицию
            const recalc1 = () => {
                if (!firedGap1) return;
                positionCardsAtTitle(processTitle, '.tarot-card-left', '.tarot-card-right');
            };
            window.addEventListener('resize', recalc1);
            window.addEventListener('orientationchange', recalc1);
        }

        if (servicesTitle) {
            // Триггер для второй пары карт (testimonials и lovers) у services-title (Путь трансформации)
            let firedGap2 = false;
            const onScrollGap2 = () => {
                if (firedGap2) return;
                const titleTop2 = servicesTitle.getBoundingClientRect().top;
                // Срабатывание когда заголовок достигает 75% высоты экрана
                if (titleTop2 <= window.innerHeight * 0.75) {
                    firedGap2 = true;
                    positionCardsAtTitle(servicesTitle, '.tarot-card-testimonials', '.tarot-card-lovers');
                    const left2 = document.querySelector('.tarot-card-testimonials');
                    const right2 = document.querySelector('.tarot-card-lovers');
                    requestAnimationFrame(() => {
                        setTimeout(() => {
                            requestAnimationFrame(() => {
                                if (left2 && !left2.dataset.activated) {
                                    left2.classList.add('active');
                                    left2.dataset.activated = 'true';
                                }
                                if (right2 && !right2.dataset.activated) {
                                    right2.classList.add('active');
                                    right2.dataset.activated = 'true';
                                }
                            });
                        }, 100); // Синхронизировано с desktop
                    });
                    window.removeEventListener('scroll', onScrollGap2);
                }
            };
            window.addEventListener('scroll', onScrollGap2, { passive: true });
            const recalc2 = () => {
                if (!firedGap2) return;
                positionCardsAtTitle(servicesTitle, '.tarot-card-testimonials', '.tarot-card-lovers');
            };
            window.addEventListener('resize', recalc2);
            window.addEventListener('orientationchange', recalc2);
        }
    }

    /**
     * Инициализация всех карт Таро
     */
    function initTarotCanvas() {
        console.log('🎴 Инициализация холста карт Таро (DRY архитектура)');

        // На мобильных используем оверлей-логику
        if (window.innerWidth <= 768) {
            initMobileTarotCards();
            return;
        }
        
        // Desktop-логика
        initTarotCard(CARD_CONFIG.left);
        initTarotCard(CARD_CONFIG.right);
        initTarotCard(CARD_CONFIG.testimonials);
        initTarotCard(CARD_CONFIG.lovers);
        
        console.log('✅ Все четыре карты инициализированы через универсальную функцию');
    }
    
    // Запуск при загрузке DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTarotCanvas);
    } else {
        initTarotCanvas();
    }
})();