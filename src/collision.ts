import ts = require("typescript");
import { connectedClients, io } from ".";
import { GAME_OBJECTS, enemyHandler } from "./joust";
import { Enemy, Player } from "./player";
import { Vector } from "./vector";
import { advancedLog } from "./utils";
import { Platform, IGameObject } from "./map_object";

// export interface ICollisionObject {
//     position: Vector;
//     velocity: Vector;
//     isJumping?: boolean;
//     static?: boolean;
//     collisionObjects?: Array<ICollisionObject>;
//     updateCollider?: (vector: Vector) => void;
// }

export interface IHitbox {
    offset: Vector;
    size: Vector;
}

export class OffsetHitbox implements IHitbox {
    offset: Vector;
    size: Vector;

    constructor(offset: Vector, size: Vector) {
        this.offset = offset;
        this.size = size;
    }
}

export class CircleHitbox implements IHitbox {
    offset: Vector;
    size: Vector;

    constructor(offset: Vector, size: Vector) {
        this.offset = offset;
        this.size = size;
    }
}

export class Collider {
    position: Vector = new Vector();
    hitbox: IHitbox;
    friction: number;

    constructor(friction: number = 0.6) {
        this.friction = friction;
    }

    get collisionX() {
        return this.position.x + this.hitbox.offset.x;
    }

    get collisionY() {
        return this.position.y + this.hitbox.offset.y;
    }

    get collisionSize() {
        return this.hitbox.size;
    }
}

export function isColliding(collider1: Collider, collider2: Collider) {
    const overlapX = Math.min(
        collider1.collisionX + collider1.collisionSize.x - collider2.collisionX,
        collider2.collisionX + collider2.collisionSize.x - collider1.collisionX
    );

    const overlapY = Math.min(
        collider1.collisionY + collider1.collisionSize.y - collider2.collisionY,
        collider2.collisionY + collider2.collisionSize.y - collider1.collisionY
    );
    return (overlapX >= 0 && overlapY >= 0);
}

export function handleCollision(
    gameObject1: Player | Enemy | Platform,
    gameObject2: Player | Enemy | Platform,
    collider1: Collider,
    collider2: Collider
) {
    // if(gameObject1.constructor == Player){
    //     console.log("Player Collides")
    // }
    if ((gameObject1.velocity.x == 0 && gameObject1.velocity.y == 0 && gameObject2.velocity.x == 0 && gameObject2.velocity.y == 0)) return;
    // No need to checkx if they're overlapping, and then calculate the overlap
    // you can calculate overlap first and then check if it's 0 on both overlapX and overlapY
    // to determine collision

    // Bonus:
    // Alternatively, you can take a 2 phase approach to collision, a broad phase and a narrow phase
    // quickly determine if two objects are not likely to collide (small size and far away), and then
    // skip collision checking for those altogether
    // Calculate the overlap on each axis
    const overlapX = Math.min(
        collider1.collisionX + collider1.collisionSize.x - collider2.collisionX,
        collider2.collisionX + collider2.collisionSize.x - collider1.collisionX
    );

    const overlapY = Math.min(
        collider1.collisionY + collider1.collisionSize.y - collider2.collisionY,
        collider2.collisionY + collider2.collisionSize.y - collider1.collisionY
    );

    if (overlapX > 0 && overlapY > 0) {
        // if checking player vs enemy, A-B, B-A
        if (gameObject1.constructor == Player && gameObject2.constructor == Enemy || gameObject1.constructor == Enemy && gameObject2.constructor == Player) {
            // Check which object is the higher one
            let higherObject: IGameObject;
            let lowerObject: IGameObject;

            // if distance is greater than 5 px, then it's a hit, otherwise ignore
            if (Math.abs(collider1.position.y - collider2.position.y) > 10) {
                advancedLog(`Player ${gameObject1.id} hit enemy ${gameObject2.id}`, "red")

                if (collider1.position.y < collider2.position.y) {
                    higherObject = gameObject1;
                    lowerObject = gameObject2;

                    // get the player that is higher
                    advancedLog("Player " + gameObject1.name + " scored");
                    let player = connectedClients.get(gameObject1.id);
                    if (player && player.constructor == Player) {
                        // @ts-ignore
                        player.score++;
                    }
                } else {
                    higherObject = gameObject2;
                    lowerObject = gameObject1;

                    // get the player that is higher
                    advancedLog("Player " + gameObject2.name + " scored");
                    let player = connectedClients.get(gameObject2.id);
                    if (player && player.constructor == Player) {
                        // @ts-ignore
                        player.score++;
                    }
                }

                // Kill the lower object
                if (lowerObject.constructor == Player) {
                    // (lowerObject as Player).dead = true;
                    // console.log("Player died");
                } else {
                    (lowerObject as Enemy).dead = true;
                    console.log("Enemy died");
                }``

                return;
            }
            // emit flip to all players involved in this collision
            if (gameObject1.constructor == Player) {
                io.in("players").emit("flip", gameObject1.id)
            }
            if (gameObject2.constructor == Player) {
                io.in("players").emit("flip", gameObject2.id)
            }

        }

        // Determine which axis has the smallest overlap (penetration)
        if (overlapX < overlapY) {
            // Resolve the collision on the X-axis
            const sign = Math.sign(gameObject1.velocity.x - gameObject2.velocity.x);
            if (!(gameObject1 instanceof Platform)) {
                gameObject1.position.x -= overlapX * sign;
                gameObject1.velocity.x *= -collider1.friction;
                if (gameObject1.updateCollider) {
                    gameObject1.updateCollider(gameObject1.position);
                }
            }
            if (!(gameObject2 instanceof Platform)) {
                gameObject2.position.x -= -overlapX * sign;
                gameObject2.velocity.x *= -collider2.friction;
                if (gameObject2.updateCollider) {
                    gameObject2.updateCollider(gameObject2.position);
                }
            }
        } else {
            // Resolve the collision on the Y-axis
            const sign = Math.sign(gameObject1.velocity.y - gameObject2.velocity.y);
            if (sign < 0 && gameObject1 instanceof Player && gameObject2 instanceof Player) {
                gameObject2.isJumping = false;
                gameObject1.isJumping = false;
            }
            if (!(gameObject1 instanceof Platform)) {
                gameObject1.position.y -= overlapY * sign;
                gameObject1.velocity.y *= -collider1.friction;
                if (gameObject1.updateCollider) {
                    gameObject1.updateCollider(gameObject1.position);
                }
            }
            if (!(gameObject2 instanceof Platform)) {
                gameObject2.position.y -= -overlapY * sign;
                gameObject2.velocity.y *= -collider2.friction;
                if (gameObject2.updateCollider) {
                    gameObject2.updateCollider(gameObject2.position);
                }
            }
        }
        if (gameObject1 instanceof Player && gameObject2 instanceof Enemy) {
            connectedClients
        }
    }

}