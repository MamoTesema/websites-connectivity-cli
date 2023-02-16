import chalk from 'chalk';
import dns from 'node:dns';
import logger from '../logger';
import { ProtocolResult } from '.';

export async function resolveDns(_url: string): Promise<ProtocolResult> {
    let results: ProtocolResult = {
        success: false,
        value: '',
        error: ''
    };
    try {
        const url = new URL(_url);
        const start = process.hrtime.bigint();
        // console.debug('start DNS resolve, host: ', url.hostname);
        results.value = JSON.stringify(
            await dns.promises.resolve(url.hostname)
        );
        // console.debug(
        //     'done DNS resolve, host: ',
        //     url.hostname,
        //     `, Benchmark took ${
        //         (Number(process.hrtime.bigint()) - Number(start)) / 1000000
        //     } milliseconds`
        // );
        results.success = true;
        return results;
    } catch (e) {
        const errorMessage = (e as Error).message;
        console.error(chalk.red(errorMessage));
        results.error = errorMessage;
        return results;
    }
}
