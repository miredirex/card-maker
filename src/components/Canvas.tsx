import React from 'react';
import 'components/styles/Canvas.css'
import { ToolType } from 'components/Tool';
import { ImageTransformable } from 'components/transformable/ImageTransformable';
import { Drawable } from './transformable/Drawable';
import { SelectionTransformable } from './transformable/SelectionTransformable';

export const CANVAS_DEFAULT_WIDTH = 800;
export const CANVAS_DEFAULT_HEIGHT = 600;

interface CanvasProps {
    width: number
    height: number
    tool: ToolType
    images: string[]
    onRemoveImg: (index: number) => void
}

interface CanvasState {
    left: number,
    right: number,
    top: number,
    bottom: number,
    originalLeft: number,
    originalTop: number,
    isSelectShown: boolean
}

export default class Canvas extends React.Component<CanvasProps, CanvasState> {
    private canvasRef: React.RefObject<HTMLCanvasElement>
    private selectionRef: React.RefObject<SelectionTransformable>
    private isSelecting: boolean = false

    constructor(props: CanvasProps) {
        super(props)
        this.canvasRef = React.createRef()
        this.selectionRef = React.createRef()
        this.state = {
            left: 0, right: 0, top: 0, bottom: 0, originalLeft: 0, originalTop: 0, isSelectShown: false
        }
    }

    componentDidMount() {
        document.addEventListener("keydown", (e) => this.handleKeyPress(e))
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", (e) => this.handleKeyPress(e))
    }

    draw(drawable: Drawable) {
        if (this.canvasRef.current) {
            drawable.draw(this.canvasRef.current)
        }
    }

    // todo: можно ли сделать лучше через стейт? стоит ли выносить callback через пропсы?
    removeImg(index: number) {
        this.props.onRemoveImg(index)
    }

    onSelectStart(e: React.MouseEvent<HTMLDivElement>) {
        if (this.props.images.length !== 0) return

        this.isSelecting = true

        const rect = this.canvasRef.current!.getBoundingClientRect()

        const x = e.clientX - rect.x
        const y = e.clientY - rect.y

        this.setState({
            left: x,
            top: y,
            right: rect.width + x,
            bottom: rect.height + y,
            originalLeft: x,
            originalTop: y,
            isSelectShown: true
        })
    }

    onSelect(e: React.MouseEvent<HTMLDivElement>) {
        if (this.props.images.length !== 0) return
        if (!this.isSelecting) return

        const rect = this.canvasRef.current!.getBoundingClientRect()
        
        const deltaLeft = e.clientX - this.state.originalLeft - rect.x
        const deltaTop = e.clientY - this.state.originalTop - rect.y

        const left = this.state.originalLeft
        const top = this.state.originalTop
        const right = rect.width - (left + deltaLeft)
        const bottom = rect.height - (top + deltaTop)
        
        this.setState({
            left: left,
            right: right,
            top: top,
            bottom: bottom,
        })
    }

    onSelectEnd(e: React.MouseEvent<HTMLDivElement>) {
        this.isSelecting = false
    }

    removeSelection() {
        this.setState({
            isSelectShown: false
        })
    }

    handleKeyPress(e: KeyboardEvent) {
        if (e.code === 'Delete' && this.canvasRef.current) {
            this.selectionRef.current?.clearArea(this.canvasRef.current)
        }
    }

    render() {
        const selectedTool = this.props.tool

        // todo: FC + useEffect

        return (
            <div
                className="canvas"
                onMouseDown={(e) => this.onSelectStart(e)}
                onMouseMove={(e) => this.onSelect(e)}
                onMouseUp={(e) => this.onSelectEnd(e)}
                style={{
                    position: 'relative',
                    width: this.props.width,
                    height: this.props.height,
                    cursor: this.toolTypeToCursor(this.props.tool)
                }}
            >
                {this.props.images.map((url, index) =>
                    <ImageTransformable
                        key={`${url}${index}`}
                        url={url}
                        isDraggable={selectedTool === ToolType.Select}
                        isGizmoVisible={selectedTool === ToolType.Select}
                        isResizable={selectedTool === ToolType.Select}
                        onClickApply={(d) => { this.draw(d); this.removeImg(index) }}
                    />
                )}
                {this.state.isSelectShown &&
                    <SelectionTransformable
                        ref={this.selectionRef}
                        left={this.state.left}
                        right={this.state.right}
                        top={this.state.top}
                        bottom={this.state.bottom}
                        isResizable={false}
                        isDraggable={false}
                        isGizmoVisible={selectedTool === ToolType.Select} />
                }
                <canvas ref={this.canvasRef} width={this.props.width} height={this.props.height} id="canvas" />
            </div>
        )
    }

    private toolTypeToCursor(toolType: ToolType): string {
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
}