export interface Artist {
    id:string
    images: [
        {
            url:string,
            height:number,
            width:number
        }
    ],
    name:string
    genres:string[]
}[]