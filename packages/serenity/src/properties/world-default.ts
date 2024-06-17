const DEFAULT_WORLD_PROPERTIES = /* yaml */ `# World Properties

world-name: "default"
# The name of the world.

world-seed: 0
# The seed of the world.
# This is used to generate the world.

view-distance: 128
# The view distance of the world in the number of blocks.
# This is the maximum number of chunks that a player can see.

simulation-distance: 48
# The simulation distance of the world in the number of blocks.
# This is the maximum number of chunks that are simulated/ticked.
`;

export { DEFAULT_WORLD_PROPERTIES };
