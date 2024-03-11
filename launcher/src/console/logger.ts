import moment from "moment";
import chalk from "chalk";

import type { LoggerColors } from "./logger-colors";

/**
 * Logger adds
 */
class Logger {
	public static DEBUG: boolean = false;

	public readonly name: string;
	public readonly color: LoggerColors | string;
	public readonly chalk: chalk.Chalk;

	public constructor(name: string, color: LoggerColors | string) {
		this.name = name;
		this.color = color;
		this.chalk = this.color.startsWith("#")
			? chalk.hex(this.color)
			: chalk[this.color as LoggerColors];
		chalk();
	}

	public log(...arguments_: Array<unknown>): void {
		const format = `${chalk.gray("<")}${moment().format("MM-DD-YYYY HH:mm:ss")}${chalk.gray(">")} ${chalk.gray(
			"["
		)}${this.chalk(`${this.name}`)}${chalk.gray("]")}`;

		console.info(format, ...arguments_);
	}

	public info(...arguments_: Array<unknown>): void {
		const format = `${chalk.gray("<")}${moment().format("MM-DD-YYYY HH:mm:ss")}${chalk.gray(">")} ${chalk.gray(
			"["
		)}${this.chalk(`${this.name}`)}${chalk.gray("]")} ${chalk.gray("[")}${chalk.cyan("Info")}${chalk.gray("]")}`;

		console.info(format, ...arguments_);
	}

	public warn(...arguments_: Array<unknown>): void {
		const format = `${chalk.gray("<")}${moment().format("MM-DD-YYYY HH:mm:ss")}${chalk.gray(">")} ${chalk.gray(
			"["
		)}${this.chalk(`${this.name}`)}${chalk.gray("]")} ${chalk.gray("[")}${chalk.yellow("Warning")}${chalk.gray("]")}`;

		console.info(format, ...arguments_);
	}

	public error(...arguments_: Array<unknown>): void {
		const format = `${chalk.gray("<")}${moment().format("MM-DD-YYYY HH:mm:ss")}${chalk.gray(">")} ${chalk.gray(
			"["
		)}${this.chalk(`${this.name}`)}${chalk.gray("]")} ${chalk.gray("[")}${chalk.red("Error")}${chalk.gray("]")}`;

		console.info(format, ...arguments_);
	}

	public success(...arguments_: Array<unknown>): void {
		const format = `${chalk.gray("<")}${moment().format("MM-DD-YYYY HH:mm:ss")}${chalk.gray(">")} ${chalk.gray(
			"["
		)}${this.chalk(`${this.name}`)}${chalk.gray("]")} ${chalk.gray("[")}${chalk.greenBright("Success")}${chalk.gray(
			"]"
		)}`;

		console.info(format, ...arguments_);
	}

	public debug(...arguments_: Array<unknown>): void {
		if (!Logger.DEBUG) return;

		const format = `${chalk.gray("<")}${moment().format("MM-DD-YYYY HH:mm:ss")}${chalk.gray(">")} ${chalk.gray(
			"["
		)}${this.chalk(`${this.name}`)}${chalk.gray("]")} ${chalk.gray("[")}${chalk.redBright("DEBUG")}${chalk.gray("]")}`;

		console.info(format, ...arguments_);
	}
}

export { Logger };
