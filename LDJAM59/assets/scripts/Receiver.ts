import { _decorator, Color, Component, director, game, Mesh, MeshRenderer, Node, v3, Vec3 } from 'cc';
import { SignalRay } from './SignalRay';
const { ccclass, property } = _decorator;

@ccclass('Receiver')
export class Receiver extends Component {
    @property(Color)
    color: Color = new Color(255, 255, 255, 255);

    @property(MeshRenderer)
    mesh: MeshRenderer = null;

    /** Радиус пересечения с лучом */
    @property
    hitRadius: number = 1.0;

    private _material: any = null;
    private _isHit: boolean = false;

    protected onEnable(): void {
        this._material = this.mesh.getMaterialInstance(0);
    }

    protected update(dt: number): void {
        const time = game.totalTime * 0.001;
        this.node.worldPosition = v3(
            Math.sin(time) * 15,
            Math.cos(time) * 15,
            0,
        );

        const scene = director.getScene();
        const signals = scene ? scene.getComponentsInChildren(SignalRay) : [];
        const pos = this.node.worldPosition;
        let hit = false;
        for (const ray of signals) {
            if (this._checkRayHit(pos, ray.rayPoints)) {
                hit = true;
                break;
            }
        }
        if (hit !== this._isHit) {
            this._isHit = hit;
            console.log(`[Receiver] ${hit ? 'HIT' : 'left'} signal beam`);
        }
    }

    public get isHit(): boolean {
        return this._isHit;
    }

    private _checkRayHit(point: Vec3, segments: Vec3[]): boolean {
        if (segments.length < 2) return false;
        const rSq = this.hitRadius * this.hitRadius;
        const ab = new Vec3();
        const ap = new Vec3();
        for (let i = 0; i < segments.length - 1; i++) {
            const a = segments[i];
            const b = segments[i + 1];
            Vec3.subtract(ab, b, a);
            Vec3.subtract(ap, point, a);
            const lenSq = Vec3.dot(ab, ab);
            const t = lenSq > 0 ? Math.max(0, Math.min(1, Vec3.dot(ap, ab) / lenSq)) : 0;
            const closest = new Vec3(
                a.x + ab.x * t,
                a.y + ab.y * t,
                a.z + ab.z * t,
            );
            Vec3.subtract(ap, point, closest);
            if (Vec3.dot(ap, ap) <= rSq) return true;
        }
        return false;
    }
}


