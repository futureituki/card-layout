import React, {FC} from "react";
import '@/components/shard/Button/button.css'
interface Props {
    children: React.ReactNode;
    handle: () => void;
}
const Button:FC<Props> = ({ children, handle }) => {
    return (
        <button onClick={() => handle()} type="button" className="primary__button">
            <span>{children}</span>
        </button>
    )
}

export default  Button