import { AbilityLayerFlag, Packet } from '@serenityjs/bedrock-protocol';
import { MessageForm, Serenity, BlockTypes, BlockPermutation } from '@serenityjs/serenity';

// import "./mapping_build";

const serenity = new Serenity({
	address: '0.0.0.0',
	debug: true,
});

serenity.start();
console.log(BlockPermutation.Resolve("minecraft:dirt",{dirt_type:"coarse"}) === BlockPermutation.FromRuntimeId(9_551));

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
	const name = player.world.mappings.getBlockName(block);

	const form = new MessageForm(
		'BlockPickRequest',
		`You block picked "${name}". Would you like to destroy this block?`,
		'Yes',
		'No',
	);

	player.sendMessageForm(form, (data) => {}).catch(console.error);
});
