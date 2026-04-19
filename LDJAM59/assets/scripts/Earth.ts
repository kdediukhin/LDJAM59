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
	// endregion

	// region life-cycle callbacks
	onEnable() {
		Object.values(Colors).forEach(color => this._signalMap.set(color, null));

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
		const func = isOn? 'on': 'off';

		gameEventTarget[func](GameEvent.LAUNCH_STARSHIP, this.onLaunchStarship, this);
		gameEventTarget[func](GameEvent.RAY_HIT_SUCCESS, this.onRayHitSuccess, this);
	}
	// endregion

	// region event handlers
	onLaunchStarship(colorHex: Colors) {
		const signal = instantiate(this.signalPrefab);
		signal.setParent(this.node);
		signal.setPosition(v3());

		signal.getComponent(SignalRay).colorHex = colorHex;
		const randAngle = Math.PI / 2 * Math.random();
		signal.getComponent(SignalRay).direction = v3(Math.cos(randAngle), 0, -Math.sin(randAngle));

		this._signalMap.set(colorHex, signal);
	}

	onRayHitSuccess(receiverNode: Node) {
		const colorHex = receiverNode.getComponent(Receiver).colorHex as Colors;

		const signal = this._signalMap.get(colorHex);
		signal.destroy();
		this._signalMap.set(colorHex, null);
	}
	// endregion
}


