import type { Chalk } from 'chalk';
import chalk from 'chalk';
import moment from 'moment';
import type { LoggerColors } from './LoggerColors';

/**
 * Logger adds
 */
class Logger {
	public static DEBUG: boolean = false;

	public readonly name: string;
	public readonly color: LoggerColors | string;
	public readonly chalk: Chalk;

	public constructor(name: string, color: LoggerColors | string) {
		this.name = name;
		this.color = color;
		this.chalk = this.color.startsWith('#') ? chalk.hex(this.color) : chalk[this.color as LoggerColors];
		chalk();
	}

	public log(...args: unknown[]): void {
		const format = `${chalk.gray('<')}${moment().format('MM-DD-YYYY HH:mm:ss')}${chalk.gray('>')} ${chalk.gray(
			'[',
		)}${this.chalk(`${this.name}`)}${chalk.gray(']')}`;

		console.info(format, ...args);
	}

	public info(...args: unknown[]): void {
		const format = `${chalk.gray('<')}${moment().format('MM-DD-YYYY HH:mm:ss')}${chalk.gray('>')} ${chalk.gray(
			'[',
		)}${this.chalk(`${this.name}`)}${chalk.gray(']')} ${chalk.gray('[')}${chalk.cyan('Info')}${chalk.gray(']')}`;

		console.info(format, ...args);
	}

	public warn(...args: unknown[]): void {
		const format = `${chalk.gray('<')}${moment().format('MM-DD-YYYY HH:mm:ss')}${chalk.gray('>')} ${chalk.gray(
			'[',
		)}${this.chalk(`${this.name}`)}${chalk.gray(']')} ${chalk.gray('[')}${chalk.yellow('Warning')}${chalk.gray(']')}`;

		console.info(format, ...args);
	}

	public error(...args: unknown[]): void {
		const format = `${chalk.gray('<')}${moment().format('MM-DD-YYYY HH:mm:ss')}${chalk.gray('>')} ${chalk.gray(
			'[',
		)}${this.chalk(`${this.name}`)}${chalk.gray(']')} ${chalk.gray('[')}${chalk.red('Error')}${chalk.gray(']')}`;

		console.info(format, ...args);
	}

	public success(...args: unknown[]): void {
		const format = `${chalk.gray('<')}${moment().format('MM-DD-YYYY HH:mm:ss')}${chalk.gray('>')} ${chalk.gray(
			'[',
		)}${this.chalk(`${this.name}`)}${chalk.gray(']')} ${chalk.gray('[')}${chalk.greenBright('Success')}${chalk.gray(
			']',
		)}`;

		console.info(format, ...args);
	}

	public debug(...args: unknown[]): void {
		if (!Logger.DEBUG) return;

		const format = `${chalk.gray('<')}${moment().format('MM-DD-YYYY HH:mm:ss')}${chalk.gray('>')} ${chalk.gray(
			'[',
		)}${this.chalk(`${this.name}`)}${chalk.gray(']')} ${chalk.gray('[')}${chalk.redBright('DEBUG')}${chalk.gray(']')}`;

		console.info(format, ...args);
	}
}

export { Logger };
