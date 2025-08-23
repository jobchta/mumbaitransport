/**
 * Language Manager for Mumbai Transport App
 * Handles multiple Indian languages and translations
 */
class LanguageManager {
    constructor() {
        this.currentLanguage = 'en';
        this.translations = {
            en: {
                // Header
                'app-title': 'Mumbai Transport',
                'app-subtitle': 'Plan • Book • Travel',
                'current-language': 'English',
                
                // Tab Navigation
                'tab-plan': 'Plan',
                'tab-tickets': 'Tickets',
                'tab-compare': 'Compare',
                
                // Plan Tab
                'plan-title': 'Plan Your Journey',
                'transport-all': 'All',
                'transport-metro': 'Metro',
                'transport-bus': 'Bus',
                'transport-train': 'Train',
                'from-label': 'From',
                'to-label': 'To',
                'when-label': 'When',
                'from-placeholder': 'Current location or address',
                'to-placeholder': 'Destination',
                'leave-now': 'Leave now',
                'depart-at': 'Depart at',
                'arrive-by': 'Arrive by',
                'find-routes': 'Find Routes',
                'best-routes': 'Best Routes',
                'route-guidance': 'Route Guidance',
                
                // Tickets Tab
                'tickets-title': 'Metro Tickets & Fares',
                'line1-name': 'Line 1 (Versova-Andheri-Ghatkopar)',
                'line2a-name': 'Line 2A (Dahisar-DN Nagar)',
                'line7-name': 'Line 7 (Dahisar East-Andheri East)',
                'operational': 'Operational',
                'buy-ticket': 'Buy Ticket',
                'check-fare': 'Check Fare',
                'current-fares': 'Current Fares',
                'quick-actions': 'Quick Actions',
                'metro-support': 'Metro Support',
                'ticket-issues': 'Ticket Issues',
                'refund-request': 'Refund Request',
                
                // Compare Tab
                'compare-title': 'Compare Rides',
                'metro': 'Metro',
                'bus': 'Bus',
                'taxi': 'Taxi',
                'select': 'Select',
                'account-connections': 'Account Connections',
                'signin-google': 'Sign in with Google',
                'connect-uber': 'Connect Uber',
                'connect-ola': 'Connect Ola',
                
                // Common
                'minutes': 'min',
                'rupees': '₹',
                'crowded': 'Crowded',
                'moderate': 'Moderate',
                'private': 'Private',
                'depart': 'Depart',
                'walk': 'walk',
                'users': 'users'
            },
            hi: {
                // Header
                'app-title': 'मुंबई परिवहन',
                'app-subtitle': 'योजना • बुक • यात्रा',
                'current-language': 'हिंदी',
                
                // Tab Navigation
                'tab-plan': 'योजना',
                'tab-tickets': 'टिकट',
                'tab-compare': 'तुलना',
                
                // Plan Tab
                'plan-title': 'अपनी यात्रा की योजना बनाएं',
                'transport-all': 'सभी',
                'transport-metro': 'मेट्रो',
                'transport-bus': 'बस',
                'transport-train': 'ट्रेन',
                'from-label': 'से',
                'to-label': 'तक',
                'when-label': 'कब',
                'from-placeholder': 'वर्तमान स्थान या पता',
                'to-placeholder': 'गंतव्य',
                'leave-now': 'अभी जाएं',
                'depart-at': 'समय पर जाएं',
                'arrive-by': 'समय तक पहुंचें',
                'find-routes': 'मार्ग खोजें',
                'best-routes': 'सर्वश्रेष्ठ मार्ग',
                'route-guidance': 'मार्ग मार्गदर्शन',
                
                // Tickets Tab
                'tickets-title': 'मेट्रो टिकट और किराया',
                'line1-name': 'लाइन 1 (वर्सोवा-अंधेरी-घाटकोपर)',
                'line2a-name': 'लाइन 2A (दहिसर-डीएन नगर)',
                'line7-name': 'लाइन 7 (दहिसर पूर्व-अंधेरी पूर्व)',
                'operational': 'संचालन',
                'buy-ticket': 'टिकट खरीदें',
                'check-fare': 'किराया जांचें',
                'current-fares': 'वर्तमान किराया',
                'quick-actions': 'त्वरित कार्य',
                'metro-support': 'मेट्रो सहायता',
                'ticket-issues': 'टिकट समस्याएं',
                'refund-request': 'धनवापसी अनुरोध',
                
                // Compare Tab
                'compare-title': 'सवारी की तुलना',
                'metro': 'मेट्रो',
                'bus': 'बस',
                'taxi': 'टैक्सी',
                'select': 'चुनें',
                'account-connections': 'खाता कनेक्शन',
                'signin-google': 'Google से साइन इन करें',
                'connect-uber': 'Uber कनेक्ट करें',
                'connect-ola': 'Ola कनेक्ट करें',
                
                // Common
                'minutes': 'मिनट',
                'rupees': '₹',
                'crowded': 'भीड़',
                'moderate': 'मध्यम',
                'private': 'निजी',
                'depart': 'प्रस्थान',
                'walk': 'पैदल',
                'users': 'उपयोगकर्ता'
            },
            mr: {
                // Header
                'app-title': 'मुंबई परिवहन',
                'app-subtitle': 'योजना • बुक • प्रवास',
                'current-language': 'मराठी',
                
                // Tab Navigation
                'tab-plan': 'योजना',
                'tab-tickets': 'तिकीट',
                'tab-compare': 'तुलना',
                
                // Plan Tab
                'plan-title': 'तुमच्या प्रवासाची योजना करा',
                'transport-all': 'सर्व',
                'transport-metro': 'मेट्रो',
                'transport-bus': 'बस',
                'transport-train': 'रेल्वे',
                'from-label': 'कडून',
                'to-label': 'पर्यंत',
                'when-label': 'कधी',
                'from-placeholder': 'सध्याचे स्थान किंवा पत्ता',
                'to-placeholder': 'गंतव्य',
                'leave-now': 'आता जा',
                'depart-at': 'वेळेला जा',
                'arrive-by': 'वेळेपर्यंत पोहोचा',
                'find-routes': 'मार्ग शोधा',
                'best-routes': 'सर्वोत्तम मार्ग',
                'route-guidance': 'मार्ग मार्गदर्शन',
                
                // Tickets Tab
                'tickets-title': 'मेट्रो तिकीट आणि भाडे',
                'line1-name': 'लाइन 1 (वर्सोवा-अंधेरी-घाटकोपर)',
                'line2a-name': 'लाइन 2A (दहिसर-डीएन नगर)',
                'line7-name': 'लाइन 7 (दहिसर पूर्व-अंधेरी पूर्व)',
                'operational': 'कामकाज',
                'buy-ticket': 'तिकीट खरेदी करा',
                'check-fare': 'भाडे तपासा',
                'current-fares': 'सध्याचे भाडे',
                'quick-actions': 'त्वरित कृती',
                'metro-support': 'मेट्रो समर्थन',
                'ticket-issues': 'तिकीट समस्या',
                'refund-request': 'परतावा विनंती',
                
                // Compare Tab
                'compare-title': 'सवारीची तुलना',
                'metro': 'मेट्रो',
                'bus': 'बस',
                'taxi': 'टॅक्सी',
                'select': 'निवडा',
                'account-connections': 'खाते कनेक्शन',
                'signin-google': 'Google सह साइन इन करा',
                'connect-uber': 'Uber कनेक्ट करा',
                'connect-ola': 'Ola कनेक्ट करा',
                
                // Common
                'minutes': 'मिनिटे',
                'rupees': '₹',
                'crowded': 'गर्दी',
                'moderate': 'मध्यम',
                'private': 'खाजगी',
                'depart': 'निघणे',
                'walk': 'चालणे',
                'users': 'वापरकर्ते'
            }
        };
        
        this.init();
    }

    /**
     * Initialize language manager
     */
    init() {
        this.setupEventListeners();
        this.loadSavedLanguage();
        this.updateLanguage();
    }

    /**
     * Setup event listeners for language selector
     */
    setupEventListeners() {
        document.addEventListener('DOMContentLoaded', () => {
            const languageBtn = document.getElementById('language-btn');
            const languageDropdown = document.getElementById('language-dropdown');
            const languageOptions = document.querySelectorAll('.language-option');

            if (languageBtn) {
                languageBtn.addEventListener('click', () => {
                    languageDropdown.classList.toggle('show');
                });
            }

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.language-selector')) {
                    languageDropdown.classList.remove('show');
                }
            });

            // Language option selection
            languageOptions.forEach(option => {
                option.addEventListener('click', () => {
                    const lang = option.getAttribute('data-lang');
                    this.setLanguage(lang);
                    languageDropdown.classList.remove('show');
                });
            });
        });
    }

    /**
     * Load saved language from localStorage
     */
    loadSavedLanguage() {
        const savedLang = localStorage.getItem('mumbai-transport-language');
        if (savedLang && this.translations[savedLang]) {
            this.currentLanguage = savedLang;
        }
    }

    /**
     * Set language and save to localStorage
     * @param {string} lang - Language code
     */
    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLanguage = lang;
            localStorage.setItem('mumbai-transport-language', lang);
            this.updateLanguage();
            console.log(`🌍 Language changed to: ${lang}`);
        }
    }

    /**
     * Update all text elements with current language
     */
    updateLanguage() {
        const elements = document.querySelectorAll('[data-translate]');
        elements.forEach(element => {
            const key = element.getAttribute('data-translate');
            const translation = this.getTranslation(key);
            if (translation) {
                element.textContent = translation;
            }
        });

        // Update current language display
        const currentLanguageElement = document.getElementById('current-language');
        if (currentLanguageElement) {
            currentLanguageElement.textContent = this.getTranslation('current-language') || 'English';
        }

        // Update active language option
        const languageOptions = document.querySelectorAll('.language-option');
        languageOptions.forEach(option => {
            option.classList.remove('active');
            if (option.getAttribute('data-lang') === this.currentLanguage) {
                option.classList.add('active');
            }
        });
    }

    /**
     * Get translation for a key
     * @param {string} key - Translation key
     * @returns {string} - Translated text
     */
    getTranslation(key) {
        return this.translations[this.currentLanguage]?.[key] || this.translations.en[key] || key;
    }

    /**
     * Get current language
     * @returns {string} - Current language code
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * Get available languages
     * @returns {string[]} - Array of language codes
     */
    getAvailableLanguages() {
        return Object.keys(this.translations);
    }
}

// Global language manager instance
window.languageManager = new LanguageManager();

// Export for use in other modules
window.getTranslation = (key) => window.languageManager.getTranslation(key);
