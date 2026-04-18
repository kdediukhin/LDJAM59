import { _decorator, Component } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Amplifier')
export class Amplifier extends Component {
    @property
    amplifyPower: number = 50;
}


