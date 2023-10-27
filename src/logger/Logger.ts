import process from 'node:process';
import chalk from 'chalk';
import moment from 'moment';

class Logger {
	public readonly name: string;
	public readonly color: chalk.Chalk;
	public readonly indent: boolean;

	public constructor(name: string, color?: string, indent?: boolean) {
		this.name = name;
		this.color = chalk.hex(color ?? '#a742f5');
		this.indent = indent ?? true;
	}

	public log(...content: any[]) {
		process.stdout.write(
			`${chalk.gray(`[${moment().format('YYYY-MM-DD HH:mm:ss')}]`)} ${chalk.gray('[')}${this.color(
				`${this.name}`,
			)}${chalk.gray(']')}` + ' ',
		);
		for (const item of content) {
			process.stdout.write(item as string);
		}

		if (this.indent) process.stdout.write('\n');
	}

	public info(...content: any[]) {
		process.stdout.write(
			`${chalk.gray(`[${moment().format('YYYY-MM-DD HH:mm:ss')}]`)} ${chalk.gray('[')}${this.color(
				`${this.name}`,
			)}${chalk.gray(']')} ${chalk.gray('[')}${chalk.cyan('Info')}${chalk.gray(']')}` + ' ',
		);
		for (const item of content) {
			process.stdout.write(item as string);
		}

		if (this.indent) process.stdout.write('\n');
	}

	public warn(...content: any[]) {
		process.stdout.write(
			`${chalk.gray(`[${moment().format('YYYY-MM-DD HH:mm:ss')}]`)} ${chalk.gray('[')}${this.color(
				`${this.name}`,
			)}${chalk.gray(']')} ${chalk.gray('[')}${chalk.yellow('Warning')}${chalk.gray(']')}` + ' ',
		);
		for (const item of content) {
			process.stdout.write(item as string);
		}

		if (this.indent) process.stdout.write('\n');
	}

	public error(...content: any[]) {
		process.stdout.write(
			`${chalk.gray(`[${moment().format('YYYY-MM-DD HH:mm:ss')}]`)} ${chalk.gray('[')}${this.color(
				`${this.name}`,
			)}${chalk.gray(']')} ${chalk.gray('[')}${chalk.red('Error')}${chalk.gray(']')}` + ' ',
		);
		for (const item of content) {
			process.stdout.write(item as string);
		}

		if (this.indent) process.stdout.write('\n');
	}

	public debug(...content: any[]) {
		process.stdout.write(
			`${chalk.gray(`[${moment().format('YYYY-MM-DD HH:mm:ss')}]`)} ${chalk.gray('[')}${this.color(
				`${this.name}`,
			)}${chalk.gray(']')} ${chalk.gray('[')}${chalk.green('Debug')}${chalk.gray(']')}` + ' ',
		);
		for (const item of content) {
			process.stdout.write(item as string);
		}

		if (this.indent) process.stdout.write('\n');
	}

	public raw(...content: any[]) {
		for (const item of content) {
			process.stdout.write(item as string);
		}
	}
}

export { Logger };
