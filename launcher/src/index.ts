export * from "./serenity";
export * from "./handlers";
export * from "./properties";
export * from "./events";

import { EntityPhysicsComponent, ItemStack, Player, Superflat } from "@serenityjs/world";
import { DimensionType, Packet, Vector3f } from "@serenityjs/protocol";
import { EntityIdentifier, EntityType } from "@serenityjs/entity";
import { StringEnum } from "@serenityjs/command";

import { Serenity } from "./serenity";
import { ActionForm } from "@serenityjs/server-ui";
import { BlockPermutation, CustomBlockType } from "@serenityjs/block";
import { CreativeItem, CustomItemType, ItemCategory, ItemGroup, ItemIdentifier } from "@serenityjs/item";

const serenity = new Serenity();

serenity.start();

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

const world = serenity.worlds.get();

world.createDimension(
	"minecraft:nether",
	DimensionType.Nether,
	new Superflat()
);

for (const world of serenity.worlds.getAll()) {
	world.commands.register(
		"dimension",
		"Changes dimension",
		(origin, parameters) => {
			if (origin instanceof Player) {
				const world = serenity.worlds.get(parameters.world.result);

				if (!world) {
					return {
						message: "World not found."
					};
				}

				const dimension = world.getDimension(parameters.dim.result);

				if (!dimension) {
					return {
						message: "Dimension not found."
					};
				}

				origin.teleport(origin.position, dimension);
			}

			return {};
		},
		{
			world: StringEnum,
			dim: StringEnum
		}
	);

	world.commands.register("tps", "Gets the server TPS", () => {
		return {
			message: `Server TPS: ${serenity.tps}`
		}
	})
}