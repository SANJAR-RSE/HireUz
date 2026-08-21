require("dotenv").config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";
const API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Bot faqat tezkor bildirishnoma kanali: hisob bog'lash (/start <code>) va xush kelibsiz xabari.
// Barcha ma'lumot/mantiq backend'da — bot alohida database yoki logic ishlatmaydi.
//
// Eslatma: Telegraf kutubxonasining bot.launch() metodi shu muhitda (Node 24) sababsiz
// osilib qolgani aniqlandi, shuning uchun sodda raqamli long-polling qo'lda yozildi —
// ishonchliroq va bir xil natijani beradi.

async function sendMessage(chatId, text) {
  const res = await fetch(`${API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  if (!res.ok) console.error("sendMessage xatosi:", await res.text());
}

async function handleStart(chatId, payload) {
  if (!payload) {
    await sendMessage(
      chatId,
      "Assalomu alaykum! HireUz botiga xush kelibsiz.\n\n" +
        "Web saytdagi profilingizni ulash uchun web ilovada \"Telegramni ulash\" tugmasini bosib, " +
        "chiqqan kodni shu yerga /start <kod> ko'rinishida yuboring."
    );
    return;
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/telegram/link`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: payload, chatId: String(chatId) }),
    });
    const data = await res.json();

    if (!res.ok) {
      await sendMessage(chatId, `Ulash muvaffaqiyatsiz: ${data.message || "noma'lum xato"}`);
      return;
    }

    await sendMessage(
      chatId,
      `✅ Hisobingiz ulandi, ${data.name}!\n` +
        (data.role === "employer"
          ? "Yangi arizalar kelganda shu yerga xabar kelib turadi."
          : "Ariza holatingiz o'zgarganda shu yerga xabar kelib turadi.")
    );
  } catch (err) {
    console.error("Link xatosi:", err.message);
    await sendMessage(chatId, "Serverga ulanishda xatolik yuz berdi. Birozdan so'ng qayta urinib ko'ring.");
  }
}

async function handleUpdate(update) {
  const message = update.message;
  if (!message || !message.text) return;

  const chatId = message.chat.id;
  const text = message.text.trim();

  if (text === "/help") {
    await sendMessage(chatId, "HireUz — ish qidiruvchi va ish beruvchini bog'lovchi bot. Web saytdan hisobingizni ulang.");
    return;
  }

  if (text.startsWith("/start")) {
    const payload = text.slice("/start".length).trim() || null;
    await handleStart(chatId, payload);
  }
}

async function pollLoop() {
  let offset = 0;
  console.log("Telegram bot ishga tushdi (long-polling)");

  while (true) {
    try {
      const res = await fetch(`${API}/getUpdates?timeout=25&offset=${offset}`);
      if (!res.ok) {
        console.error("getUpdates xatosi:", res.status, await res.text());
        await new Promise((r) => setTimeout(r, 3000));
        continue;
      }
      const data = await res.json();
      for (const update of data.result || []) {
        offset = update.update_id + 1;
        handleUpdate(update).catch((err) => console.error("Update qayta ishlashda xato:", err.message));
      }
    } catch (err) {
      console.error("Poll xatosi:", err.message);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

if (!BOT_TOKEN) {
  console.error("BOT_TOKEN topilmadi (.env tekshiring)");
  process.exit(1);
}

// Render bepul tarifida faqat "web service" turi qo'llab-quvvatlanadi — bot esa
// tashqi so'rov qabul qilmaydi (long-polling orqali ishlaydi). Shuning uchun
// platforma port tekshiruvidan o'tishi uchun minimal HTTP server qo'shildi.
const http = require("http");
const PORT = process.env.PORT || 3001;
http
  .createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("HireUz bot ishlayapti (long-polling)");
  })
  .listen(PORT, () => console.log(`Bot health-check server ${PORT}-portda`));

pollLoop();
