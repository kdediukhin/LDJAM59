import { _decorator, CCFloat, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Planet')
export class Planet extends Component {
    @property(Vec3)
    euler: Vec3 = new Vec3(0, 0, 0);

    @property(Node)
    renderer: Node = null;

    @property(CCFloat)
    speedRotation: number = 100;

    protected onEnable(): void {
        this.node.eulerAngles = new Vec3(0, 0, 0);
    }

    protected update(dt: number): void {
        if (this.renderer) {
            const currEuler = this.renderer.eulerAngles.clone();
            this.renderer.eulerAngles = currEuler.add3f(0, this.speedRotation * dt, 0);
            // this.renderer.eulerAngles.add3f(0, 0.01 * dt, 0);

        }
    }
}


