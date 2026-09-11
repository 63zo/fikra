/**
 * Fikra (فكرة) - Voice Input & Speech-to-Text Controller
 * Uses Web Speech API (webkitSpeechRecognition / SpeechRecognition)
 * Supports Arabic (ar-SA) and English (en-US)
 */

const SpeechController = {
  recognition: null,
  isListening: false,
  activeTargetInputId: null,

  init() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported in this browser.');
      return false;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.updateListeningUI(true);
      };

      this.recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (this.activeTargetInputId) {
          const targetEl = document.getElementById(this.activeTargetInputId);
          if (targetEl) {
            const currentVal = targetEl.getAttribute('data-voice-base') || targetEl.value;
            const separator = currentVal.length > 0 && !currentVal.endsWith(' ') ? ' ' : '';
            targetEl.value = currentVal + separator + (finalTranscript || interimTranscript);
            
            // Trigger input event so AI Similarity listener catches the new words
            targetEl.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }
      };

      this.recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        this.stopListening();
        if (window.App && typeof window.App.showToast === 'function') {
          window.App.showToast(
            I18N.currentLang === 'ar' ? 'تعذر استخدام الميكروفون، يرجى التحقق من الأذونات.' : 'Microphone access error. Please check permissions.',
            'warning'
          );
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.updateListeningUI(false);
      };

      return true;
    } catch (e) {
      console.error('Failed to initialize speech recognition:', e);
      return false;
    }
  },

  toggleVoiceInput(targetInputId, triggerBtnId) {
    if (!this.recognition) {
      const initialized = this.init();
      if (!initialized) {
        if (window.App && typeof window.App.showToast === 'function') {
          window.App.showToast(I18N.t('voiceNotSupported'), 'error');
        }
        return;
      }
    }

    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening(targetInputId, triggerBtnId);
    }
  },

  startListening(targetInputId, triggerBtnId) {
    if (!this.recognition) return;
    this.activeTargetInputId = targetInputId;
    this.activeBtnId = triggerBtnId;

    const targetEl = document.getElementById(targetInputId);
    if (targetEl) {
      targetEl.setAttribute('data-voice-base', targetEl.value);
    }

    // Set recognition language
    this.recognition.lang = I18N.currentLang === 'ar' ? 'ar-SA' : 'en-US';

    try {
      this.recognition.start();
    } catch (e) {
      console.warn('Recognition start exception:', e);
    }
  },

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn('Recognition stop exception:', e);
      }
    }
    this.isListening = false;
    this.updateListeningUI(false);
  },

  updateListeningUI(isListening) {
    const banner = document.getElementById('voice-recording-banner');
    if (banner) {
      banner.style.display = isListening ? 'flex' : 'none';
    }

    const btns = document.querySelectorAll('.btn-voice-input');
    btns.forEach(btn => {
      if (isListening) {
        btn.classList.add('is-recording');
        btn.innerHTML = `<span class="voice-pulse-dot"></span> <span>${I18N.t('voiceStop')}</span>`;
      } else {
        btn.classList.remove('is-recording');
        btn.innerHTML = `<i class="mdi mdi-microphone"></i> <span>${I18N.t('voiceInputBtn')}</span>`;
      }
    });
  }
};

window.SpeechController = SpeechController;
