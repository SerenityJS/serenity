import type { Vec3f, Vec2f } from '@serenityjs/bedrock-protocol';

interface PlayerProperties {
	dimension: string;
	position: Vec3f;
	rotation: Vec2f;
	username: string;
	uuid: string;
	xuid: string;
}

export type { PlayerProperties };
