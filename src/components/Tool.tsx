import React from "react";
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
    return <button onClick={props.onClick} className="toolbar-item">
        {props.icon}
        {ToolType[props.toolType]}
    </button>
}

export default Tool