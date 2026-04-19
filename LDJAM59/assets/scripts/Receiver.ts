import { _decorator, Component, Enum, game, MeshRenderer } from 'cc';
import { Colors } from './enums/Colors';
import { GameEvent } from './enums/GameEvent';
import { gameEventTarget } from './plugins/GameEventTarget';
const { ccclass, property } = _decorator;

/** Маркер-компонент. SignalRay эмитит события при попадании в этот объект. */
@ccclass('Receiver')
export class Receiver extends Component {

    @property(MeshRenderer)
    mesh: MeshRenderer = null;

    public colorHex: string;

    public setColorHex(colorHex: string) {
        this.colorHex = colorHex;
    }

}
