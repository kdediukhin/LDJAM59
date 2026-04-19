import { _decorator, Camera, Component, Node, Sprite, Vec2, Vec3 } from 'cc';
import { gameEventTarget } from './plugins/GameEventTarget';
import { GameEvent } from './enums/GameEvent';
import { ScreenButton } from './input/ScreenButton';
const { ccclass, property } = _decorator;

@ccclass('UiController')
export class UiController extends Component {
    @property(Node)
    allScreenInput: Node = null;

    // @property(Node)
    // moveEquipmentInput: Node = null;

    @property(Node)
    chooseScreen: Node = null;

    @property(Node)
    checkMark: Node = null;

    @property(Node)
    deny: Node = null;

    @property(Node)
    attachBtn: Node = null;

    @property(Camera)
    uiCamera: Node = null;

    private _attachButtonsOffset: Vec2 = null;

    onEnable() {
        this._subscribeEvents(true);
        // this.moveEquipmentInput.getComponent(ScreenButton).enabled = false;
        this.chooseScreen.active = false;
        this.attachBtn.active = false;
    }

    protected onDisable(): void {
        this._subscribeEvents(false);
    }

    private _subscribeEvents(isOn: boolean) {
        const func = isOn ? 'on' : 'off';

        gameEventTarget[func](GameEvent.TOGGLE_OVERLAY, this.toggleOverlay, this);
        gameEventTarget[func](GameEvent.TOGGLE_CHECK_MARK, this.toggleCheckMark, this);

        gameEventTarget[func](GameEvent.ADD_REFLECTOR, () => this.toggleAttachBtns(true), this);
        gameEventTarget[func](GameEvent.ADD_AMPLIFIER, () => this.toggleAttachBtns(true), this);
        
        gameEventTarget[func](GameEvent.PURCHASE_ACCEPT, () => this.toggleAttachBtns(false), this);
        gameEventTarget[func](GameEvent.PURCHASE_DENY, () => this.toggleAttachBtns(false), this);


        gameEventTarget[func](GameEvent.MOVE_PLACER, this.onMovePlacer, this);
        gameEventTarget[func](GameEvent.TOGGLE_MOVEMENT, this.onToggleMovement, this)
    }

    private toggleAttachBtns(isOn: boolean) {
        this.attachBtn.active = isOn;
    }

    private onToggleMovement(isOn: boolean) {
        this._attachButtonsOffset = null;
    }

    private onMovePlacer(pos: Vec2, uiPos: Vec2): void {
        if (!this._attachButtonsOffset) {
            const btnWorld = this.attachBtn.getWorldPosition();
            this._attachButtonsOffset = new Vec2(
                btnWorld.x - uiPos.x,
                btnWorld.y - uiPos.y,
            );
        }

        this.attachBtn.worldPosition = new Vec3(
            uiPos.x + this._attachButtonsOffset.x,
            uiPos.y + this._attachButtonsOffset.y,
            this.attachBtn.worldPosition.z,
        );
    }

    private toggleCheckMark(isOn: boolean): void {
        this.checkMark.getComponent(Sprite).grayscale = !isOn;
        this.checkMark.getComponent(ScreenButton).enabled = isOn;
    }

    private toggleOverlay(isOn: boolean): void {
        this.allScreenInput.getComponent(ScreenButton).enabled = !isOn;
        // this.moveEquipmentInput.getComponent(ScreenButton).enabled = isOn;
        this.chooseScreen.active = isOn;
    }


}


