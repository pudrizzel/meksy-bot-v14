const i18next = require('i18next');
const fs = require('fs');
const path = require('path');

// Function to initialize i18next
function setupI18n() {
  // Get all language files from the languages directory
  const languageFiles = fs.readdirSync(__dirname)
    .filter(file => file.endsWith('.json'));

  // Create resources object for i18next
  const resources = {};
  
  // Load each language file
  languageFiles.forEach(file => {
    const languageCode = path.basename(file, '.json');
    const languageData = require(`./${file}`);
    resources[languageCode] = languageData;
  });

  // Initialize i18next
  i18next.init({
    resources,
    lng: 'en', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

  return i18next;
}

// Function to change the language
function setLanguage(lang) {
  if (i18next.languages.includes(lang)) {
    i18next.changeLanguage(lang);
    return true;
  }
  return false;
}

// Function to translate a key
function translate(key, options = {}) {
  return i18next.t(key, options);
}

// Function to get available languages
function getAvailableLanguages() {
  return i18next.languages;
}

// Function to get current language
function getCurrentLanguage() {
  return i18next.language;
}

module.exports = {
  setupI18n,
  setLanguage,
  translate: translate,
  t: translate, // Shorthand for translate
  getAvailableLanguages,
  getCurrentLanguage
};
