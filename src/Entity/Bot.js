// const Entity = require('./Entity');
//
// class Bot extends Entity {
//     constructor(id, username, x, y, size, color, visible = true, statement = true) {
//         super(x, y, size, color);
//         this._id = id;
//         this._username = username;
//         this._visible = visible;
//         this._statement = statement;
//         this._health = 100;
//         this._onGround = true;
//         this._active = false;
//     }
//
//     get id() {
//         return this._id;
//     }
//
//     get username() {
//         return this._username;
//     }
//
//     get visible() {
//         return this._visible;
//     }
//
//     get statement() {
//         return this._statement;
//     }
//
//     get health() {
//         return this._health;
//     }
//
//     get onGround() {
//         return this._onGround;
//     }
//
//     get active() {
//         return this._active;
//     }
//
//     set id(value) {
//         this._id = value;
//     }
//
//     set username(value) {
//         this._username = value;
//     }
//
//     set visible(value) {
//         this._visible = value;
//     }
//
//     set statement(value) {
//         this._statement = value;
//     }
//
//     set health(value) {
//         this._health = value;
//     }
//
//     set onGround(value) {
//         this._onGround = value;
//     }
//
//     set active(value) {
//         this._active = value;
//     }
// }
//
// module.exports = Bot