class Player {
    constructor(id, username, x, y, size, color, collision = true, visible = true, statement = true) {
        this._id = id;
        this._username = username;
        this._x = 0;
        this._y = 0;
        this._size = size;
        this._color = color;
        this._collision = collision;
        this._visible = visible;
        this._statement = statement;
        this._velocityX = 0;
        this._velocityY = 0;
        this._isGrounded = false;
        this._moveRight = false;
        this._moveLeft = false;
        this._lastActive = Date.now();
    }
    get id() {
        return this._id;
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

    get velocityX() {
        return this._velocityX;
    }

    get velocityY() {
        return this._velocityY;
    }

    get isGrounded() {
        return this._isGrounded;
    }

    get moveLeft() {
        return this._moveLeft;
    }

    get moveRight() {
        return this._moveRight;
    }

    get lastActive() {
        return this._lastActive;
    }

    set id(value) {
        this._id = value;
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

    set velocityX(value) {
        this._velocityX = value;
    }

    set velocityY(value) {
        this._velocityY = value;
    }

    set isGrounded(value) {
        this._isGrounded = value;
    }

    set moveLeft(value) {
        this._moveLeft = value;
    }

    set moveRight(value) {
       this._moveRight = value;
    }

    set lastActive(value) {
        this._lastActive = value;
    }

    move(dx, dy) {
        this._x += dx;
        this._y += dy;
    }

    jump(dy) {
        this._y += dy;
    }
}

module.exports = Player;
