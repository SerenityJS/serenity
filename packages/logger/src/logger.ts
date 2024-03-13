import moment from "moment";
import { Colorette, Color, createColors } from "colorette";

/**
 * A colorized logger for applications.
 */
class Logger {
	/**
	 * Whether or not debug messages should be shown.
	 */
	public static DEBUG: boolean = false;

	/**
	 * The module name of the logger.
	 */
	public readonly name: string;

	/**
	 * The color of module name.
	 */
	public readonly color: Color;

	/**
	 * The colorette instance.
	 */
	public readonly colorette: Colorette;

	/**
	 * Constructs a new logger.
	 *
	 * @param name - The module name.
	 * @param color - The color of the module name.
	 */
	public constructor(name: string, color: Color) {
		this.name = name;
		this.color = color;
		this.colorette = createColors({ useColor: true });
	}

	/**
	 * Logs a message to the console.
	 *
	 * @param arguments_ - The arguments to log.
	 */
	public log(...arguments_: Array<unknown>): void {
		const format = `${this.colorette.gray("<")}${moment().format("MM-DD-YYYY HH:mm:ss")}${this.colorette.gray(">")} ${this.colorette.gray(
			"["
		)}${this.color(`${this.name}`)}${this.colorette.gray("]")}`;

		console.info(format, ...arguments_);
	}

	/**
	 * Logs an info message to the console.
	 *
	 * @param arguments_ - The arguments to log.
	 */
	public info(...arguments_: Array<unknown>): void {
		const format = `${this.colorette.gray("<")}${moment().format("MM-DD-YYYY HH:mm:ss")}${this.colorette.gray(">")} ${this.colorette.gray(
			"["
		)}${this.color(`${this.name}`)}${this.colorette.gray("]")} ${this.colorette.gray("[")}${this.colorette.cyan("Info")}${this.colorette.gray("]")}`;

		console.info(format, ...arguments_);
	}

	/**
	 * Logs a warning message to the console.
	 *
	 * @param arguments_ - The arguments to log.
	 */
	public warn(...arguments_: Array<unknown>): void {
		const format = `${this.colorette.gray("<")}${moment().format("MM-DD-YYYY HH:mm:ss")}${this.colorette.gray(">")} ${this.colorette.gray(
			"["
		)}${this.color(`${this.name}`)}${this.colorette.gray("]")} ${this.colorette.gray("[")}${this.colorette.yellow("Warning")}${this.colorette.gray("]")}`;

		console.info(format, ...arguments_);
	}

	/**
	 * Logs an error message to the console.
	 *
	 * @param arguments_ - The arguments to log.
	 */
	public error(...arguments_: Array<unknown>): void {
		const format = `${this.colorette.gray("<")}${moment().format("MM-DD-YYYY HH:mm:ss")}${this.colorette.gray(">")} ${this.colorette.gray(
			"["
		)}${this.color(`${this.name}`)}${this.colorette.gray("]")} ${this.colorette.gray("[")}${this.colorette.red("Error")}${this.colorette.gray("]")}`;

		console.info(format, ...arguments_);
	}

	/**
	 * Logs a success message to the console.
	 *
	 * @param arguments_ - The arguments to log.
	 */
	public success(...arguments_: Array<unknown>): void {
		const format = `${this.colorette.gray("<")}${moment().format("MM-DD-YYYY HH:mm:ss")}${this.colorette.gray(">")} ${this.colorette.gray(
			"["
		)}${this.color(`${this.name}`)}${this.colorette.gray("]")} ${this.colorette.gray("[")}${this.colorette.greenBright("Success")}${this.colorette.gray(
			"]"
		)}`;

		console.info(format, ...arguments_);
	}

	/**
	 * Logs a debug message to the console.
	 * This will only log if the `DEBUG` flag is set to `true`.
	 *
	 * @param arguments_ - The arguments to log.
	 */
	public debug(...arguments_: Array<unknown>): void {
		if (!Logger.DEBUG) return;

		const format = `${this.colorette.gray("<")}${moment().format("MM-DD-YYYY HH:mm:ss")}${this.colorette.gray(">")} ${this.colorette.gray(
			"["
		)}${this.color(`${this.name}`)}${this.colorette.gray("]")} ${this.colorette.gray("[")}${this.colorette.redBright("DEBUG")}${this.colorette.gray("]")}`;

		console.info(format, ...arguments_);
	}
}

export { Logger };
