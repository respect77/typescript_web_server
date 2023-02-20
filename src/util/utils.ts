import fs from 'fs/promises'
import util from 'util'
import { RequestInfo, RequestInit } from "node-fetch";
const fetch = (url: RequestInfo, init?: RequestInit) =>  import("node-fetch").then(({ default: fetch }) => fetch(url, init));

export async function FileReadJson(path: string): Promise<any> {
    try {
        var result = await fs.readFile(path, 'utf8');
        return JSON.parse(result);
    }
    catch (error) {
        console.log(error);
        return null;
    }
}

export async function RequestGetJson(url: string): Promise<any> {
    try {
        const response = await fetch(url);
        const result = await response.json() as any;
        return result
    }
    catch (error) {
        console.log(error);
        return null;
    }
}

export const Sleep = util.promisify(setTimeout);