import {TaskBody} from "./Task";
import axios from "axios";

export async function triggerTask(body: TaskBody) {
    const response = await axios.post(process.env.TASKS_URL, body);
}