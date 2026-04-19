import { _decorator, Camera, CCFloat, Component, director, game, geometry, Node, Vec2, Vec3 } from 'cc';
import { gameEventTarget } from './plugins/GameEventTarget';
import { GameEvent } from './enums/GameEvent';
const { ccclass, property } = _decorator;

@ccclass('StaticObject')
export class StaticObject extends Component {

    @property(CCFloat)
    radius: number = 1;

    public checkCollision(node: Node, radius: number): boolean {
        const pos1 = this.node.worldPosition;
        const pos2 = node.worldPosition;

        const distance = Vec2.distance(new Vec2(pos1.x, pos1.z), new Vec2(pos2.x, pos2.z));
        return distance < this.radius + radius;
    }

}