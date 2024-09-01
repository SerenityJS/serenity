import type { Entity } from "../entity";
import type {
	BlockCoordinates,
	BlockFace,
	Vector3f
} from "@serenityjs/protocol";
import type { AABB } from "../collisions";

enum Axis {
	X = "x",
	Y = "y",
	Z = "z"
}

interface HitResult {
	box: AABB;
	position: Vector3f;
	face: BlockFace;
	distance: number;
}

interface BlockHitResult {
	box: AABB;
	blockPosition: BlockCoordinates;
	position: Vector3f;
	face: BlockFace;
	distance: number;
}

interface EntityHitResult {
	box: AABB;
	position: Vector3f;
	face: BlockFace;
	entity: Entity;
	distance: number;
}

export { Axis, HitResult, BlockHitResult, EntityHitResult };
