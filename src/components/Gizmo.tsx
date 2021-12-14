import React from 'react'
import './styles/Gizmo.css'

interface GizmosProps {
    isResizable: boolean
}

export class Gizmo extends React.Component<GizmosProps> {
    render() {
        if (this.props.isResizable) {
            return (
                <div className="gizmo">
                    <div className="gizmo-handle"></div>
                    <div className="gizmo-handle"></div>
                    <div className="gizmo-handle"></div>
                    <div className="gizmo-handle"></div>                
                </div>
            )
        }

        return <div className="gizmo"/>
    }
}