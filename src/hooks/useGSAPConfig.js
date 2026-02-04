import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const useGSAPConfig = () => {
    useLayoutEffect(() => {
        // Global GSAP settings if needed
        // ScrollTrigger.defaults({ markers: false })
    }, [])
}
