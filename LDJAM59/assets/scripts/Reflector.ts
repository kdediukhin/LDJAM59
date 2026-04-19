import { _decorator, Camera, Component, director, EventTouch, game, geometry, Input, input, PhysicsSystem, Vec2, Vec3 } from 'cc';
import { GameEvent } from './enums/GameEvent';
import { gameEventTarget } from './plugins/GameEventTarget';
const { ccclass, property } = _decorator;

@ccclass('Reflector')
export class Reflector extends Component {


    protected mainCamera: Camera = null;

    protected onEnable(): void {
        this.mainCamera = director.getScene().getComponentInChildren(Camera);
        this._subscribeEvents(true);

        // this.scheduleOnce(() => {
        //     gameEventTarget.emit(GameEvent.UPDATE_REFLECTION);
        // });
    }

    protected onDisable(): void {
        this._subscribeEvents(false);
    }

    private _subscribeEvents(isOn: boolean) {
        const func = isOn ? 'on' : 'off';

        gameEventTarget[func](GameEvent.ALLSCREEN_INPUT, this._onTouchStart, this);
        // gameEventTarget[func](GameEvent.TOGGLE_OVERLAY, this.onToggleOverlay, this);
    }

    // private onToggleOverlay() {
    //     this.scheduleOnce(() => {            
    //         gameEventTarget.emit(GameEvent.UPDATE_REFLECTION);
    //     });
    // }

    private _onTouchStart(buttonCurrPos: Vec2): void {
        if (!this.mainCamera) return;

        const ray = new geometry.Ray();
        this.mainCamera.screenPointToRay(buttonCurrPos.x, buttonCurrPos.y, ray);

        const hit = PhysicsSystem.instance.raycastClosest(ray, 0xffffffff, 1000);

        if (!hit) return;

        const result = PhysicsSystem.instance.raycastClosestResult;
        const hitNode = result.collider.node;
        console.log('44');

        if (hitNode !== this.node && !this.node.children.includes(hitNode)) return;
        console.log('55');


        const currEulerAngles = this.node.eulerAngles.clone();
        this.node.eulerAngles = currEulerAngles.add3f(0, -10, 0);
        if (this.node.eulerAngles.y >= 360) {
            this.node.eulerAngles = this.node.eulerAngles.subtract3f(0, 360, 0);
        }
        // this.scheduleOnce(() => {
        //     gameEventTarget.emit(GameEvent.UPDATE_REFLECTION);
        // });

    }

}


