/**
 * Fikra (فكرة) - Committee Evaluation & Review Portal Module
 * Allows committee members to assess submitted ideas using a multi-criteria scoring rubric,
 * render formal decisions, and record official notes.
 */

const CommitteePortal = {
  activeTab: 'pending', // 'pending' or 'evaluated'

  render() {
    const container = document.getElementById('committee-portal-container');
    if (!container) return;

    if (!Auth.isCommittee()) {
      container.innerHTML = `
        <div class="access-denied-box">
          <i class="mdi mdi-shield-lock-outline"></i>
          <h3>${I18N.currentLang === 'ar' ? 'هذه الصفحة مخصصة لأعضاء لجنة التحكيم والتقييم' : 'This portal is restricted to Committee Evaluators'}</h3>
          <p>${I18N.currentLang === 'ar' ? 'يمكنك التبديل إلى حساب المحكم للتجربة من زر الدخول السريع.' : 'You can switch to the Committee account using the quick demo bar.'}</p>
          <button class="btn btn-primary" onclick="Auth.loginAsRole('committee'); App.render();">
            <i class="mdi mdi-account-switch"></i> ${I18N.currentLang === 'ar' ? 'دخول بحساب المحكم (د. محمد القرني)' : 'Sign in as Committee Member'}
          </button>
        </div>
      `;
      return;
    }

    const pendingIdeas = State.ideas.filter(i => i.status === 'submitted' || i.status === 'under_review');
    const evaluatedIdeas = State.ideas.filter(i => i.status === 'approved' || i.status === 'rejected' || i.status === 'implemented');

    container.innerHTML = `
      <div class="committee-header">
        <div class="header-titles">
          <h2><i class="mdi mdi-scale-balance text-gold"></i> ${I18N.t('committeePortalTitle')}</h2>
          <p class="text-muted">${I18N.t('committeeSubtitle')}</p>
        </div>
        <div class="committee-tabs-nav">
          <button class="tab-btn ${this.activeTab === 'pending' ? 'active' : ''}" onclick="CommitteePortal.switchTab('pending')">
            <i class="mdi mdi-clock-alert-outline"></i> ${I18N.t('pendingReviewIdeas')} (${pendingIdeas.length})
          </button>
          <button class="tab-btn ${this.activeTab === 'evaluated' ? 'active' : ''}" onclick="CommitteePortal.switchTab('evaluated')">
            <i class="mdi mdi-checkbox-marked-circle-outline"></i> ${I18N.t('evaluatedIdeas')} (${evaluatedIdeas.length})
          </button>
        </div>
      </div>

      <div class="committee-list mt-4">
        ${this.activeTab === 'pending' 
          ? this.renderPendingList(pendingIdeas) 
          : this.renderEvaluatedList(evaluatedIdeas)}
      </div>
    `;
  },

  switchTab(tab) {
    this.activeTab = tab;
    this.render();
  },

  renderPendingList(ideas) {
    if (ideas.length === 0) {
      return `
        <div class="empty-state-box">
          <i class="mdi mdi-check-all empty-state-icon text-success"></i>
          <h3>${I18N.currentLang === 'ar' ? 'تم الانتهاء من مراجعة كافة الأفكار المقدمة!' : 'All pending ideas have been evaluated!'}</h3>
          <p>${I18N.currentLang === 'ar' ? 'لا توجد أفكار جديدة في قائمة الانتظار حالياً.' : 'No new ideas waiting in the review queue.'}</p>
        </div>
      `;
    }

    return ideas.map(idea => {
      const title = I18N.getText(idea.titleAr, idea.titleEn);
      const desc = I18N.getText(idea.descAr, idea.descEn);
      const catName = I18N.getText(State.getCategory(idea.categoryId).nameAr, State.getCategory(idea.categoryId).nameEn);
      const deptName = I18N.getText(State.getDepartment(idea.targetDeptId).nameAr, State.getDepartment(idea.targetDeptId).nameEn);

      return `
        <div class="committee-item-card">
          <div class="committee-card-top">
            <div class="d-flex items-center gap-2">
              <img src="${idea.authorAvatar || 'assets/images/fikra-logo.svg'}" class="author-avatar" />
              <div>
                <h4 class="font-bold">${idea.authorName}</h4>
                <span class="text-sm text-muted">${idea.authorDept} • ${new Date(idea.createdAt).toLocaleDateString(I18N.currentLang === 'ar' ? 'ar-SA' : 'en-US')}</span>
              </div>
            </div>
            <div>${IdeasManager.getStatusBadgeHTML(idea.status)}</div>
          </div>

          <div class="my-3">
            <h3 class="text-lg font-bold text-primary mb-2">${title}</h3>
            <p class="text-secondary text-sm mb-3">${desc}</p>
            <div class="d-flex gap-2 flex-wrap">
              <span class="tag-chip"><i class="mdi mdi-shape"></i> ${catName}</span>
              <span class="tag-chip"><i class="mdi mdi-target"></i> ${deptName}</span>
              <span class="tag-chip text-success"><i class="mdi mdi-robot"></i> ${I18N.t('aiImpactScore')} ${idea.aiScore}%</span>
            </div>
          </div>

          <div class="committee-card-actions">
            <button class="btn btn-primary" onclick="CommitteePortal.openEvaluationModal('${idea.id}')">
              <i class="mdi mdi-scale-balance"></i> ${I18N.t('evaluateIdeaBtn')}
            </button>
            <button class="btn btn-outline" onclick="IdeasManager.openIdeaDetailsModal('${idea.id}')">
              <i class="mdi mdi-eye"></i> ${I18N.t('details')}
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  renderEvaluatedList(ideas) {
    if (ideas.length === 0) {
      return `
        <div class="empty-state-box">
          <i class="mdi mdi-folder-open-outline empty-state-icon"></i>
          <h3>${I18N.currentLang === 'ar' ? 'لا توجد أفكار تم تقييمها بعد' : 'No evaluated ideas yet'}</h3>
        </div>
      `;
    }

    return ideas.map(idea => {
      const evalData = idea.evaluation || {};
      return `
        <div class="committee-item-card evaluated-border">
          <div class="committee-card-top">
            <div>
              <h4 class="font-bold text-primary">${I18N.getText(idea.titleAr, idea.titleEn)}</h4>
              <span class="text-sm text-muted">${idea.authorName} (${idea.authorDept})</span>
            </div>
            <div>${IdeasManager.getStatusBadgeHTML(idea.status)}</div>
          </div>

          <div class="eval-result-summary mt-3">
            <div class="eval-scores-chips">
              <span>المواءمة: <strong>${evalData.strategicScore || 5}/5</strong></span>
              <span>الابتكار: <strong>${evalData.innovationScore || 4}/5</strong></span>
              <span>التنفيذ: <strong>${evalData.feasibilityScore || 5}/5</strong></span>
              <span>الأثر: <strong>${evalData.impactScore || 5}/5</strong></span>
            </div>
            <p class="committee-feedback-snippet mt-2">
              <i class="mdi mdi-comment-quote-outline text-gold"></i>
              ${evalData.feedbackNote || 'تم الاعتماد.'}
            </p>
          </div>

          <div class="d-flex justify-end mt-2">
            <button class="btn btn-sm btn-outline" onclick="CommitteePortal.openEvaluationModal('${idea.id}')">
              <i class="mdi mdi-square-edit-outline"></i> ${I18N.currentLang === 'ar' ? 'تعديل التقييم' : 'Update Evaluation'}
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  // Open Evaluation Rubric Modal
  openEvaluationModal(ideaId) {
    const idea = State.ideas.find(i => i.id === ideaId);
    if (!idea) return;

    const modalBody = document.getElementById('global-modal-body');
    const modalTitle = document.getElementById('global-modal-title');
    if (!modalBody || !modalTitle) return;

    const existingEval = idea.evaluation || {
      strategicScore: 5,
      innovationScore: 4,
      feasibilityScore: 4,
      impactScore: 5,
      decision: 'approved',
      feedbackNote: ''
    };

    modalTitle.innerHTML = `<i class="mdi mdi-scale-balance text-gold"></i> ${I18N.t('evaluateIdeaBtn')} — ${I18N.getText(idea.titleAr, idea.titleEn)}`;

    modalBody.innerHTML = `
      <form id="committee-eval-form" class="evaluation-form">
        <div class="eval-intro-card mb-3">
          <h4 class="font-bold text-primary mb-1">${I18N.getText(idea.titleAr, idea.titleEn)}</h4>
          <p class="text-sm text-secondary">${I18N.getText(idea.descAr, idea.descEn)}</p>
        </div>

        <h4 class="rubric-title mb-3"><i class="mdi mdi-chart-box-outline"></i> ${I18N.t('evaluationRubric')}</h4>

        <!-- Rubric Criteria 1 -->
        <div class="rubric-item">
          <div class="rubric-item-header">
            <label>${I18N.t('rubricStrategic')}</label>
            <span class="score-display" id="score-val-strat">${existingEval.strategicScore} / 5</span>
          </div>
          <input type="range" min="1" max="5" value="${existingEval.strategicScore}" class="rubric-slider" id="slider-strat" oninput="document.getElementById('score-val-strat').innerText = this.value + ' / 5'">
        </div>

        <!-- Rubric Criteria 2 -->
        <div class="rubric-item">
          <div class="rubric-item-header">
            <label>${I18N.t('rubricInnovation')}</label>
            <span class="score-display" id="score-val-innov">${existingEval.innovationScore} / 5</span>
          </div>
          <input type="range" min="1" max="5" value="${existingEval.innovationScore}" class="rubric-slider" id="slider-innov" oninput="document.getElementById('score-val-innov').innerText = this.value + ' / 5'">
        </div>

        <!-- Rubric Criteria 3 -->
        <div class="rubric-item">
          <div class="rubric-item-header">
            <label>${I18N.t('rubricFeasibility')}</label>
            <span class="score-display" id="score-val-feas">${existingEval.feasibilityScore} / 5</span>
          </div>
          <input type="range" min="1" max="5" value="${existingEval.feasibilityScore}" class="rubric-slider" id="slider-feas" oninput="document.getElementById('score-val-feas').innerText = this.value + ' / 5'">
        </div>

        <!-- Rubric Criteria 4 -->
        <div class="rubric-item">
          <div class="rubric-item-header">
            <label>${I18N.t('rubricImpact')}</label>
            <span class="score-display" id="score-val-imp">${existingEval.impactScore} / 5</span>
          </div>
          <input type="range" min="1" max="5" value="${existingEval.impactScore}" class="rubric-slider" id="slider-imp" oninput="document.getElementById('score-val-imp').innerText = this.value + ' / 5'">
        </div>

        <div class="decision-radios-section mt-4">
          <label class="font-bold d-block mb-2">${I18N.t('committeeDecision')}</label>
          <div class="decision-options-grid">
            <label class="decision-card approve-card">
              <input type="radio" name="decisionChoice" value="approved" ${existingEval.decision === 'approved' ? 'checked' : ''} />
              <div class="decision-card-inner">
                <i class="mdi mdi-check-circle-outline"></i>
                <span>${I18N.t('actionApprove')}</span>
              </div>
            </label>

            <label class="decision-card revise-card">
              <input type="radio" name="decisionChoice" value="under_review" ${existingEval.decision === 'under_review' ? 'checked' : ''} />
              <div class="decision-card-inner">
                <i class="mdi mdi-help-circle-outline"></i>
                <span>${I18N.t('actionRequestInfo')}</span>
              </div>
            </label>

            <label class="decision-card reject-card">
              <input type="radio" name="decisionChoice" value="rejected" ${existingEval.decision === 'rejected' ? 'checked' : ''} />
              <div class="decision-card-inner">
                <i class="mdi mdi-close-circle-outline"></i>
                <span>${I18N.t('actionReject')}</span>
              </div>
            </label>
          </div>
        </div>

        <div class="form-group mt-3">
          <label class="font-bold mb-1 d-block">${I18N.t('committeeFeedbackNote')}</label>
          <textarea id="eval-feedback-note" class="form-control" rows="3" required placeholder="${I18N.currentLang === 'ar' ? 'اكتب أسباب القرار، التوصيات التطويرية، والتوجيهات...' : 'Write decision notes and recommendations...'}">${existingEval.feedbackNote || ''}</textarea>
        </div>

        <div class="modal-actions-footer mt-4">
          <button type="button" class="btn btn-secondary" onclick="App.closeGlobalModal()">${I18N.t('cancel')}</button>
          <button type="submit" class="btn btn-primary"><i class="mdi mdi-check"></i> ${I18N.t('save')}</button>
        </div>
      </form>
    `;

    document.getElementById('committee-eval-form').onsubmit = (e) => {
      e.preventDefault();
      const decision = document.querySelector('input[name="decisionChoice"]:checked').value;
      const feedback = document.getElementById('eval-feedback-note').value;

      if (!feedback || !feedback.trim()) {
        App.showToast(I18N.t('fieldRequired'), 'warning');
        return;
      }

      idea.status = decision;
      idea.evaluation = {
        evaluatedBy: State.currentUser.id,
        evaluatedByName: State.currentUser.fullName,
        strategicScore: parseInt(document.getElementById('slider-strat').value),
        innovationScore: parseInt(document.getElementById('slider-innov').value),
        feasibilityScore: parseInt(document.getElementById('slider-feas').value),
        impactScore: parseInt(document.getElementById('slider-imp').value),
        decision: decision,
        feedbackNote: feedback.trim(),
        evaluatedAt: new Date().toISOString()
      };

      // If approved, award author +200 bonus points!
      if (decision === 'approved') {
        const author = State.users.find(u => u.id === idea.authorId);
        if (author) {
          author.points = (author.points || 0) + 200;
          if (!author.badges.includes('innovator_gold')) {
            author.badges.push('innovator_gold');
          }
        }
      }

      State.saveToStorage();
      App.closeGlobalModal();
      App.showToast(I18N.t('committeeDecisionRecorded'), 'success');
      CommitteePortal.render();
      IdeasManager.refreshFeed();
    };

    App.openGlobalModal();
  }
};

window.CommitteePortal = CommitteePortal;
