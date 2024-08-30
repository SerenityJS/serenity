import { resolve } from "node:path";

import AdmZip from "adm-zip";

function unzip(source: string, destination: string): void {
	// Create a new zip instance
	const zip = new AdmZip(resolve(source));

	// Extract the zip to the destination
	zip.extractAllTo(resolve(destination), true);
}

export { unzip };
