import React from "react";
import { Gizmo } from "./Gizmo";

export interface FlexibleProps {
    isResizable: boolean
    isDraggable: boolean
    isGizmoVisible: boolean
}

interface FlexibleState {
    moveX: number
    moveY: number
}

export class FlexibleComponent extends React.Component<FlexibleProps, FlexibleState> {
    public static defaultProps: FlexibleProps = {
        isResizable: true,
        isDraggable: true,
        isGizmoVisible: false
    }

    private beforeDragState: FlexibleState = {
        moveX: 0,
        moveY: 0
    }
    private isDragging: boolean = false

    constructor(props: FlexibleProps) {
        super(props)
        this.state = {
            moveX: 0,
            moveY: 0,
        }
    }

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
                style={{ position: 'absolute', left: this.state.moveX, top: this.state.moveY }}
            >
                <Gizmo isVisible={this.props.isGizmoVisible} isResizable={this.props.isResizable}>
                    {React.Children.only(this.props.children)}
                </Gizmo>
            </div>
        )
    }
}