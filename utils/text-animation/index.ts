import Gsap from "gsap";

interface Props {
    id:string
}
function textBottomAnimation({id}:Props) {
    Gsap.to(`#${id}`, {

    })
}
function textTopAnimation({id}:Props) {
    Gsap.to(`#${id}`, {
        top:0,

    })
}