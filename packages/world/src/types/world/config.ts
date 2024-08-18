interface WorldConfig {
	readonly identifier: string;
	readonly provider: string;
	readonly seed: number;
	readonly dimensions: Array<WorldDimensionConfig>;
}

interface WorldDimensionConfig {
	readonly identifier: string;
	readonly type: string;
	readonly generator: string;
	readonly spawn: [number, number, number];
	readonly viewDistance?: number;
	readonly simulationDistance?: number;
}

export { WorldConfig, WorldDimensionConfig };
