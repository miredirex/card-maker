import 'components/styles/Gizmo.css'
import { ScaleParams } from './Transformable'

interface GizmoProps {
    isResizable: boolean
    isVisible: boolean
    contentScale: ScaleParams
    onHandleDown: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
}

const Gizmo = (props: React.PropsWithChildren<GizmoProps>) => {
    const gizmoClassName = props.isVisible ? 'gizmo' : ''
    const handleClassName = (props.isVisible && props.isResizable) ? 'gizmo-handle' : ''
    const transform = `scale(${props.contentScale.scaleX},${props.contentScale.scaleY})`

    // TODO: сделать изменение размера при помощи других хэндлов, а не только при помощи правого нижнего
    return (
        <div className="gizmo-container" style={{ width: '100%', height: '100%' }}>
            <div className="main-content" style={{ width: '100%', height: '100%', transform: transform }}>
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