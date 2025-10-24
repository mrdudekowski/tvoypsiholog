/**
 * Mobile Breakpoint Test Suite
 * Тестирование всех breakpoint'ов и адаптивности
 * 
 * Принципы из MemoryBank:
 * - Single Source of Truth: Единая система тестирования
 * - Self-Documenting Code: Понятные имена тестов
 * - Explicit Dependencies: Явные зависимости
 */

class MobileBreakpointTester {
    constructor() {
        this.breakpoints = {
            desktop: { min: 769, max: Infinity, name: 'Desktop' },
            tablet: { min: 481, max: 768, name: 'Tablet' },
            mobile: { min: 0, max: 480, name: 'Mobile' }
        };
        
        this.testResults = {
            passed: 0,
            failed: 0,
            warnings: 0,
            total: 0
        };
        
        this.issues = [];
    }
    
    /**
     * Запуск всех тестов
     */
    async runAllTests() {
        console.log('🔍 Запуск тестов мобильной адаптивности...');
        
        // Тест 1: Проверка дублирования медиа-запросов
        await this.testDuplicateMediaQueries();
        
        // Тест 2: Проверка CSS конфликтов
        await this.testCSSConflicts();
        
        // Тест 3: Проверка layout на разных экранах
        await this.testLayoutBreakpoints();
        
        // Тест 4: Проверка производительности
        await this.testPerformance();
        
        // Тест 5: Проверка accessibility
        await this.testAccessibility();
        
        this.generateReport();
    }
    
    /**
     * Тест 1: Проверка дублирования медиа-запросов
     */
    async testDuplicateMediaQueries() {
        console.log('📱 Тест 1: Проверка дублирования медиа-запросов');
        
        const mediaQueries = this.extractMediaQueries();
        const duplicates = this.findDuplicateMediaQueries(mediaQueries);
        
        if (duplicates.length > 0) {
            this.addIssue('CRITICAL', 'Дублирование медиа-запросов', duplicates);
            this.testResults.failed++;
        } else {
            this.testResults.passed++;
        }
        
        this.testResults.total++;
    }
    
    /**
     * Тест 2: Проверка CSS конфликтов
     */
    async testCSSConflicts() {
        console.log('🎨 Тест 2: Проверка CSS конфликтов');
        
        const conflicts = [];
        
        // Проверка !important злоупотреблений
        const importantRules = this.findImportantRules();
        if (importantRules.length > 5) {
            conflicts.push(`Слишком много !important: ${importantRules.length}`);
        }
        
        // Проверка конфликтующих селекторов
        const conflictingSelectors = this.findConflictingSelectors();
        conflicts.push(...conflictingSelectors);
        
        if (conflicts.length > 0) {
            this.addIssue('WARNING', 'CSS конфликты', conflicts);
            this.testResults.warnings++;
        } else {
            this.testResults.passed++;
        }
        
        this.testResults.total++;
    }
    
    /**
     * Тест 3: Проверка layout на разных экранах
     */
    async testLayoutBreakpoints() {
        console.log('📐 Тест 3: Проверка layout breakpoints');
        
        const layoutIssues = [];
        
        // Тестирование каждого breakpoint
        for (const [name, breakpoint] of Object.entries(this.breakpoints)) {
            const issues = await this.testLayoutAtBreakpoint(name, breakpoint);
            layoutIssues.push(...issues);
        }
        
        if (layoutIssues.length > 0) {
            this.addIssue('ERROR', 'Layout проблемы', layoutIssues);
            this.testResults.failed++;
        } else {
            this.testResults.passed++;
        }
        
        this.testResults.total++;
    }
    
    /**
     * Тест 4: Проверка производительности
     */
    async testPerformance() {
        console.log('⚡ Тест 4: Проверка производительности');
        
        const perfIssues = [];
        
        // Проверка количества CSS правил
        const cssRulesCount = this.countCSSRules();
        if (cssRulesCount > 1000) {
            perfIssues.push(`Много CSS правил: ${cssRulesCount}`);
        }
        
        // Проверка размера CSS файлов
        const cssSize = this.getCSSFileSize();
        if (cssSize > 100000) { // 100KB
            perfIssues.push(`Большой размер CSS: ${cssSize} байт`);
        }
        
        // Проверка неиспользуемых стилей
        const unusedStyles = this.findUnusedStyles();
        if (unusedStyles.length > 20) {
            perfIssues.push(`Неиспользуемые стили: ${unusedStyles.length}`);
        }
        
        if (perfIssues.length > 0) {
            this.addIssue('WARNING', 'Производительность', perfIssues);
            this.testResults.warnings++;
        } else {
            this.testResults.passed++;
        }
        
        this.testResults.total++;
    }
    
    /**
     * Тест 5: Проверка accessibility
     */
    async testAccessibility() {
        console.log('♿ Тест 5: Проверка accessibility');
        
        const a11yIssues = [];
        
        // Проверка контрастности
        const contrastIssues = this.checkColorContrast();
        a11yIssues.push(...contrastIssues);
        
        // Проверка размеров touch targets
        const touchTargetIssues = this.checkTouchTargets();
        a11yIssues.push(...touchTargetIssues);
        
        // Проверка focus states
        const focusIssues = this.checkFocusStates();
        a11yIssues.push(...focusIssues);
        
        if (a11yIssues.length > 0) {
            this.addIssue('WARNING', 'Accessibility', a11yIssues);
            this.testResults.warnings++;
        } else {
            this.testResults.passed++;
        }
        
        this.testResults.total++;
    }
    
    /**
     * Извлечение медиа-запросов из CSS
     */
    extractMediaQueries() {
        const mediaQueries = [];
        
        for (let i = 0; i < document.styleSheets.length; i++) {
            try {
                const rules = document.styleSheets[i].cssRules || document.styleSheets[i].rules;
                for (let j = 0; j < rules.length; j++) {
                    if (rules[j].type === CSSRule.MEDIA_RULE) {
                        mediaQueries.push({
                            media: rules[j].media.mediaText,
                            rules: rules[j].cssRules.length,
                            stylesheet: i
                        });
                    }
                }
            } catch (e) {
                // Игнорируем ошибки CORS
            }
        }
        
        return mediaQueries;
    }
    
    /**
     * Поиск дублированных медиа-запросов
     */
    findDuplicateMediaQueries(mediaQueries) {
        const duplicates = [];
        const seen = new Map();
        
        mediaQueries.forEach(mq => {
            const key = mq.media;
            if (seen.has(key)) {
                duplicates.push({
                    media: key,
                    first: seen.get(key),
                    duplicate: mq
                });
            } else {
                seen.set(key, mq);
            }
        });
        
        return duplicates;
    }
    
    /**
     * Поиск правил с !important
     */
    findImportantRules() {
        const importantRules = [];
        
        for (let i = 0; i < document.styleSheets.length; i++) {
            try {
                const rules = document.styleSheets[i].cssRules || document.styleSheets[i].rules;
                for (let j = 0; j < rules.length; j++) {
                    if (rules[j].type === CSSRule.STYLE_RULE) {
                        const style = rules[j].style;
                        for (let k = 0; k < style.length; k++) {
                            const property = style[k];
                            const value = style.getPropertyValue(property);
                            if (value.includes('!important')) {
                                importantRules.push({
                                    selector: rules[j].selectorText,
                                    property: property,
                                    value: value
                                });
                            }
                        }
                    }
                }
            } catch (e) {
                // Игнорируем ошибки CORS
            }
        }
        
        return importantRules;
    }
    
    /**
     * Поиск конфликтующих селекторов
     */
    findConflictingSelectors() {
        const conflicts = [];
        
        // Проверка дублирования селекторов
        const selectors = new Map();
        
        for (let i = 0; i < document.styleSheets.length; i++) {
            try {
                const rules = document.styleSheets[i].cssRules || document.styleSheets[i].rules;
                for (let j = 0; j < rules.length; j++) {
                    if (rules[j].type === CSSRule.STYLE_RULE) {
                        const selector = rules[j].selectorText;
                        if (selectors.has(selector)) {
                            conflicts.push(`Дублированный селектор: ${selector}`);
                        } else {
                            selectors.set(selector, rules[j]);
                        }
                    }
                }
            } catch (e) {
                // Игнорируем ошибки CORS
            }
        }
        
        return conflicts;
    }
    
    /**
     * Тестирование layout на конкретном breakpoint
     */
    async testLayoutAtBreakpoint(name, breakpoint) {
        const issues = [];
        
        // Симуляция размера экрана
        const testWidth = breakpoint.min + (breakpoint.max - breakpoint.min) / 2;
        
        // Проверка contact section
        const contactIssues = this.testContactSectionAtWidth(testWidth);
        issues.push(...contactIssues);
        
        // Проверка service grid
        const serviceIssues = this.testServiceGridAtWidth(testWidth);
        issues.push(...serviceIssues);
        
        return issues;
    }
    
    /**
     * Тестирование contact section на определенной ширине
     */
    testContactSectionAtWidth(width) {
        const issues = [];
        const contactMethods = document.querySelector('.contact-methods');
        
        if (!contactMethods) {
            issues.push('Contact methods контейнер не найден');
            return issues;
        }
        
        const buttons = contactMethods.querySelectorAll('.contact-button');
        const iconButtons = contactMethods.querySelectorAll('.phone-btn, .telegram-btn, .whatsapp-btn');
        const questionBtn = contactMethods.querySelector('.question-btn');
        
        if (width <= 480) {
            // Mobile: 3 иконки + 1 кнопка
            if (iconButtons.length !== 3) {
                issues.push(`Mobile: ожидается 3 иконки, найдено ${iconButtons.length}`);
            }
            
            iconButtons.forEach((btn, index) => {
                const computedStyle = window.getComputedStyle(btn);
                const btnWidth = parseInt(computedStyle.width);
                if (btnWidth !== 60) {
                    issues.push(`Mobile: кнопка ${index + 1} должна быть 60px, получено ${btnWidth}px`);
                }
            });
            
            if (questionBtn) {
                const computedStyle = window.getComputedStyle(questionBtn);
                const btnWidth = computedStyle.width;
                if (btnWidth !== '100%') {
                    issues.push(`Mobile: question-btn должна быть 100%, получено ${btnWidth}`);
                }
            }
        } else if (width <= 768) {
            // Tablet: 3 иконки + 1 кнопка
            if (iconButtons.length !== 3) {
                issues.push(`Tablet: ожидается 3 иконки, найдено ${iconButtons.length}`);
            }
            
            iconButtons.forEach((btn, index) => {
                const computedStyle = window.getComputedStyle(btn);
                const btnWidth = parseInt(computedStyle.width);
                if (btnWidth !== 70) {
                    issues.push(`Tablet: кнопка ${index + 1} должна быть 70px, получено ${btnWidth}px`);
                }
            });
        }
        
        return issues;
    }
    
    /**
     * Тестирование service grid на определенной ширине
     */
    testServiceGridAtWidth(width) {
        const issues = [];
        const servicesGrid = document.querySelector('.services-grid');
        
        if (!servicesGrid) {
            issues.push('Services grid контейнер не найден');
            return issues;
        }
        
        const cards = servicesGrid.querySelectorAll('.service-card');
        const computedStyle = window.getComputedStyle(servicesGrid);
        const gridTemplateColumns = computedStyle.gridTemplateColumns;
        
        if (cards.length !== 5) {
            issues.push(`Ожидается 5 карточек, найдено ${cards.length}`);
        }
        
        if (width <= 768) {
            if (gridTemplateColumns !== '1fr') {
                issues.push(`Mobile: ожидается grid-template-columns: 1fr, получено ${gridTemplateColumns}`);
            }
        } else {
            if (gridTemplateColumns !== 'repeat(3, 1fr)') {
                issues.push(`Desktop: ожидается grid-template-columns: repeat(3, 1fr), получено ${gridTemplateColumns}`);
            }
        }
        
        return issues;
    }
    
    /**
     * Подсчет CSS правил
     */
    countCSSRules() {
        let count = 0;
        
        for (let i = 0; i < document.styleSheets.length; i++) {
            try {
                const rules = document.styleSheets[i].cssRules || document.styleSheets[i].rules;
                count += rules.length;
            } catch (e) {
                // Игнорируем ошибки CORS
            }
        }
        
        return count;
    }
    
    /**
     * Получение размера CSS файлов
     */
    getCSSFileSize() {
        let totalSize = 0;
        
        const links = document.querySelectorAll('link[rel="stylesheet"]');
        links.forEach(link => {
            // Примерная оценка размера
            totalSize += 50000; // 50KB на файл
        });
        
        return totalSize;
    }
    
    /**
     * Поиск неиспользуемых стилей
     */
    findUnusedStyles() {
        const unused = [];
        
        // Простая проверка - селекторы, которые не найдены в DOM
        for (let i = 0; i < document.styleSheets.length; i++) {
            try {
                const rules = document.styleSheets[i].cssRules || document.styleSheets[i].rules;
                for (let j = 0; j < rules.length; j++) {
                    if (rules[j].type === CSSRule.STYLE_RULE) {
                        const selector = rules[j].selectorText;
                        if (selector.startsWith('.') && !document.querySelector(selector)) {
                            unused.push(selector);
                        }
                    }
                }
            } catch (e) {
                // Игнорируем ошибки CORS
            }
        }
        
        return unused;
    }
    
    /**
     * Проверка контрастности цветов
     */
    checkColorContrast() {
        const issues = [];
        
        // Проверка основных цветов
        const textElements = document.querySelectorAll('h1, h2, h3, p, span');
        textElements.forEach(element => {
            const computedStyle = window.getComputedStyle(element);
            const color = computedStyle.color;
            const backgroundColor = computedStyle.backgroundColor;
            
            // Простая проверка на белый текст на белом фоне
            if (color === 'rgb(255, 255, 255)' && backgroundColor === 'rgb(255, 255, 255)') {
                issues.push(`Плохой контраст: белый текст на белом фоне (${element.tagName})`);
            }
        });
        
        return issues;
    }
    
    /**
     * Проверка размеров touch targets
     */
    checkTouchTargets() {
        const issues = [];
        
        const buttons = document.querySelectorAll('button, .btn, .contact-button');
        buttons.forEach(button => {
            const rect = button.getBoundingClientRect();
            if (rect.width < 44 || rect.height < 44) {
                issues.push(`Маленький touch target: ${button.className} (${rect.width}x${rect.height}px)`);
            }
        });
        
        return issues;
    }
    
    /**
     * Проверка focus states
     */
    checkFocusStates() {
        const issues = [];
        
        const focusableElements = document.querySelectorAll('button, a, input, textarea, select');
        focusableElements.forEach(element => {
            const computedStyle = window.getComputedStyle(element, ':focus');
            const outline = computedStyle.outline;
            const outlineWidth = computedStyle.outlineWidth;
            
            if (outline === 'none' && outlineWidth === '0px') {
                issues.push(`Отсутствует focus state: ${element.tagName}`);
            }
        });
        
        return issues;
    }
    
    /**
     * Добавление проблемы в список
     */
    addIssue(severity, category, details) {
        this.issues.push({
            severity,
            category,
            details,
            timestamp: new Date().toISOString()
        });
    }
    
    /**
     * Генерация отчета
     */
    generateReport() {
        console.log('\n📊 ОТЧЕТ О ТЕСТИРОВАНИИ МОБИЛЬНОЙ ВЕРСИИ');
        console.log('='.repeat(50));
        
        console.log(`✅ Пройдено: ${this.testResults.passed}`);
        console.log(`❌ Провалено: ${this.testResults.failed}`);
        console.log(`⚠️ Предупреждения: ${this.testResults.warnings}`);
        console.log(`📊 Всего тестов: ${this.testResults.total}`);
        
        if (this.issues.length > 0) {
            console.log('\n🚨 НАЙДЕННЫЕ ПРОБЛЕМЫ:');
            console.log('-'.repeat(30));
            
            this.issues.forEach((issue, index) => {
                console.log(`\n${index + 1}. ${issue.severity} - ${issue.category}`);
                issue.details.forEach(detail => {
                    console.log(`   • ${detail}`);
                });
            });
        }
        
        console.log('\n🎯 РЕКОМЕНДАЦИИ:');
        console.log('-'.repeat(20));
        
        if (this.testResults.failed > 0) {
            console.log('• Исправить критические ошибки');
        }
        
        if (this.testResults.warnings > 0) {
            console.log('• Обратить внимание на предупреждения');
        }
        
        console.log('• Регулярно запускать тесты при изменениях');
        console.log('• Использовать принципы из MemoryBank');
    }
}

// Экспорт для использования
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileBreakpointTester;
} else {
    window.MobileBreakpointTester = MobileBreakpointTester;
}

// Автозапуск тестов в браузере
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const tester = new MobileBreakpointTester();
        tester.runAllTests();
    });
}
