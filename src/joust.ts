import { Player, EnemyHandler } from './player';
import { handleCollision } from './collision';
import { GAME_OBJECTS } from './map_object';
import { DEBUG } from './debug';

export const GAME_WIDTH = 480, GAME_HEIGHT = 480;
// Constants for readability
export const FRAME_RATE = 60;
let lastFrameTime = 0;
let lastUpdateTime = 0;

export const PLAYER_WIDTH = 13 * 2;
export const PLAYER_HEIGHT = 18 * 2;

// Frame count and lastSent data
export var frameCount = 0;

// Instantiate enemy handler
export const enemyHandler = EnemyHandler.getInstance(5);

// new UnmountedAI(100,100,PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_COLOR, null)


export function update() {
    GAME_OBJECTS.forEach(mObject => {
        if (mObject.update) mObject.update();
        if (mObject.dumbAI) mObject.dumbAI();
    });

    for (let [_, value] of GAME_OBJECTS) {
        if (value.collisionObjects) {
            value.collisionObjects = [];
        }
    }

    if (enemyHandler.enemies.length == 0&&!enemyHandler.spawningWave) {
        enemyHandler.createEnemies(5);
    }


    GAME_OBJECTS.forEach(mObject1 => {
        GAME_OBJECTS.forEach(mObject2 => {
            if (mObject1 !== mObject2 && mObject1.collider && mObject2.collider) {
                handleCollision(mObject1, mObject2, mObject1.collider, mObject2.collider);
            }
        });
    });

    lastUpdateTime = performance.now();
    setTimeout(update, 1000 / FRAME_RATE);
}

export {GAME_OBJECTS};