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
    initializeContactFormModal();
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
        console.warn('⚠️ Элементы формы обратной связи не найдены');
        return;
    }

    // URL Google Apps Script webhook (заменить на реальный после развертывания)
    const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwx1Lst5oKVQn1IzwhpQLKGHPH1pAXTH7U1LwFJYX68Ex9NTTHeLbvrRVOm1MbbOWEf/exec';

    /**
     * Открывает модальное окно
     */
    function openModal() {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        closeBtn?.focus();
        trackEvent('contact_form', 'modal_open');
        console.log('📝 Модальное окно формы открыто');
    }

    /**
     * Закрывает модальное окно
     */
    function closeModal() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        openBtn.focus();
        trackEvent('contact_form', 'modal_close');
        console.log('📝 Модальное окно формы закрыто');
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
     * Валидирует телефонный номер
     */
    function validatePhone(phone) {
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    /**
     * Валидирует email
     */
    function validateEmail(email) {
        if (!email) return true; // Email опциональный
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Показывает ошибку валидации
     */
    function showError(inputId, message) {
        const input = document.getElementById(inputId);
        const errorElement = document.getElementById(inputId.replace('contact', '').toLowerCase() + 'Error');
        
        if (input) {
            input.classList.add('error');
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
        });
        
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
            if (messengerError) {
                messengerError.textContent = 'Выберите удобный мессенджер';
            }
            isValid = false;
        }

        // Проверка honeypot (защита от ботов)
        if (formData.get('website')) {
            console.warn('🤖 Обнаружена попытка спама (honeypot filled)');
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
            
            console.log('📤 Отправка данных:', data);
            
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
                console.log('✅ Форма успешно отправлена');
                
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
            console.error('❌ Ошибка отправки формы:', error);
            
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
            console.warn('⚠️ Форма не прошла валидацию');
            trackEvent('contact_form', 'validation_error');
            return;
        }
        
        // Отправка
        await submitForm(formData);
    });

    console.log('✅ Модальное окно формы обратной связи инициализировано');
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
