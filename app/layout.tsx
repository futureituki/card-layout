'use client'
import './globals.css'
import { Inter } from 'next/font/google'
import Header from "@/components/shard/Navigation/Header";
import Footer from "@/components/shard/Footer/footer";
import axios from "axios";
import {useEffect} from "react";
import {getToken} from "@/utils/spotify_auth/auth";
// const inter = Inter({ subsets: ['latin'] })

// export const metadata = {
//   title: 'Artist MyFavorite Site',
//   description: '',
// }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
      const test = async() => {
          // if(localStorage.getItem('token')) return
          const token = await getToken()
          localStorage.setItem('token', token)
      }
      test()
  },[])
  return (
    <html lang="ja">
      <body>
      <Header/>
      {children}
      </body>
    </html>
  )
}
