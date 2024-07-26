import { type BinaryLike, createHash } from "node:crypto";

export function computeChecksum(
	packet: BinaryLike,
	counter: bigint,
	secret: BinaryLike
): Buffer {
	const digest = createHash("sha256");
	const counterBuffer = Buffer.alloc(8);
	counterBuffer.writeBigInt64LE(counter, 0);
	digest.update(counterBuffer);
	digest.update(packet);
	digest.update(secret);

	const hash = digest.digest();
	return hash.subarray(0, 8);
}
