import { _decorator, Component, director, Enum, instantiate, Node, Prefab } from 'cc';
import { GameEvent } from './enums/GameEvent';
import { gameEventTarget } from './plugins/GameEventTarget';
import { EquipmentPlacer } from './EquipmentPlacer';
import { StaticObject } from './StaticObject';
const { ccclass, property } = _decorator;

@ccclass('EquipmentMap')
class EquipmentMap {
    @property(Prefab)
    prefab: Prefab = null;

    @property({ type: Enum(GameEvent) })
    generateEvent: GameEvent = GameEvent.NONE;
}

@ccclass('EquipmentGenerator')
export class EquipmentGenerator extends Component {
    @property([EquipmentMap])
    equipmentMaps: EquipmentMap[] = [];

    private _staticObjects: StaticObject[] = [];

    onEnable() {
        this._subscribeEvents(true);
    }

    onDisable() {
        this._subscribeEvents(false);
    }

    protected start(): void {
        this._staticObjects = director.getScene().getComponentsInChildren(StaticObject);
    }

    private _subscribeEvents(isOn: boolean) {
        const func = isOn ? 'on' : 'off';

        this.equipmentMaps.forEach(equipmentMap => {
            if (equipmentMap.generateEvent !== GameEvent.NONE) {
                gameEventTarget[func](equipmentMap.generateEvent, () => this.generateEquipment(equipmentMap), this);
            }
        });

        gameEventTarget[func](GameEvent.TOGGLE_OVERLAY, this.onToggleOverlay, this);
        gameEventTarget[func](GameEvent.CHECK_PLACE_AVAILABILITY, this.onCheckPlaceAvailability, this);
        // gameEventTarget[func](GameEvent.PURCHASE_ACCEPT, () => this.onToggleOverlay(false), this);
        gameEventTarget[func](GameEvent.PURCHASE_DENY, this.onPurchaseDeny, this);
    }

    private onCheckPlaceAvailability(node: Node, radius: number, callback: (isOn: boolean) => void) {
        let isAvailable = true;

        this._staticObjects.forEach(staticObject => {
            if (staticObject.node !== node && staticObject.checkCollision(node, radius)) {
                isAvailable = false;
            }
        });

        callback(isAvailable);
    }

    private onToggleOverlay(isOn: boolean) {
        this._staticObjects = director.getScene().getComponentsInChildren(StaticObject);
    }

    private generateEquipment(equipmentMap: EquipmentMap) {
        const prefab = equipmentMap.prefab;
        const equipment = instantiate(prefab);

        this.node.addChild(equipment);
        gameEventTarget.emit(GameEvent.TOGGLE_PLACER, equipment, true);

    }

    private onPurchaseDeny() {
        
    }
}


