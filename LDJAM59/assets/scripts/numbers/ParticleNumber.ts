import { _decorator, CCInteger, Component, Enum, Node, ParticleSystemComponent, renderer, Texture2D, tween } from 'cc';
import { GameEvent } from '../enums/GameEvent';
import { gameEventTarget } from '../plugins/GameEventTarget';

const { ccclass, property } = _decorator;

const MaxNumberCharacters = 2;

Enum(GameEvent);

// region classes-helpers
// endregion

@ccclass('ParticleNumber')
export class ParticleNumber extends Component {
	// region editors' fields and properties
	@property({ type: GameEvent })
	eventAdd: GameEvent = GameEvent.NONE;

	@property({ type: GameEvent })
	eventSub: GameEvent = GameEvent.NONE;

	@property({ type: GameEvent })
	eventGet: GameEvent = GameEvent.NONE;

	@property(CCInteger)
	defaultNumber: number = 220;

	@property(Texture2D)
	digitsTextures: Texture2D[] = [];

	@property(ParticleSystemComponent)
	particleNumbers: ParticleSystemComponent[] = [];
	// endregion

	// region public fields and properties
	set number(newNumber: number) {
		if (Math.floor(newNumber) == this._number) {
			return;
		}

		this._number = newNumber;
		this.set();
	}
	get number(): number {
		return this._number;
	}
	// endregion

	// region private fields and properties
	private _number: number = -1;

	private _targetNumber: number = -1;
	// endregion

	// region life-cycle callbacks
	onLoad() {
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
	set() {
		let tempNumber = this._number;
		let numberDigits = [];

		while (tempNumber / 10 > 0) {
			numberDigits.push(Math.floor(tempNumber % 10));
			tempNumber = Math.floor(tempNumber / 10);
		}

		if (numberDigits.length <= 0) {
			numberDigits.push(0);
		}

		this.particleNumbers.forEach((particleNumber, index) => {
			const digitTexture = numberDigits[index] !== null ? this.digitsTextures[numberDigits[index]] : null;
			if (digitTexture) {
				particleNumber.node.active = true;
				const material: renderer.MaterialInstance = particleNumber.getMaterialInstance(0);
				material.setProperty('mainTexture', digitTexture);
			} else {
				particleNumber.node.active = false;
			}

		})
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
	_subscribeEvents(isOn: boolean) {
		const func = isOn ? 'on' : 'off';

		gameEventTarget[func](this.eventAdd, this.onEventAdd, this);
		gameEventTarget[func](this.eventSub, this.onEventSub, this);
		gameEventTarget[func](this.eventGet, this.onEventGet, this);
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

