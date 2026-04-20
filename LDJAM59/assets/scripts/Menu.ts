import { _decorator, Component, Enum, Node, NodeEventType, Vec3 } from 'cc';
import { GameEvent } from './enums/GameEvent';
import { gameEventTarget } from './plugins/GameEventTarget';
const { ccclass, property } = _decorator;

@ccclass('MenuMap')
class MenuMap {
    @property(Node)
    button: Node = null;

    @property(Node)
    menuScreen: Node = null;

    @property({type: Enum(GameEvent)})
    shotEvent: GameEvent = GameEvent.NONE;
}

@ccclass('Menu')
export class Menu extends Component {


    @property([MenuMap])
    menuMaps: MenuMap[] = [];

    @property(Node)
    defaultMenuScreen: Node = null;

    protected onEnable(): void {
        this._subscribeEvents(true);

        this.menuMaps.forEach(menuMap => {
            if(!menuMap.menuScreen) return;
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

    private _subscribeEvents(isOn: boolean) {
        const func = isOn ? 'on' : 'off';

        this.menuMaps.forEach(menuMap => {
            menuMap.button[func](NodeEventType.TOUCH_START, () => this.handleManuAction(menuMap), this);
        });

    }

    private handleManuAction(menuMap: MenuMap): void {
        const shotEvent = menuMap.shotEvent;

        if (shotEvent !== GameEvent.NONE) {
            gameEventTarget.emit(shotEvent);
        }

        const activeScreens = new Set<Node>();
        this.menuMaps.forEach(i => {
            if (i === menuMap) activeScreens.add(i.menuScreen);
        });

        this.menuMaps.forEach(i => {
            i.menuScreen.active = activeScreens.has(i.menuScreen);
        });
    }

}


