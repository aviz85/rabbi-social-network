# רבנים נט - רשת חברתית לרבנים

אפליקציית רשת חברתית ייעודית המיועדת לרבנים לשיתוף ידע, דיונים תורניים ולימוד משותף.

## 🌟 גרסה נוכחית - יציב ומלאה

**✅ כל התכונות המרכזיות מיושמות ופועלות!**

## 📦 Installation & Quick Start

### 🚀 One-Command Setup
```bash
git clone https://github.com/aviz85/rabbi-social-network.git
cd rabbi-social-network
npm install
npm run dev
```

### 🔗 Live Repository
**GitHub**: https://github.com/aviz85/rabbi-social-network

### 👤 Test Account
- **Email**: test@rabbi.com
- **Password**: password123

## ✅ תכונות מיושמות

### 🔐 מערכת אימות מלאה
- ✅ JWT Authentication עם אחסון מאובטח
- ✅ הרשמה והתחברות עם אימות סיסמה
- ✅ Logout עם ניקוי טוקנים אוטומטי
- ✅ Auto-login לצורך פיתוח

### 📝 פוסטים ואינטראקציות
- ✅ יצירת פוסטים חדשים בקטגוריות תורניות
- ✅ Like/Unlike עם עדכונים בזמן אמת
- ✅ תגובות עם סנכרון מלא
- ✅ ספירת לייקים דינמית

### 👥 מערכת עוקבים (Follow)
- ✅ Follow/Unfollow משתמשים
- ✅ עדכוני ספירת עוקבים בזמן אמת
- ✅ כפתורי follow בכרטיסי פרופיל
- ✅ עוקבים בסרגל צד (רבנים מומלצים)
- ✅ דפי פרופיל מלאים עם סטטיסטיקות

### 📚 רישום לשיעורים
- ✅ צפייה בשיעורים קרובים
- ✅ Register/Unregister לשיעורים
- ✅ ניהול תפוסה ומקומות פנויים
- ✅ עדכוני משתתפים בזמן אמת

### 📱 ממשק משתמש
- ✅ עיצוב רספונסיבי מלא (דסקטופ + מובייל)
- ✅ Tailwind CSS מודרני
- ✅ תמיכה מלאה בעברית (RTL)
- ✡️ מצבי טעינה וטיפול שגיאות
- ✡️ ניווט אינטואיטיבי עם סרגל צד

## 🛠️ טכנולוגיות

### Frontend
- **React 18** + TypeScript
- **Tailwind CSS** לעיצוב מודרני
- **Lucide React** לאייקונים
- **JWT** לאימות לקוח
- **LocalStorage** לאחסון טוקנים

### Backend
- **Node.js** + Express
- **SQLite** למסד נתונים
- **JWT** לאימות שרת
- **bcryptjs** להצפנת סיסמאות
- **CORS** לתקשורת בין דומיינים

## 📁 מבנה הפרויקט

```
rabbi-social-network/
├── src/
│   ├── components/          # רכיבי React
│   │   ├── AuthModal.tsx    # מודל אימות
│   │   ├── PostCard.tsx     # כרטיס פוסט עם לייקים
│   │   ├── ProfileCard.tsx  # כרטיס פרופיל עם follow
│   │   ├── Sidebar.tsx      # סרגל צד עם רבנים מומלצים
│   │   ├── UserProfile.tsx  # דף פרופיל מלא
│   │   ├── StudySessionCard.tsx # כרטיס שיעור עם רישום
│   │   └── ...
│   ├── services/           # שירותי API
│   │   └── api.ts          # API service מלא
│   ├── types/              # טיפוסי TypeScript
│   └── data/               # נתוני הדגמה
├── server.js               # שרת Express מלא
├── rabbis.db              # מסד נתונים SQLite
└── package.json           # כל התלות וסקריפטים
```

## 🚀 API Endpoints

### אימות
- `POST /api/auth/register` - הרשמה
- `POST /api/auth/login` - התחברות

### פוסטים
- `GET /api/posts` - קבלת כל הפוסטים
- `POST /api/posts` - יצירת פוסט חדש
- `POST /api/posts/:id/like` - Like/Unlike פוסט

### משתמשים ועוקבים
- `GET /api/users` - קבלת כל המשתמשים
- `POST /api/users/:id/follow` - Follow/Unfollow משתמש
- `GET /api/users/:id/follow-status` - סטטוס follow
- `GET /api/users/:id/posts` - פוסטים של משתמש

### שיעורים
- `GET /api/study-sessions` - קבלת שיעורים
- `POST /api/study-sessions/:id/register` - רישום לשיעור
- `GET /api/study-sessions/:id/registration-status` - סטטוס רישום

## 🎯 תכונות מיוחדות

### 🔄 עדכונים בזמן אמת
- Optimistic UI עם API fallback
- סנכרון אוטומטי בין רכיבים
- ספירות דינמיות (עוקבים, לייקים, משתתפים)

### 🛡️ טיפול שגיאות
- Error boundaries
- Loading states מתקדמים
- הודעות שגיאה ידידותיות

### 📱 חוויית מובייל
- Responsive design מלא
- Mobile sidebar אינטראקטיבי
- Touch-friendly controls

## 🔧 הרצה

### פיתוח
```bash
npm run dev
```
מפעיל גם frontend (port 3001) וגם backend (port 5001)

### ייצור
```bash
npm run build
npm start
```

## 🌟 הישגים

- ✅ **מערכת אימות מלאה** - JWT עם אבטחה
- ✅ **פוסטים אינטראקטיביים** - Like/Unlike בזמן אמת
- ✅ **מערכת עוקבים** - Follow/Unfollow עם סטטיסטיקות
- ✅ **רישום שיעורים** - ניהול תפוסה ומשתתפים
- ✅ **TypeScript מלא** - Type safety בכל הרכיבים
- ✅ **Responsive Design** - עובד מושלם במובייל

## 🤝 תרומה

1. Fork את המאגר
2. צור branch לתכונה חדשה
3. שלח Pull Request

## 📞 יצירת קשר

- **Author**: Aviz Maeir
- **Email**: avizmaeir@gmail.com
- **GitHub**: [@aviz85](https://github.com/aviz85)

---

**רבנים נט** - חיבור עולם התורה בעידן הדיגיטלי ✡️

🔗 **GitHub**: https://github.com/aviz85/rabbi-social-network
