import { BinaryStream } from "@serenityjs/binarystream";
import { ByteTag, CompoundTag, IntTag, StringTag } from "@serenityjs/nbt";

const HASH_OFFSET = 0x81_1c_9d_c5;

function hash(
	identifier: string,
	state: Record<string, string | number | boolean>
): number {
	// Seperate the keys and values of the state object.
	const keys = Object.keys(state);
	const values = Object.values(state);

	// Create a new compound tag with the name of the identifier.
	const root = new CompoundTag("", {});
	root.addTag(new StringTag("name", identifier));

	// Create a new compound tag with the name of "states".
	const states = new CompoundTag("states", {});

	// Loop through each key and value in the state object.
	for (const [index, key] of keys.entries()) {
		const value = values[index];

		switch (typeof value) {
			case "number": {
				states.addTag(new IntTag(key, value));
				break;
			}

			case "string": {
				states.addTag(new StringTag(key, value));
				break;
			}

			case "boolean": {
				states.addTag(new ByteTag(key, value ? 1 : 0));
				break;
			}
		}
	}

	// Add the states tag to the root tag.
	root.addTag(states);

	// Create a new binary stream and write the root tag to it.
	const stream = new BinaryStream();
	CompoundTag.write(stream, root);

	// Assign the hash to the offset.
	let hash = HASH_OFFSET;

	// Loop through each element in the buffer.
	for (const element of stream.getBuffer()) {
		// Set the hash to the XOR of the hash and the element.
		hash ^= element & 0xff;

		// Apply the hash algorithm.
		hash +=
			(hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);

		// Convert the hash to a signed 32-bit integer.
		// eslint-disable-next-line unicorn/prefer-math-trunc
		hash = hash | 0;
	}

	// Return the hash.
	return hash;
}

export { hash };
