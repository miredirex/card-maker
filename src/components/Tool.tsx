import React, { useState } from "react";
import 'components/styles/Tool.css'

export enum ToolType {
    Select,
    Text,
    Shape,
}

interface ToolProps {
    isSelected: boolean,
    toolType: ToolType
    icon?: React.ReactElement,
    onClick: React.MouseEventHandler<HTMLButtonElement>;
}

const Tool = (props: ToolProps) => {
    const [pressed, setIsPressed] = useState(false)
    const pressedClassName = pressed ? 'pressed' : ''
    const selectedClassName = props.isSelected ? 'tool-active' : ''

    return (
        <button
            onMouseDown={() => setIsPressed(true)}
            onMouseLeave={() => setIsPressed(false)}
            onMouseUp={() => setIsPressed(false)}
            onClick={props.onClick}
            className={`toolbar-item ${pressedClassName} ${selectedClassName}`}>
            {props.icon}
            {ToolType[props.toolType]}
        </button>)
}

export default Tool