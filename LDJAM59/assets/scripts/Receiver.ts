import { _decorator, Component, Enum, MeshRenderer } from 'cc';
import { Colors } from './enums/Colors';
const { ccclass, property } = _decorator;

/** Маркер-компонент. SignalRay эмитит события при попадании в этот объект. */
@ccclass('Receiver')
export class Receiver extends Component {

    @property({ type: Enum(Colors) })
    colorHex: Colors = Colors.RED;

    @property(MeshRenderer)
    mesh: MeshRenderer = null;

}
