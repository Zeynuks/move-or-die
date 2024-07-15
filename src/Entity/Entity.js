const GRAVITY = 0.5;
class Entity {
    constructor(x, y, size, color) {
        this._x = x;
        this._y = y;
        this._size = size;
        this._color = color;
        this._vx = 0;
        this._vy = 0;
    }

    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    get size() {
        return this._size;
    }

    get color() {
        return this._color;
    }

    get vx() {
        return this._vx;
    }

    get vy() {
        return this._vy;
    }

    set x(value) {
        this._x = value;
    }

    set y(value) {
        this._y = value;
    }

    set size(value) {
        this._size = value;
    }

    set color(value) {
        this._color = value;
    }
    set vx(value) {
        this._vx = value;
    }

    set vy(value) {
        this._vy = value;
    }

    getGrid() {
        const gridX = Math.floor(this.x / 50);
        const gridY = Math.floor(this.y / 50);
        return [
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
    }

    applyPhysics() {
        this.x += this.vx;
        this.vy += GRAVITY;
        this.y += this.vy;
    }
}

module.exports = Entity;