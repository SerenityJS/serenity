/* eslint-disable @typescript-eslint/no-explicit-any */
import * as colors from "colorette";

type LOG_TYPE = "info" | "success" | "error" | "warn";

export const colorize = (
	type: LOG_TYPE,
	data: any,
	onlyImportant = false
): string => {
	if (onlyImportant && (type === "info" || type === "success"))
		return colors.dim(data);

	const color =
		type === "info"
			? "blue"
			: type === "error"
				? "red"
				: type === "warn"
					? "yellow"
					: "green";
	return colors[color](data);
};

export const makeLabel = (
	name: string | undefined,
	input: string,
	type: LOG_TYPE
): string => {
	return [
		name &&
			`${colors.dim("[")}${colors.magenta(name.toUpperCase())}${colors.dim("]")}`,
		colorize(type, input.toUpperCase())
	]
		.filter(Boolean)
		.join(" ");
};

export type Logger = ReturnType<typeof createLogger>;

export const createLogger = (name?: string, silent = false) => {
	return {
		setName(_name: string) {
			name = _name;
		},

		success(label: string, ...arguments_: Array<any>) {
			return this.log(label, "success", ...arguments_);
		},

		info(label: string, ...arguments_: Array<any>) {
			return this.log(label, "info", ...arguments_);
		},

		error(label: string, ...arguments_: Array<any>) {
			return this.log(label, "error", ...arguments_);
		},

		warn(label: string, ...arguments_: Array<any>) {
			return this.log(label, "warn", ...arguments_);
		},

		log(
			label: string,
			type: "info" | "success" | "error" | "warn",
			...data: Array<unknown>
		) {
			const arguments_ = [
				makeLabel(name, label, type),
				...data.map((item) => colorize(type, item, true))
			];
			switch (type) {
				case "error": {
					return console.error(...arguments_);
				}
				default: {
					if (!silent) return console.log(...arguments_);
				}
			}
		}
	};
};
