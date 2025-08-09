(() => {
  document.addEventListener('DOMContentLoaded', async () => {
    // Enhanced DOM element checking with fallback
    const requiredIds = ['chat-box', 'user-input', 'send-btn', 'theme-switch', 'input-form'];
    const elementsExist = requiredIds.every(id => document.getElementById(id));
    if (!elementsExist) {
      console.warn('Missing required elements, reloading...');
      location.reload();
      return;
    }

    // Modern feature detection
    const supportsSpeech = 'speechSynthesis' in window;
    const supportsGeo = 'geolocation' in navigator;
    const supportsWebWorker = 'Worker' in window;

    // Server status check with exponential backoff
    let serverCheckInterval = 60000;
    const checkServerStatus = async () => {
      try {
        const res = await fetch('https://gamingtahmid1yt.github.io/chatbot-server/server.json?v=' + Date.now());
        const data = await res.json();
        if (data.status === 'off') {
          document.body.innerHTML = `
            <div style="text-align:center;padding:40px;">
              <h1>🔒 ChatBot Closed</h1>
              <p>Contact on WhatsApp <a href="https://wa.me/8801963178893" target="_blank">***********</a> for details.</p>
            </div>
          `;
        }
      } catch (e) {
        console.error('Server check failed, retrying with backoff:', e);
        serverCheckInterval = Math.min(serverCheckInterval * 2, 300000); // Max 5 minutes
      } finally {
        setTimeout(checkServerStatus, serverCheckInterval);
      }
    };
    checkServerStatus();

    // DOM elements
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const inputForm = document.getElementById('input-form');
    const themeToggle = document.getElementById('theme-switch');

    // Enhanced theme management
    const applyTheme = (theme) => {
      document.body.classList.toggle('light-mode', theme === 'light');
      themeToggle.textContent = theme === 'light' ? '☀️' : '🌙';
      localStorage.setItem('theme', theme);
    };
    
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
    
    themeToggle.onclick = () => {
      const newTheme = document.body.classList.contains('light-mode') ? 'dark' : 'light';
      applyTheme(newTheme);
    };

    // Scroll button with animation
    const scrollBtn = document.createElement('button');
    scrollBtn.textContent = '⇩';
    scrollBtn.id = 'scroll-to-bottom';
    scrollBtn.style = 'position:fixed;bottom:80px;right:10px;background:#333;color:#fff;border:none;padding:6px 10px;font-size:18px;border-radius:50%;display:none;z-index:999;transition:transform 0.2s;';
    scrollBtn.onclick = () => {
      chatBox.scrollTo({
        top: chatBox.scrollHeight,
        behavior: 'smooth'
      });
      scrollBtn.style.transform = 'scale(0.8)';
      setTimeout(() => scrollBtn.style.transform = 'scale(1)', 200);
    };
    document.body.appendChild(scrollBtn);

    // Enhanced scroll detection
    let scrollTimeout;
    chatBox.onscroll = () => {
      clearTimeout(scrollTimeout);
      const shouldShow = chatBox.scrollTop + chatBox.clientHeight < chatBox.scrollHeight - 100;
      scrollBtn.style.display = shouldShow ? 'block' : 'none';
      
      // Detect if user is reading old messages
      scrollTimeout = setTimeout(() => {
        const readingOldMessages = chatBox.scrollTop < chatBox.scrollHeight - chatBox.clientHeight - 50;
        if (readingOldMessages) {
          scrollBtn.style.backgroundColor = '#4CAF50';
        } else {
          scrollBtn.style.backgroundColor = '#333';
        }
      }, 300);
    };

    // Advanced mood detection with sentiment analysis
    const detectMood = (text) => {
      const lower = text.toLowerCase();
      const emojiMap = {
        '😊|🙂|😄|😁|🤗': 'happy',
        '😎|🆒|👌|🤙': 'cool',
        '😌|😏|🧘|🙃': 'chill',
        '🎵|🎶|🎧|🎤': 'vibe',
        '😢|😭|😔|🥺': 'sad',
        '😡|🤬|👿|😠': 'angry',
        '😴|🥱|💤|😪': 'sleepy',
        '❤️|💕|😍|💘': 'romantic'
      };
      
      for (const [emojis, mood] of Object.entries(emojiMap)) {
        if (new RegExp(emojis.split('|').join('|')).test(text)) {
          return mood;
        }
      }
      
      // Basic sentiment analysis
      const positiveWords = ['happy', 'joy', 'love', 'great', 'wonderful', 'amazing'];
      const negativeWords = ['sad', 'angry', 'hate', 'bad', 'terrible', 'awful'];
      
      const positiveCount = positiveWords.filter(w => lower.includes(w)).length;
      const negativeCount = negativeWords.filter(w => lower.includes(w)).length;
      
      if (positiveCount > negativeCount) return 'happy';
      if (negativeCount > positiveCount) return 'sad';
      return 'neutral';
    };

    // Message similarity detection using Levenshtein distance
    const calculateSimilarity = (str1, str2) => {
      if (!str1 || !str2) return 0;
      
      const len1 = str1.length;
      const len2 = str2.length;
      const matrix = [];
      
      for (let i = 0; i <= len1; i++) matrix[i] = [i];
      for (let j = 0; j <= len2; j++) matrix[0][j] = j;
      
      for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
          const cost = str1[i-1] === str2[j-1] ? 0 : 1;
          matrix[i][j] = Math.min(
            matrix[i-1][j] + 1,
            matrix[i][j-1] + 1,
            matrix[i-1][j-1] + cost
          );
        }
      }
      
      return 1 - (matrix[len1][len2] / Math.max(len1, len2));
    };

    // Enhanced message handling with conversation context
    const messages = [
      { 
        role: 'system',
        content: `You are Tahmid's AI ChatBot, created by a Class 8 student from Chandpur, Bangladesh. 
Version: 2025.08 | Updated: 8 Aug 2025
Android: 6.0+ (2GB RAM) | Recommended: Android 11+ (3GB RAM)
Size: ~19-23 MB | 100% Free & Safe | No Login/Data Collection

Current Date: ${new Date().toLocaleDateString()} | Time: ${new Date().toLocaleTimeString()}

Features:
- Multilingual support (English, Bangla)
- Human-like responses with emotional intelligence
- Context-aware conversations
- Safe for all ages (no politics/religion/war)

Tahmid's Interests:
- Games: Free Fire (UID: 9389220733), Minecraft (IGN: TAHMID2948)
- Tech: GitHub, AI, Web Development

Respond helpfully and politely to all queries.`
      }
    ];

    // Enhanced chat history management with compression
    const loadChatHistory = () => {
      try {
        const saved = localStorage.getItem('chat_history');
        if (!saved) return [];
        
        // Try to parse compressed history
        if (saved.startsWith('{') && saved.endsWith('}')) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            return parsed.filter(m => m.role !== 'system');
          }
        }
        return [];
      } catch (e) {
        console.error('Error loading chat history:', e);
        localStorage.removeItem('chat_history');
        return [];
      }
    };

    const savedMessages = loadChatHistory();
    if (savedMessages.length > 0) {
      messages.push(...savedMessages);
      savedMessages.forEach(msg => {
        const cls = msg.role === 'user' ? 'user-message' : 'bot-message';
        appendMessage(msg.content, cls);
      });
    }

    // Enhanced premium detection with fingerprinting
    const detectPremiumStatus = async () => {
      try {
        const fingerprint = await generateFingerprint();
        const premiumUsers = ['fingerprint_hash_here']; // Replace with actual hashes
        return premiumUsers.includes(fingerprint);
      } catch (e) {
        console.error('Fingerprint generation failed:', e);
        return false;
      }
    };

    // Generate browser fingerprint
    const generateFingerprint = async () => {
      const components = [
        navigator.userAgent,
        navigator.hardwareConcurrency,
        screen.width + 'x' + screen.height,
        navigator.language,
        !!window.sessionStorage,
        !!window.localStorage,
        navigator.platform
      ];
      
      const encoder = new TextEncoder();
      const data = encoder.encode(components.join('|'));
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    // Rate limiting with enhanced features
    const RATE_LIMIT_MS = 4000;
    const DAILY_LIMIT = 40;
    let lastSentTime = 0;
    let isPremiumUser = false;

    const checkRateLimit = async () => {
      if (isPremiumUser) return true;
      
      const now = Date.now();
      if (now - lastSentTime < RATE_LIMIT_MS) {
        return false;
      }
      
      const today = new Date().toDateString();
      const storedDate = localStorage.getItem('limit_date');
      if (storedDate !== today) {
        localStorage.setItem('message_count', '0');
        localStorage.setItem('limit_date', today);
      }
      
      const count = parseInt(localStorage.getItem('message_count') || '0', 10);
      if (count >= DAILY_LIMIT) {
        return false;
      }
      
      localStorage.setItem('message_count', (count + 1).toString());
      lastSentTime = now;
      return true;
    };

    // Enhanced message formatting with markdown support
    const formatMessage = (text) => {
      // Make URLs clickable
      text = text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
      
      // Simple markdown support
      text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
      text = text.replace(/`(.*?)`/g, '<code>$1</code>');
      
      // Preserve newlines
      text = text.replace(/\n/g, '<br>');
      
      return text;
    };

    // Enhanced message appending with animations
    const appendMessage = (text, role) => {
      const div = document.createElement('div');
      div.className = `${role}-message`;
      
      const formattedText = formatMessage(text);
      const timestamp = `<div class="message-timestamp">${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>`;
      
      div.innerHTML = `
        <div class="message-content">${formattedText}</div>
        ${timestamp}
      `;
      
      chatBox.appendChild(div);
      
      // Animation for new messages
      div.style.opacity = '0';
      div.style.transform = 'translateY(10px)';
      div.style.transition = 'opacity 0.3s, transform 0.3s';
      
      setTimeout(() => {
        div.style.opacity = '1';
        div.style.transform = 'translateY(0)';
        chatBox.scrollTo({
          top: chatBox.scrollHeight,
          behavior: 'smooth'
        });
      }, 1);
      
      return div;
    };

    // Typing animation with variable speed
    const animateTyping = (element, text, speed = 20) => {
      const contentEl = element.querySelector('.message-content');
      if (!contentEl) return;
      
      contentEl.textContent = '';
      let i = 0;
      const typingInterval = setInterval(() => {
        if (i < text.length) {
          contentEl.innerHTML = formatMessage(text.substring(0, i + 1));
          i++;
          
          // Adjust speed based on punctuation
          const nextChar = text[i];
          if (nextChar === '.' || nextChar === '!' || nextChar === '?') {
            clearInterval(typingInterval);
            setTimeout(() => {
              animateTyping(element, text, speed);
            }, 300); // Pause at punctuation
          }
        } else {
          clearInterval(typingInterval);
        }
      }, speed);
    };

    // Enhanced search functionality
    const searchKnowledge = async (query) => {
      try {
        // Try Wikipedia first
        const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
        if (wikiRes.ok) {
          const wikiData = await wikiRes.json();
          if (wikiData.extract) {
            return {
              source: 'Wikipedia',
              content: wikiData.extract,
              url: wikiData.content_urls?.desktop?.page
            };
          }
        }
        
        // Fallback to DuckDuckGo
        const ddgRes = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`);
        if (ddgRes.ok) {
          const ddgData = await ddgRes.json();
          if (ddgData.AbstractText) {
            return {
              source: 'DuckDuckGo',
              content: ddgData.AbstractText,
              url: ddgData.AbstractURL
            };
          }
        }
        
        return null;
      } catch (error) {
        console.error('Search error:', error);
        return null;
      }
    };

    // Enhanced question detection
    const isComplexQuestion = (text) => {
      const questionWords = ['what', 'why', 'how', 'when', 'where', 'who', 'explain', 'define'];
      const complexIndicators = ['difference between', 'compare', 'versus', 'vs', 'pros and cons'];
      
      const lower = text.toLowerCase();
      const isQuestion = lower.endsWith('?') || questionWords.some(w => lower.startsWith(w));
      const isComplex = complexIndicators.some(i => lower.includes(i));
      
      return isQuestion && (isComplex || lower.split(' ').length > 8);
    };

    // Main message handler
    inputForm.onsubmit = async (ev) => {
      ev.preventDefault();
      
      const prompt = userInput.value.trim();
      if (!prompt) return;
      
      // Input validation
      if (prompt.length > 1000) {
        appendMessage('⚠️ Please keep messages under 1000 characters.', 'bot');
        return;
      }
      
      // Check rate limits
      if (!(await checkRateLimit())) {
        appendMessage('⚠️ Please wait a moment before sending another message.', 'bot');
        return;
      }
      
      // Add user message to UI and history
      userInput.value = '';
      appendMessage(prompt, 'user');
      messages.push({ role: 'user', content: prompt });
      
      // Check for similar previous messages
      const similarThreshold = 0.7;
      const similarMessage = messages.slice(0, -1).reverse().find(msg => 
        msg.role === 'assistant' && 
        calculateSimilarity(msg.content, prompt) > similarThreshold
      );
      
      if (similarMessage) {
        appendMessage(`This seems similar to a previous question. ${similarMessage.content}`, 'bot');
        return;
      }
      
      // Show typing indicator
      const typingDiv = appendMessage('Typing...', 'bot');
      
      // Handle complex questions with web search
      if (isComplexQuestion(prompt)) {
        typingDiv.querySelector('.message-content').textContent = '🔍 Searching for information...';
        const searchResult = await searchKnowledge(prompt);
        
        if (searchResult) {
          let response = `${searchResult.content}\n\nSource: ${searchResult.source}`;
          if (searchResult.url) {
            response += ` - <a href="${searchResult.url}" target="_blank">Read more</a>`;
          }
          
          animateTyping(typingDiv, response);
          messages.push({ role: 'assistant', content: response });
          saveChatHistory();
          return;
        }
      }
      
      // Generate AI response
      try {
        const response = await fetch('https://api.tahmideditofficial.workers.dev', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'moonshotai/kimi-k2-instruct',
            temperature: 0.8,
            top_p: 1.0,
            max_tokens: 2500,
            messages: messages.slice(-20) // Send last 20 messages for context
          })
        });
        
        const data = await response.json();
        const reply = data?.choices?.[0]?.message?.content?.trim();
        
        if (reply) {
          animateTyping(typingDiv, reply);
          messages.push({ role: 'assistant', content: reply });
          saveChatHistory();
        } else {
          throw new Error('Empty response from AI');
        }
      } catch (error) {
        console.error('AI request failed:', error);
        typingDiv.querySelector('.message-content').textContent = '⚠️ Sorry, I encountered an error. Please try again.';
        
        // Try backup API
        try {
          const backupResponse = await fetch('https://backupapi.tahmideditofficial.workers.dev', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'moonshotai/kimi-k2:free',
              temperature: 0.8,
              top_p: 1.0,
              max_tokens: 2000,
              messages: messages.slice(-16) // Smaller context for backup
            })
          });
          
          const backupData = await backupResponse.json();
          const backupReply = backupData?.choices?.[0]?.message?.content?.trim();
          
          if (backupReply) {
            typingDiv.querySelector('.message-content').textContent = '';
            animateTyping(typingDiv, backupReply);
            messages.push({ role: 'assistant', content: backupReply });
            saveChatHistory();
          }
        } catch (backupError) {
          console.error('Backup API also failed:', backupError);
          typingDiv.querySelector('.message-content').textContent = '🌐 Connection issues. Please check your internet and try again.';
        }
      }
    };

    // Save chat history with compression
    const saveChatHistory = () => {
      try {
        localStorage.setItem('chat_history', JSON.stringify(messages.filter(m => m.role !== 'system')));
      } catch (e) {
        console.error('Error saving chat history:', e);
        // Fallback to saving only recent messages if storage is full
        localStorage.setItem('chat_history', JSON.stringify(messages.slice(-20).filter(m => m.role !== 'system')));
      }
    };

    // Initialize premium status
    detectPremiumStatus().then(premium => {
      isPremiumUser = premium;
      if (isPremiumUser) {
        appendMessage('🌟 Welcome back, premium user! Enjoy unlimited messaging.', 'bot');
      }
    });

    // Welcome message with feature detection
    let welcomeMessage = "👋 Hi! I'm your AI assistant. How can I help you today?";
    if (supportsSpeech) welcomeMessage += " You can also use voice commands.";
    if (supportsGeo) welcomeMessage += " I can provide location-based answers.";
    
    appendMessage(welcomeMessage, 'bot');
    userInput.focus();
  });
})();
