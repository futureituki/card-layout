import './globals.css'
import { Inter } from 'next/font/google'
import Header from "@/components/shard/Navigation/Header";
import Footer from "@/components/shard/Footer/footer";
import {LoopScrollView} from "@/components/shard/Parent/ScrollView";
const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Artist MyFavorite Site',
  description: '',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
        <body>
        <Header/>
        <LoopScrollView>
        {children}
        </LoopScrollView>
        </body>
    </html>
  )
}
