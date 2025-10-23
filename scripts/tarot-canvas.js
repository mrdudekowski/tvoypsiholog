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
            targetSelector: '.step-title',
            targetText: 'Знакомство',
            horizontalPosition: '3vw',
            horizontalProperty: 'left',
            initialRotation: -15,
            finalRotation: -10,
            levitationRotationStart: -10,
            levitationRotationEnd: -12
        },
        right: {
            selector: '.tarot-card-right',
            targetSelector: '.process-step',
            targetText: null, // null = последний элемент
            horizontalPosition: '3vw',
            horizontalProperty: 'right',
            initialRotation: 15,
            finalRotation: 10,
            levitationRotationStart: 10,
            levitationRotationEnd: 12
        },
        testimonials: {
            selector: '.tarot-card-testimonials',
            targetSelector: '.testimonials',
            targetText: null, // null = первый элемент секции
            horizontalPosition: '2vw',
            horizontalProperty: 'left',
            initialRotation: -12,
            finalRotation: -8,
            levitationRotationStart: -8,
            levitationRotationEnd: -10
        },
        lovers: {
            selector: '.tarot-card-lovers',
            targetSelector: '.testimonials',
            targetText: null, // null = первый элемент секции
            horizontalPosition: '2vw',
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
            const targetRect = targetElement.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const targetTopInDocument = targetRect.top + scrollTop;
            
            const cardHeight = 160; /* Обновляем под новый размер карт */
            const targetHeight = targetRect.height;
            let finalTop = targetTopInDocument + (targetHeight / 2) - (cardHeight / 2);
            
            // Для третьей карты добавляем смещение вниз на 70px
            if (config.selector === '.tarot-card-testimonials') {
                finalTop += 70;
            }
            
            // Для четвертой карты добавляем смещение вниз на 70px (на том же уровне, что и третья)
            if (config.selector === '.tarot-card-lovers') {
                finalTop += 70;
            }
            
            card.style.top = `${finalTop}px`;
            
            console.log(`📍 ${config.selector} позиция:`, {
                top: `${finalTop}px`,
                [config.horizontalProperty]: config.horizontalPosition,
                offset: config.selector === '.tarot-card-testimonials' ? '+300px' : 'none'
            });
        }
        
        /**
         * Intersection Observer для активации анимации
         */
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Устанавливаем финальную позицию
                    setCardFinalPosition();
                    
                    // Активируем slide анимацию через 100ms
                    setTimeout(() => {
                        card.classList.add('active');
                        card.style[config.horizontalProperty] = config.horizontalPosition;
                        
                        console.log(`🎴 ${config.selector} активирована`);
                        
                        // Запуск левитации через 2s после slide
                        setTimeout(() => {
                            card.classList.add('levitating');
                            console.log(`✨ ${config.selector} левитация`);
                        }, 2000);
                    }, 100);
                    
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
         */
        window.addEventListener('resize', () => {
            if (card.classList.contains('active')) {
                setCardFinalPosition();
                card.style[config.horizontalProperty] = config.horizontalPosition;
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
        const elements = document.querySelectorAll(config.targetSelector);
        
        // Если указан текст для поиска
        if (config.targetText) {
            for (const element of elements) {
                if (element.textContent.includes(config.targetText)) {
                    return element.closest('.process-step') || element;
                }
            }
        }
        
        // Для testimonials возвращаем первый элемент секции
        if (config.selector === '.tarot-card-testimonials') {
            return elements[0];
        }
        
        // Для lovers возвращаем первый элемент секции
        if (config.selector === '.tarot-card-lovers') {
            return elements[0];
        }
        
        // Иначе возвращаем последний элемент (для правой карты)
        return elements[elements.length - 1];
    }
    
    /**
     * Инициализация всех карт Таро
     */
    function initTarotCanvas() {
        console.log('🎴 Инициализация холста карт Таро (DRY архитектура)');
        
        // Инициализируем все четыре карты через единую функцию
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