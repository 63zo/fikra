/**
 * Fikra (فكرة) - Internationalization (i18n) Engine
 * Full Arabic (Default, RTL) & English (LTR) dictionary
 */

const I18N = {
  currentLang: 'ar',

  dict: {
    ar: {
      // App Meta & Global
      appName: 'فكرة | نظام الابتكار وتوليد الأفكار',
      appShortName: 'فكرة',
      universityName: 'جامعة بيشة',
      universitySub: 'University of Bisha',
      welcome: 'مرحباً',
      search: 'بحث...',
      save: 'حفظ',
      cancel: 'إلغاء',
      delete: 'حذف',
      edit: 'تعديل',
      submit: 'إرسال',
      close: 'إغلاق',
      loading: 'جاري التحميل...',
      actions: 'الإجراءات',
      status: 'الحالة',
      date: 'التاريخ',
      details: 'التفاصيل',
      all: 'الكل',
      back: 'رجوع',
      confirm: 'تأكيد',
      points: 'نقطة',

      // Navigation
      navHome: 'الرئيسية (بنك الأفكار)',
      navSubmitIdea: 'تقديم فكرة جديدة',
      navMyIdeas: 'أفكاري',
      navCommittee: 'بوابة لجان التحكيم',
      navDashboard: 'لوحة المؤشرات والتحليلات',
      navLeaderboard: 'لوحة الشرف والمبتكرين',
      navAdmin: 'إدارة النظام والقوائم',
      navProfile: 'الملف الشخصي',
      navLogout: 'تسجيل الخروج',
      navLogin: 'تسجيل الدخول',

      // Roles
      roleEmployee: 'موظف / عضو هيئة تدريس',
      roleCommittee: 'عضو لجنة التحكيم',
      roleAdmin: 'مدير النظام',

      // Login / SSO
      ssoTitle: 'الدخول الموحد - جامعة بيشة',
      ssoSubtitle: 'نظام إدارة الأفكار والابتكار المؤسسي (فكرة)',
      usernameOrEmail: 'اسم المستخدم أو البريد الجامعي',
      password: 'كلمة المرور',
      rememberMe: 'تذكر بياناتي في هذا الجهاز',
      loginBtn: 'تسجيل الدخول',
      forgotPasswordPrompt: 'نسيت كلمة المرور؟',
      noAccountPrompt: 'ليس لديك حساب؟',
      registerNow: 'إنشاء حساب جديد',
      demoLoginFast: 'دخول سريع للتجربة كـ :',
      loginSuccess: 'تم تسجيل الدخول بنجاح! أهلاً بك في منصة فكرة.',
      invalidCredentials: 'اسم المستخدم أو كلمة المرور غير صحيحة.',

      // Registration
      registerTitle: 'إنشاء حساب موظف جديد',
      registerSubtitle: 'انضم إلى مجتمع المبتكرين في جامعة بيشة وشارك أفكارك البناءة',
      fullName: 'الاسم الكامل الثلاثي',
      chooseUsername: 'اسم المستخدم الفريد',
      emailAddress: 'البريد الإلكتروني الرسمي',
      selectDepartment: 'اختر الكلية / العمادة / الإدارة',
      selectJob: 'اختر المسمى الوظيفي',
      confirmPassword: 'تأكيد كلمة المرور',
      passwordRules: 'معايير قوة كلمة المرور:',
      ruleLength: 'على الأقل 8 خانات',
      ruleUpper: 'حرف كبير واحد على الأقل (A-Z)',
      ruleLower: 'حرف صغير واحد على الأقل (a-z)',
      ruleNumber: 'رقم واحد على الأقل (0-9)',
      ruleSpecial: 'رمز خاص واحد على الأقل (@, #, $, ...)',
      registerBtn: 'إتمام التسجيل والدخول',
      alreadyHaveAccount: 'لديك حساب بالفعل؟',
      userExists: 'اسم المستخدم أو البريد الإلكتروني مسجل مسبقاً.',
      passwordsDoNotMatch: 'كلمتا المرور غير متطابقتين!',
      weakPassword: 'يرجى استيفاء جميع معايير قوة كلمة المرور الموضحة.',
      registrationSuccess: 'تم إنشاء الحساب بنجاح! مرحباً بك في فكرة.',

      // Forgot & Reset Password
      forgotPasswordTitle: 'استعادة كلمة المرور',
      forgotPasswordDesc: 'أدخل بريدك الإلكتروني المسجل وسنرسل لك رمز التحقق لإعادة تعيين كلمة المرور.',
      sendResetCode: 'إرسال رمز التحقق',
      enterCodeTitle: 'إدخال رمز التحقق',
      codeSentTo: 'تم إرسال رمز مكون من 6 أرقام إلى:',
      verificationCode: 'رمز التحقق (6 أرقام)',
      newPassword: 'كلمة المرور الجديدة',
      resetPasswordBtn: 'تعيين كلمة المرور الجديدة',
      invalidCode: 'رمز التحقق غير صحيح، يرجى المحاولة مجدداً.',
      passwordResetSuccess: 'تمت إعادة تعيين كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول.',
      
      // Change Password (In-App)
      changePasswordTitle: 'تغيير كلمة المرور',
      currentPassword: 'كلمة المرور الحالية',
      updatePasswordBtn: 'تحديث كلمة المرور',
      wrongCurrentPassword: 'كلمة المرور الحالية غير صحيحة!',
      passwordChangedSuccess: 'تم تغيير كلمة المرور بنجاح.',

      // Idea Submission
      submitIdeaTitle: 'تقديم فكرة إبداعية جديدة 💡',
      submitIdeaSubtitle: 'أفكارك تصنع الفارق! يحلل الذكاء الاصطناعي فكرتك فورياً لاكتشاف التشابه وتصنيفها.',
      ideaTitle: 'عنوان الفكرة',
      ideaTitlePlaceholder: 'مثال: نظام ذكي لإدارة وتنظيم مواقف السيارات في الحرم الجامعي',
      ideaCategory: 'المجال / المحور الاستراتيجي',
      ideaTargetDept: 'الجهة / الإدارة المستفيدة',
      ideaDesc: 'شرح وتفاصيل الفكرة',
      ideaDescPlaceholder: 'اشرح المشكلة والحل المقترح بالتفصيل، وكيفية تطبيق الفكرة...',
      ideaImpact: 'الأثر والفوائد المتوقعة',
      ideaImpactPlaceholder: 'مثال: توفير الوقت بنسبة 40%، تحسين رضا الطلاب والموظفين، تقليل الهدر المالي...',
      ideaBudget: 'الميزانية / الموارد التقديرية المتوقعة',
      ideaAttachment: 'المرفقات والملفات التوضيحية (اختياري)',
      voiceInputBtn: 'إدخال صوتي (تحدث الآن)',
      voiceListening: 'جاري الاستماع... تحدث الآن بوضوح',
      voiceStop: 'إيقاف التسجيل',
      voiceNotSupported: 'خاصية الإدخال الصوتي غير مدعومة في هذا المتصفح، يرجى استخدام متصفح حديث مثل Chrome أو Edge.',
      submitIdeaBtn: 'إرسال الفكرة للاعتماد',
      ideaSubmittedSuccess: 'تم إرسال فكرتك بنجاح! صنفها الذكاء الاصطناعي وأصبحت متاحة للنقاش والتقييم.',

      // AI Features & Real-Time Radar
      aiSearchingSimilar: 'الذكاء الاصطناعي يبحث عن الأفكار المتشابهة في قاعدة البيانات...',
      aiSimilarAlertTitle: 'رادار الذكاء الاصطناعي: تم العثور على أفكار مشابهة!',
      aiSimilarAlertDesc: 'وجدنا أفكاراً مطابقة أو قريبة من فكرتك. ننصحك بالاطلاع عليها لتجنب التكرار أو التعاون مع أصحابها:',
      aiSimilarityScore: 'نسبة التطابق:',
      aiCompareIdea: 'عرض الفكرة ومقارنتها',
      aiNoSimilarFound: 'ممتاز! فكرتك تبدو جديدة ومبتكرة ولم يُعثر على تشابه مطابق.',
      aiAutoTags: 'الوسوم المقترحة بالذكاء الاصطناعي:',
      aiPredictedCategory: 'التصنيف الذكي:',
      aiImpactScore: 'مؤشر الأثر التقديري:',
      aiAnalyzing: 'جاري التحليل بالذكاء الاصطناعي...',

      // Idea Wall & Public Feed
      filterAllDepts: 'جميع الكليات والإدارات',
      filterAllStatus: 'جميع الحالات',
      filterAllCategories: 'جميع المجالات',
      sortBy: 'ترتيب حسب:',
      sortTopVoted: 'الأعلى تصويتاً 🌟',
      sortNewest: 'الأحدث تقديماً 🕒',
      sortMostComments: 'الأكثر تفاعلاً ونقاشاً 💬',
      sortImpact: 'الأعلى أثراً وابتكاراً 🚀',
      noIdeasFound: 'لم يتم العثور على أفكار مطابقة لمعايير البحث.',
      upvote: 'تصويت للفكرة',
      voted: 'تم التصويت',
      votesCount: 'صوت',
      commentsCount: 'تعليق',
      addComment: 'أضف تعليقك أو مقترحك...',
      postCommentBtn: 'نشر التعليق',
      commentsTitle: 'المناقشات والآراء',
      noCommentsYet: 'لا توجد تعليقات حتى الآن، كن أول من يبدي رأيه!',

      // Idea Statuses
      statusSubmitted: 'جديدة (قيد التقديم)',
      statusUnderReview: 'قيد دراسة اللجنة',
      statusApproved: 'معتمدة للتبني',
      statusInProgress: 'قيد التنفيذ',
      statusImplemented: 'مطبقة بنجاح',
      statusRejected: 'مرفوضة / غير مجدية',

      // Committee Portal
      committeePortalTitle: 'بوابة لجان التحكيم والتقييم',
      committeeSubtitle: 'تقييم الأفكار المقدمة، تطبيق مصفوفة المعايير، وإصدار القرارات الرسمية',
      pendingReviewIdeas: 'أفكار بانتظار التقييم والقرار',
      evaluatedIdeas: 'الأفكار التي تم البت فيها',
      evaluateIdeaBtn: 'تقييم الفكرة والبت فيها',
      evaluationRubric: 'مصفوفة معايير التقييم المؤسسي:',
      rubricStrategic: '1. المواءمة الاستراتيجية مع أهداف الجامعة ورؤية 2030',
      rubricInnovation: '2. الجدة والابتكار وأصالة الفكرة',
      rubricFeasibility: '3. قابلية التطبيق والتنفيذ العملي',
      rubricImpact: '4. العائد والأثر (المالي / التشغيلي / المجتمعي)',
      committeeDecision: 'قرار اللجنة:',
      actionApprove: 'اعتماد الفكرة وتبنيها',
      actionReject: 'رفض الفكرة مع التوضيح',
      actionRequestInfo: 'طلب تعديل / استفسار إضافي من صاحب الفكرة',
      committeeFeedbackNote: 'ملاحظات وتوجيهات اللجنة لصاحب الفكرة (إلزامي):',
      committeeDecisionRecorded: 'تم تسجيل قرار اللجنة بنجاح وإشعار الموظف.',

      // Dashboard & Analytics
      dashboardTitle: 'لوحة المؤشرات والتحليلات البيانية',
      dashboardSubtitle: 'متابعة تدفق الابتكار، مؤشرات الأداء، وتوزيع الأفكار حسب الكليات والإدارات',
      kpiTotalIdeas: 'إجمالي الأفكار المقدمة',
      kpiApprovedIdeas: 'الأفكار المعتمدة',
      kpiApprovalRate: 'معدل الاعتماد والقبول',
      kpiTotalVotes: 'إجمالي أصوات الموظفين',
      kpiActiveInnovators: 'الموظفون المشاركون',
      chartIdeasByDept: 'توزيع الأفكار حسب الكليات والإدارات',
      chartIdeasByStatus: 'حالة الأفكار (المعتمدة / قيد الدراسة / المرفوضة)',
      chartIdeasTimeline: 'المعدل الزمني لتقديم الأفكار',
      chartTopCategories: 'أكثر المجالات ابتكاراً',
      exportCSV: 'تصدير البيانات (CSV)',
      exportPDF: 'طباعة التقرير الشامل',

      // Admin Dropdown & Roles Manager
      adminTitle: 'إدارة النظام والقوائم المنسدلة',
      adminSubtitle: 'التحكم في قيم القوائم المنسدلة، إدارة صلاحيات المستخدمين، وإعدادات الذكاء الاصطناعي',
      tabDepartments: 'إدارة الكليات والإدارات',
      tabJobTitles: 'إدارة المسميات الوظيفية',
      tabCategories: 'إدارة مجالات الأفكار',
      tabUsers: 'إدارة المستخدمين والصلاحيات',
      tabAISettings: 'إعدادات الذكاء الاصطناعي',
      addNewDept: 'إضافة كلية / إدارة جديدة',
      deptNameAr: 'اسم الإدارة بالعربية',
      deptNameEn: 'اسم الإدارة بالإنجليزية',
      addNewJob: 'إضافة مسمى وظيفي جديد',
      jobNameAr: 'المسمى الوظيفي بالعربية',
      jobNameEn: 'المسمى الوظيفي بالإنجليزية',
      addNewCategory: 'إضافة مجال فكرة جديد',
      catNameAr: 'اسم المجال بالعربية',
      catNameEn: 'اسم المجال بالإنجليزية',
      itemAddedSuccess: 'تمت إضافة العنصر بنجاح وتحديث القوائم المنسدلة.',
      itemDeletedSuccess: 'تم حذف العنصر بنجاح.',
      userRoleUpdated: 'تم تحديث صلاحيات المستخدم بنجاح.',
      geminiApiKeyPlaceholder: 'أدخل مفتاح Gemini API الاختياري (مجانياً)',
      geminiApiSaved: 'تم حفظ إعدادات الذكاء الاصطناعي بنجاح.',
      resetSeedDataBtn: 'استعادة البيانات الافتراضية التجريبية',
      resetSeedDataConfirm: 'هل أنت متأكد من إعادة ضبط البيانات إلى الحالة الافتراضية؟',
      dataResetSuccess: 'تمت إعادة ضبط البيانات بنجاح.',

      // Leaderboard
      leaderboardTitle: 'لوحة شرف المبتكرين في جامعة بيشة 🏆',
      leaderboardSubtitle: 'تكريم أكثر الموظفين والكليات تميزاً ومساهمةً في توليد الأفكار التطويرية',
      topIdeators: 'أفضل الموظفين المبتكرين',
      topDepartments: 'أنشط الكليات والإدارات',
      badgeGold: 'المبتكر الذهبي',
      badgeSilver: 'المبادر المتميز',
      badgeBronze: 'صانع الحلول',

      // General alerts
      fieldRequired: 'هذا الحقل مطلوب!',
      fillAllFields: 'يرجى تعبئة جميع الحقول المطلوبة بشكل صحيح.',
      themeToggle: 'تبديل المظهر (داكن / فاتح)',
      langToggle: 'English'
    },

    en: {
      // App Meta & Global
      appName: 'Fikra | Institutional Idea Management System',
      appShortName: 'Fikra',
      universityName: 'University of Bisha',
      universitySub: 'جامعة بيشة',
      welcome: 'Welcome',
      search: 'Search...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      submit: 'Submit',
      close: 'Close',
      loading: 'Loading...',
      actions: 'Actions',
      status: 'Status',
      date: 'Date',
      details: 'Details',
      all: 'All',
      back: 'Back',
      confirm: 'Confirm',
      points: 'pts',

      // Navigation
      navHome: 'Idea Bank (Home)',
      navSubmitIdea: 'Submit New Idea',
      navMyIdeas: 'My Ideas',
      navCommittee: 'Committee Review Portal',
      navDashboard: 'Analytics & Insights',
      navLeaderboard: 'Innovators Leaderboard',
      navAdmin: 'System & Dropdown Management',
      navProfile: 'Profile',
      navLogout: 'Sign Out',
      navLogin: 'Sign In',

      // Roles
      roleEmployee: 'Employee / Faculty',
      roleCommittee: 'Evaluation Committee',
      roleAdmin: 'System Admin',

      // Login / SSO
      ssoTitle: 'Single Sign-On — University of Bisha',
      ssoSubtitle: 'Institutional Idea & Innovation System (Fikra)',
      usernameOrEmail: 'Username or University Email',
      password: 'Password',
      rememberMe: 'Remember me on this device',
      loginBtn: 'Sign In',
      forgotPasswordPrompt: 'Forgot password?',
      noAccountPrompt: "Don't have an account?",
      registerNow: 'Register New Account',
      demoLoginFast: 'Fast Demo Sign-in as:',
      loginSuccess: 'Successfully signed in! Welcome to Fikra.',
      invalidCredentials: 'Invalid username or password.',

      // Registration
      registerTitle: 'Create Employee Account',
      registerSubtitle: 'Join the University of Bisha innovation community and share impactful ideas',
      fullName: 'Full Name',
      chooseUsername: 'Unique Username',
      emailAddress: 'Official Email Address',
      selectDepartment: 'Select Faculty / Deanship / Dept',
      selectJob: 'Select Job Title',
      confirmPassword: 'Confirm Password',
      passwordRules: 'Password Strength Criteria:',
      ruleLength: 'At least 8 characters',
      ruleUpper: 'At least one uppercase letter (A-Z)',
      ruleLower: 'At least one lowercase letter (a-z)',
      ruleNumber: 'At least one number (0-9)',
      ruleSpecial: 'At least one special character (@, #, $, ...)',
      registerBtn: 'Complete Registration & Sign In',
      alreadyHaveAccount: 'Already have an account?',
      userExists: 'Username or email already exists.',
      passwordsDoNotMatch: 'Passwords do not match!',
      weakPassword: 'Password does not meet all security criteria.',
      registrationSuccess: 'Account created successfully! Welcome to Fikra.',

      // Forgot & Reset Password
      forgotPasswordTitle: 'Recover Password',
      forgotPasswordDesc: 'Enter your registered email and we will send a 6-digit verification code to reset your password.',
      sendResetCode: 'Send Verification Code',
      enterCodeTitle: 'Enter Verification Code',
      codeSentTo: 'A 6-digit verification code was sent to:',
      verificationCode: 'Verification Code (6 digits)',
      newPassword: 'New Password',
      resetPasswordBtn: 'Set New Password',
      invalidCode: 'Invalid verification code. Please try again.',
      passwordResetSuccess: 'Password reset successfully! You can now sign in.',

      // Change Password (In-App)
      changePasswordTitle: 'Change Password',
      currentPassword: 'Current Password',
      updatePasswordBtn: 'Update Password',
      wrongCurrentPassword: 'The current password you entered is incorrect!',
      passwordChangedSuccess: 'Password updated successfully.',

      // Idea Submission
      submitIdeaTitle: 'Submit an Innovative Idea 💡',
      submitIdeaSubtitle: 'Your ideas make an impact! Embedded AI checks similarity in real-time and auto-categorizes.',
      ideaTitle: 'Idea Title',
      ideaTitlePlaceholder: 'e.g., Smart campus parking and EV charging management system',
      ideaCategory: 'Category / Strategic Pillar',
      ideaTargetDept: 'Beneficiary Department / Faculty',
      ideaDesc: 'Idea Details & Problem Statement',
      ideaDescPlaceholder: 'Describe the problem, proposed solution, and implementation approach in detail...',
      ideaImpact: 'Expected Impact & Benefits',
      ideaImpactPlaceholder: 'e.g., 40% time savings, improved student satisfaction, cost reduction...',
      ideaBudget: 'Estimated Budget / Resources Needed',
      ideaAttachment: 'Attachments & Supporting Files (Optional)',
      voiceInputBtn: 'Voice Input (Speak Now)',
      voiceListening: 'Listening... Please speak clearly now',
      voiceStop: 'Stop Voice Input',
      voiceNotSupported: 'Speech recognition is not supported in this browser. Please use Chrome or Edge.',
      submitIdeaBtn: 'Submit Idea for Review',
      ideaSubmittedSuccess: 'Idea submitted successfully! AI classified your idea and it is ready for voting.',

      // AI Features & Real-Time Radar
      aiSearchingSimilar: 'AI is checking existing ideas for similarity...',
      aiSimilarAlertTitle: 'AI Similarity Radar: Similar Ideas Detected!',
      aiSimilarAlertDesc: 'We found existing ideas closely related to yours. Review them to avoid duplicates or collaborate:',
      aiSimilarityScore: 'Similarity Score:',
      aiCompareIdea: 'Compare Idea',
      aiNoSimilarFound: 'Great! Your idea appears novel with no duplicates found.',
      aiAutoTags: 'AI Recommended Tags:',
      aiPredictedCategory: 'AI Classified Category:',
      aiImpactScore: 'Estimated Impact Index:',
      aiAnalyzing: 'AI is analyzing your idea...',

      // Idea Wall & Public Feed
      filterAllDepts: 'All Departments / Faculties',
      filterAllStatus: 'All Statuses',
      filterAllCategories: 'All Categories',
      sortBy: 'Sort by:',
      sortTopVoted: 'Most Voted 🌟',
      sortNewest: 'Most Recent 🕒',
      sortMostComments: 'Most Discussed 💬',
      sortImpact: 'Highest Impact 🚀',
      noIdeasFound: 'No ideas match your search criteria.',
      upvote: 'Upvote Idea',
      voted: 'Voted',
      votesCount: 'Votes',
      commentsCount: 'Comments',
      addComment: 'Add your comment or suggestion...',
      postCommentBtn: 'Post Comment',
      commentsTitle: 'Discussions & Feedback',
      noCommentsYet: 'No comments yet. Be the first to share your thoughts!',

      // Idea Statuses
      statusSubmitted: 'Submitted',
      statusUnderReview: 'Under Committee Review',
      statusApproved: 'Approved',
      statusInProgress: 'In Progress',
      statusImplemented: 'Implemented',
      statusRejected: 'Rejected / Archived',

      // Committee Portal
      committeePortalTitle: 'Committee Evaluation Portal',
      committeeSubtitle: 'Review submitted ideas, apply the evaluation rubric, and record official decisions',
      pendingReviewIdeas: 'Pending Ideas Queue',
      evaluatedIdeas: 'Reviewed Ideas',
      evaluateIdeaBtn: 'Evaluate & Decide',
      evaluationRubric: 'Institutional Evaluation Rubric:',
      rubricStrategic: '1. Strategic Alignment with University Goals & Vision 2030',
      rubricInnovation: '2. Novelty & Originality of the Idea',
      rubricFeasibility: '3. Technical & Operational Feasibility',
      rubricImpact: '4. Expected Return & Institutional Impact',
      committeeDecision: 'Committee Decision:',
      actionApprove: 'Approve & Adopt Idea',
      actionReject: 'Reject with Reason',
      actionRequestInfo: 'Request Revisions / More Info from Author',
      committeeFeedbackNote: 'Committee Notes & Feedback to Author (Mandatory):',
      committeeDecisionRecorded: 'Committee decision logged successfully and author notified.',

      // Dashboard & Analytics
      dashboardTitle: 'Analytics & Insights Dashboard',
      dashboardSubtitle: 'Monitor innovation trends, KPIs, and idea distribution across departments',
      kpiTotalIdeas: 'Total Submitted Ideas',
      kpiApprovedIdeas: 'Approved Ideas',
      kpiApprovalRate: 'Approval Rate',
      kpiTotalVotes: 'Total Votes Cast',
      kpiActiveInnovators: 'Active Innovators',
      chartIdeasByDept: 'Ideas Distribution by Department',
      chartIdeasByStatus: 'Ideas Breakdown by Status',
      chartIdeasTimeline: 'Idea Submissions Over Time',
      chartTopCategories: 'Top Innovation Categories',
      exportCSV: 'Export Data (CSV)',
      exportPDF: 'Print Executive Summary',

      // Admin Dropdown & Roles Manager
      adminTitle: 'System & Dropdown Management',
      adminSubtitle: 'Manage dynamic dropdown values, user permissions, and AI configuration',
      tabDepartments: 'Departments & Faculties',
      tabJobTitles: 'Job Titles',
      tabCategories: 'Idea Categories',
      tabUsers: 'Users & Permissions',
      tabAISettings: 'AI Configuration',
      addNewDept: 'Add New Department / Faculty',
      deptNameAr: 'Department Name (Arabic)',
      deptNameEn: 'Department Name (English)',
      addNewJob: 'Add New Job Title',
      jobNameAr: 'Job Title (Arabic)',
      jobNameEn: 'Job Title (English)',
      addNewCategory: 'Add New Category',
      catNameAr: 'Category Name (Arabic)',
      catNameEn: 'Category Name (English)',
      itemAddedSuccess: 'Item added successfully and dropdowns refreshed.',
      itemDeletedSuccess: 'Item deleted successfully.',
      userRoleUpdated: 'User role updated successfully.',
      geminiApiKeyPlaceholder: 'Enter optional free Gemini API key',
      geminiApiSaved: 'AI settings saved successfully.',
      resetSeedDataBtn: 'Reset to Sample Demo Data',
      resetSeedDataConfirm: 'Are you sure you want to reset all data to default samples?',
      dataResetSuccess: 'Data reset to defaults successfully.',

      // Leaderboard
      leaderboardTitle: 'University of Bisha Innovators Hall of Fame 🏆',
      leaderboardSubtitle: 'Celebrating outstanding employees and departments driving institutional innovation',
      topIdeators: 'Top Innovative Employees',
      topDepartments: 'Most Active Departments',
      badgeGold: 'Gold Innovator',
      badgeSilver: 'Distinguished Initiator',
      badgeBronze: 'Solutions Pioneer',

      // General alerts
      fieldRequired: 'This field is required!',
      fillAllFields: 'Please fill all required fields correctly.',
      themeToggle: 'Toggle Theme (Dark / Light)',
      langToggle: 'العربية'
    }
  },

  init() {
    const savedLang = localStorage.getItem('fikra_lang') || 'ar';
    this.setLanguage(savedLang, false);
  },

  setLanguage(lang, reloadUI = true) {
    if (lang !== 'ar' && lang !== 'en') lang = 'ar';
    this.currentLang = lang;
    localStorage.setItem('fikra_lang', lang);

    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

    if (reloadUI && window.App && typeof window.App.render === 'function') {
      window.App.render();
    }
  },

  t(key) {
    const current = this.dict[this.currentLang];
    if (current && current[key] !== undefined) {
      return current[key];
    }
    // Fallback to Arabic
    if (this.dict.ar[key] !== undefined) {
      return this.dict.ar[key];
    }
    return key;
  },

  getText(arText, enText) {
    return this.currentLang === 'ar' ? arText : (enText || arText);
  }
};

window.I18N = I18N;
