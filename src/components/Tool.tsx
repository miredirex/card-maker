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

export function Tool(props: ToolProps) {
    return <button onClick={props.onClick} className="tool">
        {ToolType[props.toolType]}
    </button>
}