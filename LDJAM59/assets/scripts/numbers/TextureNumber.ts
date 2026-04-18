import { _decorator, Component, Node, Vec2, tween, Layers, Enum, CCInteger, Mesh, MeshRenderer, Material, Texture2D, warn, color, Color } from 'cc';
import { gameEventTarget } from '../plugins/GameEventTarget';
import { GameEvent } from '../enums/GameEvent';
import { EDITOR } from 'cc/env';
import { Colors } from '../enums/Colors';

const { ccclass, property } = _decorator;

const MaxNumberCharacters = 5;

Enum(GameEvent);

// region classes-helpers
// endregion

@ccclass('TextureNumber')
export class TextureNumber extends Component {
	// region editors' fields and properties
	@property({ type: GameEvent })
	eventAdd: GameEvent = GameEvent.NONE;

	@property({ type: GameEvent })
	eventSub: GameEvent = GameEvent.NONE;

	@property({ type: GameEvent })
	eventGet: GameEvent = GameEvent.NONE;

	@property(Mesh)
	planeMesh: Mesh;

	@property(Material)
	digitMaterialBase: Material;

	@property
	xScale: number = 1;

	@property
	zScale: number = 1;

	@property(CCInteger)
	defaultNumber: number = 220;

	@property
	digitWidth: number = 128;

	@property(Texture2D)
	signTexture: Texture2D = null;

	@property(Vec2)
	signOffset: Vec2 = new Vec2();

	@property
	delimiterWidth: number = 5;

	@property(Texture2D)
	delimiterTexture: Texture2D = null;

	@property(Vec2)
	delimiterOffset: Vec2 = new Vec2();

	@property(Texture2D)
	digitsTextures: Texture2D[] = [];

	@property
	set shouldPreview(newValue: boolean) {
		if (EDITOR) {
			if (newValue) {
				this._addSign();
				this._addDelimiter();
				this._addDigits();

				this.number = this.defaultNumber;
				this._targetNumber = this._number;
			} else {
				this._signRenderer?.node.destroy();
				this._delimiterRenderers.forEach((renderer: MeshRenderer) => { renderer.node.destroy(); });
				this._meshRenderers.forEach((renderer: MeshRenderer) => { renderer.node.destroy(); });

				this._signRenderer = null;
				this._delimiterRenderers = [];
				this._meshRenderers = [];

				this._number = -1;
				this._targetNumber = -1;
			}

			this._isPreviewed = newValue;
		}
	}
	get shouldPreview(): boolean {
		return this._isPreviewed;
	}
	// endregion

	// region public fields and properties
	set number(newNumber: number) {
		if (Math.floor(newNumber) == this._number) {
			return;
		}

		this._number = newNumber;
		this._set();
	}
	get number(): number {
		return this._number;
	}

	get targetNumber(): number {
		return this._targetNumber;
	}
	// endregion

	// region private fields and properties
	@property
	private _isPreviewed: boolean = false;


	_albedoColorHex: string = Colors.WHITE;
	_number: number = -1;
	_targetNumber: number = -1;
	_signRenderer: MeshRenderer = null;
	_delimiterRenderers: MeshRenderer[] = [];
	_meshRenderers: MeshRenderer[] = [];
	// endregion

	// region life-cycle callbacks
	start() {
		if (!this._isPreviewed) {
			this._addSign();
			this._addDelimiter();
			this._addDigits();
		} else {
			warn('TextureNumber', this.node.name, 'is in preview mode that can cause rendering issues');
		}

		this.number = this.defaultNumber;
		this._targetNumber = this._number;
	}

	onEnable() {
		this._subscribeEvents(true);
	}

	onDisable() {
		this._subscribeEvents(false);
	}
	// endregion

	// region public methods
	set(newNumber: number) {
		this.number = newNumber;
		this._targetNumber = this._number;
	}

	setColorHex(colorHex: string) {
		this._albedoColorHex = colorHex;
		const c = new Color();
		Color.fromHEX(c, colorHex);

		const allRenderers: MeshRenderer[] = [
			...(this._signRenderer ? [this._signRenderer] : []),
			...this._delimiterRenderers,
			...this._meshRenderers,
		];
		allRenderers.forEach(r => r.getMaterialInstance(0)?.setProperty('mainColor', c));
	}

	preAdd(addAmount: number, changeTime: number) {
		this.add(addAmount, changeTime);
	}

	add(addAmount: number, changeTime: number) {
		this._targetNumber += addAmount;
		const fromNumber = this._number;

		const t = { value: 0 };
		tween(t)
			.to(changeTime, { value: 1 }, {
				onUpdate: () => {
					this.number = fromNumber + (this._targetNumber - fromNumber) * t.value;
				}
			})
			.call(() => this.postAdd(addAmount))
			.start();
	}

	postAdd(addAmount) { }

	preSub(subAmount: number, changeTime: number) {
		this.sub(subAmount, changeTime);
	}

	sub(subAmount: number, changeTime: number) {
		this._targetNumber -= subAmount;
		const fromNumber = this._number;

		const t = { value: 0 };
		tween(t)
			.to(changeTime, { value: 1 }, {
				onUpdate: () => {
					this.number = fromNumber + (this._targetNumber - fromNumber) * t.value;
				}
			})
			.call(() => this.postSub(subAmount))
			.start();
	}

	postSub(subAmount) { }
	// endregion

	// region private methods
	_subscribeEvents(isOn) {
		const func = isOn ? 'on' : 'off';

		gameEventTarget[func](this.eventAdd, this.onEventAdd, this);
		gameEventTarget[func](this.eventSub, this.onEventSub, this);
		gameEventTarget[func](this.eventGet, this.onEventGet, this);
	}

	_set() {
		let tempNumber = this._number;
		let numberDigits = [];

		while (tempNumber / 10 > 0) {
			numberDigits.push(Math.floor(tempNumber % 10));
			tempNumber = Math.floor(tempNumber / 10);
		}

		if (numberDigits.length <= 0) {
			numberDigits.push(0);
		}

		this._meshRenderers.forEach((meshRenderer, index) => {
			const digitTexture = numberDigits[index] !== null ? this.digitsTextures[numberDigits[index]] : null;
			if (digitTexture) {
				meshRenderer.node.active = true;
				const material = meshRenderer.getMaterialInstance(0);
				material.setProperty('mainTexture', digitTexture);
			} else {
				meshRenderer.node.active = false;
			}

		})

		if (this._signRenderer) {
			this._signRenderer.node.setPosition(-numberDigits.length * this.digitWidth - Math.floor((numberDigits.length - 1) / 3) * this.delimiterWidth + this.signOffset.x, this.signOffset.y, 0);
		}

		this._delimiterRenderers.forEach((delimiterRenderer, index) => {
			delimiterRenderer.node.active = false;
			if (index + 1 <= Math.floor((numberDigits.length - 1) / 3)) {
				delimiterRenderer.node.active = true;
			}
		})

		//центруем
		const activeMeshRenderers = this._meshRenderers.filter(meshRenderer => meshRenderer.node.active);
		const totalWidth = activeMeshRenderers.length * this.digitWidth + Math.floor((activeMeshRenderers.length - 1) / 3) * this.delimiterWidth;
		activeMeshRenderers.reverse().forEach((meshRenderer, index) => {
			meshRenderer.node.setPosition(-totalWidth / 2 + index * this.digitWidth + Math.floor(index / 3) * this.delimiterWidth, meshRenderer.node.position.y, meshRenderer.node.position.z);
		});
	}

	_addSign() {
		if (this.signTexture) {
			const signNode = new Node();
			signNode.layer = Layers.Enum.DEFAULT;
			this._signRenderer = signNode.addComponent(MeshRenderer);
			this._signRenderer.mesh = this.planeMesh;
			signNode.setScale(this.xScale, 1, this.zScale);

			const signMaterial = new Material();
			signMaterial.copy(this.digitMaterialBase);
			signMaterial.setProperty('mainTexture', this.signTexture);

			this._signRenderer.setMaterialInstance(signMaterial, 0);
			this.node.addChild(signNode);
		}
	}

	_addDelimiter() {
		if (this.delimiterTexture) {
			const delimitersNumber = Math.floor(MaxNumberCharacters / 3);

			const delimiterMaterial = new Material();
			delimiterMaterial.copy(this.digitMaterialBase);
			delimiterMaterial.setProperty('mainTexture', this.delimiterTexture, 0);

			for (let i = 0; i < delimitersNumber; ++i) {
				const charNode = new Node();
				charNode.layer = Layers.Enum.DEFAULT;
				charNode.setPosition(-((i + 1) * 3 * this.digitWidth + this._delimiterRenderers.length * this.delimiterWidth - this.delimiterOffset.x), this.delimiterOffset.y, 0);

				const delimiterRenderer = charNode.addComponent(MeshRenderer);
				delimiterRenderer.mesh = this.planeMesh;
				charNode.setScale(this.xScale, 1, this.zScale);
				delimiterRenderer.setMaterialInstance(delimiterMaterial, 0);

				this._delimiterRenderers.push(delimiterRenderer);

				this.node.addChild(charNode);
			}
		}
	}

	_addDigits() {
		while (this._meshRenderers.length < MaxNumberCharacters) {
			const charNode = new Node();
			this.node.addChild(charNode);
			charNode.layer = Layers.Enum.DEFAULT;
			charNode.setPosition(-(this._meshRenderers.length * this.digitWidth + Math.floor(this._meshRenderers.length / 3) * this.delimiterWidth), 0, 0);
			const meshRenderer = charNode.addComponent(MeshRenderer);
			meshRenderer.mesh = this.planeMesh;
			charNode.setScale(this.xScale, 1, this.zScale);

			const numberMaterial = new Material();
			numberMaterial.copy(this.digitMaterialBase);

			meshRenderer.setMaterialInstance(numberMaterial, 0);
			this._meshRenderers.push(meshRenderer);
		}
	}
	// endregion

	// region event handlers
	onEventAdd(addAmount = 1, changeTime = 0.3) {
		this.preAdd(addAmount, changeTime);
	}

	onEventSub(subAmount = 1, changeTime = 0.3) {
		this.preSub(subAmount, changeTime);
	}

	onEventGet(callback) {
		callback(this._targetNumber);
	}
	// endregion
}
