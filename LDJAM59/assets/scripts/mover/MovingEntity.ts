import { _decorator, Component, Node, Quat, Vec3 } from 'cc';
import { BezierCurve } from './BezierCurve';
import { Path } from './Path';
const { ccclass, property } = _decorator;

// region classes-helpers
// endregion

@ccclass('MovingEntity')
export class MovingEntity {
	// region editors' fields and properties
	// endregion

	// region public fields and properties
	public node: Node = null;

	public currentPath: Path = null;
	public currentTargetPointIndex: number = 0;

	public pathPoints: Vec3[] = [];
	public pathRotations: Quat[] = [];

	public initialPosition: Vec3 = new Vec3();
	public initialRotation: Quat = new Quat();

	public startPoint: Vec3 = new Vec3();
	public targetPoint: Vec3 = null;
	public startRotation: Quat = new Quat();
	public endRotation: Quat = new Quat();
	public pathSegmentLength: number = 0;

	public passedDistance: number = 0;
	public pathPercentage: number = 0;

	public pointToStopAt: Vec3 = null;
	// endregion

	// region private fields and properties
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
	constructor(path: Path, node: Node, targetPointIndex: number = 0) {
		this.node = node;

		this.currentPath = path;
		this.currentTargetPointIndex = targetPointIndex;

		if (!this.currentPath.isLooped) {
			this.determinePassedDistanceOnInit(this.currentPath, node, this.currentTargetPointIndex);
		}

		for (let i = this.currentPath.getFullPath().points.length - 1; i >= 0; i--) {
			const point: Vec3 = this.currentPath.getFullPath().points[i].clone();
			this.pathPoints.push(point);
		}
		for (let i = this.currentPath.getFullPath().rotations.length - 1; i >= 0; i--) {
			const rotation: Quat = this.currentPath.getFullPath().rotations[i].clone();
			this.pathRotations.push(rotation);
		}

		const pointTail: Vec3[] = this.pathPoints.splice(this.pathPoints.length - this.currentTargetPointIndex, this.currentTargetPointIndex);
		this.pathPoints = pointTail.concat(this.pathPoints);
		const rotationTail: Quat[] = this.pathRotations.splice(this.pathPoints.length - this.currentTargetPointIndex, this.currentTargetPointIndex);
		this.pathRotations = rotationTail.concat(this.pathRotations);

		this.startPoint = this.pathPoints[0];	

		this.pathSegmentLength = Vec3.distance(this.startPoint, this.pathPoints[this.pathPoints.length - 1]);
		const passedDistanceRatio: number = Vec3.distance(this.startPoint, this.node.getWorldPosition()) / this.pathSegmentLength;

		let rotation: Quat = new Quat();
		Quat.slerp(rotation, this.pathRotations[0], this.pathRotations[this.pathPoints.length - 1], passedDistanceRatio);
		this.node.setWorldRotation(rotation);

		this.startRotation = this.node.getWorldRotation();	

		if (this.currentPath.isLooped) {
			this.pathPoints.splice(0, 0, this.node.getWorldPosition().clone());
			this.pathRotations.splice(0, 0, this.node.getWorldRotation().clone());
		}

		this.targetPoint = this.pathPoints.pop();
		this.endRotation = this.pathRotations.pop();
	}

	determinePassedDistanceOnInit(path: Path, node: Node, targetPointIndex: number = 1) {
		const pathPoints: Vec3[] = path.getFullPath().points;
		this.passedDistance = 0;

		for (let i = 0; i < targetPointIndex - 1; i++) {
			if (pathPoints[i + 1]) {
				this.passedDistance += Vec3.distance(pathPoints[i], pathPoints[i + 1]);
			}
		}

		this.passedDistance += Vec3.distance(pathPoints[targetPointIndex - 1], this.node.worldPosition);
	}

	updatePath() {
		if (!this.currentPath.isLooped) {
			this.determinePassedDistanceOnInit(this.currentPath, this.node, this.currentTargetPointIndex);
		}

		this.pathPoints = [];
		for (let i = this.currentPath.getFullPath().points.length - 1; i >= 0; i--) {
			const point: Vec3 = this.currentPath.getFullPath().points[i].clone();
			this.pathPoints.push(point);
		}
		this.pathRotations = [];
		for (let i = this.currentPath.getFullPath().rotations.length - 1; i >= 0; i--) {
			const rotation: Quat = this.currentPath.getFullPath().rotations[i].clone();
			this.pathRotations.push(rotation);
		}

		const pointTail: Vec3[] = this.pathPoints.splice(this.pathPoints.length - this.currentTargetPointIndex, this.currentTargetPointIndex);
		this.pathPoints = pointTail.concat(this.pathPoints);
		const rotationTail: Quat[] = this.pathRotations.splice(this.pathPoints.length - this.currentTargetPointIndex, this.currentTargetPointIndex);
		this.pathRotations = rotationTail.concat(this.pathRotations);

		this.startPoint = this.pathPoints[0];	

		this.pathSegmentLength = Vec3.distance(this.startPoint, this.pathPoints[this.pathPoints.length - 1]);
		const passedDistanceRatio: number = Vec3.distance(this.startPoint, this.node.getWorldPosition()) / this.pathSegmentLength;

		let rotation: Quat = new Quat();
		Quat.slerp(rotation, this.pathRotations[0], this.pathRotations[this.pathPoints.length - 1], passedDistanceRatio);
		this.node.setWorldRotation(rotation);

		this.startRotation = this.node.getWorldRotation();	

		if (this.currentPath.isLooped) {
			this.pathPoints.splice(0, 0, this.node.getWorldPosition().clone());
			this.pathRotations.splice(0, 0, this.node.getWorldRotation().clone());
		}

		this.targetPoint = this.pathPoints.pop();
		this.endRotation = this.pathRotations.pop();
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


