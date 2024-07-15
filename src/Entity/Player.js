class Player {
    constructor(ip, username, x, y, size, color = 'grey', collision = true, visible = true, statement = true) {
        this._ip = ip;
        this._username = username;
        this._x = x;
        this._y = y;
        this._size = size;
        this._color = color;
        this._collision = collision;
        this._visible = visible;
        this._statement = statement;
        this._health = 100;
        this._vx = 0;
        this._onGround = true;
        this._vy = 0;
        this._isCarrier = false;
    }

    get ip() {
        return this._ip;
    }

    get username() {
        return this._username;
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

    get collision() {
        return this._collision;
    }

    get visible() {
        return this._visible;
    }

    get statement() {
        return this._statement;
    }

    get health() {
        return this._health;
    }

    get vx() {
        return this._vx;
    }

    get onGround() {
        return this._onGround;
    }

    get vy() {
        return this._vy;
    }

    get isCarrier() {
        return this._isCarrier;
    }

    set ip(value) {
        this._ip = value;
    }

    set username(value) {
        this._username = value;
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

    set collision(value) {
        this._collision = value;
    }

    set visible(value) {
        this._visible = value;
    }

    set statement(value) {
        this._statement = value;
    }

    set health(value) {
        this._health = value;
    }

    set vx(value) {
        this._vx = value;
    }

    set onGround(value) {
        this._onGround = value;
    }

    set vy(value) {
        this._vy = value;
    }

    set isCarrier(value) {
        this._isCarrier = value;
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
}

module.exports = Player;
