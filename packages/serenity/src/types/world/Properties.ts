interface WorldProperties {
	dimension: string;
	name: string;
	seed: number;
}

interface DimensionProperties {
	generator: string;
	identifier: string;
	spawn: { x: number; y: number; z: number };
	type: string;
}

export type { WorldProperties, DimensionProperties };
