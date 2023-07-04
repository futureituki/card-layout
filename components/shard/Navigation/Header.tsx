'use client'
import {usePathname} from "next/navigation";
import { NavList } from '@/constants/nav'
import Link from "next/link";
import '@/components/shard/Navigation/header.css'
import {useEffect, useState} from "react";
const Header = () => {
    const pathname = usePathname()
    const [isWhite, setIsWhite] = useState<boolean>(false)
    console.log(pathname)
    useEffect(() => {
        if(pathname === '/all-artists') {
            setIsWhite(true)
        } else {
            setIsWhite(false)
        }
    },[pathname])
    return (
        <header className="header_style">
            <div className="header_sp_area">
                <Link href="/">
                    test Site
                </Link>
                <ul className="ul_style">
                    {NavList.map((nav) => (
                            <li id="link" style={isWhite ? {color:"white"} : {color:"black"}} className="li_style" key={nav.name}>
                                <Link href={nav.href}>
                                    {nav.name}
                                </Link>
                            </li>
                        )
                    )}
                </ul>
            </div>
            <div className="header_pc_area">
                <Link href="/">
                    MyFavorite Site
                </Link>
                <ul className="ul_style">
                    {NavList.map((nav) => (
                            <li id="link" style={isWhite ? {color:"white"} : {color:"black"}} className="li_style" key={nav.name}>
                                <Link href={nav.href}>
                                    {nav.name}
                                </Link>
                            </li>
                        )
                    )}
                </ul>
            </div>
        </header>
    )
}

export default Header
