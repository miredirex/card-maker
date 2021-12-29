import React, { useEffect, useRef, useState } from 'react';
import 'components/styles/Canvas.css'
import { ToolType } from 'components/Tool';
import Transformable, { TransformData, Transform, defaultScale } from './Transformable';
import { CanvasDrawable } from 'canvas/CanvasDrawable';
import { DrawableType } from 'canvas/DrawableType';
import { CanvasState } from 'canvas/CanvasState';
import useUndo from 'history/history';

export const CANVAS_DEFAULT_WIDTH = 800;
export const CANVAS_DEFAULT_HEIGHT = 600;

const TEXT_INPUT_DEFAULT_WIDTH = 200;
const TEXT_INPUT_DEFAULT_HEIGHT = 50;

interface CanvasProps {
    width: number
    height: number
    tool: ToolType
    // TODO: move from App to canvas component as useState?
    drawables: CanvasDrawable[]
    canvasRef: React.RefObject<HTMLCanvasElement>
    onRemoveDrawable: (index: number) => void
    onAddText: () => void 
    onChangeText: (index: number, text: string) => void
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
    const [transformDataArray, setTransformDataArray] = useState<(TransformData|null)[]>([])
    const [selectionTransformData, setSelectionTransformData] = useState<TransformData>()
    const drawableRefs = useRef<HTMLElement[]>([])
    const [selectedIndex, setSelectedIndex] = useState<number>(-1)
    const selectedTool = props.tool

    // History
    const [
        canvasState,
        {
            set: setCanvasState,
            reset: resetCanvasState,
            undo,
            redo,
            canUndo,
            canRedo,
        },
    ] = useUndo<CanvasState>({})

    useEffect(() => {
        // nulls are "reservation slots", transformDataArray.length == props.drawable.length
        setTransformDataArray(arr => props.drawables.map((_, i) => {
            return arr[i] ?? null
        }))
        setSelectedIndex(props.drawables.length - 1)
    }, [props.drawables])

    useEffect(() => {
        document.addEventListener('keydown', handleKeyPress)

        return () => {
            document.removeEventListener('keydown', handleKeyPress)
        }
    })
    
    useEffect(() => {
        const imageData = canvasState.present.imageData
        const ctx = props.canvasRef.current?.getContext('2d')!
        if (imageData) {
            ctx.clearRect(0, 0, props.width, props.height)
            ctx.putImageData(imageData, 0, 0)
        } else {
            ctx.clearRect(0, 0, props.width, props.height)
        }
    }, [canvasState, props.canvasRef, props.width, props.height])

    function saveCanvasState() {
        const imageData = props.canvasRef.current?.getContext('2d')?.getImageData(0, 0, props.width, props.height)!
        setCanvasState({imageData: imageData})
    }

    function updateTransformData(index: number, newData: TransformData) {
        setTransformDataArray(transformDataArray.map((sameData, i) => i === index ? newData : sameData))
    }

    function removeTransformData(index: number) {
        setTransformDataArray(transformDataArray.filter((_, i) => index !== i))
    }

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

        setTransformDataArray([...transformDataArray, {
            mouseX: e.clientX,
            mouseY: e.clientY,
            startMouseX: e.clientX,
            startMouseY: e.clientY,
            canvasX: canvasRect.x,
            canvasY: canvasRect.y,
            preTransform: transform,
            transform: transform
        }])
        props.onAddText()
    }

    function onSetHasStartedTransform(drawableIndex: number, mouseX: number, mouseY: number, preTransform: Transform) {
        const canvasRect = props.canvasRef.current!.getBoundingClientRect()

        setIsSelecting(false)
        setSelectionIsVisible(false)
        setIsTransforming(true)

        setSelectedIndex(drawableIndex)
        updateTransformData(drawableIndex, {
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

    function onSetHasEndedTransform(drawableIndex: number, transform: Transform) {
        setIsTransforming(false)
        updateTransformData(drawableIndex, {
            ...transformDataArray[drawableIndex]!,
            transform: transform
        })
    }

    function drawSelected() {
        if (selectedIndex === -1) return

        switch (props.drawables[selectedIndex].type) {
            case DrawableType.Image:
                drawImage()
                break
            case DrawableType.Text:
                drawText()
                break
        }
    }

    function removeSelected() {
        removeTransformData(selectedIndex)
        props.onRemoveDrawable(selectedIndex)
    }

    function drawImage() {
        let ctx = props.canvasRef.current!.getContext('2d')!

        const image = drawableRefs.current[selectedIndex] as HTMLImageElement
        const scale = transformDataArray[selectedIndex]?.transform?.scaleParams ?? defaultScale()
        const rect = transformDataArray[selectedIndex]?.transform?.rect ?? { left: 0, top: 0, width: image.offsetWidth, height: image.offsetHeight }

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

    function drawText() {
        let ctx = props.canvasRef.current!.getContext('2d')!

        const rect = transformDataArray[selectedIndex]?.transform.rect!
        const scale = transformDataArray[selectedIndex]?.transform.scaleParams!
        const flipOffset = scale.scaleX < 0 ? -rect.width : 0
        const inputField = drawableRefs.current[selectedIndex] as HTMLInputElement

        ctx!.font = '22px sans-serif'
        ctx!.save()
        ctx!.scale(scale.scaleX, scale.scaleY)
        ctx!.fillText(
            inputField.value ?? '',
            scale.scaleX * rect.left + flipOffset,
            scale.scaleY * (rect.top + rect.height / 2)
        )
        ctx!.restore()
    }

    function onChangeText(index: number, e: React.ChangeEvent<HTMLInputElement>) {
        props.onChangeText(index, e.currentTarget.value)
    }

    function onClickTransformable(drawableIndex: number, e: React.MouseEvent<HTMLDivElement>) {
        if (selectedTool === ToolType.Text && props.drawables[drawableIndex].type === DrawableType.Text) {
            const input = drawableRefs.current[drawableIndex] as HTMLInputElement
            input.focus()
            setSelectedIndex(drawableIndex)
        } else {
            onCanvasClick(e)
        }
    }

    function onSelectStart(e: React.MouseEvent<HTMLDivElement>) {
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

        if (isTransforming && selectedIndex !== -1) {
            const canvasRect = props.canvasRef.current!.getBoundingClientRect()
            updateTransformData(selectedIndex, {
                ...transformDataArray[selectedIndex]!,
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
                saveCanvasState()
                break
            case 'Enter':
                drawSelected()
                removeSelected()
                saveCanvasState()
                break
            case 'KeyZ':
                if (e.ctrlKey && canUndo) undo()
                break
            case 'KeyY':
                if (e.ctrlKey && canRedo) redo()
                break
        }
    }

    function drawableToElement(index: number, drawable: CanvasDrawable): JSX.Element {
        switch (drawable.type) {
            case DrawableType.Image:
                return <img
                    crossOrigin='anonymous'
                    ref={el => drawableRefs.current[index] = el!}
                    src={drawable.data}
                    style={{ display: 'block', width: '100%', height: '100%' }} alt="" />
            case DrawableType.Text:
                return <input
                    ref={el => drawableRefs.current[index] = el!}
                    type='text'
                    placeholder='Enter Text'
                    onChange={(e) => onChangeText(index, e)}
                    value={drawable.data}
                    className='transformable-text' autoFocus={true} />
            default:
                return <></>
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
            {props.drawables.map((d, index) =>
                <Transformable
                    key={index}
                    isDraggable={selectedTool === ToolType.Select}
                    isGizmoVisible={true}
                    isResizable={selectedTool === ToolType.Select && index === selectedIndex}
                    canvasWidth={props.width}
                    canvasHeight={props.height}
                    transformData={transformDataArray[index] ?? undefined}
                    alwaysResize={false}
                    setHasStartedTransform={(mouseX, mouseY, preTransform) => onSetHasStartedTransform(index, mouseX, mouseY, preTransform)}
                    setHasEndedTransform={(transform) => onSetHasEndedTransform(index, transform)}
                    onClick={(e) => onClickTransformable(index, e)}
                    zIndex={selectedIndex === index ? props.drawables.length : 0}>
                    {drawableToElement(index, d)}
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
        </div>
    )
}

export default Canvas