import { Vector } from "./vector";
import { Enemy, Player } from "./player";
import { DEBUG } from "./debug";
import { Collider, OffsetHitbox } from "./collision";
import { PLAYER_HEIGHT, PLAYER_WIDTH } from "./joust";
import { v4 as uuidv4 } from "uuid";

// interface IGameObject {
//     position: Vector;
//     velocity: Vector;
//     collider: Collider;
//     id: string;
//     update?: () => void;
//     show?: () => void;
//     dumbAI?: () => void;
//     dead?: boolean;
//     collisionObjects?: Array<ICollisionObject>;
//     spawner?: Collider;
// }

export type IGameObject = Player | Enemy | Platform;

const GAME_OBJECTS: Map<string, IGameObject> = new Map();
export class MapObject {
    position: Vector;
    velocity: Vector;
    size: Vector;
    collider: Collider;
    static: boolean = true;
    id: string = uuidv4();

    constructor(x: number, y: number, w: number, h: number, collider: Collider) {
        this.position = new Vector(x, y);
        this.velocity = new Vector(0, 0);
        this.size = new Vector(w, h);
        this.collider = collider;
        this.collider.position = this.position;
        this.collider.hitbox = new OffsetHitbox(new Vector(), this.size);
    }
}

export class Platform extends MapObject {
    spawner: Collider;
    constructor(x: number, y: number, w: number, h: number, collider: Collider, spawnerX?: number) {
        super(x, y, w, h, collider);
        this.static = true;
        if (spawnerX) {
            this.spawner = new Collider();
            this.spawner.position = this.position.clone();
            this.spawner.position.x += spawnerX;
            this.spawner.hitbox = new OffsetHitbox(new Vector(0, -PLAYER_HEIGHT), new Vector(PLAYER_WIDTH, PLAYER_HEIGHT));
        }
    }
}

export function addObjects(objects: Array<IGameObject>) {
    for (let object of objects) {
        // GAME_OBJECTS.push(object);
        GAME_OBJECTS.set(object.id, object);
    }
}
// export function filter(predicate: (value: IGameObject, index: number, array: IGameObject[]) => unknown) {
//     return GAME_OBJECTS.filter(predicate);
// }

export { Collider, GAME_OBJECTS };
