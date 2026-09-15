/**
 * Fikra (فكرة) - Main Application Controller & Router
 * Orchestrates views, real-time AI listeners, voice inputs, modals, and toasts.
 */

const App = {
  currentView: 'home', // 'home', 'submit_idea', 'my_ideas', 'committee', 'dashboard', 'leaderboard', 'admin', 'profile', 'login', 'register', 'forgot_password'
  similarityDebounceTimer: null,

  init() {
    I18N.init();
    State.init();

    // Set initial theme
    const savedTheme = localStorage.getItem('fikra_theme') || 'light';
    this.setTheme(savedTheme);

    // Initial routing
    if (!Auth.isLoggedIn()) {
      this.currentView = 'login';
    } else {
      this.currentView = 'home';
    }

    this.render();
    this.bindGlobalEvents();
  },

  setTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('fikra_theme', theme);
  },

  toggleTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    this.setTheme(isDark ? 'light' : 'dark');
    if (this.currentView === 'dashboard') {
      AnalyticsDashboard.render();
    }
  },

  toggleLanguage() {
    const nextLang = I18N.currentLang === 'ar' ? 'en' : 'ar';
    I18N.setLanguage(nextLang, true);
  },

  navigate(view) {
    // Auth guards
    if (!Auth.isLoggedIn() && view !== 'login' && view !== 'register' && view !== 'forgot_password') {
      this.currentView = 'login';
    } else {
      this.currentView = view;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.render();
  },

  render() {
    const appRoot = document.getElementById('app-root');
    if (!appRoot) return;

    if (!Auth.isLoggedIn() || this.currentView === 'login' || this.currentView === 'register' || this.currentView === 'forgot_password') {
      appRoot.innerHTML = this.renderAuthLayout();
      this.bindAuthEvents();
      return;
    }

    appRoot.innerHTML = `
      <div class="app-layout">
        ${this.renderHeader()}
        <div class="app-body">
          <main class="main-content container">
            ${this.renderActiveViewContent()}
          </main>
        </div>
        ${this.renderFooter()}
        ${this.renderMobileBottomNav()}
      </div>
    `;

    this.afterViewRender();
  },

  renderHeader() {
    const user = State.currentUser || {};
    const dept = State.getDepartment(user.departmentId);
    const isConn = window.SupabaseService && window.SupabaseService.isConnected;

    return `
      <!-- Top Demo Role Switcher & Cloud Status Banner -->
      <div class="top-role-bar">
        <div class="container top-role-container">
          <div class="top-role-left">
            <div id="cloud-sync-status-badge" class="cloud-sync-pill ${isConn ? 'connected' : 'error'}" onclick="SupabaseService.syncAllFromRemote(); App.showToast(I18N.currentLang === 'ar' ? 'جارٍ فحص المزامنة مع قاعدة البيانات...' : 'Checking database sync...', 'info');" title="انقر لتحديث ومزامنة البيانات السحابية فوراً">
              <span class="pulse-dot"></span>
              <span>${isConn ? (I18N.currentLang === 'ar' ? 'سحابي متصل' : 'Cloud Synced') : (I18N.currentLang === 'ar' ? 'يعمل محلياً' : 'Offline')}</span>
              <i class="mdi mdi-refresh text-xs"></i>
            </div>
          </div>

          <div class="top-role-right">
            <span class="role-switch-label"><i class="mdi mdi-account-switch"></i> ${I18N.currentLang === 'ar' ? 'التبديل السريع للأدوار:' : 'Quick Role Switch:'}</span>
            <div class="role-pill-group">
              <button class="role-pill-btn ${user.role === 'admin' ? 'active-admin' : ''}" onclick="App.switchDemoRole('admin')" title="الدخول كمدير النظام للوصول إلى لوحة التحكم والإعدادات">
                <i class="mdi mdi-shield-crown"></i> ${I18N.currentLang === 'ar' ? 'مدير النظام (Admin)' : 'Admin'}
              </button>
              <button class="role-pill-btn ${user.role === 'committee' ? 'active-comm' : ''}" onclick="App.switchDemoRole('committee')" title="الدخول كعضو لجنة التحكيم لتقييم الأفكار">
                <i class="mdi mdi-scale-balance"></i> ${I18N.currentLang === 'ar' ? 'لجنة التحكيم' : 'Committee'}
              </button>
              <button class="role-pill-btn ${user.role === 'employee' ? 'active-emp' : ''}" onclick="App.switchDemoRole('employee')" title="الدخول كموظف لتقديم وتصفح الأفكار">
                <i class="mdi mdi-lightbulb-on"></i> ${I18N.currentLang === 'ar' ? 'موظف' : 'Employee'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <header class="app-header">
        <div class="container header-container">
          <div class="header-brand" onclick="App.navigate('home')">
            <img src="assets/images/ub-logo.svg" alt="University of Bisha" class="header-logo" />
          </div>

          <nav class="desktop-nav">
            <button class="nav-link ${this.currentView === 'home' ? 'active' : ''}" onclick="App.navigate('home')">
              <i class="mdi mdi-lightbulb-outline"></i> ${I18N.t('navHome')}
            </button>
            <button class="nav-link btn-nav-highlight ${this.currentView === 'submit_idea' ? 'active' : ''}" onclick="App.navigate('submit_idea')">
              <i class="mdi mdi-plus-circle"></i> ${I18N.t('navSubmitIdea')}
            </button>
            <button class="nav-link ${this.currentView === 'committee' ? 'active' : ''}" onclick="App.navigate('committee')">
              <i class="mdi mdi-scale-balance"></i> ${I18N.t('navCommittee')}
              ${!Auth.isCommittee() && !Auth.isAdmin() ? `<span class="nav-badge-lock" title="مخصص للمحكمين"><i class="mdi mdi-lock"></i></span>` : ''}
            </button>
            <button class="nav-link ${this.currentView === 'dashboard' ? 'active' : ''}" onclick="App.navigate('dashboard')">
              <i class="mdi mdi-chart-box-outline"></i> ${I18N.t('navDashboard')}
            </button>
            <button class="nav-link ${this.currentView === 'leaderboard' ? 'active' : ''}" onclick="App.navigate('leaderboard')">
              <i class="mdi mdi-trophy-outline"></i> ${I18N.t('navLeaderboard')}
            </button>
            <button class="nav-link btn-admin-nav ${this.currentView === 'admin' ? 'active' : ''}" onclick="App.navigate('admin')">
              <i class="mdi mdi-cogs"></i> ${I18N.t('navAdmin')}
              ${!Auth.isAdmin() ? `<span class="nav-badge-lock" title="مخصص للمدير"><i class="mdi mdi-shield-account"></i></span>` : `<span class="nav-admin-dot"></span>`}
            </button>
          </nav>

          <div class="header-actions">
            <!-- Language Switcher -->
            <button class="btn-icon-action" onclick="App.toggleLanguage()" title="${I18N.t('langToggle')}">
              <i class="mdi mdi-translate"></i>
              <span class="btn-text-sm">${I18N.t('langToggle')}</span>
            </button>

            <!-- Dark / Light Theme -->
            <button class="btn-icon-action" onclick="App.toggleTheme()" title="${I18N.t('themeToggle')}">
              <i class="mdi mdi-theme-light-dark"></i>
            </button>

            <!-- User Menu -->
            <div class="user-profile-menu-wrap" onclick="App.navigate('profile')">
              <img src="${user.avatar || 'assets/images/fikra-logo.svg'}" class="user-header-avatar" />
              <div class="user-header-details">
                <span class="user-header-name">${user.fullName || ''}</span>
                <span class="user-header-role">${user.role === 'admin' ? '👑 مدير النظام' : user.role === 'committee' ? '⚖️ محكّم معتمد' : I18N.getText(dept.nameAr, dept.nameEn)}</span>
              </div>
            </div>

            <button class="btn-icon-action text-danger" onclick="Auth.logout(); App.navigate('login');" title="${I18N.t('navLogout')}">
              <i class="mdi mdi-logout-variant"></i>
            </button>
          </div>
        </div>
      </header>
    `;
  },

  switchDemoRole(role) {
    if (role === 'admin') {
      Auth.login('admin', 'Password123!');
      this.currentView = 'admin';
      this.render();
      this.showToast(I18N.currentLang === 'ar' ? '👑 تم تسجيل الدخول كمدير النظام (Admin) — مرحباً أ. خالد الحازمي' : '👑 Switched to Admin Account', 'success');
    } else if (role === 'committee') {
      Auth.login('committee', 'Password123!');
      this.currentView = 'committee';
      this.render();
      this.showToast(I18N.currentLang === 'ar' ? '⚖️ تم تسجيل الدخول كعضو لجنة التحكيم — مرحباً د. محمد القرني' : '⚖️ Switched to Committee Account', 'info');
    } else {
      Auth.login('employee', 'Password123!');
      this.currentView = 'home';
      this.render();
      this.showToast(I18N.currentLang === 'ar' ? '💡 تم تسجيل الدخول كموظف — مرحباً د. سارة الشهراني' : '💡 Switched to Employee Account', 'info');
    }
  },

  renderMobileBottomNav() {
    return `
      <nav class="mobile-bottom-nav">
        <button class="mobile-nav-item ${this.currentView === 'home' ? 'active' : ''}" onclick="App.navigate('home')">
          <i class="mdi mdi-lightbulb-outline"></i>
          <span>${I18N.t('navHome')}</span>
        </button>
        <button class="mobile-nav-item ${this.currentView === 'submit_idea' ? 'active' : ''}" onclick="App.navigate('submit_idea')">
          <i class="mdi mdi-plus-circle"></i>
          <span>${I18N.t('navSubmitIdea')}</span>
        </button>
        <button class="mobile-nav-item ${this.currentView === 'dashboard' ? 'active' : ''}" onclick="App.navigate('dashboard')">
          <i class="mdi mdi-chart-box-outline"></i>
          <span>${I18N.t('navDashboard')}</span>
        </button>
        <button class="mobile-nav-item ${this.currentView === 'profile' ? 'active' : ''}" onclick="App.navigate('profile')">
          <i class="mdi mdi-account-circle-outline"></i>
          <span>${I18N.t('navProfile')}</span>
        </button>
      </nav>
    `;
  },

  renderFooter() {
    return `
      <footer class="app-footer">
        <div class="container footer-content">
          <div class="footer-left">
            <p>© ${new Date().getFullYear()} ${I18N.t('universityName')} — ${I18N.t('appName')}</p>
            <p class="text-xs text-muted">بوابة الابتكار وتوليد الأفكار المؤسسية • مدعوم بالذكاء الاصطناعي</p>
          </div>
          <div class="footer-right">
            <span class="badge-role-indicator">
              ${I18N.t('role' + (State.currentUser.role.charAt(0).toUpperCase() + State.currentUser.role.slice(1)))}
            </span>
          </div>
        </div>
      </footer>
    `;
  },

  renderAuthLayout() {
    return `
      <div class="auth-page-wrapper">
        <div class="auth-card-container">
          <div class="auth-card-top-bar">
            <img src="assets/images/ub-logo.svg" alt="University of Bisha" class="auth-ub-logo" />
            <div class="auth-top-actions">
              <button class="btn-lang-pill" onclick="App.toggleLanguage()">${I18N.t('langToggle')}</button>
              <button class="btn-theme-pill" onclick="App.toggleTheme()"><i class="mdi mdi-theme-light-dark"></i></button>
            </div>
          </div>

          <div class="auth-card-main-content">
            ${this.currentView === 'register' ? this.renderRegisterForm() 
              : this.currentView === 'forgot_password' ? this.renderForgotPasswordForm() 
              : this.renderLoginForm()}
          </div>
        </div>
      </div>
    `;
  },

  renderLoginForm() {
    return `
      <div class="auth-form-header">
        <h2 class="auth-title">${I18N.t('ssoTitle')}</h2>
        <p class="auth-subtitle">${I18N.t('ssoSubtitle')}</p>
      </div>

      <form id="login-form" class="auth-form">
        <div class="form-group mb-3">
          <label class="form-label">${I18N.t('usernameOrEmail')}</label>
          <div class="input-icon-wrap">
            <i class="mdi mdi-account-circle input-icon"></i>
            <input type="text" id="login-identifier" class="form-control" placeholder="employee / ahmed / s.shahrani@ub.edu.sa" required />
          </div>
        </div>

        <div class="form-group mb-3">
          <label class="form-label">${I18N.t('password')}</label>
          <div class="input-icon-wrap">
            <i class="mdi mdi-lock-outline input-icon"></i>
            <input type="password" id="login-password" class="form-control" placeholder="••••••••" required />
          </div>
        </div>

        <div class="d-flex justify-between items-center mb-4">
          <label class="checkbox-label">
            <input type="checkbox" id="login-remember" checked />
            <span>${I18N.t('rememberMe')}</span>
          </label>
          <a href="javascript:void(0)" onclick="App.navigate('forgot_password')" class="auth-link">${I18N.t('forgotPasswordPrompt')}</a>
        </div>

        <button type="submit" class="btn btn-primary btn-block btn-lg">
          <i class="mdi mdi-login"></i> ${I18N.t('loginBtn')}
        </button>

        <!-- Quick 1-Click Demo Login Bar -->
        <div class="quick-demo-login-card mt-3">
          <div class="text-xs text-muted text-center font-bold mb-2">⚡ ${I18N.currentLang === 'ar' ? 'تجربة سريعة بنقرة واحدة (بدون كتابة كلمة المرور):' : 'Quick 1-Click Demo Sign-in:'}</div>
          <div class="demo-login-btns-grid">
            <button type="button" class="btn-demo-quick demo-admin" onclick="App.switchDemoRole('admin')">
              <i class="mdi mdi-shield-crown"></i>
              <span>${I18N.currentLang === 'ar' ? 'مدير النظام' : 'Admin'}</span>
            </button>
            <button type="button" class="btn-demo-quick demo-committee" onclick="App.switchDemoRole('committee')">
              <i class="mdi mdi-scale-balance"></i>
              <span>${I18N.currentLang === 'ar' ? 'لجنة التحكيم' : 'Committee'}</span>
            </button>
            <button type="button" class="btn-demo-quick demo-employee" onclick="App.switchDemoRole('employee')">
              <i class="mdi mdi-lightbulb-on"></i>
              <span>${I18N.currentLang === 'ar' ? 'موظف / باحث' : 'Employee'}</span>
            </button>
          </div>
        </div>

        <div class="auth-divider">
          <span>${I18N.t('noAccountPrompt')}</span>
        </div>

        <button type="button" class="btn btn-outline btn-block" onclick="App.navigate('register')">
          <i class="mdi mdi-account-plus-outline"></i> ${I18N.t('registerNow')}
        </button>
      </form>
    `;
  },

  renderRegisterForm() {
    return `
      <div class="auth-form-header">
        <h2 class="auth-title">${I18N.t('registerTitle')}</h2>
        <p class="auth-subtitle">${I18N.t('registerSubtitle')}</p>
      </div>

      <form id="register-form" class="auth-form">
        <div class="form-group mb-3">
          <label class="form-label">${I18N.t('fullName')}</label>
          <input type="text" id="reg-fullname" class="form-control" required placeholder="مثال: د. عبد الله بن محمد الشهري" />
        </div>

        <div class="row-2-cols mb-3">
          <div class="form-group">
            <label class="form-label">${I18N.t('chooseUsername')}</label>
            <input type="text" id="reg-username" class="form-control" required placeholder="e.g. ashahrani" />
          </div>
          <div class="form-group">
            <label class="form-label">${I18N.t('emailAddress')}</label>
            <input type="email" id="reg-email" class="form-control" required placeholder="user@ub.edu.sa" />
          </div>
        </div>

        <div class="row-2-cols mb-3">
          <div class="form-group">
            <label class="form-label">${I18N.t('selectDepartment')}</label>
            <select id="reg-dept" class="form-control" required>
              <option value="">-- ${I18N.t('selectDepartment')} --</option>
              ${State.departments.map(d => `<option value="${d.id}">${I18N.getText(d.nameAr, d.nameEn)}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">${I18N.t('selectJob')}</label>
            <select id="reg-job" class="form-control" required>
              <option value="">-- ${I18N.t('selectJob')} --</option>
              ${State.jobTitles.map(j => `<option value="${j.id}">${I18N.getText(j.nameAr, j.nameEn)}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="row-2-cols mb-2">
          <div class="form-group">
            <label class="form-label">${I18N.t('password')}</label>
            <input type="password" id="reg-password" class="form-control" required placeholder="••••••••" oninput="App.onPasswordInput(this.value)" />
          </div>
          <div class="form-group">
            <label class="form-label">${I18N.t('confirmPassword')}</label>
            <input type="password" id="reg-confirm-password" class="form-control" required placeholder="••••••••" />
          </div>
        </div>

        <!-- Password Strength Meter Box -->
        <div class="password-strength-box mb-4" id="password-strength-meter-box">
          <div class="strength-bar-track">
            <div class="strength-bar-fill" id="pwd-strength-bar"></div>
          </div>
          <span class="strength-text-status" id="pwd-strength-text">${I18N.t('passwordRules')}</span>
          <div class="strength-rules-list">
            <div class="rule-chip" id="rule-len"><i class="mdi mdi-circle-small"></i> ${I18N.t('ruleLength')}</div>
            <div class="rule-chip" id="rule-up"><i class="mdi mdi-circle-small"></i> ${I18N.t('ruleUpper')}</div>
            <div class="rule-chip" id="rule-low"><i class="mdi mdi-circle-small"></i> ${I18N.t('ruleLower')}</div>
            <div class="rule-chip" id="rule-num"><i class="mdi mdi-circle-small"></i> ${I18N.t('ruleNumber')}</div>
            <div class="rule-chip" id="rule-spec"><i class="mdi mdi-circle-small"></i> ${I18N.t('ruleSpecial')}</div>
          </div>
        </div>

        <button type="submit" class="btn btn-primary btn-block btn-lg">
          <i class="mdi mdi-check-circle-outline"></i> ${I18N.t('registerBtn')}
        </button>

        <div class="text-center mt-3">
          <a href="javascript:void(0)" onclick="App.navigate('login')" class="auth-link">
            ${I18N.t('alreadyHaveAccount')} ${I18N.t('loginBtn')}
          </a>
        </div>
      </form>
    `;
  },

  onPasswordInput(pwd) {
    const res = Auth.checkPasswordStrength(pwd);
    const bar = document.getElementById('pwd-strength-bar');
    const text = document.getElementById('pwd-strength-text');

    if (bar) {
      bar.style.width = res.percent + '%';
      bar.className = 'strength-bar-fill ' + res.strength;
    }

    if (text) {
      text.innerText = res.isValid 
        ? (I18N.currentLang === 'ar' ? 'كلمة مرور قوية ومستوفية للشروط ✅' : 'Strong & Valid Password ✅')
        : (I18N.currentLang === 'ar' ? 'كلمة المرور غير مكتملة المعايير' : 'Incomplete Security Criteria');
    }

    // Toggle chip status
    const updateChip = (id, valid) => {
      const el = document.getElementById(id);
      if (el) {
        if (valid) {
          el.classList.add('passed');
          el.querySelector('i').className = 'mdi mdi-check-circle text-success';
        } else {
          el.classList.remove('passed');
          el.querySelector('i').className = 'mdi mdi-circle-small';
        }
      }
    };

    updateChip('rule-len', res.rules.length);
    updateChip('rule-up', res.rules.upper);
    updateChip('rule-low', res.rules.lower);
    updateChip('rule-num', res.rules.number);
    updateChip('rule-spec', res.rules.special);
  },

  renderForgotPasswordForm() {
    return `
      <div class="auth-form-header">
        <h2 class="auth-title">${I18N.t('forgotPasswordTitle')}</h2>
        <p class="auth-subtitle">${I18N.t('forgotPasswordDesc')}</p>
      </div>

      <div id="forgot-step-1">
        <form id="forgot-request-form">
          <div class="form-group mb-4">
            <label class="form-label">${I18N.t('emailAddress')}</label>
            <div class="input-icon-wrap">
              <i class="mdi mdi-email-outline input-icon"></i>
              <input type="email" id="forgot-email" class="form-control" placeholder="s.shahrani@ub.edu.sa" required />
            </div>
          </div>
          <button type="submit" class="btn btn-primary btn-block btn-lg">
            <i class="mdi mdi-send"></i> ${I18N.t('sendResetCode')}
          </button>
        </form>
      </div>

      <div id="forgot-step-2" style="display: none;">
        <div class="alert alert-info mb-3" id="forgot-code-alert"></div>
        <form id="forgot-reset-form">
          <div class="form-group mb-3">
            <label class="form-label">${I18N.t('verificationCode')}</label>
            <input type="text" id="reset-code-val" class="form-control" maxlength="6" placeholder="123456" required />
          </div>
          <div class="form-group mb-3">
            <label class="form-label">${I18N.t('newPassword')}</label>
            <input type="password" id="reset-new-password" class="form-control" placeholder="••••••••" required oninput="App.onPasswordInput(this.value)" />
          </div>
          <!-- Password strength meter -->
          <div class="password-strength-box mb-4">
            <div class="strength-bar-track"><div class="strength-bar-fill" id="pwd-strength-bar"></div></div>
            <span class="strength-text-status" id="pwd-strength-text">${I18N.t('passwordRules')}</span>
          </div>
          <button type="submit" class="btn btn-primary btn-block btn-lg">
            <i class="mdi mdi-lock-reset"></i> ${I18N.t('resetPasswordBtn')}
          </button>
        </form>
      </div>

      <div class="text-center mt-4">
        <a href="javascript:void(0)" onclick="App.navigate('login')" class="auth-link">
          <i class="mdi mdi-arrow-right"></i> ${I18N.t('back')} ${I18N.t('loginBtn')}
        </a>
      </div>
    `;
  },

  bindAuthEvents() {
    // Login Form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.onsubmit = (e) => {
        e.preventDefault();
        const id = document.getElementById('login-identifier').value;
        const pwd = document.getElementById('login-password').value;
        const res = Auth.login(id, pwd);
        if (res.success) {
          App.showToast(I18N.t('loginSuccess'), 'success');
          App.navigate('home');
        } else {
          App.showToast(res.message, 'error');
        }
      };
    }

    // Register Form
    const regForm = document.getElementById('register-form');
    if (regForm) {
      regForm.onsubmit = (e) => {
        e.preventDefault();
        const data = {
          fullName: document.getElementById('reg-fullname').value,
          username: document.getElementById('reg-username').value,
          email: document.getElementById('reg-email').value,
          departmentId: document.getElementById('reg-dept').value,
          jobTitleId: document.getElementById('reg-job').value,
          password: document.getElementById('reg-password').value,
          confirmPassword: document.getElementById('reg-confirm-password').value
        };

        const res = Auth.register(data);
        if (res.success) {
          App.showToast(I18N.t('registrationSuccess'), 'success');
          App.navigate('home');
        } else {
          App.showToast(res.message, 'warning');
        }
      };
    }

    // Forgot Password Request
    const forgotForm = document.getElementById('forgot-request-form');
    if (forgotForm) {
      forgotForm.onsubmit = (e) => {
        e.preventDefault();
        const email = document.getElementById('forgot-email').value;
        const res = Auth.requestPasswordReset(email);
        if (res.success) {
          document.getElementById('forgot-step-1').style.display = 'none';
          document.getElementById('forgot-step-2').style.display = 'block';
          document.getElementById('forgot-code-alert').innerHTML = `
            <strong>${I18N.t('codeSentTo')} ${res.email}</strong><br>
            <span class="text-xs text-primary font-bold">(رمز التحقق التجريبي هو: <code class="p-1 bg-white border rounded">${res.code}</code>)</span>
          `;
          document.getElementById('reset-code-val').value = res.code;
        } else {
          App.showToast(res.message, 'error');
        }
      };
    }

    // Forgot Password Reset Submit
    const resetForm = document.getElementById('forgot-reset-form');
    if (resetForm) {
      resetForm.onsubmit = (e) => {
        e.preventDefault();
        const email = document.getElementById('forgot-email').value;
        const code = document.getElementById('reset-code-val').value;
        const newPwd = document.getElementById('reset-new-password').value;

        const res = Auth.resetPasswordWithCode(email, code, newPwd);
        if (res.success) {
          App.showToast(I18N.t('passwordResetSuccess'), 'success');
          App.navigate('login');
        } else {
          App.showToast(res.message, 'error');
        }
      };
    }
  },

  renderActiveViewContent() {
    switch (this.currentView) {
      case 'home':
        return this.renderHomeView();
      case 'submit_idea':
        return this.renderSubmitIdeaView();
      case 'committee':
        return '<div id="committee-portal-container"></div>';
      case 'dashboard':
        return '<div id="dashboard-container"></div>';
      case 'leaderboard':
        return this.renderLeaderboardView();
      case 'admin':
        return '<div id="admin-portal-container"></div>';
      case 'profile':
        return this.renderProfileView();
      default:
        return this.renderHomeView();
    }
  },

  afterViewRender() {
    if (this.currentView === 'home') {
      IdeasManager.refreshFeed();
    } else if (this.currentView === 'submit_idea') {
      this.bindIdeaSubmissionEvents();
    } else if (this.currentView === 'committee') {
      CommitteePortal.render();
    } else if (this.currentView === 'dashboard') {
      AnalyticsDashboard.render();
    } else if (this.currentView === 'admin') {
      AdminPortal.render();
    }
  },

  // HOME / IDEA BANK VIEW
  renderHomeView() {
    return `
      <!-- Hero Banner -->
      <section class="fikra-hero-banner">
        <div class="hero-text-content">
          <div class="hero-badge"><i class="mdi mdi-star-four-points text-gold"></i> منصة الابتكار وتوليد الأفكار</div>
          <h1 class="hero-headline">${I18N.t('appName')}</h1>
          <p class="hero-subtext">شارك أفكارك الإبداعية، وساهم في مسيرة التحول والتميز لجامعة بيشة. افحص الأفكار بالذكاء الاصطناعي وشارك بالتصويت والنقاش.</p>
          <div class="hero-cta-btns">
            <button class="btn btn-gold btn-lg" onclick="App.navigate('submit_idea')">
              <i class="mdi mdi-lightbulb-on-outline"></i> ${I18N.t('navSubmitIdea')}
            </button>
            <button class="btn btn-outline-white btn-lg" onclick="App.navigate('dashboard')">
              <i class="mdi mdi-chart-areaspline"></i> ${I18N.t('navDashboard')}
            </button>
          </div>
        </div>
        <div class="hero-graphics">
          <img src="assets/images/fikra-logo.svg" alt="Fikra Emblem" class="hero-emblem-float" />
        </div>
      </section>

      <!-- Filter & Search Toolbar -->
      <section class="ideas-toolbar-card mt-4">
        <div class="toolbar-search-wrap">
          <i class="mdi mdi-magnify toolbar-search-icon"></i>
          <input type="text" id="feed-search-input" class="form-control" placeholder="${I18N.t('search')}" oninput="App.onSearchInput(this.value)" />
        </div>

        <div class="toolbar-filters-grid">
          <!-- Department Filter -->
          <select id="filter-dept-select" class="form-control form-control-sm" onchange="IdeasManager.activeFilter.dept = this.value; IdeasManager.refreshFeed();">
            <option value="all">${I18N.t('filterAllDepts')}</option>
            ${State.departments.map(d => `<option value="${d.id}">${I18N.getText(d.nameAr, d.nameEn)}</option>`).join('')}
          </select>

          <!-- Category Filter -->
          <select id="filter-cat-select" class="form-control form-control-sm" onchange="IdeasManager.activeFilter.category = this.value; IdeasManager.refreshFeed();">
            <option value="all">${I18N.t('filterAllCategories')}</option>
            ${State.categories.map(c => `<option value="${c.id}">${c.icon || '💡'} ${I18N.getText(c.nameAr, c.nameEn)}</option>`).join('')}
          </select>

          <!-- Status Filter -->
          <select id="filter-status-select" class="form-control form-control-sm" onchange="IdeasManager.activeFilter.status = this.value; IdeasManager.refreshFeed();">
            <option value="all">${I18N.t('filterAllStatus')}</option>
            <option value="submitted">${I18N.t('statusSubmitted')}</option>
            <option value="under_review">${I18N.t('statusUnderReview')}</option>
            <option value="approved">${I18N.t('statusApproved')}</option>
            <option value="implemented">${I18N.t('statusImplemented')}</option>
          </select>

          <!-- Sorting -->
          <select id="filter-sort-select" class="form-control form-control-sm" onchange="IdeasManager.activeFilter.sort = this.value; IdeasManager.refreshFeed();">
            <option value="top_voted">${I18N.t('sortTopVoted')}</option>
            <option value="newest">${I18N.t('sortNewest')}</option>
            <option value="most_comments">${I18N.t('sortMostComments')}</option>
            <option value="impact">${I18N.t('sortImpact')}</option>
          </select>
        </div>
      </section>

      <!-- Feed Container -->
      <section class="ideas-feed-grid mt-4" id="ideas-feed-container">
        <!-- Rendered by IdeasManager.refreshFeed() -->
      </section>
    `;
  },

  onSearchInput(val) {
    IdeasManager.activeFilter.search = val;
    IdeasManager.refreshFeed();
  },

  // SUBMIT IDEA VIEW (WITH REAL-TIME AI SIMILARITY RADAR & VOICE INPUT)
  renderSubmitIdeaView() {
    return `
      <div class="submit-idea-card-wrapper">
        <div class="submit-header">
          <h2><i class="mdi mdi-lightbulb-on text-gold"></i> ${I18N.t('submitIdeaTitle')}</h2>
          <p class="text-muted">${I18N.t('submitIdeaSubtitle')}</p>
        </div>

        <!-- Voice Recording Live Visual Banner -->
        <div class="voice-recording-banner" id="voice-recording-banner" style="display:none;">
          <div class="voice-soundwaves">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
          <div class="voice-status-text">
            <strong>${I18N.t('voiceListening')}</strong>
            <span class="text-xs">يتم تحويل الصوت فورياً إلى نص عربي/إنجليزي وإدراجه في الحقل...</span>
          </div>
          <button type="button" class="btn btn-sm btn-danger" onclick="SpeechController.stopListening()">
            <i class="mdi mdi-stop"></i> ${I18N.t('voiceStop')}
          </button>
        </div>

        <form id="submit-idea-form" class="submit-idea-form mt-4">
          <!-- Idea Title Field -->
          <div class="form-group mb-3">
            <div class="d-flex justify-between items-center mb-1">
              <label class="form-label font-bold">${I18N.t('ideaTitle')} *</label>
              <button type="button" class="btn-voice-input" id="btn-voice-title" onclick="SpeechController.toggleVoiceInput('idea-input-title', 'btn-voice-title')">
                <i class="mdi mdi-microphone"></i> <span>${I18N.t('voiceInputBtn')}</span>
              </button>
            </div>
            <input type="text" id="idea-input-title" class="form-control form-control-lg" placeholder="${I18N.t('ideaTitlePlaceholder')}" required autocomplete="off" />
          </div>

          <!-- Real-Time AI Similarity Radar Alert Box -->
          <div class="ai-similarity-radar-box" id="ai-similarity-radar-box" style="display: none;">
            <div class="radar-header">
              <div class="radar-title">
                <i class="mdi mdi-radar text-gold pulse-spin"></i>
                <strong id="radar-title-text">${I18N.t('aiSimilarAlertTitle')}</strong>
              </div>
              <span class="radar-status-badge" id="radar-status-badge"></span>
            </div>
            <p class="radar-desc" id="radar-desc-text">${I18N.t('aiSimilarAlertDesc')}</p>
            <div class="radar-matches-list" id="radar-matches-list">
              <!-- Dynamically populated matches -->
            </div>
          </div>

          <div class="row-2-cols mb-3">
            <div class="form-group">
              <label class="form-label font-bold">${I18N.t('ideaCategory')} *</label>
              <select id="idea-input-category" class="form-control" required>
                ${State.categories.map(c => `<option value="${c.id}">${c.icon || '💡'} ${I18N.getText(c.nameAr, c.nameEn)}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label font-bold">${I18N.t('ideaTargetDept')} *</label>
              <select id="idea-input-target-dept" class="form-control" required>
                ${State.departments.map(d => `<option value="${d.id}">${I18N.getText(d.nameAr, d.nameEn)}</option>`).join('')}
              </select>
            </div>
          </div>

          <!-- Idea Description Field -->
          <div class="form-group mb-3">
            <div class="d-flex justify-between items-center mb-1">
              <label class="form-label font-bold">${I18N.t('ideaDesc')} *</label>
              <button type="button" class="btn-voice-input" id="btn-voice-desc" onclick="SpeechController.toggleVoiceInput('idea-input-desc', 'btn-voice-desc')">
                <i class="mdi mdi-microphone"></i> <span>${I18N.t('voiceInputBtn')}</span>
              </button>
            </div>
            <textarea id="idea-input-desc" class="form-control" rows="5" placeholder="${I18N.t('ideaDescPlaceholder')}" required></textarea>
          </div>

          <!-- Expected Impact Field -->
          <div class="form-group mb-3">
            <label class="form-label font-bold">${I18N.t('ideaImpact')}</label>
            <textarea id="idea-input-impact" class="form-control" rows="2" placeholder="${I18N.t('ideaImpactPlaceholder')}"></textarea>
          </div>

          <div class="row-2-cols mb-4">
            <div class="form-group">
              <label class="form-label font-bold">${I18N.t('ideaBudget')}</label>
              <input type="text" id="idea-input-budget" class="form-control" placeholder="مثال: 25,000 ريال أو لا تتطلب ميزانية إضافية" />
            </div>
            <div class="form-group">
              <label class="form-label font-bold">${I18N.t('aiAutoTags')} (اختياري)</label>
              <input type="text" id="idea-input-tags" class="form-control" placeholder="#التحول_الرقمي, #الاستدامة" />
            </div>
          </div>

          <div class="submit-actions-bar">
            <button type="submit" class="btn btn-primary btn-lg" id="btn-submit-idea-main">
              <i class="mdi mdi-send"></i> ${I18N.t('submitIdeaBtn')}
            </button>
            <button type="button" class="btn btn-secondary btn-lg" onclick="App.navigate('home')">
              ${I18N.t('cancel')}
            </button>
          </div>
        </form>
      </div>
    `;
  },

  bindIdeaSubmissionEvents() {
    const titleInput = document.getElementById('idea-input-title');
    const descInput = document.getElementById('idea-input-desc');
    const form = document.getElementById('submit-idea-form');

    // Real-Time AI Similarity Listener (triggered after 3+ words)
    const runAISimilarityCheck = () => {
      const title = titleInput ? titleInput.value : '';
      const desc = descInput ? descInput.value : '';

      clearTimeout(this.similarityDebounceTimer);
      this.similarityDebounceTimer = setTimeout(() => {
        const result = AIEngine.findSimilarIdeas(title, desc);
        const radarBox = document.getElementById('ai-similarity-radar-box');
        const matchesList = document.getElementById('radar-matches-list');
        const statusBadge = document.getElementById('radar-status-badge');

        if (!radarBox || !matchesList) return;

        if (result.hasMinWords && result.matches.length > 0) {
          radarBox.style.display = 'block';
          const topMatch = result.matches[0];

          if (topMatch.similarityScore >= 65) {
            radarBox.className = 'ai-similarity-radar-box high-risk';
            statusBadge.className = 'radar-status-badge bg-danger';
            statusBadge.innerText = `${I18N.t('aiSimilarityScore')} ${topMatch.similarityScore}% (تطابق عالي)`;
          } else {
            radarBox.className = 'ai-similarity-radar-box moderate';
            statusBadge.className = 'radar-status-badge bg-warning';
            statusBadge.innerText = `${I18N.t('aiSimilarityScore')} ${topMatch.similarityScore}% (أفكار مشابهة)`;
          }

          matchesList.innerHTML = result.matches.map(m => `
            <div class="radar-match-item">
              <div class="radar-match-info">
                <strong>${I18N.getText(m.idea.titleAr, m.idea.titleEn)}</strong>
                <span class="text-xs text-muted">بواسطة: ${m.idea.authorName} (${m.idea.authorDept})</span>
                <div class="text-xs mt-1">
                  <span class="badge-match-pct">${m.similarityScore}% تطابق</span>
                  ${m.commonKeywords.length > 0 ? `<span class="text-muted">الكلمات المشتركة: ${m.commonKeywords.join(', ')}</span>` : ''}
                </div>
              </div>
              <button type="button" class="btn btn-sm btn-outline" onclick="IdeasManager.openIdeaDetailsModal('${m.idea.id}')">
                <i class="mdi mdi-compare"></i> ${I18N.t('aiCompareIdea')}
              </button>
            </div>
          `).join('');
        } else {
          radarBox.style.display = 'none';
        }
      }, 350); // 350ms debounce
    };

    if (titleInput) titleInput.oninput = runAISimilarityCheck;
    if (descInput) descInput.oninput = runAISimilarityCheck;

    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('btn-submit-idea-main');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = `<i class="mdi mdi-loading mdi-spin"></i> ${I18N.t('aiAnalyzing')}`;
        }

        const formData = {
          title: titleInput.value,
          desc: descInput.value,
          categoryId: document.getElementById('idea-input-category').value,
          targetDeptId: document.getElementById('idea-input-target-dept').value,
          impact: document.getElementById('idea-input-impact').value,
          budget: document.getElementById('idea-input-budget').value,
          tagsString: document.getElementById('idea-input-tags').value
        };

        const res = await IdeasManager.submitNewIdea(formData);
        if (res.success) {
          App.showToast(I18N.t('ideaSubmittedSuccess'), 'success');
          App.navigate('home');
        } else {
          App.showToast(res.message, 'warning');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<i class="mdi mdi-send"></i> ${I18N.t('submitIdeaBtn')}`;
          }
        }
      };
    }
  },

  // LEADERBOARD VIEW
  renderLeaderboardView() {
    const sortedUsers = [...State.users].sort((a, b) => (b.points || 0) - (a.points || 0));

    return `
      <div class="leaderboard-view-wrapper">
        <div class="leaderboard-header">
          <h2><i class="mdi mdi-trophy text-gold"></i> ${I18N.t('leaderboardTitle')}</h2>
          <p class="text-muted">${I18N.t('leaderboardSubtitle')}</p>
        </div>

        <div class="podium-grid mt-4">
          ${sortedUsers.slice(0, 3).map((u, idx) => {
            const ranks = ['1st 🥇', '2nd 🥈', '3rd 🥉'];
            const rankClasses = ['gold-podium', 'silver-podium', 'bronze-podium'];
            const dept = State.getDepartment(u.departmentId);

            return `
              <div class="podium-card ${rankClasses[idx]}">
                <div class="podium-rank-badge">${ranks[idx]}</div>
                <img src="${u.avatar || 'assets/images/fikra-logo.svg'}" class="podium-avatar" />
                <h3 class="podium-name">${u.fullName}</h3>
                <span class="podium-dept">${I18N.getText(dept.nameAr, dept.nameEn)}</span>
                <div class="podium-points">${u.points || 0} ${I18N.t('points')}</div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="leaderboard-table-card mt-4">
          <table class="fikra-table">
            <thead>
              <tr>
                <th>#</th>
                <th>${I18N.t('topIdeators')}</th>
                <th>${I18N.t('selectDepartment')}</th>
                <th>${I18N.t('points')}</th>
              </tr>
            </thead>
            <tbody>
              ${sortedUsers.map((u, i) => {
                const dept = State.getDepartment(u.departmentId);
                return `
                  <tr>
                    <td><strong>#${i + 1}</strong></td>
                    <td>
                      <div class="d-flex items-center gap-2">
                        <img src="${u.avatar || 'assets/images/fikra-logo.svg'}" class="author-avatar" />
                        <div>
                          <strong>${u.fullName}</strong>
                          <div class="text-xs text-muted">@${u.username}</div>
                        </div>
                      </div>
                    </td>
                    <td>${I18N.getText(dept.nameAr, dept.nameEn)}</td>
                    <td><strong class="text-gold font-bold">${u.points || 0} ${I18N.t('points')}</strong></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  // PROFILE & CHANGE PASSWORD VIEW
  renderProfileView() {
    const user = State.currentUser;
    const dept = State.getDepartment(user.departmentId);
    const job = State.getJobTitle(user.jobTitleId);
    const userIdeas = State.ideas.filter(i => i.authorId === user.id);

    return `
      <div class="profile-view-wrapper">
        <div class="profile-hero-card">
          <div class="d-flex items-center gap-4 flex-wrap">
            <img src="${user.avatar || 'assets/images/fikra-logo.svg'}" class="profile-avatar-lg" />
            <div class="profile-details-top">
              <h2 class="profile-name">${user.fullName}</h2>
              <p class="profile-role text-muted">
                <i class="mdi mdi-badge-account"></i> ${I18N.getText(job.nameAr, job.nameEn)} • 
                <i class="mdi mdi-domain"></i> ${I18N.getText(dept.nameAr, dept.nameEn)}
              </p>
              <div class="profile-stats-row mt-2">
                <span class="stat-pill"><i class="mdi mdi-lightbulb-on text-gold"></i> ${userIdeas.length} ${I18N.t('navMyIdeas')}</span>
                <span class="stat-pill"><i class="mdi mdi-trophy text-gold"></i> ${user.points || 0} ${I18N.t('points')}</span>
                <span class="stat-pill"><i class="mdi mdi-shield-account text-primary"></i> ${I18N.t('role' + (user.role.charAt(0).toUpperCase() + user.role.slice(1)))}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="profile-grid-cols mt-4">
          <!-- Change Password Card -->
          <div class="profile-box-card">
            <h4 class="font-bold text-primary mb-3"><i class="mdi mdi-lock-reset"></i> ${I18N.t('changePasswordTitle')}</h4>
            <form id="change-password-form">
              <div class="form-group mb-3">
                <label class="form-label">${I18N.t('currentPassword')}</label>
                <input type="password" id="cur-pwd-input" class="form-control" required placeholder="••••••••" />
              </div>
              <div class="form-group mb-3">
                <label class="form-label">${I18N.t('newPassword')}</label>
                <input type="password" id="new-pwd-input" class="form-control" required placeholder="••••••••" oninput="App.onPasswordInput(this.value)" />
              </div>
              <div class="password-strength-box mb-4">
                <div class="strength-bar-track"><div class="strength-bar-fill" id="pwd-strength-bar"></div></div>
                <span class="strength-text-status" id="pwd-strength-text">${I18N.t('passwordRules')}</span>
              </div>
              <button type="submit" class="btn btn-primary">
                <i class="mdi mdi-check"></i> ${I18N.t('updatePasswordBtn')}
              </button>
            </form>
          </div>

          <!-- My Submitted Ideas List -->
          <div class="profile-box-card">
            <h4 class="font-bold text-primary mb-3"><i class="mdi mdi-lightbulb-multiple"></i> ${I18N.t('navMyIdeas')} (${userIdeas.length})</h4>
            <div class="my-ideas-list">
              ${userIdeas.length === 0 ? `<p class="text-muted">${I18N.t('noIdeasFound')}</p>` : ''}
              ${userIdeas.map(i => `
                <div class="my-idea-item-card mb-2">
                  <div class="d-flex justify-between items-center">
                    <strong class="text-primary">${I18N.getText(i.titleAr, i.titleEn)}</strong>
                    <div>${IdeasManager.getStatusBadgeHTML(i.status)}</div>
                  </div>
                  <div class="text-xs text-muted mt-1">
                    <i class="mdi mdi-heart"></i> ${i.votes ? i.votes.length : 0} ${I18N.t('votesCount')} • 
                    <i class="mdi mdi-comment"></i> ${i.comments ? i.comments.length : 0} ${I18N.t('commentsCount')}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  bindGlobalEvents() {
    // Auto-sync when window gains focus (e.g. user returns from another app or tab)
    window.addEventListener('focus', () => {
      if (window.SupabaseService && window.SupabaseService.isConnected && !window.SupabaseService.isSyncing) {
        window.SupabaseService.syncAllFromRemote(true);
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && window.SupabaseService && window.SupabaseService.isConnected && !window.SupabaseService.isSyncing) {
        window.SupabaseService.syncAllFromRemote(true);
      }
    });

    // Global Modal close triggers
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeGlobalModal();
      }
    });

    document.addEventListener('submit', (e) => {
      if (e.target.id === 'change-password-form') {
        e.preventDefault();
        const cur = document.getElementById('cur-pwd-input').value;
        const nxt = document.getElementById('new-pwd-input').value;
        const res = Auth.changePassword(cur, nxt);
        if (res.success) {
          App.showToast(I18N.t('passwordChangedSuccess'), 'success');
          document.getElementById('change-password-form').reset();
        } else {
          App.showToast(res.message, 'error');
        }
      }
    });
  },

  // Toast Notification System
  showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `fikra-toast toast-${type} animate-slide-in`;

    const iconMap = {
      success: 'mdi-check-circle',
      error: 'mdi-alert-circle',
      warning: 'mdi-alert',
      info: 'mdi-information'
    };

    toast.innerHTML = `
      <i class="mdi ${iconMap[type] || 'mdi-information'} toast-icon"></i>
      <span class="toast-text">${message}</span>
      <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 400);
    }, 4500);
  },

  // Global Modal Helpers
  openGlobalModal() {
    const modal = document.getElementById('global-modal-wrap');
    if (modal) {
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
  },

  closeGlobalModal() {
    const modal = document.getElementById('global-modal-wrap');
    if (modal) {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
    }
  }
};

window.App = App;

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
