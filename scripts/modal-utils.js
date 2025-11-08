/**
 * Утилиты для работы с модальными окнами
 * Реализация focus trap согласно WCAG 2.2
 */

/**
 * Сохраняет последний активный элемент перед открытием модального окна
 */
let lastActiveElement = null;

/**
 * Сохраняет элементы, которые нужно скрыть от скринридеров
 */
let hiddenElements = [];

/**
 * Обработчик нажатия Tab для зацикливания фокуса
 * Сохраняется для последующего удаления
 */
let currentTabHandler = null;

/**
 * Инициализирует focus trap для модального окна
 * @param {HTMLElement} modal - Модальное окно
 * @param {HTMLElement} openButton - Кнопка, открывающая модальное окно
 * @returns {Object} Объект с методами для управления focus trap
 */
function initializeModalFocusTrap(modal, openButton) {
    // Сохраняем активный элемент перед открытием
    lastActiveElement = document.activeElement;

    // Находим все фокусируемые элементы внутри модального окна
    const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    const focusableElements = Array.from(modal.querySelectorAll(focusableSelectors))
        .filter(el => {
            // Исключаем элементы, которые невидимы
            const style = window.getComputedStyle(el);
            return style.display !== 'none' && style.visibility !== 'hidden';
        });

    if (focusableElements.length === 0) {
        return null;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Скрываем основной контент от скринридеров
    const mainContent = document.querySelector('main');
    if (mainContent) {
        mainContent.setAttribute('aria-hidden', 'true');
        hiddenElements.push(mainContent);
    }

    const header = document.querySelector('.site-header');
    if (header) {
        header.setAttribute('aria-hidden', 'true');
        hiddenElements.push(header);
    }

    const footer = document.querySelector('.site-footer');
    if (footer) {
        footer.setAttribute('aria-hidden', 'true');
        hiddenElements.push(footer);
    }

    /**
     * Обработчик нажатия Tab для зацикливания фокуса
     */
    function handleTabKey(e) {
        if (e.key !== 'Tab') {
            return;
        }

        // Если Tab на последнем элементе → фокус на первый
        if (e.shiftKey === false && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
        // Если Shift+Tab на первом элементе → фокус на последний
        else if (e.shiftKey === true && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        }
    }

    // Сохраняем обработчик для последующего удаления
    currentTabHandler = handleTabKey;

    // Добавляем обработчик на модальное окно
    modal.addEventListener('keydown', handleTabKey);

    // Фокусируем первый элемент
    firstElement.focus();

    /**
     * Очищает focus trap и восстанавливает состояние
     */
    function cleanup() {
        // Восстанавливаем aria-hidden для скрытых элементов
        hiddenElements.forEach(el => {
            el.removeAttribute('aria-hidden');
        });
        hiddenElements = [];

        // Удаляем обработчик keydown
        if (currentTabHandler) {
            modal.removeEventListener('keydown', currentTabHandler);
            currentTabHandler = null;
        }

        // Возвращаем фокус на кнопку открытия
        if (openButton && lastActiveElement) {
            openButton.focus();
        }
        lastActiveElement = null;
    }

    return {
        cleanup: cleanup,
        firstElement: firstElement,
        lastElement: lastElement
    };
}

// Экспорт для использования в других модулях
if (typeof window !== 'undefined') {
    window.ModalFocusTrap = {
        initialize: initializeModalFocusTrap
    };
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeModalFocusTrap: initializeModalFocusTrap
    };
}

