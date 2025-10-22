/**
 * Taro Contact Bot - Google Apps Script
 * Обработка заявок с формы обратной связи и отправка в Telegram
 * Version: 1.0.0
 * 
 * ИНСТРУКЦИЯ ПО НАСТРОЙКЕ:
 * 1. Откройте https://script.google.com/
 * 2. Создайте новый проект
 * 3. Скопируйте этот код
 * 4. Перейдите в Project Settings (⚙️) > Script Properties
 * 5. Добавьте свойства:
 *    - TELEGRAM_BOT_TOKEN: токен бота @makarovacontactbot
 *    - MANAGER_CHAT_ID: -4890469762
 * 6. Deploy > New deployment > Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 7. Скопируйте Web App URL и вставьте в main.js (WEBHOOK_URL)
 */

/**
 * Получение конфигурации из свойств скрипта
 */
function getConfig() {
  const properties = PropertiesService.getScriptProperties();
  
  return {
    // Telegram Bot настройки
    TELEGRAM_BOT_TOKEN: properties.getProperty('TELEGRAM_BOT_TOKEN') || 'YOUR_BOT_TOKEN',
    MANAGER_CHAT_ID: properties.getProperty('MANAGER_CHAT_ID') || '-4890469762',
    
    // Безопасность
    HONEYPOT_FIELD: 'website',
    REQUIRED_FIELDS: ['name', 'phone', 'question', 'messenger'],
    
    // Форматирование
    DATE_FORMAT: 'dd.MM.yyyy, HH:mm:ss',
    TIMEZONE: 'Europe/Moscow'
  };
}

/**
 * Обработка POST запросов (отправка заявок)
 */
function doPost(e) {
  try {
    console.log('📥 Получен POST запрос');
    
    // Получаем конфигурацию
    const CONFIG = getConfig();
    
    // Проверяем наличие данных
    if (!e || !e.postData) {
      console.log('❌ Нет данных POST запроса');
      return createResponse(false, 'No POST data received', null);
    }
    
    console.log('📥 POST данные:', e.postData.contents);
    
    const formData = parseFormData(e.postData.contents);
    console.log('📋 Данные формы:', formData);
    
    const validation = validateLeadData(formData, CONFIG);
    if (!validation.valid) {
      console.log('❌ Валидация не пройдена:', validation.error);
      return createResponse(false, validation.error, null);
    }
    
    // Отправляем в Telegram
    const telegramResult = sendToTelegram(formData, CONFIG);
    console.log('📱 Результат отправки в Telegram:', telegramResult);
    
    if (telegramResult.success) {
      return createResponse(true, 'Заявка успешно отправлена', {
        telegram_sent: true,
        message_id: telegramResult.message_id,
        timestamp: new Date().toISOString()
      });
    } else {
      return createResponse(false, 'Ошибка отправки в Telegram: ' + telegramResult.error, null);
    }
    
  } catch (error) {
    console.error('💥 Ошибка обработки запроса:', error);
    return createResponse(false, 'Внутренняя ошибка сервера: ' + error.toString(), null);
  }
}

/**
 * Обработка GET запросов (health check)
 */
function doGet(e) {
  try {
    console.log('🔍 Health check запрос');
    
    const CONFIG = getConfig();
    const configCheck = checkConfiguration(CONFIG);
    
    return createResponse(true, 'Taro Contact Bot работает', {
      status: 'healthy',
      config: configCheck,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
    
  } catch (error) {
    console.error('💥 Ошибка health check:', error);
    return createResponse(false, 'Ошибка проверки состояния: ' + error.toString(), null);
  }
}

/**
 * Парсинг данных формы
 */
function parseFormData(postData) {
  const data = {};
  const pairs = postData.split('&');
  
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i].split('=');
    if (pair.length === 2) {
      const key = decodeURIComponent(pair[0].replace(/\+/g, ' '));
      const value = decodeURIComponent(pair[1].replace(/\+/g, ' '));
      data[key] = value.trim();
    }
  }
  
  return data;
}

/**
 * Валидация данных заявки
 */
function validateLeadData(data, CONFIG) {
  // Проверка honeypot (защита от ботов)
  if (data[CONFIG.HONEYPOT_FIELD] && data[CONFIG.HONEYPOT_FIELD].length > 0) {
    return { valid: false, error: 'Bot detected - honeypot field filled' };
  }
  
  // Проверка обязательных полей
  for (const field of CONFIG.REQUIRED_FIELDS) {
    if (!data[field] || data[field].length === 0) {
      return { valid: false, error: `Missing required field: ${field}` };
    }
  }
  
  // Валидация email (если заполнен)
  if (data.email && data.email.length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return { valid: false, error: 'Invalid email format' };
    }
  }
  
  // Валидация телефона
  if (data.phone && data.phone.length > 0) {
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(data.phone.replace(/\s/g, ''))) {
      return { valid: false, error: 'Invalid phone format' };
    }
  }
  
  // Валидация вопроса (минимум 10 символов)
  if (data.question && data.question.length < 10) {
    return { valid: false, error: 'Question too short (minimum 10 characters)' };
  }
  
  return { valid: true };
}

/**
 * Отправка уведомления в Telegram
 */
function sendToTelegram(data, CONFIG) {
  try {
    const message = formatTelegramMessage(data, CONFIG);
    const url = `https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const payload = {
      chat_id: CONFIG.MANAGER_CHAT_ID,
      text: message,
      parse_mode: 'Markdown',
      disable_web_page_preview: true,
      disable_notification: false
    };
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());
    
    if (result.ok) {
      console.log('✅ Telegram уведомление отправлено');
      return { success: true, message_id: result.result.message_id };
    } else {
      console.error('❌ Ошибка Telegram:', result.description);
      return { success: false, error: result.description };
    }
    
  } catch (error) {
    console.error('❌ Ошибка отправки в Telegram:', error);
    return { success: false, error: error.toString() };
  }
}

/**
 * Форматирование сообщения для Telegram
 */
function formatTelegramMessage(data, CONFIG) {
  const now = new Date();
  const formattedTime = Utilities.formatDate(now, CONFIG.TIMEZONE, CONFIG.DATE_FORMAT);
  
  let message = '*🎯 Новая заявка с сайта Елены Макаровой*\n\n';
  
  // Основные данные
  message += `👤 *Имя:* ${data.name}\n`;
  message += `📱 *Телефон:* \`${data.phone}\`\n`;
  
  // Email (если указан)
  if (data.email && data.email.length > 0) {
    message += `📧 *Email:* \`${data.email}\`\n`;
  } else {
    message += `📧 *Email:* не указан\n`;
  }
  
  // Предпочитаемый мессенджер
  const messengerName = data.messenger === 'telegram' ? 'Telegram' : 'WhatsApp';
  message += `💬 *Предпочитаемый мессенджер:* ${messengerName}\n`;
  
  // Вопрос
  message += `\n❓ *Вопрос:*\n${data.question}\n`;
  
  // Дополнительная информация
  message += `\n⏰ *Время:* ${formattedTime}`;
  
  if (data.page) {
    message += `\n🌐 *Страница:* ${data.page}`;
  }
  
  return message;
}

/**
 * Создание HTTP ответа с CORS заголовками
 */
function createResponse(success, message, data) {
  const response = {
    ok: success,
    message: message,
    data: data,
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  };
  
  const output = ContentService
    .createTextOutput(JSON.stringify(response, null, 2))
    .setMimeType(ContentService.MimeType.JSON);
  
  return output;
}

/**
 * Проверка конфигурации
 */
function checkConfiguration(CONFIG) {
  const errors = [];
  
  if (!CONFIG.TELEGRAM_BOT_TOKEN || CONFIG.TELEGRAM_BOT_TOKEN === 'YOUR_BOT_TOKEN') {
    errors.push('TELEGRAM_BOT_TOKEN not configured');
  }
  
  if (!CONFIG.MANAGER_CHAT_ID || CONFIG.MANAGER_CHAT_ID === 'YOUR_CHAT_ID') {
    errors.push('MANAGER_CHAT_ID not configured');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors,
    configured: errors.length === 0
  };
}

/**
 * Тестирование конфигурации и отправки
 */
function testConfiguration() {
  console.log('🧪 Тестирование Taro Contact Bot...');
  
  const CONFIG = getConfig();
  const configCheck = checkConfiguration(CONFIG);
  console.log('⚙️ Конфигурация:', configCheck);
  
  if (!configCheck.valid) {
    console.error('❌ Конфигурация неполная:', configCheck.errors);
    return { success: false, errors: configCheck.errors };
  }
  
  // Тестовая отправка в Telegram
  const testData = {
    name: 'Тестовый пользователь',
    email: 'test@example.com',
    phone: '+7 (999) 123-45-67',
    messenger: 'telegram',
    question: 'Это тестовое сообщение для проверки работы бота. Если вы получили это сообщение, значит всё настроено правильно!',
    page: 'https://test.example.com'
  };
  
  const telegramResult = sendToTelegram(testData, CONFIG);
  
  if (telegramResult.success) {
    console.log('✅ Тестовое сообщение отправлено в Telegram');
    return {
      success: true,
      message: 'Конфигурация корректна, тестовое сообщение отправлено',
      telegram_message_id: telegramResult.message_id
    };
  } else {
    console.error('❌ Ошибка отправки тестового сообщения:', telegramResult.error);
    return {
      success: false,
      error: telegramResult.error
    };
  }
}

