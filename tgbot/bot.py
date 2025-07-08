import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes
import httpx

# Настройки
BOT_TOKEN = "7493809567:AAEUHRxiq6sNTB3NYQoHkz1NN5ICKikctXs"
API_BASE_URL = "https://tank-coin.ru/api"
WEBAPP_URL = "https://tank-coin.ru"
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    registration_result = await register_user(user.id, user.username)

    if registration_result["success"]:
        welcome_message = f"Добро пожаловать в игру, {user.first_name}!"
        keyboard = [
            [InlineKeyboardButton("Играть", web_app={"url": f"{WEBAPP_URL}/?id={user.id}"})]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        await update.message.reply_text(welcome_message, reply_markup=reply_markup)
    else:
        error_message = registration_result.get("error", "Произошла ошибка при регистрации")
        await update.message.reply_text(f"{error_message}")

async def register_user(telegram_id: int, username: str) -> dict:
    try:
        async with httpx.AsyncClient() as client:
            user_data = {
                "telegram_id": telegram_id,
                "username": username
            }
            response = await client.post(f"{API_BASE_URL}/users/", json=user_data)
            if response.status_code in [200, 201]:
                logger.info(f"Пользователь {telegram_id} успешно зарегистрирован")
                return {"success": True, "data": response.json()}
            elif response.status_code == 400:
                error_data = response.json()
                if "already exists" in error_data.get("detail", "").lower():
                    logger.info(f"Пользователь {telegram_id} уже существует")
                    return {"success": True, "data": {"existing": True}}
                else:
                    return {"success": False, "error": error_data.get("detail")}
            else:
                return {"success": False, "error": "Ошибка сервера"}
    except Exception as e:
        logger.error(f"Ошибка подключения к API: {e}")
        return {"success": False, "error": "Не удается подключиться к серверу"}

def main():
    application = ApplicationBuilder().token(BOT_TOKEN).build()
    application.add_handler(CommandHandler("start", start))
    logger.info("Бот запускается...")
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    main()
