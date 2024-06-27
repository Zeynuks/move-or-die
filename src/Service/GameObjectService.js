// src/Service/GameObjectService.js

const GameObject = require('../Entity/GameObject');

class GameObjectService {
    constructor() {
        this.gameObjects = [];
        this.gridSize = 20;
        this.initializeGameObjects();
    }

    initializeGameObjects() {
        // Создание сетки игровых объектов
        for (let x = 0; x < 780; x += this.gridSize) {
            this.gameObjects.push(new GameObject(x, 580, this.gridSize)); // Пол
        }
        for (let y = 0; y < 580; y += this.gridSize) {
            this.gameObjects.push(new GameObject(0, y, this.gridSize)); // Левая стена
            this.gameObjects.push(new GameObject(780, y, this.gridSize)); // Правая стена
        }
        this.gameObjects.push(new GameObject(500, 500, this.gridSize)); // Пример объекта
        this.gameObjects.push(new GameObject(520, 500, this.gridSize)); // Пример объекта
        this.gameObjects.push(new GameObject(350, 400, this.gridSize)); // Пример объекта
        this.gameObjects.push(new GameObject(370, 400, this.gridSize)); // Пример объекта
        this.gameObjects.push(new GameObject(20, 100, this.gridSize)); // Пример объекта
        this.gameObjects.push(new GameObject(40, 100, this.gridSize)); // Пример объекта
        this.gameObjects.push(new GameObject(100, 220, this.gridSize)); // Пример объекта
        this.gameObjects.push(new GameObject(120, 220, this.gridSize)); // Пример объекта
        this.gameObjects.push(new GameObject(250, 280, this.gridSize)); // Пример объекта
        this.gameObjects.push(new GameObject(270, 280, this.gridSize)); // Пример объекта
        this.gameObjects.push(new GameObject(450, 300, this.gridSize)); // Пример объекта
        this.gameObjects.push(new GameObject(470, 300, this.gridSize)); // Пример объекта
    }

    getGameObjects() {
        return this.gameObjects;
    }

    getGameObjectsGrid(gridSize) {
        const grid = [];
        this.gameObjects.forEach(obj => {
            const gridX = Math.floor(obj.x / gridSize);
            const gridY = Math.floor(obj.y / gridSize);
            if (!grid[gridY]) grid[gridY] = [];
            if (!grid[gridY][gridX]) grid[gridY][gridX] = [];
            grid[gridY][gridX].push(obj);
        });
        return grid;
    }

    updateGameObjects() {
        // Обновления для игровых объектов, если это необходимо
    }
}

module.exports = new GameObjectService();
