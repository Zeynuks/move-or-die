class CollisionService {
    checkCollisionWithWalls(player) {
        // Ограничение игрового поля
        if (player.x < 0) player.x = 0;
        if (player.x > 800) player.x = 800; // предположим, что ширина поля 800
        if (player.y < 0) player.y = 0;
        if (player.y > 400) player.y = 400; // предположим, что высота поля 400
    }
}

module.exports = CollisionService;
