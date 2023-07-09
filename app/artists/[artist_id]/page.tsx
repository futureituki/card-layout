'use client'
import './page.css'
import Image from "next/image";
import {Artists} from "@/constants/artists";
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
export default function Page({ params }: { params: { artist_id: string } }) {
    const ref = useRef<HTMLDivElement>();
    const canvasRef = useRef<HTMLCanvasElement>()
    const router = useRouter()
    const { ref: inViewRef, inView } = useInView();
    const [isPlaying, setIsPlaying] = useState(false)
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
    const [state, setState] = useState('');
    useEffect(() => {
        setAudio(new Audio())
        audio?.setAttribute('playsInline', 'true');
        const context = new AudioContext();
        setAudioContext(context);
        return () => {
            // コンポーネントのアンマウント時にオーディオコンテキストを解放
            audio?.pause()
            context.close();
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
            analyser.fftSize = 128;
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
                const albums_res = await axios.get(`https://api.spotify.com/v1/artists/${params.artist_id}/albums?limit=5`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token') as string}`
                    }
                })
                const newArr = Array.from(new Set(albums_res.data.items))
                setDisc(newArr as any)
                setNextLink(albums_res.data.next === null ? '' : albums_res.data.next)
                const related_res = await axios.get(`https://api.spotify.com/v1/artists/${params.artist_id}/related-artists?limit=6`, {
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
    // https://api.spotify.com/v1/albums/3LFKZgxC04M8uSRTc3QySo/tracks?limit=20
    const getDiscMusic = async(disc_id:string, disc_img:string) => {
        setOpen(false)
        try {
            const res = await axios.get(`https://api.spotify.com/v1/albums/${disc_id}/tracks?limit=20`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token') as string}`
                }
            })
            audio?.pause()
            setTimeout(() => {
                res.data.items.map((item:Music) => item['disc_img'] = disc_img)
                setMusic(res.data.items)
                setOpen(true)
            },200)
        } catch (e) {
            /* @ts-ignore */
            if(e.response.status === 401) {
                console.log('authenicator')
            }
        }
    }
    const HistoryScroll = () => {
        if(!historyRef.current) return
        const historys = historyRef.current.querySelectorAll('.parts__window')
        const firstHistory = historys[0]
        const secondHistory = historys[1]
        const thirdHistory = historys[2]
        if(firstHistory.getBoundingClientRect().top < 350) {
            Gsap.fromTo(firstHistory, {
                duration:.1,
                translateY:0,
            }, {
                duration:.1,
                translateY:firstHistory.getBoundingClientRect().top,
            })
            // Gsap.to(firstHistory, {
            //     duration:.1,
            //     translateY:firstHistory.getBoundingClientRect().top,
            // })
            }
        if(secondHistory.getBoundingClientRect().top < 350) {
            Gsap.to(secondHistory, {
                duration:.1,
                // translateY:window.scrollY - secondHistory.getBoundingClientRect().top,
            })
            if(thirdHistory.getBoundingClientRect().top < 350) {
                Gsap.to(thirdHistory, {
                    duration:.1,
                    // translateY:window.scrollY - thirdHistory.getBoundingClientRect().top,
                })
            }
        }
        // if(firstHistory.pageY > 800) {
        //     console.log('test')
        // }

             // const history = ref.current
        //     // history.scrollLeft = history.scrollWidth
        // }
    }
    useEffect(() => {
        if (historyRef.current) {
            HistoryScroll();
            window.addEventListener("scroll", HistoryScroll);

            // アンマウント時にイベントリスナーを解除
        }
        // マウント時にも実行
    }, []);
    const test = [
        {body:"ワーナーミュージック・ジャパン　初音ミクシンフォニー 2018 SD イラスト\n" +
                "ナナヲアカリ 「フライングベスト~知らないの?巷で噂のダメ天使~」ステッカーイラスト\n" +
                "株式会社 DeNA　TORIKAGO_ILLUSTRATORS 『サクヤの描く最高の自分』\n" +
                "pixiv株式会社　pixivPAY 公式アカウントアイコンイラスト\n" +
                "株式会社セブンコード 「社畜る~ず - ロボ開発編 -」ポスターイラスト", year:"2018"},
        {body:"ワーナーミュージック・ジャパン　初音ミクシンフォニー 2018 SD イラスト\n" +
                "ナナヲアカリ 「フライングベスト~知らないの?巷で噂のダメ天使~」ステッカーイラスト\n" +
                "株式会社 DeNA　TORIKAGO_ILLUSTRATORS 『サクヤの描く最高の自分』\n" +
                "pixiv株式会社　pixivPAY 公式アカウントアイコンイラスト\n" +
                "株式会社セブンコード 「社畜る~ず - ロボ開発編 -」ポスターイラスト", year:"2018"},
        {body:"ワーナーミュージック・ジャパン　初音ミクシンフォニー 2018 SD イラスト\n" +
                "ナナヲアカリ 「フライングベスト~知らないの?巷で噂のダメ天使~」ステッカーイラスト\n" +
                "株式会社 DeNA　TORIKAGO_ILLUSTRATORS 『サクヤの描く最高の自分』\n" +
                "pixiv株式会社　pixivPAY 公式アカウントアイコンイラスト\n" +
                "株式会社セブンコード 「社畜る~ず - ロボ開発編 -」ポスターイラスト", year:"2018"},
    ]
    const createVisualize = (audioElement:HTMLAudioElement, className:string) => {
        audioElement.crossOrigin = "anonymous";
        setPrevName(className)
        const renderFrame = () => {
            id = requestAnimationFrame(renderFrame);
            if(prevClassName !== '') {
                const canvas = document.querySelector(`.${prevClassName}`) as HTMLCanvasElement
                const canvasContext = canvas.getContext('2d')!;
                canvasContext.clearRect(0, 0, canvas.width, canvas.height);
            }
            const canvas = document.querySelector(`.${className}`)! as HTMLCanvasElement
            setCurrentCanvas(canvas)
            if(!canvas) {
                window.cancelAnimationFrame(id)
            }
            const canvasContext = canvas.getContext('2d')!;

            const dataArray = new Uint8Array(analyserNode.frequencyBinCount);
            analyserNode.getByteFrequencyData(dataArray);
            canvasContext.clearRect(0, 0, canvas?.width, canvas?.height);
            const barWidth = (canvas.width / dataArray.length) * 9.5;
            let posX = 0;
            dataArray.forEach((data) => {
                const barHeight = (data / 255) * canvas.height - 80;

                canvasContext.fillStyle = `rgb(255,255,255)`;
                canvasContext.fillRect(posX, canvas.height - barHeight, barWidth, barHeight);

                posX += barWidth + 10;
            });
        };

        renderFrame();
    }
    const playMusic = (src:string, className:string) => {
        if(src === null) return
        if(!audio) return
        // if (audioSourceNode && gainNode) {
        //     // オーディオノードの接続解除
        //     audioSourceNode.disconnect();
        //     gainNode.disconnect();
        //
        //     // 状態をリセット
        //     setAudioSourceNode(null);
        //     setGainNode(null);
        // }
        if(audio.src === src) {
            audio.pause()
            audio.src = ''
        } else {
            audio.src = src
            createVisualize(audio, className)
            audio.play()
            }
    }
    const goLink = (href:string) => {
        audio?.pause()
        router.push(href)
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
            {/*<div className="history" ref={historyRef}>*/}
            {/*    {test.map((item, index) => (*/}
            {/*        <PartsWindow key={index} body={item.body} year={item.year}/>*/}
            {/*    ))}*/}
            {/*</div>*/}
            <div className="disc__name">
                <h2>Discography</h2>
            </div>
            <div className="disc__list">
                {disc?.map((item:Disc, index:number) => (
                    artist ?
                    artist.name === '櫻坂46' || artist.name === '欅坂46' ?
                    item.name.indexOf('(Special Edition)') !== -1 ?
                        <div className="disc" key={index}>
                                <Image role="button" onClick={() => getDiscMusic(item.id,item.images[0].url)} src={item.images[0].url} alt="" width={300} height={300} />
                            <div className="music__name">
                                <span>{item.name.slice(0,item.name.indexOf('(Special Edition)'))}</span>
                                <span>{item.release_date}</span>
                            </div>
                        </div>
                            : '' :
                        <div className="disc" key={index}>
                            <Image role="button" onClick={() => getDiscMusic(item.id,item.images[0].url)} src={item.images[0].url} alt="" width={300} height={300} />
                            <div className="music__name">
                                <span>{item.name}</span>
                                <span>{item.release_date}</span>
                            </div>
                        </div>
                        :   <div className="disc" key={index}>
                            <Image role="button" onClick={() => getDiscMusic(item.id,item.images[0].url)} src={item.images[0].url} alt="" width={300} height={300} />
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
            <div className="side__music__menu" style={open ? {right:'0%'} : {right:'-50%'}}>
                <ul className="music__list">
                    <p>曲</p>
                    {music?.map((item, index) => (
                        <li key={index} onClick={() => playMusic(item.preview_url, `canvas_${item.track_number}`)} style={item.preview_url === null ? {cursor:'auto'} : {cursor:'pointer'}}>
                            <span>{item.track_number}</span>
                            <div className="disc__icon">
                                <span style={audio?.src === item.preview_url ? {display:'block'}: {display:'none'}}></span>
                                {item.preview_url === null ? <div></div> : <canvas className={["play_canvas",`canvas_${item.track_number}`].join(' ')}/>}
                                {item.preview_url === null ? <div></div> : <Image src={item.disc_img} alt={item.name} width={40} height={40} />}
                            </div>
                            {item.name}
                        </li>
                    ))}
                </ul>
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
            <div className="related_artists">
                <ul>
                    {relatedArtists.map((artist,index)=> (
                        <li key={index}>
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
            </div>
            <Footer />
        </div>
    )
}