/**
 * Fikra (فكرة) - System Administration & Dynamic Dropdowns Manager
 * Allows admins to configure departments, job titles, idea categories, users, and AI settings.
 */

const AdminPortal = {
  activeTab: 'departments', // 'departments', 'jobs', 'categories', 'users', 'ai'

  render() {
    const container = document.getElementById('admin-portal-container');
    if (!container) return;

    if (!Auth.isAdmin()) {
      container.innerHTML = `
        <div class="access-denied-box">
          <div class="access-denied-icon"><i class="mdi mdi-shield-lock-outline"></i></div>
          <h3>${I18N.currentLang === 'ar' ? 'هذه الصفحة مخصصة لمدير النظام (Admin)' : 'This page is restricted to System Administrators'}</h3>
          <p>${I18N.currentLang === 'ar' ? 'أنت مسجل حالياً بحساب غير إداري. يمكنك التبديل فوراً لحساب المدير بالنقر على الزر أدناه:' : 'You are currently logged in with a standard account. You can switch to the Administrator role below:'}</p>
          <div class="mt-4">
            <button class="btn btn-primary btn-lg" onclick="App.switchDemoRole('admin')">
              <i class="mdi mdi-shield-crown"></i> ${I18N.currentLang === 'ar' ? 'التبديل إلى حساب مدير النظام (Admin)' : 'Switch to Admin Account'}
            </button>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="admin-header">
        <div class="header-titles">
          <h2><i class="mdi mdi-cogs text-gold"></i> ${I18N.t('adminTitle')}</h2>
          <p class="text-muted">${I18N.t('adminSubtitle')}</p>
        </div>
        <div class="admin-top-actions">
          <button class="btn btn-outline-danger" onclick="AdminPortal.confirmResetSeedData()">
            <i class="mdi mdi-restore"></i> ${I18N.t('resetSeedDataBtn')}
          </button>
        </div>
      </div>

      <!-- Admin Tabs Navigation -->
      <div class="admin-tabs-nav mt-3">
        <button class="admin-tab-btn ${this.activeTab === 'departments' ? 'active' : ''}" onclick="AdminPortal.switchTab('departments')">
          <i class="mdi mdi-domain"></i> ${I18N.t('tabDepartments')} (${State.departments.length})
        </button>
        <button class="admin-tab-btn ${this.activeTab === 'jobs' ? 'active' : ''}" onclick="AdminPortal.switchTab('jobs')">
          <i class="mdi mdi-badge-account-outline"></i> ${I18N.t('tabJobTitles')} (${State.jobTitles.length})
        </button>
        <button class="admin-tab-btn ${this.activeTab === 'categories' ? 'active' : ''}" onclick="AdminPortal.switchTab('categories')">
          <i class="mdi mdi-shape-plus"></i> ${I18N.t('tabCategories')} (${State.categories.length})
        </button>
        <button class="admin-tab-btn ${this.activeTab === 'users' ? 'active' : ''}" onclick="AdminPortal.switchTab('users')">
          <i class="mdi mdi-account-group"></i> ${I18N.t('tabUsers')} (${State.users.length})
        </button>
        <button class="admin-tab-btn ${this.activeTab === 'ai' ? 'active' : ''}" onclick="AdminPortal.switchTab('ai')">
          <i class="mdi mdi-robot-confused-outline"></i> ${I18N.t('tabAISettings')}
        </button>
        <button class="admin-tab-btn ${this.activeTab === 'database' ? 'active' : ''}" onclick="AdminPortal.switchTab('database')">
          <i class="mdi mdi-database-check-outline"></i> ${I18N.currentLang === 'ar' ? 'قاعدة البيانات (Supabase)' : 'Database (Supabase)'}
        </button>
      </div>

      <div class="admin-tab-content-box mt-4">
        ${this.renderTabContent()}
      </div>
    `;
  },

  switchTab(tab) {
    this.activeTab = tab;
    this.render();
  },

  renderTabContent() {
    switch (this.activeTab) {
      case 'departments':
        return this.renderDepartmentsTab();
      case 'jobs':
        return this.renderJobsTab();
      case 'categories':
        return this.renderCategoriesTab();
      case 'users':
        return this.renderUsersTab();
      case 'ai':
        return this.renderAITab();
      case 'database':
        return this.renderDatabaseTab();
      default:
        return this.renderDepartmentsTab();
    }
  },

  // 1. Departments Management
  renderDepartmentsTab() {
    return `
      <div class="admin-crud-header">
        <h4>${I18N.t('tabDepartments')}</h4>
        <button class="btn btn-primary btn-sm" onclick="AdminPortal.openAddDeptModal()">
          <i class="mdi mdi-plus"></i> ${I18N.t('addNewDept')}
        </button>
      </div>

      <div class="table-responsive mt-3">
        <table class="fikra-table">
          <thead>
            <tr>
              <th>#</th>
              <th>${I18N.t('deptNameAr')}</th>
              <th>${I18N.t('deptNameEn')}</th>
              <th>${I18N.t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            ${State.departments.map((d, index) => `
              <tr>
                <td>${index + 1}</td>
                <td><strong>${d.nameAr}</strong></td>
                <td>${d.nameEn}</td>
                <td>
                  <button class="btn-table-action text-danger" onclick="AdminPortal.deleteDepartment('${d.id}')" title="${I18N.t('delete')}">
                    <i class="mdi mdi-trash-can-outline"></i>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  openAddDeptModal() {
    const modalBody = document.getElementById('global-modal-body');
    const modalTitle = document.getElementById('global-modal-title');
    if (!modalBody || !modalTitle) return;

    modalTitle.innerHTML = `<i class="mdi mdi-domain"></i> ${I18N.t('addNewDept')}`;
    modalBody.innerHTML = `
      <form id="add-dept-form">
        <div class="form-group mb-3">
          <label class="form-label">${I18N.t('deptNameAr')}</label>
          <input type="text" id="new-dept-ar" class="form-control" required placeholder="مثال: كلية الذكاء الاصطناعي والأمن السيبراني" />
        </div>
        <div class="form-group mb-3">
          <label class="form-label">${I18N.t('deptNameEn')}</label>
          <input type="text" id="new-dept-en" class="form-control" required placeholder="e.g. College of AI & Cybersecurity" />
        </div>
        <div class="modal-actions-footer mt-4">
          <button type="button" class="btn btn-secondary" onclick="App.closeGlobalModal()">${I18N.t('cancel')}</button>
          <button type="submit" class="btn btn-primary">${I18N.t('save')}</button>
        </div>
      </form>
    `;

    document.getElementById('add-dept-form').onsubmit = (e) => {
      e.preventDefault();
      const ar = document.getElementById('new-dept-ar').value.trim();
      const en = document.getElementById('new-dept-en').value.trim();
      if (!ar || !en) return;

      const newDept = {
        id: 'dept_' + Date.now(),
        nameAr: ar,
        nameEn: en
      };
      State.departments.push(newDept);
      State.saveToStorage();
      if (window.SupabaseService) window.SupabaseService.upsertDepartment(newDept);
      App.closeGlobalModal();
      App.showToast(I18N.t('itemAddedSuccess'), 'success');
      this.render();
    };

    App.openGlobalModal();
  },

  deleteDepartment(id) {
    if (State.departments.length <= 1) {
      App.showToast(I18N.currentLang === 'ar' ? 'لا يمكن حذف كافة الإدارات!' : 'Cannot delete all departments!', 'warning');
      return;
    }
    State.departments = State.departments.filter(d => d.id !== id);
    State.saveToStorage();
    if (window.SupabaseService) window.SupabaseService.deleteDepartment(id);
    App.showToast(I18N.t('itemDeletedSuccess'), 'success');
    this.render();
  },

  // 2. Job Titles Management
  renderJobsTab() {
    return `
      <div class="admin-crud-header">
        <h4>${I18N.t('tabJobTitles')}</h4>
        <button class="btn btn-primary btn-sm" onclick="AdminPortal.openAddJobModal()">
          <i class="mdi mdi-plus"></i> ${I18N.t('addNewJob')}
        </button>
      </div>

      <div class="table-responsive mt-3">
        <table class="fikra-table">
          <thead>
            <tr>
              <th>#</th>
              <th>${I18N.t('jobNameAr')}</th>
              <th>${I18N.t('jobNameEn')}</th>
              <th>${I18N.t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            ${State.jobTitles.map((j, index) => `
              <tr>
                <td>${index + 1}</td>
                <td><strong>${j.nameAr}</strong></td>
                <td>${j.nameEn}</td>
                <td>
                  <button class="btn-table-action text-danger" onclick="AdminPortal.deleteJob('${j.id}')" title="${I18N.t('delete')}">
                    <i class="mdi mdi-trash-can-outline"></i>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  openAddJobModal() {
    const modalBody = document.getElementById('global-modal-body');
    const modalTitle = document.getElementById('global-modal-title');
    if (!modalBody || !modalTitle) return;

    modalTitle.innerHTML = `<i class="mdi mdi-badge-account"></i> ${I18N.t('addNewJob')}`;
    modalBody.innerHTML = `
      <form id="add-job-form">
        <div class="form-group mb-3">
          <label class="form-label">${I18N.t('jobNameAr')}</label>
          <input type="text" id="new-job-ar" class="form-control" required placeholder="مثال: باحث أول في الذكاء الاصطناعي" />
        </div>
        <div class="form-group mb-3">
          <label class="form-label">${I18N.t('jobNameEn')}</label>
          <input type="text" id="new-job-en" class="form-control" required placeholder="e.g. Senior AI Researcher" />
        </div>
        <div class="modal-actions-footer mt-4">
          <button type="button" class="btn btn-secondary" onclick="App.closeGlobalModal()">${I18N.t('cancel')}</button>
          <button type="submit" class="btn btn-primary">${I18N.t('save')}</button>
        </div>
      </form>
    `;

    document.getElementById('add-job-form').onsubmit = (e) => {
      e.preventDefault();
      const ar = document.getElementById('new-job-ar').value.trim();
      const en = document.getElementById('new-job-en').value.trim();
      if (!ar || !en) return;

      const newJob = {
        id: 'job_' + Date.now(),
        nameAr: ar,
        nameEn: en
      };
      State.jobTitles.push(newJob);
      State.saveToStorage();
      if (window.SupabaseService) window.SupabaseService.upsertJobTitle(newJob);
      App.closeGlobalModal();
      App.showToast(I18N.t('itemAddedSuccess'), 'success');
      this.render();
    };

    App.openGlobalModal();
  },

  deleteJob(id) {
    if (State.jobTitles.length <= 1) return;
    State.jobTitles = State.jobTitles.filter(j => j.id !== id);
    State.saveToStorage();
    if (window.SupabaseService) window.SupabaseService.deleteJobTitle(id);
    App.showToast(I18N.t('itemDeletedSuccess'), 'success');
    this.render();
  },

  // 3. Idea Categories Management
  renderCategoriesTab() {
    return `
      <div class="admin-crud-header">
        <h4>${I18N.t('tabCategories')}</h4>
        <button class="btn btn-primary btn-sm" onclick="AdminPortal.openAddCategoryModal()">
          <i class="mdi mdi-plus"></i> ${I18N.t('addNewCategory')}
        </button>
      </div>

      <div class="table-responsive mt-3">
        <table class="fikra-table">
          <thead>
            <tr>
              <th>#</th>
              <th>${I18N.t('catNameAr')}</th>
              <th>${I18N.t('catNameEn')}</th>
              <th>${I18N.t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            ${State.categories.map((c, index) => `
              <tr>
                <td>${index + 1}</td>
                <td><strong>${c.icon || '💡'} ${c.nameAr}</strong></td>
                <td>${c.nameEn}</td>
                <td>
                  <button class="btn-table-action text-danger" onclick="AdminPortal.deleteCategory('${c.id}')" title="${I18N.t('delete')}">
                    <i class="mdi mdi-trash-can-outline"></i>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  openAddCategoryModal() {
    const modalBody = document.getElementById('global-modal-body');
    const modalTitle = document.getElementById('global-modal-title');
    if (!modalBody || !modalTitle) return;

    modalTitle.innerHTML = `<i class="mdi mdi-shape-plus"></i> ${I18N.t('addNewCategory')}`;
    modalBody.innerHTML = `
      <form id="add-cat-form">
        <div class="form-group mb-3">
          <label class="form-label">${I18N.t('catNameAr')}</label>
          <input type="text" id="new-cat-ar" class="form-control" required placeholder="مثال: الشراكات المجتمعية والتطوع" />
        </div>
        <div class="form-group mb-3">
          <label class="form-label">${I18N.t('catNameEn')}</label>
          <input type="text" id="new-cat-en" class="form-control" required placeholder="e.g. Community Engagement & Volunteering" />
        </div>
        <div class="modal-actions-footer mt-4">
          <button type="button" class="btn btn-secondary" onclick="App.closeGlobalModal()">${I18N.t('cancel')}</button>
          <button type="submit" class="btn btn-primary">${I18N.t('save')}</button>
        </div>
      </form>
    `;

    document.getElementById('add-cat-form').onsubmit = (e) => {
      e.preventDefault();
      const ar = document.getElementById('new-cat-ar').value.trim();
      const en = document.getElementById('new-cat-en').value.trim();
      if (!ar || !en) return;

      const newCat = {
        id: 'cat_' + Date.now(),
        nameAr: ar,
        nameEn: en,
        icon: '🌟'
      };
      State.categories.push(newCat);
      State.saveToStorage();
      if (window.SupabaseService) window.SupabaseService.upsertCategory(newCat);
      App.closeGlobalModal();
      App.showToast(I18N.t('itemAddedSuccess'), 'success');
      this.render();
    };

    App.openGlobalModal();
  },

  deleteCategory(id) {
    if (State.categories.length <= 1) return;
    State.categories = State.categories.filter(c => c.id !== id);
    State.saveToStorage();
    if (window.SupabaseService) window.SupabaseService.deleteCategory(id);
    App.showToast(I18N.t('itemDeletedSuccess'), 'success');
    this.render();
  },

  // 4. Users & Roles Management
  renderUsersTab() {
    return `
      <div class="admin-crud-header">
        <h4>${I18N.t('tabUsers')}</h4>
      </div>

      <div class="table-responsive mt-3">
        <table class="fikra-table">
          <thead>
            <tr>
              <th>${I18N.t('fullName')}</th>
              <th>${I18N.t('emailAddress')}</th>
              <th>${I18N.t('selectDepartment')}</th>
              <th>${I18N.t('status')} / الدور</th>
              <th>${I18N.t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            ${State.users.map(u => {
              const dept = State.getDepartment(u.departmentId);
              return `
                <tr>
                  <td>
                    <div class="d-flex items-center gap-2">
                      <img src="${u.avatar || 'assets/images/fikra-logo.svg'}" class="author-avatar" />
                      <div>
                        <strong>${u.fullName}</strong>
                        <div class="text-xs text-muted">@${u.username} • ${u.points || 0} ${I18N.t('points')}</div>
                      </div>
                    </div>
                  </td>
                  <td>${u.email}</td>
                  <td>${I18N.getText(dept.nameAr, dept.nameEn)}</td>
                  <td>
                    <select class="form-control form-control-sm" onchange="AdminPortal.updateUserRole('${u.id}', this.value)">
                      <option value="employee" ${u.role === 'employee' ? 'selected' : ''}>${I18N.t('roleEmployee')}</option>
                      <option value="committee" ${u.role === 'committee' ? 'selected' : ''}>${I18N.t('roleCommittee')}</option>
                      <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>${I18N.t('roleAdmin')}</option>
                    </select>
                  </td>
                  <td>
                    <span class="text-xs text-success font-bold"><i class="mdi mdi-check-circle"></i> نشط</span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  updateUserRole(userId, newRole) {
    const user = State.users.find(u => u.id === userId);
    if (!user) return;

    user.role = newRole;
    if (State.currentUser && State.currentUser.id === userId) {
      State.currentUser.role = newRole;
    }

    State.saveToStorage();
    App.showToast(I18N.t('userRoleUpdated'), 'success');
  },

  // 5. AI Settings Tab
  renderAITab() {
    return `
      <div class="ai-settings-card">
        <h4 class="font-bold text-primary mb-2"><i class="mdi mdi-robot-excited"></i> ${I18N.t('tabAISettings')}</h4>
        <p class="text-muted text-sm mb-4">${I18N.currentLang === 'ar' 
          ? 'يعمل محرك الذكاء الاصطناعي الذاتي مجاناً وفورياً للبحث عن التشابه بعد 3 كلمات وتصنيف الأفكار. يمكنك أيضاً ربط مفتاح API خارجي اختياري.'
          : 'The embedded AI engine operates offline for real-time similarity & duplicate detection. You can also configure an optional external API.'}</p>

        <form id="ai-settings-form">
          <div class="form-group mb-4">
            <label class="form-label font-bold">${I18N.currentLang === 'ar' ? 'حساسية رادار اكتشاف التشابه (Similarity Threshold):' : 'AI Similarity Radar Sensitivity:'}</label>
            <div class="d-flex items-center gap-3">
              <input type="range" min="15" max="80" value="${(State.settings.aiSimilarityThreshold || 0.35) * 100}" class="rubric-slider" id="ai-sens-slider" oninput="document.getElementById('sens-val').innerText = this.value + '%'">
              <span id="sens-val" class="font-bold text-primary">${Math.round((State.settings.aiSimilarityThreshold || 0.35) * 100)}%</span>
            </div>
            <span class="text-xs text-muted">${I18N.currentLang === 'ar' ? 'تحديد الحد الأدنى لنسبة التشابه لإظهار تنبيه الفكرة المكررة.' : 'Minimum similarity score to trigger duplicate warnings.'}</span>
          </div>

          <div class="form-group mb-4">
            <label class="form-label font-bold">${I18N.currentLang === 'ar' ? 'مفتاح Google Gemini API (اختياري للتحليل التوليدي المتقدم):' : 'Google Gemini API Key (Optional):'}</label>
            <input type="password" id="gemini-api-key" class="form-control" value="${State.settings.geminiApiKey || ''}" placeholder="${I18N.t('geminiApiKeyPlaceholder')}" />
          </div>

          <button type="submit" class="btn btn-primary">
            <i class="mdi mdi-content-save-check"></i> ${I18N.t('save')}
          </button>
        </form>
      </div>
    `;
  },

  // 6. Database Tab (Supabase Cloud Sync)
  renderDatabaseTab() {
    const isConnected = window.SupabaseService && window.SupabaseService.isConnected;
    const url = window.SupabaseService ? window.SupabaseService.config.url : '';

    return `
      <div class="ai-settings-card">
        <div class="d-flex items-center justify-between mb-3 flex-wrap gap-2">
          <h4 class="font-bold text-primary mb-0">
            <i class="mdi mdi-database-outline"></i> ${I18N.currentLang === 'ar' ? 'سحابة قاعدة البيانات (Supabase Cloud PostgreSQL)' : 'Cloud Database (Supabase PostgreSQL)'}
          </h4>
          <span class="fikra-badge ${isConnected ? 'badge-approved' : 'badge-rejected'}">
            <i class="mdi ${isConnected ? 'mdi-check-decagram' : 'mdi-alert-circle'}"></i> 
            ${isConnected ? (I18N.currentLang === 'ar' ? 'متصل بالسحابة (مزامنة حية)' : 'Connected & Synced') : (I18N.currentLang === 'ar' ? 'غير متصل (يعمل محلياً)' : 'Offline / Local')}
          </span>
        </div>

        <p class="text-secondary text-sm mb-4">
          ${I18N.currentLang === 'ar' 
            ? 'تتيح قاعدة بيانات Supabase مشاركة الأفكار والتصويت والتحكيم فورياً وبشكل حي بين كافة الأجهزة (الهواتف، الأجهزة اللوحية، الحواسيب) لأعضاء هيئة التدريس واللجان.' 
            : 'Supabase PostgreSQL cloud database synchronizes ideas, votes, comments, and evaluations in real-time across all devices.'}
        </p>

        <!-- Live Database Stats Grid -->
        <div class="db-stats-grid mb-4">
          <div class="db-stat-card">
            <div class="db-stat-icon text-primary"><i class="mdi mdi-lightbulb-multiple"></i></div>
            <div class="db-stat-val">${State.ideas.length}</div>
            <div class="db-stat-lbl">${I18N.currentLang === 'ar' ? 'الأفكار المسجلة' : 'Total Ideas'}</div>
          </div>
          <div class="db-stat-card">
            <div class="db-stat-icon text-gold"><i class="mdi mdi-account-group"></i></div>
            <div class="db-stat-val">${State.users.length}</div>
            <div class="db-stat-lbl">${I18N.currentLang === 'ar' ? 'المستخدمين' : 'Total Users'}</div>
          </div>
          <div class="db-stat-card">
            <div class="db-stat-icon text-info"><i class="mdi mdi-domain"></i></div>
            <div class="db-stat-val">${State.departments.length}</div>
            <div class="db-stat-lbl">${I18N.currentLang === 'ar' ? 'الكليات والعمادات' : 'Departments'}</div>
          </div>
          <div class="db-stat-card">
            <div class="db-stat-icon text-success"><i class="mdi mdi-shape"></i></div>
            <div class="db-stat-val">${State.categories.length}</div>
            <div class="db-stat-lbl">${I18N.currentLang === 'ar' ? 'التصنيفات' : 'Categories'}</div>
          </div>
        </div>

        <div class="form-group mb-3">
          <label class="form-label font-bold">${I18N.currentLang === 'ar' ? 'رابط مشروع Supabase:' : 'Supabase Project URL:'}</label>
          <input type="text" class="form-control" value="${url}" readonly />
        </div>

        <div class="d-flex gap-3 mt-4 flex-wrap">
          <button type="button" class="btn btn-primary" onclick="AdminPortal.pushAllToSupabase()">
            <i class="mdi mdi-cloud-upload"></i> ${I18N.currentLang === 'ar' ? 'رفع ومزامنة كافة البيانات الحالية إلى السحابة' : 'Push & Seed All Data to Cloud'}
          </button>
          <button type="button" class="btn btn-outline" onclick="AdminPortal.pullFromSupabase()">
            <i class="mdi mdi-cloud-download"></i> ${I18N.currentLang === 'ar' ? 'جلب أحدث البيانات من السحابة' : 'Pull Latest Data from Cloud'}
          </button>
        </div>

        <!-- SQL Setup Helper Box -->
        <div class="sql-helper-box mt-4">
          <div class="d-flex justify-between items-center mb-2">
            <h5 class="font-bold text-sm mb-0"><i class="mdi mdi-code-braces text-primary"></i> ${I18N.currentLang === 'ar' ? 'كود إنشاء الجداول والصلاحيات في Supabase (SQL Schema)' : 'Supabase SQL Setup Script'}</h5>
            <button type="button" class="btn btn-sm btn-outline" onclick="navigator.clipboard.writeText(document.getElementById('sql-schema-code').innerText); App.showToast(I18N.currentLang === 'ar' ? 'تم نسخ كود SQL إلى الحافظة! 📋' : 'SQL copied to clipboard! 📋', 'success');">
              <i class="mdi mdi-content-copy"></i> ${I18N.currentLang === 'ar' ? 'نسخ كود SQL' : 'Copy SQL'}
            </button>
          </div>
          <pre id="sql-schema-code" class="sql-code-block"><code>CREATE TABLE IF NOT EXISTS public.departments (id TEXT PRIMARY KEY, name_ar TEXT, name_en TEXT, code TEXT);
CREATE TABLE IF NOT EXISTS public.job_titles (id TEXT PRIMARY KEY, title_ar TEXT, title_en TEXT);
CREATE TABLE IF NOT EXISTS public.categories (id TEXT PRIMARY KEY, name_ar TEXT, name_en TEXT, icon TEXT, color TEXT);
CREATE TABLE IF NOT EXISTS public.users (id TEXT PRIMARY KEY, username TEXT, full_name TEXT, email TEXT, password TEXT, department_id TEXT, job_title_id TEXT, role TEXT DEFAULT 'employee', points INT DEFAULT 100, badges JSONB DEFAULT '["new_innovator"]'::jsonb, avatar TEXT);
CREATE TABLE IF NOT EXISTS public.ideas (id TEXT PRIMARY KEY, title_ar TEXT, title_en TEXT, desc_ar TEXT, desc_en TEXT, impact_ar TEXT, impact_en TEXT, budget TEXT, category_id TEXT, department_id TEXT, target_dept_id TEXT, author_id TEXT, author_name TEXT, author_dept TEXT, author_avatar TEXT, status TEXT DEFAULT 'submitted', tags JSONB DEFAULT '[]'::jsonb, ai_score INT DEFAULT 80, ai_summary TEXT, votes JSONB DEFAULT '[]'::jsonb, downvotes JSONB DEFAULT '[]'::jsonb, comments JSONB DEFAULT '[]'::jsonb, evaluation JSONB, created_at TIMESTAMPTZ DEFAULT NOW());
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public full access depts" ON public.departments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access jobs" ON public.job_titles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access cats" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access ideas" ON public.ideas FOR ALL USING (true) WITH CHECK (true);</code></pre>
        </div>
      </div>
    `;
  },

  async pushAllToSupabase() {
    if (!window.SupabaseService) return;
    App.showToast(I18N.currentLang === 'ar' ? 'جارٍ رفع البيانات إلى السحابة...' : 'Uploading data to Supabase...', 'info');
    await window.SupabaseService.seedRemoteDatabase();
    App.showToast(I18N.currentLang === 'ar' ? 'تمت مزامنة البيانات مع Supabase بنجاح! 🚀' : 'Data synced with Supabase successfully! 🚀', 'success');
  },

  async pullFromSupabase() {
    if (!window.SupabaseService) return;
    App.showToast(I18N.currentLang === 'ar' ? 'جارٍ جلب البيانات...' : 'Fetching data from Supabase...', 'info');
    await window.SupabaseService.syncAllFromRemote();
    App.showToast(I18N.currentLang === 'ar' ? 'تم تحديث البيانات بنجاح!' : 'Data refreshed from Supabase!', 'success');
  },

  confirmResetSeedData() {
    if (confirm(I18N.t('resetSeedDataConfirm'))) {
      localStorage.clear();
      State.init();
      App.showToast(I18N.t('dataResetSuccess'), 'success');
      App.render();
    }
  }
};

window.AdminPortal = AdminPortal;
