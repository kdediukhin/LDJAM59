import { _decorator, CCInteger, Component, Node, Sprite, UIOpacity, Vec3 } from 'cc';
import { gameEventTarget } from './plugins/GameEventTarget';
import { GameEvent } from './enums/GameEvent';
const { ccclass, property } = _decorator;

@ccclass('BtnsScaleMap')
export class BtnsScaleMap {
    @property(CCInteger)
    level: number = 0;

    @property
    scaleMultiplier: number = 1;
}

@ccclass('AttachableButtons')
export class AttachableButtons extends Component {
    
    @property([BtnsScaleMap])
    btnsScaleMap: BtnsScaleMap[] = [];

    private _startScale: Vec3 = new Vec3(1, 1, 1);
    private _uiopacity: UIOpacity | null = null;

    protected onLoad(): void {
        this._startScale = this.node.scale.clone();
        this._uiopacity = this.getComponent(UIOpacity);
    }

    protected onEnable(): void {
        this._subscribeEvents(true);
    }

    protected onDisable(): void {
        this._subscribeEvents(false);
    }

    private _subscribeEvents(isSubscribe: boolean) {
        const fn = isSubscribe ? 'on' : 'off';
        gameEventTarget[fn](GameEvent.LEVEL_UPDATE, this.onLevelUpdate, this);

        gameEventTarget[fn](GameEvent.CAMERA_TRANSITION, () => this.toggleOpacity(false), this);
        gameEventTarget[fn](GameEvent.CAMERA_TRANSITION_COMPLETE, () => this.toggleOpacity(true), this);
    }

    private toggleOpacity(isOpaque: boolean) {
        if (this._uiopacity) {
            this._uiopacity.opacity = isOpaque ? 255 : 0;
        }
    }

    public setCurrentLevel(level: number) {
        this.onLevelUpdate(level);
    }

    private onLevelUpdate(level: number) {
        const scaleData = this.btnsScaleMap.find(b => b.level === level);
        if (scaleData) {
            this.node.scale = this._startScale.clone().multiplyScalar(scaleData.scaleMultiplier);
        } else {
            this.node.scale = this._startScale.clone();
        }
    }

   
}


