class Player {
    constructor(id) {
        this.id = id;
        this.x = Math.floor(Math.random() * 480);
        this.y = Math.floor(Math.random() * 480);
        this.size = 20;
        this.lastActive = Date.now();
    }

    move(direction) {
        if (direction === 'up') {
            this.y -= 5;
        } else if (direction === 'left') {
            this.x -= 5;
        } else if (direction === 'down') {
            this.y += 5;
        } else if (direction === 'right') {
            this.x += 5;
        }
        this.lastActive = Date.now();
    }
}

module.exports = Player;
