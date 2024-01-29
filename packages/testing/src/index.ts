import { AbilityLayerFlag, Packet } from '@serenityjs/bedrock-protocol';
import { Air, MessageForm, Serenity } from '@serenityjs/serenity';

// import "./mapping_build";

const serenity = new Serenity({
	address: '0.0.0.0',
	debug: true,
});

serenity.start();

serenity.on('PlayerJoined', ({ player }) => {
	//
});

serenity.on('PlayerSpawned', ({ player }) => {
	//
});

serenity.on('PlayerLeft', ({ player }) => {
	//
});

serenity.on('PlayerChat', ({ player }) => {
	player.abilities.setAbility(AbilityLayerFlag.MayFly, false);
});

serenity.network.on(Packet.BlockPickRequest, ({ player, packet }) => {
	if (!player) return;

	const block = player.world.getBlock(packet.x, packet.y, packet.z);

	player.world.setBlock(packet.x, packet.y, packet.z, Air);

	const form = new MessageForm(
		'BlockPickRequest',
		`You block picked "${block.getName()}". Would you like to destroy this block?`,
		'Yes',
		'No',
	);

	player.sendMessageForm(form, (data) => {}).catch(console.error);
});
