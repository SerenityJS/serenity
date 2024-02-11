import type { Vector3f, Vector2f } from '@serenityjs/bedrock-protocol';

interface PlayerProperties {
	dimension: string;
	position: Vector3f;
	rotation: Vector2f;
	username: string;
	uuid: string;
	xuid: string;
}

export type { PlayerProperties };
