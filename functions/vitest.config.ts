import {defineConfig} from "vitest/config";

export default defineConfig({
    test: {
        disableConsoleIntercept: true,
        silent: false,
        exclude: [],
        testTimeout: 60_000,
        // setupFiles: ['dotenv/config'],
    },
})