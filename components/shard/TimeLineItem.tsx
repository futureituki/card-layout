import {FC} from "react";
import '@/components/shard/timeline-item.css'
import PartsWindow from "@/components/shard/Window/parts-window";

interface Props {
    year:string
    text:string
    link?: {
        url:string
        text: string
    }
}
export const TimelineItem:FC<Props> = ( data ) => (
    <div className="timeline-item">
        <div className="timeline-item-content">
            {/*<span className="tag" style={{ background: data.category.color }}>*/}
            {/*    {data.category.tag}*/}
            {/*</span>*/}
            <PartsWindow year={data.year} body={data.text} />
            {/*<time>{data.year}</time>*/}
            {/*<p>{data.text}</p>*/}
            {/*{data.link && (*/}
            {/*    <a*/}
            {/*        href={data.link.url}*/}
            {/*        target="_blank"*/}
            {/*        rel="noopener noreferrer"*/}
            {/*    >*/}
            {/*        {data.link.text}*/}
            {/*    </a>*/}
            {/*)}*/}
            <span className="circle" />
        </div>
    </div>
);