import { _decorator, Component, Node } from 'cc';
import { gameEventTarget } from './plugins/GameEventTarget';
import { GameEvent } from './enums/GameEvent';
import { Colors } from './enums/Colors';
import { StarshipManager } from './StarshipManager';
import { Receiver } from './Receiver';
const { ccclass, property } = _decorator;

// region classes-helpers
// endregion

@ccclass('StateController')
export class StateController extends Component {
	// region editors' fields and properties
	@property(StarshipManager)
	starshipManager: StarshipManager;
	// endregion

	// region public fields and properties
	// endregion

	// region private fields and properties
	_levels: any[] = [];
	_cLevel = 0;
	_successCount = 0;
	_pendingLaunches = 0;
	_colorsNotUsed: Colors[] = [];
	// endregion

	// region life-cycle callbacks
	onEnable() {
		this._levels = [
			{countToReach: 0, starshipCount: 1},
			{countToReach: 3, starshipCount: 2},
			{countToReach: 5, starshipCount: 4},
			{countToReach: 9, starshipCount: 6},
			{countToReach: 13, starshipCount: 8},
			{countToReach: 19, starshipCount: 10}
		]

		this._colorsNotUsed = Object.values(Colors).slice();
		this.scheduleOnce(() => this._checkLevelAndStarships());

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

	_checkLevelAndStarships() {
		if (this._cLevel < this._levels.length - 1) {
			const nextLevelDesc = this._levels[this._cLevel + 1];

			if (nextLevelDesc.countToReach <= this._successCount) {
				this._cLevel ++;

				gameEventTarget.emit(GameEvent.LEVEL_UPDATE, this._cLevel);

				if (this._cLevel === 2) {
					gameEventTarget.emit(GameEvent.CAMERA_TRANSITION, 1);
				} else if (this._cLevel === 3) {
					gameEventTarget.emit(GameEvent.CAMERA_TRANSITION, 2);
				} else if (this._cLevel === 5) {
					gameEventTarget.emit(GameEvent.CAMERA_TRANSITION, 3);
				}
			}
		}

		const targetShipNum = this._levels[this._cLevel].starshipCount;
		const cShipNum = this.starshipManager.getStarships().length;
		const requiredDelta = targetShipNum - cShipNum - this._pendingLaunches;

		if (requiredDelta > 0) {
			for (let i = 0; i < requiredDelta; i++) {
				this.scheduleOnce(() => {
					this._requestLaunch();
					this._pendingLaunches--;
				}, .3 * i);
				this._pendingLaunches++;
			}
		}
	}

	_requestLaunch() {
		const colorIndex = Math.floor(Math.random() * this._colorsNotUsed.length)
		const randColorHex = this._colorsNotUsed[colorIndex];
		this._colorsNotUsed.splice(colorIndex, 1);
		gameEventTarget.emit(GameEvent.LAUNCH_STARSHIP, randColorHex);
	}
	// endregion

	// region event handlers
	onRayHitSuccess(recieverNode: Node) {
		
		this._colorsNotUsed.push(recieverNode.getComponent(Receiver).colorHex as Colors);
		this._successCount++;
		this.scheduleOnce(() => {
			this._checkLevelAndStarships();			
		});
	}
	// endregion
}


