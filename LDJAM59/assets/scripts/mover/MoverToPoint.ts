import { _decorator, Component, Node, Quat, v3, Vec3 } from 'cc';
import { MovingEntity } from './MovingEntity';
import { Path } from './Path';
import { GameEvent } from '../enums/GameEvent';
const { ccclass, property } = _decorator;

// region classes-helpers
// endregion

@ccclass('MoverToPoint')
export class MoverToPoint extends Component {
	// region editors' fields and properties
	@property
    speed: number = 1;
	// endregion

	// region public fields and properties
	public movingEntity: MovingEntity = null;
	public movableIndex: number = -1;

	public currentPath: Path = null;

	public moveEndCallback: Function = null;
	
	public hasArrived: boolean = true;
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
		if (!this.hasArrived) {
			if (this.movingEntity.targetPoint && !this.hasArrived) {
				const direction: Vec3 = Vec3.subtract(new Vec3(), this.movingEntity.targetPoint, this.movingEntity.node.worldPosition);
				const distanceToTarget: number = Vec3.distance(this.movingEntity.node.worldPosition, this.movingEntity.targetPoint);

				if (distanceToTarget > this.speed * deltaTime) {
					const velocity: Vec3 = direction.normalize().multiplyScalar(this.speed * deltaTime);
					const position: Vec3 = this.movingEntity.node.worldPosition.clone();
					position.add(velocity);
					this.movingEntity.node.setWorldPosition(position);

					this.movingEntity.passedDistance += velocity.length();
					this.movingEntity.pathPercentage = this.movingEntity.passedDistance / this.currentPath.pathLength;

					const passedDistanceRatio: number = Vec3.distance(this.movingEntity.startPoint, this.movingEntity.node.worldPosition) / this.movingEntity.pathSegmentLength;
					let rotation: Quat = new Quat();
					Quat.slerp(rotation, this.movingEntity.startRotation, this.movingEntity.endRotation, passedDistanceRatio);
					this.movingEntity.node.setWorldRotation(rotation);
				} else {
					const leftDirection: Vec3 = Vec3.subtract(new Vec3(), this.movingEntity.pathPoints[this.movingEntity.pathPoints.length - 1], this.movingEntity.targetPoint);
					const leftVelocity: Vec3 = leftDirection.normalize().multiplyScalar((this.speed * deltaTime) - distanceToTarget);
					const leftPosition: Vec3 = this.movingEntity.targetPoint.clone();
					leftPosition.add(leftVelocity);
					this.movingEntity.node.setWorldPosition(leftPosition);

					this.movingEntity.passedDistance += leftVelocity.length();
					this.movingEntity.pathPercentage = this.movingEntity.passedDistance / this.currentPath.pathLength;

					this.movingEntity.node.setWorldRotation(this.movingEntity.endRotation);

					if (this.movingEntity.pointToStopAt && Vec3.equals(this.movingEntity.targetPoint, this.movingEntity.pointToStopAt)) {
						this.movingEntity.node.setWorldPosition(this.movingEntity.pointToStopAt);

						this.hasArrived = true;

						this.currentPath.removeMovable(this.movingEntity);
						this.movableIndex = -1;

						//@ts-ignore
						this.node.emit(GameEvent.MOVER_END_MOVE);

						if (this.moveEndCallback) {
							this.moveEndCallback();
						}

						return;
					}

					if (this.movingEntity.pathPoints.length > 0) {
						this.movingEntity.startPoint = this.movingEntity.node.getWorldPosition();
						this.movingEntity.targetPoint = this.movingEntity.pathPoints.pop();
						this.movingEntity.startRotation = this.movingEntity.node.getWorldRotation();
						this.movingEntity.endRotation = this.movingEntity.pathRotations.pop();
						this.movingEntity.pathSegmentLength = Vec3.distance(this.movingEntity.startPoint, this.movingEntity.targetPoint);
					} else {
						this.hasArrived = true;

						this.currentPath.removeMovable(this.movingEntity);
						this.movableIndex = -1;

						//@ts-ignore
						this.node.emit(GameEvent.MOVER_END_MOVE);

						if (this.moveEndCallback) {
							this.moveEndCallback();
						}
					}
				}
			}
		}
	}
	// endregion

	// region public methods
	init(path: Path, node: Node, targetPointIndex: number = 1) {
		this.currentPath = path;
		this.movingEntity = new MovingEntity(this.currentPath, node, targetPointIndex);
		this.movableIndex = this.currentPath.addMovable(this.movingEntity);
	}
	
	move(stopPoint: Node = null, moveEndCallback: any = null) {
		if (stopPoint) {
			this.setStopPoint(stopPoint);
		} else if (!this.movingEntity.pointToStopAt) {
			this.setStopPosition(this.currentPath.getFullPath().points[this.currentPath.getFullPath().points.length - 1]);
		}

		this.moveEndCallback = moveEndCallback;

		this.hasArrived = false;

		//@ts-ignore
		this.node.emit(GameEvent.MOVER_START_MOVE);
	}

	setStopPoint(point: Node) {
		this.movingEntity.pointToStopAt = point.getWorldPosition().clone();
	}

	setStopPointIndex(index: number) {
		this.setStopPosition(this.currentPath.getFullPath().points[index]);
	}

	setStopPosition(position: Vec3) {
		this.movingEntity.pointToStopAt = position.clone();
	}

	findCurrentSegment(movingEntity: MovingEntity) {
		if (movingEntity.targetPoint) {
			const pathPoints: Vec3[] = this.currentPath.getFullPath().points;
			const targetPointIndex: number = pathPoints.findIndex((value) => Vec3.equals(value, movingEntity.targetPoint));
			
			if (targetPointIndex === 0) {
				return [pathPoints.length - 1, 0]; 
			} else {
				return [targetPointIndex - 1, targetPointIndex]; 
			}
		}
	}

	stop() {
		this.hasArrived = true;
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


