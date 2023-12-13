import { ctx, frameCount } from "./joust";
import { Vector } from "./vector";

export type Sprite = ImgSprite | AniSprite | ColorSprite;

export class ColorSprite {
    image: HTMLImageElement = new Image();
    color: string | CanvasGradient | CanvasPattern;
    scale?: Vector = new Vector(1, 1);

    constructor (size: Vector, color: string | CanvasGradient | CanvasPattern) {
        this.color = color;

        // Create a canvas element
        const tempCanv = document.createElement('canvas');
        tempCanv.width = size.x;
        tempCanv.height = size.y;

        // Get the 2D rendering context
        const context = tempCanv.getContext('2d');

        // Draw a colored rectangle
        context.fillStyle = color;
        context.fillRect(0, 0, size.x, size.y);

        // Set the image data to the canvas data
        this.image.src = tempCanv.toDataURL();
    }

    show(x: number, y: number){
        let image = this.image
        if (!image) return;

        ctx.drawImage(image, x, y, image.width * this.scale.x, image.height * this.scale.y);
    }
}

export class ImgSprite {
    image: HTMLImageElement = new Image(1, 1);
    scale?: Vector;

    constructor (input: string | HTMLImageElement, scalar?: Vector) {
        // FIXME: Check if file exists
        
        if (input instanceof HTMLImageElement) {
            this.image = input;
            return;
        }

        const image = new Image();
        image.src = input;
        image.onload = () => this.image = image;

        this.scale = scalar || new Vector(1, 1);
    }

    show(x: number, y: number){
        let image = this.image
        if (!image) return;
        ctx.drawImage(image, x, y, image.width * this.scale.x, image.height * this.scale.y);

        return;
    }
}

interface IAniSpriteOptions {
    animationSpeed?: number;
    scale?: Vector;
    loop?: boolean;
}

export class AniSprite {
    spriteSheet: string;
    images: HTMLImageElement[];
    currentImage: number;
    maxImage: number;
    animationSpeed: number;
    scale: Vector;
    loop: boolean;

    constructor(basePath: string, numberOfImages: number, options: IAniSpriteOptions = {}) {
        this.spriteSheet = basePath;
        this.images = [];
        this.currentImage = 0;
        this.maxImage = numberOfImages;
        this.animationSpeed = options.animationSpeed || 0;
        this.scale = options.scale || new Vector(1, 1);
        this.loop = options.loop || false;

        for (let i = 1; i <= numberOfImages; i++) {
            const image = new Image();
            image.src = `${basePath}${i}.png`;
            this.images[i - 1] = image;
        }
    }

    show(x: number, y: number) {
        let image = this.images[this.currentImage];
        if (!image) return;

        ctx.drawImage(image, x, y, image.width * this.scale.x, image.height * this.scale.y);

        if (this.animationSpeed > 0 && this.loop) {
            if (frameCount % this.animationSpeed < 1) {
                this.next();
            }
        }
    }

    next() {
        this.currentImage++;

        if (this.currentImage >= this.maxImage) {
            this.currentImage = 0;
        }
    }
}