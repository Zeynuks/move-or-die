/**
 * @type {{[Color.BLUE]: {spriteRunRight: string}}}
 */
const imagesPathsByColor = {
    [Color.BLUE]: {
        spriteRunRight: '../images/spriteRunRightBlue.png',
        spriteRunLeft: '../images/spriteRunLeftBlue.png',
        spriteJump: '../images/spriteJumpBlue.png',
        spriteStatic: '../images/character_blue.png',
    },
    [Color.GREEN]: {
        spriteRunRight: '../images/spriteRunRightGreen.png',
        spriteRunLeft: '../images/spriteRunLeftGreen.png',
        spriteJump: '../images/spriteJumpGreen.png',
        spriteStatic: '../images/character_green.png',
    },
    [Color.YELLOW]: {
        spriteRunRight: '../images/spriteRunRightYellow.png',
        spriteRunLeft: '../images/spriteRunLeftYellow.png',
        spriteJump: '../images/spriteJumpYellow.png',
        spriteStatic: '../images/character_yellow.png',
    },
    [Color.PURPLE]: {
        spriteRunRight: '../images/spriteRunRightRed.png',
        spriteRunLeft: '../images/spriteRunLeftRed.png',
        spriteJump: '../images/spriteJumpRed.png',
        spriteStatic: '../images/character_red.png',
    },
}

/**
 * @param {!Color} color
 * @return {!Sprite}
 */
function createSpriteRunRight(color) {
    const sprite =  {
        image: new Image(),
        frames: 7,
    }

    sprite.image.src = imagesPathsByColor[color].spriteRunRight;

    return sprite;
}

/**
 * @param {!Color} color
 * @return {!Sprite}
 */
function createSpriteRunLeft(color) {
    const sprite = {
        image: new Image(),
        frames: 7,
    }

    sprite.image.src = imagesPathsByColor[color].spriteRunLeft;

    return sprite;
}

/**
 * @param {!Color} color
 * @return {!Sprite}
 */
function createSpriteJump(color) {
    const sprite = {
        image: new Image(),
        frames: 2,
    }

    sprite.image.src = imagesPathsByColor[color].spriteJump;

    return sprite;
}

/**
 * @param {!Color} color
 * @return {!Sprite}
 */
function createSpriteStatic(color) {
    const sprite = {
        image: new Image(),
        frames: 4,
    }

    sprite.image.src = imagesPathsByColor[color].spriteStatic;

    return sprite;
}

/**
 * @param {!Color} color
 * @return {!{
 *     spriteRunRight: Sprite,
 *     spriteRunLeft: Sprite,
 *     spriteJump: Sprite,
 *     spriteStatic: Sprite,
 * }}
 */
function createPlayerImages(color) {
    return {
        spriteRunRight: createSpriteRunRight(color),
        spriteRunLeft: createSpriteRunLeft(color),
        spriteJump: createSpriteJump(color),
        spriteStatic: createSpriteStatic(color),
    }
}