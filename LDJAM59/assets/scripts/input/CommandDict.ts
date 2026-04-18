import { Vec2 } from 'cc';
import { gameEventTarget } from '../plugins/GameEventTarget'
import { GameEvent } from '../enums/GameEvent'
import { ScreenButton } from './ScreenButton';

export const CommandDict = {
	
	screenButtonInput(button: ScreenButton) {
		gameEventTarget.emit(GameEvent.INPUT_START, button.touchCurrPos);
	},
}
