import React, { useEffect, useRef, useState } from 'react';
import 'components/styles/Canvas.css'
import { ToolType } from 'components/Tool';
import Transformable, { TransformData, Transform, defaultScale } from './Transformable';

export const CANVAS_DEFAULT_WIDTH = 800;
export const CANVAS_DEFAULT_HEIGHT = 600;

interface CanvasProps {
    width: number
    height: number
    tool: ToolType
    images: string[]
    canvasRef: React.RefObject<HTMLCanvasElement>
    onRemoveImg: (index: number) => void
}

function toolTypeToCursor(toolType: ToolType): string {
    switch (toolType) {
        case ToolType.Select:
            return 'crosshair'
        case ToolType.Text:
            return 'text'
        case ToolType.Shape:
            return 'copy'
        default:
            return 'default'
    }
}

const Canvas = (props: CanvasProps) => {
    const [isSelectionShown, setSelectionIsVisible] = useState(false)
    const [isSelecting, setIsSelecting] = useState(false)
    const [isTransforming, setIsTransforming] = useState(false)
    const [transformData, setTransformData] = useState<TransformData>()
    const [selectionTransformData, setSelectionTransformData] = useState<TransformData>()
    const imageRefs = useRef<HTMLImageElement[]>([])

    useEffect(() => {
        document.addEventListener('keydown', handleKeyPress)

        return () => {
            document.removeEventListener('keydown', handleKeyPress)
        }
    })

    function onSetHasStartedTransform(mouseX: number, mouseY: number, preTransform: Transform) {
        const canvasRect = props.canvasRef.current!.getBoundingClientRect()

        setIsSelecting(false)
        setSelectionIsVisible(false)
        setIsTransforming(true)

        setTransformData({
            mouseX: mouseX,
            mouseY: mouseY,
            startMouseX: mouseX,
            startMouseY: mouseY,
            preTransform: preTransform,
            transform: preTransform,
            canvasX: canvasRect.x,
            canvasY: canvasRect.y
        })
    }

    function onSetHasEndedTransform(transform: Transform) {
        setIsTransforming(false)
        setTransformData({
            ...transformData!,
            transform: transform
        })
    }

    function drawImage(index: number) {
        let ctx = props.canvasRef.current!.getContext('2d')
        const image = imageRefs.current[index]
        if (transformData && ctx) {
            const scale = transformData.transform.scaleParams
            const rect = transformData.transform.rect
            ctx.save()
            ctx.scale(scale.scaleX, scale.scaleY)
            ctx.drawImage(
                image,
                scale.scaleX * rect.left,
                scale.scaleY * rect.top,
                scale.scaleX * rect.width,
                scale.scaleY * rect.height
            )
            ctx.restore()
        }
    }

    function drawImages() {
        props.images.forEach((_url, i) => {
            drawImage(i)
        })
    }

    function removeImage(index: number) {
        props.onRemoveImg(index)
    }

    function removeImageElements() {
        props.images.forEach((_url, i) => {
            removeImage(i)
        })
    }

    function resetTransformData() {
        setTransformData(undefined)
    }

    function onSelectStart(e: React.MouseEvent<HTMLDivElement>) {
        if (props.images.length !== 0) return

        setIsSelecting(true)
        setSelectionIsVisible(true)

        const canvasRect = props.canvasRef.current!.getBoundingClientRect()
        const preTransform: Transform = {
            rect: {
                left: e.clientX - canvasRect.x,
                top: e.clientY - canvasRect.y,
                width: 0,
                height: 0
            },
            scaleParams: defaultScale()
        }

        setSelectionTransformData({
            mouseX: e.clientX,
            mouseY: e.clientY,
            startMouseX: e.clientX,
            startMouseY: e.clientY,
            canvasX: canvasRect.x,
            canvasY: canvasRect.y,
            preTransform: preTransform,
            transform: preTransform
        })
    }

    function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        e.preventDefault()

        if (isTransforming && transformData) {
            const canvasRect = props.canvasRef.current!.getBoundingClientRect()
            setTransformData({
                ...transformData!,
                mouseX: e.clientX,
                mouseY: e.clientY,
                canvasX: canvasRect.x,
                canvasY: canvasRect.y,
            })
        } else if (isSelecting && selectionTransformData) {
            const canvasRect = props.canvasRef.current!.getBoundingClientRect()
            setSelectionTransformData({
                ...selectionTransformData!,
                mouseX: e.clientX,
                mouseY: e.clientY,
                canvasX: canvasRect.x,
                canvasY: canvasRect.y,
            })
        }
    }

    function eraseSelectedArea() {
        let ctx = props.canvasRef.current!.getContext('2d')
        if (selectionTransformData && isSelectionShown) {
            const eraseWidth = selectionTransformData.mouseX - selectionTransformData.startMouseX
            const eraseHeight = selectionTransformData.mouseY - selectionTransformData.startMouseY
            ctx?.clearRect(selectionTransformData.preTransform.rect.left, selectionTransformData.preTransform.rect.top, eraseWidth, eraseHeight)
        }
    }

    function handleKeyPress(e: KeyboardEvent) {
        if (!props.canvasRef.current) return

        switch (e.code) {
            case 'Delete':
                eraseSelectedArea()
                break;
            case 'Enter':
                drawImages()
                removeImageElements()
                resetTransformData()
                break;
        }
    }

    const selectedTool = props.tool

    return (
        <div
            className="canvas"
            onMouseDown={(e) => onSelectStart(e)}
            onMouseMove={(e) => handleMouseMove(e)}
            onMouseUp={() => { setIsTransforming(false); setIsSelecting(false) }}
            style={{
                position: 'relative',
                width: props.width,
                height: props.height,
                cursor: toolTypeToCursor(props.tool)
            }}>

            {props.images.map((url, index) =>
                <Transformable
                    key={index}
                    isDraggable={selectedTool === ToolType.Select}
                    isGizmoVisible={selectedTool === ToolType.Select}
                    isResizable={selectedTool === ToolType.Select}
                    canvasWidth={props.width}
                    canvasHeight={props.height}
                    transformData={transformData}
                    alwaysResize={false}
                    setHasStartedTransform={onSetHasStartedTransform}
                    setHasEndedTransform={onSetHasEndedTransform}>
                    <img crossOrigin='anonymous' ref={el => imageRefs.current[index] = el!} src={url} style={{ display: 'block', width: '100%', height: '100%' }} alt="" />
                </Transformable>
            )}
            {isSelectionShown &&
                <Transformable
                    isResizable={false}
                    isDraggable={false}
                    canvasWidth={props.width}
                    canvasHeight={props.height}
                    alwaysResize={true}
                    transformData={selectionTransformData}
                    isGizmoVisible={selectedTool === ToolType.Select} />
            }
            <canvas id="canvas" ref={props.canvasRef} width={props.width} height={props.height} />
        </div>
    )
}

export default Canvas