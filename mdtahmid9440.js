‎(() => {
‎  document.addEventListener('DOMContentLoaded', async () => {
‎    const requiredIds = ['chat-box', 'user-input', 'send-btn', 'theme-switch', 'input-form'];
‎    for (let id of requiredIds) {
‎      if (!document.getElementById(id)) {
‎        location.reload();
‎        return;
‎      }
‎    }
‎
‎    setInterval(async () => {
‎      try {
‎        const res = await fetch('https://gamingtahmid1yt.github.io/chatbot-server/server.json?v=' + Date.now());
‎        const data = await res.json();
‎        if (data.status === 'off') {
‎          document.body.innerHTML = `
‎            <div style="text-align:center;padding:40px;">
‎              <h1>🔒 Closed</h1>
‎              <p>Contact<a href="https://wa.me/8801963178893" target="_blank">***********</a> for details.</p>
‎            </div>
‎          `;
‎        }
‎      } catch (e) {
‎        console.error('Error checking server status:', e);
‎      }
‎    }, 70000);
‎
‎    const chatBox = document.getElementById('chat-box');
‎    if (!chatBox) {
‎      alert("Chat box not found. Please reload.");
‎      return;
‎    }
‎
‎    const userInput = document.getElementById('user-input');
‎    const sendBtn = document.getElementById('send-btn');
‎    const inputForm = document.getElementById('input-form');
‎    const themeToggle = document.getElementById('theme-switch');
‎
‎    const savedTheme = localStorage.getItem('theme') || 'light';
‎    document.body.classList.toggle('light-mode', savedTheme === 'light');
‎    themeToggle.textContent = savedTheme === 'light' ? '☀️' : '🌙';
‎
‎    themeToggle.onclick = () => {
‎      const isLight = document.body.classList.toggle('light-mode');
‎      themeToggle.textContent = isLight ? '☀️' : '🌙';
‎      localStorage.setItem('theme', isLight ? 'light' : 'dark');
‎    };
‎
‎    const scrollBtn = document.createElement('button');
‎    scrollBtn.textContent = '⇩';
‎    scrollBtn.id = 'scroll-to-bottom';
‎    scrollBtn.style = 'position:fixed;bottom:80px;right:10px;background:#333;color:#fff;border:none;padding:6px 10px;font-size:18px;border-radius:50%;display:none;z-index:999;';
‎    scrollBtn.onclick = () => {
‎      chatBox.scrollTop = chatBox.scrollHeight;
‎    };
‎    document.body.appendChild(scrollBtn);
‎
‎    chatBox.onscroll = () => {
‎      scrollBtn.style.display = (chatBox.scrollTop + chatBox.clientHeight < chatBox.scrollHeight - 100) ? 'block' : 'none';
‎    };
‎
‎    const moods = ['happy', 'cool', 'chill', 'vibe', 'sad', 'emotional', 'angry', 'jealous', 'sleepy', 'friendly', 'romantic', 'fun', 'normal'];
‎    const getMood = (text) => {
‎      const lower = text.toLowerCase();
‎      if (lower.includes('sad') || lower.includes('😭') || lower.includes('🥺') || lower.includes('unhappy')) return 'sad';
‎      if (lower.includes('angry') || lower.includes('😡') || lower.includes('😠') || lower.includes('🤬')) return 'angry';
‎      if (lower.includes('love') || lower.includes('romantic') || lower.includes('❤️')) return 'romantic';
‎      if (lower.includes('sleepy') || lower.includes('😴')) return 'sleepy';
‎      if (lower.includes('cool')) return 'cool';
‎      if (lower.includes('fun')) return 'fun';
‎      return 'normal';
‎    };
‎
‎    const gfKey = 'ai_relationship';
‎    const userName = localStorage.getItem('username') || '';
‎    const isPremiumIP = localStorage.getItem('isPremium') === 'yes';
‎    const userType = isPremiumIP ? 'premium' : 'free';
‎
‎    const messages = [
‎      { role: 'system',
‎       content: ``
‎ }
‎        ];
‎   let saved = [];
‎    try {
‎     saved = JSON.parse(localStorage.getItem('chat_history') || '[]');
‎   } catch (e) {
‎     localStorage.removeItem('chat_history');
‎     saved = [];
‎   }
‎   if (saved.length > 0) {
‎      for (let msg of saved) {
‎       if (msg.role === 'system') continue;
‎       const cls = msg.role === 'user' ? 'user-message' : 'bot-message';
‎       appendMessage(msg.content, cls);
‎     }
‎     messages.push(...saved.filter(m => m.role !== 'system'));
‎   }
‎   const premiumIPs = ['000.000.000.000'];
‎   let isPremiumUser = false;
‎   async function detectUserIPandCheckPremium() {
‎     try {
‎       let ip = localStorage.getItem('user_ip');
‎       if (!ip) {
‎         const res = await fetch('https://api.ipify.org?format=json');
‎         const data = await res.json();
‎         ip = data.ip;
‎         localStorage.setItem('user_ip', ip);
‎        }
‎       if (premiumIPs.includes(ip)) {
‎         isPremiumUser = true;
‎         localStorage.setItem('isPremium', 'yes');
‎       } else {
‎         localStorage.setItem('isPremium', 'no');
‎       }
‎     } catch (e) {
‎       console.error('IP detection failed:', e);
‎     }
‎   }
‎   await detectUserIPandCheckPremium();
‎
‎   const RATE_LIMIT_MS = 5000;
‎   const limitKey = 'reply_limit';
‎   const dateKey = 'limit_date';
‎   const dailyLimit = isPremiumUser ? Infinity : 40;
‎   let lastSentTime = 0;
‎   function resetLimitIfNewDay() {
‎     const today = new Date().toDateString();
‎     const storedDate = localStorage.getItem(dateKey);
‎     if (storedDate !== today) {
‎       localStorage.setItem(limitKey, '0');
‎       localStorage.setItem(dateKey, today);
‎     }
‎   }
‎   function getTimestamp() {
‎     return `<div style='font-size:12px;color:#D1D6D5'>${new Date().toLocaleString()}</div>`;
‎   }
‎   function makeLinksClickable(text) {
‎const tlds = ['.bd'];
‎const urlPattern = new RegExp(
‎   `((https?:\\/\\/)?(www\\.)?[^\\s]+\\.(${tlds.join('|')})(\\/[\\w\\-\\?=&#%\\.]+)*)`,
‎   'gi'
‎);
‎
‎return text.replace(urlPattern, function (url) {
‎   let hyperlink = url;
‎    if (!hyperlink.startsWith('http')) {
‎     hyperlink = 'https://' + hyperlink;
‎   }
‎   return `<a href="${hyperlink}" target="_blank" style="color:#4eaaff;text-decoration:underline;">${url}</a>`;
‎});
‎   }
‎   
‎   function appendMessage(text, cls) {
‎const div = document.createElement('div');
‎div.className = cls;
‎const linkedText = makeLinksClickable(text); // 👈 Make URLs clickable
‎  div.innerHTML = `<span>${linkedText}</span>${getTimestamp()}`;
‎chatBox.appendChild(div);
‎chatBox.scrollTop = chatBox.scrollHeight;
‎return div;
‎   }
‎   function animateTyping(element, text) {
‎     let index = 0;
‎     const span = element.querySelector('span');
‎     if (!span) return;
‎     span.textContent = '';
‎     const interval = setInterval(() => {
‎       if (index < text.length) {
‎          span.textContent += text[index++];
‎       } else {
‎         clearInterval(interval);
‎       }
‎     }, 1);
‎   }
‎   async function checkLimit() {
‎     if (isPremiumUser) return true;
‎     resetLimitIfNewDay();
‎     let used = parseInt(localStorage.getItem(limitKey) || '0', 10);
‎     if (used >= dailyLimit) {
‎       appendMessage('❌ Daily limit reached, will be reset in midnight.', 'bot-message');
‎       return false;
‎     }
‎      localStorage.setItem(limitKey, (used + 1).toString());
‎     return true;
‎   }
‎   async function searchWikipedia(query) {
‎     try {
‎       const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
‎       if (!res.ok) return null;
‎       const data = await res.json();
‎       if (data.extract) {
‎         return {
‎           source: 'Wikipedia',
‎           info: data.extract,
‎           url: data?.content_urls?.desktop?.page || ''
‎         };
‎        }
‎       return null;
‎     } catch {
‎       return null;
‎     }
‎   }
‎   async function searchSearchEngine(query) {
‎     try {
‎       const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&skip_disambig=1`;
‎       const res = await fetch(url);
‎       if (!res.ok) return null;
‎       const data = await res.json();
‎       if (data.AbstractText && data.AbstractText.trim().length > 0) {
‎         return {
‎           source: 'DuckDuckGo',
‎           info: data.AbstractText,
‎           url: data?.AbstractURL || ''
‎         };
‎       }
‎       return null;
‎     } catch {
‎       return null;
‎     }
‎   }
‎unction isHardQuestion(text) {
‎const lower = text.toLowerCase().trim();
‎// Normalize Bangla-English common words
‎const translated = lower
‎    .replace(/সার্চ/g, 'search')
‎// Main search-intent triggers (expanded)
‎const hardPatterns = [
‎   /\b(search)\b/,
‎   
‎];
‎return hardPatterns.some((regex) => regex.test(translated));
‎
‎   inputForm.onsubmit = async (ev) => {
‎     ev.preventDefault();
‎     const now = Date.now();
‎     if (now - lastSentTime < RATE_LIMIT_MS) {
‎       appendMessage('⚠️ You are replying too fast. Please wait and try again.', 'bot-message');
‎       return;
‎     }
‎     lastSentTime = now;
‎     const prompt = userInput.value.trim();
‎     if (!prompt) return;
‎     
‎     if (prompt.length > 1000) {
‎appendMessage('⚠️ Your message is too long! Please keep it under 1000 characters.', 'bot-message');
‎return;
‎     }
‎      userInput.value = '';
‎      appendMessage(prompt, 'user-message');
‎     if (!(await checkLimit())) return;
‎     const mood = getMood(prompt);
‎     if (prompt.includes('girlfriend') || prompt.includes('boyfriend')) {
‎       localStorage.setItem(gfKey, 'yes');
‎     }
‎     const typingDiv = appendMessage('<span></span>', 'bot-message');
‎     const lastMessages = messages.slice(-18);
‎     if (isHardQuestion(prompt)) {
‎       typingDiv.querySelector('span').textContent = '🔎 Searching...';
‎       let searchResult = await searchWikipedia(prompt);
‎       if (!searchResult) {
‎         searchResult = await searchSearchEngine(prompt);
‎       }
‎       if (searchResult) {
‎         const resultText = `${searchResult.info}\n\n(Source: ${searchResult.source}${searchResult.url ? ' - ' + searchResult.url : ''})`;
‎         typingDiv.querySelector('span').textContent = '';
‎         animateTyping(typingDiv, resultText);
‎         messages.push({ role: 'user', content: prompt });
‎         messages.push({ role: 'assistant', content: resultText });
‎         localStorage.setItem('chat_history', JSON.stringify(messages));
‎         return;
‎       }
‎     }
‎     try {
‎       const response = await fetch('https://api.tahmideditofficial.workers.dev', {
‎         method: 'POST',
‎         headers: { 'Content-Type': 'application/json' },
‎          body: JSON.stringify({
‎           model: 'moonshotai/kimi-k2-instruct',
‎           temperature: 0.8,
‎           top_p: 1.0,
‎           max_tokens: 3000,
‎           messages: [
‎             { role: 'system', content: messages[0]?.content || "" },
‎             ...lastMessages,
‎             { role: 'user', content: prompt }
‎            ]
‎         })
‎       });
‎       const data = await response.json();
‎       const mainReply = data?.choices?.[0]?.message?.content?.trim();
‎       if (!mainReply) throw new Error('No AI reply');
‎       typingDiv.querySelector('span').textContent = '';
‎       animateTyping(typingDiv, mainReply);
‎       messages.push({ role: 'user', content: prompt });
‎       messages.push({ role: 'assistant', content: mainReply });
‎       localStorage.setItem('chat_history', JSON.stringify(messages));
‎      } catch (error) {
‎       appendMessage('⚠️ Server error. Trying backup...', 'bot-message');
‎       try {
‎         const backup = await fetch('https://api.tahmideditofficial.workers.dev', {
‎           method: 'POST',
‎           headers: { 'Content-Type': 'application/json' },
‎           body: JSON.stringify({
‎             model: 'openai/gpt-oss-120b',
‎             temperature: 0.8,
‎             top_p: 1.0,
‎             max_tokens: 2900,
‎             messages: [
‎               { role: 'system', content: messages[0]?.content || "" },
‎               ...lastMessages,
‎               { role: 'user', content: prompt }
‎             ]
‎           })
‎         });
‎         const backupData = await backup.json();
‎         const backupReply = backupData?.choices?.[0]?.message?.content;
‎         if (backupReply) {
‎           typingDiv.querySelector('span').textContent = '';
‎           animateTyping(typingDiv, backupReply);
‎           messages.push({ role: 'user', content: prompt });
‎           messages.push({ role: 'assistant', content: backupReply });
‎           localStorage.setItem('chat_history', JSON.stringify(messages));
‎         } else {
‎           typingDiv.remove();
‎           appendMessage('⚠️ No response from AI.', 'bot-message');
‎         }
‎       } catch {
‎         typingDiv.remove();
‎         appendMessage('🌐 ❌ Both servers failed. Try again later.', 'bot-message');
‎       }
‎     }
‎   };
‎
‎   resetLimitIfNewDay();
‎   appendMessage("👋 Hi ! I'm your smart Bangladeshi AI, made by Tahmid. Ask me anything. 💬", 'bot-message');
‎   userInput.focus();
‎});
‎})();
‎
