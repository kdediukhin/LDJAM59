import { _decorator, Component, Node, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ButtonHover')
export class ButtonHover extends Component {
    @property(Sprite)
    hoverSprite: Sprite = null;


    protected onEnable(): void {
        this._subscribeEvents(true);
        this.hoverSprite.node.active = false;
    }

    protected onDisable(): void {
        this._subscribeEvents(false);
    }

    private _subscribeEvents(isSubscribe: boolean) {
        const fn = isSubscribe ? 'on' : 'off';
        this.node[fn](Node.EventType.MOUSE_ENTER, this._onMouseEnter, this);
        this.node[fn](Node.EventType.MOUSE_LEAVE, this._onMouseLeave, this);

        this.node[fn](Node.EventType.TOUCH_START, this._onMouseEnter, this);
        this.node[fn](Node.EventType.TOUCH_END, this._onMouseLeave, this);
        this.node[fn](Node.EventType.TOUCH_CANCEL, this._onMouseLeave, this);

    }

    private _onMouseEnter() {
        if (this.hoverSprite) {
            this.hoverSprite.node.active = true;
        }
    }

    private _onMouseLeave() {
        if (this.hoverSprite) {
            this.hoverSprite.node.active = false;
        }
    }
}


