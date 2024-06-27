// src/Entity/GameObject.js

class GameObject {
    // Конструктор класса GameObject, принимает координаты x и y, а также размер объекта
    constructor(x, y, size) {
        this.x = x; // Координата X объекта
        this.y = y; // Координата Y объекта
        this.color = 'grey';
        this.size = size; // Размер объекта
    }
}

// Экспорт класса GameObject для использования в других модулях
module.exports = GameObject;
