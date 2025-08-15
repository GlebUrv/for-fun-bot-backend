const TelegramBot = require("node-telegram-bot-api");
const webAppUrl = "https://stately-malabi-195a92.netlify.app";
const express = require("express");
const cors = require("cors");

require("dotenv").config();
const token = process.env.BOT_TOKEN;

const bot = new TelegramBot(token, { polling: true });
const app = express();

app.use(express.json());
app.use(cors());

bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const msgText = msg.text;

  if (msgText === "/start" || msgText === "/menu") {
    await bot.sendMessage(
      chatId,
      "Добро пожаловать в наш магазин! Выберите, что вы хотите сделать:",
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Показать каталог",
                web_app: { url: webAppUrl + "/catalog" },
              },
            ],
            [{ text: "Оформить спецзаказ", web_app: { url: webAppUrl } }],
            [{ text: "Корзина", web_app: { url: webAppUrl } }],
            [{ text: "Мои заказы", web_app: { url: webAppUrl } }],
            [{ text: "Помощь", web_app: { url: webAppUrl } }],
          ],
        },
      }
    );
  }

  if (msgText === "/start" || msgText === "/order") {
    await bot.sendMessage(chatId, "Чтобы оформить заказ, заполните форму:", {
      reply_markup: {
        keyboard: [
          [{ text: "Заполнить данные", web_app: { url: webAppUrl + "/form" } }],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    });
  }

  if (msg?.web_app_data?.data) {
    try {
      const data = JSON.parse(msg.web_app_data?.data);
      await bot.sendMessage(
        chatId,
        `Мы получили ваши данные: ${data.name}, ${data.address}, ${data.phone}`
      );

      setTimeout(async () => {
        await bot.sendMessage(
          chatId,
          "Заказ оформлен. Теперь вы должны нам денег!"
        );
      }, 3000);
    } catch (error) {
      console.log(error);
    }

    await bot.sendMessage(chatId, "Ваш заказ успешно оформлен!");
  }

  //   bot.sendMessage(chatId, "Received your message");
});

app.post("/web-data", async (req, res) => {
  const { queryId, products, totalPrice } = req.body;

  if (!queryId || !products || !totalPrice) {
    return res.status(400).send("Invalid request");
  }

  try {
    await bot.answerWebAppQuery(queryId, {
      type: "article",
      id: queryId,
      title: "Заказ оформлен",
      input_message_content: {
        message_text:
          `Вы оформили заказ. Общая стоимость` + totalPrice + " руб.",
      },
    });
    return res.status(200).send("Заказ оформлен успешно");
  } catch (error) {
    await bot.answerWebAppQuery(queryId, {
      type: "article",
      id: queryId,
      title: "Ошибка",
      input_message_content: {
        message_text: "Произошла ошибка при оформлении заказа.",
      },
    });
    return res.status(500).send("Ошибка при оформлении заказа");
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Поднялась собака сутулая в порту ${PORT}`);
});
