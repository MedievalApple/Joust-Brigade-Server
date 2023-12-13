import { Platform, addObjects } from "./map_object";
import { canvas, ctx } from "./joust";
import { ColorSprite, ImgSprite } from "./sprite";
import { Vector } from "./vector";
import { Collider } from "./collision";
import { advancedLog } from "./utils";

// light green: 
advancedLog("Map loaded", "#32a852", "🗺️");

const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
gradient.addColorStop(0, 'rgba(231, 106, 135, 1)');
gradient.addColorStop(1, `rgba(201, 171, 24, 1)`);

// Platforms
addObjects([
    new Platform(0, -100, canvas.width, 100, new Collider(), new ColorSprite(new Vector(100, 100), gradient)), //0
    new Platform(0, 72, 49, 15, new Collider(), new ImgSprite("/assets/sprite_sheet/map/platform_1.png")), //1
    new Platform(132, 99, 143, 22, new Collider(), new ImgSprite("/assets/sprite_sheet/map/platform_2.png"), 40), //2
    new Platform(403, 73, 74, 12, new Collider(), new ImgSprite("/assets/sprite_sheet/map/platform_3.png")), //3
    new Platform(0, 225, 100, 17, new Collider(), new ImgSprite("/assets/sprite_sheet/map/platform_4.png"), 25), //4
    new Platform(165, 282, 103, 17, new Collider(), new ImgSprite("/assets/sprite_sheet/map/platform_5.png")), //5
    new Platform(321, 205, 94, 25, new Collider(), new ImgSprite("/assets/sprite_sheet/map/platform_6.png"), 44), //6
    new Platform(409, 225, 71, 15, new Collider(), new ImgSprite("/assets/sprite_sheet/map/platform_7.png")), //7
    new Platform(-10, 388, canvas.width + 10, 100, new Collider(), new ColorSprite(new Vector(canvas.width + 10, 100), gradient), 217), // Ground
    new Platform(91, 388, 298, 60, new Collider(), new ImgSprite("/assets/sprite_sheet/map/platform_8.png")), //8
]);

// new Block(79, 388, 303, 100, null); //8