import { _decorator, Component, instantiate, Material, Mesh, MeshRenderer, Node, Prefab } from 'cc';
import { BezierCurve } from './mover/BezierCurve';
import { Path } from './mover/Path';
const { ccclass, property } = _decorator;

// region classes-helpers
// endregion

@ccclass('PathRenderer')
export class PathRenderer extends Component {
	// region editors' fields and properties
	@property(Prefab)
	markPrefab;

	@property
	marksInterval = .1;
	// endregion

	// region public fields and properties
	// endregion

	// region private fields and properties
	_curve: BezierCurve;
	_marks: Node[] = [];
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
	init() {
		this._curve = this.getComponent(Path).getCurve();

		const fullLength = this._curve.getFullPathLength();

		for (let distance = 0; distance < fullLength; distance += this.marksInterval) {
			const {position, rotation} = this._curve.getPointAngleOnDistance(distance);
			const mark = instantiate(this.markPrefab);
			mark.setParent(this.node);
			mark.setPosition(position);
			mark.setWorldRotation(rotation);

			this._marks.push(mark);			
		}
	}

	toggleMarks(isOn: boolean) {
		this._marks.forEach(mark => mark.active = isOn);
	}

	setMaterial(material: Material) {
		this._marks.forEach(mark => mark.getComponentInChildren(MeshRenderer).setMaterialInstance(material, 0));
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


