import React from 'react'
import 'components/styles/Gizmo.css'

interface GizmoProps {
    isResizable: boolean
    isVisible: boolean
}

export class Gizmo extends React.Component<GizmoProps> {
    render() {
        const gizmoClassName = this.props.isVisible ? 'gizmo' : ''
        const handleClassName = (this.props.isVisible && this.props.isResizable) ? 'gizmo-handle' : ''

        return (
            <div>
                <div>
                    {React.Children.only(this.props.children)}
                </div>
                <div className={gizmoClassName}>
                    <div className={handleClassName}></div>
                    <div className={handleClassName}></div>
                    <div className={handleClassName}></div>
                    <div className={handleClassName}></div>
                </div>
            </div>
        )
    }
}