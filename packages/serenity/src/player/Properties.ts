import type { PlayerProperties } from '../types';

const DEFAULT_PLAYER_PROPERTIES: PlayerProperties = {
	dimension: 'minecraft:overworld',
	position: { x: 0, y: 0, z: 0 },
	rotation: { x: 0, y: 0 },
	username: 'Steve',
	uuid: '00000000-0000-0000-0000-000000000000',
	xuid: '0000000000000000',
};

export { DEFAULT_PLAYER_PROPERTIES };
