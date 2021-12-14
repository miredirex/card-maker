import React from "react";
import { Gizmo } from "./Gizmo";

export interface FlexibleProps {
    isResizable: boolean
    isMovable: boolean
    isGizmoVisible: boolean
}

export class FlexibleComponent extends React.Component<FlexibleProps> {
    public static defaultProps: FlexibleProps = {
        isResizable: true,
        isMovable: true,
        isGizmoVisible: false
    }

    render() {
        return (
            <div style={{position: 'absolute', top: 0, left: 0}}>
                <Gizmo isVisible={this.props.isGizmoVisible} isResizable={this.props.isResizable}>
                    {React.Children.only(this.props.children)}
                </Gizmo>
            </div>
        )
    }
}