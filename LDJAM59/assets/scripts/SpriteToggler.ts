import { _decorator, Component, Node } from 'cc';
import { GameEvent } from './enums/GameEvent';
import { gameEventTarget } from './plugins/GameEventTarget';
const { ccclass, property } = _decorator;

@ccclass('SoundSpriteToggler')
export class SoundSpriteToggler extends Component {
    @property(Node)
    on: Node = null;

    @property(Node)
    off: Node = null;

    private _isOn: boolean = true;

    protected onEnable(): void {
        this._subscribeEvents(true);

        this.scheduleOnce(() => {
            if (this.on) this.on.active = this._isOn;
            if (this.off) this.off.active = !this._isOn;
        })

    }

    protected onDisable(): void {
        this._subscribeEvents(false);
    }

    private _subscribeEvents(isSubscribe: boolean) {
        const fn = isSubscribe ? 'on' : 'off';
        gameEventTarget[fn](GameEvent.TOGGLE_SOUND, this.onToggleSound, this);
    }

    private onToggleSound() {
        this._isOn = !this._isOn;
        if (this.on) this.on.active = this._isOn;
        if (this.off) this.off.active = !this._isOn;
    }

}


