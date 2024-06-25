class Player {
    constructor(id) {
        this.id = id;
        this.x = Math.floor(Math.random() * 480);
        this.y = 0;
        this.size = 20;
        this.width = 20; // *** ADD width & height
        this.height = 20;
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

    applyPhysics(gameObjects, allPlayers) { // *** ADD param allPlayers
        const gravity = 0.5;
        const friction = 0.8;
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

        // Проверка коллизий с объектами
        this.isGrounded = false;
        for (let obj of gameObjects) {
            let collision = this.checkCollision(obj);
            if (collision) {
                this.resolveCollision(obj, collision);
            }
        }

        // *** ADD Проверка коллизий с игроками           
        for (let player of allPlayers) {
            if (this.id !== player.id) {
                let collision = this.checkCollision(player);
                if (collision) {
                    this.resolveCollision(player, collision);
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
        if (this.y < 0) {
            this.y = 0;
            this.velocityY = 0;
        }
        if (this.y + this.size > 600) {
            this.y = 600 - this.size;
            this.velocityY = 0;
            this.isGrounded = true;
        }

        this.lastActive = Date.now();
    }

    checkCollision(obj) {
        let collision = {
            left: false,
            right: false,
            top: false,
            bottom: false
        };

        if (this.x < obj.x + obj.width && this.x + this.size > obj.x && this.y < obj.y + obj.height && this.y + this.size > obj.y) {
            collision.left = this.x + this.size > obj.x && this.x < obj.x;
            collision.right = this.x < obj.x + obj.width && this.x + this.size > obj.x + obj.width;
            collision.top = this.y + this.size > obj.y && this.y < obj.y;
            collision.bottom = this.y < obj.y + obj.height && this.y + this.size > obj.y + obj.height;
            return collision;
        }
        return null;
    }

    resolveCollision(obj, collision) {
        // Вначале проверяем вертикальные коллизии
        if (collision.top && this.velocityY > 0) {
            this.y = obj.y - this.size;
            this.velocityY = 0;
            this.isGrounded = true;
        } else if (collision.bottom && this.velocityY < 0) {
            this.y = obj.y + obj.height;
            this.velocityY = 0;
        } else if (collision.left && this.velocityX > 0) {
            this.x = obj.x - this.size;
            this.velocityX = 0;
        } else if (collision.right && this.velocityX < 0) {
            this.x = obj.x + obj.width;
            this.velocityX = 0;
        }
    }
}

module.exports = Player;
