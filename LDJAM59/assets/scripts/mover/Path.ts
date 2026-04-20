import { _decorator, Component, geometry, Node, Prefab, Quat, Vec2, Vec3 } from 'cc';
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
	smoothIterations: number = 3;

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

	// endregion

	// region public fields and properties
	public pathMovables: MovingEntity[] = [];

	public pathLength: number = 0;
	// endregion

	// region private fields and properties
	private _pathBasePoints: Node[] = [];
	private _pathPoints: Vec3[] = [];
	private _pathRotations: Quat[] = [];

	private _interferePaths: { path: Path, percentages: Vec2[] }[] = [];
	private _spline: geometry.Spline = new geometry.Spline();
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
		if (this._pathPoints.length === 0) {
			this._pathBasePoints = this.node.children;
			this._buildSpline();

			this.interferePaths.forEach(interferePath => {
				this._interferePaths.push({ path: interferePath.pathNode.getComponent(Path), percentages: interferePath.percentages });
			});

			this.pathLength = this.getFullPathLength();
		}
	}

	getBasePoints(): Node[] {
		return this._pathBasePoints;
	}

	getFullPath() {
		return { points: this._pathPoints, rotations: this._pathRotations };
	}

	getFullPathLength(): number {
		let length = 0;
		for (let i = 1; i < this._pathPoints.length; i++) {
			length += Vec3.distance(this._pathPoints[i - 1], this._pathPoints[i]);
		}
		return length;
	}

	getPathPoints(): Vec3[] {
		return this._pathPoints;
	}

	getPathRotations(): Quat[] {
		return this._pathRotations;
	}

	isObstructed(): boolean {
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

	getDistanceBetweenPoints(startPoint: Vec3, endPoint: Vec3): number {
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

	getCurve(): geometry.Spline {
		return this._spline;
	}

	// region private methods
	private _buildSpline() {
		const rawKnots = this._pathBasePoints.map((p) => p.getWorldPosition());
		const knots = this._chaikin(rawKnots, this.smoothIterations);
		this._spline.setModeAndKnots(geometry.SplineMode.CATMULL_ROM, knots);

		// Oversampled raw points for arc-length reparameterization
		const oversample = this.precision * this._pathBasePoints.length * 10;
		const raw = this._spline.getPoints(oversample);

		// Build cumulative arc-length table
		const arcLengths: number[] = [0];
		for (let i = 1; i < raw.length; i++) {
			arcLengths.push(arcLengths[i - 1] + Vec3.distance(raw[i - 1], raw[i]));
		}
		const totalLength = arcLengths[arcLengths.length - 1];

		// Resample at equal arc-length intervals
		const targetCount = this.precision * this._pathBasePoints.length;
		const step = totalLength / (targetCount - 1);
		const evenPoints: Vec3[] = [];
		let rawIdx = 0;
		for (let i = 0; i < targetCount; i++) {
			const targetLen = i * step;
			while (rawIdx < arcLengths.length - 2 && arcLengths[rawIdx + 1] < targetLen) {
				rawIdx++;
			}
			const segStart = arcLengths[rawIdx];
			const segEnd = arcLengths[rawIdx + 1] ?? segStart;
			const t = segEnd === segStart ? 0 : (targetLen - segStart) / (segEnd - segStart);
			const p = new Vec3();
			Vec3.lerp(p, raw[rawIdx], raw[rawIdx + 1] ?? raw[rawIdx], t);
			evenPoints.push(p);
		}

		this._pathPoints = evenPoints;
		this._pathRotations = this._pathPoints.map((point, index) => {
			const quat = new Quat();
			const prev = this._pathPoints[index - 1];
			const next = this._pathPoints[index + 1];
			const dir = new Vec3();
			if (prev && next) {
				// центральная разность для промежуточных точек
				Vec3.subtract(dir, next, prev);
			} else if (next) {
				Vec3.subtract(dir, next, point);
			} else if (prev) {
				Vec3.subtract(dir, point, prev);
			}
			if (dir.lengthSqr() > 0) {
				dir.normalize();
				Quat.rotationTo(quat, Vec3.FORWARD, dir);
			}
			return quat;
		});
	}

	// Chaikin corner-cutting: each iteration replaces every edge with two points at 1/4 and 3/4
	private _chaikin(pts: Vec3[], iterations: number): Vec3[] {
		if (iterations <= 0 || pts.length < 2) return pts;
		const result: Vec3[] = [];
		const n = pts.length;
		for (let i = 0; i < n - 1; i++) {
			const a = new Vec3();
			const b = new Vec3();
			Vec3.lerp(a, pts[i], pts[i + 1], 0.25);
			Vec3.lerp(b, pts[i], pts[i + 1], 0.75);
			if (i === 0) result.push(pts[0].clone());
			result.push(a, b);
			if (i === n - 2) result.push(pts[n - 1].clone());
		}
		return this._chaikin(result, iterations - 1);
	}

	_subscribeEvents(isOn: boolean) {
		const func = isOn ? 'on' : 'off';

		this.node[func](GameEvent.PATH_UPDATE_POINTS.toString(), this.onPathUpdatePoints, this);
	}
	// endregion

	// region event handlers
	onPathUpdatePoints() {
		this._pathBasePoints = this.node.children.slice(0, this._pathBasePoints.length);
		this._buildSpline();
		this.pathLength = this.getFullPathLength();

		this.pathMovables.forEach(movable => {
			movable.updatePath();
			movable.node.getComponent(MoverToPoint).setStopPointIndex(this.getFullPath().points.length - 1);
		});
	}
	// endregion
}