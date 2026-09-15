# دليل واجهات برمجة التطبيقات والتكامل (API & Integration Documentation)
### منصة فكرة (Fikra) — جامعة بيشة | University of Bisha
**الإصدار:** 2.0 | **التاريخ:** سبتمبر 2026 | **البروتوكول:** HTTPS / RESTful API / WebSockets

---

## 📑 جدول المحتويات (Table of Contents)
1. [نظرة عامة على واجهات التكامل (Integration Overview)](#1-نظرة-عامة-على-واجهات-التكامل-integration-overview)
2. [المصادقة ومفاتيح الوصول (Authentication & Security Headers)](#2-المصادقة-ومفاتيح-الوصول-authentication--security-headers)
3. [واجهات إدارة الأفكار (Ideas Endpoints)](#3-واجهات-إدارة-الأفكار-ideas-endpoints)
4. [واجهات لجان التحكيم والتقييم (Committee Evaluations API)](#4-واجهات-لجان-التحكيم-والتقييم-committee-evaluations-api)
5. [واجهات الهيكل المؤسسي والقوائم (Departments & Dropdowns API)](#5-واجهات-الهيكل-المؤسسي-والقوائم-departments--dropdowns-api)
6. [واجهات المستخدمين والملفات الشخصية (Users & Auth API)](#6-واجهات-المستخدمين-والملفات-الشخصية-users--auth-api)
7. [التكامل مع محرك الذكاء الاصطناعي (Google Gemini AI API Integration)](#7-التكامل-مع-محرك-الذكاء-الاصطناعي-google-gemini-ai-api-integration)
8. [التكامل مع واجهة الإدخال الصوتي (Web Speech API Integration)](#8-التكامل-مع-واجهة-الإدخال-الصوتي-web-speech-api-integration)
9. [أحداث المزامنة الحية (Realtime WebSocket Subscriptions)](#9-أحداث-المزامنة-الحية-realtime-websocket-subscriptions)
10. [رموز الاستجابة ومعالجة الأخطاء (Error Codes & Responses)](#10-رموز-الاستجابة-ومعالجة-الأخطاء-error-codes--responses)

---

## 1. نظرة عامة على واجهات التكامل (Integration Overview)
تعتمد منصة **فكرة (Fikra)** على معمارية واجهات برمجة تطبيقات RESTful مدعومة بمحرك PostgREST وقاعدة بيانات Supabase، مما يتيح التبادل اللحظي للبيانات بنسق JSON القياسي مع دعم عمليات CRUD الكاملة والاشتراك في التغييرات الفورية عبر WebSockets.

- **الرابط الأساسي للخادم (Base URL):**
  `https://hpyemkppaewnkojtycio.supabase.co/rest/v1`

---

## 2. المصادقة ومفاتيح الوصول (Authentication & Security Headers)
يجب تضمين الترويسات (Headers) التالية مع كافة طلبات الـ HTTP:

```http
apikey: sb_publishable_jbegrGFi4CIe5_aAk5YXRg_T8YDLZZk
Authorization: Bearer sb_publishable_jbegrGFi4CIe5_aAk5YXRg_T8YDLZZk
Content-Type: application/json
Prefer: return=representation
```

---

## 3. واجهات إدارة الأفكار (Ideas Endpoints)

### 3.1. جلب قائمة الأفكار (List Ideas)
- **المسار:** `GET /fikra_ideas`
- **معاملات التصفية (Query Parameters):**
  - `status=eq.approved` (تصفية حسب الحالة)
  - `target_dept_id=eq.cs` (تصفية حسب الكلية المستهدفة)
  - `order=created_at.desc` (الترتيب)
- **نموذج الاستجابة (Response Payload - 200 OK):**
```json
[
  {
    "id": "idea_001",
    "title_ar": "نظام الحرم الجامعي الذكي لترشيد الطاقة",
    "title_en": "Smart Energy Saving Campus System",
    "desc_ar": "استخدام حساسات إنترنت الأشياء والذكاء الاصطناعي لإدارة التكييف والإضاءة في مباني الجامعة...",
    "desc_en": "Utilizing IoT sensors and AI to manage HVAC and lighting...",
    "impact_ar": "خفض فاتورة الكهرباء السنوية بنسبة 25%",
    "impact_en": "Reduce annual electricity costs by 25%",
    "budget": "50,000 SAR",
    "category_id": "sustainability",
    "department_id": "engineering",
    "target_dept_id": "projects",
    "author_id": "usr_emp_01",
    "author_name": "د. عبدالله الشهراني",
    "author_dept": "كلية الهندسة",
    "author_avatar": "assets/images/avatars/user1.png",
    "status": "approved",
    "tags": ["استدامة", "ترشيد_الطاقة", "انترنت_الاشياء"],
    "ai_score": 92,
    "ai_summary": "مبادرة بيئية ذات جدوى اقتصادية وأثر مالي مباشر.",
    "votes": ["usr_emp_02", "usr_admin_01"],
    "downvotes": [],
    "comments": [
      {
        "id": "cmt_1",
        "authorId": "usr_emp_02",
        "authorName": "أ. نورة الغامدي",
        "text": "فكرة ممتازة وتستحق البدء بكلية الهندسة كنموذج تجريبي.",
        "createdAt": "2026-09-15T10:30:00.000Z"
      }
    ],
    "evaluation": {
      "strategicAlignment": 5,
      "feasibility": 4,
      "innovation": 5,
      "impact": 5,
      "totalScore": 95,
      "decision": "approved",
      "notes": "تمت الموافقة للبدء في إعداد كراسة الشروط الفنية.",
      "evaluatedAt": "2026-09-15T12:00:00.000Z",
      "evaluatorName": "د. سارة القحطاني"
    },
    "created_at": "2026-09-14T08:15:00.000Z"
  }
]
```

### 3.2. طرح فكرة جديدة (Create Idea)
- **المسار:** `POST /fikra_ideas`
- **جسم الطلب (Request Body):**
```json
{
  "id": "idea_1726410000000",
  "title_ar": "منصة الأبحاث المشتركة",
  "title_en": "Joint Research Hub",
  "desc_ar": "بوابة موحدة للربط بين الباحثين في كليات جامعة بيشة لتكوين مجموعات بحثية...",
  "desc_en": "A unified portal connecting researchers across faculties...",
  "impact_ar": "زيادة معدل النشر العلمي في المجلات المصنفة Q1 بنسبة 40%",
  "impact_en": "Increase Q1 indexed scientific publication rate by 40%",
  "budget": "20,000 SAR",
  "category_id": "research",
  "department_id": "cs",
  "target_dept_id": "postgraduate",
  "author_id": "usr_emp_01",
  "author_name": "د. عبدالله الشهراني",
  "author_dept": "كلية الحاسب الآلي",
  "status": "submitted",
  "tags": ["بحث_علمي", "ابتكار"],
  "ai_score": 88
}
```

### 3.3. التصويت والتفاعل مع الفكرة (Vote / Comment)
- **المسار:** `PATCH /fikra_ideas?id=eq.{idea_id}`
- **جسم الطلب لتحديث مصفوفة المصوتين:**
```json
{
  "votes": ["usr_emp_01", "usr_emp_02", "usr_new_03"]
}
```

---

## 4. واجهات لجان التحكيم والتقييم (Committee Evaluations API)
- **المسار:** `PATCH /fikra_ideas?id=eq.{idea_id}`
- **جسم الطلب لإصدار قرار التحكيم:**
```json
{
  "status": "approved",
  "evaluation": {
    "strategicAlignment": 5,
    "feasibility": 4,
    "innovation": 4,
    "impact": 5,
    "totalScore": 90,
    "decision": "approved",
    "notes": "فكرة متميزة تتماشى مع مستهدفات الجامعة في التحول الرقمي.",
    "evaluatorId": "usr_com_01",
    "evaluatorName": "د. سارة القحطاني",
    "evaluatedAt": "2026-09-15T14:20:00.000Z"
  }
}
```

---

## 5. واجهات الهيكل المؤسسي والقوائم (Departments & Dropdowns API)

### 5.1. إدارة الكليات والعمادات (`/fikra_departments`)
- **جلب الكليات:** `GET /fikra_departments?order=name_ar.asc`
- **إضافة كلية:** `POST /fikra_departments`
```json
{
  "id": "dept_law",
  "code": "LAW",
  "name_ar": "كلية الأنظمة والقانون",
  "name_en": "College of Law",
  "type": "college"
}
```

### 5.2. إدارة مجالات الابتكار (`/fikra_categories`)
- **جلب المجالات:** `GET /fikra_categories`
- **إضافة تصنيف:**
```json
{
  "id": "cat_ai",
  "name_ar": "الذكاء الاصطناعي والبيانات الضخمة",
  "name_en": "AI & Big Data",
  "icon": "mdi-robot",
  "color": "#14573A"
}
```

---

## 6. واجهات المستخدمين والملفات الشخصية (Users & Auth API)
- **المسار:** `GET /fikra_users` | `POST /fikra_users` | `PATCH /fikra_users?id=eq.{id}`
```json
{
  "id": "usr_102030",
  "name": "د. محمد الغامدي",
  "email": "mghamdi@ub.edu.sa",
  "department_id": "engineering",
  "job_title_id": "assoc_prof",
  "role": "committee",
  "points": 120,
  "created_at": "2026-09-15T08:00:00.000Z"
}
```

---

## 7. التكامل مع محرك الذكاء الاصطناعي (Google Gemini AI API Integration)
عند تفعيل المحرك السحابي الاختياري، تقوم المنصة بإرسال الطلبات إلى نموذج Google Gemini Pro:
- **المسار:** `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={API_KEY}`
- **جسم الطلب (Prompt Schema):**
```json
{
  "contents": [
    {
      "parts": [
        {
          "text": "حلل الفكرة الابتكارية التالية المقدمة لجامعة بيشة، وقدم تلخيصاً تنفيذياً من جملتين، ودرجة الأثر من 100، واقتراح 3 وسوم باللغة العربية: \nالعنوان: تطبيق الحرم الجامعي الذكي\nالوصف: نظام لإدارة مواقف السيارات والقاعات عبر المستشعرات..."
        }
      ]
    }
  ]
}
```

---

## 8. التكامل مع واجهة الإدخال الصوتي (Web Speech API Integration)
- **المكتبة المعيارية:** `window.webkitSpeechRecognition || window.SpeechRecognition`
- **الإعدادات:**
```javascript
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.continuous = false;
recognition.interimResults = true;
recognition.lang = I18N.currentLang === 'ar' ? 'ar-SA' : 'en-US';

recognition.onresult = (event) => {
  const transcript = Array.from(event.results)
    .map(r => r[0].transcript)
    .join('');
  document.getElementById('idea-desc').value = transcript;
};
```

---

## 9. أحداث المزامنة الحية (Realtime WebSocket Subscriptions)
للاستماع المباشر للأفكار الجديدة والتصويتات دون إعادة تحميل الصفحة:
```javascript
const subscription = SupabaseService.client
  .channel('public:fikra_ideas')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'fikra_ideas' }, payload => {
    console.log('Realtime DB Change detected:', payload);
    SupabaseService.handleRealtimePayload(payload);
  })
  .subscribe();
```

---

## 10. رموز الاستجابة ومعالجة الأخطاء (Error Codes & Responses)

| كود الحالة (HTTP Code) | المعنى والرسالة | الإجراء المتبع |
| :--- | :--- | :--- |
| **`200 OK` / `201 Created`** | تمت العملية بنجاح | تحديث واجهة المستخدم فورياً |
| **`400 Bad Request`** | نقص في الحقول الإلزامية أو صيغة JSON غير صالحة | إظهار تنبيه Toast للمستخدم بإكمال الحقول |
| **`401 Unauthorized`** | مفتاح Supabase أو صلاحية الدخول غير صالحة | إعادة توجيه المستخدم لصفحة تسجيل الدخول |
| **`409 Conflict`** | تعارض في المعرفات الأساسية (Primary Key Conflict) | توليد معرف فريد جديد وإعادة المحاولة |
| **`500 Server Error`** | خطأ غير متوقع في الخادم السحابي | تفعيل وضع الأوفلاين المحلي وحفظ البيانات في LocalStorage |
