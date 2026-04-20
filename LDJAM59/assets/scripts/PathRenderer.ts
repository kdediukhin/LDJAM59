import { _decorator, Color, Component, GradientRange, instantiate, Line, Material, MeshRenderer, Node, Prefab, Tween, tween, Vec3 } from 'cc';
import { Path } from './mover/Path';
const { ccclass, property } = _decorator;

// region classes-helpers
// endregion

@ccclass('PathRenderer')
export class PathRenderer extends Component {
	// region editors' fields and properties
	@property(Prefab)
	markPrefab;

	@property(Prefab)
	linePrefab: Prefab;

	@property
	marksInterval = .1;
	// endregion

	// region public fields and properties
	// endregion

	// region private fields and properties
	_path: Path;
	_marks: Node[] = [];
	_line: Line;
	_tween: Tween | null = null;
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
		this._path = this.getComponent(Path);

		const positions = this._path.getPathPoints();
		const line = instantiate(this.linePrefab);
		line.setParent(this.node);
		this._line = line.getComponent(Line);
		this._line.positions = positions;
		this.setColorHex('#FFFFFF00');
	}

	toggleMarks(isOn: boolean) {
		this._marks.forEach(mark => mark.active = isOn);
	}

	setMaterial(material: Material) {
		this._marks.forEach(mark => mark.getComponentInChildren(MeshRenderer).setMaterialInstance(material, 0));
	}

	setColorHex(colorHex: string) {	
		this._tween?.stop();	
		const colorRange = new GradientRange();
		const color = new Color();
		color.fromHEX(colorHex);
		colorRange.color = color;
		this._line.color = colorRange;
	}

	fade(){
		const colorRange = this._line.color;
		this._tween = tween(colorRange)
			.to(1, { color: new Color(colorRange.color.r, colorRange.color.g, colorRange.color.b, 0) }, {
				onUpdate: () => {
					this._line.color = colorRange;
				}
			})
			.start();
	}
	// endregion

	// region private methods
	_subscribeEvents(isOn: boolean) {
		const func = isOn ? 'on' : 'off';
	}
	// endregion

	// region event handlers
	// endregion
}


