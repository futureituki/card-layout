'use client'
import './page.css'
import Image from "next/image";
import {ArtistHistory, Artists} from "@/constants/artists";
import Link from "next/link";
import {useEffect, useState, useRef, useCallback} from "react";
import Gsap from "gsap";
import axios, {AxiosError} from "axios";
import Footer from '@/components/shard/Footer/footer'
import Button from "@/components/shard/Button/button";
import PartsWindow from "@/components/shard/Window/parts-window";
import {Disc, Music} from "@/type/disc";
import {Artist} from "@/type/artists";
import {getToken} from "@/utils/spotify_auth/auth";
import {useRouter} from "next/navigation";
import {useInView} from "react-intersection-observer";
import InfiniteScroll  from "react-infinite-scroller"
import { TimelineItem } from '@/components/shard/TimeLineItem'
export default function Page({ params }: { params: { artist_id: string } }) {
    const ref = useRef<HTMLDivElement>();
    const mouseRef = useRef<HTMLDivElement>(null)
    const router = useRouter()
    const { ref: inViewRef, inView } = useInView();
    const setRefs = useCallback(
        (node:any) => {
            ref.current = node;
            inViewRef(node);
        },
        [inViewRef],
    );
    const [audio, setAudio] = useState<HTMLAudioElement>()
    const historyRef = useRef<HTMLDivElement>(null)
    const [disc,setDisc] = useState<Disc[]>([])
    const [relatedArtists,setRelatedArtists] = useState<Artist[]>([])
    const [a, setA] = useState<Artist>()
    const [music, setMusic] = useState<Music[]>()
    const [nextLink, setNextLink] = useState('')
    const [open, setOpen] = useState(false)
    const [audioSourceNode, setAudioSourceNode] = useState<MediaElementAudioSourceNode | null>(null)
    const [audioContext, setAudioContext] = useState<any>()
    const [gainNode, setGainNode] = useState<any>(null);
    const [analyserNode, setAnalyserNode] = useState<any>()
    const [prevClassName, setPrevName] = useState<string>('')
    const [currentCanvas, setCurrentCanvas] = useState<HTMLCanvasElement>()
    const [hasMore, setHasMore] = useState(false);  //再読み込み判定
    const [discId, setDiscId] = useState('')
    const [discImg, setDiscImg] = useState('')
    const [playMusicSrc, setPlayMusicSrc] = useState('')
    let id:number
    const artist = Artists.filter((artist) => artist.artist_id === params.artist_id)[0]
    useEffect(() => {
        if(!localStorage.getItem('token')) {
            const test = async() => {
                // if(localStorage.getItem('token')) return
                const token = await getToken()
                localStorage.setItem('token', token)
            }
            test()
        }
    },[])
    useEffect(() => {
        window.addEventListener('load', () => audio?.pause());
        return () => {
            window.removeEventListener('load', () => audio?.pause());
        };
},[])
    useEffect(() => {
        setAudio(new Audio())
        const context = new AudioContext();
        setAudioContext(context);
        return () => {
            audio?.pause()
            context.close();
            // コンポーネントのアンマウント時にオーディオコンテキストを解放
                const canvasContext = currentCanvas?.getContext('2d');
                canvasContext?.clearRect(0, 0, currentCanvas?.width as number, currentCanvas?.height as number);
            window.cancelAnimationFrame(id)
        };
    },[])
    useEffect(() => {
        if (audioContext) {
            const sourceNode = audioContext.createMediaElementSource(audio);
            setAudioSourceNode(sourceNode);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 512;
            setAnalyserNode(analyser);

            const gainNode = audioContext.createGain();
            setGainNode(gainNode);

            if (sourceNode && analyser && gainNode) {
                sourceNode.connect(analyser);
                analyser.connect(gainNode);
                gainNode.connect(audioContext.destination);
            }
        }
    }, [audioContext]);
    useEffect(() => {
        Gsap.fromTo('#container', {
            duration:4,
            opacity:0,
        }, {
            duration:4,
            opacity:1,
        })
        Gsap.to('#link', {
            color:'#000',
        })
        Gsap.to('#main_title', {
            color:"#000",
        })
        const getInfo = async() => {
            try {
            if(!artist) {
                const artist_res = await axios.get(`https://api.spotify.com/v1/artists/${params.artist_id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token') as string}`
                    }
                })
                setA(artist_res.data)
                }
                const albums_res = await axios.get(`https://api.spotify.com/v1/artists/${params.artist_id}/albums`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token') as string}`
                    }
                })
                const newArr = Array.from(new Set(albums_res.data.items))
                setDisc(newArr as any)
                setNextLink(albums_res.data.next === null ? '' : albums_res.data.next)
                const related_res = await axios.get(`https://api.spotify.com/v1/artists/${params.artist_id}/related-artists`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token') as string}`
                    }
                })
                setRelatedArtists(related_res.data.artists.slice(0,8))
            }catch(e:any) {
                // if(e.err)
                console.log(e.response.status)
                if(e.response.status === 401) {
                    const test = async() => {
                            const token = await getToken()
                            localStorage.setItem('token', token)
                        }
                        await test()
                        console.log(e)
                        getInfo()
                }

            }
        }
        getInfo()
    },[params.artist_id])
    const nextDisc = async() => {
        const res = await axios.get(nextLink, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') as string}`
            }
        })
        setNextLink(res.data.items < 5 ? '' : res.data.next)
        setDisc(disc.concat(res.data.items))
    }
    const loadMore = async() => {
        const res = await axios.get(`https://api.spotify.com/v1/albums/${discId}/tracks?offset=${music?.length}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') as string}`
            }
        })
        if(res.data.items.length < 1) {
            setHasMore(false)
            return;
        }
        res.data.items.map((item:Music) => item['disc_img'] = discImg)
        setMusic([...music!, ...res.data.items])
    }
    // https://api.spotify.com/v1/albums/3LFKZgxC04M8uSRTc3QySo/tracks?limit=20
    const getDiscMusic = async(disc_id:string, disc_img:string) => {
        setOpen(false)
        try {
            const res = await axios.get(`https://api.spotify.com/v1/albums/${disc_id}/tracks`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token') as string}`
                }
            })
            audio?.pause()
            setTimeout(() => {
                res.data.items.map((item:Music) => item['disc_img'] = disc_img)
                setMusic(res.data.items)
                setOpen(true)
                setDiscId(disc_id)
                setHasMore(true)
                setDiscImg(disc_img)
            },150)
        } catch (e) {
            /* @ts-ignore */
            if(e.response.status === 401) {
                console.log('authenicator')
                const test = async() => {
                    // if(localStorage.getItem('token')) return
                    const token = await getToken()
                    localStorage.setItem('token', token)
                }
                test()
            }
        }
    }
//     const mouseLeaveHandler = (e:any) => {
//         console.log('tt')
//         if(mouseRef.current) {
//                 /* @ts-ignore */
//                 Gsap.to(`.${mouseRef.current.className}`, { autoAlpha: 0, duration: 0.4, zIndex:0 });
//         }
//     }
//     const mouseMoveHandler = (e:any, id:string) => {
//         console.log('aa')
//         if(mouseRef.current) {
//             /* @ts-ignore */
//             /* @ts-ignore */
//             const image = document.querySelector('.disc_' + `${id}`)!
//             console.log(image)
//             let linkX = image.getBoundingClientRect().left + 50;
//             /* @ts-ignore */
//             let linkY = image.getBoundingClientRect().top + 50;
//             console.log(linkX, linkY)
//             let cursorX = e.clientX;
//             let cursorY = e.clientY;
//             let centerPoint:{x:number,y:number} = {x:0,y:0};
//             centerPoint.x = cursorX
//             centerPoint.y = cursorY
//             Gsap.to(`.${mouseRef.current.className}`, {translateX: centerPoint.x, translateY: centerPoint.y, overwrite: false, duration:0.4});
//         }
//     }
//     const mouseEnterHandler = (e:MouseEvent, id:string) => {
// //イベントオブジェクトを参照し、カーソル位置情報を取得
//         if(mouseRef.current) {
//             // const mousePosX = e.clientX;
//             // const mousePosY = e.clientY;
//             // const mouseWidth = mouseRef.current.clientWidth;
//             // const cssPosAjust = mouseWidth / 2;
//             // const x = mousePosX - cssPosAjust;
//             // const y = mousePosY;
//             /* @ts-ignore */
//             const image = document.querySelector('.disc_'+`${id}`)!
//             console.log(image)
//             let linkX = image.getBoundingClientRect().left;
//             /* @ts-ignore */
//             let linkY = image.getBoundingClientRect().top;
//             console.log(linkX, linkY)
//             let cursorX = e.clientX;
//             let cursorY = e.clientY;
//             console.log(cursorX, cursorY)
//             let centerPoint:{x:number,y:number} = {x:0,y:0};
//             centerPoint.x = cursorX
//             centerPoint.y = cursorY
//             Gsap.set(`.${mouseRef.current.className}`, { translateX: centerPoint.x, translateY: centerPoint.y });
//             Gsap.to(`.${mouseRef.current.className}`, { autoAlpha: 1, duration: 0.2 });
// //カーソルの位置情報を「mouseStalker」に反映
// //             Gsap.to(`.${mouseRef.current.className}`, {
// //                 left:e.clientX,
// //                 top:e.clientY,
// //                 opacity:1,
// //                 duration:1,
// //             })
//         }
//     }
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const mouseEnterHandler = (e:any) => {
        // マウスストーカーの表示処理
        if(mouseRef.current) {
            // mouseRef.current.style.background = 'black';
        }
    };

    const mouseLeaveHandler = () => {
        // マウスストーカーの非表示処理
        if(mouseRef.current) {
            Gsap.to(`.${mouseRef.current.className}`, {
                opacity:0,
            })        }
    };

    const mouseMoveHandler = (e:any) => {
        // マウスストーカーの位置更新処理
        if(mouseRef.current) {
            const {clientX, clientY} = e;
            setMousePosition({x: clientX, y: clientY});
            Gsap.to(`.${mouseRef.current.className}`, {
                opacity:1,
                left:clientX - 10,
                top:clientY - 10
            })
        }
    };
    // const HistoryScroll = () => {
    //     if(!historyRef.current) return
    //     const historys = historyRef.current.querySelectorAll('.parts__window')
    //     const firstHistory = historys[0]
    //     const secondHistory = historys[1]
    //     const thirdHistory = historys[2]
    //     if(firstHistory.getBoundingClientRect().top < 350) {
    //         Gsap.fromTo(firstHistory, {
    //             duration:.1,
    //             translateY:0,
    //         }, {
    //             duration:.1,
    //             translateY:firstHistory.getBoundingClientRect().top,
    //         })
    //         // Gsap.to(firstHistory, {
    //         //     duration:.1,
    //         //     translateY:firstHistory.getBoundingClientRect().top,
    //         // })
    //         }
    //     if(secondHistory.getBoundingClientRect().top < 350) {
    //         Gsap.to(secondHistory, {
    //             duration:.1,
    //             // translateY:window.scrollY - secondHistory.getBoundingClientRect().top,
    //         })
    //         if(thirdHistory.getBoundingClientRect().top < 350) {
    //             Gsap.to(thirdHistory, {
    //                 duration:.1,
    //                 // translateY:window.scrollY - thirdHistory.getBoundingClientRect().top,
    //             })
    //         }
    //     }
    //     // if(firstHistory.pageY > 800) {
    //     //     console.log('test')
    //     // }
    //
    //          // const history = ref.current
    //     //     // history.scrollLeft = history.scrollWidth
    //     // }
    // }
    // useEffect(() => {
    //     if (historyRef.current) {
    //         HistoryScroll();
    //         window.addEventListener("scroll", HistoryScroll);
    //
    //         // アンマウント時にイベントリスナーを解除
    //     }
    //     // マウント時にも実行
    // }, []);
    const createVisualize = (audioElement:HTMLAudioElement, className:string) => {
        audioElement.crossOrigin = "anonymous";
        setPrevName(className)
        const renderFrame = () => {
            id = requestAnimationFrame(renderFrame);
            if(prevClassName !== '') {
                const canvas = document.querySelector(`.${prevClassName}`) as HTMLCanvasElement
                const canvasContext = canvas.getContext('2d')!;
                canvasContext?.clearRect(0, 0, canvas?.width, canvas?.height);
            }
            const canvas = document.querySelector(`.${className}`) as HTMLCanvasElement
            setCurrentCanvas(canvas)
            if(!canvas) {
                window.cancelAnimationFrame(id)
            }
            const canvasContext = canvas?.getContext('2d')!;

            const dataArray = new Uint8Array(analyserNode.frequencyBinCount);
            analyserNode.getByteFrequencyData(dataArray);
            canvasContext?.clearRect(0, 0, canvas?.width, canvas?.height);
            const barWidth = (canvas?.width / dataArray.length) * 9.5;
            let posX = 0;
            dataArray.forEach((data) => {
                const barHeight = (data / 255) * canvas?.height - 80;

                canvasContext ? canvasContext.fillStyle = `rgb(255,255,255)` : '';
                canvasContext?.fillRect(posX, canvas?.height - barHeight, barWidth, barHeight);

                posX += barWidth + 10;
            });
        };

        renderFrame();
    }
    const playMusic = (src:string, className:string) => {
        if(src === null) return
        if(!audio) return
        if(audio.src === src) {
            audio.pause()
            audio.src = ''
            setPlayMusicSrc('')
        } else {
            audio.src = src
            audio.load()
            setPlayMusicSrc(src)
            createVisualize(audio, className)
            audio.play()
            }
    }
    const goLink = (href:string) => {
        audio?.pause()
        router.push(href)
    }
    const handleClose = () => {
        setOpen(false)
        audio?.pause()
    }
    const loader =<div className="loader" key={0}>Loading ...</div>;
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
                        <div className="artist__image__f">
                            <Image id={a?.id} className="img_load" src={a?.images[0].url ? a?.images[0].url : ''} alt="" width={500} height={500}
                                   unoptimized
                                   onLoadingComplete={() => {
                                       let imageElement = document.getElementById(`#${a?.id}`)
                                       imageElement?.classList.remove('img_load')
                                   }}/>
                        </div>

                        <div className="artists__name">
                            <h2>{a?.name}</h2>
                        </div>
                    </>}
            </div>
            {artist ?
                <>
                <div className="disc__name">
                <h2>Career</h2>
            </div>
                    <div className="sp__timeline">
                        {ArtistHistory.get(artist.name)?.map((data, idx) => (
                            <PartsWindow key={idx} year={data.year} body={data.text}/>
                        ))}
                    </div>
                    <div className="timeline-container">
                        {ArtistHistory.get(artist.name)?.map((data, idx) => (
                            <TimelineItem key={idx * 2} year={data.year} text={data.text}/>
                        ))}
                    </div>
    </>
                : <></>
            }
            <section className="disc__section">
                <div className="disc__name">
                <h2>Discography</h2>
            </div>
            <div className="disc__list">
                {disc?.map((item:Disc, index:number) => (
                        <div className="disc" key={index}>
                                <Image role="button" className={`disc_${item.id}`} onClick={() => getDiscMusic(item.id,item.images[0].url)} src={item.images[0].url} alt="" width={300} height={300} onMouseEnter={(e) => mouseEnterHandler(e)} onMouseLeave={() => mouseLeaveHandler()} onMouseMove={(e) => mouseMoveHandler(e)}/>
                            <div className="music__name">
                                <span>{item.name}</span>
                                <span>{item.release_date}</span>
                            </div>
                        </div>
                ))}
                <div className="mousestorker__view" ref={mouseRef}></div>
            </div>
            {nextLink === '' ? <div></div> : <div className="more__button">
                <Button handle={nextDisc}>もっと見る</Button>
            </div>}
            </section>
            <div className="side__music__menu" style={open ? {right:'0%'} : undefined}>
                    <InfiniteScroll
                        loadMore={loadMore}    //項目を読み込む際に処理するコールバック関数
                        hasMore={hasMore}      //読み込みを行うかどうかの判定
                        loader={loader}
                    >
                        <ul className="music__list">
                            <p>曲</p>
                            <button className="close__button" onClick={handleClose}>×</button>
                            {music?.map((item, index) => (
                                <li key={index} style={item.preview_url === null ? {cursor:'auto'} : {cursor:'pointer'}}>
                                    <div role="button" onClick={() => playMusic(item.preview_url, `canvas_${index + 1}`)}>
                                        <span>{index + 1}</span>
                                        <div className="disc__icon">
                                            <span style={playMusicSrc === item.preview_url ? {display:'block'}: {display:'none'}}></span>
                                            {item.preview_url === null ? <div></div> : <canvas className={["play_canvas",`canvas_${index + 1}`].join(' ')}/>}
                                            {item.preview_url === null ? <div></div> : <Image src={item.disc_img} alt={item.name} width={60} height={60} />}
                                        </div>
                                        {item.name}
                                    </div>
                                    <Link href={item.external_urls.spotify} className="music__link" target={"_blank"}>
                                        <Image src="/link.png" className="spotify__link" alt={`${item.name}のリンク`} width={10} height={10}/>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </InfiniteScroll>
            </div>
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
            {
                relatedArtists ?
                    <section className="infinite__scroll" style={{borderTop:"1px solid #000"}}>
                        <div className="scroll__cover__related"></div>
                        <div className="main__text">
                            <h3>Related Artists</h3>
                        </div>
                        <div className="d-demo d-demo-related">
                            <div className="d-demo__wrap-related">
                                <ul className="d-demo__list d-demo__list--left">
                                    {relatedArtists.map((artist,index)=> (
                                        <li key={index} className="d-demo__item-related">
                                            <div role="button" onClick={() => goLink(`/artists/${artist.id}`)}>
                                                {artist.images[0] ? <Image loading="lazy" src={artist.images[0]?.url} alt="" width={300} height={300} /> : ''}
                                                <div className="related__artists__info">
                                                    <p className="related_artists__name" id="related__name">{artist.name}</p>
                                                    <p className="related__artists__genre">{artist.genres.map((genre,index) => (
                                                        <span key={index}>{genre}</span>
                                                    ))}</p>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                <ul className="d-demo__list d-demo__list--left">
                                    {relatedArtists.map((artist,index)=> (
                                        <li key={index} className="d-demo__item-related">
                                            <div role="button" onClick={() => goLink(`/artists/${artist.id}`)}>
                                                {artist.images[0] ? <Image id={artist.name} loading="lazy" src={artist.images[0]?.url} alt="" width={300} height={300}
                                                                           onLoadingComplete={() => {
                                                                               let relate_imageElement = document.getElementById(`#${artist.name}`)
                                                                               relate_imageElement?.classList.remove('img_load')}}/> : ''}
                                                <div className="related__artists__info">
                                                    <p className="related_artists__name" id="related__name">{artist.name}</p>
                                                    <p className="related__artists__genre">{artist.genres.map((genre,index) => (
                                                        <span key={index}>{genre}</span>
                                                    ))}</p>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </section>
                    : <></>
            }

            <Footer />
        </div>
    )
}