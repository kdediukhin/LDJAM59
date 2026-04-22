import { _decorator, Component, instantiate, Node, Prefab, v3 } from 'cc';
import { gameEventTarget } from './plugins/GameEventTarget';
import { GameEvent } from './enums/GameEvent';
import { Colors } from './enums/Colors';
import { SignalRay } from './SignalRay';
import { Receiver } from './Receiver';
const { ccclass, property } = _decorator;

// region classes-helpers
// endregion

@ccclass('Earth')
export class Earth extends Component {
	// region editors' fields and properties
	@property(Prefab)
	signalPrefab: Prefab;
	// endregion

	// region public fields and properties
	// endregion

	// region private fields and properties
	_signalMap: Map<Colors, Node | null> = new Map();
	_isFirst: boolean = true;
	_enableAngles: number[] = [];
	_raysAngles: Map<Node, number> = new Map();
	// endregion

	// region life-cycle callbacks
	onEnable() {
		Object.values(Colors).forEach(color => this._signalMap.set(color, null));
		for (let i = 0; i < Math.PI / 2; i += Math.PI / 2 * .1) {
			this._enableAngles.push(i);
		}

		this._subscribeEvents(true);
	}

	onDisable() {
		this._subscribeEvents(false);
	}

	update(deltaTime: number) {

	}
	// endregion

	// region public methods
	// endregion

	// region private methods
	_subscribeEvents(isOn: boolean) {
		const func = isOn ? 'on' : 'off';

		gameEventTarget[func](GameEvent.LAUNCH_STARSHIP, this.onLaunchStarship, this);
		gameEventTarget[func](GameEvent.RAY_HIT_SUCCESS, this.onRayHitSuccess, this);
		gameEventTarget[func](GameEvent.REMOVE_SIGNAL, this.onRemoveSignal, this);
	}
	// endregion

	// region event handlers
	onLaunchStarship(colorHex: Colors) {
		const signal = instantiate(this.signalPrefab);
		signal.setParent(this.node);
		signal.setPosition(v3());

		signal.getComponent(SignalRay).colorHex = colorHex;
		let angle;
		if (this._isFirst) {
			angle = Math.PI / 2 * .75;
			this._isFirst = false;
		} else {
			angle = this._enableAngles[Math.floor(Math.random() * this._enableAngles.length)];
		}
		this._enableAngles = this._enableAngles.filter(a => a !== angle);
		this._raysAngles.set(signal, angle);
		signal.getComponent(SignalRay).direction = v3(Math.cos(angle), 0, -Math.sin(angle));

		this._signalMap.set(colorHex, signal);
	}

	onRayHitSuccess(receiverNode: Node) {
		const colorHex = receiverNode.getComponent(Receiver).colorHex as Colors;

		const signal = this._signalMap.get(colorHex);
		const angle = this._raysAngles.get(signal);
		this._enableAngles.push(angle!);
		this._raysAngles.delete(signal!);
		signal.destroy();
		this._signalMap.set(colorHex, null);
	}

	onRemoveSignal(colorHex: Colors) {
		const signal = this._signalMap.get(colorHex);
		if (!signal) return;
		const angle = this._raysAngles.get(signal);
		this._enableAngles.push(angle!);
		this._raysAngles.delete(signal!);
		signal.destroy();
		this._signalMap.set(colorHex, null);
	}
	// endregion
}


