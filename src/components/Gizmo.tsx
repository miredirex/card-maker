import React, { ReactNode } from 'react'
import 'components/styles/Gizmo.css'

interface GizmoProps {
    isResizable: boolean
    isVisible: boolean
    onHandleDown: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
    onHandleMove: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
}

export function Gizmo(props: React.PropsWithChildren<GizmoProps>) {
    const gizmoClassName = props.isVisible ? 'gizmo' : ''
    const handleClassName = (props.isVisible && props.isResizable) ? 'gizmo-handle' : ''

    // TODO: сделать изменение размера при помощи других хэндлов, а не только при помощи правого нижнего
    // TODO: привязать onMouseMove к канваса, а не к этому div'у
    return (
        <div className="gizmo-container" style={{width: '100%', height: '100%'}}>
            <div style={{width: '100%', height: '100%'}}>
                {props.children}
            </div>
            <div className={gizmoClassName}>
                <div className={handleClassName}/>
                <div className={handleClassName}/>
                <div className={handleClassName}/>
                <div className={handleClassName} onMouseDown={props.onHandleDown} onMouseMove={props.onHandleMove}/>
            </div>
        </div>
    )
}