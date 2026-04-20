import { _decorator, Component, Label, Node } from 'cc';
import { gameEventTarget } from './plugins/GameEventTarget';
import { GameEvent } from './enums/GameEvent';
const { ccclass, property } = _decorator;

// region classes-helpers
// endregion

@ccclass('PurchaseController')
export class PurchaseController extends Component {
	// region editors' fields and properties
	@property
	amplifierPrice = 50;

	@property(Label)
	amplifierPriceLabel: Label;

	@property
	reflectorPrice = 50;

	@property(Label)
	reflectorPriceLabel: Label;
	// endregion

	// region public fields and properties
	// endregion

	// region private fields and properties
	// endregion

	// region life-cycle callbacks
	onEnable() {
		this.amplifierPriceLabel.string = this.amplifierPrice.toString();
		this.reflectorPriceLabel.string = this.reflectorPrice.toString();

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

		gameEventTarget[func](GameEvent.TRY_ADD_AMPLIFIER, this.onTryAddAmplifier, this);
		gameEventTarget[func](GameEvent.TRY_ADD_REFLECTOR, this.onTryAddReflector, this);
	}
	// endregion

	// region event handlers
	onTryAddAmplifier() {
		gameEventTarget.emit(GameEvent.REQUEST_PURCHASE, this.amplifierPrice, 
			isSuccess => isSuccess && gameEventTarget.emit(GameEvent.ADD_AMPLIFIER));
	}

	onTryAddReflector() {
		gameEventTarget.emit(GameEvent.REQUEST_PURCHASE, this.reflectorPrice,
			isSuccess => isSuccess && gameEventTarget.emit(GameEvent.ADD_REFLECTOR));
	}
	// endregion
}


