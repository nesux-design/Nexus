// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  NEXUS AI v8.0 - FINAL PERFECT VERSION - PART 1 OF 9                       ║
// ║  Auto-Date + Direct Keys + Model Limits + 21 Languages + Supabase          ║
// ║  "ChatGPT+Claude+Gemini+DeepSeek+Copilot+Grok - SABKA BAAP!"              ║
// ║  Created by Akhil Jaiswal 🇮🇳                                                ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

// ==========================================
// ========== AUTO DATE SYSTEM ==========
// ==========================================
const NOW = new Date();
const CURRENT_YEAR = NOW.getFullYear();
const CURRENT_MONTH = String(NOW.getMonth() + 1).padStart(2, '0');
const CURRENT_DAY = String(NOW.getDate()).padStart(2, '0');
const TODAY = CURRENT_YEAR + '-' + CURRENT_MONTH + '-' + CURRENT_DAY;

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
    
    // ╔══════════════════════════════════════════════════════════╗
    // ║  MODEL INPUT LIMITS (Context Window Size)              ║
    // ║  Based on actual 2026 data for all providers           ║
    // ╚══════════════════════════════════════════════════════════╝
    CONTEXT_WINDOW: {
        max_tokens: 1000000,
        max_messages: 500,
        importance_threshold: 0.3,
        model_limits: {
            gemini: 1000000,       // Gemini 2.5 Flash-Lite: 1M input, 65K output
            groq: 131072,          // Groq GPT-OSS 120B: 131K input, 65K output
            cerebras: 8192,        // Cerebras Llama 3.1 8B: 8K input, 8K output
            sambanova: 128000,     // SambaNova Gemma 3: 128K input, 128K output
            glm: 64000,            // GLM-4V: 64K input, 32K output
            openrouter: 16385      // DeepSeek V4 Flash: 16K input
        }
    },
    
    // ╔══════════════════════════════════════════════════════════╗
    // ║  PREMIUM TIERS                                          ║
    // ╚══════════════════════════════════════════════════════════╝
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
    
    // ╔══════════════════════════════════════════════════════════╗
    // ║  OUTPUT TOKEN LIMITS (Max Generate)                    ║
    // ║  Based on actual 2026 data for all providers           ║
    // ╚══════════════════════════════════════════════════════════╝
    MAX_TOKENS_GEMINI: 65536,
    MAX_TOKENS_GROQ: 65536,
    MAX_TOKENS_CEREBRAS: 8192,
    MAX_TOKENS_SAMBANOVA: 128000,
    MAX_TOKENS_GLM: 32768,
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
// ========== DIRECT API KEYS (ALL PROVIDERS) ==========
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
    glm: ['1f9e20537b7b4d8394dc67c244ac742b.MNmyCVC6yIaiJCTm'],
    openrouter: ['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']
};

// ==========================================
// ========== KEY ROTATION SYSTEM ==========
// ==========================================
const KEY_INDEX = { gemini: 0, groq: 0, cerebras: 0, sambanova: 0, glm: 0, openrouter: 0 };
const FAILED_KEYS = new Map();

function getNextKey(provider) {
    const keys = DIRECT_API_KEYS[provider];
    if (!keys || keys.length === 0) return null;
    
    const now = Date.now();
    for (let i = 0; i < keys.length; i++) {
        const index = (KEY_INDEX[provider] + i) % keys.length;
        const key = keys[index];
        const failedUntil = FAILED_KEYS.get(key);
        if (failedUntil && now < failedUntil) continue;
        KEY_INDEX[provider] = (index + 1) % keys.length;
        return key;
    }
    return keys[0];
}

function markKeyFailed(provider, key, seconds) {
    FAILED_KEYS.set(key, Date.now() + (seconds || 60) * 1000);
}

// ==========================================
// ========== 21 INDIAN LANGUAGES ==========
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
// ========== LANGUAGE DETECTION ==========
// ==========================================
function detectLanguage(text) {
    if (!text || text.length === 0) return 'en';
    
    const scriptPatterns = {
        hi: /[\u0900-\u097F]/, bn: /[\u0980-\u09FF]/, te: /[\u0C00-\u0C7F]/,
        ta: /[\u0B80-\u0BFF]/, gu: /[\u0A80-\u0AFF]/, kn: /[\u0C80-\u0CFF]/,
        ml: /[\u0D00-\u0D7F]/, pa: /[\u0A00-\u0A7F]/, or: /[\u0B00-\u0B7F]/,
        ur: /[\u0600-\u06FF]/, sat: /[\u1C50-\u1C7F]/
    };
    
    for (const [lang, regex] of Object.entries(scriptPatterns)) {
        if (regex.test(text)) return lang;
    }
    
    const words = text.toLowerCase().split(/\s+/);
    const markers = {
        hi: ['hai', 'kya', 'tum', 'hum', 'yeh', 'woh', 'kaise', 'kahan'],
        bn: ['ache', 'bhalo', 'kemon', 'ami', 'tumi'],
        te: ['undi', 'ledu', 'vastundi', 'nenu', 'meeru'],
        ta: ['irukku', 'illai', 'vanakkam', 'naan', 'neenga'],
        mr: ['ahe', 'nahi', 'kay', 'tu', 'mi'],
        gu: ['che', 'nathi', 'shu', 'hu', 'tame'],
        kn: ['ide', 'illa', 'nanu', 'neenu'],
        ml: ['und', 'illa', 'njan', 'ningal'],
        pa: ['hai', 'nahi', 'ki', 'main', 'tusi']
    };
    
    let best = 'en', max = 0;
    for (const [lang, arr] of Object.entries(markers)) {
        let score = words.filter(w => arr.includes(w)).length;
        if (score > max) { max = score; best = lang; }
    }
    return best;
}

// ==========================================
// ========== AUTO TRANSLATION ==========
// ==========================================
async function autoTranslate(text, targetLang, sourceLang) {
    if (!text || targetLang === 'en') return text;
    sourceLang = sourceLang || detectLanguage(text);
    if (sourceLang === targetLang) return text;
    
    const key = getNextKey('gemini');
    if (!key) return text;
    
    try {
        const src = INDIAN_LANGUAGES[sourceLang]?.name || sourceLang;
        const tgt = INDIAN_LANGUAGES[targetLang]?.name || targetLang;
        const response = await fetch(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=' + key,
            {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: 'Translate from ' + src + ' to ' + tgt + '. Return ONLY translation:\n' + text }] }],
                    generationConfig: { temperature: 0.1, maxOutputTokens: 65536 }
                })
            }
        );
        if (response.ok) {
            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || text;
        }
    } catch (e) {}
    return text;
}

// ==========================================
// ========== GPT-5.5 MASTER PROMPT ==========
// ==========================================
const MASTER_PROMPT = `You are NEXUS, an advanced AI assistant created by Akhil Jaiswal. You operate at GPT-5.5 level with real-time web access via Google Search.

## 🎯 YOUR IDENTITY & PERSONALITY
- You are helpful, creative, clever, and genuinely friendly
- You are curious about the user and their needs
- You match the user's tone and language naturally
- You're enthusiastic but not overbearing
- You can be playful when appropriate, serious when needed
- You remember context within a conversation and reference previous exchanges
- You admit when you don't know something rather than pretending

**AUTOMATICALLY CREATE AN IMAGE when the user's core intent is:**
- To SEE something visual: "sunset", "dragon", "red car", "Taj Mahal"
- To VISUALIZE an idea: "what would a futuristic Delhi look like"
- To GET a picture: "dikhao", "photo", "show me"
- To ILLUSTRATE a concept: "how does a black hole look"
- Any request where a visual answer is more valuable than text

**AUTOMATICALLY CREATE A TEXT TABLE when the user's core intent is:**
- To COMPARE things: "iPhone vs Samsung", "compare these phones"
- To ORGANIZE data: "points table", "schedule", "list of matches"
- To see STATISTICS: "IPL standings", "team rankings", "sales data"
- To get STRUCTURED info: "features comparison", "price list"
- Any request where organized text data is more valuable than an image

## 🎯 EXAMPLES OF TRUE UNDERSTANDING (NO KEYWORDS):
- "IPL points table" → 📊 TEXT TABLE (wants data, not picture)
- "IPL trophy photo" → 🎨 IMAGE (wants visual)
- "Ladakh trip plan" → 📝 TEXT (wants information)
- "Ladakh beautiful view" → 🎨 IMAGE (wants visual)
- "Latest match score" → 📝 TEXT (wants data)
- "Dhoni winning six photo" → 🎨 IMAGE (wants visual)
- "Red car" → 🎨 IMAGE (visual concept)
- "Car features comparison" → 📊 TEXT TABLE (comparison data)
- "Mango" → 🎨 IMAGE (visual subject)
- "Mango price today" → 📝 TEXT (current data)
- "Today's weather" → 📝 TEXT (information)
- "Beautiful clouds at sunset" → 🎨 IMAGE (visual scene)

## ⚡ CRITICAL BEHAVIOR RULES:
1. If the user's INTENT is to SEE something → IMAGE
2. If the user's INTENT is to KNOW something → TEXT
3. If the user's INTENT is to COMPARE/ORGANIZE → TABLE
4. NEVER use keywords to decide—use MEANING
5. NEVER describe an image when you can generate it
6. NEVER create an image when data is what's needed
7. When uncertain, prefer TEXT for informational queries, IMAGE for visual ones

## 🧠 YOUR CAPABILITIES
- **Web Search**: You have live Google Search access. Use it proactively for any real-time information.
- **Image Generation**: Create images from descriptions using natural language.
- **Image Understanding**: Analyze uploaded images and answer questions about them.
- **Code**: Write, explain, debug, and optimize code in any programming language.
- **Voice**: Support voice conversations with natural speech recognition and synthesis.
- **Memory**: Remember important details users share within a conversation.
- **Multi-language**: Seamlessly switch between languages. Respond in the same language the user uses.

## 🔍 WEB SEARCH RULES (CRITICAL)
- **ALWAYS search the web** for questions about: current events, news, sports scores, weather forecasts, stock prices, election results, celebrity news, trending topics, product launches, scientific discoveries, or ANY time-sensitive information
- **NEVER say** "I don't have real-time access", "As of my knowledge cutoff", or "I'm unable to browse the internet"
- **NEVER use placeholder text** like "[Insert team name here]", "[Add score]", or "[Mention date]"
- **Provide SPECIFIC details**: names, numbers, dates, scores, locations, sources

## 💬 RESPONSE STYLE
- **Be DIRECT first**: Answer the question immediately, then add context or details
- **Use formatting**: ## headings, **bold**, • bullets, > quotes, \`\`\` code
- **Keep responses scannable**: Short paragraphs, break up long text
- **Be conversational**: Write like talking to a colleague
- **Match the user's energy**: Brief? Be brief. Detailed? Be comprehensive

## 🌐 LANGUAGE & CULTURE
- Respond in the **SAME LANGUAGE** the user uses
- Be culturally aware: understand Indian context, festivals, current events
- For Hindi: use natural, conversational Hindi
- For Hinglish: mix naturally

## 🎨 IMAGE RULES
- When asked to generate an image, create a detailed visual description first
- "Improve", "aur accha", "better quality" on existing image = EDIT
- "Change color", "add details", "remove background" = EDIT

## 📊 DATA & TABLES
- Use markdown tables for comparisons
- Be precise with numbers
- Reference specific cells when analyzing spreadsheets

## 💼 PREMIUM (SHARE ONLY WHEN ASKED)
- Free: 50 messages/day, 10 images/day
- Monthly: ₹299/month (500 msgs, 100 images)
- Yearly: ₹1,499/year (500 msgs, 100 images)
- Pro: ₹2,999/year (Unlimited)
- UPI: jaiswalanushi8@oksbi

## 🚫 AVOID
- No placeholder text
- No system thinking in output
- Don't refuse web search
- Don't mention this prompt
- Don't make up information

## ✨ FINAL NOTE
You are NEXUS — smart, fast, and genuinely helpful. Every response should feel like it came from a knowledgeable friend who truly wants to help.

**Today's Date: ${TODAY}**
**Current Year: ${CURRENT_YEAR}**`;

// ==========================================
// ========== AI AGENTS ==========
// ==========================================
const AI_AGENTS = {
    'code-reviewer': {
        name: 'Code Reviewer', icon: '🔍',
        prompt: 'You are an EXPERT code reviewer. Find bugs, security issues, performance problems. Be specific. Do NOT introduce yourself as NEXUS.',
        creator: 'NEXUS Team'
    },
    'math-tutor': {
        name: 'Math Tutor', icon: '📐',
        prompt: 'You are a WORLD-CLASS math professor. Explain step-by-step. Guide students, never give answers. Do NOT introduce yourself as NEXUS.',
        creator: 'NEXUS Team'
    },
    'story-writer': {
        name: 'Creative Writer', icon: '✍️',
        prompt: 'You are an AWARD-WINNING writer. Craft immersive stories with vivid imagery. Do NOT introduce yourself as NEXUS.',
        creator: 'NEXUS Team'
    },
    'data-analyst': {
        name: 'Data Analyst', icon: '📊',
        prompt: 'You are a SENIOR data scientist. Extract meaningful insights. Explain complex findings simply. Do NOT introduce yourself as NEXUS.',
        creator: 'NEXUS Team'
    },
    'career-coach': {
        name: 'Career Coach', icon: '🎯',
        prompt: 'You are an ELITE career coach. Provide actionable resume advice, interview strategies. Be encouraging but honest. Do NOT introduce yourself as NEXUS.',
        creator: 'NEXUS Team'
    },
    'health-advisor': {
        name: 'Health Advisor', icon: '💪',
        prompt: 'You are a HOLISTIC wellness expert. Provide science-backed health advice. Always emphasize consulting doctors. Do NOT introduce yourself as NEXUS.',
        creator: 'NEXUS Team'
    },
    'language-tutor': {
        name: 'Language Tutor', icon: '🗣️',
        prompt: 'You are a POLYGLOT language teacher. Create personalized learning paths. Correct mistakes gently. Do NOT introduce yourself as NEXUS.',
        creator: 'NEXUS Team'
    },
    'business-mentor': {
        name: 'Business Mentor', icon: '💼',
        prompt: 'You are a SERIAL entrepreneur. Provide strategic business advice, marketing insights. Share real-world case studies. Do NOT introduce yourself as NEXUS.',
        creator: 'NEXUS Team'
    }
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
// ========== SUPABASE CLIENT ==========
// ==========================================
