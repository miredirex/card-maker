import { Transformable, TransformableProps } from "components/transformable/Transformable";
import React, { useRef } from "react";

interface ImageTransformableProps extends TransformableProps {
    url: string
}

export class ImageTransformable extends Transformable<ImageTransformableProps> {
    private drawableElementRef: React.RefObject<HTMLImageElement>

    override drawableElement: JSX.Element

    constructor(props: ImageTransformableProps) {
        super(props)
        this.drawableElementRef = React.createRef();
        this.drawableElement = <img style={{display: 'block'}} alt="" ref={this.drawableElementRef} src={props.url}/>
    }
    
    override draw(canvas: HTMLCanvasElement) {
        let ctx = canvas.getContext('2d')

        if (this.drawableElementRef.current) {
            ctx?.drawImage(
                this.drawableElementRef.current, 
                this.state.moveX, 
                this.state.moveY,
                this.drawableElementRef.current.width,
                this.drawableElementRef.current.height
            )
        }
    }
}