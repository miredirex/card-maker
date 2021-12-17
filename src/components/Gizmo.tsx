import 'components/styles/Gizmo.css'

interface GizmoProps {
    isResizable: boolean
    isVisible: boolean
    onHandleDown: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
}

const Gizmo = (props: React.PropsWithChildren<GizmoProps>) => {
    const gizmoClassName = props.isVisible ? 'gizmo' : ''
    const handleClassName = (props.isVisible && props.isResizable) ? 'gizmo-handle' : ''

    // TODO: сделать изменение размера при помощи других хэндлов, а не только при помощи правого нижнего
    // TODO: привязать onMouseMove к канваса, а не к этому div'у
    return (
        <div className="gizmo-container" style={{ width: '100%', height: '100%' }}>
            <div className="main-content" style={{ width: '100%', height: '100%' }}>
                {props.children}
            </div>
            <div className={gizmoClassName} style={{ width: '100%', height: '100%' }} >
                <div className={handleClassName}/>
                <div className={handleClassName}/>
                <div className={handleClassName}/>
                <div className={handleClassName} onMouseDown={props.onHandleDown} />
            </div>
        </div>
    )
}

export default Gizmo