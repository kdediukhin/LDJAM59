import { _decorator, Camera, Component, geometry, instantiate, Material, MeshRenderer, Node, Prefab, Vec2 } from 'cc';
import { PathManager } from './PathManager';
import { MoverToPoint } from './mover/MoverToPoint';
import { Path } from './mover/Path';
import { gameEventTarget } from './plugins/GameEventTarget';
import { GameEvent } from './enums/GameEvent';
import { PathRenderer } from './PathRenderer';
const { ccclass, property } = _decorator;

// region classes-helpers
// endregion

@ccclass('StarshipManager')
export class StarshipManager extends Component {
	// region editors' fields and properties
	@property(Prefab)
	starshipPrefab: Prefab;

	@property(PathManager)
	pathManager: PathManager;

	@property
	relaunchInterval: number = 3;

	@property([Material])
	colorMaterials: Material[] = [];

	@property(Camera)
	mainCamera: Camera;
	// endregion

	// region public fields and properties
	// endregion

	// region private fields and properties
	_starships: Node[] = [];
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
		
		this._setStarshipOnPath(starship, path);
		this.pathManager.changePathOccupationStatus(path, true);

		const material = this.colorMaterials[Math.floor(Math.random() * this.colorMaterials.length)];
		this._setStarshipColor(material, starship, path);

		this._starships.push(starship);
	}	
	// endregion

	// region private methods
	_subscribeEvents(isOn: boolean) {
		const func = isOn? 'on': 'off';

		gameEventTarget[func](GameEvent.ALLSCREEN_INPUT, this.onAllscreenInput, this);
	}

	_setStarshipOnPath(starship: Node, path: Path) {
		const startPos = path.getFullPath().points[0];
		starship.setPosition(startPos);

		const mover = starship.getComponent(MoverToPoint);
		mover.init(path, starship);
		mover.move(null, () => {
			this.scheduleOnce(() => {
				this._setStarshipOnPath(starship, path);
			}, this.relaunchInterval);
		});
	}

	_setStarshipColor(material: Material, starship: Node, path: Path) {
		
		starship.getComponentsInChildren(MeshRenderer).forEach(mesh => mesh.setMaterialInstance(material, 0));
		path.getComponent(PathRenderer).setMaterial(material);

	}

	_removeStarship(indexToRemove: number) {
		const starship = this._starships[indexToRemove];
		const path = starship.getComponent(MoverToPoint).currentPath;
		this.pathManager.changePathOccupationStatus(path, false);

		this._starships.splice(indexToRemove, 1);
		starship.destroy();
	}
	// endregion

	// region event handlers
	onAllscreenInput(touchLoc: Vec2) {
		const ray = new geometry.Ray();
		this.mainCamera.screenPointToRay(touchLoc.x, touchLoc.y, ray);
		let indexToRemove = -1;

		this._starships.forEach((starship, index) => {
			const worldPos = starship.getWorldPosition();
			const radius = .5;
			const sphere = new geometry.Sphere(worldPos.x, worldPos.y, worldPos.z, radius);

			const intersection = geometry.intersect.raySphere(ray, sphere);

			if (intersection > 0) {
				indexToRemove = index;
			}
		});

		if (indexToRemove > -1) {
			this._removeStarship(indexToRemove);

			this.scheduleOnce(() => {
				this.launchStarship()
			}, this.relaunchInterval);
		}
		
	}
	// endregion
}


