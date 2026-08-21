// Backend Telegram Bot API'ga to'g'ridan-to'g'ri HTTPS orqali xabar yuboradi
// (bot jarayoni alohida ishlaydi, backend faqat sendMessage chaqiradi — bitta BOT_TOKEN, bitta manba).

async function sendTelegramMessage(chatId, text) {
  const token = process.env.BOT_TOKEN;
  if (!token || !chatId) return;

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Telegram API xatosi: ${res.status} ${body}`);
  }
}

module.exports = { sendTelegramMessage };
