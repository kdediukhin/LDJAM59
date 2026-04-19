import { _decorator, Component, Node } from 'cc';
import { gameEventTarget } from './plugins/GameEventTarget';
import { GameEvent } from './enums/GameEvent';
import { ScreenButton } from './input/ScreenButton';
const { ccclass, property } = _decorator;

@ccclass('UiController')
export class UiController extends Component {
    @property(Node)
    allScreenInput: Node = null;

    @property(Node)
    moveEquipmentInput: Node = null;

    @property(Node)
    chooseScreen: Node = null;

    onEnable() {
        this._subscribeEvents(true);
        this.moveEquipmentInput.getComponent(ScreenButton).enabled = false;
        this.chooseScreen.active = false;
    }

    protected onDisable(): void {
        this._subscribeEvents(false);
    }

    private _subscribeEvents(isOn: boolean) {
        const func = isOn ? 'on' : 'off';

        gameEventTarget[func](GameEvent.TOGGLE_OVERLAY, this.toggleOverlay, this);
    }

    private toggleOverlay(isOn: boolean): void {
        this.allScreenInput.getComponent(ScreenButton).enabled = !isOn;
        this.moveEquipmentInput.getComponent(ScreenButton).enabled = isOn;
        this.chooseScreen.active = isOn;
    }


}


