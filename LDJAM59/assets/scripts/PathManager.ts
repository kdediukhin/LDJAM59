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
	_paths: Path[] = [];
	// endregion

	// region life-cycle callbacks
	onEnable() {

		this.node.children.forEach(child => {
			if (child.getComponent(Path)) {
				const path = child.getComponent(Path);
				this._paths.push(path);
				path.init();
			}
		});

		this._subscribeEvents(true);
	}

	onDisable() {
		this._subscribeEvents(false);
	}

	update(deltaTime: number) {
		
	}
	// endregion

	// region public methods
	getAvaliablePath(): Path {
		return this._paths[Math.floor(Math.random() * this._paths.length)];
	}
	// endregion

	// region private methods
	_subscribeEvents(isOn: boolean) {
		const func = isOn? 'on': 'off';
	}
	// endregion

	// region event handlers
	// endregion
}


