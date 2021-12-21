import React, { useState } from "react";
import 'components/styles/Tool.css'

export enum ToolType {
    Select,
    Text,
    Shape,
    RandomImage,
}

interface ToolProps {
    toolType: ToolType
    icon?: React.ReactElement,
    onClick: React.MouseEventHandler<HTMLButtonElement>;
}

const Tool = (props: ToolProps) => {
    const [pressed, setIsPressed] = useState(false)
    const pressedClassName = pressed ? 'pressed' : ''

    return (
        <button
            onMouseDown={() => setIsPressed(true)}
            onMouseLeave={() => setIsPressed(false)}
            onMouseUp={() => setIsPressed(false)}
            onClick={props.onClick}
            className={`toolbar-item ${pressedClassName}`}>
            {props.icon}
            {ToolType[props.toolType]}
        </button>)
}

export default Tool