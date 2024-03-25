const HASH_OFFSET = 0x81_1c_9d_c5;

function getHash(buffer: Buffer): number {
	// Assign the hash to the offset.
	let hash = HASH_OFFSET;

	// Loop through each element in the buffer.
	for (const element of buffer) {
		// Set the hash to the XOR of the hash and the element.
		hash ^= element;
		// Apply the hash algorithm.
		hash +=
			(hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
	}

	// Return the hash.
	return hash;
}

export { getHash };
