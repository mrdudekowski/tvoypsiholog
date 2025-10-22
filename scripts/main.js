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
    console.log('🃏 Таролог Елена - сайт инициализирован');

    // Инициализация компонентов
    initializeScrollAnimations();
    initializeFAQ();
    initializeSmoothScroll();
    initializeContactButtons();
    initializeCertificatesModal();
    initializePerformanceOptimizations();

    // Логирование успешной инициализации
    console.log('✅ Все компоненты инициализированы');
}

/**
 * Инициализирует анимации при скролле
 * Поддерживает data-scroll-reveal атрибуты для секций и элементов
 */
function initializeScrollAnimations() {
    // Проверка поддержки Intersection Observer
    if (!('IntersectionObserver' in window)) {
        console.warn('⚠️ Intersection Observer не поддерживается, анимации отключены');
        // Показываем все элементы без анимаций
        document.querySelectorAll('[data-scroll-reveal]').forEach(el => {
            el.style.opacity = '1';
        });
        return;
    }

    // Проверка prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        console.log('ℹ️ Пользователь предпочитает меньше анимаций');
        document.querySelectorAll('[data-scroll-reveal]').forEach(el => {
            el.style.opacity = '1';
        });
        return;
    }

    // Настройки для Intersection Observer
    const observerOptions = {
        threshold: 0.15, // Триггер при 15% видимости
        rootMargin: '0px 0px -100px 0px' // Отступ снизу для более позднего триггера
    };

    // Создаем Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                
                // Получаем тип анимации из data-атрибута
                const animationType = target.dataset.scrollReveal || 'fadeInUp';
                
                // Применяем соответствующую анимацию
                target.classList.add(`animate-${animationType}`);
                
                // Прекращаем наблюдение после анимации
                observer.unobserve(target);
                
                console.log(`✨ Анимация ${animationType} применена к элементу`);
            }
        });
    }, observerOptions);

    // Наблюдаем за элементами с data-scroll-reveal
    const scrollRevealElements = document.querySelectorAll('[data-scroll-reveal]');
    scrollRevealElements.forEach(element => {
        observer.observe(element);
    });

    // Также наблюдаем за старыми элементами (обратная совместимость)
    const legacyElements = document.querySelectorAll(
        '.service-card:not([data-scroll-reveal]), .process-step:not([data-scroll-reveal]), .testimonial-card:not([data-scroll-reveal]), .faq-item:not([data-scroll-reveal])'
    );

    legacyElements.forEach(element => {
        observer.observe(element);
        // Для старых элементов используем дефолтную анимацию
        element.addEventListener('animationstart', function addLegacyClass() {
            if (!this.classList.contains('animate-fade-in-up')) {
                this.classList.add('animate-fade-in-up');
            }
        }, { once: true });
    });

    console.log(`📊 Инициализировано ${scrollRevealElements.length + legacyElements.length} анимируемых элементов`);
}

/**
 * Инициализирует FAQ аккордеон
 */
function initializeFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            const answer = this.nextElementSibling;

            // Закрываем все остальные вопросы
            faqQuestions.forEach(q => {
                if (q !== this) {
                    q.setAttribute('aria-expanded', 'false');
                    q.nextElementSibling.setAttribute('aria-hidden', 'true');
                }
            });

            // Переключаем текущий вопрос
            this.setAttribute('aria-expanded', !isExpanded);
            answer.setAttribute('aria-hidden', isExpanded);
        });
    });
}

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
        console.warn('⚠️ Элементы модального окна не найдены');
        return;
    }

    /**
     * Открывает модальное окно
     */
    function openModal() {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        document.body.style.overflow = 'hidden';
        
        // Фокус на кнопку закрытия для accessibility
        closeBtn?.focus();
        
        // Трекинг события
        trackEvent('certificates', 'modal_open');
        
        console.log('📜 Модальное окно сертификатов открыто');
    }

    /**
     * Закрывает модальное окно
     */
    function closeModal() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        
        // Возвращаем фокус на кнопку открытия
        openBtn.focus();
        
        // Трекинг события
        trackEvent('certificates', 'modal_close');
        
        console.log('📜 Модальное окно сертификатов закрыто');
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
            console.log(`📜 Просмотр сертификата ${index + 1}`);
        });
    });

    console.log('✅ Модальное окно сертификатов инициализировано');
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
            window.open('https://t.me/taro_elena', '_blank', 'noopener,noreferrer');
            trackEvent('contact_click', 'telegram');
        });
    }

    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.open('https://wa.me/79025553566', '_blank', 'noopener,noreferrer');
            trackEvent('contact_click', 'whatsapp');
        });
    }

    if (phoneBtn) {
        phoneBtn.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'tel:+79025553566';
            trackEvent('contact_click', 'phone');
        });
    }
}

/**
 * Инициализирует оптимизации производительности
 */
function initializePerformanceOptimizations() {
    // Lazy loading для изображений
    if ('loading' in HTMLImageElement.prototype) {
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            img.src = img.src;
        });
    } else {
        // Fallback для браузеров без поддержки lazy loading
        loadLazyImages();
    }

    // Предзагрузка критических ресурсов
    preloadCriticalResources();
}

/**
 * Fallback функция для lazy loading изображений
 */
function loadLazyImages() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

/**
 * Предзагрузка критических ресурсов
 */
function preloadCriticalResources() {
    // Предзагрузка шрифтов
    const fontPreloads = [
        'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
    ];

    fontPreloads.forEach(font => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'style';
        link.href = font;
        document.head.appendChild(link);
    });
}

/**
 * Трекинг событий для аналитики
 */
function trackEvent(category, action, label = null) {
    // Простая реализация трекинга (можно заменить на GA, YM, etc.)
    console.log('📊 Event tracked:', { category, action, label });

    // Здесь можно добавить интеграцию с аналитикой
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            event_category: category,
            event_label: label
        });
    }
}


/**
 * Обработка ошибок
 */
window.addEventListener('error', function(e) {
    console.error('🚨 JavaScript Error:', e.error);
    // Здесь можно отправить ошибку в сервис мониторинга
});

// Экспорт функций для тестирования
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeSite,
        trackEvent
    };
}
