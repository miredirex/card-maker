import { Gizmo } from "components/Gizmo";
import { Transformable, TransformableProps, TransformType } from "components/transformable/Transformable";

export interface SelectionProps extends TransformableProps {
    left: number,
    right: number,
    top: number,
    bottom: number
}

export class SelectionTransformable extends Transformable<SelectionProps> {
    clearArea(canvas: HTMLCanvasElement) {
        let ctx = canvas.getContext('2d')
        const { left, top } = this.props
        ctx?.clearRect(left, top, this.ref.current!.offsetWidth, this.ref.current!.offsetHeight)
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
                style={{ position: 'absolute', left: this.props.left, top: this.props.top, right: this.props.right, bottom: this.props.bottom }}>
                <Gizmo onHandleDown={(e) => this.onTransformStart(TransformType.Resize, e)} onHandleMove={(e) => this.onTransform(TransformType.Resize, e)} isVisible={this.props.isGizmoVisible} isResizable={this.props.isResizable}>
                </Gizmo>
            </div>
        )
    }
}