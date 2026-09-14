/**
 * Fikra (فكرة) - Supabase Cloud Database Client & Realtime Sync
 * Connects directly to Supabase PostgreSQL database for live sync across all devices.
 */

const SupabaseService = {
  config: {
    url: 'https://hpyemkppaewnkojtycio.supabase.co',
    anonKey: 'sb_publishable_jbegrGFi4CIe5_aAk5YXRg_T8YDLZZk',
    enabled: true
  },

  client: null,
  isConnected: false,
  isSyncing: false,

  init() {
    if (!window.supabase) {
      console.warn('Supabase JS library not loaded.');
      return;
    }

    try {
      this.client = window.supabase.createClient(this.config.url, this.config.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
      this.isConnected = true;
      console.log('✅ Supabase Client initialized successfully.');

      // Fetch remote data and setup real-time listeners
      this.syncAllFromRemote();
      this.setupRealtimeListeners();
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
      this.isConnected = false;
    }
  },

  // Map camelCase to snake_case for PostgreSQL tables
  mapIdeaToDb(idea) {
    return {
      id: idea.id,
      title_ar: idea.titleAr || '',
      title_en: idea.titleEn || '',
      desc_ar: idea.descAr || '',
      desc_en: idea.descEn || '',
      impact_ar: idea.impactAr || '',
      impact_en: idea.impactEn || '',
      budget: idea.budget || '',
      category_id: idea.categoryId || null,
      department_id: idea.departmentId || null,
      target_dept_id: idea.targetDeptId || null,
      author_id: idea.authorId || null,
      author_name: idea.authorName || '',
      author_dept: idea.authorDept || '',
      author_avatar: idea.authorAvatar || '',
      status: idea.status || 'submitted',
      tags: idea.tags || [],
      ai_score: idea.aiScore || 80,
      ai_summary: idea.aiSummary || '',
      votes: idea.votes || [],
      downvotes: idea.downvotes || [],
      comments: idea.comments || [],
      evaluation: idea.evaluation || null,
      created_at: idea.createdAt || new Date().toISOString()
    };
  },

  mapDbToIdea(row) {
    return {
      id: row.id,
      titleAr: row.title_ar,
      titleEn: row.title_en,
      descAr: row.desc_ar,
      descEn: row.desc_en,
      impactAr: row.impact_ar,
      impactEn: row.impact_en,
      budget: row.budget,
      categoryId: row.category_id,
      departmentId: row.department_id,
      targetDeptId: row.target_dept_id,
      authorId: row.author_id,
      authorName: row.author_name,
      authorDept: row.author_dept,
      authorAvatar: row.author_avatar,
      status: row.status,
      tags: Array.isArray(row.tags) ? row.tags : [],
      aiScore: row.ai_score,
      aiSummary: row.ai_summary,
      votes: Array.isArray(row.votes) ? row.votes : [],
      downvotes: Array.isArray(row.downvotes) ? row.downvotes : [],
      comments: Array.isArray(row.comments) ? row.comments : [],
      evaluation: row.evaluation,
      createdAt: row.created_at
    };
  },

  mapUserToDb(u) {
    return {
      id: u.id,
      username: u.username,
      full_name: u.fullName,
      email: u.email,
      password: u.password,
      department_id: u.departmentId,
      job_title_id: u.jobTitleId,
      role: u.role || 'employee',
      points: u.points || 100,
      badges: u.badges || ['new_innovator'],
      avatar: u.avatar
    };
  },

  mapDbToUser(row) {
    return {
      id: row.id,
      username: row.username,
      fullName: row.full_name,
      email: row.email,
      password: row.password,
      departmentId: row.department_id,
      jobTitleId: row.job_title_id,
      role: row.role,
      points: row.points,
      badges: Array.isArray(row.badges) ? row.badges : ['new_innovator'],
      avatar: row.avatar
    };
  },

  // Sync entire dataset from Supabase
  async syncAllFromRemote() {
    if (!this.client || this.isSyncing) return;
    this.isSyncing = true;

    try {
      // 1. Sync Departments
      const { data: depts, error: deptsErr } = await this.client.from('departments').select('*');
      if (!deptsErr && depts && depts.length > 0) {
        State.departments = depts.map(d => ({ id: d.id, nameAr: d.name_ar, nameEn: d.name_en, code: d.code }));
      }

      // 2. Sync Job Titles
      const { data: jobs, error: jobsErr } = await this.client.from('job_titles').select('*');
      if (!jobsErr && jobs && jobs.length > 0) {
        State.jobTitles = jobs.map(j => ({ id: j.id, titleAr: j.title_ar, titleEn: j.title_en }));
      }

      // 3. Sync Categories
      const { data: cats, error: catsErr } = await this.client.from('categories').select('*');
      if (!catsErr && cats && cats.length > 0) {
        State.categories = cats.map(c => ({ id: c.id, nameAr: c.name_ar, nameEn: c.name_en, icon: c.icon, color: c.color }));
      }

      // 4. Sync Users
      const { data: users, error: usersErr } = await this.client.from('users').select('*');
      if (!usersErr && users && users.length > 0) {
        State.users = users.map(u => this.mapDbToUser(u));
      }

      // 5. Sync Ideas
      const { data: ideas, error: ideasErr } = await this.client.from('ideas').select('*').order('created_at', { ascending: false });
      if (!ideasErr && ideas && ideas.length > 0) {
        State.ideas = ideas.map(i => this.mapDbToIdea(i));
      }

      // If remote has no data yet, auto-seed default dataset to Supabase!
      if ((!depts || depts.length === 0) && State.departments.length > 0) {
        console.log('Pushing initial seed dataset to Supabase...');
        await this.seedRemoteDatabase();
      }

      // Save synced state locally & refresh active view
      State.saveToStorage();
      if (window.App && typeof window.App.render === 'function') {
        window.App.render();
      }
      console.log('✅ Supabase sync complete.');
    } catch (err) {
      console.warn('Supabase sync warning (using offline/local cache):', err);
    } finally {
      this.isSyncing = false;
    }
  },

  // Seed remote database with default initial data
  async seedRemoteDatabase() {
    if (!this.client) return;
    try {
      // Seed departments
      const deptsDb = State.departments.map(d => ({ id: d.id, name_ar: d.nameAr, name_en: d.nameEn }));
      await this.client.from('departments').upsert(deptsDb);

      // Seed job titles
      const jobsDb = State.jobTitles.map(j => ({ id: j.id, title_ar: j.titleAr, title_en: j.titleEn }));
      await this.client.from('job_titles').upsert(jobsDb);

      // Seed categories
      const catsDb = State.categories.map(c => ({ id: c.id, name_ar: c.nameAr, name_en: c.nameEn, icon: c.icon, color: c.color }));
      await this.client.from('categories').upsert(catsDb);

      // Seed users
      const usersDb = State.users.map(u => this.mapUserToDb(u));
      await this.client.from('users').upsert(usersDb);

      // Seed ideas
      const ideasDb = State.ideas.map(i => this.mapIdeaToDb(i));
      await this.client.from('ideas').upsert(ideasDb);

      console.log('🚀 Initial seed successfully uploaded to Supabase!');
    } catch (e) {
      console.warn('Seeding to Supabase encountered an error (check if SQL tables are created):', e);
    }
  },

  // Save or update an idea in Supabase
  async upsertIdea(idea) {
    if (!this.client) return;
    try {
      const dbObj = this.mapIdeaToDb(idea);
      const { error } = await this.client.from('ideas').upsert(dbObj);
      if (error) console.warn('Supabase upsertIdea error:', error);
    } catch (e) {
      console.warn('Supabase upsertIdea exception:', e);
    }
  },

  // Save or update a user in Supabase
  async upsertUser(user) {
    if (!this.client) return;
    try {
      const dbObj = this.mapUserToDb(user);
      const { error } = await this.client.from('users').upsert(dbObj);
      if (error) console.warn('Supabase upsertUser error:', error);
    } catch (e) {
      console.warn('Supabase upsertUser exception:', e);
    }
  },

  // Save department
  async upsertDepartment(dept) {
    if (!this.client) return;
    try {
      await this.client.from('departments').upsert({ id: dept.id, name_ar: dept.nameAr, name_en: dept.nameEn });
    } catch (e) {
      console.warn(e);
    }
  },

  // Delete department
  async deleteDepartment(deptId) {
    if (!this.client) return;
    try {
      await this.client.from('departments').delete().eq('id', deptId);
    } catch (e) {
      console.warn(e);
    }
  },

  // Save Job Title
  async upsertJobTitle(job) {
    if (!this.client) return;
    try {
      await this.client.from('job_titles').upsert({ id: job.id, title_ar: job.titleAr, title_en: job.titleEn });
    } catch (e) {
      console.warn(e);
    }
  },

  // Delete Job Title
  async deleteJobTitle(jobId) {
    if (!this.client) return;
    try {
      await this.client.from('job_titles').delete().eq('id', jobId);
    } catch (e) {
      console.warn(e);
    }
  },

  // Save Category
  async upsertCategory(cat) {
    if (!this.client) return;
    try {
      await this.client.from('categories').upsert({ id: cat.id, name_ar: cat.nameAr, name_en: cat.nameEn, icon: cat.icon, color: cat.color });
    } catch (e) {
      console.warn(e);
    }
  },

  // Delete Category
  async deleteCategory(catId) {
    if (!this.client) return;
    try {
      await this.client.from('categories').delete().eq('id', catId);
    } catch (e) {
      console.warn(e);
    }
  },

  // Real-time live listener for multi-device sync
  setupRealtimeListeners() {
    if (!this.client) return;

    try {
      this.client
        .channel('public:ideas')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'ideas' }, payload => {
          console.log('⚡ Realtime Idea Update from Supabase:', payload);
          if (payload.eventType === 'INSERT') {
            const newIdea = this.mapDbToIdea(payload.new);
            if (!State.ideas.some(i => i.id === newIdea.id)) {
              State.ideas.unshift(newIdea);
              State.saveToStorage();
              if (window.App && typeof window.App.render === 'function') window.App.render();
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedIdea = this.mapDbToIdea(payload.new);
            const idx = State.ideas.findIndex(i => i.id === updatedIdea.id);
            if (idx > -1) {
              State.ideas[idx] = updatedIdea;
              State.saveToStorage();
              if (window.App && typeof window.App.render === 'function') window.App.render();
            }
          } else if (payload.eventType === 'DELETE') {
            State.ideas = State.ideas.filter(i => i.id !== payload.old.id);
            State.saveToStorage();
            if (window.App && typeof window.App.render === 'function') window.App.render();
          }
        })
        .subscribe();
    } catch (e) {
      console.warn('Realtime subscription not supported or table missing:', e);
    }
  }
};

window.SupabaseService = SupabaseService;
