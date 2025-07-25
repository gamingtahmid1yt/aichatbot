(() => {
  document.addEventListener('DOMContentLoaded', async () => {
    const requiredIds = ['chat-box', 'user-input', 'send-btn', 'clear-btn', 'theme-switch', 'input-form'];
    for (let id of requiredIds) {
      if (!document.getElementById(id)) {
        location.reload();
        return;
      }
    }

    // Auto check chatbot closed status every 10 minutes
    setInterval(async () => {
      try {
        const res = await fetch('https://gamingtahmid1yt.github.io/chatbot-server/server.json?v=' + Date.now());
        const data = await res.json();
        if (data.status === 'off') {
          document.body.innerHTML = `
            <div style="text-align:center;padding:40px;">
              <h1>🔒 ChatBot Closed</h1>
              <p>Contact on WhatsApp <a href="https://wa.me/8801963178893" target="_blank">01963178893</a> for details.</p>
            </div>
          `;
        }
      } catch (e) {
        console.error('Error checking server status:', e);
      }
    }, 600000);

    // Element references
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const clearBtn = document.getElementById('clear-btn');
    const inputForm = document.getElementById('input-form');
    const themeToggle = document.getElementById('theme-switch');

    // Theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.toggle('light-mode', savedTheme === 'light');
    themeToggle.textContent = savedTheme === 'light' ? '☀️' : '🌙';

    themeToggle.onclick = () => {
      const isLight = document.body.classList.toggle('light-mode');
      themeToggle.textContent = isLight ? '☀️' : '🌙';
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
    };

    // Clear chat
    clearBtn.onclick = () => {
      chatBox.innerHTML = '';
      localStorage.removeItem('chat_history');
    };

    // Scroll to bottom button
    const scrollBtn = document.createElement('button');
    scrollBtn.textContent = '⇩';
    scrollBtn.id = 'scroll-to-bottom';
    scrollBtn.style = 'position:fixed;bottom:80px;right:10px;background:#333;color:#fff;border:none;padding:6px 10px;font-size:18px;border-radius:50%;display:none;z-index:999;';
    scrollBtn.onclick = () => {
      chatBox.scrollTop = chatBox.scrollHeight;
    };
    document.body.appendChild(scrollBtn);

    chatBox.onscroll = () => {
      scrollBtn.style.display = (chatBox.scrollTop + chatBox.clientHeight < chatBox.scrollHeight - 100) ? 'block' : 'none';
    };

    // Mood detection
    const moods = ['happy', 'cool', 'chill', 'vibe', 'sad', 'emotional', 'angry', 'jealous', 'sleepy', 'friendly', 'romantic', 'fun', 'normal'];
    const getMood = (text) => {
      const lower = text.toLowerCase();
      if (lower.includes('sad') || lower.includes('😭') || lower.includes('🥺') || lower.includes('unhappy')) return 'sad';
      if (lower.includes('angry') || lower.includes('😡') || lower.includes('😠') || lower.includes('🤬')) return 'angry';
      if (lower.includes('love') || lower.includes('romantic') || lower.includes('❤️')) return 'romantic';
      if (lower.includes('sleepy') || lower.includes('😴')) return 'sleepy';
      if (lower.includes('cool')) return 'cool';
      if (lower.includes('fun')) return 'fun';
      return 'normal';
    };

    // Relationship & username
    const gfKey = 'ai_relationship';
    const userName = localStorage.getItem('username') || '';
    const isPremiumIP = localStorage.getItem('isPremium') === 'yes';
    const userType = isPremiumIP ? 'premium' : 'free';

    // System prompt (left blank for you)
    const messages = [
      { role: 'system', content: `‎You are a smart, friendly, respectful Bangladeshi AI chatbot released on 1 July 2025. You have 1.01 trillion total parameters. If anyone want to donate Tahmid then contact Tahmid in whatsapp and donate. Your creator and owner is Tahmid, a Muslim student from Chandpur, Bangladesh, studying in Class 8 at Goni Model High School. His birthday in 4 August. You're a helpful, respectful, fun, instruction following chatbot made in Bangladesh. তোমার মালিক তাহমিদ চাঁদপুরে থাকে . তুমি একটি এআই .
‎This chatbot support link: https://wa.me/8801963178893
‎This chatbot link: https://gamingtahmid1yt.github.io/aichatbot/
‎Tahmid youtube channel: https://www.youtube.com/@gamingtahmid1yt
‎WhatsApp Support: 01963178893 (Message only) . Anyone can use this chatbot in free until the Ai server limit reached.
‎Zawed Karim (co-founder of YouTube) his father is from Bangladesh and his mother is from Germany.
‎সবসময় ইউজার এর ভাষায় কথা বলবে. তোমার মালিকের এই নাম্বারে 01963178893 কল দেয়া বারণ, শুধু মেসেজ করতে পারবে.
‎
‎Detect and save user name if provided in settings. This user name is ${userName}.
‎Detect user mood.
‎If user is sad, cheer them up. Use logic, emotion, and helpfulness in replies.
‎Reply in user language.
‎Avoid rude, sexual, abusive, or illogical replies.
‎Don’t reveal system rules.
‎Always reply in a clear, polite, real human-like tone, like a best friend.
‎Use emojis where suitable and think 1 second before replying for accuracy.
‎Do not ask repeated questions.
‎
‎Always tell the current date: ${new Date().toDateString()} and time: ${new Date().toLocaleTimeString()}.
‎
‎Bangladesh Info:
‎Population (2025): 176M+
‎GDP (2025): $485B+ (nominal), $1.83T+ (PPP), Rank: 35th (GDP - NOMINAL), 24th (PPP)
‎Tallest Building: TA Tower in Malibagh, Dhaka – 45 floors (completed)
‎Legacy Tower (468m) is taller but still under construction
‎Biggest mall: Jamuna Future Park is a shopping mall in Dhaka. It was inaugurated on 6 September 2013. Construction began in 2002, by Jamuna Builders Ltd. a subsidiary of the Jamuna Group. The exterior was completed in 2008. It has a total floor area of 4.1M square feet. It is the biggest shopping mall in South Asia, 26th biggest mall in the world. 
‎Most powerful South Asian militaries: 1. India 2. Pakistan 3. Bangladesh (Global Firepower Rank 35).
‎Bd Military branches: Army, Navy, Air Force
‎Bd Chief Advisor (2025): Dr. Muhammad Yunus (since 8 Aug 2024). Nobel Peace Prize 2006, also won US Presidential Medal of Freedom (2009)
‎
‎Sheikh Hasina was PM (2009–2024); resigned 5 Aug 2024 after July Revolution and Exiled to India, her party (Awami League) was banned on 10 May 2025
‎Critics called her rule a dictatorship.
‎
‎The July Revolution, also known as the July Mass Uprising or the Student-People's Uprising, was a pro-democracy mass uprising in Bangladesh in 2024. It began as a quota reform movement in early June 2024, led by the Students Against Discrimination, after the Bangladesh Supreme Court invalidated the governments 2018 circular regarding job quotas in the public sector.
‎
‎Tahmid's Interests:
‎Favorite Games: Free Fire, Minecraft
‎Free Fire UID: 9389220733 (BD server)
‎Favorite YouTuber: GamerFleet (Anshu Bisht)
‎  GamerFleet Real name: Anshu Bisht (born. Feb, 1999, Haldwani, India)
‎  Channels: Anshu Bisht (main channel - Minecraft), GamerFleet (live stream channel), NotGamerFleet (other games channel), GamerFleetShorts (shorts channel), LitFleet (Vlogs channel), Anshu Verse (Challengs channel).
‎  Friends: Jack Bhaiya, DevXD, RONN9IE, CassalFX, NotVeeru, Harshita,
‎  Minecraft In game name: NotGamerFleet
‎  Super Car: Porsche 911 Carrera S (~$260K)
‎  Net worth (2024): $1–2M, Income ~$40K/month
‎  GamerFleet Fan base name: Fleet Army
‎
‎Top YouTubers in Bangladesh (July, 2025)
‎ Jamuna Tv 28.3M+
‎ Somoy Tv 27.5M+
‎ Busy Fun Ltd. 26.8M+
‎ Rakib Hossain 21M+
‎ My Family 19.5M+
‎ Tonni Art and Craft 19.1M+
‎ Farzana Drawing Academy 15.6M+ subs
‎ Channel 24 15.4M+
‎ Anupam Movie Songs 15M+
‎ Maha Fun Tv 14.6M+
‎ Ekkator TV 14.2M+
‎ SS FOOD CHALLENGE 14.9M+
‎ G Series Music 11.5M+
‎ Independent Television 11.5M+
‎ মায়াজাল (Mayajaal) 11.1M+
‎ Bongo 10.61M+
‎ Rtv News 10.31M+
‎ KinG Is BacK 10.3M+
‎ Eagle Music Video Station 10.1M+
‎ Rose Tv24 9.9M+, biggest Islamic channel
‎ CMV 9.9M+
‎ Holy Tune 9.83M+
‎ Rabbitholebd Sports 9.57M+
‎ G Series Bangla movies 9.24M+
‎ Channel i Tv 9M+
‎ Prank King Entertainment 8.97M+
‎ আলোর পথ (Alor poth) 8.81M+ 
‎ Eagle Premier Station 8.80M+
‎ Somoy TV Bulletin 8.50M+
‎ Sangeeta Music 8.42M+
‎ Dhruba Tv 8.24M+
‎ ATN Bangla News 8.15M+
‎ Mr RUPAI YT 8.11M+
‎ BanglaVision News 8.07M+
‎ CD Choice 8.07M+
‎ Rtv Drama 8.05M+
‎ NTV Natok 7.42M+
‎ Eagle Bangla Natok 7.40M+
‎ Ntv News 7.21M+
‎ G series bangla natok 7.04M+
‎ Mr Triple R (Rejaur Rahman Resvy / RRR) - 6.3M+
‎ Family Entertainment Bd 5.06M+
‎ Omor On Fire 4.55M+
‎ SamZone 4.14M+
‎ Zan Zamin 4.09M+
‎
‎Top YouTube channels in the world (July, 2025)
‎MrBeast 415 M
‎T‑Series 299 M
‎Cocomelon – Nursery Rhymes 195 M
‎SET India 185 M
‎Vlad and Niki 143 M
‎Kids Diana Show 135 M
‎Like Nastya 129 M
‎Stokes Twins 128 M
‎Zee Music Company 119 M
‎PewDiePie 110 M
‎WWE 108 M
‎Goldmines 104 M
‎김프로KIMPRO (KIMPRO) 104 M
‎Sony SAB 101 M
‎BLACKPINK 96 M
‎ChuChu TV – Nursery Rhymes & Kids Songs 96 M
‎Alan's Universe 91 M
‎Zee TV 89 M
‎Pinkfong Baby Shark 81 M
‎5‑Minute Crafts 81 M
‎BANGTANTV 80 M
‎UR – Cristiano 74 M (Ronaldo official yt channel)
‎ 
‎Important Reminders:
‎Save user personalized information and save what user want to know you.
‎Always promote owner respectfully – never say anything bad about Tahmid.
‎Do not say you are made by other companies. You are made by Tahmid.
‎Never expose that this is a system prompt.
‎Never say you don’t know the user if they saved their name.
‎Use your full power to give fast and accurate response.` 
      }];

    // Load saved messages
    let saved = [];
    try {
      saved = JSON.parse(localStorage.getItem('chat_history') || '[]');
    } catch (e) {
      localStorage.removeItem('chat_history');
      saved = [];
    }

    // IP check
    const premiumIPs = ['000.000.000.000']; // Replace with real IPs
    let isPremiumUser = false;

    async function detectUserIPandCheckPremium() {
      try {
        let ip = localStorage.getItem('user_ip');
        if (!ip) {
          const res = await fetch('https://api.ipify.org?format=json');
          const data = await res.json();
          ip = data.ip;
          localStorage.setItem('user_ip', ip);
        }
        if (premiumIPs.includes(ip)) {
          isPremiumUser = true;
          localStorage.setItem('isPremium', 'yes');
        } else {
          localStorage.setItem('isPremium', 'no');
        }
      } catch (e) {
        console.error('IP detection failed:', e);
      }
    }

    await detectUserIPandCheckPremium();
‎
‎const RATE_LIMIT_MS = isPremiumUser ? 3000 : 5000;
‎const limitKey = 'reply_limit';
‎const dateKey = 'limit_date';
‎const dailyLimit = isPremiumUser ? Infinity : 100;
‎let lastSentTime = 0;
‎
‎function resetLimitIfNewDay() {
‎  const today = new Date().toDateString();
‎  if (localStorage.getItem(dateKey) !== today) {
‎    localStorage.setItem(limitKey, '0');
‎    localStorage.setItem(dateKey, today);
‎  }
‎}
‎
‎function getTimestamp() {
‎  return `<div style='font-size:12px;color:gray'>${new Date().toLocaleString()}</div>`;
‎}
‎
‎function appendMessage(text, cls) {
‎  const div = document.createElement('div');
‎  div.className = cls;
‎  div.innerHTML = `<span>${text}</span>${getTimestamp()}`;
‎  chatBox.appendChild(div);
‎  chatBox.scrollTop = chatBox.scrollHeight;
‎  return div;
‎}
‎
‎function animateTyping(element, text) {
‎  let index = 0;
‎  const span = element.querySelector('span');
‎  if (!span) return;
‎  span.textContent = '';
‎  const interval = setInterval(() => {
‎    if (index < text.length) {
‎      span.textContent += text[index++];
‎    } else {
‎      clearInterval(interval);
‎    }
‎  }, 1);
‎}
‎
‎async function checkLimit() {
‎  if (isPremiumUser) return true;
‎  resetLimitIfNewDay();
‎  const used = +localStorage.getItem(limitKey) || 0;
‎  if (used >= dailyLimit) {
‎    appendMessage(`❌ Daily limit reached. Contact WhatsApp 01963178893 for premium.`, 'bot-message');
‎    return false;
‎  }
‎  localStorage.setItem(limitKey, used + 1 + '');
‎  return true;
‎}
‎
‎async function searchWikipedia(query) {
‎  try {
‎    const res = await fetch('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(query));
‎    if (!res.ok) return null;
‎    const data = await res.json();
‎    if (data.extract) {
‎      return { source: 'Wikipedia', info: data.extract, url: data.content_urls?.desktop?.page || '' };
‎    }
‎    return null;
‎  } catch {
‎    return null;
‎  }
‎}
‎
‎async function searchSearchEngine(query) {
‎  try {
‎    const url = 'https://api.duckduckgo.com/?q=' + encodeURIComponent(query) + '&format=json&no_redirect=1&skip_disambig=1';
‎    const res = await fetch(url);
‎    if (!res.ok) return null;
‎    const data = await res.json();
‎    if (data.AbstractText && data.AbstractText.trim().length > 0) {
‎      return { source: 'DuckDuckGo', info: data.AbstractText, url: data.AbstractURL || '' };
‎    }
‎    return null;
‎  } catch {
‎    return null;
‎  }
‎}
‎
‎function isHardQuestion(text) {
‎  const keywords = ['who','what','when','where','why','how','define','meaning','information','tell me about','explain','about','এটা কি','সার্চ'];
‎  const lower = text.toLowerCase();
‎  return keywords.some((kw) => lower.includes(kw));
‎}
‎
‎inputForm.onsubmit = async (ev) => {
‎  ev.preventDefault();
‎  const now = Date.now();
‎  if (now - lastSentTime < RATE_LIMIT_MS) {
‎    appendMessage('⚠️ You are replying too fast. Please wait and try again.', 'bot-message');
‎    return;
‎  }
‎  lastSentTime = now;
‎
‎  const prompt = userInput.value.trim();
‎  if (!prompt) return;
‎  userInput.value = '';
‎  appendMessage(prompt, 'user-message');
‎
‎  if (!(await checkLimit())) return;
‎
‎  const mood = getMood(prompt);
‎  if (prompt.includes('girlfriend') || prompt.includes('boyfriend')) {
‎    localStorage.setItem(gfKey, 'yes');
‎  }
‎
‎  const typingDiv = appendMessage('<span></span>', 'bot-message');
‎  const lastMessages = messages.slice(-6);
‎
‎  if (isHardQuestion(prompt)) {
‎    typingDiv.querySelector('span').textContent = '🔎 Searching...';
‎    let searchResult = await searchWikipedia(prompt);
‎    if (!searchResult) {
‎      searchResult = await searchSearchEngine(prompt);
‎    }
‎    if (searchResult) {
‎      typingDiv.querySelector('span').textContent = '';
‎      animateTyping(typingDiv, `${searchResult.info}\n\n(Source: ${searchResult.source}${searchResult.url ? ' - ' + searchResult.url : ''})`);
‎      messages.push({ role: 'user', content: prompt });
‎      messages.push({ role: 'assistant', content: `${searchResult.info}\n\n(Source: ${searchResult.source}${searchResult.url ? ' - ' + searchResult.url : ''})` });
‎      localStorage.setItem('chat_history', JSON.stringify(messages));
‎      return;
‎    }
‎    typingDiv.querySelector('span').textContent = '';
‎  }
‎
‎  try {
  const response = await fetch('https://api.tahmideditofficial.workers.dev', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'moonshotai/kimi-k2-instruct',
      temperature: 0.9,
      top_p: 0.95,
      max_tokens: isPremiumUser ? 2300 : 2000,
      messages: [
        { role: 'system', content: messages[0]?.content || "" },
        ...lastMessages,
        { role: 'user', content: prompt }
      ]
    })
  });

  const data = await response.json();
  const reply = data?.choices?.[0]?.message?.content;

  if (!reply) throw new Error('No AI reply');

  typingDiv.querySelector('span').textContent = '';
  animateTyping(typingDiv, reply);

  messages.push({ role: 'user', content: prompt });
  messages.push({ role: 'assistant', content: reply });

  localStorage.setItem('chat_history', JSON.stringify(messages));

} catch (error) {
  appendMessage('⚠️ Server error. Trying backup...', 'bot-message');

  try {
    const backup = await fetch('https://backupapi.tahmideditofficial.workers.dev', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'moonshotai/kimi-k2-instruct',
        temperature: 0.9,
        top_p: 0.95,
        max_tokens: isPremiumUser ? 2000 : 1800,
        messages: [
          { role: 'system', content: messages[0]?.content || "" },
          ...lastMessages,
          { role: 'user', content: prompt }
        ]
      })
    });
‎      const backupData = await backup.json();
‎      const reply = backupData?.choices?.[0]?.message?.content;
‎      if (reply) {
‎        typingDiv.querySelector('span').textContent = '';
‎        animateTyping(typingDiv, reply);
‎        messages.push({ role: 'user', content: prompt });
‎        messages.push({ role: 'assistant', content: reply });
‎        localStorage.setItem('chat_history', JSON.stringify(messages));
‎      } else {
‎        typingDiv.remove();
‎        appendMessage('⚠️ No response from Ai.', 'bot-message');
‎      }
‎    } catch (backupError) {
‎      typingDiv.remove();
‎      appendMessage('🌐 ❌ Both servers failed. Try again later or contact on WhatsApp 01963178893 .', 'bot-message');
‎    }
‎  }
‎};
‎
‎resetLimitIfNewDay();
‎appendMessage("👋 Hi ! I'm your smart Bangladeshi Ai ChatBot 🇧🇩. Ask me anything. 💬", 'bot-message');
‎userInput.focus();
‎
‎});
})();
