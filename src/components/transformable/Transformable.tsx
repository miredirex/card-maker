import React from "react";
import { Gizmo } from "components/Gizmo";
import 'components/styles/Transformable.css'
import { Drawable } from "./Drawable";

export interface TransformableProps {
    isResizable: boolean
    isDraggable: boolean
    isGizmoVisible: boolean
    onClickApply: (tc: Drawable) => void
}

interface DragState {
    moveX: number
    moveY: number
}

export abstract class Transformable<T extends TransformableProps> extends React.Component<T, DragState> implements Drawable {
    private beforeDragState: DragState = {
        moveX: 0,
        moveY: 0
    }

    private isDragging: boolean = false

    constructor(props: T) {
        super(props)
        this.state = {
            moveX: 0,
            moveY: 0,
        }
    }

    abstract drawableElement: JSX.Element

    abstract draw(canvas: HTMLCanvasElement): void

    handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        e.preventDefault();

        if (!this.props.isDraggable) return

        if (this.isDragging) {
            const deltaX = e.clientX - this.beforeDragState.moveX
            const deltaY = e.clientY - this.beforeDragState.moveY

            this.setState({
                moveX: deltaX,
                moveY: deltaY,
            })
        }
    }

    handleMouseDown(e: React.MouseEvent<HTMLDivElement>) {
        if (!this.props.isDraggable) return

        this.beforeDragState = {
            moveX: e.clientX - this.state.moveX,
            moveY: e.clientY - this.state.moveY
        }

        this.isDragging = true
    }

    handleMouseUp(e: React.MouseEvent<HTMLDivElement>) {
        if (!this.props.isDraggable) return

        this.isDragging = false
    }

    render() {
        return (
            <div
                onMouseDown={(event) => this.handleMouseDown(event)}
                onMouseMove={(event) => this.handleMouseMove(event)}
                onMouseUp={(event) => this.handleMouseUp(event)}
                style={{ position: 'absolute', left: this.state.moveX, top: this.state.moveY }}>
                <Gizmo isVisible={this.props.isGizmoVisible} isResizable={this.props.isResizable}>
                    {React.Children.only(this.drawableElement)}
                </Gizmo>
                <button onClick={() => this.props.onClickApply(this)} className="apply-button">✔</button>
            </div>
        )
    }
}