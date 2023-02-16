import chalk from 'chalk';
import { getProtocolHandler, ProtocolResult } from '../utils/protocols';

export interface SitePrams {
    url: string;
    protocols: string[];
}

const PARALLEL_SITES_EVALUATION: number = 100;

interface EvaluationSiteResults {
    [protocol: string]: ProtocolResult;
}

export interface ConnectivityResults {
    [site: string]: EvaluationSiteResults;
}

export async function evaluate(
    sitesPrams: SitePrams[]
): Promise<ConnectivityResults> {
    const results: ConnectivityResults = {};

    try {
        let lastSiteIndex = Math.min(
            PARALLEL_SITES_EVALUATION,
            sitesPrams.length
        );
        let parallelEvaluationArray: Promise<any>[] = [];
        const evaluateSitePromise = (siteParam: SitePrams) =>
            evaluateSite(siteParam).then(
                (siteResults: EvaluationSiteResults) => {
                    results[siteParam.url] = siteResults;
                }
            );
        let completed = 0;
        for (let i = 0; i < PARALLEL_SITES_EVALUATION; i++) {
            parallelEvaluationArray.push(
                evaluateSitePromise(sitesPrams[i]).then(() => {
                    ++completed;
                    console.log(
                        chalk.blue(
                            'completed',
                            Math.floor((completed / sitesPrams.length) * 100),
                            '%'
                        )
                    );
                    if (lastSiteIndex < sitesPrams.length) {
                        return evaluateSitePromise(sitesPrams[lastSiteIndex++]);
                    }
                })
            );
        }

        await Promise.allSettled(parallelEvaluationArray);
        return results;
    } catch (e) {
        const errorMessage = (e as Error).message;
        console.error(chalk.red(errorMessage));
        return results;
    }
}

async function evaluateSite(
    siteParam: SitePrams
): Promise<EvaluationSiteResults> {
    const evaluationSiteResults: EvaluationSiteResults = {};
    const promisesArray = siteParam.protocols.map((protocol: string) => {
        const protocolHandler = getProtocolHandler(protocol);
        return protocolHandler(siteParam.url).then((protocolResult) => {
            evaluationSiteResults[protocol] = protocolResult;
        });
    });

    await Promise.all(promisesArray);
    return evaluationSiteResults;
}
