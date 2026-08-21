# HireUz — TOP VACANCY. TOP CANDIDATE.

Ish qidiruvchi (nomzod) va ish beruvchini bog'lovchi platforma. Web va Telegram bot bitta backend va bitta MongoDB'ga ulangan yagona sistema.

## Nima qilingan (MUST zanjiri — to'liq ishlaydi)

Auth (rol tanlash) → Ish beruvchi vakansiya yaratadi → Nomzod ko'rib ariza beradi → Ish beruvchiga notification (Web + Telegram) → Ish beruvchi qabul/rad qiladi → Nomzodga notification (Web + Telegram) → Nomzod dashboardida status darhol yangilanadi.

Qo'shimcha: HireUz AI (nomzodga vakansiya tavsiyasi, ish beruvchiga arizalar ko'nikma bo'yicha xulosasi — yakuniy qarorni doim inson qabul qiladi), qidiruv/filtr, nomzod va kompaniya profillari, seed data.

## Stack

- **Web:** Next.js (App Router) + TypeScript + Tailwind + shadcn/ui
- **Backend:** Express + Mongoose (MongoDB)
- **Bot:** Node.js + Telegram Bot API (long-polling, qo'lda yozilgan — Telegraf kutubxonasi bu muhitda ishlamadi)
- **Auth:** JWT + bcrypt

## Loyiha strukturasi

```
HireUZ/
├── web/       — Next.js frontend (Vercel)
├── backend/   — Express API (Render)
└── bot/       — Telegram bot (Render Background Worker)
```

## Ishga tushirish (lokal)

```bash
# Backend
cd backend
npm install
cp .env.example .env   # MONGO_URI, JWT_SECRET, BOT_TOKEN to'ldiring
npm run seed            # demo ma'lumotlar (kompaniyalar, vakansiyalar, arizalar)
npm run dev              # http://localhost:5000

# Bot
cd bot
npm install
cp .env.example .env
npm start

# Web
cd web
npm install
cp .env.local.example .env.local
npm run dev              # http://localhost:3000
```

## Demo hisoblar (seed'dan keyin)

Parol barchasi uchun: `password123`

- Ish beruvchi: `employer1@hireuz.uz`, `employer2@hireuz.uz`, `employer3@hireuz.uz`
- Nomzod: `candidate1@hireuz.uz`, `candidate2@hireuz.uz`, `candidate3@hireuz.uz`

## Telegram bot

`@hire_uz_bot` — Web ilovada profil menyusidan "Telegramni ulash" orqali hisobingizni bog'lang, shundan so'ng yangi ariza / status o'zgarishi haqida real vaqtda xabar keladi.

## Live URL'lar

- Web: _(deploydan keyin to'ldiriladi)_
- Backend API: _(deploydan keyin to'ldiriladi)_
- Bot: `@hire_uz_bot`

## Muhim eslatma

Barcha domenga xos talablar `promt.md`da, ishlab chiqish qoidalari (stack, UI/UX standart, vakolat chegaralari, deploy, git tartibi) `CLAUDE.md`da hujjatlashtirilgan.
