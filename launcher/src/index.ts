export * from "./serenity";
export * from "./console";
export * from "./network";
export * from "./entity";
export * from "./world";
export * from "./forms";
export * from "./types";
export * from "./provider";
export * from "./plugin";
export * from "./events";
export * from "./player";

import { DimensionType } from "@serenityjs/protocol";

import { InternalProvider } from "./provider";
import { Serenity } from "./serenity";
import { Overworld } from "./world";

const serenity = new Serenity();

// Provider "Provides" the chunks and other data to the world.
// Providers are used to read and write the world data.
// They can be custom built for specific applications.
// Custom providers can be built by extending the abstract "WorldProvider" class.
// The "InternalProvider" is a basic provider that stores chunks in memory.
const provider = serenity.registerProvider(InternalProvider);

// Register the world with the serenity instance.
// The provider is what the world will use to read/write chunks and other data.
const world = serenity.registerWorld("default-world", provider);

// Now we need to register a dimension for the world.
// The dimension is the actual area that players will play in.
world.registerDimension(
	"minecraft:overworld",
	DimensionType.Overworld,
	new Overworld()
);

serenity.start();
