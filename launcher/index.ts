import { DimensionType, Packet, TransactionType } from '@serenityjs/bedrock-protocol';
import { BlockPermutation, Serenity, BetterFlat, MessageForm, ActionForm } from '@serenityjs/serenity';

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

	const form = new ActionForm();

	form.title('Hello, World!');
	form.content('This is a test form.');
	form.button('Button 1');
	form.button('Button 2');
	form.button('Button 3');
	form.button('Button 4');
	form.button('Button 5');

	form
		.show(event.player)
		.then((response) => {
			console.log(response);
		})
		.catch((error) => {
			console.error(error);
		});
});

serenity.world.registerDimension(
	DimensionType.Overworld,
	'minecraft:overworld',
	BetterFlat.BasicFlat(serenity.world.blocks),
);
