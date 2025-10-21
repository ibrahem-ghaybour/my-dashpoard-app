# Deployment Guide - دليل النشر

## النشر على Vercel باستخدام GitHub Actions

### الخطوات المطلوبة:

#### 1. إنشاء حساب على Vercel
- اذهب إلى [vercel.com](https://vercel.com)
- سجل دخول باستخدام حساب GitHub

#### 2. ربط المشروع بـ Vercel
- اضغط على "Add New Project"
- اختر المستودع `my-dashpoard-app`
- اضغط "Import"

#### 3. الحصول على المفاتيح المطلوبة

##### أ. Vercel Token
1. اذهب إلى [Vercel Account Settings](https://vercel.com/account/tokens)
2. اضغط "Create Token"
3. انسخ الـ Token

##### ب. Vercel Organization ID
1. اذهب إلى [Vercel Settings](https://vercel.com/account)
2. انسخ "Organization ID" من الصفحة

##### ج. Vercel Project ID
1. اذهب إلى إعدادات المشروع في Vercel
2. انسخ "Project ID"

#### 4. إضافة Secrets في GitHub

1. اذهب إلى المستودع على GitHub
2. اذهب إلى `Settings` > `Secrets and variables` > `Actions`
3. اضغط `New repository secret`
4. أضف المفاتيح التالية:

```
VERCEL_TOKEN=<your-vercel-token>
VERCEL_ORG_ID=<your-org-id>
VERCEL_PROJECT_ID=<your-project-id>
VITE_API_BASE_URL=https://node-js-nine-gamma.vercel.app/api
```

#### 5. Push التغييرات

```bash
git add .
git commit -m "Add Vercel deployment configuration"
git push
```

### ✅ الآن عند كل Push على main، سيتم النشر تلقائياً!

---

## النشر اليدوي على Vercel

إذا أردت النشر يدوياً:

```bash
# تثبيت Vercel CLI
npm i -g vercel

# تسجيل الدخول
vercel login

# النشر
vercel --prod
```

---

## متغيرات البيئة المطلوبة

تأكد من إضافة المتغيرات التالية في Vercel Dashboard:

- `VITE_API_BASE_URL`: رابط الـ API الخاص بك

---

## استكشاف الأخطاء

### خطأ في البناء (Build Error)
- تحقق من أن جميع التبعيات مثبتة بشكل صحيح
- تأكد من أن ملف `.env` يحتوي على المتغيرات الصحيحة

### خطأ في النشر (Deployment Error)
- تحقق من صحة الـ Tokens في GitHub Secrets
- تأكد من أن المشروع مرتبط بشكل صحيح في Vercel

### الصفحات لا تعمل (404 Errors)
- تأكد من أن `vercel.json` يحتوي على rewrites الصحيحة
- تحقق من أن Vue Router في وضع history mode

---

## الدعم

إذا واجهت أي مشاكل:
1. تحقق من logs في GitHub Actions
2. تحقق من logs في Vercel Dashboard
3. راجع [Vercel Documentation](https://vercel.com/docs)
