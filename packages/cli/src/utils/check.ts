import { spawnSync } from "node:child_process";

export function check(
	commandLine: string,
	commandArguments: Array<string>
): boolean {
	const executionState = spawnSync(commandLine, commandArguments);
	return executionState.error === undefined;
}
