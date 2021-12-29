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
    zIndex?: number
    setHasStartedTransform?: (mouseX: number, mouseY: number, preTransform: Transform) => void
    setHasEndedTransform?: (transform: Transform) => void
    onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
}

export interface TransformData {
    mouseX: number
    mouseY: number
    startMouseX: number
    startMouseY: number
    preTransform: Transform
    transform: Transform
    canvasX: number
    canvasY: number
}

export enum TransformAction {
    None,
    Resize,
    Drag
}

export interface ScaleParams {
    scaleX: number
    scaleY: number
}

export interface Transform {
    rect: Rect
    scaleParams: ScaleParams
}

export function defaultScale(): ScaleParams {
    return { scaleX: 1, scaleY: 1 }
}

function calculateNewTransform(
    transformAction: TransformAction,
    transformData: TransformData,
    alwaysResize: boolean,
): Transform {

    const oldRect = transformData.preTransform.rect
    const isResizing = transformAction === TransformAction.Resize
    const isDragging = transformAction === TransformAction.Drag

    const deltaX = transformData.mouseX - transformData.startMouseX
    const deltaY = transformData.mouseY - transformData.startMouseY

    const x = oldRect.left + deltaX + oldRect.width
    const y = oldRect.top + deltaY + oldRect.height

    const isFlippedHorizontally = oldRect.width + deltaX < 0
    const isFlippedVertically = oldRect.height + deltaY < 0

    if (isResizing || alwaysResize) {
        return {
            rect: {
                left: isFlippedHorizontally ? x : oldRect.left,
                top: isFlippedVertically ? y : oldRect.top,
                width: Math.abs(oldRect.width + deltaX),
                height: Math.abs(oldRect.height + deltaY)
            },
            scaleParams: {
                scaleX: isFlippedHorizontally ? -1 : 1,
                scaleY: isFlippedVertically ? -1 : 1
            }
        }
    } else {
        return {
            rect: {
                left: oldRect.left + deltaX,
                top: oldRect.top + deltaY,
                width: oldRect.width,
                height: oldRect.height,
            },
            scaleParams: transformData.preTransform.scaleParams
        }
    }
}

const Transformable = React.forwardRef<HTMLDivElement, React.PropsWithChildren<TransformableProps>>((props, ref) => {
    const [currentAction, setCurrentAction] = useState<TransformAction>(TransformAction.None)

    function onTransformStart(transformAction: TransformAction, e: React.MouseEvent<HTMLDivElement>, scaleParams: ScaleParams) {
        if (e.isDefaultPrevented()) return
        if (!props.isDraggable && transformAction === TransformAction.Drag) return
        if (!props.isResizable && transformAction === TransformAction.Resize) return
        
        let div = e.currentTarget as HTMLDivElement

        if (transformAction === TransformAction.Resize) {
            // e.currentTarget is the bottom right gizmo handle
            div = e.currentTarget.parentElement?.parentElement?.parentElement! as HTMLDivElement
        }

        setCurrentAction(transformAction)
        const preTransformRect: Rect = { left: div.offsetLeft, top: div.offsetTop, width: div.offsetWidth, height: div.offsetHeight }
        const preTransform: Transform = { rect: preTransformRect, scaleParams: scaleParams }
        // Let canvas handle onMouseMove
        props.setHasStartedTransform?.(e.clientX, e.clientY, preTransform)

        e.preventDefault()
    }

    function onTransformEnd(_e: React.MouseEvent<HTMLDivElement>, transform: Transform) {
        if (!props.isDraggable && !props.isResizable) return
        props.setHasEndedTransform?.(transform)
    }

    function onClick(e: React.MouseEvent<HTMLDivElement>) {
        if (e.isDefaultPrevented()) return
        props.onClick?.(e)
        e.preventDefault()
    }

    let transform = props.transformData?.preTransform

    if (props.transformData) {
        transform = calculateNewTransform(currentAction, props.transformData, props.alwaysResize)
    }

    const left = transform?.rect.left ?? 0
    const top = transform?.rect.top ?? 0
    const scaleParams = transform?.scaleParams ?? defaultScale()
    
    const cursor = props.isDraggable ? 'grab' : undefined

    return (
        <div
            ref={ref}
            className="transformable"
            style={{ position: 'absolute', left: left, top: top, width: transform?.rect.width, height: transform?.rect.height, zIndex: props.zIndex, cursor: cursor }}
            onMouseDown={(event) => onTransformStart(TransformAction.Drag, event, scaleParams)}
            onMouseUp={(event) => onTransformEnd(event, transform!)}
            onClick={(e) => onClick(e)}>
            <Gizmo
                onHandleDown={(e) => onTransformStart(TransformAction.Resize, e, scaleParams)}
                isVisible={props.isGizmoVisible}
                isResizable={props.isResizable}
                contentScale={scaleParams}>
                {props.children}
            </Gizmo>
        </div>
    )
})

export default Transformable