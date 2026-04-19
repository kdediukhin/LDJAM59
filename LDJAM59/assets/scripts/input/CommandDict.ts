import { Vec2 } from 'cc';
import { gameEventTarget } from '../plugins/GameEventTarget'
import { GameEvent } from '../enums/GameEvent'
import { ScreenButton } from './ScreenButton';

export const CommandDict = {
	
	
	allscreenUpCommand(button: ScreenButton) {

		gameEventTarget.emit(GameEvent.ALLSCREEN_INPUT, button.touchCurrPos);
	},
	
	moveEquipmentCommand(button: ScreenButton) {
		gameEventTarget.emit(GameEvent.MOVE_PLACER, button.touchCurrPos);
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
		gameEventTarget.emit(GameEvent.TOGGLE_OVERLAY, false);
	},

	denyPressCommand(button: ScreenButton) {
		gameEventTarget.emit(GameEvent.TOGGLE_OVERLAY, false);
	}
}
