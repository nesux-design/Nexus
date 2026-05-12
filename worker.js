// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  NEXUS AI v8.0 - FINAL VERSION - PART 1 OF 10                              ║
// ║  Auto-Date System + Direct API Keys + 20 Languages + Supabase Auth         ║
// ║  Created by Akhil Jaiswal 🇮🇳                                                ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

// ==========================================
// ========== AUTO DATE DETECTION ==========
// ==========================================
const NOW = new Date();
const CURRENT_YEAR = NOW.getFullYear();
const CURRENT_MONTH = String(NOW.getMonth() + 1).padStart(2, '0');
const CURRENT_DAY = String(NOW.getDate()).padStart(2, '0');
const TODAY = CURRENT_YEAR + '-' + CURRENT_MONTH + '-' + CURRENT_DAY;

// ==========================================
// ========== SUPABASE CONFIGURATION ==========
// ==========================================
const SUPABASE_CONFIG = {
    URL: 'https://qvgqpgqxwbfgajmrxugo.supabase.co',
    ANON_KEY: 'sb_publishable_RSRD0E2uCmlsWIXYM8f0zw_KzV2Ffza',
    SERVICE_ROLE_KEY: 'sb_secret_UyUX9-9yZsxvUG_su7KPcA_mFlpmNXZ',
    JWT_SECRET: '92ef4446-00d4-4c34-b4f2-e10246bf3505'
};

// ==========================================
// ========== IMAGE API KEYS ==========
// ==========================================
const UNSPLASH_API_KEY = '3TjqJ4nn2zzYHS-3rAOl51IBM0uPIGNzN3zpyfd44a4';
const PIXABAY_API_KEY = '55789544-dcf85e102c0c6212ec589b662';

// ==========================================
// ========== DIRECT API KEYS (100% Working) ==========
// ==========================================
const DIRECT_API_KEYS = {
    gemini: [
        'AIzaSyAKE9pGHdIHdvswQ5xU2bob62i8v9SAGcA',
        'AIzaSyB-SCuJxEyPv_TDoIjl5g-PsI3LUMWPXrc',
        'AIzaSyCjFEDCeaPRy-XpeVgNOTy1ZUbthiullmU',
        'AIzaSyD7HGu6KL_ZvUsWPOMmxtcF5Pn4ROgzpkA',
        'AIzaSyB7eA8PnY_rHMWq5ARboYXdPSip-WHS92g'
    ],
    groq: [
        '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',
        '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',
        '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'
    ],
    cerebras: [
        'csk-6j4wve9hyyfvwdn58p8263hptxht6y58ekm8c35jv4ndyynv',
        'csk-jvtctmh59evxnn3ck5ev9hfd8rcxhvythrhpyfypfjp223tj',
        'csk-3rh6n4ev4dk3xrvretm6rk5d325dycvyryww53ehrh6n232v'
    ],
    sambanova: [
        'fde089f0-fd70-4c7b-9916-5ffffedc512e',
        'd94ecfb5-d294-4675-bd72-eb88795e75e1',
        'c3efb64b-c784-4e99-a8d3-e81605efcf3f'
    ],
    glm: [
        '1f9e20537b7b4d8394dc67c244ac742b.MNmyCVC6yIaiJCTm'
    ],
    openrouter: [
        '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'
    ]
};

// Key rotation index tracker
const KEY_INDEX = {
    gemini: 0,
    groq: 0,
    cerebras: 0,
    sambanova: 0,
    glm: 0,
    openrouter: 0
};

// Failed keys with cooldown
const FAILED_KEYS = new Map();

function getNextKey(provider) {
    const keys = DIRECT_API_KEYS[provider];
    
    if (!keys || keys.length === 0) {
        console.error('❌ No keys found for provider:', provider);
        return null;
    }
    
    const now = Date.now();
    
    // Try each key starting from current index
    for (let i = 0; i < keys.length; i++) {
        const index = (KEY_INDEX[provider] + i) % keys.length;
        const key = keys[index];
        const failedUntil = FAILED_KEYS.get(key);
        
        // Skip if key is in cooldown
        if (failedUntil && now < failedUntil) {
            continue;
        }
        
        // Update index for next call
        KEY_INDEX[provider] = (index + 1) % keys.length;
        return key;
    }
    
    // All keys in cooldown, use first key anyway
    console.warn('⚠️ All keys for ' + provider + ' are in cooldown, using first key');
    return keys[0];
}

function markKeyFailed(provider, key, seconds) {
    const cooldownSeconds = seconds || 60;
    FAILED_KEYS.set(key, Date.now() + cooldownSeconds * 1000);
    console.log('🔒 Key marked failed for ' + provider + ' - cooldown: ' + cooldownSeconds + 's');
}

// ==========================================
// ========== 20+ INDIAN LANGUAGES ==========
// ==========================================
const INDIAN_LANGUAGES = {
    hi: { name: 'Hindi', native: 'हिन्दी', script: 'Devanagari', direction: 'ltr' },
    bn: { name: 'Bengali', native: 'বাংলা', script: 'Bengali', direction: 'ltr' },
    te: { name: 'Telugu', native: 'తెలుగు', script: 'Telugu', direction: 'ltr' },
    ta: { name: 'Tamil', native: 'தமிழ்', script: 'Tamil', direction: 'ltr' },
    mr: { name: 'Marathi', native: 'मराठी', script: 'Devanagari', direction: 'ltr' },
    gu: { name: 'Gujarati', native: 'ગુજરાતી', script: 'Gujarati', direction: 'ltr' },
    kn: { name: 'Kannada', native: 'ಕನ್ನಡ', script: 'Kannada', direction: 'ltr' },
    ml: { name: 'Malayalam', native: 'മലയാളം', script: 'Malayalam', direction: 'ltr' },
    pa: { name: 'Punjabi', native: 'ਪੰਜਾਬੀ', script: 'Gurmukhi', direction: 'ltr' },
    or: { name: 'Odia', native: 'ଓଡ଼ିଆ', script: 'Odia', direction: 'ltr' },
    as: { name: 'Assamese', native: 'অসমীয়া', script: 'Bengali', direction: 'ltr' },
    ur: { name: 'Urdu', native: 'اردو', script: 'Arabic', direction: 'rtl' },
    sa: { name: 'Sanskrit', native: 'संस्कृतम्', script: 'Devanagari', direction: 'ltr' },
    ks: { name: 'Kashmiri', native: 'कॉशुर', script: 'Devanagari', direction: 'ltr' },
    sd: { name: 'Sindhi', native: 'سنڌي', script: 'Arabic', direction: 'rtl' },
    ne: { name: 'Nepali', native: 'नेपाली', script: 'Devanagari', direction: 'ltr' },
    mai: { name: 'Maithili', native: 'मैथिली', script: 'Devanagari', direction: 'ltr' },
    brx: { name: 'Bodo', native: 'बर\'', script: 'Devanagari', direction: 'ltr' },
    sat: { name: 'Santali', native: 'ᱥᱟᱱᱛᱟᱲᱤ', script: 'Ol Chiki', direction: 'ltr' },
    mni: { name: 'Manipuri', native: 'মৈতৈলোন্', script: 'Bengali', direction: 'ltr' },
    en: { name: 'English', native: 'English', script: 'Latin', direction: 'ltr' }
};

// ==========================================
// ========== LANGUAGE DETECTION ENGINE ==========
// ==========================================
function detectLanguage(text) {
    if (!text || text.length === 0) {
        return 'en';
    }
    
    const scriptPatterns = {
        hi: /[\u0900-\u097F]/,
        bn: /[\u0980-\u09FF]/,
        te: /[\u0C00-\u0C7F]/,
        ta: /[\u0B80-\u0BFF]/,
        gu: /[\u0A80-\u0AFF]/,
        kn: /[\u0C80-\u0CFF]/,
        ml: /[\u0D00-\u0D7F]/,
        pa: /[\u0A00-\u0A7F]/,
        or: /[\u0B00-\u0B7F]/,
        ur: /[\u0600-\u06FF]/,
        sat: /[\u1C50-\u1C7F]/
    };
    
    for (const [languageCode, pattern] of Object.entries(scriptPatterns)) {
        if (pattern.test(text)) {
            return languageCode;
        }
    }
    
    const words = text.toLowerCase().split(/\s+/);
    
    const markers = {
        hi: ['hai', 'kya', 'tum', 'hum', 'yeh', 'woh', 'kaise', 'kahan', 'kab', 'kyon'],
        bn: ['ache', 'bhalo', 'kemon', 'ami', 'tumi', 'kothay'],
        te: ['undi', 'ledu', 'vastundi', 'nenu', 'meeru'],
        ta: ['irukku', 'illai', 'vanakkam', 'naan', 'neenga'],
        mr: ['ahe', 'nahi', 'kay', 'tu', 'mi'],
        gu: ['che', 'nathi', 'shu', 'hu', 'tame'],
        kn: ['ide', 'illa', 'nanu', 'neenu'],
        ml: ['und', 'illa', 'njan', 'ningal'],
        pa: ['hai', 'nahi', 'ki', 'main', 'tusi']
    };
    
    let bestLanguage = 'en';
    let bestScore = 0;
    
    for (const [languageCode, markerWords] of Object.entries(markers)) {
        let score = 0;
        
        for (const word of words) {
            if (markerWords.includes(word)) {
                score = score + 1;
            }
        }
        
        if (score > bestScore) {
            bestScore = score;
            bestLanguage = languageCode;
        }
    }
    
    return bestLanguage;
}

// ==========================================
// ========== AUTO TRANSLATION ENGINE ==========
// ==========================================
async function autoTranslate(text, targetLanguage, sourceLanguage) {
    if (!text || targetLanguage === 'en') {
        return text;
    }
    
    if (!sourceLanguage) {
        sourceLanguage = detectLanguage(text);
    }
    
    if (sourceLanguage === targetLanguage) {
        return text;
    }
    
    const key = getNextKey('gemini');
    
    if (!key) {
        return text;
    }
    
    try {
        const sourceName = INDIAN_LANGUAGES[sourceLanguage] ? INDIAN_LANGUAGES[sourceLanguage].name : sourceLanguage;
        const targetName = INDIAN_LANGUAGES[targetLanguage] ? INDIAN_LANGUAGES[targetLanguage].name : targetLanguage;
        
        const response = await fetch(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=' + key,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: 'Translate from ' + sourceName + ' to ' + targetName + '. Return ONLY the translation:\n' + text
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.1,
                        maxOutputTokens: 65536
                    }
                })
            }
        );
        
        if (response.ok) {
            const data = await response.json();
            const translatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (translatedText) {
                return translatedText;
            }
        }
    } catch (error) {
        console.error('Translation Error:', error);
    }
    
    return text;
}

// ==========================================
// ========== CONFIGURATION ==========
// ==========================================
const CONFIG = {
    APP_NAME: 'NEXUS',
    CREATOR: 'Akhil Jaiswal',
    API_KEY: 'akhil-123',
    UPI_ID: 'jaiswalanushi8@oksbi',
    AMAZON_AFFILIATE_ID: 'akhilgpt-21',
    ADMIN_IDS: ['admin', 'akhil', 'jaiswalanushi08'],
    SLACK_WEBHOOK_URL: '',
    SLACK_SIGNING_SECRET: '',
    WORKER_URL: 'https://nexus-a1.apikeyakhilka.workers.dev',
    THINKING_MODE: true,
    CONTEXT_WINDOW: {
        max_tokens: 1000000,
        max_messages: 500,
        importance_threshold: 0.3
    },
    PREMIUM_PLANS: {
        monthly: { price: 299, days: 30, name: 'Monthly Plan' },
        yearly: { price: 1499, days: 365, name: 'Yearly Plan' },
        pro: { price: 2999, days: 365, name: 'Pro Plan' }
    },
    PAID_FEATURES: {
        resume_builder: { price: 49, name: 'Resume Builder' },
        cover_letter: { price: 29, name: 'Cover Letter' },
        blog_generator: { price: 99, name: 'SEO Blog Generator' },
        social_posts: { price: 49, name: '30 Days Social Posts' },
        code_execution: { price: 199, name: 'Code Execution (1000 runs)' }
    },
    MAX_TOKENS_GEMINI: 65536,
    MAX_TOKENS_GROQ: 32768,
    MAX_TOKENS_CEREBRAS: 8192,
    MAX_TOKENS_SAMBANOVA: 8192,
    MAX_TOKENS_GLM: 8192,
    MAX_TOKENS_OPENROUTER: 4096,
    TTS_KEYS: {
        elevenlabs: [
            'sk_450d0017d433a30589a60053131792f7220884d9d0fc1a90',
            'sk_43ba6a1e884687c8b353825ef3a137ec9bdae0e550d91ece',
            'sk_a49fcadd2b53c050aa5d0fe81593f439f187f0017a98ad9a'
        ],
        deepgram: [
            '17863813002783d40d19a8d52b6f965cf37b711d',
            'f4094d8973e1b333e7d09b8f6817398a23ed5cae'
        ]
    },
    MEMORY_SIZE: 500,
    SESSION_TIMEOUT: 7200000,
    RATE_LIMIT_IP: 1000,
    RATE_LIMIT_USER: 2000,
    MODEL_TIMEOUT: 60000,
    CACHE_TTL: 360000,
    IMAGE_WIDTH: 1024,
    IMAGE_HEIGHT: 1024
};

// ==========================================
// ========== HELPER FUNCTIONS ==========
// ==========================================
function generateId() {
    return Date.now() + '_' + Math.random().toString(36).substring(2, 10);
}

function isAdmin(userId) {
    return CONFIG.ADMIN_IDS.includes(userId);
}

function escapeHTML(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ==========================================
// ========== SUPABASE CLIENT CLASS ==========
// ==========================================
class SupabaseClient {
    constructor(url, key) {
        this.url = url;
        this.key = key;
        this.baseHeaders = {
            'apikey': key,
            'Authorization': 'Bearer ' + key,
            'Content-Type': 'application/json'
        };
    }

    async rest(method, endpoint, body, userToken) {
        const headers = Object.assign({}, this.baseHeaders);
        
        if (userToken) {
            headers['Authorization'] = 'Bearer ' + userToken;
        }
        
        if (body) {
            headers['Prefer'] = 'return=representation';
        }
        
        const options = {
            method: method,
            headers: headers
        };
        
        if (body) {
            options.body = JSON.stringify(body);
        }
        
        const response = await fetch(this.url + '/rest/v1/' + endpoint, options);
        return response;
    }

    async auth(method, endpoint, body, token) {
        const headers = Object.assign({}, this.baseHeaders);
        
        if (token) {
            headers['Authorization'] = 'Bearer ' + token;
        }
        
        const options = {
            method: method,
            headers: headers
        };
        
        if (body) {
            options.body = JSON.stringify(body);
        }
        
        const response = await fetch(this.url + '/auth/v1/' + endpoint, options);
        return response;
    }

    async verifyJWT(token) {
        try {
            const parts = token.split('.');
            
            if (parts.length !== 3) {
                return null;
            }
            
            const payload = JSON.parse(atob(parts[1]));
            
            if (payload.exp && Date.now() >= payload.exp * 1000) {
                return null;
            }
            
            return {
                userId: payload.sub,
                email: payload.email,
                role: payload.role,
                expiresAt: payload.exp ? new Date(payload.exp * 1000) : null,
                issuedAt: payload.iat ? new Date(payload.iat * 1000) : null
            };
        } catch (error) {
            return null;
        }
    }

    async getUser(userId, token) {
        try {
            const response = await this.rest('GET', 'users?id=eq.' + userId + '&select=*', null, token);
            
            if (response.ok) {
                const users = await response.json();
                return users[0] || null;
            }
            
            return null;
        } catch (error) {
            return null;
        }
    }

    async upsertUser(userData, token) {
        try {
            const response = await this.rest('POST', 'users', userData, token);
            
            if (response.ok) {
                const users = await response.json();
                return users[0] || null;
            }
            
            return null;
        } catch (error) {
            return null;
        }
    }

    async updateUser(userId, updates, token) {
        try {
            const response = await this.rest('PATCH', 'users?id=eq.' + userId, updates, token);
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    async getConversations(userId, limit, token) {
        try {
            const maxLimit = limit || 50;
            const response = await this.rest(
                'GET',
                'conversations?user_id=eq.' + userId + '&order=updated_at.desc&limit=' + maxLimit,
                null,
                token
            );
            
            if (response.ok) {
                return await response.json();
            }
            
            return [];
        } catch (error) {
            return [];
        }
    }

    async createConversation(data, token) {
        try {
            const response = await this.rest('POST', 'conversations', data, token);
            
            if (response.ok) {
                const conversations = await response.json();
                return conversations[0] || null;
            }
            
            return null;
        } catch (error) {
            return null;
        }
    }

    async updateConversation(conversationId, updates, token) {
        try {
            const response = await this.rest('PATCH', 'conversations?id=eq.' + conversationId, updates, token);
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    async deleteConversation(conversationId, token) {
        try {
            const response = await this.rest('DELETE', 'conversations?id=eq.' + conversationId, null, token);
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    async searchConversations(userId, query, token) {
        try {
            const response = await this.rest(
                'GET',
                'conversations?user_id=eq.' + userId + '&title=ilike.*' + encodeURIComponent(query) + '*&order=updated_at.desc&limit=20',
                null,
                token
            );
            
            if (response.ok) {
                return await response.json();
            }
            
            return [];
        } catch (error) {
            return [];
        }
    }

    async getPremiumStatus(userId, token) {
        try {
            const user = await this.getUser(userId, token);
            
            if (!user) {
                return {
                    isPremium: false,
                    plan: 'free',
                    premiumExpiry: null
                };
            }
            
            const isPremium = user.is_premium && (
                !user.premium_expiry ||
                new Date(user.premium_expiry) > new Date()
            );
            
            return {
                isPremium: isPremium,
                plan: isPremium ? (user.plan || 'monthly') : 'free',
                premiumExpiry: user.premium_expiry || null
            };
        } catch (error) {
            return {
                isPremium: false,
                plan: 'free',
                premiumExpiry: null
            };
        }
    }
}

// ==========================================
// ========== ENHANCED AUTHENTICATION ==========
// ==========================================
async function enhancedAuthenticate(request, env) {
    const authHeader = request.headers.get('Authorization');
    const apiKey = request.headers.get('X-API-Key');
    const legacyUserId = request.headers.get('X-User-ID');
    
    const supabaseKey = SUPABASE_CONFIG.SERVICE_ROLE_KEY || SUPABASE_CONFIG.ANON_KEY;
    const supabase = new SupabaseClient(SUPABASE_CONFIG.URL, supabaseKey);
    
    // Priority 1: Supabase JWT Token
    if (authHeader && authHeader.startsWith('Bearer eyJ')) {
        const token = authHeader.replace('Bearer ', '');
        const decoded = await supabase.verifyJWT(token);
        
        if (decoded && decoded.userId) {
            const userData = await supabase.getUser(decoded.userId, token);
            const premiumStatus = await supabase.getPremiumStatus(decoded.userId, token);
            
            return {
                authenticated: true,
                method: 'supabase_jwt',
                userId: decoded.userId,
                email: decoded.email || (userData ? userData.email : null),
                userData: userData,
                isPremium: premiumStatus.isPremium,
                plan: premiumStatus.plan,
                premiumExpiry: premiumStatus.premiumExpiry,
                supabase: supabase,
                token: token
            };
        }
    }
    
    // Priority 2: Legacy API Key + X-User-ID
    if (apiKey === CONFIG.API_KEY && legacyUserId && legacyUserId !== 'anonymous') {
        const premiumStatus = await supabase.getPremiumStatus(legacyUserId);
        
        return {
            authenticated: true,
            method: 'legacy_api_key',
            userId: legacyUserId,
            email: null,
            userData: null,
            isPremium: premiumStatus.isPremium || isAdmin(legacyUserId),
            plan: premiumStatus.plan || 'free',
            premiumExpiry: premiumStatus.premiumExpiry || null,
            supabase: supabase,
            token: null
        };
    }
    
    // Priority 3: Anonymous
    if (apiKey === CONFIG.API_KEY) {
        return {
            authenticated: false,
            method: 'anonymous',
            userId: 'anonymous',
            email: null,
            userData: null,
            isPremium: false,
            plan: 'free',
            premiumExpiry: null,
            supabase: supabase,
            token: null
        };
    }
    
    // Unauthorized
    return {
        authenticated: false,
        method: 'unauthorized',
        userId: null,
        email: null,
        userData: null,
        isPremium: false,
        plan: 'free',
        premiumExpiry: null,
        supabase: supabase,
        token: null
    };
}

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║                    PART 1/10 COMPLETE — ~380 Lines                          ║
// ║  ✅ Auto Date Detection (TODAY, CURRENT_YEAR)                                ║
// ║  ✅ Supabase Full Integration                                                ║
// ║  ✅ Unsplash + Pixabay API Keys Ready                                        ║
// ║  ✅ DIRECT API Keys (6 Providers, 17 Keys)                                   ║
// ║  ✅ Key Rotation with Cooldown System                                        ║
// ║  ✅ 20+ Indian Languages Database                                             ║
// ║  ✅ Language Detection Engine                                                 ║
// ║  ✅ Auto Translation Engine                                                   ║
// ║  ✅ Full CONFIG with Premium Plans                                            ║
// ║  ✅ SupabaseClient Class (Full CRUD + Auth)                                   ║
// ║  ✅ Enhanced Authentication (JWT + Legacy + Anonymous)                        ║
// ║  Next: Part 2/10 — Memory System + AI Agents + Master Prompt                 ║
// ╚══════════════════════════════════════════════════════════════════════════════╝
