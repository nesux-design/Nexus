// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║   🚀 NEXUS GPT-5.5 PRO TIER - PERFECT WORKER v6.0 🚀                       ║
// ║   TTS: ElevenLabs → Edge TTS → GTTS → Deepgram (4 Providers)              ║
// ║   ALL 26 FEATURES | KEY ROTATION | AI SMART WEB SEARCH                     ║
// ║   Creator: Akhil Jaiswal | Made in India 🇮🇳                               ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

// ==========================================
// ========== CONFIGURATION ==========
// ==========================================
const CONFIG = {
    APP_NAME: "NEXUS",
    CREATOR: "Akhil Jaiswal",
    API_KEY: "akhil-123",
    UPI_ID: "jaiswalanushi8@oksbi",
    AMAZON_AFFILIATE_ID: "akhilgpt-21",
    ADMIN_IDS: ["admin", "akhil", "jaiswalanushi08"],
    SLACK_WEBHOOK_URL: "https://hooks.slack.com/services/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",
    SLACK_SIGNING_SECRET: "059ce735021c1068a670e0e877424ddf",
    WORKER_URL: "https://nexus-a1.apikeyakhilka.workers.dev",
    
    // ✅ THINKING MODE OFF — AI Smart Detection handles it
    THINKING_MODE: true,
    
    CONTEXT_WINDOW: {
        max_tokens: 1000000,
        max_messages: 500,
        importance_threshold: 0.3,
        model_limits: {
            gemini: 1000000,
            groq: 131072,
            sambanova: 131072,
            cerebras: 131072,
            openrouter: 16385,
            glm: 16385
        }
    },
    
    PREMIUM_PLANS: {
        monthly: { price: 299, days: 30, name: "Monthly Plan" },
        yearly: { price: 1499, days: 365, name: "Yearly Plan" },
        pro: { price: 2999, days: 365, name: "Pro Plan" }
    },
    
    PAID_FEATURES: {
        resume_builder: { price: 49, name: "Resume Builder" },
        cover_letter: { price: 29, name: "Cover Letter" },
        blog_generator: { price: 99, name: "SEO Blog Generator" },
        social_posts: { price: 49, name: "30 Days Social Posts" },
        code_execution: { price: 199, name: "Code Execution (1000 runs)" }
    },
    
    MAX_TOKENS_GEMINI: 65536,
    MAX_TOKENS_GROQ: 32768,
    MAX_TOKENS_CEREBRAS: 8192,
    MAX_TOKENS_SAMBANOVA: 8192,
    MAX_TOKENS_GLM: 8192,
    MAX_TOKENS_OPENROUTER: 4096,
    
    TTS_KEYS: {
        elevenlabs: [
            "sk_450d0017d433a30589a60053131792f7220884d9d0fc1a90",
            "sk_43ba6a1e884687c8b353825ef3a137ec9bdae0e550d91ece",
            "sk_a49fcadd2b53c050aa5d0fe81593f439f187f0017a98ad9a"
        ],
        deepgram: [
            "17863813002783d40d19a8d52b6f965cf37b711d",
            "f4094d8973e1b333e7d09b8f6817398a23ed5cae"
        ]
    },
    
    MEMORY_SIZE: 500,
    SESSION_TIMEOUT: 7200000,
    RATE_LIMIT_IP: 1000,
    RATE_LIMIT_USER: 2000,
    MODEL_TIMEOUT: 60000,
    CACHE_TTL: 360000,
    IMAGE_WIDTH: 1024,
    IMAGE_HEIGHT: 1024,
    
    D1_DB_NAME: "nexus_users",
    KV_NAMESPACE: "nexus_cache",
    VECTOR_INDEX: "captain-cool-index"
};

// ========== API KEYS ==========
const API_KEYS = {
    groq: [
        "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",
        "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",
        "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"
    ],
    cerebras: [
        "csk-6j4wve9hyyfvwdn58p8263hptxht6y58ekm8c35jv4ndyynv",
        "csk-jvtctmh59evxnn3ck5ev9hfd8rcxhvythrhpyfypfjp223tj",
        "csk-3rh6n4ev4dk3xrvretm6rk5d325dycvyryww53ehrh6n232v"
    ],
    sambanova: [
        "fde089f0-fd70-4c7b-9916-5ffffedc512e",
        "d94ecfb5-d294-4675-bd72-eb88795e75e1",
        "c3efb64b-c784-4e99-a8d3-e81605efcf3f"
    ],
    gemini: [
        "AIzaSyAKE9pGHdIHdvswQ5xU2bob62i8v9SAGcA",
        "AIzaSyB-SCuJxEyPv_TDoIjl5g-PsI3LUMWPXrc",
        "AIzaSyCjFEDCeaPRy-XpeVgNOTy1ZUbthiullmU",
        "AIzaSyD7HGu6KL_ZvUsWPOMmxtcF5Pn4ROgzpkA",
        "AIzaSyB7eA8PnY_rHMWq5ARboYXdPSip-WHS92g"
    ],
    glm: ["1f9e20537b7b4d8394dc67c244ac742b.MNmyCVC6yIaiJCTm"],
    openrouter: ["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"]
};

// ========== AI AGENTS STORE ==========
const AI_AGENTS = {
    'code-reviewer': {
        name: 'Code Reviewer', icon: '🔍',
        prompt: 'You are an expert code reviewer. Find bugs, security issues, performance problems. Be specific. Do NOT introduce yourself as NEXUS.',
        creator: 'NEXUS Team'
    },
    'math-tutor': {
        name: 'Math Tutor', icon: '📐',
        prompt: 'You are a patient math tutor. Explain step-by-step. Guide students, never just give answers. Do NOT introduce yourself as NEXUS.',
        creator: 'NEXUS Team'
    },
    'story-writer': {
        name: 'Creative Writer', icon: '✍️',
        prompt: 'You are a creative writing assistant. Be imaginative. Do NOT introduce yourself as NEXUS.',
        creator: 'NEXUS Team'
    },
    'data-analyst': {
        name: 'Data Analyst', icon: '📊',
        prompt: 'You are a data analysis expert. Find patterns and insights. Explain clearly. Do NOT introduce yourself as NEXUS.',
        creator: 'NEXUS Team'
    },
    'career-coach': {
        name: 'Career Coach', icon: '🎯',
        prompt: 'You are a professional career coach. Help with resume, interviews, career planning. Do NOT introduce yourself as NEXUS.',
        creator: 'NEXUS Team'
    },
    'health-advisor': {
        name: 'Health Advisor', icon: '💪',
        prompt: 'You are a health advisor. Provide wellness tips. Always remind to consult doctors. Do NOT introduce yourself as NEXUS.',
        creator: 'NEXUS Team'
    },
    'language-tutor': {
        name: 'Language Tutor', icon: '🗣️',
        prompt: 'You are a language tutor. Be patient. Do NOT introduce yourself as NEXUS.',
        creator: 'NEXUS Team'
    },
    'business-mentor': {
        name: 'Business Mentor', icon: '💼',
        prompt: 'You are a business mentor. Help with strategy, marketing, finance. Do NOT introduce yourself as NEXUS.',
        creator: 'NEXUS Team'
    }
};
// ==========================================
// ========== GPT-5.5 LEVEL MASTER PROMPT ==========
// ==========================================
const MASTER_PROMPT = `You are NEXUS, an advanced AI assistant created by Akhil Jaiswal. You are at GPT-5.5 level.

**YOUR CORE CAPABILITIES:**
- You can generate, edit, and improve images (using reasoning, not keywords)
- You can search the web for real-time information using Google Search
- You remember the context of entire conversation
- You can analyze documents, code, and data
- You have voice conversation capability

**SMART WEB SEARCH RULES:**
- Use Google Search for ANY question about current events, sports, news, weather, elections, stock prices, or any real-time data
- NEVER say "I don't have real-time access" — you DO have it via Google Search
- NEVER use placeholder text like "Insert match name here" or "Insert teams here"
- NEVER include thinking steps or system prefixes in your final output
- Give DIRECT answers first, then add details
- For sports queries: give team names, time, venue, and current score
- For news queries: give headlines with dates and sources
- Respond in SAME LANGUAGE as user (Hindi → Hindi, English → English)

**CHATGPT 5.5 LEVEL THINKING PROCESS:**
Before responding, ALWAYS think step by step:

1. UNDERSTAND: What does the user actually want?
2. CONTEXT: What happened in previous messages? Any images generated?
3. DECIDE: Based on context, decide action
4. EXECUTE: Take the appropriate action

**CRITICAL RULES (NO KEYWORDS - PURE UNDERSTANDING):**
- NEVER rely on keywords like "draw", "create", "banao"
- ALWAYS use conversation context to understand intent
- If user has uploaded an image or generated an image, remember it
- "Improve", "better", "aur accha" on existing image = EDIT, not new image
- "Table", "chart", "data" without visual = TEXT table, not image

**RESPONSE FORMAT:**
- Use ## for main headings
- Use **bold** for emphasis
- Use bullet points for lists
- Use code blocks for code
- Respond in SAME LANGUAGE as user
- Keep responses SHORT and ACCURATE

**PREMIUM INFO (ONLY when asked):**
- Free: 50 msgs/day, 10 images/day
- Premium: ₹299/month or ₹1,499/year
- Pro: ₹2,999/year (Unlimited)
- UPI: jaiswalanushi8@oksbi

**NOW THINK, THEN RESPOND. YOU ARE NEXUS, CHATGPT LEVEL.**`;

// ==========================================
// ========== HELPER FUNCTIONS ==========
// ==========================================
function generateId() { return Date.now() + '_' + Math.random().toString(36).substring(2, 10); }
function isAdmin(userId) { return CONFIG.ADMIN_IDS.includes(userId); }

// ✅ KEY ROTATION
let globalFailed = new Map();
function getNextKey(provider) {
    const keys = API_KEYS[provider];
    if (!keys?.length) return null;
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const failed = globalFailed.get(key);
        if (!failed || Date.now() > failed) return key;
    }
    return keys[0];
}
function markFailed(key, seconds = 60) { globalFailed.set(key, Date.now() + seconds * 1000); }
function escapeHTML(str) { return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// ==========================================
// ========== KV-BASED RATE LIMITING ==========
// ==========================================
async function checkRateLimit(env, ip, userId) {
    const now = Date.now(), win = 60000;
    const ipKey = `rate:ip:${ip}`, userKey = `rate:user:${userId}`;
    let ipData = await env.KV.get(ipKey, { type: 'json' });
    let userData = await env.KV.get(userKey, { type: 'json' });
    if (!ipData || now > ipData.reset) ipData = { count: 0, reset: now + win };
    if (ipData.count >= CONFIG.RATE_LIMIT_IP) return { allowed: false, retry: Math.ceil((ipData.reset - now) / 1000) };
    if (userId && userId !== 'anonymous') {
        if (!userData || now > userData.reset) userData = { count: 0, reset: now + win };
        if (userData.count >= CONFIG.RATE_LIMIT_USER) return { allowed: false, retry: Math.ceil((userData.reset - now) / 1000) };
        userData.count++;
        await env.KV.put(userKey, JSON.stringify(userData), { expirationTtl: 60 });
    }
    ipData.count++;
    await env.KV.put(ipKey, JSON.stringify(ipData), { expirationTtl: 60 });
    return { allowed: true };
}

// ==========================================
// ========== D1 DATABASE ==========
// ==========================================
async function initD1Tables(env) {
    if (!env?.DB) return;
    try {
        await env.DB.prepare(`CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, data TEXT, updated_at INTEGER)`).run();
        await env.DB.prepare(`CREATE TABLE IF NOT EXISTS conversations (id TEXT PRIMARY KEY, user_id TEXT, data TEXT, created_at INTEGER)`).run();
        await env.DB.prepare(`CREATE TABLE IF NOT EXISTS payments (id TEXT PRIMARY KEY, transaction_id TEXT UNIQUE, data TEXT, created_at INTEGER)`).run();
        await env.DB.prepare(`CREATE TABLE IF NOT EXISTS paid_orders (id TEXT PRIMARY KEY, user_id TEXT, feature TEXT, amount INTEGER, status TEXT, created_at INTEGER)`).run();
        await env.DB.prepare(`CREATE TABLE IF NOT EXISTS premium_requests (id TEXT PRIMARY KEY, user_id TEXT, transaction_id TEXT UNIQUE, plan TEXT, upi_id TEXT, status TEXT, created_at INTEGER, verified_at INTEGER)`).run();
        await env.DB.prepare(`CREATE TABLE IF NOT EXISTS daily_stats (id TEXT PRIMARY KEY, date TEXT UNIQUE, messages INTEGER, images INTEGER, premium_requests INTEGER, premium_activations INTEGER, updated_at INTEGER)`).run();
    } catch(e) {}
}

async function getUser(env, userId) {
    if (!env?.DB) return { id: userId, isPremium: false, isAdmin: isAdmin(userId), plan: 'free' };
    try { const result = await env.DB.prepare(`SELECT data FROM users WHERE id = ?`).bind(userId).first(); if (result?.data) return JSON.parse(result.data); } catch(e) {}
    const newUser = { id: userId, isPremium: false, isAdmin: isAdmin(userId), plan: 'free', premiumExpiry: null, paidFeatures: {}, dailyUsage: { chat: 0, image: 0 }, createdAt: Date.now() };
    try { await env.DB.prepare(`INSERT INTO users (id, data, updated_at) VALUES (?, ?, ?)`).bind(userId, JSON.stringify(newUser), Date.now()).run(); } catch(e) {}
    return newUser;
}

async function updateUser(env, userId, updates) {
    const user = await getUser(env, userId);
    const updated = { ...user, ...updates, updatedAt: Date.now() };
    await env.DB.prepare(`UPDATE users SET data = ?, updated_at = ? WHERE id = ?`).bind(JSON.stringify(updated), Date.now(), userId).run();
    return updated;
}

async function checkPremium(env, userId) {
    const user = await getUser(env, userId);
    if (user.isAdmin) return true;
    if (!user.isPremium) return false;
    if (user.premiumExpiry && user.premiumExpiry > Date.now()) return true;
    if (user.premiumExpiry && user.premiumExpiry <= Date.now()) { await updateUser(env, userId, { isPremium: false, plan: 'free', premiumExpiry: null }); return false; }
    return false;
}

// ==========================================
// ========== DAILY STATS FUNCTIONS ==========
// ==========================================
async function updateDailyStat(env, type) {
    if (!env?.DB) return;
    const today = new Date().toISOString().split('T')[0];
    try {
        const existing = await env.DB.prepare(`SELECT * FROM daily_stats WHERE date = ?`).bind(today).first();
        if (existing) await env.DB.prepare(`UPDATE daily_stats SET ${type} = ${type} + 1, updated_at = ? WHERE date = ?`).bind(Date.now(), today).run();
        else await env.DB.prepare(`INSERT INTO daily_stats (id, date, messages, images, premium_requests, premium_activations, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`).bind(generateId(), today, type==='messages'?1:0, type==='images'?1:0, type==='premium_requests'?1:0, type==='premium_activations'?1:0, Date.now()).run();
    } catch(e) {}
}

// ==========================================
// ========== SLACK FUNCTIONS (Updated Pricing) ==========
// ==========================================
async function verifySlackRequest(request, body) {
    const timestamp = request.headers.get('X-Slack-Request-Timestamp'), signature = request.headers.get('X-Slack-Signature');
    if (!timestamp || !signature) return false;
    if (Math.abs(Math.floor(Date.now()/1000) - parseInt(timestamp)) > 300) return false;
    const sigBasestring = `v0:${timestamp}:${body}`;
    try {
        const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(CONFIG.SLACK_SIGNING_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
        const sb = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(sigBasestring));
        const es = 'v0=' + Array.from(new Uint8Array(sb)).map(b => b.toString(16).padStart(2,'0')).join('');
        if (es.length !== signature.length) return false;
        let r = 0; for (let i = 0; i < es.length; i++) r |= es.charCodeAt(i) ^ signature.charCodeAt(i);
        return r === 0;
    } catch(e) { return false; }
}

async function sendPremiumRequestToSlack(env, userId, transactionId, plan, upiId) {
    const pn = plan==='monthly'?'📱 Monthly - ₹299':plan==='yearly'?'📅 Yearly - ₹1,499':'👑 Pro - ₹2,999';
    const amt = plan==='monthly'?299:plan==='yearly'?1499:2999;
    await fetch(CONFIG.SLACK_WEBHOOK_URL, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ blocks: [{ type:"header", text:{ type:"plain_text", text:"🔔 NEW PREMIUM REQUEST", emoji:true } }, { type:"section", fields: [{ type:"mrkdwn", text:`*👤 User:*\n${userId}` },{ type:"mrkdwn", text:`*💳 Plan:*\n${pn}` },{ type:"mrkdwn", text:`*🆔 Transaction:*\n${transactionId}` },{ type:"mrkdwn", text:`*💰 Amount:*\n₹${amt}` },{ type:"mrkdwn", text:`*🏦 UPI:*\n${upiId}` },{ type:"mrkdwn", text:`*⏰ Time:*\n${new Date().toLocaleString()}` }] }, { type:"actions", elements: [{ type:"button", text:{ type:"plain_text", text:"✅ Approve", emoji:true }, style:"primary", value:JSON.stringify({ action:"approve", userId, transactionId, plan }), action_id:"approve_premium" },{ type:"button", text:{ type:"plain_text", text:"❌ Reject", emoji:true }, style:"danger", value:JSON.stringify({ action:"reject", userId, transactionId, plan }), action_id:"reject_premium" }] }] }) });
}

async function sendDailyReportToSlack(env) {
    if (!env?.DB) return;
    const today = new Date().toISOString().split('T')[0];
    const stats = await env.DB.prepare(`SELECT * FROM daily_stats WHERE date = ?`).bind(today).first();
    const date = new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' });
    await fetch(CONFIG.SLACK_WEBHOOK_URL, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ blocks: [{ type:"header", text:{ type:"plain_text", text:"📊 NEXUS DAILY REPORT", emoji:true } }, { type:"section", text:{ type:"mrkdwn", text:`*Date:* ${date}` } }, { type:"section", fields: [{ type:"mrkdwn", text:`*💬 Messages:*\n${stats?.messages||0}` },{ type:"mrkdwn", text:`*🖼️ Images:*\n${stats?.images||0}` },{ type:"mrkdwn", text:`*🔔 Premium Requests:*\n${stats?.premium_requests||0}` },{ type:"mrkdwn", text:`*✅ Activations:*\n${stats?.premium_activations||0}` }] }, { type:"divider" }, { type:"context", elements:[{ type:"mrkdwn", text:`📈 Revenue: ₹${(stats?.premium_activations||0)*299}` }] }] }) });
}

async function handleSlackInteraction(request, env) {
    try {
        const body = await request.text();
        if (!(await verifySlackRequest(request, body))) return new Response('Unauthorized', { status:401 });
        const payload = JSON.parse(new URLSearchParams(body).get('payload'));
        if (payload.type === 'block_actions') {
            const action = payload.actions[0], value = JSON.parse(action.value);
            if (action.action_id === 'approve_premium') {
                const result = await verifyPremium(env, value.userId, value.transactionId, value.plan);
                if (result.success) {
                    await updateDailyStat(env, 'premium_activations');
                    await fetch(payload.response_url, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ replace_original:true, blocks: [{ type:"header", text:{ type:"plain_text", text:"✅ PREMIUM ACTIVATED", emoji:true } }, { type:"section", fields: [{ type:"mrkdwn", text:`*User:* ${value.userId}` },{ type:"mrkdwn", text:`*Plan:* ${value.plan}` },{ type:"mrkdwn", text:`*Txn:* ${value.transactionId}` }] }, { type:"section", text:{ type:"mrkdwn", text:`✅ By: ${payload.user.name}\n📅 Expires: ${new Date(result.expiry).toLocaleDateString()}` } }] }) });
                    return new Response('', { status:200 });
                }
            } else if (action.action_id === 'reject_premium') {
                await env.DB.prepare(`UPDATE premium_requests SET status = 'rejected' WHERE user_id = ? AND transaction_id = ?`).bind(value.userId, value.transactionId).run();
                await fetch(payload.response_url, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ replace_original:true, blocks: [{ type:"header", text:{ type:"plain_text", text:"❌ PREMIUM REJECTED", emoji:true } }, { type:"section", fields: [{ type:"mrkdwn", text:`*User:* ${value.userId}` },{ type:"mrkdwn", text:`*Txn:* ${value.transactionId}` }] }, { type:"section", text:{ type:"mrkdwn", text:`❌ By: ${payload.user.name}` } }] }) });
                return new Response('', { status:200 });
            }
        }
        return new Response('', { status:200 });
    } catch(e) { return new Response('', { status:200 }); }
}
// ==========================================
// ========== VECTOR DATABASE ==========
// ==========================================
async function generateEmbedding(env, text) {
    const key = getNextKey('gemini'); if (!key) return null;
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${key}`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ model:"models/embedding-001", content:{ parts:[{ text:text.substring(0,2000) }] } }) });
        if (response.ok) { const data = await response.json(); return data.embedding?.values; }
    } catch(e) {}
    return null;
}

async function saveToVectorDB(env, userId, text, metadata) {
    if (!env?.VECTOR) return null;
    try { const embedding = await generateEmbedding(env, text); if (!embedding) return null; await env.VECTOR.insert({ id:generateId(), values:embedding, metadata:{ userId, text:text.substring(0,500), ...metadata, timestamp:Date.now() } }); return true; } catch(e) { return false; }
}

async function searchVectorDB(env, userId, query, limit=5) {
    if (!env?.VECTOR) return [];
    try { const embedding = await generateEmbedding(env, query); if (!embedding) return []; const results = await env.VECTOR.query(embedding, { topK:limit, filter:{ userId } }); return results.matches||[]; } catch(e) { return []; }
}

// ==========================================
// ========== SMART CONTEXT MANAGER ==========
// ==========================================
function calculateImportance(message) {
    let score = 0.5;
    const imp = ['remember','important','note','save',"don't forget",'reminder','my name is','i am called','my email','my phone','birthday','याद','जरूरी','महत्वपूर्ण','मेरा नाम'];
    const unimp = ['?','hello','hi','hey','thanks','ok','hmm'];
    for (const k of imp) if (message.toLowerCase().includes(k)) score += 0.15;
    for (const k of unimp) if (message.toLowerCase().includes(k)) score -= 0.1;
    if (message.length > 200) score += 0.1;
    if (message.length < 10) score -= 0.1;
    return Math.min(1, Math.max(0.1, score));
}

async function buildContext(env, ip, userId, sessionId, query, modelProvider='gemini') {
    const session = await getSession(env, ip, userId, sessionId);
    let ctx = '', currentTokens = 0;
    const ml = CONFIG.CONTEXT_WINDOW.model_limits||{};
    const MAX_CT = ml[modelProvider]||CONFIG.CONTEXT_WINDOW.max_tokens;
    const MAX_MSGS = CONFIG.CONTEXT_WINDOW.max_messages;
    const estTokens = (t) => Math.ceil(t.length/(/[\u0900-\u097F]/.test(t)?3:4));
    if (session.messages.length) {
        ctx += '## 📝 Previous Conversation\n\n';
        const sorted = [...session.messages].sort((a,b)=>(b.importance||0.5)-(a.importance||0.5));
        let added = 0;
        for (let i=0; i<sorted.length && added<MAX_MSGS; i++) {
            const m = sorted[i];
            const mt = estTokens(m.user.substring(0,500)) + estTokens(m.assistant.substring(0,500)) + 50;
            if (currentTokens + mt > MAX_CT) { if (sorted.length-i>0) ctx += `\n*... and ${sorted.length-i} more messages (exceeded ${MAX_CT} token limit) ...*\n`; break; }
            ctx += `**User:** ${m.user.substring(0,500)}\n\n**Assistant:** ${m.assistant.substring(0,500)}\n\n`;
            if (m.importance > CONFIG.CONTEXT_WINDOW.importance_threshold) ctx += `> ⭐ This was marked as important\n\n`;
            currentTokens += mt; added++;
        }
    }
    if (session.lastCode && currentTokens+estTokens(session.lastCode.code.substring(0,800))+100<MAX_CT) { ctx += `## 💻 Last Generated Code\n\`\`\`\n${session.lastCode.code.substring(0,800)}\n\`\`\`\n\n`; }
    if (session.lastImageDesc && currentTokens+200<MAX_CT) { ctx += `## 🖼️ Last Generated Image\n${session.lastImageDesc.substring(0,300)}\n\n`; }
    ctx += `## 🔍 Current Query\n${query}`;
    return ctx;
}

function smartContextWindow(messages, maxMessages=25) {
    if (messages.length <= maxMessages) return messages;
    const scored = messages.map((m,i)=>({...m, importance:m.importance||calculateImportance(m.user), index:i}));
    const keep = scored.slice(-8), rest = scored.slice(0,-8);
    rest.sort((a,b)=>b.importance-a.importance);
    const imp = rest.slice(0, maxMessages-8);
    const indices = new Set([...keep,...imp].map(m=>m.index));
    return messages.filter((_,i)=>indices.has(i));
}

// ==========================================
// ========== IMAGE STORAGE IN KV ==========
// ==========================================
async function saveImageToKV(env, imageId, imageBlob) {
    try { const ab = await imageBlob.arrayBuffer(); const b64 = btoa(String.fromCharCode(...new Uint8Array(ab))); await env.KV.put(`img:${imageId}`, b64, { expirationTtl:86400*7 }); return true; } catch(e) { return false; }
}

async function getImageFromKV(env, imageId) {
    try { const b64 = await env.KV.get(`img:${imageId}`); if (!b64) return null; return new Blob([Uint8Array.from(atob(b64), c=>c.charCodeAt(0))], { type:'image/png' }); } catch(e) { return null; }
}

// ==========================================
// ========== SMART IMAGE GENERATION ==========
// ==========================================
async function generateImageWithFlux(env, prompt) {
    if (!env?.AI) return { success:false };
    try {
        const res = await env.AI.run('@cf/black-forest-labs/flux-1-schnell', { prompt, width:CONFIG.IMAGE_WIDTH, height:CONFIG.IMAGE_HEIGHT, steps:4 });
        if (res?.image) { const blob = new Blob([Uint8Array.from(atob(res.image), c=>c.charCodeAt(0))], { type:'image/png' }); const iid = generateId(); await saveImageToKV(env, iid, blob); return { success:true, blob, provider:'Flux AI', url:`${CONFIG.WORKER_URL}/image/${iid}`, imageId:iid }; }
    } catch(e) {}
    return { success:false };
}

async function generateImageWithPollinations(prompt) {
    try { const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`; const res = await fetch(url); if (res.ok) { const blob = await res.blob(); return { success:true, blob, provider:'Pollinations', url }; } } catch(e) {}
    return { success:false };
}

async function generateImage(env, prompt) {
    const flux = await generateImageWithFlux(env, prompt);
    if (flux.success) return flux;
    return await generateImageWithPollinations(prompt);
}

// ==========================================
// ========== SDXL - IMAGE TO IMAGE ==========
// ==========================================
async function transformImageWithSDXL(env, imageData, instruction) {
    if (!env?.AI) return { success: false };
    try {
        let imageBase64 = imageData;
        if (!imageData.startsWith('data:')) imageBase64 = `data:image/png;base64,${imageData}`;
        const response = await env.AI.run('@cf/stabilityai/stable-diffusion-xl-base-1.0', { prompt: instruction, image: imageBase64, strength: 0.75, guidance: 7.5, steps: 20 });
        if (response?.image) { const binaryData = Uint8Array.from(atob(response.image), c => c.charCodeAt(0)); const blob = new Blob([binaryData], { type: 'image/png' }); const imageId = generateId(); await saveImageToKV(env, imageId, blob); return { success: true, blob: blob, provider: 'SDXL img2img', url: `${CONFIG.WORKER_URL}/image/${imageId}`, imageId: imageId }; }
    } catch(e) {}
    return { success: false };
}

// ==========================================
// ========== IMAGE EDITING (Inpainting) ==========
// ==========================================
async function editImageWithInpainting(env, imageData, instruction, mask = null) {
    if (!env?.AI) return { success: false };
    try {
        let imageBase64 = imageData;
        if (!imageData.startsWith('data:')) imageBase64 = `data:image/png;base64,${imageData}`;
        let maskData = mask;
        if (!mask && instruction.includes('remove')) maskData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
        const response = await env.AI.run('@cf/runwayml/stable-diffusion-v1-5-inpainting', { prompt: instruction, image: imageBase64, mask: maskData, strength: 0.9, guidance: 7, steps: 30 });
        if (response?.image) { const binaryData = Uint8Array.from(atob(response.image), c => c.charCodeAt(0)); const blob = new Blob([binaryData], { type: 'image/png' }); const imageId = generateId(); await saveImageToKV(env, imageId, blob); return { success: true, blob: blob, provider: 'Inpainting', url: `${CONFIG.WORKER_URL}/image/${imageId}` }; }
    } catch(e) {}
    return { success: false };
}

// ==========================================
// ========== GLM-4V VISION ==========
// ==========================================
async function analyzeImageWithGLM(imageData, prompt) {
    const key = getNextKey('glm'); if (!key) return null;
    try {
        let imageBase64 = imageData;
        if (!imageData.startsWith('data:') && !imageData.startsWith('http')) imageBase64 = `data:image/jpeg;base64,${imageData}`;
        const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', { method:'POST', headers:{'Authorization':`Bearer ${key}`,'Content-Type':'application/json'}, body:JSON.stringify({ model:"glm-4v", messages:[{ role:"user", content:[{ type:"text", text:prompt||"Describe this image in detail." },{ type:"image_url", image_url:{ url:imageBase64 } }] }], max_tokens:CONFIG.MAX_TOKENS_GLM }) });
        if (response.ok) { const data = await response.json(); return data.choices[0]?.message?.content; }
    } catch(e) {}
    return null;
}

async function analyzeImageWithGemma(imageData, prompt) {
    const key = getNextKey('sambanova'); if (!key) return null;
    try {
        let imageUrl = imageData; if (!imageUrl.startsWith('http')) return null;
        const response = await fetch('https://api.sambanova.ai/v1/chat/completions', { method:'POST', headers:{'Authorization':'Bearer '+key,'Content-Type':'application/json'}, body:JSON.stringify({ model:"gemma-3-12b-it", messages:[{ role:"user", content:[{ type:"text", text:prompt||"Describe this image." },{ type:"image_url", image_url:{ url:imageUrl } }] }], max_tokens:CONFIG.MAX_TOKENS_SAMBANOVA }) });
        if (response.ok) { const data = await response.json(); return data.choices[0]?.message?.content; }
    } catch(e) {}
    return null;
}

async function analyzeImage(imageData, prompt) {
    const glmResult = await analyzeImageWithGLM(imageData, prompt);
    if (glmResult) return { analysis: glmResult, provider: 'GLM-4V (Zhipu AI) - Best for Vision' };
    const gemmaResult = await analyzeImageWithGemma(imageData, prompt);
    if (gemmaResult) return { analysis: gemmaResult, provider: 'Gemma-3 (SambaNova) [Fallback]' };
    return null;
}
// ==========================================
// ========== AI MODEL CALLS (With Key Rotation) ==========
// ==========================================

// ✅ GEMINI: 6 keys internally rotate, 429 pe 60s cooldown
// Model: gemini-2.5-flash-lite, Web Search: ENABLED
async function callGemini(prompt, withWebSearch = true) {
    const key = getNextKey('gemini');
    if (!key) return null;
    
    try {
        const model = "gemini-2.5-flash-lite";
        
        const body = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                maxOutputTokens: CONFIG.MAX_TOKENS_GEMINI,
                temperature: 0.7
            }
        };
        
        if (withWebSearch) {
            body.tools = [{ googleSearch: {} }];
        }
        
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), CONFIG.MODEL_TIMEOUT);
        
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                signal: controller.signal
            }
        );
        
        clearTimeout(tid);
        
        if (res.ok) {
            const data = await res.json();
            return data.candidates[0]?.content?.parts[0]?.text;
        }
        
        if (res.status === 429) {
            markFailed(key, 60);
        }
    } catch(e) {
        console.error("Gemini Error:", e);
    }
    
    return null;
}

// ✅ GROQ: 3 keys internally rotate, 429 pe 60s cooldown
// Model: openai/gpt-oss-120b, Web Search: ENABLED
async function callGroq(messages) {
    const key = getNextKey('groq');
    if (!key) return null;
    
    try {
        const body = {
            model: "openai/gpt-oss-120b",
            messages: messages,
            temperature: 0.7,
            max_tokens: CONFIG.MAX_TOKENS_GROQ,
            tools: [{ type: "web_search" }],
            tool_choice: "auto"
        };
        
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), CONFIG.MODEL_TIMEOUT);
        
        const res = await fetch(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + key,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body),
                signal: controller.signal
            }
        );
        
        clearTimeout(tid);
        
        if (res.ok) {
            const data = await res.json();
            return data.choices[0]?.message?.content;
        }
        
        if (res.status === 429) {
            markFailed(key, 60);
        }
    } catch(e) {
        console.error("Groq Error:", e);
    }
    
    return null;
}

// ✅ CEREBRAS: 3 keys internally rotate, 429 pe 60s cooldown
// Model: llama-3.1-8b, Web Search: DISABLED
async function callCerebras(messages) {
    const key = getNextKey('cerebras');
    if (!key) return null;
    
    try {
        const response = await fetch(
            'https://api.cerebras.ai/v1/chat/completions',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${key}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "llama-3.1-8b",
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: CONFIG.MAX_TOKENS_CEREBRAS
                })
            }
        );
        
        if (response.ok) {
            const data = await response.json();
            return data.choices[0]?.message?.content;
        }
        
        if (response.status === 429) {
            markFailed(key, 60);
        }
    } catch(e) {
        console.error("Cerebras Error:", e);
    }
    
    return null;
}

// ✅ SAMBANOVA: 3 keys internally rotate
// Model: gemma-3-12b-it, Web Search: DISABLED
async function callGemma(messages) {
    const key = getNextKey('sambanova');
    if (!key) return null;
    
    try {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), CONFIG.MODEL_TIMEOUT);
        
        const res = await fetch(
            'https://api.sambanova.ai/v1/chat/completions',
            {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + key,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "gemma-3-12b-it",
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: CONFIG.MAX_TOKENS_SAMBANOVA
                }),
                signal: controller.signal
            }
        );
        
        clearTimeout(tid);
        
        if (res.ok) {
            const data = await res.json();
            return data.choices[0]?.message?.content;
        }
    } catch(e) {
        console.error("SambaNova Error:", e);
    }
    
    return null;
}

// ✅ OPENROUTER: 1 key
// Model: openai/gpt-3.5-turbo:online, Web Search: DISABLED
async function callOpenRouter(messages) {
    const key = getNextKey('openrouter');
    if (!key) return null;
    
    try {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), CONFIG.MODEL_TIMEOUT);
        
        const res = await fetch(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + key,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "openai/gpt-3.5-turbo:online",
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: CONFIG.MAX_TOKENS_OPENROUTER
                }),
                signal: controller.signal
            }
        );
        
        clearTimeout(tid);
        
        if (res.ok) {
            const data = await res.json();
            return data.choices[0]?.message?.content;
        }
    } catch(e) {
        console.error("OpenRouter Error:", e);
    }
    
    return null;
}

// ==========================================
// ========== 🧠 SMART INTENT DETECTION (Gemini + Groq) ==========
// ==========================================
// ==========================================
// ========== 🧠 SMART INTENT DETECTION (Gemini + Groq — BOTH with Web Search) ==========
// ==========================================
async function shouldSearchWeb(query) {
    // ✅ GEMINI INTENT DETECTION — Web Search ENABLED
    const geminiKey = getNextKey('gemini');
    if (geminiKey) {
        try {
            const decisionPrompt = `You are an AI decision maker. Decide if this question needs real-time web search. Return ONLY "YES" or "NO".

QUESTION: "${query}"

RULES:
- YES: current events, news, sports scores, weather, elections, stock prices, live data, recent updates, today's info
- NO: fixed facts, math, definitions, creative writing, code help, general knowledge that never changes
- If unsure, return YES

Answer ONLY with YES or NO:`;

            const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${geminiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: decisionPrompt }] }],
                        generationConfig: { temperature: 0, maxOutputTokens: 5 },
                        tools: [{ googleSearch: {} }]  // ✅ WEB SEARCH ENABLED
                    })
                }
            );
            
            if (res.ok) {
                const data = await res.json();
                const decision = data.candidates[0]?.content?.parts[0]?.text?.trim().toUpperCase();
                if (decision === 'YES' || decision === 'NO') return decision === 'YES';
            }
        } catch(e) {}
    }
    
    // ✅ GROQ INTENT DETECTION — Web Search ENABLED
    const groqKey = getNextKey('groq');
    if (groqKey) {
        try {
            const decisionPrompt = `You are an AI decision maker. Decide if this question needs real-time web search. Return ONLY "YES" or "NO".\n\nQUESTION: "${query}"\n\nRULES:\n- YES: current events, news, sports scores, weather, elections, stock prices, live data\n- NO: fixed facts, math, definitions, creative writing, code help\n- If unsure, return YES\n\nAnswer ONLY with YES or NO:`;

            const res = await fetch(
                'https://api.groq.com/openai/v1/chat/completions',
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${groqKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: "openai/gpt-oss-120b",
                        messages: [{ role: "user", content: decisionPrompt }],
                        temperature: 0,
                        max_tokens: 5,
                        tools: [{ type: "web_search" }],  // ✅ WEB SEARCH ENABLED
                        tool_choice: "auto"
                    })
                }
            );
            
            if (res.ok) {
                const data = await res.json();
                const decision = data.choices[0]?.message?.content?.trim().toUpperCase();
                if (decision === 'YES' || decision === 'NO') return decision === 'YES';
            }
        } catch(e) {}
    }
    
    // Default: Search to be safe
    return true;
}
// ==========================================
// ========== 5 WEB SEARCH SOURCES ==========
// ==========================================
async function webSearchGoogle(query) {
    const key = getNextKey('gemini'); if (!key) return null;
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${key}`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ contents:[{ parts:[{ text:`Search the web for: ${query}. Provide accurate, recent information with sources.` }] }], generationConfig:{ maxOutputTokens:2000 }, tools:[{ googleSearch:{} }] }) });
        if (res.ok) { const data = await res.json(); return { source:'Google (Gemini)', content:data.candidates[0]?.content?.parts[0]?.text }; }
    } catch(e) {}
    return null;
}

async function webSearchGroq(query) {
    const key = getNextKey('groq'); if (!key) return null;
    try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', { method:'POST', headers:{'Authorization':'Bearer '+key,'Content-Type':'application/json'}, body:JSON.stringify({ model:"openai/gpt-oss-120b", messages:[{ role:"user", content:`Search the web for: ${query}. Provide accurate, recent information.` }], temperature:0.5, max_tokens:2000, tools:[{ type:"web_search" }], tool_choice:"required" }) });
        if (res.ok) { const data = await res.json(); return { source:'Groq', content:data.choices[0]?.message?.content }; }
    } catch(e) {}
    return null;
}

async function webSearchWikipedia(query) {
    try {
        const sr = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`);
        const sd = await sr.json();
        if (sd.query?.search?.[0]) {
            const title = sd.query.search[0].title;
            const cr = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=true&explaintext=true&titles=${encodeURIComponent(title)}&format=json&origin=*`);
            const cd = await cr.json();
            const pages = cd.query?.pages;
            const extract = pages?.[Object.keys(pages)[0]]?.extract;
            if (extract) return { source:'Wikipedia', content:extract.substring(0,2000) };
        }
    } catch(e) {}
    return null;
}

async function webSearchDuckDuckGo(query) {
    try {
        const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.AbstractText) return { source:'DuckDuckGo', content:data.AbstractText };
        if (data.RelatedTopics?.[0]?.Text) return { source:'DuckDuckGo', content:data.RelatedTopics[0].Text };
    } catch(e) {}
    return null;
}

async function webSearchRSS(query) {
    try {
        const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-IN&gl=IN&ceid=IN:en`;
        const res = await fetch(rssUrl);
        const text = await res.text();
        const items = text.match(/<title>(.*?)<\/title>/g);
        if (items?.length > 1) {
            let content = "📰 Latest News:\n";
            for (let i=1; i<Math.min(items.length,6); i++) { content += `• ${items[i].replace(/<title>|<\/title>/g,'')}\n`; }
            return { source:'RSS (Google News)', content };
        }
    } catch(e) {}
    return null;
}

async function performWebSearch(query) {
    const sources = [webSearchGoogle, webSearchGroq, webSearchWikipedia, webSearchDuckDuckGo, webSearchRSS];
    for (const src of sources) { const r = await src(query); if (r?.content) return r; }
    return null;
}

// ==========================================
// ========== SHOPPING WITH AFFILIATE ==========
// ==========================================
async function shoppingWithAffiliate(product, budget = null) {
    const searchLink = `https://www.amazon.in/s?k=${encodeURIComponent(product)}&tag=${CONFIG.AMAZON_AFFILIATE_ID}`;
    const searchResults = await performWebSearch(`best ${product} ${budget?`under ${budget}`:''} amazon india`);
    let prompt = `You are a shopping assistant. Generate product recommendations for: ${product} ${budget?`under ₹${budget}`:''}`;
    if (searchResults?.content) prompt = `Use this search result: ${searchResults.content}\n\nGenerate recommendations for: ${product}`;
    const analysis = await callGemini(prompt);
    return { analysis, searchLink };
}

// ==========================================
// ========== QR CODE GENERATOR ==========
// ==========================================
async function generateQRCode(text, size = 300) {
    try { const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`; const res = await fetch(qrUrl); if (res.ok) return { success:true, blob:await res.blob() }; } catch(e) {}
    return { success:false };
}

// ==========================================
// ========== YOUTUBE SUMMARY ==========
// ==========================================
async function getYoutubeSummary(videoUrl) {
    try {
        const videoId = videoUrl.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/)?.[1];
        if (videoId) {
            const oer = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
            if (oer.ok) {
                const od = await oer.json();
                const title = od.title;
                const sr = await performWebSearch(`summary of YouTube video "${title}"`);
                if (sr?.content) return `## 🎬 YouTube Video Summary\n\n**Title:** ${title}\n\n**Summary:** ${sr.content}\n\n**Source:** ${sr.source}`;
                return `## 🎬 YouTube Video\n\n**Title:** ${title}\n\nWatch: ${videoUrl}`;
            }
        }
    } catch(e) {}
    return `## 🎬 YouTube Video\n\nWatch: ${videoUrl}`;
}

// ==========================================
// ========== REMINDER (KV-Based) ==========
// ==========================================
async function setReminder(env, userId, message, minutes) {
    const reminderId = generateId();
    const reminderTime = Date.now() + (minutes * 60 * 1000);
    const reminder = { id: reminderId, userId, message, time: reminderTime, createdAt: Date.now() };
    await env.KV.put(`reminder:${reminderId}`, JSON.stringify(reminder), { expirationTtl: minutes * 60 + 3600 });
    return { success: true, reminderId, at: new Date(reminderTime).toISOString(), message };
}
// ==========================================
// ========== PREMIUM FUNCTIONS (Updated Pricing) ==========
// ==========================================
async function requestPremium(env, userId, transactionId, plan, upiId) {
    const existingPayment = await env.DB.prepare(`SELECT * FROM payments WHERE transaction_id = ?`).bind(transactionId).first();
    if (existingPayment) return { success: false, error: "Transaction ID already used" };
    
    const existingRequest = await env.DB.prepare(`SELECT * FROM premium_requests WHERE transaction_id = ? AND status = 'pending'`).bind(transactionId).first();
    if (existingRequest) return { success: false, error: "Request already pending" };
    
    await env.DB.prepare(`INSERT INTO premium_requests (id, user_id, transaction_id, plan, upi_id, status, created_at) VALUES (?, ?, ?, ?, ?, 'pending', ?)`)
        .bind(generateId(), userId, transactionId, plan, upiId, Date.now()).run();
    
    await updateDailyStat(env, 'premium_requests');
    await sendPremiumRequestToSlack(env, userId, transactionId, plan, upiId);
    
    return { success: true, message: "Request sent. Admin will verify via Slack.", status: "pending" };
}

async function verifyPremium(env, userId, transactionId, plan) {
    const request = await env.DB.prepare(`SELECT * FROM premium_requests WHERE user_id = ? AND transaction_id = ? AND status = 'pending'`)
        .bind(userId, transactionId).first();
    if (!request) return { success: false, error: "No pending request found" };
    
    const existingPayment = await env.DB.prepare(`SELECT * FROM payments WHERE transaction_id = ?`).bind(transactionId).first();
    if (existingPayment) return { success: false, error: "Transaction ID already used" };
    
    const days = plan === 'yearly' ? 365 : plan === 'pro' ? 365 : 30;
    const amount = plan === 'yearly' ? 1499 : plan === 'pro' ? 2999 : 299;
    const expiryDate = Date.now() + (days * 24 * 60 * 60 * 1000);
    
    await env.DB.prepare(`UPDATE users SET isPremium = true, plan = ?, premiumExpiry = ?, data = json_set(data, '$.isPremium', true, '$.plan', ?, '$.premiumExpiry', ?) WHERE id = ?`)
        .bind(plan, expiryDate, plan, expiryDate, userId).run();
    await env.DB.prepare(`UPDATE premium_requests SET status = 'verified', verified_at = ? WHERE user_id = ? AND transaction_id = ?`)
        .bind(Date.now(), userId, transactionId).run();
    await env.DB.prepare(`INSERT INTO payments (id, transaction_id, user_id, amount, plan, status, created_at) VALUES (?, ?, ?, ?, ?, 'verified', ?)`)
        .bind(generateId(), transactionId, userId, amount, plan, Date.now()).run();
    
    return { success: true, message: "Premium activated!", expiry: new Date(expiryDate) };
}

// ==========================================
// ========== FILE UPLOAD FUNCTIONS ==========
// ==========================================
async function parseMultipartForm(request) {
    const contentType = request.headers.get('Content-Type') || '';
    if (!contentType.includes('multipart/form-data')) return null;
    
    const formData = await request.formData();
    const result = { message: '', files: [] };
    
    for (const [key, value] of formData.entries()) {
        if (key === 'message') result.message = value;
        else if (value instanceof File) {
            const buffer = await value.arrayBuffer();
            const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
            result.files.push({ name: value.name, type: value.type, size: value.size, data: base64 });
        }
    }
    return result;
}

async function processUploadedFile(env, file, message) {
    const extension = file.name.split('.').pop().toLowerCase();
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > 10) return { error: "File too large. Max 10MB." };
    
    if (['pdf'].includes(extension)) {
        const response = await callGemini(`Acknowledge receipt of PDF "${file.name}" (${(file.size/1024).toFixed(1)}KB). Ask what the user needs from this document.`, false);
        return { success: true, fileName: file.name, fileType: 'PDF', fileSize: (file.size/1024).toFixed(1)+'KB', message: response||`📄 Received: ${file.name}`, type: 'pdf' };
    }
    if (['csv','xlsx','xls'].includes(extension)) {
        const response = await callGemini(`Acknowledge ${extension.toUpperCase()} spreadsheet "${file.name}". Offer to analyze the data.`, false);
        return { success: true, fileName: file.name, fileType: extension.toUpperCase()+' Spreadsheet', fileSize: (file.size/1024).toFixed(1)+'KB', message: response||`📊 Received: ${file.name}`, type: 'spreadsheet' };
    }
    if (['txt','md','json','xml','yaml','yml'].includes(extension)) {
        const binary = Uint8Array.from(atob(file.data), c=>c.charCodeAt(0));
        const text = new TextDecoder().decode(binary);
        return { success: true, fileName: file.name, fileType: 'Text File', content: text.substring(0,3000), fullLength: text.length, type: 'text' };
    }
    if (['html','css','js','py','java','cpp','c','go','rs','ts','jsx','tsx'].includes(extension)) {
        const binary = Uint8Array.from(atob(file.data), c=>c.charCodeAt(0));
        const code = new TextDecoder().decode(binary);
        return { success: true, fileName: file.name, fileType: `${extension.toUpperCase()} Code`, content: code.substring(0,2000), fullLength: code.length, type: 'code' };
    }
    if (['jpg','jpeg','png','gif','webp'].includes(extension)) {
        const result = await analyzeImage(`data:${file.type};base64,${file.data}`, message);
        if (result) return { success: true, fileName: file.name, fileType: 'Image', analysis: result.analysis, provider: result.provider, type: 'image' };
        return { error: "Image analysis failed" };
    }
    return { error: `Unsupported file type: .${extension}` };
}

// ==========================================
// ========== CANVAS / ARTIFACTS ==========
// ==========================================
async function generateCanvasArtifact(env, code, language) {
    const canvasId = generateId();
    let html = '', css = '', js = '';
    if (language==='html'||code.includes('<!DOCTYPE')||code.includes('<html')) html = code;
    else if (language==='css') css = code;
    else if (language==='javascript'||language==='js') js = code;
    
    let full;
    if (html||css||js) full = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><style>${css}</style></head><body>${html}<script>${js}</script></body></html>`;
    else full = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:monospace;padding:20px;background:#1e1e1e;color:#d4d4d4}pre{background:#2d2d2d;padding:15px;border-radius:8px}.lang{background:#007acc;color:#fff;padding:2px 8px;border-radius:4px;font-size:12px}</style></head><body><span class="lang">${language}</span><pre><code>${escapeHTML(code)}</code></pre></body></html>`;
    
    await env.KV.put(`canvas:${canvasId}`, full, { expirationTtl: 86400*7 });
    return { canvasUrl: `${CONFIG.WORKER_URL}/canvas/${canvasId}`, canvasId: canvasId };
}

// ==========================================
// ========== WORKSPACE + AGENTS FUNCTIONS ==========
// ==========================================
async function createWorkspace(env, name, ownerId) {
    const workspaceId = generateId();
    const workspace = { id: workspaceId, name, owner: ownerId, members: [{ userId: ownerId, role: 'admin', joinedAt: Date.now() }], channels: [{ name: 'general', createdBy: ownerId, createdAt: Date.now() }], createdAt: Date.now() };
    await env.DB.prepare(`INSERT INTO conversations (id, user_id, data, created_at) VALUES (?, ?, ?, ?)`).bind(`workspace:${workspaceId}`, ownerId, JSON.stringify(workspace), Date.now()).run();
    return workspace;
}

async function getUserAgents(env, userId) {
    try { const result = await env.DB.prepare(`SELECT data FROM conversations WHERE user_id = ? AND id LIKE 'agent:%'`).bind(userId).all(); return (result.results||[]).map(x=>JSON.parse(x.data)); } catch(e) { return []; }
}

async function saveCustomAgent(env, userId, agentData) {
    const agentId = generateId();
    const agent = { id: agentId, userId, ...agentData, createdAt: Date.now(), usageCount: 0 };
    await env.DB.prepare(`INSERT INTO conversations (id, user_id, data, created_at) VALUES (?, ?, ?, ?)`).bind(`agent:${agentId}`, userId, JSON.stringify(agent), Date.now()).run();
    return agent;
}

// ==========================================
// ========== SESSION MANAGEMENT ==========
// ==========================================
async function getSession(env, ip, userId, sessionId) {
    const key = `session:${ip}|${userId}|${sessionId}`;
    let session = await env.KV.get(key, { type: 'json' });
    if (!session) session = { messages: [], lastCode: null, lastImage: null, lastImageDesc: null, lastAccess: Date.now(), messageCount: 0 };
    session.lastAccess = Date.now();
    return session;
}

async function saveSession(env, ip, userId, sessionId, session) {
    const key = `session:${ip}|${userId}|${sessionId}`;
    await env.KV.put(key, JSON.stringify(session), { expirationTtl: CONFIG.SESSION_TIMEOUT/1000 });
}

async function addMessage(env, ip, userId, sessionId, userMsg, aiMsg, isImage = false, imageUrl = null) {
    let session = await getSession(env, ip, userId, sessionId);
    session.messages.push({ user: userMsg, assistant: aiMsg, timestamp: Date.now(), isImage, importance: calculateImportance(userMsg) });
    session.messageCount = (session.messageCount||0)+1;
    if (session.messages.length > CONFIG.CONTEXT_WINDOW.max_messages) session.messages = smartContextWindow(session.messages, CONFIG.CONTEXT_WINDOW.max_messages);
    const codeMatch = aiMsg.match(/```(\w+)?\n([\s\S]*?)```/);
    if (codeMatch) session.lastCode = { language: codeMatch[1]||'javascript', code: codeMatch[2] };
    if (isImage && imageUrl) { session.lastImage = imageUrl; session.lastImageDesc = aiMsg; }
    await saveSession(env, ip, userId, sessionId, session);
}

// ==========================================
// ========== THINKING MODE ==========
// ==========================================
async function thinkBeforeAct(env, userMessage, sessionContext, hasLastImage, lastImageDesc, isPremium, userId) {
    if (!CONFIG.THINKING_MODE) return { action: "chat", prompt: userMessage };
    
    const key = getNextKey('gemini');
    if (!key) return { action: "chat", prompt: userMessage };
    
    const thinkingPrompt = `You are NEXUS AI (ChatGPT 5.5 level). Think step by step about what user wants.\n\nUSER MESSAGE: "${userMessage}"\nCONTEXT: ${sessionContext}\n${hasLastImage ? `LAST GENERATED IMAGE: "${lastImageDesc}"` : "No previous image"}\nUSER PLAN: ${isPremium ? "Premium" : "Free"}\n\nReturn ONLY JSON:\n{\n    "action": "new_image" or "improve_image" or "edit_image" or "chat" or "web_search",\n    "prompt": "description if image related",\n    "reason": "why I chose this action"\n}`;

    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${key}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: thinkingPrompt }] }], generationConfig: { temperature: 0.1, maxOutputTokens: 300 }, tools: [{ googleSearch: {} }] })
        });
        if (res.ok) { const data = await res.json(); const text = data.candidates[0]?.content?.parts[0]?.text; const jsonMatch = text.match(/\{[\s\S]*\}/); if (jsonMatch) return JSON.parse(jsonMatch[0]); }
    } catch(e) {}
    return { action: "chat", prompt: userMessage };
}

// ==========================================
// ========== VOICE FUNCTIONS ==========
// ==========================================
async function voiceToText(env, audioBlob) {
    const key = getNextKey('groq');
    if (!key) return { success: false, error: "No Groq key available" };
    try {
        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.webm');
        formData.append('model', 'whisper-large-v3');
        formData.append('language', 'hi');
        formData.append('response_format', 'json');
        const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', { method: 'POST', headers: { 'Authorization': `Bearer ${key}` }, body: formData });
        if (response.ok) { const data = await response.json(); return { success: true, text: data.text }; }
    } catch(e) {}
    return { success: false, error: "Voice recognition failed" };
}

// ✅ 4-Provider TTS - ElevenLabs → Edge TTS → GTTS → Deepgram
async function textToVoice(text) {
    const isHindi = /[\u0900-\u097F]/.test(text);
    const cleanText = text.substring(0, 2000).replace(/[&<>"']/g, '');
    
    // ATTEMPT 1: ELEVENLABS (Best Quality)
    const elKeys = CONFIG.TTS_KEYS?.elevenlabs;
    if (elKeys?.length) {
        for (const elKey of elKeys) {
            try {
                const voiceId = isHindi ? "pNInz6obpgDQGcFmaJgB" : "21m00Tcm4TlvDq8ikWAM";
                const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
                    method: 'POST', headers: { 'xi-api-key': elKey, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: cleanText, model_id: "eleven_multilingual_v2", voice_settings: { stability: 0.5, similarity_boost: 0.75 } })
                });
                if (response.ok) { const audioBuffer = await response.arrayBuffer(); return { success: true, audio: audioBuffer, contentType: 'audio/mpeg', provider: 'ElevenLabs' }; }
            } catch(e) {}
        }
    }
    
    // ATTEMPT 2: EDGE TTS
    try {
        const voiceName = isHindi ? 'hi-IN-SwaraNeural' : 'en-US-JennyNeural';
        const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="${isHindi?'hi-IN':'en-US'}"><voice name="${voiceName}"><mstts:express-as style="cheerful"><prosody rate="0%" pitch="0%">${cleanText}</prosody></mstts:express-as></voice></speak>`;
        const response = await fetch('https://eastus.tts.speech.microsoft.com/cognitiveservices/v1', { method:'POST', headers:{'Content-Type':'application/ssml+xml','X-Microsoft-OutputFormat':'audio-24khz-96kbitrate-mono-mp3','User-Agent':'Mozilla/5.0'}, body:ssml });
        if (response.ok) { const audioBuffer = await response.arrayBuffer(); return { success: true, audio: audioBuffer, contentType: 'audio/mpeg', provider: 'Edge TTS' }; }
    } catch(e) {}
    
    // ATTEMPT 3: GTTS
    try {
        const lang = isHindi ? 'hi' : 'en';
        const gttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${lang}&q=${encodeURIComponent(cleanText.substring(0,200))}`;
        const response = await fetch(gttsUrl, { headers:{'User-Agent':'Mozilla/5.0'} });
        if (response.ok) { const audioBuffer = await response.arrayBuffer(); if (audioBuffer.byteLength>1000) return { success: true, audio: audioBuffer, contentType: 'audio/mpeg', provider: 'GTTS' }; }
    } catch(e) {}
    
    // ATTEMPT 4: DEEPGRAM
    const dgKeys = CONFIG.TTS_KEYS?.deepgram;
    if (dgKeys?.length) {
        for (const dgKey of dgKeys) {
            try {
                const response = await fetch('https://api.deepgram.com/v1/speak', { method:'POST', headers:{'Authorization':`Token ${dgKey}`,'Content-Type':'application/json'}, body:JSON.stringify({ text:cleanText }) });
                if (response.ok) { const audioBuffer = await response.arrayBuffer(); return { success: true, audio: audioBuffer, contentType: 'audio/mpeg', provider: 'Deepgram Aura' }; }
            } catch(e) {}
        }
    }
    
    return { success: false, error: "All TTS providers failed" };
}

async function handleVoiceChat(request, env, userId, sessionId) {
    try {
        const formData = await request.formData();
        const audioFile = formData.get('audio');
        if (!audioFile) return new Response(JSON.stringify({ error: "No audio file provided" }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        
        const transcription = await voiceToText(env, audioFile);
        if (!transcription.success) return new Response(JSON.stringify({ error: transcription.error }), { status: 500, headers: { 'Content-Type': 'application/json' } });
        
        const userMessage = transcription.text;
        const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
        const isPremium = await checkPremium(env, userId);
        const vectorMemories = await searchVectorDB(env, userId, userMessage, 3);
        let vectorContext = "";
        if (vectorMemories.length > 0) { vectorContext = "\n\n## 📚 Relevant Past Conversations\n\n"; for (const memory of vectorMemories) { if (memory.metadata?.text) vectorContext += `- ${memory.metadata.text.substring(0, 200)}...\n`; } }
        
        const sessionContext = await buildContext(env, ip, userId, sessionId, userMessage, 'gemini');
        const aiResponse = await getResponse(env, userMessage, sessionContext + vectorContext, isPremium, userId);
        await addMessage(env, ip, userId, sessionId, userMessage, aiResponse);
        await saveToVectorDB(env, userId, userMessage, { response: aiResponse.substring(0, 500), type: 'voice' });
        
        const voiceResponse = await textToVoice(aiResponse);
        if (voiceResponse.success) return new Response(voiceResponse.audio, { headers: { 'Content-Type': 'audio/mpeg', 'X-Transcript': encodeURIComponent(userMessage), 'X-Response-Text': encodeURIComponent(aiResponse), 'X-TTS-Provider': voiceResponse.provider || 'Unknown', 'Access-Control-Expose-Headers': 'X-Transcript, X-Response-Text, X-TTS-Provider' } });
        return new Response(JSON.stringify({ transcript: userMessage, response: aiResponse, voiceError: voiceResponse.error }), { headers: { 'Content-Type': 'application/json' } });
    } catch(e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
// ==========================================
// ========== MAIN RESPONSE (Smart Web Search) ==========
// ==========================================
async function getResponse(env, query, context, isPremium, userId, isAgentChat = false) {
    const isHindi = /[\u0900-\u097F]/.test(query);
    const lang = isHindi ? "HINDI" : "ENGLISH";
    
    // ✅ SMART WEB SEARCH — AI खुद Decide करेगा
    const needsSearch = await shouldSearchWeb(query);
    
    if (needsSearch) {
        const searchResult = await performWebSearch(query);
        if (searchResult?.content) {
            context = `\n\n**🌐 LATEST WEB SEARCH RESULTS (Use this real-time data, NOT your training data):**\n${searchResult.content}\n**Source:** ${searchResult.source}\n\n${context}`;
        }
    }
    
    let finalPrompt;
    
    if (isAgentChat) {
        finalPrompt = `${context}\n\n**User Query:** ${query}\n\n**IMPORTANT:** Respond in ${lang}. Follow your specific agent role and instructions strictly. Do NOT introduce yourself as NEXUS unless your agent role requires it. Do NOT mention premium or plans.`;
    } else {
        finalPrompt = MASTER_PROMPT + `\n\n**IMPORTANT:** Respond in ${lang} language.\n\n${context}`;
        
        const isPremiumQuery = /(premium|upgrade|plan|price|cost|paid|subscription|membership)/i.test(query);
        if (!isPremium && isPremiumQuery) {
            finalPrompt += `\n\n**Premium Info (share only if asked):** ₹299/month, ₹1,499/year, ₹2,999/year. UPI: ${CONFIG.UPI_ID}`;
        }
    }
    
    // ✅ FALLBACK CHAIN: Gemini(6 keys)→Groq(3 keys)→Cerebras(3 keys)→SambaNova(3 keys)→OpenRouter(1 key)
    let response = await callGemini(finalPrompt, true);
    if (!response) response = await callGroq([{ role: "user", content: finalPrompt }]);
    if (!response) response = await callCerebras([{ role: "user", content: finalPrompt }]);
    if (!response) response = await callGemma([{ role: "user", content: finalPrompt }]);
    if (!response) response = await callOpenRouter([{ role: "user", content: finalPrompt }]);
    if (!response) response = `I am ${CONFIG.APP_NAME} created by ${CONFIG.CREATOR}. How can I help you today?`;
    
    return response;
}

// ==========================================
// ========== 🆕 STREAMING MODULE ==========
// ==========================================

class SSEStream {
    constructor() {
        this.controller = null;
        this.encoder = new TextEncoder();
        this.closed = false;
    }

    create() {
        const self = this;
        return new ReadableStream({
            start(controller) { self.controller = controller; },
            cancel() { self.closed = true; self.controller = null; }
        });
    }

    send(data) {
        if (!this.closed && this.controller) {
            try { this.controller.enqueue(this.encoder.encode(`data: ${JSON.stringify(data)}\n\n`)); } catch(e) {}
        }
    }

    chunk(text) { this.send({ type: 'chunk', text }); }

    done(fullResponse) {
        if (!this.closed && this.controller) {
            try {
                this.controller.enqueue(this.encoder.encode(`data: ${JSON.stringify({ type: 'done', fullResponse })}\n\n`));
                this.controller.enqueue(this.encoder.encode('data: [DONE]\n\n'));
                this.controller.close();
            } catch(e) {}
        }
        this.closed = true;
        this.controller = null;
    }

    error(msg) {
        if (!this.closed && this.controller) {
            try {
                this.controller.enqueue(this.encoder.encode(`data: ${JSON.stringify({ type: 'error', error: msg })}\n\n`));
                this.controller.close();
            } catch(e) {}
        }
        this.closed = true;
        this.controller = null;
    }
}

function smartChunk(text, size = 4) {
    if (!text) return [];
    const chunks = [];
    let i = 0;
    while (i < text.length) {
        let end = i + size;
        if (end < text.length) {
            for (let j = end; j < text.length && j < end + 5; j++) {
                if (/[\s.,!?;:\n]/.test(text[j])) { end = j + 1; break; }
            }
        }
        chunks.push(text.substring(i, Math.min(end, text.length)));
        i = Math.min(end, text.length);
    }
    return chunks;
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// ==========================================
// ========== STREAMING API CALLS ==========
// ==========================================

async function* streamGem(prompt) {
    const key = getNextKey('gemini');
    if (!key) return;
    try {
        const body = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: CONFIG.MAX_TOKENS_GEMINI, temperature: 0.7 },
            tools: [{ googleSearch: {} }]  // ✅ WEB SEARCH ENABLED
        };
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:streamGenerateContent?alt=sse&key=${key}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
        });
        if (!response.ok) { if (response.status === 429) markFailed(key, 60); return; }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
                if (line.startsWith('data: ') && !line.includes('[DONE]')) {
                    try { const data = JSON.parse(line.substring(6)); const text = data?.candidates?.[0]?.content?.parts?.[0]?.text; if (text) yield text; } catch(e) {}
                }
            }
        }
    } catch(e) {}
}

async function* streamGrq(messages) {
    const key = getNextKey('groq');
    if (!key) return;
    try {
        const body = {
            model: "openai/gpt-oss-120b",
            messages,
            temperature: 0.7,
            max_tokens: CONFIG.MAX_TOKENS_GROQ,
            tools: [{ type: "web_search" }],  // ✅ WEB SEARCH ENABLED
            tool_choice: "auto",
            stream: true
        };
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST', headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body)
        });
        if (!response.ok) { if (response.status === 429) markFailed(key, 60); return; }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
                if (line.startsWith('data: ') && !line.includes('[DONE]')) {
                    try { const data = JSON.parse(line.substring(6)); const text = data?.choices?.[0]?.delta?.content; if (text) yield text; } catch(e) {}
                }
            }
        }
    } catch(e) {}
}

async function* streamCer(messages) {
    const key = getNextKey('cerebras');
    if (!key) return;
    try {
        const body = { model: "llama-3.1-8b", messages, temperature: 0.7, max_tokens: CONFIG.MAX_TOKENS_CEREBRAS, stream: true };
        const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
            method: 'POST', headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body)
        });
        if (!response.ok) { if (response.status === 429) markFailed(key, 60); return; }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
                if (line.startsWith('data: ') && !line.includes('[DONE]')) {
                    try { const data = JSON.parse(line.substring(6)); const text = data?.choices?.[0]?.delta?.content; if (text) yield text; } catch(e) {}
                }
            }
        }
    } catch(e) {}
}

async function* streamSam(messages) {
    const key = getNextKey('sambanova');
    if (!key) return;
    try {
        const body = { model: "gemma-3-12b-it", messages, temperature: 0.7, max_tokens: CONFIG.MAX_TOKENS_SAMBANOVA, stream: true };
        const response = await fetch('https://api.sambanova.ai/v1/chat/completions', {
            method: 'POST', headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body)
        });
        if (!response.ok) return;
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
                if (line.startsWith('data: ') && !line.includes('[DONE]')) {
                    try { const data = JSON.parse(line.substring(6)); const text = data?.choices?.[0]?.delta?.content; if (text) yield text; } catch(e) {}
                }
            }
        }
    } catch(e) {}
}

async function* streamOR(messages) {
    const key = getNextKey('openrouter');
    if (!key) return;
    try {
        const body = { model: "openai/gpt-3.5-turbo:online", messages, temperature: 0.7, max_tokens: CONFIG.MAX_TOKENS_OPENROUTER, stream: true };
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST', headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json', 'HTTP-Referer': CONFIG.WORKER_URL, 'X-Title': CONFIG.APP_NAME }, body: JSON.stringify(body)
        });
        if (!response.ok) { if (response.status === 429) markFailed(key, 60); return; }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
                if (line.startsWith('data: ') && !line.includes('[DONE]')) {
                    try { const data = JSON.parse(line.substring(6)); const text = data?.choices?.[0]?.delta?.content; if (text) yield text; } catch(e) {}
                }
            }
        }
    } catch(e) {}
}

async function* streamFallback(messages, prompt) {
    let gen = streamGem(prompt);
    if (gen) { let has = false; for await (const c of gen) { if (c) { has = true; yield { text: c, provider: 'gemini' }; } } if (has) return; }
    gen = streamGrq(messages);
    if (gen) { let has = false; for await (const c of gen) { if (c) { has = true; yield { text: c, provider: 'groq' }; } } if (has) return; }
    gen = streamCer(messages);
    if (gen) { let has = false; for await (const c of gen) { if (c) { has = true; yield { text: c, provider: 'cerebras' }; } } if (has) return; }
    gen = streamSam(messages);
    if (gen) { let has = false; for await (const c of gen) { if (c) { has = true; yield { text: c, provider: 'sambanova' }; } } if (has) return; }
    gen = streamOR(messages);
    if (gen) { let has = false; for await (const c of gen) { if (c) { has = true; yield { text: c, provider: 'openrouter' }; } } if (has) return; }
    yield { text: `I am ${CONFIG.APP_NAME} created by ${CONFIG.CREATOR}. How can I help you today?`, provider: 'fallback' };
}

async function typingStream(gen, sse) {
    let full = '';
    try {
        for await (const c of gen) { if (c?.text) full += c.text; }
        if (!full) { sse.error('No response'); return ''; }
        const chunks = smartChunk(full, 4);
        for (const c of chunks) { sse.chunk(c); await delay(25); }
        sse.done(full);
        return full;
    } catch(e) { sse.error(e.message); return full; }
}

async function burstStream(gen, sse) {
    let full = '';
    try {
        for await (const c of gen) { if (c?.text) { full += c.text; sse.chunk(c.text); } }
        sse.done(full);
        return full;
    } catch(e) { sse.error(e.message); return full; }
}

async function handleStreamingChat(env, message, context, userId, sessionId, ip, mode) {
    const sse = new SSEStream();
    const stream = sse.create();
    const isHindi = /[\u0900-\u097F]/.test(message);
    const lang = isHindi ? "HINDI" : "ENGLISH";
    const finalPrompt = MASTER_PROMPT + `\n\n**IMPORTANT:** Respond in ${lang} language.\n\n${context}`;
    const messages = [{ role: "user", content: finalPrompt }];
    const processPromise = (async () => {
        let full = '';
        try {
            const gen = streamFallback(messages, finalPrompt);
            full = mode === 'burst' ? await burstStream(gen, sse) : await typingStream(gen, sse);
            if (full) {
                await addMessage(env, ip, userId, sessionId, message, full);
                await saveToVectorDB(env, userId, message, { response: full.substring(0, 500), type: 'chat_streaming' });
                await updateDailyStat(env, 'messages');
            }
        } catch(e) { sse.error(e.message); }
    })();
    return { stream, processPromise };
}
// ==========================================
// ========== MAIN WORKER - ALL ENDPOINTS ==========
// ==========================================
const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-API-Key, X-User-ID, X-Session-ID, CF-Connecting-IP, X-Stream-Mode'
};

export default {
    async fetch(request, env, ctx) {
        await initD1Tables(env);
        if (request.method === 'OPTIONS') return new Response(null, { headers });
        
        const url = new URL(request.url);
        const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
        const apiKey = request.headers.get('X-API-Key');
        const userId = request.headers.get('X-User-ID') || 'anonymous';
        const sessionId = request.headers.get('X-Session-ID') || generateId();
        
        const limit = await checkRateLimit(env, ip, userId);
        if (!limit.allowed) return new Response(JSON.stringify({ error: 'Rate limit', retry: limit.retry }), { status: 429, headers });
        
        const publicPaths = ['/health', '/manifest.json', '/branding', '/branding/logo'];
        if (!publicPaths.includes(url.pathname) && apiKey !== CONFIG.API_KEY) {
            return new Response(JSON.stringify({ error: 'Invalid API key' }), { status: 401, headers });
        }
        
        // ========== STATIC ROUTES ==========
        if (url.pathname === '/slack/events' && request.method === 'POST') return await handleSlackInteraction(request, env);
        if (url.pathname.startsWith('/image/')) { const iid = url.pathname.split('/')[2]; const blob = await getImageFromKV(env, iid); if (blob) return new Response(blob, { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=604800' } }); return new Response('Not found', { status: 404 }); }
        if (url.pathname.startsWith('/canvas/')) { const cid = url.pathname.split('/')[2]; const html = await env.KV.get(`canvas:${cid}`); if (html) return new Response(html, { headers: { 'Content-Type': 'text/html' } }); return new Response('Not found', { status: 404 }); }
        if (url.pathname === '/qr' && request.method === 'POST') { const body = await request.json(); if (!body.text) return new Response(JSON.stringify({ error: 'Text required' }), { status: 400, headers }); const qr = await generateQRCode(body.text, body.size || 300); if (qr.success) return new Response(qr.blob, { headers: { 'Content-Type': 'image/png' } }); return new Response(JSON.stringify({ error: 'QR failed' }), { status: 500, headers }); }
        if (url.pathname === '/voice-chat' && request.method === 'POST') return await handleVoiceChat(request, env, userId, sessionId);
        if (url.pathname === '/premium/request' && request.method === 'POST') { const { transactionId, plan, upiId } = await request.json(); if (!transactionId || !plan) return new Response(JSON.stringify({ error: 'transactionId and plan required' }), { status: 400, headers }); const result = await requestPremium(env, userId, transactionId, plan, upiId || CONFIG.UPI_ID); return new Response(JSON.stringify(result), { headers }); }
        if (url.pathname === '/premium/verify' && request.method === 'GET') { const params = Object.fromEntries(url.searchParams); if (params.secret !== CONFIG.API_KEY) return new Response("Unauthorized", { status: 401 }); const result = await verifyPremium(env, params.userId, params.transactionId, params.plan); return new Response(JSON.stringify(result), { headers }); }
        if (url.pathname === '/premium/status') { const isP = await checkPremium(env, userId); const user = await getUser(env, userId); return new Response(JSON.stringify({ isPremium: isP, plan: user.plan || 'free', userId }), { headers }); }
        if (url.pathname === '/premium/plans') return new Response(JSON.stringify({ plans: CONFIG.PREMIUM_PLANS, paidFeatures: CONFIG.PAID_FEATURES, upiId: CONFIG.UPI_ID }), { headers });
        if (url.pathname === '/agents' && request.method === 'GET') { const ua = await getUserAgents(env, userId); return new Response(JSON.stringify({ systemAgents: Object.entries(AI_AGENTS).map(([id, a]) => ({ id, ...a })), userAgents: ua }), { headers }); }
        if (url.pathname === '/agents' && request.method === 'POST') { const { name, icon, prompt } = await request.json(); if (!name || !prompt) return new Response(JSON.stringify({ error: "Name and prompt required" }), { status: 400, headers }); const agent = await saveCustomAgent(env, userId, { name, icon: icon || '🤖', prompt }); return new Response(JSON.stringify({ success: true, agent }), { headers }); }
        if (url.pathname === '/chat/agent' && request.method === 'POST') { const { agentId, message } = await request.json(); let ap = AI_AGENTS[agentId]?.prompt; if (!ap) { const r = await env.DB.prepare(`SELECT data FROM conversations WHERE id = ?`).bind(`agent:${agentId}`).first(); if (r) ap = JSON.parse(r.data).prompt; } if (!ap) return new Response(JSON.stringify({ error: "Agent not found" }), { status: 404, headers }); const resp = await getResponse(env, message, ap, await checkPremium(env, userId), userId, true); return new Response(JSON.stringify({ response: resp, agentId }), { headers }); }
        if (url.pathname === '/workspace' && request.method === 'POST') { const { name } = await request.json(); if (!name) return new Response(JSON.stringify({ error: "Workspace name required" }), { status: 400, headers }); const ws = await createWorkspace(env, name, userId); return new Response(JSON.stringify({ success: true, workspace: ws }), { headers }); }
        if (url.pathname.startsWith('/workspace/') && url.pathname.endsWith('/invite') && request.method === 'POST') { const wid = url.pathname.split('/')[2]; const { userId: iuid } = await request.json(); const r = await env.DB.prepare(`SELECT data FROM conversations WHERE id = ?`).bind(`workspace:${wid}`).first(); if (!r) return new Response(JSON.stringify({ error: "Not found" }), { status: 404, headers }); const ws = JSON.parse(r.data); if (ws.owner !== userId) return new Response(JSON.stringify({ error: "Only owner can invite" }), { status: 403, headers }); ws.members.push({ userId: iuid, role: 'member', joinedAt: Date.now() }); await env.DB.prepare(`UPDATE conversations SET data = ? WHERE id = ?`).bind(JSON.stringify(ws), `workspace:${wid}`).run(); return new Response(JSON.stringify({ success: true, workspace: ws }), { headers }); }
        if (url.pathname === '/canvas' && request.method === 'POST') { const { html, css, js, title } = await request.json(); const cid = generateId(); const full = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title || 'NEXUS Canvas'}</title><style>${css || ''}</style></head><body>${html || ''}<script>${js || ''}</script></body></html>`; await env.KV.put(`canvas:${cid}`, full, { expirationTtl: 86400 }); return new Response(JSON.stringify({ success: true, canvasUrl: `${CONFIG.WORKER_URL}/canvas/${cid}` }), { headers }); }
        if (url.pathname === '/manifest.json') return new Response(JSON.stringify({ name: "NEXUS AI", short_name: "NEXUS", description: "GPT-5.5 Level AI by Akhil Jaiswal", start_url: "/", display: "standalone", background_color: "#0f172a", theme_color: "#6366f1", icons: [{ src: "/branding/logo", sizes: "192x192", type: "image/svg+xml" }] }), { headers: { ...headers, 'Content-Type': 'application/json' } });
        if (url.pathname === '/branding') return new Response(JSON.stringify({ name: CONFIG.APP_NAME, creator: CONFIG.CREATOR, tagline: "GPT-5.5 Level AI", logo: `${CONFIG.WORKER_URL}/branding/logo`, colors: { primary: "#6366f1", secondary: "#8b5cf6", accent: "#06b6d4", background: "#0f172a" }, version: "5.5.0", madeIn: "🇮🇳 India" }), { headers: { ...headers, 'Content-Type': 'application/json' } });
        if (url.pathname === '/branding/logo') { const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60"><defs><linearGradient id="g"><stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#06b6d4"/></linearGradient></defs><text x="10" y="40" font-size="32" font-weight="bold" fill="url(#g)">NEXUS</text><text x="120" y="28" font-size="12" fill="#8b5cf6">GPT-5.5</text><text x="120" y="44" font-size="10" fill="#94a3b8">by Akhil</text></svg>`; return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age-86400' } }); }
        if (url.pathname === '/health') { const isP = await checkPremium(env, userId); return new Response(JSON.stringify({ status: 'active', name: CONFIG.APP_NAME, creator: CONFIG.CREATOR, isPremium: isP, version: 'GPT-5.5 + Streaming + Smart Web Search', streaming: { modes: ['typing', 'burst'] }, webSearch: { auto: true, providers: ['Gemini', 'Groq'] } }), { headers }); }
        if (url.pathname === '/') return new Response(JSON.stringify({ name: CONFIG.APP_NAME, version: 'GPT-5.5_STREAMING_SMART_SEARCH', creator: CONFIG.CREATOR, streaming: { modes: { typing: "Human-like", burst: "Instant" } }, webSearch: { auto: true, providers: ['Gemini', 'Groq'] }, premium: { monthly: '₹299', yearly: '₹1,499', pro: '₹2,999', upi: CONFIG.UPI_ID }, api_key: CONFIG.API_KEY }), { headers });
        if (url.pathname === '/clear') { await env.KV.delete(`session:${ip}|${userId}|${sessionId}`); return new Response(JSON.stringify({ success: true }), { headers }); }
        
        // ========== MAIN CHAT ENDPOINT ==========
        if (url.pathname === '/chat' && request.method === 'POST') {
            const contentType = request.headers.get('Content-Type') || '';
            
            if (contentType.includes('multipart/form-data')) {
                const parsed = await parseMultipartForm(request);
                if (parsed?.files.length > 0) {
                    const file = parsed.files[0];
                    const result = await processUploadedFile(env, file, parsed.message);
                    if (result.error) return new Response(JSON.stringify({ error: result.error }), { status: 400, headers });
                    if (result.content && !result.message) {
                        const resp = await getResponse(env, `File content: ${result.content}`, '', false, userId);
                        await addMessage(env, ip, userId, sessionId, `Uploaded: ${file.name}`, resp);
                        await updateDailyStat(env, 'messages');
                        return new Response(JSON.stringify({ response: resp, fileInfo: { name: result.fileName, type: result.fileType, size: result.fileSize } }), { headers });
                    }
                    await updateDailyStat(env, 'messages');
                    return new Response(JSON.stringify({ response: result.message, fileInfo: { name: result.fileName, type: result.fileType, size: result.fileSize } }), { headers });
                }
            }
            
            let body = {};
            try { body = await request.json(); } catch(e) {}
            
            const { message, image, shoppingProduct, shoppingBudget, transformInstruction, videoUrl, reminderMessage, reminderMinutes } = body;
            const start = Date.now();
            const isPremium = await checkPremium(env, userId);
            const user = await getUser(env, userId);
            const session = await getSession(env, ip, userId, sessionId);
            
            if (reminderMessage && reminderMinutes) { const r = await setReminder(env, userId, reminderMessage, reminderMinutes); return new Response(JSON.stringify(r), { headers }); }
            if (videoUrl) { const s = await getYoutubeSummary(videoUrl); await addMessage(env, ip, userId, sessionId, `YouTube: ${videoUrl}`, s); await updateDailyStat(env, 'messages'); return new Response(JSON.stringify({ response: s }), { headers }); }
            if (shoppingProduct) { const { analysis, searchLink } = await shoppingWithAffiliate(shoppingProduct, shoppingBudget); const full = `${analysis}\n\n---\n### 🔗 [View on Amazon](${searchLink})`; await addMessage(env, ip, userId, sessionId, `Shopping: ${shoppingProduct}`, full); await updateDailyStat(env, 'messages'); return new Response(JSON.stringify({ response: full, shoppingLink: searchLink }), { headers }); }
            if (image && transformInstruction) { if (!isPremium && !isAdmin(userId)) return new Response(JSON.stringify({ error: "Premium feature!" }), { status: 403, headers }); const t = await transformImageWithSDXL(env, image, transformInstruction); if (t.success) { await addMessage(env, ip, userId, sessionId, message || transformInstruction, 'Transformed', true, t.url); await updateDailyStat(env, 'images'); return new Response(t.blob, { headers: { 'Content-Type': 'image/png', 'X-Provider': t.provider, ...headers } }); } }
            
            const sc = await buildContext(env, ip, userId, sessionId, message);
            const hl = !!session.lastImageDesc;
            const ad = await thinkBeforeAct(env, message, sc, hl, session.lastImageDesc, isPremium, userId);
            
            if (ad.action === "web_search") { const sr = await performWebSearch(message); const sresp = await callGemini(`Based on search, answer: ${message}\n\nResult: ${sr?.content || "None"}`, false); await addMessage(env, ip, userId, sessionId, message, sresp); await updateDailyStat(env, 'messages'); return new Response(JSON.stringify({ response: sresp, isPremium, plan: user.plan || 'free' }), { headers }); }
            if (ad.action === "improve_image" && session.lastImage) { if (!isPremium && !isAdmin(userId)) return new Response(JSON.stringify({ error: "Premium feature!" }), { status: 403, headers }); const imp = await transformImageWithSDXL(env, session.lastImage, ad.prompt || "improve quality"); if (imp.success) { await addMessage(env, ip, userId, sessionId, message, 'Improved', true, imp.url); await updateDailyStat(env, 'images'); return new Response(imp.blob, { headers: { 'Content-Type': 'image/png', 'X-Provider': imp.provider, ...headers } }); } }
            if (ad.action === "edit_image" && session.lastImage) { if (!isPremium && !isAdmin(userId)) return new Response(JSON.stringify({ error: "Premium feature!" }), { status: 403, headers }); const ed = await editImageWithInpainting(env, session.lastImage, ad.prompt); if (ed.success) { await addMessage(env, ip, userId, sessionId, message, 'Edited', true, ed.url); await updateDailyStat(env, 'images'); return new Response(ed.blob, { headers: { 'Content-Type': 'image/png', 'X-Provider': ed.provider, ...headers } }); } }
            if (ad.action === "new_image") { let mx = isPremium ? (user.plan === 'pro' ? 500 : 100) : 10; if (!isAdmin(userId)) { const ik = `usage:${userId}:img:${new Date().toDateString()}`; let ic = await env.KV.get(ik); ic = ic ? parseInt(ic) : 0; if (ic >= mx) return new Response(JSON.stringify({ error: `Limit: ${mx}/day` }), { status: 403, headers }); await env.KV.put(ik, String(ic + 1), { expirationTtl: 86400 }); } const img = await generateImage(env, ad.prompt || message); if (img.success) { await addMessage(env, ip, userId, sessionId, message, 'Generated', true, img.url); await updateDailyStat(env, 'images'); let tr = await callGemini(`Short friendly response in ${/[\u0900-\u097F]/.test(message) ? 'Hindi' : 'English'}.`, false); if (!tr) tr = '## 🎨 Created!'; return new Response(img.blob, { headers: { 'Content-Type': 'image/png', 'X-Provider': img.provider, 'X-Text-Response': encodeURIComponent(tr), ...headers } }); } }
            if (image) { const result = await analyzeImage(image, message || 'Describe'); if (result) { await addMessage(env, ip, userId, sessionId, message || 'Analyze', result.analysis); return new Response(JSON.stringify({ analysis: result.analysis, provider: result.provider }), { headers }); } }
            if (!message) return new Response(JSON.stringify({ error: 'Message required' }), { status: 400, headers });
            
            // ✅ STREAMING CHECK
            const sm = request.headers.get('X-Stream-Mode') || 'normal';
            if (sm === 'typing' || sm === 'burst') {
                const context = await buildContext(env, ip, userId, sessionId, message);
                let mxm = isPremium ? (user.plan === 'pro' ? 10000 : 500) : 50;
                if (!isAdmin(userId)) { const ck = `usage:${userId}:chat:${new Date().toDateString()}`; let cc = await env.KV.get(ck); cc = cc ? parseInt(cc) : 0; if (cc >= mxm) return new Response(JSON.stringify({ error: `Limit: ${mxm}/day` }), { status: 403, headers }); await env.KV.put(ck, String(cc + 1), { expirationTtl: 86400 }); }
                const { stream, processPromise } = await handleStreamingChat(env, message, context, userId, sessionId, ip, sm);
                ctx.waitUntil(processPromise);
                return new Response(stream, { headers: { ...headers, 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive', 'X-Stream-Mode': sm } });
            }
            
            // ✅ NORMAL RESPONSE
            let mxm = isPremium ? (user.plan === 'pro' ? 10000 : 500) : 50;
            if (!isAdmin(userId)) { const ck = `usage:${userId}:chat:${new Date().toDateString()}`; let cc = await env.KV.get(ck); cc = cc ? parseInt(cc) : 0; if (cc >= mxm) return new Response(JSON.stringify({ error: `Limit: ${mxm}/day` }), { status: 403, headers }); await env.KV.put(ck, String(cc + 1), { expirationTtl: 86400 }); }
            const vm = await searchVectorDB(env, userId, message, 3); let vc = ""; if (vm.length > 0) { vc = "\n\n## 📚 Relevant Past\n"; for (const m of vm) { if (m.metadata?.text) vc += `- ${m.metadata.text.substring(0, 200)}...\n`; } }
            const sc2 = await buildContext(env, ip, userId, sessionId, message);
            const response = await getResponse(env, message, sc2 + vc, isPremium, userId);
            await addMessage(env, ip, userId, sessionId, message, response);
            await saveToVectorDB(env, userId, message, { response: response.substring(0, 500), type: 'chat', importance: calculateImportance(message) });
            await updateDailyStat(env, 'messages');
            const cm = response.match(/```(\w+)?\n([\s\S]*?)```/); let cd = null;
            if (cm && ['html', 'css', 'javascript', 'js'].includes(cm[1] || 'text')) { try { cd = await generateCanvasArtifact(env, cm[2], cm[1] || 'text'); } catch(e) {} }
            return new Response(JSON.stringify({ response, isPremium, plan: user.plan || 'free', latency: Date.now() - start, streamingAvailable: true, ...(cd ? { canvas: cd } : {}) }), { headers });
        }
        
        return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers });
    },
    
        scheduled: async (event, env, ctx) => {
        await sendDailyReportToSlack(env);
        console.log("📊 Daily report sent to Slack");
    }
};