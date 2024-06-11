import { lstatSync } from "node:fs";

function exists(path: string): boolean {
	try {
		lstatSync(path, {
			throwIfNoEntry: true
		});
		return true;
	} catch {
		return false;
	}
}

export { exists };
