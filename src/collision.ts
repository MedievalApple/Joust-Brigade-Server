import { connectedClients } from ".";
import { Enemy, Player } from "./player";
import { Vector } from "./vector";

export interface ICollisionObject {
    position: Vector;
    velocity: Vector;
    isJumping?: boolean;
    static?: boolean;
    collisionObjects?: Array<ICollisionObject>;
    updateCollider?: (vector: Vector) => void;
}

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
    return overlapX >= 0 && overlapY >= 0;
}

export function handleCollision(
    gameObject1: ICollisionObject,
    gameObject2: ICollisionObject,
    collider1: Collider,
    collider2: Collider
) {
    if (
        gameObject1.velocity.x == 0 &&
        gameObject1.velocity.y == 0 &&
        gameObject2.velocity.x == 0 &&
        gameObject2.velocity.y == 0
    ) {
        return;
    }

    const overlapX = Math.min(
        collider1.collisionX + collider1.collisionSize.x - collider2.collisionX,
        collider2.collisionX + collider2.collisionSize.x - collider1.collisionX
    );

    const overlapY = Math.min(
        collider1.collisionY + collider1.collisionSize.y - collider2.collisionY,
        collider2.collisionY + collider2.collisionSize.y - collider1.collisionY
    );

    if (overlapX > 0 && overlapY > 0) {
        if (gameObject1.collisionObjects) {
            gameObject1.collisionObjects.push(gameObject2);
        }

        if (gameObject2.collisionObjects) {
            gameObject2.collisionObjects.push(gameObject1);
        }

        // if checking player vs enemy, A-B, B-A
        if (
            (gameObject1.constructor == Player &&
                gameObject2.constructor == Enemy) ||
            (gameObject1.constructor == Enemy &&
                gameObject2.constructor == Player)
        ) {
            // Check which object is the higher one
            let higherObject: ICollisionObject;
            let lowerObject: ICollisionObject;

            // if distance is greater than 5 px, then it's a hit, otherwise ignore
            if (Math.abs(collider1.position.y - collider2.position.y) > 5) {
                if (collider1.position.y < collider2.position.y) {
                    higherObject = gameObject1;
                    lowerObject = gameObject2;
                } else {
                    higherObject = gameObject2;
                    lowerObject = gameObject1;
                }

                // Kill the lower object
                if (lowerObject.constructor == Player) {
                    (lowerObject as Player).dead = true;
                } else {
                    (lowerObject as Enemy).dead = true;
                }

                return;
            }
        }

        // Determine which axis has the smallest overlap (penetration)
        if (overlapX < overlapY) {
            // Resolve the collision on the X-axis
            const sign = Math.sign(
                gameObject1.velocity.x - gameObject2.velocity.x
            );
            if (!gameObject1.static) {
                gameObject1.position.x -= overlapX * sign;
                gameObject1.velocity.x *= -collider1.friction;
                if (gameObject1.updateCollider) {
                    gameObject1.updateCollider(gameObject1.position);
                }
            }
            if (!gameObject2.static) {
                gameObject2.position.x -= -overlapX * sign;
                gameObject2.velocity.x *= -collider2.friction;
                if (gameObject2.updateCollider) {
                    gameObject2.updateCollider(gameObject2.position);
                }
            }
        } else {
            // Resolve the collision on the Y-axis
            const sign = Math.sign(
                gameObject1.velocity.y - gameObject2.velocity.y
            );
            if (sign < 0) {
                gameObject2.isJumping = false;
                gameObject1.isJumping = false;
            }
            if (!gameObject1.static) {
                gameObject1.position.y -= overlapY * sign;
                gameObject1.velocity.y *= -collider1.friction;
                if (gameObject1.updateCollider) {
                    gameObject1.updateCollider(gameObject1.position);
                }
            }
            if (!gameObject2.static) {
                gameObject2.position.y -= -overlapY * sign;
                gameObject2.velocity.y *= -collider2.friction;
                if (gameObject2.updateCollider) {
                    gameObject2.updateCollider(gameObject2.position);
                }
            }
        }
        if (gameObject1 instanceof Player && gameObject2 instanceof Enemy) {
            connectedClients;
        }
    }
}
