import type { DimensionProperties, WorldProperties } from '../types';

const DEFAULT_WORLD_PROPERTIES: WorldProperties = {
	name: 'Default World',
	seed: 12_345,
	defaultDimension: 'minecraft:overworld',
};

const DEFAULT_DIMENSION_PROPERTIES: DimensionProperties = {
	identifier: 'minecraft:overworld',
	type: 'minecraft:overworld',
	generator: 'minecraft:flat',
	spawnPosition: { x: 0, y: 0, z: 0 },
};

export { DEFAULT_WORLD_PROPERTIES, DEFAULT_DIMENSION_PROPERTIES };
