import React from "react";
import 'components/styles/Tool.css'

export enum ToolType {
    Select,
    Text,
    Shape,
    Image,
}

interface ToolProps {
    toolType: ToolType
    onClick: React.MouseEventHandler<HTMLButtonElement>;
}

const Tool = (props: ToolProps) => {
    return <button onClick={props.onClick} className="toolbar-item">
        {ToolType[props.toolType]}
    </button>
}

export default Tool