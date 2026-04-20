import { _decorator, CCBoolean, Component, Enum, Node, NodeEventType, tween, UIOpacity, Vec3 } from 'cc';
import { GameEvent } from './enums/GameEvent';
import { gameEventTarget } from './plugins/GameEventTarget';
const { ccclass, property } = _decorator;

@ccclass('MenuMap')
class MenuMap {
    @property(Node)
    button: Node = null;

    @property(Node)
    menuScreen: Node = null;

    @property({ type: Enum(GameEvent) })
    shotEvent: GameEvent = GameEvent.NONE;

    @property(CCBoolean)
    isPlayButton: boolean = false;

    @property({type: Node, visible: function () { return this.isPlayButton } })
    tutorialScreen: Node = null;

    @property(CCBoolean)
    toggleBg: boolean = false;

    @property({ type: CCBoolean, visible: function () { return this.toggleBg } })
    isOn: boolean = false;

}

@ccclass('Menu')
export class Menu extends Component {


    @property([MenuMap])
    menuMaps: MenuMap[] = [];

    @property(Node)
    defaultMenuScreen: Node = null;

    @property([Node])
    bgNodes: Node[] = [];

    private _firstLaunch: boolean = true;

    protected onEnable(): void {
        this._subscribeEvents(true);

        this.menuMaps.forEach(menuMap => {
            if (!menuMap.menuScreen) return;
            menuMap.menuScreen.position = Vec3.ZERO;
            menuMap.menuScreen.active = menuMap.menuScreen === this.defaultMenuScreen;
        })
        // this.scheduleOnce(() => {
        //     gameEventTarget.emit(GameEvent.PAUSE_STARSHIPS);
        // },0.1);
    }

    protected onDisable(): void {
        this._subscribeEvents(false);
    }

    private _setScreenActive(node: Node, isOn: boolean): void {
        if (!node) return;
        let opacity = node.getComponent(UIOpacity);
        if (!opacity) opacity = node.addComponent(UIOpacity);

        if (isOn) {
            opacity.opacity = 0;
            node.active = true;
            tween(opacity).to(0.2, { opacity: 255 }).start();
        } else {
            node.active = false;
            // tween(opacity).to(0.2, { opacity: 0 }).call(() => { node.active = false; }).start();
        }
    }

    private _subscribeEvents(isOn: boolean) {
        const func = isOn ? 'on' : 'off';

        this.menuMaps.forEach(menuMap => {
            menuMap.button[func](NodeEventType.TOUCH_START, () => this.handleManuAction(menuMap), this);
        });
    }

    private handleManuAction(menuMap: MenuMap): void {
        const isTutorial = menuMap.isPlayButton && this._firstLaunch && menuMap.tutorialScreen;

        if (!isTutorial) {
            const shotEvent = menuMap.shotEvent;
            if (shotEvent !== GameEvent.NONE) {
                gameEventTarget.emit(shotEvent);
            }
        }

        const activeScreens = new Set<Node>();
        this.menuMaps.forEach(i => {
            if (i === menuMap) activeScreens.add(i.menuScreen);
        });

        if (isTutorial) {
            this._firstLaunch = false;
            activeScreens.clear();
            activeScreens.add(menuMap.tutorialScreen);
        }

        this.menuMaps.forEach(i => {
            this._setScreenActive(i.menuScreen, activeScreens.has(i.menuScreen));
        });
        if (menuMap.tutorialScreen) {
            this._setScreenActive(menuMap.tutorialScreen, activeScreens.has(menuMap.tutorialScreen));
        }

        if (!isTutorial && menuMap.toggleBg) {
            this.bgNodes.forEach(bg => bg.active = menuMap.isOn);
        }
    }

}


