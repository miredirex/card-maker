import React from "react";
import './styles/Tool.css'

export enum ToolType {
    Select,
    MoveSelected,
    CropToSelect,
    DeleteSelection,
    Text,
    Shape,
    Image,
}

interface ToolProps {
    toolType: ToolType
}

export class Tool extends React.Component<ToolProps> {
    render() {
        return <div className="tool" style={{ cursor: "pointer" }}>
            {ToolType[this.props.toolType]}
        </div>
    }
}