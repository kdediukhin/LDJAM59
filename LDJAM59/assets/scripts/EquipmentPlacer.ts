import { _decorator, Camera, CCFloat, Color, Component, director, game, geometry, Material, MeshRenderer, Node, Vec2, Vec3 } from 'cc';
import { gameEventTarget } from './plugins/GameEventTarget';
import { GameEvent } from './enums/GameEvent';
const { ccclass, property } = _decorator;

@ccclass('EquipmentPlacer')
export class EquipmentPlacer extends Component {
    @property(Node)
    outline: Node = null;

    @property(CCFloat)
    radius: number = 1;

    private _availableOultineColor: Color = Color.GREEN;
    private _disableOultineColor: Color = Color.RED;
    private _outlineMaterial: Material = null;

    private _isActivePlacer: boolean = false;
    private _groundPlane: geometry.Plane = new geometry.Plane();
    private _currentYPosition: number = 0;
    private _isPlaceAvailable: boolean = true;

    onEnable() {

        geometry.Plane.fromNormalAndPoint(this._groundPlane, new Vec3(0, 1, 0), Vec3.ZERO);
        this._outlineMaterial = (this.outline.getComponent(MeshRenderer) ?? this.outline.getComponentInChildren(MeshRenderer)).getMaterialInstance(0);
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
        gameEventTarget[func](GameEvent.MOVE_PLACER, this.onMovePlacer, this);

        gameEventTarget[func](GameEvent.PURCHASE_ACCEPT, this.onPurchaseAccept, this);

        gameEventTarget[func](GameEvent.PURCHASE_DENY, this.onPurchaseDeny, this);

    }

    private onPurchaseDeny() {
        if (!this._isActivePlacer) return;
        this._isActivePlacer = false;
        this.node.removeFromParent();
        this.node.destroy();


    }


    private onPurchaseAccept() {
        if (!this._isActivePlacer) return;
        const { x, y, z } = this.node.position;
        this.node.setPosition(x, this._currentYPosition, z);

        this._isActivePlacer = false;
        this.outline.active = false;
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

        this.node.setPosition(hitX, this._currentYPosition + 5, hitZ);

        gameEventTarget.emit(GameEvent.CHECK_PLACE_AVAILABILITY, this.node, this.radius, (isOn) => this._isPlaceAvailable = isOn);

        gameEventTarget.emit(GameEvent.TOGGLE_CHECK_MARK, this._isPlaceAvailable);
        if (this._outlineMaterial) {
            this._outlineMaterial.setProperty('color', this._isPlaceAvailable ? this._availableOultineColor : this._disableOultineColor);
        }

    }


    private onTogglePlacer(node: Node) {
        if (node !== this.node) return;
        this._isActivePlacer = true;
        this.outline.active = true;

        this._currentYPosition = this.node.position.y;
    }
}


