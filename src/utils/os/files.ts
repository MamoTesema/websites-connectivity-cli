import fs from 'node:fs';

type FilesType = string | JSON;

export async function getFileAs(
    path: string,
    format: string,
    throwException: boolean = true
): Promise<FilesType> {
    try {
        const file = (await fs.promises.readFile(path)).toString();
        switch (format) {
            case 'json':
                return JSON.parse(file);
            default:
                return file;
        }
    } catch (e) {
        if (throwException) throw e;
        else return '';
    }
}

async function getFile(path: string) {}

export async function writeFile(
    path: string,
    data: string,
    throwException: boolean = false
): Promise<any> {
    try {
        return fs.promises.writeFile(path, data);
    } catch (e) {
        if (throwException) throw e;
        else return '';
    }
}
