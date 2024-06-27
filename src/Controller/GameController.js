// Подключаем модуль PlayerController, который отвечает за управление игроками
const playerController = require('./PlayerController');

// Подключаем модуль GameObjectController, который отвечает за управление игровыми объектами
const gameObjectController = require('./GameObjectController');

// Экспортируем функцию initialize, которая принимает объект io (сокет)
exports.initialize = (io) => {
    // Инициализируем PlayerController с использованием объекта io для сокетов
    playerController.initialize(io);
};

// Экспортируем функцию update, которая будет обновлять состояние игры
exports.update = () => {
    // Вызываем метод update у PlayerController для обновления состояния игроков
    playerController.update();
    // Вызываем метод update у GameObjectController для обновления состояния игровых объектов
    gameObjectController.updateGameObjects();
};

// Экспортируем функцию getState, которая возвращает текущее состояние игры
exports.getState = () => {
    return {
        // Получаем текущее состояние игроков из PlayerController и добавляем его в возвращаемый объект
        players: playerController.getPlayers(),
        // Получаем текущее состояние игровых объектов из GameObjectController и добавляем его в возвращаемый объект
        gameObjects: gameObjectController.getGameObjects()
    }
};
