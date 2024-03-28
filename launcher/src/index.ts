import {
	EntityIdentifier,
	InternalProvider,
	Superflat,
	EntityNametagComponent,
	EntityAlwaysShowNametagComponent
} from "@serenityjs/world";
import { DimensionType, Packet } from "@serenityjs/protocol";
import { NetworkBound } from "@serenityjs/network";

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
	if (data.bound === NetworkBound.Client) return true;

	const player = serenity.getPlayer(data.session);
	if (!player) return false;

	if (data.packet.message === "cancel") return false;

	if (data.packet.message === "test") {
		// Create a new entity
		const entity = player.dimension.spawnEntity(
			EntityIdentifier.Npc,
			player.position
		);

		// Register the entity components
		const alwaysShow = new EntityAlwaysShowNametagComponent(entity);
		const nametag = new EntityNametagComponent(entity);

		// Set the component values
		alwaysShow.setCurrentValue(true);
		nametag.setCurrentValue("Hello, World!");
	}

	return true;
});
