export interface BaseOption {
    flags: string;
    description: string;
    handler(value: string): any;
}
