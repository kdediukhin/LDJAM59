import { _decorator, Camera, Color, Component, easing, Enum, geometry, instantiate, Material, MeshRenderer, Node, Prefab, Quat, tween, Vec2, Vec3 } from 'cc';
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
	@property([Prefab])
	starshipPrefab: Prefab[] = [];

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

	@property(Prefab)
	particlesAcceptPrefab: Prefab;

	@property(Prefab)
	particlesDenyPrefab: Prefab;

	@property(Path)
	pathAway: Path;
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

		this._subscribeEvents(true);
	}

	onDisable() {
		this._subscribeEvents(false);
	}

	update(deltaTime: number) {

	}
	// endregion

	// region public methods
	launchStarship(colorHex: Colors) {
		const path = this.pathManager.getAvaliablePath();
		const starship = instantiate(this.starshipPrefab[Math.floor(Math.random() * this.starshipPrefab.length)]);
		starship.setParent(this.node);

		this._setStarshipOnPath(starship, path);
		this.pathManager.changePathOccupationStatus(path, true);


		this._colorHex = colorHex;
		const material = new Material();
		material.copy(this.material);
		const color = new Color();
		Color.fromHEX(color, colorHex);
		material.setProperty('mainColor', color);
		this._setStarshipColor(material, starship, path, colorHex);

		this._starships.push(starship);
		const receiver = starship.getComponent(Receiver) ?? starship.getComponentInChildren(Receiver);
		receiver.setColorHex(this._colorHex);

		this._shipReceivers.set(starship, receiver);
	}

	getStarships() {
		return this._starships;
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
		gameEventTarget[func](GameEvent.LAUNCH_STARSHIP, this.onLaunchStarship, this);
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

	_setStarshipColor(material: Material, starship: Node, path: Path, colorHex: string) {

		starship.getComponentsInChildren(MeshRenderer).forEach(mesh => mesh.setMaterialInstance(material, 0));
		// path.getComponent(PathRenderer).setMaterial(material);
		path.getComponent(PathRenderer).setColorHex(colorHex);

	}

	_removeStarship(indexToRemove: number) {
		const starship = this._starships[indexToRemove];
		const path = starship.getComponent(MoverToPoint).currentPath;
		this.pathManager.changePathOccupationStatus(path, false);
		path.getComponent(PathRenderer).fade();
 

		this._starships.splice(indexToRemove, 1);
		// starship.destroy();
		this._flyAwayStarship(starship);
	}

	private _flyAwayStarship(starship: Node) {
		const particle = instantiate(this.particlesAcceptPrefab);
		particle.setParent(starship);

		// Снимаем корабль с текущего пути
		const mover = starship.getComponent(MoverToPoint);
		const oldPath = mover.currentPath;
		this.pathManager.changePathOccupationStatus(oldPath, false);
		oldPath.removeMovable(mover.movingEntity);

		// Создаём копию pathAway и ставим её первую точку на текущую позицию корабля
		const awayPathNode = instantiate(this.pathAway.node);
		awayPathNode.setParent(this.node);
		const shipWorldPos = starship.getWorldPosition();
		const shipWorldRot = starship.getWorldRotation();
		const awayPath = awayPathNode.getComponent(Path);

		// Смещаем и поворачиваем все точки пути:
		// 1) сдвигаем первую точку в позицию корабля
		// 2) поворачиваем вокруг этой точки в соответствии с поворотом корабля
		const firstPointPos = awayPath.node.children[0]?.getWorldPosition();
		if (firstPointPos) {
			awayPath.node.children.forEach(child => {
				const wp = child.getWorldPosition();
				// локальное смещение относительно первой точки пути
				const local = new Vec3(wp.x - firstPointPos.x, wp.y - firstPointPos.y, wp.z - firstPointPos.z);
				// поворачиваем по кватерниону корабля
				Vec3.transformQuat(local, local, shipWorldRot);
				// переносим в мировую позицию корабля
				child.setWorldPosition(shipWorldPos.x + local.x, shipWorldPos.y + local.y, shipWorldPos.z + local.z);
			});
		}
		awayPath.init();

		// Пускаем корабль по awayPath с ускорением, в конце удаляем оба
		mover.acceleration = mover.speed * 2;
		mover.init(awayPath, starship);
		// Восстанавливаем поворот до перехода — MovingEntity в конструкторе
		// сразу snap-ает ноду, поэтому перезаписываем обратно и правим startRotation,
		// чтобы первый slerp плавно начинался с текущего поворота корабля
		starship.setWorldRotation(shipWorldRot);
		mover.movingEntity.startRotation = shipWorldRot.clone();

		// Твин уменьшения масштаба — корабль «улетает вдаль»
		
		tween(starship)
			.to(3, { scale: new Vec3(0.01, 0.01, 0.01) }, { easing: easing.quadIn })
			.start();

		mover.move(null, () => {
			awayPathNode.destroy();
			const idx = this._starships.indexOf(starship);
			if (idx > -1) this._starships.splice(idx, 1);
			this._shipReceivers.delete(starship);
			starship.destroy();
		});
	}
	// endregion

	// region event handlers

	onRayHitSuccess(receiverNode: Node) {
		for (const [starship, receiver] of this._shipReceivers.entries()) {
			if (receiver.node === receiverNode) {
				const indexToRemove = this._starships.indexOf(starship);
				if (indexToRemove > -1) {
					this._removeStarship(indexToRemove);
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
		}

	}

	onPauseStarships() {
		this._starships.forEach(starship => starship.getComponent(MoverToPoint) && starship.getComponent(MoverToPoint).pause());
	}

	onResumeStarships() {
		this._starships.forEach(starship => starship.getComponent(MoverToPoint) && starship.getComponent(MoverToPoint).resume());
	}

	onLaunchStarship(colorHex: Colors) {
		this.launchStarship(colorHex);
	}
	// endregion
}


