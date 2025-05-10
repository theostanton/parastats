import {app} from "./index"

import {config} from "dotenv"

config()

if (!process.env.API_PORT) {
    throw new Error('API_PORT environment variable is required');
}
const PORT = process.env.API_PORT!

app.listen(PORT, () => {
    console.log(`API is running on port ${PORT}`);
});