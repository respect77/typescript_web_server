import fs from 'fs/promises'
import util from 'util'

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

export const Sleep = util.promisify(setTimeout);