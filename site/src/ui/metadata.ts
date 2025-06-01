import {Metadata} from "next";

export function createMetadata(subtitle: string = null): Metadata {
    return {
        title: subtitle ? `Paraglider Stats • ${subtitle}` : `Paraglider Stats`,
        icons: './favicon.ico',
    }
}