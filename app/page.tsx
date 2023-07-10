'use client'
import './page.css'
import Header from "@/components/shard/Navigation/Header";
import {SlideAnimation} from "@/components/shard/Image/slide-animation";
import HTMLDivElement, {useEffect} from "react";
import Link from "next/link";
import Gsap from "gsap";
import {MouseEvent} from "react";
import Image from "next/image";
import {Artists} from "@/constants/artists";
import {BesideSlideAnimation} from "@/components/shard/Image/beside-slide-animation";
export default function Home() {
    useEffect(() => {
        Gsap.fromTo('#container', {
            duration:2,
            opacity:0,
        }, {
            opacity:1,
        })
    },[])
    const activeAnimation = (visual_id:string, font_id:string) => {
        Gsap.to(`#${visual_id}`, {
            opacity:1,
            scale:1,
        })
        // Gsap.to('#link', {
        //     duration:1,
        //     color:'#fff',
        // })
        Gsap.fromTo(`#${font_id}`, {
            y:30,
            opacity:0,
        }, {
            y:0,
            opacity:1,
        })
    }
    const removeAnimation = (visual_id:string, font_id:string) => {
        Gsap.to(`#${visual_id}`, {
            opacity:0,
            scale:1.05,
        })
        // Gsap.to('#link', {
        //     duration:1,
        //     color:'#000',
        // })
        Gsap.fromTo(`#${font_id}`, {
            y:0,
            opacity:1,
        }, {
            y:-40,
            opacity:0,
        })
    }
    const HoverMove = (e:MouseEvent<HTMLDivElement>) => {
        for(let i = 0; i < Artists.length; i++) {
            let x = Math.round(e.pageX / 10 + Math.random() * 3);
            let y = Math.round(e.pageY / 10 + Math.random() * 16);
            Gsap.to(`#${Artists[i].id}`, {
                duration:2,
                transform:`translate(${x}px, ${y}px)`,
            })
        }
    }
    return (
        <main id="container" className="main">
            <Link className="all__artist__link" href='/all-artists' >all artists<span>→</span></Link>
            <div className="window" onMouseMove={(e) => HoverMove(e)}>
                <div className="window__font">
                    {Artists.map((artist,index) => (
                        <Link key={index} href={`/artists/${artist.artist_id}`}>
                            <p className="artist__name">
                                <span id={artist.id + index}>{artist.name}</span>
                            </p>
                        </Link>
                    ))}
                </div>
                <div className="window__scroll">
                    <div className="window__pc__scroll__work">
                        {Artists.map((artist,index) => (
                            <Link href={`/artists/${artist.artist_id}`} className={artist.id} key={index}>
                            <div id={artist.id + artist.id} onMouseLeave={() => removeAnimation(artist.id+index+'visual', artist.id+index)} onMouseEnter={() => activeAnimation(artist.id+index+'visual', artist.id+index)} >
                                <SlideAnimation ms={index*0.1 * 1000} alt={artist.name} src={artist.image_link} id={artist.id}/>
                            </div>
                            </Link>
                        ))}
                    </div>
                    <div className="window__sp__scroll__work">
                        {Artists.map((artist,index) => (
                            <Link href={`/artists/${artist.artist_id}`} key={index}>
                                <div>
                                    <BesideSlideAnimation ms={index*0.1 * 1000} alt={artist.name} src={artist.image_link} id={artist.id + 'beside'}/>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
                <div className="window__visual">
                    {Artists.map((artist,index) => (
                        <div key={index} id={artist.id+index+'visual'} className="visual__img__area">
                            <img src={artist.image_link} alt={artist.name} width={500} height={500}/>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    )
}
