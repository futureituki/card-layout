import React from "react";
import '@/components/shard/Window/parts-window.css'
interface Props {
    year:string
    body:string
}
const PartsWindow:React.FC<Props> = ({ year,body }) => {
    const texts = body.split(/(\n)/).map((item, index) => {
        return (
            <React.Fragment key={index}>
                { item.match(/\n/) ? <br /> : item }
            </React.Fragment>
        );
    });
    return (
        <div className="parts__window">
            <div className="parts__window__header">
                <div className="parts__window__header__button">
                    <div className="parts__window__header__button__red"></div>
                    <div className="parts__window__header__button__yellow"></div>
                    <div className="parts__window__header__button__green"></div>
                </div>
            </div>
            <div className="parts__window__body">
                <div className="parts__window__body__year">
                    <span>{year}</span>
                </div>
                <div className="parts__window__text">
                    {texts}
                </div>
            </div>
        </div>
    )
}

export default PartsWindow