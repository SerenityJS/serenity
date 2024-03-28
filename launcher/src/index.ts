import {
	Entity,
	EntityIdentifier,
	InternalProvider,
	ItemIdentifier,
	ItemStack,
	ItemType,
	Superflat
} from "@serenityjs/world";
import {
	AddItemActorPacket,
	DimensionType,
	MetadataFlags,
	MetadataKey,
	MoveActorAbsolutePacket,
	MoveEntityPacket,
	Packet,
	Rotation,
	SetActorMotionPacket,
	Vector3f
} from "@serenityjs/protocol";

import { Serenity } from "./serenity";

const serenity = new Serenity();

// Provider "Provides" the chunks and other data to the world.
// Providers are used to read and write the world data.
// They can be custom built for specific applications.
// Custom providers can be built by extending the abstract "WorldProvider" class.
// The "InternalProvider" is a basic provider that stores chunks in memory.
const provider = new InternalProvider(true); // Boolean indicates hash block values, false indicates runtime block values.

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

serenity.network.before(Packet.Text, (data) => {
	const player = serenity.getPlayer(data.session);
	if (!player) return false;

	if (data.packet.message === "cancel") return false;

	if (data.packet.message === "test") {
		const entity = new Entity(EntityIdentifier.Npc, player.dimension);

		entity.position.x = player.position.x;
		entity.position.y = player.position.y;
		entity.position.z = player.position.z;

		entity.spawn();

		const packet = new MoveActorAbsolutePacket();

		entity.position.x -= 4;

		packet.runtimeId = entity.runtime;
		packet.flags = 0;
		packet.position = entity.position;
		packet.rotation = new Rotation(0, 0, 0);

		player.dimension.broadcast(packet);
	}

	return true;
});
