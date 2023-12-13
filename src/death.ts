import { Direction } from "./enums";
import { GAME_OBJECTS, canvas, player } from "./joust";
import { Player } from "./player";
import { AniSprite } from "./sprite";
import { constrain } from "./utils";
import { Vector } from "./vector";

export class UnmountedAI extends Player {
    debugColor: string = "white";

    constructor(
        x: number,
        y: number,
        width: number,
        height: number,
        color: string,
        name?: string
    ) {
        super(x, y, width, height, color, name);
        this.dead = false;
        this.animations = {
            running: new AniSprite(
                "/assets/sprite_sheet/bounder/walk_unmounted/walk",
                4,
                {
                    animationSpeed: 5,
                    scale: new Vector(2, 2),
                    loop: true
                }
            ),
            flap: new AniSprite(
                "/assets/sprite_sheet/bounder/flap_unmounted/flap",
                2,
                {
                    animationSpeed: 5,
                    scale: new Vector(2, 2),
                    loop: true
                }
            ),
            // idle: new AniSprite("/assets/Sprite Sheet/Bounder/Idle (Bounder)/Idle_Standing", 1)
        };

        switch (Math.floor(Math.random() * 2)) {
            case 0:
                this.direction = Direction.Right;
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

    dumbAI() {
        if (Math.random() < 0.03) {
            this.isJumping = true;
            this.velocity.y = constrain(this.velocity.y - 2, -2, 2);
        }
        switch (this.position.x > canvas.width/2) {
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
                break;
            default:
                break;
        }
    }
}

export class Egg {

}