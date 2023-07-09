'use client'
import './page.css'
import Image from "next/image";
import {useEffect, useRef} from "react";
import Gsap from "gsap";
import {Artists} from "@/constants/artists";
export default function AllArtists() {
    const ref = useRef(null);
    useEffect(() => {
        Gsap.fromTo('#container', {
            duration:2,
            opacity:0,
        }, {
            opacity:1,
        })
    },[])
    const linkLeaveHandler = (e:any, image_id:string) => {
        if(ref.current) {
            /* @ts-ignore */
            const image = ref.current.querySelector(`#${image_id}`);
            Gsap.to(image, { autoAlpha: 0, duration: 0.4, zIndex:0 });
        }
    }
    const linkEnterHandler = (e:any, image_id:string) => {
        if(ref.current) {
            /* @ts-ignore */
            const image = ref.current.querySelector(`#${image_id}`);
            /* @ts-ignore */
            let linkX = ref.current.getBoundingClientRect().left;
            /* @ts-ignore */
            let linkY = ref.current.getBoundingClientRect().top;
            let cursorX = e.clientX - linkX;
            let cursorY = e.clientY - linkY;
            let centerPoint:{x:number,y:number} = {x:0,y:0};
            centerPoint.x = cursorX - image.offsetWidth / 2;
            centerPoint.y = cursorY - image.offsetHeight / 2;
            Gsap.set(image, { translateX: centerPoint.x, translateY: centerPoint.y });
            Gsap.to(image, { autoAlpha: 1, duration: 0.2 });
        }
    }
    const linkMoveHandler = (e:any, image_id:string) => {
        if(ref.current) {
            /* @ts-ignore */
            const image = ref.current.querySelector(`#${image_id}`);
            /* @ts-ignore */
            let linkX = ref.current.getBoundingClientRect().left + 50;
            /* @ts-ignore */
            let linkY = ref.current.getBoundingClientRect().top + 50;
            let cursorX = e.clientX - linkX;
            let cursorY = e.clientY - linkY;
            let centerPoint:{x:number,y:number} = {x:0,y:0};
            centerPoint.x = cursorX - image.offsetWidth / 2;
            centerPoint.y = cursorY - image.offsetHeight / 2;
            Gsap.to(image, {translateX: centerPoint.x, translateY: centerPoint.y, overwrite: false, duration:0.4});
        }
    }
    return (
        <div id="container" className="all__artist__container">
            <div className="all__artist__inner">
                <div className="artists__image" ref={ref}>
                    {Artists.map((artist, index) => (
                        <Image key={index} id={artist.id} src={artist.image_link} alt="" width={500} height={500}/>
                        ))}
                </div>
                <div className="all__artist__contents">
                    {Artists.map((artist, index) => (
                        <a key={index} href={`/artists/${artist.artist_id}`} className="artist__area" onMouseEnter={(e) => linkEnterHandler(e, artist.id)} onMouseLeave={(e) => linkLeaveHandler(e, artist.id)} onMouseMove={(e) => linkMoveHandler(e, artist.id)}>
                            <div className="artist__area__name">
                                <h2>{artist.name}</h2>
                            </div>
                            <div className="artist__info">
                                <p><span>{artist.type}</span></p>
                                <p><span>{artist.formation_date}</span></p>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    )
}
