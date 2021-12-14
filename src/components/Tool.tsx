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

export class Tool extends React.Component<ToolProps> {
    render() {
        return <button onClick={this.props.onClick} className="tool">
            {ToolType[this.props.toolType]}
        </button>
    }
}