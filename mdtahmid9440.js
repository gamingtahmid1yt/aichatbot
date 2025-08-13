(() => {
  document.addEventListener('DOMContentLoaded', async () => {
    // Check required elements
    const requiredIds = ['chat-box', 'user-input', 'send-btn', 'theme-checkbox', 'input-form', 'search-btn'];
    for (let id of requiredIds) {
      if (!document.getElementById(id)) {
        console.error(`Missing required element: ${id}`);
        location.reload();
        return;
      }
    }

    // DOM elements
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const searchBtn = document.getElementById('search-btn');
    const inputForm = document.getElementById('input-form');
    const themeCheckbox = document.getElementById('theme-checkbox');
    const settingsBtn = document.getElementById('settings-btn');
    const closeSettings = document.querySelector('.close-settings');
    const settingsMenu = document.querySelector('.settings-menu');
    const chatLogsContainer = document.getElementById('chat-logs-container');
    const clearChatBtn = document.getElementById('clear-chat');
    const darkModeBtn = document.getElementById('dark-mode-btn');
    const lightModeBtn = document.getElementById('light-mode-btn');
    const scrollBtn = document.getElementById('scroll-to-bottom');

    // Server status check
    const checkServerStatus = async () => {
      try {
        const res = await fetch('https://gamingtahmid1yt.github.io/chatbot-server/server.json?v=' + Date.now());
        const data = await res.json();
        if (data.status === 'off') {
          document.body.innerHTML = `
            <div style="text-align:center;padding:40px;">
              <h1>🔒 Closed</h1>
              <p>Contact<a href="https://wa.me/8801963178893" target="_blank">***********</a> for details.</p>
            </div>
          `;
        }
      } catch (e) {
        console.error('Error checking server status:', e);
      }
    };
    setInterval(checkServerStatus, 70000);
    checkServerStatus();

    // Theme management
    const applyTheme = (isLight) => {
      document.body.classList.toggle('light-mode', isLight);
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
      themeCheckbox.checked = isLight;
    };

    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme === 'light');

    themeCheckbox.addEventListener('change', () => {
      applyTheme(themeCheckbox.checked);
    });

    darkModeBtn.addEventListener('click', () => {
      applyTheme(false);
    });

    lightModeBtn.addEventListener('click', () => {
      applyTheme(true);
    });

    // Settings menu toggle
    settingsBtn.addEventListener('click', () => {
      settingsMenu.classList.toggle('active');
      loadChatLogs();
    });

    closeSettings.addEventListener('click', () => {
      settingsMenu.classList.remove('active');
    });

    // Scroll to bottom button
    const updateScrollButton = () => {
      const shouldShow = chatBox.scrollTop + chatBox.clientHeight < chatBox.scrollHeight - 100;
      scrollBtn.classList.toggle('visible', shouldShow);
    };

    scrollBtn.addEventListener('click', () => {
      chatBox.scrollTo({
        top: chatBox.scrollHeight,
        behavior: 'smooth'
      });
    });

    chatBox.addEventListener('scroll', updateScrollButton);

    // Chat logs management
    const loadChatLogs = () => {
      try {
        const saved = JSON.parse(localStorage.getItem('chat_history') || '[]');
        chatLogsContainer.innerHTML = saved
          .filter(msg => msg.role !== 'system')
          .map((msg, i) => `
            <div class="chat-log-item" data-index="${i}">
              ${msg.content.substring(0, 50)}${msg.content.length > 50 ? '...' : ''}
            </div>
          `)
          .join('');
        
        document.querySelectorAll('.chat-log-item').forEach(item => {
          item.addEventListener('click', () => {
            const index = parseInt(item.dataset.index);
            const saved = JSON.parse(localStorage.getItem('chat_history') || '[]');
            const msg = saved[index + 1]; // +1 to skip system message
            if (msg) {
              chatBox.scrollTop = chatBox.scrollHeight;
              appendMessage(msg.content, `${msg.role}-message`);
            }
          });
        });
      } catch (e) {
        console.error('Error loading chat logs:', e);
      }
    };

    clearChatBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all chat history?')) {
        localStorage.removeItem('chat_history');
        chatBox.innerHTML = '';
        messages = [messages[0]]; // Keep only system message
        loadChatLogs();
        appendMessage("👋 Hi! I'm Nexora AI. How can I help you today?", 'bot-message');
      }
    });

    // Mood detection
    const getMood = (text) => {
      const lower = text.toLowerCase();
      if (lower.includes('sad') || /😭|🥺|unhappy/.test(lower)) return 'sad';
      if (lower.includes('angry') || /😡|😠|🤬/.test(lower)) return 'angry';
      if (lower.includes('love') || /romantic|❤️/.test(lower)) return 'romantic';
      if (lower.includes('sleepy') || /😴/.test(lower)) return 'sleepy';
      if (lower.includes('cool')) return 'cool';
      if (lower.includes('fun')) return 'fun';
      return 'normal';
    };

    // Premium detection
    let isPremiumUser = false;
    const premiumIPs = ['000.000.000.000']; // Add your premium IPs here

    const detectUserIPandCheckPremium = async () => {
      try {
        let ip = localStorage.getItem('user_ip');
        if (!ip) {
          const res = await fetch('https://api.ipify.org?format=json');
          const data = await res.json();
          ip = data.ip;
          localStorage.setItem('user_ip', ip);
        }
        isPremiumUser = premiumIPs.includes(ip);
        localStorage.setItem('isPremium', isPremiumUser ? 'yes' : 'no');
      } catch (e) {
        console.error('IP detection failed:', e);
      }
    };
    await detectUserIPandCheckPremium();

    // Rate limiting
    const RATE_LIMIT_MS = 5000;
    const limitKey = 'reply_limit';
    const dateKey = 'limit_date';
    const dailyLimit = isPremiumUser ? Infinity : 40;
    let lastSentTime = 0;

    const resetLimitIfNewDay = () => {
      const today = new Date().toDateString();
      const storedDate = localStorage.getItem(dateKey);
      if (storedDate !== today) {
        localStorage.setItem(limitKey, '0');
        localStorage.setItem(dateKey, today);
      }
    };

    const checkLimit = async () => {
      if (isPremiumUser) return true;
      resetLimitIfNewDay();
      const used = parseInt(localStorage.getItem(limitKey) || 0;
      if (used >= dailyLimit) {
        appendMessage('❌ Daily limit reached, will be reset at midnight.', 'bot-message');
        return false;
      }
      localStorage.setItem(limitKey, (used + 1).toString());
      return true;
    };

    // Message utilities
    const getTimestamp = () => {
      return `<div class="message-timestamp">${new Date().toLocaleString()}</div>`;
    };

    const makeLinksClickable = (text) => {
      const urlPattern = /((https?:\/\/)?(www\.)?[^\s]+\.[a-zA-Z]{2,}(\/[^\s]*)?)/gi;
      return text.replace(urlPattern, url => {
        const hyperlink = url.startsWith('http') ? url : `https://${url}`;
        return `<a href="${hyperlink}" target="_blank" rel="noopener">${url}</a>`;
      });
    };

    const appendMessage = (text, cls) => {
      const div = document.createElement('div');
      div.className = `message ${cls}`;
      const linkedText = makeLinksClickable(text);
      div.innerHTML = `<div class="message-content">${linkedText}</div>${getTimestamp()}`;
      chatBox.appendChild(div);
      chatBox.scrollTop = chatBox.scrollHeight;
      updateScrollButton();
      return div;
    };

    const animateTyping = (element, text) => {
      const contentDiv = element.querySelector('.message-content');
      if (!contentDiv) return;
      
      contentDiv.innerHTML = '';
      const typingIndicator = document.createElement('div');
      typingIndicator.className = 'typing-indicator';
      typingIndicator.innerHTML = `
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      `;
      contentDiv.appendChild(typingIndicator);

      setTimeout(() => {
        typingIndicator.remove();
        let index = 0;
        const typingSpeed = 10; // Adjust typing speed here (lower is faster)
        const typingInterval = setInterval(() => {
          if (index < text.length) {
            contentDiv.textContent = text.substring(0, index + 1);
            index++;
            chatBox.scrollTop = chatBox.scrollHeight;
          } else {
            clearInterval(typingInterval);
          }
        }, typingSpeed);
      }, 800); // Show typing indicator for 800ms before starting
    };

    // Search functionality
    const searchWikipedia = async (query) => {
      try {
        const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
        if (!res.ok) return null;
        const data = await res.json();
        return data.extract ? {
          source: 'Wikipedia',
          info: data.extract,
          url: data?.content_urls?.desktop?.page || ''
        } : null;
      } catch {
        return null;
      }
    };

    const searchDuckDuckGo = async (query) => {
      try {
        const res = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&skip_disambig=1`);
        if (!res.ok) return null;
        const data = await res.json();
        const text = data.AbstractText || data.Abstract || data.RelatedTopics?.[0]?.Text || '';
        return text.trim() ? {
          source: 'DuckDuckGo',
          info: text,
          url: data?.AbstractURL || ''
        } : null;
      } catch {
        return null;
      }
    };

    const isSearchQuery = (text) => {
      const lower = text.toLowerCase().trim();
      return /\b(search|find|look up|সার্চ|খুঁজুন)\b/.test(lower);
    };

    // AI communication
    let messages = [
      { 
        role: 'system', 
        content: `You are Nexora AI, created by Tahmid from Bangladesh. Current date: ${new Date().toDateString()}.
        Key features:
        - Multilingual support
        - Web search capability
        - Context-aware responses
        - Friendly and helpful personality
        
        Guidelines:
        1. Be concise but thorough
        2. Use markdown formatting when helpful
        3. Provide sources for factual information
        4. Maintain a positive tone`
      }
    ];

    // Load saved messages
    try {
      const saved = JSON.parse(localStorage.getItem('chat_history') || '[]');
      if (saved.length > 0) {
        saved.filter(msg => msg.role !== 'system').forEach(msg => {
          appendMessage(msg.content, `${msg.role}-message`);
        });
        messages.push(...saved);
      }
    } catch (e) {
      console.error('Error loading chat history:', e);
      localStorage.removeItem('chat_history');
    }

    const callAIWithBrowsing = async (messagesArray, modelName, typingDiv) => {
      try {
        const response = await fetch('https://api.tahmideditofficial.workers.dev', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: modelName,
            temperature: 0.7,
            messages: messagesArray,
            tools: [{ type: "browser_search" }]
          })
        });

        const data = await response.json();
        const choice = data?.choices?.[0];
        const messageObj = choice?.message || {};
        const toolCalls = messageObj.tool_calls || (messageObj.tool_call ? [messageObj.tool_call] : []);

        if (toolCalls?.length > 0) {
          for (const tc of toolCalls) {
            if (['browser_search', 'search', 'web_search'].includes(tc.name || tc.type || tc.tool)) {
              const query = tc.arguments?.query || tc.arguments?.q || tc.arguments?.search || 
                           tc.query || (typeof tc.args === 'string' ? tc.args : '') || 
                           messagesArray[messagesArray.length-1]?.content || '';

              if (typingDiv) {
                typingDiv.querySelector('.message-content').textContent = '🔍 Searching the web...';
              }

              const searchResult = await searchWikipedia(query) || await searchDuckDuckGo(query);
              messagesArray.push({
                role: "tool",
                name: "browser_search",
                content: JSON.stringify(searchResult || { source: 'none', info: 'No results found' })
              });

              const followRes = await fetch('https://api.tahmideditofficial.workers.dev', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  model: modelName,
                  messages: messagesArray
                })
              });

              const followData = await followRes.json();
              return {
                text: followData?.choices?.[0]?.message?.content?.trim() || '',
                isSearchResult: true
              };
            }
          }
        }

        return {
          text: messageObj.content?.trim() || '',
          isSearchResult: false
        };
      } catch (error) {
        console.error('AI call failed:', error);
        throw error;
      }
    };

    // Message handling
    const handleUserMessage = async (prompt, isSearch = false) => {
      if (!prompt.trim()) return;
      if (prompt.length > 1000) {
        appendMessage('⚠️ Please keep messages under 1000 characters.', 'bot-message');
        return;
      }

      appendMessage(prompt, 'user-message');
      userInput.value = '';
      
      if (!(await checkLimit())) return;
      
      const typingDiv = appendMessage('', 'bot-message');
      const lastMessages = messages.slice(-18);
      const baseMessages = [
        { role: 'system', content: messages[0].content },
        ...lastMessages,
        { role: 'user', content: prompt }
      ];

      // Handle explicit search queries
      if (isSearch || isSearchQuery(prompt)) {
        typingDiv.querySelector('.message-content').textContent = '🔍 Searching...';
        const searchResult = await searchWikipedia(prompt) || await searchDuckDuckGo(prompt);
        if (searchResult) {
          const resultText = `${searchResult.info}\n\n(Source: ${searchResult.source}${searchResult.url ? ' - ' + searchResult.url : ''})`;
          typingDiv.querySelector('.message-content').textContent = resultText;
          messages.push({ role: 'user', content: prompt }, { role: 'assistant', content: resultText });
          localStorage.setItem('chat_history', JSON.stringify(messages));
          loadChatLogs();
          return;
        }
      }

      // Try primary model
      try {
        const primaryModel = 'openai/gpt-oss-120b';
        const res = await callAIWithBrowsing(baseMessages, primaryModel, typingDiv);

        if (res.text) {
          if (res.isSearchResult) {
            typingDiv.querySelector('.message-content').textContent = res.text;
          } else {
            animateTyping(typingDiv, res.text);
          }
          messages.push({ role: 'user', content: prompt }, { role: 'assistant', content: res.text });
          localStorage.setItem('chat_history', JSON.stringify(messages));
          loadChatLogs();
          return;
        }
        throw new Error('Empty response');
      } catch (error) {
        console.error('Primary model failed:', error);
        
        // Fallback to backup model
        try {
          const backupModel = 'openai/gpt-oss-20b';
          const backupRes = await callAIWithBrowsing(baseMessages, backupModel, typingDiv);
          
          if (backupRes.text) {
            if (backupRes.isSearchResult) {
              typingDiv.querySelector('.message-content').textContent = backupRes.text;
            } else {
              animateTyping(typingDiv, backupRes.text);
            }
            messages.push({ role: 'user', content: prompt }, { role: 'assistant', content: backupRes.text });
            localStorage.setItem('chat_history', JSON.stringify(messages));
            loadChatLogs();
            return;
          }
          throw new Error('Empty backup response');
        } catch (e2) {
          console.error('Backup model failed:', e2);
          typingDiv.remove();
          appendMessage('⚠️ Sorry, I encountered an error. Please try again later.', 'bot-message');
        }
      }
    };

    // Event listeners
    inputForm.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const now = Date.now();
      if (now - lastSentTime < RATE_LIMIT_MS) {
        appendMessage('⏳ Please wait a moment before sending another message.', 'bot-message');
        return;
      }
      lastSentTime = now;
      handleUserMessage(userInput.value.trim());
    });

    searchBtn.addEventListener('click', () => {
      handleUserMessage(userInput.value.trim(), true);
    });

    // Initialize chat
    if (messages.length === 1) {
      appendMessage("👋 Hi! I'm Nexora AI. How can I help you today?", 'bot-message');
    }
    userInput.focus();
  });
})();
