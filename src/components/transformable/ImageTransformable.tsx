import { Transformable, TransformableProps } from "components/transformable/Transformable";
import React from "react";

interface ImageTransformableProps extends TransformableProps {
    url: string
}

export class ImageTransformable extends Transformable<ImageTransformableProps> {
    private drawableElementRef: React.RefObject<HTMLImageElement>

    override drawableElement: JSX.Element

    onImageLoad(e: React.SyntheticEvent<HTMLImageElement, Event>) {
        super.setState({
            width: e.currentTarget.naturalWidth,
            height: e.currentTarget.naturalHeight
        })
    }

    constructor(props: ImageTransformableProps) {
        super(props)
        this.drawableElementRef = React.createRef();
        this.drawableElement = <img onLoad={(e) => this.onImageLoad(e)} style={{display: 'block', width: '100%', height: '100%'}} alt="" ref={this.drawableElementRef} src={props.url}/>
    }
    
    override draw(canvas: HTMLCanvasElement) {
        let ctx = canvas.getContext('2d')
        if (this.drawableElementRef.current) {
            ctx?.drawImage(
                this.drawableElementRef.current, 
                this.state.offsetX, 
                this.state.offsetY,
                this.drawableElementRef.current.width,
                this.drawableElementRef.current.height
            )
        }
    }
}