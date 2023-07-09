import { Inter } from 'next/font/google'
import Header from "@/components/shard/Navigation/Header";
import Footer from "@/components/shard/Footer/footer";
import axios from "axios";
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
    return (
        <section>
            <Header textWhite={true}/>
            {children}
            <Footer />
        </section>
    )
}
