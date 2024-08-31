import { createColors } from "colorette";
import { updateLocale } from "yargs";

const colorette = createColors({ useColor: true });

const YARG_LOCALE = {
	// Categories
	"Commands:": colorette.magenta("Commands:"),
	"Options:": colorette.magenta("Flags:"),
	"Examples:": colorette.magenta("Examples:"),
	"Positionals:": colorette.magenta("Args:"),

	// Values
	boolean: colorette.greenBright("boolean"),
	count: colorette.cyan("count"),
	string: colorette.greenBright("string"),
	number: colorette.cyan("number"),
	array: colorette.yellow("array"),
	required: colorette.red("required"),
	default: colorette.redBright("default"),
	"default:": colorette.redBright("default:"),
	"choices:": colorette.magenta("choices:"),
	"aliases:": colorette.red("aliases:"),
	deprecated: colorette.gray("deprecated"),

	// Responses
	"Not enough non-option arguments: got %s, need at least %s": {
		one: colorette.red("Recieved %s non-option arguments and expected %s..."),
		other: colorette.red("Recieved %s non-option arguments and expected %s...")
	},
	"Too many non-option arguments: got %s, maximum of %s": {
		one: colorette.red("Recieved %s non-option arguments and expected %s..."),
		other: colorette.red("Recieved %s non-option arguments and expected %s...")
	},
	"Missing argument value: %s": {
		one: colorette.red(`Missing argument value: ${colorette.gray("%s")}`),
		other: colorette.red(`Missing argument value: ${colorette.gray("%s")}`)
	},
	"Missing required argument: %s": {
		one: colorette.red(`Missing required argument: ${colorette.gray("%s")}`),
		other: colorette.red(`Missing required argument: ${colorette.gray("%s")}`)
	},
	"Unknown argument: %s": {
		one: colorette.red(`Unknown argument: ${colorette.gray("%s")}`),
		other: colorette.red(`Unknown argument: ${colorette.gray("%s")}`)
	},
	"Invalid values:": colorette.red("Invalid values:"),
	"Did you mean %s?": colorette.red(
		`Did you mean ${colorette.gray("%s")} ${colorette.red("?")}`
	),
	"deprecated: %s": colorette.red(`deprecated: ${colorette.gray("%s")}`)
};

// Update the locale
updateLocale(YARG_LOCALE as unknown as Record<string, string>);
