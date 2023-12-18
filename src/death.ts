import { Direction } from "./enums";
import { GAME_WIDTH } from "./joust";
import { Player } from "./player";
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
        super(x, y, width, height, color);
        this.dead = false;
       
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
        switch (this.position.x > GAME_WIDTH/2) {
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