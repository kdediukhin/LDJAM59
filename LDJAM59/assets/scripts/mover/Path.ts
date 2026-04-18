import { _decorator, Component, Intersection2D, math, Node, Prefab, Quat, Vec2, Vec3 } from 'cc';
import { BezierCurve } from './BezierCurve';
import { MovingEntity } from './MovingEntity';
import { GameEvent } from '../enums/GameEvent';
import { MoverToPoint } from './MoverToPoint';
const { ccclass, property } = _decorator;

// region classes-helpers
@ccclass('InterferePath')
export class InterferePath {
	@property(Node)
	pathNode: Node = null;

	@property(Vec2)
	percentages: Vec2[] = [];
}
// endregion

@ccclass('Path')
export class Path extends Component {
	// region editors' fields and properties
	@property
	precision: number = 10;

	@property
	isLooped: boolean = false;

	@property
	isIn3DSpace: boolean = false;

	@property({
		type: InterferePath,
        visible() {
            return !this.isLooped;
        }
    })
	interferePaths: InterferePath[] = [];

	@property(Prefab)
	curveDebugPointPrefab: Prefab;

	@property(Prefab)
	curveDebugControlPrefab: Prefab;
	// endregion

	// region public fields and properties
	public pathMovables: MovingEntity[] = [];

	public pathLength: number = 0;
	// endregion

	// region private fields and properties
	private _pathCurve: BezierCurve = null;
	private _pathBasePoints: Node[] = [];
	private _pathPoints: Vec3[] = [];
	private _pathRotations: Quat[] = [];

	private _interferePaths: { path: Path, percentages: Vec2[] }[] = [];
	// endregion

	// region life-cycle callbacks
	onEnable() {
		this._subscribeEvents(true);
	}

	onDisable() {
		this._subscribeEvents(false);
	}

	start() {

	}

	update(deltaTime: number) {

	}
	// endregion

	// region public methods
	init() {
		if (!this._pathCurve) {
			this._pathBasePoints = this.node.children;

			this._pathCurve = new BezierCurve(this.node.children, this.precision, this.curveDebugPointPrefab, this.curveDebugControlPrefab);
			this._pathCurve.init(this.isLooped, this.isIn3DSpace);
			this._pathCurve.setDebugPoints(this.node);

			this._pathPoints = this._pathCurve.getFullPath().points;
			this._pathRotations = this._pathCurve.getFullPath().rotations;

			this.interferePaths.forEach(interferePath => {
				this._interferePaths.push({path: interferePath.pathNode.getComponent(Path), percentages: interferePath.percentages});
			});

			this.pathLength = this.getFullPathLength();
		}
	}

	getBasePoints(): Node[] {
		return this._pathBasePoints;
	}

	getFullPath() {
		return this._pathCurve.getFullPath();
	}

	getFullPathLength(): number {
		let pathLength: number = 0;

		for (let i = 0; i < this._pathPoints.length; i++) {
			const startPoint: Vec3 = this._pathPoints[i];
			
			if (this._pathPoints[i + 1]) {
				const endPoint: Vec3 = this._pathPoints[i + 1];

				pathLength += Vec3.distance(startPoint, endPoint);
			} else {
				continue;
			}	
		}

		return pathLength;
	}

	getPathPoints(): Vec3[] {
		return this._pathPoints;
	}

	getPathRotations(): Quat[] {
		return this._pathRotations;
	}

	isObstructed() : boolean {
		for (let i = 0; i < this._interferePaths.length; i++) {
			const interferePath: { path: Path, percentages: Vec2[] } = this._interferePaths[i];
			const percentages: Vec2[] = interferePath.percentages.length > 0 ? interferePath.percentages : [new Vec2(0, 1)];

			for (let j = 0; j < interferePath.path.pathMovables.length; j++) {
				const pathMovable: MovingEntity = interferePath.path.pathMovables[j];
				if (pathMovable) {
					for (let k = 0; k < percentages.length; k++) {
						const percentage: Vec2 = percentages[k];
						if (pathMovable.pathPercentage >= percentage.x && pathMovable.pathPercentage <= percentage.y) {
							return true;
						}
					}
				}
			}
		}

		return false;
	}

	getDistanceBetweenPoints(startPoint: Vec3, endPoint: Vec3) : number {
		const startPointIndex: number = this._pathPoints.findIndex((point) => Vec3.equals(point, startPoint));
		const endPointIndex: number = this._pathPoints.findIndex((point) => Vec3.equals(point, endPoint));

		let distance: number = 0;

		for (let i = startPointIndex; i < endPointIndex; i++) {
			distance += Vec3.distance(this._pathPoints[i], this._pathPoints[i + 1]);
		}

		return distance;
	}

	addMovable(newMovingEntity: MovingEntity): number {
		const movableIndex: number = this.pathMovables.findIndex((movingEntity) => movingEntity === newMovingEntity);
		if (movableIndex === -1) {
			this.pathMovables.push(newMovingEntity);
		}

		return this.pathMovables.length - 1;
	}

	removeMovable(movingEntityToRemove: MovingEntity) {
		const movableIndex: number = this.pathMovables.findIndex((movingEntity) => movingEntity === movingEntityToRemove);
		if (movableIndex != -1) {
			this.pathMovables.splice(movableIndex, 1);
			
			// this.pathMovables[movableIndex] = null;

			// const activeMovables: MovingEntity[] = this.pathMovables.filter((movingEntity) => movingEntity);
			// if (activeMovables.length === 0) {
			// 	this.pathMovables = [];
			// }
		}
	}

	// region private methods
	_subscribeEvents(isOn: boolean) {
		const func = isOn? 'on': 'off';

		this.node[func](GameEvent.PATH_UPDATE_POINTS.toString(), this.onPathUpdatePoints, this);
	}
	// endregion

	// region event handlers
	onPathUpdatePoints() {
		this._pathBasePoints = this.node.children.slice(0, this._pathBasePoints.length);

		this._pathCurve = new BezierCurve(this._pathBasePoints, this.precision, this.curveDebugPointPrefab, this.curveDebugControlPrefab);
		this._pathCurve.init(this.isLooped, this.isIn3DSpace);

		this._pathPoints = this._pathCurve.getFullPath().points;
		this._pathRotations = this._pathCurve.getFullPath().rotations;

		this.pathLength = this.getFullPathLength();

		this.pathMovables.forEach(movable => {
			movable.updatePath();
			movable.node.getComponent(MoverToPoint).setStopPointIndex(this.getFullPath().points.length - 1);
		});
	}
	// endregion
}