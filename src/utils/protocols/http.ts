import { rejects } from 'node:assert';
import http, { IncomingMessage, RequestOptions } from 'node:http';
import https from 'node:https';
import { ProtocolResult } from '.';
import { hrtime } from 'node:process';
import chalk from 'chalk';

interface HttpResults extends ProtocolResult {
    bandwidth: number;
}

async function getRequest(
    _url: string,
    getFunc: (opt: object, callback: (res: IncomingMessage) => any) => any,
    port: number
): Promise<ProtocolResult> {
    let data = '';
    let contentType = 'content-type';
    let latency = 0;
    const start = hrtime.bigint();
    const url = new URL(_url);
    const options: RequestOptions = {
        host: url.host,
        hostname: url.hostname,
        port,
        timeout: 10000,
        path: url.pathname + url.search,
        method: 'GET',
        headers: {
            'User-Agent':
                'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
            'Content-Type': 'text/html'
        }
    };
    const results: HttpResults = {
        success: false,
        value: 0,
        error: '',
        bandwidth: 0
    };
    try {
        // console.debug('start GET request to ', options.host, ', port:', port);
        await new Promise<void>((resolve, rejects) => {
            getFunc(options, (res) => {
                contentType = res.headers['content-type'] as string;

                res.on('data', (d) => {
                    data += d;
                });
                res.on('timeout', (args) => {
                    rejects(
                        new Error(
                            `timeout exceeded, port: ${options.port}, host: ${options.host}`
                        )
                    );
                });
                res.on('close', () => {
                    results.success = res.statusCode === 200;
                    results.value =
                        (Number(hrtime.bigint()) - Number(start)) / 1000000;
                    // console.debug(
                    //     'done GET request to ',
                    //     options.host,
                    //     ', port:',
                    //     port,
                    //     ', latency: ',
                    //     results.value
                    // );
                    results.error = results.success
                        ? ''
                        : `invalid status code ${res.statusCode}`;
                    resolve();
                });
            }).on('error', (e: Error) => {
                rejects(e);
            });
        });
    } catch (e) {
        const errorMessage = (e as Error).message;
        console.error(chalk.red(errorMessage));
        results.error = errorMessage;
        results.value = (Number(hrtime.bigint()) - Number(start)) / 1000000;
    }
    // console.debug(
    //     'done GET request for: ',
    //     url.hostname,
    //     ', port:',
    //     port,
    //     `, Benchmark took ${results.value} milliseconds`
    // );
    return results;
}

export const httpGet = (url: string) => getRequest(url, http.get, 80);
export const httpsGet = (url: string) => getRequest(url, https.get, 443);
