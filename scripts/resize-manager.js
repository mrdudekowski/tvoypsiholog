// Resize Manager - единый обработчик resize событий
class ResizeManager {
  constructor() {
    this.handlers = [];
    this.debounceDelay = 250;
    this.resizeTimer = null;
    this.init();
  }
  
  init() {
    window.addEventListener('resize', () => {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => {
        this.handlers.forEach(handler => handler());
      }, this.debounceDelay);
    });
  }
  
  addHandler(handler) {
    this.handlers.push(handler);
  }
  
  removeHandler(handler) {
    const index = this.handlers.indexOf(handler);
    if (index > -1) {
      this.handlers.splice(index, 1);
    }
  }
}

// Инициализировать глобально
const resizeManager = new ResizeManager();

// Экспорт для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
  module.exports = resizeManager;
} else {
  window.resizeManager = resizeManager;
}
