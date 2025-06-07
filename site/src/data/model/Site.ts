import {Polyline} from "@parastats/common";

export type Site = {
    ffvl_sid: string
    slug: string
    name: string
    lat: number
    lng: number
    alt: number
    polygon: Polyline | undefined
    nearest_balise_id: string | undefined
}