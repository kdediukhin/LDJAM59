import { _decorator, AudioSource, Component, Node } from 'cc';
import { gameEventTarget } from './plugins/GameEventTarget';
import { GameEvent } from './enums/GameEvent';
const { ccclass, property } = _decorator;

// region classes-helpers
// endregion

@ccclass('AudioManager')
export class AudioManager extends Component {
	// region editors' fields and properties
	@property(AudioSource)
	backMusic: AudioSource;

	@property(AudioSource)
	successSound: AudioSource;

	@property(AudioSource)
	failSound: AudioSource;

	@property(AudioSource)
	placeSound: AudioSource;
	// endregion

	// region public fields and properties
	// endregion

	// region private fields and properties
	// endregion

	// region life-cycle callbacks
	onEnable() {
		this.backMusic.play();

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
		gameEventTarget[func](GameEvent.RAY_HIT_FAIL, this.onRayHitFail, this);
		gameEventTarget[func](GameEvent.TOGGLE_MOVEMENT, this.onToggleMovement, this)
	}
	// endregion

	// region event handlers
	onRayHitSuccess() {
		this.successSound.play();
	}

	onRayHitFail() {
		this.failSound.play();
	}

	onToggleMovement(isOn: boolean) {
		if (!isOn) {
			this.placeSound.play();
		}
	}
	// endregion
}


