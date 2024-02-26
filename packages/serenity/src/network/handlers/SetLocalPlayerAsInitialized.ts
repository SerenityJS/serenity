import type { Packet } from '@serenityjs/bedrock-protocol';
import {
	DisconnectReason,
	MetadataFlags,
	MetadataKey,
	MetadataType,
	SetEntityData,
	AvailableCommands,
	SetLocalPlayerAsInitialized,
	AddPlayer,
	PermissionLevel,
	CommandPermissionLevel,
	AbilityLayerFlag,
} from '@serenityjs/bedrock-protocol';
import type { NetworkSession } from '../Session.js';
import { NetworkHandler } from './NetworkHandler.js';

class SetLocalPlayerAsInitializedHandler extends NetworkHandler {
	/**
	 * The packet of the network handler.
	 */
	public static override packet: Packet = SetLocalPlayerAsInitialized.ID;

	public static override handle(packet: SetLocalPlayerAsInitialized, session: NetworkSession): void {
		// Get the player from the session.
		// And check if the player is null or undefined.
		const player = session.player;

		// Disconnect the player if they are null or undefined.
		if (!player) return session.disconnect('Failed to get player instance.', DisconnectReason.MissingClient);

		player.setAbility(AbilityLayerFlag.Build, true);
		player.setAbility(AbilityLayerFlag.Mine, true);
		player.setAbility(AbilityLayerFlag.DoorsAndSwitches, true);
		player.setAbility(AbilityLayerFlag.OpenContainers, true);
		player.setAbility(AbilityLayerFlag.AttackPlayers, true);
		player.setAbility(AbilityLayerFlag.AttackMobs, true);
		player.setAbility(AbilityLayerFlag.OperatorCommands, true);
		player.setAbility(AbilityLayerFlag.Teleport, true);
		player.setAbility(AbilityLayerFlag.Invulnerable, false);
		player.setAbility(AbilityLayerFlag.Flying, true);
		player.setAbility(AbilityLayerFlag.InstantBuild, player.gamemode === 1);
		player.setAbility(AbilityLayerFlag.FlySpeed, true);
		player.setAbility(AbilityLayerFlag.WalkSpeed, true);
		player.setAbility(AbilityLayerFlag.Muted, false);
		player.setAbility(AbilityLayerFlag.WorldBuilder, false);
		player.setAbility(AbilityLayerFlag.NoClip, false);
		player.setAbility(AbilityLayerFlag.PrivilegedBuilder, false);
		player.setAbility(AbilityLayerFlag.Count, false);

		// Set the player attribute component values.
		for (const component of player.getAttributes()) {
			component.resetToDefaultValue();
		}

		for (const other of player.dimension.getPlayers()) {
			if (other === player) continue;

			const spawn = new AddPlayer();
			spawn.uuid = other.uuid;
			spawn.username = other.username;
			spawn.runtimeId = other.runtimeId;
			spawn.platformChatId = ''; // TODO: Not sure what this is.
			spawn.position = other.position;
			spawn.velocity = { x: 0, y: 0, z: 0 };
			spawn.rotation = other.rotation;
			spawn.headYaw = other.rotation.z;
			spawn.heldItem = {
				networkId: 0,
			};
			spawn.gamemode = other.gamemode; // TODO: Get the gamemode from the other.
			spawn.metadata = [];
			spawn.properties = {
				ints: [],
				floats: [],
			};
			spawn.uniqueEntityId = other.runtimeId;
			spawn.premissionLevel = PermissionLevel.Member; // TODO: Get the permission level from the other.
			spawn.commandPermission = CommandPermissionLevel.Normal; // TODO: Get the command permission from the other.
			spawn.abilities = [];
			spawn.links = [];
			spawn.deviceId = 'Win10';
			spawn.deviceOS = 7; // TODO: Get the device OS from the other.

			session.send(spawn);
		}

		// TODO: Move elsewhere.
		const data = new SetEntityData<boolean>();
		data.runtimeEntityId = player.runtimeId;
		data.metadata = [
			{
				key: MetadataKey.Flags,
				type: MetadataType.Long,
				value: true,
				flag: MetadataFlags.AffectedByGravity,
			},
			{
				key: MetadataKey.Flags,
				type: MetadataType.Long,
				value: true,
				flag: MetadataFlags.Breathing,
			},
		];
		data.properties = {
			ints: [],
			floats: [],
		};
		data.tick = BigInt(0);
		const avCommands = new AvailableCommands();
		avCommands.CommandDefinition = {
			command_data: [
				{
					name: 'test',
					alias: 0,
					chained_subcommand_offsets: [],
					description: 'Description',
					flags: 0,
					overloads: [
						{
							chaining: false,
							parameters: [
								{
									enum_type: 0x30,
									name: '<bob>',
									optional: false,
									options: 5,
									type: 0,
								},
							],
						},
					],
					permission_level: 0,
				},
			],
			chained_subcommand_values: [],
			chained_subcommands: [],
			dynamic_enums: [],
			enum_constraints: [],
			enum_values: ['test', 'testenum2'],
			enums: [
				{
					name: 'bob',
					values: [0, 1],
				},
			],
			suffixes: [],
		};

		session.send(data, avCommands);
	}
}

export { SetLocalPlayerAsInitializedHandler };
