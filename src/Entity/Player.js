// src/Entity/Player.js

const COLOR_ARRAY = ['red', 'blue', 'green', 'yellow', 'orange', 'purple'];

class Player {
    // Конструктор класса Player, принимает id игрока
    constructor(id) {
        this.id = id; // Уникальный идентификатор игрока
        this.x = Math.floor(Math.random() * 480); // Начальная координата X (случайная)
        this.y = 0; // Начальная координата Y (наверху)
        this.size = 20; // Размер игрока (например, 20 пикселей)
        this.color = COLOR_ARRAY[Math.floor(Math.random() * 6)];
        this.lastActive = Date.now(); // Время последней активности игрока
        this.velocityY = 0; // Вертикальная скорость
        this.velocityX = 0; // Горизонтальная скорость
        this.isGrounded = false; // Флаг, указывающий, находится ли игрок на земле
        this.moveLeft = false; // Флаг движения влево
        this.moveRight = false; // Флаг движения вправо
    }

    // Метод для установки направления движения игрока
    setMove(direction, moving) {
        if (direction === 'left') { // Если направление - влево
            this.moveLeft = moving;
        } else if (direction === 'right') { // Если направление - вправо
            this.moveRight = moving;
        } else if (direction === 'jump' && this.isGrounded && moving) { // Если направление - прыжок, и игрок на земле
            this.velocityY = -10; // Устанавливаем вертикальную скорость для прыжка
            this.isGrounded = false; // Игрок в прыжке
        }
        this.lastActive = Date.now(); // Обновление времени последней активности
    }

    // Метод для применения физики к игроку
    applyPhysics(gridService, gameObjectsGrid) {
        const gravity = 0.4; // Гравитация
        const friction = 0.8; // Трение
        const acceleration = 0.5; // Ускорение
        const maxSpeed = 5; // Максимальная скорость

        // Применение гравитации
        this.velocityY += gravity;
        this.y += this.velocityY;

        // Применение ускорения/замедления при движении
        if (this.moveLeft) {
            this.velocityX -= acceleration;
        }
        if (this.moveRight) {
            this.velocityX += acceleration;
        }

        // Применение трения, если игрок не движется
        if (!this.moveLeft && !this.moveRight) {
            this.velocityX *= friction;
        }

        // Ограничение максимальной скорости
        if (this.velocityX > maxSpeed) {
            this.velocityX = maxSpeed;
        }
        if (this.velocityX < -maxSpeed) {
            this.velocityX = -maxSpeed;
        }

        this.x += this.velocityX; // Обновление координаты X

        // Обновление позиции игрока в сетке игроков
        gridService.updatePlayerGrid(this);

        // Проверка коллизий с другими игроками
        this.checkPlayerCollisions(gridService);

        // Получение координат в сетке объектов
        const gridX = Math.floor(this.x / gridService.gridSize);
        const gridY = Math.floor(this.y / gridService.gridSize);

        this.isGrounded = false; // Сбрасываем флаг нахождения на земле

        // Проверка коллизий с объектами в текущей и соседних ячейках
        const cellsToCheck = [
            [gridY, gridX],
            [gridY - 1, gridX],
            [gridY + 1, gridX],
            [gridY, gridX - 1],
            [gridY, gridX + 1],
            [gridY - 1, gridX - 1],
            [gridY - 1, gridX + 1],
            [gridY + 1, gridX - 1],
            [gridY + 1, gridX + 1]
        ];

        // Проверка коллизий с объектами в указанных ячейках
        for (let [y, x] of cellsToCheck) {
            if (gameObjectsGrid[y] && gameObjectsGrid[y][x]) {
                for (let obj of gameObjectsGrid[y][x]) {
                    let collision = this.checkCollision(obj); // Проверка коллизии с объектом
                    if (collision) {
                        this.resolveCollision(obj, collision); // Разрешение коллизии
                    }
                }
            }
        }

        // Проверка коллизий со стенками игры
        if (this.x < 0) { // Левый край
            this.x = 0;
            this.velocityX = 0;
        }
        if (this.x + this.size > 780) { // Правый край
            this.x = 780 - this.size;
            this.velocityX = 0;
        }
        if (this.y < 0) { // Верхний край
            this.y = 0;
            this.velocityY = 0;
        }
        if (this.y + this.size > 580) { // Нижний край
            this.y = 580 - this.size;
            this.velocityY = 0;
            this.isGrounded = true; // Игрок на земле
        }

        this.lastActive = Date.now(); // Обновление времени последней активности
    }

    // Метод для проверки коллизий с другими игроками
    checkPlayerCollisions(gridService) {
        const gridX = Math.floor(this.x / gridService.gridSize);
        const gridY = Math.floor(this.y / gridService.gridSize);

        const cellsToCheck = [
            [gridY, gridX],
            [gridY - 1, gridX],
            [gridY + 1, gridX],
            [gridY, gridX - 1],
            [gridY, gridX + 1],
            [gridY - 1, gridX - 1],
            [gridY - 1, gridX + 1],
            [gridY + 1, gridX - 1],
            [gridY + 1, gridX + 1]
        ];

        // Проверка коллизий с другими игроками в указанных ячейках
        for (let [y, x] of cellsToCheck) {
            if (gridService.playersGrid[y] && gridService.playersGrid[y][x]) {
                for (let player of gridService.playersGrid[y][x]) {
                    if (player.id !== this.id) { // Игнорируем самого себя
                        let collision = this.checkCollision(player); // Проверка коллизии
                        if (collision) {
                            this.resolvePlayerCollision(player, collision); // Разрешение коллизии
                        }
                    }
                }
            }
        }
    }

    // Метод для проверки коллизии с объектом
    checkCollision(obj) {
        let collision = {
            left: false,
            right: false,
            top: false,
            bottom: false
        };

        // Проверка пересечения прямоугольников
        if (this.x < obj.x + obj.size && this.x + this.size > obj.x && this.y < obj.y + obj.size && this.y + this.size > obj.y) {
            collision.left = this.x + this.size > obj.x && this.x < obj.x; // Коллизия слева
            collision.right = this.x < obj.x + obj.size && this.x + this.size > obj.x + obj.size; // Коллизия справа
            collision.top = this.y + this.size > obj.y && this.y < obj.y; // Коллизия сверху
            collision.bottom = this.y < obj.y + obj.size && this.y + this.size > obj.y + obj.size; // Коллизия снизу
            return collision;
        }
        return null;
    }

    // Метод для разрешения коллизии с объектом
    resolveCollision(obj, collision) {
        if (collision.top && this.velocityY > 0) { // Коллизия сверху
            this.y = obj.y - this.size;
            this.velocityY = 0;
            this.isGrounded = true;
        } else if (collision.bottom && this.velocityY < 0) { // Коллизия снизу
            this.y = obj.y + obj.size;
            this.velocityY = 0;
        } else if (collision.left && this.velocityX > 0) { // Коллизия слева
            this.x = obj.x - this.size;
            this.velocityX = 0;
        } else if (collision.right && this.velocityX < 0) { // Коллизия справа
            this.x = obj.x + this.size;
            this.velocityX = 0;
        }
        obj.color = this.color;
    }

    // Метод для разрешения коллизии с другим игроком
    resolvePlayerCollision(player, collision) {
        if (collision.top && this.velocityY > 0) { // Коллизия сверху
            this.y = player.y - this.size;
            this.velocityY = 0;
            this.isGrounded = true;
        } else if (collision.bottom && this.velocityY < 0) { // Коллизия снизу
            this.y = player.y + player.size;
            this.velocityY = 0;
        } else if (collision.left && this.velocityX > 0) { // Коллизия слева
            this.x = player.x - this.size;
            this.velocityX = 0;
        } else if (collision.right && this.velocityX < 0) { // Коллизия справа
            this.x = player.x + player.size;
            this.velocityX = 0;
        }
    }
}

// Экспорт класса Player для использования в других модулях
module.exports = Player;
