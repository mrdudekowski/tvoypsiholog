/**
 * Основной JavaScript для лендинга таролога
 * Обеспечивает интерактивность и плавность интерфейса
 */

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
    initializeSite();
});

/**
 * Инициализирует сайт и все интерактивные элементы
 */
function initializeSite() {
    // Инициализация компонентов
    initializeScrollAnimations();
    initializeSmoothScroll();
    initializeContactButtons();
    initializeCertificatesModal();
    initializePrivacyModal();
    initializeTermsModal();
    initializeContactFormModal();
    initializeBurgerMenu();
    initializePerformanceOptimizations();

}

/**
 * Инициализирует анимации при скролле
 * Поддерживает data-scroll-reveal атрибуты для секций и элементов
 */
function initializeScrollAnimations() {
    // Проверка поддержки Intersection Observer
    if (!('IntersectionObserver' in window)) {
        // Показываем все элементы без анимаций
        document.querySelectorAll('[data-scroll-reveal]').forEach(el => {
            el.style.opacity = '1';
        });
        return;
    }

    // Проверка prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        document.querySelectorAll('[data-scroll-reveal]').forEach(el => {
            el.style.opacity = '1';
        });
        return;
    }

    // Настройки для Intersection Observer
    // Увеличен rootMargin для более раннего старта анимаций, чтобы избежать конфликта с картами
    const observerOptions = {
        threshold: 0.2, // Триггер при 20% видимости для более раннего появления
        rootMargin: '0px 0px -100px 0px' // Увеличенный отступ для более раннего старта анимаций
    };

    // Создаем Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                
                // Получаем тип анимации из data-атрибута
                const animationType = target.dataset.scrollReveal || 'fadeInUp';
                
                // Определяем задержку в зависимости от элемента
                // Для секции contact увеличиваем задержку чтобы карты позиционировались первыми
                const isContactSection = target.closest('.contact') !== null;
                const isContactInfo = target.classList.contains('contact-info');
                
                // Для contact-info дополнительно увеличиваем задержку
                // Карты позиционируются за ~100ms (desktop) или ~100ms (mobile)
                // Анимация должна начаться после позиционирования карт
                const baseDelay = isContactInfo ? 250 : (isContactSection ? 150 : 50);
                const customDelay = target.dataset.delay ? parseInt(target.dataset.delay) : 0;
                const totalDelay = baseDelay + customDelay;
                
                // Используем requestAnimationFrame для синхронизации с repaint
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        requestAnimationFrame(() => {
                            // Применяем соответствующую анимацию
                            target.classList.add(`animate-${animationType}`);
                        });
                    }, totalDelay); // Задержка для синхронизации с позиционированием карт
                });
                
                // Добавляем класс animated после завершения анимации
                target.addEventListener('animationend', function handleAnimationEnd(e) {
                    if (e.animationName.includes('fadeIn') || e.animationName.includes('slideIn')) {
                        target.classList.add('animated');
                        target.style.willChange = 'auto';
                        // После завершения анимации можно вернуть transition для hover
                        if (target.classList.contains('testimonial-card')) {
                            target.style.transition = 'box-shadow 0.3s ease, border-color 0.3s ease';
                        }
                        this.removeEventListener('animationend', handleAnimationEnd);
                    }
                }, { once: true });
                
                // Прекращаем наблюдение после анимации
                observer.unobserve(target);
                
            }
        });
    }, observerOptions);

    // Наблюдаем за элементами с data-scroll-reveal
    const scrollRevealElements = document.querySelectorAll('[data-scroll-reveal]');
    scrollRevealElements.forEach(element => {
        observer.observe(element);
    });

    // Также наблюдаем за старыми элементами (обратная совместимость)
    // testimonial-card исключены - у них больше нет анимаций появления, только карусель
    const legacyElements = document.querySelectorAll(
        '.service-card:not([data-scroll-reveal]), .process-step:not([data-scroll-reveal])'
    );

    legacyElements.forEach(element => {
        const isServicesCardWithParentAnimation =
            element.classList.contains('service-card') &&
            element.closest('.services[data-scroll-reveal]');

        if (isServicesCardWithParentAnimation) {
            return;
        }

        observer.observe(element);
        // Для старых элементов используем дефолтную анимацию
        // Единый класс анимации в CamelCase для консистентности
        element.addEventListener('animationstart', function addLegacyClass() {
            if (!this.classList.contains('animate-fadeInUp')) {
                this.classList.add('animate-fadeInUp');
            }
        }, { once: true });
    });

}

// FAQ удален

/**
 * Инициализирует плавный скролл для навигации
 */
function initializeSmoothScroll() {
    // Обработка кликов по якорным ссылкам
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                const headerHeight = document.querySelector('.site-header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Инициализирует модальное окно с сертификатами
 */
function initializeCertificatesModal() {
    const modal = document.getElementById('certificatesModal');
    const openBtn = document.getElementById('openCertificatesBtn');
    const closeBtn = modal?.querySelector('.modal-close');
    
    if (!modal || !openBtn) {
        return;
    }

    // Переменная для хранения cleanup функции focus trap
    let focusTrapCleanup = null;

    /**
     * Предзагружает изображения сертификатов
     */
    function preloadCertificateImages() {
        const certificateSources = modal.querySelectorAll('.certificate-item picture source[type="image/webp"]');
        const certificateImages = modal.querySelectorAll('.certificate-item img');
        
        // Предзагрузка webp изображений из source
        certificateSources.forEach((source) => {
            const srcset = source.getAttribute('srcset');
            if (srcset) {
                // Берем URL из srcset (убираем дескрипторы размеров если есть)
                const url = srcset.split(/\s+/)[0];
                if (url) {
                    const link = document.createElement('link');
                    link.rel = 'preload';
                    link.as = 'image';
                    link.href = url;
                    link.type = 'image/webp';
                    document.head.appendChild(link);
                }
            }
        });
        
        // Предзагрузка fallback jpg изображений (только для первых 3 для оптимизации)
        certificateImages.forEach((img, index) => {
            if (index < 3 && img.src && !img.complete) {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'image';
                link.href = img.src;
                document.head.appendChild(link);
            }
        });
    }

    /**
     * Вычисляет и устанавливает позицию кнопки закрытия
     */
    function updateCloseButtonPosition() {
        if (!closeBtn) return;
        
        const modalContent = modal.querySelector('.modal-glassmorphism');
        if (!modalContent) return;
        
        const scrollTop = modalContent.scrollTop;
        const scrollHeight = modalContent.scrollHeight;
        const clientHeight = modalContent.clientHeight;
        const threshold = 100; // пикселей от конца
        
        // Проверяем, есть ли скролл (контент больше высоты окна)
        const hasScroll = scrollHeight > clientHeight;
        
        // Если скролла нет, оставляем кнопку вверху
        if (!hasScroll) {
            closeBtn.classList.remove('scrolled-to-bottom');
            closeBtn.style.transform = 'translateY(0)';
            closeBtn.style.setProperty('--close-btn-translate-y', '0');
            return;
        }
        
        // Проверяем, достиг ли пользователь низа (с threshold)
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - threshold;
        
        // Проверяем, находится ли пользователь вверху (с threshold)
        const isAtTop = scrollTop <= threshold;
        
        // Вычисляем расстояние для перемещения кнопки
        // Кнопка должна фиксироваться по нижнему краю ВСЕГО контента (scrollHeight), а не видимой области
        const computedStyle = window.getComputedStyle(closeBtn);
        const topValue = parseInt(computedStyle.top) || 16;
        const buttonHeight = parseInt(computedStyle.height) || 44;
        const bottomOffset = 16; // отступ снизу от края контейнера
        
        // Используем scrollHeight (полная высота контента) для вычисления позиции внизу
        // Кнопка должна быть внизу под последним сертификатом
        // Позиция внизу от верха всего контента = scrollHeight - bottomOffset - buttonHeight
        const targetBottomPosition = scrollHeight - bottomOffset - buttonHeight;
        const translateY = targetBottomPosition - topValue;
        
        if (isAtBottom) {
            // Пользователь внизу - кнопка съезжает вниз
            closeBtn.classList.add('scrolled-to-bottom');
            closeBtn.style.transform = `translateY(${translateY}px)`;
            closeBtn.style.setProperty('--close-btn-translate-y', `${translateY}px`);
        } else if (isAtTop) {
            // Пользователь вверху - кнопка возвращается наверх
            closeBtn.classList.remove('scrolled-to-bottom');
            closeBtn.style.transform = 'translateY(0)';
            closeBtn.style.setProperty('--close-btn-translate-y', '0');
        }
    }

    /**
     * Отслеживает скролл модального окна и управляет позицией кнопки закрытия
     */
    function handleModalScroll(e) {
        updateCloseButtonPosition();
    }

    /**
     * Открывает модальное окно
     */
    function openModal() {
        // Предзагрузка изображений при первом открытии
        if (!modal.dataset.imagesPreloaded) {
            preloadCertificateImages();
            modal.dataset.imagesPreloaded = 'true';
        }
        
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        document.body.style.overflow = 'hidden';
        
        // Инициализируем focus trap
        if (window.ModalFocusTrap) {
            const trapResult = window.ModalFocusTrap.initialize(modal, openBtn);
            if (trapResult) {
                focusTrapCleanup = trapResult.cleanup;
            }
        } else {
            // Fallback: фокус на кнопку закрытия
            closeBtn?.focus();
        }
        
        // Проверяем начальное состояние скролла после открытия
        // Небольшая задержка для корректного расчета размеров
        setTimeout(() => {
            updateCloseButtonPosition();
        }, 100);
        
        // Обновляем позицию при изменении размера окна
        window.addEventListener('resize', () => {
            if (modal.classList.contains('active')) {
                updateCloseButtonPosition();
            }
        });
        
        // Трекинг события
        trackEvent('certificates', 'modal_open');
    }

    /**
     * Закрывает модальное окно
     */
    function closeModal() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        
        // Сбрасываем состояние кнопки закрытия (возвращаем наверх)
        if (closeBtn) {
            closeBtn.classList.remove('scrolled-to-bottom');
            closeBtn.style.transform = 'translateY(0)';
            closeBtn.style.setProperty('--close-btn-translate-y', '0');
        }
        
        // Очищаем focus trap
        if (focusTrapCleanup) {
            focusTrapCleanup();
            focusTrapCleanup = null;
        }
        
        // Трекинг события
        trackEvent('certificates', 'modal_close');
    }

    // Открытие модального окна по клику на кнопку
    openBtn.addEventListener('click', openModal);

    // Закрытие по клику на кнопку закрытия
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // Закрытие по клику вне модального окна (на overlay)
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Закрытие по клавише ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // Трекинг просмотра отдельных сертификатов
    const certificateImages = modal.querySelectorAll('.certificate-item img');
    certificateImages.forEach((img, index) => {
        img.addEventListener('click', () => {
            trackEvent('certificates', 'certificate_view', `certificate_${index + 1}`);
        });
    });

    // Добавляем обработчик скролла на модальное окно
    // Важно: обработчик должен быть добавлен после того, как элементы доступны
    // Скролл происходит на .modal-glassmorphism (overflow-y: auto)
    const modalContent = modal.querySelector('.modal-glassmorphism');
    if (modalContent && closeBtn) {
        // Обработчик скролла на .modal-glassmorphism
        modalContent.addEventListener('scroll', function(e) {
            handleModalScroll(e);
        }, { passive: true });
        
        // Также добавляем обработчик на modal-overlay на случай, если скролл там
        modal.addEventListener('scroll', function(e) {
            handleModalScroll(e);
        }, { passive: true });
    }
}

/**
 * Инициализирует модальное окно Политики конфиденциальности
 */
function initializePrivacyModal() {
    const modal = document.getElementById('privacyModal');
    const openBtn = document.getElementById('openPrivacyModal');
    const closeBtn = document.getElementById('closePrivacyModal');
    
    if (!modal || !openBtn) {
        return;
    }

    // Переменная для хранения cleanup функции focus trap
    let focusTrapCleanup = null;

    /**
     * Открывает модальное окно
     */
    function openModal() {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        document.body.style.overflow = 'hidden';
        
        // Инициализируем focus trap
        if (window.ModalFocusTrap) {
            const trapResult = window.ModalFocusTrap.initialize(modal, openBtn);
            if (trapResult) {
                focusTrapCleanup = trapResult.cleanup;
            }
        } else {
            // Fallback: фокус на кнопку закрытия
            closeBtn?.focus();
        }
        
        // Трекинг события
        trackEvent('privacy_policy', 'modal_open');
    }

    /**
     * Закрывает модальное окно
     */
    function closeModal() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        
        // Очищаем focus trap
        if (focusTrapCleanup) {
            focusTrapCleanup();
            focusTrapCleanup = null;
        }
        
        // Трекинг события
        trackEvent('privacy_policy', 'modal_close');
    }

    // Открытие модального окна по клику на кнопку
    openBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
    });

    // Закрытие по клику на кнопку закрытия
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // Закрытие по клику вне модального окна (на overlay)
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Закрытие по клавише ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

/**
 * Инициализирует модальное окно Пользовательского соглашения
 */
function initializeTermsModal() {
    const modal = document.getElementById('termsModal');
    const openBtn = document.getElementById('openTermsModal');
    const openBtnFromForm = document.getElementById('openTermsModalFromForm');
    const closeBtn = document.getElementById('closeTermsModal');
    
    if (!modal || (!openBtn && !openBtnFromForm)) {
        return;
    }

    // Переменная для хранения cleanup функции focus trap
    let focusTrapCleanup = null;

    /**
     * Открывает модальное окно
     */
    function openModal() {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        document.body.style.overflow = 'hidden';
        
        // Инициализируем focus trap
        const triggerBtn = openBtn || openBtnFromForm;
        if (window.ModalFocusTrap) {
            const trapResult = window.ModalFocusTrap.initialize(modal, triggerBtn);
            if (trapResult) {
                focusTrapCleanup = trapResult.cleanup;
            }
        } else {
            // Fallback: фокус на кнопку закрытия
            closeBtn?.focus();
        }
        
        // Трекинг события
        trackEvent('terms_of_service', 'modal_open');
    }

    /**
     * Закрывает модальное окно
     */
    function closeModal() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        
        // Очищаем focus trap
        if (focusTrapCleanup) {
            focusTrapCleanup();
            focusTrapCleanup = null;
        }
        
        // Трекинг события
        trackEvent('terms_of_service', 'modal_close');
    }

    // Открытие модального окна по клику на кнопку в футере
    if (openBtn) {
        openBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });
    }

    // Открытие модального окна по клику на кнопку в форме
    if (openBtnFromForm) {
        openBtnFromForm.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });
    }

    // Закрытие по клику на кнопку закрытия
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // Закрытие по клику вне модального окна (на overlay)
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Закрытие по клавише ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

/**
 * Инициализирует кнопки связи с мессенджерами
 */
function initializeContactButtons() {
    // Добавляем обработчики для кнопок мессенджеров
    const telegramBtn = document.querySelector('.telegram-btn');
    const whatsappBtn = document.querySelector('.whatsapp-btn');
    const phoneBtn = document.querySelector('.phone-btn');

    if (telegramBtn) {
        telegramBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.open(SITE_CONFIG.urls.telegram, '_blank', 'noopener,noreferrer');
            trackEvent('contact_click', 'telegram');
        });
    }

    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.open(SITE_CONFIG.urls.whatsapp, '_blank', 'noopener,noreferrer');
            trackEvent('contact_click', 'whatsapp');
        });
    }

    if (phoneBtn) {
        phoneBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = SITE_CONFIG.urls.phone;
            trackEvent('contact_click', 'phone');
        });
    }
}

/**
 * Инициализирует оптимизации производительности
 * УДАЛЕНО: loadLazyImages() - не используется (все изображения используют нативный loading="lazy", нет data-src)
 * УДАЛЕНО: preloadCriticalResources() - не используется (шрифты уже предзагружены в HTML)
 * Нативный lazy loading работает автоматически, дополнительная логика не требуется
 */
function initializePerformanceOptimizations() {
    // Lazy loading и предзагрузка ресурсов обрабатываются нативно через HTML атрибуты
    // Все современные браузеры поддерживают loading="lazy" и preload ссылки
}

/**
 * Трекинг событий для аналитики
 */
function trackEvent(category, action, label = null) {
    // Простая реализация трекинга (можно заменить на GA, YM, etc.)

    // Здесь можно добавить интеграцию с аналитикой
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            event_category: category,
            event_label: label
        });
    }
}

/**
 * Утилиты валидации форм
 * Вынесены из initializeContactFormModal() для переиспользования
 */

/**
 * Валидирует телефонный номер
 * 
 * ЛОГИКА РАБОТЫ:
 * 1. Проверяет базовый формат через regex (допускает +, цифры, пробелы, дефисы, скобки)
 * 2. Извлекает только цифры из номера (убирает все форматирование)
 * 3. Проверяет количество цифр: минимум 10, максимум 11
 * 
 * ПРИМЕРЫ:
 * ✅ "+7 (999) 123-45-67" → 11 цифр → валиден
 * ✅ "+7 999 123 45 67" → 11 цифр → валиден
 * ✅ "89991234567" → 11 цифр (8 заменяется на 7) → валиден
 * ✅ "+1 234 567 8901" → 11 цифр → валиден
 * ❌ "+7 (999) 123-45" → 9 цифр → невалиден (меньше 10)
 * ❌ "+7 (999) 123-45-67-89" → 13 цифр → невалиден (больше 11)
 * 
 * @param {string} phone - Номер телефона для валидации
 * @returns {boolean} true если номер валиден (10-11 цифр)
 */
function validatePhone(phone) {
    if (!phone) return false;
    
    // Шаг 1: Проверяем базовый формат (допускаем +, цифры, пробелы, дефисы, скобки)
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;
    if (!phoneRegex.test(phone)) {
        return false;
    }
    
    // Шаг 2: Извлекаем только цифры (убираем все форматирование: пробелы, дефисы, скобки, +)
    const digitsOnly = phone.replace(/\D/g, '');
    
    // Шаг 3: Проверяем количество цифр (минимум 10, максимум 11)
    const digitCount = digitsOnly.length;
    return digitCount >= 10 && digitCount <= 11;
}

/**
 * Валидирует email адрес
 * 
 * ЛОГИКА РАБОТЫ:
 * Требует формат: text-@-text
 * 1. Локальная часть (text): минимум 1 символ, не содержит пробелы и @
 * 2. Символ @ обязателен
 * 3. Доменная часть (text): минимум 1 символ, не содержит пробелы и @
 * 
 * ПРИМЕРЫ:
 * ✅ "user@example.com" → валиден
 * ✅ "test@domain" → валиден
 * ✅ "name@mail.ru" → валиден
 * ❌ "@example.com" → невалиден (нет локальной части)
 * ❌ "user@" → невалиден (нет доменной части)
 * ❌ "user @example.com" → невалиден (пробел в email)
 * ❌ "user@example@com" → невалиден (два символа @)
 * 
 * @param {string} email - Email для валидации (опциональный)
 * @returns {boolean} true если email валиден или пустой
 */
function validateEmail(email) {
    // Email опциональный - если пустой, возвращаем true
    if (!email || !email.trim()) return true;
    
    // Простая валидация: text-@-text
    // [^\s@]+ - локальная часть (минимум 1 символ, не пробел и не @)
    // @ - обязательный символ
    // [^\s@]+ - доменная часть (минимум 1 символ, не пробел и не @)
    const emailRegex = /^[^\s@]+@[^\s@]+$/;
    return emailRegex.test(email.trim());
}

/**
 * Инициализирует модальное окно формы обратной связи
 */
function initializeContactFormModal() {
    const modal = document.getElementById('contactModal');
    const openBtn = document.getElementById('openContactModal');
    const closeBtn = document.getElementById('closeContactModal');
    const form = document.getElementById('contactForm');
    const phoneInput = document.getElementById('contactPhone');
    const notification = document.getElementById('successNotification');
    
    if (!modal || !openBtn || !form) {
        return;
    }

    // URL Google Apps Script webhook из конфигурации
    const WEBHOOK_URL = SITE_CONFIG.urls.webhook;

    // Переменная для хранения cleanup функции focus trap
    let focusTrapCleanup = null;

    /**
     * Открывает модальное окно
     */
    function openModal() {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        
        // Инициализируем focus trap
        if (window.ModalFocusTrap) {
            const trapResult = window.ModalFocusTrap.initialize(modal, openBtn);
            if (trapResult) {
                focusTrapCleanup = trapResult.cleanup;
            }
        } else {
            // Fallback: фокус на кнопку закрытия
            closeBtn?.focus();
        }
        
        trackEvent('contact_form', 'modal_open');
    }

    /**
     * Закрывает модальное окно
     */
    function closeModal() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        
        // Очищаем focus trap
        if (focusTrapCleanup) {
            focusTrapCleanup();
            focusTrapCleanup = null;
        }
        
        trackEvent('contact_form', 'modal_close');
    }

    /**
     * Показывает уведомление об успехе
     */
    function showSuccessNotification() {
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 4000);
    }

    /**
     * Применяет маску к телефонному номеру
     */
    function applyPhoneMask(input) {
        let value = input.value.replace(/\D/g, '');
        
        // Если начинается с 8, заменяем на 7
        if (value.startsWith('8')) {
            value = '7' + value.substring(1);
        }
        
        // Если не начинается с +, добавляем +
        if (!input.value.startsWith('+') && value.length > 0) {
            input.value = '+' + value;
        }
        
        // Форматирование для российских номеров
        if (value.startsWith('7') && value.length > 1) {
            let formatted = '+7';
            if (value.length > 1) formatted += ' (' + value.substring(1, 4);
            if (value.length > 4) formatted += ') ' + value.substring(4, 7);
            if (value.length > 7) formatted += '-' + value.substring(7, 9);
            if (value.length > 9) formatted += '-' + value.substring(9, 11);
            input.value = formatted;
        }
    }

    /**
     * Показывает ошибку валидации
     */
    function showError(inputId, message) {
        const input = document.getElementById(inputId);
        const errorElement = document.getElementById(inputId.replace('contact', '').toLowerCase() + 'Error');
        
        if (input) {
            input.classList.add('error');
            input.setAttribute('aria-invalid', 'true');
        }
        
        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    /**
     * Очищает ошибки валидации
     */
    function clearErrors() {
        document.querySelectorAll('.form-input, .form-textarea').forEach(input => {
            input.classList.remove('error');
            input.setAttribute('aria-invalid', 'false');
        });
        
        // Очищаем ошибки чекбокса
        const agreementCheckbox = document.getElementById('agreementCheckbox');
        if (agreementCheckbox) {
            agreementCheckbox.setAttribute('aria-invalid', 'false');
        }
        
        document.querySelectorAll('.form-error').forEach(error => {
            error.textContent = '';
        });
    }

    /**
     * Валидирует форму
     */
    function validateForm(formData) {
        clearErrors();
        let isValid = true;

        // Проверка имени
        if (!formData.get('name') || formData.get('name').trim().length < 2) {
            showError('contactName', 'Пожалуйста, введите ваше имя');
            isValid = false;
        }

        // Проверка телефона
        const phone = formData.get('phone');
        if (!phone || !validatePhone(phone)) {
            showError('contactPhone', 'Введите корректный номер телефона');
            isValid = false;
        }

        // Проверка email (если заполнен)
        const email = formData.get('email');
        if (email && !validateEmail(email)) {
            showError('contactEmail', 'Введите корректный email');
            isValid = false;
        }

        // Проверка вопроса
        if (!formData.get('question') || formData.get('question').trim().length < 10) {
            showError('contactQuestion', 'Пожалуйста, опишите ваш вопрос (минимум 10 символов)');
            isValid = false;
        }

        // Проверка выбора мессенджера
        if (!formData.get('messenger')) {
            const messengerError = document.getElementById('messengerError');
            const messengerInputs = form.querySelectorAll('input[name="messenger"]');
            if (messengerError) {
                messengerError.textContent = 'Выберите удобный мессенджер';
            }
            // Устанавливаем aria-invalid для radio buttons
            messengerInputs.forEach(radio => {
                radio.setAttribute('aria-invalid', 'true');
            });
            isValid = false;
        } else {
            // Очищаем aria-invalid если мессенджер выбран
            const messengerInputs = form.querySelectorAll('input[name="messenger"]');
            messengerInputs.forEach(radio => {
                radio.setAttribute('aria-invalid', 'false');
            });
        }

        // Проверка согласия с условиями
        const agreement = formData.get('agreement');
        if (!agreement) {
            const agreementError = document.getElementById('agreementError');
            const checkbox = document.getElementById('agreementCheckbox');
            if (agreementError) {
                agreementError.textContent = 'Необходимо согласиться с условиями использования';
            }
            if (checkbox) {
                checkbox.setAttribute('aria-invalid', 'true');
            }
            isValid = false;
        } else {
            // Очищаем aria-invalid если чекбокс отмечен
            const checkbox = document.getElementById('agreementCheckbox');
            if (checkbox) {
                checkbox.setAttribute('aria-invalid', 'false');
            }
        }

        // Проверка honeypot (защита от ботов)
        if (formData.get('website')) {
            return false;
        }

        return isValid;
    }

    /**
     * Отправляет форму на сервер
     */
    async function submitForm(formData) {
        const submitButton = form.querySelector('.btn-submit');
        const originalText = submitButton.querySelector('.btn-text').textContent;
        
        try {
            // Отключаем кнопку и показываем loading
            submitButton.disabled = true;
            submitButton.querySelector('.btn-text').textContent = 'Отправка...';
            
            // Подготовка данных для отправки
            const data = {
                name: formData.get('name'),
                phone: formData.get('phone'),
                email: formData.get('email') || '',
                messenger: formData.get('messenger'),
                question: formData.get('question'),
                page: window.location.href,
                timestamp: new Date().toISOString()
            };
            
            
            // Отправка на Google Apps Script
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(data).toString()
            });
            
            const result = await response.json();
            
            if (result.ok) {
                
                // Трекинг успешной отправки
                trackEvent('contact_form', 'submit_success', data.messenger);
                
                // Закрываем модальное окно
                closeModal();
                
                // Показываем уведомление
                showSuccessNotification();
                
                // Очищаем форму
                form.reset();
                clearErrors();
                
            } else {
                throw new Error(result.message || 'Ошибка отправки');
            }
            
        } catch (error) {
            
            // Трекинг ошибки
            trackEvent('contact_form', 'submit_error', error.message);
            
            // Показываем ошибку пользователю
            alert('Произошла ошибка при отправке формы. Пожалуйста, попробуйте позже или свяжитесь через мессенджеры.');
            
        } finally {
            // Возвращаем кнопку в исходное состояние
            submitButton.disabled = false;
            submitButton.querySelector('.btn-text').textContent = originalText;
        }
    }

    // Открытие модального окна
    openBtn.addEventListener('click', openModal);

    // Закрытие модального окна
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    // Закрытие по клику на overlay
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Закрытие по ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // Применение маски к телефону
    if (phoneInput) {
        phoneInput.addEventListener('input', () => applyPhoneMask(phoneInput));
        phoneInput.addEventListener('focus', () => {
            if (!phoneInput.value) {
                phoneInput.value = '+7 ';
            }
        });
    }

    // Очистка ошибок при фокусе на поле
    form.querySelectorAll('.form-input, .form-textarea').forEach(input => {
        input.addEventListener('focus', () => {
            input.classList.remove('error');
            input.setAttribute('aria-invalid', 'false');
            const errorId = input.id.replace('contact', '').toLowerCase() + 'Error';
            const errorElement = document.getElementById(errorId);
            if (errorElement) {
                errorElement.textContent = '';
            }
        });
    });

    // Обработка отправки формы
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        
        // Валидация
        if (!validateForm(formData)) {
            trackEvent('contact_form', 'validation_error');
            return;
        }
        
        // Отправка
        await submitForm(formData);
    });

}


/**
 * Инициализирует бургер меню для мобильных устройств
 * Следует принципам: Self-Documenting Code, Explicit Dependencies
 */
function initializeBurgerMenu() {
    const hamburger = document.getElementById('hamburger-menu');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuLinks = mobileMenu?.querySelectorAll('a');
    
    if (!hamburger || !mobileMenu) {
        return;
    }

    /**
     * Переключает состояние мобильного меню
     */
    function toggleMenu() {
        const isActive = hamburger.classList.contains('is-active');
        
        if (isActive) {
            closeMenu();
        } else {
            openMenu();
        }
    }

    /**
     * Открывает мобильное меню
     */
    function openMenu() {
        hamburger.classList.add('is-active');
        hamburger.setAttribute('aria-expanded', 'true');
        hamburger.setAttribute('aria-label', 'Закрыть меню');
        
        mobileMenu.classList.add('active');
        mobileMenu.setAttribute('aria-hidden', 'false');
        
        // Блокируем скролл body
        document.body.style.overflow = 'hidden';
        
        // Трекинг события
        trackEvent('mobile_menu', 'open');
    }

    /**
     * Закрывает мобильное меню
     */
    function closeMenu() {
        hamburger.classList.remove('is-active');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', 'Открыть меню');
        
        mobileMenu.classList.remove('active');
        mobileMenu.setAttribute('aria-hidden', 'true');
        
        // Разблокируем скролл body
        document.body.style.overflow = '';
        
        // Трекинг события
        trackEvent('mobile_menu', 'close');
    }

    // Клик по кнопке гамбургера
    hamburger.addEventListener('click', toggleMenu);

    // Закрытие меню при клике на ссылку
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeMenu();
            
            // Трекинг клика по пункту меню
            const linkText = link.textContent.trim();
            trackEvent('mobile_menu', 'link_click', linkText);
        });
    });

    // Закрытие по клавише ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && hamburger.classList.contains('is-active')) {
            closeMenu();
        }
    });

    // Закрытие при изменении размера окна на desktop
    resizeManager.addHandler(() => {
        if (window.innerWidth > 768 && hamburger.classList.contains('is-active')) {
            closeMenu();
        }
    });

}


/**
 * Обработка ошибок
 */
window.addEventListener('error', function(e) {
    // Здесь можно отправить ошибку в сервис мониторинга
});

// Экспорт функций для тестирования
// ===== TESTIMONIALS CAROUSEL =====
function initTestimonialsCarousel() {
    const track = document.querySelector('.testimonials-track');
    const cards = Array.from(track.children);
    const prevButton = document.querySelector('.carousel-arrow-left');
    const nextButton = document.querySelector('.carousel-arrow-right');
    const trackContainer = document.querySelector('.testimonials-track-container');
    
    if (!track || !cards.length) {
        return;
    }
    
    // Отображаем 1 карточку за раз на всех экранах
    const cardsPerStep = 1;
    
    let currentIndex = 0;
    const originalCardsCount = cards.length;
    
    // Клонируем карточки для бесконечной прокрутки
    cards.forEach(card => {
        const clone = card.cloneNode(true);
        track.appendChild(clone);
    });
    
    // Получаем ширину карточки с учетом gap
    function getCardWidth() {
        return cards[0].getBoundingClientRect().width + parseInt(getComputedStyle(track).gap);
    }
    
    // Функция перемещения с поддержкой плавной анимации
    function moveToCard(index, useTransition = true, customDuration = null) {
        const cardWidth = getCardWidth();
        const targetPosition = -cardWidth * index;
        
        if (!useTransition) {
            track.style.transition = 'none';
        } else {
            const duration = customDuration !== null ? customDuration : 0.4;
            track.style.transition = `transform ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
        }
        
        track.style.transform = `translateX(${targetPosition}px)`;
    }
    
    // Функция для перехода к следующей карточке
    function goToNext() {
        currentIndex += cardsPerStep;
        moveToCard(currentIndex);
        
        // Бесконечная прокрутка
        if (currentIndex >= originalCardsCount) {
            setTimeout(() => {
                track.style.transition = 'none';
                currentIndex = 0;
                moveToCard(currentIndex, false);
                setTimeout(() => {
                    track.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                }, 50);
            }, 400);
        }
    }
    
    // Функция для перехода к предыдущей карточке
    function goToPrev() {
        if (currentIndex === 0) {
            track.style.transition = 'none';
            currentIndex = originalCardsCount;
            moveToCard(currentIndex, false);
            setTimeout(() => {
                track.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                currentIndex -= cardsPerStep;
                moveToCard(currentIndex);
            }, 50);
        } else {
            currentIndex -= cardsPerStep;
            moveToCard(currentIndex);
        }
    }
    
    // Обработчики для кнопок навигации (только если они существуют)
    if (nextButton) {
        nextButton.addEventListener('click', goToNext);
    }
    
    if (prevButton) {
        prevButton.addEventListener('click', goToPrev);
    }
    
    // ===== ПОДДЕРЖКА СВАЙПА ДЛЯ МОБИЛЬНЫХ УСТРОЙСТВ =====
    if (trackContainer) {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchCurrentX = 0;
        let touchCurrentY = 0;
        let isDragging = false;
        let startTime = 0;
        let currentPosition = 0;
        let basePosition = 0;
        
        // Вычисляем базовую позицию из текущего индекса
        function updateBasePosition() {
            basePosition = -getCardWidth() * currentIndex;
        }
        
        updateBasePosition();
        
        trackContainer.addEventListener('touchstart', (e) => {
            if (e.touches.length !== 1) return;
            
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            touchCurrentX = touchStartX;
            touchCurrentY = touchStartY;
            startTime = Date.now();
            isDragging = true;
            
            // Отключаем переход во время драга
            track.style.transition = 'none';
            updateBasePosition();
            currentPosition = basePosition;
        }, { passive: true });
        
        trackContainer.addEventListener('touchmove', (e) => {
            if (!isDragging || e.touches.length !== 1) return;
            
            const touch = e.touches[0];
            touchCurrentX = touch.clientX;
            touchCurrentY = touch.clientY;
            
            // Определяем, горизонтальный или вертикальный свайп
            const deltaX = touchCurrentX - touchStartX;
            const deltaY = touchCurrentY - touchStartY;
            
            // Если вертикальный свайп больше горизонтального, не обрабатываем
            if (Math.abs(deltaY) > Math.abs(deltaX)) {
                return;
            }
            
            // Предотвращаем скролл страницы при горизонтальном свайпе
            e.preventDefault();
            
            // Вычисляем новую позицию с учетом базовой
            const newPosition = basePosition + deltaX;
            currentPosition = newPosition;
            track.style.transform = `translateX(${newPosition}px)`;
        }, { passive: false });
        
        trackContainer.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            
            isDragging = false;
            
            const deltaX = touchCurrentX - touchStartX;
            const deltaY = touchCurrentY - touchStartY;
            const deltaTime = Date.now() - startTime;
            const velocity = Math.abs(deltaX) / deltaTime; // пикселей в миллисекунду
            
            // Если вертикальный свайп больше горизонтального, не обрабатываем
            if (Math.abs(deltaY) > Math.abs(deltaX)) {
                // Возвращаемся к базовой позиции
                track.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                moveToCard(currentIndex);
                return;
            }
            
            const cardWidth = getCardWidth();
            const threshold = cardWidth * 0.3; // 30% ширины карточки для переключения
            const velocityThreshold = 0.3; // Минимальная скорость для переключения (px/ms)
            
            // Определяем, нужно ли переключить карточку
            let shouldSwitch = false;
            let direction = 0;
            
            if (Math.abs(deltaX) > threshold || velocity > velocityThreshold) {
                shouldSwitch = true;
                direction = deltaX > 0 ? -1 : 1; // -1 для влево (prev), 1 для вправо (next)
            }
            
            if (shouldSwitch) {
                // Вычисляем длительность анимации на основе скорости (momentum scrolling)
                // Быстрый свайп = более короткая анимация, медленный = более длинная
                const baseDuration = 0.4;
                const maxDuration = 0.6;
                const minDuration = 0.25;
                let animationDuration = baseDuration;
                
                if (velocity > 0.5) {
                    // Очень быстрый свайп
                    animationDuration = minDuration;
                } else if (velocity > 0.2) {
                    // Средний свайп
                    animationDuration = baseDuration - (velocity - 0.2) * 0.5;
                } else {
                    // Медленный свайп
                    animationDuration = baseDuration + (0.2 - velocity) * 1.0;
                }
                
                animationDuration = Math.max(minDuration, Math.min(maxDuration, animationDuration));
                
                if (direction === 1) {
                    goToNext();
                } else {
                    goToPrev();
                }
                
                // Обновляем базовую позицию после переключения
                setTimeout(() => {
                    updateBasePosition();
                }, animationDuration * 1000);
            } else {
                // Возвращаемся к текущей карточке с плавной анимацией
                track.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                moveToCard(currentIndex);
            }
        }, { passive: true });
        
        trackContainer.addEventListener('touchcancel', () => {
            if (isDragging) {
                isDragging = false;
                track.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                moveToCard(currentIndex);
            }
        }, { passive: true });
    }
}

// Инициализация карусели при загрузке
if (document.querySelector('.testimonials-carousel')) {
    initTestimonialsCarousel();
}

// Предотвращение горизонтального скролла на мобильных
// УДАЛЕНО: Функция была избыточной - CSS уже полностью покрывает эту функциональность
// через @media (max-width: 768px) с правилами overflow-x: hidden и max-width: 100vw

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeSite,
        trackEvent,
        initTestimonialsCarousel
    };
}
