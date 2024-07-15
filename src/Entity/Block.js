class Block {
    constructor(x, y, size, skin = 'default.png', collision = true, visible = true) {
        this._x = x;
        this._y = y;
        this._size = size;
        this._color = 'grey';
        this._skin = skin;
        this._collision = collision;
        this._visible = visible;
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

    get skin() {
        return this._skin;
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

    set x (value) {
        this._x = value;
    }

    set y (value) {
        this._y = value;
    }

    set size(value) {
        this._size = value;
    }

    set skin(value) {
        this._skin = value;
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
}

module.exports = Block;
