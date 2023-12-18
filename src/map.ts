import { Platform, addObjects } from "./map_object";
import { Vector } from "./vector";
import { Collider } from "./collision";
import { advancedLog } from "./utils";
import { GAME_WIDTH } from "./joust";

// light green: 
advancedLog("Map loaded", "#32a852", "🗺️");

export function createMap() {
    // Platforms
    addObjects([
        new Platform(0, -100, GAME_WIDTH, 100, new Collider()), //0
        new Platform(0, 72, 49, 15, new Collider()), //1
        new Platform(132, 99, 143, 22, new Collider(), 40), //2
        new Platform(403, 73, 74, 12, new Collider()), //3
        new Platform(0, 225, 100, 17, new Collider(), 25), //4
        new Platform(165, 282, 103, 17, new Collider()), //5
        new Platform(321, 205, 94, 25, new Collider(), 44), //6
        new Platform(409, 225, 71, 15, new Collider()), //7
        new Platform(-10, 388, GAME_WIDTH + 10, 100, new Collider(), 217), // Ground
        new Platform(91, 388, 298, 60, new Collider()), //8
    ]);
}
// new Block(79, 388, 303, 100, null); //8