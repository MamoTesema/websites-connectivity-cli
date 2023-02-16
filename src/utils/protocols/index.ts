import { httpGet, httpsGet } from './http';
import { resolveDns } from './dns';

export interface ProtocolResult {
    success: boolean;
    value: string | number;
    error: string;
}

async function ProtocolError(): Promise<ProtocolResult> {
    const unknownProtocol: ProtocolResult = {
        value: '',
        success: false,
        error: 'unknown protocol'
    };
    return unknownProtocol;
}

type ProtocolHandler = (value: any) => Promise<ProtocolResult>;

export function getProtocolHandler(name: string): ProtocolHandler {
    switch (name) {
        case 'http':
            return httpGet;
        case 'https':
            return httpsGet;
        case 'dns':
            return resolveDns;
        default:
            return ProtocolError;
    }
}
