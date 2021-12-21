import React, { useState } from "react";
import 'components/styles/Tool.css'

interface ActionProps {
    id: string,
    icon?: React.ReactElement,
    onClick: React.MouseEventHandler<HTMLButtonElement>;
}

const Action = (props: React.PropsWithChildren<ActionProps>) => {
    const [pressed, setIsPressed] = useState(false)
    const pressedClassName = pressed ? 'pressed' : ''

    return (
        <button
            id={props.id}
            onMouseDown={() => setIsPressed(true)}
            onMouseLeave={() => setIsPressed(false)}
            onMouseUp={() => setIsPressed(false)}
            onClick={props.onClick}
            className={`toolbar-item ${pressedClassName}`}>
            {props.icon}
            {props.children}
        </button>)
}

export default Action