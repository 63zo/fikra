/**
 * Fikra (فكرة) - Analytics Dashboard & Chart.js Visualizations
 * Provides visual breakdown of ideas by department, status, category, and timeline trends.
 */

const AnalyticsDashboard = {
  charts: {},

  render() {
    const container = document.getElementById('dashboard-container');
    if (!container) return;

    // Calculate Key KPIs
    const totalIdeas = State.ideas.length;
    const approvedIdeas = State.ideas.filter(i => i.status === 'approved' || i.status === 'implemented').length;
    const approvalRate = totalIdeas > 0 ? Math.round((approvedIdeas / totalIdeas) * 100) : 0;
    
    let totalVotes = 0;
    State.ideas.forEach(i => {
      totalVotes += (i.votes ? i.votes.length : 0);
    });

    const activeAuthors = new Set(State.ideas.map(i => i.authorId)).size;

    container.innerHTML = `
      <div class="dashboard-header">
        <div>
          <h2><i class="mdi mdi-view-dashboard-variant text-gold"></i> ${I18N.t('dashboardTitle')}</h2>
          <p class="text-muted">${I18N.t('dashboardSubtitle')}</p>
        </div>
        <div class="dashboard-actions">
          <button class="btn btn-outline" onclick="AnalyticsDashboard.exportCSV()">
            <i class="mdi mdi-file-delimited-outline"></i> ${I18N.t('exportCSV')}
          </button>
        </div>
      </div>

      <!-- KPI Summary Cards Grid -->
      <div class="kpi-cards-grid mt-4">
        <div class="kpi-card">
          <div class="kpi-icon-wrap bg-primary-soft text-primary">
            <i class="mdi mdi-lightbulb-on"></i>
          </div>
          <div class="kpi-details">
            <span class="kpi-label">${I18N.t('kpiTotalIdeas')}</span>
            <h3 class="kpi-number">${totalIdeas}</h3>
            <span class="kpi-trend text-success"><i class="mdi mdi-arrow-up-bold"></i> +18% ${I18N.currentLang === 'ar' ? 'هذا الشهر' : 'this month'}</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-wrap bg-success-soft text-success">
            <i class="mdi mdi-check-decagram"></i>
          </div>
          <div class="kpi-details">
            <span class="kpi-label">${I18N.t('kpiApprovedIdeas')}</span>
            <h3 class="kpi-number">${approvedIdeas}</h3>
            <span class="kpi-trend text-success"><i class="mdi mdi-percent"></i> ${approvalRate}% ${I18N.t('kpiApprovalRate')}</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-wrap bg-gold-soft text-gold">
            <i class="mdi mdi-heart-multiple"></i>
          </div>
          <div class="kpi-details">
            <span class="kpi-label">${I18N.t('kpiTotalVotes')}</span>
            <h3 class="kpi-number">${totalVotes}</h3>
            <span class="kpi-trend text-primary"><i class="mdi mdi-account-group"></i> ${activeAuthors} ${I18N.t('kpiActiveInnovators')}</span>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon-wrap bg-info-soft text-info">
            <i class="mdi mdi-robot-excited"></i>
          </div>
          <div class="kpi-details">
            <span class="kpi-label">${I18N.currentLang === 'ar' ? 'متوسط مؤشر الأثر AI' : 'Average AI Impact'}</span>
            <h3 class="kpi-number">91.4%</h3>
            <span class="kpi-trend text-success"><i class="mdi mdi-star"></i> ${I18N.currentLang === 'ar' ? 'أثر استراتيجي مرتفع' : 'High Strategic Impact'}</span>
          </div>
        </div>
      </div>

      <!-- Charts Grid -->
      <div class="charts-grid-layout mt-4">
        <!-- Chart 1: By Department -->
        <div class="chart-box-card">
          <div class="chart-header">
            <h4><i class="mdi mdi-domain"></i> ${I18N.t('chartIdeasByDept')}</h4>
          </div>
          <div class="chart-canvas-wrapper">
            <canvas id="deptChart"></canvas>
          </div>
        </div>

        <!-- Chart 2: By Status -->
        <div class="chart-box-card">
          <div class="chart-header">
            <h4><i class="mdi mdi-chart-donut"></i> ${I18N.t('chartIdeasByStatus')}</h4>
          </div>
          <div class="chart-canvas-wrapper">
            <canvas id="statusChart"></canvas>
          </div>
        </div>

        <!-- Chart 3: Top Categories -->
        <div class="chart-box-card">
          <div class="chart-header">
            <h4><i class="mdi mdi-shape-plus"></i> ${I18N.t('chartTopCategories')}</h4>
          </div>
          <div class="chart-canvas-wrapper">
            <canvas id="categoryChart"></canvas>
          </div>
        </div>

        <!-- Chart 4: Timeline Trend -->
        <div class="chart-box-card">
          <div class="chart-header">
            <h4><i class="mdi mdi-chart-timeline-variant"></i> ${I18N.t('chartIdeasTimeline')}</h4>
          </div>
          <div class="chart-canvas-wrapper">
            <canvas id="timelineChart"></canvas>
          </div>
        </div>
      </div>
    `;

    // Render Chart.js instances after DOM update
    setTimeout(() => {
      this.initChartVisuals();
    }, 50);
  },

  initChartVisuals() {
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js library is not yet loaded.');
      return;
    }

    // Destroy existing instances to prevent memory leaks / overlap
    Object.values(this.charts).forEach(c => c && c.destroy());
    this.charts = {};

    const isDark = document.documentElement.classList.contains('dark');
    const textColor = isDark ? '#E2E8F0' : '#334155';
    const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

    // 1. Dept Chart Data
    const deptCounts = {};
    State.departments.forEach(d => { deptCounts[d.id] = 0; });
    State.ideas.forEach(i => {
      const dId = i.targetDeptId || i.departmentId;
      deptCounts[dId] = (deptCounts[dId] || 0) + 1;
    });

    const deptLabels = State.departments.map(d => I18N.getText(d.nameAr, d.nameEn).substring(0, 18) + '...');
    const deptValues = State.departments.map(d => deptCounts[d.id] || 0);

    const ctxDept = document.getElementById('deptChart');
    if (ctxDept) {
      this.charts.dept = new Chart(ctxDept, {
        type: 'bar',
        data: {
          labels: deptLabels,
          datasets: [{
            label: I18N.t('kpiTotalIdeas'),
            data: deptValues,
            backgroundColor: '#14573A',
            hoverBackgroundColor: '#0F422C',
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: { ticks: { color: textColor, font: { family: 'Tajawal, sans-serif' } }, grid: { display: false } },
            y: { ticks: { color: textColor, stepSize: 1 }, grid: { color: gridColor } }
          }
        }
      });
    }

    // 2. Status Chart Data
    const statusCounts = {
      submitted: 0,
      under_review: 0,
      approved: 0,
      in_progress: 0,
      implemented: 0,
      rejected: 0
    };
    State.ideas.forEach(i => {
      if (statusCounts[i.status] !== undefined) statusCounts[i.status]++;
    });

    const ctxStatus = document.getElementById('statusChart');
    if (ctxStatus) {
      this.charts.status = new Chart(ctxStatus, {
        type: 'doughnut',
        data: {
          labels: [
            I18N.t('statusSubmitted'),
            I18N.t('statusUnderReview'),
            I18N.t('statusApproved'),
            I18N.t('statusInProgress'),
            I18N.t('statusImplemented'),
            I18N.t('statusRejected')
          ],
          datasets: [{
            data: Object.values(statusCounts),
            backgroundColor: [
              '#3B82F6', // blue
              '#F59E0B', // amber
              '#14573A', // green
              '#8B5CF6', // purple
              '#10B981', // emerald
              '#EF4444'  // red
            ],
            borderWidth: 2,
            borderColor: isDark ? '#1E293B' : '#FFFFFF'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: textColor, font: { family: 'Tajawal, sans-serif', size: 11 } }
            }
          }
        }
      });
    }

    // 3. Category Chart Data
    const catCounts = {};
    State.categories.forEach(c => { catCounts[c.id] = 0; });
    State.ideas.forEach(i => {
      catCounts[i.categoryId] = (catCounts[i.categoryId] || 0) + 1;
    });

    const catLabels = State.categories.map(c => I18N.getText(c.nameAr, c.nameEn));
    const catValues = State.categories.map(c => catCounts[c.id] || 0);

    const ctxCat = document.getElementById('categoryChart');
    if (ctxCat) {
      this.charts.category = new Chart(ctxCat, {
        type: 'polarArea',
        data: {
          labels: catLabels,
          datasets: [{
            data: catValues,
            backgroundColor: [
              'rgba(20, 87, 58, 0.8)',
              'rgba(197, 160, 89, 0.8)',
              'rgba(59, 130, 246, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(139, 92, 246, 0.8)'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: textColor, font: { family: 'Tajawal, sans-serif', size: 10 } } }
          },
          scales: {
            r: { ticks: { display: false }, grid: { color: gridColor } }
          }
        }
      });
    }

    // 4. Timeline Trend Data (Last 6 Months simulation)
    const ctxTimeline = document.getElementById('timelineChart');
    if (ctxTimeline) {
      this.charts.timeline = new Chart(ctxTimeline, {
        type: 'line',
        data: {
          labels: I18N.currentLang === 'ar' 
            ? ['أكتوبر', 'نوفمبر', 'ديسمبر', 'يناير', 'فبراير', 'مارس']
            : ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
          datasets: [{
            label: I18N.t('kpiTotalIdeas'),
            data: [4, 7, 12, 19, 28, 36],
            borderColor: '#C5A059',
            backgroundColor: 'rgba(197, 160, 89, 0.15)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#14573A',
            pointRadius: 5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: { ticks: { color: textColor }, grid: { display: false } },
            y: { ticks: { color: textColor }, grid: { color: gridColor } }
          }
        }
      });
    }
  },

  // Export CSV file
  exportCSV() {
    const headers = ['ID', 'Title', 'Author', 'Department', 'Category', 'Status', 'Votes', 'Comments', 'Date'];
    const rows = State.ideas.map(i => [
      i.id,
      `"${(i.titleAr || '').replace(/"/g, '""')}"`,
      `"${i.authorName}"`,
      `"${i.authorDept}"`,
      `"${State.getCategory(i.categoryId).nameAr}"`,
      i.status,
      i.votes ? i.votes.length : 0,
      i.comments ? i.comments.length : 0,
      i.createdAt
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Fikra_Ideas_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    App.showToast(I18N.currentLang === 'ar' ? 'تم تصدير ملف CSV بنجاح.' : 'CSV export downloaded.', 'success');
  }
};

window.AnalyticsDashboard = AnalyticsDashboard;
