import * as React from 'react'
import './HeaderButton.scss'

interface HeaderButtonProps {
    icon: string
    name: string
    clickHandler?: any
    disabled?: boolean
}

const HeaderButton = (props: HeaderButtonProps) => {
    return (
        <button className="HeaderButton" onClick={props.clickHandler} disabled={props.disabled}>
            <img src={props.icon} alt={props.name} />
        </button>
    )
}

export default HeaderButton