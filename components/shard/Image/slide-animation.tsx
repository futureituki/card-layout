import './slide-animation.css';
import Image from "next/image";
import Gsap from "gsap";
import {FC, useEffect} from "react";
interface Props {
    id:string;
    src: string;
    alt: string;
    ms:number;
}
export const SlideAnimation:FC<Props> = ({id, src, alt, ms }) => {
    useEffect(() => {
        setTimeout(() => {
            Gsap.fromTo(`#${id}`, {
                duration:1,
                clipPath:'inset(calc(50% - 1px) 100% calc(50% - 1px) 0)'
                // clipPath:'inset(calc(100% - 10px) 0% calc(0% - 0px) 0px)'
            }, {
                duration:1,
                clipPath:'inset(calc(50% - 1px) 0% calc(50% - 1px) 0)'
            })
            Gsap.to(`#${id}`, {
                delay:2,
                clipPath:'inset(calc(0% - 0px) 0% calc(0% - 0px) 0px)'
            })
        }, ms)
    },[id])

    return (
        <Image id={id} className='img_anim' src={src} alt={alt} width={200} height={200}/>
    )
}