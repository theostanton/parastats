import {defineConfig} from "vitest/config";
import path from "path";

export default defineConfig({
    resolve: {
        alias: {
            "@/model": path.resolve(__dirname, "./src/model"),
            "@/database": path.resolve(__dirname, "./src/model/database"),
            "@/stravaApi": path.resolve(__dirname, "./src/model/stravaApi/index"),
            "@/ffvlApi": path.resolve(__dirname, "./src/model/ffvlApi/index"),
            "@/tasks": path.resolve(__dirname, "./src/tasks"),
            "@/api": path.resolve(__dirname, "./src/api"),
            "@/webhooks": path.resolve(__dirname, "./src/webhooks"),
            "@/utils": path.resolve(__dirname, "./src/utils"),
            "@/jwt": path.resolve(__dirname, "./src/jwt")
        }
    },
    test: {
        disableConsoleIntercept: true,
        silent: false,
        exclude: [],
        env: {
            FFVL_KEY: ""
        },
        testTimeout: 60_000,
        // setupFiles: ['dotenv/config'],
    },
})