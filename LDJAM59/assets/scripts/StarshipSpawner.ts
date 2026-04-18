import { _decorator, Component, instantiate, Node, Prefab } from 'cc';
import { PathManager } from './PathManager';
import { MoverToPoint } from './mover/MoverToPoint';
const { ccclass, property } = _decorator;

// region classes-helpers
// endregion

@ccclass('StarshipSpawner')
export class StarshipSpawner extends Component {
	// region editors' fields and properties
	@property(Prefab)
	starshipPrefab: Prefab;

	@property(PathManager)
	pathManager: PathManager;
	// endregion

	// region public fields and properties
	// endregion

	// region private fields and properties
	// endregion

	// region life-cycle callbacks
	onEnable() {
		
		this.scheduleOnce(() => {this.launchStarship()}, .1);

		this._subscribeEvents(true);
	}

	onDisable() {
		this._subscribeEvents(false);
	}

	update(deltaTime: number) {
		
	}
	// endregion

	// region public methods
	launchStarship() {
		const path = this.pathManager.getAvaliablePath();
		const starship = instantiate(this.starshipPrefab);
		starship.setParent(this.node);
		const startPos = path.getFullPath().points[0];
		starship.setPosition(startPos)
		console.log(path);
		
		const mover = starship.getComponent(MoverToPoint);
		mover.init(path, starship);
		mover.move(null, () => {
			console.log('starship arrived');
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


