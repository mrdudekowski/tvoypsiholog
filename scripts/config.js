/**
 * Централизованная конфигурация сайта
 * Single Source of Truth для всех URL, настроек и констант
 */

const SITE_CONFIG = {
    // URL для контактов и внешних сервисов
    urls: {
        webhook: 'https://script.google.com/macros/s/AKfycbwnjjIart4H57pc7O8xNQ0ry3hpP1oOT8bMxeqUn_d3fZUNwRpmfFFBtyZ2o9nxUYy_/exec',
        telegram: 'https://t.me/Lenamakarova0311',
        whatsapp: 'https://wa.me/79025553566',
        phone: 'tel:+79025553566',
        canonical: 'https://taro-elena.ru/',
        sitemap: 'https://taro-elena.ru/sitemap.xml'
    },
    
    // URL для шрифтов Google Fonts
    fonts: {
        inter: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
        elMessiri: 'https://fonts.googleapis.com/css2?family=El+Messiri:wght@400..700&display=swap',
        sourceSans: 'https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,200..900;1,200..900&display=swap'
    },
    
    // Настройки доступности (WCAG 2.2 AA)
    accessibility: {
        minTouchTarget: 44, // Минимальный размер touch target в пикселях
        focusOutlineWidth: '2px',
        focusOutlineOffset: '2px'
    },
    
    // Настройки производительности
    performance: {
        imageLazyLoadThreshold: 200 // Пиксели от viewport для lazy loading
    }
};

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SITE_CONFIG;
}

