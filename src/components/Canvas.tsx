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
    selectX: number
    selectY: number
    selectWidth: number
    selectHeight: number
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
            selectX: 0, selectY: 0, selectWidth: 0, selectHeight: 0, isSelectShown: true
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

        this.setState({
            selectX: e.clientX - this.canvasRef.current!.getBoundingClientRect().x,
            selectY: e.clientY - this.canvasRef.current!.getBoundingClientRect().y,
            selectWidth: 0,
            selectHeight: 0,
            isSelectShown: true
        })
    }

    onSelect(e: React.MouseEvent<HTMLDivElement>) {
        if (this.props.images.length !== 0) return
        if (!this.isSelecting) return

        const deltaX = e.clientX - this.state.selectX - this.canvasRef.current!.getBoundingClientRect().x
        const deltaY = e.clientY - this.state.selectY - this.canvasRef.current!.getBoundingClientRect().y

        this.setState({
            selectWidth: deltaX,
            selectHeight: deltaY,
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
                onMouseDown={(e) => this.onSelectStart(e)}
                onMouseMove={(e) => this.onSelect(e)}
                onMouseUp={(e) => this.onSelectEnd(e)}
                className="canvas"
                style={{
                    position: 'relative',
                    width: this.props.width,
                    height: this.props.height,
                    cursor: this.toolTypeToCursor(this.props.tool)
                }
                }
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
                        x={this.state.selectX} 
                        y={this.state.selectY}
                        width={this.state.selectWidth}
                        height={this.state.selectHeight}
                        isResizable={true} 
                        isDraggable={true} 
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