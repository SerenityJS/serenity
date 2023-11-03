import type { SetLocalPlayerAsInitialized } from '@serenityjs/protocol';
import { Respawn, UpdateAdventureSettings, SetEntityData } from '@serenityjs/protocol';
import type { Player } from '../Player';
import { PlayerHandler } from './PlayerHandler';

class SetLocalPlayerAsInitializedHandler extends PlayerHandler {
	public static override handle(packet: SetLocalPlayerAsInitialized, player: Player): void {
		// Checks if the runtimeIds match
		if (packet.runtimeId !== player.runtimeId) {
			this.logger.error(`Player "${player.username}" tried to initialized with invalid runtime id!`);
			return; // TODO: player.disconnect('Invalid runtime id!', false, DisconectReason.MissingClient);
		}

		const settings = new UpdateAdventureSettings();
		settings.noMvP = false;
		settings.noPvM = false;
		settings.immutableWorld = false;
		settings.autoJump = true;
		settings.showNameTags = true;
		player.sendPacket(settings);

		player.attributes.setDefaults();
		player.abilities.setDefaults();

		const metadata = new SetEntityData();
		metadata.runtimeId = player.runtimeId;
		metadata.metadata = [
			{
				flag: true,
				type: 7,
				key: 49,
				value: true,
			},
			{
				flag: true,
				type: 7,
				key: 48,
				value: true,
			},
		];
		metadata.properties = {
			floats: [],
			ints: [],
		};
		metadata.tick = 0n;
		player.sendPacket(metadata);

		const respawn = new Respawn();
		respawn.position = { x: 0, y: -48, z: 0 };
		respawn.runtimeEntityId = player.runtimeId;
		respawn.state = 0;

		player.sendPacket(respawn);

		const respawn1 = new Respawn();
		respawn1.position = { x: 0, y: -48, z: 0 };
		respawn1.runtimeEntityId = player.runtimeId;
		respawn1.state = 1;

		player.sendPacket(respawn1);

		// Send the player the PlayerList packet
		const players = [...player.world.players.values()].filter((p) => p !== player);
		player.addPlayerToList(...players);
		player.spawnPlayer(...players);
	}
}

export { SetLocalPlayerAsInitializedHandler };
