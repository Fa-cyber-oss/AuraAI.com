// ==========================================================================
// Aura 3D — Liquid Glass & Interactive 3D Wallpaper Engine
// ==========================================================================

let state = {
  chats: [],
  activeChatId: null,
  isStreaming: false,
  abortController: null,
  theme: localStorage.getItem('aura_theme') || 'dark',
  accent: localStorage.getItem('aura_accent') || 'violet',
  wallpaperMode: localStorage.getItem('aura_wallpaper') || 'aurora',
  currentUtterance: null,
  speakingBtn: null,
  mouse: { x: window.innerWidth / 2, y: window.innerHeight / 2, targetX: window.innerWidth / 2, targetY: window.innerHeight / 2 },
  settings: {
    geminiKey: localStorage.getItem('ai_gemini_key') || '',
    openaiKey: localStorage.getItem('ai_openai_key') || '',
    temperature: parseFloat(localStorage.getItem('ai_temp') || '0.7'),
    systemPrompt: localStorage.getItem('ai_system_prompt') || 'You are Aura AI, a brilliant, friendly, and helpful AI assistant. Answer with clear, beautifully structured markdown formatting and code snippets when appropriate.'
  }
};

// DOM Elements
const sidebar = document.getElementById('sidebar');
const openSidebarBtn = document.getElementById('openSidebarBtn');
const closeSidebarBtn = document.getElementById('closeSidebarBtn');
const newChatBtn = document.getElementById('newChatBtn');
const chatHistoryList = document.getElementById('chatHistoryList');
const chatSearchInput = document.getElementById('chatSearchInput');
const chatCountBadge = document.getElementById('chatCountBadge');
const clearAllBtn = document.getElementById('clearAllBtn');
const exportChatBtn = document.getElementById('exportChatBtn');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const modelSelect = document.getElementById('modelSelect');
const customModelPicker = document.getElementById('customModelPicker');
const modelTriggerBtn = document.getElementById('modelTriggerBtn');
const modelDropdownMenu = document.getElementById('modelDropdownMenu');
const currentModelName = document.getElementById('currentModelName');
const currentModelProvider = document.getElementById('currentModelProvider');
const modelCardItems = document.querySelectorAll('.model-card-item');

const chatViewport = document.getElementById('chatViewport');
const welcomeScreen = document.getElementById('welcomeScreen');
const messagesContainer = document.getElementById('messagesContainer');
const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const stopBtn = document.getElementById('stopBtn');
const hologramCore = document.getElementById('hologram3dWrapper');

// Settings Modal Elements
const settingsModal = document.getElementById('settingsModal');
const navSettingsBtn = document.getElementById('navSettingsBtn');
const openSettingsBtn = document.getElementById('openSettingsBtn');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const cancelSettingsBtn = document.getElementById('cancelSettingsBtn');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const geminiKeyInput = document.getElementById('geminiKeyInput');
const openaiKeyInput = document.getElementById('openaiKeyInput');
const systemPromptInput = document.getElementById('systemPromptInput');
const tempInput = document.getElementById('tempInput');
const tempValueDisplay = document.getElementById('tempValueDisplay');
const accentButtons = document.querySelectorAll('.accent-choice-btn');
const wallpaperButtons = document.querySelectorAll('.wallpaper-choice-btn');

// ==========================================================================
// 1. Interactive 3D Live Wallpaper Engine (Canvas WebGL/2D)
// ==========================================================================
class Interactive3DWallpaper {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.particleCount = 75;
    this.blobs = [];
    this.time = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.init();
    this.setupListeners();
    this.loop();
  }

  init() {
    this.resize();
    this.createParticles();
    this.createBlobs();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
  }

  createParticles() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        x: (Math.random() - 0.5) * this.width * 1.5,
        y: (Math.random() - 0.5) * this.height * 1.5,
        z: Math.random() * 800 + 100, // 3D depth
        vz: (Math.random() * 0.8 + 0.2) * 1.2,
        radius: Math.random() * 2.2 + 1,
        baseColor: this.getAccentRgb()
      });
    }
  }

  createBlobs() {
    this.blobs = [
      { x: this.width * 0.25, y: this.height * 0.3, vx: 0.6, vy: 0.4, r: 240, color: [139, 92, 246] },
      { x: this.width * 0.75, y: this.height * 0.65, vx: -0.5, vy: 0.5, r: 280, color: [217, 70, 239] },
      { x: this.width * 0.5, y: this.height * 0.8, vx: 0.4, vy: -0.6, r: 210, color: [6, 182, 212] }
    ];
  }

  getAccentRgb() {
    switch (state.accent) {
      case 'cyan': return [6, 182, 212];
      case 'emerald': return [16, 185, 129];
      case 'rose': return [244, 63, 94];
      case 'amber': return [245, 158, 11];
      default: return [139, 92, 246];
    }
  }

  setupListeners() {
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      state.mouse.targetX = e.clientX;
      state.mouse.targetY = e.clientY;
    });
  }

  loop() {
    requestAnimationFrame(() => this.loop());

    // Smooth mouse inertia
    state.mouse.x += (state.mouse.targetX - state.mouse.x) * 0.08;
    state.mouse.y += (state.mouse.targetY - state.mouse.y) * 0.08;
    this.time += 0.015;

    this.ctx.clearRect(0, 0, this.width, this.height);

    if (state.wallpaperMode === 'aurora') {
      this.drawLiquidBlobs();
      this.draw3DParticles(true);
    } else if (state.wallpaperMode === 'galaxy') {
      this.draw3DGalaxy();
    } else {
      this.drawLiquidBlobs();
      this.draw3DParticles(false);
    }
  }

  drawLiquidBlobs() {
    const isDark = state.theme === 'dark';
    const accentRgb = this.getAccentRgb();
    this.ctx.save();
    this.ctx.filter = 'blur(60px)';

    this.blobs.forEach((blob, idx) => {
      blob.x += blob.vx;
      blob.y += blob.vy;

      if (blob.x < -blob.r) blob.x = this.width + blob.r;
      if (blob.x > this.width + blob.r) blob.x = -blob.r;
      if (blob.y < -blob.r) blob.y = this.height + blob.r;
      if (blob.y > this.height + blob.r) blob.y = -blob.r;

      // Mouse reactive displacement
      const dx = state.mouse.x - blob.x;
      const dy = state.mouse.y - blob.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      let targetX = blob.x;
      let targetY = blob.y;
      if (dist < 350) {
        targetX -= (dx / dist) * 20;
        targetY -= (dy / dist) * 20;
      }

      const grad = this.ctx.createRadialGradient(targetX, targetY, 10, targetX, targetY, blob.r);
      const color = idx === 0 ? accentRgb : blob.color;
      const alpha = isDark ? 0.28 : 0.12;

      grad.addColorStop(0, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`);
      grad.addColorStop(0.5, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha * 0.5})`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(targetX, targetY, blob.r, 0, Math.PI * 2);
      this.ctx.fill();
    });

    this.ctx.restore();
  }

  draw3DParticles(connectLines) {
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const isDark = state.theme === 'dark';
    const mouseOffsetX = (state.mouse.x - centerX) * 0.05;
    const mouseOffsetY = (state.mouse.y - centerY) * 0.05;
    const accentRgb = this.getAccentRgb();

    const projected = [];

    this.particles.forEach(p => {
      p.z -= p.vz;
      if (p.z <= 10) {
        p.z = 800;
        p.x = (Math.random() - 0.5) * this.width * 1.5;
        p.y = (Math.random() - 0.5) * this.height * 1.5;
      }

      // 3D Perspective Projection
      const fov = 450;
      const scale = fov / (fov + p.z);
      const screenX = centerX + (p.x + mouseOffsetX * (1000 - p.z) * 0.002) * scale;
      const screenY = centerY + (p.y + mouseOffsetY * (1000 - p.z) * 0.002) * scale;
      const r = Math.max(0.5, p.radius * scale);
      const alpha = Math.min(1, (1 - p.z / 900) * (isDark ? 0.65 : 0.45));

      projected.push({ x: screenX, y: screenY, alpha, scale });

      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(screenX, screenY, r, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, ${alpha})`;
      this.ctx.shadowBlur = 8 * scale;
      this.ctx.shadowColor = `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, 0.8)`;
      this.ctx.fill();
    });
    this.ctx.shadowBlur = 0;

    // Draw connecting constellation energy lines
    if (connectLines) {
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].x - projected[j].x;
          const dy = projected[i].y - projected[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            const lineAlpha = (1 - dist / 110) * projected[i].alpha * projected[j].alpha * 0.4;
            this.ctx.beginPath();
            this.ctx.moveTo(projected[i].x, projected[i].y);
            this.ctx.lineTo(projected[j].x, projected[j].y);
            this.ctx.strokeStyle = `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, ${lineAlpha})`;
            this.ctx.lineWidth = 0.75;
            this.ctx.stroke();
          }
        }
      }
    }
  }

  draw3DGalaxy() {
    this.drawLiquidBlobs();
    this.draw3DParticles(true);

    // Subtle center galaxy vortex
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    const grad = this.ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, 400);
    const accentRgb = this.getAccentRgb();
    grad.addColorStop(0, `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, 0.1)`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
}

// ==========================================================================
// 2. 3D Mouse Tilt Physics Engine
// ==========================================================================
function init3DTilt() {
  const tiltElements = document.querySelectorAll('[data-tilt="true"]');

  tiltElements.forEach(el => {
    let bounds;

    const onMouseEnter = () => {
      bounds = el.getBoundingClientRect();
    };

    const onMouseMove = (e) => {
      if (!bounds) bounds = el.getBoundingClientRect();
      const mouseX = e.clientX - bounds.left;
      const mouseY = e.clientY - bounds.top;

      const normX = (mouseX / bounds.width - 0.5) * 2; // -1 to 1
      const normY = (mouseY / bounds.height - 0.5) * 2;

      const rotateY = normX * 12; // deg
      const rotateX = -normY * 12;

      el.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(8px)`;
    };

    const onMouseLeave = () => {
      el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    };

    el.addEventListener('mouseenter', onMouseEnter);
    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('mouseleave', onMouseLeave);
  });

  // Track cursor for 3D Hologram core tilt
  window.addEventListener('mousemove', (e) => {
    if (!hologramCore) return;
    const rect = hologramCore.getBoundingClientRect();
    const coreX = rect.left + rect.width / 2;
    const coreY = rect.top + rect.height / 2;
    const dx = (e.clientX - coreX) / (window.innerWidth / 2);
    const dy = (e.clientY - coreY) / (window.innerHeight / 2);

    hologramCore.style.transform = `perspective(800px) rotateY(${dx * 22}deg) rotateX(${-dy * 22}deg)`;
  });
}

// ==========================================================================
// 3. Marked.js macOS Terminal Code Renderer
// ==========================================================================
if (window.marked) {
  const renderer = new marked.Renderer();
  renderer.code = function (code, language) {
    const validLang = hljs.getLanguage(language) ? language : 'plaintext';
    let highlighted;
    try {
      highlighted = hljs.highlight(code, { language: validLang }).value;
    } catch (e) {
      highlighted = code;
    }
    const id = 'code-' + Math.random().toString(36).substring(2, 9);
    return `
      <div class="mac-code-window" data-tilt="true">
        <div class="mac-code-header">
          <div class="mac-window-controls">
            <span class="mac-dot dot-red"></span>
            <span class="mac-dot dot-yellow"></span>
            <span class="mac-dot dot-green"></span>
          </div>
          <span class="code-lang-label">${validLang}</span>
          <button class="copy-btn" onclick="copyCode('${id}', this)">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span>Copy</span>
          </button>
        </div>
        <pre><code id="${id}" class="hljs language-${validLang}">${highlighted}</code></pre>
      </div>
    `;
  };
  marked.setOptions({
    renderer: renderer,
    gfm: true,
    breaks: true
  });
}

// Copy Helper for Code Blocks
window.copyCode = function (id, btn) {
  const codeElem = document.getElementById(id);
  if (!codeElem) return;
  navigator.clipboard.writeText(codeElem.innerText).then(() => {
    const span = btn.querySelector('span');
    const originalText = span.textContent;
    span.textContent = 'Copied!';
    setTimeout(() => {
      span.textContent = originalText;
    }, 2000);
  });
};

// Copy Helper for Entire Message
window.copyMessageText = function (text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
      Copied!
    `;
    setTimeout(() => {
      btn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        Copy
      `;
    }, 2000);
  });
};

// Text-to-Speech (Voice Playback)
window.speakMessage = function (text, btn) {
  if (!('speechSynthesis' in window)) {
    alert('Text-to-speech is not supported in this browser.');
    return;
  }

  if (window.speechSynthesis.speaking && state.speakingBtn === btn) {
    window.speechSynthesis.cancel();
    resetSpeakBtn(btn);
    state.speakingBtn = null;
    return;
  }

  window.speechSynthesis.cancel();
  if (state.speakingBtn) {
    resetSpeakBtn(state.speakingBtn);
  }

  const cleanText = text.replace(/[*#`_~\[\]]/g, '').replace(/\(https?:\/\/[^\)]+\)/g, '');
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  state.speakingBtn = btn;
  btn.classList.add('speaking');
  btn.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
    Pause
  `;

  utterance.onend = () => {
    resetSpeakBtn(btn);
    state.speakingBtn = null;
  };
  utterance.onerror = () => {
    resetSpeakBtn(btn);
    state.speakingBtn = null;
  };

  window.speechSynthesis.speak(utterance);
};

function resetSpeakBtn(btn) {
  btn.classList.remove('speaking');
  btn.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
    Listen
  `;
}

// ==========================================================================
// 4. Initialization & State Management
// ==========================================================================
function init() {
  // Apply Themes & Accent
  document.documentElement.setAttribute('data-theme', state.theme);
  document.documentElement.setAttribute('data-accent', state.accent);
  updateHljsTheme(state.theme);

  // Sync Accent Buttons
  accentButtons.forEach(btn => {
    if (btn.getAttribute('data-accent') === state.accent) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Sync Wallpaper Buttons
  wallpaperButtons.forEach(btn => {
    if (btn.getAttribute('data-wallpaper') === state.wallpaperMode) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Load Saved Model
  let savedModel = localStorage.getItem('ai_selected_model');
  if (!savedModel || savedModel === 'gemini-2.0-flash' || savedModel === 'gemini-2.0') {
    savedModel = 'gemini-3.6-flash';
    localStorage.setItem('ai_selected_model', 'gemini-3.6-flash');
  }

  let matchedItem = document.querySelector(`.model-card-item[data-model="${savedModel}"]`);
  if (!matchedItem) {
    savedModel = 'gemini-3.6-flash';
    matchedItem = document.querySelector(`.model-card-item[data-model="gemini-3.6-flash"]`);
  }
  if (matchedItem) {
    modelCardItems.forEach(i => i.classList.remove('active'));
    matchedItem.classList.add('active');
    if (modelSelect) modelSelect.value = savedModel;
    if (currentModelName) currentModelName.textContent = matchedItem.getAttribute('data-name');
    if (currentModelProvider) currentModelProvider.textContent = matchedItem.getAttribute('data-provider');
  }

  // Start 3D Wallpaper Engine
  window.wallpaperEngine = new Interactive3DWallpaper('liveWallpaperCanvas');

  // Start 3D Mouse Tilt
  init3DTilt();

  // Load chats
  loadChats();

  // Bind Events
  bindEvents();
}

function updateHljsTheme(theme) {
  const hljsLink = document.getElementById('hljs-theme');
  if (hljsLink) {
    hljsLink.href = theme === 'light'
      ? 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css'
      : 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark-dimmed.min.css';
  }
}

// ==========================================================================
// 5. Chat Session Management & Persistence
// ==========================================================================
function loadChats() {
  try {
    const raw = localStorage.getItem('ai_chats');
    state.chats = raw ? JSON.parse(raw) : [];
  } catch (e) {
    state.chats = [];
  }

  const savedActiveId = localStorage.getItem('ai_active_chat_id');
  if (savedActiveId && state.chats.some(c => c.id === savedActiveId)) {
    switchChat(savedActiveId);
  } else if (state.chats.length > 0) {
    switchChat(state.chats[0].id);
  } else {
    createNewChat();
  }
}

function saveChats() {
  localStorage.setItem('ai_chats', JSON.stringify(state.chats));
  if (state.activeChatId) {
    localStorage.setItem('ai_active_chat_id', state.activeChatId);
  }
  renderChatHistory();
}

function createNewChat() {
  if (state.isStreaming) return;
  const newChat = {
    id: 'chat_' + Date.now(),
    title: 'New Chat',
    messages: [],
    createdAt: new Date().toISOString()
  };
  state.chats.unshift(newChat);
  state.activeChatId = newChat.id;
  saveChats();
  renderCurrentChat();
  userInput.focus();
}

function switchChat(chatId) {
  if (state.isStreaming) return;
  state.activeChatId = chatId;
  localStorage.setItem('ai_active_chat_id', chatId);
  renderChatHistory();
  renderCurrentChat();
}

function deleteChat(chatId, e) {
  if (e) e.stopPropagation();
  if (state.isStreaming) return;

  state.chats = state.chats.filter(c => c.id !== chatId);
  if (state.activeChatId === chatId) {
    state.activeChatId = state.chats.length > 0 ? state.chats[0].id : null;
  }
  if (!state.activeChatId) {
    createNewChat();
  } else {
    saveChats();
    renderCurrentChat();
  }
}

function clearAllChats() {
  if (state.isStreaming) return;
  if (confirm('Are you sure you want to clear all chat conversations?')) {
    state.chats = [];
    state.activeChatId = null;
    localStorage.removeItem('ai_chats');
    localStorage.removeItem('ai_active_chat_id');
    createNewChat();
  }
}

function exportCurrentChat() {
  const currentChat = getCurrentChat();
  if (!currentChat || currentChat.messages.length === 0) {
    alert('No messages in the active chat to export.');
    return;
  }

  let mdContent = `# ${currentChat.title || 'Conversation'}\n\n*Exported on: ${new Date().toLocaleString()}*\n\n---\n\n`;
  currentChat.messages.forEach(msg => {
    const sender = msg.role === 'user' ? '### 👤 You' : '### ✦ Aura 3D';
    mdContent += `${sender}\n\n${msg.content}\n\n---\n\n`;
  });

  const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(currentChat.title || 'chat').replace(/[^a-zA-Z0-9]/g, '_')}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

function renderChatHistory() {
  const query = (chatSearchInput ? chatSearchInput.value : '').toLowerCase().trim();
  chatHistoryList.innerHTML = '';

  const filtered = state.chats.filter(c => {
    if (!query) return true;
    return (c.title || '').toLowerCase().includes(query) ||
      c.messages.some(m => m.content.toLowerCase().includes(query));
  });

  if (chatCountBadge) {
    chatCountBadge.textContent = state.chats.length;
  }

  if (filtered.length === 0) {
    const emptyNotice = document.createElement('div');
    emptyNotice.style.padding = '1.2rem';
    emptyNotice.style.fontSize = '0.8rem';
    emptyNotice.style.color = 'var(--text-muted)';
    emptyNotice.style.textAlign = 'center';
    emptyNotice.textContent = query ? 'No matches found' : 'No conversations yet';
    chatHistoryList.appendChild(emptyNotice);
    return;
  }

  filtered.forEach(chat => {
    const item = document.createElement('div');
    item.className = `chat-session-item ${chat.id === state.activeChatId ? 'active' : ''}`;
    item.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
      <span class="session-title">${escapeHtml(chat.title || 'Conversation')}</span>
      <button class="session-delete-btn" title="Delete conversation" onclick="deleteChat('${chat.id}', event)">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;
    item.addEventListener('click', () => switchChat(chat.id));
    chatHistoryList.appendChild(item);
  });
}

function getCurrentChat() {
  return state.chats.find(c => c.id === state.activeChatId);
}

function renderCurrentChat() {
  const currentChat = getCurrentChat();
  messagesContainer.innerHTML = '';

  if (!currentChat || currentChat.messages.length === 0) {
    welcomeScreen.style.display = 'flex';
    messagesContainer.style.display = 'none';
  } else {
    welcomeScreen.style.display = 'none';
    messagesContainer.style.display = 'flex';

    currentChat.messages.forEach(msg => {
      appendMessageToUI(msg.role, msg.content, false);
    });
    scrollToBottom();
  }
}

// ==========================================================================
// 6. Message Rendering
// ==========================================================================
function appendMessageToUI(role, content, animate = true) {
  const row = document.createElement('div');
  row.className = `message-row ${role === 'user' ? 'user-row' : 'assistant-row'}`;

  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.innerHTML = role === 'user' ? 'U' : '✦';

  const body = document.createElement('div');
  body.className = 'message-body';

  const bubble = document.createElement('div');
  bubble.className = `message-bubble ${role === 'user' ? 'liquid-glass' : ''}`;

  if (role === 'user') {
    bubble.textContent = content;
  } else {
    bubble.innerHTML = renderMarkdown(content);
  }

  body.appendChild(bubble);

  // Assistant toolbar
  if (role === 'assistant') {
    const actions = document.createElement('div');
    actions.className = 'message-actions';
    actions.innerHTML = `
      <button class="msg-action-btn" onclick="copyMessageText(${JSON.stringify(content)}, this)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        Copy
      </button>
      <button class="msg-action-btn" onclick="speakMessage(${JSON.stringify(content)}, this)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
        Listen
      </button>
    `;
    body.appendChild(actions);
  }

  row.appendChild(avatar);
  row.appendChild(body);
  messagesContainer.appendChild(row);

  return { row, bubble, body };
}

function renderMarkdown(rawText) {
  if (!rawText) return '';
  try {
    const html = marked.parse(rawText);
    return DOMPurify.sanitize(html);
  } catch (e) {
    return escapeHtml(rawText);
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function scrollToBottom() {
  chatViewport.scrollTop = chatViewport.scrollHeight;
}

// ==========================================================================
// 7. Streaming Chat Logic
// ==========================================================================
async function handleSend(promptText = null) {
  const text = (promptText || userInput.value).trim();
  if (!text || state.isStreaming) return;

  const currentChat = getCurrentChat();
  if (!currentChat) return;

  // Auto title on first prompt
  if (currentChat.messages.length === 0) {
    currentChat.title = text.length > 34 ? text.substring(0, 34) + '...' : text;
    saveChats();
  }

  // Push user message
  currentChat.messages.push({ role: 'user', content: text });
  userInput.value = '';
  autoResizeTextarea();

  // Update UI
  welcomeScreen.style.display = 'none';
  messagesContainer.style.display = 'flex';
  appendMessageToUI('user', text);
  scrollToBottom();

  // Assistant placeholder with 3D pulsing cursor
  const { row, bubble, body } = appendMessageToUI('assistant', '');
  const cursor = document.createElement('span');
  cursor.className = 'streaming-cursor';
  bubble.appendChild(cursor);

  // Set streaming state
  state.isStreaming = true;
  updateControlsState(true);
  state.abortController = new AbortController();

  let fullResponse = '';
  const selectedModel = modelSelect.value;
  const activeKey = selectedModel.startsWith('gemini') ? state.settings.geminiKey : state.settings.openaiKey;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: currentChat.messages,
        model: selectedModel,
        apiKey: activeKey,
        temperature: state.settings.temperature,
        systemPrompt: state.settings.systemPrompt
      }),
      signal: state.abortController.signal
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed === 'data: [DONE]') {
          break;
        }
        if (trimmed.startsWith('data: ')) {
          try {
            const data = JSON.parse(trimmed.slice(6));
            if (data.error) {
              fullResponse += `\n\n> ⚠️ **Error**: ${data.error}\n`;
            } else if (data.content) {
              fullResponse += data.content;
            }
            bubble.innerHTML = renderMarkdown(fullResponse);
            bubble.appendChild(cursor);
            scrollToBottom();
          } catch (err) {
            // Json parse error on chunk
          }
        }
      }
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      fullResponse += ' *(Generation stopped)*';
    } else {
      fullResponse += `\n\n> ⚠️ **Connection Error**: ${error.message}`;
    }
  } finally {
    cursor.remove();
    bubble.innerHTML = renderMarkdown(fullResponse);

    // Add action buttons
    const actions = document.createElement('div');
    actions.className = 'message-actions';
    actions.innerHTML = `
      <button class="msg-action-btn" onclick="copyMessageText(${JSON.stringify(fullResponse)}, this)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        Copy
      </button>
      <button class="msg-action-btn" onclick="speakMessage(${JSON.stringify(fullResponse)}, this)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
        Listen
      </button>
    `;
    body.appendChild(actions);

    // Save response
    currentChat.messages.push({ role: 'assistant', content: fullResponse });
    saveChats();

    state.isStreaming = false;
    state.abortController = null;
    updateControlsState(false);
    scrollToBottom();
    init3DTilt(); // Re-bind tilt to any newly generated code windows
  }
}

function updateControlsState(isStreaming) {
  sendBtn.style.display = isStreaming ? 'none' : 'flex';
  stopBtn.style.display = isStreaming ? 'flex' : 'none';
  userInput.disabled = isStreaming;
  if (!isStreaming) {
    userInput.focus();
  }
}

function stopGeneration() {
  if (state.abortController) {
    state.abortController.abort();
  }
}

function autoResizeTextarea() {
  userInput.style.height = 'auto';
  userInput.style.height = Math.min(userInput.scrollHeight, 200) + 'px';
}

// ==========================================================================
// 8. Event Listeners
// ==========================================================================
function bindEvents() {
  // Input Form
  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSend();
  });

  userInput.addEventListener('input', autoResizeTextarea);

  userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  stopBtn.addEventListener('click', stopGeneration);

  // Custom Liquid Glass Model Picker Interactions
  if (modelTriggerBtn && customModelPicker) {
    modelTriggerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      customModelPicker.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!customModelPicker.contains(e.target)) {
        customModelPicker.classList.remove('open');
      }
    });

    modelCardItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const modelId = item.getAttribute('data-model');
        const modelName = item.getAttribute('data-name');
        const modelProvider = item.getAttribute('data-provider');

        modelCardItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        if (modelSelect) modelSelect.value = modelId;
        if (currentModelName) currentModelName.textContent = modelName;
        if (currentModelProvider) currentModelProvider.textContent = modelProvider;

        localStorage.setItem('ai_selected_model', modelId);
        customModelPicker.classList.remove('open');
      });
    });
  }

  // Prompt Suggestion Cards
  document.querySelectorAll('.suggestion-card').forEach(card => {
    card.addEventListener('click', () => {
      const prompt = card.getAttribute('data-prompt');
      if (prompt) {
        handleSend(prompt);
      }
    });
  });

  // Sidebar Controls
  newChatBtn.addEventListener('click', createNewChat);
  clearAllBtn.addEventListener('click', clearAllChats);
  if (exportChatBtn) {
    exportChatBtn.addEventListener('click', exportCurrentChat);
  }

  if (chatSearchInput) {
    chatSearchInput.addEventListener('input', renderChatHistory);
  }

  openSidebarBtn.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
      sidebar.classList.toggle('open');
    } else {
      sidebar.classList.toggle('closed');
    }
  });

  closeSidebarBtn.addEventListener('click', () => {
    sidebar.classList.remove('open');
  });

  // Theme Toggle
  themeToggleBtn.addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', state.theme);
    localStorage.setItem('aura_theme', state.theme);
    updateHljsTheme(state.theme);
  });

  // Wallpaper Mode Picker
  wallpaperButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      wallpaperButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const mode = btn.getAttribute('data-wallpaper');
      state.wallpaperMode = mode;
      localStorage.setItem('aura_wallpaper', mode);
    });
  });

  // Accent Color Picker in Settings
  accentButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      accentButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const chosenAccent = btn.getAttribute('data-accent');
      state.accent = chosenAccent;
      document.documentElement.setAttribute('data-accent', chosenAccent);
      localStorage.setItem('aura_accent', chosenAccent);
      if (window.wallpaperEngine) {
        window.wallpaperEngine.createParticles();
      }
    });
  });

  // Settings Modal Controls
  const openModal = () => {
    geminiKeyInput.value = state.settings.geminiKey;
    openaiKeyInput.value = state.settings.openaiKey;
    systemPromptInput.value = state.settings.systemPrompt;
    tempInput.value = state.settings.temperature;
    tempValueDisplay.textContent = state.settings.temperature;
    settingsModal.classList.add('open');
  };

  const closeModal = () => {
    settingsModal.classList.remove('open');
  };

  navSettingsBtn.addEventListener('click', openModal);
  openSettingsBtn.addEventListener('click', openModal);
  closeSettingsBtn.addEventListener('click', closeModal);
  cancelSettingsBtn.addEventListener('click', closeModal);

  tempInput.addEventListener('input', () => {
    tempValueDisplay.textContent = tempInput.value;
  });

  saveSettingsBtn.addEventListener('click', () => {
    state.settings.geminiKey = geminiKeyInput.value.trim();
    state.settings.openaiKey = openaiKeyInput.value.trim();
    state.settings.systemPrompt = systemPromptInput.value.trim();
    state.settings.temperature = parseFloat(tempInput.value);

    localStorage.setItem('ai_gemini_key', state.settings.geminiKey);
    localStorage.setItem('ai_openai_key', state.settings.openaiKey);
    localStorage.setItem('ai_system_prompt', state.settings.systemPrompt);
    localStorage.setItem('ai_temp', state.settings.temperature.toString());

    closeModal();
  });

  // Close modal on outside click
  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
      closeModal();
    }
  });
}

// Start
window.addEventListener('DOMContentLoaded', init);
