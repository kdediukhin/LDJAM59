import { _decorator, Camera, Component, director, game, geometry, Node, Plane, Vec2, Vec3 } from 'cc';
import { gameEventTarget } from './plugins/GameEventTarget';
import { GameEvent } from './enums/GameEvent';
const { ccclass, property } = _decorator;

@ccclass('EquipmentPlacer')
export class EquipmentPlacer extends Component {
    @property(Node)
    outline: Node = null;

    private _isActivePlacer: boolean = false;
    private _groundPlane: geometry.Plane = new geometry.Plane();

    onEnable() {
        
        geometry.Plane.fromNormalAndPoint(this._groundPlane, new Vec3(0, 1, 0), Vec3.ZERO);
        this.outline.active = false;
        this._subscribeEvents(true);
    }

    onDisable() {
        this.outline.active = false;
        this._subscribeEvents(false);
    }

    private _subscribeEvents(isOn: boolean) {
        const func = isOn ? 'on' : 'off';

        gameEventTarget[func](GameEvent.TOGGLE_PLACER, this.onTogglePlacer, this);
        gameEventTarget[func](GameEvent.TOGGLE_OVERLAY, this.onToggleOverlay, this);
        gameEventTarget[func](GameEvent.MOVE_PLACER, this.onMovePlacer, this);

    }

    private onMovePlacer(currentPos: Vec2) {
        if (!this._isActivePlacer) return;
        const mainCamera = director.getScene().getComponentInChildren(Camera);

        const ray = new geometry.Ray();
        mainCamera.screenPointToRay(currentPos.x, currentPos.y, ray);

        const t = geometry.intersect.rayPlane(ray, this._groundPlane);
        if (t <= 0) return;

        const hitX = ray.o.x + ray.d.x * t;
        const hitZ = ray.o.z + ray.d.z * t;

        const currentY = this.node.position.y;
        this.node.setPosition(hitX, currentY, hitZ);
    }

    private onToggleOverlay(isOn: boolean) {
        if (isOn) return;
        this._isActivePlacer = false;
        this.outline.active = false;
    }

    private onTogglePlacer(node: Node) {
        if (node !== this.node) return;
        this._isActivePlacer = true;
        this.outline.active = true;
    }
}


