interface WorldProperties {
	defaultDimension: string;
	name: string;
	seed: number;
}

interface DimensionProperties {
	generator: string;
	identifier: string;
	spawnPosition: { x: number; y: number; z: number };
	type: string;
}

export type { WorldProperties, DimensionProperties };
