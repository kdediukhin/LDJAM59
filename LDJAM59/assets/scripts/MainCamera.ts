import { _decorator, Camera, Component, Node } from 'cc';
import { GameEvent } from './enums/GameEvent';
import { gameEventTarget } from './plugins/GameEventTarget';
const { ccclass, property } = _decorator;

@ccclass('MainCamera')
export class MainCamera extends Component {

    private _camera: Camera | null = null;

    protected onEnable(): void {
        this._subscribeEvents(true);
        this._camera = this.node.getComponent(Camera);
    }

    protected onDisable(): void {
        this._subscribeEvents(false);
    }

    private _subscribeEvents(isOn: boolean) {
        const func = isOn ? 'on' : 'off';

        gameEventTarget[func](GameEvent.GET_MAIN_CAMERA, this.onGetMainCamera, this);
    }

    private onGetMainCamera(fn: Function) {
        if (this._camera) {
            fn(this._camera);
        }
    }
}


