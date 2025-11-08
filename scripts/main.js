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
                
                // Небольшая задержка для предотвращения конфликта с активацией карт
                // Используем requestAnimationFrame для синхронизации с repaint
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        requestAnimationFrame(() => {
                            // Применяем соответствующую анимацию
                            target.classList.add(`animate-${animationType}`);
                        });
                    }, 50); // Небольшая задержка для разделения с активацией карт
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
    // Предзагрузка шрифтов из конфигурации
    const fontPreloads = [
        SITE_CONFIG.fonts.inter
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
    
    if (!track || !cards.length || !prevButton || !nextButton) {
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
    
    // Функция перемещения
    function moveToCard(index) {
        const cardWidth = cards[0].getBoundingClientRect().width + parseInt(getComputedStyle(track).gap);
        track.style.transform = `translateX(-${cardWidth * index}px)`;
    }
    
    // Следующая группа карточек
    nextButton.addEventListener('click', () => {
        currentIndex += cardsPerStep;
        moveToCard(currentIndex);
        
        // Бесконечная прокрутка
        if (currentIndex >= originalCardsCount) {
            setTimeout(() => {
                track.style.transition = 'none';
                currentIndex = 0;
                moveToCard(currentIndex);
                setTimeout(() => {
                    track.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                }, 50);
            }, 500);
        }
    });
    
    // Предыдущая группа карточек
    prevButton.addEventListener('click', () => {
        if (currentIndex === 0) {
            track.style.transition = 'none';
            currentIndex = originalCardsCount;
            moveToCard(currentIndex);
            setTimeout(() => {
                track.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                currentIndex -= cardsPerStep;
                moveToCard(currentIndex);
            }, 50);
        } else {
            currentIndex -= cardsPerStep;
            moveToCard(currentIndex);
        }
    });
    
    // Обработка изменения размера экрана - больше не требуется, т.к. всегда 1 карточка
    
}

// Инициализация карусели при загрузке
if (document.querySelector('.testimonials-carousel')) {
    initTestimonialsCarousel();
}

// Предотвращение горизонтального скролла на мобильных
function preventHorizontalScroll() {
    if (window.innerWidth <= 768) {
        // Принудительно устанавливаем overflow-x: hidden
        document.documentElement.style.overflowX = 'hidden';
        document.body.style.overflowX = 'hidden';
        
        // Проверяем элементы, которые могут выходить за границы
        const allElements = document.querySelectorAll('*');
        allElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            // Исключаем карты Таро - они могут выходить за границы
            if (!el.classList.contains('tarot-card') && !el.classList.contains('tarot-canvas')) {
                if (rect.left < 0 || rect.right > window.innerWidth) {
                    // Элемент выходит за границы - исправляем
                    el.style.maxWidth = '100vw';
                    el.style.overflowX = 'hidden';
                }
            }
        });
    }
}

// Вызываем при загрузке и изменении размера
window.addEventListener('load', preventHorizontalScroll);
window.addEventListener('resize', preventHorizontalScroll);

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeSite,
        trackEvent,
        initTestimonialsCarousel
    };
}
