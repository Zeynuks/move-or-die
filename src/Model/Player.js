const gameObjects = [
    { x: 100, y: 500, width: 200, height: 20 },
    { x: 400, y: 400, width: 200, height: 20 },
    { x: 300, y: 300, width: 50, height: 50 }
];

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
        this.jumpStartTime = 0;
        this.isJumping = false;
    }

    setMove(direction, moving) {
        const maxJumpPower = 10;
        const maxJumpDuration = 200; // максимальное время нажатия для прыжка в миллисекундах

        if (direction === 'left') {
            this.moveLeft = moving;
        } else if (direction === 'right') {
            this.moveRight = moving;
        } else if (direction === 'jump') {
            if (moving && this.isGrounded && !this.isJumping) {
                this.jumpStartTime = Date.now();
                this.velocityY = -maxJumpPower; // стартовый прыжок
                this.isGrounded = false;
                this.isJumping = true;
            } else if (!moving && this.isJumping) {
                const jumpDuration = Date.now() - this.jumpStartTime;
                if (jumpDuration < maxJumpDuration) {
                    const jumpPower = maxJumpPower * (jumpDuration / maxJumpDuration);
                    this.velocityY = -jumpPower;
                }
                this.isJumping = false;
            }
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

        // Проверка коллизий с объектами
        for (let obj of gameObjects) {
            if (this.x < obj.x + obj.width &&
                this.x + this.size > obj.x &&
                this.y < obj.y + obj.height &&
                this.y + this.size > obj.y) {

                // Коллизия сверху
                if (this.y + this.size > obj.y && this.y + this.size < obj.y + this.velocityY) {
                    this.y = obj.y - this.size;
                    this.velocityY = 0;
                    this.isGrounded = true;
                }

                // Коллизия снизу
                if (this.y < obj.y + obj.height && this.y > obj.y + obj.height + this.velocityY) {
                    this.y = obj.y + obj.height;
                    this.velocityY = 0;
                }

                // Коллизия слева
                if (this.x + this.size > obj.x && this.x + this.size < obj.x + this.velocityX) {
                    this.x = obj.x - this.size;
                    this.velocityX = 0;
                }

                // Коллизия справа
                if (this.x < obj.x + obj.width && this.x > obj.x + obj.width + this.velocityX) {
                    this.x = obj.x + obj.width;
                    this.velocityX = 0;
                }
            }
        }

        // Проверка коллизий со стенками игры
        if (this.x < 0) {
            this.x = 0;
            this.velocityX = 0;
        }
        if (this.x + this.size > 800) {
            this.x = 800 - this.size;
            this.velocityX = 0;
        }

        this.lastActive = Date.now();
    }
}

module.exports = Player;
