import { Vec2 } from 'cc';
import { gameEventTarget } from '../plugins/GameEventTarget'
import { GameEvent } from '../enums/GameEvent'
import { ScreenButton } from './ScreenButton';

export const CommandDict = {


	allscreenUpCommand(button: ScreenButton) {
		gameEventTarget.emit(GameEvent.ALLSCREEN_INPUT, button.touchCurrPos);
	},

	moveEquipmentCommand(button: ScreenButton) {
		gameEventTarget.emit(GameEvent.MOVE_PLACER, button.touchCurrPos, button.touchUiPos, button);
	},

	rotateEquipmentCommand(button: ScreenButton) {
		gameEventTarget.emit(GameEvent.ROTATE_PLACER, button.touchCurrPos, button.touchStartPos, button);
	},

	pressPurchaseReflectorButtton(button: ScreenButton) {
		gameEventTarget.emit(GameEvent.ADD_REFLECTOR, true);
		gameEventTarget.emit(GameEvent.TOGGLE_OVERLAY, true);
	},

	pressPurchaseAmplifierButtton(button: ScreenButton) {
		gameEventTarget.emit(GameEvent.ADD_AMPLIFIER, true);
		gameEventTarget.emit(GameEvent.TOGGLE_OVERLAY, true);
	},


	checkPressCommand(button: ScreenButton) {
		gameEventTarget.emit(GameEvent.PURCHASE_ACCEPT, true);
		gameEventTarget.emit(GameEvent.TOGGLE_OVERLAY, false);
	},

	denyPressCommand(button: ScreenButton) {
		gameEventTarget.emit(GameEvent.PURCHASE_DENY, true);
		gameEventTarget.emit(GameEvent.TOGGLE_OVERLAY, false);
	},

	toggleRotationOn(button: ScreenButton) {
		gameEventTarget.emit(GameEvent.TOGGLE_ROTATION, true, button);
	},

	toggleRotationOff(button: ScreenButton) {
		gameEventTarget.emit(GameEvent.TOGGLE_ROTATION, false, button);
	},

	toggleMovementOn(button: ScreenButton) {
		gameEventTarget.emit(GameEvent.TOGGLE_MOVEMENT, true, button);
	},

	toggleMovementOff(button: ScreenButton) {
		gameEventTarget.emit(GameEvent.TOGGLE_MOVEMENT, false, button);
	},

	destroyItemCommand(button: ScreenButton) {
		gameEventTarget.emit(GameEvent.DESTROY_ITEM, button);
	}

}
