import {Metadata} from "next";

export function createMetadata(subtitle: string = null): Metadata {
    return {
        title: subtitle ? `Parastats • ${subtitle}` : `Parastats`,
        icons: './favicon.ico',
    }
}