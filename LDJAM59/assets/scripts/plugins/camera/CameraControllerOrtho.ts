import { _decorator, Camera, Component, CameraComponent, Node, tween, v3, Vec3, view, easing, game } from 'cc';
import { gameEventTarget } from '../GameEventTarget';
import { GameEvent } from '../../enums/GameEvent';

const { ccclass, property } = _decorator;

@ccclass('CameraSetupOrtho')
class CameraSetupOrtho {
	@property(Node)
	target: Node;

	@property
	orthoHeightP: number = 10;
	@property
	orthoHeightL: number = 10;
	@property
	dist: number = 80;
	@property
	thetaDeg: number = 0;
	@property
	phiDeg: number = 0;
}

@ccclass('CameraControllerOrtho')
export class CameraControllerOrtho extends Component {
	@property(Node)
	targetProxy: Node;

	@property([CameraSetupOrtho])
	cameraSetups: CameraSetupOrtho[] = [];

	@property
	shakeMagnitude: number = 3;

	@property({
		min: 0.01,
	})
	followingSpeed = 0.1;

	@property
	isMain = false;

	targetIdx = 0;

	private _cTarget: Node;
	private _cSetupIndex: number = 0;
	private _cDist: number = 0;
	private _cTheta: number = 0;
	private _cPhi: number = 0;
	private _cShakeAngle: number = 0;

	onLoad() {
		// //@ts-ignore
		// this.cameraSetups[0].orthoHeightL = window.cameraSizeLandscape ?? this.cameraSetups[0].orthoHeightL;
		// //@ts-ignore
		// this.cameraSetups[0].orthoHeightP = window.cameraSizePortrait ?? this.cameraSetups[0].orthoHeightP;
		// //@ts-ignore
		// this.cameraSetups[0].thetaDeg = window.cameraThetaAngle ?? this.cameraSetups[0].thetaDeg;
		// //@ts-ignore
		// this.cameraSetups[0].phiDeg = window.cameraPhiAngle ?? this.cameraSetups[0].phiDeg;
	}

	onEnable() {
		this._subscribeEvents(true);
	}

	onDisable() {
		this._subscribeEvents(false);
	}

	start() {
		this._updateCurrentParameters();
		this._positionCamera();
	}

	update(deltaTime: number) {
		// if (this._cTarget) {
		// 	const delta = Vec3.subtract(v3(), this._cTarget.worldPosition,
		// 		this.targetProxy.worldPosition);
		// 	delta.multiplyScalar(Math.min(deltaTime * this.followingSpeed, 1));
		// 	this.targetProxy.translate(delta);
		// 	// this.targetProxy.setWorldPosition(this.targetProxy.getWorldPosition().add(delta));

		// 	this._positionCamera();
		// }
	}

	private _subscribeEvents(isOn: boolean): void {
		const func: string = isOn ? 'on' : 'off';

		view[func]('canvas-resize', this.onCanvasResize, this);
		gameEventTarget[func](GameEvent.CAMERA_TRANSITION, this.onCameraTransition, this);
		gameEventTarget[func](GameEvent.CAMERA_SHAKE, this.onCameraShake, this);
		gameEventTarget[func](GameEvent.CAMERA_GET, this.onCameraGet, this);
		gameEventTarget[func](GameEvent.CAMERA_UPDATE_POSITION, this.onCameraUpdatePosition, this);
	}

	private _positionCamera() {
		const targetPos = this.targetProxy.worldPosition;

		const x = targetPos.x + this._cDist * Math.sin(this._cTheta) * Math.sin(this._cPhi);
		const y = targetPos.y + this._cDist * Math.cos(this._cTheta);
		const z = targetPos.z + this._cDist * Math.sin(this._cTheta) * Math.cos(this._cPhi);

		const xAngle = this._cTheta * 180 / Math.PI - 90 + this._cShakeAngle;
		const yAngle = this._cPhi * 180 / Math.PI;

		this.node.setWorldPosition(v3(x, y, z));
		this.node.eulerAngles = new Vec3(xAngle, yAngle, 0);
	}

	private _updateCurrentParameters() {
		const isLand = view.getVisibleSize().width > view.getVisibleSize().height;
		const cSetup = this.cameraSetups[this._cSetupIndex];

		this._cTarget = cSetup.target;
		this._cDist = cSetup.dist;
		this._cTheta = cSetup.thetaDeg / 180 * Math.PI;
		this._cPhi = cSetup.phiDeg / 180 * Math.PI;
		this.getComponent(Camera).orthoHeight = isLand ? cSetup.orthoHeightL : cSetup.orthoHeightP;

		const targetPos = this._cTarget.worldPosition;
		this.targetProxy.setWorldPosition(targetPos);
	}

	onCanvasResize() {
		this._updateCurrentParameters();
	}

	onCameraTransition(setupIndex: number, time: number = .5, easingType = easing.sineIn, callback: any = null) {
		const newSetup = this.cameraSetups[setupIndex];
		const currSetup = this.cameraSetups[this._cSetupIndex];
		this._cTarget = null;

		this._cSetupIndex = setupIndex;
		this.targetIdx = this._cSetupIndex;

		const t = { value: 0 };
		tween(t)
			.to(time, { value: 1 }, {
				onUpdate: () => {
					const isLand = view.getVisibleSize().width > view.getVisibleSize().height;
					this._cDist = newSetup.dist * t.value + currSetup.dist * (1 - t.value);
					this._cTheta = (newSetup.thetaDeg * t.value + currSetup.thetaDeg * (1 - t.value)) / 180 * Math.PI;
					this._cPhi = (newSetup.phiDeg * t.value + currSetup.phiDeg * (1 - t.value)) / 180 * Math.PI;

					this.targetProxy.setWorldPosition(Vec3.lerp(v3(), this.targetProxy.worldPosition, newSetup.target.worldPosition, t.value));
					this._positionCamera();

					this.getComponent(Camera).orthoHeight = isLand ? newSetup.orthoHeightL * t.value + currSetup.orthoHeightL * (1 - t.value) :
						newSetup.orthoHeightP * t.value + currSetup.orthoHeightP * (1 - t.value);
				},
				easing: easingType,
			})
			.call(() => {
				this._cTarget = newSetup.target;
				if (this.isMain && callback) { callback(); }
			})
			.start();
	}

	onCameraShake(duration: number = .2) {
		const t = { value: 0 };
		tween(t)
			.to(duration, { value: 1 }, {
				onUpdate: () => {
					this._cShakeAngle = Math.sin(t.value * Math.PI * 10) * this.shakeMagnitude;
				}
			})
			.start();
	}

	onCameraGet(callback: any) {
		if (this.isMain && callback) {
			callback(this.getComponent(CameraComponent));
		}
	}

	onCameraUpdatePosition() {
		if (this._cTarget) {
			const delta = Vec3.subtract(v3(), this._cTarget.worldPosition,
				this.targetProxy.worldPosition);
			delta.multiplyScalar(Math.min(game.deltaTime * this.followingSpeed, 1));
			this.targetProxy.translate(delta);

			this._positionCamera();
		}
	}
}
