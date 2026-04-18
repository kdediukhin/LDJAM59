import { _decorator, Component, Node } from 'cc';
import { Path } from './mover/Path';
const { ccclass, property } = _decorator;

// region classes-helpers
// endregion

@ccclass('PathManager')
export class PathManager extends Component {
	// region editors' fields and properties
	// endregion

	// region public fields and properties
	// endregion

	// region private fields and properties
	// endregion

	// region life-cycle callbacks
	onEnable() {

		this.node.children.forEach(child => child.getComponent(Path) && child.getComponent(Path).init());

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
	}
	// endregion

	// region event handlers
	// endregion
}


