import fs from 'node:fs';
import { BaseOption } from './base';
import { URL } from 'node:url';
import { getFileAs } from '../utils/os/files';
import {
    evaluate,
    ConnectivityResults,
    SitePrams
} from '../evaluations/connectivity';
import chalk from 'chalk';

const INVALID_JSON_STRUCTURE = 'invalid json file structure';

export const fileHandler: BaseOption = {
    handler,
    flags: '-f, --file <sites.json>',
    description: 'test sites connectivity from a given json file'
};

async function handler(path: string): Promise<void> {
    try {
        const sitesConfig = await getFileAs(path, 'json');

        const resultsFilePath = path.replace(
            new RegExp('.json$'),
            '-results.json'
        );
        const sitesPrams = parseJson(sitesConfig as JSON);
        const connectivityResults = await evaluate(sitesPrams);

        const oldResultsFile = JSON.parse(
            (await fs.promises.readFile(resultsFilePath)).toString() || '{}'
        );
        printResults(connectivityResults, oldResultsFile, sitesConfig);
        await saveResults(resultsFilePath, connectivityResults);
    } catch (e) {
        const errorMessage = (e as Error).message;
        console.error(chalk.red(errorMessage));
    }
}

function printResults(
    connectivityResults: ConnectivityResults,
    oldResultsFile: ConnectivityResults,
    sitesConfig: any
): void {
    Object.entries(connectivityResults).forEach(([site, results]) => {
        console.log('connectivity results for:\n', site);
        Object.entries(results).forEach(([protocol, protocolResult]) => {
            let exceedThreshold = '';
            if (['http', 'https'].includes(protocol)) {
                exceedThreshold =
                    oldResultsFile[site] &&
                    oldResultsFile[site][protocol] &&
                    oldResultsFile[site][protocol].value &&
                    Number(sitesConfig[site].threshold) <
                        Number(protocolResult.value) -
                            Number(oldResultsFile[site][protocol].value)
                        ? 'exceed threshold'
                        : '';
            }
            const logArgs = [
                'protocol: ' + protocol,
                'success: ' + protocolResult.success,
                'results: ' + protocolResult.value
            ];
            const error =
                protocolResult.error || exceedThreshold
                    ? `reason: ${protocolResult.error || exceedThreshold}`
                    : '';
            if (error) {
                console.error(chalk.red([...logArgs, error]));
            } else {
                console.log(chalk.green([...logArgs]));
            }
        });
    });
}

async function saveResults(
    filePath: string,
    results: ConnectivityResults
): Promise<any> {
    try {
        await fs.promises.writeFile(filePath, JSON.stringify(results, null, 2));
    } catch (e) {}
}

function parseJson(sitesConfig: { [key: string]: any }): SitePrams[] {
    return Object.entries(sitesConfig).map(([site, config]) => {
        if (!Array.isArray(config.protocols)) {
            throw new Error(INVALID_JSON_STRUCTURE);
        }
        new URL(site);
        const sitePrams: SitePrams = {
            url: site,
            protocols: config.protocols
        };
        return sitePrams;
    });
}
