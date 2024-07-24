const levelColorService = require('../Service/Level/LevelColorService');
const fallingBlocksService = require('../Service/Level/FallingBlocksService');
const bombTagService = require('../Service/Level/BombTagService');
const BaseController = require("./BaseController");
const ErrorHandler = require("../Utils/ErrorHandler");

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
        levelColorService,
        fallingBlocksService,
        bombTagService
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
     * Получает список уровней для игры.
     * @returns {Array<LevelService>} - Список уровней для игры.
     */
    getLevelList(length) {
        let source = [...this.LEVEL_ARRAY];
        let result = [];
        let lastElement = null;

        while (result.length < length && source.length >= 0) {
            if (source.length === 0) {
                source = [...this.LEVEL_ARRAY];
            }
            let randomIndex = Math.floor(Math.random() * source.length);
            let element = source.splice(randomIndex, 1)[0];
            if (element === lastElement) {
                continue;
            }
            result.push(this.constructLevelService(element));
        }
        return result;
    }
}

module.exports = LevelController;
