import React from 'react';
import 'components/styles/Canvas.css'
import { ToolType } from 'components/Tool';
import { ImageTransformable } from 'components/transformable/ImageTransformable';
import { Drawable } from './transformable/Drawable';

export const CANVAS_DEFAULT_WIDTH = 800;
export const CANVAS_DEFAULT_HEIGHT = 600;

interface CanvasProps {
    width: number
    height: number
    tool: ToolType
    images: string[]
    onRemoveImg: (index: number) => void
}

export default class Canvas extends React.Component<CanvasProps> {
    private canvasRef: React.RefObject<HTMLCanvasElement>

    draw(drawable: Drawable) {
        if (this.canvasRef.current) {
            drawable.draw(this.canvasRef.current)
        }
    }

    // todo: можно ли сделать лучше через стейт? стоит ли выносить callback через пропсы?
    removeImg(index: number) {
        this.props.onRemoveImg(index)
    }

    constructor(props: CanvasProps) {
        super(props)
        this.canvasRef = React.createRef()
    }

    render() {
        const selectedTool = this.props.tool

        return (
            <div className="canvas" style={{
                position: 'relative',
                width: this.props.width,
                height: this.props.height,
                cursor: this.toolTypeToCursor(this.props.tool)
            }
            }>
                {this.props.images.map((url, index) =>
                    <ImageTransformable
                        key={`${url}${index}`}
                        url={url}
                        isDraggable={selectedTool === ToolType.Select}
                        isGizmoVisible={selectedTool === ToolType.Select}
                        isResizable={true}
                        onClickApply={(d) => { this.draw(d); this.removeImg(index) }}
                    />
                )}
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