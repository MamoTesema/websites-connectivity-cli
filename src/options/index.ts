import { BaseOption } from './base';
import { fileHandler } from './file';

export const getCommandOptions = (): BaseOption[] => [fileHandler];
