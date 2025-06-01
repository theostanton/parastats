import {defineConfig} from "vitest/config";

export default defineConfig({
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