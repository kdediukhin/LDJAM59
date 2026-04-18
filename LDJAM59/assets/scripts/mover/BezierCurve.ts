import { _decorator, Component, instantiate, Node, Prefab, Quat, v2, v3, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

// region classes-helpers
// endregion

@ccclass('BezierCurve')
export class BezierCurve {
	// region editors' fields and properties
	// endregion

	// region public fields and properties
	public pathNodes: Node[];
	public pointsInSpan: number;
	public pathPointPrefab: Prefab;
	public controlPointPrefab: Prefab;
	// endregion

	// region private fields and properties
	private _controlPoints: Vec3[] = [];
	private _pathPoints: Vec3[] = [];
	private _pathRotations: Quat[] = [];
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
	constructor(pathNodes: Node[], pointsInSpan: number = 10, pointPrefab?: Prefab, controlPoint?: Prefab) {
		this.pathNodes = pathNodes;
		this.pointsInSpan = pointsInSpan;
		this.pathPointPrefab = pointPrefab;
		this.controlPointPrefab = controlPoint;
	}

	init(isLooped: boolean = false, is3D: boolean = false) {
		const pathNodesLength: number = isLooped ? this.pathNodes.length : this.pathNodes.length - 1;
		for (let i = 0; i < pathNodesLength; i++) {
			if (this._checkLinearSpan(i)) {
				this._controlPoints[i] = null;
			} else {
				is3D ? this._setSpanCurveControl3D(i) : this._setSpanCurveControl(i);
			}
		}

		console.log(this._controlPoints);
		for (let i = 0; i < pathNodesLength * this.pointsInSpan; i++) {
			const time = i / this.pointsInSpan;

			const { point, rotation } = this._getPointAngleInPath(time);	

			if (!this._controlPoints[Math.floor(time)] && time % 1 > 0) {
				continue;
			}		
			
			this._pathPoints.push(point);
			this._pathRotations.push(rotation);
		}

		if (!isLooped) {
			this._pathPoints.push(this.pathNodes[this.pathNodes.length - 1].getWorldPosition().clone());
			this._pathRotations.push(this.pathNodes[this.pathNodes.length - 1].getWorldRotation().clone());
		}
	}

	setDebugPoints(parentNode: Node) {
		for (let i = 0; i < this._pathPoints.length; i++) {
			const point = this._pathPoints[i];
			const rotation = this._pathRotations[i];

			if (this.pathPointPrefab) {
				const pathPoint = instantiate(this.pathPointPrefab);
				pathPoint.setParent(parentNode);
				pathPoint.setWorldPosition(point);
				pathPoint.setWorldRotation(rotation);
			}
		}
		
		for (let i = 0; i < this._controlPoints.length; i++) {
			const controlPoint = this._controlPoints[i];

			if (controlPoint && this.controlPointPrefab) {
				const controlPointNode = instantiate(this.controlPointPrefab);
				controlPointNode.setParent(parentNode);
				controlPointNode.setWorldPosition(controlPoint);
			}			
		}		
	}

	getPathFromToSpan(fromSpanIndex: number, toSpanIndex: number) {
		const toPathIndex = toSpanIndex * this.pointsInSpan;
		const fromPathIndex = fromSpanIndex * this.pointsInSpan;
		const truncatedPathPoints = this._pathPoints.slice(fromPathIndex, toPathIndex + 1);
		const truncatedPathRotations = this._pathRotations.slice(fromPathIndex, toPathIndex + 1);

		return { points: truncatedPathPoints, rotations: truncatedPathRotations };
	}

	getFullPath() {
		return { points: this._pathPoints, rotations: this._pathRotations };
	}
	// endregion

	// region private methods
	_subscribeEvents(isOn: boolean) {
		const func = isOn? 'on': 'off';
	}

	_checkLinearSpan(index: number) {
		if (this.pathNodes.length > 0 && index < this.pathNodes.length - 1) {
			const startPointRotation: Quat = this.pathNodes[index].getWorldRotation();
			const endPointRotation: Quat = this.pathNodes[index + 1].getWorldRotation();

			return Quat.equals(startPointRotation, endPointRotation);
		} else if (index === this.pathNodes.length - 1) {
			const startPointRotation: Quat = this.pathNodes[this.pathNodes.length - 1].getWorldRotation();
			const endPointRotation: Quat = this.pathNodes[0].getWorldRotation();

			return Quat.equals(startPointRotation, endPointRotation);
		} else {
			return true;
		}
	}

	_setSpanCurveControl(index: number) {
		// console.log(' set control');
		const startPointIndex: number = index;
		const endPointIndex: number = startPointIndex === this.pathNodes.length - 1 ? 0 : startPointIndex + 1;

		const cPos = this.pathNodes[startPointIndex].worldPosition;
		const cPos2D = v2(cPos.x, cPos.z);
		const cForward = this.pathNodes[startPointIndex].forward;
		const cDir = v2(cForward.x, cForward.z);

		const nPos = this.pathNodes[endPointIndex].worldPosition;
		const nPos2D = v2(nPos.x, nPos.z);
		const nForward = this.pathNodes[endPointIndex].forward;
		const nDir = v2(nForward.x, nForward.z);

		const nCentPos = Vec2.subtract(v2(), nPos2D, cPos2D);
		const t = Vec2.cross(nCentPos, nDir) / Vec2.cross(cDir, nDir);
		const controlPos2D = Vec2.add(v2(), cPos2D, Vec2.multiplyScalar(v2(), cDir, t));
		// debugger;
		this._controlPoints[index] = v3(controlPos2D.x, (cPos.y + nPos.y) * .5, controlPos2D.y);
	}

	_setSpanCurveControl3D(index: number) {
		const startPointIndex: number = index;
		const endPointIndex: number = startPointIndex === this.pathNodes.length - 1 ? 0 : startPointIndex + 1;

		const cPos: Vec3  = this.pathNodes[startPointIndex].worldPosition;
		const cForward: Vec3 = this.pathNodes[startPointIndex].forward;
		cForward.negative();

		const nPos: Vec3  = this.pathNodes[endPointIndex].worldPosition;
		const nForward: Vec3 = this.pathNodes[endPointIndex].forward;
		nForward.negative();

		const nCentPos = Vec3.subtract(v3(), nPos, cPos);
		const t = Vec3.cross(v3(), nCentPos, nForward).length() / Vec3.cross(v3(), cForward, nForward).length();
		const controlPos = Vec3.add(v3(), cPos, Vec3.multiplyScalar(v3(), cForward, t));

		this._controlPoints[index] = v3(controlPos.x, controlPos.y, controlPos.z);
	}

	_getPointAngleInPath(t: number) {
		const spanIndex = Math.floor(t);
		const spanT = t - spanIndex;

		if (this._controlPoints[spanIndex]) {
			return this._getPointAngleInCurve(spanIndex, spanT);
		} else {
			return this._getPointAngleInLine(spanIndex, spanT);
		}
	}

	_getPointAngleInLine(index: number, t: number) {
		let point: Vec3;
		let rotation: Quat = new Quat();

		const startPointIndex: number = index;
		const endPointIndex: number = startPointIndex === this.pathNodes.length - 1 ? 0 : startPointIndex + 1;

		const p0 = this.pathNodes[startPointIndex].worldPosition;
		const p1 = this.pathNodes[endPointIndex].worldPosition;

		point = Vec3.lerp(v3(), p0, p1, t);

		const delta = Vec3.subtract(v3(), p1, p0);
		delta.normalize();
		Quat.fromViewUp(rotation, delta);

		return { point, rotation };
	}

	_getPointAngleInCurve(index: number, t: number) {
		const startPointIndex: number = index;
		const endPointIndex: number = startPointIndex === this.pathNodes.length - 1 ? 0 : startPointIndex + 1;

		const startPoint: Vec3 = this.pathNodes[startPointIndex].worldPosition;
		const controlPoint: Vec3 = this._controlPoints[startPointIndex];
		const endPoint: Vec3 = this.pathNodes[endPointIndex].worldPosition;

		const startPointRotation: Quat = this.pathNodes[startPointIndex].worldRotation;
		const endPointRotation: Quat = this.pathNodes[endPointIndex].worldRotation;

		const point = Vec3.multiplyScalar(v3(), startPoint, Math.pow(1 - t, 2));
		point.add(Vec3.multiplyScalar(v3(), controlPoint, 2 * (1 - t) * t));
		point.add(Vec3.multiplyScalar(v3(), endPoint, Math.pow(t, 2)));

		const derivative = Vec3.multiplyScalar(v3(), Vec3.subtract(v3(), controlPoint, startPoint), 2 * (1 - t));
		derivative.add(Vec3.multiplyScalar(v3(), Vec3.subtract(v3(), endPoint, controlPoint), 2 * t));
		derivative.normalize();

		let rotation: Quat = new Quat();
		Quat.fromViewUp(rotation, derivative);	

		return { point, rotation };
	}
	// endregion

	// region event handlers
	// endregion
}


