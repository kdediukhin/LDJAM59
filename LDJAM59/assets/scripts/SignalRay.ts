import { _decorator, Color, Component, Enum, game, geometry, Node, PhysicsSystem, Vec3 } from 'cc';
import { Reflector } from './Reflector';
import { Amplifier } from './Amplifier';
import { Receiver } from './Receiver';
import { Obstacle } from './Obstacle';
import { SignalRenderer } from './SignalRenderer';
import { gameEventTarget } from './plugins/GameEventTarget';
import { GameEvent } from './enums/GameEvent';
import { Colors } from './enums/Colors';
const { ccclass, property } = _decorator;

@ccclass('SignalRay')
export class SignalRay extends Component {

    @property({ type: Enum(Colors) })
    colorHex: Colors = Colors.RED;

    @property(SignalRenderer)
    signalRenderer: SignalRenderer = null;

    @property(Vec3)
    direction: Vec3 = new Vec3(1, 0, 0);

    @property
    maxBounces: number = 10;

    @property
    maxDistance: number = 100;

    private _ray: geometry.Ray = new geometry.Ray();
    private _amplifierMap: Map<Node, number> = new Map();
    private _color: Color = new Color();

    public rayPoints: Vec3[] = [];

    protected onEnable(): void {
        this._subscribeEvents(true);
        this._color.fromHEX(Colors[this.colorHex]);

    }

    protected onDisable(): void {
        this._subscribeEvents(false);
    }

    private _subscribeEvents(isOn: boolean) {
        const func = isOn ? 'on' : 'off';

        // gameEventTarget[func](GameEvent.UPDATE_REFLECTION, this._castRay, this);
        gameEventTarget[func](GameEvent.UPDATE_MAX_DISTANCE, this._onUpdateMaxDistance, this);
    }

    update(): void {
        this._castRay();
    }

    private _onUpdateMaxDistance(node: Node, amplifyPower: number) {
        this._amplifierMap.set(node, amplifyPower);
    }

    private _castRay(): void {
        const points: Vec3[] = [];
        const reflectorIndices: Set<number> = new Set();
        const passedAmplifiers: Set<Node> = new Set();

        this._amplifierMap.clear();

        let origin = this.node.worldPosition.clone();
        let dir = new Vec3();
        Vec3.normalize(dir, this.direction);

        points.push(origin.clone());

        const additionalDistance = Array.from(this._amplifierMap.values()).reduce((sum, val) => sum + val, 0);
        let remainingDistance = this.maxDistance + additionalDistance;

        for (let bounce = 0; bounce < this.maxBounces; bounce++) {
            this._ray.o.set(origin);
            this._ray.d.set(dir);

            const hit = PhysicsSystem.instance.raycastClosest(this._ray, 0xffffffff, remainingDistance);
            if (!hit) {
                const endpoint = new Vec3();
                Vec3.scaleAndAdd(endpoint, origin, dir, remainingDistance);
                points.push(endpoint);
                break;
            }

            const result = PhysicsSystem.instance.raycastClosestResult;
            const hitPoint = result.hitPoint.clone();
            const normal = result.hitNormal.clone();

            remainingDistance -= result.distance;
            points.push(hitPoint);

            const amplifier = result.collider.node.getComponent(Amplifier);
            if (amplifier) {
                if (!passedAmplifiers.has(amplifier.node)) {
                    // Входим в усилитель: добавляем усиление и запоминаем его
                    gameEventTarget.emit(GameEvent.UPDATE_MAX_DISTANCE, amplifier.node, amplifier.amplifyPower);
                    remainingDistance += amplifier.amplifyPower;
                    passedAmplifiers.add(amplifier.node);
                }
                // Пропускаем луч сквозь усилитель (вход или выход)
                Vec3.scaleAndAdd(origin, hitPoint, dir, 0.01);
                continue;
            }

            const receiver = result.collider.node.getComponent(Receiver);
            if (receiver) {
                gameEventTarget.emit(GameEvent.RAY_HIT_RECEIVED, receiver.node);

                if (receiver.colorHex === this.colorHex) {
                    gameEventTarget.emit(GameEvent.RAY_HIT_SUCCESS, receiver.node);
                } else {
                    console.log(`[SignalRay] color mismatch: receiver=${receiver.colorHex}, ray=${this.colorHex}`);
                    gameEventTarget.emit(GameEvent.RAY_HIT_FAIL, receiver.node);
                }
                break;
            }

            // Obstacle или любой другой объект — луч останавливается
            const obstacle = result.collider.node.getComponent(Obstacle);
            if (obstacle) {
                break;
            }

            const reflector = result.collider.node.getComponent(Reflector);
            if (reflector) {
                // Если oneSided — пропускаем луч насквозь при попадании с тыла
                // dot < 0 означает что нормаль смотрит навстречу лучу (лицевая сторона)
                const dot = Vec3.dot(dir, normal);
                reflectorIndices.add(points.length - 1);
                // r = d - 2*(d·n)*n
                const reflected = new Vec3(
                    dir.x - 2 * dot * normal.x,
                    dir.y - 2 * dot * normal.y,
                    dir.z - 2 * dot * normal.z,
                );
                Vec3.normalize(dir, reflected);
                // Сдвигаем начало чуть вперёд вдоль отражённого направления
                Vec3.scaleAndAdd(origin, hitPoint, dir, 0.01);
            } else {
                // Неизвестный объект — останавливаемся
                break;
            }

            if (remainingDistance <= 0) break;
        }

        this.rayPoints = points;

        if (this.signalRenderer) {
            this.signalRenderer.setLinePoints(points, reflectorIndices);
            this.signalRenderer.setLineColor(this.colorHex);
        }
    }
}


