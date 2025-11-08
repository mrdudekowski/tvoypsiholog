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
        },
        contactLeft: {
            selector: '.tarot-card-contact-left',
            targetSelector: '#contact-title',
            targetText: null,
            horizontalPosition: '3vw',
            horizontalProperty: 'left',
            initialRotation: -15,
            finalRotation: -10,
            levitationRotationStart: -10,
            levitationRotationEnd: -12
        },
        contactRight: {
            selector: '.tarot-card-contact-right',
            targetSelector: '#contact-title',
            targetText: null,
            horizontalPosition: '3vw',
            horizontalProperty: 'right',
            initialRotation: 15,
            finalRotation: 10,
            levitationRotationStart: 10,
            levitationRotationEnd: 12
        }
    };
    
    /**
     * Универсальная функция инициализации карты Таро
     * @param {Object} config - Конфигурация карты из CARD_CONFIG
     */
    function initTarotCard(config) {
        const card = document.querySelector(config.selector);
        
        if (!card) {
            return;
        }
        
        // Поиск целевого элемента для привязки
        const targetElement = findTargetElement(config);
        
        if (!targetElement) {
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
                                
                                
                                // Запуск левитации через 2s после slide
                                setTimeout(() => {
                                    requestAnimationFrame(() => {
                                        card.classList.add('levitating');
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

        /**
         * Позиционирование пары карт по центру заголовка (горизонтально и вертикально)
         * Рефакторинг: вычисления вынесены в отдельные функции для улучшения читаемости
         */
        function positionCardsAtTitle(titleEl, leftCardSelector, rightCardSelector) {
            if (!titleEl) return;
            
            const leftCard = document.querySelector(leftCardSelector);
            const rightCard = document.querySelector(rightCardSelector);
            if (!leftCard || !rightCard) return;

            /**
             * Вычисляет центр заголовка (X, Y) в координатах документа
             */
            function calculateTitleCenter(titleEl) {
                const titleRect = titleEl.getBoundingClientRect();
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                const docLeft = window.pageXOffset || document.documentElement.scrollLeft || 0;
                
                return {
                    x: titleRect.left + docLeft + titleRect.width / 2,
                    y: titleRect.top + scrollTop + titleRect.height / 2
                };
            }

            /**
             * Вычисляет gap между картами на основе ширины экрана
             */
            function calculateCardGap() {
                return Math.max(30, Math.min(60, Math.round(window.innerWidth * 0.15)));
            }

            /**
             * Вычисляет размеры карты
             */
            function calculateCardDimensions(card) {
                const rect = card.getBoundingClientRect();
                const width = rect.width || Math.max(120, Math.min(160, window.innerWidth * 0.28));
                const height = rect.height || Math.round(width * (336/196));
                return { width, height };
            }

            /**
             * Вычисляет позиции карт с учетом границ viewport
             */
            function calculateCardPositions(centerX, centerY, cardW, cardH, gap) {
                const viewportW = document.documentElement.clientWidth;
                const edgeMargin = 4;
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

                return { leftX, rightX, topY, edgeMargin, minX, maxX, viewportW };
            }

            /**
             * Проверяет и корректирует позиции карт, если они не помещаются
             */
            function validateCardPositions(leftX, rightX, cardW, centerX, gap, minX, maxX, edgeMargin, viewportW) {
                let finalGap = gap;
                let finalLeftX = leftX;
                let finalRightX = rightX;

                // Дополнительная проверка: если карта не помещается, уменьшаем gap
                if (leftX + cardW > viewportW - edgeMargin || rightX < edgeMargin) {
                    finalGap = Math.max(20, Math.round(window.innerWidth * 0.1));
                    finalLeftX = Math.max(minX, centerX - cardW - finalGap);
                    finalRightX = Math.min(maxX, centerX + finalGap);
                }

                return { leftX: finalLeftX, rightX: finalRightX };
            }

            // Выполняем вычисления
            const center = calculateTitleCenter(titleEl);
            let gap = calculateCardGap();
            const cardDimensions = calculateCardDimensions(leftCard);
            const positions = calculateCardPositions(center.x, center.y, cardDimensions.width, cardDimensions.height, gap);
            const validatedPositions = validateCardPositions(
                positions.leftX, 
                positions.rightX, 
                cardDimensions.width, 
                center.x, 
                gap, 
                positions.minX, 
                positions.maxX, 
                positions.edgeMargin, 
                positions.viewportW
            );

            // Используем requestAnimationFrame для синхронизации изменений DOM
            requestAnimationFrame(() => {
                // Устанавливаем базовую позицию top один раз
                if (!leftCard.dataset.baseTop) {
                    leftCard.style.top = `${positions.topY}px`;
                    leftCard.dataset.baseTop = positions.topY;
                }
                if (!rightCard.dataset.baseTop) {
                    rightCard.style.top = `${positions.topY}px`;
                    rightCard.dataset.baseTop = positions.topY;
                }
                
                // Переопределяем позиционирование через left (для симметрии) и убираем возможные конфликты
                leftCard.style.right = 'auto';
                rightCard.style.right = 'auto';
                leftCard.style.left = `${validatedPositions.leftX}px`;
                rightCard.style.left = `${validatedPositions.rightX}px`;
            });
        }

        /**
         * Универсальная функция для настройки триггера пары карт
         * Устраняет дублирование кода для разных пар карт
         * @param {HTMLElement} titleElement - Элемент заголовка для привязки
         * @param {string} leftCardSelector - Селектор левой карты
         * @param {string} rightCardSelector - Селектор правой карты
         */
        function setupCardPairTrigger(titleElement, leftCardSelector, rightCardSelector) {
            if (!titleElement) return;

            let fired = false;
            const SCROLL_THRESHOLD = 0.75; // 75% высоты экрана
            const ACTIVATION_DELAY = 100; // Задержка активации в мс

            /**
             * Обработчик скролла для активации карт
             */
            const onScroll = () => {
                if (fired) return;
                
                const titleTop = titleElement.getBoundingClientRect().top;
                // Срабатывание когда заголовок достигает 75% высоты экрана
                if (titleTop <= window.innerHeight * SCROLL_THRESHOLD) {
                    fired = true;
                    
                    // Позиционируем карты
                    positionCardsAtTitle(titleElement, leftCardSelector, rightCardSelector);
                    
                    // Получаем элементы карт
                    const leftCard = document.querySelector(leftCardSelector);
                    const rightCard = document.querySelector(rightCardSelector);
                    
                    // Устранение мерцаний: сначала расставляем позиции, затем в следующем кадре добавляем класс
                    requestAnimationFrame(() => {
                        setTimeout(() => {
                            requestAnimationFrame(() => {
                                if (leftCard && !leftCard.dataset.activated) {
                                    leftCard.classList.add('active');
                                    leftCard.dataset.activated = 'true';
                                }
                                if (rightCard && !rightCard.dataset.activated) {
                                    rightCard.classList.add('active');
                                    rightCard.dataset.activated = 'true';
                                }
                            });
                        }, ACTIVATION_DELAY); // Синхронизировано с desktop
                    });
                    
                    window.removeEventListener('scroll', onScroll);
                }
            };

            /**
             * Обработчик ресайза/изменения ориентации для пересчета позиций
             */
            const onResize = () => {
                if (!fired) return;
                positionCardsAtTitle(titleElement, leftCardSelector, rightCardSelector);
            };

            // Добавляем обработчики событий
            window.addEventListener('scroll', onScroll, { passive: true });
            window.addEventListener('resize', onResize);
            window.addEventListener('orientationchange', onResize);
        }

        // Наблюдатели для карт - синхронизировано с desktop версией
        // Первая пара карт: left и right привязаны к #process-title
        // Вторая пара карт: testimonials и lovers привязаны к #services-title
        // Третья пара карт: contactLeft и contactRight привязаны к #contact-title
        const processTitle = document.querySelector('#process-title');
        const servicesTitle = document.querySelector('#services-title');
        const contactTitle = document.querySelector('#contact-title');

        if (processTitle) {
            setupCardPairTrigger(processTitle, '.tarot-card-left', '.tarot-card-right');
        }

        if (servicesTitle) {
            setupCardPairTrigger(servicesTitle, '.tarot-card-testimonials', '.tarot-card-lovers');
        }

        if (contactTitle) {
            setupCardPairTrigger(contactTitle, '.tarot-card-contact-left', '.tarot-card-contact-right');
        }
    }

    /**
     * Инициализация всех карт Таро
     */
    function initTarotCanvas() {

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
        initTarotCard(CARD_CONFIG.contactLeft);
        initTarotCard(CARD_CONFIG.contactRight);
        
    }
    
    // Запуск при загрузке DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTarotCanvas);
    } else {
        initTarotCanvas();
    }
})();