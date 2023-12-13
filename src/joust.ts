import { Player, EnemyHandler } from './player';
import { handleCollision } from './collision';
import { InputHandler } from './controls';
import { GAME_OBJECTS } from './map_object';
import { UnmountedAI } from './death';
import { DEBUG } from './debug';
import "./clientHandler";


// Canvas and context initialization
const canvas = <HTMLCanvasElement>document.getElementById("canvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

// Constants for readability
export const FRAME_RATE = 60;
let lastFrameTime = 0;
let lastUpdateTime = 0;

export const PLAYER_WIDTH = 13 * 2;
export const PLAYER_HEIGHT = 18 * 2;
const PLAYER_COLOR = "red";
export const PLAYER_USERNAME = localStorage.getItem("username");

// Frame count and lastSent data
export var frameCount = 0;

// Player creation
const player = new Player(50, 310, PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_COLOR, PLAYER_USERNAME);

// Instantiate enemy handler
export const enemyHandler = EnemyHandler.getInstance(5);

// new UnmountedAI(100,100,PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_COLOR, null)

// REMEMBER TO FIX DIFFERENCE BETWEEN UPPERCASE/LOWERCASE
new InputHandler({
    "a": {
        keydown: player.handleLeft.bind(player)
    },
    "d": {
        keydown: player.handleRight.bind(player)
    },
    "w": {
        keydown: player.jumpKeyDown.bind(player),
        keyup: player.jumpKeyUp.bind(player)
    },
    // "ArrowLeft": {
    //     keydown: enemyHandler.createEnemy.bind(enemyHandler)
    // }
})

// Game loop
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    GAME_OBJECTS.forEach(mObject => {
        if (mObject.show) {
            mObject.show();
        }
    });

    if (DEBUG) {
        // Draw fps
        ctx.font = "10px Arial";
        ctx.fillStyle = "white";
        ctx.fillText(`FPS: ${Math.round(1000 / (performance.now() - lastFrameTime))}`, 10, 20);

        // Draw delta
        ctx.fillText(`Delta: ${Math.round(performance.now() - lastUpdateTime)}ms`, 10, 40);
    }

    // position 91 + 32, 388 + 12
    // size 112, 16
    // text: "10,000"
    // color: "blue"
    // make sure to fit the text in the box

    lastFrameTime = performance.now();
    frameCount++;
    requestAnimationFrame(draw);
};

function update() {
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
        enemyHandler.createEnemy(5);
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

requestAnimationFrame(draw);
update();

export { ctx, GAME_OBJECTS, canvas, player };