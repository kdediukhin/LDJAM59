import { _decorator, Camera, Color, Component, Enum, geometry, instantiate, Material, MeshRenderer, Node, Prefab, Vec2 } from 'cc';
import { PathManager } from './PathManager';
import { MoverToPoint } from './mover/MoverToPoint';
import { Path } from './mover/Path';
import { gameEventTarget } from './plugins/GameEventTarget';
import { GameEvent } from './enums/GameEvent';
import { PathRenderer } from './PathRenderer';
import { Colors } from './enums/Colors';
import { Receiver } from './Receiver';
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

	@property(Material)
	material: Material = null;

	// @property({ type: Enum(Colors) })
	// color: Colors;

	@property(Camera)
	mainCamera: Camera;
	// endregion

	// region public fields and properties
	// endregion

	// region private fields and properties
	_starships: Node[] = [];
	private _colorHex: string
	private _shipReceivers: Map<Node, Receiver> = new Map();
	// endregion

	// region life-cycle callbacks
	onEnable() {

		this.scheduleOnce(() => { this.launchStarship() }, .1);

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

		const randColorHex = Object.values(Colors)[Math.floor(Math.random() * Object.keys(Colors).length)];
		this._colorHex = randColorHex;
		const material = new Material();
		material.copy(this.material);
		const color = new Color();
		Color.fromHEX(color, randColorHex);
		material.setProperty('mainColor', color);
		this._setStarshipColor(material, starship, path);

		this._starships.push(starship);
		const receiver = starship.getComponent(Receiver) ?? starship.getComponentInChildren(Receiver);
		receiver.setColorHex(this._colorHex);
		
		this._shipReceivers.set(starship, receiver);
	}
	// endregion

	// region private methods
	_subscribeEvents(isOn: boolean) {
		const func = isOn ? 'on' : 'off';

		// gameEventTarget[func](GameEvent.ALLSCREEN_INPUT, this.onAllscreenInput, this);
		// gameEventTarget[func](GameEvent.RAY_HIT_RECEIVED, this.onRayHitReceived, this);
		gameEventTarget[func](GameEvent.RAY_HIT_SUCCESS, this.onRayHitSuccess, this);
		gameEventTarget[func](GameEvent.PAUSE_STARSHIPS, this.onPauseStarships, this);
		gameEventTarget[func](GameEvent.RESUME_STARSHIPS, this.onResumeStarships, this);
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

	onRayHitSuccess(receiverNode: Node) {
		for (const [starship, receiver] of this._shipReceivers.entries()) {			
			if (receiver.node === receiverNode) {
				const indexToRemove = this._starships.indexOf(starship);
				if (indexToRemove > -1) {
					this._removeStarship(indexToRemove);
					
					this.scheduleOnce(() => {
						this.launchStarship()
					}, this.relaunchInterval);
				}
			}
		}
	}

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

	onPauseStarships() {
		this._starships.forEach(starship => starship.getComponent(MoverToPoint) && starship.getComponent(MoverToPoint).pause());
	}

	onResumeStarships() {
		this._starships.forEach(starship => starship.getComponent(MoverToPoint) && starship.getComponent(MoverToPoint).resume());
	}
	// endregion
}


