export class Vector {
    x: number;
    y: number;
    z: number;

    constructor(x?: number, y?: number, z?: number) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
    }

    negative(): Vector {
        return new Vector(-this.x, -this.y, -this.z);
    }

    add(v: Vector | number): Vector {
        if (v instanceof Vector) return new Vector(this.x + v.x, this.y + v.y, this.z + v.z);
        else return new Vector(this.x + v, this.y + v, this.z + v);
    }

    sub(v: Vector | number): Vector {
        if (v instanceof Vector) return new Vector(this.x - v.x, this.y - v.y, this.z - v.z);
        else return new Vector(this.x - v, this.y - v, this.z - v);
    }

    multiply(v: Vector | number): Vector {
        if (v instanceof Vector) return new Vector(this.x * v.x, this.y * v.y, this.z * v.z);
        else return new Vector(this.x * v, this.y * v, this.z * v);
    }

    divide(v: Vector | number): Vector {
        if (v instanceof Vector) return new Vector(this.x / v.x, this.y / v.y, this.z / v.z);
        else return new Vector(this.x / v, this.y / v, this.z / v);
    }
    
    equals(v: Vector): boolean {
        return this.x == v.x && this.y == v.y && this.z == v.z;
    }

    dot(v: Vector): number {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    cross(v: Vector): Vector {
        return new Vector(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x
        );
    }

    length(): number {
        return Math.sqrt(this.dot(this));
    }

    unit(): Vector {
        return this.divide(this.length());
    }

    min(): number {
        return Math.min(Math.min(this.x, this.y), this.z);
    }

    max(): number {
        return Math.max(Math.max(this.x, this.y), this.z);
    }

    toAngles(): {theta: number, phi: number} {
        return {
            theta: Math.atan2(this.z, this.x),
            phi: Math.asin(this.y / this.length())
        };
    }

    angleTo(a): number {
        return Math.acos(this.dot(a) / (this.length() * a.length()));
    }

    toArray(n): number[] {
        return [this.x, this.y, this.z].slice(0, n || 3);
    }

    clone(): Vector {
        return new Vector(this.x, this.y, this.z);
    }

    init(x: number, y: number, z: number): Vector {
        this.x = x; this.y = y; this.z = z;
        return this;
    }

    static fromAngles(theta: number, phi: number): Vector {
        return new Vector(Math.cos(theta) * Math.cos(phi), Math.sin(phi), Math.sin(theta) * Math.cos(phi));
    }

    static randomDirection(): Vector {
        return Vector.fromAngles(Math.random() * Math.PI * 2, Math.asin(Math.random() * 2 - 1));
    }

    static lerp(a: Vector, b: Vector, fraction: number): Vector {
        return b.sub(a).multiply(fraction).add(a);
    }

    static fromArray(a: number[]): Vector {
        return new Vector(a[0], a[1], a[2]);
    }

    static angleBetween(a: Vector, b: Vector): number {
        return a.angleTo(b);
    }
}