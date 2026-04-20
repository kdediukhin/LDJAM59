import { _decorator, CCString, Component, Node, NodeEventType } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Link')
export class Link extends Component {
    @property(CCString)
    url: string = '';

    protected onEnable(): void {
        this._subscribeEvents(true);
    }

    protected onDisable(): void {
        this._subscribeEvents(false);
    }

    private _subscribeEvents(isOn: boolean) {
        const func = isOn ? 'on' : 'off';

        this.node[func](NodeEventType.TOUCH_START, this.openLink, this);
    }
    openLink() {
        window.open(this.url, '_blank');
    }
}


