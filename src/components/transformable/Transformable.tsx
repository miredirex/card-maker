import React from "react";
import { Gizmo } from "components/Gizmo";
import 'components/styles/Transformable.css'
import { Drawable } from "./Drawable";

export interface TransformableProps {
    isResizable: boolean
    isDraggable: boolean
    isGizmoVisible: boolean
    onClickApply?: (tc: Drawable) => void 
}

interface TransformState {
    offsetX: number
    offsetY: number
    mouseX: number
    mouseY: number
    width: number
    height: number
}

export enum TransformType {
    Resize,
    Drag
}

export abstract class Transformable<T extends TransformableProps = TransformableProps> extends React.Component<T, TransformState> implements Drawable {
    private preTransformState: TransformState = {
        offsetX: 0,
        offsetY: 0,
        mouseX: 0,
        mouseY: 0,
        width: 0, // set later
        height: 0,
    }
    protected ref: React.RefObject<HTMLDivElement>

    private isDragging: boolean = false
    private isResizing: boolean = false

    constructor(props: T) {
        super(props)
        this.state = {
            offsetX: 0,
            offsetY: 0,
            mouseX: 0,
            mouseY: 0,
            width: 0,
            height: 0,
        }
        this.ref = React.createRef()
    }

    drawableElement?: JSX.Element

    abstract draw(canvas: HTMLCanvasElement): void

    drag(e: React.MouseEvent<HTMLDivElement>) {
        if (!this.props.isDraggable) return

        if (this.isDragging && !this.isResizing) {
            const deltaX = e.clientX - this.preTransformState.mouseX
            const deltaY = e.clientY - this.preTransformState.mouseY

            this.setState({
                offsetX: this.preTransformState.offsetX + deltaX,
                offsetY: this.preTransformState.offsetY + deltaY,
            })
        }
    }

    resize(handleDivEvent: React.MouseEvent<HTMLDivElement>) {
        if (!this.props.isResizable) return

        if (this.isResizing && !this.isDragging) {
            const deltaX = handleDivEvent.clientX - this.preTransformState.mouseX
            const deltaY = handleDivEvent.clientY - this.preTransformState.mouseY

            this.setState({
                width: this.preTransformState.width + deltaX,
                height: this.preTransformState.height + deltaY
            })
        }
    }

    onTransform(transformType: TransformType, e: React.MouseEvent<HTMLDivElement>) {
        e.preventDefault();
        
        switch (transformType) {
            case TransformType.Drag: return this.drag(e)
            case TransformType.Resize: return this.resize(e)
        }
    }

    onTransformStart(transformType: TransformType, e: React.MouseEvent<HTMLDivElement>) {
        if (!this.props.isDraggable) return

        if (this.isDragging || this.isResizing) return
        
        this.preTransformState = {
            offsetX: this.ref.current!.offsetLeft,
            offsetY: this.ref.current!.offsetTop,
            mouseX: e.clientX,
            mouseY: e.clientY,
            width: this.ref.current!.offsetWidth,
            height: this.ref.current!.offsetHeight
        }

        this.isDragging = transformType === TransformType.Drag
        this.isResizing = transformType === TransformType.Resize
    }

    onTransformEnd(_e: React.MouseEvent<HTMLDivElement>) {
        this.isDragging = false
        this.isResizing = false
    }

    render() {
        return (
            <div 
                ref={this.ref}
                onMouseDown={(event) => this.onTransformStart(TransformType.Drag, event)}
                onMouseMove={(event) => this.onTransform(TransformType.Drag, event)}
                onMouseUp={(event) => this.onTransformEnd(event)}
                style={{ position: 'absolute', left: this.state.offsetX, top: this.state.offsetY, width: this.state.width, height: this.state.height }}>
                <Gizmo onHandleDown={(e) => this.onTransformStart(TransformType.Resize, e)} onHandleMove={(e) => this.onTransform(TransformType.Resize, e)} isVisible={this.props.isGizmoVisible} isResizable={this.props.isResizable}>
                    {this.drawableElement}
                </Gizmo>
                {this.props.onClickApply && <button onClick={() => this.props.onClickApply?.(this)} className="apply-button">✔</button>}
            </div>
        )
    }
}