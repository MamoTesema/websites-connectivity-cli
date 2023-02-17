#!/usr/bin/env node
import chalk from 'chalk';
import { Command } from 'commander';
import fs from 'fs';
import figlet from 'figlet';
import { getCommandOptions } from './options';
import { BaseOption } from './options/base';

try {
    const pkgJson = JSON.parse(fs.readFileSync('package.json').toString());

    const program = new Command('site-conn');

    console.log(figlet.textSync('site connectivity'));

    program.version(pkgJson.version);
    /*
     * load program options
     */
    const opt = getCommandOptions();
    opt.forEach((option: BaseOption) =>
        program.option(option.flags, option.description, option.handler)
    );

    program.parse(process.argv);
    const options = program.opts();
} catch (e) {
    console.error(chalk.red(e));
    process.exit(1);
}
