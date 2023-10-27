"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const node_process_1 = __importDefault(require("node:process"));
const chalk_1 = __importDefault(require("chalk"));
const moment_1 = __importDefault(require("moment"));
class Logger {
    constructor(name, color, indent) {
        this.name = name;
        this.color = chalk_1.default.hex(color ?? '#a742f5');
        this.indent = indent ?? true;
    }
    log(...content) {
        node_process_1.default.stdout.write(`${chalk_1.default.gray(`[${(0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss')}]`)} ${chalk_1.default.gray('[')}${this.color(`${this.name}`)}${chalk_1.default.gray(']')}` + ' ');
        for (const item of content) {
            node_process_1.default.stdout.write(item);
        }
        if (this.indent)
            node_process_1.default.stdout.write('\n');
    }
    info(...content) {
        node_process_1.default.stdout.write(`${chalk_1.default.gray(`[${(0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss')}]`)} ${chalk_1.default.gray('[')}${this.color(`${this.name}`)}${chalk_1.default.gray(']')} ${chalk_1.default.gray('[')}${chalk_1.default.cyan('Info')}${chalk_1.default.gray(']')}` + ' ');
        for (const item of content) {
            node_process_1.default.stdout.write(item);
        }
        if (this.indent)
            node_process_1.default.stdout.write('\n');
    }
    warn(...content) {
        node_process_1.default.stdout.write(`${chalk_1.default.gray(`[${(0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss')}]`)} ${chalk_1.default.gray('[')}${this.color(`${this.name}`)}${chalk_1.default.gray(']')} ${chalk_1.default.gray('[')}${chalk_1.default.yellow('Warning')}${chalk_1.default.gray(']')}` + ' ');
        for (const item of content) {
            node_process_1.default.stdout.write(item);
        }
        if (this.indent)
            node_process_1.default.stdout.write('\n');
    }
    error(...content) {
        node_process_1.default.stdout.write(`${chalk_1.default.gray(`[${(0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss')}]`)} ${chalk_1.default.gray('[')}${this.color(`${this.name}`)}${chalk_1.default.gray(']')} ${chalk_1.default.gray('[')}${chalk_1.default.red('Error')}${chalk_1.default.gray(']')}` + ' ');
        for (const item of content) {
            node_process_1.default.stdout.write(item);
        }
        if (this.indent)
            node_process_1.default.stdout.write('\n');
    }
    debug(...content) {
        node_process_1.default.stdout.write(`${chalk_1.default.gray(`[${(0, moment_1.default)().format('YYYY-MM-DD HH:mm:ss')}]`)} ${chalk_1.default.gray('[')}${this.color(`${this.name}`)}${chalk_1.default.gray(']')} ${chalk_1.default.gray('[')}${chalk_1.default.green('Debug')}${chalk_1.default.gray(']')}` + ' ');
        for (const item of content) {
            node_process_1.default.stdout.write(item);
        }
        if (this.indent)
            node_process_1.default.stdout.write('\n');
    }
    raw(...content) {
        for (const item of content) {
            node_process_1.default.stdout.write(item);
        }
    }
}
exports.Logger = Logger;
