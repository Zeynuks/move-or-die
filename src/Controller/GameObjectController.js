const GameObject = require('../Model/GameObject');

let gameObjects = [
    new GameObject(100, 500, 200, 20),
    new GameObject(400, 400, 200, 20),
    new GameObject(300, 300, 50, 50)
];

exports.getGameObjects = () => {
    return gameObjects;
};
