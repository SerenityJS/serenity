import { DimensionType, Packet, TransactionType } from '@serenityjs/bedrock-protocol';
import { BlockPermutation, Serenity, BetterFlat } from '@serenityjs/serenity';

const serenity = new Serenity({
	address: '0.0.0.0',
	debug: true,
});

serenity.start();

serenity.on('PlayerChat', (event) => {
	console.log(event.player.getDimension().players);
});

serenity.network.after(Packet.InventoryTransaction, (event) => {
	if (event.packet.type !== TransactionType.ItemUse || !event.player) return;

	const permutation = BlockPermutation.resolve('minecraft:diamond_ore');
	const block = event.player
		.getDimension()
		.getBlock(
			event.packet.data.blockPosition!.x,
			event.packet.data.blockPosition!.y,
			event.packet.data.blockPosition!.z,
		);

	block.setPermutation(permutation);
});

serenity.world.registerDimension(
	DimensionType.Overworld,
	'minecraft:overworld',
	BetterFlat.BasicFlat(serenity.world.blocks),
);
