import {Vector} from './vector';
import {Path} from './path';
import {isBezierCurve} from './bezier-curve';

const ETA = 1e-5;

export class Trapezoid {
    readonly ps: Vector[];
    private readonly vertical: boolean;

    private constructor(ps: Vector[], vertical: boolean) {
        this.ps = ps;
        this.vertical = vertical;
    }

    static of(paths: Path[]): Trapezoid | undefined {
        if (paths.length === 4 && !paths.some(p => isBezierCurve(p))) {
            const ps = paths as Vector[];
            if (equal(ps[0].x, ps[1].x) && equal(ps[3].x, ps[2].x)) {
                return new Trapezoid(ps, true);
            }
            if (equal(ps[0].y, ps[1].y) && equal(ps[3].y, ps[2].y)) {
                return new Trapezoid(ps, false);
            }
        }
    }

    height(): number {
        return Math.abs(this.vertical ? this.ps[0].x - this.ps[3].x : this.ps[0].y - this.ps[3].y);
    }

    width(): number {
        if (this.vertical) {
            const maxY = Math.max(this.ps[0].y, this.ps[1].y, this.ps[2].y, this.ps[3].y);
            const minY = Math.min(this.ps[0].y, this.ps[1].y, this.ps[2].y, this.ps[3].y);
            return maxY - minY;
        }
        const maxX = Math.max(this.ps[0].x, this.ps[1].x, this.ps[2].x, this.ps[3].x);
        const minX = Math.min(this.ps[0].x, this.ps[1].x, this.ps[2].x, this.ps[3].x);
        return maxX - minX;
    }

    rectanglePoints(): Vector[] {
        if (this.vertical) {
            const up = this.ps[0].y < this.ps[1].y;
            const i = this.ps[0].y > this.ps[3].y === up ? 3 : 0;
            const j = this.ps[1].y > this.ps[2].y === up ? 1 : 2;
            return [
                new Vector((this.ps[0].x + this.ps[3].x) / 2, this.ps[i].y),
                new Vector((this.ps[1].x + this.ps[2].x) / 2, this.ps[j].y)
            ];
        } else {
            const right = this.ps[0].x < this.ps[1].x;
            const i = this.ps[0].x > this.ps[3].x === right ? 3 : 0;
            const j = this.ps[1].x > this.ps[2].x === right ? 1 : 2;
            return [
                new Vector(this.ps[i].x, (this.ps[0].y + this.ps[3].y) / 2),
                new Vector(this.ps[j].x, (this.ps[1].y + this.ps[2].y) / 2)
            ];
        }
    }

    split(parts: number): Trapezoid[] {
        const res: Trapezoid[] = [];
        for (let i = 0; i < parts; i++) {
            const p = [
                this.ps[0].interpolate(this.ps[3], i / parts),
                this.ps[1].interpolate(this.ps[2], i / parts),
                this.ps[1].interpolate(this.ps[2], (i + 1) / parts),
                this.ps[0].interpolate(this.ps[3], (i + 1) / parts)
            ];
            res.push(new Trapezoid(p, this.vertical));
        }
        return res;
    }
}

function equal(a: number, b: number) {
    return Math.abs(a - b) < ETA;
}
