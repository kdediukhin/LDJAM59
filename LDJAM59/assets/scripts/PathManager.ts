import { _decorator, Component, Node } from 'cc';
import { Path } from './mover/Path';
import { PathRenderer } from './PathRenderer';
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
	_occupationStatus: boolean[] = [];
	// endregion

	// region life-cycle callbacks
	onEnable() {

		this.node.children.forEach(child => {
			if (child.getComponent(Path)) {
				const path = child.getComponent(Path);
				this._paths.push(path);
				path.init();
				this._occupationStatus.push(false);

				this.scheduleOnce(() => {
					path.getComponent(PathRenderer).init();
					path.getComponent(PathRenderer).toggleMarks(false);
				});
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
		const nonOccupiedIndecies = [];
		for (let i = 0; i < this._occupationStatus.length; i++) {
			if (!this._occupationStatus[i]) {
				nonOccupiedIndecies.push(i);
			}
		}

		const pathIndex = nonOccupiedIndecies[Math.floor(Math.random() * nonOccupiedIndecies.length)];
		const path = this._paths[pathIndex]

		return path;
	}

	changePathOccupationStatus(path: Path, status: boolean) {
		let index;

		for (let i = 0; i < this._paths.length; i++) {
			if (path === this._paths[i]) {
				index = i;
			}
		}

		this._occupationStatus[index] = status;

		path.getComponent(PathRenderer).toggleMarks(status);

	}

	removeAllPaths() {
		this._paths.forEach((path, index) => {
			path.getComponent(PathRenderer).fade();
			this._occupationStatus[index] = false;
		});
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


