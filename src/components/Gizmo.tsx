import React from 'react'
import 'components/styles/Gizmo.css'

interface GizmoProps {
    isResizable: boolean
    isVisible: boolean
    onHandleDown: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
    onHandleMove: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
}

export class Gizmo extends React.Component<GizmoProps> {
    render() {
        const gizmoClassName = this.props.isVisible ? 'gizmo' : ''
        const handleClassName = (this.props.isVisible && this.props.isResizable) ? 'gizmo-handle' : ''

        // TODO: сделать изменение размера при помощи других хэндлов, а не только при помощи правого нижнего
        return (
            <div className="gizmo-container" style={{width: '100%', height: '100%'}}>
                <div style={{width: '100%', height: '100%'}}>
                    {this.props.children}
                </div>
                <div className={gizmoClassName}>
                    <div className={handleClassName}/>
                    <div className={handleClassName}/>
                    <div className={handleClassName}/>
                    <div className={handleClassName} onMouseDown={this.props.onHandleDown} onMouseMove={this.props.onHandleMove}/>
                </div>
            </div>
        )
    }
}