import { _decorator, Component, Node, Vec3 } from 'cc';
import { gameEventTarget } from './plugins/GameEventTarget';
import { GameEvent } from './enums/GameEvent';
const { ccclass, property } = _decorator;

@ccclass('OverlayController')
export class OverlayController extends Component {

    private _startScale: Vec3;

    protected onEnable(): void {
        this._startScale = this.node.scale.clone();
        this._subscribeEvents(true);
        this.toggleOverlay(false);
    }

    protected onDisable(): void {
        this._subscribeEvents(false);
    }

    private _subscribeEvents(isOn: boolean) {
        const func = isOn ? 'on' : 'off';

        gameEventTarget[func](GameEvent.TOGGLE_OVERLAY, this.toggleOverlay, this);
    }

    private toggleOverlay(isOn: boolean): void {
        this.node.scale = isOn ? this._startScale : Vec3.ZERO;
    }
}


