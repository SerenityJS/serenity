import type { DimensionProperties, WorldProperties } from '../types/index.js';

const DEFAULT_WORLD_PROPERTIES: WorldProperties = {
	name: 'default-world',
	seed: 12_345,
	dimension: 'minecraft:overworld',
};

const DEFAULT_DIMENSION_PROPERTIES: DimensionProperties = {
	identifier: 'minecraft:overworld',
	type: 'minecraft:overworld',
	generator: 'minecraft:flat',
	spawn: { x: 0, y: 0, z: 0 },
};

export { DEFAULT_WORLD_PROPERTIES, DEFAULT_DIMENSION_PROPERTIES };
