import { _decorator, Component, Node } from 'cc';
import { gameEventTarget } from './plugins/GameEventTarget';
import { GameEvent } from './enums/GameEvent';
import { Colors } from './enums/Colors';
const { ccclass, property } = _decorator;

// region classes-helpers
// endregion

@ccclass('StateController')
export class StateController extends Component {
	// region editors' fields and properties
	// endregion

	// region public fields and properties
	// endregion

	// region private fields and properties
	// endregion

	// region life-cycle callbacks
	onEnable() {
		this.scheduleOnce(() => {
			const randColorHex = Object.values(Colors)[Math.floor(Math.random() * Object.keys(Colors).length)];
			gameEventTarget.emit(GameEvent.LAUNCH_STARSHIP, randColorHex);
		}, 2);

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

		gameEventTarget[func](GameEvent.RAY_HIT_SUCCESS, this.onRayHitSuccess, this);
	}
	// endregion

	// region event handlers
	onRayHitSuccess(colorHex: Colors) {
		this.scheduleOnce(() => {
			const randColorHex = Object.values(Colors)[Math.floor(Math.random() * Object.keys(Colors).length)];
			gameEventTarget.emit(GameEvent.LAUNCH_STARSHIP, randColorHex);
		}, .3);
	}
	// endregion
}


