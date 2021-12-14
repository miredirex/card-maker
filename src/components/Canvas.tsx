import React from 'react';
import './styles/Canvas.css'
import { ToolType } from './Tool';

const CANVAS_DEFAULT_WIDTH = 800;
const CANVAS_DEFAULT_HEIGHT = 600;

interface CanvasProps {
    width: number
    height: number
    tool: ToolType
}

export default class Canvas extends React.Component<CanvasProps> {
    public static defaultProps: CanvasProps = {
        width: CANVAS_DEFAULT_WIDTH,
        height: CANVAS_DEFAULT_HEIGHT,
        tool: ToolType.Select
    }

    render() {
        return (
            <div className="canvas" style={{ 
                position: 'relative',
                width: this.props.width, 
                height: this.props.height, 
                cursor: this.toolTypeToCursor(this.props.tool) }
            }>
                {this.props.children}
                <canvas style={{ width: 'inherit', height: 'inherit' }} id="canvas" />
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