// const BaseController = require("./BaseController");
//
// /**
//  * Контроллер для управления ботами.
//  * @class BotController
//  */
// class BotController extends BaseController {
//     /**
//      * Конструктор для инициализации контроллера.
//      * @param {Object} io - ИО сервера.
//      * @param {string} roomName - Имя комнаты.
//      * @param {Object} services - Сервисы для управления игрой.
//      */
//     constructor(io, roomName, services) {
//         super(io, roomName);
//         this.io = io;
//         this.roomName = roomName;
//         this.botService = services.botService;
//     }
//
//     /**
//      * Добавляет бота в игру.
//      * @param {string} botId - ID бота.
//      * @param {string} userName - Имя бота.
//      * @async
//      */
//     async addBotToGame(botId, userName) {
//         try {
//             // Отправляет событие о добавлении бота в комнату
//             this.io.in(this.roomName).emit('newBot', { botId, userName });
//             // Добавляет бота в игру
//             await this.botService.addBotToGame(this.roomName, userName, botId);
//         } catch (err) {
//             // Отправляет ошибку в комнату
//             this.io.in(this.roomName).emit('error', 'Ошибка подключения бота');
//         }
//     }
//
//     /**
//      * Обрабатывает движение бота.
//      * @param {string} botId - ID бота.
//      * @param {Object} moveData - Данные о движении бота.
//      * @async
//      */
//     // async handleMoveBot(botId, moveData) {
//     //     try {
//     //         // Обрабатывает движение бота
//     //         await this.botService.handleMoveBot(botId, moveData);
//     //     } catch (err) {
//     //         // Отправляет ошибку в комнату
//     //         this.io
//     //