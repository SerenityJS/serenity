import { resolve } from "node:path";

import AdmZip from "adm-zip";

function zip(source: string, destination: string): void {
	// Create a new zip instance
	const zip = new AdmZip();

	// Add the source to the zip
	zip.addLocalFolder(resolve(source));

	// Write the zip to the destination
	zip.writeZip(resolve(destination));
}

export { zip };
