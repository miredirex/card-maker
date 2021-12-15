import { Gizmo } from "components/Gizmo";
import { Transformable, TransformableProps, TransformType } from "components/transformable/Transformable";

export interface SelectionProps extends TransformableProps {
    x: number,
    y: number,
    width: number,
    height: number
}

export class SelectionTransformable extends Transformable<SelectionProps> {
    clearArea(canvas: HTMLCanvasElement) {
        let ctx = canvas.getContext('2d')
        const { x, y, width, height } = this.props
        ctx?.clearRect(x, y, width, height)
    }

    override draw(canvas: HTMLCanvasElement) {
        this.clearArea(canvas)
    }
    
    render() {
        return (
            <div 
                ref={this.ref}
                onMouseDown={(event) => super.onTransformStart(TransformType.Drag, event)}
                onMouseMove={(event) => super.onTransform(TransformType.Drag, event)}
                onMouseUp={(event) => super.onTransformEnd(event)}
                style={{ position: 'absolute', left: this.props.x, top: this.props.y, width: this.props.width, height: this.props.height }}>
                <Gizmo onHandleDown={(e) => this.onTransformStart(TransformType.Resize, e)} onHandleMove={(e) => this.onTransform(TransformType.Resize, e)} isVisible={this.props.isGizmoVisible} isResizable={this.props.isResizable}>
                </Gizmo>
            </div>
        )
    }
}