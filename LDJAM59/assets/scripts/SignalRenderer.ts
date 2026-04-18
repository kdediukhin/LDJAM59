import { _decorator, Component, Line, Material, Node, Texture2D, Vec3, Vec4 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SignalRenderer')
export class SignalRenderer extends Component {

    // @property
    // lineWidth: number = 0.1;

    @property
    scrollSpeed: number = 1.0;

    private _line: Line = null;
    private _lineMaterial: Material = null;
    private _scrollOffset: number = 0;

    protected onEnable(): void {
        this._line = this.getComponent(Line);
        this._lineMaterial = this._line.getMaterialInstance(0);

        // Без REPEAT тайлинг не работает в WebGL (браузере)
        const tex = this._lineMaterial.getProperty('mainTexture') as Texture2D;
        if (tex) {
            tex.setWrapMode(Texture2D.WrapMode.REPEAT, Texture2D.WrapMode.REPEAT);
        }
    }

    protected update(dt: number): void {
        this._scrollOffset = (this._scrollOffset + dt * this.scrollSpeed) % 1;
        const { x, y, z, w } = this._lineMaterial.getProperty('mainTiling_Offset') as Vec4;
        this._lineMaterial.setProperty('mainTiling_Offset', new Vec4(x, y, 1 - this._scrollOffset, w));
        // console.log(1-this._scrollOffset);

    }

    public setLinePoints(worldPoints: Vec3[], reflectorIndices: Set<number> = new Set()) {
        const positions: Vec3[] = [];
        for (let i = 0; i < worldPoints.length; i++) {
            positions.push(worldPoints[i]);
            if (reflectorIndices.has(i)) {
                positions.push(worldPoints[i]);
            }
        }
        this._line.positions = positions;
    }

}


