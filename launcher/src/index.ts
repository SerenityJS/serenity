export * from "./serenity";
export * from "./handlers";
export * from "./properties";
export * from "./events";

import {
	EntityNametagComponent,
	EntityPhysicsComponent,
	InternalProvider,
	ItemStack,
	Player,
	Superflat,
	TargetEnum
} from "@serenityjs/world";
import {
	DimensionType,
	MINECRAFT_VERSION,
	Packet,
	PROTOCOL_VERSION,
	Vector3f
} from "@serenityjs/protocol";
import { StringEnum } from "@serenityjs/command";
import { EntityIdentifier, EntityType } from "@serenityjs/entity";
import { ItemIdentifier } from "@serenityjs/item";

import { Serenity } from "./serenity";

const serenity = new Serenity();

// Provider "Provides" the chunks and other data to the world.
// Providers are used to read and write the world data.
// They can be custom built for specific applications.
// Custom providers can be built by extending the abstract "WorldProvider" class.
// The "InternalProvider" is a basic provider that stores chunks in memory.
const provider = new InternalProvider();

// Register the world with the serenity instance.
// The provider is what the world will use to read/write chunks and other data.
const world = serenity.createWorld("default", provider);

// Now we need to register a dimension for the world.
// The dimension is the actual area that players will play in.
world.createDimension(
	"minecraft:overworld",
	DimensionType.Overworld,
	new Superflat()
);

serenity.start();

world.commands.register("about", "Get information about the server.", () => {
	return {
		message: `This server is running SerenityJS. (MCBE: ${MINECRAFT_VERSION}) (Protocol: ${PROTOCOL_VERSION})`
	};
});

world.commands.register(
	"tps",
	"Get the current server ticks per second.",
	() => {
		return {
			message: `Current TPS: ${serenity.tps}`
		};
	},
	{},
	{
		special: true
	}
);

world.commands.register(
	"rename",
	"Rename an entity.",
	(_, { target, name }) => {
		// Loop through the target entities.
		for (const entity of target.result) {
			// Check if the entity has a nametag component.
			if (entity.components.has("minecraft:nametag")) {
				// Get the nametag component.
				const nametag = entity.getComponent("minecraft:nametag");

				// Set the nametag to the new name.
				nametag.setCurrentValue(name.result);
			} else {
				// Create a new nametag component.
				const nametag = new EntityNametagComponent(entity);

				// Set the nametag to the new name.
				nametag.setCurrentValue(name.result);
			}
		}

		return {
			message: `Renamed ${target.result.length} entities to ${name.result}.`
		};
	},
	{
		target: TargetEnum,
		name: StringEnum
	}
);

// Registering components to the entity type
// These components will be automatically added to entity when spawned

// First we need to create or get the entity type
const entityType = EntityType.get(EntityIdentifier.Npc);

// Register the components to the entity type
entityType?.register(EntityPhysicsComponent);

// Now once the entity is spawned, it will automatically have the components
serenity.network.on(Packet.BlockPickRequest, (data) => {
	const player = serenity.getPlayer(data.session);
	if (!player) return;

	// Spawn the entity
	const { x, y, z } = data.packet;
	player.dimension.spawnEntity(EntityIdentifier.Npc, new Vector3f(x, y + 2, z));
});

world.commands.register("test", "test", (origin) => {
	if (!(origin instanceof Player)) return;

	// We want to implement when a player drops an item, it will spawn an entity
	// With some physics components to make it fall to the ground, according to the position of the player
	const itemStack = new ItemStack(ItemIdentifier.Diamond, 1, 0);

	// Get the player's position and rotation
	const { x, y, z } = origin.position;
	const { headYaw, pitch } = origin.rotation;

	// Normalize the pitch & headYaw, so the entity will be spawned in the correct direction
	const headYawRad = (headYaw * Math.PI) / 180;
	const pitchRad = (pitch * Math.PI) / 180;

	// Calculate the velocity of the entity based on the player's rotation
	const velocity = new Vector3f(
		-Math.sin(headYawRad) * Math.cos(pitchRad),
		-Math.sin(pitchRad),
		Math.cos(headYawRad) * Math.cos(pitchRad)
	);

	// Spawn the entity
	const entity = origin.dimension.spawnItem(itemStack, new Vector3f(x, y, z));

	// Add the physics component to the entity
	new EntityPhysicsComponent(entity);

	// Set the velocity of the entity
	entity.setMotion(velocity);

	return {};
});

world.commands.register("load", "loads a chunk", (origin) => {
	if (!(origin instanceof Player)) return;

	origin.getChunk().loaded = true;

	return {
		message: `Loaded chunk at ${origin.getChunk().x}, ${origin.getChunk().z}`
	};
});
