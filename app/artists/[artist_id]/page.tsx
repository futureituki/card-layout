'use client'
import './page.css'
import Image from "next/image";
import {Artists} from "@/constants/artists";
import Link from "next/link";
import {useEffect, useState} from "react";
import Gsap from "gsap";
import axios from "axios";
import Footer from '@/components/shard/Footer/footer'
import Button from "@/components/shard/Button/button";
export default function Page({ params }: { params: { artist_id: string } }) {
    const [disc,setDisc] = useState([])
    const [relatedArtists,setRelatedArtists] = useState([])
    const [a, setA] = useState()
    const [nextLink, setNextLink] = useState('')
    const artist = Artists.filter((artist) => artist.artist_id === params.artist_id)[0]
    useEffect(() => {
        Gsap.fromTo('#container', {
            duration:2,
            opacity:0,
        }, {
            duration:2,
            opacity:1,
        })
        const getInfo = async() => {
            try {
            if(!artist) {
                const artist_res = await axios.get(`https://api.spotify.com/v1/artists/${params.artist_id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token').toString()}`
                    }
                })
                setA(artist_res.data)
                }
                const albums_res = await axios.get(`https://api.spotify.com/v1/artists/${params.artist_id}/albums?limit=5`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token').toString()}`
                    }
                })
                console.log(albums_res.data.items)
                const newArr = Array.from(new Set(albums_res.data.items))
                setDisc(newArr)
                setNextLink(albums_res.data.next === null ? '' : albums_res.data.next)
                const related_res = await axios.get(`https://api.spotify.com/v1/artists/${params.artist_id}/related-artists`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token').toString()}`
                    }
                })
                setRelatedArtists(related_res.data.artists)
            }catch(e) {
                console.log(e)
            }
        }
        getInfo()
    },[params.artist_id])
    useEffect(() => {
    },[disc])
    const nextDisc = async() => {
        const res = await axios.get(nextLink, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token').toString()}`
            }
        })
        setNextLink(res.data.items < 5 ? '' : res.data.next)
        setDisc(disc.concat(res.data.items))
    }
    return (
        <div id="container" className="artist_container">
            <div className="top_visual">
                {artist ?
                    <>
                        <Image src={artist.image_link} alt="" width={500} height={500} />
                        <div className="artists__name">
                            <h2>{artist.name}</h2>
                            <h4>{artist.formation_date}</h4>
                        </div>
                    </>
                    :  <>
                        <Image src={a?.images[0].url ? a?.images[0].url : ''} alt="" width={500} height={500} />
                        <div className="artists__name">
                            <h2>{a?.name}</h2>
                        </div>
                    </>}
            </div>
            <div className="disc__name">
                <h2>Discography</h2>
            </div>
            <div className="music__list">
                {disc.map((item, index) => (
                    artist ?
                    artist.name === '櫻坂46' || artist.name === '欅坂46' ?
                    item.name.indexOf('(Special Edition)') !== -1 ?
                        <div className="music" key={index}>
                                <Image src={item.images[0].url} alt="" width={300} height={300} />
                            <div className="music__name">
                                <span>{item.name.slice(0,item.name.indexOf('(Special Edition)'))}</span>
                                <span>{item.release_date}</span>
                            </div>
                        </div>
                            : '' :
                        <div className="music" key={index}>
                            <Image src={item.images[0].url} alt="" width={300} height={300} />
                            <div className="music__name">
                                <span>{item.name}</span>
                                <span>{item.release_date}</span>
                            </div>
                        </div>
                        :   <div className="music" key={index}>
                            <Image src={item.images[0].url} alt="" width={300} height={300} />
                            <div className="music__name">
                                <span>{item.name}</span>
                                <span>{item.release_date}</span>
                            </div>
                        </div>
                ))}
            </div>
            {nextLink === '' ? <div></div> : <div className="more__button">
                <Button handle={nextDisc}>もっと見る</Button>
            </div>}
            <Link href="/all-artists" className="infinite__scroll">
                <div className="scroll__cover"></div>
                <div className="main__text">
                    <h3>All Artists</h3>
                </div>
                <div className="d-demo">
                    <div className="d-demo__wrap">
                        <ul className="d-demo__list d-demo__list--left">
                            {Artists.map((artist,index) => (
                                <li key={artist.id} className="d-demo__item"><Image src={artist.image_link} alt="" width={400} height={400}/></li>
                                ))}
                        </ul>
                        <ul className="d-demo__list d-demo__list--left">
                            {Artists.map((artist,index) => (
                                <li key={index} className="d-demo__item"><Image src={artist.image_link} alt="" width={400} height={400}/></li>
                            ))}
                        </ul>
                    </div>
                </div>
            </Link>
            <div className="related_artists">
                <ul>
                    {relatedArtists.map((artist,index)=> (
                        <li key={index}>
                            <Link href={`/artists/${artist.id}`}>
                                {artist.images[0] ? <Image src={artist.images[0]?.url} alt="" width={300} height={300} /> : ''}
                                <p className="related_artists__name" id="related__name">{artist.name}</p>
                            </Link>
                        </li>
                ))}
                </ul>
            </div>
            <Footer />
        </div>
    )
}