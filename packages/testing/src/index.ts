import { Gamemode, Packet, TransactionType } from '@serenityjs/bedrock-protocol';
import { BlockPermutation, Serenity } from '@serenityjs/serenity';

const serenity = new Serenity({
	address: '0.0.0.0',
	debug: true,
});

serenity.start();

serenity.on('PlayerChat', (event) => {
	const block = event.player.getDimension().getBlock(0, -60, 0);

	const permutation = BlockPermutation.resolve(event.message);

	block.setPermutation(permutation);
});

serenity.network.after(Packet.InventoryTransaction, ({ packet, player }) => {
	if (packet.type !== TransactionType.ItemUse || !player) return;

	const block = player
		.getDimension()
		.getBlock(packet.data.blockPosition?.x ?? 0, packet.data.blockPosition?.y ?? 0, packet.data.blockPosition?.z ?? 0);

	block.setPermutation(BlockPermutation.resolve('minecraft:diamond_ore'));
});
