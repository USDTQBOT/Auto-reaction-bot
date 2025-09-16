import TelegramBot from "node-telegram-bot-api";

const BOT_TOKEN = process.env.BOT_TOKEN;
const EMOJI_LIST =
  process.env.EMOJI_LIST || "👍😂🔥💯👏🎉😎🙌❤️👌";
const RESTRICTED_CHATS = process.env.RESTRICTED_CHATS
  ? process.env.RESTRICTED_CHATS.split(",").map(id => id.trim())
  : [];

const bot = new TelegramBot(BOT_TOKEN, { webHook: true });

// --- Helpers ---
function getRandomEmoji() {
  const emojis = EMOJI_LIST.split("");
  return emojis[Math.floor(Math.random() * emojis.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// --- React with multiple emojis ---
async function reactMultipleTimes(chatId, messageId) {
  const reactionCount = getRandomInt(10, 15);

  for (let i = 0; i < reactionCount; i++) {
    const emoji = getRandomEmoji();
    try {
      await bot.sendMessage(chatId, emoji, {
        reply_to_message_id: messageId,
      });
      console.log(
        `✅ Reacted with ${emoji} (${i + 1}/${reactionCount}) in chat ${chatId}`
      );
      // Wait 1–2 seconds between emojis
      await delay(getRandomInt(1000, 2000));
    } catch (err) {
      console.error("❌ Error sending emoji:", err);
    }
  }
}

// --- Main handler for Vercel ---
export default async function handler(req, res) {
  if (req.method === "POST") {
    const update = req.body;

    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat.id.toString();

      if (!RESTRICTED_CHATS.includes(chatId)) {
        if (msg.chat.type === "channel") {
          await reactMultipleTimes(chatId, msg.message_id);
        } else {
          const emoji = getRandomEmoji();
          await bot.sendMessage(chatId, emoji, {
            reply_to_message_id: msg.message_id,
          });
        }
      }
    }

    return res.status(200).send("OK");
  }

  res.status(200).json({ status: "Auto-Reaction Bot is live 🚀" });
}