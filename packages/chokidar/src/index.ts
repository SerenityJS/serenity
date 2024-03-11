#!/usr/bin/env node

import { ChildProcess } from "node:child_process";

import yargs from "yargs";
import throttle from "lodash.throttle";
import debounce from "lodash.debounce";
import { WatchOptions, watch } from "chokidar";
import crosspawn from "cross-spawn";
import terminate from "terminate";

import { Logger, createLogger } from "./log";

const EventDescriptions = {
	add: "added",
	addDir: "added",
	unlink: "removed",
	unlinkDir: "removed",
	change: "changed"
};

interface Options {
	patterns: Array<string>;
	debounce: number;
	throttle: number;
	followSymlinks: boolean;
	ignore?: string | Array<string>;
	polling: boolean;
	pollInterval: number;
	pollIntervalBinary: number;
	silent: boolean;
	initial: boolean;
	command?: string;
	restart: boolean;
}

const defaultOptions: Options = {
	patterns: [],
	debounce: 400,
	throttle: 0,
	followSymlinks: false,
	polling: false,
	pollInterval: 100,
	pollIntervalBinary: 300,
	silent: false,
	initial: false,
	restart: true
};

const { argv } = yargs
	.usage("$0 <pattern...> [options]")
	.example(
		'$0 "**/*.js" -c "npm run build-js"',
		"build when any .js file changes"
	)
	.example('$0 "**/*.js" "**/*.less"', "output changes of .js and .less files")
	.demand(1)
	.option("c", {
		alias: "command",
		describe:
			"Command to run after each change. " +
			"Needs to be surrounded with quotes when command contains " +
			"spaces. Instances of `{path}` or `{event}` within the " +
			"command will be replaced by the corresponding values from " +
			"the chokidar event."
	})
	.option("r", {
		alias: "restart",
		describe:
			"Commands that are persistent or long-running will be terminated " +
			"along with all their children before next run.",
		default: defaultOptions.restart,
		type: "boolean"
	})
	.option("d", {
		alias: "debounce",
		default: defaultOptions.debounce,
		describe: "Debounce timeout in ms for executing command",
		type: "number"
	})
	.option("t", {
		alias: "throttle",
		default: defaultOptions.throttle,
		describe: "Throttle timeout in ms for executing command",
		type: "number"
	})
	.option("s", {
		alias: "follow-symlinks",
		default: defaultOptions.followSymlinks,
		describe:
			"When not set, only the symlinks themselves will be watched " +
			"for changes instead of following the link references and " +
			"bubbling events through the links path",
		type: "boolean"
	})
	.option("i", {
		alias: "ignore",
		describe:
			"Pattern for files which should be ignored. " +
			"Needs to be surrounded with quotes to prevent shell globbing. " +
			"The whole relative or absolute path is tested, not just filename. " +
			"Supports glob patters or regexes using format: /yourmatch/i"
	})
	.option("initial", {
		describe: "When set, command is initially run once",
		default: defaultOptions.initial,
		type: "boolean"
	})
	.option("p", {
		alias: "polling",
		describe:
			"Whether to use fs.watchFile(backed by polling) instead of " +
			"fs.watch. This might lead to high CPU utilization. " +
			"It is typically necessary to set this to true to " +
			"successfully watch files over a network, and it may be " +
			"necessary to successfully watch files in other " +
			"non-standard situations",
		default: defaultOptions.polling,
		type: "boolean"
	})
	.option("poll-interval", {
		describe:
			"Interval of file system polling. Effective when --polling " + "is set",
		default: defaultOptions.pollInterval,
		type: "number"
	})
	.option("poll-interval-binary", {
		describe:
			"Interval of file system polling for binary files. " +
			"Effective when --polling is set",
		default: defaultOptions.pollIntervalBinary,
		type: "number"
	})
	.option("silent", {
		describe: "When set, internal messages of chokidar-cli won't be written.",
		default: defaultOptions.silent,
		type: "boolean"
	})
	.help("h")
	.alias("h", "help");

function main() {
	// If its a promise throw an error
	if (argv instanceof Promise) {
		throw new TypeError("Promise not supported");
	}

	const patterns = getUserPatterns(argv);
	const options: Options = Object.assign(defaultOptions, argv, { patterns });
	startWatching(options);
}

function getUserPatterns(argv: { _: Array<string | number> }): Array<string> {
	return argv._.map(String);
}

function startWatching(options: Options): void {
	const logger = createLogger(undefined, options.silent);
	const chokidarOptions = getChokidarOptions(options);
	const watcher = watch(options.patterns, chokidarOptions);

	let throttledRun = run;
	if (options.throttle > 0) {
		throttledRun = throttle(run, options.throttle);
	}

	let debouncedRun = run;
	if (options.debounce > 0) {
		debouncedRun = debounce(throttledRun, options.debounce);
	}

	watcher.on("all", (event, path) => {
		const title = EventDescriptions[event] || event;
		logger.info("CKR", `${title} ${path}`);

		if (!options.command) return;

		debouncedRun(
			options.command
				.replaceAll(/{path}/gi, path)
				.replaceAll(/{event}/gi, event),
			options,
			logger
		);
	});

	watcher.on("error", (error) => {
		logger.error("CKR", error);
		console.error(error.stack);
	});

	watcher.once("ready", () => {
		const list = options.patterns.join('", "');
		logger.info("CKR", `watching "${list}"...`);
	});
}

let currentProcess: ChildProcess | undefined;
function run(command: string, options: Options, logger: Logger): void {
	const restart = options.restart;
	const spawnProcess = () => {
		logger.info("CKR", `running command: ${command}`);
		currentProcess = crosspawn(command, { stdio: "inherit" });
		currentProcess.on("error", (error) => {
			logger.error("CKR", error.message);
		});
	};

	const isRunning =
		currentProcess &&
		!currentProcess.killed &&
		currentProcess.exitCode === null &&
		currentProcess.pid !== undefined;

	if (!restart || !isRunning) {
		return spawnProcess();
	}

	if (isRunning) {
		logger.warn("CKR", `killing running process...`);
		terminate(currentProcess!.pid!, (error) => {
			if (error) {
				logger.error(
					"CKR",
					"failed to kill running process... killing self instead..."
				);
				process.exit(1);
			}
			spawnProcess();
		});
	} else {
		return spawnProcess();
	}
}

function getChokidarOptions(options: Options): WatchOptions {
	const arrayIgnore = resolveIgnoreOption(options.ignore);

	return {
		followSymlinks: options.followSymlinks,
		usePolling: options.polling,
		interval: options.pollInterval,
		binaryInterval: options.pollIntervalBinary,
		ignoreInitial: !options.initial,
		ignored: arrayIgnore
	};
}

function resolveIgnoreOption(
	ignore?: string | Array<string>
): Array<string> | undefined {
	if (!ignore) {
		return undefined;
	}

	return Array.isArray(ignore) ? ignore : [ignore];
}

main();
