import { writeFileSync } from "node:fs";

import { BinaryStream } from "@serenityjs/binaryutils";
import { CREATIVE_CONTENT, ITEMSTATES } from "@serenityjs/data";
import { NetworkItemInstanceDescriptor, ItemData } from "@serenityjs/protocol";

class ItemRegistry {
	public constructor() {
		// Create a new stream from the creative content.
		const content = new BinaryStream(CREATIVE_CONTENT);
		const data = new BinaryStream(ITEMSTATES);

		const items = ItemData.read(data);
	}
}

export { ItemRegistry };
