export * from "./serenity";
export * from "./handlers";
export * from "./properties";
export * from "./events";

import {
	EntityNametagComponent,
	EntityPhysicsComponent,
	InternalProvider,
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
import { EntityIdentifier } from "@serenityjs/entity";

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

serenity.network.on(Packet.BlockPickRequest, (data) => {
	const player = serenity.getPlayer(data.session);
	if (!player) return;

	const { x, y, z } = data.packet;

	const entity = player.dimension.spawnEntity(
		EntityIdentifier.Npc,
		new Vector3f(x, y + 2, z)
	);

	entity.velocity.x = Math.random() * 4 - 2;
	entity.velocity.y = Math.random() * 4 - 2;
	entity.velocity.z = Math.random() * 4 - 2;

	new EntityPhysicsComponent(entity);

	entity.executeCommand('rename @s "Hello, World!"');
});

world.commands.register("test", "test", (origin) => {
	if (!(origin instanceof Player)) return;

	const entity = origin.dimension.spawnEntity(
		EntityIdentifier.Npc,
		origin.position
	);

	// Give the entity some random x & z velocity
	entity.velocity.x = Math.random() * 4 - 2;
	entity.velocity.y = Math.random() * 4 - 2;
	entity.velocity.z = Math.random() * 4 - 2;

	new EntityPhysicsComponent(entity);

	return {};
});
