export * from "./serenity";
export * from "./handlers";
export * from "./properties";
export * from "./events";

import { EntityPhysicsComponent } from "@serenityjs/world";
import { Packet, Vector3f } from "@serenityjs/protocol";
import { EntityIdentifier, EntityType } from "@serenityjs/entity";

import { Serenity } from "./serenity";

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
