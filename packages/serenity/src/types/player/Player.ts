import type { Vector3f, Vector2f } from '@serenityjs/bedrock-protocol';
import type { PlayerHungerComponent } from '../../player/index.js';
import type { EntityComponents } from '../entity/Components.js';

interface PlayerProperties {
	dimension: string;
	position: Vector3f;
	rotation: Vector2f;
	username: string;
	uuid: string;
	xuid: string;
}

interface PlayerComponents extends EntityComponents {
	'minecraft:player.hunger': PlayerHungerComponent;
}

export type { PlayerProperties, PlayerComponents };
