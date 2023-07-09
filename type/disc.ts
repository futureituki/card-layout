export interface Disc {
    id:string
            name:string
            images:[
                {
                    url:string,
                    height:number,
                    width:number
                }
            ]
            release_date:string
}
export interface Music {
    disc_img:string
    name:string
    preview_url:string
    id:string
    duration_ms:number
    track_number:number
}