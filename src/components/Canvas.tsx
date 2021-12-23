import React, { useEffect, useRef, useState } from 'react';
import 'components/styles/Canvas.css'
import { ToolType } from 'components/Tool';
import Transformable, { TransformData, Transform, defaultScale } from './Transformable';

export const CANVAS_DEFAULT_WIDTH = 800;
export const CANVAS_DEFAULT_HEIGHT = 600;

const TEXT_INPUT_DEFAULT_WIDTH = 200;
const TEXT_INPUT_DEFAULT_HEIGHT = 50;

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

// TODO: отрефакторить многие функции, разобраться со стейтом
const Canvas = (props: CanvasProps) => {
    const [isSelectionShown, setSelectionIsVisible] = useState(false)
    const [isSelecting, setIsSelecting] = useState(false)
    const [isTransforming, setIsTransforming] = useState(false)
    const [transformData, setTransformData] = useState<TransformData>()
    const [selectionTransformData, setSelectionTransformData] = useState<TransformData>()
    const [editableText, setText] = useState<string | null>(null)
    const imageRefs = useRef<HTMLImageElement[]>([])
    const textInputRef = useRef<HTMLInputElement>(null)
    const selectedTool = props.tool

    useEffect(() => {
        document.addEventListener('keydown', handleKeyPress)

        return () => {
            document.removeEventListener('keydown', handleKeyPress)
        }
    })

    function onCanvasClick(e: React.MouseEvent<HTMLDivElement>) {
        if (e.isDefaultPrevented() || isTransforming) return
        if (selectedTool !== ToolType.Text) return

        const canvasRect = props.canvasRef.current!.getBoundingClientRect()
        const transform: Transform = {
            rect: { 
                left: e.clientX - canvasRect.x, 
                top: e.clientY - canvasRect.y, 
                width: TEXT_INPUT_DEFAULT_WIDTH, 
                height: TEXT_INPUT_DEFAULT_HEIGHT 
            },
            scaleParams: defaultScale()
        }

        setTransformData({
            mouseX: e.clientX,
            mouseY: e.clientY,
            startMouseX: e.clientX,
            startMouseY: e.clientY,
            canvasX: canvasRect.x,
            canvasY: canvasRect.y,
            preTransform: transform,
            transform: transform
        })
        setText(editableText ?? '')
    }

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
        if (!ctx) return

        const image = imageRefs.current[index]
        const scale = transformData?.transform?.scaleParams ?? defaultScale()
        const rect = transformData?.transform?.rect ?? { left: 0, top: 0, width: image.offsetWidth, height: image.offsetHeight }

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

    function drawImages() {
        props.images.forEach((_url, i) => {
            drawImage(i)
            removeImage(i)
        })
    }

    function drawText() {
        let ctx = props.canvasRef.current!.getContext('2d')

        if (!transformData || !ctx) return

        const rect = transformData?.transform.rect!
        const scale = transformData?.transform.scaleParams!
        const flipOffset = scale.scaleX < 0 ? -rect.width : 0

        ctx!.font = '22px sans-serif'
        ctx!.save()
        ctx!.scale(scale.scaleX, scale.scaleY)
        ctx!.fillText(
            editableText ?? '',
            scale.scaleX * rect.left + flipOffset,
            scale.scaleY * (rect.top + rect.height / 2)
        )
        ctx!.restore()

        setText(null)
    }

    function onChangeText(e: React.ChangeEvent<HTMLInputElement>) {
        setText(e.currentTarget.value)
    }

    function onClickText() {
        if (selectedTool === ToolType.Text) {
            textInputRef.current!.focus()
        }
    }

    function removeImage(index: number) {
        props.onRemoveImg(index)
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
                drawText()
                resetTransformData()
                break;
        }
    }

    return (
        <div
            className="canvas"
            onMouseDown={(e) => onSelectStart(e)}
            onMouseMove={(e) => handleMouseMove(e)}
            onMouseUp={() => { setIsTransforming(false); setIsSelecting(false) }}
            onClick={(e) => onCanvasClick(e)}
            style={{
                position: 'relative',
                width: props.width,
                height: props.height,
                cursor: toolTypeToCursor(props.tool)
            }}>
            <canvas id="native-canvas" ref={props.canvasRef} width={props.width} height={props.height} />
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
                    <img
                        crossOrigin='anonymous'
                        ref={el => imageRefs.current[index] = el!}
                        src={url}
                        style={{ display: 'block', width: '100%', height: '100%' }} alt="" />
                </Transformable>
            )}
            {editableText !== null &&
                <Transformable
                    isDraggable={selectedTool === ToolType.Select}
                    isGizmoVisible={true}
                    isResizable={selectedTool === ToolType.Select}
                    canvasWidth={props.width}
                    canvasHeight={props.height}
                    transformData={transformData}
                    alwaysResize={false}
                    setHasStartedTransform={onSetHasStartedTransform}
                    setHasEndedTransform={onSetHasEndedTransform}
                    onClick={() => onClickText()}>
                    <input
                        ref={textInputRef}
                        type='text'
                        placeholder='Enter Text'
                        onChange={(e) => onChangeText(e)}
                        value={editableText}
                        className='transformable-text' autoFocus={true} />
                </Transformable>
            }
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
        </div>
    )
}

export default Canvas