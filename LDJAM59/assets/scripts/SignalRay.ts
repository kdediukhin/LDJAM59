import { _decorator, Color, Component, game, geometry, Node, PhysicsSystem, Vec3 } from 'cc';
import { Reflector } from './Reflector';
import { SignalRenderer } from './SignalRenderer';
import { gameEventTarget } from './plugins/GameEventTarget';
import { GameEvent } from './enums/GameEvent';
const { ccclass, property } = _decorator;

@ccclass('SignalRay')
export class SignalRay extends Component {

    @property(Color)
    color: Color = new Color(255, 255, 255, 255);

    @property(SignalRenderer)
    private signalRenderer: SignalRenderer = null;

    @property(Vec3)
    direction: Vec3 = new Vec3(1, 0, 0);

    @property
    maxBounces: number = 10;

    @property
    maxDistance: number = 100;

    private _ray: geometry.Ray = new geometry.Ray();

    public rayPoints: Vec3[] = [];

    protected onEnable(): void {
        this._subscribeEvents(true);
    }

    protected onDisable(): void {
        this._subscribeEvents(false);
    }

    private _subscribeEvents(isOn: boolean) {
        const func = isOn ? 'on' : 'off';
        
        gameEventTarget[func](GameEvent.UPDATE_REFLECTION, this._castRay, this);
    }

    start(): void {
        this._castRay();
    }

    private _castRay(): void {
        const points: Vec3[] = [];

        let origin = this.node.worldPosition.clone();
        let dir = new Vec3();
        Vec3.normalize(dir, this.direction);

        points.push(origin.clone());        

        for (let bounce = 0; bounce < this.maxBounces; bounce++) {
            this._ray.o.set(origin);
            this._ray.d.set(dir);

            const hit = PhysicsSystem.instance.raycastClosest(this._ray, 0xffffffff, this.maxDistance);
            if (!hit) {
                const endpoint = new Vec3();
                Vec3.scaleAndAdd(endpoint, origin, dir, this.maxDistance);
                points.push(endpoint);
                
                break;
            }

            const result = PhysicsSystem.instance.raycastClosestResult;
            const hitPoint = result.hitPoint.clone();
            const normal = result.hitNormal.clone();

            points.push(hitPoint);

            const reflector = result.collider.node.getComponent(Reflector);
            if (reflector) {
                // r = d - 2*(d·n)*n
                const dot = Vec3.dot(dir, normal);
                const reflected = new Vec3(
                    dir.x - 2 * dot * normal.x,
                    dir.y - 2 * dot * normal.y,
                    dir.z - 2 * dot * normal.z,
                );
                Vec3.normalize(dir, reflected);
                // Сдвигаем начало чуть вперёд вдоль отражённого направления
                Vec3.scaleAndAdd(origin, hitPoint, dir, 0.01);
            } else {
                break;
            }
        }

        this.rayPoints = points;

        if (this.signalRenderer) {
            this.signalRenderer.setLinePoints(points);
        }
    }
}


