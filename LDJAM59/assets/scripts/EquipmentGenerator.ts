import { _decorator, Component, Enum, instantiate, Node, Prefab } from 'cc';
import { GameEvent } from './enums/GameEvent';
import { gameEventTarget } from './plugins/GameEventTarget';
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


    onEnable() {
        this._subscribeEvents(true);
    }

    onDisable() {
        this._subscribeEvents(false);
    }

    private _subscribeEvents(isOn: boolean) {
        const func = isOn ? 'on' : 'off';

        this.equipmentMaps.forEach(equipmentMap => {
            if (equipmentMap.generateEvent !== GameEvent.NONE) {
                gameEventTarget[func](equipmentMap.generateEvent, () => this.generateEquipment(equipmentMap), this);
            }
        });
    }

    private generateEquipment(equipmentMap: EquipmentMap) {
        const prefab = equipmentMap.prefab;
        const equipment = instantiate(prefab);

        this.node.addChild(equipment);
        gameEventTarget.emit(GameEvent.TOGGLE_PLACER, equipment, true);

    }

}


