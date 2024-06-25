class Player {
    constructor(id) {
        this.id = id;
        this.x = Math.floor(Math.random() * 480);
        this.y = 0;
        this.size = 20;
        this.lastActive = Date.now();
        this.velocityY = 0;
        this.velocityX = 0;
        this.isGrounded = false;
        this.moveLeft = false;
        this.moveRight = false;
    }

    setMove(direction, moving) {
        if (direction === 'left') {
            this.moveLeft = moving;
        } else if (direction === 'right') {
            this.moveRight = moving;
        } else if (direction === 'jump' && this.isGrounded && moving) {
            this.velocityY = -10; // прыжок
            this.isGrounded = false;
        }
        this.lastActive = Date.now();
    }

    applyPhysics() {
        const gravity = 0.5;
        const friction = 0.9;
        const acceleration = 0.5;
        const maxSpeed = 5;

        // Применение гравитации
        this.velocityY += gravity;
        this.y += this.velocityY;

        // Применение ускорения/замедления
        if (this.moveLeft) {
            this.velocityX -= acceleration;
        }
        if (this.moveRight) {
            this.velocityX += acceleration;
        }

        // Применение трения
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

        this.x += this.velocityX;

        // Проверка на касание земли или платформ
        if (this.y >= 580) { // Земля
            this.y = 580;
            this.velocityY = 0;
            this.isGrounded = true;
        }

        // TODO: Проверка столкновения с объектами

        this.lastActive = Date.now();
    }
}

module.exports = Player;
