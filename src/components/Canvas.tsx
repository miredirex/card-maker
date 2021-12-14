import React from 'react';
import './styles/Canvas.css'

const CANVAS_DEFAULT_WIDTH = 800;
const CANVAS_DEFAULT_HEIGHT = 600;

interface CanvasProps {
    width: number
    height: number
}

export default class Canvas extends React.Component<CanvasProps> {
    public static defaultProps: CanvasProps = {
        width: CANVAS_DEFAULT_WIDTH,
        height: CANVAS_DEFAULT_HEIGHT
    }

    render() {
        return (
            <div className="canvas" style={{ width: this.props.width, height: this.props.height }}>
                <canvas id="canvas" />
            </div>
        )
    }
}