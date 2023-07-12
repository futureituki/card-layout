import {usePathname} from "next/navigation";
import { NavList } from '@/constants/nav'
import Link from "next/link";
import '@/components/shard/Navigation/header.css'
import {FC} from "react";

interface Props {
    textWhite?: boolean
}
const Header:FC<Props> = ({ textWhite = false }) => {
    return (
        <header className="header_style">
            <div className="header_sp_area">
                <Link href="/">
                    MyFavorite Artist-Site
                </Link>
            </div>
            <div className="header_pc_area">
                <Link href="/" id="main_title">
                    MyFavorite Artist-Site
                </Link>
                <ul className="ul_style">
                    {NavList.map((nav) => (
                            <li id="link" className="li_style" key={nav.name}>
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
