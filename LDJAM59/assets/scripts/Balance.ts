import { _decorator, Component, Label, Node } from 'cc';
import { gameEventTarget } from './plugins/GameEventTarget';
import { GameEvent } from './enums/GameEvent';
const { ccclass, property } = _decorator;

// region classes-helpers
// endregion

@ccclass('Balance')
export class Balance extends Component {
	// region editors' fields and properties
	@property(Label)
	balanceLabel: Label;

	@property
	successReward = 10;

	@property
	failFine = 10;
	// endregion

	// region public fields and properties
	// endregion

	// region private fields and properties
	_cBalance = 100;
	_failedNodes: Node[] = [];
	_hittedNodes: Node[] = [];
	// endregion

	// region life-cycle callbacks
	onEnable() {
		this._subscribeEvents(true);
	}

	onDisable() {
		this._subscribeEvents(false);
	}

	update(deltaTime: number) {
		this._failedNodes = this._failedNodes.filter(node => this._hittedNodes.indexOf(node) > -1);
		this._hittedNodes = [];
	}
	// endregion

	// region public methods
	// endregion

	// region private methods
	_subscribeEvents(isOn: boolean) {
		const func = isOn? 'on': 'off';

		gameEventTarget[func](GameEvent.RAY_HIT_SUCCESS, this.onRayHitSuccess, this);
		gameEventTarget[func](GameEvent.RAY_HIT_FAIL, this.onRayHitFail, this);
	}

	_updateBalance() {
		this.balanceLabel.string = this._cBalance.toString();
	}
	// endregion

	// region event handlers
	onRayHitSuccess() {
		this._cBalance += this.successReward;
		this._updateBalance();
	}

	onRayHitFail(reciverNode: Node) {
		if (this._failedNodes.indexOf(reciverNode) < 0) {
			this._cBalance = Math.max(0, this._cBalance - this.failFine);
			this._updateBalance();
			this._failedNodes.push(reciverNode);
		}
		this._hittedNodes.push(reciverNode);
		
	}
	// endregion
}


