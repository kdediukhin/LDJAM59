import { _decorator, Component, Line, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SignalRenderer')
export class SignalRenderer extends Component {

    // @property
    // lineWidth: number = 0.1;

    private _line: Line = null;
    private _lineParts: Line[] = [];

    protected onEnable(): void {
        this._line = this.getComponent(Line);
        // if (this._line) {
        //     this._line.width = this.lineWidth;
        // }
    }

    public setLinePoints(worldPoints: Vec3[]) {
        const positions = worldPoints.map(p => [p, p]).flat();
        this._line.positions = positions;

    }

}


