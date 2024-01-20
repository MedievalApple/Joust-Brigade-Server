import { Vector } from "./vector";
import {
    GAME_HEIGHT,
    GAME_OBJECTS,
    GAME_WIDTH,
    PLAYER_HEIGHT,
    PLAYER_WIDTH,
} from "./joust";
import { Collider, Platform } from "./map_object";
import { OffsetHitbox, ICollisionObject, isColliding } from "./collision";
import { constrain } from "./utils";
import { Direction } from "./enums";
import { v4 as uuidv4 } from "uuid";
import { connectedClients, io } from ".";

export class Player {
    private _dead: boolean = false;
    name: string;
    velocity: Vector = new Vector(0, 0);
    size: Vector;
    gravity: number = 0.05;
    friction: number = 0.4;
    xAccel: number = 0;
    maxSpeed: Vector = new Vector(3, 5);
    direction: Direction = Direction.Right;
    isJumping: boolean = false;
    position: Vector;
    oldSize: Vector = new Vector();
    collider: Collider;
    lance: Collider;
    head: Collider;
    collisionObjects: Array<ICollisionObject> = [];
    jumpDebounce: boolean;
    id: string = uuidv4();

    constructor(
        x: number,
        y: number,
        width: number,
        height: number,
        name: string
    ) {
        this.position = new Vector(x, y);
        this.size = new Vector(width, height);
        this.name = name;

        this.collider = new Collider();
        this.collider.hitbox = new OffsetHitbox(new Vector(), this.size);

        this.lance = new Collider();
        this.lance.hitbox = new OffsetHitbox(
            new Vector(14, 6),
            new Vector(12, 6)
        );

        this.head = new Collider();
        this.head.hitbox = new OffsetHitbox(
            new Vector(4, 0),
            new Vector(18, 6)
        );

        this.updateCollider(this.position);
        GAME_OBJECTS.set(this.id, this);
    }

    updateCollider(vector: Vector) {
        if (this.collider) this.collider.position = vector;

        if (this.lance) {
            this.lance.position = vector;

            if (this.velocity.x < 0 && !this.isJumping) {
            } else {
                this.lance.hitbox.offset = new Vector(14, 6);
            }
        }

        if (this.head) this.head.position = vector;
    }

    // Torroidal collision detection
    handleCollisions() {
        if (this.position.x - 1 > GAME_WIDTH) {
            this.position.x = 1;
        } else if (this.position.x < 1) {
            this.position.x = GAME_WIDTH - 1;
        }
    }

    update() {
        this.updateCollider(this.position);
        this.velocity.y += this.gravity;
        this.velocity.x += this.xAccel;

        if (Math.abs(this.velocity.x) > this.maxSpeed.x) {
            this.velocity.x = this.maxSpeed.x * Math.sign(this.velocity.x);
        } else if (
            Math.sign(this.velocity.x) == Math.sign(this.xAccel) &&
            Math.abs(this.velocity.x) < 0.5
        ) {
            // draw sprite in direction player was going
            this.velocity.x = 0;
            this.xAccel = 0;
        }

        this.position.y += this.velocity.y;
        this.position.x += this.velocity.x;

        this.handleCollisions();
        if (this.position.y < -10 || this.position.y + 10 > GAME_HEIGHT) {
            this.position = new Vector(Math.random() * GAME_WIDTH, 50);
        }
    }

    set dead(value: boolean) {
        this._dead = value;

        if (this._dead) {
            if (this.constructor.name == "Player") {
                this.position = new Vector(200, 310);
                this.dead = false;
            } else {
                // Delete enemy from GAME_OBJECTS
                // GAME_OBJECTS.splice(GAME_OBJECTS.indexOf(this), 1);
                for (let existingUser of connectedClients) {
                    if (existingUser.username !== '') {
                        existingUser.socket.emit('playerLeft', this.id);
                    }
                }
                GAME_OBJECTS.delete(this.id);
            }
        }
    }

    get dead(): boolean {
        return this._dead;
    }
}
export class EnemyHandler {
    private static singleton: EnemyHandler;
    private _enemies: Enemy[] = [];

    spawningWave: boolean = false;

    private constructor(startingEnemies: number = 0) {
        this.spawningWave = true;
    }

    public static getInstance(number?: number): EnemyHandler {
        if (!EnemyHandler.singleton) {
            EnemyHandler.singleton = new EnemyHandler(number);
        }
        return EnemyHandler.singleton;
    }

    createEnemy(number: number = 1) {
        console.log("creating enemy")
        let alreadySpawned = number;
        for (let i = 0; i < number; i++) {
            // var spawnablesSpots = filter((object) => {
            //     return object instanceof Platform && object.spawner;
            // });

            let spawnablesSpots: Platform[] = [];

            for (let [_, value] of GAME_OBJECTS) {
                if (value instanceof Platform && value.spawner) {
                    spawnablesSpots.push(value);
                }
            }

            for (let i = spawnablesSpots.length - 1; i >= 0; i--) {
                for (var enemy of this.enemies) {
                    if (
                        isColliding(enemy.collider, spawnablesSpots[i].spawner)
                    ) {
                        spawnablesSpots.splice(i, 1);
                        break;
                    }
                }
            }

            let spot =
                spawnablesSpots[
                Math.floor(Math.random() * spawnablesSpots.length)
                ];
            if (spawnablesSpots.length == 0) break;
            const newEnemy = new Enemy(
                spot.spawner.collisionX + PLAYER_WIDTH,
                spot.spawner.collisionY + PLAYER_HEIGHT,
                PLAYER_WIDTH,
                PLAYER_HEIGHT,
                "green"
            )
            alreadySpawned--
            this.enemies.push(newEnemy);
            io.in("players").emit("enemyJoined", newEnemy.id, newEnemy.name);
        }
        if (alreadySpawned > 0) {
            setTimeout(() => this.createEnemy(alreadySpawned), 1000);
        } else {
            this.spawningWave = false;
        }
    }

    set enemies(enemies: Enemy[]) {
        this._enemies = enemies;
    }

    get enemies(): Enemy[] {
        // remove dead enemies
        this._enemies = this._enemies.filter((enemy) => !enemy.dead);
        return this._enemies;
    }
}

var counter = 0;

export class Enemy extends Player {
    debugColor: string = "white";

    constructor(
        x: number,
        y: number,
        width: number,
        height: number,
        color: string,
    ) {
        super(x, y, width, height, color);
        this.name = `Enemy ${++counter}`;

        switch (Math.floor(Math.random() * 2)) {
            case 0:
                if (this.velocity.x == 0) {
                    this.velocity.x = 1;
                    this.xAccel = 0.05;
                } else {
                    this.xAccel = 0.07;
                }
                break;
            case 1:
                this.direction = Direction.Left;
                if (Math.abs(this.velocity.x) == 0) {
                    this.velocity.x = -1;
                    this.velocity.x = -0.05;
                } else {
                    this.xAccel = -0.07;
                }
                break;
            default:
                break;
        }
    }
    sendData() {
        for (let existingUser of connectedClients) {
            existingUser.socket.emit('playerMoved', this.id, this.position.x, this.position.y, this.velocity.x, this.velocity.y, this.xAccel, this.isJumping);
        }
    }
    dumbAI() {
        this.sendData();
        let closestPlayer = null
        let smallestDistance = GAME_WIDTH * GAME_HEIGHT;
        for (var [_, object] of GAME_OBJECTS) {
            if (object.constructor == Player) {
                // @ts-ignore
                let distance = (this.position.clone().sub(object.position)).mag();
                if (distance < smallestDistance) {
                    smallestDistance = distance;
                    closestPlayer = object;
                }
            }
        }
        if (Math.random() < 0.1) {
            if (closestPlayer && this.position.y > closestPlayer.position.y) {
                this.isJumping = true;
                this.velocity.y = constrain(this.velocity.y - 2, -2, 2);
            } else {
                if (Math.random() < 0.1) {
                    this.isJumping = true;
                    this.velocity.y = constrain(this.velocity.y - 2, -2, 2);
                }
            }
        }
        switch (this.velocity.x > 0) {
            case true:
                this.direction = Direction.Right;
                if (Math.abs(this.velocity.x) == 0) {
                    this.velocity.x = 1;
                    this.xAccel = 0.05;
                } else {
                    this.xAccel = 0.07;
                }
                break;
            case false:
                this.direction = Direction.Left;
                if (Math.abs(this.velocity.x) == 0) {
                    this.velocity.x = -1;
                    this.xAccel = -0.05;
                } else {
                    this.xAccel = -0.07;
                }
                for (let existingUser of connectedClients) {
                    existingUser.socket.emit('playerMoved', this.id, this.position.x, this.position.y, this.velocity.x, this.velocity.y, this.xAccel, this.isJumping);
                }
                break;
            default:
                break;
        }
    }
}
