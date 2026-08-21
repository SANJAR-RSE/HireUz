# HIREUZ — ISH QIDIRUVCHI VA ISH BERUVCHINI BOG'LOVCHI PLATFORMA (Hackathon MVP)

> Bu fayl loyihaning **domenga xos** talablarini beradi (nima qurish kerak).
> Qanday qurish kerakligi (stack, UI standart, vakolat chegaralari, deploy, git, xato-bardoshlik) — **CLAUDE.md**'da, bu yerda takrorlanmaydi.

## 1. G'oya

Hackathon mavzusi: **"Ish bilan ta'minlash / mehnat bozori"**

HireUz — ikki turdagi foydalanuvchini bog'laydigan platforma:

- **Nomzod (job seeker)** — vakansiyalarni ko'radi, ariza beradi, ariza holatini kuzatadi.
- **Ish beruvchi (employer)** — vakansiya joylaydi, kelgan arizalarni ko'rib chiqadi, qabul/rad qiladi.

Slogan: **"TOP VACANCY. TOP CANDIDATE."**

Hackathon talabi (mavzudan kelib chiqadi):

- ikki tomonlama, real foydalaniladigan mahsulot (bir tomonlik e'lon taxtasi emas);
- ariza jarayoni **oxirigacha yopiq** bo'lishi kerak (yuborildi → ko'rib chiqildi → qaror) — yarim jarayon emas;
- ikkala tomon ham o'z harakati natijasini **darhol** biladi (notification orqali).

## 2. Scope — nima MUST, nima vaqt qolsa

**MUST (asosiy demo zanjiri — bittasi ham tushib qolmasin):**
Auth (rol tanlash: Nomzod / Ish beruvchi) → Ish beruvchi: vakansiya yaratish → Nomzod: vakansiyalar ro'yxati va ariza berish → Ish beruvchiga yangi ariza haqida notification (Web + Telegram) → Ish beruvchi: arizani ko'rib chiqib status o'zgartiradi (Qabul/Rad) → Nomzodga status o'zgargani haqida notification (Web + Telegram) → Nomzod dashboardida yangilangan status ko'rinadi

Shu zanjir ishlasa, "ikki tomonlama bog'langan sistema" g'oyasi to'liq isbotlanadi.

**Vaqt qolsa qo'shiladi (shu tartibda):**

1. HireUz AI (nomzodga mos vakansiya tavsiyasi, ish beruvchiga arizalarni qisqacha solishtirib berish)
2. Vakansiya qidiruv/filtr (kategoriya, joylashuv, maosh diapazoni)
3. Nomzod profili (tajriba, ko'nikmalar — ariza berishda avtomatik ulanadi)
4. Kompaniya profil sahifasi (haqida, boshqa vakansiyalari)
5. Vakansiyani saqlash (bookmark), statistikalar (necha ariza kelgani)

Qaysi bosqichda to'xtash kerakligini **o'zing hal qil** (CLAUDE.md'dagi vakolat qoidasiga ko'ra) — vaqtga qarab.

## 3. Asosiy modullar (to'liq ro'yxat, referens uchun)

Auth & Rollar: Nomzod / Ish beruvchi (registratsiyada rol tanlanadi, keyin dashboard shunga qarab farqlanadi)
Vakansiyalar: Job posting (sarlavha, tavsif, talablar, maosh, joylashuv, ish turi) · Kategoriyalar · Qidiruv/filtr
Arizalar: Ariza berish (CV yuklash yoki profil orqali) · Status workflow · Ariza tarixi
Profil: Nomzod profili (CV, ko'nikmalar, tajriba) · Kompaniya profili (nomi, logo, haqida)
Platform: Ikki xil Dashboard (Nomzod / Ish beruvchi) · Notifications · Telegram integration · HireUz AI (yordamchi)

Har biri bitta HireUz accountga tegishli — alohida-alohida feature emas, bog'langan sistema (misol: ariza berilishi → ish beruvchi notification oladi → status o'zgartirishi → nomzod notification oladi → ikkala dashboard ham yangilanadi).

## 4. Arxitektura — WEB va TELEGRAM bitta sistema

```
              WEB APP        TELEGRAM BOT
                  |                |
                  └───────┬────────┘
                          |
                    BACKEND API  ← yagona source of truth
                          |
                       MONGODB   ← yagona database
```

- Web va Telegram **alohida database yoki logic ishlatmaydi** — bitta backend, bitta MongoDB.
- **Account sync:** Web'da register (rol tanlab) → "Telegramni ulash" → unique linking code → Telegram `/start <code>` → backend accountlarni bog'laydi.
- **Web** = to'liq interfeys: vakansiya yaratish/tahrirlash, arizalarni ko'rib chiqish, profil, filtr/qidiruv.
- **Telegram bot** = tezkor bildirishnoma kanali (ikkala rol uchun ham): yangi ariza kelganda ish beruvchiga, status o'zgarganda nomzodga real-time xabar. Vaqt qolsa — botdan tezkor vakansiya ro'yxatini ko'rish ham qo'shiladi.
- **Fake/hardcoded notification yuborilmaydi** — faqat real backend hodisasi (ariza yaratilishi, status o'zgarishi) xabar yuboradi.

## 5. Ariza status workflow (asosiy mexanika)

Status: `PENDING (Yuborildi) → REVIEWING (Ko'rib chiqilmoqda) → ACCEPTED (Qabul qilindi) / REJECTED (Rad etildi)`

- Nomzod ariza bersa → status avtomatik `PENDING`, ish beruvchiga notification.
- Ish beruvchi arizani ochsa → status `REVIEWING`ga o'tkazish ixtiyoriy (ko'rib chiqilayotganini bildiradi).
- Ish beruvchi "Qabul qilish" yoki "Rad etish" tugmasini bossa → status yakuniy holatga o'tadi, **darhol** nomzodga notification (Web + Telegram) yuboriladi.
- Har status o'zgarishi backendda log qilinadi (qachon o'zgargani) — nomzod o'z arizalar tarixida buni ko'radi.

## 6. Ikki xil Dashboard

- **Nomzod dashboard:** yuborilgan arizalar ro'yxati (vakansiya nomi + joriy status, rangli belgi bilan), yangi vakansiyalar tavsiyasi.
- **Ish beruvchi dashboard:** joylangan vakansiyalar ro'yxati, har biriga kelgan arizalar soni, so'nggi arizalar (status bo'yicha filtrlash imkoniyati).

## 6.1 HireUz AI — qoidalar (bu bo'lim majburiy, xavfsizlikka aloqador)

AI ikkala rolga ham xizmat qiladi, lekin vazifasi turlicha:

- **Nomzod uchun:** profili/qidiruv so'roviga qarab mos vakansiyalarni backend'dagi real ma'lumot asosida tavsiya qiladi ("Menga junior frontend ish kerak" → mos vakansiyalar ro'yxati).
- **Ish beruvchi uchun:** kelgan arizalarni **qisqacha solishtirib beradi** (masalan tajriba/ko'nikma bo'yicha xulosa) — lekin **kimni ishga olish/olmaslikni AI hal qilmaydi**, yakuniy qarorni doim inson (ish beruvchi) qabul qiladi.
- AI **irqi, jinsi, yoshi, millati kabi himoyalangan xususiyatlar asosida** hech qanday tavsiya yoki filtr bermaydi — faqat ko'nikma/tajriba/vakansiya talablariga mos kelish asosida ishlaydi.
- AI backend orqali **real vakansiya/ariza ma'lumoti** bilan ishlaydi, fake nomzod yoki fake vakansiya to'qimaydi.
- Bir userning AI konteksti (nomzod ham, ish beruvchi ham) boshqa userga hech qachon ko'rinmaydi.

## 7. Ma'lumotlar modeli (Mongoose)

`User (role: candidate|employer), CandidateProfile, CompanyProfile, Job, Category, Application, Notification, TelegramConnection, AIConversation, AIMessage`

Backend struktura: `models/ routes/ controllers/ services/ middleware/ utils/ scripts/ config/` — masalan `jobs.routes.js`, `applications.service.js`, `notification.service.js`, `telegram.service.js`, `ai.service.js`. Rol asosida middleware (`requireRole('employer')` va h.k.) orqali ruxsat cheklanadi.

## 8. Demo uchun seed data

`backend/scripts/seedDatabase.js`: 2–3 demo kompaniya, 8–10 vakansiya (turli kategoriya/joylashuvda), 2–3 demo nomzod, bir nechta ariza — turli statusda (biri `PENDING`, biri `REVIEWING`, biri `ACCEPTED` — demo uchun barcha holatlar ko'rinishi kerak).

## 9. Domenga xos maxfiylik (umumiy JWT/bcrypt — CLAUDE.md'da; bu yerda faqat domenga xos qism)

- Nomzodning CV/shaxsiy ma'lumoti **faqat u ariza yuborgan ish beruvchiga** ko'rinadi — boshqa kompaniyalarga yoki boshqa nomzodlarga yo'q.
- Ish beruvchi faqat **o'ziga tegishli vakansiyalarga** kelgan arizalarni ko'radi, boshqa kompaniyalarning arizalarini ko'rmaydi.
- Nomzod boshqa nomzodning ariza holatini ko'ra olmaydi.

## 10. Demo stsenariy (2 soatlik taqdimot uchun, MUST zanjiriga mos)

1. Ish beruvchi sifatida register → vakansiya yaratish (masalan "Frontend Developer")
2. Nomzod sifatida register → vakansiyalar ro'yxatida shu e'lonni ko'rish → ariza berish
3. Ish beruvchiga Telegramda "Yangi ariza keldi" xabari kelganini ko'rsatish
4. Ish beruvchi panelida arizani ochib "Qabul qilindi" tugmasini bosish
5. Nomzodga Web dashboard + Telegramda "Arizangiz qabul qilindi" xabari kelganini ko'rsatish
6. Nomzod dashboardida status yangilangani ko'rinadi

Vaqt qolsa: HireUz AI ("Menga mos vakansiya toping" / ish beruvchiga arizalar xulosasi), qidiruv/filtr, nomzod profili, kompaniya profil sahifasi qo'shiladi.

## 11. Loyihaga xos ENV o'zgaruvchilar

```
GITHUB_REPO=https://github.com/SANJAR-RSE/HireUz.git
MONGO_URI=mongodb+srv://rasulberdievsanjar_db_user:aGVDb7zpYK8D9MqE@cluster0.k6qlvor.mongodb.net/?appName=Cluster0
MONGO_USER=rasulberdievsanjar_db_user
MONGO_PASSWORD=aGVDb7zpYK8D9MqE
RENDER_TOKEN=rnd_2eNNC9OnUAqdC1FRt6Oe0PHDQSdp
BOT_TOKEN=8961663010:AAEDKW8zY_3TfaOuQsPa-4gzUZwEcLBnQ-A
```

CV fayllari uchun demo darajasida oddiy `multer` bilan local saqlash yetarli (tashqi pullik storage kerak emas — CLAUDE.md'dagi "haqiqiy pullik tashqi xizmat" cheklovi shu yerga tegishli, shuning uchun oddiy yechim tanlanadi).

---

**Eslatma:** Project structure (`web/ backend/ bot/`), UI/UX standart, xato-bardoshlik, xavfsizlik (JWT/bcrypt umumiy qismi), deploy, git checkpoint, README talablari va vakolat chegaralari — barchasi **CLAUDE.md**'da mavjud, Claude Code buni sessiya boshida avtomatik o'qiydi.
