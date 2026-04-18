import { Vec2 } from 'cc';
import { gameEventTarget } from '../plugins/GameEventTarget'
import { GameEvent } from '../enums/GameEvent'
import { ScreenButton } from './ScreenButton';

export const CommandDict = {
	allscreenUpCommand(button: ScreenButton) {

		gameEventTarget.emit(GameEvent.ALLSCREEN_INPUT, button.touchCurrPos);
	}
}
