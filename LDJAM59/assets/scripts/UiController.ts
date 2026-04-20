import { _decorator, Camera, Component, instantiate, Node, Prefab, Sprite, Vec2, Vec3 } from 'cc';
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

    // @property(Node)
    // chooseScreen: Node = null;

    @property(Node)
    checkMark: Node = null;

    @property(Node)
    deny: Node = null;

    @property(Prefab)
    attachBtnPrefab: Prefab = null;

    @property(Camera)
    uiCamera: Camera = null;

    @property(Node)
    canvasNode: Node = null;


    private _attachBtnsMap: Map<Node, Node | null> = new Map();

    private _attachButtonsOffset: Vec2 = null;
    private _startingAttachBtnPos: Vec3 = null;

    onEnable() {
        this._subscribeEvents(true);//
    }

    protected onDisable(): void {
        this._subscribeEvents(false);
    }


    private _subscribeEvents(isOn: boolean) {
        const func = isOn ? 'on' : 'off';

        gameEventTarget[func](GameEvent.TOGGLE_OVERLAY, this.toggleOverlay, this);
        gameEventTarget[func](GameEvent.TOGGLE_CHECK_MARK, this.toggleCheckMark, this);

        gameEventTarget[func](GameEvent.MOVE_PLACER, this.onMovePlacer, this);
        gameEventTarget[func](GameEvent.TOGGLE_MOVEMENT, this.onToggleMovement, this)
        gameEventTarget[func](GameEvent.ATTACH_UI_TO_PLACER, this.attachUiToPlacer, this);

        gameEventTarget[func](GameEvent.PAUSE_STARSHIPS, () => this.toggleStarshipUI(true), this);
        gameEventTarget[func](GameEvent.RESUME_STARSHIPS, () => this.toggleStarshipUI(false), this);
        gameEventTarget[func](GameEvent.DESTROY_ITEM, this.onDestroyItem, this);
        gameEventTarget[func](GameEvent.UPDATE_UI_POSITION, this.onUpdateUiPosition, this);


    }

    private toggleStarshipUI(isPaused: boolean) {
        this._attachBtnsMap.forEach((placerNode, attachBtn) => {
            attachBtn.active = !isPaused;
        });
    }


    onDestroyItem(button: ScreenButton) {
        const attachBtn = Array.from(this._attachBtnsMap.keys()).find(btn => btn.getComponentsInChildren(ScreenButton).includes(button));

        this._attachBtnsMap.delete(attachBtn);
        attachBtn.removeFromParent();
        attachBtn.destroy();
    }

    private onUpdateUiPosition(node: Node, uiPos: Vec3) {
        const attachBtn = Array.from(this._attachBtnsMap.keys()).find(btn => this._attachBtnsMap.get(btn) === node);
        if (attachBtn) {
            const worldPos = new Vec3();
            this.uiCamera.screenToWorld(uiPos, worldPos);
            attachBtn.worldPosition = worldPos;
        }
    }

    private attachUiToPlacer(fn: Function, node: Node, uiPos: Vec3) {
        const attachBtn = instantiate(this.attachBtnPrefab);
        attachBtn.getComponentsInChildren(ScreenButton).forEach(btn => btn.buttonName += `${node.uuid}`);
        attachBtn.setParent(this.canvasNode);

        const worldPos = new Vec3();
        this.uiCamera.screenToWorld(uiPos, worldPos);
        attachBtn.worldPosition = worldPos;

        this._attachBtnsMap.set(attachBtn, null);

        this.scheduleOnce(() => {

            fn(attachBtn);
            this._attachBtnsMap.set(attachBtn, node);
        });
    }

    private onToggleMovement(isOn: boolean) {
        this._attachButtonsOffset = null;
    }

    private onRotatePlacer(currentPos: Vec2, uiPos: Vec2, button: ScreenButton): void {
        const attachBtn = Array.from(this._attachBtnsMap.keys()).find(btn => button === btn.getComponentInChildren(ScreenButton));

        const placerNode = this._attachBtnsMap.get(attachBtn);
        if (placerNode) {
            gameEventTarget.emit(GameEvent.TOGGLE_PLACER, placerNode);
        }

    }

    private onMovePlacer(pos: Vec2, uiPos: Vec2, button: ScreenButton): void {
        const attachBtn = Array.from(this._attachBtnsMap.keys()).find(btn => button === btn.getComponentInChildren(ScreenButton));

        // const placerNode = this._attachBtnsMap.get(attachBtn);
        // if (placerNode) {
        //     gameEventTarget.emit(GameEvent.TOGGLE_PLACER, placerNode);
        // }


        if (!this._attachButtonsOffset) {
            const btnWorld = attachBtn.getWorldPosition();
            this._attachButtonsOffset = new Vec2(
                btnWorld.x - uiPos.x,
                btnWorld.y - uiPos.y,
            );
        }

        attachBtn.worldPosition = new Vec3(
            uiPos.x + this._attachButtonsOffset.x,
            uiPos.y + this._attachButtonsOffset.y,
            attachBtn.worldPosition.z,
        );
    }

    private toggleCheckMark(isOn: boolean): void {
        this.checkMark.getComponent(Sprite).grayscale = !isOn;
        this.checkMark.getComponent(ScreenButton).enabled = isOn;
    }

    private toggleOverlay(isOn: boolean): void {
        // this.allScreenInput.getComponent(ScreenButton).enabled = !isOn;
        // this.chooseScreen.active = isOn;
    }


}


