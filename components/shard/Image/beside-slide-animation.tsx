import './beside-slide-animation.css';
import Image from "next/image";
import Gsap from "gsap";
import {FC, useEffect} from "react";
interface Props {
    id:string;
    src: string;
    alt: string;
    ms:number;
}
export const BesideSlideAnimation:FC<Props> = ({id, src, alt, ms }) => {
    useEffect(() => {
        setTimeout(() => {
            Gsap.to(`#${id}`, {
                duration:1,
                clipPath:'inset(calc(1% - 1px) 0% calc(1% - 1px) 0)'
            })
        }, ms)
    },[id])

    return (
        <Image id={id} className='img_beside_anim' src={src} alt={alt} width={200} height={200}/>
    )
}