const levelColorService = require('../Service/Level/LevelColorService');
const fallingBlocksService = require('../Service/Level/FallingBlocksService');
const bombTagService = require('../Service/Level/BombTagService');
const BaseController = require("./BaseController");
const ErrorHandler = require("../Utils/ErrorHandler");

const GAME_LENGTH = 10;

/**
 * Контроллер уровней.
 * @extends BaseController
 */
class LevelController extends BaseController {
    /**
     * Массив служб уровней, инициализируемых при создании экземпляра контроллера.
     * @type {Array<LevelService>}
     */
    LEVEL_ARRAY = [
        this.constructLevelService(levelColorService),
        this.constructLevelService(fallingBlocksService),
        this.constructLevelService(bombTagService)
    ];

    /**
     * Создает экземпляр LevelController.
     * @param {Object} io - Объект Socket.IO.
     * @param {string} roomName - Имя комнаты.
     */
    constructor(io, roomName) {
        super(io, roomName);
    }

    /**
     * Конструирует экземпляр сервиса уровня.
     * @param {Function} Service - Конструктор сервиса уровня.
     * @returns {LevelService} - Экземпляр сервиса уровня.
     */
    constructLevelService(Service) {
        if (typeof Service !== 'function') {
            throw new TypeError('Аргумент должен быть конструктором функции');
        }
        return new Service(this.io);
    }

    /**
     * Перемешивает элементы массива случайным образом.
     * @param {Array} array - Массив для перемешивания.
     * @returns {Array} - Перемешанный массив.
     */
    getRandomOrder(array) {
        if (!Array.isArray(array)) {
            throw new TypeError('Аргумент должен быть массивом');
        }
        return array.sort(() => 0.5 - Math.random());
    }

    /**
     * Получает список уровней для игры.
     * @returns {Array<LevelService>} - Список уровней для игры.
     */
    getLevelList() {
        try {
            const shuffled = this.getRandomOrder(this.LEVEL_ARRAY);
            const result = [];
            while (result.length < GAME_LENGTH) {
                result.push(...shuffled);
            }
            return result.slice(0, GAME_LENGTH);
        } catch (error) {
            ErrorHandler(this.io, this.roomName, 'Не удалось получить список уровней', error.message);
        }
    }
}

module.exports = LevelController;
