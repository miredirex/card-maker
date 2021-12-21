import Gizmo from "components/Gizmo";
import { Rect } from "geometry/Rect";
import React, { useState } from "react";

export interface TransformableProps {
    canvasWidth: number
    canvasHeight: number
    transformData?: TransformData
    isResizable: boolean
    isDraggable: boolean
    isGizmoVisible: boolean
    alwaysResize: boolean
    setHasStartedTransform?: (mouseX: number, mouseY: number, preTransformRect: Rect) => void
    setHasEndedTransform?: () => void
}

export interface TransformData {
    mouseX: number
    mouseY: number
    startMouseX: number
    startMouseY: number
    preTransformRect: Rect
    canvasX: number
    canvasY: number
}

export enum TransformAction {
    None,
    Resize,
    Drag
}

interface TransformRect {
    left: number,
    top: number,
    width?: number,
    height?: number
}

function calculateNewTransformableRect(
    transformAction: TransformAction,
    props: TransformableProps,
): TransformRect {

    const transformData = props.transformData!
    const oldRect = transformData.preTransformRect
    const isResizing = transformAction === TransformAction.Resize
    const isDragging = transformAction === TransformAction.Drag

    const deltaX = transformData.mouseX - transformData.startMouseX
    const deltaY = transformData.mouseY - transformData.startMouseY

    const x = oldRect.left + deltaX + oldRect.width
    const y = oldRect.top + deltaY + oldRect.height

    if (isResizing || props.alwaysResize) {
        return {
            left: (oldRect.width + deltaX < 0) ? x : oldRect.left,
            top: (oldRect.height + deltaY < 0) ? y : oldRect.top,
            width: Math.abs(oldRect.width + deltaX),
            height: Math.abs(oldRect.height + deltaY),
        }
    } else {
        return {
            left: oldRect.left + deltaX,
            top: oldRect.top + deltaY,
        }
    }
}

const Transformable = React.forwardRef<HTMLDivElement, React.PropsWithChildren<TransformableProps>>((props, ref) => {
    const [currentAction, setCurrentAction] = useState<TransformAction>(TransformAction.None)

    function onTransformStart(transformAction: TransformAction, e: React.MouseEvent<HTMLDivElement>) {
        if (e.isDefaultPrevented()) return
        let div = e.currentTarget as HTMLDivElement

        if (transformAction == TransformAction.Resize) {
            // e.currentTarget is the bottom right gizmo handle
            div = e.currentTarget.parentElement?.parentElement?.parentElement! as HTMLDivElement
        }

        setCurrentAction(transformAction)
        const preTransformRect = { left: div.offsetLeft, top: div.offsetTop, width: div.offsetWidth, height: div.offsetHeight }
        // Let canvas handle onMouseMove
        props.setHasStartedTransform?.(e.clientX, e.clientY, preTransformRect)

        e.preventDefault()
    }

    function onTransformEnd(_e: React.MouseEvent<HTMLDivElement>) {
        props.setHasEndedTransform?.()
    }

    let left = 0
    let top = 0
    let width = props.transformData?.preTransformRect.width
    let height = props.transformData?.preTransformRect.height

    if (props.transformData) {
        const transformedRect = calculateNewTransformableRect(currentAction, props)

        left = transformedRect?.left
        top = transformedRect?.top

        if (transformedRect.width)
            width = transformedRect.width
        if (transformedRect.height)
            height = transformedRect.height
    }

    return (
        <div ref={ref} className="transformable" style={{ position: 'absolute', left: left, top: top, width: width, height: height }}
            onMouseDown={(event) => onTransformStart(TransformAction.Drag, event)}
            onMouseUp={(event) => onTransformEnd(event)}>
            <Gizmo onHandleDown={(e) => onTransformStart(TransformAction.Resize, e)} isVisible={props.isGizmoVisible} isResizable={props.isResizable}>
                {props.children}
            </Gizmo>
        </div>
    )
})

export default Transformable