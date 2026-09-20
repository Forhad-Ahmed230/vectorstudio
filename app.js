// Resolve the API base URL for dev vs production environments
function resolveApiUrl(path) {
  const host = window.location.host || '';
  if ((host.includes('localhost') || host.includes('127.0.0.1')) && !host.includes('8085')) {
    return `http://localhost:8085${path}`;
  }
  return path;
}

// Outfit Bold font loader for SVG text outlining
let loadedOutfitFont = null;
(function() {
  function initOutfitFont() {
    if (typeof opentype === 'undefined') {
      setTimeout(initOutfitFont, 200);
      return;
    }
    console.log('[Font-Loader] Loading outfit-latin-700-normal.woff...');
    opentype.load('/outfit-latin-700-normal.woff', function(err, font) {
      if (err) {
        console.error('[Font-Loader] Error loading font:', err);
      } else {
        loadedOutfitFont = font;
        console.log('[Font-Loader] Font loaded successfully and ready.');
      }
    });
  }
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initOutfitFont();
  } else {
    window.addEventListener('DOMContentLoaded', initOutfitFont);
  }
})();

// Loader Fade-Out and Removal Logic (helps prevent flicker on refresh)
window.removeAppInitLoader = function() {
  const loader = document.getElementById('initLoader');
  if (loader) {
    loader.style.opacity = '0';
    loader.style.visibility = 'hidden';
    setTimeout(() => {
      if (loader && loader.parentNode) {
        loader.parentNode.removeChild(loader);
      }
    }, 350);
  }
};

// Automatic fallback to guarantee loader removal even if Firebase initialization stalls
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(window.removeAppInitLoader, 800);
} else {
  window.addEventListener('DOMContentLoaded', () => setTimeout(window.removeAppInitLoader, 800));
}

// Helper to limit sheet titles strictly to 1-2 words max while filtering out conjunctions & stop words (e.g. avoiding 'CALENDAR AND')
window.formatTitleWordLimit = function(str, maxWords = 2) {
  if (!str || typeof str !== 'string') return '';
  const clean = str.trim();
  
  // Conjunctions, prepositions, and filler words
  const stopWords = new Set(['and', 'or', 'of', 'for', 'the', 'in', 'with', 'to', 'by', 'a', 'an', 'icons', 'icon', 'sheet', 'set', 'vector', 'collection', 'illustration', 'illustrations', 'design', 'management', 'pack', 'bundle']);
  const trailingConjunctions = new Set(['and', 'or', 'of', 'for', 'the', 'in', 'with', 'to', 'by', 'a', 'an', 'at', 'on', 'from', 'as']);

  const words = clean.split(/\s+/);
  
  if (words.length <= maxWords) {
    let resultWords = [...words];
    while (resultWords.length > 1 && trailingConjunctions.has(resultWords[resultWords.length - 1].toLowerCase())) {
      resultWords.pop();
    }
    return resultWords.join(' ').trim();
  }

  // Filter out stop words to find core topic words
  let meaningful = words.filter(w => !stopWords.has(w.toLowerCase()));
  if (meaningful.length === 0) {
    meaningful = words;
  }

  // If still long (3+ words), take ONLY 1st primary category word (1 word max) to ensure clean fallback
  let takeCount = (meaningful.length > 2) ? 1 : maxWords;
  let selected = meaningful.slice(0, takeCount);
  while (selected.length > 1 && trailingConjunctions.has(selected[selected.length - 1].toLowerCase())) {
    selected.pop();
  }

  return selected.join(' ').trim();
};

// Custom Modern Alert Modal Function
window.showCustomAlert = function(message, title = 'Notice', type = 'warning') {
  const modal = document.getElementById('customAlertModal');
  const iconBox = document.getElementById('customAlertIconBox');
  const titleEl = document.getElementById('customAlertTitle');
  const msgEl = document.getElementById('customAlertMessage');
  const okBtn = document.getElementById('customAlertOkBtn');
  const cancelBtn = document.getElementById('customAlertCancelBtn');
  if (!modal || !msgEl) {
    console.log('[ALERT]:', message);
    return;
  }

  titleEl.textContent = title === 'Notice' ? 'বিজ্ঞপ্তি' : title;
  msgEl.textContent = message;
  if (okBtn) okBtn.textContent = 'ঠিক আছে';
  if (cancelBtn) cancelBtn.classList.add('hidden');

  const msgLower = (typeof message === 'string') ? message.toLowerCase() : '';

  if (type === 'error' || msgLower.includes('error') || msgLower.includes('failed') || msgLower.includes('offline')) {
    iconBox.innerHTML = '❌';
    iconBox.style.background = 'rgba(239, 68, 68, 0.12)';
    iconBox.style.borderColor = 'rgba(239, 68, 68, 0.3)';
    iconBox.style.color = '#ef4444';
    if (title === 'Notice' || titleEl.textContent === 'Notice' || titleEl.textContent === 'বিজ্ঞপ্তি') titleEl.textContent = 'ত্রুটি';
  } else if (type === 'success' || msgLower.includes('success') || msgLower.includes('saved')) {
    iconBox.innerHTML = '✨';
    iconBox.style.background = 'rgba(205, 252, 82, 0.12)';
    iconBox.style.borderColor = 'rgba(205, 252, 82, 0.3)';
    iconBox.style.color = '#cdfc52';
    if (title === 'Notice' || titleEl.textContent === 'Notice' || titleEl.textContent === 'বিজ্ঞপ্তি') titleEl.textContent = 'সফল সম্পন্ন';
  } else if (type === 'info' || msgLower.includes('copied')) {
    iconBox.innerHTML = '📋';
    iconBox.style.background = 'rgba(92, 98, 236, 0.12)';
    iconBox.style.borderColor = 'rgba(92, 98, 236, 0.3)';
    iconBox.style.color = '#5c62ec';
    if (title === 'Notice' || titleEl.textContent === 'Notice' || titleEl.textContent === 'বিজ্ঞপ্তি') titleEl.textContent = 'কপি সম্পন্ন';
  } else {
    iconBox.innerHTML = '⚠️';
    iconBox.style.background = 'rgba(251, 191, 36, 0.12)';
    iconBox.style.borderColor = 'rgba(251, 191, 36, 0.3)';
    iconBox.style.color = '#fbbf24';
    if (title === 'Notice' || titleEl.textContent === 'Notice' || titleEl.textContent === 'বিজ্ঞপ্তি') titleEl.textContent = 'সতর্কতা';
  }

  modal.classList.remove('hidden');

  const closeAlert = () => {
    modal.classList.add('hidden');
    okBtn.removeEventListener('click', closeAlert);
    document.removeEventListener('keydown', handleKey);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      closeAlert();
    }
  };

  okBtn.onclick = closeAlert;
  document.addEventListener('keydown', handleKey);
};

// Custom Modern Confirm Modal Function
window.showCustomConfirm = function(message, title = 'Confirm', okLabel = 'Yes', cancelLabel = 'No', onOk = null, onCancel = null) {
  const modal = document.getElementById('customAlertModal');
  const iconBox = document.getElementById('customAlertIconBox');
  const titleEl = document.getElementById('customAlertTitle');
  const msgEl = document.getElementById('customAlertMessage');
  const okBtn = document.getElementById('customAlertOkBtn');
  const cancelBtn = document.getElementById('customAlertCancelBtn');
  
  if (!modal || !msgEl) {
    console.log('[CONFIRM]:', message);
    if (onOk) onOk();
    return;
  }

  titleEl.textContent = title;
  msgEl.textContent = message;
  okBtn.textContent = okLabel;
  
  if (cancelBtn) {
    cancelBtn.textContent = cancelLabel;
    cancelBtn.classList.remove('hidden');
  }

  iconBox.innerHTML = '⚠️';
  iconBox.style.background = 'rgba(251, 191, 36, 0.12)';
  iconBox.style.borderColor = 'rgba(251, 191, 36, 0.3)';
  iconBox.style.color = '#fbbf24';

  modal.classList.remove('hidden');

  const closeConfirm = () => {
    modal.classList.add('hidden');
    if (cancelBtn) cancelBtn.classList.add('hidden');
    okBtn.onclick = null;
    if (cancelBtn) cancelBtn.onclick = null;
  };

  okBtn.onclick = () => {
    closeConfirm();
    if (onOk) onOk();
  };

  if (cancelBtn) {
    cancelBtn.onclick = () => {
      closeConfirm();
      if (onCancel) onCancel();
    };
  }
};

// Custom Floating Toast Notification Function
window.showToast = function(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.style.cssText = `
    pointer-events: auto;
    background: rgba(22, 22, 28, 0.95);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid ${type === 'error' ? 'rgba(239, 68, 68, 0.4)' : type === 'warning' ? 'rgba(251, 191, 36, 0.4)' : 'rgba(205, 252, 82, 0.4)'};
    color: #ededf0;
    padding: 12px 20px;
    border-radius: 14px;
    font-size: 13.5px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 12px 36px rgba(0,0,0,0.6);
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    opacity: 0;
    transform: translateY(15px) scale(0.95);
    font-family: inherit;
  `;

  const icon = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : '✅';
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0) scale(1)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px) scale(0.95)';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
};

// Override window.alert to automatically use modern alerts and toasts
window.alert = function(msg) {
  if (typeof msg === 'string' && (msg.toLowerCase().includes('copied') || msg.toLowerCase().includes('successfully saved'))) {
    window.showToast(msg, 'success');
  } else {
    window.showCustomAlert(msg);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const appBody = document.getElementById('appBody');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const dashboardView = document.getElementById('dashboardView');
  const studioView = document.getElementById('studioView');
  const pageTitle = document.getElementById('pageTitle');
  const backToDashBtn = document.getElementById('backToDashBtn');

  // API Key Modal Elements
  const apiKeyModal = document.getElementById('apiKeyModal');
  const openApiKeyModal = document.getElementById('openApiKeyModal');
  const topApiKeyBtn = document.getElementById('topApiKeyBtn');
  const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
  const apiKeyInput = document.getElementById('apiKeyInput');
  const apiKeyStatusTxt = document.getElementById('apiKeyStatusTxt');

  // Tool #1 Elements
  const iconNicheInput = document.getElementById('iconNicheInput');
  const modelSelect = document.getElementById('modelSelect');
  const rowsInput = document.getElementById('rowsInput');
  const colsInput = document.getElementById('colsInput');
  const rowsVal = document.getElementById('rowsVal');
  const colsVal = document.getElementById('colsVal');
  const totalIconCount = document.getElementById('totalIconCount');
  const lineWeightSelect = document.getElementById('lineWeightSelect');
  const spacingRange = document.getElementById('spacingRange');
  const spacingVal = document.getElementById('spacingVal');
  const generatePromptBtn = document.getElementById('generatePromptBtn');
  const promptResultBox = document.getElementById('promptResultBox');
  const copyPromptBtn = document.getElementById('copyPromptBtn');
  const downloadPromptBtn = document.getElementById('downloadPromptBtn');
  const downloadPromptCsvBtn = document.getElementById('downloadPromptCsvBtn');
  const regenAllPromptsBtn = document.getElementById('regenAllPromptsBtn');
  const bulkActions = document.getElementById('bulkActions');
  const sendAllToFlowBtn = document.getElementById('sendAllToFlowBtn');

  // Tool #1 Generation Mode Toggle Elements
  let currentPromptMode = localStorage.getItem('gravity_prompt_mode') || 'remaster';
  const modeBtnFresh = document.getElementById('modeBtnFresh');
  const modeBtnRemaster = document.getElementById('modeBtnRemaster');
  const promptModeBadge = document.getElementById('promptModeBadge');
  const modeDescriptionText = document.getElementById('modeDescriptionText');

  function setPromptGenerationMode(mode) {
    currentPromptMode = (mode === 'remaster') ? 'remaster' : 'fresh';
    try {
      localStorage.setItem('gravity_prompt_mode', currentPromptMode);
    } catch (_) {}

    if (modeBtnFresh && modeBtnRemaster) {
      if (currentPromptMode === 'remaster') {
        modeBtnFresh.classList.remove('active');
        modeBtnRemaster.classList.add('active');
        if (promptModeBadge) {
          promptModeBadge.textContent = 'Item Redesign';
          promptModeBadge.style.background = 'rgba(205, 252, 82, 0.15)';
          promptModeBadge.style.color = 'var(--primary)';
        }
        if (modeDescriptionText) {
          modeDescriptionText.innerHTML = '<strong style="color: var(--primary);">🎨 Item Redesign (Remaster):</strong> রেফারেন্স ছবির আসল আইটেমগুলোই থাকবে (যেমন: টর্চলাইট, ক্যামেরা ইত্যাদি), কিন্তু সেগুলোকে সম্পূর্ণ ভিন্ন অ্যাঙ্গেল, নতুন ডিজাইন ও ইউনিক ভ্যারিয়েশনে রিমাস্টার করা হবে।';
          modeDescriptionText.style.borderColor = 'rgba(205, 252, 82, 0.3)';
          modeDescriptionText.style.background = 'rgba(205, 252, 82, 0.04)';
        }
        if (iconNicheInput) {
          iconNicheInput.placeholder = 'Enter Topics or upload reference image for Smart Item Redesign...';
        }
      } else {
        modeBtnRemaster.classList.remove('active');
        modeBtnFresh.classList.add('active');
        if (promptModeBadge) {
          promptModeBadge.textContent = 'Fresh Niche';
          promptModeBadge.style.background = 'rgba(92, 98, 236, 0.12)';
          promptModeBadge.style.color = 'var(--tertiary)';
        }
        if (modeDescriptionText) {
          modeDescriptionText.innerHTML = '<strong style="color: var(--tertiary);">🌟 Fresh Niche:</strong> ছবির নিশ বিশ্লেষণ করে একই ক্যাটাগরির সম্পূর্ণ নতুন ইউনিক আইটেম তৈরি করবে।';
          modeDescriptionText.style.borderColor = 'rgba(92, 98, 236, 0.2)';
          modeDescriptionText.style.background = 'rgba(92, 98, 236, 0.04)';
        }
        if (iconNicheInput) {
          iconNicheInput.placeholder = 'Enter Niche Topics (One per line, e.g. Technology, Cyber Security...)';
        }
      }
    }
  }

  if (modeBtnFresh) {
    modeBtnFresh.addEventListener('click', () => setPromptGenerationMode('fresh'));
  }
  if (modeBtnRemaster) {
    modeBtnRemaster.addEventListener('click', () => setPromptGenerationMode('remaster'));
  }
  setPromptGenerationMode(currentPromptMode);

  const stageHeader = document.getElementById('stageHeader');
  function updateBulkActionsDisplay() {
    const rawData = promptResultBox.dataset.generatedPrompts;
    let count = 0;
    try {
      if (rawData) count = JSON.parse(rawData).length;
    } catch (_) {}

    const promptProgressWidget = document.getElementById('promptProgressWidget');

    if (count > 0) {
      if (stageHeader) stageHeader.style.display = 'none';
      if (promptProgressWidget) promptProgressWidget.style.display = 'flex';
      if (bulkActions) bulkActions.style.display = 'flex';
      if (regenAllPromptsBtn) regenAllPromptsBtn.style.display = 'inline-flex';
    } else {
      if (stageHeader) stageHeader.style.display = 'none';
      if (promptProgressWidget) promptProgressWidget.style.display = 'none';
      if (bulkActions) bulkActions.style.display = 'none';
      if (regenAllPromptsBtn) regenAllPromptsBtn.style.display = 'none';
    }
  }
  
  const promptImgUploadBtn = document.getElementById('promptImgUploadBtn');
  const promptImgInput = document.getElementById('promptImgInput');
  const promptImgPreviewContainer = document.getElementById('promptImgPreviewContainer');
  let uploadedPromptImages = [];
  let isDraggingMarquee = false;
  // Non-Blocking Web Worker Vectorization Engine
  class VectorWorkerManager {
    constructor() {
      this.worker = null;
      this.callbacks = new Map();
      this.jobId = 0;
      this.initWorker();
    }

    initWorker() {
      try {
        if (window.Worker) {
          this.worker = new Worker('vectorWorker.js');
          this.worker.onmessage = (e) => {
            const data = e.data;
            if (data && data.id && this.callbacks.has(data.id)) {
              const { resolve, reject } = this.callbacks.get(data.id);
              this.callbacks.delete(data.id);
              if (data.status === 'SUCCESS') {
                resolve(data);
              } else {
                reject(new Error(data.error || 'Vectorization failed'));
              }
            }
          };
          this.worker.onerror = (err) => {
            console.warn('Vector Worker Error:', err);
          };
        }
      } catch (err) {
        console.warn('Vector Worker Initialization Notice:', err);
      }
    }

    vectorizeTile(imgData, width, height, options = {}) {
      return new Promise((resolve, reject) => {
        if (!this.worker) {
          // Fallback if worker not supported
          resolve({ status: 'SUCCESS', pathD: `M 0 0 L ${width} 0 L ${width} ${height} L 0 ${height} Z`, width, height });
          return;
        }

        const id = ++this.jobId;
        this.callbacks.set(id, { resolve, reject });
        this.worker.postMessage({
          type: 'VECTORIZE_TILE',
          id: id,
          imgData: imgData,
          width: width,
          height: height,
          threshold: options.threshold || 128
        });
      });
    }
  }

  window.vectorWorkerManager = new VectorWorkerManager();

  // Tool #3 Elements
  const tool3View = document.getElementById('tool3View');
  const flowProfileSelect = document.getElementById('flowProfileSelect');
  const addProfileBtn = document.getElementById('addProfileBtn');
  const flowProfileUseCheckbox = document.getElementById('flowProfileUseCheckbox');
  const connectionBadge = document.getElementById('connectionBadge');
  const btnFlowOpen = document.getElementById('btnFlowOpen');
  const btnFlowConnect = document.getElementById('btnFlowConnect');
  const btnFlowDisconnect = document.getElementById('btnFlowDisconnect');
  const connectionDetail = document.getElementById('connectionDetail');
  const flowOutputDir = document.getElementById('flowOutputDir');
  const flowImagesPerPrompt = document.getElementById('flowImagesPerPrompt');
  const flowAspectRatio = document.getElementById('flowAspectRatio');
  const flowModel = document.getElementById('flowModel');
  const txtFileInput = document.getElementById('txtFileInput');
  const flowPromptsArea = document.getElementById('flowPromptsArea');
  const btnFlowStart = document.getElementById('btnFlowStart');
  const btnFlowStop = document.getElementById('btnFlowStop');
  const btnFlowDownloadAll = document.getElementById('btnFlowDownloadAll');
  const flowRunProgress = document.getElementById('flowRunProgress');
  const flowProgressBar = document.getElementById('flowProgressBar');
  const flowProgressBarInner = document.getElementById('flowProgressBarInner');
  const flowResultGallery = document.getElementById('flowResultGallery');
  const flowEmptyState = document.getElementById('flowEmptyState');

  // Tool #2 Elements
  const tool2View = document.getElementById('tool2View');
  const bannerTitle = document.getElementById('bannerTitle');
  const bannerCountText = document.getElementById('bannerCountText');
  const bannerLeftBg = document.getElementById('bannerLeftBg');
  const bannerRightBg = document.getElementById('bannerRightBg');
  const featuredIconDropzone = document.getElementById('featuredIconDropzone');
  const featuredIconInput = document.getElementById('featuredIconInput');
  const featuredIconFileName = document.getElementById('featuredIconFileName');
  const gridIconsDropzone = document.getElementById('gridIconsDropzone');
  const gridIconsFileInput = document.getElementById('gridIconsFileInput');
  const bannerIconsCountBadge = document.getElementById('bannerIconsCountBadge');
  const btnClearBannerIcons = document.getElementById('btnClearBannerIcons');
  const btnRenderBanner = document.getElementById('btnRenderBanner');
  const btnDownloadBanner = document.getElementById('btnDownloadBanner');
  const bannerCanvas = document.getElementById('bannerCanvas');



  // Custom Animated Dropdowns Initializer
  function initCustomAnimatedSelects() {
    document.querySelectorAll('select.ctl-select').forEach(select => {
      if (!select || !select.options || select.options.length === 0) return;
      if (select.getAttribute('data-customized') === 'true') return;
      select.setAttribute('data-customized', 'true');
      select.style.display = 'none';

      const wrapper = document.createElement('div');
      wrapper.className = 'custom-select-wrapper';
      if (select.style.flex) {
        wrapper.style.flex = select.style.flex;
      }

      const trigger = document.createElement('div');
      trigger.className = 'custom-select-trigger';

      const selectedOption = select.options[select.selectedIndex] || select.options[0];
      const triggerText = document.createElement('span');
      triggerText.textContent = selectedOption ? selectedOption.text : '';

      const arrowSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      arrowSvg.setAttribute('class', 'custom-select-arrow');
      arrowSvg.setAttribute('viewBox', '0 0 24 24');
      arrowSvg.innerHTML = '<polyline points="6 9 12 15 18 9"></polyline>';

      trigger.appendChild(triggerText);
      trigger.appendChild(arrowSvg);
      wrapper.appendChild(trigger);

      const optionsContainer = document.createElement('div');
      optionsContainer.className = 'custom-select-options';

      Array.from(select.options).forEach(opt => {
        const optionDiv = document.createElement('div');
        optionDiv.className = `custom-option ${opt.selected ? 'selected' : ''}`;
        optionDiv.textContent = opt.text;
        optionDiv.dataset.value = opt.value;

        optionDiv.addEventListener('click', (e) => {
          e.stopPropagation();
          select.value = opt.value;
          select.dispatchEvent(new Event('change', { bubbles: true }));

          triggerText.textContent = opt.text;
          optionsContainer.querySelectorAll('.custom-option').forEach(el => el.classList.remove('selected'));
          optionDiv.classList.add('selected');

          wrapper.classList.remove('open');
        });

        optionsContainer.appendChild(optionDiv);
      });

      wrapper.appendChild(optionsContainer);
      if (select.parentNode) {
        select.parentNode.insertBefore(wrapper, select.nextSibling);
      }

      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.custom-select-wrapper.open').forEach(w => {
          if (w !== wrapper) w.classList.remove('open');
        });
        wrapper.classList.toggle('open');
      });

      document.addEventListener('click', () => {
        wrapper.classList.remove('open');
      });
    });
  }

  // Refresh custom animated select UI wrapper when select options change dynamically
  function updateCustomSelectUI(select) {
    if (typeof select === 'string') {
      select = document.getElementById(select);
    }
    if (!select || typeof select.removeAttribute !== 'function') return;
    const wrapper = select.nextElementSibling;
    if (wrapper && wrapper.classList.contains('custom-select-wrapper')) {
      wrapper.remove();
    }
    select.removeAttribute('data-customized');
    select.style.display = '';
    initCustomAnimatedSelects();
  }

  // Initialize Custom Select Dropdowns
  initCustomAnimatedSelects();

  // Sidebar toggle
  sidebarToggle.addEventListener('click', () => {
    appBody.classList.toggle('sidebar-collapsed');
  });

  // API Key Management (Structured Dynamic Multi-Input Rows)
  const apiKeyRowsContainer = document.getElementById('apiKeyRowsContainer');
  const addApiKeyRowBtn = document.getElementById('addApiKeyRowBtn');

  function getApiKeys() {
    const raw = localStorage.getItem('gravity_gemini_keys') || localStorage.getItem('gravity_gemini_key') || '';
    if (!raw.trim()) return [];
    return raw.split(/[\n,\s]+/).map(k => k.trim()).filter(k => k.length > 5);
  }

  function getApiKey() {
    const keys = getApiKeys();
    return keys.length > 0 ? keys[0] : '';
  }

  function createApiKeyRow(value = '') {
    const row = document.createElement('div');
    row.className = 'api-key-row';
    row.style.display = 'flex';
    row.style.gap = '8px';
    row.style.alignItems = 'center';
    
    row.innerHTML = `
      <input type="text" class="ctl-input api-key-row-input" value="${value}" placeholder="Paste Gemini API Key here (AIzaSy...)" style="font-family: monospace; font-size: 12px; flex: 1; padding: 8px 12px;" />
      <button type="button" class="btn btn-dark small remove-key-row-btn" style="padding: 6px 10px; color: #ff4d4f; border-color: rgba(255, 77, 79, 0.3);" title="Remove key">🗑️</button>
    `;

    row.querySelector('.remove-key-row-btn').addEventListener('click', () => {
      if (apiKeyRowsContainer.children.length > 1) {
        row.remove();
      } else {
        row.querySelector('.api-key-row-input').value = '';
      }
      updateKeyCountBadge();
    });

    row.querySelector('.api-key-row-input').addEventListener('input', updateKeyCountBadge);

    return row;
  }

  function updateKeyCountBadge() {
    const inputs = document.querySelectorAll('.api-key-row-input');
    let count = 0;
    inputs.forEach(inp => {
      const val = inp && inp.value ? inp.value.trim() : '';
      if (val.length > 5) count++;
    });

    const countTxt = document.getElementById('apiKeysCountTxt');
    if (count > 0) {
      if (apiKeyStatusTxt) apiKeyStatusTxt.textContent = `API Keys: ${count} Active`;
      if (topApiKeyBtn) topApiKeyBtn.textContent = `🔑 ${count} API Key${count > 1 ? 's' : ''} Configured`;
      if (countTxt) countTxt.textContent = `✓ ${count} Gemini API Key${count > 1 ? 's' : ''} loaded and active`;
    } else {
      if (apiKeyStatusTxt) apiKeyStatusTxt.textContent = 'API Keys: Not Set';
      if (topApiKeyBtn) topApiKeyBtn.textContent = '🔑 Set Gemini API Keys';
      if (countTxt) countTxt.textContent = '0 API Keys configured';
    }
  }

  function renderApiKeyRows() {
    if (!apiKeyRowsContainer) return;
    apiKeyRowsContainer.innerHTML = '';
    const keys = getApiKeys();
    
    if (keys.length === 0) {
      apiKeyRowsContainer.appendChild(createApiKeyRow(''));
    } else {
      keys.forEach(k => {
        apiKeyRowsContainer.appendChild(createApiKeyRow(k));
      });
    }
    updateKeyCountBadge();
  }

  if (addApiKeyRowBtn) {
    addApiKeyRowBtn.addEventListener('click', () => {
      const newRow = createApiKeyRow('');
      apiKeyRowsContainer.appendChild(newRow);
      const newInp = newRow.querySelector('.api-key-row-input');
      if (newInp) newInp.focus();
      updateKeyCountBadge();
    });
  }

  if (modelSelect) {
    const savedModel = localStorage.getItem('gravity_gemini_model');
    if (savedModel) modelSelect.value = savedModel;
  }

  if (openApiKeyModal) {
    openApiKeyModal.addEventListener('click', () => {
      renderApiKeyRows();
      if (modelSelect) {
        const savedModel = localStorage.getItem('gravity_gemini_model');
        if (savedModel) modelSelect.value = savedModel;
      }
      if (apiKeyModal) apiKeyModal.classList.remove('hidden');
    });
  }
  if (topApiKeyBtn) {
    topApiKeyBtn.addEventListener('click', () => {
      renderApiKeyRows();
      if (modelSelect) {
        const savedModel = localStorage.getItem('gravity_gemini_model');
        if (savedModel) modelSelect.value = savedModel;
      }
      if (apiKeyModal) apiKeyModal.classList.remove('hidden');
    });
  }
  const inToolApiKeyBtn = document.getElementById('inToolApiKeyBtn');
  if (inToolApiKeyBtn) {
    inToolApiKeyBtn.addEventListener('click', () => {
      renderApiKeyRows();
      if (modelSelect) {
        const savedModel = localStorage.getItem('gravity_gemini_model');
        if (savedModel) modelSelect.value = savedModel;
      }
      if (apiKeyModal) apiKeyModal.classList.remove('hidden');
    });
  }

  // Warning Modal button listeners
  const apiKeyWarningModal = document.getElementById('apiKeyWarningModal');
  const closeWarningBtn = document.getElementById('closeWarningBtn');
  const openConfigFromWarningBtn = document.getElementById('openConfigFromWarningBtn');

  if (closeWarningBtn && apiKeyWarningModal) {
    closeWarningBtn.addEventListener('click', () => {
      apiKeyWarningModal.classList.add('hidden');
    });
  }

  if (openConfigFromWarningBtn && apiKeyWarningModal && apiKeyModal) {
    openConfigFromWarningBtn.addEventListener('click', () => {
      apiKeyWarningModal.classList.add('hidden');
      renderApiKeyRows();
      if (modelSelect) {
        const savedModel = localStorage.getItem('gravity_gemini_model');
        if (savedModel) modelSelect.value = savedModel;
      }
      apiKeyModal.classList.remove('hidden');
    });
  }

  // How to Use Video Modal Listeners
  const howToUseBtn = document.getElementById('howToUseBtn');
  const howToUseBtn2 = document.getElementById('howToUseBtn2');
  const howToUseBtn3 = document.getElementById('howToUseBtn3');
  const howToUseModal = document.getElementById('howToUseModal');
  const btnCloseHowToUseModal = document.getElementById('btnCloseHowToUseModal');
  const howToUseVideoIframe = document.getElementById('howToUseVideoIframe');

  if (howToUseBtn && howToUseModal && howToUseVideoIframe) {
    howToUseBtn.addEventListener('click', () => {
      howToUseVideoIframe.src = 'https://drive.google.com/file/d/1ShCy_3nmg-sGMYafE48Vk6HJi5cLbIVJ/preview';
      howToUseModal.classList.remove('hidden');
    });
  }

  if (howToUseBtn2 && howToUseModal && howToUseVideoIframe) {
    howToUseBtn2.addEventListener('click', () => {
      howToUseVideoIframe.src = 'https://drive.google.com/file/d/1oBpjwX_9pXsZGXdHPKrG8cUlqogs5hHk/preview';
      howToUseModal.classList.remove('hidden');
    });
  }

  if (howToUseBtn3 && howToUseModal && howToUseVideoIframe) {
    howToUseBtn3.addEventListener('click', () => {
      howToUseVideoIframe.src = 'https://drive.google.com/file/d/13c43aZkDcomw1LYuoCD63-9yTFnVJB1P/preview';
      howToUseModal.classList.remove('hidden');
    });
  }

  const closeHowToUseModal = () => {
    if (howToUseModal) howToUseModal.classList.add('hidden');
    if (howToUseVideoIframe) howToUseVideoIframe.src = '';
  };

  if (btnCloseHowToUseModal) {
    btnCloseHowToUseModal.addEventListener('click', closeHowToUseModal);
  }

  if (howToUseModal) {
    howToUseModal.addEventListener('click', (e) => {
      if (e.target === howToUseModal) {
        closeHowToUseModal();
      }
    });
  }

  if (saveApiKeyBtn) {
    saveApiKeyBtn.addEventListener('click', () => {
      const inputs = document.querySelectorAll('.api-key-row-input');
      const keys = [];
      inputs.forEach(inp => {
        const val = inp.value.trim();
        if (val.length > 5 && !keys.includes(val)) {
          keys.push(val);
        }
      });

      if (modelSelect) {
        localStorage.setItem('gravity_gemini_model', modelSelect.value);
      }

      if (keys.length > 0) {
        localStorage.setItem('gravity_gemini_keys', keys.join('\n'));
        localStorage.setItem('gravity_gemini_key', keys[0]); // Legacy compatibility
        updateKeyCountBadge();
        if (typeof window.trackUserMetric === 'function') {
          window.trackUserMetric('apiKeys');
        }
        if (apiKeyModal) apiKeyModal.classList.add('hidden');
        alert(`Successfully saved ${keys.length} Gemini API Key${keys.length > 1 ? 's' : ''} & Default Model settings!`);
      } else {
        alert('Please enter at least one valid Gemini API Key.');
      }
    });
  }

  if (apiKeyModal) {
    apiKeyModal.addEventListener('click', (e) => {
      if (e.target === apiKeyModal) apiKeyModal.classList.add('hidden');
    });
  }

  renderApiKeyRows();

  updateKeyCountBadge();

  // Gling Light/Dark Theme Toggling
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const mobileThemeToggleBtn = document.getElementById('mobileThemeToggleBtn');
  
  function applyTheme(isDark) {
    if (isDark) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
    const txt = isDark ? '☀️ Light' : '🌙 Dark';
    if (themeToggleBtn) themeToggleBtn.textContent = txt;
    
    // Mobile Theme elements
    const mIcon = document.getElementById('mobileThemeIcon');
    const mLabel = document.getElementById('mobileThemeLabel');
    if (mIcon) mIcon.textContent = isDark ? '☀️' : '🌙';
    if (mLabel) mLabel.textContent = isDark ? 'Light Mode' : 'Dark Mode';
  }

  const currentTheme = localStorage.getItem('gravity_theme') || 'light';
  applyTheme(currentTheme === 'dark');

  const onThemeToggle = () => {
    document.documentElement.classList.toggle('dark-mode');
    const isDark = document.documentElement.classList.contains('dark-mode');
    localStorage.setItem('gravity_theme', isDark ? 'dark' : 'light');
    applyTheme(isDark);
    if (typeof window.updateUserSubscriptionUI === 'function') {
      window.updateUserSubscriptionUI();
    }
  };

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', onThemeToggle);
  }
  if (mobileThemeToggleBtn) {
    mobileThemeToggleBtn.addEventListener('click', onThemeToggle);
  }

  // Sidebar Toggling
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      document.documentElement.classList.toggle('sidebar-collapsed');
    });
  }

  // Mobile backdrop click to close sidebar
  document.addEventListener('click', (e) => {
    const isMobile = window.innerWidth <= 768;
    const isCollapsed = document.documentElement.classList.contains('sidebar-collapsed');
    if (isMobile && !isCollapsed) {
      const sidebar = document.getElementById('sidebar');
      if (sidebar && !sidebar.contains(e.target) && sidebarToggle && !sidebarToggle.contains(e.target)) {
        document.documentElement.classList.add('sidebar-collapsed');
      }
    }
  });

  // Auto-close sidebar on mobile after clicking a link
  function setupMobileLinkAutoClose() {
    document.querySelectorAll('.home-nav .nav-item').forEach(btn => {
      if (!btn.dataset.hasMobileClose) {
        btn.addEventListener('click', () => {
          if (window.innerWidth <= 768) {
            document.documentElement.classList.add('sidebar-collapsed');
          }
        });
        btn.dataset.hasMobileClose = 'true';
      }
    });
  }
  setupMobileLinkAutoClose();
  document.addEventListener('DOMContentLoaded', setupMobileLinkAutoClose);

  // Mobile Community Dropdown toggling
  const mobileCommunityBtn = document.getElementById('mobileCommunityBtn');
  const mobileCommunityDropdownMenu = document.getElementById('mobileCommunityDropdownMenu');
  if (mobileCommunityBtn && mobileCommunityDropdownMenu) {
    mobileCommunityBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = mobileCommunityDropdownMenu.style.display === 'none' || !mobileCommunityDropdownMenu.style.display;
      mobileCommunityDropdownMenu.style.display = isHidden ? 'flex' : 'none';
      const chev = mobileCommunityBtn.querySelector('.chevron');
      if (chev) {
        chev.style.transform = isHidden ? 'rotate(180deg)' : 'none';
      }
    });
  }



  // Mobile Pricing Click proxy
  const mobilePricingBtn = document.getElementById('mobilePricingBtn');
  if (mobilePricingBtn) {
    mobilePricingBtn.addEventListener('click', () => {
      const topbarPricingBtn = document.getElementById('topbarPricingBtn');
      if (topbarPricingBtn) {
        topbarPricingBtn.click();
      }
    });
  }



  // Active Nav Item Sync Helper
  function setSidebarActive(toolId) {
    document.querySelectorAll('.home-nav .nav-item').forEach(btn => {
      const navTarget = btn.getAttribute('data-nav') || btn.getAttribute('data-launch');
      if (navTarget === toolId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // Navigation & Tool Launch (Card clicks & Sidebar Nav items)
  document.querySelectorAll('[data-launch]').forEach(elem => {
    elem.addEventListener('click', (e) => {
      e.stopPropagation();
      const toolId = elem.getAttribute('data-launch');
      triggerToolLaunch(toolId);
    });
  });

  // Make entire .tool-card clickable
  document.querySelectorAll('.tool-card').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
      // Avoid double triggering if launch button clicked
      if (e.target.classList.contains('launch')) return;
      const launchBtn = card.querySelector('[data-launch]');
      if (launchBtn) {
        const toolId = launchBtn.getAttribute('data-launch');
        triggerToolLaunch(toolId);
      }
    });
  });

  // Dashboard nav button click handler
  const dashNavBtn = document.querySelector('.home-nav [data-nav="dashboard"]');
  if (dashNavBtn) {
    dashNavBtn.addEventListener('click', () => {
      navigateTo('/dashboard');
    });
  }

  function navigateTo(path) {
    if (window.location.pathname !== path) {
      history.pushState(null, '', path);
    }
    handleRouting();
  }

  function triggerToolLaunch(toolId) {
    if (toolId === 'icon-sheet-prompt') navigateTo('/promptgen');
    else if (toolId === 'google-flow-gen') navigateTo('/flowgen');
    else if (toolId === 'icon-sheet-slicer') navigateTo('/Vectorizer');
    else navigateTo('/' + toolId);
  }

  // Tool #3 Prompt Sync & Counter Logic
  const btnSyncFromTool1 = document.getElementById('btnSyncFromTool1');
  const promptCountBadge = document.getElementById('promptCountBadge');

  function getCleanPromptsFromTool1() {
    const promptElems = document.querySelectorAll('#promptResultBox .bulk-prompt-text');
    const prompts = [];
    promptElems.forEach(el => {
      let text = el.textContent || el.innerText || '';
      text = text.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();
      if (text) prompts.push(text);
    });
    return prompts;
  }

  function getCleanFlowPrompts() {
    if (!flowPromptsArea) return [];
    const text = flowPromptsArea.value.trim();
    if (!text) return [];

    return text
      .split(/\r?\n/)
      .map(p => p.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim())
      .filter(Boolean);
  }

  function updateFlowPromptCount() {
    if (!flowPromptsArea || !promptCountBadge) return;
    const prompts = getCleanFlowPrompts();
    const count = prompts.length;
    promptCountBadge.textContent = `${count} Prompt${count === 1 ? '' : 's'}`;
    if (typeof syncQueueToSidebar === 'function') {
      syncQueueToSidebar(prompts);
    }
  }

  if (flowPromptsArea) {
    flowPromptsArea.addEventListener('input', updateFlowPromptCount);
  }

  if (btnSyncFromTool1) {
    btnSyncFromTool1.addEventListener('click', () => {
      const prompts = getCleanPromptsFromTool1();
      if (prompts.length === 0) {
        alert('No prompts found in Icon Sheet Generator (Tool #1). Please generate prompts in Tool #1 first!');
        return;
      }

      if (flowPromptsArea) {
        flowPromptsArea.value = prompts.join('\n');
        updateFlowPromptCount();
        alert(`Successfully synced ${prompts.length} prompt${prompts.length > 1 ? 's' : ''} from Tool #1!`);
      }
    });
  }

  if (sendAllToFlowBtn) {
    sendAllToFlowBtn.addEventListener('click', () => {
      const prompts = getCleanPromptsFromTool1();
      if (prompts.length === 0) {
        alert('No prompts found in Icon Sheet Generator (Tool #1). Please generate prompts in Tool #1 first!');
        return;
      }

      if (flowPromptsArea) {
        flowPromptsArea.value = prompts.join('\n');
        updateFlowPromptCount();
      }
      launchTool3();
    });
  }

  const btnClearPrompts = document.getElementById('btnClearPrompts');
  if (btnClearPrompts && flowPromptsArea) {
    btnClearPrompts.addEventListener('click', () => {
      flowPromptsArea.value = '';
      updateFlowPromptCount();
    });
  }

  if (flowResultGallery) {
    flowResultGallery.addEventListener('click', (e) => {
      const copyBtn = e.target.closest('.btn-copy-prompt');
      if (copyBtn) {
        const prompt = copyBtn.getAttribute('data-prompt');
        if (prompt) {
          navigator.clipboard.writeText(prompt);
          if (typeof window.showCustomAlert === 'function') {
            window.showCustomAlert('Prompt copied to clipboard!', 'Success', 'info');
          } else {
            alert('Prompt copied to clipboard!');
          }
        }
        return;
      }

      const regenBtn = e.target.closest('.btn-regenerate-flow');
      if (regenBtn) {
        const indexAttr = regenBtn.getAttribute('data-index');
        const prompt = regenBtn.getAttribute('data-prompt');
        if (indexAttr && prompt) {
          regenerateSingleFlowItem(prompt, Number(indexAttr));
        }
        return;
      }

      const deleteBtn = e.target.closest('.btn-delete-flow-card');
      if (deleteBtn) {
        const idxAttr = deleteBtn.getAttribute('data-index');
        const idx = Number(idxAttr);

        // Find the card element and remove it
        const card = document.getElementById(`flow-card-${idx}`);
        if (card) {
          card.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => {
            card.remove();
            
            // Check if gallery is empty. If so, display empty state and reset session counters
            const activeCards = flowResultGallery.querySelectorAll('.bulk-prompt-item');
            if (activeCards.length === 0) {
              if (flowEmptyState) flowEmptyState.style.display = 'block';
              if (btnFlowDownloadAll) btnFlowDownloadAll.style.display = 'none';
              const flowProgressWidget = document.getElementById('flowProgressWidget');
              if (flowProgressWidget) flowProgressWidget.style.display = 'none';
              flowDoneCount = 0;
              flowErrorCount = 0;
              flowTotalCount = 0;
              flowPromptOffset = 0;
              currentFlowSessionImages = [];
            }
          }, 250);
        }

        // Remove from session buffer
        currentFlowSessionImages = currentFlowSessionImages.filter(img => img.index !== idx);

        // Update the progress dashboard stats
        if (flowDoneCount > 0) flowDoneCount--;
        if (flowTotalCount > 0) flowTotalCount--;
        const pending = flowTotalCount - flowDoneCount - flowErrorCount;
        updateFlowProgressState(flowDoneCount, pending, flowErrorCount, flowTotalCount);

        // If no cards left in buffer, hide Download All
        if (currentFlowSessionImages.length === 0 && btnFlowDownloadAll) {
          btnFlowDownloadAll.style.display = 'none';
        }
        return;
      }

      const imgPreview = e.target.closest('.flow-img-preview');
      if (imgPreview) {
        const imgUrl = imgPreview.getAttribute('data-img-url') || (imgPreview.querySelector('img') ? imgPreview.querySelector('img').src : null);
        if (imgUrl) {
          const lightbox = document.getElementById('promptLightboxModal');
          const lightboxImg = document.getElementById('lightboxImg');
          if (lightbox && lightboxImg) {
            lightboxImg.src = imgUrl;
            lightbox.style.display = 'flex';
          }
        }
      }
    });
  }

  // Lightbox modal close triggers
  const btnCloseLb = document.getElementById('lightboxCloseBtn');
  const lbModal = document.getElementById('promptLightboxModal');
  if (btnCloseLb && lbModal) {
    btnCloseLb.addEventListener('click', () => {
      lbModal.style.display = 'none';
    });
    lbModal.addEventListener('click', (e) => {
      if (e.target === lbModal) {
        lbModal.style.display = 'none';
      }
    });
  }


  document.querySelectorAll('.back-to-dash-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      navigateTo('/dashboard');
    });
  });

  if (backToDashBtn) {
    backToDashBtn.addEventListener('click', () => {
      navigateTo('/dashboard');
    });
  }

  function launchTool1() {
    if (window.location.pathname !== '/promptgen') {
      navigateTo('/promptgen');
      return;
    }
    if (dashboardView) dashboardView.classList.add('hidden');
    if (studioView) studioView.classList.remove('hidden');
    if (tool2View) tool2View.classList.add('hidden');
    if (tool3View) tool3View.classList.add('hidden');
    if (document.getElementById('tool4View')) document.getElementById('tool4View').classList.add('hidden');
    pageTitle.textContent = 'Icon Sheet Prompt Generator';
    appBody.classList.add('in-tool-view');
  }

  function launchTool2() {
    if (window.location.pathname !== '/bannergen') {
      navigateTo('/bannergen');
      return;
    }
    if (dashboardView) dashboardView.classList.add('hidden');
    if (studioView) studioView.classList.add('hidden');
    if (tool2View) tool2View.classList.remove('hidden');
    if (tool3View) tool3View.classList.add('hidden');
    if (document.getElementById('tool4View')) document.getElementById('tool4View').classList.add('hidden');
    pageTitle.textContent = 'Icon Pack Banner Generator';
    appBody.classList.add('in-tool-view');
    if (typeof renderBannerCanvas === 'function') renderBannerCanvas();
  }

  function launchTool3(preloadedPrompt = '') {
    if (preloadedPrompt) {
      const cleanPrompt = (preloadedPrompt || '')
        .replace(/[\r\n\t]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (cleanPrompt) {
        if (flowPromptsArea && flowPromptsArea.value.trim()) {
          flowPromptsArea.value += '\n\n' + cleanPrompt;
        } else if (flowPromptsArea) {
          flowPromptsArea.value = cleanPrompt;
        }
        if (typeof updateFlowPromptCount === 'function') {
          updateFlowPromptCount();
        }
      }
      navigateTo('/flowgen');
      return;
    }
    if (window.location.pathname !== '/flowgen') {
      navigateTo('/flowgen');
      return;
    }
    if (dashboardView) dashboardView.classList.add('hidden');
    if (studioView) studioView.classList.add('hidden');
    if (tool2View) tool2View.classList.add('hidden');
    if (document.getElementById('tool4View')) document.getElementById('tool4View').classList.add('hidden');
    if (tool3View) tool3View.classList.remove('hidden');
    pageTitle.textContent = 'Google Flow Generator';
    appBody.classList.add('in-tool-view');
    // Initialize connection to WebSocket when launching tool
    initFlowConnection();
  }

  function launchTool4() {
    if (window.location.pathname !== '/Vectorizer' && window.location.pathname !== '/vectorizer' && window.location.pathname !== '/slicer') {
      navigateTo('/Vectorizer');
      return;
    }
    if (dashboardView) dashboardView.classList.add('hidden');
    if (studioView) studioView.classList.add('hidden');
    if (tool2View) tool2View.classList.add('hidden');
    if (tool3View) tool3View.classList.add('hidden');
    const t4 = document.getElementById('tool4View');
    if (t4) t4.classList.remove('hidden');
    pageTitle.textContent = 'Icon Sheet Slicer & Vectorizer';
    appBody.classList.add('in-tool-view');
    setStudioView('tiles');
    initFlowConnection(); // Connect WebSocket immediately
  }

  // Live Grid Icon Calculator
  function updateTotalIcons(e) {
    let r = parseInt(rowsInput.value) || 1;
    let c = parseInt(colsInput.value) || 1;

    if (r * c > 100) {
      if (e && e.target === rowsInput) {
        r = Math.min(15, r);
        c = Math.floor(100 / r);
        colsInput.value = c;
      } else if (e && e.target === colsInput) {
        c = Math.min(15, c);
        r = Math.floor(100 / c);
        rowsInput.value = r;
      } else {
        r = Math.min(15, r);
        c = Math.floor(100 / r);
        colsInput.value = c;
      }
    }

    if (rowsVal) rowsVal.textContent = r.toString();
    if (colsVal) colsVal.textContent = c.toString();
    totalIconCount.textContent = (r * c).toString();
  }

  rowsInput.addEventListener('input', updateTotalIcons);
  colsInput.addEventListener('input', updateTotalIcons);

  spacingRange.addEventListener('input', () => {
    const val = parseInt(spacingRange.value);
    const labels = ['Tight Spacing', 'Compact Spacing', 'Medium Grid Spacing', 'Spacious Spacing', 'Wide Grid Spacing'];
    spacingVal.textContent = labels[val - 1] || 'Medium Grid Spacing';
  });

  // Dynamic thumbnail renderer for multiple prompt images (stacked layout)
  function renderPromptThumbnails() {
    if (!promptImgPreviewContainer) return;
    
    if (uploadedPromptImages.length === 0) {
      promptImgPreviewContainer.style.display = 'none';
      promptImgPreviewContainer.innerHTML = '';
      if (promptImgUploadBtn) promptImgUploadBtn.style.display = 'flex';
      return;
    }

    promptImgPreviewContainer.style.display = 'flex';
    
    // We render up to 3 stacked images to show preview of deck, and a badge with total count.
    const maxStack = Math.min(uploadedPromptImages.length, 3);
    let imagesHtml = '';
    for (let idx = 0; idx < maxStack; idx++) {
      const img = uploadedPromptImages[idx];
      const offsetLeft = idx * 6; // overlap offset
      const zIndex = idx + 1;
      imagesHtml += `
        <img class="prompt-thumb-img-click" data-index="${idx}" src="data:${img.mimeType};base64,${img.data}" 
             style="position: absolute; left: ${offsetLeft}px; top: 0; width: 34px; height: 34px; border-radius: 8px; object-fit: cover; border: 1px solid rgba(128,128,128,0.25); z-index: ${zIndex}; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.3);" />
      `;
    }

    const totalWidth = 34 + (maxStack - 1) * 6;

    promptImgPreviewContainer.innerHTML = `
      <div style="position: relative; width: ${totalWidth}px; height: 34px; cursor: pointer; flex-shrink: 0; margin-right: 4px;" id="promptImgStackWrapper">
        ${imagesHtml}
        <!-- Badge for total images count -->
        <span style="position: absolute; top: -6px; right: -6px; background: var(--secondary, #ff6b6b); color: #fff; font-size: 9px; font-weight: bold; border-radius: 10px; padding: 2px 6px; z-index: 20; border: 1px solid rgba(0,0,0,0.2); box-shadow: 0 2px 4px rgba(0,0,0,0.3); pointer-events: none;">
          ${uploadedPromptImages.length}
        </span>
        <!-- Single cross button to clear all -->
        <button type="button" id="clearAllPromptImgBtn" style="position: absolute; bottom: -6px; right: -6px; background: rgba(0,0,0,0.75); border: 1px solid rgba(255,255,255,0.2); color: #fff; width: 14px; height: 14px; font-size: 8px; line-height: 12px; text-align: center; cursor: pointer; padding: 0; border-radius: 50%; z-index: 20; font-weight: bold; display: flex; align-items: center; justify-content: center;">✕</button>
      </div>
    `;

    // Attach click listeners to clear all button
    const clearAllBtn = document.getElementById('clearAllPromptImgBtn');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent opening lightbox
        uploadedPromptImages = [];
        renderPromptThumbnails();
      });
    }

    // Attach click listeners to stack wrapper to open lightbox (defaults to first image index 0)
    const stackWrapper = document.getElementById('promptImgStackWrapper');
    if (stackWrapper) {
      stackWrapper.addEventListener('click', (e) => {
        if (e.target.id === 'clearAllPromptImgBtn') return; // clicked clear all button
        openLightbox(0);
      });
    }
  }

  // Lightbox index and handlers
  let currentLightboxIndex = 0;
  
  function openLightbox(index) {
    currentLightboxIndex = index;
    updateLightbox();
    const modal = document.getElementById('promptLightboxModal');
    if (modal) {
      modal.style.display = 'flex';
    }
  }
  
  function updateLightbox() {
    const imgEl = document.getElementById('lightboxImg');
    const indicatorEl = document.getElementById('lightboxIndicator');
    const stripEl = document.getElementById('lightboxThumbStrip');
    if (!imgEl || !uploadedPromptImages[currentLightboxIndex]) return;
    
    const img = uploadedPromptImages[currentLightboxIndex];
    imgEl.src = `data:${img.mimeType};base64,${img.data}`;
    if (indicatorEl) {
      indicatorEl.textContent = `${currentLightboxIndex + 1} of ${uploadedPromptImages.length}`;
    }

    // Render horizontal thumbnail strip
    if (stripEl) {
      stripEl.innerHTML = uploadedPromptImages.map((t, idx) => {
        const isActive = idx === currentLightboxIndex;
        const activeBorder = isActive ? 'border: 2px solid var(--primary, #00cb76); opacity: 1;' : 'border: 1px solid rgba(255,255,255,0.2); opacity: 0.5;';
        return `
          <div class="lightbox-strip-item" data-index="${idx}" style="width: 44px; height: 44px; border-radius: 6px; overflow: hidden; cursor: pointer; flex-shrink: 0; transition: all 0.2s; ${activeBorder}">
            <img src="data:${t.mimeType};base64,${t.data}" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
        `;
      }).join('');

      // Add click listeners to strip items to navigate
      stripEl.querySelectorAll('.lightbox-strip-item').forEach(item => {
        item.addEventListener('click', () => {
          const idx = parseInt(item.getAttribute('data-index'));
          currentLightboxIndex = idx;
          updateLightbox();
        });
      });
    }
  }
  
  // Hook up lightbox controls
  const lightboxModal = document.getElementById('promptLightboxModal');
  const lightboxCloseBtn = document.getElementById('lightboxCloseBtn');
  const lightboxPrevBtn = document.getElementById('lightboxPrevBtn');
  const lightboxNextBtn = document.getElementById('lightboxNextBtn');
  const lightboxDeleteBtn = document.getElementById('lightboxDeleteBtn');
  
  if (lightboxCloseBtn) {
    lightboxCloseBtn.addEventListener('click', () => {
      if (lightboxModal) lightboxModal.style.display = 'none';
    });
  }
  if (lightboxPrevBtn) {
    lightboxPrevBtn.addEventListener('click', () => {
      if (uploadedPromptImages.length === 0) return;
      currentLightboxIndex = (currentLightboxIndex - 1 + uploadedPromptImages.length) % uploadedPromptImages.length;
      updateLightbox();
    });
  }
  if (lightboxNextBtn) {
    lightboxNextBtn.addEventListener('click', () => {
      if (uploadedPromptImages.length === 0) return;
      currentLightboxIndex = (currentLightboxIndex + 1) % uploadedPromptImages.length;
      updateLightbox();
    });
  }
  
  if (lightboxDeleteBtn) {
    lightboxDeleteBtn.addEventListener('click', () => {
      if (uploadedPromptImages.length === 0) return;
      
      // Delete current image
      uploadedPromptImages.splice(currentLightboxIndex, 1);
      renderPromptThumbnails();

      if (uploadedPromptImages.length === 0) {
        if (lightboxModal) lightboxModal.style.display = 'none';
      } else {
        if (currentLightboxIndex >= uploadedPromptImages.length) {
          currentLightboxIndex = uploadedPromptImages.length - 1;
        }
        updateLightbox();
      }
    });
  }
  
  // Close lightbox on escape key or backdrop click
  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        lightboxModal.style.display = 'none';
      }
    });
    
    window.addEventListener('keydown', (e) => {
      if (lightboxModal.style.display !== 'flex') return;
      if (e.key === 'Escape') {
        lightboxModal.style.display = 'none';
      } else if (e.key === 'ArrowLeft') {
        lightboxPrevBtn.click();
      } else if (e.key === 'ArrowRight') {
        lightboxNextBtn.click();
      }
    });
  }

  // Image-to-Prompt upload click/change handler
  if (promptImgUploadBtn && promptImgInput) {
    promptImgUploadBtn.addEventListener('click', () => {
      promptImgInput.click();
    });

    promptImgInput.addEventListener('change', (e) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const duplicates = [];
      const validFiles = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isDuplicate = uploadedPromptImages.some(img => img.name === file.name);
        if (isDuplicate) {
          duplicates.push(file.name);
        } else {
          validFiles.push(file);
        }
      }

      if (duplicates.length > 0) {
        showGravityToast(`Duplicate skipped: ${duplicates.length === 1 ? `"${duplicates[0]}"` : `${duplicates.length} images`} already uploaded.`, 'warning');
      }

      if (validFiles.length === 0) {
        promptImgInput.value = '';
        return;
      }

      let filesLoaded = 0;
      const targetCount = validFiles.length;

      for (let i = 0; i < targetCount; i++) {
        const file = validFiles[i];
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxDim = 512;
            let w = img.width;
            let h = img.height;
            if (w > maxDim || h > maxDim) {
              if (w > h) {
                h = Math.round((h * maxDim) / w);
                w = maxDim;
              } else {
                w = Math.round((w * maxDim) / h);
                h = maxDim;
              }
            }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            const resizedBase64 = canvas.toDataURL('image/jpeg', 0.85).split(',')[1];

            uploadedPromptImages.push({
              mimeType: 'image/jpeg',
              data: resizedBase64,
              name: file.name
            });

            filesLoaded++;
            if (filesLoaded === targetCount) {
              renderPromptThumbnails();
              promptImgInput.value = ''; // Reset input to allow re-uploading same files
            }
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Request Gemini generateContent with automatic model fallback between 3.1 and 3.5
  async function fetchGeminiWithFallback(model, apiKeys, payload, isVision = false, abortSignal = undefined) {
    let keyIndex = 0;
    const getNextApiKey = () => {
      if (apiKeys.length === 0) return '';
      const key = apiKeys[keyIndex];
      keyIndex = (keyIndex + 1) % apiKeys.length;
      return key;
    };

    let activeModel = model;
    if (activeModel === 'gemini-1.5-flash') {
      activeModel = 'gemini-3.1-flash-lite';
    }
    const getFallbackModel = (m) => {
      if (m === 'gemini-3.5-flash-lite') {
        return 'gemini-3.1-flash-lite';
      }
      return 'gemini-3.5-flash-lite';
    };

    let attempts = 0;
    const maxAttempts = Math.max(3, apiKeys.length * 2);
    let lastError = null;

    while (attempts < maxAttempts) {
      const apiKey = getNextApiKey();
      if (!apiKey) {
        throw new Error('API key is empty or missing.');
      }
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: abortSignal
        });

        if (res.status === 429) {
          console.warn(`[Gemini Rate Limit] 429 received using ${activeModel}. Switching model & retrying...`);
          activeModel = getFallbackModel(activeModel);
          await new Promise(resolve => setTimeout(resolve, 1500));
          attempts++;
          continue;
        }

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error?.message || `HTTP ${res.status}`);
        }

        const data = await res.json();
        return { data, modelUsed: activeModel };
      } catch (err) {
        lastError = err;
        console.warn(`[Gemini Request Failed] Attempt ${attempts + 1} with ${activeModel} failed: ${err.message}. Retrying with fallback model...`);
        activeModel = getFallbackModel(activeModel);
        await new Promise(resolve => setTimeout(resolve, 1500));
        attempts++;
      }
    }

    throw lastError || new Error('All attempts failed.');
  }

  /**
   * Batches up to 10 images into 1 Gemini Vision API request payload.
   * Asks Gemini to return a strict JSON Array with exactly 1 object per image.
   */
  async function processImageBatch(imagesBatch, apiKey, options) {
    if (!imagesBatch || !imagesBatch.length) return [];

    const model = options.model || 'gemini-3.1-flash-lite';
    const rows = options.rows || 3;
    const cols = options.cols || 6;
    const total = options.total || (rows * cols);
    const lineWeight = options.lineWeight || 'medium vector outline';
    const spacingLabel = options.spacingLabel || 'medium uniform padding';

    const activeMode = options.mode || (typeof currentPromptMode !== 'undefined' ? currentPromptMode : 'fresh');
    const isRemaster = (activeMode === 'remaster');
    const randomSalt = Math.floor(Math.random() * 999999) + 1;
    const reqHash = `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2,7)}`;

    let systemPrompt = '';
    if (isRemaster) {
      systemPrompt = `You are a master AI art prompt engineer for Midjourney v6, DALL-E 3, and Stable Diffusion XL.
You are provided with reference image(s) in sequence.

MODE: SMART ITEM REDESIGN & REMASTER (Variation Seed #${randomSalt} | Hash: ${reqHash}):
Your core directive is to scan and IDENTIFY the EXACT inventory of real-world objects, tools, and items depicted inside the reference image, and REDESIGN & REMASTER each item into a completely fresh, creative, modern, and distinct visual interpretation with varied angles, distinct styling, and zero 1:1 duplication.

1. EXACT OBJECT INVENTORY SCANNING:
   - VISUALLY SCAN the attached reference image(s) and carefully identify the EXACT real-world objects, tools, and items present (for example: if the reference image contains a flashlight/torch, compass, magnifying glass, padlock, envelope, wrench, gear, battery, camera, briefcase, shield, etc.).
   - You MUST retain this EXACT inventory of subjects in your output icon sheet! (If the reference image has fewer items than ${total}, include all the scanned items first, and complete the remaining slots with closely related essential companion tools from that same domain).

2. SMART REDESIGN & CREATIVE RE-IMAGINING (CRITICAL - NO 1:1 VISUAL DUPLICATION):
   - ABSOLUTELY DO NOT copy the exact silhouette, shape, contour, or angle from the reference image!
   - Every single icon subject MUST be completely REDESIGNED, RE-IMAGINED, and MODIFIED into a fresh, distinct, and creative interpretation:
     * EXAMPLE: If the reference shows a flashlight/torch, DO NOT reproduce that exact flashlight! Instead, describe an entirely DIFFERENT model or style of flashlight (e.g. a sleek modern tactical LED flashlight angled dynamically at 45 degrees with knurled barrel grip and beveled head, or an industrial heavy-duty angle-head torch with side clip). It is still 100% a flashlight, but visually completely transformed!
     * VARY PERSPECTIVE & ANGLE: Freely rotate perspectives across the set (dynamic 3/4 isometric angle, front-facing view, top-down view, or side profile) so the icons look lively and completely distinct from the reference image.
     * ALTER SHAPE & PROPORTIONS: Change the body contours, button placements, curvature, and detailing while keeping the object instantly identifiable.

3. MULTI-USER DYNAMIC UNIQUENESS GUARANTEE:
   - MULTI-USER ZERO-DUPLICATION MANDATE: Thousands of users upload stock images. Even if multiple users upload the exact same reference image (e.g. the same flashlight icon set), NO TWO USERS OR RUNS MUST EVER RECEIVE THE SAME REDESIGN OR PROMPT!
   - For this specific run, inject distinct artistic styling cues (e.g. modern geometric minimalism, technical precision, chamfered bevels, or sleek streamlined contours).
   - Write rich, vivid descriptive details for every item so that when generated, each user gets a 100% unique microstock asset that never collides with anyone else.

4. STYLE DNA HARMONIZATION:
   - Match the overall stroke aesthetic (${lineWeight}) and uniform spacing (${spacingLabel}) so the entire sheet looks like a cohesive, professional vector icon pack.

5. STRICT MONOCHROME BLACK & WHITE MANDATE (CRITICAL):
   - Pure black line-art outlines on a solid pure white background ONLY.
   - Absolutely ZERO color, NO color fills, NO gradients, NO 3D rendering, NO realistic shading, NO drop shadows, NO 3D volumetric effects. Minimalist flat 2D black-and-white vector line-art ONLY.

6. STRICT ZERO GRID LINES & NO CONTAINER BOXES MANDATE (CRITICAL):
   - Clean isolated icons floating on a pure white background with ZERO grid lines, ZERO square box borders, ZERO container frames, ZERO margin boxes, ZERO dividing grid lines, and ZERO table outlines around individual icons.
   - Mandate: "Clean isolated icons on a solid pure white background with zero grid lines, zero box borders, zero square frames, zero table dividing lines, zero container margins."

7. STRICT ZERO NOUN REPETITION (NO DUPLICATE CELLS):
   - Every single grid cell must be a distinct object. Absolutely NO repeated nouns or duplicate items (e.g. no 2 flashlights, no 2 keys).

8. STRICT ZERO COPYRIGHT & TRADEMARK MANDATE:
   - Absolutely NO trademarked logos, brand names, or registered corporate symbols. 100% original royalty-free generic concepts suitable for commercial microstock contributor licensing (Adobe Stock, Freepik, Shutterstock).

9. PROMPT STRUCTURE TEMPLATE:
   - Start with: "A masterfully crafted ${rows}x${cols} vector icon sheet containing exactly ${total} uniquely redesigned, non-repeating icons re-engineered from the reference subjects, arranged in a clean, uniform grid of exactly ${rows} rows and ${cols} columns, formatted to fit a ${cols}:${rows} canvas aspect ratio, with ${spacingLabel} on a solid pure white background."
   - Sentence: "The collection showcases [list all ${total} re-engineered items with rich visual appearance details and distinct angles, naturally joined with commas and 'and'], rendered in a unified cohesive aesthetic."
   - Conclude with: "Designed with ${lineWeight}, crisp black outlines, balanced proportions, flat vector illustration style, clean isolated icons with zero grid lines, zero box frames, zero container borders, zero dividing lines, clean white space separation, no extra columns or rows, only the rows and columns specified, zero duplicate shapes, zero repeated nouns, zero minor item variations, 100% unique individual objects with no repetition, zero color, zero 3D rendering, zero shading, pure black and white line-art, high-contrast, zero trademarked logos, zero copyrighted brand symbols, 100% original royalty-free generic concepts, professional UI graphic finish."
   - Canvas-filling directive: "If the requested grid layout has a different aspect ratio than the output canvas, leave the left, right, or bottom areas as blank, empty, solid white padding. Do not inject, duplicate, or generate any extra filler icons to occupy empty space. Render exactly ${total} distinct icons in a closed grid."

CRITICAL INSTRUCTION: You MUST return ONLY a strict JSON Array containing exactly ${imagesBatch.length} objects corresponding to each image in order.
JSON schema:
[
  {
    "index": 0,
    "title": "Clean Short Topic (e.g. Redesigned Utility Icons)",
    "keywords": ["keyword1", "keyword2", "keyword3", "keyword4"],
    "prompt": "Rich, fluent master prompt describing how each of the ${total} uniquely redesigned items visually looks in pure black and white line-art without colors, 3D rendering, or trademarked logos..."
  }
]
Do not include any markdown formatting outside the json codeblock. Output valid JSON array ONLY.`;
    } else {
      systemPrompt = `You are a master AI art prompt engineer for Midjourney v6, DALL-E 3, and Stable Diffusion XL.
You are provided with reference image(s) in sequence.

PROMPT CREATIVITY & ELEGANCE DIRECTIVE (Variation Seed #${randomSalt}):
1. CONCEPT ANALYZER & STRICT NICHE ALIGNMENT FROM REFERENCE IMAGE:
   - VISUALLY ANALYZE the attached reference image(s) to accurately identify its exact industry, domain, and sub-category topic (e.g. Medical Diagnostics, E-Commerce Logistics, Creative Graphic Design, Financial Banking, Business Management & Strategy, Dental Care, etc.).
   - EVERY SINGLE ONE of the ${total} generated icons MUST strictly belong to this exact identified niche/domain family. All icons must be highly relevant, logical tools, items, actions, or symbols belonging to that exact domain. Absolutely NO hallucination or off-topic icons from unrelated domains (e.g. if the reference image is Medical, DO NOT output cooking, real estate, or general office supplies).
1b. CRITICAL UNBEATABLE REFERENCE INNOVATION DIRECTIVE (NO EXACT 1:1 REPLICATION OF VISUAL ITEMS):
   - DO NOT copy or list the exact same icon items that are visible inside the reference image (e.g. if the reference image shows compass, map, kettlebell, shield, binoculars, lightning... DO NOT describe those exact same items in your output prompt!).
   - Instead, extract the CORE DOMAIN / INDUSTRY NICHE, and BRAINSTORM A COMPLETELY FRESH, BRAND-NEW SET OF ${total} UNIQUE, COMPLEMENTARY ICON CONCEPTS IN THAT EXACT SAME INDUSTRY NICHE (e.g. briefcase with document, pie chart infographic, handshake deal, chess knight, rocket launch, calendar schedule, award trophy, growth bar chart, gear settings, etc.).
   - This ensures the generated icon sheet belongs to the EXACT SAME NICHE & VISUAL STROKE STYLE as the reference image, BUT IS A 100% FRESH, UNIQUE COLLECTION with NO 1-TO-1 DUPLICATION of the items in the reference image, preventing Adobe Stock "Similar Content" rejections!
2. GLOBAL MULTI-USER DYNAMIC UNIQUENESS GUARANTEE (Request Hash: req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2,7)}):
   - MULTI-USER ZERO-DUPLICATION MANDATE: Even if multiple users upload reference images from the same industry, this specific prompt MUST explore an entirely unique, non-overlapping visual subset of ${total} icons. Select fresh, creative, and distinct icon items so that no two users or runs ever produce identical or overlapping stock submissions.
3. STYLE DNA EXTRACTOR: Analyze the visual style DNA (stroke thickness, line weight, shape curvature, grid layout aesthetics).
4. STRICT MONOCHROME BLACK & WHITE MANDATE (CRITICAL):
   - The generated prompt MUST strictly enforce pure black and white line-art outlines.
   - Explicitly mandate: "Pure black line-art outlines on a solid pure white background. Absolutely ZERO color, NO color fills, NO gradients, NO 3D rendering, NO realistic shading, NO drop shadows, NO 3D volumetric effects. Minimalist flat 2D black-and-white vector line-art ONLY."
4b. STRICT ZERO GRID LINES & NO CONTAINER BOXES MANDATE (CRITICAL):
   - The generated prompt MUST strictly enforce clean isolated icons floating on a pure white background with ZERO grid lines, ZERO square box borders, ZERO container frames, ZERO margin boxes, ZERO dividing grid lines, and ZERO table outlines around the individual icons.
   - Mandate: "Clean isolated icons on a solid pure white background with zero grid lines, zero box borders, zero square frames, zero table dividing lines, zero container margins."
4c. CRITICAL ZERO NOUN REPETITION & NO ITEM VARIATIONS MANDATE (STRICTLY ENFORCED):
   - Every single one of the ${total} icons MUST represent an ENTIRELY DIFFERENT, DISTINCT REAL-WORLD ITEM, TOOL, ACTION, OR SYMBOL.
   - ABSOLUTELY NO NOUN REPETITION OR NEAR-DUPLICATE TWEAKS: Do NOT generate multiple variations or slight modifications of the same base object! (For example: NEVER include 2 or more ID badges, NEVER include 2 or more trash cans, NEVER include 2 or more fire extinguishers, NEVER include 2 or more sofas, NEVER include 2 or more compasses, NEVER include 2 or more keychains, NEVER include 2 or more elevators, NEVER include 2 or more medical crosses).
   - Select ${total} completely unique, non-overlapping items spanning different sub-categories of the niche so that every single icon has a 100% unique visual silhouette footprint and subject concept.
5. STRICT ZERO COPYRIGHT & TRADEMARK MANDATE (STRICTLY ENFORCED):
   - Absolutely NO trademarked logos, brand names, registered corporate symbols, or copyrighted character designs (e.g., Apple, Nike, Windows, Android, Disney, Mercedes, etc.).
   - All icons MUST strictly be 100% original, generic, universal concepts suitable for commercial microstock contributor licensing (Adobe Stock, Freepik, Shutterstock).
6. STRICT ADOBE STOCK "SIMILAR CONTENT" PREVENTION & ABSOLUTE UNIQUENESS:
   - To pass strict Adobe Stock & microstock contributor anti-duplication quality checks and prevent "Similar Content" rejections:
   - DO NOT use simple generic 1-word item descriptions (e.g. "a key", "a car", "a phone").
   - Instead, write RICH, MICRO-DETAILED visual descriptions for every icon item, specifying unique functional details, dynamic states, and varied perspective angles (front view, 3/4 isometric, top-down).
   - Ensure the user specified ${rows}x${cols} grid layout containing EXACTLY ${total} total icons has 100% UNIQUE, distinct symbols. Absolutely NO duplicate shapes, NO repeated nouns, NO minor variations of the same base item, and NO visually identical designs across the ${total} grid cells. Every grid cell must present a distinct visual silhouette footprint.
6. ELEGANT NATURAL LANGUAGE PROSE WITH VISUAL DESCRIPTIONS:
   - DO NOT write robotic or mechanical numbered lists (e.g. DO NOT write "1. smartphone, 2. laptop...").
   - EXPLAIN HOW EACH ICON LOOKS visually by adding vivid, descriptive adjectives/modifiers to every icon subject (e.g. "a sleek frameless smartphone displaying app grid, a high-tech metallic laptop with open screen, a cloud storage node emitting upload arrows...").
7. PROMPT STRUCTURE TEMPLATE:
   - Start with a compelling opening: "A masterfully crafted ${rows}x${cols} vector icon sheet containing exactly ${total} completely unique, non-repeating [niche/topic] icons arranged in a clean, uniform grid of exactly ${rows} rows and ${cols} columns, formatted to fit a ${cols}:${rows} canvas aspect ratio, with ${spacingLabel} on a solid pure white background."
   - Weave the ${total} detailed icon descriptions into a natural, flowing sentence: "The collection showcases [list all ${total} NEW unique icon subjects with vivid visual appearance details naturally joined with commas and 'and'], rendered in a unified visual aesthetic."
   - Conclude with rich monochrome & commercial directives: "Designed with ${lineWeight}, crisp black outlines, balanced proportions, flat vector illustration style, clean isolated icons with zero grid lines, zero box frames, zero container borders, zero dividing lines, clean white space separation, no extra columns or rows, only the rows and columns specified, zero duplicate shapes, zero repeated nouns, zero minor item variations, 100% unique individual objects with no repetition, zero color, zero 3D rendering, zero shading, pure black and white line-art, high-contrast, zero trademarked logos, zero copyrighted brand symbols, 100% original royalty-free generic concepts, professional UI graphic finish."
   - Append canvas-filling directive: "If the requested grid layout has a different aspect ratio than the output canvas, leave the left, right, or bottom areas as blank, empty, solid white padding. Do not inject, duplicate, or generate any extra filler icons to occupy empty space. Render exactly ${total} distinct icons in a closed grid."

CRITICAL INSTRUCTION: You MUST return ONLY a strict JSON Array containing exactly ${imagesBatch.length} objects corresponding to each image in order.
JSON schema:
[
  {
    "index": 0,
    "title": "Clean Short Topic (e.g. Technology Icons)",
    "keywords": ["keyword1", "keyword2", "keyword3", "keyword4"],
    "prompt": "Rich, fluent master prompt describing how each of the ${total} NEW unique icons visually looks in pure black and white line-art without colors, 3D rendering, or trademarked logos..."
  }
]
Do not include any markdown formatting outside the json codeblock. Output valid JSON array ONLY.`;
    }


    const parts = [{ text: systemPrompt }];
    imagesBatch.forEach((img) => {
      parts.push({
        inlineData: {
          mimeType: img.mimeType,
          data: img.data
        }
      });
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s timeout limit

    if (options.signal) {
      if (options.signal.aborted) {
        controller.abort();
      } else {
        options.signal.addEventListener('abort', () => controller.abort());
      }
    }

    let data;
    try {
      const result = await fetchGeminiWithFallback(model, [apiKey], { contents: [{ parts }] }, true, controller.signal);
      data = result.data;
      clearTimeout(timeoutId);
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('Gemini API request timed out after 90s. Please check network/API key.');
      }
      throw err;
    }
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
      if (data.error) throw new Error(`Gemini API Error: ${data.error.message}`);
      throw new Error('Invalid or empty response from Gemini API.');
    }

    let rawText = data.candidates[0].content.parts[0].text || '';
    rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();

    let jsonArray = [];
    try {
      jsonArray = JSON.parse(rawText);
    } catch (_) {
      const match = rawText.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (match) {
        try { jsonArray = JSON.parse(match[0]); } catch (__) {}
      }
    }

    if (!Array.isArray(jsonArray) || jsonArray.length === 0) {
      const cleanPrompt = rawText.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();
      return imagesBatch.map((_, idx) => ({
        index: idx,
        title: `Reference Image #${idx + 1}`,
        keywords: ['icon', 'vector'],
        prompt: cleanPrompt
      }));
    }

    return jsonArray.map((item, idx) => ({
      index: typeof item.index === 'number' ? item.index : idx,
      title: item.title || `Reference Image #${idx + 1}`,
      keywords: Array.isArray(item.keywords) ? item.keywords : ['icon', 'vector'],
      prompt: (item.prompt || '').replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim()
    }));
  }

  function createSkeletonPromptItem(hasTitle = false) {
    const el = document.createElement('div');
    el.className = 'skeleton-card';
    if (hasTitle) {
      el.innerHTML = `
        <div class="bulk-prompt-header" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 6px;">
          <div class="skeleton-pulse skeleton-title" style="margin-top: 4px;"></div>
          <div class="skeleton-btn-group" style="display: flex; gap: 6px; flex-shrink: 0;">
            <div class="skeleton-pulse skeleton-btn"></div>
            <div class="skeleton-pulse skeleton-btn"></div>
            <div class="skeleton-pulse skeleton-btn"></div>
          </div>
        </div>
        <div class="skeleton-text-block">
          <div class="skeleton-pulse skeleton-line"></div>
          <div class="skeleton-pulse skeleton-line"></div>
          <div class="skeleton-pulse skeleton-line short"></div>
        </div>
      `;
    } else {
      el.innerHTML = `
        <div class="bulk-prompt-header" style="display: flex; justify-content: flex-end; margin-bottom: 6px;">
          <div class="skeleton-btn-group" style="display: flex; gap: 6px; flex-shrink: 0;">
            <div class="skeleton-pulse skeleton-btn"></div>
            <div class="skeleton-pulse skeleton-btn"></div>
            <div class="skeleton-pulse skeleton-btn"></div>
          </div>
        </div>
        <div class="skeleton-text-block">
          <div class="skeleton-pulse skeleton-line"></div>
          <div class="skeleton-pulse skeleton-line"></div>
          <div class="skeleton-pulse skeleton-line short"></div>
        </div>
      `;
    }
    return el;
  }

  window.regenerateSinglePrompt = async function(niche, variation, imageIndex, promptItem, isImageMode, updateProgress = true) {
    const apiKeys = getApiKeys();
    if (apiKeys.length === 0) {
      updateApiKeyStatus();
      if (typeof apiKeyModal !== 'undefined') apiKeyModal.classList.remove('hidden');
      alert('Please configure your Gemini API Key(s) first to generate prompts.');
      return false;
    }

    const allowed = await window.checkAndConsumeCredit('prompts', 1, false);
    if (!allowed) return false;

    if (updateProgress) {
      const labelEl = document.getElementById('progressBarLabel');
      if (labelEl) labelEl.textContent = 'Regenerating...';
      updateProgressWidgetState(0, 1, 0, 1);
    }

    const textPre = promptItem.querySelector('.bulk-prompt-text');
    const regenBtn = promptItem.querySelector('.regen-bulk-btn');
    if (!textPre) return;

    const originalText = textPre.innerText;
    textPre.innerHTML = `<span style="display:inline-block; animation:spin 1s linear infinite; margin-right:8px;">⏳</span>Regenerating prompt...`;
    if (regenBtn) regenBtn.disabled = true;

    const model = modelSelect ? modelSelect.value : 'gemini-3.1-flash-lite';
    const rows = parseInt(rowsInput.value) || 3;
    const cols = parseInt(colsInput.value) || 6;
    const total = rows * cols;
    const lineWeight = lineWeightSelect.value;
    const spacingLabel = spacingVal.textContent;

    try {
      let generatedText = '';
      if (isImageMode && imageIndex != null && uploadedPromptImages[imageIndex]) {
        const apiKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];
        const targetImage = uploadedPromptImages[imageIndex];
        const batchResults = await processImageBatch([targetImage], apiKey, {
          rows, cols, total, lineWeight, spacingLabel, model, mode: currentPromptMode
        });
        if (batchResults && batchResults[0] && batchResults[0].prompt) {
          generatedText = batchResults[0].prompt;
        } else {
          throw new Error('API failed to return prompt.');
        }
      } else {
        const apiKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];
        const seedInt = Math.floor(Math.random() * 1000000);
        
        const textLabelSelect = document.getElementById('textLabelSelect');
        const textLabelOpt = textLabelSelect ? textLabelSelect.value : 'none';
        let textLabelInstruction = '- Strictly isolated icons ONLY with NO text, NO labels, NO typography, NO words, NO letters underneath the icon cells. In your output prompt, you MUST explicitly append the negative phrase: "no text, no labels, no typography, no words, no letters, no captions, no headers, no grid lines, no box frames, no border boxes, no dividing lines, no square containers, no table borders, no bounding boxes, no repeated nouns, no duplicate items, no similar variations of the same icon, no multiple ID badges, no multiple trash cans, no repeated object types".';
        if (textLabelOpt === 'with-text') {
          textLabelInstruction = '- Clear text label under each icon cell in clean typography. In your output prompt, you MUST explicitly append the negative phrase: "no grid lines, no box frames, no border boxes, no dividing lines, no square containers, no table borders, no bounding boxes, no repeated nouns, no duplicate items, no similar variations of the same icon, no multiple ID badges, no multiple trash cans, no repeated object types".';
        }

        let modeDirective = '';
        if (currentPromptMode === 'remaster') {
          modeDirective = `
SMART ITEM REDESIGN & REMASTER MANDATE (Seed Hash: req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2,7)}):
- Deeply inspect the core canonical objects and real-world tools typically associated with '${niche}'.
- Keep those essential canonical subjects, but REDESIGN & REMASTER each item into an avant-garde, creative, and modified interpretation!
- VARY PERSPECTIVES & STYLES: Alter perspective angles (isometric, 3/4 angle, side profile, top-down), tweak physical contours, bevels, and modern structural styling.
- ZERO 1:1 REPETITION: Every single icon item must be a distinctive redesign that looks fresh and modern compared to standard stock items.`;
        } else {
          modeDirective = `
STRICT DOMAIN & NICHE ALIGNMENT MANDATE:
- Deeply analyze the input niche/topic: '${niche}'.
- EVERY SINGLE ONE of the ${total} generated icons MUST strictly belong to this exact niche. Absolutely NO hallucination or off-topic icons from unrelated domains (e.g. if the niche is Freight Shipping / Logistics, output ONLY shipping, cargo, warehouse, and transport icons; NO medical, real estate, or general office items).`;
        }

        const systemInstruction = `You are a master AI art prompt engineer for Midjourney v6 and DALL-E 3. 
Your task is to generate a single, rich, fluent, highly detailed, production-grade icon sheet master prompt for creating a vector icon grid.
DO NOT use mechanical numbered lists (no "1. 2. 3."). Instead, write an elegant, expressive, natural prose prompt.

${modeDirective}

CRITICAL ZERO NOUN REPETITION & NO ITEM VARIATIONS MANDATE (STRICTLY ENFORCED):
- ABSOLUTE ZERO DUPLICATION OF SUBJECTS: Never include multiple variations, slight modifications, or re-drawn versions of the same base noun or item in the same grid.
- FORBIDDEN DUPLICATES: No 2 ID badges/cards (e.g. badge with lanyard vs clip badge), No 2 trash cans/recycle bins, No 2 fire extinguishers, No 2 sofas/armchairs, No 2 compasses, No 2 keys, No 2 calculators, No 2 head profiles, No 2 water bottles/glasses, No 2 boxes/packages, No 2 lamps/lights, No 2 elevators, No 2 whiteboards/clipboards.
- EACH GRID CELL MUST BE A COMPLETELY DIFFERENT OBJECT, CONCEPT, TOOL, OR ACTION. Every single one of the ${total} icons must represent a 100% distinct noun category.

CRITICAL ZERO GRID LINES & NO CONTAINER BOXES MANDATE (STRICTLY ENFORCED):
- Icons MUST float cleanly on a plain, solid white background with ZERO grid lines, ZERO square box borders, ZERO container frames, ZERO margin boxes, ZERO dividing grid lines, and ZERO table outlines around individual icons.
- NO borders or box frames surrounding the icons. The background MUST be 100% clean solid white without any grid lines or box borders dividing the icons.

STRICT ZERO COPYRIGHT & TRADEMARK MANDATE (CRITICAL):
- Absolutely NO trademarked logos, brand names, registered corporate symbols, or copyrighted character designs (e.g., Apple logo, Nike swoosh, Windows logo, Android, Disney, Mercedes, etc.).
- All icons MUST strictly be 100% original, generic, universal symbols suitable for commercial microstock contributor licensing (Adobe Stock, Freepik, Shutterstock).

STRICT ADOBE STOCK "SIMILAR CONTENT" PREVENTION & ABSOLUTE UNIQUENESS MANDATE:
- To pass Adobe Stock & microstock contributor anti-duplication quality checks and avoid "Similar Content" rejections:
- DO NOT generate simple generic 1-word item descriptions (e.g. "a key", "a car", "a phone").
- Instead, write RICH, MICRO-DETAILED visual descriptions for every single icon item, specifying unique functional details, dynamic states, and varied perspective angles (front view, 3/4 isometric, top-down).
- Ensure every single one of the ${total} icons has a distinct visual footprint, silhouette, and concept so no two icons look visually similar or repetitive across the sheet or across generations.

GLOBAL MULTI-USER DYNAMIC UNIQUENESS MANDATE (Seed Hash: req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2,7)}):
- MULTI-USER ZERO-DUPLICATION RULE: Even if another user or future request enters the exact same niche/topic ('${niche}'), this specific prompt MUST explore an entirely unique, non-overlapping visual subset of ${total} icons. Select fresh, non-obvious, highly creative, and distinct icon items so that no two users or generations ever produce duplicate or similar stock submissions.

CRITICAL MONOCHROME BLACK & WHITE MANDATE:
- Pure black line-art outlines on a solid pure white background ONLY.
- Absolutely ZERO color, NO color fills, NO gradients, NO 3D rendering, NO realistic shading, NO drop shadows, NO 3D volumetric effects. Minimalist flat 2D black-and-white vector line-art ONLY.

Requirements:
- Icon Grid: A mathematically aligned tabular array layout of exactly ${rows} rows by ${cols} columns (${total} total icons), specifically formatted to fit a ${cols}:${rows} canvas aspect ratio, with ${spacingLabel} on a solid pure white background.
- Absolute Uniqueness & Non-repetition: Every single one of the ${total} icons must be a completely unique and different concept. Absolutely NO duplicates, NO visually similar copies, NO slight variations of the same item, and NO repeated subjects. Every grid cell must be a unique individual symbol.
- Icons: Exactly ${total} distinct, creative, 100% niche-matched icons for '${niche}'. Weave all ${total} icon subjects naturally into a smooth descriptive sentence with vivid visual details.
- Slicing alignment: Every icon occupies its own distinct grid cell with clean white space padding, centered with uniform cell dimensions. Absolutely NO grid border lines, NO container boxes, NO square frames around icons.
- Canvas Filling Boundary: Margins/borders on the sides or bottom. Keep the count strictly at ${total} icons total.
- Label & Text Option: ${textLabelInstruction}
- Style & Aesthetic: ${lineWeight}, crisp black line-art, flat vector design, zero grid lines, zero box frames, zero container borders, zero dividing lines, clean white space separation, zero trademarked logos, zero copyrighted brand symbols, 100% original royalty-free generic concepts.
- Seed Modifier: ${seedInt}.

Output ONLY the final production AI prompt string ready to copy-paste. Ensure the generated prompt explicitly starts with: "A masterfully crafted ${rows}x${cols} vector icon sheet featuring EXACTLY ${total} completely unique, non-repeating ${niche} icons, arranged in a clean, uniform grid of exactly ${rows} rows and ${cols} columns, formatted to fit a ${cols}:${rows} canvas aspect ratio, with ${spacingLabel} on a solid pure white background. The collection showcases... [list of exactly ${total} unique items matching '${niche}', ensuring no duplicates or visual repetitions]... Designed with ${lineWeight}, crisp black outlines, balanced proportions, flat vector illustration style, clean isolated icons with zero grid lines, zero box frames, zero container borders, zero dividing lines, clean white space separation, zero duplicate shapes, 100% unique individual icons with no repetition, no repeated nouns, no duplicate items, no similar variations of the same icon, no multiple ID badges, no multiple trash cans, no repeated object types, zero color, zero 3D rendering, zero shading, pure black and white line-art, high-contrast, zero trademarked logos, zero copyrighted brand symbols, 100% original royalty-free generic concepts, professional UI graphic finish."`;

        const contents = [{
          parts: [{ text: systemInstruction }]
        }];

        const { data } = await fetchGeminiWithFallback(model, [apiKey], { contents });
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0].text) {
          generatedText = data.candidates[0].content.parts[0].text.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();
        } else if (data.error) {
          throw new Error(data.error.message || 'API Error');
        } else {
          throw new Error('Fallback API failure.');
        }
      }

      await window.checkAndConsumeCredit('prompts', 1, true);

      textPre.textContent = generatedText;

      let promptResults = [];
      try {
        promptResults = JSON.parse(promptResultBox.dataset.generatedPrompts || '[]');
      } catch (_) {}

      let targetIndex = -1;
      if (isImageMode) {
        targetIndex = promptResults.findIndex(p => p.imageIndex === imageIndex);
      } else {
        targetIndex = promptResults.findIndex(p => p.niche === niche && p.variation === variation);
      }

      if (targetIndex !== -1) {
        promptResults[targetIndex].promptText = generatedText;
      } else {
        promptResults.push({
          niche: niche,
          variation: variation,
          promptText: generatedText,
          imageIndex: isImageMode ? imageIndex : undefined
        });
      }
      promptResultBox.dataset.generatedPrompts = JSON.stringify(promptResults);

      if (updateProgress) {
        updateProgressWidgetState(1, 0, 0, 1);
        const labelEl = document.getElementById('progressBarLabel');
        if (labelEl) labelEl.textContent = 'Generation Completed.';
      }

      if (window.showCustomToast) window.showCustomToast('Prompt regenerated successfully!', 'success');
      return true;

    } catch (err) {
      console.error(err);
      textPre.textContent = originalText;
      alert('Failed to regenerate prompt: ' + err.message);
      if (updateProgress) {
        updateProgressWidgetState(0, 0, 1, 1);
        const labelEl = document.getElementById('progressBarLabel');
        if (labelEl) labelEl.textContent = 'Generation Completed.';
      }
      return false;
    } finally {
      if (regenBtn) regenBtn.disabled = false;
    }
  };

  let cancelPromptGeneration = false;
  let currentAbortController = null;

  let flowDoneCount = 0;
  let flowErrorCount = 0;
  let flowTotalCount = 0;
  let flowPromptOffset = 0;

  function updateFlowProgressState(done, pending, errors, total) {
    const elDone = document.getElementById('flowProgressValDone');
    const elPending = document.getElementById('flowProgressValPending');
    const elError = document.getElementById('flowProgressValError');
    const elTotal = document.getElementById('flowProgressValTotal');
    const elPercent = document.getElementById('flowProgressBarPercent');
    const elBar = document.getElementById('flowProgressBarFill');

    if (elDone) elDone.textContent = done;
    if (elPending) elPending.textContent = Math.max(0, pending);
    if (elError) elError.textContent = errors;
    if (elTotal) elTotal.textContent = total;

    const totalProcessed = done + errors;
    const percent = total > 0 ? Math.round((totalProcessed / total) * 100) : 0;
    if (elPercent) elPercent.textContent = `${percent}%`;
    if (elBar) elBar.style.width = `${percent}%`;
  }

  let currentFlowSessionImages = [];

  function downloadAllFlowSessionImages() {
    if (!currentFlowSessionImages || !currentFlowSessionImages.length) return;
    currentFlowSessionImages.forEach((img, idx) => {
      setTimeout(() => {
        try {
          const dlAnchor = document.createElement('a');
          dlAnchor.href = img.dataUrl;
          dlAnchor.download = img.fileName;
          document.body.appendChild(dlAnchor);
          dlAnchor.click();
          document.body.removeChild(dlAnchor);
        } catch (err) {
          console.error('[flow-client] Staggered download error:', err);
        }
      }, idx * 250);
    });
  }

  function updateProgressWidgetState(done, pending, errors, total) {
    const elDone = document.getElementById('progressValDone');
    const elPending = document.getElementById('progressValPending');
    const elError = document.getElementById('progressValError');
    const elTotal = document.getElementById('progressValTotal');
    const elPercent = document.getElementById('progressBarPercent');
    const elBar = document.getElementById('progressBarFill');

    if (elDone) elDone.textContent = done;
    if (elPending) elPending.textContent = pending;
    if (elError) elError.textContent = errors;
    if (elTotal) elTotal.textContent = total;

    const totalProcessed = done + errors;
    const percent = total > 0 ? Math.round((totalProcessed / total) * 100) : 0;
    if (elPercent) elPercent.textContent = `${percent}%`;
    if (elBar) elBar.style.width = `${percent}%`;
  }

  function resetGenerateBtn() {
    generatePromptBtn.classList.remove('generating', 'stopping');
    generatePromptBtn.disabled = false;
    generatePromptBtn.innerHTML = '⚡ Generate';
  }

  function showGravityToast(message, type = 'warning') {
    let container = document.querySelector('.gravity-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'gravity-toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `gravity-toast ${type}`;

    let icon = '⚠️';
    if (type === 'error') icon = '❌';
    else if (type === 'success') icon = '✅';

    toast.innerHTML = `
      <span class="gravity-toast-icon">${icon}</span>
      <span class="gravity-toast-text">${message}</span>
    `;

    container.appendChild(toast);

    // Trigger transition-in after mount
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove toast after 4s
    setTimeout(() => {
      toast.classList.remove('show');
      toast.addEventListener('transitionend', () => toast.remove());
    }, 4000);
  }

  // Generate Prompt using Gemini API
  generatePromptBtn.addEventListener('click', async () => {
    // If the button has class 'generating', clicking it means STOP
    if (generatePromptBtn.classList.contains('generating')) {
      cancelPromptGeneration = true;
      if (currentAbortController) {
        currentAbortController.abort();
      }
      generatePromptBtn.classList.remove('generating');
      generatePromptBtn.classList.add('stopping');
      generatePromptBtn.disabled = true;
      generatePromptBtn.textContent = 'Stopping...';
      const progressLabel = document.getElementById('progressBarLabel');
      if (progressLabel) progressLabel.textContent = 'Stopping generation...';
      return;
    }

    const apiKeys = getApiKeys();
    if (apiKeys.length === 0) {
      const apiKeyWarningModal = document.getElementById('apiKeyWarningModal');
      if (apiKeyWarningModal) {
        apiKeyWarningModal.classList.remove('hidden');
      } else {
        apiKeyModal.classList.remove('hidden');
      }
      return;
    }

    const nicheInputText = iconNicheInput ? iconNicheInput.value.trim() : '';
    let isImageNiches = false;
    let niches = nicheInputText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    if (niches.length === 0) {
      if (uploadedPromptImages.length > 0) {
        isImageNiches = true;
        niches = uploadedPromptImages.map((_, idx) => uploadedPromptImages.length > 1 ? `Reference Image #${idx + 1} Style` : "Reference Image Style");
      } else {
        alert('Please enter at least one niche topic or upload a reference style image.');
        return;
      }
    }

    // Check remaining credits for free users
    let maxAllowed = Infinity;
    let isPro = false;
    const userObj = firebaseAuth.currentUser;
    if (userObj && userObj.uid) {
      const logs = getUserLogs();
      const existingIndex = logs.findIndex(u => u.uid === userObj.uid || (u.email && userObj.email && u.email.toLowerCase() === userObj.email.toLowerCase()));
      if (existingIndex >= 0) {
        const u = logs[existingIndex];
        const sub = u.subscription || 'free';
        const expiry = u.subscriptionExpiry;
        if (sub === 'monthly' || sub === 'six_months') {
          if (!expiry) {
            isPro = true;
          } else {
            const expDate = new Date(expiry);
            if (expDate > new Date()) {
              isPro = true;
            }
          }
        }
        if (!isPro) {
          const todayStr = getDhakaDateString();
          if (!u.creditsDaily) {
            u.creditsDaily = { remaining: 15, lastResetDate: todayStr };
          }
          const cd = u.creditsDaily;
          if (cd.lastResetDate !== todayStr) {
            cd.remaining = 15;
            cd.lastResetDate = todayStr;
          }
          maxAllowed = cd.remaining;
        }
      }
    }

    const allowed = await window.checkAndConsumeCredit('prompts', 1, false);
    if (!allowed) return;

    // Change button to generating (Stop) state
    generatePromptBtn.textContent = '🛑 Stop Generation';
    generatePromptBtn.classList.add('generating');
    generatePromptBtn.disabled = false;

    currentAbortController = new AbortController();

    const promptsPerNicheCount = parseInt(document.getElementById('promptsPerNiche').value) || 1;
    const rows = parseInt(rowsInput.value) || 3;
    const cols = parseInt(colsInput.value) || 6;
    const total = rows * cols;
    const lineWeight = lineWeightSelect.value;
    const spacingLabel = spacingVal.textContent;
    const model = modelSelect.value;

    // Check if we are resuming from a stopped state
    let existingPrompts = [];
    try {
      existingPrompts = JSON.parse(promptResultBox.dataset.generatedPrompts || '[]');
    } catch (_) {}

    // Validate compatibility
    if (existingPrompts.length > 0) {
      let isCompatible = false;
      if (uploadedPromptImages.length > 0) {
        isCompatible = existingPrompts.every(p => p.imageIndex !== undefined && p.imageIndex < uploadedPromptImages.length);
      } else {
        isCompatible = existingPrompts.every(p => niches.includes(p.niche) && p.variation <= promptsPerNicheCount);
      }
      if (!isCompatible) {
        existingPrompts = [];
      }
    }

    const promptResults = [...existingPrompts];

    if (existingPrompts.length === 0) {
      promptResultBox.innerHTML = '';
    }

    const promptProgressWidget = document.getElementById('promptProgressWidget');
    if (promptProgressWidget) {
      promptProgressWidget.style.display = 'flex';
    }

    if (stageHeader) stageHeader.style.display = 'none';
    if (bulkActions) bulkActions.style.display = 'none';
    if (regenAllPromptsBtn) regenAllPromptsBtn.style.display = 'none';

    cancelPromptGeneration = false;

    // Reset progress widget elements
    const elDone = document.getElementById('progressValDone');
    const elPending = document.getElementById('progressValPending');
    const elError = document.getElementById('progressValError');
    const elTotal = document.getElementById('progressValTotal');
    const elPercent = document.getElementById('progressBarPercent');
    const elBar = document.getElementById('progressBarFill');
    const progressLabel = document.getElementById('progressBarLabel');
    if (elDone) elDone.textContent = '0';
    if (elPending) elPending.textContent = '0';
    if (elError) elError.textContent = '0';
    if (elTotal) elTotal.textContent = '0';
    if (elPercent) elPercent.textContent = '0%';
    if (elBar) elBar.style.width = '0%';
    if (progressLabel) progressLabel.textContent = 'Generating...';

    // Optimization: If uploadedPromptImages > 0, batch up to 3 images into 1 API payload
    if (uploadedPromptImages.length > 0) {
      // Find missing image variations
      const missingImages = [];
      for (let idx = 0; idx < uploadedPromptImages.length; idx++) {
        const img = uploadedPromptImages[idx];
        for (let j = 1; j <= promptsPerNicheCount; j++) {
          const isDone = existingPrompts.some(p => p.imageIndex === idx && p.variation === j);
          if (!isDone) {
            missingImages.push({ img, originalIndex: idx, variation: j });
          }
        }
      }

      if (missingImages.length === 0 && existingPrompts.length > 0) {
        alert('All variation prompts for these images have already been generated!');
        resetGenerateBtn();
        return;
      }

      // Limit missing variations to remaining credits
      let allowedImages = missingImages;
      let skippedImages = [];
      if (!isPro && missingImages.length > maxAllowed) {
        allowedImages = missingImages.slice(0, maxAllowed);
        skippedImages = missingImages.slice(maxAllowed);
      }

      const chunkSize = 3;
      const imageBatches = [];
      for (let b = 0; b < allowedImages.length; b += chunkSize) {
        imageBatches.push(allowedImages.slice(b, b + chunkSize));
      }

      const totalBatchCount = imageBatches.length;
      const totalCount = uploadedPromptImages.length * promptsPerNicheCount;
      let doneCount = existingPrompts.length;
      let errorCount = skippedImages.length;
      let pendingCount = allowedImages.length;

      updateProgressWidgetState(doneCount, pendingCount, errorCount, totalCount);

      const progressLabel = document.getElementById('progressBarLabel');
      if (progressLabel) progressLabel.textContent = `Batch Processing image(s): ${allowedImages.length} remaining in ${totalBatchCount} API call(s)...`;

      let nicheCard = promptResultBox.querySelector('.bulk-niche-card');
      let listContainer;
      if (nicheCard) {
        listContainer = nicheCard.querySelector('.bulk-prompt-list');
      } else {
        listContainer = document.createElement('div');
        listContainer.className = 'bulk-prompt-list';
        nicheCard = document.createElement('div');
        nicheCard.className = 'bulk-niche-card';
        nicheCard.innerHTML = `<div class="bulk-niche-title">🖼️ Reference Image Batch Prompts (${uploadedPromptImages.length} Images)</div>`;
        nicheCard.appendChild(listContainer);
        promptResultBox.appendChild(nicheCard);
      }

      // Create loading skeletons upfront for the allowed images
      const skeletonElements = {};
      allowedImages.forEach(item => {
        const skeleton = createSkeletonPromptItem(true);
        listContainer.appendChild(skeleton);
        skeletonElements[`${item.originalIndex}_${item.variation}`] = skeleton;
      });

      // Render skipped warning cards immediately
      skippedImages.forEach(item => {
        const promptItem = document.createElement('div');
        promptItem.className = 'bulk-prompt-item fade-in-up-prompt'; // Add anim
        promptItem.innerHTML = `
          <div class="bulk-prompt-header" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 6px;">
            <span style="font-weight: 700; color: #ef4444; font-size: 13px; line-height: 1.3;">⚠️ Credits Exhausted</span>
          </div>
          <pre class="bulk-prompt-text" style="color: var(--on-variant); font-style: italic;">Daily credit limit reached. Please upgrade to Pro for unlimited prompt generation!</pre>
        `;
        listContainer.appendChild(promptItem);
      });


      for (let bIdx = 0; bIdx < imageBatches.length; bIdx++) {
        if (cancelPromptGeneration) break;

        const currentBatch = imageBatches[bIdx];
        const apiKey = apiKeys[bIdx % apiKeys.length];

        if (progressLabel) progressLabel.textContent = `Processing Batch #${bIdx + 1}/${totalBatchCount} (${currentBatch.length} images)...`;

        try {
          const imagesOnly = currentBatch.map(item => item.img);
          const batchResults = await processImageBatch(imagesOnly, apiKey, {
            rows, cols, total, lineWeight, spacingLabel, model, mode: currentPromptMode,
            signal: currentAbortController ? currentAbortController.signal : null
          });

          if (cancelPromptGeneration) {
            break;
          }

          // Track the number of prompts generated in this batch
          if (typeof window.trackUserMetric === 'function' && batchResults.length > 0) {
            window.trackUserMetric('prompts', batchResults.length);
          }

          for (let itemIdx = 0; itemIdx < batchResults.length; itemIdx++) {
            const res = batchResults[itemIdx];
            const originalIdx = currentBatch[itemIdx].originalIndex;
            const variation = currentBatch[itemIdx].variation;
            const promptText = res.prompt;
            let rawTitle = (res.title || `Reference Image #${originalIdx + 1}`).trim();
            const promptTitle = rawTitle.replace(/\s*(vector\s*)?icon\s*sheet/gi, '').replace(/\s*vector/gi, '').trim() || rawTitle;
            const modeLabel = currentPromptMode === 'remaster' ? 'Remaster' : 'Var';
            const cardTitleHtml = promptsPerNicheCount > 1 ? `🖼️ ${promptTitle} (${modeLabel} #${variation})` : (currentPromptMode === 'remaster' ? `🖼️ ${promptTitle} (Redesigned)` : `🖼️ ${promptTitle}`);
            const keywords = res.keywords || [];

            promptResults.push({ niche: promptTitle, variation: variation, promptText, imageIndex: originalIdx });
            await window.checkAndConsumeCredit('prompts', 1, true); // Deduct credit per success

            const promptItem = document.createElement('div');
            promptItem.className = 'bulk-prompt-item fade-in-up-prompt'; // Add anim
            promptItem.dataset.imageIndex = originalIdx;
            promptItem.dataset.variation = variation;
            promptItem.innerHTML = `
              <div class="bulk-prompt-header" style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap;">
                <span style="font-weight: 700; color: var(--tertiary); font-size: 13px; line-height: 1.3; word-break: break-word; flex: 1 1 100%; margin-bottom: 4px;">${cardTitleHtml}</span>
                <div style="display: flex; gap: 6px; flex-shrink: 0; width: 100%; justify-content: flex-end;">
                  <button class="btn btn-dark small send-flow-btn" style="padding: 2px 8px; font-size: 11px;">☁️ Flow</button>
                  <button class="btn btn-dark small copy-bulk-btn" style="padding: 2px 8px; font-size: 11px;">📋 Copy</button>
                  <button class="btn btn-dark small regen-bulk-btn" style="padding: 2px 8px; font-size: 11px; color: var(--primary); border-color: rgba(205, 252, 82, 0.3);" title="Regenerate this prompt">🔄 Regen</button>
                  <button class="btn btn-dark small delete-prompt-btn" style="padding: 2px 8px; font-size: 11px; color: #ff4d4f; border-color: rgba(255, 77, 79, 0.3);" title="Delete this prompt">🗑️ Delete</button>
                </div>
              </div>
              ${keywords.length ? `<div style="font-size: 11px; color: var(--on-variant); margin-bottom: 6px; word-break: break-word;">🏷️ Keywords: ${keywords.join(', ')}</div>` : ''}
              <pre class="bulk-prompt-text">${promptText}</pre>
            `;

            promptItem.querySelector('.copy-bulk-btn').addEventListener('click', () => {
              navigator.clipboard.writeText(promptItem.querySelector('.bulk-prompt-text').textContent);
              alert('Prompt copied to clipboard!');
            });

            promptItem.querySelector('.send-flow-btn').addEventListener('click', () => {
              launchTool3(promptItem.querySelector('.bulk-prompt-text').textContent);
            });

            promptItem.querySelector('.regen-bulk-btn').addEventListener('click', async () => {
              await window.regenerateSinglePrompt(promptTitle, variation, originalIdx, promptItem, true);
            });

            promptItem.querySelector('.delete-prompt-btn').addEventListener('click', () => {
              promptItem.remove();
              const targetIdx = promptResults.findIndex(p => p.imageIndex === originalIdx && p.variation === variation);
              if (targetIdx !== -1) promptResults.splice(targetIdx, 1);
              promptResultBox.dataset.generatedPrompts = JSON.stringify(promptResults);
              updateBulkActionsDisplay();
            });

            // Replace skeleton in DOM
            const targetSkeleton = skeletonElements[`${originalIdx}_${variation}`];
            if (targetSkeleton) {
              targetSkeleton.replaceWith(promptItem);
              promptItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
              listContainer.appendChild(promptItem);
              promptItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            doneCount++;
            pendingCount--;
          }

          updateProgressWidgetState(doneCount, pendingCount, errorCount, totalCount);
        } catch (err) {
          console.error(`Batch #${bIdx + 1} Error:`, err);
          const batchSize = currentBatch.length;
          errorCount += batchSize;
          pendingCount -= batchSize;
          updateProgressWidgetState(doneCount, pendingCount, errorCount, totalCount);
        }
      }

      // Clean up any remaining skeletons that failed to resolve
      Object.keys(skeletonElements).forEach(key => {
        const skeleton = skeletonElements[key];
        if (skeleton && skeleton.parentNode) {
          skeleton.remove();
        }
      });

      const labelEl = document.getElementById('progressBarLabel');
      if (labelEl) {
        labelEl.textContent = cancelPromptGeneration ? 'Generation Stopped.' : 'Generation Completed.';
      }

      resetGenerateBtn();
      promptResultBox.dataset.generatedPrompts = JSON.stringify(promptResults);
      updateBulkActionsDisplay();

      // Show credit exhaust popup if they ran out of credits at the end of the batch
      if (!isPro) {
        const logs = getUserLogs();
        const existingIndex = logs.findIndex(u => u.uid === userObj.uid || (u.email && userObj.email && u.email.toLowerCase() === userObj.email.toLowerCase()));
        if (existingIndex >= 0) {
          const u = logs[existingIndex];
          if (u.creditsDaily && u.creditsDaily.remaining <= 0) {
            setTimeout(() => {
              if (window.showCustomConfirm) {
                window.showCustomConfirm(
                  `আপনার রিকোয়েস্ট অনুযায়ী প্রম্পট জেনারেশন সম্পন্ন হয়েছে। কিন্তু আপনার আজকের ফ্রি লিমিট সম্পূর্ণ শেষ হয়ে গেছে! কোনো লিমিট ছাড়াই অল প্রিমিয়াম ফিচার আনলিমিটেড ব্যবহার করতে আমাদের একটি সাবস্ক্রিপশন প্ল্যান বেছে নিন।`,
                  'দৈনিক লিমিট শেষ!',
                  'প্ল্যান দেখুন 👑',
                  'পরে করব',
                  () => {
                    window.navigateTo('/pricing');
                  }
                );
              }
            }, 600);
          }
        }
      }
      return;
    }
    // Construct generation queue
    const generationQueue = [];
    for (let i = 0; i < niches.length; i++) {
      const niche = niches[i];
      for (let j = 0; j < promptsPerNicheCount; j++) {
        const isDone = existingPrompts.some(p => p.niche === niche && p.variation === (j + 1));
        if (!isDone) {
          generationQueue.push({ nicheIndex: i, niche, variationIndex: j });
        }
      }
    }

    if (generationQueue.length === 0 && existingPrompts.length > 0) {
      alert('All prompts in this list have already been generated!');
      resetGenerateBtn();
      return;
    }

    const promises = [];
    const totalCount = niches.length * promptsPerNicheCount;
    let doneCount = existingPrompts.length;
    let errorCount = 0;
    let pendingCount = generationQueue.length;

    updateProgressWidgetState(doneCount, pendingCount, errorCount, totalCount);

    // Create all niche cards, list containers, and skeletons upfront
    const listContainers = [];
    const skeletons = []; // 2D array mapping [nicheIndex][variationIndex]

    let nichesContainer = promptResultBox.querySelector('.bulk-niches-container');
    if (!nichesContainer) {
      nichesContainer = document.createElement('div');
      nichesContainer.className = 'bulk-niches-container';
      promptResultBox.appendChild(nichesContainer);
    }

    for (let i = 0; i < niches.length; i++) {
      skeletons[i] = [];
      const niche = niches[i];
      
      let nicheCard = nichesContainer.querySelector(`#niche-card-${i}`);
      if (!nicheCard) {
        nicheCard = document.createElement('div');
        nicheCard.id = `niche-card-${i}`;
        nicheCard.className = 'bulk-niche-card';
        nicheCard.innerHTML = `
          <div class="bulk-niche-title">📂 Niche: ${niche}</div>
          <div class="bulk-prompt-list" id="niche-list-${i}"></div>
        `;
        nichesContainer.appendChild(nicheCard);
      }

      const listContainer = nicheCard.querySelector('.bulk-prompt-list');
      listContainers[i] = listContainer;

      for (let j = 0; j < promptsPerNicheCount; j++) {
        const isDone = existingPrompts.some(p => p.niche === niche && p.variation === (j + 1));
        if (isDone) {
          skeletons[i][j] = null;
        } else {
          const skeleton = createSkeletonPromptItem(false);
          listContainer.appendChild(skeleton);
          skeletons[i][j] = skeleton;
        }
      }
    }

    // Launch parallel requests for the missing niches and variations
    let creditsReserved = 0;
    for (const item of generationQueue) {
      const { nicheIndex, niche, variationIndex } = item;
      const listContainer = listContainers[nicheIndex];
      const i = nicheIndex;
      const j = variationIndex;

      const promise = (async () => {
        let attempt = 0;
        let success = false;
        let generatedText = '';

        try {
          if (cancelPromptGeneration) throw new Error('Cancelled');

          // Limit prompt creations depending on daily credit bounds
          let hasCredit = false;
          if (isPro) {
            hasCredit = true;
          } else {
            if (creditsReserved < maxAllowed) {
              creditsReserved++;
              hasCredit = true;
            }
          }

          if (!hasCredit) {
            throw new Error('Credits Exhausted');
          }

          let keyIndex = (i * promptsPerNicheCount + j) % apiKeys.length;
          const seedInt = Math.floor(Math.random() * 1000000);
          let topicsSubject = `- Icon set topics/subjects: ${niche}.`;
          if (niche.startsWith("Reference Image") && uploadedPromptImages.length > 0) {
            topicsSubject = `- Icon set topics/subjects: Visually analyze the main subjects/niche of the reference images and generate a list of related icons/terms for the grid cells.`;
          }

          const textLabelSelect = document.getElementById('textLabelSelect');
          const textLabelOpt = textLabelSelect ? textLabelSelect.value : 'none';
          let textLabelInstruction = '- Strictly isolated icons ONLY with NO text, NO labels, NO typography, NO words, NO letters underneath the icon cells. In your output prompt, you MUST explicitly append the negative phrase: "no text, no labels, no typography, no words, no letters, no captions, no headers, no grid lines, no box frames, no border boxes, no dividing lines, no square containers, no table borders, no bounding boxes, no repeated nouns, no duplicate items, no similar variations of the same icon, no multiple ID badges, no multiple trash cans, no repeated object types".';
          if (textLabelOpt === 'with-text') {
            textLabelInstruction = '- Clear text label under each icon cell in clean typography. In your output prompt, you MUST explicitly append the negative phrase: "no grid lines, no box frames, no border boxes, no dividing lines, no square containers, no table borders, no bounding boxes, no repeated nouns, no duplicate items, no similar variations of the same icon, no multiple ID badges, no multiple trash cans, no repeated object types".';
          }

          let modeDirective = '';
          if (currentPromptMode === 'remaster') {
            modeDirective = `
SMART ITEM REDESIGN & REMASTER MANDATE (Seed Hash: req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2,7)}):
- Deeply inspect the core canonical objects and real-world tools typically associated with '${niche}'.
- Keep those essential canonical subjects, but REDESIGN & REMASTER each item into an avant-garde, creative, and modified interpretation!
- VARY PERSPECTIVES & STYLES: Alter perspective angles (isometric, 3/4 angle, side profile, top-down), tweak physical contours, bevels, and modern structural styling.
- ZERO 1:1 REPETITION: Every single icon item must be a distinctive redesign that looks fresh and modern compared to standard stock items.`;
          } else {
            modeDirective = `
STRICT DOMAIN & NICHE ALIGNMENT MANDATE:
- Deeply analyze the input niche/topic or reference image domain: '${niche}'.
- EVERY SINGLE ONE of the ${total} generated icons MUST strictly belong to this exact niche. Absolutely NO hallucination or off-topic icons from unrelated domains (e.g. if the niche is Freight Shipping / Logistics, output ONLY shipping, cargo, warehouse, and transport icons; NO medical, real estate, or general office items).`;
          }

          let systemInstruction = `You are a master AI art prompt engineer for Midjourney v6 and DALL-E 3. 
Your task is to generate a single, rich, fluent, highly detailed, production-grade icon sheet master prompt for creating a vector icon grid.
DO NOT use mechanical numbered lists (no "1. 2. 3."). Instead, write an elegant, expressive, natural prose prompt.

${modeDirective}

CRITICAL ZERO NOUN REPETITION & NO ITEM VARIATIONS MANDATE (STRICTLY ENFORCED):
- ABSOLUTE ZERO DUPLICATION OF SUBJECTS: Never include multiple variations, slight modifications, or re-drawn versions of the same base noun or item in the same grid.
- FORBIDDEN DUPLICATES: No 2 ID badges/cards (e.g. badge with lanyard vs clip badge), No 2 trash cans/recycle bins, No 2 fire extinguishers, No 2 sofas/armchairs, No 2 compasses, No 2 keys, No 2 calculators, No 2 head profiles, No 2 water bottles/glasses, No 2 boxes/packages, No 2 lamps/lights, No 2 elevators, No 2 whiteboards/clipboards.
- EACH GRID CELL MUST BE A COMPLETELY DIFFERENT OBJECT, CONCEPT, TOOL, OR ACTION. Every single one of the ${total} icons must represent a 100% distinct noun category.

CRITICAL ZERO GRID LINES & NO CONTAINER BOXES MANDATE (STRICTLY ENFORCED):
- Icons MUST float cleanly on a plain, solid white background with ZERO grid lines, ZERO square box borders, ZERO container frames, ZERO margin boxes, ZERO dividing grid lines, and ZERO table outlines around individual icons.
- NO borders or box frames surrounding the icons. The background MUST be 100% clean solid white without any grid lines or box borders dividing the icons.

STRICT ZERO COPYRIGHT & TRADEMARK MANDATE (CRITICAL):
- Absolutely NO trademarked logos, brand names, registered corporate symbols, or copyrighted character designs (e.g., Apple logo, Nike swoosh, Windows logo, Android, Disney, Mercedes, etc.).
- All icons MUST strictly be 100% original, generic, universal symbols suitable for commercial microstock contributor licensing (Adobe Stock, Freepik, Shutterstock).

STRICT ADOBE STOCK "SIMILAR CONTENT" PREVENTION & ABSOLUTE UNIQUENESS MANDATE:
- To pass Adobe Stock & microstock contributor anti-duplication quality checks and avoid "Similar Content" rejections:
- DO NOT generate simple generic 1-word item descriptions (e.g. "a key", "a car", "a phone").
- Instead, write RICH, MICRO-DETAILED visual descriptions for every single icon item, specifying unique functional details, dynamic states, and varied perspective angles (front view, 3/4 isometric, top-down).
- Ensure every single one of the ${total} icons has a distinct visual footprint, silhouette, and concept so no two icons look visually similar or repetitive across the sheet or across generations.

GLOBAL MULTI-USER DYNAMIC UNIQUENESS MANDATE (Seed Hash: req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2,7)}):
- MULTI-USER ZERO-DUPLICATION RULE: Even if another user or future request enters the exact same niche/topic ('${niche}'), this specific prompt MUST explore an entirely unique, non-overlapping visual subset of ${total} icons. Select fresh, non-obvious, highly creative, and distinct icon items so that no two users or generations ever produce duplicate or similar stock submissions.

CRITICAL MONOCHROME BLACK & WHITE MANDATE:
- Pure black line-art outlines on a solid pure white background ONLY.
- Absolutely ZERO color, NO color fills, NO gradients, NO 3D rendering, NO realistic shading, NO drop shadows, NO 3D volumetric effects. Minimalist flat 2D black-and-white vector line-art ONLY.

Requirements:
- Icon Grid: A mathematically aligned tabular array layout of exactly ${rows} rows by ${cols} columns (${total} total icons), specifically formatted to fit a ${cols}:${rows} canvas aspect ratio, with ${spacingLabel} on a solid pure white background.
- Absolute Uniqueness & Non-repetition: Every single one of the ${total} icons must be a completely unique and different concept. Absolutely NO duplicates, NO visually similar copies, NO slight variations of the same item, and NO repeated subjects (e.g., do not repeat two different chairs, two test-tubes, or two key variants). Every grid cell must be a unique individual symbol.
- Icons: Exactly ${total} distinct, creative, 100% niche-matched icons for '${niche}'. Weave all ${total} icon subjects naturally into a smooth descriptive sentence with vivid visual appearance details.
- Slicing alignment: Every icon occupies its own distinct grid cell with clean white space padding, centered with uniform cell dimensions, with no extra columns or rows. Absolutely NO grid border lines, NO container boxes, NO square frames around icons.
- Canvas Filling Boundary: If the grid does not cover the entire width or height of the image canvas, allow empty white space margins/borders on the sides or bottom. Do not add any extra icons or duplicate items to fill the canvas. Keep the count strictly at ${total} icons total.
- Label & Text Option: ${textLabelInstruction}
- Style & Aesthetic: ${lineWeight}, crisp black line-art, flat vector design, zero grid lines, zero box frames, zero container borders, zero dividing lines, clean white space separation, zero color, zero 3D rendering, zero shading, high contrast, zero trademarked logos, zero copyrighted brand symbols, 100% original royalty-free generic concepts.
- Seed Modifier: ${seedInt}.

Output ONLY the final production AI prompt string ready to copy-paste. Ensure the generated prompt explicitly starts with: "A masterfully crafted ${rows}x${cols} vector icon sheet featuring EXACTLY ${total} completely unique, non-repeating ${niche} icons, arranged in a clean, uniform grid of exactly ${rows} rows and ${cols} columns, formatted to fit a ${cols}:${rows} canvas aspect ratio, with ${spacingLabel} on a solid pure white background. The collection showcases... [list of exactly ${total} unique items matching '${niche}', ensuring no duplicates or visual repetitions]... Designed with ${lineWeight}, crisp black outlines, balanced proportions, flat vector illustration style, clean isolated icons with zero grid lines, zero box frames, zero container borders, zero dividing lines, clean white space separation, zero duplicate shapes, 100% unique individual icons with no repetition, no repeated nouns, no duplicate items, no similar variations of the same icon, no multiple ID badges, no multiple trash cans, no repeated object types, zero color, zero 3D rendering, zero shading, pure black and white line-art, high-contrast, zero trademarked logos, zero copyrighted brand symbols, 100% original royalty-free generic concepts, professional UI graphic finish.". Do not include any chat formatting or quotes.`;

          const maxAttempts = Math.max(3, apiKeys.length * 2);

          while (attempt < maxAttempts && !success) {
            if (cancelPromptGeneration) throw new Error('Cancelled');
            const currentKey = apiKeys[keyIndex];
            try {
              const contents = [];
              let localizedPrompt = systemInstruction;

              if (uploadedPromptImages.length > 0) {
                const targetImages = (isImageNiches && uploadedPromptImages.length > 1) ? [uploadedPromptImages[i]] : uploadedPromptImages;
                localizedPrompt += `\n\nCRITICAL VISUAL & DOMAIN MATCHING SPECIFICATION: You must visually analyze the attached ${targetImages.length} reference style image(s). 
1. Identify the exact subject niche, domain, and industry represented in the reference image(s). Ensure all ${total} generated icons strictly belong to this same niche family!
2. NO 1:1 DUPLICATION OF REFERENCE ITEMS: DO NOT describe or list the exact same visual items visible in the reference image. Instead, generate a COMPLETELY NEW & FRESH set of ${total} unique, complementary icon concepts within that SAME industry niche (e.g. if reference shows compass/map/shield, generate briefcase/chart/handshake/rocket in the same business niche).
3. Analyze their outline/fill styles, icon densities, stroke widths, shape conventions, and visual style DNA. Synthesize these visual properties so that new image generations produce icons with matching domain relevance and style while keeping every icon concept 100% distinct and non-duplicated.`;

                const parts = [{ text: localizedPrompt }];
                targetImages.forEach(img => {
                  parts.push({
                    inlineData: {
                      mimeType: img.mimeType,
                      data: img.data
                    }
                  });
                });
                contents.push({ parts });
              } else {
                contents.push({
                  parts: [
                    { text: localizedPrompt }
                  ]
                });
              }

              const result = await fetchGeminiWithFallback(
                model, 
                [currentKey], 
                { contents }, 
                false, 
                currentAbortController ? currentAbortController.signal : undefined
              );
              if (cancelPromptGeneration) throw new Error('Cancelled');
              const data = result.data;
              if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0].text) {
                generatedText = data.candidates[0].content.parts[0].text.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();
                success = true;
                if (typeof window.trackUserMetric === 'function') {
                  window.trackUserMetric('prompts');
                }
              } else if (data.error) {
                console.warn(`Key #${keyIndex + 1} Error (${data.error.code || ''}): ${data.error.message}`);
                generatedText = `Error from Gemini API (Key #${keyIndex + 1}): ${data.error.message}`;
                keyIndex = (keyIndex + 1) % apiKeys.length;
                attempt++;
                await new Promise(r => setTimeout(r, 500));
              } else {
                generatedText = `Unknown API Error.`;
                keyIndex = (keyIndex + 1) % apiKeys.length;
                attempt++;
                await new Promise(r => setTimeout(r, 500));
              }
            } catch (err) {
              console.warn(`Network Error on Key #${keyIndex + 1}: ${err.message}`);
              generatedText = `Network Error: ${err.message}`;
              keyIndex = (keyIndex + 1) % apiKeys.length;
              attempt++;
              await new Promise(r => setTimeout(r, 500));
            }
          }

          if (cancelPromptGeneration) throw new Error('Cancelled');

          // Save result object
          promptResults.push({ niche, variation: j + 1, promptText: generatedText });
          await window.checkAndConsumeCredit('prompts', 1, true); // Deduct credit per success

          // Build individual variation item
          const promptItem = document.createElement('div');
          promptItem.className = 'bulk-prompt-item fade-in-up-prompt'; // Add anim
          promptItem.dataset.niche = niche;
          promptItem.dataset.variation = j + 1;
          const textVarLabel = currentPromptMode === 'remaster' ? 'Remaster' : 'Variation';
          promptItem.innerHTML = `
            <div class="bulk-prompt-header" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 6px;">
              <span style="font-weight: 700; color: var(--tertiary); font-size: 13px; line-height: 1.3; word-break: break-word; flex: 1;">📝 ${textVarLabel} #${j + 1}</span>
              <div style="display: flex; gap: 6px; flex-shrink: 0;">
                <button class="btn btn-dark small send-flow-btn" style="padding: 2px 8px; font-size: 11px;">☁️ Flow</button>
                <button class="btn btn-dark small copy-bulk-btn" style="padding: 2px 8px; font-size: 11px;">📋 Copy</button>
                <button class="btn btn-dark small regen-bulk-btn" style="padding: 2px 8px; font-size: 11px; color: var(--primary); border-color: rgba(205, 252, 82, 0.3);" title="Regenerate this prompt">🔄 Regen</button>
                <button class="btn btn-dark small delete-prompt-btn" style="padding: 2px 8px; font-size: 11px; color: #ff4d4f; border-color: rgba(255, 77, 79, 0.3);" title="Delete this prompt">🗑️ Delete</button>
              </div>
            </div>
            <pre class="bulk-prompt-text">${generatedText}</pre>
          `;

          promptItem.querySelector('.copy-bulk-btn').addEventListener('click', () => {
            navigator.clipboard.writeText(promptItem.querySelector('.bulk-prompt-text').textContent);
            alert('Prompt variation copied to clipboard!');
          });

          promptItem.querySelector('.send-flow-btn').addEventListener('click', () => {
            launchTool3(promptItem.querySelector('.bulk-prompt-text').textContent);
          });

          promptItem.querySelector('.regen-bulk-btn').addEventListener('click', async () => {
            await window.regenerateSinglePrompt(niche, j + 1, null, promptItem, false);
          });

          promptItem.querySelector('.delete-prompt-btn').addEventListener('click', () => {
            promptItem.remove();

            const targetIndex = promptResults.findIndex(p => p.niche === niche && p.variation === (j + 1));
            if (targetIndex !== -1) {
              promptResults.splice(targetIndex, 1);
            }

            promptResultBox.dataset.generatedPrompts = JSON.stringify(promptResults);

            if (listContainer && listContainer.children.length === 0) {
              const nicheCard = listContainer.closest('.bulk-niche-card');
              if (nicheCard) nicheCard.remove();
            }

            if (promptResults.length === 0) {
              updateBulkActionsDisplay();
              promptResultBox.innerHTML = `
                <div style="text-align: center; padding: 40px; color: rgba(255,255,255,0.4);">
                  <p style="font-size: 16px;">All generated prompts deleted.</p>
                </div>
              `;
            }
          });

          const targetSkeleton = skeletons[i] ? skeletons[i][j] : null;
          if (targetSkeleton) {
            targetSkeleton.replaceWith(promptItem);
            promptItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else if (listContainer) {
            listContainer.appendChild(promptItem);
            promptItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }

          doneCount++;
          pendingCount--;
          updateProgressWidgetState(doneCount, pendingCount, errorCount, totalCount);
        } catch (execErr) {
          const targetSkeleton = skeletons[i] ? skeletons[i][j] : null;
          if (targetSkeleton && targetSkeleton.parentNode) {
            if (execErr.message === 'Credits Exhausted') {
              const promptItem = document.createElement('div');
              promptItem.className = 'bulk-prompt-item fade-in-up-prompt';
              promptItem.innerHTML = `
                <div class="bulk-prompt-header" style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 6px;">
                  <span style="font-weight: 700; color: #ef4444; font-size: 13px; line-height: 1.3;">⚠️ Credits Exhausted</span>
                </div>
                <pre class="bulk-prompt-text" style="color: var(--on-variant); font-style: italic;">Daily credit limit reached. Please upgrade to Pro for unlimited prompt generation!</pre>
              `;
              targetSkeleton.replaceWith(promptItem);
            } else {
              targetSkeleton.remove();
            }
          }
          if (execErr.message === 'Cancelled') {
            pendingCount--;
            updateProgressWidgetState(doneCount, pendingCount, errorCount, totalCount);
          } else {
            console.error('Prompt Generation Error:', execErr);
            errorCount++;
            pendingCount--;
            updateProgressWidgetState(doneCount, pendingCount, errorCount, totalCount);
          }
        }
      })();

      promises.push(promise);
    }

    await Promise.all(promises);

    // Clean up any remaining skeletons that failed to resolve
    skeletons.forEach(nicheSkeletons => {
      nicheSkeletons.forEach(skeleton => {
        if (skeleton && skeleton.parentNode) {
          skeleton.remove();
        }
      });
    });

    const labelEl = document.getElementById('progressBarLabel');
    if (labelEl) {
      labelEl.textContent = cancelPromptGeneration ? 'Generation Stopped.' : 'Generation Completed.';
    }

    resetGenerateBtn();
    promptResultBox.dataset.generatedPrompts = JSON.stringify(promptResults);
    updateBulkActionsDisplay();

    // Show credit exhaust popup if they ran out of credits at the end of the batch
    if (!isPro) {
      const logs = getUserLogs();
      const existingIndex = logs.findIndex(u => u.uid === userObj.uid || (u.email && userObj.email && u.email.toLowerCase() === userObj.email.toLowerCase()));
      if (existingIndex >= 0) {
        const u = logs[existingIndex];
        if (u.creditsDaily && u.creditsDaily.remaining <= 0) {
          setTimeout(() => {
            if (window.showCustomConfirm) {
              window.showCustomConfirm(
                `আপনার রিকোয়েস্ট অনুযায়ী প্রম্পট জেনারেশন সম্পন্ন হয়েছে। কিন্তু আপনার আজকের ফ্রি লিমিট সম্পূর্ণ শেষ হয়ে গেছে! কোনো লিমিট ছাড়াই অল প্রিমিয়াম ফিচার আনলিমিটেড ব্যবহার করতে আমাদের একটি সাবস্ক্রিপশন প্ল্যান বেছে নিন।`,
                'দৈনিক লিমিট শেষ!',
                'প্ল্যান দেখুন 👑',
                'পরে করব',
                () => {
                  window.navigateTo('/pricing');
                }
              );
            }
          }, 600);
        }
      }
    }
  });

  // Send All to Flow Action
  if (sendAllToFlowBtn) {
    sendAllToFlowBtn.addEventListener('click', () => {
      const prompts = getCleanPromptsFromTool1();
      if (prompts.length === 0) {
        alert('No prompts found in Icon Sheet Generator (Tool #1). Please generate prompts in Tool #1 first!');
        return;
      }

      if (flowPromptsArea) {
        flowPromptsArea.value = prompts.join('\n');
        updateFlowPromptCount();
      }
      launchTool3();
    });
  }

  // Copy All Action
  copyPromptBtn.addEventListener('click', () => {
    const rawData = promptResultBox.dataset.generatedPrompts;
    if (rawData) {
      const items = JSON.parse(rawData);
      const outputText = items.map(item => `=== Niche: ${item.niche} (Variation #${item.variation}) ===\n${item.promptText}\n`).join('\n');
      navigator.clipboard.writeText(outputText);
      alert('All generated prompts copied to clipboard!');
    } else {
      alert('No prompts available to copy.');
    }
  });

  function triggerBrowserDownload(content, fileName, mimeType) {
    try {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (a.parentNode) a.parentNode.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1000);
    } catch (e) {
      console.error('Browser fallback download failed:', e);
    }
  }

  // Download All Action
  downloadPromptBtn.addEventListener('click', () => {
    const rawData = promptResultBox.dataset.generatedPrompts;
    if (rawData) {
      const items = JSON.parse(rawData);
      const outputText = items.map(item => `=== Niche: ${item.niche} (Variation #${item.variation}) ===\n${item.promptText}\n`).join('\n');
      
      // Delegate save to local server file system (Electron Save As Dialog)
      if (flowSocket && flowSocket.readyState === WebSocket.OPEN) {
        sendFlowActionSpecific('save-text-file', 'default', {
          fileName: 'bulk-icon-prompts.txt',
          fileContent: outputText,
          filters: [
            { name: 'Text Files', extensions: ['txt'] },
            { name: 'All Files', extensions: ['*'] }
          ]
        });
      } else {
        // Fallback to browser blob download
        triggerBrowserDownload(outputText, 'bulk-icon-prompts.txt', 'text/plain;charset=utf-8;');
      }
    } else {
      alert('No prompts available to download.');
    }
  });

  // Download CSV Action
  if (downloadPromptCsvBtn) {
    downloadPromptCsvBtn.addEventListener('click', () => {
      const rawData = promptResultBox.dataset.generatedPrompts;
      if (rawData) {
        const items = JSON.parse(rawData);
        
        // CSV Header with UTF-8 BOM
        let csvContent = "\uFEFFNiche,Variation,Prompt\n";
        
        // CSV Rows
        items.forEach(item => {
          const nicheStr = String(item.niche || '');
          const varStr = String(item.variation || '');
          const promptStr = String(item.promptText || '');

          const escapedNiche = `"${nicheStr.replace(/"/g, '""')}"`;
          const escapedVariation = `"${varStr.replace(/"/g, '""')}"`;
          const escapedPrompt = `"${promptStr.replace(/"/g, '""')}"`;
          csvContent += `${escapedNiche},${escapedVariation},${escapedPrompt}\n`;
        });
        
        // Delegate save to local server file system (Electron Save As Dialog)
        if (flowSocket && flowSocket.readyState === WebSocket.OPEN) {
          sendFlowActionSpecific('save-text-file', 'default', {
            fileName: 'bulk-icon-prompts.csv',
            fileContent: csvContent,
            filters: [
              { name: 'CSV Files', extensions: ['csv'] },
              { name: 'All Files', extensions: ['*'] }
            ]
          });
        } else {
          // Fallback to browser blob download
          triggerBrowserDownload(csvContent, 'bulk-icon-prompts.csv', 'text/csv;charset=utf-8;');
        }
      } else {
        alert('No prompts available to download.');
      }
    });
  }

  // Regen All Action
  if (regenAllPromptsBtn) {
    regenAllPromptsBtn.addEventListener('click', async () => {
      const rawData = promptResultBox.dataset.generatedPrompts;
      if (!rawData) {
        alert('No prompts available to regenerate.');
        return;
      }

      const items = JSON.parse(rawData);
      if (items.length === 0) {
        alert('No prompts available to regenerate.');
        return;
      }
      const processRegen = async () => {
        regenAllPromptsBtn.disabled = true;
        const originalText = regenAllPromptsBtn.textContent;
        regenAllPromptsBtn.textContent = '🔄 Regenerating...';

        const labelEl = document.getElementById('progressBarLabel');
        if (labelEl) labelEl.textContent = 'Regenerating all...';
        updateProgressWidgetState(0, items.length, 0, items.length);

        let doneCount = 0;
        let errorCount = 0;

        try {
          for (let i = 0; i < items.length; i++) {
            const item = items[i];
            let querySelector = '';
            let isImageMode = false;
            if (item.imageIndex !== undefined) {
              querySelector = `.bulk-prompt-item[data-image-index="${item.imageIndex}"][data-variation="${item.variation}"]`;
              isImageMode = true;
            } else {
              querySelector = `.bulk-prompt-item[data-niche="${item.niche}"][data-variation="${item.variation}"]`;
              isImageMode = false;
            }
            const cardEl = promptResultBox.querySelector(querySelector);
            if (cardEl) {
              const success = await window.regenerateSinglePrompt(item.niche, item.variation, item.imageIndex, cardEl, isImageMode, false);
              if (success) {
                doneCount++;
              } else {
                errorCount++;
              }
              updateProgressWidgetState(doneCount, items.length - doneCount - errorCount, errorCount, items.length);
            }
          }
        } catch (err) {
          console.error(err);
        } finally {
          regenAllPromptsBtn.disabled = false;
          regenAllPromptsBtn.textContent = originalText;
          if (labelEl) labelEl.textContent = 'Generation Completed.';
        }
      };

      if (window.showCustomConfirm) {
        window.showCustomConfirm(
          `আপনি কি নিশ্চিত যে আপনি সবগুলো (${items.length}টি) প্রম্পট রি-জেনারেট করতে চান? এতে আপনার ${items.length} ক্রেডিট খরচ হবে।`,
          'প্রম্পট রি-জেনারেশন নিশ্চিতকরণ',
          'হ্যাঁ, রি-জেনারেট করুন',
          'না, থাক',
          processRegen
        );
      } else {
        const confirmRegen = confirm(`Are you sure you want to regenerate all ${items.length} prompts? This will consume ${items.length} credits.`);
        if (confirmRegen) {
          await processRegen();
        }
      }
    });
  }

  // ==========================================
  // Tool #3 Google Flow Generator Connection Client
  // ==========================================
  let flowSocket = null;
  let flowProfilesCached = [];
  const flowMessageQueue = [];

  // --- Chrome Extension Integration ---
  let flowExtensionId = localStorage.getItem('flow_extension_id') || 'mphomofodghejiaebailloadoeenpnee';
  const sidebarExtensionIds = [
    localStorage.getItem('sidebar_extension_id') || 'nfbkkhclpddbpeidpdpdmbbobhfgldkd',
    'kigfnbikcdlhchphcljbdpgbpdplobhb', // dev backup 1
    'jdfkndpifckgimphkhlmgeigpeidlkch'  // dev backup 2
  ];

  function syncQueueToSidebar(queueArray) {
    if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage) return;
    sidebarExtensionIds.forEach(extId => {
      try {
        chrome.runtime.sendMessage(extId, {
          action: 'sync_queue',
          queue: queueArray
        }, response => {
          if (!chrome.runtime.lastError && response && response.ok) {
            console.log('[flow-client] Synced queue to sidebar extension:', extId);
          }
        });
      } catch(e) {}
    });
  }
  let extensionDetected = false;
  let extensionRunAborted = false;
  let activeResolveCallback = null;

  // Window bridge for automatic extension ID discovery on any computer without manual ID copy
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'GRAVITY_EXTENSION_PONG') {
      if (event.data.ok && event.data.extensionId) {
        const incomingType = event.data.extensionType || 'saas_direct';
        const currentType = localStorage.getItem('flow_extension_type') || '';
        
        // Always prioritize the direct SaaS generation extension over the sidepanel automator
        if (incomingType === 'saas_direct' || currentType !== 'saas_direct') {
          flowExtensionId = event.data.extensionId;
          localStorage.setItem('flow_extension_id', flowExtensionId);
          localStorage.setItem('flow_extension_type', incomingType);
          console.log('[flow-client] Auto-detected extension via window bridge! ID:', flowExtensionId, 'Type:', incomingType);
          extensionDetected = true;
          addExtensionProfileOption(true);
        }
      }
    }
  });

  function checkExtension() {
    // 1. Post message to content script bridge (works instantly on every user's PC)
    window.postMessage({ type: 'GRAVITY_EXTENSION_PING' }, '*');

    // 2. Direct chrome runtime ping fallback
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage && flowExtensionId) {
      try {
        console.log('[flow-client] Pinging extension ID:', flowExtensionId);
        chrome.runtime.sendMessage(flowExtensionId, { action: 'ping' }, response => {
          if (chrome.runtime.lastError) {
            console.log('[flow-client] Chrome Extension check error:', chrome.runtime.lastError.message);
            // Try backup development ID
            const backupId = 'jdfkndpifckgimphkhlmgeigpeidlkch';
            if (flowExtensionId !== backupId) {
              chrome.runtime.sendMessage(backupId, { action: 'ping' }, backupResp => {
                if (!chrome.runtime.lastError && backupResp && backupResp.ok) {
                  console.log('[flow-client] Chrome Extension found using backup ID:', backupId);
                  flowExtensionId = backupId;
                  localStorage.setItem('flow_extension_id', backupId);
                  extensionDetected = true;
                  addExtensionProfileOption(true);
                }
              });
            }
          } else if (response && response.ok) {
            console.log('[flow-client] Chrome Extension responded OK!');
            extensionDetected = true;
            addExtensionProfileOption(true);
          }
        });
      } catch (err) {
        console.warn('[flow-client] Chrome Extension check exception:', err);
      }
    }
  }

  function addExtensionProfileOption(connected = true) {
    let extProfile = flowProfilesCached.find(p => p.id === 'chrome_extension');
    if (!extProfile) {
      extProfile = {
        id: 'chrome_extension',
        label: 'Chrome Extension (SaaS Direct)',
        port: 'Extension',
        connected: connected,
        browserRunning: connected,
        hasTokens: connected,
        projectId: 'Discovered'
      };
      flowProfilesCached = flowProfilesCached.filter(p => p.id !== 'chrome_extension');
      flowProfilesCached.push(extProfile);
    } else {
      extProfile.connected = connected;
      extProfile.browserRunning = connected;
      extProfile.hasTokens = connected;
    }
    populateProfileDropdown(flowProfilesCached);
    flowProfileSelect.value = 'chrome_extension';
    updateActiveProfileCard();

    // Auto-close connection warning modal if it was open and connection is active
    if (connected) {
      const connAlert = document.getElementById('flowConnectionAlertModal');
      if (connAlert) {
        connAlert.classList.add('hidden');
      }
    }
  }

  function detectMimeFromBase64(b64) {
    if (!b64 || typeof b64 !== 'string') return null;
    const clean = b64.replace(/^data:[^,]+,/, '').trim();
    if (clean.startsWith('iVBORw0KGgo')) return 'image/png';
    if (clean.startsWith('/9j/')) return 'image/jpeg';
    if (clean.startsWith('UklGR')) return 'image/webp';
    if (clean.startsWith('R0lGOD')) return 'image/gif';
    if (clean.startsWith('PHN2Zy') || clean.startsWith('PD94bWw')) return 'image/svg+xml';
    return null;
  }

  function normalizeDataUrl(input, fallbackMime = 'image/png') {
    if (!input || typeof input !== 'string') return '';
    const str = input.trim();
    if (str.startsWith('data:')) {
      const commaIdx = str.indexOf(',');
      if (commaIdx !== -1) {
        const b64Data = str.substring(commaIdx + 1);
        const detected = detectMimeFromBase64(b64Data);
        if (detected) {
          return `data:${detected};base64,${b64Data}`;
        }
        return str;
      }
      return str;
    }
    const detected = detectMimeFromBase64(str) || fallbackMime;
    return `data:${detected};base64,${str}`;
  }

  function sendExtensionGenerate(prompt, options) {
    return new Promise((resolve) => {
      activeResolveCallback = resolve;
      if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage) {
        activeResolveCallback = null;
        resolve({ ok: false, error: 'Chrome extension API is not available on this browser/page.' });
        return;
      }
      const timeoutId = setTimeout(() => {
        activeResolveCallback = null;
        resolve({ ok: false, error: 'Google Flow generation timed out waiting for the extension. Please ensure the Google Flow tab is open, active, and responsive.' });
      }, 95000);

      chrome.runtime.sendMessage(flowExtensionId, {
        action: 'generate',
        prompt: prompt,
        options: options
      }, response => {
        clearTimeout(timeoutId);
        activeResolveCallback = null;
        if (chrome.runtime.lastError) {
          resolve({ ok: false, error: 'Extension connection error: ' + chrome.runtime.lastError.message });
        } else {
          resolve(response);
        }
      });
    });
  }

  function cleanupStoppedCards(startP, startI, totalPrompts, imagesPerPrompt) {
    for (let p = startP; p < totalPrompts; p++) {
      const initI = (p === startP) ? startI : 0;
      for (let i = initI; i < imagesPerPrompt; i++) {
        const cardIndex = (p * 100) + i;
        handleFlowServerMessage({
          type: 'flow-item',
          index: cardIndex,
          status: 'error',
          error: 'Stopped'
        });
      }
    }
  }

  async function runExtensionFlowGeneration(prompts, imgCount, options) {
    extensionRunAborted = false;
    let completedCount = flowDoneCount;
    const startPromptOffset = flowPromptOffset;
    handleFlowServerMessage({ type: 'flow-progress', completed: completedCount, total: flowTotalCount });

    for (let pIdx = 0; pIdx < prompts.length; pIdx++) {
      const promptText = prompts[pIdx];

      for (let iIdx = 0; iIdx < imgCount; iIdx++) {
        if (extensionRunAborted) {
          cleanupStoppedCards(startPromptOffset + pIdx, iIdx, startPromptOffset + prompts.length, imgCount);
          return;
        }

        const cardIndex = ((startPromptOffset + pIdx) * 100) + iIdx;
        handleFlowServerMessage({
          type: 'flow-item',
          index: cardIndex,
          status: 'processing'
        });

        try {
          const response = await sendExtensionGenerate(promptText, options);
          if (extensionRunAborted) {
            cleanupStoppedCards(startPromptOffset + pIdx, iIdx, startPromptOffset + prompts.length, imgCount);
            return;
          }

          if (response && response.ok && response.media && response.media.length > 0) {
            await window.checkAndConsumeCredit('flowImages', 1, true);
            const mediaItem = response.media[0];
            let dataUrl = '';
            if (mediaItem.encodedImage && mediaItem.encodedImage.length > 500) {
              dataUrl = normalizeDataUrl(mediaItem.encodedImage);
            }
            if (!dataUrl && mediaItem.url && !mediaItem.url.startsWith('blob:')) {
              dataUrl = mediaItem.url;
            }
            handleFlowServerMessage({
              type: 'flow-item',
              index: cardIndex,
              status: 'done',
              dataUrl: dataUrl,
              seed: options.seed || Math.floor(Math.random() * 2147483648),
              model: options.model,
              prompt: promptText
            });
          } else {
            const errDetail = response && response.error;
            const helpfulMsg = errDetail || 'Google Flow returned no image. Please ensure your Google Flow tab (flow.google.com) is open, signed in with remaining quota, and the Gravity Flow Extension is active.';
            throw new Error(helpfulMsg);
          }
        } catch (err) {
          if (extensionRunAborted) {
            cleanupStoppedCards(startPromptOffset + pIdx, iIdx, startPromptOffset + prompts.length, imgCount);
            return;
          }
          handleFlowServerMessage({
            type: 'flow-item',
            index: cardIndex,
            status: 'error',
            error: err.message || String(err),
            prompt: promptText
          });
        }

        completedCount++;
        handleFlowServerMessage({
          type: 'flow-progress',
          completed: completedCount,
          total: flowTotalCount
        });
      }
    }

    const flowProgressBarLabel = document.getElementById('flowProgressBarLabel');
    if (flowProgressBarLabel) {
      flowProgressBarLabel.textContent = extensionRunAborted ? 'Generation Stopped.' : 'Generation Completed.';
    }

    const flowAutoSaveToggle = document.getElementById('flowAutoSaveToggle');
    const autoSaveChecked = flowAutoSaveToggle ? flowAutoSaveToggle.checked : true;
    if (autoSaveChecked) {
      downloadAllFlowSessionImages();
    }

    btnFlowStart.disabled = false;
    btnFlowStop.disabled = true;
  }

  function initFlowConnection(showAlertOnError = false) {
    let extProfile = flowProfilesCached.find(p => p.id === 'chrome_extension');
    if (!extProfile) {
      flowProfilesCached.push({
        id: 'chrome_extension',
        label: 'Chrome Extension (SaaS Direct)',
        port: 'Extension',
        connected: extensionDetected,
        browserRunning: extensionDetected,
        hasTokens: extensionDetected,
        projectId: 'Discovered'
      });
    }
    populateProfileDropdown(flowProfilesCached);

    checkExtension();
    if (flowSocket && (flowSocket.readyState === WebSocket.OPEN || flowSocket.readyState === WebSocket.CONNECTING)) {
      sendFlowAction('profiles'); // Ask profiles status
      return;
    }

    // List of candidate WebSocket URLs to try in sequence
    const candidates = [];
    
    // 1. Try the current host first
    const primaryHost = window.location.host;
    candidates.push((window.location.protocol === 'https:' ? 'wss://' : 'ws://') + primaryHost);
    
    // 2. Add local defaults if not already tried
    if (primaryHost !== '127.0.0.1:8085' && primaryHost !== 'localhost:8085') {
      candidates.push('ws://127.0.0.1:8085');
    }
    if (primaryHost !== '127.0.0.1:8080' && primaryHost !== 'localhost:8080') {
      candidates.push('ws://127.0.0.1:8080');
    }
    if (primaryHost !== '127.0.0.1:8081' && primaryHost !== 'localhost:8081') {
      candidates.push('ws://127.0.0.1:8081');
    }

    let attemptIndex = 0;

    function tryNextCandidate() {
      if (attemptIndex >= candidates.length) {
        console.error('[flow-client] All WebSocket connection attempts failed.');
        if (showAlertOnError) {
          alert('Error: WebSocket backend offline. Please ensure the local server is running on port 8085, 8080, or 8081.');
        }
        flowProfilesCached.forEach(p => {
          if (p.id !== 'chrome_extension') {
            p.connected = false;
            p.browserRunning = false;
          }
        });
        updateActiveProfileCard();
        return;
      }

      const wsUrl = candidates[attemptIndex++];
      console.log(`[flow-client] Attempting connection to ${wsUrl}...`);
      
      try {
        const tempSocket = new WebSocket(wsUrl);
        
        tempSocket.onopen = () => {
          console.log(`[flow-client] Connected successfully to ${wsUrl}`);
          flowSocket = tempSocket;
          
          flowSocket.onmessage = (event) => {
            try {
              const msg = JSON.parse(event.data);
              handleFlowServerMessage(msg);
            } catch (e) {
              console.error('[flow-client] failed parsing message:', e);
            }
          };

          flowSocket.onclose = () => {
            console.warn('[flow-client] Connection closed');
            flowProfilesCached.forEach(p => {
              if (p.id !== 'chrome_extension') {
                p.connected = false;
                p.browserRunning = false;
              }
            });
            updateActiveProfileCard();
          };

          flowSocket.onerror = (err) => {
            console.error('[flow-client] WebSocket socket failure:', err);
            flowProfilesCached.forEach(p => {
              if (p.id !== 'chrome_extension') {
                p.connected = false;
                p.browserRunning = false;
              }
            });
            updateActiveProfileCard();
          };

          // Re-send status request
          sendFlowAction('profiles');

          // Flush queued messages
          while (flowMessageQueue.length > 0) {
            const nextMsg = flowMessageQueue.shift();
            try {
              flowSocket.send(nextMsg);
            } catch (queueErr) {
              console.error('[flow-client] Failed to send queued message:', queueErr);
            }
          }
        };

        tempSocket.onerror = (err) => {
          console.warn(`[flow-client] Failed connection to ${wsUrl}:`, err);
          tempSocket.close();
          tryNextCandidate();
        };
        
      } catch (err) {
        console.warn(`[flow-client] Exception creating WebSocket for ${wsUrl}:`, err);
        tryNextCandidate();
      }
    }

    tryNextCandidate();
  }

  function sendFlowAction(action, payload = {}) {
    const selectedId = flowProfileSelect.value || 'default';
    sendFlowActionSpecific(action, selectedId, payload);
  }

  function sendFlowActionSpecific(action, targetProfileId, payload = {}) {
    const rawMsg = JSON.stringify({ action, profileId: targetProfileId, ...payload });
    if (flowSocket && flowSocket.readyState === WebSocket.OPEN) {
      flowSocket.send(rawMsg);
    } else {
      flowMessageQueue.push(rawMsg);
      console.warn('[flow-client] Connection offline, message queued');
    }
  }

  function updateProfilesCached(newProfiles) {
    let extConnected = false;
    let extBrowserRunning = false;
    let extHasTokens = false;

    let oldExt = flowProfilesCached.find(p => p.id === 'chrome_extension');
    if (oldExt) {
      extConnected = oldExt.connected;
      extBrowserRunning = oldExt.browserRunning;
      extHasTokens = oldExt.hasTokens;
    }

    flowProfilesCached = newProfiles;

    if (extensionDetected) {
      let extProfile = flowProfilesCached.find(p => p.id === 'chrome_extension');
      if (!extProfile) {
        flowProfilesCached.push({
          id: 'chrome_extension',
          label: 'Chrome Extension (SaaS Direct)',
          port: 'Extension',
          connected: extConnected,
          browserRunning: extBrowserRunning,
          hasTokens: extHasTokens,
          projectId: 'Discovered'
        });
      } else {
        extProfile.connected = extConnected;
        extProfile.browserRunning = extBrowserRunning;
        extProfile.hasTokens = extHasTokens;
      }
    }
  }

  function handleFlowServerMessage(msg) {
    console.log('[flow-client] msg', msg);
    
    switch (msg.type) {
      case 'profiles':
      case 'profile-add': {
        if (msg.ok && msg.profiles) {
          updateProfilesCached(msg.profiles);
          populateProfileDropdown(flowProfilesCached);
        }
        if (msg.error) {
          alert('Error: ' + msg.error);
        }
        break;
      }

      case 'status':
      case 'login':
      case 'init':
      case 'disconnect': {
        if (msg.status) {
          const idx = flowProfilesCached.findIndex(p => p.id === msg.status.profileId);
          if (idx !== -1) {
            flowProfilesCached[idx] = msg.status;
            updateActiveProfileCard();
          } else {
            sendFlowActionSpecific('profiles', 'default');
          }
        } else if (msg.profiles) {
          updateProfilesCached(msg.profiles);
          populateProfileDropdown(flowProfilesCached);
        }
        if (msg.error) {
          alert('Action error: ' + msg.error);
        }
        break;
      }

      case 'flow-progress': {
        flowRunProgress.style.display = 'inline-block';
        flowProgressBar.style.display = 'block';
        flowRunProgress.textContent = `Progress: ${msg.completed}/${msg.total}`;
        const percent = Math.min(100, (msg.completed / msg.total) * 100);
        flowProgressBarInner.style.width = `${percent}%`;

        flowTotalCount = msg.total;
        const pending = flowTotalCount - flowDoneCount - flowErrorCount;
        updateFlowProgressState(flowDoneCount, pending, flowErrorCount, flowTotalCount);
        break;
      }

      case 'flow-item': {
        flowEmptyState.style.display = 'none';
        
        const parentIndex = Math.floor(msg.index / 100);
        const subIndex = msg.index % 100;
        
        let card = document.getElementById(`flow-card-${msg.index}`);
        if (!card) {
          card = document.createElement('div');
          card.id = `flow-card-${msg.index}`;
          card.className = 'bulk-prompt-item';
          card.style.display = 'flex';
          card.style.flexDirection = 'column';
          card.style.gap = '10px';
          card.style.background = 'var(--surface-lowest)';
          card.style.border = '1px solid var(--outline-variant)';
          card.style.padding = '16px';
          card.style.borderRadius = '14px';
          card.style.boxSizing = 'border-box';
          card.style.height = 'auto';
          card.style.minHeight = 'fit-content';
          flowResultGallery.appendChild(card);
        }

        if (msg.status === 'processing') {
          card.innerHTML = `
            <div class="bulk-prompt-header" style="border-bottom: 1px solid var(--outline-variant); padding-bottom: 6px;">
              <span>Prompt #${parentIndex + 1} (Image ${subIndex + 1})</span>
              <span style="color: var(--accent);">⚡ Injecting...</span>
            </div>
            <div style="min-height: 180px; max-height: 240px; background: var(--surface-lowest); border-radius: 8px; border: 1px solid var(--outline-variant); display: grid; place-items: center; color: var(--on-variant);">
              <div style="text-align: center;">
                <div style="font-size: 24px; animation: pulseDot 1.5s infinite;">🪐</div>
                <div style="font-size: 11px; margin-top: 6px; opacity: 0.8;">Pasting prompt in Google Flow...</div>
              </div>
            </div>
          `;
        } else if (msg.status === 'done') {
          // Track Flow Image metric
          if (typeof window.trackUserMetric === 'function') {
            window.trackUserMetric('flowImages');
          }

          let imageExt = 'png';
          if (msg.dataUrl) {
            if (msg.dataUrl.includes('image/webp') || msg.dataUrl.includes('UklGR')) imageExt = 'webp';
            else if (msg.dataUrl.includes('image/jpeg') || msg.dataUrl.includes('/9j/')) imageExt = 'jpg';
          }
          const fileName = msg.savedFile ? msg.savedFile.split(/[\\/]/).pop() : `google_flow_${Date.now()}.${imageExt}`;

          // Buffer image for end-of-batch or manual Download All
          if (msg.dataUrl) {
            currentFlowSessionImages.push({ dataUrl: msg.dataUrl, fileName: fileName, index: msg.index });
            if (btnFlowDownloadAll) btnFlowDownloadAll.style.display = 'inline-flex';
          }

          card.innerHTML = `
            <div class="bulk-prompt-header" style="border-bottom: 1px solid var(--outline-variant); padding-bottom: 6px;">
              <span>Prompt #${parentIndex + 1} (Image ${subIndex + 1})</span>
              <span style="color: var(--tertiary); font-weight: 700;">✨ Done</span>
            </div>
            <div style="width: 100%; min-height: 180px; max-height: 260px; background: var(--surface-lowest); border-radius: 10px; border: 1px solid var(--outline-variant); display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative; cursor: pointer; padding: 4px;" class="flow-img-preview" data-img-url="${msg.dataUrl}" title="Click to view full image">
              <img src="${msg.dataUrl}" style="max-width: 100%; max-height: 250px; width: auto; height: auto; object-fit: contain; border-radius: 6px;" alt="Generated Image" onerror="this.style.display='none'; if (this.nextElementSibling) this.nextElementSibling.style.display='flex';" />
              <div class="img-load-error" style="display: none; padding: 16px; text-align: center; color: var(--error); font-size: 11px;">
                ⚠️ Preview failed to render. Click to view.
              </div>
              <div class="img-hover-overlay" style="position: absolute; inset: 0; background: rgba(10, 10, 12, 0.65); backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.25s ease; color: #fff; font-size: 12px; font-weight: 700; gap: 6px;">
                🔍 Click to View Full Image
              </div>
            </div>
            <div style="font-size: 11px; color: var(--on-variant); display: flex; justify-content: space-between; padding-top: 4px;">
              <span>Seed: ${msg.seed || 'N/A'}</span>
              <span>Model: ${msg.model || 'Flow'}</span>
            </div>
            <div style="display: flex; gap: 6px; margin-top: 6px;">
              <a href="${msg.dataUrl}" download="${fileName}" class="btn btn-primary small" style="flex: 1.2; text-align: center; text-decoration: none; padding: 7px 10px; font-size: 11.5px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; gap: 4px;">
                📥 Save
              </a>
              <button class="btn btn-dark small btn-regenerate-flow" data-index="${msg.index}" data-prompt="${(msg.prompt || '').replace(/"/g, '&quot;')}" style="flex: 1.5; padding: 7px 10px; font-size: 11.5px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; gap: 4px;" title="Regenerate Image">
                🔄 Regenerate
              </button>
              <button class="btn btn-dark small btn-copy-prompt" data-prompt="${(msg.prompt || '').replace(/"/g, '&quot;')}" style="padding: 7px 10px; font-size: 11.5px; font-weight: 700;" title="Copy Prompt">
                📋
              </button>
              <button class="btn btn-dark small btn-delete-flow-card" data-index="${msg.index}" style="padding: 7px 10px; font-size: 11.5px; font-weight: 700; color: var(--error); border-color: rgba(239, 68, 68, 0.3);" title="Delete Image">
                🗑️
              </button>
            </div>
            ${msg.savedFile ? `
              <div style="font-size: 10.5px; color: var(--tertiary); white-space: normal; word-break: break-all; padding-top: 6px; line-height: 1.3;" title="${msg.savedFile}">
                💾 Auto-Saved: ${fileName}
              </div>` : ''}
          `;
        } else if (msg.status === 'error') {
          card.innerHTML = `
            <div class="bulk-prompt-header" style="border-bottom: 1px solid var(--outline-variant); padding-bottom: 6px;">
              <span>Prompt #${parentIndex + 1} (Image ${subIndex + 1})</span>
              <span style="color: #ea4335;">❌ Failed</span>
            </div>
            <div style="min-height: 180px; background: rgba(234, 67, 53, 0.04); border-radius: 8px; border: 1px solid rgba(234, 67, 53, 0.15); display: flex; align-items: center; justify-content: center; color: #ea4335; font-size: 12px; padding: 16px; text-align: center; box-sizing: border-box;">
              <div>
                <span style="font-size: 24px;">⚠️</span>
                <div style="margin-top: 6px; font-weight: 700;">Generation Error</div>
                <div style="font-size: 11px; opacity: 0.85; margin-top: 4px; line-height: 1.3; word-break: break-word;">${msg.message || msg.error}</div>
              </div>
            </div>
            <div style="display: flex; gap: 6px; margin-top: 6px;">
              <button class="btn btn-primary small btn-regenerate-flow" data-index="${msg.index}" data-prompt="${(msg.prompt || '').replace(/"/g, '&quot;')}" style="flex: 1; text-align: center; justify-content: center; gap: 4px; font-weight: 700; font-size: 11.5px; padding: 7px 10px;">
                🔄 Regenerate
              </button>
              <button class="btn btn-dark small btn-delete-flow-card" data-index="${msg.index}" style="padding: 7px 10px; font-size: 11.5px; font-weight: 700; color: var(--error); border-color: rgba(239, 68, 68, 0.3);" title="Delete Image">
                🗑️
              </button>
            </div>
            `;
          }
          if (msg.status === 'done') {
            flowDoneCount++;
          } else if (msg.status === 'error') {
            flowErrorCount++;
          }
          const pending = flowTotalCount - flowDoneCount - flowErrorCount;
          updateFlowProgressState(flowDoneCount, pending, flowErrorCount, flowTotalCount);

          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          break;
        }

      case 'generate-result': {
        btnFlowStart.disabled = false;
        btnFlowStop.disabled = true;
        if (!msg.ok) {
          alert('Generation Batch Error: ' + msg.error);
        } else {
          console.log('[flow-client] Batch generation complete', msg);
        }
        updateFlowProgressState(flowDoneCount, 0, flowErrorCount, flowTotalCount);

        const flowProgressBarLabel = document.getElementById('flowProgressBarLabel');
        if (flowProgressBarLabel) {
          flowProgressBarLabel.textContent = msg.ok ? 'Generation Completed.' : 'Generation Stopped.';
        }

        const flowAutoSaveToggle = document.getElementById('flowAutoSaveToggle');
        const autoSaveChecked = flowAutoSaveToggle ? flowAutoSaveToggle.checked : true;
        if (autoSaveChecked) {
          downloadAllFlowSessionImages();
        }
        break;
      }

      case 'vectorize-tile-result': {
        if (typeof window.handleVectorizeTileResult === 'function') {
          window.handleVectorizeTileResult(msg);
        }
        break;
      }

      case 'save-vector-sheet': {
        if (typeof window.handleSaveVectorSheetResult === 'function') {
          window.handleSaveVectorSheetResult(msg);
        }
        break;
      }

      case 'save-text-file': {
        if (msg.ok) {
          alert(`Saved successfully:\n${msg.filePath}`);
        } else if (msg.cancelled) {
          // Do nothing, save cancelled by user
          console.log('[flow-client] File save cancelled by user.');
        } else {
          alert('Save failed: ' + msg.error);
        }
        break;
      }

      case 'error': {
        alert('Server Error: ' + (msg.error || 'Unknown websocket error'));
        break;
      }
    }
  }

  function populateProfileDropdown(profiles) {
    const currentVal = flowProfileSelect.value || 'default';
    flowProfileSelect.innerHTML = '';
    
    if (profiles.length >= 4) {
      addProfileBtn.style.display = 'none';
    } else {
      addProfileBtn.style.display = 'block';
    }

    profiles.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.id === 'chrome_extension' ? p.label : `${p.label} (Port ${p.port})`;
      flowProfileSelect.appendChild(opt);
    });

    if (Array.from(flowProfileSelect.options).some(o => o.value === currentVal)) {
      flowProfileSelect.value = currentVal;
    }
    
    updateActiveProfileCard();
  }

  function updateActiveProfileCard() {
    const selectedId = flowProfileSelect.value || 'default';
    const profile = flowProfilesCached.find(p => p.id === selectedId);
    if (!profile) return;



    // Checkbox state
    const isChecked = localStorage.getItem(`flow_use_profile_${selectedId}`) !== 'false';
    flowProfileUseCheckbox.checked = isChecked;

    // Disconnect button state
    btnFlowDisconnect.disabled = !profile.connected;

    // Status badge and details
    if (profile.connected) {
      connectionBadge.textContent = 'Active';
      connectionBadge.style.background = 'rgba(52, 168, 83, 0.15)';
      connectionBadge.style.color = '#34a853';
      
      if (selectedId === 'chrome_extension') {
        connectionDetail.innerHTML = `
          Type: <strong>SaaS extension</strong><br/>
          Status: <strong>Connected and Active</strong>
        `;
      } else {
        connectionDetail.innerHTML = `
          Port: <strong>${profile.port}</strong> · Project: <strong>${profile.projectId || 'None'}</strong><br/>
          Tokens: <strong style="color:${profile.hasTokens ? '#34a853':'#fbbc05'}">${profile.hasTokens ? 'Acquired' : 'Pending'}</strong>
        `;
      }
    } else {
      connectionBadge.textContent = 'Offline';
      connectionBadge.style.background = 'rgba(234, 67, 53, 0.15)';
      connectionBadge.style.color = '#ea4335';
      
      let note = 'Browser offline';
      if (profile.browserRunning) {
        note = 'Launch detected, CDP connecting...';
      }
      connectionDetail.innerHTML = `
        Port: <strong>${profile.port}</strong> · Status: <strong style="color:#ea4335">Offline</strong><br/>
        Detail: ${note}
      `;
    }

    updateStartButtonState();
  }

  function updateStartButtonState() {
    // Keep start button clickable so user can click to trigger connection warnings
  }

  // --- UI Action Event Bindings ---
  flowProfileSelect.addEventListener('change', () => {
    updateActiveProfileCard();
  });

  flowProfileUseCheckbox.addEventListener('change', (e) => {
     const selectedId = flowProfileSelect.value || 'default';
     localStorage.setItem(`flow_use_profile_${selectedId}`, e.target.checked);
     updateStartButtonState();
  });

  addProfileBtn.addEventListener('click', () => {
    sendFlowActionSpecific('profile-add', 'default');
  });

  btnFlowOpen.addEventListener('click', () => {
    const selectedId = flowProfileSelect.value || 'default';
    if (selectedId === 'chrome_extension') {
      window.open('https://labs.google/fx/tools/flow', '_blank');
      return;
    }
    sendFlowActionSpecific('login', selectedId);
    let count = 0;
    const interval = setInterval(() => {
      sendFlowActionSpecific('status', selectedId);
      if (++count > 20) clearInterval(interval);
    }, 2000);
  });

  btnFlowConnect.addEventListener('click', () => {
    const selectedId = flowProfileSelect.value || 'default';
    if (selectedId === 'chrome_extension') {
      checkExtension();
      setTimeout(() => {
        if (extensionDetected) {
          alert('Chrome Extension connection verified successfully!');
        } else {
          alert('Chrome Extension not found. Please ensure the extension is loaded in this browser and the extension ID matches.');
        }
      }, 600);
      return;
    }
    sendFlowActionSpecific('init', selectedId);
  });

  btnFlowDisconnect.addEventListener('click', () => {
    const selectedId = flowProfileSelect.value || 'default';
    if (selectedId === 'chrome_extension') {
      let extProfile = flowProfilesCached.find(p => p.id === 'chrome_extension');
      if (extProfile) {
        extProfile.connected = false;
        extProfile.browserRunning = false;
        extProfile.hasTokens = false;
      }
      populateProfileDropdown(flowProfilesCached);
      flowProfileSelect.value = 'chrome_extension';
      updateActiveProfileCard();
      return;
    }
    sendFlowActionSpecific('disconnect', selectedId);
  });

  btnFlowStart.addEventListener('click', async () => {
    const prompts = getCleanFlowPrompts();
    if (!prompts.length) {
      alert('Please enter or upload prompt keywords first.');
      return;
    }

    const imgCount = Number(flowImagesPerPrompt.value) || 1;
    const countRequired = prompts.length * imgCount;

    const allowed = await window.checkAndConsumeCredit('flowImages', countRequired, false);
    if (!allowed) return;

    const checkAndStart = () => {
      // Connect verification checks before starting
      if (!extensionDetected) {
        const setupModal = document.getElementById('extensionSetupModal');
        if (setupModal) {
          setupModal.classList.remove('hidden');
        } else {
          alert('Chrome Extension is not installed. Please follow the setup guide.');
        }
        return;
      }

      const extProfile = flowProfilesCached.find(p => p.id === 'chrome_extension');
      if (!extProfile || !extProfile.connected) {
        const connAlertModal = document.getElementById('flowConnectionAlertModal');
        if (connAlertModal) {
          connAlertModal.classList.remove('hidden');
        } else {
          alert('Please connect to Google Flow first.');
        }
        return;
      }

      const activeIds = flowProfilesCached
        .filter(p => localStorage.getItem(`flow_use_profile_${p.id}`) !== 'false')
        .map(p => p.id);

      if (!activeIds.length) {
        alert('Please select at least one active connected browser profile.');
        return;
      }

      const imgCount = Number(flowImagesPerPrompt.value) || 1;
      const clientSideTotal = prompts.length * imgCount;

      const currentPromptOffset = flowPromptOffset;
      const customIndices = [];
      for (let pIdx = 0; pIdx < prompts.length; pIdx++) {
        for (let iIdx = 0; iIdx < imgCount; iIdx++) {
          customIndices.push(((currentPromptOffset + pIdx) * 100) + iIdx);
        }
      }

      if (activeIds.includes('chrome_extension')) {
        btnFlowStart.disabled = true;
        btnFlowStop.disabled = false;

        if (flowEmptyState) flowEmptyState.style.display = 'none';

        flowTotalCount += clientSideTotal;
        const flowProgressWidget = document.getElementById('flowProgressWidget');
        if (flowProgressWidget) flowProgressWidget.style.display = 'flex';
        const flowProgressBarLabel = document.getElementById('flowProgressBarLabel');
        if (flowProgressBarLabel) flowProgressBarLabel.textContent = 'Generating images...';
        const pending = flowTotalCount - flowDoneCount - flowErrorCount;
        updateFlowProgressState(flowDoneCount, pending, flowErrorCount, flowTotalCount);

        flowProgressBar.style.display = 'block';
        flowProgressBarInner.style.width = `${Math.min(100, Math.round(((flowDoneCount + flowErrorCount) / flowTotalCount) * 100))}%`;
        flowRunProgress.style.display = 'inline-block';
        flowRunProgress.textContent = `Progress: ${flowDoneCount}/${flowTotalCount}`;

        runExtensionFlowGeneration(prompts, imgCount, {
          model: flowModel.value,
          aspectRatio: flowAspectRatio.value
        });

        flowPromptOffset += prompts.length;
        return;
      }

      if (flowEmptyState) flowEmptyState.style.display = 'none';

      flowTotalCount += clientSideTotal;
      const flowProgressWidget = document.getElementById('flowProgressWidget');
      if (flowProgressWidget) flowProgressWidget.style.display = 'flex';
      const flowProgressBarLabel = document.getElementById('flowProgressBarLabel');
      if (flowProgressBarLabel) flowProgressBarLabel.textContent = 'Generating images...';
      const pending = flowTotalCount - flowDoneCount - flowErrorCount;
      updateFlowProgressState(flowDoneCount, pending, flowErrorCount, flowTotalCount);

      flowProgressBar.style.display = 'block';
      flowProgressBarInner.style.width = `${Math.min(100, Math.round(((flowDoneCount + flowErrorCount) / flowTotalCount) * 100))}%`;
      flowRunProgress.style.display = 'inline-block';
      flowRunProgress.textContent = `Progress: ${flowDoneCount}/${flowTotalCount}`;

      btnFlowStart.disabled = true;
      btnFlowStop.disabled = false;

      const flowAutoSaveToggle = document.getElementById('flowAutoSaveToggle');
      const autoSaveEnabled = flowAutoSaveToggle ? flowAutoSaveToggle.checked : true;
      const targetOutputDir = autoSaveEnabled ? (flowOutputDir.value.trim() || 'Downloads/Gravity_Flow') : null;

      sendFlowActionSpecific('generate', 'default', {
        prompts,
        customIndices,
        runId: Date.now(),
        profileIds: activeIds,
        imagesPerPrompt: imgCount,
        options: {
          model: flowModel.value,
          aspectRatio: flowAspectRatio.value
        },
        outputDir: targetOutputDir
      });

      flowPromptOffset += prompts.length;
    };

    // If extension is not detected yet, try a quick ping right now before executing checks
    if (!extensionDetected && typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage(flowExtensionId, { action: 'ping' }, response => {
        if (!chrome.runtime.lastError && response && response.ok) {
          console.log('[flow-client] Proactive setup check: Chrome Extension found!');
          extensionDetected = true;
          const isTabOpen = response.tabOpen === true;
          addExtensionProfileOption(isTabOpen);
        }
        checkAndStart();
      });
    } else {
      checkAndStart();
    }
  });

  btnFlowStop.addEventListener('click', () => {
    const flowProgressBarLabel = document.getElementById('flowProgressBarLabel');
    if (flowProgressBarLabel) flowProgressBarLabel.textContent = 'Generation Stopped.';
    const selectedId = flowProfileSelect.value || 'default';
    if (selectedId === 'chrome_extension' || flowProfileSelect.value === 'chrome_extension') {
      extensionRunAborted = true;
      btnFlowStart.disabled = false;
      btnFlowStop.disabled = true;
      
      // Immediately resolve the pending extension generation promise
      if (activeResolveCallback) {
        activeResolveCallback({ ok: false, error: 'Stopped by user' });
      }
      return;
    }
    sendFlowAction('stop');
  });

  async function regenerateSingleFlowItem(promptText, cardIndex) {
    const allowed = await window.checkAndConsumeCredit('flowImages', 1, false);
    if (!allowed) return;

    const activeIds = flowProfilesCached
      .filter(p => localStorage.getItem(`flow_use_profile_${p.id}`) !== 'false')
      .map(p => p.id);

    if (!activeIds.length) {
      alert('Please select at least one active connected browser profile.');
      return;
    }

    handleFlowServerMessage({
      type: 'flow-item',
      index: cardIndex,
      status: 'processing'
    });

    const options = {
      model: flowModel.value,
      aspectRatio: flowAspectRatio.value
    };

    if (activeIds.includes('chrome_extension')) {
      try {
        const response = await sendExtensionGenerate(promptText, options);
        if (response && response.ok && response.media && response.media.length > 0) {
          await window.checkAndConsumeCredit('flowImages', 1, true);
          const mediaItem = response.media[0];
          let dataUrl = '';
          if (mediaItem.encodedImage) {
            dataUrl = mediaItem.encodedImage.startsWith('data:') ? mediaItem.encodedImage : `data:image/png;base64,${mediaItem.encodedImage}`;
          } else if (mediaItem.url && !mediaItem.url.startsWith('blob:')) {
            dataUrl = mediaItem.url;
          }
          
          handleFlowServerMessage({
            type: 'flow-item',
            index: cardIndex,
            status: 'done',
            dataUrl: dataUrl,
            seed: options.seed || Math.floor(Math.random() * 2147483648),
            model: options.model,
            prompt: promptText
          });
        } else {
          const errDetail = response && response.error;
          const helpfulMsg = errDetail || 'Google Flow returned no image. Please ensure your Google Flow tab (flow.google.com) is open, signed in with remaining quota, and the Gravity Flow Extension is active.';
          throw new Error(helpfulMsg);
        }
      } catch (err) {
        handleFlowServerMessage({
          type: 'flow-item',
          index: cardIndex,
          status: 'error',
          error: err.message || String(err),
          prompt: promptText
        });
      }
    } else {
      const flowAutoSaveToggle = document.getElementById('flowAutoSaveToggle');
      const autoSaveEnabled = flowAutoSaveToggle ? flowAutoSaveToggle.checked : true;
      const targetOutputDir = autoSaveEnabled ? (flowOutputDir.value.trim() || 'Downloads/Gravity_Flow') : null;

      sendFlowActionSpecific('generate', 'default', {
        prompts: [promptText],
        runId: Date.now(),
        profileIds: activeIds,
        imagesPerPrompt: 1,
        customIndices: [cardIndex],
        options: {
          model: flowModel.value,
          aspectRatio: flowAspectRatio.value
        },
        outputDir: targetOutputDir
      });
    }
  }

  if (btnFlowDownloadAll) {
    btnFlowDownloadAll.addEventListener('click', () => {
      downloadAllFlowSessionImages();
    });
  }



  // Folder Directory Picker logic
  const flowDirPicker = document.getElementById('flowDirPicker');
  const btnBrowseOutputDir = document.getElementById('btnBrowseOutputDir');
  if (flowDirPicker && flowOutputDir) {
    const handleDirPick = () => flowDirPicker.click();
    if (btnBrowseOutputDir) btnBrowseOutputDir.addEventListener('click', handleDirPick);

    flowDirPicker.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        const firstFile = e.target.files[0];
        if (firstFile.path) {
          const dirPath = firstFile.path.substring(0, Math.max(firstFile.path.lastIndexOf('\\'), firstFile.path.lastIndexOf('/')));
          if (dirPath) flowOutputDir.value = dirPath;
        } else if (firstFile.webkitRelativePath) {
          const folderName = firstFile.webkitRelativePath.split('/')[0];
          if (folderName) flowOutputDir.value = folderName;
        }
      }
    });
  }

  txtFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      flowPromptsArea.value = evt.target.result;
    };
    reader.readAsText(file);
  });



  // ==========================================
  // Tool #2 Icon Pack Banner Generator Logic
  // ==========================================
  let featuredIconImg = null;
  let gridIconImgs = [];

  const themeColors = {
    healthcare: { left: '#2a4436', right: '#f7f4fa' },
    slate: { left: '#1b263b', right: '#f0f4f8' },
    purple: { left: '#3c096c', right: '#f5f0ff' },
    red: { left: '#6b1111', right: '#fff5f5' },
    dark: { left: '#111111', right: '#1a1a1a' }
  };

  document.querySelectorAll('#themePresets .theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#themePresets .theme-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const themeKey = btn.getAttribute('data-theme');
      if (themeColors[themeKey]) {
        bannerLeftBg.value = themeColors[themeKey].left;
        bannerRightBg.value = themeColors[themeKey].right;
        renderBannerCanvas();
      }
    });
  });

  // Color & Text change listeners
  [bannerTitle, bannerCountText, bannerLeftBg, bannerRightBg].forEach(input => {
    if (input) input.addEventListener('input', () => renderBannerCanvas());
  });

  // Featured Icon Dropzone
  if (featuredIconDropzone && featuredIconInput) {
    featuredIconDropzone.addEventListener('click', () => featuredIconInput.click());
    featuredIconInput.addEventListener('change', (e) => {
      if (e.target.files.length) {
        const file = e.target.files[0];
        featuredIconFileName.textContent = file.name;
        const reader = new FileReader();
        reader.onload = (evt) => {
          const img = new Image();
          img.onload = () => {
            featuredIconImg = img;
            renderBannerCanvas();
          };
          img.src = evt.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Grid Icons Dropzone
  if (gridIconsDropzone && gridIconsFileInput) {
    gridIconsDropzone.addEventListener('click', () => gridIconsFileInput.click());
    gridIconsDropzone.addEventListener('dragover', (e) => e.preventDefault());
    gridIconsDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      if (e.dataTransfer.files.length) loadGridIconFiles(e.dataTransfer.files);
    });
    gridIconsFileInput.addEventListener('change', (e) => {
      if (e.target.files.length) loadGridIconFiles(e.target.files);
    });
  }

  function loadGridIconFiles(files) {
    Array.from(files).slice(0, 15).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        const img = new Image();
        img.onload = () => {
          if (gridIconImgs.length < 15) {
            gridIconImgs.push(img);
            bannerIconsCountBadge.textContent = `Loaded: ${gridIconImgs.length}/15 Icons`;
            renderBannerCanvas();
          }
        };
        img.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  if (btnClearBannerIcons) {
    btnClearBannerIcons.addEventListener('click', () => {
      gridIconImgs = [];
      featuredIconImg = null;
      featuredIconFileName.textContent = 'Upload Featured Icon';
      bannerIconsCountBadge.textContent = 'Loaded: 0/15 Icons';
      renderBannerCanvas();
    });
  }

  if (btnRenderBanner) {
    btnRenderBanner.addEventListener('click', () => renderBannerCanvas());
  }

  if (btnDownloadBanner) {
    btnDownloadBanner.addEventListener('click', () => {
      if (!bannerCanvas) return;
      const link = document.createElement('a');
      link.download = `${bannerTitle.value.toLowerCase().replace(/\s+/g, '_')}_banner.png`;
      link.href = bannerCanvas.toDataURL('image/png');
      link.click();
    });
  }

  // Canvas Renderer Engine
  function renderBannerCanvas() {
    if (!bannerCanvas) return;
    const ctx = bannerCanvas.getContext('2d');
    const W = 1200;
    const H = 560;

    // Clear canvas
    ctx.clearRect(0, 0, W, H);

    // Left Panel Dimensions
    const leftW = 320;
    const leftBg = bannerLeftBg.value || '#2a4436';
    const rightBg = bannerRightBg.value || '#f7f4fa';

    // 1. Draw Left Panel Background
    ctx.fillStyle = leftBg;
    ctx.fillRect(0, 0, leftW, H);

    // 2. Draw Featured Main Icon Box (Left Sidebar)
    const featBoxX = 35;
    const featBoxY = 40;
    const featBoxW = 250;
    const featBoxH = 250;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 2;
    ctx.strokeRect(featBoxX, featBoxY, featBoxW, featBoxH);

    if (featuredIconImg) {
      const pad = 24;
      const maxW = featBoxW - pad * 2;
      const maxH = featBoxH - pad * 2;
      const scale = Math.min(maxW / featuredIconImg.width, maxH / featuredIconImg.height);
      const iw = featuredIconImg.width * scale;
      const ih = featuredIconImg.height * scale;
      const ix = featBoxX + (featBoxW - iw) / 2;
      const iy = featBoxY + (featBoxH - ih) / 2;
      ctx.drawImage(featuredIconImg, ix, iy, iw, ih);
    } else {
      // Clean default placeholder icon graphic (Matching uploaded image)
      drawPlaceholderIcon(ctx, featBoxX + featBoxW / 2, featBoxY + featBoxH / 2, 130, '#ffffff');
    }

    // 3. Draw Category / Niche Title Box
    const titleText = (bannerTitle.value || 'HEALTHCARE ICON').toUpperCase();
    const titleY = 345;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(featBoxX, titleY, featBoxW, 58);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px "Inter", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(titleText, featBoxX + featBoxW / 2, titleY + 29);

    // 4. Draw Total Count Pill Badge (Bottom Left)
    const countText = (bannerCountText.value || '15 ICONS').toUpperCase();
    const pillX = 35;
    const pillY = 465;
    const pillW = 250;
    const pillH = 54;
    const pillRadius = 27;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, pillRadius);
    ctx.fill();

    ctx.fillStyle = leftBg === '#111111' ? '#111111' : '#1b263b';
    ctx.font = '800 24px "Inter", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(countText, pillX + pillW / 2, pillY + pillH / 2);

    // 5. Draw Right Panel Background
    ctx.fillStyle = rightBg;
    ctx.fillRect(leftW, 0, W - leftW, H);

    // 6. Draw 15 Icon Grid Tiles (3 Rows x 5 Columns)
    const cols = 5;
    const rows = 3;
    const gridAreaX = leftW + 35;
    const gridAreaY = 40;
    const gridAreaW = W - leftW - 70; // 810px
    const gridAreaH = H - 80;         // 480px

    const cardW = 125;
    const cardH = 125;

    const gapX = (gridAreaW - cols * cardW) / (cols - 1); // ~ 46px
    const gapY = (gridAreaH - rows * cardH) / (rows - 1); // ~ 52px

    const cardIconColor = '#344e41'; // Dark healthcare green icon tint

    let iconIdx = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cx = gridAreaX + c * (cardW + gapX);
        const cy = gridAreaY + r * (cardH + gapY);

        // Draw tile box
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.04)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;
        ctx.beginPath();
        ctx.roundRect(cx, cy, cardW, cardH, 20);
        ctx.fill();
        ctx.restore();

        // Draw inner icon or placeholder
        if (gridIconImgs[iconIdx]) {
          const pad = 16;
          const maxW = cardW - pad * 2;
          const maxH = cardH - pad * 2;
          const img = gridIconImgs[iconIdx];
          const scale = Math.min(maxW / img.width, maxH / img.height);
          const iw = img.width * scale;
          const ih = img.height * scale;
          const ix = cx + (cardW - iw) / 2;
          const iy = cy + (cardH - ih) / 2;
          ctx.drawImage(img, ix, iy, iw, ih);
        } else {
          drawPlaceholderIcon(ctx, cx + cardW / 2, cy + cardH / 2, 64, cardIconColor);
        }

        iconIdx++;
      }
    }
  }

  // Draw clean placeholder graphic matching the user's reference image
  function drawPlaceholderIcon(ctx, cx, cy, size, color) {
    ctx.save();
    ctx.translate(cx, cy);

    const half = size / 2;
    const r = size * 0.22;

    // Rounded outer frame
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(3, size * 0.07);
    ctx.beginPath();
    ctx.roundRect(-half, -half, size, size, r);
    ctx.stroke();

    // Sun circle (top left)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(-half + size * 0.3, -half + size * 0.3, size * 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Mountain path (bottom)
    ctx.beginPath();
    ctx.moveTo(-half + size * 0.15, half - size * 0.2);
    ctx.lineTo(-half + size * 0.45, -half + size * 0.45);
    ctx.lineTo(-half + size * 0.65, half - size * 0.3);
    ctx.lineTo(-half + size * 0.8, -half + size * 0.55);
    ctx.lineTo(half - size * 0.15, half - size * 0.2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // Initial render when script loads
  if (bannerCanvas) {
    setTimeout(() => renderBannerCanvas(), 300);
  }

  // ==========================================
  // Tool #4 Icon Sheet Generator Engine
  // ==========================================
  let loadedSheetImg = null;
  let slicedTilesData = [];
  let activeSliceRunId = 0;
  let isSlicingInProgress = false;
  let generatedAssembledSvg = '';
  // Track how many tiles have received vector updates
  let vectorizeCompletedCount = 0;
  let isVectorizing = false;

  const tool4ViewEl = document.getElementById('tool4View');
  const sheetDropzone = document.getElementById('sheetDropzone');
  const sheetFileInput = document.getElementById('sheetFileInput');
  const sheetFileName = document.getElementById('sheetFileName');
  const sheetCols = document.getElementById('sheetCols');
  const sheetRows = document.getElementById('sheetRows');
  const sheetTileCount = document.getElementById('sheetTileCount');
  const sheetTrim = document.getElementById('sheetTrim');
  const sheetShuffle = document.getElementById('sheetShuffle');
  const sheetAutoLabel = document.getElementById('sheetAutoLabel');
  const vecSmoothing = document.getElementById('vecSmoothing');
  const vecSmoothingVal = document.getElementById('vecSmoothingVal');
  const vecCorner = document.getElementById('vecCorner');
  const vecCornerVal = document.getElementById('vecCornerVal');
  const vecSimplify = document.getElementById('vecSimplify');
  const vecSimplifyVal = document.getElementById('vecSimplifyVal');
  const vecSpeckle = document.getElementById('vecSpeckle');
  const vecSpeckleVal = document.getElementById('vecSpeckleVal');
  const vecOptimise = document.getElementById('vecOptimise');
  const vecUpscale = document.getElementById('vecUpscale');
  const vecTraceDetail = document.getElementById('vecTraceDetail');
  const sheetLayout = document.getElementById('sheetLayout');

  const vecFillColor = document.getElementById('vecFillColor');
  const vecFillHex = document.getElementById('vecFillHex');
  const vecLabelColor = document.getElementById('vecLabelColor');
  const vecLabelHex = document.getElementById('vecLabelHex');
  const sheetPresetSelect = document.getElementById('sheetPresetSelect');
  const sheetSetName = document.getElementById('sheetSetName');
  if (sheetSetName) {
    sheetSetName.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      const activeSheetObj = loadedSheetImgs.find(s => s.name === activePreviewSheetName);
      if (activeSheetObj) {
        activeSheetObj.title = val;
      }
      const titleLayer = activeLayers.find(l => l.id === 'titleText' || (l.name && l.name.toLowerCase().includes('title text')));
      if (titleLayer) {
        titleLayer.text = val || 'BRANDING';
      }
      buildBrandedSvgSheet();
    });
  }
  const sheetSubtitle = document.getElementById('sheetSubtitle');
  const sheetSaveDir = document.getElementById('sheetSaveDir');
  const btnBrowseDir = document.getElementById('btnBrowseDir');
  const sheetDirPicker = document.getElementById('sheetDirPicker');

  // Custom Output Directory Modal Logic
  const dirPickerModal = document.getElementById('dirPickerModal');
  const btnCloseDirModal = document.getElementById('btnCloseDirModal');
  const btnCancelDirModal = document.getElementById('btnCancelDirModal');
  const btnApplyDirModal = document.getElementById('btnApplyDirModal');
  const modalDirInput = document.getElementById('modalDirInput');
  const dirPresetBtns = document.querySelectorAll('.dir-preset-btn');

  function openNativeFilePicker() {
    if (sheetDirPicker) {
      sheetDirPicker.value = '';
      sheetDirPicker.click();
    }
  }

  if (btnBrowseDir) {
    btnBrowseDir.addEventListener('click', openNativeFilePicker);
  }

  if (sheetDirPicker) {
    sheetDirPicker.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        let fullPath = file.path || '';
        if (fullPath) {
          const lastSep = Math.max(fullPath.lastIndexOf('/'), fullPath.lastIndexOf('\\'));
          if (lastSep !== -1) fullPath = fullPath.substring(0, lastSep);
        } else if (file.webkitRelativePath) {
          fullPath = file.webkitRelativePath.split('/')[0];
        } else {
          fullPath = file.name;
        }
        if (sheetSaveDir && fullPath) {
          sheetSaveDir.value = fullPath;
        }
      }
    });
  }

  dirPresetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const path = btn.getAttribute('data-path');
      if (path && modalDirInput) {
        modalDirInput.value = path;
      }
    });
  });
  const btnSliceVectorize = document.getElementById('btnSliceVectorize');
  const btnSaveToPC = document.getElementById('btnSaveToPC');
  const btnToggleTilesView = document.getElementById('btnToggleTilesView');
  const btnToggleSheetView = document.getElementById('btnToggleSheetView');
  const btnDownloadAssembledSheet = document.getElementById('btnDownloadAssembledSheet');
  const tool4TilesContainer = document.getElementById('tool4TilesContainer');
  const tool4TilesGrid = document.getElementById('tool4TilesGrid');
  const tool4SheetWrap = document.getElementById('tool4SheetWrap');
  const tool4SheetCard = document.getElementById('tool4SheetCard');
  let isSheetPanMode = false;
  let isSpacebarDown = false;

  if (tool4SheetCard) {
    tool4SheetCard.addEventListener('click', (e) => {
      if (isSheetPanMode) return;
      const deleteGroup = e.target.closest('.delete-btn-group');
      if (deleteGroup) {
        const tileIdx = parseInt(deleteGroup.getAttribute('data-delete-idx'));
        const tile = slicedTilesData.find(t => t.idx === tileIdx);
        if (tile) {
          const featLayer = activeLayers.find(l => l.type === 'featured');
          if (featLayer) {
            let tilesForSheet = [];
            if (activePreviewSheetName && activePreviewSheetName !== 'Default') {
              tilesForSheet = slicedTilesData.filter(t => t && t.sheetName === activePreviewSheetName);
            }
            if (!tilesForSheet || tilesForSheet.length === 0) {
              tilesForSheet = Array.isArray(slicedTilesData) ? slicedTilesData : [];
            }
            const activeTiles = tilesForSheet.filter(t => !t.isDeleted);
            const currentSelectedIdx = (featLayer.selectedIconIndex !== undefined && featLayer.selectedIconIndex >= 0 && featLayer.selectedIconIndex < activeTiles.length) ? featLayer.selectedIconIndex : 0;
            const currentlyFeaturedTile = activeTiles[currentSelectedIdx];
            
            if (currentlyFeaturedTile && currentlyFeaturedTile.idx === tile.idx) {
              featLayer.selectedIconIndex = 0; // Reset to the first active icon
            } else {
              const deletedTileIndexInActive = activeTiles.findIndex(t => t.idx === tile.idx);
              if (deletedTileIndexInActive >= 0 && deletedTileIndexInActive < currentSelectedIdx) {
                featLayer.selectedIconIndex = Math.max(0, currentSelectedIdx - 1);
              }
            }
          }

          tile.isDeleted = true;

          // Hide corresponding preview card in Tiles Grid manually
          const gridCell = document.getElementById(`tool4-tile-card-${tileIdx}`);
          if (gridCell) {
            gridCell.style.display = 'none';
          }

          // Trigger optimal grid recalculation and refit presentation sheet layout immediately
          shouldRecalculateOptimalGrid = true;
          buildBrandedSvgSheet();
        }
        return;
      }

      // Check if clicking on the cell itself to perform a Swap / Placement
      const iconCell = e.target.closest('.presentation-icon-cell');
      if (iconCell) {
        const slotIdxAttr = iconCell.getAttribute('data-slot-idx');
        if (slotIdxAttr !== null && window.selectedTrayTileIdx !== null) {
          const targetSlot = parseInt(slotIdxAttr);
          const sheetName = activePreviewSheetName || (loadedSheetImgs && loadedSheetImgs[0]?.name) || 'Default';
          const trayTile = slicedTilesData.find(t => t.idx === window.selectedTrayTileIdx);
          if (trayTile) {
            // Find active tile in this slot if any
            const activeTileInSlot = slicedTilesData.find(t => t.sheetName === sheetName && t.gridSlot === targetSlot && !t.isDeleted);
            if (activeTileInSlot) {
              // Swap slot, sheet, and deleted status
              const tempSlot = trayTile.gridSlot;
              trayTile.gridSlot = activeTileInSlot.gridSlot;
              activeTileInSlot.gridSlot = tempSlot;

              const tempDeleted = trayTile.isDeleted;
              trayTile.isDeleted = activeTileInSlot.isDeleted;
              activeTileInSlot.isDeleted = tempDeleted;

              const tempSheet = trayTile.sheetName;
              trayTile.sheetName = activeTileInSlot.sheetName;
              activeTileInSlot.sheetName = tempSheet;
            } else {
              // Place in empty slot
              trayTile.gridSlot = targetSlot;
              trayTile.isDeleted = false;
              trayTile.sheetName = sheetName;
            }

            // Restore vis in grid UI if restored from delete
            const gridCell = document.getElementById(`tool4-tile-card-${trayTile.idx}`);
            if (gridCell) gridCell.style.display = '';

            window.selectedTrayTileIdx = null; // Clear selection
            buildBrandedSvgSheet();
          }
        }
      }
    });
  }

  const defaultTemplateGeometries = {
    template1: [
      { id: 'leftBg', type: 'rect', name: 'Left Sidebar BG', x: 0, y: 0, w: 1600, h: 2600, radius: 0, fill: '#022c22' },
      { id: 'topAccent', type: 'rect', name: 'Neon Mint Accent', x: 0, y: 0, w: 1600, h: 36, radius: 0, fill: '#34d399' },
      { id: 'featBg', type: 'rect', name: 'Featured Icon Box BG', x: 180, y: 180, w: 1240, h: 1240, radius: 100, fill: '#ffffff' },
      { id: 'featIcon', type: 'featured', name: 'Featured Preview Icon', x: 180, y: 180, w: 1240, h: 1240 },
      { id: 'titleText', type: 'text', name: 'Title Text', x: 800, y: 1650, fontSize: 130, fontFamily: 'Outfit', fill: '#ffffff', text: '[NAME]' },
      { id: 'titleLine', type: 'rect', name: 'Title Accent Line', x: 600, y: 1740, w: 400, h: 14, radius: 7, fill: '#34d399' },
      { id: 'titleDot1', type: 'rect', name: 'Title Accent Dot 1', x: 745, y: 1830, w: 20, h: 20, radius: 10, fill: '#34d399' },
      { id: 'titleDot2', type: 'rect', name: 'Title Accent Dot 2', x: 785, y: 1825, w: 30, h: 30, radius: 15, fill: '#34d399' },
      { id: 'titleDot3', type: 'rect', name: 'Title Accent Dot 3', x: 835, y: 1830, w: 20, h: 20, radius: 10, fill: '#34d399' },
      { id: 'badgeBg', type: 'rect', name: 'Emerald Badge BG', x: 200, y: 2050, w: 1200, h: 180, radius: 90, fill: '#059669' },
      { id: 'badgeText', type: 'text', name: 'Badge Text', x: 800, y: 2160, fontSize: 68, fontFamily: 'Outfit', fill: '#ffffff', text: '[COUNT] EDITABLE SVG' },
      { id: 'rightBg', type: 'rect', name: 'Right Panel BG', x: 1600, y: 0, w: 4400, h: 2600, radius: 0, fill: '#f0fdf4' },
      { id: 'iconGrid', type: 'grid', name: 'Icons Grid Area', x: 1680, y: 100, w: 4240, h: 2400, padding: 140, fill: '#022c22' }
    ],
    template2: [
      { id: 'pageBg', type: 'rect', name: 'Outer Page BG', x: 0, y: 0, w: 6000, h: 2600, radius: 0, fill: '#fff7ed' },
      { id: 'leftCard', type: 'rect', name: 'Floating Studio Card', x: 120, y: 100, w: 1460, h: 2400, radius: 60, fill: '#451a03' },
      { id: 'featBg', type: 'rect', name: 'Featured Icon Box BG', x: 250, y: 220, w: 1200, h: 1200, radius: 100, fill: '#ffffff' },
      { id: 'featIcon', type: 'featured', name: 'Featured Preview Icon', x: 250, y: 220, w: 1200, h: 1200 },
      { id: 'titleText', type: 'text', name: 'Title Text', x: 850, y: 1620, fontSize: 130, fontFamily: 'Outfit', fill: '#ffffff', text: '[NAME]' },
      { id: 'titleLine', type: 'rect', name: 'Title Accent Line', x: 650, y: 1720, w: 400, h: 14, radius: 7, fill: '#f97316' },
      { id: 'titleDot1', type: 'rect', name: 'Title Accent Dot 1', x: 795, y: 1810, w: 20, h: 20, radius: 10, fill: '#f97316' },
      { id: 'titleDot2', type: 'rect', name: 'Title Accent Dot 2', x: 835, y: 1805, w: 30, h: 30, radius: 15, fill: '#f97316' },
      { id: 'titleDot3', type: 'rect', name: 'Title Accent Dot 3', x: 885, y: 1810, w: 20, h: 20, radius: 10, fill: '#f97316' },
      { id: 'badgeBg', type: 'rect', name: 'Coral Pill Badge', x: 250, y: 2000, w: 1200, h: 180, radius: 90, fill: '#ea580c' },
      { id: 'badgeText', type: 'text', name: 'Badge Text', x: 850, y: 2110, fontSize: 68, fontFamily: 'Outfit', fill: '#ffffff', text: '[COUNT] VECTOR ICONS' },
      { id: 'rightCard', type: 'rect', name: 'Floating Grid Card', x: 1700, y: 100, w: 4180, h: 2400, radius: 60, fill: '#ffffff' },
      { id: 'iconGrid', type: 'grid', name: 'Icons Grid Area', x: 1800, y: 180, w: 3980, h: 2240, padding: 130, fill: '#451a03' }
    ],
    template3: [
      { id: 'leftBg', type: 'rect', name: 'Left Panel BG', x: 0, y: 0, w: 1750, h: 2600, radius: 0, fill: '#1e1b4b' },
      { id: 'stripeDivider', type: 'rect', name: 'Neon Stripe Divider', x: 1750, y: 0, w: 40, h: 2600, radius: 0, fill: '#a855f7' },
      { id: 'featBg', type: 'rect', name: 'Featured Icon Box BG', x: 225, y: 180, w: 1300, h: 1300, radius: 120, fill: '#ffffff' },
      { id: 'featIcon', type: 'featured', name: 'Featured Preview Icon', x: 225, y: 180, w: 1300, h: 1300 },
      { id: 'titleText', type: 'text', name: 'Title Text', x: 875, y: 1650, fontSize: 130, fontFamily: 'Outfit', fill: '#e9d5ff', text: '[NAME]' },
      { id: 'titleLine', type: 'rect', name: 'Title Accent Line', x: 675, y: 1740, w: 400, h: 14, radius: 7, fill: '#a855f7' },
      { id: 'titleDot1', type: 'rect', name: 'Title Accent Dot 1', x: 820, y: 1830, w: 20, h: 20, radius: 10, fill: '#a855f7' },
      { id: 'titleDot2', type: 'rect', name: 'Title Accent Dot 2', x: 860, y: 1825, w: 30, h: 30, radius: 15, fill: '#a855f7' },
      { id: 'titleDot3', type: 'rect', name: 'Title Accent Dot 3', x: 910, y: 1830, w: 20, h: 20, radius: 10, fill: '#a855f7' },
      { id: 'badgeBg', type: 'rect', name: 'Violet Pill Badge', x: 200, y: 2050, w: 1350, h: 180, radius: 90, fill: '#7e22ce' },
      { id: 'badgeText', type: 'text', name: 'Badge Text', x: 875, y: 2160, fontSize: 68, fontFamily: 'Outfit', fill: '#ffffff', text: '[COUNT] STROKE SVG' },
      { id: 'rightBg', type: 'rect', name: 'Right Panel BG', x: 1790, y: 0, w: 4210, h: 2600, radius: 0, fill: '#f5f3ff' },
      { id: 'iconGrid', type: 'grid', name: 'Icons Grid Area', x: 1880, y: 100, w: 4030, h: 2400, padding: 140, fill: '#1e1b4b' }
    ],
    template4: [
      { id: 'leftBg', type: 'rect', name: 'Left Obsidian BG', x: 0, y: 0, w: 1600, h: 2600, radius: 0, fill: '#09090b' },
      { id: 'topAccent', type: 'rect', name: 'Gold Top Line', x: 0, y: 0, w: 1600, h: 36, radius: 0, fill: '#fbbf24' },
      { id: 'featBg', type: 'rect', name: 'Featured Icon Box BG', x: 180, y: 180, w: 1240, h: 1240, radius: 90, fill: '#ffffff' },
      { id: 'featIcon', type: 'featured', name: 'Featured Preview Icon', x: 180, y: 180, w: 1240, h: 1240 },
      { id: 'titleText', type: 'text', name: 'Title Text', x: 800, y: 1650, fontSize: 130, fontFamily: 'Outfit', fill: '#fbbf24', text: '[NAME]' },
      { id: 'titleLine', type: 'rect', name: 'Title Accent Line', x: 600, y: 1740, w: 400, h: 14, radius: 7, fill: '#f59e0b' },
      { id: 'titleDot1', type: 'rect', name: 'Title Accent Dot 1', x: 745, y: 1830, w: 20, h: 20, radius: 10, fill: '#fbbf24' },
      { id: 'titleDot2', type: 'rect', name: 'Title Accent Dot 2', x: 785, y: 1825, w: 30, h: 30, radius: 15, fill: '#f59e0b' },
      { id: 'titleDot3', type: 'rect', name: 'Title Accent Dot 3', x: 835, y: 1830, w: 20, h: 20, radius: 10, fill: '#fbbf24' },
      { id: 'badgeBg', type: 'rect', name: 'Gold Pill Badge', x: 200, y: 2050, w: 1200, h: 180, radius: 90, fill: '#fbbf24' },
      { id: 'badgeText', type: 'text', name: 'Badge Text', x: 800, y: 2160, fontSize: 68, fontFamily: 'Outfit', fill: '#09090b', text: '[COUNT] GOLDEN ICONS' },
      { id: 'rightBg', type: 'rect', name: 'Luxe White Canvas BG', x: 1600, y: 0, w: 4400, h: 2600, radius: 0, fill: '#ffffff' },
      { id: 'iconGrid', type: 'grid', name: 'Icons Grid Area', x: 1680, y: 100, w: 4240, h: 2400, padding: 140, fill: '#09090b' }
    ],
    template5: [
      { id: 'leftBg', type: 'rect', name: 'Left Grid Panel BG', x: 0, y: 0, w: 4400, h: 2600, radius: 0, fill: '#ecfeff' },
      { id: 'rightBg', type: 'rect', name: 'Right Sidebar BG', x: 4400, y: 0, w: 1600, h: 2600, radius: 0, fill: '#083344' },
      { id: 'topAccent', type: 'rect', name: 'Aqua Accent Line', x: 4400, y: 0, w: 1600, h: 36, radius: 0, fill: '#22d3ee' },
      { id: 'featBg', type: 'rect', name: 'Featured Icon Box BG', x: 4580, y: 180, w: 1240, h: 1240, radius: 120, fill: '#ffffff' },
      { id: 'featIcon', type: 'featured', name: 'Featured Preview Icon', x: 4580, y: 180, w: 1240, h: 1240 },
      { id: 'titleText', type: 'text', name: 'Title Text', x: 5200, y: 1650, fontSize: 130, fontFamily: 'Outfit', fill: '#ffffff', text: '[NAME]' },
      { id: 'titleLine', type: 'rect', name: 'Title Accent Line', x: 5000, y: 1740, w: 400, h: 14, radius: 7, fill: '#22d3ee' },
      { id: 'titleDot1', type: 'rect', name: 'Title Accent Dot 1', x: 5145, y: 1830, w: 20, h: 20, radius: 10, fill: '#22d3ee' },
      { id: 'titleDot2', type: 'rect', name: 'Title Accent Dot 2', x: 5185, y: 1825, w: 30, h: 30, radius: 15, fill: '#22d3ee' },
      { id: 'titleDot3', type: 'rect', name: 'Title Accent Dot 3', x: 5235, y: 1830, w: 20, h: 20, radius: 10, fill: '#22d3ee' },
      { id: 'badgeBg', type: 'rect', name: 'Aqua Pill Badge', x: 4600, y: 2050, w: 1200, h: 180, radius: 90, fill: '#0891b2' },
      { id: 'badgeText', type: 'text', name: 'Badge Text', x: 5200, y: 2160, fontSize: 68, fontFamily: 'Outfit', fill: '#ffffff', text: '[COUNT] PREMIUM ICONS' },
      { id: 'iconGrid', type: 'grid', name: 'Icons Grid Area', x: 100, y: 100, w: 4200, h: 2400, padding: 140, fill: '#083344' }
    ],
    template6: [
      { id: 'outerFrame', type: 'rect', name: 'Outer Frame BG', x: 0, y: 0, w: 6000, h: 2600, radius: 0, fill: '#fff1f2' },
      { id: 'mainCard', type: 'rect', name: 'Main Crimson Card Frame', x: 80, y: 80, w: 5840, h: 2440, radius: 60, fill: '#4c0519' },
      { id: 'featBg', type: 'rect', name: 'Featured Icon Box BG', x: 250, y: 220, w: 1200, h: 1200, radius: 80, fill: '#ffffff' },
      { id: 'featIcon', type: 'featured', name: 'Featured Preview Icon', x: 250, y: 220, w: 1200, h: 1200 },
      { id: 'titleText', type: 'text', name: 'Title Text', x: 850, y: 1620, fontSize: 130, fontFamily: 'Outfit', fill: '#ffffff', text: '[NAME]' },
      { id: 'titleLine', type: 'rect', name: 'Title Accent Line', x: 650, y: 1720, w: 400, h: 14, radius: 7, fill: '#fb7185' },
      { id: 'titleDot1', type: 'rect', name: 'Title Accent Dot 1', x: 795, y: 1810, w: 20, h: 20, radius: 10, fill: '#fb7185' },
      { id: 'titleDot2', type: 'rect', name: 'Title Accent Dot 2', x: 835, y: 1805, w: 30, h: 30, radius: 15, fill: '#fb7185' },
      { id: 'titleDot3', type: 'rect', name: 'Title Accent Dot 3', x: 885, y: 1810, w: 20, h: 20, radius: 10, fill: '#fb7185' },
      { id: 'badgeBg', type: 'rect', name: 'Rose Bottom Box', x: 250, y: 2000, w: 1200, h: 180, radius: 90, fill: '#e11d48' },
      { id: 'badgeText', type: 'text', name: 'Badge Text', x: 850, y: 2110, fontSize: 68, fontFamily: 'Outfit', fill: '#ffffff', text: '[COUNT] STROKE ICONS' },
      { id: 'gridCard', type: 'rect', name: 'Embedded White Grid Card', x: 1750, y: 180, w: 4000, h: 2240, radius: 50, fill: '#ffffff' },
      { id: 'iconGrid', type: 'grid', name: 'Icons Grid Area', x: 1850, y: 260, w: 3800, h: 2080, padding: 130, fill: '#4c0519' }
    ],
    template7: [
      { id: 'leftBg', type: 'rect', name: 'Left Sidebar BG', x: 0, y: 0, w: 1700, h: 2600, radius: 0, fill: '#1c1917' },
      { id: 'topArchPill', type: 'rect', name: 'Top Arch Pill Header', x: 250, y: 100, w: 1200, h: 160, radius: 80, fill: '#ca8a04' },
      { id: 'topArchText', type: 'text', name: 'Arch Header Text', x: 850, y: 205, fontSize: 54, fontFamily: 'Outfit', fill: '#1c1917', text: 'PREMIUM VECTOR SET' },
      { id: 'featBg', type: 'rect', name: 'Featured Icon Box BG', x: 230, y: 320, w: 1240, h: 1240, radius: 60, fill: '#ffffff' },
      { id: 'featIcon', type: 'featured', name: 'Featured Preview Icon', x: 230, y: 320, w: 1240, h: 1240 },
      { id: 'titleText', type: 'text', name: 'Title Text', x: 850, y: 1720, fontSize: 135, fontFamily: 'Outfit', fill: '#eab308', text: '[NAME]' },
      { id: 'titleLine', type: 'rect', name: 'Title Accent Line', x: 550, y: 1830, w: 600, h: 16, radius: 8, fill: '#fde047' },
      { id: 'badgeBg', type: 'rect', name: 'Bottom Chocolate Box', x: 200, y: 2050, w: 1300, h: 180, radius: 90, fill: '#eab308' },
      { id: 'badgeText', type: 'text', name: 'Badge Text', x: 850, y: 2160, fontSize: 68, fontFamily: 'Outfit', fill: '#1c1917', text: '[COUNT] VECTOR ICONS' },
      { id: 'rightBg', type: 'rect', name: 'Right Panel BG', x: 1700, y: 0, w: 4300, h: 2600, radius: 0, fill: '#fafaf9' },
      { id: 'iconGrid', type: 'grid', name: 'Icons Grid Area', x: 1800, y: 100, w: 4100, h: 2400, padding: 140, fill: '#1c1917' }
    ],
    template8: [
      { id: 'headerBg', type: 'rect', name: 'Top Tech Banner BG', x: 0, y: 0, w: 6000, h: 480, radius: 0, fill: '#030712' },
      { id: 'headerAccent', type: 'rect', name: 'Cyber Cyan Accent Stripe', x: 0, y: 480, w: 6000, h: 20, radius: 0, fill: '#06b6d4' },
      { id: 'titleText', type: 'text', name: 'Title Text', x: 3000, y: 270, fontSize: 150, fontFamily: 'Outfit', fill: '#06b6d4', text: '[NAME]' },
      { id: 'leftPanelBg', type: 'rect', name: 'Left Cyber Sidebar BG', x: 0, y: 500, w: 1600, h: 2100, radius: 0, fill: '#030712' },
      { id: 'featBg', type: 'rect', name: 'Featured Icon Box BG', x: 180, y: 650, w: 1240, h: 1240, radius: 100, fill: '#ffffff' },
      { id: 'featIcon', type: 'featured', name: 'Featured Preview Icon', x: 180, y: 650, w: 1240, h: 1240 },
      { id: 'badgeBg', type: 'rect', name: 'Cyber Cyan Pill Badge', x: 200, y: 2150, w: 1200, h: 180, radius: 90, fill: '#06b6d4' },
      { id: 'badgeText', type: 'text', name: 'Badge Text', x: 800, y: 2260, fontSize: 68, fontFamily: 'Outfit', fill: '#030712', text: '[COUNT] VECTOR SVG' },
      { id: 'rightBg', type: 'rect', name: 'Right Cyber Canvas BG', x: 1600, y: 500, w: 4400, h: 2100, radius: 0, fill: '#f0f9ff' },
      { id: 'iconGrid', type: 'grid', name: 'Icons Grid Area', x: 1680, y: 580, w: 4240, h: 1940, padding: 130, fill: '#030712' }
    ],
    template9: [
      { id: 'leftBg', type: 'rect', name: 'Left Sidebar BG', x: 0, y: 0, w: 1650, h: 2600, radius: 0, fill: '#2e1065' },
      { id: 'topAccent', type: 'rect', name: 'Orchid Magenta Line', x: 0, y: 0, w: 1650, h: 36, radius: 0, fill: '#d946ef' },
      { id: 'featBg', type: 'ellipse', name: 'Circular Featured Box BG', x: 205, y: 180, w: 1240, h: 1240, fill: '#ffffff' },
      { id: 'featIcon', type: 'featured', name: 'Featured Preview Icon', x: 205, y: 180, w: 1240, h: 1240 },
      { id: 'titleText', type: 'text', name: 'Title Text', x: 825, y: 1650, fontSize: 130, fontFamily: 'Outfit', fill: '#ffffff', text: '[NAME]' },
      { id: 'titleLine', type: 'rect', name: 'Title Accent Line', x: 625, y: 1740, w: 400, h: 14, radius: 7, fill: '#d946ef' },
      { id: 'titleDot1', type: 'rect', name: 'Title Accent Dot 1', x: 770, y: 1830, w: 20, h: 20, radius: 10, fill: '#d946ef' },
      { id: 'titleDot2', type: 'rect', name: 'Title Accent Dot 2', x: 810, y: 1825, w: 30, h: 30, radius: 15, fill: '#d946ef' },
      { id: 'titleDot3', type: 'rect', name: 'Title Accent Dot 3', x: 860, y: 1830, w: 20, h: 20, radius: 10, fill: '#d946ef' },
      { id: 'badgeBg', type: 'rect', name: 'Orchid Pill Badge', x: 200, y: 2050, w: 1250, h: 180, radius: 90, fill: '#c026d3' },
      { id: 'badgeText', type: 'text', name: 'Badge Text', x: 825, y: 2160, fontSize: 68, fontFamily: 'Outfit', fill: '#ffffff', text: '[COUNT] EDITABLE ICONS' },
      { id: 'rightBg', type: 'rect', name: 'Right Panel BG', x: 1650, y: 0, w: 4350, h: 2600, radius: 0, fill: '#fdf4ff' },
      { id: 'iconGrid', type: 'grid', name: 'Icons Grid Area', x: 1750, y: 100, w: 4150, h: 2400, padding: 140, fill: '#2e1065' }
    ]
  };

  const sheetPresetThemes = {};
  Object.keys(defaultTemplateGeometries).forEach(k => {
    sheetPresetThemes[k] = defaultTemplateGeometries[k].map(l => ({ ...l }));
  });

  // Load custom presets from LocalStorage
  let customPresets = {};
  try {
    customPresets = JSON.parse(localStorage.getItem('gravity_sheet_presets')) || {};
  } catch (e) {}
  Object.assign(sheetPresetThemes, customPresets);

  // Restore last selected active preset from LocalStorage
  const savedActiveThemeKey = localStorage.getItem('gravity_active_preset') || 'template1';
  let activeLayers = (sheetPresetThemes[savedActiveThemeKey] || sheetPresetThemes.template1).map(l => ({ ...l }));

  // Sync color inputs
  if (vecFillColor && vecFillHex) {
    vecFillColor.addEventListener('input', () => {
      vecFillHex.value = vecFillColor.value;
      activeLayers.forEach(l => {
        if (l.type === 'grid' || l.type === 'featured') {
          l.fill = vecFillColor.value;
        }
      });
      buildBrandedSvgSheet();
    });
    vecFillHex.addEventListener('input', () => {
      if (/^#[0-9a-f]{6}$/i.test(vecFillHex.value)) {
        vecFillColor.value = vecFillHex.value;
        activeLayers.forEach(l => {
          if (l.type === 'grid' || l.type === 'featured') {
            l.fill = vecFillHex.value;
          }
        });
        buildBrandedSvgSheet();
      }
    });
  }

  if (vecLabelColor && vecLabelHex) {
    vecLabelColor.addEventListener('input', () => {
      vecLabelHex.value = vecLabelColor.value;
      buildBrandedSvgSheet();
    });
    vecLabelHex.addEventListener('input', () => {
      if (/^#[0-9a-f]{6}$/i.test(vecLabelHex.value)) {
        vecLabelColor.value = vecLabelHex.value;
        buildBrandedSvgSheet();
      }
    });
  }

  if (vecSmoothing && vecSmoothingVal) {
    vecSmoothing.addEventListener('input', () => vecSmoothingVal.textContent = vecSmoothing.value);
  }
  if (vecCorner && vecCornerVal) {
    vecCorner.addEventListener('input', () => vecCornerVal.textContent = vecCorner.value);
  }
  if (vecSimplify && vecSimplifyVal) {
    vecSimplify.addEventListener('input', () => vecSimplifyVal.textContent = (parseInt(vecSimplify.value) / 10).toFixed(1));
  }
  if (vecSpeckle && vecSpeckleVal) {
    vecSpeckle.addEventListener('input', () => vecSpeckleVal.textContent = vecSpeckle.value);
  }

  // Segmented button events styling support
  document.querySelectorAll('.upscale-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.upscale-btn').forEach(b => {
        b.classList.remove('active');
        b.style.background = 'transparent';
        b.style.color = '#fff';
      });
      btn.classList.add('active');
      btn.style.background = 'var(--primary)';
      btn.style.color = 'var(--on-primary)';
      if (vecUpscale) vecUpscale.value = btn.getAttribute('data-val');
      if (loadedSheetImg) {
        processIconSheetSlicingOnly();
      }
    });
  });

  document.querySelectorAll('.detail-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.detail-btn').forEach(b => {
        b.classList.remove('active');
        b.style.background = 'transparent';
        b.style.color = '#fff';
      });
      btn.classList.add('active');
      btn.style.background = 'var(--primary)';
      btn.style.color = 'var(--on-primary)';
      if (vecTraceDetail) vecTraceDetail.value = btn.getAttribute('data-val');
    });
  });

  document.querySelectorAll('.layout-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.layout-btn').forEach(b => {
        b.classList.remove('active');
        b.style.background = 'transparent';
        b.style.color = '#fff';
      });
      btn.classList.add('active');
      btn.style.background = 'var(--primary)';
      btn.style.color = 'var(--on-primary)';
      if (sheetLayout) sheetLayout.value = btn.getAttribute('data-val');
      buildBrandedSvgSheet();
    });
  });

  // Rebuild template preset select options
  function rebuildPresetDropdown(preferredVal) {
    const presetSelects = [
      document.getElementById('sheetPresetSelect'),
      document.getElementById('sheetPresetSelectTiles')
    ].filter(Boolean);

    if (presetSelects.length === 0) return;
    const primarySelect = presetSelects[0];
    const selectedVal = preferredVal || primarySelect.value || 'template1';

    const builtins = {
      template1: 'Electric Forest Emerald (Template 1)',
      template2: 'Warm Terracotta Sunset (Template 2)',
      template3: 'Neon Violet Cyber (Template 3)',
      template4: 'Obsidian Gold Royale (Template 4)',
      template5: 'Deep Ocean Turquoise (Template 5)',
      template6: 'Crimson Ruby Luxe (Template 6)',
      template7: 'Golden Honey Amber (Template 7)',
      template8: 'Midnight Cobalt Studio (Template 8)',
      template9: 'Royal Velvet Orchid (Template 9)'
    };

    let saved = {};
    try {
      saved = JSON.parse(localStorage.getItem('gravity_sheet_presets')) || {};
    } catch (e) {}

    presetSelects.forEach(sel => {
      sel.innerHTML = '';

      Object.keys(builtins).forEach(key => {
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = builtins[key];
        sel.appendChild(opt);
      });

      Object.keys(saved).forEach(key => {
        sheetPresetThemes[key] = saved[key].map(l => ({ ...l }));
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = key + ' (Custom)';
        sel.appendChild(opt);
      });

      if ([...sel.options].some(o => o.value === selectedVal)) {
        sel.value = selectedVal;
      } else {
        sel.value = 'template1';
      }

      updateCustomSelectUI(sel);
    });
  }

  // Bind change listeners to sync preset theme dropdowns across both Tiles Grid & Presentation views
  const sheetPresetSelectTilesEl = document.getElementById('sheetPresetSelectTiles');
  
  function applyPresetSelection(val) {
    const mainSel = document.getElementById('sheetPresetSelect');
    const tilesSel = document.getElementById('sheetPresetSelectTiles');
    if (mainSel && mainSel.value !== val) mainSel.value = val;
    if (tilesSel && tilesSel.value !== val) tilesSel.value = val;

    let baseKey = val;
    if (!sheetPresetThemes[baseKey] && !defaultTemplateGeometries[baseKey]) {
      baseKey = 'template1';
    }

    const templateSource = sheetPresetThemes[baseKey] || defaultTemplateGeometries[baseKey];
    if (templateSource) {
      activeLayers = templateSource.map(l => ({ ...l }));
      currentDesignerLayerId = activeLayers.length > 0 ? activeLayers[0].id : null;
      
      const gridLayer = activeLayers.find(l => l.type === 'grid');
      if (gridLayer) {
        if (gridLayer.fill && vecFillColor) {
          vecFillColor.value = gridLayer.fill;
          if (vecFillHex) vecFillHex.value = gridLayer.fill;
        }
        if (gridLayer.labelColor && vecLabelColor) {
          vecLabelColor.value = gridLayer.labelColor;
          if (vecLabelHex) vecLabelHex.value = gridLayer.labelColor;
        }
      }

      if (currentDesignerLayerId) {
        loadDesignerLayerFields(currentDesignerLayerId);
      } else {
        clearDesignerLayerFields();
      }
      renderDesignerLayersTree();
      buildBrandedSvgSheet();
    }
  }

  if (sheetPresetSelect) {
    sheetPresetSelect.addEventListener('change', () => applyPresetSelection(sheetPresetSelect.value));
  }
  if (sheetPresetSelectTilesEl) {
    sheetPresetSelectTilesEl.addEventListener('change', () => applyPresetSelection(sheetPresetSelectTilesEl.value));
  }

  // Populate custom presets into dropdown immediately on initialization
  rebuildPresetDropdown();

  // Define designer properties inputs
  let currentDesignerLayerId = 'leftBg';
  let selectedLayerIds = [];

  function updateAlignmentCardVisibility() {
    const alignButtons = [
      'btnAlignLeft', 'btnAlignCenterX', 'btnAlignRight',
      'btnAlignTop', 'btnAlignCenterY', 'btnAlignBottom'
    ];
    const canAlign = selectedLayerIds.length >= 2;
    alignButtons.forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.disabled = !canAlign;
        btn.style.opacity = canAlign ? '1' : '0.4';
        btn.style.pointerEvents = canAlign ? 'auto' : 'none';
      }
    });

    const canGroup = selectedLayerIds.length >= 2;
    const canUngroup = activeLayers.some(l => 
      (selectedLayerIds.includes(l.id) || l.id === currentDesignerLayerId) && l.groupId
    );

    const canDuplicate = (selectedLayerIds && selectedLayerIds.length > 0) || !!currentDesignerLayerId;
    ['btnDuplicateLayer', 'btnTreeDuplicate'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.disabled = !canDuplicate;
        btn.style.opacity = canDuplicate ? '1' : '0.4';
        btn.style.pointerEvents = canDuplicate ? 'auto' : 'none';
      }
    });

    const btnTreeGroupEl = document.getElementById('btnTreeGroup');
    if (btnTreeGroupEl) {
      btnTreeGroupEl.disabled = !canGroup;
      btnTreeGroupEl.style.opacity = canGroup ? '1' : '0.4';
      btnTreeGroupEl.style.pointerEvents = canGroup ? 'auto' : 'none';
    }

    const btnTreeUngroupEl = document.getElementById('btnTreeUngroup');
    if (btnTreeUngroupEl) {
      btnTreeUngroupEl.disabled = !canUngroup;
      btnTreeUngroupEl.style.opacity = canUngroup ? '1' : '0.4';
      btnTreeUngroupEl.style.pointerEvents = canUngroup ? 'auto' : 'none';
    }
  }

  // Deselect all active layers and clear selection overlays
  function deselectAllDesignerLayers() {
    if (selectedLayerIds.length === 0 && !currentDesignerLayerId) return;
    selectedLayerIds = [];
    currentDesignerLayerId = null;
    clearDesignerLayerFields();
    renderDesignerLayersTree();
    updateAlignmentCardVisibility();
    buildBrandedSvgSheet();
  }

  // History Undo/Redo States
  let undoStack = [];
  let redoStack = [];
  const maxHistorySize = 50;

  function saveHistoryState() {
    // Clone active layers deeply
    const state = JSON.stringify(activeLayers);
    
    // Only push if the state actually changed compared to the last state in the stack
    if (undoStack.length > 0 && undoStack[undoStack.length - 1] === state) {
      return;
    }
    
    undoStack.push(state);
    if (undoStack.length > maxHistorySize) {
      undoStack.shift();
    }
    redoStack = []; // Clear redo stack on new action
    
    updateHistoryButtonsState();
  }

  function undo() {
    if (undoStack.length === 0) return;
    
    // Push current state to redo stack
    const currentState = JSON.stringify(activeLayers);
    redoStack.push(currentState);
    
    // Pop state from undo stack
    const previousState = JSON.parse(undoStack.pop());
    activeLayers = previousState;
    
    // Reset selection if the currently selected layer no longer exists
    if (currentDesignerLayerId && !activeLayers.some(l => l.id === currentDesignerLayerId)) {
      currentDesignerLayerId = activeLayers.length > 0 ? activeLayers[0].id : null;
    }
    
    renderDesignerLayersTree();
    if (currentDesignerLayerId) {
      loadDesignerLayerFields(currentDesignerLayerId);
    } else {
      clearDesignerLayerFields();
    }
    
    buildBrandedSvgSheet();
    updateHistoryButtonsState();
  }

  function redo() {
    if (redoStack.length === 0) return;
    
    // Push current state to undo stack
    const currentState = JSON.stringify(activeLayers);
    undoStack.push(currentState);
    
    // Pop from redo stack
    const nextState = JSON.parse(redoStack.pop());
    activeLayers = nextState;
    
    // Reset selection if needed
    if (currentDesignerLayerId && !activeLayers.some(l => l.id === currentDesignerLayerId)) {
      currentDesignerLayerId = activeLayers.length > 0 ? activeLayers[0].id : null;
    }

    renderDesignerLayersTree();
    if (currentDesignerLayerId) {
      loadDesignerLayerFields(currentDesignerLayerId);
    } else {
      clearDesignerLayerFields();
    }
    
    buildBrandedSvgSheet();
    updateHistoryButtonsState();
  }

  function updateHistoryButtonsState() {
    const btnUndo = document.getElementById('btnUndo');
    const btnRedo = document.getElementById('btnRedo');
    if (btnUndo) btnUndo.disabled = (undoStack.length === 0);
    if (btnRedo) btnRedo.disabled = (redoStack.length === 0);
  }

  const uiElements = {
    labelTitle: document.getElementById('designerActiveLayerTitle'),
    propX: document.getElementById('propX'),
    propY: document.getElementById('propY'),
    propW: document.getElementById('propW'),
    propH: document.getElementById('propH'),
    propColor: document.getElementById('propColor'),
    propColorHex: document.getElementById('propColorHex'),
    propRadius: document.getElementById('propRadius'),
    propRadiusSlider: document.getElementById('propRadiusSlider'),
    propRotate: document.getElementById('propRotate'),
    propRotateSlider: document.getElementById('propRotateSlider'),
    propFont: document.getElementById('propFont'),
    propText: document.getElementById('propText'),
    propFeaturedIconSelect: document.getElementById('propFeaturedIconSelect'),
    propFeaturedIconField: document.getElementById('propFeaturedIconField'),
    btnResetLayoutColors: document.getElementById('btnResetLayoutColors'),
    newPresetName: document.getElementById('newPresetName'),
    btnSavePreset: document.getElementById('btnSavePreset'),
    btnDeletePreset: document.getElementById('btnDeletePreset'),
    propRadiusField: document.getElementById('propRadiusField'),
    propRotateField: document.getElementById('propRotateField'),
    propFontField: document.getElementById('propFontField'),
    propWField: document.getElementById('propWField'),
    propFontSizeField: document.getElementById('propFontSizeField'),
    propFontSizeSlider: document.getElementById('propFontSizeSlider'),
    propFontSize: document.getElementById('propFontSize'),
    btnDuplicateLayer: document.getElementById('btnDuplicateLayer'),
    btnDeleteSelectedLayer: document.getElementById('btnDeleteSelectedLayer')
  };

  // Compile layers list buttons dynamically
  function renderDesignerLayersTree() {
    const listEl = document.getElementById('designerLayerList');
    if (!listEl) return;
    listEl.innerHTML = '';

    [...activeLayers].reverse().forEach((layer) => {
      const idx = activeLayers.findIndex(l => l.id === layer.id);
      const btn = document.createElement('div');
      btn.style.display = 'flex';
      btn.style.alignItems = 'center';
      btn.style.justifyContent = 'space-between';
      btn.style.width = '100%';
      const isSelected = (selectedLayerIds && selectedLayerIds.includes(layer.id)) || currentDesignerLayerId === layer.id;
      btn.style.border = '1px solid ' + (isSelected ? 'var(--outline-variant)' : 'transparent');
      btn.style.background = isSelected ? 'var(--surface)' : 'transparent';
      btn.style.color = isSelected ? '#fff' : 'rgba(255,255,255,0.7)';
      btn.style.fontSize = '12px';
      btn.style.padding = '6px 10px';
      btn.style.borderRadius = '8px';
      btn.style.cursor = 'grab';
      btn.style.transition = 'all 0.2s';

      // HTML5 Drag and Drop Handlers
      btn.setAttribute('draggable', 'true');
      btn.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', layer.id);
        btn.style.opacity = '0.4';
      });
      btn.addEventListener('dragend', () => {
        btn.style.opacity = '1';
        renderDesignerLayersTree();
      });
      btn.addEventListener('dragover', (e) => {
        e.preventDefault();
      });
      btn.addEventListener('dragenter', () => {
        btn.style.border = '1px dashed var(--accent)';
        btn.style.background = 'rgba(255, 255, 255, 0.05)';
      });
      btn.addEventListener('dragleave', () => {
        const stillSelected = (selectedLayerIds && selectedLayerIds.includes(layer.id)) || currentDesignerLayerId === layer.id;
        btn.style.border = '1px solid ' + (stillSelected ? 'var(--outline-variant)' : 'transparent');
        btn.style.background = stillSelected ? 'var(--surface)' : 'transparent';
      });
      btn.addEventListener('drop', (e) => {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData('text/plain');
        if (draggedId && draggedId !== layer.id) {
          const fromIdx = activeLayers.findIndex(l => l.id === draggedId);
          const toIdx = activeLayers.findIndex(l => l.id === layer.id);
          if (fromIdx !== -1 && toIdx !== -1) {
            saveHistoryState();
            const [draggedLayer] = activeLayers.splice(fromIdx, 1);
            const newToIdx = activeLayers.findIndex(l => l.id === layer.id);
            activeLayers.splice(newToIdx, 0, draggedLayer);
            renderDesignerLayersTree();
            buildBrandedSvgSheet();
          }
        }
      });

      // Checkbox for Alignment & Grouping Multi-Selection
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.style.marginRight = '8px';
      checkbox.style.cursor = 'pointer';
      checkbox.checked = selectedLayerIds.includes(layer.id);
      checkbox.addEventListener('click', (e) => e.stopPropagation());
      checkbox.addEventListener('change', () => {
        const targetMemberIds = layer.groupId
          ? activeLayers.filter(l => l.groupId === layer.groupId).map(l => l.id)
          : [layer.id];

        if (checkbox.checked) {
          targetMemberIds.forEach(id => {
            if (!selectedLayerIds.includes(id)) selectedLayerIds.push(id);
          });
          currentDesignerLayerId = layer.id;
          loadDesignerLayerFields(layer.id);
        } else {
          selectedLayerIds = selectedLayerIds.filter(id => !targetMemberIds.includes(id));
          if (targetMemberIds.includes(currentDesignerLayerId)) {
            currentDesignerLayerId = selectedLayerIds[selectedLayerIds.length - 1] || null;
            if (currentDesignerLayerId) {
              loadDesignerLayerFields(currentDesignerLayerId);
            } else {
              clearDesignerLayerFields();
            }
          }
        }
        updateAlignmentCardVisibility();
        renderDesignerLayersTree();
        buildBrandedSvgSheet();
      });
      btn.appendChild(checkbox);
      
      let emoji = '▭';
      if (layer.type === 'ellipse') emoji = '⬭';
      if (layer.type === 'text') emoji = 'T';
      if (layer.type === 'grid') emoji = '▦';
      if (layer.type === 'featured') emoji = '★';

      const groupBadge = layer.groupId
        ? `<span style="font-size: 9px; padding: 1px 5px; border-radius: 4px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); margin-left: 6px; font-weight: 700; white-space: nowrap;">⊞ ${escapeXml(layer.groupName || 'Group')}</span>`
        : '';

      const nameSpan = document.createElement('span');
      nameSpan.style.flex = '1';
      nameSpan.style.textAlign = 'left';
      nameSpan.innerHTML = `${emoji} ${escapeXml(layer.name)} ${groupBadge}`;
      nameSpan.style.opacity = (layer.visible !== false) ? '1' : '0.4';

      const selectRowLayer = (e) => {
        const isMulti = e.shiftKey || e.ctrlKey || e.metaKey;
        const targetMemberIds = layer.groupId
          ? activeLayers.filter(l => l.groupId === layer.groupId).map(l => l.id)
          : [layer.id];

        if (isMulti) {
          const allIn = targetMemberIds.every(id => selectedLayerIds.includes(id));
          if (allIn) {
            selectedLayerIds = selectedLayerIds.filter(id => !targetMemberIds.includes(id));
            if (targetMemberIds.includes(currentDesignerLayerId)) {
              currentDesignerLayerId = selectedLayerIds[selectedLayerIds.length - 1] || null;
            }
          } else {
            targetMemberIds.forEach(id => {
              if (!selectedLayerIds.includes(id)) selectedLayerIds.push(id);
            });
            currentDesignerLayerId = layer.id;
          }
        } else {
          currentDesignerLayerId = layer.id;
          selectedLayerIds = [...targetMemberIds];
        }

        if (currentDesignerLayerId) {
          loadDesignerLayerFields(currentDesignerLayerId);
        } else {
          clearDesignerLayerFields();
        }
        renderDesignerLayersTree();
        updateAlignmentCardVisibility();
        buildBrandedSvgSheet();
      };

      nameSpan.addEventListener('click', (e) => {
        e.stopPropagation();
        selectRowLayer(e);
      });

      btn.addEventListener('click', (e) => {
        if (e.target.closest('button') || e.target.type === 'checkbox') return;
        selectRowLayer(e);
      });

      const controlsWrap = document.createElement('div');
      controlsWrap.style.display = 'flex';
      controlsWrap.style.alignItems = 'center';
      controlsWrap.style.gap = '6px';

      // Move Up
      const btnUp = document.createElement('button');
      btnUp.type = 'button';
      btnUp.textContent = '▲';
      btnUp.title = 'Move Up';
      btnUp.style.border = 'none';
      btnUp.style.background = 'transparent';
      btnUp.style.color = idx === activeLayers.length - 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)';
      btnUp.style.cursor = idx === activeLayers.length - 1 ? 'default' : 'pointer';
      btnUp.style.padding = '2px 4px';
      btnUp.style.fontSize = '10px';
      btnUp.disabled = idx === activeLayers.length - 1;
      btnUp.addEventListener('click', (e) => {
        e.stopPropagation();
        saveHistoryState();
        const temp = activeLayers[idx];
        activeLayers[idx] = activeLayers[idx + 1];
        activeLayers[idx + 1] = temp;
        renderDesignerLayersTree();
        buildBrandedSvgSheet();
      });

      // Move Down
      const btnDown = document.createElement('button');
      btnDown.type = 'button';
      btnDown.textContent = '▼';
      btnDown.title = 'Move Down';
      btnDown.style.border = 'none';
      btnDown.style.background = 'transparent';
      btnDown.style.color = idx === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)';
      btnDown.style.cursor = idx === 0 ? 'default' : 'pointer';
      btnDown.style.padding = '2px 4px';
      btnDown.style.fontSize = '10px';
      btnDown.disabled = idx === 0;
      btnDown.addEventListener('click', (e) => {
        e.stopPropagation();
        saveHistoryState();
        const temp = activeLayers[idx];
        activeLayers[idx] = activeLayers[idx - 1];
        activeLayers[idx - 1] = temp;
        renderDesignerLayersTree();
        buildBrandedSvgSheet();
      });

      // Delete
      const btnDel = document.createElement('button');
      btnDel.type = 'button';
      btnDel.textContent = '❌';
      btnDel.title = 'Delete Element';
      btnDel.style.border = 'none';
      btnDel.style.background = 'transparent';
      btnDel.style.cursor = 'pointer';
      btnDel.style.padding = '2px 4px';
      btnDel.style.fontSize = '10px';
      btnDel.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Remove layer "${layer.name}"?`)) {
          saveHistoryState();
          activeLayers.splice(idx, 1);
          if (currentDesignerLayerId === layer.id) {
            currentDesignerLayerId = activeLayers.length > 0 ? activeLayers[0].id : null;
          }
          if (currentDesignerLayerId) {
            loadDesignerLayerFields(currentDesignerLayerId);
          } else {
            clearDesignerLayerFields();
          }
          renderDesignerLayersTree();
          buildBrandedSvgSheet();
        }
      });

      // Hide/Show Toggle
      const btnEye = document.createElement('button');
      btnEye.type = 'button';
      btnEye.textContent = '👁';
      btnEye.style.opacity = (layer.visible !== false) ? '1' : '0.25';
      btnEye.title = (layer.visible !== false) ? 'Hide Layer' : 'Show Layer';
      btnEye.addEventListener('click', (e) => {
        e.stopPropagation();
        saveHistoryState();
        layer.visible = (layer.visible !== false) ? false : true;
        renderDesignerLayersTree();
        buildBrandedSvgSheet();
      });

      // Lock/Unlock Toggle
      const btnLock = document.createElement('button');
      btnLock.type = 'button';
      btnLock.textContent = layer.locked ? '🔒' : '🔓';
      btnLock.style.opacity = layer.locked ? '1' : '0.25';
      btnLock.title = layer.locked ? 'Unlock Layer' : 'Lock Layer';
      btnLock.addEventListener('click', (e) => {
        e.stopPropagation();
        saveHistoryState();
        layer.locked = !layer.locked;
        renderDesignerLayersTree();
        buildBrandedSvgSheet();
      });

      // Style Eye and Lock buttons consistently
      [btnEye, btnLock].forEach(b => {
        b.style.border = 'none';
        b.style.background = 'transparent';
        b.style.color = 'rgba(255,255,255,0.8)';
        b.style.cursor = 'pointer';
        b.style.padding = '2px 4px';
        b.style.fontSize = '10px';
      });

      controlsWrap.appendChild(btnUp);
      controlsWrap.appendChild(btnDown);
      controlsWrap.appendChild(btnEye);
      controlsWrap.appendChild(btnLock);
      controlsWrap.appendChild(btnDel);

      btn.appendChild(nameSpan);
      btn.appendChild(controlsWrap);
      listEl.appendChild(btn);
    });
  }

  // Clear fields helper
  function clearDesignerLayerFields() {
    if (!uiElements.labelTitle) return;
    uiElements.labelTitle.textContent = 'Properties: No Selection';
    uiElements.propX.value = '';
    uiElements.propY.value = '';
    uiElements.propW.value = '';
    uiElements.propH.value = '';
    uiElements.propRadius.value = '';
    if (uiElements.propRadiusSlider) uiElements.propRadiusSlider.value = 0;
    if (uiElements.propRotate) uiElements.propRotate.value = '';
    if (uiElements.propRotateSlider) uiElements.propRotateSlider.value = 0;
    uiElements.propColor.value = '#000000';
    uiElements.propColorHex.value = '#000000';
    if (uiElements.propText) uiElements.propText.value = '';
    
    // Clear selection
    selectedLayerIds = [];
    updateAlignmentCardVisibility();
    
    document.getElementById('propTextField').style.display = 'none';
    document.getElementById('propFontField').style.display = 'none';
    document.getElementById('propRadiusField').style.display = 'none';
    if (uiElements.propRotateField) uiElements.propRotateField.style.display = 'none';
    if (uiElements.propFontSizeField) uiElements.propFontSizeField.style.display = 'none';
    if (uiElements.propWField) uiElements.propWField.style.display = 'block';
    if (uiElements.propFontSize) uiElements.propFontSize.value = '';
    if (uiElements.propFontSizeSlider) uiElements.propFontSizeSlider.value = 72;
    
    uiElements.propX.disabled = true;
    uiElements.propY.disabled = true;
    uiElements.propW.disabled = true;
    uiElements.propH.disabled = true;
    if (uiElements.propFontSize) uiElements.propFontSize.disabled = true;
    if (uiElements.propFontSizeSlider) uiElements.propFontSizeSlider.disabled = true;
    if (uiElements.propRotate) uiElements.propRotate.disabled = true;
    if (uiElements.propRotateSlider) uiElements.propRotateSlider.disabled = true;
    if (uiElements.btnDuplicateLayer) uiElements.btnDuplicateLayer.disabled = true;
    if (uiElements.btnDeleteSelectedLayer) uiElements.btnDeleteSelectedLayer.disabled = true;
  }

  // Populate input values based on selected layer
  function loadDesignerLayerFields(layerId) {
    if (!uiElements.labelTitle) return;
    currentDesignerLayerId = layerId;
    
    const layer = activeLayers.find(l => l.id === layerId);
    if (!layer) {
      clearDesignerLayerFields();
      return;
    }

    uiElements.labelTitle.textContent = `Properties: ${layer.name}`;
    
    // Enable core inputs
    uiElements.propX.disabled = false;
    uiElements.propY.disabled = false;
    uiElements.propW.disabled = false;
    uiElements.propH.disabled = false;
    if (uiElements.propRotate) uiElements.propRotate.disabled = false;
    if (uiElements.propRotateSlider) uiElements.propRotateSlider.disabled = false;
    if (uiElements.btnDuplicateLayer) uiElements.btnDuplicateLayer.disabled = false;
    if (uiElements.btnDeleteSelectedLayer) uiElements.btnDeleteSelectedLayer.disabled = false;

    // Reset visibility of special fields
    document.getElementById('propRadiusField').style.display = 'none';
    document.getElementById('propFontField').style.display = 'none';
    document.getElementById('propTextField').style.display = 'none';
    const propFeaturedIconField = document.getElementById('propFeaturedIconField');
    if (propFeaturedIconField) propFeaturedIconField.style.display = 'none';
    if (uiElements.propRotateField) uiElements.propRotateField.style.display = 'block';

    // Populate core values
    uiElements.propX.value = layer.x || 0;
    uiElements.propY.value = layer.y || 0;
    uiElements.propW.value = (layer.type === 'text') ? (layer.fontSize || 72) : (layer.w || 0);
    uiElements.propH.value = layer.h || 0;
    
    const rot = layer.rotate || 0;
    if (uiElements.propRotate) uiElements.propRotate.value = rot;
    if (uiElements.propRotateSlider) uiElements.propRotateSlider.value = rot;

    // Adjust labels and text settings
    if (layer.type === 'text') {
      if (uiElements.propWField) uiElements.propWField.style.display = 'none';
      if (document.getElementById('propHField')) document.getElementById('propHField').style.display = 'none';
      if (uiElements.propFontSizeField) uiElements.propFontSizeField.style.display = 'block';
      const fsVal = layer.fontSize || 72;
      if (uiElements.propFontSize) {
        uiElements.propFontSize.disabled = false;
        uiElements.propFontSize.value = fsVal;
      }
      if (uiElements.propFontSizeSlider) {
        uiElements.propFontSizeSlider.disabled = false;
        uiElements.propFontSizeSlider.value = Math.min(400, Math.max(16, fsVal));
      }
      document.getElementById('propFontField').style.display = 'block';
      document.getElementById('propTextField').style.display = 'block';
      uiElements.propFont.value = layer.fontFamily || 'Outfit';
      if (uiElements.propText) uiElements.propText.value = layer.text || '';
    } else {
      if (uiElements.propFontSizeField) uiElements.propFontSizeField.style.display = 'none';
      if (uiElements.propWField) uiElements.propWField.style.display = 'block';
      if (layer.type === 'line') {
        document.getElementById('lblPropW').textContent = 'Length W (px)';
        document.getElementById('lblPropH').textContent = 'Thickness H (px)';
        document.getElementById('propHField').style.display = 'block';
      } else {
        document.getElementById('lblPropW').textContent = 'Width W (px)';
        document.getElementById('lblPropH').textContent = 'Height H (px)';
        document.getElementById('propHField').style.display = 'block';
      }
    }

    // Radius / grid margins label adjustments
    if (layer.type === 'rect' || layer.type === 'triangle') {
      document.getElementById('propRadiusField').style.display = 'block';
      document.getElementById('lblPropRadius').textContent = 'Corner Radius (rx)';
      const r = layer.radius || 0;
      uiElements.propRadius.value = r;
      if (uiElements.propRadiusSlider) {
        uiElements.propRadiusSlider.max = 600;
        uiElements.propRadiusSlider.value = r;
      }
    } 
    else if (layer.type === 'grid') {
      document.getElementById('propRadiusField').style.display = 'block';
      document.getElementById('lblPropRadius').textContent = 'Grid Padding (px)';
      const p = layer.padding || 0;
      uiElements.propRadius.value = p;
      if (uiElements.propRadiusSlider) {
        uiElements.propRadiusSlider.max = 500;
        uiElements.propRadiusSlider.value = p;
      }
    }

    // Color fields & Featured Icon selector visibility
    if (layer.type === 'featured') {
      document.getElementById('propColorField').style.display = 'none';
      if (propFeaturedIconField) {
        propFeaturedIconField.style.display = 'block';
        const selectEl = document.getElementById('propFeaturedIconSelect');
        if (selectEl) {
          populateFeaturedIconSelectOptions(selectEl);
        }
      }
    } else {
      document.getElementById('propColorField').style.display = 'block';
      const c = layer.fill || '#111111';
      uiElements.propColor.value = c;
      uiElements.propColorHex.value = c;
    }
  }

  // Read input properties and save to current layout preset
  function saveCurrentFieldsToActivePreset() {
    if (!currentDesignerLayerId) return;
    const layer = activeLayers.find(l => l.id === currentDesignerLayerId);
    if (!layer) return;

    let x = parseInt(uiElements.propX.value) || 0;
    let y = parseInt(uiElements.propY.value) || 0;
    let w = parseInt(uiElements.propW.value) || 0;
    let h = parseInt(uiElements.propH.value) || 0;
    if (layer.type === 'text' && uiElements.propFontSize) {
      const fsVal = parseInt(uiElements.propFontSize.value);
      if (!isNaN(fsVal) && fsVal > 0) {
        w = fsVal;
      }
    }
    const radius = parseInt(uiElements.propRadius.value) || 0;
    const rotate = parseInt(uiElements.propRotate ? uiElements.propRotate.value : 0) || 0;
    const color = uiElements.propColor.value;
    const font = uiElements.propFont.value;
    const textVal = uiElements.propText ? uiElements.propText.value : '';

    // Enforce artboard boundary constraints (6000x2600 px)
    if (layer.type === 'text') {
      x = Math.max(0, Math.min(6000, x));
      y = Math.max(0, Math.min(2600, y));
      w = Math.max(12, w); // fontSize is represented by w in properties panel for text
    } else {
      w = Math.max(50, Math.min(6000, w));
      h = Math.max(50, Math.min(2600, h));
      x = Math.max(0, Math.min(6000 - w, x));
      y = Math.max(0, Math.min(2600 - h, y));
    }

    // Sync elements values back to fields if they were modified/clamped
    if (uiElements.propX && uiElements.propX.value !== String(x)) uiElements.propX.value = x;
    if (uiElements.propY && uiElements.propY.value !== String(y)) uiElements.propY.value = y;
    if (layer.type !== 'text') {
      if (uiElements.propW && uiElements.propW.value !== String(w)) uiElements.propW.value = w;
      if (uiElements.propH && uiElements.propH.value !== String(h)) uiElements.propH.value = h;
    } else {
      if (uiElements.propFontSize && uiElements.propFontSize.value !== String(w)) {
        uiElements.propFontSize.value = w;
      }
      if (uiElements.propFontSizeSlider && uiElements.propFontSizeSlider.value !== String(w)) {
        uiElements.propFontSizeSlider.value = Math.min(400, Math.max(16, w));
      }
      if (uiElements.propW && uiElements.propW.value !== String(w)) uiElements.propW.value = w;
    }

    layer.x = x;
    layer.y = y;
    layer.rotate = rotate;
    
    if (layer.type === 'text') {
      layer.fontSize = w; 
      layer.fontFamily = font;
      layer.text = textVal;

      // Sync manually edited title back to activeSheetObj.title
      if (layer.id === 'titleText' || layer.name.toLowerCase().includes('title text')) {
        const activeSheetObj = loadedSheetImgs.find(s => s.name === activePreviewSheetName);
        if (activeSheetObj) {
          activeSheetObj.title = window.formatTitleWordLimit ? window.formatTitleWordLimit(textVal, 2) : textVal;
        }
      }
    } else {
      layer.w = w;
      layer.h = h;
    }

    if (layer.type === 'rect' || layer.type === 'triangle') {
      layer.radius = radius;
    } else if (layer.type === 'grid') {
      layer.padding = radius; 
    }

    if (layer.type === 'featured') {
      const selectEl = document.getElementById('propFeaturedIconSelect');
      if (selectEl) {
        layer.selectedIconIndex = parseInt(selectEl.value) || 0;
      }
    } else {
      layer.fill = color;
    }

    buildBrandedSvgSheet();
  }

  // Bind properties inputs
  ['propX', 'propY', 'propW', 'propH', 'propRadius', 'propRotate'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', saveCurrentFieldsToActivePreset);
  });

  if (uiElements.propFontSizeSlider && uiElements.propFontSize) {
    uiElements.propFontSizeSlider.addEventListener('input', () => {
      const val = parseInt(uiElements.propFontSizeSlider.value) || 72;
      uiElements.propFontSize.value = val;
      uiElements.propW.value = val;
      saveCurrentFieldsToActivePreset();
    });
    uiElements.propFontSize.addEventListener('input', () => {
      const val = parseInt(uiElements.propFontSize.value) || 72;
      uiElements.propFontSizeSlider.value = Math.min(400, Math.max(16, val));
      uiElements.propW.value = val;
      saveCurrentFieldsToActivePreset();
    });
  }

  if (uiElements.propRadiusSlider) {
    uiElements.propRadiusSlider.addEventListener('input', () => {
      uiElements.propRadius.value = uiElements.propRadiusSlider.value;
      saveCurrentFieldsToActivePreset();
    });
    // Add input listener on numeric to sync slider back
    uiElements.propRadius.addEventListener('input', () => {
      uiElements.propRadiusSlider.value = uiElements.propRadius.value || 0;
    });
  }

  if (uiElements.propRotateSlider) {
    uiElements.propRotateSlider.addEventListener('input', () => {
      uiElements.propRotate.value = uiElements.propRotateSlider.value;
      saveCurrentFieldsToActivePreset();
    });
    uiElements.propRotate.addEventListener('input', () => {
      uiElements.propRotateSlider.value = uiElements.propRotate.value || 0;
    });
  }

  // Alignment Actions Math Helper
  function alignSelectedLayers(type) {
    if (selectedLayerIds.length < 2) return;
    saveHistoryState();

    const selectedLayers = activeLayers.filter(l => selectedLayerIds.includes(l.id));
    if (selectedLayers.length < 2) return;

    if (type === 'left') {
      const minX = Math.min(...selectedLayers.map(l => l.x || 0));
      selectedLayers.forEach(l => {
        l.x = minX;
      });
    }
    else if (type === 'right') {
      const maxRight = Math.max(...selectedLayers.map(l => l.type === 'text' ? (l.x || 0) : ((l.x || 0) + (l.w || 0))));
      selectedLayers.forEach(l => {
        if (l.type === 'text') {
          l.x = maxRight;
        } else {
          l.x = maxRight - (l.w || 0);
        }
      });
    }
    else if (type === 'centerX') {
      const minX = Math.min(...selectedLayers.map(l => l.x || 0));
      const maxRight = Math.max(...selectedLayers.map(l => l.type === 'text' ? (l.x || 0) : ((l.x || 0) + (l.w || 0))));
      const centerX = minX + (maxRight - minX) / 2;
      selectedLayers.forEach(l => {
        if (l.type === 'text') {
          l.x = Math.round(centerX);
        } else {
          l.x = Math.round(centerX - (l.w || 0) / 2);
        }
      });
    }
    else if (type === 'top') {
      const minY = Math.min(...selectedLayers.map(l => l.y || 0));
      selectedLayers.forEach(l => {
        l.y = minY;
      });
    }
    else if (type === 'bottom') {
      const maxBottom = Math.max(...selectedLayers.map(l => l.type === 'text' ? (l.y || 0) : ((l.y || 0) + (l.h || 0))));
      selectedLayers.forEach(l => {
        if (l.type === 'text') {
          l.y = maxBottom;
        } else {
          l.y = maxBottom - (l.h || 0);
        }
      });
    }
    else if (type === 'centerY') {
      const minY = Math.min(...selectedLayers.map(l => l.y || 0));
      const maxBottom = Math.max(...selectedLayers.map(l => l.type === 'text' ? (l.y || 0) : ((l.y || 0) + (l.h || 0))));
      const centerY = minY + (maxBottom - minY) / 2;
      selectedLayers.forEach(l => {
        if (l.type === 'text') {
          l.y = Math.round(centerY);
        } else {
          l.y = Math.round(centerY - (l.h || 0) / 2);
        }
      });
    }

    // Clip position constraints to artboard for each modified layer (6000x2600 px)
    selectedLayers.forEach(layer => {
      if (layer.type === 'text') {
        layer.x = Math.max(0, Math.min(6000, layer.x));
        layer.y = Math.max(0, Math.min(2600, layer.y));
      } else {
        layer.x = Math.max(0, Math.min(6000 - (layer.w || 0), layer.x));
        layer.y = Math.max(0, Math.min(2600 - (layer.h || 0), layer.y));
      }
    });

    // Sync input properties fields for current layer if it's selected
    if (currentDesignerLayerId && selectedLayerIds.includes(currentDesignerLayerId)) {
      loadDesignerLayerFields(currentDesignerLayerId);
    }

    buildBrandedSvgSheet();
  }

  // Bind alignment action buttons click events
  const alignButtonsConfig = [
    { id: 'btnAlignLeft', type: 'left' },
    { id: 'btnAlignCenterX', type: 'centerX' },
    { id: 'btnAlignRight', type: 'right' },
    { id: 'btnAlignTop', type: 'top' },
    { id: 'btnAlignCenterY', type: 'centerY' },
    { id: 'btnAlignBottom', type: 'bottom' }
  ];

  alignButtonsConfig.forEach(cfg => {
    const btn = document.getElementById(cfg.id);
    if (btn) {
      btn.addEventListener('click', () => {
        alignSelectedLayers(cfg.type);
      });
    }
  });

  // Group Selected Layers (Ctrl+G)
  function groupSelectedLayers() {
    if (selectedLayerIds.length < 2) return;
    saveHistoryState();

    // Check existing group names among active layers to pick next available number
    const existingGroupNames = activeLayers.filter(l => l.groupName).map(l => l.groupName);
    let groupNum = 1;
    while (existingGroupNames.includes(`Group ${groupNum}`)) {
      groupNum++;
    }
    const newGroupId = 'grp_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const newGroupName = `Group ${groupNum}`;

    activeLayers.forEach(l => {
      if (selectedLayerIds.includes(l.id)) {
        l.groupId = newGroupId;
        l.groupName = newGroupName;
      }
    });

    updateAlignmentCardVisibility();
    renderDesignerLayersTree();
    buildBrandedSvgSheet();
  }

  // Ungroup Selected Layers (Ctrl+Shift+G / Ctrl+U)
  function ungroupSelectedLayers() {
    const targetLayers = activeLayers.filter(l => 
      (selectedLayerIds.includes(l.id) || l.id === currentDesignerLayerId) && l.groupId
    );
    if (targetLayers.length === 0) return;

    saveHistoryState();
    const groupIdsToUngroup = [...new Set(targetLayers.map(l => l.groupId))];

    activeLayers.forEach(l => {
      if (groupIdsToUngroup.includes(l.groupId)) {
        delete l.groupId;
        delete l.groupName;
      }
    });

    updateAlignmentCardVisibility();
    renderDesignerLayersTree();
    buildBrandedSvgSheet();
  }

  // Bind Group and Ungroup UI triggers
  const btnTreeGroup = document.getElementById('btnTreeGroup');
  if (btnTreeGroup) btnTreeGroup.addEventListener('click', groupSelectedLayers);

  const btnTreeUngroup = document.getElementById('btnTreeUngroup');
  if (btnTreeUngroup) btnTreeUngroup.addEventListener('click', ungroupSelectedLayers);

  if (uiElements.propColor && uiElements.propColorHex) {
    uiElements.propColor.addEventListener('input', () => {
      uiElements.propColorHex.value = uiElements.propColor.value;
      saveCurrentFieldsToActivePreset();
    });
    uiElements.propColorHex.addEventListener('input', () => {
      if (/^#[0-9a-f]{6}$/i.test(uiElements.propColorHex.value)) {
        uiElements.propColor.value = uiElements.propColorHex.value;
        saveCurrentFieldsToActivePreset();
      }
    });
  }

  if (uiElements.propFont) {
    uiElements.propFont.addEventListener('change', saveCurrentFieldsToActivePreset);
  }
  if (uiElements.propText) {
    uiElements.propText.addEventListener('input', saveCurrentFieldsToActivePreset);
  }
  if (uiElements.propFeaturedIconSelect) {
    uiElements.propFeaturedIconSelect.addEventListener('change', saveCurrentFieldsToActivePreset);
    ['mousedown', 'focus', 'mouseenter'].forEach(evt => {
      uiElements.propFeaturedIconSelect.addEventListener(evt, () => populateFeaturedIconSelectOptions(uiElements.propFeaturedIconSelect));
    });
  }
  const quickFeaturedIconSelect = document.getElementById('quickFeaturedIconSelect');
  if (quickFeaturedIconSelect) {
    quickFeaturedIconSelect.addEventListener('change', (e) => {
      const idx = parseInt(e.target.value) || 0;
      let featLayer = activeLayers.find(l => l.type === 'featured');
      if (!featLayer) {
        featLayer = { id: 'featIcon', type: 'featured', name: 'Featured Preview Icon', x: 180, y: 180, w: 1240, h: 1240 };
        activeLayers.push(featLayer);
      }
      featLayer.selectedIconIndex = idx;
      if (uiElements.propFeaturedIconSelect) uiElements.propFeaturedIconSelect.value = String(idx);
      buildBrandedSvgSheet();
    });
    ['mousedown', 'focus', 'mouseenter'].forEach(evt => {
      quickFeaturedIconSelect.addEventListener(evt, () => populateFeaturedIconSelectOptions(quickFeaturedIconSelect));
    });
  }

  // Bind Add shape triggers
  const btnAddRect = document.getElementById('btnAddRect');
  const btnAddEllipse = document.getElementById('btnAddEllipse');
  const btnAddTriangle = document.getElementById('btnAddTriangle');
  const btnAddLine = document.getElementById('btnAddLine');
  const btnAddText = document.getElementById('btnAddText');
  const btnAddTitleText = document.getElementById('btnAddTitleText');
  const btnAddIconCount = document.getElementById('btnAddIconCount');
  const btnAddGrid = document.getElementById('btnAddGrid');
  const btnAddFeatured = document.getElementById('btnAddFeatured');
  const btnClearCanvas = document.getElementById('btnClearCanvas');

  if (btnAddRect) {
    btnAddRect.addEventListener('click', () => {
      saveHistoryState();
      const id = 'rect_' + Date.now();
      activeLayers.push({
        id: id,
        type: 'rect',
        name: 'Rectangle ' + (activeLayers.filter(l => l.type === 'rect').length + 1),
        x: 1000,
        y: 1000,
        w: 500,
        h: 500,
        radius: 0,
        fill: '#344e41'
      });
      currentDesignerLayerId = id;
      loadDesignerLayerFields(id);
      renderDesignerLayersTree();
      buildBrandedSvgSheet();
    });
  }

  if (btnAddEllipse) {
    btnAddEllipse.addEventListener('click', () => {
      saveHistoryState();
      const id = 'ellipse_' + Date.now();
      activeLayers.push({
        id: id,
        type: 'ellipse',
        name: 'Ellipse ' + (activeLayers.filter(l => l.type === 'ellipse').length + 1),
        x: 1000,
        y: 1000,
        w: 500,
        h: 500,
        fill: '#a3b18a'
      });
      currentDesignerLayerId = id;
      loadDesignerLayerFields(id);
      renderDesignerLayersTree();
      buildBrandedSvgSheet();
    });
  }

  if (btnAddTriangle) {
    btnAddTriangle.addEventListener('click', () => {
      saveHistoryState();
      const id = 'triangle_' + Date.now();
      activeLayers.push({
        id: id,
        type: 'triangle',
        name: 'Triangle ' + (activeLayers.filter(l => l.type === 'triangle').length + 1),
        x: 1000,
        y: 1000,
        w: 500,
        h: 500,
        fill: '#e76f51'
      });
      currentDesignerLayerId = id;
      loadDesignerLayerFields(id);
      renderDesignerLayersTree();
      buildBrandedSvgSheet();
    });
  }

  if (btnAddLine) {
    btnAddLine.addEventListener('click', () => {
      saveHistoryState();
      const id = 'line_' + Date.now();
      activeLayers.push({
        id: id,
        type: 'line',
        name: 'Line ' + (activeLayers.filter(l => l.type === 'line').length + 1),
        x: 1000,
        y: 1000,
        w: 1000,
        h: 10,
        fill: '#f4a261'
      });
      currentDesignerLayerId = id;
      loadDesignerLayerFields(id);
      renderDesignerLayersTree();
      buildBrandedSvgSheet();
    });
  }

  if (btnAddText) {
    btnAddText.addEventListener('click', () => {
      saveHistoryState();
      const id = 'text_' + Date.now();
      activeLayers.push({
        id: id,
        type: 'text',
        name: 'Text ' + (activeLayers.filter(l => l.type === 'text').length + 1),
        x: 1000,
        y: 1000,
        fontSize: 72,
        fontFamily: 'Outfit',
        fill: '#111111',
        text: 'Custom Text'
      });
      currentDesignerLayerId = id;
      loadDesignerLayerFields(id);
      renderDesignerLayersTree();
      buildBrandedSvgSheet();
    });
  }

  if (btnAddTitleText) {
    btnAddTitleText.addEventListener('click', () => {
      saveHistoryState();
      const exists = activeLayers.some(l => l.id === 'titleText');
      const layerId = exists ? 'titleText_' + Date.now() : 'titleText';
      activeLayers.push({
        id: layerId,
        type: 'text',
        name: 'Title Text',
        x: 1000,
        y: 1600,
        fontSize: 120,
        fontFamily: 'Outfit',
        fill: '#ffffff',
        text: '[NAME]'
      });
      currentDesignerLayerId = layerId;
      loadDesignerLayerFields(layerId);
      renderDesignerLayersTree();
      buildBrandedSvgSheet();
    });
  }

  if (btnAddIconCount) {
    btnAddIconCount.addEventListener('click', () => {
      saveHistoryState();
      const id = 'iconCount_' + Date.now();
      activeLayers.push({
        id: id,
        type: 'text',
        name: 'Icon Count Text',
        x: 1000,
        y: 1800,
        fontSize: 72,
        fontFamily: 'Outfit',
        fill: '#ffffff',
        text: '[COUNT] LINE ICONS Pack'
      });
      currentDesignerLayerId = id;
      loadDesignerLayerFields(id);
      renderDesignerLayersTree();
      buildBrandedSvgSheet();
    });
  }

  if (btnAddGrid) {
    btnAddGrid.addEventListener('click', () => {
      saveHistoryState();
      const id = 'grid_' + Date.now();
      activeLayers.push({
        id: id,
        type: 'grid',
        name: 'Icons Grid ' + (activeLayers.filter(l => l.type === 'grid').length + 1),
        x: 2000,
        y: 500,
        w: 3000,
        h: 1500,
        padding: 100,
        fill: '#1b263b'
      });
      currentDesignerLayerId = id;
      loadDesignerLayerFields(id);
      renderDesignerLayersTree();
      buildBrandedSvgSheet();
    });
  }

  if (btnAddFeatured) {
    btnAddFeatured.addEventListener('click', () => {
      saveHistoryState();
      const id = 'featured_' + Date.now();
      activeLayers.push({
        id: id,
        type: 'featured',
        name: 'Featured Icon ' + (activeLayers.filter(l => l.type === 'featured').length + 1),
        x: 500,
        y: 500,
        w: 1000,
        h: 1000
      });
      currentDesignerLayerId = id;
      loadDesignerLayerFields(id);
      renderDesignerLayersTree();
      buildBrandedSvgSheet();
    });
  }

  if (btnClearCanvas) {
    btnClearCanvas.addEventListener('click', () => {
      if (window.showCustomConfirm) {
        window.showCustomConfirm(
          'আপনি কি ক্যানভাস আর্টবোর্ডটি সম্পূর্ণ খালি করতে চান?',
          'ক্যানভাস মুছে ফেলা',
          'হ্যাঁ, খালি করুন',
          'বাতিল করুন',
          () => {
            saveHistoryState();
            activeLayers = [];
            currentDesignerLayerId = null;
            clearDesignerLayerFields();
            renderDesignerLayersTree();
            buildBrandedSvgSheet();
          }
        );
      } else {
        if (confirm('Clear the canvas artboard to completely blank?')) {
          saveHistoryState();
          activeLayers = [];
          currentDesignerLayerId = null;
          clearDesignerLayerFields();
          renderDesignerLayersTree();
          buildBrandedSvgSheet();
        }
      }
    });
  }

  // Save new layout preset
  const btnSavePresetEl = document.getElementById('btnSavePreset');
  if (btnSavePresetEl) {
    btnSavePresetEl.addEventListener('click', (e) => {
      if (e) e.preventDefault();
      const newPresetNameEl = document.getElementById('newPresetName');
      const name = (newPresetNameEl ? newPresetNameEl.value : '').trim();
      if (!name) {
        if (window.showCustomAlert) {
          window.showCustomAlert('অনুগ্রহ করে একটি প্রিসেটের নাম লিখুন!', 'নাম প্রয়োজন', 'warning');
        } else {
          alert('Please enter a preset name!');
        }
        return;
      }
      
      let saved = {};
      try {
        saved = JSON.parse(localStorage.getItem('gravity_sheet_presets')) || {};
      } catch(e){}
      
      // Clone all layers for saving
      saved[name] = activeLayers.map(l => ({ ...l }));
      localStorage.setItem('gravity_sheet_presets', JSON.stringify(saved));
      sheetPresetThemes[name] = activeLayers.map(l => ({ ...l }));
      
      rebuildPresetDropdown(name);
      if (newPresetNameEl) newPresetNameEl.value = '';
      if (window.showCustomAlert) {
        window.showCustomAlert(`থিম প্রিসেট "${name}" সফলভাবে সংরক্ষণ করা হয়েছে!`, 'সংরক্ষণ সফল', 'success');
      } else {
        alert(`Preset "${name}" saved successfully!`);
      }
    });
  }

  // Delete layout preset from list
  const btnDeletePresetEl = document.getElementById('btnDeletePreset');
  if (btnDeletePresetEl) {
    btnDeletePresetEl.addEventListener('click', (e) => {
      if (e) e.preventDefault();
      const selected = sheetPresetSelect ? sheetPresetSelect.value : '';
      if (!selected || ['template1', 'template2', 'template3', 'template4', 'template5', 'template6', 'template7', 'template8', 'template9'].includes(selected)) {
        if (window.showCustomAlert) {
          window.showCustomAlert('সিস্টেমের নিজস্ব থিম প্রিসেটগুলো মুছে ফেলা যাবে না!', 'মুছে ফেলা অসম্ভব', 'warning');
        } else {
          alert('System presets cannot be deleted!');
        }
        return;
      }
      
      if (confirm(`Are you sure you want to delete preset "${selected}"?`)) {
        let saved = {};
        try {
          saved = JSON.parse(localStorage.getItem('gravity_sheet_presets')) || {};
        } catch(e){}
        
        delete saved[selected];
        localStorage.setItem('gravity_sheet_presets', JSON.stringify(saved));
        delete sheetPresetThemes[selected];
        
        rebuildPresetDropdown('template1');
        if (sheetPresetSelect) sheetPresetSelect.dispatchEvent(new Event('change'));
        if (window.showCustomAlert) {
          window.showCustomAlert(`থিম প্রিসেট "${selected}" সফলভাবে মুছে ফেলা হয়েছে।`, 'মুছে ফেলা হয়েছে', 'info');
        } else {
          alert(`Preset "${selected}" deleted.`);
        }
      }
    });
  }

  // Reset properties and colors of current theme to database defaults
  if (uiElements.btnResetLayoutColors) {
    uiElements.btnResetLayoutColors.addEventListener('click', () => {
      const key = sheetPresetSelect.value;
      let baseKey = key;
      if (!defaultTemplateGeometries[key]) {
        baseKey = 'template1';
      }
      
      activeLayers = defaultTemplateGeometries[baseKey].map(l => ({ ...l }));
      currentDesignerLayerId = activeLayers.length > 0 ? activeLayers[0].id : null;
      if (currentDesignerLayerId) {
        loadDesignerLayerFields(currentDesignerLayerId);
      } else {
        clearDesignerLayerFields();
      }
      renderDesignerLayersTree();
      buildBrandedSvgSheet();
      if (window.showCustomAlert) {
        window.showCustomAlert('লেআউট স্থানাঙ্ক এবং রঙগুলো সফলভাবে ডিফল্ট থিমে রিসেট করা হয়েছে!', 'রিসেট সম্পন্ন', 'success');
      } else {
        alert('Layout coordinates and colors reset to original theme defaults!');
      }
    });
  }

  // Duplicate active selected designer layer(s)
  function duplicateSelectedLayer() {
    const toDuplicate = (selectedLayerIds && selectedLayerIds.length > 0)
      ? [...selectedLayerIds]
      : (currentDesignerLayerId ? [currentDesignerLayerId] : []);
    if (toDuplicate.length === 0) return;

    saveHistoryState();
    const newSelectedIds = [];
    const groupIdMap = {};

    toDuplicate.forEach(origId => {
      const original = activeLayers.find(l => l.id === origId);
      if (!original) return;

      const newId = original.type + '_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
      const clone = { ...original };
      clone.id = newId;

      if (original.groupId) {
        if (!groupIdMap[original.groupId]) {
          groupIdMap[original.groupId] = {
            id: 'grp_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
            name: (original.groupName || 'Group') + ' Copy'
          };
        }
        clone.groupId = groupIdMap[original.groupId].id;
        clone.groupName = groupIdMap[original.groupId].name;
      }

      const baseName = original.name.replace(/ Copy(\s+\d+)?$/, '');
      const copyCount = activeLayers.filter(l => l.name.startsWith(baseName + ' Copy')).length + 1;
      clone.name = `${baseName} Copy ${copyCount}`;

      if (original.type === 'text') {
        clone.x = Math.max(0, Math.min(6000, (original.x || 0) + 50));
        clone.y = Math.max(0, Math.min(2600, (original.y || 0) + 50));
      } else {
        const w = original.w || 500;
        const h = original.h || 500;
        clone.x = Math.max(0, Math.min(6000 - w, (original.x || 0) + 50));
        clone.y = Math.max(0, Math.min(2600 - h, (original.y || 0) + 50));
      }

      activeLayers.push(clone);
      newSelectedIds.push(newId);
    });

    if (newSelectedIds.length > 0) {
      selectedLayerIds = newSelectedIds;
      currentDesignerLayerId = newSelectedIds[newSelectedIds.length - 1];
      loadDesignerLayerFields(currentDesignerLayerId);
      renderDesignerLayersTree();
      updateAlignmentCardVisibility();
      buildBrandedSvgSheet();

      if (typeof showGravityToast === 'function') {
        showGravityToast(`ডুপ্লিকেট সম্পন্ন হয়েছে (Ctrl+D)`, 'success');
      }
    }
  }

  // Delete active selected designer layer(s)
  function deleteSelectedLayer() {
    const toDelete = (selectedLayerIds && selectedLayerIds.length > 0)
      ? [...selectedLayerIds]
      : (currentDesignerLayerId ? [currentDesignerLayerId] : []);
    if (toDelete.length === 0) return;
    saveHistoryState();
    activeLayers = activeLayers.filter(l => !toDelete.includes(l.id));
    selectedLayerIds = [];
    currentDesignerLayerId = null;
    clearDesignerLayerFields();
    renderDesignerLayersTree();
    updateAlignmentCardVisibility();
    buildBrandedSvgSheet();
  }

  ['btnDuplicateLayer', 'btnTreeDuplicate'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', duplicateSelectedLayer);
    }
  });
  if (uiElements.btnDeleteSelectedLayer) {
    uiElements.btnDeleteSelectedLayer.addEventListener('click', deleteSelectedLayer);
  }

  // Handle preset selector dropdown changes
  if (sheetPresetSelect) {
    sheetPresetSelect.addEventListener('change', () => {
      const selected = sheetPresetSelect.value;
      localStorage.setItem('gravity_active_preset', selected);
      if (sheetPresetThemes[selected]) {
        activeLayers = sheetPresetThemes[selected].map(l => ({ ...l }));
      }
      currentDesignerLayerId = activeLayers.length > 0 ? activeLayers[0].id : null;
      if (currentDesignerLayerId) {
        loadDesignerLayerFields(currentDesignerLayerId);
      } else {
        clearDesignerLayerFields();
      }
      renderDesignerLayersTree();
      buildBrandedSvgSheet();
    });
  }

  // Handle slicing detection mode select changes
  const sheetDetectMode = document.getElementById('sheetDetectMode');
  const sheetDetectThresholdGroup = document.getElementById('sheetDetectThresholdGroup');
  if (sheetDetectMode) {
    // Set initial visibility on load
    const colsGroup = sheetCols.closest('.ctl-group.half');
    const rowsGroup = sheetRows.closest('.ctl-group.half');
    if (sheetDetectMode.value === 'auto') {
      if (colsGroup) colsGroup.style.opacity = '0.4';
      if (rowsGroup) rowsGroup.style.opacity = '0.4';
      if (sheetDetectThresholdGroup) sheetDetectThresholdGroup.style.display = 'block';
    } else {
      if (colsGroup) colsGroup.style.opacity = '1.0';
      if (rowsGroup) rowsGroup.style.opacity = '1.0';
      if (sheetDetectThresholdGroup) sheetDetectThresholdGroup.style.display = 'none';
    }

    sheetDetectMode.addEventListener('change', () => {
      if (sheetDetectMode.value === 'auto') {
        if (colsGroup) colsGroup.style.opacity = '0.4';
        if (rowsGroup) rowsGroup.style.opacity = '0.4';
        if (sheetDetectThresholdGroup) sheetDetectThresholdGroup.style.display = 'block';
      } else {
        if (colsGroup) colsGroup.style.opacity = '1.0';
        if (rowsGroup) rowsGroup.style.opacity = '1.0';
        if (sheetDetectThresholdGroup) sheetDetectThresholdGroup.style.display = 'none';
      }
      processIconSheetSlicingOnly();
    });
  }

  // Handle auto-detect threshold slider input/change event
  const sheetDetectThreshold = document.getElementById('sheetDetectThreshold');
  const sheetDetectThresholdVal = document.getElementById('sheetDetectThresholdVal');
  if (sheetDetectThreshold) {
    sheetDetectThreshold.addEventListener('input', () => {
      if (sheetDetectThresholdVal) {
        sheetDetectThresholdVal.textContent = sheetDetectThreshold.value;
      }
    });
    sheetDetectThreshold.addEventListener('change', () => {
      processIconSheetSlicingOnly();
    });
  }

  // Global state for Bulk Multi-Image Icon Sheet Processing
  let loadedSheetImgs = []; // Holds array of { name: string, img: ImageElement }
  let generatedBrandedSheetsMap = {};
  let activePreviewSheetName = '';
  let isGridSizeManuallyOverridden = false;
  let shouldRecalculateOptimalGrid = true;

  if (sheetCols) {
    sheetCols.addEventListener('input', () => {
      isGridSizeManuallyOverridden = true;
      processIconSheetSlicingOnly();
    });
  }
  if (sheetRows) {
    sheetRows.addEventListener('input', () => {
      isGridSizeManuallyOverridden = true;
      processIconSheetSlicingOnly();
    });
  }
  function reshuffleIconPositions() {
    if (sheetShuffle) sheetShuffle.checked = true;
    slicedTilesData.forEach(t => {
      t.randSort = Math.random();
      t.gridSlot = -1;
    });
    buildBrandedSvgSheet();
    if (window.showCustomToast) {
      window.showCustomToast('আইকন পজিশন সফলভাবে রিশাফল করা হয়েছে! 🔀', 'success');
    }
  }
  window.reshuffleIconPositions = reshuffleIconPositions;

  if (sheetShuffle) {
    sheetShuffle.addEventListener('change', () => {
      if (sheetShuffle.checked) {
        slicedTilesData.forEach(t => {
          t.randSort = Math.random();
          t.gridSlot = -1;
        });
      } else {
        slicedTilesData.forEach(t => {
          t.gridSlot = -1;
        });
      }
      buildBrandedSvgSheet();
    });
  }

  const btnReshuffleIcons = document.getElementById('btnReshuffleIcons');
  if (btnReshuffleIcons) {
    btnReshuffleIcons.addEventListener('click', reshuffleIconPositions);
  }
  if (sheetTrim) {
    sheetTrim.addEventListener('change', () => {
      processIconSheetSlicingOnly();
    });
  }

  rebuildPresetDropdown();
  renderDesignerLayersTree();
  loadDesignerLayerFields('leftBg');
  buildBrandedSvgSheet();

  // File Upload Handlers (Supports Single and Bulk Multi-File Selection)
  if (sheetDropzone && sheetFileInput) {
    sheetDropzone.addEventListener('click', () => sheetFileInput.click());
    sheetDropzone.addEventListener('dragover', (e) => e.preventDefault());
    sheetDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      if (e.dataTransfer.files && e.dataTransfer.files.length) {
        loadSheetImageFiles(e.dataTransfer.files);
      }
    });
    sheetFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length) {
        loadSheetImageFiles(e.target.files);
      }
    });
  }

  const btnClearLoadedSheets = document.getElementById('btnClearLoadedSheets');
  if (btnClearLoadedSheets) {
    btnClearLoadedSheets.addEventListener('click', () => {
      loadedSheetImgs = [];
      slicedTilesData = [];
      isGridSizeManuallyOverridden = false;
      generatedBrandedSheetsMap = {};
      generatedAssembledSvg = '';
      activePreviewSheetName = '';
      if (sheetFileInput) sheetFileInput.value = '';
      if (sheetFileName) sheetFileName.textContent = 'Upload Icon Sheet Image(s)';
      if (tool4TilesGrid) {
        tool4TilesGrid.innerHTML = `
          <div class="slicer-placeholder" style="grid-column: 1 / -1; background: var(--surface-low); border: 1px dashed var(--outline-variant); padding: 48px; border-radius: 14px; text-align: center; color: var(--on-variant); font-size: 13px;">
            Upload an icon sheet image and click <strong>Slice & Vectorize Sheet</strong> to extract clean SVG icons.
          </div>
        `;
      }

      const tileCountEl = document.getElementById('sheetTileCount');
      if (tileCountEl) tileCountEl.textContent = '0';

      const btnSliceVectorize = document.getElementById('btnSliceVectorize');
      if (btnSliceVectorize) {
        btnSliceVectorize.textContent = '⚡ Convert 0 Icons to Vector';
      }

      btnClearLoadedSheets.style.display = 'none';
      buildBrandedSvgSheet();
    });
  }

  function loadSheetImageFiles(files) {
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (!validFiles.length) return;

    const duplicates = [];
    const nonDuplicates = [];
    validFiles.forEach(file => {
      const isDuplicate = loadedSheetImgs.some(existing => existing.name === file.name);
      if (isDuplicate) {
        duplicates.push(file.name);
      } else {
        nonDuplicates.push(file);
      }
    });

    if (duplicates.length > 0) {
      if (typeof showGravityToast === 'function') {
        showGravityToast(`Duplicate skipped: ${duplicates.length === 1 ? `"${duplicates[0]}"` : `${duplicates.length} sheets`} already loaded.`, 'warning');
      } else {
        console.warn('Duplicate skipped:', duplicates.join(', '));
      }
    }

    if (nonDuplicates.length === 0) {
      if (sheetFileInput) sheetFileInput.value = '';
      return;
    }

    let loadedCount = 0;
    const targetCount = nonDuplicates.length;
    const newlyLoadedSheets = [];

    nonDuplicates.forEach(file => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const img = new Image();
        img.onload = () => {
          let estimatedGrid = null;
          try {
            const thresholdVal = parseInt(document.getElementById('sheetDetectThreshold')?.value) || 30;
            const detected = autoDetectIconBounds(img, thresholdVal);
            const grid = estimateGridDimensions(detected, img.naturalWidth || img.width, img.naturalHeight || img.height);
            if (grid.cols > 0 && grid.rows > 0) {
              estimatedGrid = grid;
            }
          } catch(e) {
            console.warn('Grid auto-detect failed on load for ' + file.name, e);
          }

          const newSheetObj = { name: file.name, img: img, detectedGrid: estimatedGrid };
          loadedSheetImgs.push(newSheetObj);
          newlyLoadedSheets.push(newSheetObj);
          loadedCount++;
          if (loadedCount === targetCount) {
             if (sheetFileName) {
              if (loadedSheetImgs.length === 1) {
                sheetFileName.textContent = loadedSheetImgs[0].name;
              } else {
                sheetFileName.textContent = `📦 ${loadedSheetImgs.length} Icon Sheets Loaded (Bulk Processing Ready)`;
              }
            }
            if (btnClearLoadedSheets) {
              btnClearLoadedSheets.style.display = 'flex';
            }
            if (sheetFileInput) sheetFileInput.value = '';

            // Auto-populate inputs if a single sheet is uploaded and grid detected successfully
            const detectMode = document.getElementById('sheetDetectMode')?.value || 'grid';
            if (loadedSheetImgs.length === 1 && detectMode === 'auto') {
              const singleSheet = loadedSheetImgs[0];
              if (singleSheet.detectedGrid && singleSheet.detectedGrid.cols * singleSheet.detectedGrid.rows >= 4) {
                if (sheetCols) sheetCols.value = singleSheet.detectedGrid.cols;
                if (sheetRows) sheetRows.value = singleSheet.detectedGrid.rows;
                const tileCountEl = document.getElementById('sheetTileCount');
                if (tileCountEl) {
                  tileCountEl.textContent = singleSheet.detectedGrid.cols * singleSheet.detectedGrid.rows;
                }
              }
            }

            // Instantly slice & render preview tiles for only the newly loaded sheets
            processIconSheetSlicingOnly(newlyLoadedSheets);
          }
        };
        img.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // Toggle View Tabs
  if (btnToggleTilesView) {
    btnToggleTilesView.addEventListener('click', () => {
      if (tool4TilesContainer) tool4TilesContainer.style.display = 'block';
      if (tool4SheetWrap) tool4SheetWrap.style.display = 'none';
    });
  }

  if (btnToggleSheetView) {
    btnToggleSheetView.addEventListener('click', () => {
      if (tool4TilesContainer) tool4TilesContainer.style.display = 'none';
      if (tool4SheetWrap) tool4SheetWrap.style.display = 'block';
    });
  }

  // Helper: pixel ink background detection (Using robust grid-based sampling)
  function detectGridBackground(data, w, h) {
    const rs = [], gs = [], bs = [];
    const push = (i) => { rs.push(data[i]); gs.push(data[i + 1]); bs.push(data[i + 2]); };
    
    // Sample a 20x20 grid of pixels distributed across the image (inward of edges)
    const cols = 20;
    const rows = 20;
    for (let r = 1; r < rows; r++) {
      const y = Math.round(r * h / rows);
      for (let c = 1; c < cols; c++) {
        const x = Math.round(c * w / cols);
        push((y * w + x) * 4);
      }
    }
    const med = (a) => { if (!a.length) return 255; a.sort((p, q) => p - q); return a[a.length >> 1]; };
    return [med(rs), med(gs), med(bs)];
  }

  // Helper: gutter snap axis calculator
  function snapAxis(n, profile, aSize, srcSize) {
    const map = (a) => Math.round(a * srcSize / aSize);
    let first = 0, last = aSize;
    for (let x = 0; x < aSize; x++) { if (profile[x] > 0) { first = x; break; } }
    for (let x = aSize - 1; x >= 0; x--) { if (profile[x] > 0) { last = x + 1; break; } }
    if (last - first < n) { first = 0; last = aSize; }
    const span = last - first;
    const lines = new Array(n + 1);
    lines[0] = map(first);
    lines[n] = map(last);
    for (let i = 1; i < n; i++) {
      const center = first + i * span / n;
      const win = Math.max(2, (span / n) * 0.4);
      const lo = Math.max(first + 1, Math.floor(center - win));
      const hi = Math.min(last - 1, Math.ceil(center + win));
      let best = Math.round(center), bestVal = Infinity;
      for (let x = lo; x <= hi; x++) {
        const v = profile[x] + Math.abs(x - center) * 0.01;
        if (v < bestVal) {
          bestVal = v;
          best = x;
        }
      }
      lines[i] = map(best);
    }
    for (let i = 1; i <= n; i++) {
      if (lines[i] <= lines[i - 1]) lines[i] = Math.min(srcSize, lines[i - 1] + 1);
    }
    return lines;
  }

  // Auto-detect icon boundaries using Connected Component Labeling
  function autoDetectIconBounds(img, threshold = 30, minSize = 8, mergeDist = 8) {
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;

    // Offscreen scanning canvas at scaled-down size for peak performance
    const maxScanW = 1000;
    let scanW = w;
    let scanH = h;
    let ratio = 1;
    if (w > maxScanW) {
      ratio = maxScanW / w;
      scanW = maxScanW;
      scanH = Math.round(h * ratio);
    }

    const canvas = document.createElement('canvas');
    canvas.width = scanW;
    canvas.height = scanH;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(img, 0, 0, scanW, scanH);

    const imgData = ctx.getImageData(0, 0, scanW, scanH);
    const data = imgData.data;
    
    // Detect background color dynamically
    const bg = detectGridBackground(data, scanW, scanH);
    const bgR = bg[0], bgG = bg[1], bgB = bg[2];

    const visited = new Uint8Array(scanW * scanH);
    const boxes = [];

    // Helper to evaluate foreground intensity using color distance
    function isForeground(x, y) {
      if (x < 0 || x >= scanW || y < 0 || y >= scanH) return false;
      const idx = (y * scanW + x) * 4;
      const a = data[idx + 3];
      if (a < 30) return false; // Transparent is background
      
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      
      const dr = r - bgR;
      const dg = g - bgG;
      const db = b - bgB;
      const dist = Math.sqrt(0.299 * dr * dr + 0.587 * dg * dg + 0.114 * db * db);
      
      return dist > threshold; // Dynamic color distance threshold
    }

    // Flood fill scan
    for (let y = 0; y < scanH; y += 2) {
      for (let x = 0; x < scanW; x += 2) {
        const pos = y * scanW + x;
        if (visited[pos]) continue;

        if (isForeground(x, y)) {
          let minX = x, maxX = x, minY = y, maxY = y;
          const queue = [[x, y]];
          visited[pos] = 1;

          while (queue.length > 0) {
            const [cx, cy] = queue.shift();
            if (cx < minX) minX = cx;
            if (cx > maxX) maxX = cx;
            if (cy < minY) minY = cy;
            if (cy > maxY) maxY = cy;

            // Check 8 neighbors with step=1 for pixel-perfect contours
            const neighbors = [
              [cx + 1, cy], [cx - 1, cy],
              [cx, cy + 1], [cx, cy - 1],
              [cx + 1, cy + 1], [cx - 1, cy - 1],
              [cx + 1, cy - 1], [cx - 1, cy + 1]
            ];

            for (const [nx, ny] of neighbors) {
              if (nx >= 0 && nx < scanW && ny >= 0 && ny < scanH) {
                const npos = ny * scanW + nx;
                if (!visited[npos]) {
                  visited[npos] = 1;
                  if (isForeground(nx, ny)) {
                    queue.push([nx, ny]);
                  }
                }
              }
            }
          }

          const bw = maxX - minX;
          const bh = maxY - minY;
          // Keep all components except extremely tiny isolated dots (noise < 2px)
          if (bw >= 2 || bh >= 2) {
            boxes.push({ x: minX, y: minY, w: bw, h: bh });
          }
        }
      }
    }

    // Discard raw boxes that are too large (border artifacts) OR thin line artifacts BEFORE merging
    const filteredRaw = boxes.filter(b => {
      if (b.w >= scanW * 0.82 && b.h >= scanH * 0.82) return false;
      // Discard thin horizontal line artifacts
      if (b.w >= scanW * 0.35 && b.h <= 5) return false;
      // Discard thin vertical line artifacts
      if (b.h >= scanH * 0.35 && b.w <= 5) return false;
      return true;
    });
    boxes.length = 0;
    boxes.push(...filteredRaw);

    // Phase 1: Standard proximity merges (only horizontal/vertical proximity <= scanMergeDist)
    const scanMergeDist = Math.min(6, Math.max(2, Math.round(mergeDist * ratio)));
    let mergedAny = true;
    while (mergedAny) {
      mergedAny = false;
      for (let i = 0; i < boxes.length; i++) {
        for (let j = i + 1; j < boxes.length; j++) {
          const b1 = boxes[i];
          const b2 = boxes[j];

          const gapX = Math.max(b1.x, b2.x) - Math.min(b1.x + b1.w, b2.x + b2.w);
          const gapY = Math.max(b1.y, b2.y) - Math.min(b1.y + b1.h, b2.y + b2.h);

          const close = (gapX <= scanMergeDist && gapY <= scanMergeDist);

          if (close) {
            const minX = Math.min(b1.x, b2.x);
            const minY = Math.min(b1.y, b2.y);
            const maxX = Math.max(b1.x + b1.w, b2.x + b2.w);
            const maxY = Math.max(b1.y + b1.h, b2.y + b2.h);

            b1.x = minX;
            b1.y = minY;
            b1.w = maxX - minX;
            b1.h = maxY - minY;

            boxes.splice(j, 1);
            mergedAny = true;
            break;
          }
        }
        if (mergedAny) break;
      }
    }

    // Phase 2: Refined label alignment/height-check merging
    // Merges a tiny label or small sub-component directly adjacent to a main icon shape
    mergedAny = true;
    while (mergedAny) {
      mergedAny = false;
      for (let i = 0; i < boxes.length; i++) {
        for (let j = i + 1; j < boxes.length; j++) {
          const b1 = boxes[i];
          const b2 = boxes[j];

          const gapX = Math.max(b1.x, b2.x) - Math.min(b1.x + b1.w, b2.x + b2.w);
          const gapY = Math.max(b1.y, b2.y) - Math.min(b1.y + b1.h, b2.y + b2.h);

          const overlapX = Math.min(b1.x + b1.w, b2.x + b2.w) - Math.max(b1.x, b2.x);
          const minW = Math.min(b1.w, b2.w);

          let maxAllowedGapY = scanMergeDist;

          if (overlapX > minW * 0.25) {
            const minH = Math.min(b1.h, b2.h);
            const maxH = Math.max(b1.h, b2.h);

            const b1Above = (b1.y + b1.h <= b2.y + 5);
            const b2Above = (b2.y + b2.h <= b1.y + 5);
            
            let topBoxIsTaller = false;
            if (b1Above && b1.h > b2.h) topBoxIsTaller = true;
            if (b2Above && b2.h > b1.h) topBoxIsTaller = true;

            const isHeightRatioValid = maxH >= minH * 2.5;

            if (topBoxIsTaller && isHeightRatioValid && (minH < 25 || minH < maxH * 0.3)) {
              // Strictly limit gap to prevent merging across distinct icon rows
              maxAllowedGapY = Math.min(10, Math.max(scanMergeDist, Math.round(maxH * 0.15)));
            }
          }

          const close = (gapX <= scanMergeDist && gapY <= maxAllowedGapY);

          if (close) {
            const minX = Math.min(b1.x, b2.x);
            const minY = Math.min(b1.y, b2.y);
            const maxX = Math.max(b1.x + b1.w, b2.x + b2.w);
            const maxY = Math.max(b1.y + b1.h, b2.y + b2.h);

            const totalCombinedH = maxY - minY;
            const maxH = Math.max(b1.h, b2.h);

            // Safety check: Combined height must not expand the main box height by more than 40%
            if (totalCombinedH <= maxH * 1.4 && totalCombinedH <= scanH * 0.22) {
              b1.x = minX;
              b1.y = minY;
              b1.w = maxX - minX;
              b1.h = totalCombinedH;

              boxes.splice(j, 1);
              mergedAny = true;
              break;
            }
          }
        }
        if (mergedAny) break;
      }
    }

    // Phase 3: Vertical multi-part/multi-line icon component merge
    // Merges stacked components belonging to a SINGLE icon (e.g. multi-line binary text, closely stacked sub-lines, or gauge above a scale)
    mergedAny = true;
    while (mergedAny) {
      mergedAny = false;
      for (let i = 0; i < boxes.length; i++) {
        for (let j = i + 1; j < boxes.length; j++) {
          const b1 = boxes[i];
          const b2 = boxes[j];

          const overlapX = Math.min(b1.x + b1.w, b2.x + b2.w) - Math.max(b1.x, b2.x);
          const minW = Math.min(b1.w, b2.w);

          if (overlapX > minW * 0.35) {
            const gapY = Math.max(b1.y, b2.y) - Math.min(b1.y + b1.h, b2.y + b2.h);
            // Relaxed vertical gap to allow merging elements like a gauge on top of a scale
            const maxVerticalGap = Math.min(25, Math.max(scanMergeDist + 4, Math.round(Math.min(b1.h, b2.h) * 0.6)));

            if (gapY <= maxVerticalGap) {
              const minY = Math.min(b1.y, b2.y);
              const maxY = Math.max(b1.y + b1.h, b2.y + b2.h);
              const totalCombinedH = maxY - minY;
              const maxH = Math.max(b1.h, b2.h);

              // Merge ONLY if combined height remains a valid single-cell icon height (<= 1.9x of larger component height and <= 28% of scan height)
              if (totalCombinedH <= maxH * 1.9 && totalCombinedH <= scanH * 0.28) {
                const minX = Math.min(b1.x, b2.x);
                const maxX = Math.max(b1.x + b1.w, b2.x + b2.w);

                b1.x = minX;
                b1.y = minY;
                b1.w = maxX - minX;
                b1.h = totalCombinedH;

                boxes.splice(j, 1);
                mergedAny = true;
                break;
              }
            }
          }
        }
        if (mergedAny) break;
      }
    }

    // Phase 4: Horizontal multi-part icon component merge
    // Merges adjacent components horizontally belonging to a SINGLE icon (e.g. broken lines or side-by-side elements of the same icon)
    mergedAny = true;
    while (mergedAny) {
      mergedAny = false;
      for (let i = 0; i < boxes.length; i++) {
        for (let j = i + 1; j < boxes.length; j++) {
          const b1 = boxes[i];
          const b2 = boxes[j];

          const overlapY = Math.min(b1.y + b1.h, b2.y + b2.h) - Math.max(b1.y, b2.y);
          const minH = Math.min(b1.h, b2.h);

          if (overlapY > minH * 0.5) {
            const gapX = Math.max(b1.x, b2.x) - Math.min(b1.x + b1.w, b2.x + b2.w);
            // Cap horizontal gap strictly so it NEVER bridges column spacing between distinct icons
            const maxHorizontalGap = Math.min(12, Math.max(scanMergeDist + 2, Math.round(Math.min(b1.w, b2.w) * 0.25)));

            if (gapX <= maxHorizontalGap) {
              const minX = Math.min(b1.x, b2.x);
              const maxX = Math.max(b1.x + b1.w, b2.x + b2.w);
              const totalCombinedW = maxX - minX;
              const maxW = Math.max(b1.w, b2.w);

              // Merge ONLY if combined width remains a valid single-cell icon width (<= 1.6x of larger component width and <= 22% of scan width)
              if (totalCombinedW <= maxW * 1.6 && totalCombinedW <= scanW * 0.22) {
                const minY = Math.min(b1.y, b2.y);
                const maxY = Math.max(b1.y + b1.h, b2.y + b2.h);

                b1.x = minX;
                b1.y = minY;
                b1.w = totalCombinedW;
                b1.h = maxY - minY;

                boxes.splice(j, 1);
                mergedAny = true;
                break;
              }
            }
          }
        }
        if (mergedAny) break;
      }
    }

    // Filter final merged boxes to discard remaining noise/borders
    const filteredBoxes = [];
    const minS = minSize || 15;
    for (const b of boxes) {
      const aspect = b.w / b.h;
      if (b.w < scanW * 0.82 && b.h < scanH * 0.82 && 
          b.w >= minS && b.h >= minS && 
          aspect < 12 && aspect > 0.08) {
        filteredBoxes.push(b);
      }
    }

    // Scale coordinates back to original size
    const realBoxes = filteredBoxes.map(b => {
      // Expand slightly to include edges
      const margin = 2;
      const rx = Math.max(0, Math.round((b.x - margin) / ratio));
      const ry = Math.max(0, Math.round((b.y - margin) / ratio));
      const rw = Math.min(w - rx, Math.round((b.w + 2 * margin) / ratio));
      const rh = Math.min(h - ry, Math.round((b.h + 2 * margin) / ratio));
      return { x: rx, y: ry, w: rw, h: rh };
    });

    // Group into horizontal rows (bands) based on overlapping Y coordinates
    const bands = [];
    realBoxes.forEach(box => {
      let placed = false;
      for (const band of bands) {
        const bandMidY = band.ySum / band.count;
        // Group if top/bottom coordinates overlap significantly
        if (Math.abs(box.y - bandMidY) < Math.max(box.h, 60)) {
          band.items.push(box);
          band.ySum += box.y;
          band.count++;
          placed = true;
          break;
        }
      }
      if (!placed) {
        bands.push({
          ySum: box.y,
          count: 1,
          items: [box]
        });
      }
    });

    // Sort bands top-to-bottom
    bands.sort((a, b) => (a.ySum / a.count) - (b.ySum / b.count));

    // Sort items inside each band left-to-right
    const sortedBoxes = [];
    bands.forEach(band => {
      band.items.sort((a, b) => a.x - b.x);
      sortedBoxes.push(...band.items);
    });

    return sortedBoxes;
  }

  function estimateGridDimensions(boxes, imgW, imgH) {
    if (!boxes || boxes.length < 4) return null;
    
    // Sort boxes by X center to find columns
    const xCenters = boxes.map(b => b.x + b.w / 2).sort((a, b) => a - b);
    const avgW = boxes.reduce((sum, b) => sum + b.w, 0) / boxes.length;
    const xThreshold = avgW * 0.5; // Gap threshold for columns
    
    let colCount = 1;
    for (let i = 1; i < xCenters.length; i++) {
      if (xCenters[i] - xCenters[i - 1] > xThreshold) {
        colCount++;
      }
    }

    // Sort boxes by Y center to find rows
    const yCenters = boxes.map(b => b.y + b.h / 2).sort((a, b) => a - b);
    const avgH = boxes.reduce((sum, b) => sum + b.h, 0) / boxes.length;
    const yThreshold = avgH * 0.5; // Gap threshold for rows
    
    let rowCount = 1;
    for (let i = 1; i < yCenters.length; i++) {
      if (yCenters[i] - yCenters[i - 1] > yThreshold) {
        rowCount++;
      }
    }

    if (colCount * rowCount < 4) return null;

    return { cols: colCount, rows: rowCount };
  }
  // Slice & Show raw crop preview immediately for loaded icon sheets (Supports incremental additions)
  async function processIconSheetSlicingOnly(sheetsToSlice = null) {
    if (!loadedSheetImgs || loadedSheetImgs.length === 0) return;
    
    activeSliceRunId++;
    const currentRunId = activeSliceRunId;
    isSlicingInProgress = true;
    console.log('[DEBUG] Slicing started. Run ID:', currentRunId, 'isSlicingInProgress:', isSlicingInProgress);

    const isAppend = !!sheetsToSlice;
    const targetSheets = sheetsToSlice || loadedSheetImgs;
    console.log('[DEBUG] processIconSheetSlicingOnly called. Target count:', targetSheets.length, 'isAppend:', isAppend);

    if (!isAppend) {
      // Clear previously generated presentation templates based on old slices on full reload/re-slice
      generatedBrandedSheetsMap = {};
      generatedAssembledSvg = '';
      activePreviewSheetName = '';
      slicedTilesData = [];
      if (tool4TilesGrid) tool4TilesGrid.innerHTML = '';
    } else {
      // Automatically focus preview tab to show the newly added sheet (e.g. from the new upload list)
      activePreviewSheetName = targetSheets[0].name;
    }
    
    shouldRecalculateOptimalGrid = true;

    const cols = parseInt(sheetCols.value) || 5;
    const rows = parseInt(sheetRows.value) || 3;
    const totalTiles = cols * rows;
    const shouldTrim = sheetTrim ? sheetTrim.checked : true;
    const shouldShuffle = sheetShuffle ? sheetShuffle.checked : false;
    const detectMode = document.getElementById('sheetDetectMode')?.value || 'grid';
    const isAutoDetect = (detectMode === 'auto');

    if (!isAppend) {
      if (btnDownloadAssembledSheet) btnDownloadAssembledSheet.disabled = true;
      if (btnSaveToPC) btnSaveToPC.disabled = true;
      const btnZip = document.getElementById('btnDownloadAllZip');
      if (btnZip) btnZip.style.display = 'none';
    }

    // Remove the placeholder element if present in the grid
    if (tool4TilesGrid) {
      const placeholder = tool4TilesGrid.querySelector('.slicer-placeholder');
      if (placeholder) placeholder.remove();
    }

    // Determine the next globalIndex dynamically using maximum index of existing items to prevent duplicates/collisions
    let maxIdx = -1;
    if (slicedTilesData.length > 0) {
      maxIdx = Math.max(...slicedTilesData.map(t => t.idx));
    }
    let globalIndex = maxIdx + 1;

    for (const sheetObj of targetSheets) {
      if (currentRunId !== activeSliceRunId) return;

      const img = sheetObj.img;
      const sheetName = sheetObj.name;
      const imgW = img.naturalWidth || img.width;
      const imgH = img.naturalHeight || img.height;

      let boxes = [];
      let sCols = cols;
      let sRows = rows;
      if (!isGridSizeManuallyOverridden && isAutoDetect && sheetObj.detectedGrid && sheetObj.detectedGrid.cols * sheetObj.detectedGrid.rows >= 4) {
        sCols = sheetObj.detectedGrid.cols;
        sRows = sheetObj.detectedGrid.rows;
      }
      let tileCount = sCols * sRows;

      let isCurrentAutoDetect = isAutoDetect;
      if (isCurrentAutoDetect) {
        const thresholdVal = parseInt(document.getElementById('sheetDetectThreshold')?.value) || 30;
        boxes = autoDetectIconBounds(img, thresholdVal);
        if (boxes && boxes.length >= 4) {
          tileCount = boxes.length;
        } else {
          console.warn('[Auto-Detect Fallback]: Auto-detect found fewer than 4 components due to grid line interference. Falling back to Grid Slicing (' + sCols + 'x' + sRows + ').');
          isCurrentAutoDetect = false;
          tileCount = sCols * sRows;
        }
      }

      let gridX = [], gridY = [];
      if (!isCurrentAutoDetect) {
        try {
          const scale = Math.min(1, 1000 / Math.max(imgW, imgH));
          const aw = Math.max(1, Math.round(imgW * scale));
          const ah = Math.max(1, Math.round(imgH * scale));
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = aw;
          tempCanvas.height = ah;
          const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
          tempCtx.drawImage(img, 0, 0, aw, ah);
          const data = tempCtx.getImageData(0, 0, aw, ah).data;
          const bg = detectGridBackground(data, aw, ah);

          const colInk = new Float64Array(aw);
          const rowInk = new Float64Array(ah);
          for (let y = 0; y < ah; y++) {
            for (let x = 0; x < aw; x++) {
              const i = (y * aw + x) * 4;
              const a = data[i + 3];
              if (a < 16) continue;
              const dr = data[i] - bg[0];
              const dg = data[i + 1] - bg[1];
              const db = data[i + 2] - bg[2];
              const dist = Math.sqrt(0.299 * dr * dr + 0.587 * dg * dg + 0.114 * db * db);
              if (a * dist / 255 > 14) {
                colInk[x]++;
                rowInk[y]++;
              }
            }
          }
          gridX = snapAxis(sCols, colInk, aw, imgW);
          gridY = snapAxis(sRows, rowInk, ah, imgH);
        } catch (e) {
          console.warn('[slicer] Smart boundary snapping failed, falling back to even cuts', e);
          gridX = [];
          gridY = [];
          for (let i = 0; i <= sCols; i++) gridX.push(Math.round(i * imgW / sCols));
          for (let i = 0; i <= sRows; i++) gridY.push(Math.round(i * imgH / sRows));
        }
      }

      let indices = Array.from({ length: tileCount }, (_, i) => i);

      for (let i = 0; i < tileCount; i++) {
        if (currentRunId !== activeSliceRunId) return;

        const srcIdx = indices[i];
        let sx, sw, sy, sh;

        if (isCurrentAutoDetect) {
          const box = boxes[srcIdx];
          sx = box.x;
          sw = box.w;
          sy = box.y;
          sh = box.h;
        } else {
          const c = srcIdx % sCols;
          const r = Math.floor(srcIdx / sCols);
          sx = gridX[c];
          sw = gridX[c + 1] - sx;
          sy = gridY[r];
          sh = gridY[r + 1] - sy;

          // Apply a small border inset to trim off the thin gray cell grid lines
          const borderInset = Math.max(3, Math.round(Math.min(sw, sh) * 0.03));
          sx += borderInset;
          sy += borderInset;
          sw -= 2 * borderInset;
          sh -= 2 * borderInset;
        }

        if (sw <= 0 || sh <= 0) continue;

        globalIndex++;

        // Crop tile into offscreen canvas using snapped coordinates (with pre-slice upscale support)
        const upscaleFactor = vecUpscale ? parseInt(vecUpscale.value) : 4;
        let canvas = document.createElement('canvas');
        canvas.width = sw * upscaleFactor;
        canvas.height = sh * upscaleFactor;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw * upscaleFactor, sh * upscaleFactor);

        if (shouldTrim) {
          canvas = autoTrimCanvasTile(canvas);
        }

        const dataUrl = canvas.toDataURL('image/png');

        slicedTilesData.push({
          idx: globalIndex,
          localIdx: i + 1,
          sheetName: sheetName,
          bounds: { x: sx, y: sy, w: sw, h: sh },
          canvas: canvas,
          svgContent: '',
          dataUrl: dataUrl,
          isVectorized: false,
          randSort: Math.random()
        });

        // Render cell in grid UI as raw image preview
        if (tool4TilesGrid) {
          const cellEl = document.createElement('div');
          cellEl.id = `tool4-tile-card-${globalIndex}`;
          cellEl.style.cssText = 'background: var(--surface); border: 1px solid var(--outline-variant); border-radius: 14px; padding: 14px; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
          cellEl.innerHTML = `
            <div style="position: absolute; top: 8px; left: 8px; font-size: 10px; font-weight: 800; color: var(--on-surface-variant); background: rgba(255,255,255,0.06); border: 1px solid var(--outline); padding: 3px 8px; border-radius: 6px;">#${globalIndex} ${loadedSheetImgs.length > 1 ? sheetName.substring(0, 10) + '...' : 'Sliced'}</div>
            <button type="button" class="delete-sliced-tile-btn" data-idx="${globalIndex}" style="position: absolute; top: 8px; right: 8px; background: rgba(239, 68, 68, 0.12); color: #ff5c5c; border: 1px solid rgba(239,68,68,0.25); padding: 3px 7px; border-radius: 6px; font-size: 10px; font-weight: 800; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(239, 68, 68, 0.25)'" onmouseout="this.style.background='rgba(239, 68, 68, 0.12)'">✕</button>
            <div style="width: 100px; height: 100px; display: flex; align-items: center; justify-content: center; margin-top: 12px;">
              <img src="${dataUrl}" style="max-width: 84px; max-height: 84px; object-fit: contain; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));" />
            </div>
          `;
          tool4TilesGrid.appendChild(cellEl);
          cellEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        // Update UI Tile Count dynamically
        const tileCountEl = document.getElementById('sheetTileCount');
        if (tileCountEl) {
          tileCountEl.textContent = slicedTilesData.length;
        }
        if (btnSliceVectorize) {
          btnSliceVectorize.textContent = `⚡ Convert ${slicedTilesData.length} Icons to Vector`;
        }

        // Yield main thread to allow progressive browser paints
        await new Promise(resolve => setTimeout(resolve, 15));
      }
    }

    if (sheetAutoLabel && sheetAutoLabel.checked) {
      startGeminiAutoLabeling(currentRunId);
    }
    if (currentRunId === activeSliceRunId) {
      isSlicingInProgress = false;
      console.log('[DEBUG] Slicing completed. Run ID:', currentRunId, 'isSlicingInProgress:', isSlicingInProgress);
    }
  }

  // Auto-label icons in sequence using Gemini Vision
  async function startGeminiAutoLabeling(currentRunId) {
    const savedKeysRaw = localStorage.getItem('gravity_gemini_keys') || localStorage.getItem('gravity_gemini_key') || '';
    const apiKeys = savedKeysRaw.split('\n').map(k => k.trim()).filter(Boolean);
    const model = localStorage.getItem('gravity_gemini_model') || 'gemini-3.1-flash-lite';
    if (apiKeys.length === 0) {
      if (window.showCustomAlert) {
        window.showCustomAlert('No Gemini API Key found. Please add a key in the settings (🔑 button) before auto-labeling.', 'API Key Required', 'warning');
      } else {
        alert('No Gemini API Key found. Please add a key in the settings (🔑 button) before auto-labeling.');
      }
      return;
    }

    let keyIndex = 0;
    const getNextApiKey = () => {
      const key = apiKeys[keyIndex];
      keyIndex = (keyIndex + 1) % apiKeys.length;
      return key;
    };

    const oldBtnText = btnSliceVectorize ? btnSliceVectorize.textContent : '';
    if (btnSliceVectorize) {
      btnSliceVectorize.disabled = true;
      btnSliceVectorize.textContent = `🔍 AI Labeling Slices...`;
    }

    if (btnToggleSheetView) {
      btnToggleSheetView.disabled = true;
      btnToggleSheetView.innerHTML = '🔒 Presentation Sheet';
      btnToggleSheetView.style.opacity = '0.5';
      btnToggleSheetView.style.cursor = 'not-allowed';
    }

    try {
      const totalSheets = loadedSheetImgs.length;
      const totalIcons = slicedTilesData.length;
      let completedSheets = 0;
      let labeledIconsCount = 0;

      const updateLoaderProgress = (currentSheetName) => {
        let loader = document.querySelector('.grid-auto-label-loader');

        const percent = totalSheets > 0 ? Math.min(100, Math.round((completedSheets / totalSheets) * 100)) : 0;
        const remainingSheets = Math.max(0, totalSheets - completedSheets);

        if (!loader) {
          loader = document.createElement('div');
          loader.className = 'grid-auto-label-loader';
          loader.innerHTML = `
            <div class="label-loader-card">
              <div class="label-loader-icon-ring">
                <div class="label-loader-spinner"></div>
                <div class="label-loader-center-icon">✨</div>
              </div>
              <div class="label-loader-title">AI Labeling with Gemini...</div>
              <div class="label-loader-subtitle" id="autoLabelCurrentSheet">Preparing analysis...</div>

              <div class="label-loader-progress-box">
                <div class="label-loader-percent-row">
                  <span class="label-loader-percent-val" id="autoLabelPercentVal">0%</span>
                  <span class="label-loader-count-text" id="autoLabelCountText">0 / ${totalSheets} Sheets</span>
                </div>
                <div class="label-loader-track">
                  <div class="label-loader-fill" id="autoLabelFill" style="width: 0%;"></div>
                </div>
              </div>

              <div class="label-loader-stats-row">
                <div class="label-loader-stat-pill">
                  <span class="stat-num done" id="autoLabelDoneVal">0</span>
                  <span class="stat-label">Done</span>
                </div>
                <div class="label-loader-stat-pill">
                  <span class="stat-num rem" id="autoLabelRemVal">${totalSheets}</span>
                  <span class="stat-label">Remaining</span>
                </div>
                <div class="label-loader-stat-pill">
                  <span class="stat-num lbl" id="autoLabelIconsVal">0</span>
                  <span class="stat-label">Icons Labeled</span>
                </div>
              </div>
            </div>
          `;
          document.body.appendChild(loader);
        }

        const currentSub = loader.querySelector('#autoLabelCurrentSheet');
        const percentVal = loader.querySelector('#autoLabelPercentVal');
        const countText = loader.querySelector('#autoLabelCountText');
        const fillEl = loader.querySelector('#autoLabelFill');
        const doneVal = loader.querySelector('#autoLabelDoneVal');
        const remVal = loader.querySelector('#autoLabelRemVal');
        const iconsVal = loader.querySelector('#autoLabelIconsVal');

        if (currentSub && currentSheetName) {
          currentSub.textContent = `Analyzing: ${currentSheetName}`;
        }
        if (percentVal) percentVal.textContent = `${percent}%`;
        if (countText) countText.textContent = `${completedSheets} / ${totalSheets} Sheets`;
        if (fillEl) fillEl.style.width = `${percent}%`;
        if (doneVal) doneVal.textContent = completedSheets;
        if (remVal) remVal.textContent = remainingSheets;
        if (iconsVal) iconsVal.textContent = `${labeledIconsCount} / ${totalIcons}`;
      };

      updateLoaderProgress('Initializing Gemini Vision...');

      for (let sIdx = 0; sIdx < loadedSheetImgs.length; sIdx++) {
        if (currentRunId !== activeSliceRunId) return;

        const sheetObj = loadedSheetImgs[sIdx];
        const img = sheetObj.img;
        const sheetName = sheetObj.name;
        
        updateLoaderProgress(sheetName || `Sheet #${sIdx + 1}`);

        let cols = parseInt(sheetCols.value) || 5;
        let rows = parseInt(sheetRows.value) || 3;
        const isAutoDetectLabel = (document.getElementById('sheetDetectMode')?.value === 'auto');
        if (!isGridSizeManuallyOverridden && isAutoDetectLabel && sheetObj.detectedGrid && sheetObj.detectedGrid.cols * sheetObj.detectedGrid.rows >= 4) {
          cols = sheetObj.detectedGrid.cols;
          rows = sheetObj.detectedGrid.rows;
        }

        // Draw image to a smaller canvas (max 2000px) to preserve detail for upload/analysis
        const tempCanvas = document.createElement('canvas');
        const maxDim = 2000;
        let w = img.naturalWidth || img.width;
        let h = img.naturalHeight || img.height;
        let scaleRatio = 1;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            scaleRatio = maxDim / w;
            h = Math.round(h * scaleRatio);
            w = maxDim;
          } else {
            scaleRatio = maxDim / h;
            w = Math.round(w * scaleRatio);
            h = maxDim;
          }
        }
        tempCanvas.width = w;
        tempCanvas.height = h;
        const ctx = tempCanvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);

        const sheetTilesForPrompt = slicedTilesData.filter(t => t.sheetName === sheetName).sort((a, b) => a.idx - b.idx);
        
        // Draw visual prompting numbers over the icons
        if (sheetTilesForPrompt.length > 0) {
          ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
          ctx.font = 'bold 28px Arial';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          sheetTilesForPrompt.forEach((tile, index) => {
             if (tile.bounds) {
               const bx = tile.bounds.x * scaleRatio;
               const by = tile.bounds.y * scaleRatio;
               ctx.fillRect(bx, by, 42, 34);
               ctx.fillStyle = 'white';
               ctx.fillText((index + 1).toString(), bx + 4, by + 4);
               ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
             }
          });
        }

        const base64DataUrl = tempCanvas.toDataURL('image/png');
        const base64Data = base64DataUrl.split(',')[1];

        const totalTileCount = sheetTilesForPrompt.length > 0 ? sheetTilesForPrompt.length : (rows * cols);

        const systemPrompt = `Analyze this icon sheet grid image containing EXACTLY ${totalTileCount} icons. 
CRITICAL RULE: Each icon has been explicitly marked with a red box containing a NUMBER (1 to ${totalTileCount}) at its top-left corner.
You MUST identify the main object or concept depicted in EVERY single numbered icon, strictly following the numerical order from 1 to ${totalTileCount}.
Provide a short, clean, descriptive filename label for each icon (1-3 words, lowercase with underscores, no special characters, e.g. "customer_support").
CRITICAL RULE: You MUST return a valid JSON array containing EXACTLY ${totalTileCount} string elements corresponding to EVERY single numbered icon from 1 to ${totalTileCount}. DO NOT skip any number. DO NOT stop early.
Example output format:
[
  "label_for_number_1",
  "label_for_number_2"
]`;

        // Request helper with exponential backoff / 429 switch key
        const makeRequestWithRetry = async (imgData, customPrompt = systemPrompt) => {
          const payload = {
            contents: [{
              parts: [
                { text: customPrompt },
                {
                  inlineData: {
                    mimeType: 'image/png',
                    data: imgData
                  }
                }
              ]
            }],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.2
            }
          };
          const { data } = await fetchGeminiWithFallback(model, apiKeys, payload, true);
          return data;
        };

        let data = await makeRequestWithRetry(base64Data);

        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
          throw new Error('Invalid response format from Gemini API.');
        }

        let rawText = data.candidates[0].content.parts[0].text || '';
        console.log('[Gemini Auto-Label Raw Response]:', rawText);
        rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();

        let jsonArray = [];
        try {
          jsonArray = JSON.parse(rawText);
          console.log('[Gemini Auto-Label Parsed Array]:', jsonArray);
        } catch (_) {
          const match = rawText.match(/\[\s*\"[\s\S]*\"\s*\]/);
          if (match) {
            try { 
              jsonArray = JSON.parse(match[0]); 
              console.log('[Gemini Auto-Label Parsed Match Regex]:', jsonArray);
            } catch (__) {}
          }
        }

        // Retry if Vision API returned fewer items than the exact grid cell count
        if (Array.isArray(jsonArray) && jsonArray.length > 0 && jsonArray.length !== totalTileCount) {
          console.warn(`[Gemini Auto-Label Warning]: Expected ${totalTileCount} labels, but got ${jsonArray.length}. Retrying with strict count instruction...`);
          const retryPrompt = `${systemPrompt}\n\nSTRICT RETRY NOTICE: Your previous response returned ${jsonArray.length} items instead of ${totalTileCount}. You MUST return a JSON array containing EXACTLY ${totalTileCount} string items!`;
          try {
            const retryData = await makeRequestWithRetry(base64Data, retryPrompt);
            if (retryData?.candidates?.[0]?.content?.parts?.[0]?.text) {
              let retryRaw = retryData.candidates[0].content.parts[0].text.replace(/```json/gi, '').replace(/```/g, '').trim();
              let retryArr = JSON.parse(retryRaw);
              if (Array.isArray(retryArr) && retryArr.length === totalTileCount) {
                jsonArray = retryArr;
                console.log('[Gemini Auto-Label Retry Success]:', jsonArray);
              }
            }
          } catch (retryErr) {
            console.error('[Gemini Auto-Label Retry Failed]:', retryErr);
          }
        }

        if (Array.isArray(jsonArray) && jsonArray.length > 0) {
          const sheetTilesToLabel = slicedTilesData.filter(t => t.sheetName === sheetName).sort((a, b) => a.idx - b.idx);
          sheetTilesToLabel.forEach((tile, idx) => {
            const label = jsonArray[idx] !== undefined ? jsonArray[idx] : null;
            if (label) {
              tile.name = label.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
            } else if (!tile.name || tile.name.startsWith('tile') || tile.name.startsWith('slice')) {
              tile.name = `icon_${tile.idx}`;
            }

            // Update individual Card header in Sliced Grid interface
            const cardEl = document.getElementById(`tool4-tile-card-${tile.idx}`);
            if (cardEl) {
              const headerEl = cardEl.firstElementChild;
              if (headerEl) {
                headerEl.textContent = `#${tile.idx} ${tile.name.substring(0, 15)}`;
              }
              cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          });
          
          const activeSheetTiles = sheetTilesToLabel.filter(t => !t.isDeleted);
          labeledIconsCount += activeSheetTiles.length;
        }

        completedSheets++;
        updateLoaderProgress(sheetName || `Sheet #${sIdx + 1}`);
      }

      // Re-trigger branded sheets assembly to render text labels underneath
      if (typeof buildBrandedSvgSheet === 'function') {
        buildBrandedSvgSheet();
      }

      // Remove the label loader now that labeling is done 100%, before we move on to title generation
      document.querySelectorAll('.grid-auto-label-loader').forEach(el => el.remove());

      // Automatically trigger AI branding title generation for all loaded presentation sheets with dedicated loader!
      if (typeof regenerateBrandingTitleWithGemini === 'function' && loadedSheetImgs && loadedSheetImgs.length > 0) {
        showGeminiNamingLoader(true, '🪄 Gemini AI is generating unique branding titles...', { current: 0, total: loadedSheetImgs.length });
        for (let sIdx = 0; sIdx < loadedSheetImgs.length; sIdx++) {
          const sheet = loadedSheetImgs[sIdx];
          showGeminiNamingLoader(true, `🪄 Gemini AI is generating branding title for ${sheet.name || `Sheet #${sIdx + 1}`} (${sIdx + 1} of ${loadedSheetImgs.length})...`, { current: sIdx, total: loadedSheetImgs.length });
          await regenerateBrandingTitleWithGemini(sheet.name, true);
          if (sIdx < loadedSheetImgs.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 600));
          }
        }
        showGeminiNamingLoader(true, '🪄 Branding generation complete!', { current: loadedSheetImgs.length, total: loadedSheetImgs.length });
        await new Promise(resolve => setTimeout(resolve, 600));
        showGeminiNamingLoader(false);
      }

    } catch (err) {
      console.error('[Gemini Auto-Label Failed]:', err);
      if (window.showCustomAlert) {
        window.showCustomAlert(`Icon auto-labeling failed: ${err.message}`, 'Gemini Vision Error', 'error');
      } else {
        alert(`Icon auto-labeling failed: ${err.message}`);
      }
    } finally {
      document.querySelectorAll('.grid-auto-label-loader').forEach(el => el.remove());
      const stageEl = document.querySelector('#tool4View .studio-stage');
      if (stageEl) {
        stageEl.style.overflow = '';
      }
      if (btnSliceVectorize) {
        btnSliceVectorize.disabled = false;
        btnSliceVectorize.textContent = `⚡ Convert ${slicedTilesData.length} Icons to Vector`;
      }
      if (btnToggleSheetView && !isVectorizing) {
        btnToggleSheetView.disabled = false;
        btnToggleSheetView.innerHTML = 'Presentation Sheet';
        btnToggleSheetView.style.opacity = '1';
        btnToggleSheetView.style.cursor = 'pointer';
      }
    }
  }

  // Helper to show/hide visual loading state for Gemini AI titling
  function showGeminiNamingLoader(show, message = '🪄 Gemini AI is generating unique branding titles...', progressData = null) {
    const btn = document.getElementById('btnAutoTitle');

    if (show) {
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span style="width: 12px; height: 12px; margin-right: 6px; display: inline-block; border: 2px solid currentColor; border-right-color: transparent; border-radius: 50%; animation: spinner-border .75s linear infinite;" role="status"></span><span>🪄 Naming...</span>`;
      }
      
      let loader = document.querySelector('.grid-auto-title-loader');
      
      const totalSheets = (progressData && progressData.total) ? progressData.total : (loadedSheetImgs ? loadedSheetImgs.length : 1);
      const currentDone = (progressData && progressData.current !== undefined) ? progressData.current : 0;
      const percent = totalSheets > 0 ? Math.min(100, Math.round((currentDone / totalSheets) * 100)) : 0;
      const remainingSheets = Math.max(0, totalSheets - currentDone);
      
      if (!loader) {
        loader = document.createElement('div');
        loader.className = 'grid-auto-label-loader grid-auto-title-loader';
        loader.innerHTML = `
          <div class="label-loader-card">
            <div class="label-loader-icon-ring">
              <div class="label-loader-spinner"></div>
              <div class="label-loader-center-icon" style="font-size:32px;">🪄</div>
            </div>
            <div class="label-loader-title">AI Branding with Gemini...</div>
            <div class="label-loader-subtitle" id="autoTitleMessage">${escapeXml(message)}</div>

            <div class="label-loader-progress-box">
              <div class="label-loader-percent-row">
                <span class="label-loader-percent-val" id="autoTitlePercentVal">${percent}%</span>
                <span class="label-loader-count-text" id="autoTitleCountText">${currentDone} / ${totalSheets} Sheets</span>
              </div>
              <div class="label-loader-track">
                <div class="label-loader-fill" id="autoTitleFill" style="width: ${percent}%;"></div>
              </div>
            </div>

            <div class="label-loader-stats-row">
              <div class="label-loader-stat-pill">
                <span class="stat-num done" id="autoTitleDoneVal">${currentDone}</span>
                <span class="stat-label">Done</span>
              </div>
              <div class="label-loader-stat-pill">
                <span class="stat-num rem" id="autoTitleRemVal">${remainingSheets}</span>
                <span class="stat-label">Remaining</span>
              </div>
              <div class="label-loader-stat-pill">
                <span class="stat-num lbl" id="autoTitleIconsVal">${currentDone}</span>
                <span class="stat-label">Titles Created</span>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(loader);
      } else {
        const msgEl = loader.querySelector('#autoTitleMessage');
        const percentVal = loader.querySelector('#autoTitlePercentVal');
        const countText = loader.querySelector('#autoTitleCountText');
        const fillEl = loader.querySelector('#autoTitleFill');
        const doneVal = loader.querySelector('#autoTitleDoneVal');
        const remVal = loader.querySelector('#autoTitleRemVal');
        const iconsVal = loader.querySelector('#autoTitleIconsVal');

        if (msgEl) msgEl.textContent = message;
        if (percentVal) percentVal.textContent = `${percent}%`;
        if (countText) countText.textContent = `${currentDone} / ${totalSheets} Sheets`;
        if (fillEl) fillEl.style.width = `${percent}%`;
        if (doneVal) doneVal.textContent = currentDone;
        if (remVal) remVal.textContent = remainingSheets;
        if (iconsVal) iconsVal.textContent = currentDone;
      }
    } else {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span>🪄 AI Auto Title</span>';
      }
      document.querySelectorAll('.grid-auto-title-loader').forEach(el => el.remove());
      
      // Also cleanup the old badge just in case it was there
      const badge = document.getElementById('geminiNamingStatusBadge');
      if (badge) badge.remove();
    }
  }

  // Gemini Branding Title generator with key rotation / rate-limit resilience
  async function regenerateBrandingTitleWithGemini(targetSheetName = '', isBatch = false) {
    // If called manually (e.g. clicking AI Auto Title button) and multiple sheets are loaded, iterate all sheets!
    if (!targetSheetName && !isBatch && loadedSheetImgs && loadedSheetImgs.length > 1) {
      const totalSheets = loadedSheetImgs.length;
      showGeminiNamingLoader(true, `🪄 Gemini AI is generating unique titles for ${totalSheets} icon sheets...`, { current: 0, total: totalSheets });
      let count = 0;
      for (const s of loadedSheetImgs) {
        showGeminiNamingLoader(true, `🪄 Gemini AI is analyzing & titling Sheet ${count + 1} of ${totalSheets}...`, { current: count, total: totalSheets });
        try {
          await regenerateBrandingTitleWithGemini(s.name, true);
        } catch (e) {
          console.error(`Auto-titling failed for ${s.name}:`, e);
        }
        count++;
        if (count < totalSheets) {
          await new Promise(resolve => setTimeout(resolve, 600));
        }
      }
      showGeminiNamingLoader(true, '🪄 Branding generation complete!', { current: totalSheets, total: totalSheets });
      await new Promise(resolve => setTimeout(resolve, 600));
      showGeminiNamingLoader(false);
      buildBrandedSvgSheet();
      if (window.showCustomAlert) {
        window.showCustomAlert(`✨ Gemini AI দিয়ে সফলভাবে ${totalSheets}টি আইকন সেটের জন্য ইউনিক টাইটেল তৈরি করা হয়েছে!`, 'AI টাইটেল সম্পন্ন', 'success');
      }
      return;
    }

    const activeSheetName = targetSheetName || activePreviewSheetName || (loadedSheetImgs.length > 0 ? loadedSheetImgs[0].name : '');
    if (!activeSheetName) return;

    const sheetObj = loadedSheetImgs.find(s => s.name === activeSheetName);
    const sIndex = sheetObj ? loadedSheetImgs.indexOf(sheetObj) : 0;
    const defaultFallbackTitle = (sIndex % 2 === 1) ? 'ICON PACK' : 'VECTOR ICONS';

    const savedKeysRaw = localStorage.getItem('gravity_gemini_keys') || localStorage.getItem('gravity_gemini_key') || '';
    const apiKeys = savedKeysRaw.split('\n').map(k => k.trim()).filter(Boolean);
    const model = localStorage.getItem('gravity_gemini_model') || 'gemini-3.1-flash-lite';
    if (apiKeys.length === 0) {
      if (sheetObj && !sheetObj.title) sheetObj.title = defaultFallbackTitle;
      if (window.showCustomAlert && !isBatch) {
        window.showCustomAlert(`Gemini API Key পাওয়া যায়নি! সার্বজনীন "${defaultFallbackTitle}" টাইটেল যুক্ত করা হলো। এপিআই কী যুক্ত করলে AI দিয়ে নতুন টাইটেল তৈরি হবে।`, 'API Key প্রয়োজন', 'warning');
      }
      buildBrandedSvgSheet();
      return;
    }

    let keyIndex = 0;
    const getNextApiKey = () => {
      const key = apiKeys[keyIndex];
      keyIndex = (keyIndex + 1) % apiKeys.length;
      return key;
    };

    // Try to perform a visual analysis with Gemini Vision if sheet is loaded
    let isVisionMode = false;
    let base64Data = '';
    
    if (sheetObj) {
      try {
        const img = sheetObj.img;
        const tempCanvas = document.createElement('canvas');
        const maxDim = 800;
        let w = img.naturalWidth || img.width;
        let h = img.naturalHeight || img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round(h * maxDim / w);
            w = maxDim;
          } else {
            w = Math.round(w * maxDim / h);
            h = maxDim;
          }
        }
        tempCanvas.width = w;
        tempCanvas.height = h;
        const ctx = tempCanvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const base64DataUrl = tempCanvas.toDataURL('image/png');
        base64Data = base64DataUrl.split(',')[1];
        isVisionMode = true;
      } catch (err) {
        console.warn('[Gemini Naming Image Render Failed, falling back to text labels]:', err);
      }
    }

    // Gather name indicators if Vision is not possible or as fallback
    let labels = [];
    if (slicedTilesData && slicedTilesData.length > 0) {
      slicedTilesData.forEach(t => {
        if (t.sheetName === activeSheetName && t.name && !t.name.startsWith('tile') && !t.name.startsWith('slice')) {
          labels.push(t.name);
        }
      });
    }

    if (labels.length === 0 && sheetObj && sheetObj.name) {
      labels.push(sheetObj.name);
    }

    const nicheField = document.getElementById('bulkNicheTopics');
    if (nicheField && nicheField.value) {
      labels.push(nicheField.value);
    }

    if (!isVisionMode && labels.length === 0) {
      if (window.showCustomAlert) {
        window.showCustomAlert('আইকন সেটের নাম স্বয়ংক্রিয়ভাবে বোঝার জন্য ক্যানভাসে বা স্লাইসারে কোনো আইকন তথ্য পাওয়া যায়নি!', 'তথ্য নেই', 'warning');
      } else {
        alert('No icons or prompts found to analyze.');
      }
      return;
    }

    // Gather existing titles assigned to other loaded sheets to guarantee uniqueness across bulk runs!
    const existingTitles = loadedSheetImgs
      .filter(s => s.name !== activeSheetName && s.title && s.title.trim().length > 0)
      .map(s => s.title.trim());
    const existingTitlesText = existingTitles.length > 0
      ? `\nIMPORTANT: The following titles have ALREADY been assigned to other sheets in this batch: [${existingTitles.join(', ')}]. DO NOT repeat any of these titles or produce similar titles. Return a completely UNIQUE and distinct title.`
      : '';

    // Gather specific icon names from slicedTilesData for this sheet
    const iconNames = slicedTilesData
      .filter(t => t.sheetName === activeSheetName && t.name && !t.isDeleted && !t.name.startsWith('tile') && !t.name.startsWith('slice'))
      .map(t => t.name.replace(/_/g, ' '));
    const specificIconsText = iconNames.length > 0 ? `\nSpecific icons present across this sheet layout include: ${iconNames.join(', ')}.` : '';

    const isCurrentActivePreview = (activeSheetName === activePreviewSheetName);
    if (!isBatch) {
      showGeminiNamingLoader(true, `🪄 Gemini AI is writing unique branding title for ${activeSheetName}...`, { current: 0, total: 1 });
    }

    try {
      const makeNamingWithRetry = async () => {
        let payload;
        if (isVisionMode) {
          const systemPrompt = `You are an expert microstock icon branding director.
Analyze this icon sheet grid image.${specificIconsText}
CRITICAL REQUIREMENT: Carefully analyze the OVERALL DOMINANT theme across ALL icons on the sheet (do NOT base the title on just the first 1-2 icons).
Identify the exact primary niche or concept represented by the complete collection of icons. There is NO restricted list of categories — dynamically analyze the unique visual icons to determine the exact, highly relevant category (e.g. "DENTISTRY", "PET CARE", "AGRICULTURE", "ASTRONOMY", "CONSTRUCTION", "PLUMBING", "TECHNOLOGY", "COMMUNITY", "HEALTHCARE", "FINANCE", "LOGISTICS", "BEAUTY & SPA", "LEGAL", "MUSIC & AUDIO", etc.).
Provide a clear, accurate, high-impact English branding title (1 or 2 words maximum).

STRICT RULE: The title MUST be 1 or 2 words maximum. NEVER return 3 or more words.${existingTitlesText}

Return ONLY the 1-2 word title text, nothing else (no punctuation, no quotes, no markdown, no sentences).`;

          payload = {
            contents: [{
              parts: [
                { text: systemPrompt },
                {
                  inlineData: {
                    mimeType: 'image/png',
                    data: base64Data
                  }
                }
              ]
            }],
            generationConfig: {
              temperature: 0.85
            }
          };
        } else {
          const cleanList = labels.join(', ');
          const systemPrompt = `You are a professional microstock branding director.
Suggest a single, clear, highly accurate English branding title that best represents the OVERALL DOMINANT theme of this entire icon set featuring these keywords: [${cleanList}].
CRITICAL REQUIREMENT: Analyze ALL icon keywords across the complete sheet (do NOT base the title on just the first 1-2 icons).
Dynamically determine the exact niche or subject matter representing the entire icon set (there is NO restricted list of categories — it can be ANY category in the world, e.g. "DENTISTRY", "PET CARE", "AGRICULTURE", "ASTRONOMY", "PLUMBING", "TECHNOLOGY", "COMMUNITY", "HEALTHCARE", "LEGAL", "COSMETICS", "CONSTRUCTION", "MUSIC", etc.).
Provide a high-impact 1 or 2 word branding title matching the entire set.${existingTitlesText}

STRICT RULE: The title MUST be 1 or 2 words maximum (preferably 1 strong word). NEVER return 3 or more words.

Return ONLY the 1-2 word title text, nothing else (no punctuation, no markdown, no sentences).`;

          payload = {
            contents: [{
              parts: [{ text: systemPrompt }]
            }],
            generationConfig: {
              temperature: 0.85
            }
          };
        }

        const { data } = await fetchGeminiWithFallback(model, apiKeys, payload, isVisionMode);
        return data;
      };

      const data = await makeNamingWithRetry();

      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
        throw new Error('Invalid response format from Gemini API.');
      }

      let generatedTitle = data.candidates[0].content.parts[0].text || '';
      generatedTitle = generatedTitle.replace(/[^a-zA-Z0-9\s]/g, '').trim().toUpperCase();
      if (window.formatTitleWordLimit) {
        generatedTitle = window.formatTitleWordLimit(generatedTitle, 2);
      }

      if (generatedTitle) {
        // Save the title back to the sheet object!
        if (sheetObj) {
          sheetObj.title = generatedTitle;
        }

        // If this is the active preview sheet, sync to UI and text layer!
        if (isCurrentActivePreview) {
          const sheetSetName = document.getElementById('sheetSetName');
          if (sheetSetName) sheetSetName.value = generatedTitle;

          const titleLayer = activeLayers.find(l => l.id === 'titleText' || (l.name && l.name.toLowerCase().includes('title text')));
          if (titleLayer) {
            titleLayer.text = generatedTitle;
          }

          if (currentDesignerLayerId && (currentDesignerLayerId === 'titleText' || (titleLayer && currentDesignerLayerId === titleLayer.id))) {
            loadDesignerLayerFields(currentDesignerLayerId);
          }
        }

        // Trigger canvas redraw
        buildBrandedSvgSheet();

        if (!isBatch && isCurrentActivePreview && window.showCustomAlert) {
          if (loadedSheetImgs.length > 1) {
            window.showCustomAlert('জেমিনি সফলভাবে আইকন সেটের নতুন নামকরণ সম্পন্ন করেছে।', 'নামকরণ সম্পন্ন', 'success');
          } else {
            window.showCustomAlert(`জেমিনি আইকন সেট বিশ্লেষণ করে সফলভাবে নতুন নাম দিয়েছে: "${generatedTitle}"।`, 'নামকরণ সম্পন্ন', 'success');
          }
        }
      }
    } catch (err) {
      console.error('[Gemini Auto Title Failed]:', err);
      if (sheetObj && !sheetObj.title) {
        sheetObj.title = defaultFallbackTitle;
      }
      if (!isBatch && isCurrentActivePreview) {
        if (window.showCustomAlert) {
          window.showCustomAlert(`Gemini AI নাম নির্ধারণ ব্যর্থ হয়েছে, ফলে সার্বজনীন "${defaultFallbackTitle}" বসানো হলো: ${err.message}`, 'Gemini API লিমিট/ত্রুটি', 'warning');
        } else {
          alert(`Gemini naming failed. Applied default ${defaultFallbackTitle}: ${err.message}`);
        }
      }
      buildBrandedSvgSheet();
    } finally {
      if (!isBatch) {
        showGeminiNamingLoader(false);
      }
    }
  }

  // Smart Auto-Fit Grid layout function to align columns and rows perfectly to active icons
  function autoFitGridLayout(silent = false) {
    const activeSheetName = activePreviewSheetName || (loadedSheetImgs.length > 0 ? loadedSheetImgs[0].name : '');
    const tilesForThisSheet = activeSheetName ? slicedTilesData.filter(t => t.sheetName === activeSheetName) : slicedTilesData;
    const activeTiles = tilesForThisSheet.filter(t => !t.isDeleted);
    const N = activeTiles.length;
    
    if (N === 0) {
      if (window.showCustomAlert) {
        window.showCustomAlert('আর্টবোর্ডে কোনো সক্রিয় আইকন খুঁজে পাওয়া যায়নি!', 'তথ্য নেই', 'warning');
      } else {
        alert('No active icons found on the artboard!');
      }
      return;
    }
    
    const gridLayer = activeLayers.find(l => l.type === 'grid');
    let maxGridW = 5720, maxGridH = 2320;
    if (gridLayer) {
      const gridPad = gridLayer.padding !== undefined ? gridLayer.padding : 140;
      maxGridW = gridLayer.w - 2 * gridPad;
      maxGridH = gridLayer.h - 2 * gridPad;
    }
    const opt = calculateOptimalGrid(N, maxGridW, maxGridH);
    
    // Update inputs for active sheet
    if (sheetCols) sheetCols.value = opt.cols;
    if (sheetRows) sheetRows.value = opt.rows;
    
    shouldRecalculateOptimalGrid = true;
    buildBrandedSvgSheet();
    
    if (!silent && window.showCustomAlert) {
      window.showCustomAlert(`গ্রিড লেআউটটি সক্রিয় ${N}টি আইকনের জন্য ${opt.cols}x${opt.rows} আকারে সয়ংক্রিয়ভাবে নির্ধারণ করা হয়েছে।`, 'লেআউট ফিট সম্পন্ন', 'success');
    }
  }

  // Initialize Vectorizer Settings UI with Live Updates, localStorage Save & Reset
  function initVectorizerSettingsUI() {
    const elSmoothing = document.getElementById('vecSmoothing');
    const elSmoothingVal = document.getElementById('vecSmoothingVal');
    const elCorner = document.getElementById('vecCorner');
    const elCornerVal = document.getElementById('vecCornerVal');
    const elSimplify = document.getElementById('vecSimplify');
    const elSimplifyVal = document.getElementById('vecSimplifyVal');
    const elSpeckle = document.getElementById('vecSpeckle');
    const elSpeckleVal = document.getElementById('vecSpeckleVal');
    const elOptimise = document.getElementById('vecOptimise');
    const elFillColor = document.getElementById('vecFillColor');
    const elFillHex = document.getElementById('vecFillHex');

    const btnSave = document.getElementById('btnSaveVecSettings');
    const btnReset = document.getElementById('btnResetVecSettings');

    // Factory Default Settings (User Specs)
    const DEFAULT_SETTINGS = {
      smoothing: 7,
      corner: 152,
      simplify: 55,
      speckle: 3,
      optimise: true,
      fillColor: '#000000',
      labelColor: '#000000'
    };

    // Synchronize Hex & Color Picker Inputs
    if (elFillColor && elFillHex) {
      elFillColor.addEventListener('input', () => { elFillHex.value = elFillColor.value; });
      elFillHex.addEventListener('input', () => {
        if (/^#[0-9A-Fa-f]{6}$/.test(elFillHex.value)) {
          elFillColor.value = elFillHex.value;
        }
      });
    }

    // Live update value spans when sliders move
    if (elSmoothing && elSmoothingVal) {
      elSmoothing.addEventListener('input', () => { elSmoothingVal.textContent = elSmoothing.value; });
    }
    if (elCorner && elCornerVal) {
      elCorner.addEventListener('input', () => { elCornerVal.textContent = elCorner.value; });
    }
    if (elSimplify && elSimplifyVal) {
      elSimplify.addEventListener('input', () => { elSimplifyVal.textContent = (parseInt(elSimplify.value) / 10).toFixed(1); });
    }
    if (elSpeckle && elSpeckleVal) {
      elSpeckle.addEventListener('input', () => { elSpeckleVal.textContent = elSpeckle.value; });
    }

    // Apply Settings Object to UI Controls
    function applySettingsToUI(s) {
      if (elSmoothing) { elSmoothing.value = s.smoothing; if (elSmoothingVal) elSmoothingVal.textContent = s.smoothing; }
      if (elCorner) { elCorner.value = s.corner; if (elCornerVal) elCornerVal.textContent = s.corner; }
      if (elSimplify) { elSimplify.value = s.simplify; if (elSimplifyVal) elSimplifyVal.textContent = (parseInt(s.simplify) / 10).toFixed(1); }
      if (elSpeckle) { elSpeckle.value = s.speckle; if (elSpeckleVal) elSpeckleVal.textContent = s.speckle; }
      if (elOptimise) { elOptimise.checked = !!s.optimise; }
      if (elFillColor) { elFillColor.value = s.fillColor; }
      if (elFillHex) { elFillHex.value = s.fillColor; }
      if (vecLabelColor) { vecLabelColor.value = s.labelColor || '#000000'; }
      if (vecLabelHex) { vecLabelHex.value = s.labelColor || '#000000'; }
    }

    // Auto-load saved user settings if present in localStorage
    try {
      const saved = localStorage.getItem('gravity_vec_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        applySettingsToUI(Object.assign({}, DEFAULT_SETTINGS, parsed));
      } else {
        applySettingsToUI(DEFAULT_SETTINGS);
      }
    } catch (e) {
      console.warn('Load vec settings notice:', e);
    }

    // Save Settings Button Listener
    if (btnSave) {
      btnSave.addEventListener('click', () => {
        const current = {
          smoothing: elSmoothing ? parseInt(elSmoothing.value) : 7,
          corner: elCorner ? parseInt(elCorner.value) : 152,
          simplify: elSimplify ? parseInt(elSimplify.value) : 55,
          speckle: elSpeckle ? parseInt(elSpeckle.value) : 3,
          optimise: elOptimise ? elOptimise.checked : true,
          fillColor: elFillColor ? elFillColor.value : '#000000',
          labelColor: vecLabelColor ? vecLabelColor.value : '#000000'
        };
        try {
          localStorage.setItem('gravity_vec_settings', JSON.stringify(current));
          const origHtml = btnSave.innerHTML;
          btnSave.innerHTML = '✓ Saved!';
          setTimeout(() => { btnSave.innerHTML = origHtml; }, 1800);
          if (window.showCustomAlert) window.showCustomAlert('Vectorizer settings saved as your custom default!', 'Settings Saved', 'success');
        } catch (e) {
          alert('Could not save settings to browser storage');
        }
      });
    }

    // Reset Default Settings Button Listener
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        try {
          localStorage.removeItem('gravity_vec_settings');
        } catch (e) {}
        applySettingsToUI(DEFAULT_SETTINGS);
        const origHtml = btnReset.innerHTML;
        btnReset.innerHTML = '✓ Reset!';
        setTimeout(() => { btnReset.innerHTML = origHtml; }, 1800);
        if (window.showCustomAlert) window.showCustomAlert('Vectorizer settings reset to default values.', 'Default Restored', 'info');
      });
    }

    // Bind Auto-Title event listeners
    const btnAutoTitle = document.getElementById('btnAutoTitle');
    const chkAutoTitleOnLoad = document.getElementById('chkAutoTitleOnLoad');

    if (btnAutoTitle) {
      btnAutoTitle.addEventListener('click', () => {
        regenerateBrandingTitleWithGemini();
      });
    }

    if (chkAutoTitleOnLoad) {
      try {
        const savedState = localStorage.getItem('gravity_auto_title_on_load');
        chkAutoTitleOnLoad.checked = (savedState !== 'false');
      } catch (_) {}

      chkAutoTitleOnLoad.addEventListener('change', () => {
        try {
          localStorage.setItem('gravity_auto_title_on_load', chkAutoTitleOnLoad.checked);
        } catch (_) {}
      });
    }

    // Bind Auto-fit Grid Layout button
    const btnAutoFitGrid = document.getElementById('btnAutoFitGrid');
    if (btnAutoFitGrid) {
      btnAutoFitGrid.addEventListener('click', () => autoFitGridLayout(false));
    }

    // Bind Sliced Grid card deletion event delegation
    if (tool4TilesGrid) {
      tool4TilesGrid.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-sliced-tile-btn');
        if (deleteBtn) {
          const tileIdx = parseInt(deleteBtn.getAttribute('data-idx'));
          removeSlicedTile(tileIdx);
        }
      });
    }

    // Bind sheetAutoLabel checkbox listener to trigger autolabeling on-demand
    if (sheetAutoLabel) {
      sheetAutoLabel.addEventListener('change', () => {
        if (typeof buildBrandedSvgSheet === 'function') {
          buildBrandedSvgSheet();
        }
        if (sheetAutoLabel.checked) {
          console.log('[DEBUG] Checkbox checked. isSlicingInProgress:', isSlicingInProgress);
          if (isSlicingInProgress) {
            console.log('[DEBUG] Slicing in progress. Preventing immediate labeling trigger.');
            return;
          }
          const needsLabeling = slicedTilesData.length > 0 && slicedTilesData.some(t => !t.name);
          console.log('[DEBUG] Needs labeling check:', needsLabeling, 'slicedTilesCount:', slicedTilesData.length);
          if (needsLabeling) {
            startGeminiAutoLabeling(activeSliceRunId);
          }
        }
      });
    }
  }

  // Remove a sliced tile before vectorization
  function removeSlicedTile(tileIdx) {
    slicedTilesData = slicedTilesData.filter(t => t.idx !== tileIdx);

    const gridCell = document.getElementById(`tool4-tile-card-${tileIdx}`);
    if (gridCell) {
      gridCell.remove();
    }

    const tileCountEl = document.getElementById('sheetTileCount');
    if (tileCountEl) {
      tileCountEl.textContent = slicedTilesData.length;
    }

    const btnSliceVectorize = document.getElementById('btnSliceVectorize');
    if (btnSliceVectorize) {
      btnSliceVectorize.textContent = `⚡ Convert ${slicedTilesData.length} Icons to Vector`;
    }
  }

  // Bind settings initialization
  initVectorizerSettingsUI();

  // Trigger WebSocket server-assisted contour / curve tracing
  if (btnSliceVectorize) {
    btnSliceVectorize.addEventListener('click', async () => {
      const isSheetView = tool4SheetWrap && tool4SheetWrap.style.display === 'block';
      if (isSheetView && !isVectorizing) {
        // Handled by the other click listener for sheet updates
        return;
      }
      if (!loadedSheetImgs || loadedSheetImgs.length === 0 || slicedTilesData.length === 0) {
        alert('Please upload an icon sheet image first!');
        return;
      }

      if (isVectorizing) {
        // Cancel/Stop operation
        isVectorizing = false;
        if (btnToggleSheetView) {
          btnToggleSheetView.disabled = false;
          btnToggleSheetView.innerHTML = 'Presentation Sheet';
          btnToggleSheetView.style.opacity = '1';
          btnToggleSheetView.style.cursor = 'pointer';
        }
        btnSliceVectorize.classList.remove('btn-vectorize-stop');
        if (isSheetView) {
          btnSliceVectorize.textContent = '✨ Update Presentation';
        } else {
          btnSliceVectorize.textContent = `⚡ Convert ${slicedTilesData.length} Icons to Vector`;
        }
        btnSliceVectorize.disabled = false;

        const progressContainer = document.getElementById('vectorizerProgressBarContainer');
        const progressBar = document.getElementById('vectorizerProgressBar');
        if (progressContainer) progressContainer.style.display = 'none';
        if (progressBar) progressBar.style.width = '0%';

        // Reset individual waiting cards back to raw image preview
        slicedTilesData.forEach(t => {
          if (!t.isVectorized) {
            const cardEl = document.getElementById(`tool4-tile-card-${t.idx}`);
            if (cardEl) {
              cardEl.innerHTML = `
                <div style="position: absolute; top: 8px; left: 8px; font-size: 10px; font-weight: 800; color: var(--on-surface-variant); background: rgba(255,255,255,0.06); border: 1px solid var(--outline); padding: 3px 8px; border-radius: 6px;">#${t.idx} ${t.name ? t.name.substring(0, 15) : 'Sliced'}</div>
                <button type="button" class="delete-sliced-tile-btn" data-idx="${t.idx}" style="position: absolute; top: 8px; right: 8px; background: rgba(239, 68, 68, 0.12); color: #ff5c5c; border: 1px solid rgba(239,68,68,0.25); padding: 3px 7px; border-radius: 6px; font-size: 10px; font-weight: 800; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(239, 68, 68, 0.25)'" onmouseout="this.style.background='rgba(239, 68, 68, 0.12)'">✕</button>
                <div style="width: 100px; height: 100px; display: flex; align-items: center; justify-content: center; margin-top: 12px;">
                  <img src="${t.dataUrl}" style="max-width: 84px; max-height: 84px; object-fit: contain; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));" />
                </div>
              `;
            }
          }
        });
        return;
      }

      const activeSheetsSet = new Set(slicedTilesData.map(t => t.sheetName));
      const requiredCredits = activeSheetsSet.size || 1;
      const allowed = await window.checkAndConsumeCredit('iconSheets', requiredCredits, false);
      if (!allowed) return;

      isVectorizing = true;
      if (btnToggleSheetView) {
        btnToggleSheetView.disabled = true;
        btnToggleSheetView.innerHTML = '🔒 Presentation Sheet';
        btnToggleSheetView.style.opacity = '0.5';
        btnToggleSheetView.style.cursor = 'not-allowed';
      }
      btnSliceVectorize.classList.add('btn-vectorize-stop');
      btnSliceVectorize.textContent = `🛑 Stop Vectorizing`;
      btnSliceVectorize.disabled = false;
      vectorizeCompletedCount = 0;

      // Show topbar progress bar and reset its width
      const progressContainer = document.getElementById('vectorizerProgressBarContainer');
      const progressBar = document.getElementById('vectorizerProgressBar');
      if (progressContainer && progressBar) {
        progressContainer.style.display = 'block';
        progressBar.style.width = '0%';
      }

      const fillColor = vecFillColor ? vecFillColor.value : '#000000';
      const mode = vecMode ? vecMode.value : 'bw';
      const smoothing = vecSmoothing ? parseInt(vecSmoothing.value) : 7;
      const corner = vecCorner ? parseInt(vecCorner.value) : 152;
      const simplify = vecSimplify ? parseInt(vecSimplify.value) / 10 : 5.5;
      const speckle = vecSpeckle ? parseInt(vecSpeckle.value) : 3;
      const optimise = vecOptimise ? vecOptimise.checked : true;
      const upscale = vecUpscale ? parseInt(vecUpscale.value) : 4;
      const traceDetail = vecTraceDetail ? parseInt(vecTraceDetail.value) : 1600;

      // Non-blocking Asynchronous Queue Processing to keep UI 100% responsive
      async function processTilesInAsyncQueue() {
        const total = slicedTilesData.length;

        for (let i = 0; i < total; i++) {
          if (!isVectorizing) {
            break;
          }
          const tile = slicedTilesData[i];

          if (btnSliceVectorize) {
            btnSliceVectorize.textContent = `🛑 Stop Vectorizing (${i + 1}/${total})`;
          }

          // Show spinning indicator and active glowing highlight on this card
          const cardEl = document.getElementById(`tool4-tile-card-${tile.idx}`);
          if (cardEl) {
            document.querySelectorAll('.active-processing-tile').forEach(el => el.classList.remove('active-processing-tile'));
            cardEl.classList.add('active-processing-tile');
            cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            cardEl.innerHTML = `
              <div style="position: absolute; top: 8px; left: 8px; font-size: 10px; font-weight: 800; color: var(--accent); background: rgba(52,152,219,0.12); padding: 3px 8px; border-radius: 6px;">#${tile.idx}</div>
              <div style="width: 100px; height: 100px; display: flex; flex-direction: column; align-items: center; justify-content: center; margin-top: 12px; color: var(--on-surface-variant);">
                <div style="font-size: 24px; animation: spin 1s linear infinite;">⏳</div>
                <div style="font-size: 10px; margin-top: 8px; opacity: 0.8;">Tracing curves...</div>
              </div>
            `;
          }

          // Check if WebSocket server is available or fallback to Web Worker Client-Side Vectorizer
          if (flowSocket && flowSocket.readyState === WebSocket.OPEN) {
            if (!window.pendingVectorizeResolves) {
              window.pendingVectorizeResolves = new Map();
            }
            const resultPromise = new Promise(resolve => {
              const timeoutId = setTimeout(() => {
                if (window.pendingVectorizeResolves.has(tile.idx)) {
                  window.pendingVectorizeResolves.delete(tile.idx);
                  resolve();
                }
              }, 12000); // 12 seconds backup timeout
              window.pendingVectorizeResolves.set(tile.idx, () => {
                clearTimeout(timeoutId);
                resolve();
              });
            });

            sendFlowActionSpecific('vectorize-tile', 'default', {
              index: tile.idx,
              dataUrl: tile.dataUrl,
              mode: mode,
              color: fillColor,
              smoothing: smoothing,
              corner: corner,
              simplify: simplify,
              speckle: speckle,
              optimise: optimise,
              upscale: upscale,
              maxRes: traceDetail
            });

            await resultPromise;
          } else {
            // Await sequential tile execution to prevent memory overflow and browser freezing
            await vectorizeTileClientSide(tile, mode, fillColor, smoothing, corner, simplify, speckle);
          }

          // Yield main UI thread between tiles to keep browser 100% responsive
          await new Promise(resolve => setTimeout(resolve, 15));
        }
      }

      processTilesInAsyncQueue();
    });
  }

  // Ultra-Fast O(1) Sliding-Window Box Blur Algorithm (Zero Freeze / High Performance)
  function boxBlurUint8(data, w, h, radius) {
    if (radius <= 0) return data;
    const passes = radius >= 3 ? 2 : 1;
    const r = Math.max(1, Math.round(radius / passes));
    let current = data;

    for (let p = 0; p < passes; p++) {
      const len = w * h;
      const temp = new Float32Array(len);
      const out = new Uint8ClampedArray(len * 4);

      // Horizontal Pass (O(1) sliding window sum)
      for (let y = 0; y < h; y++) {
        let sum = 0;
        let count = 0;
        const rowOffset = y * w;

        for (let ix = -r; ix <= r; ix++) {
          if (ix >= 0 && ix < w) {
            sum += current[(rowOffset + ix) * 4];
            count++;
          }
        }
        temp[rowOffset] = sum / count;

        for (let x = 1; x < w; x++) {
          const addX = x + r;
          const remX = x - r - 1;
          if (addX < w) { sum += current[(rowOffset + addX) * 4]; count++; }
          if (remX >= 0) { sum -= current[(rowOffset + remX) * 4]; count--; }
          temp[rowOffset + x] = sum / count;
        }
      }

      // Vertical Pass (O(1) sliding window sum)
      for (let x = 0; x < w; x++) {
        let sum = 0;
        let count = 0;

        for (let iy = -r; iy <= r; iy++) {
          if (iy >= 0 && iy < h) {
            sum += temp[iy * w + x];
            count++;
          }
        }
        const val0 = Math.round(sum / count);
        const idx0 = x * 4;
        out[idx0] = val0; out[idx0 + 1] = val0; out[idx0 + 2] = val0; out[idx0 + 3] = 255;

        for (let y = 1; y < h; y++) {
          const addY = y + r;
          const remY = y - r - 1;
          if (addY < h) { sum += temp[addY * w + x]; count++; }
          if (remY >= 0) { sum -= temp[remY * w + x]; count--; }
          const val = Math.round(sum / count);
          const idx = (y * w + x) * 4;
          out[idx] = val; out[idx + 1] = val; out[idx + 2] = val; out[idx + 3] = 255;
        }
      }
      current = out;
    }
    return current;
  }

  // Helper to remove stray micro-paths & isolated corner noise specks from Potrace SVG output
  function cleanStraySvgPaths(svgString, pad, w, h, scale) {
    if (!svgString || typeof svgString !== 'string' || !svgString.includes('d=')) return svgString;

    const match = svgString.match(/d="([^"]+)"/);
    if (!match) return svgString;

    const fullD = match[1];
    const subPaths = fullD.split(/(?=[MM])/).filter(p => p.trim().length > 0);
    if (subPaths.length <= 1) return svgString;

    const validSubPaths = subPaths.filter(sp => {
      const tokens = sp.match(/([a-zA-Z])|(-?\d+(?:\.\d+)?)/g);
      if (!tokens) return true;

      let curX = 0, curY = 0;
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      let currentCmd = 'M';

      for (let i = 0; i < tokens.length; i++) {
        const tok = tokens[i];
        if (/^[a-zA-Z]$/.test(tok)) {
          currentCmd = tok;
        } else {
          const val = parseFloat(tok);
          if (isNaN(val)) continue;
          
          const isRelative = currentCmd === currentCmd.toLowerCase();
          const cmdUpper = currentCmd.toUpperCase();

          if (cmdUpper === 'M' || cmdUpper === 'L' || cmdUpper === 'C' || cmdUpper === 'S' || cmdUpper === 'Q' || cmdUpper === 'T') {
            const xVal = val;
            const nextTok = tokens[i + 1];
            let yVal = 0;
            if (nextTok && !/^[a-zA-Z]$/.test(nextTok)) {
              yVal = parseFloat(nextTok);
              i++;
            }
            curX = isRelative ? curX + xVal : xVal;
            curY = isRelative ? curY + yVal : yVal;
          } else if (cmdUpper === 'H') {
            curX = isRelative ? curX + val : val;
          } else if (cmdUpper === 'V') {
            curY = isRelative ? curY + val : val;
          }

          if (curX < minX) minX = curX;
          if (curX > maxX) maxX = curX;
          if (curY < minY) minY = curY;
          if (curY > maxY) maxY = curY;
        }
      }

      const subW = maxX - minX;
      const subH = maxY - minY;

      // Discard tiny micro noise specks under 8px
      if (subW < 8 && subH < 8) return false;

      // Check if sub-path is located strictly inside one of the 4 extreme cell corners
      const cornerLimit = 22;
      const inTopLeft = (maxX < pad + cornerLimit && maxY < pad + cornerLimit);
      const inTopRight = (minX > pad + w - cornerLimit && maxY < pad + cornerLimit);
      const inBotLeft = (maxX < pad + cornerLimit && minY > pad + h - cornerLimit);
      const inBotRight = (minX > pad + w - cornerLimit && minY > pad + h - cornerLimit);

      if ((inTopLeft || inTopRight || inBotLeft || inBotRight) && (subW < 32 && subH < 32)) {
        return false; // Discard isolated corner noise tick!
      }

      return true;
    });

    if (validSubPaths.length === 0) return svgString;

    const cleanedD = validSubPaths.join(' ');
    return svgString.replace(/d="[^"]+"/, `d="${cleanedD}"`);
  }

  function vectorizeTileClientSide(tile, mode, fillColor, smoothing, corner, simplify, speckle) {
    return new Promise((resolve) => {
      if (!tile || !tile.dataUrl) {
        const emptySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%"></svg>`;
        window.handleVectorizeTileResult({ ok: true, index: tile ? tile.idx : 1, svg: emptySvg });
        resolve();
        return;
      }

      const img = new Image();
      img.onload = function() {
        const origW = img.width || 128;
        const origH = img.height || 128;

        // 1. High Precision Sub-Pixel 4x Canvas Upscaling (up to 1024px for optimal performance)
        const scale = Math.min(4, 1024 / Math.max(origW, origH));
        const w = Math.round(origW * scale);
        const h = Math.round(origH * scale);

        // 2. Measure border background color from unpadded image canvas
        const unpaddedCvs = document.createElement('canvas');
        unpaddedCvs.width = w;
        unpaddedCvs.height = h;
        const unpaddedCtx = unpaddedCvs.getContext('2d');
        unpaddedCtx.imageSmoothingEnabled = true;
        unpaddedCtx.imageSmoothingQuality = 'high';
        unpaddedCtx.drawImage(img, 0, 0, w, h);

        let bgR = 255, bgG = 255, bgB = 255;
        try {
          const rawImgData = unpaddedCtx.getImageData(0, 0, w, h);
          const rawPixels = rawImgData.data;
          const borderPixels = [];
          const stepX = Math.max(1, Math.floor(w / 64));
          const stepY = Math.max(1, Math.floor(h / 64));

          for (let x = 0; x < w; x += stepX) {
            const idxTop = x * 4;
            const idxBot = ((h - 1) * w + x) * 4;
            borderPixels.push([rawPixels[idxTop], rawPixels[idxTop+1], rawPixels[idxTop+2]]);
            borderPixels.push([rawPixels[idxBot], rawPixels[idxBot+1], rawPixels[idxBot+2]]);
          }
          for (let y = 0; y < h; y += stepY) {
            const idxLeft = (y * w) * 4;
            const idxRight = (y * w + w - 1) * 4;
            borderPixels.push([rawPixels[idxLeft], rawPixels[idxLeft+1], rawPixels[idxLeft+2]]);
            borderPixels.push([rawPixels[idxRight], rawPixels[idxRight+1], rawPixels[idxRight+2]]);
          }
          if (borderPixels.length > 0) {
            borderPixels.sort((a, b) => (a[0]+a[1]+a[2]) - (b[0]+b[1]+b[2]));
            const mid = borderPixels[Math.floor(borderPixels.length / 2)];
            bgR = mid[0]; bgG = mid[1]; bgB = mid[2];
          }
        } catch (e) {
          console.warn('Border sampling notice:', e);
        }

        // 3. Create 36px padded canvas filled with measured background color
        const pad = 36;
        const totalW = w + pad * 2;
        const totalH = h + pad * 2;

        const cvs = document.createElement('canvas');
        cvs.width = totalW;
        cvs.height = totalH;
        const ctx = cvs.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.fillStyle = `rgb(${bgR}, ${bgG}, ${bgB})`;
        ctx.fillRect(0, 0, totalW, totalH);
        ctx.drawImage(img, pad, pad, w, h);

        // 3b. Micro-purge ONLY the extreme 4 cell corners to remove slice grid ticks without touching icon artwork
        const cornerDotSize = Math.max(6, Math.round(scale * 1.5));
        ctx.fillRect(pad, pad, cornerDotSize, cornerDotSize); // Top-Left corner
        ctx.fillRect(pad + w - cornerDotSize, pad, cornerDotSize, cornerDotSize); // Top-Right corner
        ctx.fillRect(pad, pad + h - cornerDotSize, cornerDotSize, cornerDotSize); // Bottom-Left corner
        ctx.fillRect(pad + w - cornerDotSize, pad + h - cornerDotSize, cornerDotSize, cornerDotSize); // Bottom-Right corner

        let paddedImgData = null;
        try {
          paddedImgData = ctx.getImageData(0, 0, totalW, totalH);
        } catch (e) {
          console.warn('Canvas getImageData notice:', e);
        }

        if (paddedImgData && window.Potrace && window.Potrace.traceImageData) {
          const paddedPixels = paddedImgData.data;
          const len = totalW * totalH;

          // 4. Calculate perceptual ink distance with S-curve contrast gamma
          let maxInk = 1;
          const inkDistances = new Float32Array(len);
          for (let i = 0; i < len; i++) {
            const offset = i * 4;
            const a = paddedPixels[offset + 3] / 255;
            const r = paddedPixels[offset] * a + bgR * (1 - a);
            const g = paddedPixels[offset + 1] * a + bgG * (1 - a);
            const b = paddedPixels[offset + 2] * a + bgB * (1 - a);
            const dr = r - bgR, dg = g - bgG, db = b - bgB;
            const dist = Math.sqrt(0.299 * dr * dr + 0.587 * dg * dg + 0.114 * db * db);
            inkDistances[i] = dist;
            if (dist > maxInk) maxInk = dist;
          }

          // Apply S-curve gamma adjustment for crisp yet ultra-smooth stroke edge definition
          const normData = new Uint8ClampedArray(len * 4);
          for (let i = 0; i < len; i++) {
            const inkRatio = Math.min(1, inkDistances[i] / maxInk);
            const gammaInk = Math.pow(inkRatio, 0.85); // Crisp S-curve
            const normInk = Math.min(255, Math.round(gammaInk * 255));
            const val = 255 - normInk; // 0 = black stroke (icon lines), 255 = white bg
            const idx = i * 4;
            normData[idx] = val;
            normData[idx + 1] = val;
            normData[idx + 2] = val;
            normData[idx + 3] = 255;
          }

          // 5. 2-Pass Gaussian Box Blur Edge Smoothing
          const blurRadius = Math.max(0, Math.min(10, Math.round((Number(smoothing) || 0) * scale * 0.4)));
          const finalNormData = blurRadius > 0 ? boxBlurUint8(normData, totalW, totalH, blurRadius) : normData;

          // Micro corner purge in finalNormData (4 extreme corners ONLY)
          const cornerSize = Math.max(8, Math.round(scale * 2.0));
          for (let py = 0; py < totalH; py++) {
            for (let px = 0; px < totalW; px++) {
              const isTopLeft = (px < pad + cornerSize && py < pad + cornerSize);
              const isTopRight = (px > pad + w - cornerSize && py < pad + cornerSize);
              const isBotLeft = (px < pad + cornerSize && py > pad + h - cornerSize);
              const isBotRight = (px > pad + w - cornerSize && py > pad + h - cornerSize);

              if (isTopLeft || isTopRight || isBotLeft || isBotRight) {
                const pidx = (py * totalW + px) * 4;
                finalNormData[pidx] = 255;
                finalNormData[pidx + 1] = 255;
                finalNormData[pidx + 2] = 255;
                finalNormData[pidx + 3] = 255;
              }
            }
          }

          const alphaMaxVal = Math.max(0, Math.min(1.334, ((corner || 133) / 180) * 1.334));
          const optTolVal = Math.max(0.02, (simplify || 5.5) * 0.12);

          window.Potrace.traceImageData({ width: totalW, height: totalH, data: finalNormData }, {
            threshold: 128,
            color: fillColor || '#344e41',
            turdSize: Math.max(4, Math.round((speckle || 2) * scale * 0.8)),
            alphaMax: alphaMaxVal,
            optCurve: true,
            optTolerance: optTolVal
          }).then(svgString => {
            // Crop viewBox to exact icon bounds `pad pad w h`
            svgString = svgString.replace(/viewBox="0 0 \d+ \d+"/, `viewBox="${pad} ${pad} ${w} ${h}"`);
            if (fillColor && !svgString.includes('fill=')) {
              svgString = svgString.replace('<path ', `<path fill="${fillColor}" `);
            }
            // Filter out stray micro-paths & border noise artifacts
            svgString = cleanStraySvgPaths(svgString, pad, w, h, scale);

            window.handleVectorizeTileResult({ ok: true, index: tile.idx, svg: svgString });
            resolve();
          }).catch(err => {
            console.warn('Potrace trace error, using fallback:', err);
            const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${origW} ${origH}" width="100%" height="100%"><rect width="${origW}" height="${origH}" fill="none"/><image href="${tile.dataUrl}" width="${origW}" height="${origH}"/></svg>`;
            window.handleVectorizeTileResult({ ok: true, index: tile.idx, svg: fallbackSvg });
            resolve();
          });
        } else {
          const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${origW} ${origH}" width="100%" height="100%"><rect width="${origW}" height="${origH}" fill="none"/><image href="${tile.dataUrl}" width="${origW}" height="${origH}"/></svg>`;
          window.handleVectorizeTileResult({ ok: true, index: tile.idx, svg: fallbackSvg });
          resolve();
        }
      };

      img.onerror = function() {
        const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="100%" height="100%"><image href="${tile.dataUrl}" width="128" height="128"/></svg>`;
        window.handleVectorizeTileResult({ ok: true, index: tile.idx, svg: fallbackSvg });
        resolve();
      };

      img.src = tile.dataUrl;
    });
  }

  // Callback handler for WebSocket results
  window.handleVectorizeTileResult = async function(msg) {
    if (!isVectorizing) return;
    const tileIdx = msg.index;
    const tile = slicedTilesData.find(t => t.idx === tileIdx);
    if (!tile) return;

    if (window.pendingVectorizeResolves && window.pendingVectorizeResolves.has(tileIdx)) {
      const resolve = window.pendingVectorizeResolves.get(tileIdx);
      window.pendingVectorizeResolves.delete(tileIdx);
      resolve();
    }

    vectorizeCompletedCount++;
    const totalTiles = slicedTilesData.length;

    // Update topbar progress bar width
    const progressPercent = Math.min(100, Math.round((vectorizeCompletedCount / totalTiles) * 100));
    const progressBar = document.getElementById('vectorizerProgressBar');
    if (progressBar) {
      progressBar.style.width = `${progressPercent}%`;
    }

    const cardEl = document.getElementById(`tool4-tile-card-${tileIdx}`);
    if (cardEl) {
      cardEl.classList.remove('active-processing-tile');
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    if (msg.ok) {
      tile.isVectorized = true;
      tile.svgContent = msg.svg;

      // Extract path tag from the SVG response
      const parser = new DOMParser();
      const doc = parser.parseFromString(msg.svg, 'image/svg+xml');
      
      // Parse viewBox attributes
      const svgRoot = doc.querySelector('svg');
      let viewBoxWidth = 100, viewBoxHeight = 100;
      let viewBoxX = 0, viewBoxY = 0;
      if (svgRoot) {
        const vb = svgRoot.getAttribute('viewBox');
        if (vb) {
          const parts = vb.split(/\s+/).map(Number);
          if (parts.length === 4) {
            viewBoxX = parts[0];
            viewBoxY = parts[1];
            viewBoxWidth = parts[2];
            viewBoxHeight = parts[3];
          }
        }
      }
      tile.viewBoxX = viewBoxX;
      tile.viewBoxY = viewBoxY;
      tile.svgWidth = viewBoxWidth || 100;
      tile.svgHeight = viewBoxHeight || 100;

      const paths = Array.from(doc.querySelectorAll('path, image'));
      let extractedContent = '';
      paths.forEach(el => {
        extractedContent += el.outerHTML;
      });
      tile.svgPath = extractedContent || msg.svg;

      if (cardEl) {
        cardEl.innerHTML = `
          <div style="position: absolute; top: 8px; left: 8px; font-size: 10px; font-weight: 800; color: var(--tertiary); background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.3); padding: 3px 8px; border-radius: 6px;">#${tileIdx} Vector</div>
          <div style="width: 100px; height: 100px; display: flex; align-items: center; justify-content: center; margin-top: 12px;" class="vector-preview-box">
            ${msg.svg}
          </div>
        `;
        const svgEl = cardEl.querySelector('.vector-preview-box svg');
        if (svgEl) {
          svgEl.removeAttribute('width');
          svgEl.removeAttribute('height');
          svgEl.style.width = '80px';
          svgEl.style.height = '80px';
          svgEl.style.maxHeight = '100%';
          svgEl.style.maxWidth = '100%';
          svgEl.style.objectFit = 'contain';
          svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        }
      }
    } else {
      tile.isVectorized = true;
      tile.svgPath = `<rect width="100" height="100" fill="#ea4335"/>`;
      if (cardEl) {
        cardEl.innerHTML = `
          <div style="position: absolute; top: 8px; left: 8px; font-size: 10px; font-weight: 800; color: #ea4335; background: rgba(234,67,53,0.1); padding: 3px 8px; border-radius: 6px;">#${tileIdx} Error</div>
          <div style="width: 100px; height: 100px; display: flex; align-items: center; justify-content: center; margin-top: 12px; font-size: 11px; color: #ea4335; text-align: center; padding: 6px;">
            Failed to trace
          </div>
        `;
      }
    }

    // Real-time Presentation Sheet Canvas Update
    const isSheetView = tool4SheetWrap && tool4SheetWrap.style.display === 'block';
    if (isSheetView) {
      buildBrandedSvgSheet();
    }

    if (vectorizeCompletedCount >= totalTiles) {
      isVectorizing = false;
      if (btnToggleSheetView) {
        btnToggleSheetView.disabled = false;
        btnToggleSheetView.innerHTML = 'Presentation Sheet';
        btnToggleSheetView.style.opacity = '1';
        btnToggleSheetView.style.cursor = 'pointer';
      }
      // Re-enable primary action button
      btnSliceVectorize.classList.remove('btn-vectorize-stop');
      btnSliceVectorize.disabled = false;
      if (isSheetView) {
        btnSliceVectorize.textContent = '✨ Update Presentation';
      } else {
        btnSliceVectorize.textContent = `⚡ Convert ${totalTiles} Icons to Vector`;
      }

      // Hide progress bar with a slight delay post-completion
      setTimeout(() => {
        const progressContainer = document.getElementById('vectorizerProgressBarContainer');
        const progressBar = document.getElementById('vectorizerProgressBar');
        if (progressContainer) {
          progressContainer.style.display = 'none';
        }
        if (progressBar) {
          progressBar.style.width = '0%';
        }
      }, 800);

      // Consume credit upon successful vectorization completion
      const activeSheetsSet = new Set(slicedTilesData.map(t => t.sheetName));
      const requiredCredits = activeSheetsSet.size || 1;
      await window.checkAndConsumeCredit('iconSheets', requiredCredits, true);

      // Track user metric for iconSheets
      if (typeof window.trackUserMetric === 'function') {
        window.trackUserMetric('iconSheets');
      }

      // Build presentation sheet SVG
      buildBrandedSvgSheet();

      // Trigger automatic naming with Gemini AI for sheets without a generated title
      const sheetsToTitle = loadedSheetImgs ? loadedSheetImgs.filter(s => !s.title || s.title === 'ICON PACK' || s.title === 'VECTOR ICONS') : [];
      if (sheetsToTitle.length > 0) {
        const totalSheets = sheetsToTitle.length;
        showGeminiNamingLoader(true, `🪄 Gemini AI is analyzing icons & generating unique branding titles... (1 of ${totalSheets})`, { current: 0, total: totalSheets });
        
        setTimeout(async () => {
          let count = 0;
          for (const s of sheetsToTitle) {
            showGeminiNamingLoader(true, `🪄 Gemini AI is generating unique title for Sheet ${count + 1} of ${totalSheets}...`, { current: count, total: totalSheets });
            try {
              await regenerateBrandingTitleWithGemini(s.name, true);
            } catch (e) {
              console.error(`Auto-titling failed for ${s.name}:`, e);
            }
            count++;
            if (count < totalSheets) {
              await new Promise(resolve => setTimeout(resolve, 600));
            }
          }
          showGeminiNamingLoader(true, '🪄 Branding generation complete!', { current: totalSheets, total: totalSheets });
          await new Promise(resolve => setTimeout(resolve, 600));
          showGeminiNamingLoader(false);
          buildBrandedSvgSheet();
          if (window.showCustomAlert) {
            window.showCustomAlert(`✨ Gemini AI দিয়ে সফলভাবে ${totalSheets}টি আইকন সেটের জন্য ইউনিক টাইটেল তৈরি করা হয়েছে!`, 'AI টাইটেল সম্পন্ন', 'success');
          }
        }, 400);
      }

      // Enable download and save buttons
      if (btnDownloadAssembledSheet) btnDownloadAssembledSheet.disabled = false;
      if (btnSaveToPC) btnSaveToPC.disabled = false;

      // Show Bulk ZIP download button
      const btnZip = document.getElementById('btnDownloadAllZip');
      if (btnZip) {
        btnZip.style.display = 'inline-flex';
        btnZip.textContent = '📦 Download All ZIP';
        btnZip.title = `Download all ${totalTiles} vector icons and presentation sheets as a ZIP package`;
      }
    }
  };

  // Download all vectorized icons as a single ZIP archive
  function downloadAllSVGsAsZip() {
    if (!window.JSZip) {
      alert('JSZip library is loading, please try again in a moment.');
      return;
    }
    const zip = new JSZip();
    const folder = zip.folder('gravity_vector_icons');

    let count = 0;
    slicedTilesData.forEach((tile) => {
      if (tile.svgContent) {
        const safeSheetName = (tile.sheetName || 'sheet').replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
        const sheetFolder = folder.folder(safeSheetName);
        const namePart = tile.name ? tile.name.replace(/[^a-zA-Z0-9_-]/g, '_') : `icon_${tile.localIdx || tile.idx}`;
        const filename = `${namePart}.svg`;
        sheetFolder.file(filename, tile.svgContent);
        count++;
      }
    });

    if (count === 0) {
      alert('No vectorized SVG icons found to download yet.');
      return;
    }

    zip.generateAsync({ type: 'blob' }).then((content) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(content);
      a.download = `Gravity_Vector_Icons_${Date.now()}.zip`;
      a.click();
      if (window.showCustomAlert) window.showCustomAlert(`Downloaded all ${count} vectorized SVGs in a ZIP archive!`, 'ZIP Downloaded', 'success');
    });
  }


  // Auto-trim whitespace from canvas tile
  function autoTrimCanvasTile(canvas) {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const W = canvas.width;
    const H = canvas.height;
    const imgData = ctx.getImageData(0, 0, W, H);
    const data = imgData.data;

    let minX = W, minY = H, maxX = -1, maxY = -1;

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4;
        const alpha = data[i + 3];
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const isBg = (r > 235 && g > 235 && b > 235) || alpha < 20;
        if (!isBg) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (maxX < minX || maxY < minY) return canvas;

    const pad = Math.round(Math.min(maxX - minX, maxY - minY) * 0.16) + 12;
    const bx = Math.max(0, minX - pad);
    const by = Math.max(0, minY - pad);
    const bw = Math.min(W - bx, (maxX - minX) + pad * 2);
    const bh = Math.min(H - by, (maxY - minY) + pad * 2);

    const trimmed = document.createElement('canvas');
    trimmed.width = bw;
    trimmed.height = bh;
    const tCtx = trimmed.getContext('2d');
    tCtx.fillStyle = '#ffffff';
    tCtx.fillRect(0, 0, bw, bh);
    tCtx.drawImage(canvas, bx, by, bw, bh, 0, 0, bw, bh);
    return trimmed;
  }

  // Helper to build a single Branded Presentation SVG Sheet for a given tile subset
  // Helper to calculate columns and rows that balance space utilization (coverage) and minimize empty cells
  function calculateOptimalGrid(N, targetW, targetH) {
    if (N <= 0) return { cols: 1, rows: 1 };
    
    let bestCols = 3;
    let bestRows = 3;
    let bestScore = -Infinity;
    
    const targetRatio = targetW / targetH;
    
    // Search grid combinations (c x r) that can hold all N active icons
    for (let c = 1; c <= 25; c++) {
      for (let r = 1; r <= 25; r++) {
        const cellCount = c * r;
        if (cellCount < N) continue; // Grid MUST be big enough to hold all N active icons!
        
        const emptySpots = cellCount - N;
        const ratio = c / r;
        
        // Allow flexible grid ratios (from square to wide)
        if (ratio < targetRatio * 0.35 || ratio > targetRatio * 2.5) {
          continue;
        }
        
        const cellW = targetW / c;
        const cellH = targetH / r;
        const cellS = Math.min(cellW, cellH);
        
        const gridW = c * cellS;
        const gridH = r * cellS;
        const coverage = (gridW * gridH) / (targetW * targetH);
        
        // Primary priority: MINIMIZE empty spots (prefer exact full grid). Secondary: Maximize canvas coverage.
        const score = (1000 - emptySpots * 50) + coverage;
        
        if (score > bestScore) {
          bestScore = score;
          bestCols = c;
          bestRows = r;
        }
      }
    }
    
    // Fallback if constraints filtered out all candidates
    if (bestScore === -Infinity) {
      let minDiff = Infinity;
      for (let r = 1; r <= 25; r++) {
        const c = Math.ceil(N / r);
        if (c <= 0) continue;
        const cellCount = c * r;
        const diff = cellCount - N;
        if (diff < minDiff) {
          minDiff = diff;
          bestCols = c;
          bestRows = r;
        }
      }
    }
    
    return { cols: bestCols, rows: bestRows };
  }

  function escapeXml(unsafe) {
    if (typeof unsafe !== 'string') return unsafe;
    return unsafe.replace(/[<>&'"]/g, function (c) {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
      }
    });
  }

  function deriveNicheTitleFromIconNames(tiles) {
    if (!tiles || tiles.length === 0) return '';
    const wordFreq = {};
    const stopWords = new Set([
      'a', 'an', 'the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'icon', 'icons', 'set', 'grid', 'tile', 'tiles', 'sheet', 'slice', 'vector',
      'line', 'flat', 'solid', 'filled', 'outline', 'glyph', 'bold', 'thin',
      'google', 'flow', 'automator', 'gravity', 'labs', 'studio',
      '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'
    ]);

    const categoryKeywords = {
      'FIRE SAFETY': ['fire', 'firefighter', 'extinguisher', 'hydrant', 'alarm', 'axe', 'hose', 'sprinkler', 'emergency', 'helmet', 'flame', 'smoke', 'burn', 'rescue', 'hazard', 'safety'],
      'SECURITY': ['shield', 'key', 'lock', 'fingerprint', 'check', 'verified', 'user', 'protection', 'guard', 'access', 'privacy', 'password', 'vault', 'surveillance'],
      'COMMUNITY': ['community', 'volunteer', 'helping', 'hands', 'care', 'support', 'charity', 'peace', 'family', 'nonprofit', 'welfare', 'group', 'elderly', 'wheelchair', 'together', 'unity', 'society', 'life', 'preserver', 'dove', 'hugging', 'fountain', 'cane', 'boots', 'garden'],
      'TECHNOLOGY': ['network', 'server', 'chip', 'cpu', 'router', 'wifi', 'data', 'cloud', 'robot', 'code', 'software', 'cyber', 'security', 'digital', 'hardware', 'api', 'blockchain', 'tech', 'microchip', 'optic', 'programming', 'device', 'app', 'system', 'monitors', 'sync', 'neural', 'vr', 'headset', 'recognition', 'upload', 'bitcoin'],
      'CYBERSECURITY': ['antivirus', 'shield', 'firewall', 'security', 'key', 'lock', 'access', 'data', 'encrypted', 'hacker', 'privacy', 'protection', 'scanner', 'passcode'],
      'EDUCATION': ['book', 'graduation', 'diploma', 'school', 'study', 'notebook', 'pencil', 'degree', 'learn', 'student', 'class', 'certificate', 'exam', 'college', 'university', 'academy'],
      'BUSINESS': ['briefcase', 'office', 'chart', 'growth', 'graph', 'presentation', 'desk', 'folder', 'document', 'report', 'meeting', 'contract', 'analytics', 'strategy', 'target', 'corporate', 'organization'],
      'FINANCE': ['coin', 'coins', 'money', 'dollar', 'bank', 'wallet', 'card', 'payment', 'cash', 'calculator', 'tax', 'currency', 'vault', 'safe', 'budget', 'piggy', 'credit', 'exchange', 'investment'],
      'HEALTHCARE': ['medical', 'firstaid', 'pill', 'doctor', 'hospital', 'health', 'fitness', 'dumbbell', 'medicine', 'pulse', 'cross', 'clinic', 'stethoscope', 'crutches', 'bandage', 'treatment', 'diet', 'stomach', 'scale'],
      'WORKPLACE': ['chair', 'desk', 'shredder', 'clip', 'stapler', 'stamp', 'lamp', 'printer', 'telephone', 'scanner', 'trash', 'calendar', 'badge', 'cabinet', 'clock'],
      'CREATIVE': ['idea', 'brain', 'puzzle', 'art', 'design', 'magic', 'lightbulb', 'compass', 'mind', 'think', 'thought', 'solution'],
      'REAL ESTATE': ['house', 'property', 'home', 'estate', 'realtor', 'apartment', 'rent', 'mortgage', 'architect', 'blueprint'],
      'LOGISTICS': ['delivery', 'cargo', 'shipping', 'box', 'package', 'truck', 'warehouse', 'freight', 'transport', 'container', 'express', 'parcel', 'courier', 'inventory', 'supply'],
      'COMMUNICATION': ['megaphone', 'mail', 'inbox', 'phone', 'chat', 'message', 'wifi', 'signal', 'globe', 'network', 'podcast', 'mic', 'share'],
      'E-COMMERCE': ['cart', 'basket', 'checkout', 'shopping', 'store', 'shop', 'discount', 'sale', 'tag', 'price', 'order', 'coupon'],
      'TRAVEL & NATURE': ['travel', 'nature', 'mountain', 'tree', 'park', 'sun', 'cloud', 'beach', 'island', 'flight', 'plane', 'airplane', 'compass', 'map', 'location', 'passport'],
      'FOOD & DINING': ['food', 'restaurant', 'dish', 'meal', 'chef', 'kitchen', 'recipe', 'bakery', 'cafe', 'coffee', 'tea', 'cup', 'salad', 'burger', 'pizza'],
      'AUTOMOTIVE': ['car', 'vehicle', 'auto', 'engine', 'wheel', 'speed', 'tire', 'garage', 'mechanic', 'drive', 'fuel', 'oil']
    };

    const categoryScores = {};

    tiles.forEach(t => {
      if (!t || !t.name || t.isDeleted || t.name.startsWith('tile') || t.name.startsWith('slice')) return;
      const words = t.name.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/);
      words.forEach(w => {
        if (w.length > 2 && !stopWords.has(w)) {
          wordFreq[w] = (wordFreq[w] || 0) + 1;
          for (const [cat, kwList] of Object.entries(categoryKeywords)) {
            if (kwList.includes(w)) {
              categoryScores[cat] = (categoryScores[cat] || 0) + 1;
            }
          }
        }
      });
    });

    let bestCategory = '';
    let maxScore = 0;
    for (const [cat, score] of Object.entries(categoryScores)) {
      if (score > maxScore) {
        maxScore = score;
        bestCategory = cat;
      }
    }

    if (bestCategory && maxScore >= 2) {
      return bestCategory;
    }

    return '';
  }

  function buildSingleBrandedSvgSheet(tilesToRender, sheetLabel = '', gridCols = null, gridRows = null, isExport = false, customTitle = '') {
    if (tilesToRender && tilesToRender.length > 0) {
      tilesToRender.forEach(t => {
        if (t.svgPath === undefined || t.svgPath === null) {
          t.svgPath = '';
        }
      });
    }
    const cols = gridCols || parseInt(sheetCols.value) || 5;
    const rows = gridRows || parseInt(sheetRows.value) || 3;
    const isMockup = (!tilesToRender || tilesToRender.length === 0);

    const maxCells = cols * rows;

    if (isMockup) {
      tilesToRender = [];
      const totalTiles = cols * rows;
      for (let i = 0; i < totalTiles; i++) {
        tilesToRender.push({
          idx: i + 1,
          svgWidth: 100,
          svgHeight: 100,
          svgPath: `<circle cx="50" cy="50" r="30" fill="none" stroke="rgba(0, 0, 0, 0.2)" stroke-width="6" stroke-dasharray="6,4"/><circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" stroke-width="4" stroke-dasharray="6,4"/><path d="M50 25 L55 38 L68 38 L57 46 L61 58 L50 50 L39 58 L43 46 L32 38 L45 38 Z" fill="none" stroke="rgba(0, 0, 0, 0.25)" stroke-width="4" stroke-linejoin="round"/><path d="M50 25 L55 38 L68 38 L57 46 L61 58 L50 50 L39 58 L43 46 L32 38 L45 38 Z" fill="currentColor"/>`
        });
      }
    }

    // Calculate count of active tiles placed on the artboard grid
    const shouldShuffle = sheetShuffle ? sheetShuffle.checked : false;
    let activeTiles = tilesToRender.filter(t => !t.isDeleted);
    if (shouldShuffle) {
      activeTiles.sort((a, b) => (a.randSort || 0) - (b.randSort || 0));
    } else {
      activeTiles.sort((a, b) => a.idx - b.idx);
    }
    let activeTilesOnGridCount = 0;
    if (isMockup) {
      activeTilesOnGridCount = tilesToRender.length;
    } else if (isGridSizeManuallyOverridden) {
      activeTilesOnGridCount = tilesToRender.filter(t => !t.isDeleted && t.gridSlot !== -1 && t.gridSlot < maxCells).length;
    } else {
      activeTilesOnGridCount = Math.min(activeTiles.length, maxCells);
    }

    let cleanLabel = sheetLabel ? sheetLabel.replace(/\.[^/.]+$/, '').replace(/_\d+$/, '').replace(/_icon_sheet.*$/i, '').replace(/[-_]/g, ' ').trim() : '';
    const isGenericLabel = !cleanLabel || /^(google\s*flow|google\s*flow\s*automator|flow\s*automator|gravity\s*flow|gravity\s*flow\s*automator|icon\s*sheet|icons\s*sheet|sheet(\s*\d+)?|default|whatsapp(\s*image)?|img|image|photo|picture|pic|screenshot|screen|untitled|new\s*folder|new\s*project|download|file)/i.test(cleanLabel);
    if (isGenericLabel) {
      cleanLabel = '';
    }

    const currentSheetObj = (loadedSheetImgs && loadedSheetImgs.length > 0) ? loadedSheetImgs.find(s => s.name === sheetLabel || s.name === activePreviewSheetName) : null;
    const sIndex = currentSheetObj ? loadedSheetImgs.indexOf(currentSheetObj) : 0;
    let defaultFallback = (sIndex % 2 === 1) ? 'ICON PACK' : 'VECTOR ICONS';

    let derivedTitle = '';
    if (!customTitle && !cleanLabel && tilesToRender && tilesToRender.length > 0) {
      derivedTitle = deriveNicheTitleFromIconNames(tilesToRender);
    }

    const explicitTitle = customTitle || (currentSheetObj && currentSheetObj.title ? currentSheetObj.title.trim() : '');

    const userDefinedName = explicitTitle || cleanLabel || derivedTitle || ((sheetSetName && sheetSetName.value && sheetSetName.value !== 'BRANDING' && !/^(google\s*flow|google\s*flow\s*automator)$/i.test(sheetSetName.value.trim())) ? sheetSetName.value.trim() : '');
    const rawNameBase = userDefinedName || (isMockup ? 'MY PRESET' : defaultFallback);
    const nameBase = window.formatTitleWordLimit ? window.formatTitleWordLimit(rawNameBase, 2) : rawNameBase;
    const setNameText = nameBase.toUpperCase();
    const userDefinedSub = (sheetSubtitle && sheetSubtitle.value) ? sheetSubtitle.value.trim() : '';
    const subtitleText = (userDefinedSub || `${activeTilesOnGridCount} ICONS · VECTOR SVG`).toUpperCase();

    const W = 6000;
    const H = 2600;

    const gridLayer = activeLayers.find(l => l.type === 'grid');
    const fillColor = (gridLayer && gridLayer.fill) || (vecFillColor ? vecFillColor.value : '#000000');
    const labelFillColor = (gridLayer && gridLayer.labelColor) ? gridLayer.labelColor : (vecLabelColor ? vecLabelColor.value : ((gridLayer && gridLayer.fill) ? gridLayer.fill : '#000000'));

    const layoutMode = sheetLayout ? sheetLayout.value : 'template';
    if (layoutMode === 'compact') {
      const CELL = 256;
      const gapPx = 24;
      const pitch = CELL + gapPx;
      const compactW = cols * CELL + (cols + 1) * gapPx;
      const compactH = rows * CELL + (rows + 1) * gapPx;

      let compactCardsSvg = '';
      let idx = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (idx >= tilesToRender.length) break;
          const tile = tilesToRender[idx];
          if (!tile) { idx++; continue; }
          const cellX = gapPx + c * pitch;
          const cellY = gapPx + r * pitch;
          const cx = cellX + CELL / 2;
          const cy = cellY + CELL / 2;
          const compactFitSize = CELL * 0.72;
          const vbx = tile.viewBoxX !== undefined ? tile.viewBoxX : 0;
          const vby = tile.viewBoxY !== undefined ? tile.viewBoxY : 0;
          const tw = tile.svgWidth ? tile.svgWidth : 100;
          const th = tile.svgHeight ? tile.svgHeight : 100;
          const tScale = Math.min(compactFitSize / tw, compactFitSize / th);
          const tx = cx - (tw * tScale) / 2 - vbx * tScale;
          const ty = cy - (th * tScale) / 2 - vby * tScale;

          compactCardsSvg += `
            <g transform="translate(${tx}, ${ty}) scale(${tScale})">
              ${tile.svgPath}
            </g>
          `;
          idx++;
        }
      }

      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${compactW} ${compactH}" width="${compactW}" height="${compactH}">
          <rect width="${compactW}" height="${compactH}" fill="#ffffff"/>
          <g fill="${fillColor}">
            ${compactCardsSvg}
          </g>
        </svg>
      `;
    } else {
      let layersHtml = '';
      activeLayers.forEach(layer => {
        if (layer.visible === false) return;
        let layerText = layer.text || '';
        if (layer.id === 'titleText' || (layer.name && layer.name.toLowerCase().includes('title text'))) {
          layerText = setNameText;
        } else {
          if (layerText.includes('[COUNT]')) {
            layerText = layerText.replace('[COUNT]', activeTilesOnGridCount);
          }
          if (layerText.includes('[NAME]')) {
            layerText = layerText.replace('[NAME]', setNameText);
          }
        }

        let layerMarkup = '';

        if (layer.type === 'rect') {
          const radiusAttr = layer.radius ? `rx="${layer.radius}"` : '';
          layerMarkup = `    <!-- Rect: ${layer.name} -->\n    <rect data-id="${layer.id}" x="${layer.x}" y="${layer.y}" width="${layer.w}" height="${layer.h}" ${radiusAttr} fill="${layer.fill}" style="cursor: move;"/>\n`;
        }
        else if (layer.type === 'ellipse') {
          const cx = layer.x + layer.w / 2;
          const cy = layer.y + layer.h / 2;
          const rx = layer.w / 2;
          const ry = layer.h / 2;
          layerMarkup = `    <!-- Ellipse: ${layer.name} -->\n    <ellipse data-id="${layer.id}" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${layer.fill}" style="cursor: move;"/>\n`;
        }
        else if (layer.type === 'triangle') {
          const r = layer.radius || 0;
          const strokeAttr = r > 0 ? `stroke="${layer.fill}" stroke-width="${r}" stroke-linejoin="round"` : '';
          const x1 = layer.x + layer.w / 2;
          const y1 = layer.y + r / 2;
          const x2 = layer.x + r / 2;
          const y2 = layer.y + layer.h - r / 2;
          const x3 = layer.x + layer.w - r / 2;
          const y3 = layer.y + layer.h - r / 2;
          layerMarkup = `    <!-- Triangle: ${layer.name} -->\n    <polygon data-id="${layer.id}" points="${x1},${y1} ${x2},${y2} ${x3},${y3}" fill="${layer.fill}" ${strokeAttr} style="cursor: move;"/>\n`;
        }
        else if (layer.type === 'line') {
          const thickness = layer.h || 10;
          const yPos = layer.y + thickness / 2;
          layerMarkup = `    <!-- Line: ${layer.name} -->\n    <line data-id="${layer.id}" x1="${layer.x}" y1="${yPos}" x2="${layer.x + layer.w}" y2="${yPos}" stroke="${layer.fill}" stroke-width="${thickness}" stroke-linecap="round" style="cursor: move;"/>\n`;
        }
        else if (layer.type === 'text') {
          const fontName = layer.fontFamily || 'Outfit';
          const textCleaned = escapeXml(layerText);
          const rawFontSize = layer.fontSize || 130;
          
          // Determine maximum allowed printable width for this text layer
          // Sidebar titles (x < 2000 or x > 4000) have max width of 1200px. Banner titles (x ~ 3000) have max width of 4500px.
          const maxAllowedW = layer.w ? layer.w : (layer.x < 2000 || layer.x > 4000 ? 1200 : 4500);
          
          let effectiveFontSize = rawFontSize;
          
          if (loadedOutfitFont) {
            try {
              const fullW = loadedOutfitFont.getAdvanceWidth(layerText, rawFontSize);
              if (fullW > maxAllowedW && fullW > 0) {
                const scale = maxAllowedW / fullW;
                effectiveFontSize = Math.max(45, Math.floor(rawFontSize * scale));
              }
            } catch (e) {
              console.error('[Font-Loader] Error calculating text width:', e);
            }
          }

          let textGroupContent = '';
          const lineY = layer.y;
          let calcTextWidth = 0;
          
          if (loadedOutfitFont) {
            try {
              const textWidth = loadedOutfitFont.getAdvanceWidth(layerText, effectiveFontSize);
              calcTextWidth = textWidth;
              const startX = layer.x - textWidth / 2;
              let currentX = startX;
              let pathsMarkup = '';
              for (let i = 0; i < layerText.length; i++) {
                const char = layerText[i];
                const charWidth = loadedOutfitFont.getAdvanceWidth(char, effectiveFontSize);
                if (char !== ' ') {
                  const charPath = loadedOutfitFont.getPath(char, currentX, lineY, effectiveFontSize);
                  pathsMarkup += `      <path d="${charPath.toPathData()}" />\n`;
                }
                currentX += charWidth;
              }
              textGroupContent = pathsMarkup;
            } catch (e) {
              calcTextWidth = effectiveFontSize * 0.6 * (layerText.length || 6);
              textGroupContent = `      <text x="${layer.x}" y="${lineY}" text-anchor="middle" fill="${layer.fill}" font-family="'${fontName}', sans-serif" font-weight="900" font-size="${effectiveFontSize}">${textCleaned}</text>\n`;
            }
          } else {
            calcTextWidth = effectiveFontSize * 0.6 * (layerText.length || 6);
            textGroupContent = `      <text x="${layer.x}" y="${lineY}" text-anchor="middle" fill="${layer.fill}" font-family="'${fontName}', sans-serif" font-weight="900" font-size="${effectiveFontSize}">${textCleaned}</text>\n`;
          }

          // Generous transparent hit-box covering text area so clicks easily select text instead of background shapes
          const hitW = Math.max(100, Math.round(calcTextWidth + 40));
          const hitH = Math.max(50, Math.round(effectiveFontSize * 1.3));
          const hitX = Math.round(layer.x - hitW / 2);
          const hitY = Math.round(lineY - effectiveFontSize * 1.05);

          const hitBoxMarkup = !isExport
            ? `      <rect x="${hitX}" y="${hitY}" width="${hitW}" height="${hitH}" fill="transparent" pointer-events="all" style="cursor: move;"/>\n`
            : '';

          layerMarkup = `    <!-- Vector Text: ${layer.name} -->\n    <g data-id="${layer.id}" fill="${layer.fill}" style="cursor: move;">\n${hitBoxMarkup}${textGroupContent}    </g>\n`;
        }
        else if (layer.type === 'featured') {
          const selectedIdx = (layer.selectedIconIndex !== undefined && layer.selectedIconIndex >= 0 && layer.selectedIconIndex < activeTiles.length) ? layer.selectedIconIndex : 0;
          const featTile = activeTiles[selectedIdx] || activeTiles[0];
          const featSvgContent = featTile ? featTile.svgPath : `<rect width="100" height="100" fill="#ffffff"/>`;
          const ftw = featTile && featTile.svgWidth ? featTile.svgWidth : 100;
          const fth = featTile && featTile.svgHeight ? featTile.svgHeight : 100;
          const fvbx = featTile && featTile.viewBoxX !== undefined ? featTile.viewBoxX : 0;
          const fvby = featTile && featTile.viewBoxY !== undefined ? featTile.viewBoxY : 0;
          
          const pad = layer.w * 0.16; 
          const innerW = layer.w - 2 * pad;
          const innerH = layer.h - 2 * pad;
          const innerX = layer.x + pad;
          const innerY = layer.y + pad;

          layerMarkup = `    <!-- Featured Icon: ${layer.name} -->\n    <svg data-id="${layer.id}" x="${innerX}" y="${innerY}" width="${innerW}" height="${innerH}" viewBox="${fvbx} ${fvby} ${ftw} ${fth}" preserveAspectRatio="xMidYMid meet" fill="#ffffff" style="cursor: move; overflow: visible;">\n      ${featSvgContent}\n    </svg>\n`;
        }
        else if (layer.type === 'grid') {
          const gridPad = layer.padding !== undefined ? layer.padding : 140;
          const maxGridW = layer.w - 2 * gridPad;
          const maxGridH = layer.h - 2 * gridPad;
          const cellW = maxGridW / cols;
          const cellH = maxGridH / rows;
          const cellS = Math.min(cellW, cellH);

          const totalGridW = cols * cellS;
          const totalGridH = rows * cellS;
          const startX = layer.x + (layer.w - totalGridW) / 2;
          const startY = layer.y + (layer.h - totalGridH) / 2;

          let gridCardsSvg = '';
          
          if (isGridSizeManuallyOverridden) {
            // Manual Mode: Slot-based rendering with placeholders
            for (let r = 0; r < rows; r++) {
              for (let c = 0; c < cols; c++) {
                const slotIdx = r * cols + c;
                const tile = tilesToRender.find(t => t.gridSlot === slotIdx && !t.isDeleted);
                const cellX = startX + c * cellS;
                const cellY = startY + r * cellS;

                if (tile) {
                  const pad = cellS * 0.16;
                  const cellInnerX = cellX + pad;
                  const cellInnerY = cellY + pad;
                  const fitSize = cellS - 2 * pad;
                  const deleteBtnX = cellX + cellS - 14;
                  const deleteBtnY = cellY + 14;

                  const vbx = tile.viewBoxX !== undefined ? tile.viewBoxX : 0;
                  const vby = tile.viewBoxY !== undefined ? tile.viewBoxY : 0;
                  const tw = tile.svgWidth ? tile.svgWidth : 100;
                  const th = tile.svgHeight ? tile.svgHeight : 100;

                  let iconFitSize = fitSize;
                  let iconInnerY = cellInnerY;
                  let labelTxt = '';

                  const shouldShowLabels = sheetAutoLabel && sheetAutoLabel.checked;
                  if (shouldShowLabels && tile.name) {
                    iconFitSize = fitSize * 0.85;
                    iconInnerY = cellY + pad * 0.8;
                    const labelY = cellY + cellS - (pad * 0.7);
                    const labelFontSize = Math.max(14, Math.round(cellS * 0.09));
                    const textStr = tile.name.replace(/_/g, ' ').toUpperCase();
                    
                    const maxLabelW = cellS * 0.95;
                    const words = textStr.split(/\s+/);
                    const lines = [];
                    let currentLine = '';
                    
                    for (let i = 0; i < words.length; i++) {
                      const word = words[i];
                      if (!word) continue;
                      const testLine = currentLine ? currentLine + ' ' + word : word;
                      const testWidth = loadedOutfitFont ? loadedOutfitFont.getAdvanceWidth(testLine, labelFontSize) : testLine.length * (labelFontSize * 0.6);
                      if (testWidth > maxLabelW && currentLine) {
                        lines.push(currentLine);
                        currentLine = word;
                      } else {
                        currentLine = testLine;
                      }
                    }
                    if (currentLine) {
                      lines.push(currentLine);
                    }
                    
                    let pathsMarkup = '';
                    const lineSpacing = labelFontSize * 1.25;
                    const startY = labelY - ((lines.length - 1) * lineSpacing) / 2;

                    lines.forEach((lineText, lIdx) => {
                      const lineY = startY + lIdx * lineSpacing;
                      if (loadedOutfitFont) {
                        try {
                          const textWidth = loadedOutfitFont.getAdvanceWidth(lineText, labelFontSize);
                          const startX = cellX + (cellS - textWidth) / 2;
                          let currentX = startX;
                          for (let i = 0; i < lineText.length; i++) {
                            const char = lineText[i];
                            const charWidth = loadedOutfitFont.getAdvanceWidth(char, labelFontSize);
                            if (char !== ' ') {
                              const charPath = loadedOutfitFont.getPath(char, currentX, lineY, labelFontSize);
                              pathsMarkup += `      <path d="${charPath.toPathData()}" />\n`;
                            }
                            currentX += charWidth;
                          }
                        } catch (e) {
                          console.error('[Font-Loader] Error vectorizing line text:', e);
                          pathsMarkup += `      <text x="${cellX + cellS / 2}" y="${lineY}" text-anchor="middle" font-size="${labelFontSize}" fill="${labelFillColor}" font-family="'Outfit', sans-serif" font-weight="bold">${escapeXml(lineText)}</text>\n`;
                        }
                      } else {
                        pathsMarkup += `      <text x="${cellX + cellS / 2}" y="${lineY}" text-anchor="middle" font-size="${labelFontSize}" fill="${labelFillColor}" font-family="'Outfit', sans-serif" font-weight="bold">${escapeXml(lineText)}</text>\n`;
                      }
                    });

                    if (loadedOutfitFont && !pathsMarkup.includes('<text')) {
                      labelTxt = `<g fill="${labelFillColor}">\n${pathsMarkup}                        </g>`;
                    } else {
                      labelTxt = pathsMarkup;
                    }
                  }

                  if (isExport) {
                    gridCardsSvg += `
                      <g class="presentation-icon-cell" data-slot-idx="${slotIdx}">
                        <svg x="${cellX + (cellS - iconFitSize) / 2}" y="${iconInnerY}" width="${iconFitSize}" height="${iconFitSize}" viewBox="${vbx} ${vby} ${tw} ${th}" preserveAspectRatio="xMidYMid meet">
                          ${tile.svgPath}
                        </svg>
                        ${labelTxt}
                      </g>
                    `;
                  } else {
                    gridCardsSvg += `
                      <g class="presentation-icon-cell" data-slot-idx="${slotIdx}" style="cursor: default;">
                        <rect x="${cellX}" y="${cellY}" width="${cellS}" height="${cellS}" fill="none" pointer-events="all"/>
                        <svg x="${cellX + (cellS - iconFitSize) / 2}" y="${iconInnerY}" width="${iconFitSize}" height="${iconFitSize}" viewBox="${vbx} ${vby} ${tw} ${th}" preserveAspectRatio="xMidYMid meet" overflow="visible">
                          ${tile.svgPath}
                        </svg>
                        ${labelTxt}
                        <g class="delete-btn-group" data-delete-idx="${tile.idx}" style="cursor: pointer;">
                          <circle cx="${deleteBtnX}" cy="${deleteBtnY}" r="32" fill="#ef4444" stroke="#ffffff" stroke-width="5"/>
                          <path d="M${deleteBtnX - 11} ${deleteBtnY - 11} L${deleteBtnX + 11} ${deleteBtnY + 11} M${deleteBtnX + 11} ${deleteBtnY - 11} L${deleteBtnX - 11} ${deleteBtnY + 11}" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>
                        </g>
                      </g>
                    `;
                  }
                } else {
                  // Empty placeholder spot
                  if (!isExport) {
                    gridCardsSvg += `
                      <g class="presentation-icon-cell" data-slot-idx="${slotIdx}" style="cursor: pointer;">
                        <rect x="${cellX + 16}" y="${cellY + 16}" width="${cellS - 32}" height="${cellS - 32}" fill="none" stroke="#cbd5e1" stroke-width="4" stroke-dasharray="10, 8" rx="20" ry="20" />
                        <path d="M${cellX + cellS/2 - 15} ${cellY + cellS/2} L${cellX + cellS/2 + 15} ${cellY + cellS/2} M${cellX + cellS/2} ${cellY + cellS/2 - 15} L${cellX + cellS/2} ${cellY + cellS/2 + 15}" stroke="#cbd5e1" stroke-width="4" stroke-linecap="round" />
                      </g>
                    `;
                  }
                }
              }
            }
          } else {
            // Auto Mode: Plain full grid sequence rendering (auto packs, empty space placeholders at the end)
            let gridIdx = 0;
            for (let r = 0; r < rows; r++) {
              for (let c = 0; c < cols; c++) {
                const cellX = startX + c * cellS;
                const cellY = startY + r * cellS;

                if (gridIdx < activeTiles.length) {
                  const tile = activeTiles[gridIdx];
                  if (!tile) { gridIdx++; continue; }

                  const pad = cellS * 0.16;
                  const cellInnerX = cellX + pad;
                  const cellInnerY = cellY + pad;
                  const fitSize = cellS - 2 * pad;
                  const deleteBtnX = cellX + cellS - 14;
                  const deleteBtnY = cellY + 14;

                  const vbx = tile.viewBoxX !== undefined ? tile.viewBoxX : 0;
                  const vby = tile.viewBoxY !== undefined ? tile.viewBoxY : 0;
                  const tw = tile.svgWidth ? tile.svgWidth : 100;
                  const th = tile.svgHeight ? tile.svgHeight : 100;

                  let iconFitSize = fitSize;
                  let iconInnerY = cellInnerY;
                  let labelTxt = '';

                  const shouldShowLabels = sheetAutoLabel && sheetAutoLabel.checked;
                  if (shouldShowLabels && tile.name) {
                    iconFitSize = fitSize * 0.85;
                    iconInnerY = cellY + pad * 0.8;
                    const labelY = cellY + cellS - (pad * 0.7);
                    const labelFontSize = Math.max(14, Math.round(cellS * 0.09));
                    const textStr = tile.name.replace(/_/g, ' ').toUpperCase();
                    
                    const maxLabelW = cellS * 0.95;
                    const words = textStr.split(/\s+/);
                    const lines = [];
                    let currentLine = '';
                    
                    for (let i = 0; i < words.length; i++) {
                      const word = words[i];
                      if (!word) continue;
                      const testLine = currentLine ? currentLine + ' ' + word : word;
                      const testWidth = loadedOutfitFont ? loadedOutfitFont.getAdvanceWidth(testLine, labelFontSize) : testLine.length * (labelFontSize * 0.6);
                      if (testWidth > maxLabelW && currentLine) {
                        lines.push(currentLine);
                        currentLine = word;
                      } else {
                        currentLine = testLine;
                      }
                    }
                    if (currentLine) {
                      lines.push(currentLine);
                    }
                    
                    let pathsMarkup = '';
                    const lineSpacing = labelFontSize * 1.25;
                    const startY = labelY - ((lines.length - 1) * lineSpacing) / 2;

                    lines.forEach((lineText, lIdx) => {
                      const lineY = startY + lIdx * lineSpacing;
                      if (loadedOutfitFont) {
                        try {
                          const textWidth = loadedOutfitFont.getAdvanceWidth(lineText, labelFontSize);
                          const startX = cellX + (cellS - textWidth) / 2;
                          let currentX = startX;
                          for (let i = 0; i < lineText.length; i++) {
                            const char = lineText[i];
                            const charWidth = loadedOutfitFont.getAdvanceWidth(char, labelFontSize);
                            if (char !== ' ') {
                              const charPath = loadedOutfitFont.getPath(char, currentX, lineY, labelFontSize);
                              pathsMarkup += `      <path d="${charPath.toPathData()}" />\n`;
                            }
                            currentX += charWidth;
                          }
                        } catch (e) {
                          console.error('[Font-Loader] Error vectorizing line text:', e);
                          pathsMarkup += `      <text x="${cellX + cellS / 2}" y="${lineY}" text-anchor="middle" font-size="${labelFontSize}" fill="${labelFillColor}" font-family="'Outfit', sans-serif" font-weight="bold">${escapeXml(lineText)}</text>\n`;
                        }
                      } else {
                        pathsMarkup += `      <text x="${cellX + cellS / 2}" y="${lineY}" text-anchor="middle" font-size="${labelFontSize}" fill="${labelFillColor}" font-family="'Outfit', sans-serif" font-weight="bold">${escapeXml(lineText)}</text>\n`;
                      }
                    });

                    if (loadedOutfitFont && !pathsMarkup.includes('<text')) {
                      labelTxt = `<g fill="${labelFillColor}">\n${pathsMarkup}                        </g>`;
                    } else {
                      labelTxt = pathsMarkup;
                    }
                  }

                  if (isExport) {
                    gridCardsSvg += `
                      <g class="presentation-icon-cell" data-slot-idx="${gridIdx}">
                        <svg x="${cellX + (cellS - iconFitSize) / 2}" y="${iconInnerY}" width="${iconFitSize}" height="${iconFitSize}" viewBox="${vbx} ${vby} ${tw} ${th}" preserveAspectRatio="xMidYMid meet">
                          ${tile.svgPath}
                        </svg>
                        ${labelTxt}
                      </g>
                    `;
                  } else {
                    gridCardsSvg += `
                      <g class="presentation-icon-cell" data-slot-idx="${gridIdx}" style="cursor: default;">
                        <rect x="${cellX}" y="${cellY}" width="${cellS}" height="${cellS}" fill="none" pointer-events="all"/>
                        <svg x="${cellX + (cellS - iconFitSize) / 2}" y="${iconInnerY}" width="${iconFitSize}" height="${iconFitSize}" viewBox="${vbx} ${vby} ${tw} ${th}" preserveAspectRatio="xMidYMid meet" overflow="visible">
                          ${tile.svgPath}
                        </svg>
                        ${labelTxt}
                        <g class="delete-btn-group" data-delete-idx="${tile.idx}" style="cursor: pointer;">
                          <circle cx="${deleteBtnX}" cy="${deleteBtnY}" r="32" fill="#ef4444" stroke="#ffffff" stroke-width="5"/>
                          <path d="M${deleteBtnX - 11} ${deleteBtnY - 11} L${deleteBtnX + 11} ${deleteBtnY + 11} M${deleteBtnX + 11} ${deleteBtnY - 11} L${deleteBtnX - 11} ${deleteBtnY + 11}" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>
                        </g>
                      </g>
                    `;
                  }
                } else {
                  // Empty space placeholder at the end of Auto Mode grid
                  if (!isExport) {
                    gridCardsSvg += `
                      <g class="presentation-icon-cell vacant-placeholder" data-slot-idx="${gridIdx}" style="cursor: pointer;">
                        <rect x="${cellX + 16}" y="${cellY + 16}" width="${cellS - 32}" height="${cellS - 32}" fill="none" stroke="#cbd5e1" stroke-width="4" stroke-dasharray="10, 8" rx="20" ry="20"/>
                        <path d="M${cellX + cellS/2 - 15} ${cellY + cellS/2} L${cellX + cellS/2 + 15} ${cellY + cellS/2} M${cellX + cellS/2} ${cellY + cellS/2 - 15} L${cellX + cellS/2} ${cellY + cellS/2 + 15}" stroke="#cbd5e1" stroke-width="4" stroke-linecap="round"/>
                      </g>
                    `;
                  }
                }
                gridIdx++;
              }
            }
          }

          layerMarkup = `    <!-- Icon Grid: ${layer.name} -->\n    <g data-id="${layer.id}" fill="${layer.fill || fillColor}" style="cursor: move;">\n      ${gridCardsSvg}\n    </g>\n`;
        }

        const rotateVal = parseInt(layer.rotate) || 0;
        if (rotateVal !== 0 && layerMarkup) {
          let cx = layer.x + (layer.w || 0) / 2;
          let cy = layer.y + (layer.h || 0) / 2;
          if (layer.type === 'text') {
            cx = layer.x;
            cy = layer.y - (layer.fontSize || 72) / 3;
          }
          layerMarkup = `    <g data-id="${layer.id}" transform="rotate(${rotateVal}, ${cx}, ${cy})">\n  ${layerMarkup.trim()}\n    </g>\n`;
        }

        layersHtml += layerMarkup;
      });

      if (!isExport) {
        const targetIds = [...new Set([...(selectedLayerIds || []), ...(currentDesignerLayerId ? [currentDesignerLayerId] : [])])];
        const selectedLayersList = activeLayers.filter(l => targetIds.includes(l.id) && l.visible !== false);

        if (selectedLayersList.length > 0) {
          const handleSize = 60;
          let overlayInnerHtml = '';

          selectedLayersList.forEach(al => {
            let ax = al.x || 0;
            let ay = al.y || 0;
            let aw = al.w || 0;
            let ah = al.h || 0;

            if (al.type === 'text') {
              const fs = al.fontSize || 72;
              const txt = al.text || al.name || 'Text';
              let calcW = 0;
              if (loadedOutfitFont) {
                try {
                  calcW = loadedOutfitFont.getAdvanceWidth(txt, fs);
                } catch(e) {
                  calcW = fs * 0.6 * txt.length;
                }
              } else {
                calcW = fs * 0.6 * txt.length;
              }
              aw = Math.max(100, Math.round(calcW + 40));
              ah = Math.max(50, Math.round(fs * 1.3));
              ax = Math.round(al.x - aw / 2);
              ay = Math.round(al.y - fs * 1.05);
            }

            const rotateVal = parseInt(al.rotate) || 0;
            let rotAttr = '';
            if (rotateVal !== 0) {
              let cx = al.x + (al.w || 0) / 2;
              let cy = al.y + (al.h || 0) / 2;
              if (al.type === 'text') {
                cx = al.x;
                cy = al.y - (al.fontSize || 72) / 3;
              }
              rotAttr = ` transform="rotate(${rotateVal}, ${cx}, ${cy})"`;
            }

            const isPrimary = al.id === currentDesignerLayerId || selectedLayersList.length === 1;

            overlayInnerHtml += `
              <g class="layer-selection-box"${rotAttr}>
                <rect x="${ax}" y="${ay}" width="${aw}" height="${ah}" fill="none" stroke="#2563eb" stroke-width="6" stroke-dasharray="14,14" pointer-events="none"/>
                ${isPrimary ? `
                <rect data-handle="tl" data-id="${al.id}" x="${ax - handleSize/2}" y="${ay - handleSize/2}" width="${handleSize}" height="${handleSize}" fill="#ffffff" stroke="#2563eb" stroke-width="8" style="cursor: nwse-resize;"/>
                <rect data-handle="tr" data-id="${al.id}" x="${ax + aw - handleSize/2}" y="${ay - handleSize/2}" width="${handleSize}" height="${handleSize}" fill="#ffffff" stroke="#2563eb" stroke-width="8" style="cursor: nesw-resize;"/>
                <rect data-handle="bl" data-id="${al.id}" x="${ax - handleSize/2}" y="${ay + ah - handleSize/2}" width="${handleSize}" height="${handleSize}" fill="#ffffff" stroke="#2563eb" stroke-width="8" style="cursor: nesw-resize;"/>
                <rect data-handle="br" data-id="${al.id}" x="${ax + aw - handleSize/2}" y="${ay + ah - handleSize/2}" width="${handleSize}" height="${handleSize}" fill="#ffffff" stroke="#2563eb" stroke-width="8" style="cursor: nwse-resize;"/>
                ` : ''}
              </g>
            `;
          });

          // Render Group Bounding Box and Badge Tag if any selected layers belong to a group
          const selectedGroups = {};
          selectedLayersList.forEach(l => {
            if (l.groupId) {
              if (!selectedGroups[l.groupId]) {
                selectedGroups[l.groupId] = {
                  name: l.groupName || 'Group',
                  minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity
                };
              }
              let lx = l.x || 0;
              let ly = l.y || 0;
              let lw = l.w || 0;
              let lh = l.h || 0;
              if (l.type === 'text') {
                const fs = l.fontSize || 72;
                const txt = l.text || l.name || 'Text';
                let calcW = 0;
                if (loadedOutfitFont) {
                  try {
                    calcW = loadedOutfitFont.getAdvanceWidth(txt, fs);
                  } catch(e) {
                    calcW = fs * 0.6 * txt.length;
                  }
                } else {
                  calcW = fs * 0.6 * txt.length;
                }
                lw = Math.max(100, Math.round(calcW + 40));
                lh = Math.max(50, Math.round(fs * 1.3));
                lx = Math.round(l.x - lw / 2);
                ly = Math.round(l.y - fs * 1.05);
              }
              selectedGroups[l.groupId].minX = Math.min(selectedGroups[l.groupId].minX, lx);
              selectedGroups[l.groupId].minY = Math.min(selectedGroups[l.groupId].minY, ly);
              selectedGroups[l.groupId].maxX = Math.max(selectedGroups[l.groupId].maxX, lx + lw);
              selectedGroups[l.groupId].maxY = Math.max(selectedGroups[l.groupId].maxY, ly + lh);
            }
          });

          Object.values(selectedGroups).forEach(grp => {
            if (grp.minX < Infinity) {
              const gx = grp.minX - 14;
              const gy = grp.minY - 14;
              const gw = grp.maxX - grp.minX + 28;
              const gh = grp.maxY - grp.minY + 28;
              const tagW = Math.max(100, grp.name.length * 15 + 34);
              overlayInnerHtml += `
                <g class="group-selection-box" pointer-events="none">
                  <rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" fill="none" stroke="#38bdf8" stroke-width="4" stroke-dasharray="12,8"/>
                  <rect x="${gx}" y="${Math.max(0, gy - 36)}" width="${tagW}" height="32" rx="6" fill="#0284c7"/>
                  <text x="${gx + 10}" y="${Math.max(22, gy - 14)}" fill="#ffffff" font-size="15" font-family="'Outfit', sans-serif" font-weight="bold">⊞ ${escapeXml(grp.name)}</text>
                </g>
              `;
            }
          });

          layersHtml += `
            <!-- Selection Outlines & Resize Handles -->
            <g class="selection-overlay">
              ${overlayInnerHtml}
            </g>
          `;
        }
      }

      if (!isExport && isDraggingMarquee) {
        const mx = Math.min(marqueeStartX, marqueeEndX);
        const my = Math.min(marqueeStartY, marqueeEndY);
        const mw = Math.abs(marqueeEndX - marqueeStartX);
        const mh = Math.abs(marqueeEndY - marqueeStartY);
        layersHtml += `
          <!-- Drag Marquee Selection Box -->
          <g class="marquee-overlay">
            <rect x="${mx}" y="${my}" width="${mw}" height="${mh}" fill="rgba(37, 99, 235, 0.12)" stroke="#2563eb" stroke-width="8" stroke-dasharray="14,10"/>
          </g>
        `;
      }

      return `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
          <defs>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@700;900&amp;family=Montserrat:wght@700;900&amp;family=Roboto:wght@700;900&amp;display=swap');
              .presentation-icon-cell .delete-btn-group {
                opacity: 0 !important;
                pointer-events: none !important;
                transition: opacity 0.15s ease-in-out;
              }
              .presentation-icon-cell:hover .delete-btn-group {
                opacity: 1 !important;
                pointer-events: auto !important;
              }
              .delete-btn-group:hover circle {
                fill: #dc2626 !important;
              }
            </style>
          </defs>
          ${layersHtml}
        </svg>
      `;
    }
  }

  function fisherYatesShuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  window.selectedTrayTileIdx = null;

  function reinitializeGridSlots(tiles, cols, rows, shouldShuffle) {
    const maxCells = cols * rows;
    
    // Sort all tiles
    let sorted = [...tiles];
    if (shouldShuffle) {
      sorted.forEach(t => { if (t.randSort === undefined) t.randSort = Math.random(); });
      sorted.sort((a, b) => a.randSort - b.randSort);
    } else {
      sorted.sort((a, b) => a.idx - b.idx);
    }

    // Assign slots to first maxCells active tiles
    let slotIdx = 0;
    sorted.forEach(tile => {
      if (!tile.isDeleted && slotIdx < maxCells) {
        tile.gridSlot = slotIdx;
        slotIdx++;
      } else {
        tile.gridSlot = -1;
      }
    });
  }

  function addTrayIconToGrid(tileIdx) {
    const tile = slicedTilesData.find(t => t.idx === tileIdx);
    if (!tile) return;

    const sheetName = activePreviewSheetName || (loadedSheetImgs && loadedSheetImgs[0]?.name) || 'Default';
    tile.isDeleted = false;
    tile.sheetName = sheetName;

    if (isGridSizeManuallyOverridden) {
      // Manual Mode: Assign a valid free gridSlot
      const activeTiles = slicedTilesData.filter(t => t.sheetName === sheetName && !t.isDeleted);
      const usedSlots = new Set(activeTiles.filter(t => t !== tile && t.gridSlot !== undefined && t.gridSlot !== -1).map(t => t.gridSlot));
      let freeSlot = 0;
      while (usedSlots.has(freeSlot)) {
        freeSlot++;
      }
      tile.gridSlot = freeSlot;

      let cols = parseInt(sheetCols ? sheetCols.value : 5) || 5;
      let rows = parseInt(sheetRows ? sheetRows.value : 3) || 3;
      while (cols * rows <= freeSlot) {
        rows++;
      }
      if (sheetRows) sheetRows.value = rows;
    } else {
      // Auto Mode: Prioritize restored tile in active list order so it appears on the grid
      const minRand = Math.min(...slicedTilesData.map(t => t.randSort || 0));
      tile.randSort = minRand - 1;
      shouldRecalculateOptimalGrid = true;
    }

    const gridCell = document.getElementById(`tool4-tile-card-${tile.idx}`);
    if (gridCell) gridCell.style.display = '';

    window.selectedTrayTileIdx = null;

    buildBrandedSvgSheet();
  }

  function renderExtraIconsTray() {
    const trayGrid = document.getElementById('extraIconsTrayGrid');
    const trayContainer = document.getElementById('extraIconsTrayContainer');
    const indicator = document.getElementById('selectedTrayIconIndicator');
    if (!trayGrid || !trayContainer) return;

    if (!loadedSheetImgs || loadedSheetImgs.length === 0) {
      trayContainer.style.display = 'none';
      return;
    }

    const sheetName = activePreviewSheetName || loadedSheetImgs[0].name;

    // Filter ALL tiles for this sheet!
    let tilesForThisSheet = slicedTilesData.filter(t => t.sheetName === sheetName);

    if (tilesForThisSheet.length === 0) {
      trayContainer.style.display = 'none';
      return;
    }

    // Determine what is currently visible on the active grid
    const cols = parseInt(sheetCols.value) || 5;
    const rows = parseInt(sheetRows.value) || 3;
    const maxCells = cols * rows;

    const visibleIdxs = new Set();
    if (isGridSizeManuallyOverridden) {
      // Manual Mode: Visibles are active tiles in slot 0 to maxCells - 1
      tilesForThisSheet.forEach(t => {
        if (!t.isDeleted && t.gridSlot !== -1 && t.gridSlot < maxCells) {
          visibleIdxs.add(t.idx);
        }
      });
    } else {
      // Auto Mode: Visibles are the first maxCells active tiles!
      let activeTiles = tilesForThisSheet.filter(t => !t.isDeleted);
      const shouldShuffle = sheetShuffle ? sheetShuffle.checked : false;
      if (shouldShuffle) {
        activeTiles = [...activeTiles].sort((a, b) => (a.randSort || 0) - (b.randSort || 0));
      } else {
        activeTiles = [...activeTiles].sort((a, b) => a.idx - b.idx);
      }
      
      const visibleCount = Math.min(activeTiles.length, maxCells);
      for (let i = 0; i < visibleCount; i++) {
        visibleIdxs.add(activeTiles[i].idx);
      }
    }

    // Show/hide Selection Indicator banner at the top of the tray
    if (indicator) {
      if (window.selectedTrayTileIdx !== null) {
        const selTile = slicedTilesData.find(t => t.idx === window.selectedTrayTileIdx);
        if (selTile) {
          indicator.style.display = 'flex';
          indicator.innerHTML = `
            <div style="font-size: 10px; font-weight: 700; color: #ea580c; text-transform: uppercase;">Selected for Swap:</div>
            <div style="width: 32px; height: 32px; background: #ffffff; border-radius: 4px; padding: 2px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--outline-variant);">
              <img src="${selTile.dataUrl}" style="max-width: 100%; max-height: 100%; object-fit: contain; pointer-events: none;" />
            </div>
            <div style="font-size: 9px; color: var(--on-variant); font-weight: 600;">From: ${selTile.sheetName}</div>
            <button id="cancelTraySelectionBtn" style="margin-left: auto; background: #ef4444; color: #ffffff; border: none; border-radius: 4px; padding: 2px 6px; font-size: 9px; cursor: pointer; font-weight: bold; transition: opacity 0.2s;">Cancel</button>
          `;
          const cancelBtn = document.getElementById('cancelTraySelectionBtn');
          if (cancelBtn) {
            cancelBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              window.selectedTrayTileIdx = null;
              renderExtraIconsTray();
            });
          }
        } else {
          indicator.style.display = 'none';
        }
      } else {
        indicator.style.display = 'none';
      }
    }

    trayContainer.style.display = 'block';
    trayGrid.innerHTML = '';

    // Sort tiles of this sheet so they are stable
    const sortedTiles = [...tilesForThisSheet].sort((a, b) => a.idx - b.idx);

    sortedTiles.forEach(tile => {
      const isOnGrid = visibleIdxs.has(tile.idx);

      const card = document.createElement('div');
      card.className = 'tray-icon-card';
      card.style.cssText = `
        width: 56px;
        height: 56px;
        background: var(--surface-lowest);
        border: 1px solid var(--outline-variant);
        border-radius: 8px;
        cursor: pointer;
        padding: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        transition: all 0.2s ease;
      `;

      if (isOnGrid) {
        // Already on sheet: shadowed/dimmed
        card.style.opacity = '0.4';
      } else {
        // Not on sheet: bright
        card.style.opacity = '1.0';
      }

      if (window.selectedTrayTileIdx === tile.idx) {
        card.style.borderColor = '#ea580c';
        card.style.boxShadow = '0 0 0 2px rgba(234, 88, 12, 0.4)';
        card.style.background = 'rgba(234, 88, 12, 0.05)';
      }

      // Add miniature preview image
      const img = document.createElement('img');
      img.src = tile.dataUrl;
      img.style.cssText = 'max-width: 100%; max-height: 100%; object-fit: contain; pointer-events: none;';
      card.appendChild(img);

      // Only show green Add/Restore Plus button if the tile is NOT currently visible on the grid!
      if (!isOnGrid) {
        const addBtn = document.createElement('div');
        addBtn.textContent = '＋';
        addBtn.style.cssText = `
          position: absolute;
          top: -8px;
          left: -8px;
          background: #22c55e;
          color: #ffffff;
          font-size: 12px;
          font-weight: bold;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid #ffffff;
          cursor: pointer;
          box-shadow: 0 2px 5px rgba(0,0,0,0.25);
        `;
        addBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          addTrayIconToGrid(tile.idx);
        });
        card.appendChild(addBtn);
      }

      card.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.selectedTrayTileIdx === tile.idx) {
          window.selectedTrayTileIdx = null; // Deselect
        } else {
          window.selectedTrayTileIdx = tile.idx; // Select
        }
        renderExtraIconsTray();
      });

      trayGrid.appendChild(card);
    });
  }

  // Master function to build and render Branded Presentation SVGs for ALL uploaded sheet images
  function buildBrandedSvgSheet() {
    generatedBrandedSheetsMap = {};

    if (loadedSheetImgs && loadedSheetImgs.length > 0) {
      const shouldShuffle = sheetShuffle ? sheetShuffle.checked : false;
      loadedSheetImgs.forEach((sheetObj, index) => {
        const sheetName = sheetObj.name;
        let tilesForThisSheet = slicedTilesData.filter(t => t.sheetName === sheetName);
        if (shouldShuffle) {
          tilesForThisSheet.sort((a, b) => (a.randSort || 0) - (b.randSort || 0));
        } else {
          tilesForThisSheet.sort((a, b) => a.idx - b.idx);
        }
        let sCols = null;
        let sRows = null;
        if (!isGridSizeManuallyOverridden) {
          // Clear slots in auto mode to ensure clean sequential layout packing
          tilesForThisSheet.forEach(t => t.gridSlot = -1);

          const gridLayer = activeLayers.find(l => l.type === 'grid');
          const activeTiles = tilesForThisSheet.filter(t => !t.isDeleted);
          const gridPad = (gridLayer && gridLayer.padding !== undefined) ? gridLayer.padding : 140;
          const maxGridW = gridLayer ? (gridLayer.w - 2 * gridPad) : 5720;
          const maxGridH = gridLayer ? (gridLayer.h - 2 * gridPad) : 2320;

          const opt = calculateOptimalGrid(activeTiles.length, maxGridW, maxGridH);
          sCols = opt.cols;
          sRows = opt.rows;

          if (sheetName === activePreviewSheetName) {
            if (sCols && sheetCols) sheetCols.value = sCols;
            if (sRows && sheetRows) sheetRows.value = sRows;
          }
        } else {
          sCols = parseInt(sheetCols.value) || 5;
          sRows = parseInt(sheetRows.value) || 3;

          // Initialize gridSlot in manual mode if not present
          const hasGridSlots = tilesForThisSheet.some(t => t.gridSlot !== undefined && t.gridSlot !== -1);
          if (!hasGridSlots) {
            reinitializeGridSlots(tilesForThisSheet, sCols, sRows, shouldShuffle);
          }
        }

        const tileCountEl = document.getElementById('sheetTileCount');
        if (tileCountEl) {
          tileCountEl.textContent = tilesForThisSheet.filter(t => !t.isDeleted).length;
        }

        const svg = buildSingleBrandedSvgSheet(
          tilesForThisSheet, 
          sheetName,
          sCols,
          sRows,
          false,
          sheetObj.title || ''
        );
        generatedBrandedSheetsMap[sheetName] = svg;
      });
      shouldRecalculateOptimalGrid = false;

      if (!activePreviewSheetName || !generatedBrandedSheetsMap[activePreviewSheetName]) {
        activePreviewSheetName = loadedSheetImgs[0].name;
      }
      generatedAssembledSvg = generatedBrandedSheetsMap[activePreviewSheetName];
    } else {
      generatedAssembledSvg = buildSingleBrandedSvgSheet(slicedTilesData.filter(t => !t.isDeleted), '');
      generatedBrandedSheetsMap['Default'] = generatedAssembledSvg;
      activePreviewSheetName = 'Default';
    }

    if (tool4SheetCard) {
      tool4SheetCard.innerHTML = generatedAssembledSvg;
    }

    renderMultiSheetSelectorUI();
    syncQuickFeaturedIconSelectorUI();
    renderExtraIconsTray();
  }

  function populateFeaturedIconSelectOptions(selectEl) {
    if (!selectEl) return;
    const featLayer = activeLayers.find(l => l.type === 'featured');
    const currentSelected = (featLayer && featLayer.selectedIconIndex !== undefined && featLayer.selectedIconIndex >= 0) ? featLayer.selectedIconIndex : 0;

    let tiles = [];
    if (activePreviewSheetName && activePreviewSheetName !== 'Default') {
      tiles = slicedTilesData.filter(t => t && t.sheetName === activePreviewSheetName);
    }
    if (!tiles || tiles.length === 0) {
      tiles = Array.isArray(slicedTilesData) ? slicedTilesData : [];
    }

    // Exclude tray/deleted icons so they don't show up in the featured dropdown
    tiles = tiles.filter(t => !t.isDeleted);

    if (tiles.length > 0) {
      selectEl.innerHTML = tiles.map((t, idx) => {
        const cleanName = (t && t.name) ? t.name.replace(/_/g, ' ') : `Icon ${idx + 1}`;
        return `<option value="${idx}" ${idx === currentSelected ? 'selected' : ''}>Icon ${idx + 1}: ${cleanName}</option>`;
      }).join('');
    } else {
      let defaultOptions = '';
      for (let i = 0; i < 18; i++) {
        defaultOptions += `<option value="${i}" ${i === currentSelected ? 'selected' : ''}>Icon ${i + 1}</option>`;
      }
      selectEl.innerHTML = defaultOptions;
    }
    
    // Refresh the custom UI wrapper to reflect the newly injected options
    if (typeof updateCustomSelectUI === 'function') {
      updateCustomSelectUI(selectEl);
    }
  }

  function syncQuickFeaturedIconSelectorUI() {
    const selectEl = document.getElementById('quickFeaturedIconSelect');
    if (selectEl) populateFeaturedIconSelectOptions(selectEl);
    const propSelectEl = document.getElementById('propFeaturedIconSelect');
    if (propSelectEl) populateFeaturedIconSelectOptions(propSelectEl);
  }

  // Helper to switch active presentation sheet preview
  function switchActivePreviewSheet(sheetName) {
    if (!sheetName || sheetName === activePreviewSheetName) return;
    activePreviewSheetName = sheetName;
    shouldRecalculateOptimalGrid = true;
    
    // Sync active sheet's title to the UI inputs and canvas layers
    const activeSheetObj = loadedSheetImgs.find(s => s.name === activePreviewSheetName);
    if (activeSheetObj) {
      const sheetSetName = document.getElementById('sheetSetName');
      const tilesForSheet = slicedTilesData.filter(t => t.sheetName === activePreviewSheetName);
      const currentTitle = activeSheetObj.title || deriveNicheTitleFromIconNames(tilesForSheet);
      
      if (sheetSetName) sheetSetName.value = currentTitle || '';
      
      const titleLayer = activeLayers.find(l => l.id === 'titleText' || (l.name && l.name.toLowerCase().includes('title text')));
      if (titleLayer) {
        titleLayer.text = currentTitle || 'BRANDING';
      }
      if (currentDesignerLayerId && (currentDesignerLayerId === 'titleText' || (titleLayer && currentDesignerLayerId === titleLayer.id))) {
        loadDesignerLayerFields(currentDesignerLayerId);
      }
    }
    
    buildBrandedSvgSheet();
  }
  window.switchActivePreviewSheet = switchActivePreviewSheet;

  // Render UI dropdown bar & Prev/Next buttons for switching between multiple presentation sheets
  function renderMultiSheetSelectorUI() {
    const selectorContainer = document.getElementById('sheetPreviewSelectorBar');
    if (!selectorContainer) return;

    const sheetKeys = Object.keys(generatedBrandedSheetsMap);
    if (sheetKeys.length === 0) {
      selectorContainer.style.display = 'none';
      return;
    }

    selectorContainer.style.display = 'flex';

    if (sheetKeys.length === 1) {
      const singleSheetName = sheetKeys[0];
      const activeTilesCount = slicedTilesData.filter(t => !t.isDeleted && (t.sheetName === singleSheetName || !t.sheetName)).length;
      selectorContainer.innerHTML = `
        <div style="font-size: 11px; font-weight: 800; color: var(--accent); display: flex; align-items: center; gap: 8px;">
          <span>📄 Presentation Sheet:</span>
          <span style="color: var(--on-surface); font-weight: 700; background: var(--surface); padding: 3px 10px; border-radius: 6px; border: 1px solid var(--outline-variant); font-size: 11.5px;">
            ${singleSheetName}
          </span>
          <span style="font-size: 10.5px; color: var(--on-variant); font-weight: 600;">(${activeTilesCount} icons)</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <button id="btnDeleteCurrentSheet" class="sheet-del-btn" title="Delete this presentation sheet and its icons">
            <svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 12px; height: 12px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            <span>Delete Sheet</span>
          </button>
        </div>
      `;
    } else {
      const currentIdx = Math.max(0, sheetKeys.indexOf(activePreviewSheetName));
      selectorContainer.innerHTML = `
        <div style="font-size: 11px; font-weight: 800; color: var(--accent); display: flex; align-items: center; gap: 8px;">
          <span>📄 Presentation Sheet:</span>
          <span style="font-size: 10px; color: var(--on-variant); font-weight: 700; background: var(--surface); padding: 2px 7px; border-radius: 6px; border: 1px solid var(--outline-variant);">
            ${currentIdx + 1} of ${sheetKeys.length}
          </span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <button id="btnPrevSheetBar" style="background: var(--surface); color: #ffffff; border: 1px solid var(--outline-variant); border-radius: 8px; padding: 5px 12px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: all 0.2s; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
            ◀ Prev Sheet
          </button>
          <select id="sheetPreviewDropdown" style="background: var(--surface); color: #fff; border: 1px solid var(--outline); border-radius: 8px; padding: 5px 12px; font-size: 11px; font-weight: 700; cursor: pointer; outline: none;">
            ${sheetKeys.map((key, i) => `<option value="${key}" ${key === activePreviewSheetName ? 'selected' : ''}>Sheet ${i + 1} of ${sheetKeys.length}: ${key}</option>`).join('')}
          </select>
          <button id="btnNextSheetBar" style="background: var(--primary, #cdfc52); color: #000000; border: 1px solid var(--outline-variant); border-radius: 8px; padding: 5px 12px; font-size: 11px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: all 0.2s; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
            Next Sheet ▶
          </button>
          <div style="width: 1px; height: 18px; background: var(--outline-variant); margin: 0 4px;"></div>
          <button id="btnDeleteCurrentSheet" class="sheet-del-btn" title="Delete current presentation sheet and its icons">
            <svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 12px; height: 12px;"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            <span>Delete Sheet</span>
          </button>
        </div>
      `;

      const dropdown = document.getElementById('sheetPreviewDropdown');
      if (dropdown) {
        dropdown.addEventListener('change', (e) => {
          switchActivePreviewSheet(e.target.value);
        });
      }

      const btnPrev = document.getElementById('btnPrevSheetBar');
      if (btnPrev) {
        btnPrev.addEventListener('click', () => {
          const idx = sheetKeys.indexOf(activePreviewSheetName);
          const prevIdx = (idx - 1 + sheetKeys.length) % sheetKeys.length;
          switchActivePreviewSheet(sheetKeys[prevIdx]);
        });
      }

      const btnNext = document.getElementById('btnNextSheetBar');
      if (btnNext) {
        btnNext.addEventListener('click', () => {
          const idx = sheetKeys.indexOf(activePreviewSheetName);
          const nextIdx = (idx + 1) % sheetKeys.length;
          switchActivePreviewSheet(sheetKeys[nextIdx]);
        });
      }
    }

    const btnDelCurrent = document.getElementById('btnDeleteCurrentSheet');
    if (btnDelCurrent) {
      btnDelCurrent.addEventListener('click', promptDeleteCurrentSheet);
    }
  }

  // Safely prompt and execute deletion of the current presentation sheet and its icons
  function promptDeleteCurrentSheet() {
    const sheetNameToDelete = activePreviewSheetName || (loadedSheetImgs.length > 0 ? loadedSheetImgs[0].name : 'Default');
    if (!sheetNameToDelete) return;

    const confirmMessage = `আপনি কি নিশ্চিত যে "${sheetNameToDelete}" শিটটি সম্পূর্ণ ডিলিট করতে চান? এর সাথে থাকা সমস্ত স্লাইসড আইকনও মুছে ফেলা হবে।`;

    if (window.showCustomConfirm) {
      window.showCustomConfirm(
        confirmMessage,
        'শিট ডিলিট কনফার্মেশন 🗑️',
        'হ্যাঁ, ডিলিট করুন',
        'বাতিল',
        () => {
          executeDeleteSheet(sheetNameToDelete);
        }
      );
    } else if (confirm(confirmMessage)) {
      executeDeleteSheet(sheetNameToDelete);
    }
  }

  function executeDeleteSheet(sheetNameToDelete) {
    if (!sheetNameToDelete) return;

    // 1. Remove DOM cards for this sheet's sliced tiles from tool4TilesGrid
    const tilesToRemove = slicedTilesData.filter(t => t.sheetName === sheetNameToDelete || (!t.sheetName && sheetNameToDelete === 'Default'));
    tilesToRemove.forEach(t => {
      const card = document.getElementById(`tool4-tile-card-${t.idx}`);
      if (card) card.remove();
    });

    // 2. Filter out tiles from slicedTilesData
    slicedTilesData = slicedTilesData.filter(t => t.sheetName !== sheetNameToDelete && !(sheetNameToDelete === 'Default' && !t.sheetName));

    // 3. Remove sheet from loadedSheetImgs
    loadedSheetImgs = loadedSheetImgs.filter(s => s.name !== sheetNameToDelete);

    // 4. Delete from generated SVG maps
    delete generatedBrandedSheetsMap[sheetNameToDelete];
    if (typeof cleanSheetsMap !== 'undefined' && cleanSheetsMap) {
      delete cleanSheetsMap[sheetNameToDelete];
    }

    // 5. Update header info, tile counts, and slice button label
    const activeTiles = slicedTilesData.filter(t => !t.isDeleted);
    const tileCountEl = document.getElementById('sheetTileCount');
    if (tileCountEl) tileCountEl.textContent = activeTiles.length;

    if (btnSliceVectorize) {
      btnSliceVectorize.textContent = activeTiles.length > 0 
        ? `⚡ Convert ${activeTiles.length} Icons to Vector` 
        : `⚡ Convert Icons to Vector`;
    }

    if (sheetFileName) {
      if (loadedSheetImgs.length === 0) {
        sheetFileName.textContent = '';
      } else if (loadedSheetImgs.length === 1) {
        sheetFileName.textContent = loadedSheetImgs[0].name;
      } else {
        sheetFileName.textContent = `📦 ${loadedSheetImgs.length} Icon Sheets Loaded (Bulk Processing Ready)`;
      }
    }

    // 6. If remaining sheets exist, display the first remaining one
    const remainingKeys = Object.keys(generatedBrandedSheetsMap);
    if (remainingKeys.length > 0) {
      activePreviewSheetName = remainingKeys[0];
      shouldRecalculateOptimalGrid = true;
      buildBrandedSvgSheet();
    } else if (loadedSheetImgs.length > 0) {
      activePreviewSheetName = loadedSheetImgs[0].name;
      shouldRecalculateOptimalGrid = true;
      buildBrandedSvgSheet();
    } else {
      // All sheets have been deleted
      activePreviewSheetName = '';
      generatedAssembledSvg = '';
      if (tool4SheetCard) {
        tool4SheetCard.innerHTML = `
          <div style="padding: 70px 20px; text-align: center; color: var(--on-variant);">
            <div style="font-size: 42px; margin-bottom: 12px; opacity: 0.6;">🗑️</div>
            <div style="font-weight: 700; color: var(--on-surface); font-size: 16px; margin-bottom: 6px;">শিট ডিলিট করা হয়েছে</div>
            <div style="font-size: 12px;">নতুন কোনো আইকন শিট আপলোড করে আবার স্লাইস ও প্রেজেন্টেশন তৈরি করতে পারেন।</div>
          </div>
        `;
      }
      if (tool4TilesGrid && (!slicedTilesData || slicedTilesData.length === 0)) {
        tool4TilesGrid.innerHTML = `
          <div class="slicer-placeholder" style="grid-column: 1 / -1; background: var(--surface-low); border: 1px dashed var(--outline-variant); padding: 48px; border-radius: 14px; text-align: center; color: var(--on-variant); font-size: 13px;">
            Upload an icon sheet image and click <strong>Slice & Vectorize Sheet</strong> to extract clean SVG icons.
          </div>
        `;
      }
      const selectorContainer = document.getElementById('sheetPreviewSelectorBar');
      if (selectorContainer) selectorContainer.style.display = 'none';
      if (btnSaveToPC) btnSaveToPC.disabled = true;
      const btnZip = document.getElementById('btnDownloadAllZip');
      if (btnZip) btnZip.style.display = 'none';
      renderExtraIconsTray();
    }

    // Show toast confirmation
    if (window.showCustomToast) {
      window.showCustomToast(`"${sheetNameToDelete}" শিটটি সফলভাবে ডিলিট করা হয়েছে!`, 'success');
    }
  }
  window.promptDeleteCurrentSheet = promptDeleteCurrentSheet;
  window.executeDeleteSheet = executeDeleteSheet;

  // Download all vectorized icons AND all assembled Branded Presentation Sheets as a ZIP
  // Helper to construct dynamic niche-based file names for downloads
  function getNicheFileName(sheetObj, fallbackIndex = 1, suffix = 'svg') {
    let rawNiche = '';
    if (sheetObj && sheetObj.title && sheetObj.title.trim()) {
      rawNiche = sheetObj.title.trim();
    } else {
      const sheetSetName = document.getElementById('sheetSetName');
      if (sheetSetName && sheetSetName.value && sheetSetName.value.trim()) {
        rawNiche = sheetSetName.value.trim();
      } else if (sheetObj && sheetObj.name && sheetObj.name.trim()) {
        rawNiche = sheetObj.name.replace(/\.[^/.]+$/, '').trim();
      }
    }

    let cleanNiche = rawNiche
      .replace(/\.[^/.]+$/, '')
      .replace(/\s*(vector\s*)?icon\s*sheet/gi, '')
      .replace(/\s*vector/gi, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '')
      .toLowerCase();

    if (!cleanNiche || cleanNiche === 'sheet' || cleanNiche === 'presentation_sheet' || cleanNiche === 'default') {
      cleanNiche = 'vector';
    }

    if (!suffix) return `${cleanNiche}_${fallbackIndex}`;
    return `${cleanNiche}_sheet_${fallbackIndex}.${suffix}`;
  }

  // Download all vectorized icons AND all assembled Branded Presentation Sheets as a ZIP
  function downloadAllSVGsAsZip() {
    if (!window.JSZip) {
      alert('JSZip library is loading, please try again in a moment.');
      return;
    }
    const zip = new JSZip();
    const iconsFolder = zip.folder('icons');
    const sheetsFolder = zip.folder('presentation_sheets');

    let iconCount = 0;
    slicedTilesData.forEach((tile) => {
      if (tile.svgContent) {
        const sheetObj = loadedSheetImgs.find(s => s.name === tile.sheetName);
        const folderName = getNicheFileName(sheetObj, 1, '');
        const sheetFolder = iconsFolder.folder(folderName);
        const namePart = tile.name ? tile.name.replace(/[^a-zA-Z0-9_-]/g, '_') : `icon_${tile.localIdx || tile.idx}`;
        const filename = `${namePart}.svg`;
        sheetFolder.file(filename, tile.svgContent);
        iconCount++;
      }
    });

    let sheetCount = 0;
    let mainNicheName = 'vector';
    const { cleanSheetsMap } = generateCleanSheetsForExport();
    Object.keys(cleanSheetsMap).forEach((sheetName, index) => {
      const svgStr = cleanSheetsMap[sheetName];
      if (svgStr) {
        const sheetObj = loadedSheetImgs.find(s => s.name === sheetName);
        const filename = getNicheFileName(sheetObj, index + 1, 'svg');
        if (index === 0) {
          mainNicheName = filename.replace(/_sheet_\d+\.svg$/, '');
        }
        sheetsFolder.file(filename, svgStr);
        sheetCount++;
      }
    });

    if (iconCount === 0 && sheetCount === 0) {
      alert('No vectorized SVG icons or presentation sheets found to download yet.');
      return;
    }

    zip.generateAsync({ type: 'blob' }).then((content) => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(content);
      a.download = `${mainNicheName}_vector_package_${Date.now()}.zip`;
      a.click();
      if (window.showCustomAlert) {
        window.showCustomAlert(`Downloaded all ${iconCount} vector icons and ${sheetCount} Presentation SVG Sheets in a single ZIP package!`, 'ZIP Downloaded', 'success');
      }
    });
  }

  const btnZipEl = document.getElementById('btnDownloadAllZip');
  if (btnZipEl) {
    btnZipEl.addEventListener('click', downloadAllSVGsAsZip);
  }

  // Helper to trigger browser download of the currently selected Branded Presentation Sheet SVG
  function triggerBrowserDownloadOfSheet(cleanSvg) {
    try {
      const blob = new Blob([cleanSvg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;

      const activeTab = document.querySelector('.sheet-tab-btn.active');
      const activeTabName = activeTab ? activeTab.textContent.trim() : '';
      const sheetObj = loadedSheetImgs.find(s => s.name === activeTabName || `Sheet ${loadedSheetImgs.indexOf(s) + 1}` === activeTabName);
      const activeIndex = loadedSheetImgs.indexOf(sheetObj) >= 0 ? loadedSheetImgs.indexOf(sheetObj) + 1 : 1;

      a.download = getNicheFileName(sheetObj, activeIndex, 'svg');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      if (typeof window.trackUserMetric === 'function') {
        window.trackUserMetric('presentations');
      }
    } catch (err) {
      console.error('[Browser download failed]:', err);
      alert('Failed to download presentation sheet: ' + err.message);
    }
  }

  // Helper to re-generate branded SVG sheets cleanly for file exports
  function generateCleanSheetsForExport() {
    const cleanSheetsMap = {};
    let cleanActiveSvg = '';

    if (loadedSheetImgs && loadedSheetImgs.length > 0) {
      loadedSheetImgs.forEach((sheetObj, index) => {
        const sheetName = sheetObj.name;
        const tilesForThisSheet = slicedTilesData.filter(t => t.sheetName === sheetName);
        let sCols = parseInt(sheetCols.value) || 5;
        let sRows = parseInt(sheetRows.value) || 3;

        if (!isGridSizeManuallyOverridden) {
          const gridLayer = activeLayers.find(l => l.type === 'grid');
          if (gridLayer) {
            const gridPad = gridLayer.padding !== undefined ? gridLayer.padding : 140;
            const maxGridW = gridLayer.w - 2 * gridPad;
            const maxGridH = gridLayer.h - 2 * gridPad;
            const activeTiles = tilesForThisSheet.filter(t => !t.isDeleted);
            const opt = calculateOptimalGrid(activeTiles.length, maxGridW, maxGridH);
            sCols = opt.cols;
            sRows = opt.rows;
          } else if (sheetObj.detectedGrid) {
            sCols = sheetObj.detectedGrid.cols;
            sRows = sheetObj.detectedGrid.rows;
          }
        }

        const svg = buildSingleBrandedSvgSheet(
          tilesForThisSheet,
          sheetName,
          sCols,
          sRows,
          true, // isExport = true (generates clean sheet)
          sheetObj.title || ''
        );
        cleanSheetsMap[sheetName] = svg;
      });

      if (!activePreviewSheetName || !cleanSheetsMap[activePreviewSheetName]) {
        activePreviewSheetName = loadedSheetImgs[0].name;
      }
      cleanActiveSvg = cleanSheetsMap[activePreviewSheetName];
    } else {
      cleanActiveSvg = buildSingleBrandedSvgSheet(slicedTilesData.filter(t => !t.isDeleted), '', null, null, true);
      cleanSheetsMap['Default'] = cleanActiveSvg;
    }

    return { cleanActiveSvg, cleanSheetsMap };
  }

  // Trigger save to local PC folder via WebSocket + browser download
  if (btnSaveToPC) {
    btnSaveToPC.addEventListener('click', () => {
      if (!generatedAssembledSvg) return;

      // Always trigger client browser download of the clean sheet SVG!
      const { cleanActiveSvg, cleanSheetsMap } = generateCleanSheetsForExport();
      triggerBrowserDownloadOfSheet(cleanActiveSvg);

      const outputDir = sheetSaveDir ? sheetSaveDir.value.trim() : '';

      // If WebSocket is open and we have a valid output directory, also save on server disk
      if (flowSocket && flowSocket.readyState === WebSocket.OPEN && outputDir) {
        btnSaveToPC.disabled = true;
        btnSaveToPC.textContent = '⏳ Saving...';

        const allCleanSheets = Object.keys(cleanSheetsMap).map(key => ({
          name: key,
          svg: cleanSheetsMap[key]
        }));

        sendFlowActionSpecific('save-vector-sheet', 'default', {
          outputDir: outputDir,
          sheetSvg: cleanActiveSvg,
          allSheets: allCleanSheets,
          iconSvgs: slicedTilesData.map(t => ({
            sheetName: t.sheetName,
            idx: t.idx,
            svgContent: t.svgContent
          }))
        });
      }
    });
  }

  // Callback handler for WebSocket save action
  window.handleSaveVectorSheetResult = function(msg) {
    if (btnSaveToPC) {
      btnSaveToPC.disabled = false;
      btnSaveToPC.textContent = '📥 Download Sheet';
    }

    if (msg.ok) {
      if (typeof window.trackUserMetric === 'function') {
        window.trackUserMetric('presentations');
      }
      alert(`Successfully saved to local PC directory:\n${msg.targetDir}\n\nFiles saved:\n- Complete Branded Sheet SVG\n- ${msg.savedIconsCount} Individual Icon SVGs`);
    } else {
      alert('Failed to save to PC:\n' + msg.error);
    }
  };

  // View Switcher & Contextual Sidebar Toggle Logic
  if (!btnToggleTilesView) btnToggleTilesView = document.getElementById('btnToggleTilesView');
  if (!btnToggleSheetView) btnToggleSheetView = document.getElementById('btnToggleSheetView');
  if (!tool4TilesContainer) tool4TilesContainer = document.getElementById('tool4TilesContainer');
  if (!tool4SheetWrap) tool4SheetWrap = document.getElementById('tool4SheetWrap');
  const studioSliceControls = document.getElementById('studioSliceControls');
  const studioPresentationControls = document.getElementById('studioPresentationControls');

  function setStudioView(viewMode) {
    if (viewMode === 'sheet') {
      if (tool4TilesContainer) tool4TilesContainer.style.display = 'none';
      if (tool4SheetWrap) tool4SheetWrap.style.display = 'block';
      if (studioSliceControls) {
        studioSliceControls.classList.add('hidden');
        studioSliceControls.style.display = 'none';
      }
      if (studioPresentationControls) {
        studioPresentationControls.classList.remove('hidden');
        studioPresentationControls.style.display = 'flex';
      }
      const headerAlignmentControls = document.getElementById('headerAlignmentControls');
      if (headerAlignmentControls) {
        headerAlignmentControls.style.display = 'flex';
      }
      if (btnToggleTilesView) btnToggleTilesView.className = 'btn btn-dark small';
      if (btnToggleSheetView) btnToggleSheetView.className = 'btn btn-primary small';
      if (btnSliceVectorize) {
        btnSliceVectorize.textContent = '✨ Update Presentation';
      }
    } else {
      if (tool4TilesContainer) tool4TilesContainer.style.display = 'block';
      if (tool4SheetWrap) tool4SheetWrap.style.display = 'none';
      if (studioSliceControls) {
        studioSliceControls.classList.remove('hidden');
        studioSliceControls.style.display = 'flex';
      }
      if (studioPresentationControls) {
        studioPresentationControls.classList.add('hidden');
        studioPresentationControls.style.display = 'none';
      }
      const headerAlignmentControls = document.getElementById('headerAlignmentControls');
      if (headerAlignmentControls) {
        headerAlignmentControls.style.display = 'none';
      }
      if (btnToggleTilesView) btnToggleTilesView.className = 'btn btn-primary small';
      if (btnToggleSheetView) btnToggleSheetView.className = 'btn btn-dark small';
      if (btnSliceVectorize) {
        const count = slicedTilesData.length || 15;
        btnSliceVectorize.textContent = `⚡ Convert ${count} Icons to Vector`;
      }
    }
  }

  if (btnToggleTilesView) {
    btnToggleTilesView.addEventListener('click', () => setStudioView('tiles'));
  }
  if (btnToggleSheetView) {
    btnToggleSheetView.addEventListener('click', () => {
      setStudioView('sheet');
      buildBrandedSvgSheet();
    });
  }

  // Handle Action Footer Button based on active view
  if (btnSliceVectorize) {
    btnSliceVectorize.addEventListener('click', () => {
      const isSheetView = studioPresentationControls && !studioPresentationControls.classList.contains('hidden') && studioPresentationControls.style.display !== 'none';
      if (isSheetView) {
        buildBrandedSvgSheet();
      }
    });
  }

  // Download SVG Sheet manually
  if (btnDownloadAssembledSheet) {
    btnDownloadAssembledSheet.addEventListener('click', () => {
      if (!generatedAssembledSvg) return;

      if (typeof window.trackUserMetric === 'function') {
        window.trackUserMetric('presentations');
      }

      const cleanSvg = getCleanSvgForExport(generatedAssembledSvg);
      const blob = new Blob([cleanSvg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${((sheetSetName ? sheetSetName.value : '') || 'icon_set').toLowerCase().replace(/\s+/g, '_')}_sheet.svg`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  // Pointer-Drag / Resizing Layer Editor
  let isDraggingLayer = false;
  let isResizingLayer = false;
  let resizeHandle = null;
  let dragStartLayerX = 0;
  let dragStartLayerY = 0;
  let dragStartLayerW = 0;
  let dragStartLayerH = 0;
  let dragStartFontSize = 0;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragLayerId = null;
  let dragStartSelectedLayers = [];
  let hasMovedDuringDrag = false;
  let dragModifierKey = false;
  let isAltDuplicating = false;
  let altDuplicatedClones = [];
  let altOriginalItems = [];

  isDraggingMarquee = false;
  let marqueeStartX = 0;
  let marqueeStartY = 0;
  let marqueeEndX = 0;
  let marqueeEndY = 0;
  let marqueeShiftKey = false;

  // Sheet Zoom & Pan State Variables
  let currentSheetZoom = 100;
  let isViewportPanning = false;
  let panStartX = 0;
  let panStartY = 0;
  let panScrollLeft = 0;
  let panScrollTop = 0;

  if (tool4SheetCard) {
    tool4SheetCard.addEventListener('mousedown', (e) => {
      // If Pan mode is enabled, spacebar is held, or middle-click panning, let viewport panning handle it
      if (isSheetPanMode || isSpacebarDown || e.button === 1) {
        return;
      }

      if (e.target.closest('.delete-btn-group')) {
        return; // Clicked the delete button. Do not touch or prevent default!
      }

      e.stopPropagation();

      const target = e.target;
      if (!target) return;
      
      const handle = target.getAttribute('data-handle');
      const layerId = target.getAttribute('data-id') || target.closest('[data-id]')?.getAttribute('data-id');
      
      // Get scale parameters in case we need them
      const svgEl = tool4SheetCard.querySelector('svg');
      let scaleX = 1.0, scaleY = 1.0, rect = null;
      if (svgEl) {
        rect = svgEl.getBoundingClientRect();
        scaleX = 6000 / rect.width;
        scaleY = 2600 / rect.height;
      }

      if (!layerId) {
        // Start Drag Marquee Selection!
        if (rect) {
          isDraggingMarquee = true;
          marqueeStartX = (e.clientX - rect.left) * scaleX;
          marqueeStartY = (e.clientY - rect.top) * scaleY;
          marqueeEndX = marqueeStartX;
          marqueeEndY = marqueeStartY;
          marqueeShiftKey = e.shiftKey || e.ctrlKey || e.metaKey;
          
          if (!marqueeShiftKey) {
            currentDesignerLayerId = null;
            selectedLayerIds = [];
            clearDesignerLayerFields();
            renderDesignerLayersTree();
          }
          
          updateAlignmentCardVisibility();
          buildBrandedSvgSheet();
        }
        return;
      }

      e.preventDefault();

      const layer = activeLayers.find(l => l.id === layerId);
      if (!layer) return;

      // Select this layer visually and update tree
      const isMulti = e.shiftKey || e.ctrlKey || e.metaKey;
      dragModifierKey = isMulti;
      hasMovedDuringDrag = false;
      let multiDeselected = false;

      // Determine target member IDs (single layer or whole group)
      const targetMemberIds = layer.groupId
        ? activeLayers.filter(l => l.groupId === layer.groupId).map(l => l.id)
        : [layerId];

      if (isMulti) {
        const allSelected = targetMemberIds.every(id => selectedLayerIds.includes(id));
        if (allSelected) {
          selectedLayerIds = selectedLayerIds.filter(id => !targetMemberIds.includes(id));
          multiDeselected = true;
          if (targetMemberIds.includes(currentDesignerLayerId)) {
            currentDesignerLayerId = selectedLayerIds[selectedLayerIds.length - 1] || null;
          }
        } else {
          targetMemberIds.forEach(id => {
            if (!selectedLayerIds.includes(id)) selectedLayerIds.push(id);
          });
          currentDesignerLayerId = layerId;
        }
      } else {
        if (!selectedLayerIds.includes(layerId)) {
          selectedLayerIds = [...targetMemberIds];
          currentDesignerLayerId = layerId;
        } else {
          currentDesignerLayerId = layerId;
        }
      }

      if (currentDesignerLayerId) {
        loadDesignerLayerFields(currentDesignerLayerId);
      } else {
        clearDesignerLayerFields();
      }
      renderDesignerLayersTree();
      updateAlignmentCardVisibility();
      buildBrandedSvgSheet();

      if (layer.locked || multiDeselected) {
        return;
      }

      // Save history BEFORE drag or resize modification begins
      saveHistoryState();

      dragStartX = e.clientX;
      dragStartY = e.clientY;
      dragLayerId = layerId;
      dragStartLayerX = layer.x || 0;
      dragStartLayerY = layer.y || 0;
      dragStartLayerW = layer.w || 0;
      dragStartLayerH = layer.h || 0;
      dragStartFontSize = layer.fontSize || 72;

      dragStartSelectedLayers = [];
      if (selectedLayerIds.includes(layerId)) {
        selectedLayerIds.forEach(id => {
          const l = activeLayers.find(al => al.id === id);
          if (l) {
            dragStartSelectedLayers.push({
              id: l.id,
              startX: l.x || 0,
              startY: l.y || 0,
              w: l.w || 0,
              h: l.h || 0
            });
          }
        });
      }

      if (dragStartSelectedLayers.length === 0) {
        dragStartSelectedLayers.push({
          id: layer.id,
          startX: layer.x || 0,
          startY: layer.y || 0,
          w: layer.w || 0,
          h: layer.h || 0
        });
      }

      isAltDuplicating = false;
      altDuplicatedClones = [];
      altOriginalItems = dragStartSelectedLayers.map(info => ({
        id: info.id,
        startX: info.startX,
        startY: info.startY,
        w: info.w,
        h: info.h
      }));

      if (handle) {
        isResizingLayer = true;
        resizeHandle = handle;
        isDraggingLayer = false;
      } else {
        isDraggingLayer = true;
        isResizingLayer = false;
        resizeHandle = null;
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (isDraggingMarquee) {
        const svgEl = tool4SheetCard.querySelector('svg');
        if (svgEl) {
          const rect = svgEl.getBoundingClientRect();
          const scaleX = 6000 / rect.width;
          const scaleY = 2600 / rect.height;
          
          marqueeEndX = (e.clientX - rect.left) * scaleX;
          marqueeEndY = (e.clientY - rect.top) * scaleY;
          
          marqueeEndX = Math.max(0, Math.min(6000, marqueeEndX));
          marqueeEndY = Math.max(0, Math.min(2600, marqueeEndY));
          
          buildBrandedSvgSheet();
        }
        return;
      }

      if ((!isDraggingLayer && !isResizingLayer) || !dragLayerId) return;
      const layer = activeLayers.find(l => l.id === dragLayerId);
      if (!layer || layer.locked) return;

      const svgEl = tool4SheetCard.querySelector('svg');
      if (!svgEl) return;

      const rect = svgEl.getBoundingClientRect();
      const scaleX = 6000 / rect.width;
      const scaleY = 2600 / rect.height;

      let dx = (e.clientX - dragStartX) * scaleX;
      let dy = (e.clientY - dragStartY) * scaleY;

      // Illustrator Shift-Constrained Movement: lock to strictly horizontal or strictly vertical straight line
      if (isDraggingLayer && e.shiftKey) {
        if (Math.abs(dx) >= Math.abs(dy)) {
          dy = 0; // Pure horizontal movement
        } else {
          dx = 0; // Pure vertical movement
        }
      }

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasMovedDuringDrag = true;
      }

      // Adobe Illustrator Style Alt-Drag Duplication
      if (isDraggingLayer && !isResizingLayer && hasMovedDuringDrag) {
        if (e.altKey && !isAltDuplicating && altOriginalItems.length > 0) {
          // Restore original layers to stationary starting positions
          altOriginalItems.forEach(item => {
            const orig = activeLayers.find(al => al.id === item.id);
            if (orig) {
              orig.x = item.startX;
              orig.y = item.startY;
            }
          });

          // Create clones of each dragged layer
          altDuplicatedClones = [];
          const newDragStartSelectedLayers = [];
          const newSelectedIds = [];
          const groupIdMap = {};
          let newDragLayerId = null;

          altOriginalItems.forEach(item => {
            const orig = activeLayers.find(al => al.id === item.id);
            if (!orig) return;

            const newId = orig.type + '_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
            const clone = JSON.parse(JSON.stringify(orig));
            clone.id = newId;

            if (orig.groupId) {
              if (!groupIdMap[orig.groupId]) {
                groupIdMap[orig.groupId] = {
                  id: 'grp_' + Date.now() + '_' + Math.floor(Math.random() * 100000),
                  name: (orig.groupName || 'Group') + ' Copy'
                };
              }
              clone.groupId = groupIdMap[orig.groupId].id;
              clone.groupName = groupIdMap[orig.groupId].name;
            }

            const baseName = orig.name.replace(/ Copy(\s+\d+)?$/, '');
            const copyCount = activeLayers.filter(l => l.name.startsWith(baseName + ' Copy')).length + 1;
            clone.name = `${baseName} Copy ${copyCount}`;

            activeLayers.push(clone);
            altDuplicatedClones.push(clone);
            newSelectedIds.push(newId);

            newDragStartSelectedLayers.push({
              id: newId,
              startX: item.startX,
              startY: item.startY,
              w: item.w,
              h: item.h
            });

            if (orig.id === dragLayerId) {
              newDragLayerId = newId;
            }
          });

          if (altDuplicatedClones.length > 0) {
            dragStartSelectedLayers = newDragStartSelectedLayers;
            selectedLayerIds = newSelectedIds;
            if (newDragLayerId) dragLayerId = newDragLayerId;
            currentDesignerLayerId = selectedLayerIds[selectedLayerIds.length - 1];
            isAltDuplicating = true;
            if (tool4SheetCard) tool4SheetCard.style.cursor = 'copy';
          }
        } else if (!e.altKey && isAltDuplicating) {
          // Revert duplication if user releases Alt while dragging
          const cloneIds = altDuplicatedClones.map(c => c.id);
          activeLayers = activeLayers.filter(l => !cloneIds.includes(l.id));
          altDuplicatedClones = [];

          dragStartSelectedLayers = altOriginalItems.map(item => ({ ...item }));
          selectedLayerIds = altOriginalItems.map(item => item.id);
          dragLayerId = selectedLayerIds[0];
          currentDesignerLayerId = dragLayerId;
          isAltDuplicating = false;
          if (tool4SheetCard) tool4SheetCard.style.cursor = '';
        }
      }

      if (isResizingLayer) {
        if (layer.type === 'text') {
          // Resize text font size based on drag direction
          const baseW = 600;
          let scaleFactor = 1.0;
          if (resizeHandle === 'br' || resizeHandle === 'tr') {
            scaleFactor = (baseW + dx) / baseW;
          } else {
            scaleFactor = (baseW - dx) / baseW;
          }
          layer.fontSize = Math.max(12, Math.round(dragStartFontSize * scaleFactor));
        } else {
          // Shape or Grid/Featured resizing
          if (e.shiftKey) {
            // Keep aspect ratio (like Illustrator)
            let scale = 1.0;
            let scaleX = 1.0;
            let scaleY = 1.0;

            if (resizeHandle === 'br') {
              scaleX = (dragStartLayerW + dx) / dragStartLayerW;
              scaleY = (dragStartLayerH + dy) / dragStartLayerH;
              if (Math.abs(scaleX - 1) > Math.abs(scaleY - 1)) { scale = scaleX; } else { scale = scaleY; }

              const maxW = 6000 - layer.x;
              const maxH = 2600 - layer.y;
              const maxScale = Math.min(maxW / dragStartLayerW, maxH / dragStartLayerH);
              const minScale = Math.max(50 / dragStartLayerW, 50 / dragStartLayerH);
              scale = Math.max(minScale, Math.min(scale, maxScale));

              layer.w = Math.round(dragStartLayerW * scale);
              layer.h = Math.round(dragStartLayerH * scale);
            }
            else if (resizeHandle === 'tr') {
              const y_bottom = dragStartLayerY + dragStartLayerH;
              scaleX = (dragStartLayerW + dx) / dragStartLayerW;
              scaleY = (dragStartLayerH - dy) / dragStartLayerH;
              if (Math.abs(scaleX - 1) > Math.abs(scaleY - 1)) { scale = scaleX; } else { scale = scaleY; }

              const maxW = 6000 - layer.x;
              const maxH = y_bottom;
              const maxScale = Math.min(maxW / dragStartLayerW, maxH / dragStartLayerH);
              const minScale = Math.max(50 / dragStartLayerW, 50 / dragStartLayerH);
              scale = Math.max(minScale, Math.min(scale, maxScale));

              layer.w = Math.round(dragStartLayerW * scale);
              layer.h = Math.round(dragStartLayerH * scale);
              layer.y = Math.round(y_bottom - layer.h);
            }
            else if (resizeHandle === 'bl') {
              const x_right = dragStartLayerX + dragStartLayerW;
              scaleX = (dragStartLayerW - dx) / dragStartLayerW;
              scaleY = (dragStartLayerH + dy) / dragStartLayerH;
              if (Math.abs(scaleX - 1) > Math.abs(scaleY - 1)) { scale = scaleX; } else { scale = scaleY; }

              const maxW = x_right;
              const maxH = 2600 - layer.y;
              const maxScale = Math.min(maxW / dragStartLayerW, maxH / dragStartLayerH);
              const minScale = Math.max(50 / dragStartLayerW, 50 / dragStartLayerH);
              scale = Math.max(minScale, Math.min(scale, maxScale));

              layer.w = Math.round(dragStartLayerW * scale);
              layer.h = Math.round(dragStartLayerH * scale);
              layer.x = Math.round(x_right - layer.w);
            }
            else if (resizeHandle === 'tl') {
              const x_right = dragStartLayerX + dragStartLayerW;
              const y_bottom = dragStartLayerY + dragStartLayerH;
              scaleX = (dragStartLayerW - dx) / dragStartLayerW;
              scaleY = (dragStartLayerH - dy) / dragStartLayerH;
              if (Math.abs(scaleX - 1) > Math.abs(scaleY - 1)) { scale = scaleX; } else { scale = scaleY; }

              const maxW = x_right;
              const maxH = y_bottom;
              const maxScale = Math.min(maxW / dragStartLayerW, maxH / dragStartLayerH);
              const minScale = Math.max(50 / dragStartLayerW, 50 / dragStartLayerH);
              scale = Math.max(minScale, Math.min(scale, maxScale));

              layer.w = Math.round(dragStartLayerW * scale);
              layer.h = Math.round(dragStartLayerH * scale);
              layer.x = Math.round(x_right - layer.w);
              layer.y = Math.round(y_bottom - layer.h);
            }
          } else {
            // Shape or Grid/Featured resizing within artboard boundary
            if (resizeHandle === 'br') {
              layer.w = Math.max(50, Math.min(6000 - layer.x, Math.round(dragStartLayerW + dx)));
              layer.h = Math.max(50, Math.min(2600 - layer.y, Math.round(dragStartLayerH + dy)));
            }
            else if (resizeHandle === 'tr') {
              const y_bottom = dragStartLayerY + dragStartLayerH;
              let newY = Math.max(0, Math.min(y_bottom - 50, Math.round(dragStartLayerY + dy)));
              layer.y = newY;
              layer.h = y_bottom - newY;
              layer.w = Math.max(50, Math.min(6000 - layer.x, Math.round(dragStartLayerW + dx)));
            }
            else if (resizeHandle === 'bl') {
              const x_right = dragStartLayerX + dragStartLayerW;
              let newX = Math.max(0, Math.min(x_right - 50, Math.round(dragStartLayerX + dx)));
              layer.x = newX;
              layer.w = x_right - newX;
              layer.h = Math.max(50, Math.min(2600 - layer.y, Math.round(dragStartLayerH + dy)));
            }
            else if (resizeHandle === 'tl') {
              const x_right = dragStartLayerX + dragStartLayerW;
              const y_bottom = dragStartLayerY + dragStartLayerH;
              let newX = Math.max(0, Math.min(x_right - 50, Math.round(dragStartLayerX + dx)));
              layer.x = newX;
              layer.w = x_right - newX;
              let newY = Math.max(0, Math.min(y_bottom - 50, Math.round(dragStartLayerY + dy)));
              layer.y = newY;
              layer.h = y_bottom - newY;
            }
          }
        }
      } else if (isDraggingLayer) {
        if (dragStartSelectedLayers.length > 0) {
          // Multi-dragging: move all selected layers together
          dragStartSelectedLayers.forEach(startInfo => {
            const selectL = activeLayers.find(al => al.id === startInfo.id);
            if (!selectL || selectL.locked) return;

            let targetX = Math.round(startInfo.startX + dx);
            let targetY = Math.round(startInfo.startY + dy);

            // Clamp coordinates to artboard limits (6000x2600 px)
            if (selectL.type === 'text') {
              targetX = Math.max(0, Math.min(6000, targetX));
              targetY = Math.max(0, Math.min(2600, targetY));
            } else {
              targetX = Math.max(0, Math.min(6000 - (startInfo.w || 0), targetX));
              targetY = Math.max(0, Math.min(2600 - (startInfo.h || 0), targetY));
            }
            selectL.x = targetX;
            selectL.y = targetY;
          });
        } else {
          // Normal single-drag
          if (layer.type === 'text') {
            layer.x = Math.max(0, Math.min(6000, Math.round(dragStartLayerX + dx)));
            layer.y = Math.max(0, Math.min(2600, Math.round(dragStartLayerY + dy)));
          } else {
            layer.x = Math.max(0, Math.min(6000 - (layer.w || 0), Math.round(dragStartLayerX + dx)));
            layer.y = Math.max(0, Math.min(2600 - (layer.h || 0), Math.round(dragStartLayerY + dy)));
          }
        }
      }

      // Sync field inputs
      if (uiElements.propX) uiElements.propX.value = layer.x;
      if (uiElements.propY) uiElements.propY.value = layer.y;
      if (uiElements.propW) uiElements.propW.value = (layer.type === 'text') ? (layer.fontSize || 72) : (layer.w || 0);
      if (uiElements.propH) uiElements.propH.value = layer.h || 0;

      buildBrandedSvgSheet();
    });

    window.addEventListener('mouseup', () => {
      if (isDraggingMarquee) {
        isDraggingMarquee = false;
        
        const xMin = Math.min(marqueeStartX, marqueeEndX);
        const xMax = Math.max(marqueeStartX, marqueeEndX);
        const yMin = Math.min(marqueeStartY, marqueeEndY);
        const yMax = Math.max(marqueeStartY, marqueeEndY);
        
        // Count it as drag selection if area is larger than 100 square pixels
        if ((xMax - xMin) * (yMax - yMin) > 100) {
          const newlySelected = [];
          activeLayers.forEach(l => {
            if (l.visible === false) return; // ignore hidden layers
            
            let lMinX, lMaxX, lMinY, lMaxY;
            if (l.type === 'text') {
              const aw = 600;
              const ah = l.fontSize || 72;
              lMinX = l.x - aw / 2;
              lMaxX = l.x + aw / 2;
              lMinY = l.y - ah;
              lMaxY = l.y;
            } else {
              const w = l.w || 0;
              const h = l.h || 0;
              lMinX = l.x;
              lMaxX = l.x + w;
              lMinY = l.y;
              lMaxY = l.y + h;
            }
            
            // Check box overlap
            if (xMin <= lMaxX && xMax >= lMinX && yMin <= lMaxY && yMax >= lMinY) {
              newlySelected.push(l.id);
            }
          });
          
          if (marqueeShiftKey) {
            selectedLayerIds = [...new Set([...selectedLayerIds, ...newlySelected])];
          } else {
            selectedLayerIds = newlySelected;
          }
          
          if (selectedLayerIds.length > 0) {
            currentDesignerLayerId = selectedLayerIds[selectedLayerIds.length - 1];
            loadDesignerLayerFields(currentDesignerLayerId);
          } else {
            currentDesignerLayerId = null;
            clearDesignerLayerFields();
          }
          renderDesignerLayersTree();
          updateAlignmentCardVisibility();
        }
        buildBrandedSvgSheet();
      }

      if (isDraggingLayer || isResizingLayer) {
        if (isAltDuplicating && altDuplicatedClones.length > 0) {
          renderDesignerLayersTree();
          updateAlignmentCardVisibility();
          loadDesignerLayerFields(currentDesignerLayerId);
          buildBrandedSvgSheet();
          if (typeof showGravityToast === 'function') {
            showGravityToast('ডুপ্লিকেট কপি তৈরি হয়েছে (Alt+Drag)', 'success');
          }
        } else if (isDraggingLayer && !hasMovedDuringDrag && !dragModifierKey && dragLayerId && selectedLayerIds.length > 1) {
          const clickedLayer = activeLayers.find(l => l.id === dragLayerId);
          if (clickedLayer && clickedLayer.groupId) {
            const groupMembers = activeLayers.filter(l => l.groupId === clickedLayer.groupId).map(l => l.id);
            selectedLayerIds = [...groupMembers];
            currentDesignerLayerId = dragLayerId;
          } else {
            selectedLayerIds = [dragLayerId];
            currentDesignerLayerId = dragLayerId;
          }
          loadDesignerLayerFields(currentDesignerLayerId);
          renderDesignerLayersTree();
          updateAlignmentCardVisibility();
          buildBrandedSvgSheet();
        }

        isDraggingLayer = false;
        isResizingLayer = false;
        resizeHandle = null;
        dragLayerId = null;
        hasMovedDuringDrag = false;
        isAltDuplicating = false;
        altDuplicatedClones = [];
        altOriginalItems = [];
        if (tool4SheetCard) tool4SheetCard.style.cursor = '';
        saveCurrentFieldsToActivePreset();
      }
    });
  }

  // Bind Undo/Redo Click Triggers
  const btnUndo = document.getElementById('btnUndo');
  const btnRedo = document.getElementById('btnRedo');
  if (btnUndo) btnUndo.addEventListener('click', undo);
  if (btnRedo) btnRedo.addEventListener('click', redo);

  // Save history state on focus of properties inputs to capture pre-change coordinates
  ['propX', 'propY', 'propW', 'propH', 'propRadius', 'propColor', 'propColorHex', 'propText', 'propFontSize', 'propFontSizeSlider'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('focus', () => {
        saveHistoryState();
      });
    }
  });
  const propFont = document.getElementById('propFont');
  if (propFont) {
    propFont.addEventListener('focus', () => {
      saveHistoryState();
    });
  }

  // Save history on preset selector change
  if (sheetPresetSelect) {
    sheetPresetSelect.addEventListener('change', () => {
      saveHistoryState();
    });
  }

  // Keyboard Shortcuts Hook
  window.addEventListener('keydown', (e) => {
    // Duplicate: Ctrl + D (or Cmd + D on Mac) - check both key and code to support all keyboard layouts/IMEs
    if ((e.ctrlKey || e.metaKey) && (e.key?.toLowerCase() === 'd' || e.code === 'KeyD')) {
      e.preventDefault();
      e.stopPropagation();
      duplicateSelectedLayer();
      return;
    }

    // Skip if actively typing inside properties text field to allow normal browser caret undo
    if (document.activeElement && document.activeElement.id === 'propText') {
      return;
    }
    if ((e.ctrlKey || e.metaKey) && (e.key?.toLowerCase() === 'z' || e.code === 'KeyZ')) {
      e.preventDefault();
      undo();
    }
    if ((e.ctrlKey || e.metaKey) && (e.key?.toLowerCase() === 'y' || e.code === 'KeyY' || (e.shiftKey && (e.key?.toLowerCase() === 'z' || e.code === 'KeyZ')))) {
      e.preventDefault();
      redo();
    }
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key?.toLowerCase() === 'g' || e.code === 'KeyG')) {
      e.preventDefault();
      groupSelectedLayers();
    }
    if ((e.ctrlKey || e.metaKey) && ((e.shiftKey && (e.key?.toLowerCase() === 'g' || e.code === 'KeyG')) || e.key?.toLowerCase() === 'u' || e.code === 'KeyU')) {
      e.preventDefault();
      ungroupSelectedLayers();
    }
    if (e.key === 'Escape') {
      deselectAllDesignerLayers();
    }
    // Delete key to delete selected layer(s) when not typing in an input
    const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
    if ((e.key === 'Delete' || e.key === 'Backspace') && !isTyping) {
      if ((selectedLayerIds && selectedLayerIds.length > 0) || currentDesignerLayerId) {
        e.preventDefault();
        deleteSelectedLayer();
      }
    }
  });

  // ===== Tool #4 Presentation Sheet Zoom & Pan Controller =====
  const tool4SheetViewport = document.getElementById('tool4SheetViewport');
  const btnSheetZoomIn = document.getElementById('btnSheetZoomIn');
  const btnSheetZoomOut = document.getElementById('btnSheetZoomOut');
  const sheetZoomLevelSelect = document.getElementById('sheetZoomLevelSelect');
  const btnSheetZoomReset = document.getElementById('btnSheetZoomReset');
  const btnSheetPanMode = document.getElementById('btnSheetPanMode');

  const SHEET_ZOOM_STEPS = [50, 75, 100, 125, 150, 200, 300, 400];

  function applySheetZoomStyles(zoom) {
    if (!tool4SheetCard) return;
    tool4SheetCard.style.width = zoom === 100 ? '100%' : `${zoom}%`;
    tool4SheetCard.style.maxWidth = 'none';
    if (zoom <= 100) {
      tool4SheetCard.style.margin = '0 auto';
    } else {
      tool4SheetCard.style.margin = '0';
    }
  }

  function updateSheetZoomControlsUI() {
    if (sheetZoomLevelSelect) {
      const opt = Array.from(sheetZoomLevelSelect.options).find(o => parseInt(o.value, 10) === currentSheetZoom);
      if (opt) {
        sheetZoomLevelSelect.value = String(currentSheetZoom);
      } else {
        sheetZoomLevelSelect.value = "100";
      }
    }
    if (btnSheetZoomIn) {
      btnSheetZoomIn.disabled = (currentSheetZoom >= 400);
    }
    if (btnSheetZoomOut) {
      btnSheetZoomOut.disabled = (currentSheetZoom <= 50);
    }
    if (btnSheetPanMode) {
      btnSheetPanMode.classList.toggle('active', isSheetPanMode);
    }
    if (tool4SheetViewport) {
      tool4SheetViewport.classList.toggle('pan-mode-active', isSheetPanMode || isSpacebarDown);
    }
  }

  function setSheetZoom(newZoom, anchorClientX = null, anchorClientY = null) {
    newZoom = Math.max(50, Math.min(400, Math.round(newZoom)));
    const oldZoom = currentSheetZoom;
    currentSheetZoom = newZoom;

    if (tool4SheetViewport && anchorClientX !== null && anchorClientY !== null && oldZoom !== newZoom) {
      const vpRect = tool4SheetViewport.getBoundingClientRect();
      const mouseRelX = anchorClientX - vpRect.left + tool4SheetViewport.scrollLeft;
      const mouseRelY = anchorClientY - vpRect.top + tool4SheetViewport.scrollTop;

      const scaleRatio = newZoom / oldZoom;
      const newScrollLeft = mouseRelX * scaleRatio - (anchorClientX - vpRect.left);
      const newScrollTop = mouseRelY * scaleRatio - (anchorClientY - vpRect.top);

      applySheetZoomStyles(newZoom);

      tool4SheetViewport.scrollLeft = Math.max(0, newScrollLeft);
      tool4SheetViewport.scrollTop = Math.max(0, newScrollTop);
    } else {
      applySheetZoomStyles(newZoom);
    }

    updateSheetZoomControlsUI();
  }

  function stepSheetZoom(direction, clientX = null, clientY = null) {
    let nextZoom = currentSheetZoom;
    if (direction > 0) {
      nextZoom = SHEET_ZOOM_STEPS.find(z => z > currentSheetZoom) || 400;
    } else {
      nextZoom = [...SHEET_ZOOM_STEPS].reverse().find(z => z < currentSheetZoom) || 50;
    }
    setSheetZoom(nextZoom, clientX, clientY);
  }

  if (btnSheetZoomIn) {
    btnSheetZoomIn.addEventListener('click', () => {
      stepSheetZoom(1);
    });
  }

  if (btnSheetZoomOut) {
    btnSheetZoomOut.addEventListener('click', () => {
      stepSheetZoom(-1);
    });
  }

  if (sheetZoomLevelSelect) {
    sheetZoomLevelSelect.addEventListener('change', (e) => {
      const val = parseInt(e.target.value, 10);
      if (!isNaN(val)) {
        setSheetZoom(val);
      }
    });
  }

  if (btnSheetZoomReset) {
    btnSheetZoomReset.addEventListener('click', () => {
      setSheetZoom(100);
      if (tool4SheetViewport) {
        tool4SheetViewport.scrollLeft = 0;
        tool4SheetViewport.scrollTop = 0;
      }
    });
  }

  if (btnSheetPanMode) {
    btnSheetPanMode.addEventListener('click', () => {
      isSheetPanMode = !isSheetPanMode;
      updateSheetZoomControlsUI();
    });
  }

  // Ctrl + Mouse Wheel Zoom on Viewport
  if (tool4SheetViewport) {
    tool4SheetViewport.addEventListener('wheel', (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const dir = e.deltaY < 0 ? 1 : -1;
        stepSheetZoom(dir, e.clientX, e.clientY);
      }
    }, { passive: false });

    // Panning via Mouse Drag OR Deselect on Clicking Outside Artboard
    tool4SheetViewport.addEventListener('mousedown', (e) => {
      const canPan = isSheetPanMode || isSpacebarDown || e.button === 1;
      if (canPan) {
        e.preventDefault();
        isViewportPanning = true;
        panStartX = e.clientX;
        panStartY = e.clientY;
        panScrollLeft = tool4SheetViewport.scrollLeft;
        panScrollTop = tool4SheetViewport.scrollTop;
        tool4SheetViewport.classList.add('is-panning');
        return;
      }

      // Clicking empty workspace in viewport outside the artboard deselects all layers
      if (e.button === 0) {
        deselectAllDesignerLayers();
      }
    });
  }

  window.addEventListener('mousemove', (e) => {
    if (!isViewportPanning || !tool4SheetViewport) return;
    e.preventDefault();
    const dx = e.clientX - panStartX;
    const dy = e.clientY - panStartY;
    tool4SheetViewport.scrollLeft = panScrollLeft - dx;
    tool4SheetViewport.scrollTop = panScrollTop - dy;
  });

  window.addEventListener('mouseup', () => {
    if (isViewportPanning) {
      isViewportPanning = false;
      if (tool4SheetViewport) {
        tool4SheetViewport.classList.remove('is-panning');
      }
    }
  });

  // Spacebar hold-to-pan & Keyboard shortcuts
  window.addEventListener('keydown', (e) => {
    const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
    
    // Spacebar hold-to-pan
    if (e.code === 'Space' && !isTyping) {
      if (!isSpacebarDown) {
        isSpacebarDown = true;
        updateSheetZoomControlsUI();
      }
      if (tool4SheetViewport && (tool4SheetViewport.matches(':hover') || tool4SheetViewport.contains(document.activeElement))) {
        e.preventDefault();
      }
    }

    // Ctrl + Plus / Ctrl + Minus / Ctrl + 0 when hovering over viewport or toolbar
    if ((e.ctrlKey || e.metaKey) && !isTyping) {
      const isOverSheet = tool4SheetViewport && (tool4SheetViewport.matches(':hover') || (document.getElementById('sheetZoomToolbar') && document.getElementById('sheetZoomToolbar').matches(':hover')));
      if (isOverSheet) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          stepSheetZoom(1);
        } else if (e.key === '-' || e.key === '_') {
          e.preventDefault();
          stepSheetZoom(-1);
        } else if (e.key === '0') {
          e.preventDefault();
          setSheetZoom(100);
          if (tool4SheetViewport) {
            tool4SheetViewport.scrollLeft = 0;
            tool4SheetViewport.scrollTop = 0;
          }
        }
      }
    }

    // Alt key duplicate cursor hint
    if (e.key === 'Alt' && isDraggingLayer) {
      e.preventDefault();
      if (tool4SheetCard) tool4SheetCard.style.cursor = 'copy';
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
      isSpacebarDown = false;
      updateSheetZoomControlsUI();
    }
    if (e.key === 'Alt') {
      if (tool4SheetCard && !isAltDuplicating) {
        tool4SheetCard.style.cursor = '';
      }
    }
  });

  const btnSheetZoomShuffle = document.getElementById('btnSheetZoomShuffle');
  if (btnSheetZoomShuffle) {
    btnSheetZoomShuffle.addEventListener('click', reshuffleIconPositions);
  }

  // Initial call
  applySheetZoomStyles(100);

  // ===== Firebase Authentication Controller =====
  const btnOpenAuthModal = document.getElementById('btnOpenAuthModal');
  const btnCloseAuthModal = document.getElementById('btnCloseAuthModal');
  const authModal = document.getElementById('authModal');
  const btnGoogleSignIn = document.getElementById('btnGoogleSignIn');
  const authEmailForm = document.getElementById('authEmailForm');
  const authEmail = document.getElementById('authEmail');
  const authPassword = document.getElementById('authPassword');
  const btnSubmitAuth = document.getElementById('btnSubmitAuth');
  const authToggleModeBtn = document.getElementById('authToggleModeBtn');
  const userProfileMenu = document.getElementById('userProfileMenu');
  const userAvatar = document.getElementById('userAvatar');
  const userName = document.getElementById('userName');
  const btnSignOut = document.getElementById('btnSignOut');

  // Mobile Auth elements bindings
  const mobileUserProfileMenu = document.getElementById('mobileUserProfileMenu');
  const mobileUserName = document.getElementById('mobileUserName');
  const mobileUserEmail = document.getElementById('mobileUserEmail');
  const mobileUserAvatar = document.getElementById('mobileUserAvatar');

  let isSignUpMode = false;

  function toggleAuthGate(notAuth) {
    if (notAuth) {
      document.body.classList.add('not-authenticated');
      document.documentElement.classList.add('not-authenticated');
      if (authModal) {
        authModal.classList.remove('hidden');
      }
    } else {
      document.body.classList.remove('not-authenticated');
      document.documentElement.classList.remove('not-authenticated');
      if (authModal) {
        authModal.classList.add('hidden');
      }
    }
  }

  function openAuthModal() {
    if (authModal) {
      if (!document.body.classList.contains('not-authenticated')) {
        authModal.classList.remove('hidden');
      }
    }
  }

  function closeAuthModal() {
    if (authModal && !document.body.classList.contains('not-authenticated')) {
      authModal.classList.add('hidden');
    }
  }

  if (btnOpenAuthModal) btnOpenAuthModal.addEventListener('click', openAuthModal);

  if (authToggleModeBtn) {
    authToggleModeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      isSignUpMode = !isSignUpMode;
      btnSubmitAuth.textContent = isSignUpMode ? 'Create Account' : 'Sign In';
      authToggleModeBtn.textContent = isSignUpMode ? 'Already have an account? Sign In' : 'Create Account';
    });
  }

  // Initialize Firebase App if configured
  let firebaseAuth = null;
  let firebaseDb = null;
  if (window.firebase) {
    try {
      if (!firebase.apps.length) {
        // =========================================================================
        // 🔑 FIREBASE CONFIGURATION (Connected to gravitylab-d9276)
        // =========================================================================
        const firebaseConfig = {
          apiKey: "AIzaSyASL_t-Rq4TNkAfo4BINtin8PlsrDElM7s",
          authDomain: "vector-30ffb.firebaseapp.com",
          projectId: "vector-30ffb",
          storageBucket: "vector-30ffb.firebasestorage.app",
          messagingSenderId: "410341710131",
          appId: "1:410341710131:web:0ec0c46f34892a763ec646"
        };
        firebase.initializeApp(firebaseConfig);
      }
      firebaseAuth = firebase.auth();
      if (firebase.firestore) {
        firebaseDb = firebase.firestore();
      }
      
      // Handle Redirect Sign-In results on page load
      firebaseAuth.getRedirectResult().then((result) => {
        if (result && result.user) {
          if (window.showCustomToast) window.showCustomToast(`Welcome, ${result.user.displayName || 'User'}!`, 'success');
        }
      }).catch((err) => {
        console.error('Redirect sign-in error:', err);
        if (window.showCustomAlert && err.message) {
          window.showCustomAlert(err.message, 'Sign-In Error', 'error');
        }
      });
      
      firebaseAuth.onAuthStateChanged((user) => {
        if (user) {
          toggleAuthGate(false);
          if (btnOpenAuthModal) btnOpenAuthModal.classList.add('hidden');
          if (userProfileMenu) userProfileMenu.classList.remove('hidden');
          if (userName) userName.textContent = user.displayName || (user.email ? user.email.split('@')[0] : 'User');
          if (userAvatar) userAvatar.src = user.photoURL || 'https://lh3.googleusercontent.com/a/default-user';
          
          // Mobile Sync
          if (mobileUserProfileMenu) {
            mobileUserProfileMenu.classList.remove('hidden');
            mobileUserProfileMenu.style.display = 'flex';
          }
          if (mobileUserName) mobileUserName.textContent = user.displayName || (user.email ? user.email.split('@')[0] : 'User');
          if (mobileUserEmail) mobileUserEmail.textContent = user.email || '';
          if (mobileUserAvatar) mobileUserAvatar.src = user.photoURL || 'https://lh3.googleusercontent.com/a/default-user';

          if (typeof window.unsubscribeUserSub === 'function') {
            window.unsubscribeUserSub();
            window.unsubscribeUserSub = null;
          }

          if (firebaseDb) {
            try {
              window.unsubscribeUserSub = firebaseDb.collection('users').doc(user.uid).onSnapshot(docSnap => {
                if (docSnap && docSnap.exists) {
                  const data = docSnap.data();
                  if (data && data.subscription) {
                    const freshLogs = getUserLogs();
                    const targetEmail = (user.email || '').toLowerCase();
                    let updated = false;

                    freshLogs.forEach(u => {
                      if (u && (u.uid === user.uid || (u.email && targetEmail && u.email.toLowerCase() === targetEmail))) {
                        if (u.subscription !== data.subscription || u.subscriptionExpiry !== data.subscriptionExpiry) {
                          u.subscription = data.subscription;
                          u.subscriptionExpiry = data.subscriptionExpiry || null;
                          updated = true;
                        }
                      }
                    });

                    if (updated) {
                      saveUserLogs(freshLogs);
                      if (typeof window.updateUserSubscriptionUI === 'function') {
                        window.updateUserSubscriptionUI();
                      }
                    }
                  }
                }
              }, err => {
                console.warn('[Realtime Subscription Listener Error]:', err);
              });
            } catch (e) {
              console.warn('[Realtime Sub Listener Exception]:', e);
            }
          }

          closeAuthModal();
          trackUserActivity(user);
          checkAdminAccess(user);
          renderAdminUserLogs();
          if (typeof window.updateUserSubscriptionUI === 'function') {
            window.updateUserSubscriptionUI();
          }
          const currentPath = window.location.pathname;
          if (!currentPath || currentPath === '/' || currentPath === '/index.html') {
            navigateTo('/dashboard');
          }
          if (window.evaluatePageNoticeBanner) {
            window.evaluatePageNoticeBanner();
          }
        } else {
          toggleAuthGate(true);
          if (btnOpenAuthModal) btnOpenAuthModal.classList.remove('hidden');
          if (userProfileMenu) userProfileMenu.classList.add('hidden');
          
          // Mobile Sync
          if (mobileUserProfileMenu) {
            mobileUserProfileMenu.classList.add('hidden');
            mobileUserProfileMenu.style.display = 'none';
          }

          openAuthModal();
          checkAdminAccess(null);
          renderAdminUserLogs();
        }

        // Remove app loader overlay once auth state resolves
        if (typeof window.removeAppInitLoader === 'function') {
          window.removeAppInitLoader();
        }
      });
    } catch (err) {
      console.error('[Firebase Auth Initialization Error]: Running in demo mode fallback.', err.stack || err.message || err);
      if (window.showCustomToast) {
        window.showCustomToast(`Firebase failed to load: ${err.message || 'Check connection'}`, 'error');
      }
      toggleAuthGate(true);
      openAuthModal();

      // Force loader removal in demo/fallback mode
      if (typeof window.removeAppInitLoader === 'function') {
        window.removeAppInitLoader();
      }
    }
  }

  window.enterStudioQuickAccess = function() {
    toggleAuthGate(false);
    if (btnOpenAuthModal) btnOpenAuthModal.classList.add('hidden');
    if (userProfileMenu) userProfileMenu.classList.remove('hidden');
    if (userName && userName.textContent === 'User') userName.textContent = 'Google User';
    closeAuthModal();
    if (typeof window.removeAppInitLoader === 'function') window.removeAppInitLoader();
    if (window.evaluatePageNoticeBanner) {
      window.evaluatePageNoticeBanner();
    }
  };

  const handleGoogleSignInClick = async () => {
    const btn = document.getElementById('btnGoogleSignIn');
    let origHtml = '';
    if (btn) {
      origHtml = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = `<span style="display: inline-block; animation: spin 1s linear infinite; margin-right: 6px;">⏳</span> Connecting...`;
    }

    const resetBtn = () => {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = origHtml;
      }
    };

    if (firebaseAuth && window.firebase) {
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      try {
        console.log('[Google Auth]: Attempting signInWithPopup...');
        await firebaseAuth.signInWithPopup(provider);
        resetBtn();
      } catch (err) {
        console.error('[Google Popup Failed]:', err.code || err.message || err);
        
        const isPopupBlocked = err.code === 'auth/popup-blocked' || 
                               err.code === 'auth/cancelled-popup-request' ||
                               (err.message && err.message.toLowerCase().includes('popup'));

        if (isPopupBlocked) {
          if (window.showCustomToast) {
            window.showCustomToast('Popup blocked by browser. Trying redirect instead...', 'warning');
          }
          try {
            console.log('[Google Auth]: Attempting signInWithRedirect...');
            await firebaseAuth.signInWithRedirect(provider);
          } catch (redirectErr) {
            console.error('[Google Redirect Failed]:', redirectErr.code || redirectErr.message || redirectErr);
            resetBtn();
            const errorMsg = redirectErr.message || String(redirectErr);
            if (window.showCustomConfirm) {
              window.showCustomConfirm(
                `We couldn't connect to Google/Firebase:\n${errorMsg}\n\nWould you like to bypass this and enter the studio in Offline/Demo Mode?`,
                'Firebase Connection Notice',
                'Enter Offline',
                'Retry',
                () => {
                  window.enterStudioQuickAccess();
                  if (window.showCustomToast) window.showCustomToast('Entered in Offline/Demo Mode', 'success');
                },
                () => {
                  handleGoogleSignInClick();
                }
              );
            } else if (window.showCustomAlert) {
              window.showCustomAlert(errorMsg, 'Sign-In Error', 'error');
            } else {
              alert(`Google Sign-In failed:\n${errorMsg}`);
            }
          }
        } else {
          resetBtn();
          if (err.code !== 'auth/popup-closed-by-user') {
            const errorMsg = err.message || String(err);
            if (window.showCustomAlert) {
              window.showCustomAlert(`Sign-In failed: ${errorMsg}`, 'Google Auth Error', 'error');
            } else {
              alert(`Google Sign-In failed:\n${errorMsg}`);
            }
          }
        }
      }
    } else {
      resetBtn();
      // local demo/fallback mode if offline or Firebase fails to initialize
      window.enterStudioQuickAccess();
      if (window.showCustomToast) window.showCustomToast('Signed in (Demo Mode)', 'success');
    }
  };

  if (btnGoogleSignIn) {
    btnGoogleSignIn.addEventListener('click', handleGoogleSignInClick);
  }

  window.triggerGoogleSignIn = function() {
    handleGoogleSignInClick();
  };

  if (authEmailForm) {
    authEmailForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = authEmail ? authEmail.value.trim() : '';
      const password = authPassword ? authPassword.value : '';
      
      if (!email || !password) return;

      if (firebaseAuth && window.firebase) {
        try {
          if (isSignUpMode) {
            const res = await firebaseAuth.createUserWithEmailAndPassword(email, password);
            if (window.showCustomToast) window.showCustomToast(`Account created for ${res.user.email}!`, 'success');
          } else {
            const res = await firebaseAuth.signInWithEmailAndPassword(email, password);
            if (window.showCustomToast) window.showCustomToast(`Welcome back, ${res.user.email.split('@')[0]}!`, 'success');
          }
          closeAuthModal();
        } catch (err) {
          console.error('Auth Error:', err);
          let errMsg = err.message || 'Authentication failed.';
          if (err.code === 'auth/weak-password') {
            errMsg = 'Password is too weak. Please use at least 6 characters.';
          } else if (err.code === 'auth/email-already-in-use') {
            errMsg = 'This email is already registered. Please click Sign In instead.';
          } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
            errMsg = 'Invalid email or password. Please check your credentials or click Create Account.';
          }
          if (window.showCustomAlert) {
            window.showCustomAlert(errMsg, 'Authentication Error', 'error');
          }
        }
      } else {
        toggleAuthGate(false);
        if (btnOpenAuthModal) btnOpenAuthModal.classList.add('hidden');
        if (userProfileMenu) userProfileMenu.classList.remove('hidden');
        if (userName) userName.textContent = email.split('@')[0];
        closeAuthModal();
        if (window.showCustomToast) window.showCustomToast(`Welcome, ${email.split('@')[0]}!`, 'success');
      }
    });
  }

  // ===== Admin Panel & PIN Security Controller =====
  const ADMIN_EMAIL = 'mdratulislamhridoy@gmail.com';
  const ADMIN_PIN = '6342';

  const adminNavBtn = document.getElementById('adminNavBtn');
  const adminPinModal = document.getElementById('adminPinModal');
  const adminPinForm = document.getElementById('adminPinForm');
  const adminPinInput = document.getElementById('adminPinInput');
  const btnCancelAdminPin = document.getElementById('btnCancelAdminPin');
  const adminPanelView = document.getElementById('adminPanelView');
  const btnExitAdminPanel = document.getElementById('btnExitAdminPanel');

  const btnAdminClearCache = document.getElementById('btnAdminClearCache');
  const btnAdminResetState = document.getElementById('btnAdminResetState');
  const btnAdminExportLogs = document.getElementById('btnAdminExportLogs');

  let firestoreCleanupDone = false;
  async function performAutoCleanup() {
    if (firestoreCleanupDone || !firebaseDb) return;
    firestoreCleanupDone = true;
    try {
      fetch(resolveApiUrl('/api/users/clear-test'), { method: 'POST' }).catch(() => {});
      const logs = getUserLogs().filter(u => !String(u.uid || '').startsWith('user_test_') && !String(u.email || '').includes('@gravitylab.ai'));
      saveUserLogs(logs);

      const snapshot = await firebaseDb.collection('users').get();
      const batch = firebaseDb.batch();
      let count = 0;
      snapshot.forEach(doc => {
        const data = doc.data() || {};
        const email = String(data.email || '').toLowerCase();
        const uid = String(doc.id || '').toLowerCase();
        if (uid.startsWith('user_test_') || email.includes('@gravitylab.ai')) {
          batch.delete(doc.ref);
          count++;
        }
      });
      if (count > 0) {
        await batch.commit();
        console.log(`[Auto Cleanup] Successfully deleted ${count} test/bot users.`);
        renderAdminUserLogs();
      }
    } catch (e) {
      console.log('[Auto Cleanup]: Skipping direct Firestore deletion (Rules Locked).');
    }
  }

  function isAdminUser(user) {
    if (!user || !user.email) return false;
    return user.email.toLowerCase().trim() === ADMIN_EMAIL;
  }

  function checkAdminAccess(user) {
    if (isAdminUser(user)) {
      if (adminNavBtn) adminNavBtn.classList.remove('hidden');
      performAutoCleanup();
      if (typeof window.refreshAdminPayments === 'function') {
        window.refreshAdminPayments();
      }
    } else {
      if (adminNavBtn) adminNavBtn.classList.add('hidden');
      if (adminPanelView && !adminPanelView.classList.contains('hidden')) {
        const dashNav = document.querySelector('.nav-item[data-nav="dashboard"]');
        if (dashNav) dashNav.click();
      }
    }
  }

  function getDhakaDateString() {
    try {
      return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka' }).format(new Date());
    } catch (e) {
      return new Date().toISOString().split('T')[0];
    }
  }

  // ===== Subscription & Daily Credits controller =====
  window.updateUserSubscriptionUI = function() {
    try {
      const badge = document.getElementById('userSubscriptionBadge');
      const mobileBadge = document.getElementById('mobileSubscriptionBadge');
      const modal = document.getElementById('subscriptionStatusModal');
      const isDark = document.documentElement.classList.contains('dark-mode');

      const onBadgeClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof window.openSubStatusModal === 'function') {
          window.openSubStatusModal();
        }
      };

      if (badge && !badge.dataset.hasModalListener) {
        badge.addEventListener('click', onBadgeClick);
        badge.dataset.hasModalListener = 'true';
      }
      if (mobileBadge && !mobileBadge.dataset.hasModalListener) {
        mobileBadge.addEventListener('click', onBadgeClick);
        mobileBadge.dataset.hasModalListener = 'true';
      }

      if (!firebaseAuth || !firebaseAuth.currentUser) {
        if (badge) badge.classList.add('hidden');
        if (mobileBadge) mobileBadge.classList.add('hidden');
        return;
      }

      const user = firebaseAuth.currentUser;
      const logs = getUserLogs() || [];
      const u = logs.find(item => item && (item.uid === user.uid || (item.email && user.email && item.email.toLowerCase() === user.email.toLowerCase())));

      if (!u) {
        if (badge) badge.classList.add('hidden');
        if (mobileBadge) mobileBadge.classList.add('hidden');
        return;
      }

      const sub = u.subscription || 'free';
      const expiry = u.subscriptionExpiry;

      // Safe date parser helper
      const parseDateSafe = (val) => {
        if (!val) return null;
        if (typeof val === 'object') {
          if (typeof val.toDate === 'function') return val.toDate();
          if (val.seconds !== undefined) return new Date(val.seconds * 1000);
          if (val._seconds !== undefined) return new Date(val._seconds * 1000);
        }
        if (typeof val === 'string' && val.includes('/')) {
          const parts = val.split('/');
          if (parts.length === 3) {
            const d = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10) - 1;
            const y = parseInt(parts[2], 10);
            if (!isNaN(d) && !isNaN(m) && !isNaN(y)) return new Date(y, m, d);
          }
        }
        const dt = new Date(val);
        return isNaN(dt.getTime()) ? null : dt;
      };

      // Check if Pro subscription is active & not expired
      let isPro = false;
      if (sub === 'monthly' || sub === 'six_months' || sub === 'premium' || sub === 'professional') {
        if (!expiry) {
          isPro = true;
        } else {
          const expDate = parseDateSafe(expiry);
          if (expDate && expDate > new Date()) {
            isPro = true;
          } else if (!expDate) {
            isPro = true;
          }
        }
      }

      // Update Badges
      if (badge || mobileBadge) {
        if (badge) badge.classList.remove('hidden');
        if (mobileBadge) mobileBadge.classList.remove('hidden');
        
        if (isPro) {
          const planName = sub === 'monthly' ? 'Monthly Pro' : '6-Months Pro';
          if (badge) {
            badge.innerHTML = `⭐ <span>${planName}</span>`;
            if (isDark) {
              badge.style.color = '#fbbf24'; // Premium Gold
              badge.style.background = 'rgba(251,191,36,0.15)';
              badge.style.borderColor = 'rgba(251,191,36,0.3)';
            } else {
              badge.style.color = '#b45309'; // Premium Amber/Brown
              badge.style.background = 'rgba(217,119,6,0.08)';
              badge.style.borderColor = 'rgba(217,119,6,0.2)';
            }
          }
          if (mobileBadge) {
            mobileBadge.innerHTML = `⭐ <span>${planName}</span>`;
            if (isDark) {
              mobileBadge.style.color = '#fbbf24'; // Premium Gold
              mobileBadge.style.background = 'rgba(251,191,36,0.15)';
              mobileBadge.style.borderColor = 'rgba(251,191,36,0.3)';
            } else {
              mobileBadge.style.color = '#b45309'; // Premium Amber/Brown
              mobileBadge.style.background = 'rgba(217,119,6,0.08)';
              mobileBadge.style.borderColor = 'rgba(217,119,6,0.2)';
            }
          }
        } else {
          // Free User
          const todayStr = getDhakaDateString();
          if (!u.creditsDaily) {
            u.creditsDaily = { remaining: 15, lastResetDate: todayStr };
          }
          const cd = u.creditsDaily;
          let needsSave = false;
          if (cd.lastResetDate !== todayStr) {
            cd.remaining = 15;
            cd.lastResetDate = todayStr;
            needsSave = true;
          } else if (typeof cd.remaining === 'number' && cd.remaining > 15) {
            cd.remaining = 15;
            needsSave = true;
          }
          if (needsSave) {
            saveUserLogs(logs);
            syncCreditsToDatabase(user.uid, cd.remaining, cd.lastResetDate);
          }
          
          if (badge) {
            badge.innerHTML = `🌱 <span>Free</span> • <span>${cd.remaining}/15 Credits</span>`;
            if (isDark) {
              badge.style.color = '#cdfc52'; // Premium Lime Green
              badge.style.background = 'rgba(205,252,82,0.15)';
              badge.style.borderColor = 'rgba(205,252,82,0.3)';
            } else {
              badge.style.color = '#15803d'; // High Contrast Dark Green
              badge.style.background = 'rgba(22,163,74,0.08)';
              badge.style.borderColor = 'rgba(22,163,74,0.2)';
            }
          }
          if (mobileBadge) {
            mobileBadge.innerHTML = `🌱 <span>Free • ${cd.remaining}/15 Credits</span>`;
            if (isDark) {
              mobileBadge.style.color = '#cdfc52'; // Premium Lime Green
              mobileBadge.style.background = 'rgba(205,252,82,0.15)';
              mobileBadge.style.borderColor = 'rgba(205,252,82,0.3)';
            } else {
              mobileBadge.style.color = '#15803d'; // High Contrast Dark Green
              mobileBadge.style.background = 'rgba(22,163,74,0.08)';
              mobileBadge.style.borderColor = 'rgba(22,163,74,0.2)';
            }
          }
        }
      }

    // 2. Update Modal Elements if modal exists
    if (modal) {
      const tierBadge = document.getElementById('subModalTierBadge');
      const titleText = modal.querySelector('h3');
      const iconWrapper = modal.querySelector('div[style*="font-size: 32px"]');
      const creditsCount = document.getElementById('subModalCreditsCount');
      const creditsSub = document.getElementById('subModalCreditsSub');
      const progressBar = document.getElementById('subModalProgressBar');
      const planName = document.getElementById('subModalPlanName');
      const statusText = document.getElementById('subModalStatusText');

      if (isPro) {
        if (tierBadge) {
          tierBadge.textContent = 'Account Tier: Premium';
          if (isDark) {
            tierBadge.style.color = '#fbbf24';
            tierBadge.style.background = 'rgba(251, 191, 36, 0.15)';
            tierBadge.style.borderColor = 'rgba(251, 191, 36, 0.25)';
          } else {
            tierBadge.style.color = '#b45309'; // Premium Amber/Brown
            tierBadge.style.background = 'rgba(217, 119, 6, 0.08)';
            tierBadge.style.borderColor = 'rgba(217, 119, 6, 0.2)';
          }
        }
        if (titleText) titleText.textContent = 'Your Premium Status';
        if (iconWrapper) {
          iconWrapper.innerHTML = '⭐';
          if (isDark) {
            iconWrapper.style.color = '#fbbf24';
            iconWrapper.style.background = 'rgba(251, 191, 36, 0.08)';
            iconWrapper.style.borderColor = 'rgba(251, 191, 36, 0.25)';
            iconWrapper.style.boxShadow = '0 0 25px rgba(251, 191, 36, 0.1)';
          } else {
            iconWrapper.style.color = '#b45309';
            iconWrapper.style.background = 'rgba(217, 119, 6, 0.04)';
            iconWrapper.style.borderColor = 'rgba(217, 119, 6, 0.15)';
            iconWrapper.style.boxShadow = '0 0 25px rgba(217, 119, 6, 0.05)';
          }
        }
        if (creditsCount) creditsCount.textContent = 'Unlimited';
        if (creditsSub) {
          creditsSub.textContent = 'Unlimited Active';
          creditsSub.style.color = '#10b981';
        }
        if (progressBar) {
          progressBar.style.width = '100%';
          progressBar.style.background = 'linear-gradient(90deg, #cdfc52 0%, #10b981 100%)';
        }
        if (planName) planName.textContent = sub === 'monthly' ? 'Monthly Pro' : '6-Months Pro';
        
        if (expiry) {
          const expDate = new Date(expiry);
          const diffTime = Math.abs(expDate - new Date());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (statusText) {
            statusText.textContent = `${diffDays} Day${diffDays > 1 ? 's' : ''} Left`;
            statusText.style.color = '#10b981';
          }
        } else {
          if (statusText) {
            statusText.textContent = 'Active (No Expiry)';
            statusText.style.color = '#10b981';
          }
        }
      } else {
        // Free user
        if (tierBadge) {
          tierBadge.textContent = 'Account Tier: Free';
          if (isDark) {
            tierBadge.style.color = '#cdfc52';
            tierBadge.style.background = 'rgba(205, 252, 82, 0.15)';
            tierBadge.style.borderColor = 'rgba(205, 252, 82, 0.25)';
          } else {
            tierBadge.style.color = '#15803d'; // High Contrast Dark Green
            tierBadge.style.background = 'rgba(22, 163, 74, 0.08)';
            tierBadge.style.borderColor = 'rgba(22, 163, 74, 0.2)';
          }
        }
        if (titleText) titleText.textContent = 'Your Plan Status';
        if (iconWrapper) {
          iconWrapper.innerHTML = '🌱';
          if (isDark) {
            iconWrapper.style.color = '#cdfc52';
            iconWrapper.style.background = 'rgba(205, 252, 82, 0.08)';
            iconWrapper.style.borderColor = 'rgba(205, 252, 82, 0.25)';
            iconWrapper.style.boxShadow = '0 0 25px rgba(205, 252, 82, 0.1)';
          } else {
            iconWrapper.style.color = '#15803d';
            iconWrapper.style.background = 'rgba(22, 163, 74, 0.04)';
            iconWrapper.style.borderColor = 'rgba(22, 163, 74, 0.15)';
            iconWrapper.style.boxShadow = '0 0 25px rgba(22, 163, 74, 0.05)';
          }
        }

        const todayStr = getDhakaDateString();
        if (!u.creditsDaily) {
          u.creditsDaily = { remaining: 15, lastResetDate: todayStr };
        }
        const cd = u.creditsDaily;
        if (cd.lastResetDate !== todayStr) {
          cd.remaining = 15;
          cd.lastResetDate = todayStr;
        }

        const remaining = typeof cd.remaining === 'number' ? cd.remaining : 15;
        if (creditsCount) creditsCount.textContent = `${remaining} / 15`;
        if (creditsSub) {
          creditsSub.textContent = 'Credits Remaining';
          creditsSub.style.color = 'var(--on-variant)';
        }

        if (progressBar) {
          const percentage = Math.max(0, Math.min(100, (remaining / 15) * 100));
          progressBar.style.width = `${percentage}%`;
          progressBar.style.background = remaining < 3 ? '#ef4444' : 'linear-gradient(90deg, #cdfc52 0%, #10b981 100%)';
        }
        if (planName) planName.textContent = 'Free Tier';
        if (statusText) {
          statusText.textContent = 'Life Time';
          statusText.style.color = 'var(--on-variant)';
        }
      }
    }
    } catch (err) {
      console.error('[updateUserSubscriptionUI Error]:', err);
    }
  };

  window.openSubStatusModal = function() {
    try {
      window.updateUserSubscriptionUI();
    } catch (e) {
      console.error('[openSubStatusModal failed to update UI]:', e);
    }
    const modal = document.getElementById('subscriptionStatusModal');
    if (!modal) return;

    const user = firebaseAuth ? firebaseAuth.currentUser : null;
    if (!user) {
      if (window.showCustomToast) window.showCustomToast('Please sign in to view subscription status.', 'warning');
      return;
    }

    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  };

  window.closeSubStatusModal = function() {
    const modal = document.getElementById('subscriptionStatusModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
  };

  window.syncSubscriptionStatus = async function(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const syncLink = e.currentTarget || e.target;
    if (syncLink) {
      syncLink.style.pointerEvents = 'none';
      syncLink.innerHTML = '⚡ Synchronizing...';
    }
    
    if (window.showCustomToast) {
      window.showCustomToast('Syncing user subscription data with database...', 'info');
    }

    if (firebaseAuth && firebaseAuth.currentUser) {
      try {
        const user = firebaseAuth.currentUser;
        const providerId = (user.providerData && user.providerData[0] && user.providerData[0].providerId) 
          ? user.providerData[0].providerId 
          : (user.email ? 'google.com' : 'password');
        
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || (user.email ? user.email.split('@')[0] : 'User'),
          photoURL: user.photoURL || 'https://lh3.googleusercontent.com/a/default-user',
          lastActive: new Date().toISOString(),
          provider: providerId,
          status: 'active'
        };

        const res = await fetch(resolveApiUrl('/api/users/track'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData)
        });
        const data = await res.json();
        
        if (data && data.ok && data.user) {
          const freshLogs = getUserLogs();
          const targetIdx = freshLogs.findIndex(u => u.uid === user.uid || (u.email && user.email && u.email.toLowerCase() === user.email.toLowerCase()));
          if (targetIdx >= 0) {
            freshLogs[targetIdx].subscription = data.user.subscription || 'free';
            freshLogs[targetIdx].subscriptionExpiry = data.user.subscriptionExpiry || null;
            if (data.user.creditsDaily) {
              freshLogs[targetIdx].creditsDaily = data.user.creditsDaily;
            }
            saveUserLogs(freshLogs);

            // Parallel sync to Firebase Firestore to keep records aligned globally
            if (firebaseDb) {
              try {
                await firebaseDb.collection('users').doc(user.uid).set({
                  subscription: data.user.subscription || 'free',
                  subscriptionExpiry: data.user.subscriptionExpiry || null
                }, { merge: true });
                console.log('[Firestore Sync]: Successfully synced user plan to Firestore in syncSubscriptionStatus');
              } catch (err) {
                console.warn('[Firestore Sync Error]:', err);
              }
            }
          }
        }
      } catch (err) {
        console.error('Sync error:', err);
      }
    }

    setTimeout(() => {
      window.updateUserSubscriptionUI();
      window.openSubStatusModal();
      if (syncLink) {
        syncLink.style.pointerEvents = 'auto';
        syncLink.innerHTML = '🔄 Sync Account Status';
      }
      if (window.showCustomToast) {
        window.showCustomToast('Account status synchronized successfully!', 'success');
      }
    }, 1200);
  };

  async function syncCreditsToDatabase(uid, remaining, lastResetDate) {
    try {
      fetch(resolveApiUrl('/api/users/update-credits'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, remaining, lastResetDate })
      }).catch(() => {});
    } catch (e) {}

    if (firebaseDb) {
      try {
        await firebaseDb.collection('users').doc(uid).set({
          creditsDaily: { remaining, lastResetDate }
        }, { merge: true });
      } catch (e) {}
    }
  }

  window.checkAndConsumeCredit = async function(metricKey, count = 1, consume = true) {
    if (!firebaseAuth || !firebaseAuth.currentUser) {
      return true;
    }
    const user = firebaseAuth.currentUser;
    if (!user || !user.uid) return true;

    const logs = getUserLogs();
    const existingIndex = logs.findIndex(u => u.uid === user.uid || (u.email && user.email && u.email.toLowerCase() === user.email.toLowerCase()));

    if (existingIndex >= 0) {
      const u = logs[existingIndex];
      const sub = u.subscription || 'free';
      const expiry = u.subscriptionExpiry;

      const parseDateSafe = (val) => {
        if (!val) return null;
        if (typeof val === 'object') {
          if (typeof val.toDate === 'function') return val.toDate();
          if (val.seconds !== undefined) return new Date(val.seconds * 1000);
          if (val._seconds !== undefined) return new Date(val._seconds * 1000);
        }
        if (typeof val === 'string' && val.includes('/')) {
          const parts = val.split('/');
          if (parts.length === 3) {
            const d = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10) - 1;
            const y = parseInt(parts[2], 10);
            if (!isNaN(d) && !isNaN(m) && !isNaN(y)) return new Date(y, m, d);
          }
        }
        const dt = new Date(val);
        return isNaN(dt.getTime()) ? null : dt;
      };

      let isPro = false;
      if (sub === 'monthly' || sub === 'six_months' || sub === 'premium' || sub === 'professional') {
        if (!expiry) {
          isPro = true;
        } else {
          const expDate = parseDateSafe(expiry);
          if (expDate && expDate > new Date()) {
            isPro = true;
          } else if (!expDate) {
            isPro = true;
          }
        }
      }

      if (isPro) {
        return true;
      }

      const todayStr = getDhakaDateString();
      if (!u.creditsDaily) {
        u.creditsDaily = { remaining: 15, lastResetDate: todayStr };
      }

      const cd = u.creditsDaily;
      if (cd.lastResetDate !== todayStr) {
        cd.remaining = 15;
        cd.lastResetDate = todayStr;
      }

      if (cd.remaining < count) {
        if (window.showCustomConfirm) {
          window.showCustomConfirm(
            `দুঃখিত, আজ আপনার ব্যবহারের জন্য বরাদ্দকৃত ফ্রি ক্রেডিট সম্পূর্ণ শেষ হয়ে গেছে! কোনো লিমিট ছাড়াই সব প্রিমিয়াম ফিচার আনলিমিটেড ব্যবহার করতে আমাদের একটি সাবস্ক্রিপশন প্ল্যান বেছে নিন।`,
            'দৈনিক লিমিট শেষ!',
            'প্ল্যান দেখুন 👑',
            'পরে করব',
            () => {
              window.navigateTo('/pricing');
            }
          );
        } else if (window.showCustomAlert) {
          window.showCustomAlert(
            `You need ${count} credit(s) to perform this action, but you only have ${cd.remaining} credit(s) remaining for today. Please upgrade your subscription to Pro for unlimited access!`,
            'Daily Credit Limit Reached',
            'warning'
          );
        } else {
          alert(`You need ${count} credit(s) to perform this action, but you only have ${cd.remaining} credit(s) remaining for today. Please upgrade your subscription to Pro for unlimited access!`);
        }
        return false;
      }

      if (consume) {
        cd.remaining -= count;
        saveUserLogs(logs);
        window.updateUserSubscriptionUI();
        syncCreditsToDatabase(user.uid, cd.remaining, cd.lastResetDate);
      }
      return true;
    }

    return true;
  };

  window.updateUserPlan = async function(uid, email, plan, expiry) {
    const logs = getUserLogs();
    const targetEmail = (email || '').toLowerCase();
    logs.forEach(u => {
      if (u && ((uid && u.uid === uid) || (u.email && targetEmail && u.email.toLowerCase() === targetEmail))) {
        u.subscription = plan;
        u.subscriptionExpiry = expiry;
      }
    });
    saveUserLogs(logs);

    if (window.latestSources) {
      ['mongo', 'firestore', 'local'].forEach(src => {
        if (Array.isArray(window.latestSources[src])) {
          window.latestSources[src].forEach(u => {
            if (u && ((uid && u.uid === uid) || (u.email && targetEmail && u.email.toLowerCase() === targetEmail))) {
              u.subscription = plan;
              u.subscriptionExpiry = expiry;
            }
          });
        }
      });
    }

    const curr = (firebaseAuth && firebaseAuth.currentUser) ? firebaseAuth.currentUser : null;
    if (curr && (uid === curr.uid || (email && curr.email && email.toLowerCase() === curr.email.toLowerCase()))) {
      window.updateUserSubscriptionUI();
    }

    let mongoOk = false;
    try {
      const res = await fetch(resolveApiUrl('/api/users/update-plan'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, email, plan, expiry })
      });
      const data = await res.json();
      mongoOk = data && data.ok;
    } catch (e) {
      console.warn('[MongoDB Plan Sync Error]:', e);
    }

    let firebaseOk = false;
    if (firebaseDb) {
      try {
        const uidsToUpdate = new Set();
        if (uid) uidsToUpdate.add(uid);
        if (window.latestSources) {
          ['mongo', 'firestore', 'local'].forEach(src => {
            if (Array.isArray(window.latestSources[src])) {
              window.latestSources[src].forEach(u => {
                if (u && ((uid && u.uid === uid) || (u.email && targetEmail && u.email.toLowerCase() === targetEmail))) {
                  if (u.uid) uidsToUpdate.add(u.uid);
                }
              });
            }
          });
        }
        for (const targetUid of uidsToUpdate) {
          await firebaseDb.collection('users').doc(targetUid).set({
            subscription: plan,
            subscriptionExpiry: expiry
          }, { merge: true }).catch(err => console.warn('[Firestore Sync Item Error]:', err));
        }
        firebaseOk = true;
      } catch (e) {
        console.warn('[Firestore Plan Sync Error]:', e);
      }
    }

    if (typeof renderAdminUserLogs === 'function') {
      renderAdminUserLogs();
    }
    return mongoOk || firebaseOk;
  };

  // ===== Admin User Activity Tracker =====
  window.trackUserMetric = function(metricKey, incrementVal = 1) {
    if (!firebaseAuth || !firebaseAuth.currentUser) return;
    const user = firebaseAuth.currentUser;
    if (!user || !user.uid) return;

    const todayStr = new Date().toISOString().split('T')[0];

    const logs = getUserLogs();
    const existingIndex = logs.findIndex(u => u.uid === user.uid || (u.email && user.email && u.email.toLowerCase() === user.email.toLowerCase()));
    
    // Determine the value to set/increment
    const apiKeysCount = (metricKey === 'apiKeys') ? getApiKeys().length : 0;

    if (existingIndex >= 0) {
      if (!logs[existingIndex].metrics) logs[existingIndex].metrics = {};
      if (!logs[existingIndex].metrics[metricKey]) {
        logs[existingIndex].metrics[metricKey] = { total: 0, today: 0, lastDate: todayStr };
      }
      const m = logs[existingIndex].metrics[metricKey];
      if (m.lastDate !== todayStr) {
        m.today = 0;
        m.lastDate = todayStr;
      }
      if (metricKey === 'apiKeys') {
        m.total = apiKeysCount;
        m.today = apiKeysCount;
      } else {
        m.total = (m.total || 0) + incrementVal;
        m.today = (m.today || 0) + incrementVal;
      }
      saveUserLogs(logs);

      // Sync metric update to MongoDB backend
      const userObj = logs[existingIndex];
      const providerId = (user.providerData && user.providerData[0] && user.providerData[0].providerId) 
        ? user.providerData[0].providerId 
        : (user.email ? 'google.com' : 'password');

      const syncData = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || (user.email ? user.email.split('@')[0] : 'User'),
        photoURL: user.photoURL || 'https://lh3.googleusercontent.com/a/default-user',
        provider: providerId,
        status: 'active',
        metrics: userObj.metrics
      };

      try {
        fetch(resolveApiUrl('/api/users/track'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(syncData)
        }).catch(err => console.warn('[MongoDB Track Metric Error]:', err));
      } catch (e) {}
    }

    if (firebaseDb) {
      (async () => {
        try {
          const userRef = firebaseDb.collection('users').doc(user.uid);
          const docSnap = await userRef.get();
          const docData = docSnap.exists ? docSnap.data() : {};
          const metrics = docData.metrics || {};
          
          if (!metrics.apiKeys) metrics.apiKeys = { total: 0, today: 0, lastDate: todayStr };
          if (!metrics.prompts) metrics.prompts = { total: 0, today: 0, lastDate: todayStr };
          if (!metrics.iconSheets) metrics.iconSheets = { total: 0, today: 0, lastDate: todayStr };
          if (!metrics.presentations) metrics.presentations = { total: 0, today: 0, lastDate: todayStr };
          if (!metrics.flowImages) metrics.flowImages = { total: 0, today: 0, lastDate: todayStr };

          // Reset daily count if date has changed
          const allKeys = ['apiKeys', 'prompts', 'iconSheets', 'presentations', 'flowImages'];
          allKeys.forEach(k => {
            if (metrics[k].lastDate !== todayStr) {
              metrics[k].today = 0;
              metrics[k].lastDate = todayStr;
            }
          });

          // Perform in-memory increment/update
          if (metricKey === 'apiKeys') {
            metrics.apiKeys.total = apiKeysCount;
            metrics.apiKeys.today = apiKeysCount;
            metrics.apiKeys.lastDate = todayStr;
          } else if (metrics[metricKey]) {
            metrics[metricKey].total = (metrics[metricKey].total || 0) + incrementVal;
            metrics[metricKey].today = (metrics[metricKey].today || 0) + incrementVal;
            metrics[metricKey].lastDate = todayStr;
          }

          // Single write to Firestore
          await userRef.set({
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || (user.email ? user.email.split('@')[0] : 'User'),
            photoURL: user.photoURL || 'https://lh3.googleusercontent.com/a/default-user',
            status: 'active',
            lastActive: firebase.firestore.FieldValue.serverTimestamp(),
            metrics: metrics
          }, { merge: true });
        } catch (err) {
          console.warn('[Firestore Metric Error]:', err);
        }
      })();
    }
  };

  function getUserLogs() {
    try {
      const parsed = JSON.parse(localStorage.getItem('gravity_user_activity_logs') || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function saveUserLogs(logs) {
    try {
      localStorage.setItem('gravity_user_activity_logs', JSON.stringify(logs));
      if (typeof latestSources !== 'undefined') {
        latestSources.local = logs;
      }
    } catch (e) {}
  }

  function trackUserActivity(user) {
    if (!user || !user.uid) return;
    const logs = getUserLogs();
    const userEmail = (user.email || '').toLowerCase();
    const userUid = user.uid;
    const now = new Date().toISOString();
    let existingIndex = logs.findIndex(u => u.uid === userUid || (u.email && userEmail && u.email.toLowerCase() === userEmail));

    const providerId = (user.providerData && user.providerData[0] && user.providerData[0].providerId) 
      ? user.providerData[0].providerId 
      : (user.email ? 'google.com' : 'password');

    // Scan real local API keys count using getApiKeys helper
    const apiKeysCount = getApiKeys().length;

    const prevSub = existingIndex >= 0 ? logs[existingIndex].subscription : null;
    const prevExp = existingIndex >= 0 ? logs[existingIndex].subscriptionExpiry : null;
    const isPrevPro = (prevSub === 'monthly' || prevSub === 'six_months' || prevSub === 'premium' || prevSub === 'professional');

    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || userEmail.split('@')[0],
      photoURL: user.photoURL || 'https://lh3.googleusercontent.com/a/default-user',
      lastActive: now,
      provider: providerId,
      status: 'active',
      subscription: isPrevPro ? prevSub : 'free',
      subscriptionExpiry: isPrevPro ? prevExp : null,
      creditsDaily: existingIndex >= 0 ? (logs[existingIndex].creditsDaily || { remaining: 30, lastResetDate: now.split('T')[0] }) : { remaining: 30, lastResetDate: now.split('T')[0] },
      metrics: existingIndex >= 0 ? (logs[existingIndex].metrics || {}) : {}
    };

    if (!userData.metrics) userData.metrics = {};
    if (!userData.metrics.apiKeys) {
      userData.metrics.apiKeys = { total: 0, today: 0, lastDate: new Date().toISOString().split('T')[0] };
    }
    userData.metrics.apiKeys.total = apiKeysCount;

    if (existingIndex >= 0) {
      logs[existingIndex].lastActive = now;
      logs[existingIndex].displayName = userData.displayName;
      logs[existingIndex].photoURL = userData.photoURL;
      logs[existingIndex].status = 'active';
      logs[existingIndex].provider = providerId;
      if (isPrevPro) {
        logs[existingIndex].subscription = prevSub;
        logs[existingIndex].subscriptionExpiry = prevExp;
      }
      logs[existingIndex].creditsDaily = userData.creditsDaily;
      logs[existingIndex].metrics = userData.metrics;
    } else {
      userData.firstLogin = now;
      logs.unshift(userData);
    }

    saveUserLogs(logs);

    // Sync to MongoDB Backend Storage
    try {
      fetch(resolveApiUrl('/api/users/track'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })
      .then(res => res.json())
      .then(data => {
        if (data && data.ok && data.user) {
          const freshLogs = getUserLogs();
          const targetEmail = (user.email || '').toLowerCase();
          let matched = false;
          freshLogs.forEach(u => {
            if (u && (u.uid === user.uid || (u.email && targetEmail && u.email.toLowerCase() === targetEmail))) {
              u.subscription = data.user.subscription || 'free';
              u.subscriptionExpiry = data.user.subscriptionExpiry || null;
              if (data.user.creditsDaily) {
                u.creditsDaily = data.user.creditsDaily;
              }
              matched = true;
            }
          });

          if (!matched) {
            freshLogs.unshift({
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || (user.email ? user.email.split('@')[0] : 'User'),
              photoURL: user.photoURL || 'https://lh3.googleusercontent.com/a/default-user',
              provider: providerId,
              status: 'active',
              lastActive: now,
              firstLogin: data.user.firstLogin || now,
              subscription: data.user.subscription || 'free',
              subscriptionExpiry: data.user.subscriptionExpiry || null,
              creditsDaily: data.user.creditsDaily || { remaining: 30, lastResetDate: now.split('T')[0] },
              metrics: data.user.metrics || {}
            });
          }

          saveUserLogs(freshLogs);
          if (typeof window.updateUserSubscriptionUI === 'function') {
            window.updateUserSubscriptionUI();
          }

          if (firebaseDb) {
            firebaseDb.collection('users').doc(user.uid).set({
              subscription: data.user.subscription || 'free',
              subscriptionExpiry: data.user.subscriptionExpiry || null
            }, { merge: true }).catch(err => console.warn('[Firestore Sync Error in trackUserActivity]:', err));
          }
        }
      })
      .catch(err => console.warn('[MongoDB Track Fetch Error]:', err));
    } catch (e) {}

    if (firebaseDb) {
      (async () => {
        try {
          const userRef = firebaseDb.collection('users').doc(user.uid);
          const docSnap = await userRef.get();
          const docData = docSnap.exists ? docSnap.data() : {};
          // Pull live sub and credits from Firestore database to sync to local storage immediately is removed
          // Subscriptions are managed exclusively by MongoDB backend APIs for security and state authority
          const freshLogs = getUserLogs();
          const targetIdx = freshLogs.findIndex(u => u.uid === user.uid || (u.email && user.email && u.email.toLowerCase() === user.email.toLowerCase()));
          if (targetIdx >= 0 && !freshLogs[targetIdx].subscription) {
            // Initialize defaults if not present
            freshLogs[targetIdx].subscription = 'free';
            freshLogs[targetIdx].subscriptionExpiry = null;
            saveUserLogs(freshLogs);
            window.updateUserSubscriptionUI();
          }

          const metrics = docData.metrics || {};
          
          const todayStr = new Date().toISOString().split('T')[0];
          if (!metrics.apiKeys) metrics.apiKeys = { total: 0, today: 0, lastDate: todayStr };
          if (!metrics.prompts) metrics.prompts = { total: 0, today: 0, lastDate: todayStr };
          if (!metrics.iconSheets) metrics.iconSheets = { total: 0, today: 0, lastDate: todayStr };
          if (!metrics.presentations) metrics.presentations = { total: 0, today: 0, lastDate: todayStr };
          if (!metrics.flowImages) metrics.flowImages = { total: 0, today: 0, lastDate: todayStr };

          // Reset daily count if date has changed
          const allKeys = ['apiKeys', 'prompts', 'iconSheets', 'presentations', 'flowImages'];
          allKeys.forEach(k => {
            if (metrics[k].lastDate !== todayStr) {
              metrics[k].today = 0;
              metrics[k].lastDate = todayStr;
            }
          });

          // Sync API keys count in metrics object in-memory
          metrics.apiKeys.total = apiKeysCount;
          metrics.apiKeys.today = apiKeysCount;
          metrics.apiKeys.lastDate = todayStr;

          // Single write to Firestore
          await userRef.set({
            uid: user.uid,
            email: user.email || '',
            displayName: userData.displayName,
            photoURL: userData.photoURL,
            lastActive: firebase.firestore.FieldValue.serverTimestamp(),
            provider: providerId,
            status: 'active',
            metrics: metrics
          }, { merge: true });
        } catch (e) {
          console.warn('[Firestore Track Error]:', e);
        }
      })();
    }

    if (typeof renderAdminUserLogs === 'function') {
      renderAdminUserLogs();
    }
  }

  let firestoreUnsubscribe = null;
  window.feedbackUnsubscribe = null;
  window.currentFeedbackList = [];

  function renderAdminUserLogs() {
    const tbody = document.getElementById('adminUserLogsTableBody');
    const statTotalUsers = document.getElementById('statTotalUsers');
    const statActiveUsers = document.getElementById('statActiveUsers');
    const statLoginsToday = document.getElementById('statLoginsToday');

    if (!tbody) return;

    let currentFullUserList = [];

    // --- Chrome Extension Logs Renderer ---
    function renderExtensionLogs(fullList) {
      const tbodyExt = document.getElementById('adminExtensionLogsTableBody');
      const statTotalExtensionInstalls = document.getElementById('statTotalExtensionInstalls');
      const statTotalExtensionUsers = document.getElementById('statTotalExtensionUsers');
      if (!tbodyExt) return;

      const extensionUsers = fullList.filter(u => u.is_extension_user === true || u.is_extension_user === 'true' || u.extension_install_id);

      // Get count of unique extension installs and signed-in extension users
      const uniqueInstalls = new Set();
      let signInsCount = 0;

      extensionUsers.forEach(u => {
        if (u.extension_install_id) {
          uniqueInstalls.add(u.extension_install_id);
        }
        if (u.email && (u.is_extension_user === true || u.is_extension_user === 'true')) {
          signInsCount++;
        }
      });

      if (statTotalExtensionInstalls) statTotalExtensionInstalls.textContent = uniqueInstalls.size;
      if (statTotalExtensionUsers) statTotalExtensionUsers.textContent = signInsCount;

      if (extensionUsers.length === 0) {
        tbodyExt.innerHTML = `
          <tr>
            <td colspan="5" style="padding: 24px; text-align: center; color: var(--on-variant); font-size: 12px;">
              No extension installation/login data synchronized yet.
            </td>
          </tr>
        `;
      } else {
        tbodyExt.innerHTML = extensionUsers.map(u => {
          const displayName = u.displayName || (u.email ? u.email.split('@')[0] : 'User');
          const email = u.email || 'Anonymous Install';
          const photoURL = u.photoURL || 'https://lh3.googleusercontent.com/a/default-user';
          
          const providerBadge = (u.provider && u.provider.includes('google'))
            ? '<span style="background: rgba(66,133,244,0.15); color: #4285f4; border: 1px solid rgba(66,133,244,0.3); padding: 2px 6px; border-radius: 6px; font-weight: 700; font-size: 10px;">🌐 Google</span>'
            : '<span style="background: rgba(92,98,236,0.15); color: #5c62ec; border: 1px solid rgba(92,98,236,0.3); padding: 2px 6px; border-radius: 6px; font-weight: 700; font-size: 10px;">✉️ Email</span>';

          const installId = u.extension_install_id || 'N/A';
          const installStatus = u.email && (u.is_extension_user === true || u.is_extension_user === 'true')
            ? '<span style="background: rgba(163,230,53,0.15); color: #a3e635; border: 1px solid rgba(163,230,53,0.3); padding: 2px 8px; border-radius: 6px; font-weight: 800; font-size: 10px;">SignedIn</span>'
            : '<span style="background: rgba(251,191,36,0.15); color: #fbbf24; border: 1px solid rgba(251,191,36,0.3); padding: 2px 8px; border-radius: 6px; font-weight: 800; font-size: 10px;">Installed</span>';

          let firstLoggedStr = 'N/A';
          if (u.firstLogin) {
            const dt = parseDateHelper(u.firstLogin);
            if (dt) firstLoggedStr = dt.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
          }

          let lastExtensionStr = 'N/A';
          if (u.last_extension_login_at) {
            const dt = parseDateHelper(u.last_extension_login_at);
            if (dt) lastExtensionStr = dt.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
          }

          return `
            <tr style="border-bottom: 1px solid var(--outline-variant);">
              <td style="padding: 12px 14px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <img src="${photoURL}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 1.5px solid var(--outline);" onerror="this.src='https://lh3.googleusercontent.com/a/default-user'">
                  <div>
                    <div style="font-weight: 700; color: var(--on-surface); display: flex; align-items: center; gap: 6px;">
                      ${displayName}
                      ${providerBadge}
                    </div>
                    <div style="font-size: 10.5px; color: var(--on-variant); font-family: var(--mono); margin-top: 1px;">${email}</div>
                  </div>
                </div>
              </td>
              <td style="padding: 12px 14px; font-family: var(--mono); font-size: 11px; color: var(--on-variant);">${installId}</td>
              <td style="padding: 12px 14px;">${installStatus}</td>
              <td style="padding: 12px 14px; font-size: 11px; color: var(--on-surface);">${firstLoggedStr}</td>
              <td style="padding: 12px 14px; font-size: 11px; color: var(--on-surface); font-weight: 600;">${lastExtensionStr}</td>
            </tr>
          `;
        }).join('');
      }
    }

    const parseDateHelper = (val) => {
      if (!val) return null;
      if (typeof val === 'object') {
        if (typeof val.toDate === 'function') return val.toDate();
        if (val.seconds !== undefined) return new Date(val.seconds * 1000);
        if (val._seconds !== undefined) return new Date(val._seconds * 1000);
      }
      const dt = new Date(val);
      return isNaN(dt.getTime()) ? null : dt;
    };

    function renderList(userList, fullListForStats = null) {
      const statsList = fullListForStats || userList;
      const todayStr = new Date().toISOString().split('T')[0];
      let activeCount = 0;
      let todayCount = 0;

      let globalActiveCount = 0;
      let globalTodayCount = 0;
      statsList.forEach(u => {
        const currUser = (firebaseAuth && firebaseAuth.currentUser) ? firebaseAuth.currentUser : null;
        const isCurrentSessionUser = currUser && (u.uid === currUser.uid || (u.email && currUser.email && u.email.toLowerCase() === currUser.email.toLowerCase()));
        const isOnline = isCurrentSessionUser || u.status === 'active';
        if (isOnline) globalActiveCount++;

        if (u.lastActive) {
          const dt = parseDateHelper(u.lastActive);
          if (dt) {
            if (dt.toISOString().startsWith(todayStr)) globalTodayCount++;
          } else if (isCurrentSessionUser) {
            globalTodayCount++;
          }
        } else if (isCurrentSessionUser) {
          globalTodayCount++;
        }
      });

      const formattedRows = userList.map(u => {
        const currUser = (firebaseAuth && firebaseAuth.currentUser) ? firebaseAuth.currentUser : null;
        const isCurrentSessionUser = currUser && (u.uid === currUser.uid || (u.email && currUser.email && u.email.toLowerCase() === currUser.email.toLowerCase()));

        const displayName = u.displayName || (isCurrentSessionUser ? currUser.displayName || (currUser.email ? currUser.email.split('@')[0] : 'User') : (u.email ? u.email.split('@')[0] : 'User'));
        const email = u.email || (isCurrentSessionUser ? currUser.email : 'N/A');
        const photoURL = u.photoURL || (isCurrentSessionUser ? currUser.photoURL : 'https://lh3.googleusercontent.com/a/default-user') || 'https://lh3.googleusercontent.com/a/default-user';
        const isOnline = isCurrentSessionUser || u.status === 'active';

        if (isOnline) activeCount++;

        let firstDateStr = 'Never';
        if (u.firstLogin) {
          const dt = parseDateHelper(u.firstLogin);
          if (dt) {
            firstDateStr = dt.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
          }
        }

        let lastActiveStr = 'Just Now';
        if (u.lastActive) {
          const dt = parseDateHelper(u.lastActive);
          if (dt) {
            lastActiveStr = dt.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            if (dt.toISOString().startsWith(todayStr)) todayCount++;
          } else if (isCurrentSessionUser) {
            todayCount++;
          }
        } else if (isCurrentSessionUser) {
          todayCount++;
        }

        const providerBadge = (u.provider && u.provider.includes('google'))
          ? '<span style="background: rgba(66,133,244,0.15); color: #4285f4; border: 1px solid rgba(66,133,244,0.3); padding: 2px 6px; border-radius: 6px; font-weight: 700; font-size: 10px;">🌐 Google</span>'
          : '<span style="background: rgba(92,98,236,0.15); color: #5c62ec; border: 1px solid rgba(92,98,236,0.3); padding: 2px 6px; border-radius: 6px; font-weight: 700; font-size: 10px;">✉️ Email</span>';

        const statusBadge = isOnline
          ? '<span style="background: rgba(163,230,53,0.15); color: #a3e635; border: 1px solid rgba(163,230,53,0.3); padding: 2px 8px; border-radius: 6px; font-weight: 800; font-size: 10px; display: inline-flex; align-items: center; gap: 4px;"><span style="width:6px;height:6px;border-radius:50%;background:#a3e635;"></span> Active Now</span>'
          : '<span style="background: rgba(255,255,255,0.06); color: var(--on-variant); border: 1px solid var(--outline-variant); padding: 2px 8px; border-radius: 6px; font-weight: 600; font-size: 10px;">⚪ Offline</span>';

        // Extract usage metrics (Lifetime & Today)
        const m = u.metrics || {};
        const apiTotal = (m.apiKeys && m.apiKeys.total) || 0;
        const apiBadge = apiTotal > 0
          ? '<span style="background: rgba(251,191,36,0.15); color: #fbbf24; border: 1px solid rgba(251,191,36,0.3); padding: 2px 6px; border-radius: 6px; font-weight: 700; font-size: 10px;">🔑 Configured</span>'
          : '<span style="background: rgba(255,255,255,0.05); color: var(--on-variant); border: 1px solid var(--outline-variant); padding: 2px 6px; border-radius: 6px; font-size: 10px;">No Key</span>';

        const getMetricCounts = (key) => {
          const item = m[key] || {};
          const tot = item.total || 0;
          const tod = (item.lastDate === todayStr) ? (item.today || 0) : 0;
          return { tot, tod };
        };

        const iconSheets = getMetricCounts('iconSheets');
        const prompts = getMetricCounts('prompts');
        const flowImages = getMetricCounts('flowImages');
        const presentations = getMetricCounts('presentations');

        const sub = u.subscription || 'free';
        const expiry = u.subscriptionExpiry;

        let isPro = false;
        if (sub === 'monthly' || sub === 'six_months') {
          if (!expiry) {
            isPro = true;
          } else {
            const expDate = new Date(expiry);
            if (expDate > new Date()) {
              isPro = true;
            }
          }
        }

        return `
          <tr style="border-bottom: 1px solid var(--outline-variant);">
            <td style="padding: 12px 14px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <img src="${photoURL}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 1.5px solid var(--outline);" onerror="this.src='https://lh3.googleusercontent.com/a/default-user'">
                <div>
                  <div style="font-weight: 700; color: var(--on-surface); display: flex; align-items: center; gap: 6px;">
                    ${displayName}
                    ${providerBadge}
                  </div>
                  <div style="font-size: 10.5px; color: var(--on-variant); font-family: var(--mono); margin-top: 1px;">${email}</div>
                </div>
              </div>
            </td>
            <td style="padding: 12px 14px;">
              <div style="font-size: 11px; color: var(--on-surface); font-weight: 600;">Last: ${lastActiveStr}</div>
              <div style="font-size: 10px; color: var(--on-variant); margin-top: 2px;">First: ${firstDateStr}</div>
            </td>
            <td style="padding: 12px 14px;">${apiBadge}</td>
            <td style="padding: 12px 14px;">
              <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 6px 12px; font-size: 10.5px;">
                <div style="background: var(--surface-low); border: 1px solid var(--outline-variant); padding: 4px 8px; border-radius: 6px; color: var(--on-surface);">
                  🎨 Icon Sheets: <strong style="color: var(--tertiary);">${iconSheets.tot}</strong> <span style="color: var(--on-variant); font-size: 9.5px;">(Today: ${iconSheets.tod})</span>
                </div>
                <div style="background: var(--surface-low); border: 1px solid var(--outline-variant); padding: 4px 8px; border-radius: 6px; color: var(--on-surface);">
                  💬 Prompts: <strong style="color: #fbbf24;">${prompts.tot}</strong> <span style="color: var(--on-variant); font-size: 9.5px;">(Today: ${prompts.tod})</span>
                </div>
                <div style="background: var(--surface-low); border: 1px solid var(--outline-variant); padding: 4px 8px; border-radius: 6px; color: var(--on-surface);">
                  🖼️ Flow Images: <strong style="color: #818cf8;">${flowImages.tot}</strong> <span style="color: var(--on-variant); font-size: 9.5px;">(Today: ${flowImages.tod})</span>
                </div>
                <div style="background: var(--surface-low); border: 1px solid var(--outline-variant); padding: 4px 8px; border-radius: 6px; color: var(--on-surface);">
                  📊 Presentations: <strong style="color: #38bdf8;">${presentations.tot}</strong> <span style="color: var(--on-variant); font-size: 9.5px;">(Today: ${presentations.tod})</span>
                </div>
              </div>
            </td>
            <td style="padding: 12px 14px;">
              <select class="admin-sub-select" data-uid="${u.uid}" data-email="${email}" style="background: var(--surface); border: 1px solid var(--outline-variant); color: var(--on-surface); font-size: 11px; border-radius: 6px; padding: 4.5px 8px; width: 140px; font-weight: 700; cursor: pointer; outline: none; transition: border-color .2s;">
                <option value="free" ${sub === 'free' ? 'selected' : ''}>🌱 Free (15cr/day)</option>
                <option value="monthly" ${sub === 'monthly' ? 'selected' : ''}>⭐ Monthly (৳100)</option>
                <option value="six_months" ${sub === 'six_months' ? 'selected' : ''}>👑 6-Months (৳500)</option>
              </select>
              <div style="font-size: 9.5px; color: var(--on-variant); margin-top: 4px; font-family: var(--mono);">
                ${isPro ? `Exp: ${expiry ? new Date(expiry).toLocaleDateString() : 'Forever'}` : `Credits: ${Math.min((u.creditsDaily?.remaining ?? 15), 15)}/15`}
              </div>
            </td>
            <td style="padding: 12px 14px;">${statusBadge}</td>
          </tr>
        `;
      }).join('');

      if (statTotalUsers) statTotalUsers.textContent = statsList.length;
      if (statActiveUsers) statActiveUsers.textContent = globalActiveCount;
      if (statLoginsToday) statLoginsToday.textContent = globalTodayCount;

      if (userList.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" style="padding: 24px; text-align: center; color: var(--on-variant); font-size: 12px;">
              No user sign-in logs captured yet.
            </td>
          </tr>
        `;
      } else {
        tbody.innerHTML = formattedRows;

        // Attach change listeners to admin sub selects
        tbody.querySelectorAll('.admin-sub-select').forEach(select => {
          select.addEventListener('change', async (e) => {
            const uid = e.target.getAttribute('data-uid');
            const userEmail = e.target.getAttribute('data-email');
            const plan = e.target.value;

            let planExpiry = null;
            if (plan === 'monthly') {
              const d = new Date();
              d.setDate(d.getDate() + 30);
              planExpiry = d.toISOString();
            } else if (plan === 'six_months') {
              const d = new Date();
              d.setDate(d.getDate() + 180);
              planExpiry = d.toISOString();
            }

            const success = await window.updateUserPlan(uid, userEmail, plan, planExpiry);
            if (success) {
              if (window.showCustomToast) {
                window.showCustomToast('User subscription updated successfully!', 'success');
              } else {
                alert('User subscription updated successfully!');
              }
            }
          });
        });
      }

      // Render extension log entries
      renderExtensionLogs(statsList);
    }

    let latestSources = {
      mongo: (window.latestSources && Array.isArray(window.latestSources.mongo) && window.latestSources.mongo.length > 0) ? window.latestSources.mongo : [],
      firestore: (window.latestSources && Array.isArray(window.latestSources.firestore) && window.latestSources.firestore.length > 0) ? window.latestSources.firestore : [],
      local: getUserLogs()
    };
    window.latestSources = latestSources;

    function syncAndRenderAll() {
      latestSources.local = getUserLogs();
      let userMap = new Map();

      // Gather all unique keys across sources
      const allKeys = new Set();
      [latestSources.mongo, latestSources.firestore, latestSources.local].forEach(sourceList => {
        if (!Array.isArray(sourceList)) return;
        sourceList.forEach(u => {
          if (!u) return;
          const key = (u.uid || u.email || '').toLowerCase();
          if (key) allKeys.add(key);
        });
      });

      allKeys.forEach(key => {
        const mongoRecord = Array.isArray(latestSources.mongo) ? latestSources.mongo.find(u => u && (u.uid || u.email || '').toLowerCase() === key) : null;
        const firestoreRecord = Array.isArray(latestSources.firestore) ? latestSources.firestore.find(u => u && (u.uid || u.email || '').toLowerCase() === key) : null;
        const localRecord = Array.isArray(latestSources.local) ? latestSources.local.find(u => u && (u.uid || u.email || '').toLowerCase() === key) : null;

        const baseUser = mongoRecord || firestoreRecord || localRecord || {};

        // Subscription authority priority: MongoDB > Firestore > Local
        const subRecord = mongoRecord || firestoreRecord || localRecord || {};
        const subscription = subRecord.subscription || 'free';
        const subscriptionExpiry = subRecord.subscriptionExpiry || null;

        // Metrics merging (take max count across available sources)
        const mergedMetrics = {};
        const metricKeys = ['apiKeys', 'prompts', 'iconSheets', 'presentations', 'flowImages'];
        metricKeys.forEach(mk => {
          const mVal = (mongoRecord?.metrics?.[mk]?.total) || 0;
          const fVal = (firestoreRecord?.metrics?.[mk]?.total) || 0;
          const lVal = (localRecord?.metrics?.[mk]?.total) || 0;

          let bestMetric = mongoRecord?.metrics?.[mk] || firestoreRecord?.metrics?.[mk] || localRecord?.metrics?.[mk] || { total: 0, today: 0, lastDate: '' };
          const maxTot = Math.max(mVal, fVal, lVal);

          if (lVal === maxTot && localRecord?.metrics?.[mk]) bestMetric = localRecord.metrics[mk];
          if (fVal === maxTot && firestoreRecord?.metrics?.[mk]) bestMetric = firestoreRecord.metrics[mk];
          if (mVal === maxTot && mongoRecord?.metrics?.[mk]) bestMetric = mongoRecord.metrics[mk];

          mergedMetrics[mk] = { ...bestMetric };
        });

        // Credits Daily
        const creditsDaily = mongoRecord?.creditsDaily || firestoreRecord?.creditsDaily || localRecord?.creditsDaily || null;

        // Determine latest active timestamp
        const parseTimeHelper = (t) => {
          if (!t) return 0;
          if (typeof t === 'object') {
            if (typeof t.toDate === 'function') return t.toDate().getTime();
            if (t.seconds !== undefined) return t.seconds * 1000;
            if (t._seconds !== undefined) return t._seconds * 1000;
          }
          const dt = new Date(t);
          return isNaN(dt.getTime()) ? 0 : dt.getTime();
        };

        const times = [mongoRecord?.lastActive, firestoreRecord?.lastActive, localRecord?.lastActive]
          .map(parseTimeHelper)
          .filter(t => t > 0);
        const maxTime = times.length > 0 ? Math.max(...times) : 0;
        const lastActive = maxTime > 0 ? new Date(maxTime).toISOString() : (baseUser.lastActive || null);

        userMap.set(key, {
          ...localRecord,
          ...firestoreRecord,
          ...mongoRecord,
          subscription,
          subscriptionExpiry,
          creditsDaily,
          metrics: mergedMetrics,
          lastActive
        });
      });

      // Always include current logged-in user as Active
      const curr = (firebaseAuth && firebaseAuth.currentUser) ? firebaseAuth.currentUser : null;
      if (curr) {
        const currEmail = (curr.email || '').toLowerCase();
        const currKey = (curr.uid || currEmail).toLowerCase();
        let existing = userMap.get(currKey);
        const activeCurrObj = {
          uid: curr.uid,
          email: curr.email || (existing ? existing.email : ''),
          displayName: curr.displayName || (curr.email ? curr.email.split('@')[0] : 'User'),
          photoURL: curr.photoURL || 'https://lh3.googleusercontent.com/a/default-user',
          provider: (curr.providerData && curr.providerData[0]) ? curr.providerData[0].providerId : 'google.com',
          status: 'active',
          lastActive: new Date().toISOString(),
          metrics: existing ? existing.metrics : {}
        };
        userMap.set(currKey, { ...existing, ...activeCurrObj });
      }

      // Filter out test/bot users (Uids starting with user_test_ or emails containing @gravitylab.ai)
      const mergedList = Array.from(userMap.values()).filter(u => {
        const email = String(u.email || '').toLowerCase();
        const uid = String(u.uid || '').toLowerCase();
        return !uid.startsWith('user_test_') && !email.includes('@gravitylab.ai');
      });
      
      // Sort: Current logged-in user first, then by most recently active descending
      mergedList.sort((a, b) => {
        const isCurrA = curr && (a.uid === curr.uid || (a.email && curr.email && a.email.toLowerCase() === curr.email.toLowerCase()));
        const isCurrB = curr && (b.uid === curr.uid || (b.email && curr.email && b.email.toLowerCase() === curr.email.toLowerCase()));
        if (isCurrA && !isCurrB) return -1;
        if (!isCurrA && isCurrB) return 1;
        
        const dateA = new Date(a.lastActive || 0);
        const dateB = new Date(b.lastActive || 0);
        return dateB - dateA;
      });

      console.log('[Admin Logs Sync Debug] Version v8.5.0 loaded successfully!');
      console.log('[Admin Logs Sync Debug] Sources metadata:', {
        firestoreCount: latestSources.firestore ? latestSources.firestore.length : 0,
        mongoCount: latestSources.mongo ? latestSources.mongo.length : 0,
        localCount: latestSources.local ? latestSources.local.length : 0,
        mergedCount: mergedList.length
      });
      console.log('[Admin Logs Sync Debug] Merged user records list:', mergedList);

      currentFullUserList = mergedList;
      filterAndRender();
      saveUserLogs(mergedList);
    }

    const filterAndRender = () => {
      const searchInput = document.getElementById('adminUserSearchInput');
      const clearBtn = document.getElementById('adminUserSearchClearBtn');
      const planFilter = document.getElementById('adminUserPlanFilter');

      const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
      const selectedPlan = planFilter ? planFilter.value : 'all';

      if (clearBtn) {
        clearBtn.style.display = query ? 'block' : 'none';
      }

      let filteredList = currentFullUserList;

      // Filter by query
      if (query) {
        filteredList = currentFullUserList.filter(u => String(u.email || '').toLowerCase().includes(query));
      }

      // Filter by plan
      if (selectedPlan !== 'all') {
        const isProUser = (u) => {
          const sub = u.subscription || 'free';
          const expiry = u.subscriptionExpiry;
          if (sub === 'monthly' || sub === 'six_months') {
            if (!expiry) return true;
            return new Date(expiry) > new Date();
          }
          return false;
        };

        filteredList = filteredList.filter(u => {
          const proActive = isProUser(u);
          const subType = u.subscription || 'free';

          if (selectedPlan === 'free') {
            return !proActive;
          } else if (selectedPlan === 'pro') {
            return proActive;
          } else if (selectedPlan === 'monthly') {
            return proActive && subType === 'monthly';
          } else if (selectedPlan === 'six_months') {
            return proActive && subType === 'six_months';
          }
          return true;
        });
      }

      renderList(filteredList, currentFullUserList);
    };

    // Attach search & filter event listeners
    const searchInput = document.getElementById('adminUserSearchInput');
    const clearBtn = document.getElementById('adminUserSearchClearBtn');
    const planFilter = document.getElementById('adminUserPlanFilter');

    if (searchInput) {
      searchInput.addEventListener('input', filterAndRender);
    }
    if (planFilter) {
      planFilter.addEventListener('change', filterAndRender);
    }
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (searchInput) {
          searchInput.value = '';
        }
        filterAndRender();
      });
    }

    // Initial render from local logs
    syncAndRenderAll();

    // Fetch from MongoDB backend API
    fetch(resolveApiUrl('/api/users/list'))
      .then(res => res.json())
      .then(data => {
        if (data && data.ok && Array.isArray(data.users)) {
          latestSources.mongo = data.users;
          syncAndRenderAll();
        }
      }).catch(err => console.warn('[MongoDB List Fetch Error]:', err));

    // Try listening to Firestore Database real-time snapshot
    if (firebaseDb) {
      if (firestoreUnsubscribe) firestoreUnsubscribe();
      try {
        firestoreUnsubscribe = firebaseDb.collection('users').onSnapshot((snapshot) => {
          let firestoreUsers = [];
          snapshot.forEach(doc => {
            const data = doc.data();
            if (data && (data.uid || data.email || data.displayName)) {
              if (!data.uid) data.uid = doc.id;
              firestoreUsers.push(data);
            }
          });

          latestSources.firestore = firestoreUsers;
          syncAndRenderAll();

          // Aggregate client-nested bug reports from all Firestore users
          const aggregatedBugs = [];
          firestoreUsers.forEach(u => {
            if (u && Array.isArray(u.extension_bug_reports)) {
              u.extension_bug_reports.forEach(bug => {
                if (bug && bug.id) {
                  // Check if this bug was deleted in MongoDB
                  if (window.latestSources && Array.isArray(window.latestSources.mongo)) {
                    const mongoUser = window.latestSources.mongo.find(mu => (mu.uid === u.uid) || (mu.email && u.email && mu.email.toLowerCase() === u.email.toLowerCase()));
                    if (mongoUser && Array.isArray(mongoUser.extension_bug_reports)) {
                      const existsInMongo = mongoUser.extension_bug_reports.some(mb => mb.id === bug.id);
                      if (!existsInMongo) {
                        return; // Skipped (deleted in MongoDB/master)
                      }
                    }
                  }

                  aggregatedBugs.push({
                    uid: u.uid || '',
                    email: u.email || 'anonymous@gravity.ai',
                    ...bug
                  });
                }
              });
            }
          });
          aggregatedBugs.sort((a, b) => {
            const timeA = new Date(a.created_at || 0).getTime();
            const timeB = new Date(b.created_at || 0).getTime();
            return timeB - timeA;
          });
          window.currentFeedbackList = aggregatedBugs;
          
          const feedbackPanel = document.getElementById('adminSectionExtensionFeedback');
          if (feedbackPanel && !feedbackPanel.classList.contains('hidden')) {
            window.renderExtensionFeedback();
          }
        }, (err) => {
          console.warn('[Firestore Listen Error]:', err);
          const liveSyncBadge = document.querySelector('#adminUserLogsTableBody')?.parentElement?.parentElement?.querySelector('.live-sync-badge');
          if (liveSyncBadge) {
            liveSyncBadge.innerHTML = '⚠️ Firestore Rules Locked (Read Denied)';
            liveSyncBadge.style.background = 'rgba(239, 68, 68, 0.15)';
            liveSyncBadge.style.color = '#ef4444';
            liveSyncBadge.style.borderColor = 'rgba(239, 68, 68, 0.3)';
          }
          syncAndRenderAll();
        });
      } catch (e) {
        console.warn('[Firestore DB Error]:', e);
      }
    }

    // Listen to Extension Bug Reports (Aggregated directly from users list, old collection listener disabled)
    window.feedbackUnsubscribe = () => {};

    // Bind Extension Feedback Refresh
    const btnRefreshExtensionFeedback = document.getElementById('btnRefreshExtensionFeedback');
    if (btnRefreshExtensionFeedback) {
      btnRefreshExtensionFeedback.onclick = () => {
        if (window.showCustomToast) {
          window.showCustomToast('Extension feedback logs refreshed!', 'success');
        }
        window.renderExtensionFeedback();
      };
    }

    // Bind Extension logs refresh button
    const btnRefreshAdminExtensionLogs = document.getElementById('btnRefreshAdminExtensionLogs');
    if (btnRefreshAdminExtensionLogs) {
      btnRefreshAdminExtensionLogs.onclick = () => {
        syncAndRenderAll();
        if (window.showCustomToast) {
          window.showCustomToast('Extension logs synchronized!', 'success');
        }
      };
    }
  }

  // --- Admin Billing Approval Logic ---
  window.refreshAdminPayments = function() {
    const tbody = document.getElementById('adminPaymentsTableBody');
    if (!tbody) return;

    fetch(resolveApiUrl('/api/subscriptions/list'))
      .then(res => res.json())
      .then(data => {
        if (!data || !data.ok || !Array.isArray(data.requests)) {
          tbody.innerHTML = `
            <tr>
              <td colspan="6" style="padding: 24px; text-align: center; color: var(--on-variant); font-size: 12px;">
                Failed to load billing requests.
              </td>
            </tr>
          `;
          return;
        }

        const requests = data.requests;
        if (requests.length === 0) {
          tbody.innerHTML = `
            <tr>
              <td colspan="6" style="padding: 24px; text-align: center; color: var(--on-variant); font-size: 12px;">
                No payment requests recorded yet.
              </td>
            </tr>
          `;
          return;
        }

        tbody.innerHTML = requests.map(r => {
          const planBadge = r.plan === 'monthly'
            ? '<span style="background: rgba(205,252,82,0.15); color: var(--primary); padding: 2px 6px; border-radius: 6px; font-weight: 700; font-size: 10px;">⭐ Monthly BDT 50</span>'
            : '<span style="background: rgba(0,229,255,0.12); color: var(--tertiary); padding: 2px 6px; border-radius: 6px; font-weight: 700; font-size: 10px;">👑 6 Months BDT 250</span>';

          const methodColor = r.method === 'bkash' ? '#ec4899' : (r.method === 'nagad' ? '#f97316' : '#a855f7');
          const detailsHtml = `
            <span style="background: var(--surface-low); border: 1px solid var(--outline-variant); padding: 2px 6px; border-radius: 6px; font-size: 10px; font-weight: 700; color: ${methodColor}; text-transform: uppercase;">
              ${r.method}
            </span>
            <span style="font-family: var(--mono); font-size: 11px; margin-left: 6px; color: var(--on-surface);">${r.phone || 'N/A'}</span>
          `;

          let statusBadge = '';
          if (r.status === 'pending') {
            statusBadge = '<span style="background: rgba(251,191,36,0.15); color: #fbbf24; border: 1px solid rgba(251,191,36,0.3); padding: 2px 8px; border-radius: 6px; font-weight: 700; font-size: 10.5px;">⏳ Pending</span>';
          } else if (r.status === 'approved') {
            statusBadge = '<span style="background: rgba(34,197,94,0.15); color: #22c55e; border: 1px solid rgba(34,197,94,0.3); padding: 2px 8px; border-radius: 6px; font-weight: 700; font-size: 10.5px;">✓ Approved</span>';
          } else {
            statusBadge = '<span style="background: rgba(239,68,68,0.15); color: #ef4444; border: 1px solid rgba(239,68,68,0.3); padding: 2px 8px; border-radius: 6px; font-weight: 700; font-size: 10.5px;">✕ Rejected</span>';
          }

          let actionButtons = '-';
          if (r.status === 'pending') {
            actionButtons = `
              <div style="display: flex; gap: 8px; justify-content: center;">
                <button type="button" class="btn btn-primary small" onclick="window.verifyPaymentRequest('${r.id}', 'approve')" style="height: 26px; font-size: 10px; padding: 0 10px; font-weight: 700; background: #22c55e; border-color: #22c55e; color: #fff;">Approve</button>
                <button type="button" class="btn btn-dark small" onclick="window.verifyPaymentRequest('${r.id}', 'reject')" style="height: 26px; font-size: 10px; padding: 0 10px; font-weight: 700; border-color: #ef4444; color: #ef4444;">Reject</button>
              </div>
            `;
          }

          const dateStr = new Date(r.createdAt || Date.now()).toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
          });

          return `
            <tr style="border-bottom: 1px solid var(--outline-variant);">
              <td style="padding: 12px 14px;">
                <div style="font-weight: 700; color: var(--on-surface);">${r.displayName || 'User'}</div>
                <div style="font-size: 10.5px; color: var(--on-variant); font-family: var(--mono); margin-top: 1px;">${r.email}</div>
              </td>
              <td style="padding: 12px 14px;">${planBadge}</td>
              <td style="padding: 12px 14px;">${detailsHtml}</td>
              <td style="padding: 12px 14px; color: var(--on-variant); font-size: 11px;">${dateStr}</td>
              <td style="padding: 12px 14px;">${statusBadge}</td>
              <td style="padding: 12px 14px; text-align: center;">${actionButtons}</td>
            </tr>
          `;
        }).join('');
      })
      .catch(err => {
        console.error('[Payments Fetch Error]:', err);
        tbody.innerHTML = `
          <tr>
            <td colspan="6" style="padding: 24px; text-align: center; color: var(--on-variant); font-size: 12px;">
              Error loading requests: ${err.message}
            </td>
          </tr>
        `;
      });
  };

  window.verifyPaymentRequest = function(requestId, action) {
    if (!confirm(`Are you sure you want to ${action} this request?`)) return;

    fetch(resolveApiUrl('/api/subscriptions/verify'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, action })
    })
    .then(res => res.json())
    .then(async (data) => {
      if (data && data.ok) {
        showCustomAlert(`Subscription request has been successfully ${action}d!`, 'Success');
        
        // Parallel write to Firestore for active synchronization across devices
        if (firebaseDb && action === 'approve' && data.uid) {
          try {
            await firebaseDb.collection('users').doc(data.uid).set({
              subscription: data.plan || 'free',
              subscriptionExpiry: data.expiry || null
            }, { merge: true });
            console.log('[Firestore Sync]: Successfully synced user plan to Firestore in verifyPaymentRequest');
          } catch (err) {
            console.warn('[Firestore Sync Error]:', err);
          }
        }

        window.refreshAdminPayments();
        // Refresh User logs too, to sync and fetch updated subscription fields
        if (typeof renderAdminUserLogs === 'function') {
          renderAdminUserLogs();
        }
      } else {
        showCustomAlert(data.error || 'Failed to verify payment', 'Error');
      }
    })
    .catch(err => {
      showCustomAlert(err.message || 'Verification failed due to connectivity issues.', 'Error');
    });
  };

  window.renderExtensionFeedback = function() {
    const tbody = document.getElementById('adminExtensionFeedbackTableBody');
    const openStat = document.getElementById('statOpenExtensionBugs');
    const resolvedStat = document.getElementById('statResolvedExtensionBugs');
    if (!tbody) return;

    if (!window.currentFeedbackList || window.currentFeedbackList.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="padding: 24px; text-align: center; color: var(--on-variant); font-size: 12.5px;">
            No bug/feedback reports found.
          </td>
        </tr>
      `;
      if (openStat) openStat.textContent = '0';
      if (resolvedStat) resolvedStat.textContent = '0';
      return;
    }

    let openCount = 0;
    let resolvedCount = 0;

    tbody.innerHTML = window.currentFeedbackList.map(item => {
      const status = item.status || 'open';
      if (status === 'resolved') resolvedCount++;
      else openCount++;

      const email = item.email || 'anonymous@gravity.ai';
      const desc = item.description || 'No description';
      const docId = item.id;

      let dateStr = 'N/A';
      if (item.created_at) {
        let dt = null;
        if (typeof item.created_at.toDate === 'function') {
          dt = item.created_at.toDate();
        } else if (item.created_at.seconds) {
          dt = new Date(item.created_at.seconds * 1000);
        } else {
          dt = new Date(item.created_at);
        }
        if (dt && !isNaN(dt.getTime())) {
          dateStr = dt.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        }
      }

      let clientText = 'N/A';
      if (item.client) {
        const ver = item.client.extensionVersion || 'unknown ver';
        const flow = item.client.flowType || 'unknown flow';
        const loc = item.client.locale || 'en';
        clientText = `v${ver} | ${flow} | ${loc}`;
      }

      const statusBadge = status === 'resolved'
        ? '<span style="background: rgba(163,230,53,0.15); color: #a3e635; border: 1px solid rgba(163,230,53,0.3); padding: 2px 6px; border-radius: 6px; font-weight: 700; font-size: 10px;">Resolved</span>'
        : '<span style="background: rgba(239,68,68,0.15); color: #ef4444; border: 1px solid rgba(239,68,68,0.3); padding: 2px 6px; border-radius: 6px; font-weight: 700; font-size: 10px;">Open</span>';

      return `
        <tr style="border-bottom: 1px solid var(--outline-variant);">
          <td style="padding: 12px 14px; font-family: var(--mono); font-size: 11.5px; color: var(--on-surface); font-weight: 600;">${email}</td>
          <td style="padding: 12px 14px; font-size: 12px; color: var(--on-surface); max-width: 320px; word-wrap: break-word; white-space: pre-wrap;">${desc}</td>
          <td style="padding: 12px 14px; font-size: 11px; color: var(--on-variant);">${clientText}</td>
          <td style="padding: 12px 14px; font-size: 11px; color: var(--on-surface);">${dateStr}</td>
          <td style="padding: 12px 14px; display: flex; align-items: center; gap: 8px;">
            ${statusBadge}
          </td>
          <td style="padding: 12px 14px;">
            <button class="btn btn-dark small btn-delete-feedback" data-id="${docId}" data-uid="${item.uid || ''}" style="padding: 2px 10px; font-size: 11px; font-weight: 700; border-radius: 6px; cursor: pointer; border-color: rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.08); color: #f87171; transition: all 0.2s;">
              Delete
            </button>
          </td>
        </tr>
      `;
    }).join('');

    if (openStat) openStat.textContent = openCount;
    if (resolvedStat) resolvedStat.textContent = resolvedCount;

    // Add event listeners click
    tbody.querySelectorAll('.btn-delete-feedback').forEach(btn => {
      btn.onclick = async (e) => {
        const id = e.target.getAttribute('data-id');
        const uid = e.target.getAttribute('data-uid');
        const actionBtn = e.target;
        const bugReport = window.currentFeedbackList ? window.currentFeedbackList.find(b => b.id === id) : null;
        const email = bugReport ? bugReport.email : '';

        if (!uid) {
          alert('User associated with this report has no UID.');
          return;
        }

        if (!confirm('Are you sure you want to delete this bug report?')) {
          return;
        }

        // Map existing bug reports of this user from current feedback list and filter out deleted one
        const userBugs = window.currentFeedbackList
          ? window.currentFeedbackList
              .filter(b => b.uid === uid)
              .map(b => {
                const cleaned = {
                  id: b.id || '',
                  description: b.description || '',
                  created_at: b.created_at || new Date().toISOString(),
                  status: b.status || 'open'
                };
                if (b.client) cleaned.client = b.client;
                return cleaned;
              })
          : [];
        const remainingBugs = userBugs.filter(b => b.id !== id);

        try {
          actionBtn.disabled = true;
          actionBtn.textContent = 'Deleting...';

          const res = await fetch(resolveApiUrl('/api/bugs/delete'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              uid: uid,
              bugId: id,
              email: email,
              remainingBugs: remainingBugs
            })
          });
          const data = await res.json();
          if (!data || !data.ok) {
            throw new Error(data.error || 'Failed to delete bug report via API');
          }

          // Instantly sync to Firestore from client-side since local server doesn't have system admin key
          if (firebaseDb) {
            try {
              await firebaseDb.collection('users').doc(uid).update({
                extension_bug_reports: remainingBugs
              });
              console.log('[Firestore Sync]: Successfully deleted bug report from Firestore');
            } catch (fsErr) {
              console.warn('[Firestore Sync Error on delete]:', fsErr);
            }
          }

          if (window.showCustomToast) {
            window.showCustomToast('Bug report successfully deleted!', 'success');
          }

          // Instantly sync memory collection
          if (window.latestSources && Array.isArray(window.latestSources.mongo)) {
            const mongoUser = window.latestSources.mongo.find(mu => (mu.uid === uid) || (mu.email && email && mu.email.toLowerCase() === email.toLowerCase()));
            if (mongoUser) {
              mongoUser.extension_bug_reports = remainingBugs;
            } else {
              window.latestSources.mongo.push({
                uid: uid,
                email: email,
                extension_bug_reports: remainingBugs
              });
            }
          }

          // Instantly filter out from UI and re-render
          if (Array.isArray(window.currentFeedbackList)) {
            window.currentFeedbackList = window.currentFeedbackList.filter(b => b.id !== id);
            window.renderExtensionFeedback();
          }
        } catch (err) {
          console.warn('Failed to delete report:', err);
          alert('Failed to delete report: ' + err.message);
          actionBtn.disabled = false;
          actionBtn.textContent = 'Delete';
        }
      };
    });
  };

  // Wire Refresh button
  const btnRefreshAdminPayments = document.getElementById('btnRefreshAdminPayments');
  if (btnRefreshAdminPayments) {
    btnRefreshAdminPayments.addEventListener('click', window.refreshAdminPayments);
  }



  window.openAdminPinModal = function(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const modal = document.getElementById('adminPinModal');
    const input = document.getElementById('adminPinInput');
    if (modal) {
      if (input) input.value = '';
      modal.classList.remove('hidden');
      modal.style.display = 'flex';
      modal.style.alignItems = 'center';
      modal.style.justifyContent = 'center';
      setTimeout(() => { if (input) input.focus(); }, 100);
    }
  };

  window.closeAdminPinModal = function(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const modal = document.getElementById('adminPinModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
  };

  window.handleSignOut = async function(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (firebaseAuth) {
      try {
        await firebaseAuth.signOut();
      } catch (err) {
        console.error('Sign Out Error:', err);
      }
    }
    toggleAuthGate(true);
    openAuthModal();
    
    const btnOpenAuth = document.getElementById('btnOpenAuthModal');
    const profileMenu = document.getElementById('userProfileMenu');
    const adminBtn = document.getElementById('adminNavBtn');
    const adminView = document.getElementById('adminPanelView');

    if (btnOpenAuth) btnOpenAuth.classList.remove('hidden');
    if (profileMenu) profileMenu.classList.add('hidden');
    if (adminBtn) adminBtn.classList.add('hidden');
    if (adminView && !adminView.classList.contains('hidden')) {
      const dashNav = document.querySelector('.nav-item[data-nav="dashboard"]');
      if (dashNav) dashNav.click();
    }
    if (window.showCustomToast) window.showCustomToast('Signed out successfully!', 'info');
  };

  if (adminNavBtn) {
    adminNavBtn.addEventListener('click', window.openAdminPinModal);
  }

  if (btnCancelAdminPin) {
    btnCancelAdminPin.addEventListener('click', window.closeAdminPinModal);
  }

  window.showAdminSubView = function(targetSectionId) {
    const sections = ['adminSectionOverview', 'adminSectionUserLogs', 'adminSectionControls', 'adminSectionFeedback', 'adminSectionTopBanner', 'adminSectionNotice', 'adminSectionPayments', 'adminSectionExtensionLogs', 'adminSectionExtensionFeedback'];
    
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        if (id === targetSectionId) {
          el.style.display = (id === 'adminSectionOverview') ? 'grid' : 'flex';
          el.classList.remove('hidden');
        } else {
          el.style.display = 'none';
          el.classList.add('hidden');
        }
      }
    });

    const adminNavs = document.querySelectorAll('#navGroupAdmin .nav-item');
    adminNavs.forEach(nav => nav.classList.remove('active'));

    if (targetSectionId === 'adminSectionOverview') {
      const btn = document.getElementById('adminNavOverview');
      if (btn) btn.classList.add('active');
    } else if (targetSectionId === 'adminSectionUserLogs') {
      const btn = document.getElementById('adminNavUserLogs');
      if (btn) btn.classList.add('active');
      renderAdminUserLogs(); // Refresh logs on tab selection!
    } else if (targetSectionId === 'adminSectionControls') {
      const btn = document.getElementById('adminNavControls');
      if (btn) btn.classList.add('active');
    } else if (targetSectionId === 'adminSectionFeedback') {
      const btn = document.getElementById('adminNavFeedback');
      if (btn) btn.classList.add('active');
      renderAdminFeedback(); // Refresh feedbacks on tab selection!
    } else if (targetSectionId === 'adminSectionTopBanner') {
      const btn = document.getElementById('adminNavTopBanner');
      if (btn) btn.classList.add('active');
      if (typeof window.loadAdminTopBannerConfig === 'function') {
        window.loadAdminTopBannerConfig(); // Load top banners config on tab selection!
      }
    } else if (targetSectionId === 'adminSectionNotice') {
      const btn = document.getElementById('adminNavNotice');
      if (btn) btn.classList.add('active');
      if (typeof window.loadAdminPopupNoticeConfig === 'function') {
        window.loadAdminPopupNoticeConfig(); // Load popup notice config on tab selection!
      } else if (typeof window.loadAdminNoticeConfig === 'function') {
        window.loadAdminNoticeConfig();
      }
    } else if (targetSectionId === 'adminSectionPayments') {
      const btn = document.getElementById('adminNavPayments');
      if (btn) btn.classList.add('active');
      if (typeof window.refreshAdminPayments === 'function') {
        window.refreshAdminPayments(); // Refresh payments on tab selection!
      }
    } else if (targetSectionId === 'adminSectionExtensionLogs') {
      const btn = document.getElementById('adminNavExtensionLogs');
      if (btn) btn.classList.add('active');
      renderAdminUserLogs(); // Refresh logs on tab selection!
    } else if (targetSectionId === 'adminSectionExtensionFeedback') {
      const btn = document.getElementById('adminNavExtensionFeedback');
      if (btn) btn.classList.add('active');
      renderAdminUserLogs(); // Triggers extension feedback setup
      if (typeof window.renderExtensionFeedback === 'function') {
        window.renderExtensionFeedback();
      }
    }
  };

  window.enterAdminWorkspace = function() {
    const navGroupStudio = document.getElementById('navGroupStudio');
    const navGroupAdmin = document.getElementById('navGroupAdmin');
    const sidebarBottomGroup = document.getElementById('sidebarBottomGroup');
    const pageTitle = document.getElementById('pageTitle');
    const pageTitleBadge = document.getElementById('pageTitleBadge');
    const adminPanelView = document.getElementById('adminPanelView');

    document.querySelectorAll('.home-view').forEach(view => {
      view.classList.add('hidden');
      view.style.display = 'none';
    });

    if (navGroupStudio) navGroupStudio.style.display = 'none';
    if (sidebarBottomGroup) sidebarBottomGroup.style.display = 'none';

    if (navGroupAdmin) {
      navGroupAdmin.classList.remove('hidden');
      navGroupAdmin.style.display = 'flex';
    }

    if (appBody) {
      appBody.classList.add('in-admin-view');
    }

    if (pageTitle) pageTitle.textContent = '👑 GravityLab Admin Workspace';
    if (pageTitleBadge) {
      pageTitleBadge.textContent = 'v6.0 Admin';
      pageTitleBadge.style.background = 'rgba(255, 255, 255, 0.08)';
      pageTitleBadge.style.color = '#e4e4e7';
      pageTitleBadge.style.borderColor = 'rgba(255, 255, 255, 0.15)';
    }

    if (adminPanelView) {
      adminPanelView.classList.remove('hidden');
      adminPanelView.style.display = 'flex';
    }

    window.showAdminSubView('adminSectionOverview');
    if (firebaseAuth && firebaseAuth.currentUser) {
      trackUserActivity(firebaseAuth.currentUser);
    }
    renderAdminUserLogs();
  };

  window.exitAdminWorkspace = function() {
    const navGroupStudio = document.getElementById('navGroupStudio');
    const navGroupAdmin = document.getElementById('navGroupAdmin');
    const sidebarBottomGroup = document.getElementById('sidebarBottomGroup');
    const pageTitle = document.getElementById('pageTitle');
    const pageTitleBadge = document.getElementById('pageTitleBadge');
    const adminPanelView = document.getElementById('adminPanelView');

    if (appBody) {
      appBody.classList.remove('in-admin-view');
    }

    // Reset inline display styles on all home views so they show up normally under routing
    document.querySelectorAll('.home-view').forEach(view => {
      view.style.display = '';
    });

    if (adminPanelView) {
      adminPanelView.classList.add('hidden');
      adminPanelView.style.display = 'none';
    }

    if (navGroupAdmin) {
      navGroupAdmin.classList.add('hidden');
      navGroupAdmin.style.display = 'none';
    }

    if (navGroupStudio) {
      navGroupStudio.style.display = 'flex';
    }

    if (sidebarBottomGroup) {
      sidebarBottomGroup.style.display = 'block';
    }

    if (pageTitle) pageTitle.textContent = '🎨 Icon Sheet Studio';
    if (pageTitleBadge) {
      pageTitleBadge.textContent = 'v5.2 Bulk';
      pageTitleBadge.style.background = 'rgba(205, 252, 82, 0.12)';
      pageTitleBadge.style.color = 'var(--primary)';
      pageTitleBadge.style.borderColor = 'rgba(205, 252, 82, 0.3)';
    }

    const dashNav = document.querySelector('.nav-item[data-nav="dashboard"]');
    if (dashNav) dashNav.click();
  };

  if (adminPinForm) {
    adminPinForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const enteredPin = adminPinInput ? adminPinInput.value.trim() : '';
      if (enteredPin === ADMIN_PIN) {
        closeAdminPinModal();
        window.enterAdminWorkspace();
        performAutoCleanup();
        if (window.showCustomToast) window.showCustomToast('Welcome Admin! PIN 6342 Verified 👑', 'success');
      } else {
        if (adminPinInput) adminPinInput.value = '';
        if (window.showCustomAlert) {
          window.showCustomAlert('Incorrect Security PIN. Please enter 6342.', 'Admin Security', 'error');
        }
      }
    });
  }

  const btnRefreshAdminUserLogs = document.getElementById('btnRefreshAdminUserLogs');


  if (btnRefreshAdminUserLogs) {
    btnRefreshAdminUserLogs.addEventListener('click', () => {
      renderAdminUserLogs();
      if (window.showCustomToast) window.showCustomToast('User activity logs refreshed from Cloud DB!', 'info');
    });
  }

  if (btnExitAdminPanel) {
    btnExitAdminPanel.addEventListener('click', window.exitAdminWorkspace);
  }

  if (btnAdminClearCache) {
    btnAdminClearCache.addEventListener('click', () => {
      localStorage.clear();
      sessionStorage.clear();
      if (window.showCustomToast) window.showCustomToast('Studio cache & local storage cleared successfully!', 'success');
    });
  }

  if (btnAdminResetState) {
    btnAdminResetState.addEventListener('click', () => {
      if (window.showCustomToast) window.showCustomToast('App parameters reset to default state.', 'info');
    });
  }

  if (btnAdminExportLogs) {
    btnAdminExportLogs.addEventListener('click', () => {
      const diagData = `GravityLab Diagnostics Report\nTime: ${new Date().toISOString()}\nAdmin: ${ADMIN_EMAIL}\nFirebase App: gravitylab-d9276\nUserAgent: ${navigator.userAgent}`;
      const blob = new Blob([diagData], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'gravitylab-diagnostics.txt';
      a.click();
      URL.revokeObjectURL(url);
      if (window.showCustomToast) window.showCustomToast('Diagnostics report exported!', 'success');
    });
  }

  // ===== User Feedback Section =====
  let currentFeedbackRating = 5;
  const feedbackRatingStars = document.getElementById('feedbackRatingStars');
  const feedbackTextInput = document.getElementById('feedbackTextInput');
  const btnSubmitFeedback = document.getElementById('btnSubmitFeedback');
  const btnRefreshAdminFeedback = document.getElementById('btnRefreshAdminFeedback');
  const openFeedbackModal = document.getElementById('openFeedbackModal');
  const feedbackModal = document.getElementById('feedbackModal');
  const btnCancelFeedback = document.getElementById('btnCancelFeedback');

  // Handle open/close modal triggers
  if (openFeedbackModal && feedbackModal) {
    openFeedbackModal.addEventListener('click', () => {
      feedbackModal.classList.remove('hidden');
    });
  }

  if (btnCancelFeedback && feedbackModal) {
    btnCancelFeedback.addEventListener('click', () => {
      feedbackModal.classList.add('hidden');
      if (feedbackTextInput) feedbackTextInput.value = '';
      currentFeedbackRating = 5;
      if (feedbackRatingStars) {
        feedbackRatingStars.querySelectorAll('span').forEach(s => s.style.color = '#fbbf24');
      }
    });
  }

  // Handle visual star interaction
  if (feedbackRatingStars) {
    const starSpans = feedbackRatingStars.querySelectorAll('span');
    starSpans.forEach(span => {
      span.addEventListener('click', (e) => {
        const rating = parseInt(e.target.getAttribute('data-star')) || 5;
        currentFeedbackRating = rating;
        
        starSpans.forEach((s, idx) => {
          if (idx < rating) {
            s.style.color = '#fbbf24';
          } else {
            s.style.color = 'var(--on-variant, #a1a1aa)';
          }
        });
      });
    });
  }

  // Submit Feedback action
  if (btnSubmitFeedback) {
    btnSubmitFeedback.addEventListener('click', async () => {
      const text = feedbackTextInput ? feedbackTextInput.value.trim() : '';
      if (!text) {
        if (window.showCustomToast) window.showCustomToast('Please enter your feedback message first!', 'error');
        return;
      }

      btnSubmitFeedback.disabled = true;
      btnSubmitFeedback.textContent = 'Submitting...';

      try {
        const user = firebaseAuth ? firebaseAuth.currentUser : null;
        const userId = user ? user.uid : 'anonymous';
        const userEmail = user ? user.email || 'anonymous' : 'anonymous';

        await firebaseDb.collection('feedbacks').add({
          userId,
          userEmail,
          rating: currentFeedbackRating,
          feedbackText: text,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        if (window.showCustomToast) window.showCustomToast('Thank you! Your feedback has been submitted.', 'success');
        if (feedbackTextInput) feedbackTextInput.value = '';
        
        // Reset stars and hide modal
        currentFeedbackRating = 5;
        if (feedbackRatingStars) {
          feedbackRatingStars.querySelectorAll('span').forEach(s => s.style.color = '#fbbf24');
        }
        if (feedbackModal) {
          feedbackModal.classList.add('hidden');
        }
      } catch (err) {
        console.error('[Feedback Submission Error]:', err);
        if (window.showCustomToast) window.showCustomToast('Failed to submit feedback: ' + err.message, 'error');
      } finally {
        btnSubmitFeedback.disabled = false;
        btnSubmitFeedback.textContent = 'Submit Feedback';
      }
    });
  }

  // Refresh Feedbacks Button
  if (btnRefreshAdminFeedback) {
    btnRefreshAdminFeedback.addEventListener('click', window.renderAdminFeedback);
  }

  // Render Admin Feedback list
  window.renderAdminFeedback = async function() {
    const tbody = document.getElementById('adminFeedbackTableBody');
    if (!tbody) return;

    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="padding: 24px; text-align: center; color: var(--on-variant); font-size: 12px;">
          ⏳ Loading feedbacks from Firestore...
        </td>
      </tr>
    `;

    try {
      const snapshot = await firebaseDb.collection('feedbacks').orderBy('timestamp', 'desc').get();
      const totalFeedbackEl = document.getElementById('statTotalFeedback');
      const avgRatingEl = document.getElementById('statAvgFeedbackRating');

      if (snapshot.empty) {
        tbody.innerHTML = `
          <tr>
            <td colspan="5" style="padding: 24px; text-align: center; color: var(--on-variant); font-size: 12px;">
              No feedback forms received yet.
            </td>
          </tr>
        `;
        if (totalFeedbackEl) totalFeedbackEl.textContent = '0';
        if (avgRatingEl) avgRatingEl.textContent = '0.0';
        return;
      }

      let html = '';
      let totalRating = 0;
      let count = 0;

      snapshot.forEach(doc => {
        const data = doc.data();
        const docId = doc.id;
        const email = data.userEmail || 'Anonymous';
        const rating = data.rating || 5;
        const text = data.feedbackText || '';
        const rawTime = data.timestamp;

        let dateStr = 'Unknown';
        if (rawTime) {
          if (typeof rawTime.toDate === 'function') {
            dateStr = rawTime.toDate().toLocaleString();
          } else if (rawTime.seconds) {
            dateStr = new Date(rawTime.seconds * 1000).toLocaleString();
          } else {
            dateStr = new Date(rawTime).toLocaleString();
          }
        }

        totalRating += rating;
        count++;

        const starsHtml = '★'.repeat(rating) + '☆'.repeat(5 - rating);

        html += `
          <tr style="border-bottom: 1px solid var(--outline-variant);">
            <td style="padding: 12px 14px; font-weight: 700; color: var(--on-surface);">${email}</td>
            <td style="padding: 12px 14px; color: #fbbf24; font-size: 14px;">${starsHtml} (${rating})</td>
            <td style="padding: 12px 14px; color: var(--on-surface); white-space: pre-wrap; word-break: break-word;">${text}</td>
            <td style="padding: 12px 14px; color: var(--on-variant);">${dateStr}</td>
            <td style="padding: 12px 14px; text-align: center;">
              <button class="btn btn-dark small" onclick="window.deleteAdminFeedback('${docId}')" style="height: 26px; border-color: rgba(239, 68, 68, 0.3); color: #ef4444; font-size: 10px; font-weight: 700; padding: 0 10px;">🗑️ Delete</button>
            </td>
          </tr>
        `;
      });

      tbody.innerHTML = html;
      if (totalFeedbackEl) totalFeedbackEl.textContent = count.toString();
      if (avgRatingEl) avgRatingEl.textContent = (totalRating / count).toFixed(1);

    } catch (err) {
      console.error('[Admin Feedback Render Error]:', err);
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="padding: 24px; text-align: center; color: #ef4444; font-size: 12px;">
            ❌ Failed to fetch feedbacks. Error: ${err.message}
          </td>
        </tr>
      `;
    }
  };

  // Delete Feedback
  window.deleteAdminFeedback = async function(docId) {
    if (!confirm('Are you sure you want to delete this feedback?')) return;
    try {
      await firebaseDb.collection('feedbacks').doc(docId).delete();
      if (window.showCustomToast) window.showCustomToast('Feedback deleted successfully!', 'success');
      window.renderAdminFeedback();
    } catch (err) {
      if (window.showCustomToast) window.showCustomToast('Failed to delete feedback: ' + err.message, 'error');
    }
  };

  // ==========================================================================
  // CUSTOM NOTICE POPUP CONTROLS AND SYNC LOGIC
  // ==========================================================================
  
  // Alias support for toast notifications compatibility in app
  if (!window.showCustomToast && window.showToast) {
    window.showCustomToast = window.showToast;
  }

  // Helper to convert Google Drive sharing links to direct image source URLs
  function convertDriveUrlToDirectLink(url) {
    if (!url) return '';
    url = url.trim();
    const driveRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/(view|edit|xp)/;
    const match = url.match(driveRegex);
    if (match && match[1]) {
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
    const openRegex = /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/;
    const matchOpen = url.match(openRegex);
    if (matchOpen && matchOpen[1]) {
      return `https://lh3.googleusercontent.com/d/${matchOpen[1]}`;
    }
    return url;
  }

  // =========================================================================
  // Page Notification Banners & Notice Management System
  // =========================================================================

  let allPageNotices = {};
  let pageNoticesLoaded = false;
  var hasOpenedTool = false;

  const PAGE_LABELS = {
    'all': '🌐 All Pages (Global Notice)',
    '/dashboard': '🏠 Dashboard',
    '/flowgen': '🌊 Google Flow AI Generator',
    '/promptgen': '🎨 Icon Sheet Prompt Generator',
    '/vectorizer': '📐 SVG Vectorizer',
    '/slicer': '✂️ Icon Sheet Slicer',
    '/bannergen': '🖼️ Banner Generator',
    '/pricing': '💳 Pricing & Plans'
  };

  const NOTICE_ICONS = {
    'announcement': '📢',
    'info': 'ℹ️',
    'warning': '⚠️',
    'update': '🚀'
  };

  function escapeNoticeHtml(str) {
    if (!str || typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  let firestoreNoticesListenerAttached = false;

  // Fetch all notices from Firestore and backend API
  window.fetchPageNotices = async function() {
    // 1. Try Firestore First (Real-time Cloud Database shared with all users)
    if (firebaseDb) {
      try {
        const snap = await firebaseDb.collection('page_notices').get();
        if (!snap.empty) {
          const fNotices = {};
          snap.forEach(doc => {
            fNotices[doc.id] = doc.data();
          });
          allPageNotices = Object.assign({}, allPageNotices, fNotices);
          try {
            localStorage.setItem('gravity_all_page_notices', JSON.stringify(allPageNotices));
          } catch (_) {}
          pageNoticesLoaded = true;
        }

        // Attach Realtime Firestore Snapshot Listener for all users
        if (!firestoreNoticesListenerAttached) {
          firestoreNoticesListenerAttached = true;
          firebaseDb.collection('page_notices').onSnapshot(snapshot => {
            if (snapshot && !snapshot.empty) {
              const liveNotices = {};
              snapshot.forEach(doc => {
                liveNotices[doc.id] = doc.data();
              });
              allPageNotices = Object.assign({}, allPageNotices, liveNotices);
              try {
                localStorage.setItem('gravity_all_page_notices', JSON.stringify(allPageNotices));
              } catch (_) {}
              if (window.evaluatePageNoticeBanner) {
                window.evaluatePageNoticeBanner();
              }
            }
          }, err => {
            console.warn('[Firestore Page Notices Listener Warning]:', err.message);
          });
        }
      } catch (fErr) {
        console.warn('[Firestore Page Notices Fetch Warning]:', fErr.message);
      }
    }

    // 2. Fetch from Backend REST API (MongoDB Atlas / Local Server)
    try {
      const res = await fetch(resolveApiUrl('/api/page-notices'));
      if (res.ok) {
        const data = await res.json();
        if (data && data.ok && data.notices) {
          allPageNotices = Object.assign({}, allPageNotices, data.notices);
          try {
            localStorage.setItem('gravity_all_page_notices', JSON.stringify(allPageNotices));
          } catch (_) {}
          pageNoticesLoaded = true;
          return allPageNotices;
        }
      }
    } catch (e) {
      console.warn('[Fetch Page Notices API Error]:', e);
    }

    // 3. Fallback to localStorage
    try {
      const local = JSON.parse(localStorage.getItem('gravity_all_page_notices') || '{}');
      if (local && typeof local === 'object') {
        allPageNotices = Object.assign({}, local, allPageNotices);
      }
    } catch (_) {}

    pageNoticesLoaded = true;
    return allPageNotices;
  };

  // Evaluate and display the appropriate top notice banner for the current path
  window.evaluatePageNoticeBanner = async function() {
    if (!pageNoticesLoaded) {
      await window.fetchPageNotices();
    }

    const bannerContainer = document.getElementById('pageTopNoticeBanner');
    if (!bannerContainer) return;

    let path = window.location.pathname || '/';
    if (path === '/' || path === '' || path === '/index.html') path = '/dashboard';
    if (path === '/Vectorizer') path = '/vectorizer';

    // Also inspect currently visible active view container in SPA
    const tool3V = document.getElementById('tool3View');
    const studioV = document.getElementById('studioView');
    const tool4V = document.getElementById('tool4View');
    const dashV = document.getElementById('dashboardView');

    if (tool3V && !tool3V.classList.contains('hidden')) {
      path = '/flowgen';
    } else if (studioV && !studioV.classList.contains('hidden')) {
      path = '/promptgen';
    } else if (tool4V && !tool4V.classList.contains('hidden')) {
      path = '/vectorizer';
    } else if (dashV && !dashV.classList.contains('hidden') && (path === '/' || path === '' || path === '/index.html')) {
      path = '/dashboard';
    }

    // 1. Try path-specific notice first, then fall back to global 'all'
    let notice = allPageNotices[path];
    if (!notice || !notice.enabled) {
      notice = allPageNotices['all'];
    }

    // Don't show on admin panel view
    const adminPanelView = document.getElementById('adminPanelView');
    const isAdminOpen = adminPanelView && !adminPanelView.classList.contains('hidden');
    if (isAdminOpen) {
      bannerContainer.classList.add('hidden');
      bannerContainer.style.display = 'none';
      return;
    }

    if (!notice || !notice.enabled) {
      bannerContainer.classList.add('hidden');
      bannerContainer.style.display = 'none';
      return;
    }

    // Check display mode
    const mode = notice.displayMode || 'top_banner';
    const showBanner = (mode === 'top_banner' || mode === 'both');

    if (!showBanner) {
      bannerContainer.classList.add('hidden');
      bannerContainer.style.display = 'none';
      return;
    }

    // Check if dismissed by user for this version / cooldown period
    if (notice.dismissible !== false) {
      const rawDismiss = localStorage.getItem('gravity_dismissed_notice_' + notice.page);
      if (rawDismiss) {
        let isDismissed = false;
        try {
          let dismissData = null;
          if (rawDismiss.startsWith('{')) {
            dismissData = JSON.parse(rawDismiss);
          } else {
            dismissData = { version: rawDismiss, dismissedAt: 0 };
          }

          const cooldown = (notice.cooldownMinutes !== undefined && notice.cooldownMinutes !== null) ? String(notice.cooldownMinutes) : '5';
          
          if (cooldown === 'never') {
            if (String(dismissData.version) === String(notice.updatedAt || 0)) {
              isDismissed = true;
            }
          } else if (cooldown === '0') {
            // Show on every reload, so dismiss was only for current page view session!
            isDismissed = false;
          } else {
            const cooldownMinutesNum = parseFloat(cooldown) || 5;
            const cooldownMs = cooldownMinutesNum * 60 * 1000;
            const elapsed = Date.now() - (dismissData.dismissedAt || 0);

            // If notice was updated by admin after dismissal, show immediately
            const wasUpdatedAfter = notice.updatedAt && dismissData.dismissedAt && (notice.updatedAt > dismissData.dismissedAt);

            if (!wasUpdatedAfter && elapsed < cooldownMs) {
              isDismissed = true; // Still within cooldown timer
            }
          }
        } catch (_) {
          isDismissed = false;
        }

        if (isDismissed) {
          bannerContainer.classList.add('hidden');
          bannerContainer.style.display = 'none';
          return;
        }
      }
    }

    // Render Banner
    const style = notice.style || 'announcement';
    const icon = NOTICE_ICONS[style] || '📢';
    const titleText = notice.title ? escapeNoticeHtml(notice.title) : '';
    const messageText = notice.content ? escapeNoticeHtml(notice.content) : '';
    const btnText = notice.btnText ? escapeNoticeHtml(notice.btnText) : '';
    const btnLink = notice.btnLink ? escapeNoticeHtml(notice.btnLink) : '';

    bannerContainer.className = `page-top-notice-banner notice-style-${style}`;
    bannerContainer.innerHTML = `
      <div class="page-notice-main">
        <div class="page-notice-icon-box">${icon}</div>
        <div class="page-notice-text-wrap">
          ${titleText ? `<span class="page-notice-title">${titleText}</span>` : ''}
          <span class="page-notice-message">${messageText}</span>
        </div>
      </div>
      <div class="page-notice-actions">
        ${btnText && btnLink ? `<a href="${btnLink}" class="page-notice-btn" ${btnLink.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : ''}>${btnText}</a>` : ''}
        ${notice.dismissible !== false ? `<button type="button" class="page-notice-dismiss" title="Dismiss" onclick="window.dismissPageNotice('${notice.page}', ${notice.updatedAt || 0})">✕</button>` : ''}
      </div>
    `;

    bannerContainer.classList.remove('hidden');
    bannerContainer.style.display = 'flex';
    bannerContainer.style.opacity = '1';
    bannerContainer.style.transform = 'none';

    // Handle internal link navigation
    const actionBtn = bannerContainer.querySelector('.page-notice-btn');
    if (actionBtn && btnLink && btnLink.startsWith('/') && !btnLink.startsWith('//')) {
      actionBtn.onclick = function(e) {
        e.preventDefault();
        if (window.navigateTo) window.navigateTo(btnLink);
        else window.location.pathname = btnLink;
      };
    }
  };

  // User dismisses banner with timestamp & version
  window.dismissPageNotice = function(pageKey, updatedAt) {
    const dismissRecord = {
      dismissedAt: Date.now(),
      version: updatedAt || 0
    };
    try {
      localStorage.setItem('gravity_dismissed_notice_' + pageKey, JSON.stringify(dismissRecord));
    } catch (_) {}

    const banner = document.getElementById('pageTopNoticeBanner');
    if (banner) {
      banner.style.opacity = '0';
      banner.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        banner.classList.add('hidden');
        banner.style.display = 'none';
      }, 250);
    }
  };

  // =========================================================================
  // TOP PAGE NOTIFICATION BANNER ADMIN MANAGEMENT (#adminSectionTopBanner)
  // =========================================================================

  function updateTopBannerStatusBadge(enabled) {
    const badge = document.getElementById('topBannerStatusBadge');
    if (!badge) return;
    if (enabled) {
      badge.style.color = '#a3e635';
      badge.style.background = 'rgba(163, 230, 53, 0.1)';
      badge.style.borderColor = 'rgba(163, 230, 53, 0.2)';
      badge.innerHTML = `<span style="width: 6.5px; height: 6.5px; border-radius: 50%; background: #a3e635;"></span> Active`;
    } else {
      badge.style.color = '#ef4444';
      badge.style.background = 'rgba(239, 68, 68, 0.1)';
      badge.style.borderColor = 'rgba(239, 68, 68, 0.2)';
      badge.innerHTML = `<span style="width: 6.5px; height: 6.5px; border-radius: 50%; background: #ef4444;"></span> Inactive`;
    }
  }

  function updateAdminTopBannerLivePreview() {
    const previewBox = document.getElementById('adminTopBannerLivePreview');
    if (!previewBox) return;

    const style = document.getElementById('topBannerStyleSelect')?.value || 'announcement';
    const title = document.getElementById('topBannerTitleInput')?.value.trim() || '';
    const content = document.getElementById('topBannerContentInput')?.value.trim() || 'Your custom notification text will appear here...';
    const btnText = document.getElementById('topBannerBtnTextInput')?.value.trim() || '';
    const dismissible = document.getElementById('topBannerDismissibleCheck')?.checked !== false;

    const icon = NOTICE_ICONS[style] || '📢';
    previewBox.className = `page-top-notice-banner notice-style-${style}`;

    const iconEl = document.getElementById('topBannerPreviewIcon');
    const titleEl = document.getElementById('topBannerPreviewTitle');
    const msgEl = document.getElementById('topBannerPreviewMessage');
    const btnEl = document.getElementById('topBannerPreviewBtn');
    const dismissEl = document.getElementById('topBannerPreviewDismiss');

    if (iconEl) iconEl.textContent = icon;
    if (titleEl) {
      if (title) {
        titleEl.textContent = title;
        titleEl.style.display = 'inline-block';
      } else {
        titleEl.style.display = 'none';
      }
    }
    if (msgEl) msgEl.textContent = content;
    if (btnEl) {
      if (btnText) {
        btnEl.textContent = btnText;
        btnEl.style.display = 'inline-flex';
      } else {
        btnEl.style.display = 'none';
      }
    }
    if (dismissEl) {
      dismissEl.style.display = dismissible ? 'flex' : 'none';
    }
  }

  window.loadAdminTopBannerConfig = async function() {
    await window.fetchPageNotices();
    renderAdminTopBannersTable();

    const selectedPage = document.getElementById('topBannerPageSelect')?.value || 'all';
    populateAdminTopBannerForm(selectedPage);
  };

  function populateAdminTopBannerForm(page) {
    const notice = allPageNotices[page] || null;

    const toggle = document.getElementById('topBannerEnableToggle');
    const styleSelect = document.getElementById('topBannerStyleSelect');
    const titleInput = document.getElementById('topBannerTitleInput');
    const contentInput = document.getElementById('topBannerContentInput');
    const btnTextInput = document.getElementById('topBannerBtnTextInput');
    const btnLinkInput = document.getElementById('topBannerBtnLinkInput');
    const dismissibleCheck = document.getElementById('topBannerDismissibleCheck');
    const cooldownSelect = document.getElementById('topBannerCooldownSelect');
    const cooldownGroup = document.getElementById('topBannerCooldownGroup');
    const btnDelete = document.getElementById('btnAdminDeleteTopBanner');

    if (notice) {
      if (toggle) toggle.checked = !!notice.enabled;
      if (styleSelect) styleSelect.value = notice.style || 'announcement';
      if (titleInput) titleInput.value = notice.title || '';
      if (contentInput) contentInput.value = notice.content || '';
      if (btnTextInput) btnTextInput.value = notice.btnText || '';
      if (btnLinkInput) btnLinkInput.value = notice.btnLink || '';
      const isDismissible = (notice.dismissible !== false);
      if (dismissibleCheck) dismissibleCheck.checked = isDismissible;
      if (cooldownSelect) cooldownSelect.value = (notice.cooldownMinutes !== undefined && notice.cooldownMinutes !== null) ? String(notice.cooldownMinutes) : '5';
      if (cooldownGroup) cooldownGroup.style.opacity = isDismissible ? '1' : '0.4';
      if (btnDelete) btnDelete.style.display = 'inline-flex';
      updateTopBannerStatusBadge(!!notice.enabled);
    } else {
      if (toggle) toggle.checked = false;
      if (styleSelect) styleSelect.value = 'announcement';
      if (titleInput) titleInput.value = '';
      if (contentInput) contentInput.value = '';
      if (btnTextInput) btnTextInput.value = '';
      if (btnLinkInput) btnLinkInput.value = '';
      if (dismissibleCheck) dismissibleCheck.checked = true;
      if (cooldownSelect) cooldownSelect.value = '5';
      if (cooldownGroup) cooldownGroup.style.opacity = '1';
      if (btnDelete) btnDelete.style.display = 'none';
      updateTopBannerStatusBadge(false);
    }

    updateAdminTopBannerLivePreview();
  }

  function renderAdminTopBannersTable() {
    const tbody = document.getElementById('adminTopBannersTableBody');
    const countBadge = document.getElementById('activeTopBannersCountBadge');
    if (!tbody) return;

    const pages = Object.keys(allPageNotices);
    if (countBadge) {
      const activeCount = pages.filter(p => allPageNotices[p]?.enabled).length;
      countBadge.textContent = `${activeCount} Active / ${pages.length} Total`;
    }

    if (pages.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 24px; color: var(--on-variant);">
            No custom page banners configured yet. Select a page above to create one!
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = pages.map(page => {
      const n = allPageNotices[page];
      const pageLabel = PAGE_LABELS[page] || page;
      const styleName = n.style || 'announcement';
      const isAct = !!n.enabled;
      const cooldownLabel = n.dismissible === false 
        ? 'Permanent' 
        : (n.cooldownMinutes === 'never' 
            ? 'Until Update' 
            : (String(n.cooldownMinutes) === '0' ? 'Every Reload' : `${n.cooldownMinutes || 5}m Cooldown`));

      return `
        <tr>
          <td>
            <strong style="color: var(--on-surface); font-size: 12.5px;">${escapeNoticeHtml(pageLabel)}</strong>
            <div style="font-size: 11px; color: var(--on-variant);">${page}</div>
          </td>
          <td>
            <span class="page-notice-title" style="font-size: 10px; width: fit-content; background: rgba(255,255,255,0.08); border: 1px solid var(--outline-variant); color: var(--on-surface);">${styleName.toUpperCase()}</span>
            <div style="font-size: 10px; color: var(--tertiary); margin-top: 3px; font-weight: 600;">⏱️ ${cooldownLabel}</div>
          </td>
          <td>
            ${n.title ? `<div style="font-weight: 700; font-size: 12px; margin-bottom: 2px; color: var(--on-surface);">${escapeNoticeHtml(n.title)}</div>` : ''}
            <div style="font-size: 11.5px; color: var(--on-variant); max-width: 320px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeNoticeHtml(n.content || 'No content')}</div>
          </td>
          <td>
            <span style="font-size: 11px; font-weight: 700; color: ${isAct ? '#a3e635' : '#ef4444'}; background: ${isAct ? 'rgba(163,230,53,0.1)' : 'rgba(239,68,68,0.1)'}; border: 1px solid ${isAct ? 'rgba(163,230,53,0.25)' : 'rgba(239,68,68,0.25)'}; padding: 3px 10px; border-radius: 12px; display: inline-flex; align-items: center; gap: 5px;">
              <span style="width: 5px; height: 5px; border-radius: 50%; background: ${isAct ? '#a3e635' : '#ef4444'};"></span>
              ${isAct ? 'Active' : 'Inactive'}
            </span>
          </td>
          <td style="text-align: right;">
            <div style="display: inline-flex; gap: 6px; align-items: center;">
              <button type="button" class="btn btn-dark small" style="padding: 4px 10px; font-size: 11px; border-radius: 6px;" onclick="window.editAdminTopBanner('${page}')">
                ✏️ Edit
              </button>
              <button type="button" class="btn btn-dark small" style="padding: 4px 10px; font-size: 11px; border-radius: 6px;" onclick="window.toggleAdminTopBannerStatus('${page}')">
                ${isAct ? '⏸️ Disable' : '▶️ Enable'}
              </button>
              <button type="button" class="btn btn-dark small" style="padding: 4px 8px; font-size: 11px; border-radius: 6px; color: #f87171;" onclick="window.deleteAdminTopBanner('${page}')" title="Delete">
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  window.editAdminTopBanner = function(page) {
    const select = document.getElementById('topBannerPageSelect');
    if (select) {
      select.value = page;
      populateAdminTopBannerForm(page);
      select.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  window.toggleAdminTopBannerStatus = async function(page) {
    const notice = allPageNotices[page];
    if (!notice) return;
    notice.enabled = !notice.enabled;
    notice.updatedAt = Date.now();

    // 1. Sync to Firestore
    if (firebaseDb) {
      try {
        await firebaseDb.collection('page_notices').doc(page).set(notice);
      } catch (fErr) {
        console.warn('[Firestore Notice Toggle Error]:', fErr.message);
      }
    }

    // 2. Sync to Backend API
    try {
      const res = await fetch(resolveApiUrl('/api/admin/page-notices'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notice)
      });
      const json = await res.json();
      if (json && json.ok && json.notices) {
        allPageNotices = Object.assign({}, allPageNotices, json.notices);
      }
    } catch (_) {}

    renderAdminTopBannersTable();
    populateAdminTopBannerForm(document.getElementById('topBannerPageSelect')?.value || page);
    window.evaluatePageNoticeBanner();
    if (window.showCustomToast) {
      window.showCustomToast(`Banner ${notice.enabled ? 'activated' : 'deactivated'} for ${PAGE_LABELS[page] || page}!`, 'info');
    }
  };

  window.deleteAdminTopBanner = async function(page) {
    if (!page) {
      page = document.getElementById('topBannerPageSelect')?.value;
    }
    if (!page) return;

    if (!confirm(`Are you sure you want to delete the banner for ${PAGE_LABELS[page] || page}?`)) {
      return;
    }

    // 1. Sync deletion to Firestore
    if (firebaseDb) {
      try {
        await firebaseDb.collection('page_notices').doc(page).delete();
      } catch (fErr) {
        console.warn('[Firestore Notice Delete Error]:', fErr.message);
      }
    }

    // 2. Sync deletion to Backend API
    try {
      const res = await fetch(resolveApiUrl('/api/admin/page-notices/delete'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page })
      });
      const json = await res.json();
      if (json && json.ok && json.notices) {
        allPageNotices = json.notices;
      } else {
        delete allPageNotices[page];
      }
    } catch (e) {
      delete allPageNotices[page];
    }

    try {
      localStorage.setItem('gravity_all_page_notices', JSON.stringify(allPageNotices));
    } catch (_) {}

    renderAdminTopBannersTable();
    populateAdminTopBannerForm(page);
    window.evaluatePageNoticeBanner();
    if (window.showCustomToast) {
      window.showCustomToast('Banner deleted successfully!', 'info');
    }
  };

  window.saveAdminTopBannerConfig = async function() {
    const btn = document.getElementById('btnAdminSaveTopBanner');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Saving...';
    }

    const page = document.getElementById('topBannerPageSelect')?.value || 'all';
    const enabled = document.getElementById('topBannerEnableToggle')?.checked || false;
    const style = document.getElementById('topBannerStyleSelect')?.value || 'announcement';
    const title = document.getElementById('topBannerTitleInput')?.value.trim() || '';
    const content = document.getElementById('topBannerContentInput')?.value.trim() || '';
    const btnText = document.getElementById('topBannerBtnTextInput')?.value.trim() || '';
    const btnLink = document.getElementById('topBannerBtnLinkInput')?.value.trim() || '';
    const dismissible = document.getElementById('topBannerDismissibleCheck')?.checked !== false;
    const cooldownMinutes = document.getElementById('topBannerCooldownSelect')?.value || '5';
    const updatedAt = Date.now();

    const bannerData = {
      page,
      enabled,
      style,
      title,
      content,
      btnText,
      btnLink,
      dismissible,
      cooldownMinutes,
      updatedAt
    };

    allPageNotices[page] = bannerData;
    try {
      localStorage.setItem('gravity_all_page_notices', JSON.stringify(allPageNotices));
    } catch (_) {}

    // 1. Sync save to Firestore (Immediately updates all users in realtime)
    if (firebaseDb) {
      try {
        await firebaseDb.collection('page_notices').doc(page).set(bannerData);
        console.log('[Firestore Page Notice]: Saved successfully to Firestore cloud.');
      } catch (fErr) {
        console.warn('[Firestore Notice Save Error]:', fErr.message);
      }
    }

    // 2. Sync save to Backend REST API (MongoDB Atlas / local file)
    try {
      const res = await fetch(resolveApiUrl('/api/admin/page-notices'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bannerData)
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.ok && json.notices) {
          allPageNotices = Object.assign({}, allPageNotices, json.notices);
        }
      }
    } catch (err) {
      console.warn('[Save Top Banner Backend API Error]:', err);
    }

    renderAdminTopBannersTable();
    populateAdminTopBannerForm(page);
    window.evaluatePageNoticeBanner();

    if (window.showCustomToast) {
      const pageLabel = PAGE_LABELS[page] || page;
      window.showCustomToast(`Banner configuration for ${pageLabel} saved successfully!`, 'success');
    }

    if (btn) {
      btn.disabled = false;
      btn.textContent = '💾 Save Banner Configuration';
    }
  };

  // Wire Top Banner Event Listeners
  const topBannerPageSelectEl = document.getElementById('topBannerPageSelect');
  if (topBannerPageSelectEl) {
    topBannerPageSelectEl.addEventListener('change', (e) => {
      populateAdminTopBannerForm(e.target.value);
    });
  }

  const btnNewTopBannerEl = document.getElementById('btnAdminNewTopBanner');
  if (btnNewTopBannerEl) {
    btnNewTopBannerEl.addEventListener('click', () => {
      const page = document.getElementById('topBannerPageSelect')?.value || 'all';
      populateAdminTopBannerForm(page);
      document.getElementById('topBannerContentInput')?.focus();
    });
  }

  const btnDeleteTopBannerEl = document.getElementById('btnAdminDeleteTopBanner');
  if (btnDeleteTopBannerEl) {
    btnDeleteTopBannerEl.addEventListener('click', () => {
      window.deleteAdminTopBanner();
    });
  }

  const btnSaveTopBanner = document.getElementById('btnAdminSaveTopBanner');
  if (btnSaveTopBanner) {
    btnSaveTopBanner.addEventListener('click', window.saveAdminTopBannerConfig);
  }

  const topBannerToggleInput = document.getElementById('topBannerEnableToggle');
  if (topBannerToggleInput) {
    topBannerToggleInput.addEventListener('change', (e) => {
      updateTopBannerStatusBadge(e.target.checked);
    });
  }

  const topBannerDismissCheck = document.getElementById('topBannerDismissibleCheck');
  if (topBannerDismissCheck) {
    topBannerDismissCheck.addEventListener('change', (e) => {
      const grp = document.getElementById('topBannerCooldownGroup');
      if (grp) grp.style.opacity = e.target.checked ? '1' : '0.4';
    });
  }

  // Live preview listeners for Top Banner
  ['topBannerTitleInput', 'topBannerContentInput', 'topBannerBtnTextInput', 'topBannerBtnLinkInput'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateAdminTopBannerLivePreview);
  });
  ['topBannerStyleSelect', 'topBannerDismissibleCheck', 'topBannerCooldownSelect'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', updateAdminTopBannerLivePreview);
  });


  // =========================================================================
  // ORIGINAL NOTICE POPUP MODAL SYSTEM (কাস্টম নোটিশ পপ-আপ)
  // Controlled via #adminSectionNotice & #adminNavNotice
  // Stored in Firestore doc ('settings' -> 'notice') & localStorage 'gravity_notice_popup_settings'
  // Displays modal #noticePopupModal
  // =========================================================================

  let activeNoticePopupConfig = null;
  let noticePopupConfigFetched = false;

  function updateNoticePopupBadge(enabled) {
    const badge = document.getElementById('noticeStatusBadge');
    if (!badge) return;
    if (enabled) {
      badge.style.color = '#a3e635';
      badge.style.background = 'rgba(163, 230, 53, 0.1)';
      badge.style.borderColor = 'rgba(163, 230, 53, 0.2)';
      badge.innerHTML = `<span style="width: 6.5px; height: 6.5px; border-radius: 50%; background: #a3e635;"></span> Active`;
    } else {
      badge.style.color = '#ef4444';
      badge.style.background = 'rgba(239, 68, 68, 0.1)';
      badge.style.borderColor = 'rgba(239, 68, 68, 0.2)';
      badge.innerHTML = `<span style="width: 6.5px; height: 6.5px; border-radius: 50%; background: #ef4444;"></span> Inactive`;
    }
  }

  // Close the popup modal
  window.closeNoticePopup = function() {
    const modal = document.getElementById('noticePopupModal');
    if (modal) modal.classList.add('hidden');
    if (activeNoticePopupConfig && activeNoticePopupConfig.page) {
      localStorage.setItem('gravity_dismissed_popup_' + activeNoticePopupConfig.page, String(activeNoticePopupConfig.updatedAt || 'dismissed'));
    }
  };

  // Check and display the modal popup notification
  window.checkAndShowNoticePopup = async function() {
    if (!noticePopupConfigFetched) {
      if (firebaseDb) {
        try {
          const doc = await firebaseDb.collection('settings').doc('notice').get();
          if (doc.exists) {
            activeNoticePopupConfig = doc.data();
          }
        } catch (err) {
          console.warn('[Fetch active popup notice Firestore failed]:', err);
        }
      }
      if (!activeNoticePopupConfig) {
        try {
          activeNoticePopupConfig = JSON.parse(localStorage.getItem('gravity_notice_popup_settings') || 'null');
        } catch (e) {
          console.warn('[Fetch active popup notice localStorage failed]:', e);
        }
      }
      noticePopupConfigFetched = true;
    }

    const modal = document.getElementById('noticePopupModal');
    if (!modal) return;

    if (!activeNoticePopupConfig || !activeNoticePopupConfig.enabled) {
      modal.classList.add('hidden');
      return;
    }

    // Don't show inside admin workspace
    const adminPanelView = document.getElementById('adminPanelView');
    const isAdminOpen = adminPanelView && !adminPanelView.classList.contains('hidden');
    if (isAdminOpen) {
      modal.classList.add('hidden');
      return;
    }

    let currentPath = window.location.pathname || '/';
    if (currentPath === '' || currentPath === '/') currentPath = '/dashboard';
    if (currentPath === '/Vectorizer') currentPath = '/vectorizer';

    const targetPage = activeNoticePopupConfig.page || 'all';
    let shouldShow = false;
    if (targetPage === 'all') {
      shouldShow = true;
    } else {
      shouldShow = (currentPath === targetPage || window.location.pathname === targetPage);
    }

    if (!shouldShow) {
      modal.classList.add('hidden');
      return;
    }

    // Check if dismissed
    const dismissedVer = localStorage.getItem('gravity_dismissed_popup_' + targetPage);
    if (dismissedVer && String(dismissedVer) === String(activeNoticePopupConfig.updatedAt || 'dismissed')) {
      modal.classList.add('hidden');
      return;
    }

    // Populate Modal
    const titleEl = document.getElementById('noticePopupTitle');
    const contentEl = document.getElementById('noticePopupContent');
    const imageEl = document.getElementById('noticePopupImage');
    const btnEl = document.getElementById('noticePopupBtn');

    if (titleEl) titleEl.textContent = activeNoticePopupConfig.title || 'Notice';
    if (contentEl) contentEl.textContent = activeNoticePopupConfig.content || '';
    
    if (imageEl) {
      if (activeNoticePopupConfig.imageUrl) {
        imageEl.src = convertDriveUrlToDirectLink(activeNoticePopupConfig.imageUrl);
        imageEl.style.display = 'block';
      } else {
        imageEl.style.display = 'none';
      }
    }

    if (btnEl) {
      if (activeNoticePopupConfig.btnText && activeNoticePopupConfig.btnLink) {
        btnEl.textContent = activeNoticePopupConfig.btnText;
        btnEl.href = activeNoticePopupConfig.btnLink;
        btnEl.style.display = 'flex';
        btnEl.onclick = function(e) {
          const link = activeNoticePopupConfig.btnLink;
          if (link.startsWith('/') && !link.startsWith('//')) {
            e.preventDefault();
            window.closeNoticePopup();
            if (window.navigateTo) window.navigateTo(link);
            else window.location.pathname = link;
          }
        };
      } else {
        btnEl.style.display = 'none';
      }
    }

    modal.classList.remove('hidden');
  };

  // Load configuration into Admin Popup Notice form (#adminSectionNotice)
  window.loadAdminPopupNoticeConfig = async function() {
    let data = null;
    if (firebaseDb) {
      try {
        const doc = await firebaseDb.collection('settings').doc('notice').get();
        if (doc.exists) {
          data = doc.data();
        }
      } catch (err) {
        console.warn('[Load Notice Config Firestore Error, falling back to local]:', err);
      }
    }
    
    if (!data) {
      try {
        data = JSON.parse(localStorage.getItem('gravity_notice_popup_settings') || 'null');
      } catch (e) {
        console.warn('[Load Notice Config LocalStorage Error]:', e);
      }
    }

    if (data) {
      activeNoticePopupConfig = data;
      const toggle = document.getElementById('noticeEnableToggle');
      if (toggle) {
        toggle.checked = !!data.enabled;
        updateNoticePopupBadge(toggle.checked);
      }
      const titleInput = document.getElementById('noticeTitleInput');
      if (titleInput) titleInput.value = data.title || '';
      const pageSelect = document.getElementById('noticePageSelect');
      if (pageSelect) pageSelect.value = data.page || 'all';
      const contentInput = document.getElementById('noticeContentInput');
      if (contentInput) contentInput.value = data.content || '';
      const imageInput = document.getElementById('noticeImageInput');
      if (imageInput) imageInput.value = data.imageUrl || '';
      const btnTextInput = document.getElementById('noticeBtnTextInput');
      if (btnTextInput) btnTextInput.value = data.btnText || '';
      const btnLinkInput = document.getElementById('noticeBtnLinkInput');
      if (btnLinkInput) btnLinkInput.value = data.btnLink || '';
    } else {
      const toggle = document.getElementById('noticeEnableToggle');
      if (toggle) {
        toggle.checked = false;
        updateNoticePopupBadge(false);
      }
    }
  };

  // Compatibility alias
  window.loadAdminNoticeConfig = window.loadAdminPopupNoticeConfig;

  // Save Admin Popup Notice configuration
  window.saveAdminPopupNoticeConfig = async function() {
    const btn = document.getElementById('btnAdminSaveNotice');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Saving...';
    }

    const enabled = document.getElementById('noticeEnableToggle')?.checked || false;
    const title = document.getElementById('noticeTitleInput')?.value.trim() || '';
    const page = document.getElementById('noticePageSelect')?.value || 'all';
    const content = document.getElementById('noticeContentInput')?.value.trim() || '';
    const imageUrl = document.getElementById('noticeImageInput')?.value.trim() || '';
    const btnText = document.getElementById('noticeBtnTextInput')?.value.trim() || '';
    const btnLink = document.getElementById('noticeBtnLinkInput')?.value.trim() || '';
    const updatedAt = Date.now();

    const noticeData = {
      enabled,
      title,
      page,
      content,
      imageUrl,
      btnText,
      btnLink,
      updatedAt
    };

    try {
      localStorage.setItem('gravity_notice_popup_settings', JSON.stringify(noticeData));
    } catch (e) {
      console.warn('[Save Notice Config LocalStorage Error]:', e);
    }

    let savedFirestore = false;
    let firestoreError = null;
    if (firebaseDb) {
      try {
        await firebaseDb.collection('settings').doc('notice').set(noticeData);
        savedFirestore = true;
      } catch (err) {
        console.error('[Save Notice Config Firestore Error]:', err);
        firestoreError = err.message || String(err);
      }
    }

    activeNoticePopupConfig = noticeData;
    updateNoticePopupBadge(enabled);

    if (window.showCustomToast) {
      if (savedFirestore) {
        window.showCustomToast('Popup Notice configuration saved to database!', 'success');
      } else {
        const errorDetail = firestoreError ? ` (${firestoreError})` : '';
        window.showCustomToast(`Saved popup notice configuration locally.${errorDetail}`, 'info');
      }
    }

    if (btn) {
      btn.disabled = false;
      btn.textContent = '💾 Save Notice Configuration';
    }
  };

  // Compatibility alias
  window.saveAdminNoticeConfig = window.saveAdminPopupNoticeConfig;

  // Test / Preview Notice Popup Modal directly from Admin Panel
  window.previewAdminPopupNotice = function() {
    const title = document.getElementById('noticeTitleInput')?.value.trim() || 'Notice Title Preview';
    const content = document.getElementById('noticeContentInput')?.value.trim() || 'This is how your popup notification will look to users.';
    const imageUrl = document.getElementById('noticeImageInput')?.value.trim() || '';
    const btnText = document.getElementById('noticeBtnTextInput')?.value.trim() || '';
    const btnLink = document.getElementById('noticeBtnLinkInput')?.value.trim() || '#';

    const modal = document.getElementById('noticePopupModal');
    const titleEl = document.getElementById('noticePopupTitle');
    const contentEl = document.getElementById('noticePopupContent');
    const imageEl = document.getElementById('noticePopupImage');
    const btnEl = document.getElementById('noticePopupBtn');

    if (modal) {
      if (titleEl) titleEl.textContent = title;
      if (contentEl) contentEl.textContent = content;
      if (imageEl) {
        if (imageUrl) {
          imageEl.src = convertDriveUrlToDirectLink(imageUrl);
          imageEl.style.display = 'block';
        } else {
          imageEl.style.display = 'none';
        }
      }
      if (btnEl) {
        if (btnText) {
          btnEl.textContent = btnText;
          btnEl.href = btnLink;
          btnEl.style.display = 'flex';
        } else {
          btnEl.style.display = 'none';
        }
      }
      modal.classList.remove('hidden');
    }
  };

  // Wire Admin Popup Notice Event Listeners
  const btnSaveNotice = document.getElementById('btnAdminSaveNotice');
  if (btnSaveNotice) {
    btnSaveNotice.addEventListener('click', window.saveAdminPopupNoticeConfig);
  }

  const btnTestNoticePopup = document.getElementById('btnAdminTestNoticePopup');
  if (btnTestNoticePopup) {
    btnTestNoticePopup.addEventListener('click', window.previewAdminPopupNotice);
  }

  const noticeToggleInput = document.getElementById('noticeEnableToggle');
  if (noticeToggleInput) {
    noticeToggleInput.addEventListener('change', (e) => {
      updateNoticePopupBadge(e.target.checked);
    });
  }


  // ===== Chrome Extension Setup Modal Handlers =====
  const btnSetupExtensionModal = document.getElementById('btnSetupExtensionModal');
  const extensionSetupModal = document.getElementById('extensionSetupModal');
  const btnCloseExtensionSetupModal = document.getElementById('btnCloseExtensionSetupModal');
  const btnConfirmExtensionLoaded = document.getElementById('btnConfirmExtensionLoaded');
  const btnCopyExtensionsUrl = document.getElementById('btnCopyExtensionsUrl');
  const copyUrlStatus = document.getElementById('copyUrlStatus');

  if (btnSetupExtensionModal && extensionSetupModal) {
    btnSetupExtensionModal.addEventListener('click', () => {
      extensionSetupModal.classList.remove('hidden');
    });
  }

  // ===== Connection Alert Modal Handlers =====
  const flowConnectionAlertModal = document.getElementById('flowConnectionAlertModal');
  const btnCloseConnectionAlertModal = document.getElementById('btnCloseConnectionAlertModal');
  const btnModalFlowOpen = document.getElementById('btnModalFlowOpen');
  const btnModalFlowConnect = document.getElementById('btnModalFlowConnect');

  if (btnCloseConnectionAlertModal) {
    btnCloseConnectionAlertModal.addEventListener('click', () => {
      if (flowConnectionAlertModal) flowConnectionAlertModal.classList.add('hidden');
    });
  }

  if (flowConnectionAlertModal) {
    flowConnectionAlertModal.addEventListener('click', (e) => {
      if (e.target === flowConnectionAlertModal) {
        flowConnectionAlertModal.classList.add('hidden');
      }
    });
  }

  if (btnModalFlowOpen && btnFlowOpen) {
    btnModalFlowOpen.addEventListener('click', () => {
      btnFlowOpen.click();
    });
  }

  if (btnModalFlowConnect && btnFlowConnect) {
    btnModalFlowConnect.addEventListener('click', () => {
      btnFlowConnect.click();
    });
  }

  const closeExtensionModal = () => {
    if (extensionSetupModal) {
      extensionSetupModal.classList.add('hidden');
    }
  };

  if (btnCloseExtensionSetupModal) {
    btnCloseExtensionSetupModal.addEventListener('click', closeExtensionModal);
  }
  if (btnConfirmExtensionLoaded) {
    btnConfirmExtensionLoaded.addEventListener('click', closeExtensionModal);
  }

  if (extensionSetupModal) {
    extensionSetupModal.addEventListener('click', (e) => {
      if (e.target === extensionSetupModal) {
        closeExtensionModal();
      }
    });
  }

  if (btnCopyExtensionsUrl) {
    btnCopyExtensionsUrl.addEventListener('click', () => {
      navigator.clipboard.writeText('chrome://extensions')
        .then(() => {
          if (copyUrlStatus) {
            copyUrlStatus.style.display = 'inline';
            setTimeout(() => {
              copyUrlStatus.style.display = 'none';
            }, 3000);
          }
        })
        .catch(err => {
          console.error('[Copy Error]:', err);
          // Fallback copy using input copy trick
          const el = document.createElement('textarea');
          el.value = 'chrome://extensions';
          document.body.appendChild(el);
          el.select();
          document.execCommand('copy');
          document.body.removeChild(el);
          if (copyUrlStatus) {
            copyUrlStatus.style.display = 'inline';
            setTimeout(() => {
              copyUrlStatus.style.display = 'none';
            }, 3000);
          }
        });
    });
  }

  // Central Routing System
  window.navigateTo = navigateTo;

  // Central Routing System
  function handleRouting() {
    let path = window.location.pathname;
    const pricingView = document.getElementById('pricingView');
    const checkoutView = document.getElementById('checkoutView');

    // Reset fullpage body modifiers
    document.body.classList.remove('pricing-page-active');
    document.body.classList.remove('checkout-page-active');

    if (!path || path === '/' || path === '/dashboard') {
      if (dashboardView) dashboardView.classList.remove('hidden');
      if (studioView) studioView.classList.add('hidden');
      if (tool2View) tool2View.classList.add('hidden');
      if (tool3View) tool3View.classList.add('hidden');
      const t4 = document.getElementById('tool4View');
      if (t4) t4.classList.add('hidden');
      if (pricingView) pricingView.classList.add('hidden');
      if (checkoutView) checkoutView.classList.add('hidden');
      if (backToDashBtn) backToDashBtn.style.display = 'none';
      if (pageTitle) pageTitle.textContent = 'Studio Dashboard';
      if (appBody) appBody.classList.remove('in-tool-view');
      setSidebarActive('dashboard');
    } else if (path === '/pricing') {
      const views = ['#dashboardView', '#adminPanelView', '#studioView', '#tool2View', '#tool3View', '#tool4View', '#iconSheetSlicerSection', '#checkoutView'];
      views.forEach(sel => {
        const el = document.querySelector(sel);
        if (el) el.classList.add('hidden');
      });
      if (pricingView) pricingView.classList.remove('hidden');
      document.body.classList.add('pricing-page-active');
      if (appBody) appBody.classList.remove('in-tool-view');
      if (pageTitle) pageTitle.textContent = "💳 Pricing Plans";
      const titleBadge = document.getElementById('pageTitleBadge');
      if (titleBadge) titleBadge.classList.add('hidden');
      document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    } else if (path.startsWith('/checkout')) {
      const views = ['#dashboardView', '#adminPanelView', '#studioView', '#tool2View', '#tool3View', '#tool4View', '#iconSheetSlicerSection', '#pricingView'];
      views.forEach(sel => {
        const el = document.querySelector(sel);
        if (el) el.classList.add('hidden');
      });
      if (checkoutView) checkoutView.classList.remove('hidden');
      document.body.classList.add('checkout-page-active');
      if (appBody) appBody.classList.remove('in-tool-view');

      let checkoutPlan = 'six_months';
      if (path.includes('monthly')) {
        checkoutPlan = 'monthly';
      }
      window.initializeFullCheckout(checkoutPlan);
    } else if (path === '/promptgen') {
      hasOpenedTool = true;
      launchTool1();
      setSidebarActive('icon-sheet-prompt');
    } else if (path === '/flowgen') {
      hasOpenedTool = true;
      launchTool3();
      setSidebarActive('google-flow-gen');
    } else if (path === '/slicer' || path === '/vectorizer' || path === '/Vectorizer') {
      hasOpenedTool = true;
      launchTool4();
      setSidebarActive('icon-sheet-slicer');
    } else if (path === '/bannergen') {
      hasOpenedTool = true;
      launchTool2();
      setSidebarActive('icon-pack-banner');
    }
    
    // Evaluate top page notification banner & popup notice on page routing transitions
    if (window.evaluatePageNoticeBanner) {
      window.evaluatePageNoticeBanner();
    }
    if (window.checkAndShowNoticePopup) {
      window.checkAndShowNoticePopup();
    }
  }

  // Scroll Reveal Observer for Landing Page
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  revealElements.forEach(el => el.classList.add('revealed'));
  if ('IntersectionObserver' in window && revealElements.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, { threshold: 0.08 });
    revealElements.forEach(el => observer.observe(el));
  }

  // --- Subscription Purchase Checkout Modal Logic (Overridden to full page checkout) ---
  let currentCheckoutPlan = 'monthly';
  let currentPaymentMethod = 'bkash';

  window.selectCheckoutPlan = function(plan) {
    // modal fallback
  };

  window.selectPaymentMethod = function(method) {
    // modal fallback
  };

  window.openCheckoutModal = function(plan) {
    const selectedPlan = plan || 'monthly';
    window.navigateTo('/checkout/' + selectedPlan);
  };

  window.closeCheckoutModal = function() {
    window.navigateTo('/dashboard');
  };

  const btnCloseCheckoutModal = document.getElementById('btnCloseCheckoutModal');
  const btnCancelCheckout = document.getElementById('btnCancelCheckout');
  const userSubBadge = document.getElementById('userSubscriptionBadge');

  if (userSubBadge) {
    userSubBadge.style.cursor = 'pointer';
    userSubBadge.title = 'View Subscription Details';
    userSubBadge.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (typeof window.openSubStatusModal === 'function') {
        window.openSubStatusModal();
      }
    });
  }

  if (btnCloseCheckoutModal) btnCloseCheckoutModal.addEventListener('click', window.closeCheckoutModal);
  if (btnCancelCheckout) btnCancelCheckout.addEventListener('click', window.closeCheckoutModal);

  // Intercept Landing Page Pricing Upgrade button triggers to pop checkout modal
  const upgradeBtn = document.querySelector('.pricing-plan-card.popular .btn-plan-select');
  if (upgradeBtn) {
    upgradeBtn.addEventListener('click', (e) => {
      if (firebaseAuth && firebaseAuth.currentUser) {
        e.preventDefault();
        e.stopPropagation();
        window.openCheckoutModal('monthly');
      }
    });
  }
  const pricingSelectBtns = document.querySelectorAll('.pricing-plan-card .btn-plan-select');
  pricingSelectBtns.forEach((btn, idx) => {
    btn.addEventListener('click', (e) => {
      if (firebaseAuth && firebaseAuth.currentUser) {
        e.preventDefault();
        e.stopPropagation();
        if (idx === 0) {
          showCustomAlert('You are already on the Starter (Free) plan.', '🌱 Free Plan');
        } else if (idx === 1) { // Pro Plan
          window.openCheckoutModal('monthly');
        } else if (idx === 2) { // Team -> 6 Months Pro
          window.openCheckoutModal('six_months');
        }
      }
    });
  });

  // --- Full-Page Checkout Logic ---
  let currentFullCheckoutPlan = 'six_months';
  let currentFullCheckoutMethod = 'bkash';

  window.initializeFullCheckout = function(plan) {
    currentFullCheckoutPlan = plan;
    const titleEl = document.getElementById('checkoutLeftPlanTitle');
    const durationEl = document.getElementById('checkoutLeftPlanDuration');
    const priceEl = document.getElementById('checkoutLeftPlanPrice');

    if (plan === 'six_months') {
      if (titleEl) titleEl.textContent = '6 MONTHS PRO';
      if (durationEl) durationEl.textContent = '6 Months';
      if (priceEl) priceEl.textContent = '৳500';
    } else {
      if (titleEl) titleEl.textContent = 'MONTHLY PRO';
      if (durationEl) durationEl.textContent = '1 Month';
      if (priceEl) priceEl.textContent = '৳100';
    }

    // Default select bKash
    window.selectFullCheckoutMethod('bkash');
  };

  window.selectFullCheckoutMethod = function(method) {
    currentFullCheckoutMethod = method;
    
    // Update active tab buttons styling
    document.querySelectorAll('.checkout-method-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-method') === method) {
        btn.classList.add('active');
      }
    });

    const badgeEl = document.getElementById('paymentActiveBadge');
    const numberEl = document.getElementById('paymentActiveNumber');
    const qrContainer = document.getElementById('paymentActiveQR');
    const whatsappBtn = document.getElementById('paymentWhatsAppBtn');
    const instructionsEl = document.getElementById('fullPaymentInstructionsText');

    const phoneGroupEl = document.getElementById('checkoutSenderPhoneGroup');
    const submitBtnEl = document.getElementById('btnFullSubmitCheckout');
    const warningNoteEl = document.getElementById('checkoutWarningNote');

    // Default to show verification blocks
    if (phoneGroupEl) phoneGroupEl.style.display = 'flex';
    if (submitBtnEl) submitBtnEl.style.display = 'flex';
    if (warningNoteEl) warningNoteEl.style.display = 'block';

    const priceText = currentFullCheckoutPlan === 'monthly' ? '৳১০০' : '৳৫০০';

    if (whatsappBtn) {
      if (method === 'others') {
        whatsappBtn.style.display = 'inline-flex';
        whatsappBtn.href = `https://wa.me/8801855116827?text=Hello,%20I%20want%20to%20pay%20via%20others%20for%20GravityLab.%20Plan:%20${currentFullCheckoutPlan}`;
      } else {
        whatsappBtn.style.display = 'none';
      }
    }

    if (method === 'bkash') {
      if (badgeEl) {
        badgeEl.textContent = 'bKash Merchant';
        badgeEl.className = 'payment-badge bkash';
      }
      if (numberEl) numberEl.textContent = '01330342337';
      if (qrContainer) qrContainer.style.display = 'flex';
      
      if (instructionsEl) {
        instructionsEl.innerHTML = `
          ১. প্রথমে বিকাশ অ্যাপ থেকে <b>'পেমেন্ট' (Payment)</b> অপশনে যান।<br>
          ২. মার্চেন্ট নাম্বার বক্সে আমাদের বিকাশ নাম্বারটি <b class="checkout-highlight-text" style="font-size:13.5px; font-family:var(--mono);">01330342337</b> লিখুন অথবা বিকাশ অ্যাপ থেকে কিউআর কোডটি স্ক্যান করুন।<br>
          ৩. তারপর আপনার টাকার পরিমাণ <b>${priceText}</b> লিখুন।<br>
          ৪. এরপর এগিয়ে যান বাটনে প্রেস করুন।<br>
          ৫. আপনার পিন <b>(PIN)</b> নাম্বারটি দিয়ে পরবর্তীতে প্রেস করুন।<br>
          ৬. সবশেষে <b>'পেমেন্ট করতে ট্যাপ করে ধরে রাখুন'</b> বাটনে প্রেস করে পেমেন্ট সম্পন্ন করুন।
        `;
      }
    } else if (method === 'nagad') {
      if (badgeEl) {
        badgeEl.textContent = 'Nagad Personal';
        badgeEl.className = 'payment-badge nagad';
      }
      if (numberEl) numberEl.textContent = '01855116827';
      if (qrContainer) qrContainer.style.display = 'none';

      if (instructionsEl) {
        instructionsEl.innerHTML = `
          ১. প্রথমে নগদ অ্যাপটি ওপেন করুন।<br>
          ২. সেখান থেকে <b>'সেন্ড মানি' (Send Money)</b> অপশনে প্রেস করুন।<br>
          ৩. আপনার ১১ ডিজিটের নগদ নাম্বারটি <b class="checkout-highlight-text" style="font-size:13.5px; font-family:var(--mono);">01855116827</b> লিখুন।<br>
          ৪. আপনার পেমেন্ট এর পরিমাণ <b>${priceText}</b> লিখুন।<br>
          ৫. আপনার পিন <b>(PIN)</b> নাম্বারটি দিয়ে পেমেন্টটি কনফার্ম করুন।
        `;
      }
    } else if (method === 'others') {
      if (badgeEl) {
        badgeEl.textContent = 'Others / Contact Us';
        badgeEl.className = 'payment-badge others';
      }
      if (numberEl) numberEl.textContent = '01855116827';
      if (qrContainer) qrContainer.style.display = 'none';

      // Hide verification elements since others flow is WhatsApp-only
      if (phoneGroupEl) phoneGroupEl.style.display = 'none';
      if (submitBtnEl) submitBtnEl.style.display = 'none';
      if (warningNoteEl) warningNoteEl.style.display = 'none';

      if (instructionsEl) {
        instructionsEl.innerHTML = `
          ১. স্ক্রিল (Skrill), রকেট (Rocket), উপায় (Upay) বা অন্য কোনো মাধ্যমে পেমেন্ট করতে চাইলে আমাদের সাথে হোয়াটসঅ্যাপে যোগাযোগ করুন।<br>
          ২. সরাসরি চ্যাট করতে পাশে দেওয়া <b>💬 WhatsApp</b> বাটনে ক্লিক করুন।
        `;
      }
    }
  };

  window.copyPaymentNumber = function() {
    const numberEl = document.getElementById('paymentActiveNumber');
    if (numberEl) {
      const text = numberEl.textContent.trim();
      navigator.clipboard.writeText(text)
        .then(() => {
          showCustomAlert('Payment number copied: ' + text, '📋 Copied');
        })
        .catch(err => {
          showCustomAlert('Failed to copy: ' + err.message, '❌ Error');
        });
    }
  };

  const btnCheckoutBack = document.getElementById('btnCheckoutBack');
  if (btnCheckoutBack) {
    btnCheckoutBack.addEventListener('click', () => {
      window.navigateTo('/pricing');
    });
  }

  const btnFullSubmitCheckout = document.getElementById('btnFullSubmitCheckout');
  if (btnFullSubmitCheckout) {
    btnFullSubmitCheckout.addEventListener('click', () => {
      const phoneInput = document.getElementById('fullCheckoutPhoneInput');
      const senderPhone = phoneInput ? phoneInput.value.trim() : '';

      if (!senderPhone) {
        showCustomAlert('Please enter your sender mobile number.', '⚠️ Validation Error');
        return;
      }

      if (!firebaseAuth || !firebaseAuth.currentUser) {
        showCustomAlert('User credentials not loaded. Please sign in.', '⚠️ Auth Error');
        return;
      }

      const user = firebaseAuth.currentUser;
      const payload = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        plan: currentFullCheckoutPlan,
        method: currentFullCheckoutMethod,
        phone: senderPhone
      };

      btnFullSubmitCheckout.disabled = true;
      btnFullSubmitCheckout.textContent = 'Submitting...';

      fetch(resolveApiUrl('/api/subscriptions/request'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(res => res.json())
      .then(data => {
        btnFullSubmitCheckout.disabled = false;
        btnFullSubmitCheckout.textContent = '✓ Submit Payment';
        if (data && data.ok) {
          showCustomAlert('Your payment verification request has been successfully submitted! Admin will verify and activate your plan shortly.', '🎉 Request Submitted');
          window.navigateTo('/dashboard');
        } else {
          showCustomAlert(data.error || 'Failed to submit payment request', '❌ Submission Failed');
        }
      })
      .catch(err => {
        btnFullSubmitCheckout.disabled = false;
        btnFullSubmitCheckout.textContent = '✓ Submit Payment';
        showCustomAlert(err.message || 'Network error occurred', '❌ Submission Failed');
      });
    });
  }

  window.addEventListener('popstate', handleRouting);
  // Run on initial load
  handleRouting();

});
