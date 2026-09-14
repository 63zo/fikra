/**
 * Fikra (فكرة) - Global State & Data Store
 * Handles LocalStorage persistence, seed data, users, dynamic dropdowns, ideas, and committee evaluations.
 */

const State = {
  // Current active user
  currentUser: null,

  // Dropdowns lists (Admin configurable)
  departments: [],
  jobTitles: [],
  categories: [],

  // Ideas repository
  ideas: [],

  // Registered users
  users: [],

  // System Settings
  settings: {
    aiSimilarityThreshold: 0.35, // Cosine threshold
    geminiApiKey: '',
    soundEnabled: true,
    theme: 'light'
  },

  init() {
    this.loadFromStorage();
    if (!this.users || this.users.length === 0 || !this.ideas || this.ideas.length === 0) {
      this.seedInitialData();
    }
    this.checkSession();

    // Initialize Supabase live cloud synchronization
    if (window.SupabaseService) {
      window.SupabaseService.init();
    }
  },

  loadFromStorage() {
    try {
      const savedUsers = localStorage.getItem('fikra_users');
      if (savedUsers) this.users = JSON.parse(savedUsers);

      const savedDepts = localStorage.getItem('fikra_departments');
      if (savedDepts) this.departments = JSON.parse(savedDepts);

      const savedJobs = localStorage.getItem('fikra_jobs');
      if (savedJobs) this.jobTitles = JSON.parse(savedJobs);

      const savedCats = localStorage.getItem('fikra_categories');
      if (savedCats) this.categories = JSON.parse(savedCats);

      const savedIdeas = localStorage.getItem('fikra_ideas');
      if (savedIdeas) this.ideas = JSON.parse(savedIdeas);

      const savedSettings = localStorage.getItem('fikra_settings');
      if (savedSettings) this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
    } catch (e) {
      console.error('Error loading state from localStorage:', e);
    }
  },

  saveToStorage() {
    try {
      localStorage.setItem('fikra_users', JSON.stringify(this.users));
      localStorage.setItem('fikra_departments', JSON.stringify(this.departments));
      localStorage.setItem('fikra_jobs', JSON.stringify(this.jobTitles));
      localStorage.setItem('fikra_categories', JSON.stringify(this.categories));
      localStorage.setItem('fikra_ideas', JSON.stringify(this.ideas));
      localStorage.setItem('fikra_settings', JSON.stringify(this.settings));
      if (this.currentUser) {
        localStorage.setItem('fikra_session', JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem('fikra_session');
      }
    } catch (e) {
      console.error('Error saving state to localStorage:', e);
    }
  },

  checkSession() {
    try {
      const session = localStorage.getItem('fikra_session');
      if (session) {
        const parsed = JSON.parse(session);
        const match = this.users.find(u => u.id === parsed.id);
        if (match) {
          this.currentUser = match;
        }
      }
    } catch (e) {
      console.error('Error checking session:', e);
    }
  },

  seedInitialData() {
    // 1. Initial Departments (Colleges & Deanships of University of Bisha)
    this.departments = [
      { id: 'dept_cs', nameAr: 'كلية الحاسبات وتقنية المعلومات', nameEn: 'College of Computing & IT' },
      { id: 'dept_eng', nameAr: 'كلية الهندسة', nameEn: 'College of Engineering' },
      { id: 'dept_med', nameAr: 'كلية الطب والعلوم الطبية', nameEn: 'College of Medicine & Health Sciences' },
      { id: 'dept_adm', nameAr: 'كلية الأعمال وإدارة المشاريع', nameEn: 'College of Business' },
      { id: 'dept_edu', nameAr: 'كلية التربية والآداب', nameEn: 'College of Education & Arts' },
      { id: 'dept_it_deanship', nameAr: 'عمادة تقنية المعلومات والتحول الرقمي', nameEn: 'Deanship of IT & Digital Transformation' },
      { id: 'dept_admissions', nameAr: 'عمادة القبول والتسجيل', nameEn: 'Deanship of Admissions & Registration' },
      { id: 'dept_student_affairs', nameAr: 'عمادة شؤون الطلاب والأنشطة', nameEn: 'Deanship of Student Affairs' },
      { id: 'dept_hr', nameAr: 'الإدارة العامة للموارد البشرية', nameEn: 'General Administration of HR' },
      { id: 'dept_projects', nameAr: 'إدارة المشاريع والمرافق الجامعية', nameEn: 'Campus Facilities & Projects' },
      { id: 'dept_quality', nameAr: 'عمادة التطوير الأكاديمي وضمان الجودة', nameEn: 'Deanship of Quality & Development' }
    ];

    // 2. Initial Job Titles
    this.jobTitles = [
      { id: 'job_prof', nameAr: 'أستاذ دكتور / عضو هيئة تدريس', nameEn: 'Professor / Faculty Member' },
      { id: 'job_assoc_prof', nameAr: 'أستاذ مشارك / مساعد', nameEn: 'Associate / Assistant Professor' },
      { id: 'job_lecturer', nameAr: 'محاضر / معيد', nameEn: 'Lecturer / Teaching Assistant' },
      { id: 'job_software_eng', nameAr: 'مهندس برمجيات / محلل نظم', nameEn: 'Software Engineer / Systems Analyst' },
      { id: 'job_admin_officer', nameAr: 'أخصائي إداري / موارد بشرية', nameEn: 'Administrative Specialist' },
      { id: 'job_quality_auditor', nameAr: 'أخصائي جودة وتطوير مؤسسي', nameEn: 'Quality & Institutional Specialist' },
      { id: 'job_lab_tech', nameAr: 'فني مختبرات وبحوث', nameEn: 'Lab & Research Technician' },
      { id: 'job_dept_head', nameAr: 'رئيس قسم / مدير إدارة', nameEn: 'Department Head / Director' }
    ];

    // 3. Initial Idea Categories
    this.categories = [
      { id: 'cat_digital', nameAr: 'التحول الرقمي والأتمتة الذكية', nameEn: 'Digital Transformation & Smart Automation', icon: '💻' },
      { id: 'cat_academic', nameAr: 'جودة التعليم والبيئة الأكاديمية', nameEn: 'Academic Quality & Learning', icon: '🎓' },
      { id: 'cat_sustainability', nameAr: 'الاستدامة وكفاءة الطاقة والمرافق', nameEn: 'Sustainability & Green Campus', icon: '🌱' },
      { id: 'cat_efficiency', nameAr: 'كفاءة الإنفاق وتطوير العمليات', nameEn: 'Spending Efficiency & Optimization', icon: '⚡' },
      { id: 'cat_student_life', nameAr: 'الخدمات الطلابية وجودة الحياة', nameEn: 'Student Life & Campus Services', icon: '🤝' },
      { id: 'cat_research', nameAr: 'البحث العلمي والابتكار وريادة الأعمال', nameEn: 'Scientific Research & Innovation', icon: '🔬' }
    ];

    // 4. Initial Users with Pre-configured Roles
    this.users = [
      {
        id: 'u_emp1',
        username: 'employee',
        fullName: 'د. سارة بنت عبد الله الشهراني',
        email: 's.shahrani@ub.edu.sa',
        password: 'Password123!',
        departmentId: 'dept_cs',
        jobTitleId: 'job_assoc_prof',
        role: 'employee',
        points: 480,
        badges: ['innovator_gold', 'problem_solver'],
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
      },
      {
        id: 'u_emp2',
        username: 'ahmed',
        fullName: 'م. أحمد بن ناصر الغامدي',
        email: 'a.ghamdi@ub.edu.sa',
        password: 'Password123!',
        departmentId: 'dept_it_deanship',
        jobTitleId: 'job_software_eng',
        role: 'employee',
        points: 320,
        badges: ['innovator_silver'],
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      },
      {
        id: 'u_comm1',
        username: 'committee',
        fullName: 'د. محمد بن سعد القرني',
        email: 'm.qarni@ub.edu.sa',
        password: 'Password123!',
        departmentId: 'dept_quality',
        jobTitleId: 'job_prof',
        role: 'committee',
        points: 650,
        badges: ['evaluator_master'],
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
      },
      {
        id: 'u_admin1',
        username: 'admin',
        fullName: 'أ. خالد بن إبراهيم الحازمي',
        email: 'admin@ub.edu.sa',
        password: 'Password123!',
        departmentId: 'dept_it_deanship',
        jobTitleId: 'job_dept_head',
        role: 'admin',
        points: 900,
        badges: ['admin_elite'],
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
      }
    ];

    // 5. Seed Ideas with Realistic University of Bisha context
    this.ideas = [
      {
        id: 'idea_1',
        titleAr: 'منصة بيشة الذكية لإدارة وحجز مواقف الحرم الجامعي وشواحن السيارات الكهربائية',
        titleEn: 'Bisha Smart Campus Parking & EV Charging Reservation System',
        descAr: 'تطبيق ذكي ومستشعرات إنترنت الأشياء (IoT) لتحديد المواقف الشاغرة فورياً وتوجيه أعضاء هيئة التدريس والطلاب إليها، مع إمكانية حجز محطات الشحن للمركبات الكهربائية وتقليل الازدحام بنسبة 60%.',
        descEn: 'An IoT-powered smart platform and mobile app for real-time parking spot navigation and EV charger booking on campus to reduce congestion by 60%.',
        impactAr: 'توفير 15 دقيقة يومياً لكل سائق، خفض الانبعاثات الكربونية بنسبة 25%، وتنظيم حركة المرور عند بوابات الدخول.',
        impactEn: 'Saves 15 mins daily per driver, cuts carbon emissions by 25%, and streamlines campus gate traffic.',
        budget: '45,000 SAR',
        categoryId: 'cat_digital',
        departmentId: 'dept_projects',
        targetDeptId: 'dept_projects',
        authorId: 'u_emp1',
        authorName: 'د. سارة بنت عبد الله الشهراني',
        authorDept: 'كلية الحاسبات وتقنية المعلومات',
        authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        status: 'approved', // submitted, under_review, approved, in_progress, implemented, rejected
        createdAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
        tags: ['التحول_الرقمي', 'إنترنت_الأشياء', 'الاستدامة', 'المواقف_الذكية', 'IoT', 'SmartCampus'],
        aiScore: 94,
        aiSummary: 'فكرة ممتازة ذات جدوى تقنية عالية وتخدم توجه الاستدامة والتحول الرقمي.',
        votes: ['u_emp1', 'u_emp2', 'u_comm1'],
        downvotes: [],
        comments: [
          {
            id: 'c_1',
            authorId: 'u_emp2',
            authorName: 'م. أحمد بن ناصر الغامدي',
            authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            text: 'فكرة رائعة جداً! يمكن ربط الحساسات مع بطاقة الهوية الجامعية لسهولة الدخول الذكي.',
            createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString()
          },
          {
            id: 'c_2',
            authorId: 'u_comm1',
            authorName: 'د. محمد بن سعد القرني (لجنة التحكيم)',
            authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            text: 'تمت دراسة الجدوى وتوصي اللجنة بالبدء بمرحلة تجريبية في مواقف كلية الحاسبات وكلية الهندسة.',
            createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
          }
        ],
        evaluation: {
          evaluatedBy: 'u_comm1',
          evaluatedByName: 'د. محمد بن سعد القرني',
          strategicScore: 5,
          innovationScore: 4,
          feasibilityScore: 5,
          impactScore: 5,
          decision: 'approved',
          feedbackNote: 'فكرة متميزة تتوافق مباشرة مع أهداف الاستدامة والتحول الرقمي للجامعة. نوصي باعتمادها وتشكيل فريق عمل تنفيذي.',
          evaluatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
        }
      },
      {
        id: 'idea_2',
        titleAr: 'مساعد أكاديمي ذكي مدعوم بالذكاء الاصطناعي التوليدي للإرشاد واللوائح الجامعية',
        titleEn: 'AI-Powered Academic & Regulations Advisor for Bisha University Students',
        descAr: 'تطوير روبوت دردشة ذكي مبني على النموذج اللغوي التوليدي ومُدرب على جميع لوائح وأنظمة جامعة بيشة، الخطط الدراسية، وإجراءات الحذف والإضافة، ليجيب بدقة 24/7.',
        descEn: 'A generative AI assistant trained on Bisha University regulations, academic plans, and course policies to provide 24/7 instant guidance to students.',
        impactAr: 'تخفيف العبء على المرشدين الأكاديميين بنسبة 70%، تقديم إجابات فورية موثقة ودقيقة للطلاب.',
        impactEn: 'Reduces academic advisor workload by 70% and provides immediate verified answers.',
        budget: '20,000 SAR',
        categoryId: 'cat_academic',
        departmentId: 'dept_it_deanship',
        targetDeptId: 'dept_admissions',
        authorId: 'u_emp2',
        authorName: 'م. أحمد بن ناصر الغامدي',
        authorDept: 'عمادة تقنية المعلومات والتحول الرقمي',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        status: 'under_review',
        createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        tags: ['الذكاء_الاصطناعي', 'الإرشاد_الأكاديمي', 'الدردشة_الذكية', 'AI_Advisor', 'GenerativeAI'],
        aiScore: 91,
        aiSummary: 'ابتكار نوعي يرفع جودة الخدمات الطلابية ويوفر جهداً كبيراً على العمادات الأكاديمية.',
        votes: ['u_emp1', 'u_admin1'],
        downvotes: [],
        comments: [
          {
            id: 'c_3',
            authorId: 'u_emp1',
            authorName: 'د. سارة بنت عبد الله الشهراني',
            authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
            text: 'اقتراح ممتاز، نقترح دمجه مباشرة في تطبيق الجامعة الرسمي.',
            createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
          }
        ],
        evaluation: null
      },
      {
        id: 'idea_3',
        titleAr: 'مبادرة المباني الخضراء وتركيب الألواح الشمسية على أسطح كليات جامعة بيشة',
        titleEn: 'Green Campus & Solar Rooftop Initiative for University Faculties',
        descAr: 'استغلال الأسطح والمساحات الشاسعة في مجمع كليات جامعة بيشة لتركيب أنظمة توليد الطاقة الشمسية الكهروضوئية لتغطية 40% من استهلاك الطاقة نهاراً.',
        descEn: 'Installing rooftop solar PV systems across university campus buildings to generate 40% of daytime clean energy.',
        impactAr: 'توفير سنوي يتجاوز 600,000 ريال في فواتير الكهرباء وتعزيز التصنيف البيئي للجامعة.',
        impactEn: 'Saves over 600k SAR annually on energy costs and boosts green campus ranking.',
        budget: '350,000 SAR',
        categoryId: 'cat_sustainability',
        departmentId: 'dept_eng',
        targetDeptId: 'dept_projects',
        authorId: 'u_emp1',
        authorName: 'د. سارة بنت عبد الله الشهراني',
        authorDept: 'كلية الحاسبات وتقنية المعلومات',
        authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        status: 'submitted',
        createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
        tags: ['الطاقة_الشمسية', 'الاستدامة', 'كفاءة_الإنفاق', 'المباني_الخضراء', 'SolarEnergy'],
        aiScore: 88,
        aiSummary: 'أثر مالي واستراتيجي ضخم يتطلب شراكة مع شركات الطاقة المتجددة.',
        votes: ['u_emp2'],
        downvotes: [],
        comments: [],
        evaluation: null
      },
      {
        id: 'idea_4',
        titleAr: 'نظام إدارة وأرشفة المعاملات الإدارية والمالية بدون ورق (جامعة بلا ورق)',
        titleEn: 'Paperless Campus: Digital Workflow & Archiving System',
        descAr: 'تحويل كافة المذكرات الداخلية، طلبات الشراء، ونماذج الموارد البشرية إلى معاملات رقمية مشفرة بتوقيع إلكتروني معتمد بنسبة 100%.',
        descEn: '100% digital end-to-end paperless administrative and financial document workflows with digital signatures.',
        impactAr: 'إلغاء استخدام الورق بنسبة 95%، وتسريع دورة المعاملات من 4 أيام إلى ساعتين.',
        impactEn: 'Cuts paper use by 95% and shortens approval cycle from 4 days to 2 hours.',
        budget: '15,000 SAR',
        categoryId: 'cat_efficiency',
        departmentId: 'dept_hr',
        targetDeptId: 'dept_hr',
        authorId: 'u_emp2',
        authorName: 'م. أحمد بن ناصر الغامدي',
        authorDept: 'عمادة تقنية المعلومات والتحول الرقمي',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        status: 'implemented',
        createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
        tags: ['أتمتة_المعاملات', 'بلا_ورق', 'كفاءة_الإنفاق', 'Paperless', 'Automation'],
        aiScore: 96,
        aiSummary: 'مشروع ذو عائد استثماري فوري وتسهيل كبير للمهام اليومية للموظفين.',
        votes: ['u_emp1', 'u_comm1', 'u_admin1'],
        downvotes: [],
        comments: [
          {
            id: 'c_4',
            authorId: 'u_admin1',
            authorName: 'أ. خالد بن إبراهيم الحازمي',
            authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
            text: 'تم تدشين المرحلة الأولى بنجاح في إدارة الموارد البشرية وعمادة تقنية المعلومات.',
            createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()
          }
        ],
        evaluation: {
          evaluatedBy: 'u_comm1',
          evaluatedByName: 'د. محمد بن سعد القرني',
          strategicScore: 5,
          innovationScore: 4,
          feasibilityScore: 5,
          impactScore: 5,
          decision: 'approved',
          feedbackNote: 'تمت الموافقة والتنفيذ المباشر للأثر الإيجابي الكبير.',
          evaluatedAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString()
        }
      },
      {
        id: 'idea_5',
        titleAr: 'تطبيق مقصف وخدمات التغذية الجامعية الذكية مع الطلب المسبق والدفع الإلكتروني',
        titleEn: 'Campus Smart Canteen & Food Pre-Order Mobile Service',
        descAr: 'تطبيق موحد لطلب الوجبات والمشروبات مسبقاً من كافتيريات الجامعة المختلفة واستلامها فوراً دون انتظار في الطوابير خلال فترات الاستراحة.',
        descEn: 'A unified app for pre-ordering meals and beverages across university cafeterias to eliminate lines.',
        impactAr: 'القضاء على طوابير الانتظار، رفع رضا منسوبي الجامعة، وتسهيل إدارة مبيعات المتعهدين.',
        impactEn: 'Eliminates waiting queues, improves student experience, and streamlines vendor operations.',
        budget: '12,000 SAR',
        categoryId: 'cat_student_life',
        departmentId: 'dept_student_affairs',
        targetDeptId: 'dept_student_affairs',
        authorId: 'u_emp1',
        authorName: 'د. سارة بنت عبد الله الشهراني',
        authorDept: 'كلية الحاسبات وتقنية المعلومات',
        authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        status: 'submitted',
        createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
        tags: ['الخدمات_الطلابية', 'الدفع_الإلكتروني', 'الطلب_المسبق', 'SmartDining', 'StudentLife'],
        aiScore: 84,
        aiSummary: 'فكرة عملية ومحبوبة تسهم في تحسين جودة الحياة الجامعية.',
        votes: ['u_emp2'],
        downvotes: [],
        comments: [],
        evaluation: null
      }
    ];

    this.saveToStorage();
  },

  // Helper getters
  getDepartment(id) {
    return this.departments.find(d => d.id === id) || { nameAr: id, nameEn: id };
  },

  getJobTitle(id) {
    return this.jobTitles.find(j => j.id === id) || { nameAr: id, nameEn: id };
  },

  getCategory(id) {
    return this.categories.find(c => c.id === id) || { nameAr: id, nameEn: id, icon: '💡' };
  }
};

window.State = State;
