// const Bot = require("../Entity/Bot");
//
// const JUMP_FORCE = -13;
// let colorArray = ['blue', 'green', 'yellow', 'purple'];
//
// /**
//  * Сервис для управления ботами.
//  * @class BotService
//  */
// class BotService {
//     constructor() {
//         this.bots = {};
//         this.botMovement = {};
//         this.leftBots = {};
//     }
//
//     /**
//      * Сбрасывает данные всех ботов.
//      */
//     async resetBotsData() {
//         try {
//             Object.values(this.bots).forEach(bot => {
//                 bot.x = 200;
//                 bot.y = 200;
//                 bot.collision = true;
//                 bot.visible = true;
//                 bot.statement = true;
//                 bot.movement = { x: 0, y: 0 };
//                 bot.onGround = true;
//                 bot.vy = 0;
//                 bot.health = 100;
//                 bot.statement = true;
//                 bot.active = false;
//             });
//         } catch (error) {
//             console.error('Ошибка сброса данных ботов: ' + error.message);
//         }
//     }
//
//     /**
//      * Создает нового бота.
//      * @param {string} botId - ID бота.
//      * @param {string} userName - Имя бота.
//      * @param {number} x - Начальная координата X.
//      * @param {number} y - Начальная координата Y.
//      * @param {number} size - Размер бота.
//      * @param {string} color - Цвет бота.
//      * @returns {Bot} Новый объект бота.
//      */
//     newBot(botId, userName, x, y, size, color) {
//         return new Bot(botId, userName, x, y, size, color, true, true);
//     }
//
//     /**
//      * Добавляет бота в игру.
//      * @param {string} roomName - Имя комнаты.
//      * @param {string} userName - Имя бота.
//      * @param {string} botId - ID бота.
//      * @async
//      */
//     async addBotToGame(roomName, userName, botId) {
//         try {
//             if (this.leftBots[botId] === undefined) {
//                 this.bots[botId] = this.newBot(botId, userName, 200, 200, 50, this.randomColor());
//             } else {
//                 this.bots[botId] = this.leftBots[botId];
//                 delete this.leftBots[botId];
//             }
//         } catch (error) {
//             console.error('Ошибка добавления бота в игру: ' + error.message);
//         }
//     }
//     /**
//      * Обрабатывает движение бота.
//      * @param {string} botId - ID бота.
//      * @param {Object} movementData - Данные о движении бота.
//      * @param {number} movementData.x - Скорость по оси X.
//      * @param {boolean} movementData.jump - Флаг прыжка.
//      *
//      */
//     async handleMoveBot(botId, movementData) {
//         try {
//             if (this.bots[botId].isCarrier && movementData.x) {
//                 movementData.x = movementData.x  > 0 ? movementData.x  + 1 : movementData.x  - 1;
//             }
//             this.bots[botId].vx = movementData.x;
//             if (movementData.jump && this.bots[botId].onGround) {
//                 this.bots[botId].vy = JUMP_FORCE;
//                 this.bots[botId].onGround = false;
//             }
//         } catch (error) {
//             console.error('Ошибка обработки движения бота: ' + error.message);
//         }
//     }
//
//     /**
//      * Обновляет здоровье всех ботов.
//      */
//     async updateHealth() {
//         try {
//             Object.values(this.bots).forEach(bot => {
//                 if (bot.statement) {
//                     bot.statement = bot.health <= 0 ? false : bot.statement;
//                     if (bot.x !== this.botMovement[bot.id] && bot.health < 100 && bot.onGround) {
//                         bot.health += 0.6;
//                     } else if (bot.health > 0) {
//                         bot.health -= 0.4;
//                     }
//                 }
//             });
//         } catch (error) {
//             console.error('Ошибка обновления здоровья ботов: ' + error.message);
//         }
//     }
//
//     /**
//      * Обновляет позиции всех ботов.
//      */
//     async updateBotsPosition() {
//         try {
//             Object.values(this.bots).forEach(bot => {
//                 this.botMovement[bot.id] = bot.x;
//                 bot.applyPhysics();
//             });
//         } catch (error) {
//             console.error('Ошибка обновления позиций ботов: ' + error.message);
//         }
//     }
//
//     /**
//      * Устанавливает точки спавна для всех ботов.
//      * @param {Array<{x: number, y: number}>} spawnPoints - Массив точек спавна.
//      */
//     async setBotsSpawnPoints(spawnPoints) {
//         Object.values(this.bots).forEach(bot => {
//             const spawnPoint = spawnPoints.pop();
//             bot.x = spawnPoint.x;
//             bot.y = spawnPoint.y;
//         });
//     }
//
//     /**
//      * Возвращает случайный цвет из массива цветов.
//      * @returns {string} Случайный цвет.
//      */
//     randomColor() {
//         let colorInd = Math.floor(Math.random() * colorArray.length);
//         let color = colorArray[colorInd];
//         colorArray.splice(colorInd, 1);
//
//         if (colorArray.length === 0) {
//             colorArray = ['blue', 'green', 'yellow', 'purple'];
//         }
//
//         return color;
//     }
//
//     /**
//      * Проверяет, все ли боты погибли.
//      * @returns {boolean} Все ли боты погибли.
//      * @async
//      */
//     async isAllDie() {
//         try {
//             return Object.values(this.bots).every(bot => bot.statement === false);
//         } catch (error) {
//             console.error('Ошибка проверки ботов: ' + error.message);
//         }
//     }
//
//     /**
//      * Отключает бота от игры.
//      * @param {string} botId - ID бота.
//      * @async
//      */
//     async disconnect(botId) {
//         try {
//             this.leftBots[botId] = this.bots[botId];
//             delete this.bots[botId];
//         } catch (error) {
//             console.error('Ошибка отключения: ' + error.message);
//         }
//     }
// }
//
// module.exports = BotService