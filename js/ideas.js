/**
 * Fikra (فكرة) - Ideas Management & Public Feed Module
 * Handles idea submission, real-time AI duplicate radar, voting, commenting, filtering, and PDF generation.
 */

const IdeasManager = {
  activeFilter: {
    dept: 'all',
    status: 'all',
    category: 'all',
    search: '',
    sort: 'top_voted'
  },

  // Submit Idea Form Handler
  async submitNewIdea(formData) {
    if (!Auth.isLoggedIn()) {
      return { success: false, message: I18N.t('invalidCredentials') };
    }

    const { title, categoryId, targetDeptId, desc, impact, budget, tagsString } = formData;

    if (!title || !desc || !categoryId) {
      return { success: false, message: I18N.t('fillAllFields') };
    }

    // AI Analysis & Classification
    const aiAnalysis = await AIEngine.analyzeAndClassifyIdea(title, desc, impact);

    // Merge manual tags with AI suggested tags
    const manualTags = tagsString ? tagsString.split(/[\s,#]+/).filter(t => t.trim().length > 1) : [];
    const mergedTags = [...new Set([...manualTags, ...aiAnalysis.suggestedTags])];

    const currentAuthor = State.currentUser;
    const authorDept = State.getDepartment(currentAuthor.departmentId);

    const newIdea = {
      id: 'idea_' + Date.now(),
      titleAr: I18N.currentLang === 'ar' ? title : title,
      titleEn: I18N.currentLang === 'en' ? title : title,
      descAr: I18N.currentLang === 'ar' ? desc : desc,
      descEn: I18N.currentLang === 'en' ? desc : desc,
      impactAr: impact || (I18N.currentLang === 'ar' ? 'تحسين بيئة العمل ورفع الكفاءة التشغيلية' : 'Improves operations & efficiency'),
      impactEn: impact || 'Improves operations & efficiency',
      budget: budget || (I18N.currentLang === 'ar' ? 'حسب المتاح' : 'As needed'),
      categoryId: categoryId || aiAnalysis.predictedCategoryId,
      departmentId: currentAuthor.departmentId,
      targetDeptId: targetDeptId || currentAuthor.departmentId,
      authorId: currentAuthor.id,
      authorName: currentAuthor.fullName,
      authorDept: I18N.getText(authorDept.nameAr, authorDept.nameEn),
      authorAvatar: currentAuthor.avatar,
      status: 'submitted', // initial status
      createdAt: new Date().toISOString(),
      tags: mergedTags,
      aiScore: aiAnalysis.impactScore,
      aiSummary: I18N.getText(aiAnalysis.summaryAr, aiAnalysis.summaryEn),
      votes: [currentAuthor.id], // initial upvote by author
      downvotes: [],
      comments: [],
      evaluation: null
    };

    State.ideas.unshift(newIdea);

    // Award +50 gamification points for submitting an idea
    currentAuthor.points = (currentAuthor.points || 0) + 50;
    const userInList = State.users.find(u => u.id === currentAuthor.id);
    if (userInList) userInList.points = currentAuthor.points;

    State.saveToStorage();

    // Live Sync to Supabase Cloud Database
    if (window.SupabaseService) {
      try {
        await window.SupabaseService.upsertIdea(newIdea);
        await window.SupabaseService.upsertUser(currentAuthor);
      } catch (err) {
        console.warn('Cloud sync error on submit:', err);
      }
    }

    return { success: true, idea: newIdea };
  },

  // Upvote / Un-upvote
  async toggleVote(ideaId) {
    if (!Auth.isLoggedIn()) {
      window.App.showToast(I18N.t('invalidCredentials'), 'warning');
      return;
    }

    const idea = State.ideas.find(i => i.id === ideaId);
    if (!idea) return;

    const userId = State.currentUser.id;
    if (!idea.votes) idea.votes = [];

    const index = idea.votes.indexOf(userId);
    if (index > -1) {
      // Remove vote
      idea.votes.splice(index, 1);
    } else {
      // Add vote
      idea.votes.push(userId);
      // Award points to idea author (+10)
      const author = State.users.find(u => u.id === idea.authorId);
      if (author && author.id !== userId) {
        author.points = (author.points || 0) + 10;
        if (window.SupabaseService) window.SupabaseService.upsertUser(author);
      }
    }

    State.saveToStorage();
    this.refreshFeed();
    if (window.SupabaseService) await window.SupabaseService.upsertIdea(idea);
  },

  // Add Comment
  async addComment(ideaId, text) {
    if (!Auth.isLoggedIn()) {
      return { success: false, message: I18N.t('invalidCredentials') };
    }

    if (!text || !text.trim()) {
      return { success: false, message: I18N.t('fieldRequired') };
    }

    const idea = State.ideas.find(i => i.id === ideaId);
    if (!idea) return { success: false };

    if (!idea.comments) idea.comments = [];

    const newComment = {
      id: 'c_' + Date.now(),
      authorId: State.currentUser.id,
      authorName: State.currentUser.fullName + (State.currentUser.role === 'committee' ? ` (${I18N.t('roleCommittee')})` : ''),
      authorAvatar: State.currentUser.avatar,
      text: text.trim(),
      createdAt: new Date().toISOString()
    };

    idea.comments.push(newComment);

    // Gamification bonus for commenting (+5 pts)
    State.currentUser.points = (State.currentUser.points || 0) + 5;
    const userInList = State.users.find(u => u.id === State.currentUser.id);
    if (userInList) userInList.points = State.currentUser.points;

    State.saveToStorage();
    if (window.SupabaseService) {
      await window.SupabaseService.upsertIdea(idea);
      await window.SupabaseService.upsertUser(State.currentUser);
    }
    return { success: true, comment: newComment };
  },

  // Get filtered and sorted ideas
  getFilteredIdeas() {
    let list = [...State.ideas];

    // Filter by Dept
    if (this.activeFilter.dept !== 'all') {
      list = list.filter(i => i.departmentId === this.activeFilter.dept || i.targetDeptId === this.activeFilter.dept);
    }

    // Filter by Status
    if (this.activeFilter.status !== 'all') {
      list = list.filter(i => i.status === this.activeFilter.status);
    }

    // Filter by Category
    if (this.activeFilter.category !== 'all') {
      list = list.filter(i => i.categoryId === this.activeFilter.category);
    }

    // Search Query
    if (this.activeFilter.search && this.activeFilter.search.trim()) {
      const q = AIEngine.normalizeArabic(this.activeFilter.search);
      list = list.filter(i => {
        const fullDoc = AIEngine.normalizeArabic(
          `${i.titleAr} ${i.titleEn} ${i.descAr} ${i.descEn} ${i.authorName} ${(i.tags || []).join(' ')}`
        );
        return fullDoc.includes(q);
      });
    }

    // Sorting
    if (this.activeFilter.sort === 'top_voted') {
      list.sort((a, b) => (b.votes ? b.votes.length : 0) - (a.votes ? a.votes.length : 0));
    } else if (this.activeFilter.sort === 'newest') {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (this.activeFilter.sort === 'most_comments') {
      list.sort((a, b) => (b.comments ? b.comments.length : 0) - (a.comments ? a.comments.length : 0));
    } else if (this.activeFilter.sort === 'impact') {
      list.sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));
    }

    return list;
  },

  // Format Status Badge
  getStatusBadgeHTML(status) {
    const map = {
      submitted: { label: I18N.t('statusSubmitted'), class: 'badge-submitted', icon: 'mdi-clock-outline' },
      under_review: { label: I18N.t('statusUnderReview'), class: 'badge-under-review', icon: 'mdi-file-find-outline' },
      approved: { label: I18N.t('statusApproved'), class: 'badge-approved', icon: 'mdi-check-decagram' },
      in_progress: { label: I18N.t('statusInProgress'), class: 'badge-in-progress', icon: 'mdi-progress-wrench' },
      implemented: { label: I18N.t('statusImplemented'), class: 'badge-implemented', icon: 'mdi-trophy-award' },
      rejected: { label: I18N.t('statusRejected'), class: 'badge-rejected', icon: 'mdi-close-circle-outline' }
    };

    const item = map[status] || map.submitted;
    return `<span class="fikra-badge ${item.class}"><i class="mdi ${item.icon}"></i> ${item.label}</span>`;
  },

  refreshFeed() {
    const container = document.getElementById('ideas-feed-container');
    if (!container) return;

    const ideas = this.getFilteredIdeas();
    if (ideas.length === 0) {
      container.innerHTML = `
        <div class="empty-state-box">
          <div class="empty-state-icon"><i class="mdi mdi-lightbulb-off-outline"></i></div>
          <h3>${I18N.t('noIdeasFound')}</h3>
          <p>${I18N.currentLang === 'ar' ? 'جرب تغيير خيارات التصفية أو كن أول من يطرح فكرة ملهمة!' : 'Try changing your filters or be the first to submit an idea!'}</p>
          <button class="btn btn-primary" onclick="App.navigate('submit_idea')">
            <i class="mdi mdi-plus-circle"></i> ${I18N.t('navSubmitIdea')}
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = ideas.map(idea => this.renderIdeaCardHTML(idea)).join('');
  },

  renderIdeaCardHTML(idea) {
    const isVoted = Auth.isLoggedIn() && idea.votes && idea.votes.includes(State.currentUser.id);
    const votesCount = idea.votes ? idea.votes.length : 0;
    const commentsCount = idea.comments ? idea.comments.length : 0;
    const category = State.getCategory(idea.categoryId);
    const targetDept = State.getDepartment(idea.targetDeptId);

    const title = I18N.getText(idea.titleAr, idea.titleEn);
    const desc = I18N.getText(idea.descAr, idea.descEn);
    const impact = I18N.getText(idea.impactAr, idea.impactEn);
    const catName = I18N.getText(category.nameAr, category.nameEn);
    const deptName = I18N.getText(targetDept.nameAr, targetDept.nameEn);

    const formattedDate = new Date(idea.createdAt).toLocaleDateString(
      I18N.currentLang === 'ar' ? 'ar-SA' : 'en-US',
      { year: 'numeric', month: 'short', day: 'numeric' }
    );

    return `
      <article class="idea-card" id="card-${idea.id}">
        <div class="idea-card-header">
          <div class="author-info">
            <img src="${idea.authorAvatar || 'assets/images/fikra-logo.svg'}" alt="${idea.authorName}" class="author-avatar" />
            <div class="author-details">
              <h4 class="author-name">${idea.authorName}</h4>
              <span class="author-dept"><i class="mdi mdi-domain"></i> ${idea.authorDept} • ${formattedDate}</span>
            </div>
          </div>
          <div class="status-wrap">
            ${this.getStatusBadgeHTML(idea.status)}
          </div>
        </div>

        <div class="idea-card-body">
          <div class="idea-meta-pills">
            <span class="category-pill"><i class="mdi mdi-shape-outline"></i> ${catName}</span>
            <span class="target-dept-pill"><i class="mdi mdi-target"></i> ${deptName}</span>
            <span class="ai-score-pill"><i class="mdi mdi-robot-excited"></i> ${I18N.t('aiImpactScore')} ${idea.aiScore || 85}%</span>
          </div>

          <h3 class="idea-title">${title}</h3>
          <p class="idea-desc">${desc}</p>

          ${impact ? `
            <div class="idea-impact-box">
              <span class="impact-label"><i class="mdi mdi-trending-up"></i> ${I18N.t('ideaImpact')}:</span>
              <span class="impact-text">${impact}</span>
            </div>
          ` : ''}

          <!-- Tags -->
          <div class="idea-tags">
            ${(idea.tags || []).map(tag => `<span class="tag-chip">#${tag.replace('#', '')}</span>`).join('')}
          </div>

          ${idea.evaluation && idea.evaluation.decision === 'approved' ? `
            <div class="committee-approved-note">
              <div class="committee-note-header">
                <i class="mdi mdi-shield-check"></i>
                <strong>${I18N.currentLang === 'ar' ? 'قرار لجنة التحكيم بالاعتماد:' : 'Committee Decision:'}</strong>
              </div>
              <p class="committee-note-body">${idea.evaluation.feedbackNote}</p>
            </div>
          ` : ''}
        </div>

        <div class="idea-card-footer">
          <div class="actions-left">
            <button class="btn-vote ${isVoted ? 'voted' : ''}" onclick="IdeasManager.toggleVote('${idea.id}')">
              <i class="mdi ${isVoted ? 'mdi-heart' : 'mdi-heart-outline'}"></i>
              <span class="vote-count">${votesCount}</span>
              <span class="vote-label">${I18N.t('votesCount')}</span>
            </button>
            <button class="btn-comment-toggle" onclick="IdeasManager.openCommentsModal('${idea.id}')">
              <i class="mdi mdi-comment-text-outline"></i>
              <span class="comment-count">${commentsCount}</span>
              <span class="comment-label">${I18N.t('commentsCount')}</span>
            </button>
          </div>

          <div class="actions-right">
            <button class="btn-action-icon" title="${I18N.t('details')}" onclick="IdeasManager.openIdeaDetailsModal('${idea.id}')">
              <i class="mdi mdi-eye-outline"></i>
            </button>
            <button class="btn-action-icon" title="Print / PDF" onclick="IdeasManager.printIdeaSheet('${idea.id}')">
              <i class="mdi mdi-printer-outline"></i>
            </button>
          </div>
        </div>
      </article>
    `;
  },

  // Open Details Modal
  openIdeaDetailsModal(ideaId) {
    const idea = State.ideas.find(i => i.id === ideaId);
    if (!idea) return;

    const modalBody = document.getElementById('global-modal-body');
    const modalTitle = document.getElementById('global-modal-title');
    if (!modalBody || !modalTitle) return;

    modalTitle.innerHTML = `<i class="mdi mdi-lightbulb-on text-gold"></i> ${I18N.getText(idea.titleAr, idea.titleEn)}`;
    
    modalBody.innerHTML = `
      <div class="idea-detail-view">
        <div class="detail-header-card">
          <div class="d-flex justify-between items-center mb-3">
            <div class="d-flex items-center gap-2">
              <img src="${idea.authorAvatar || 'assets/images/fikra-logo.svg'}" class="author-avatar-lg" />
              <div>
                <h4 class="font-bold text-lg">${idea.authorName}</h4>
                <p class="text-sm text-muted">${idea.authorDept}</p>
              </div>
            </div>
            <div>${this.getStatusBadgeHTML(idea.status)}</div>
          </div>
          <div class="meta-grid">
            <div class="meta-item">
              <span class="meta-label">${I18N.t('ideaCategory')}:</span>
              <span class="meta-val">${I18N.getText(State.getCategory(idea.categoryId).nameAr, State.getCategory(idea.categoryId).nameEn)}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">${I18N.t('ideaTargetDept')}:</span>
              <span class="meta-val">${I18N.getText(State.getDepartment(idea.targetDeptId).nameAr, State.getDepartment(idea.targetDeptId).nameEn)}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">${I18N.t('ideaBudget')}:</span>
              <span class="meta-val">${idea.budget || 'N/A'}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">${I18N.t('aiImpactScore')}:</span>
              <span class="meta-val text-success font-bold">${idea.aiScore || 85}%</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4 class="section-heading"><i class="mdi mdi-text-box-outline"></i> ${I18N.t('ideaDesc')}</h4>
          <p class="section-content">${I18N.getText(idea.descAr, idea.descEn)}</p>
        </div>

        <div class="detail-section">
          <h4 class="section-heading"><i class="mdi mdi-chart-line"></i> ${I18N.t('ideaImpact')}</h4>
          <p class="section-content">${I18N.getText(idea.impactAr, idea.impactEn)}</p>
        </div>

        <div class="detail-section">
          <h4 class="section-heading"><i class="mdi mdi-tag-multiple-outline"></i> ${I18N.t('aiAutoTags')}</h4>
          <div class="tag-list">
            ${(idea.tags || []).map(t => `<span class="tag-chip">#${t}</span>`).join(' ')}
          </div>
        </div>

        ${idea.evaluation ? `
          <div class="detail-section committee-eval-box">
            <h4 class="section-heading text-primary"><i class="mdi mdi-scale-balance"></i> ${I18N.t('evaluationRubric')}</h4>
            <div class="eval-grid mb-3">
              <div>المواءمة الاستراتيجية: <strong>${idea.evaluation.strategicScore} / 5</strong></div>
              <div>الابتكار والأصالة: <strong>${idea.evaluation.innovationScore} / 5</strong></div>
              <div>قابلية التنفيذ: <strong>${idea.evaluation.feasibilityScore} / 5</strong></div>
              <div>الأثر والعائد: <strong>${idea.evaluation.impactScore} / 5</strong></div>
            </div>
            <p><strong>توجيهات المحكم (${idea.evaluation.evaluatedByName}):</strong> ${idea.evaluation.feedbackNote}</p>
          </div>
        ` : ''}

        <div class="mt-4 pt-3 border-top d-flex justify-between items-center">
          <button class="btn btn-outline" onclick="IdeasManager.printIdeaSheet('${idea.id}')">
            <i class="mdi mdi-printer"></i> ${I18N.t('exportPDF')}
          </button>
          <button class="btn btn-secondary" onclick="App.closeGlobalModal()">
            ${I18N.t('close')}
          </button>
        </div>
      </div>
    `;

    App.openGlobalModal();
  },

  // Open Comments Modal
  openCommentsModal(ideaId) {
    const idea = State.ideas.find(i => i.id === ideaId);
    if (!idea) return;

    const modalBody = document.getElementById('global-modal-body');
    const modalTitle = document.getElementById('global-modal-title');
    if (!modalBody || !modalTitle) return;

    modalTitle.innerHTML = `<i class="mdi mdi-comment-multiple text-primary"></i> ${I18N.t('commentsTitle')} — ${I18N.getText(idea.titleAr, idea.titleEn)}`;

    const renderCommentsList = (comments) => {
      if (!comments || comments.length === 0) {
        return `<div class="p-4 text-center text-muted">${I18N.t('noCommentsYet')}</div>`;
      }
      return comments.map(c => `
        <div class="comment-item">
          <img src="${c.authorAvatar || 'assets/images/fikra-logo.svg'}" class="comment-avatar" />
          <div class="comment-content">
            <div class="comment-author-row">
              <span class="comment-author-name">${c.authorName}</span>
              <span class="comment-time">${new Date(c.createdAt).toLocaleDateString(I18N.currentLang === 'ar' ? 'ar-SA' : 'en-US')}</span>
            </div>
            <p class="comment-text">${c.text}</p>
          </div>
        </div>
      `).join('');
    };

    modalBody.innerHTML = `
      <div class="comments-container">
        <div class="comments-scroll-list" id="comments-list-box">
          ${renderCommentsList(idea.comments)}
        </div>

        <div class="comment-input-form mt-3">
          <textarea id="new-comment-textarea" class="form-control" rows="3" placeholder="${I18N.t('addComment')}"></textarea>
          <div class="d-flex justify-end mt-2">
            <button class="btn btn-primary" id="btn-submit-comment">
              <i class="mdi mdi-send"></i> ${I18N.t('postCommentBtn')}
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-submit-comment').onclick = () => {
      const textarea = document.getElementById('new-comment-textarea');
      const val = textarea.value;
      const res = this.addComment(idea.id, val);
      if (res.success) {
        document.getElementById('comments-list-box').innerHTML = renderCommentsList(idea.comments);
        textarea.value = '';
        this.refreshFeed();
      } else {
        App.showToast(res.message, 'warning');
      }
    };

    App.openGlobalModal();
  },

  // Printable Idea Sheet
  printIdeaSheet(ideaId) {
    const idea = State.ideas.find(i => i.id === ideaId);
    if (!idea) return;

    const printWin = window.open('', '_blank', 'width=850,height=900');
    if (!printWin) {
      window.print();
      return;
    }

    const title = I18N.getText(idea.titleAr, idea.titleEn);
    const desc = I18N.getText(idea.descAr, idea.descEn);
    const impact = I18N.getText(idea.impactAr, idea.impactEn);
    const catName = I18N.getText(State.getCategory(idea.categoryId).nameAr, State.getCategory(idea.categoryId).nameEn);
    const deptName = I18N.getText(State.getDepartment(idea.targetDeptId).nameAr, State.getDepartment(idea.targetDeptId).nameEn);

    printWin.document.write(`
      <!DOCTYPE html>
      <html lang="${I18N.currentLang}" dir="${I18N.currentLang === 'ar' ? 'rtl' : 'ltr'}">
      <head>
        <meta charset="UTF-8">
        <title>${title} - ${I18N.t('appName')}</title>
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&family=Outfit:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Tajawal', sans-serif; padding: 40px; color: #1f2937; line-height: 1.6; background: #fff; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #14573A; padding-bottom: 15px; margin-bottom: 30px; }
          .logo-text h1 { margin: 0; color: #14573A; font-size: 24px; }
          .logo-text h2 { margin: 0; color: #C5A059; font-size: 14px; }
          .badge { display: inline-block; padding: 6px 14px; border-radius: 20px; font-weight: bold; background: #E8F5E9; color: #14573A; border: 1px solid #14573A; }
          .box { border: 1px solid #E5E7EB; border-radius: 8px; padding: 18px; margin-bottom: 20px; background: #FAFDF9; }
          .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px; }
          .footer { margin-top: 50px; border-top: 1px solid #ddd; padding-top: 15px; font-size: 12px; color: #666; text-align: center; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-text">
            <h1>جامعة بيشة — منصة فكرة للابتكار</h1>
            <h2>University of Bisha — Fikra Institutional Idea Sheet</h2>
          </div>
          <div>
            <span class="badge">معرف الفكرة: ${idea.id}</span>
          </div>
        </div>

        <h2 style="color: #14573A; margin-bottom: 15px;">${title}</h2>

        <div class="grid">
          <div class="box"><strong>صاحب الفكرة:</strong> ${idea.authorName} (${idea.authorDept})</div>
          <div class="box"><strong>الجهة المستفيدة:</strong> ${deptName}</div>
          <div class="box"><strong>المجال الاستراتيجي:</strong> ${catName}</div>
          <div class="box"><strong>الميزانية التقديرية:</strong> ${idea.budget || 'حسب التقييم'}</div>
        </div>

        <div class="box">
          <h3 style="color: #14573A; margin-top:0;">شرح وتفاصيل الفكرة:</h3>
          <p>${desc}</p>
        </div>

        <div class="box">
          <h3 style="color: #14573A; margin-top:0;">الأثر والمخرجات المتوقعة:</h3>
          <p>${impact}</p>
        </div>

        <div class="box">
          <h3 style="color: #14573A; margin-top:0;">تحليل الذكاء الاصطناعي:</h3>
          <p><strong>مؤشر الأثر:</strong> ${idea.aiScore}% | <strong>الوسوم:</strong> ${(idea.tags || []).join(', ')}</p>
        </div>

        ${idea.evaluation ? `
          <div class="box" style="border: 2px solid #14573A; background: #F4FAF5;">
            <h3 style="color: #14573A; margin-top:0;">قرار وتوصيات لجنة التحكيم:</h3>
            <p><strong>المحكم:</strong> ${idea.evaluation.evaluatedByName}</p>
            <p><strong>الملاحظات:</strong> ${idea.evaluation.feedbackNote}</p>
          </div>
        ` : ''}

        <div class="footer">
          وثيقة رسمية صادرة من نظام فكرة لإدارة الابتكار المؤسسي — جامعة بيشة • تاريخ الطباعة: ${new Date().toLocaleString('ar-SA')}
        </div>
      </body>
      </html>
    `);

    printWin.document.close();
    printWin.focus();
    setTimeout(() => {
      printWin.print();
    }, 500);
  }
};

window.IdeasManager = IdeasManager;
