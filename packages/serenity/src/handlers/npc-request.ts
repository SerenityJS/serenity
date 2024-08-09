import {
	NpcRequestPacket,
	DisconnectReason,
	NpcRequestType
} from "@serenityjs/protocol";

import { SerenityHandler } from "./serenity-handler";

import type { Player } from "@serenityjs/world";
import type { NetworkSession } from "@serenityjs/network";

class NpcRequest extends SerenityHandler {
	public static readonly packet = NpcRequestPacket.id;

	public static handle(
		packet: NpcRequestPacket,
		session: NetworkSession
	): void {
		// Get the player from the session
		// If there is no player, then disconnect the session.
		const player = this.serenity.getPlayer(session);
		if (!player)
			return session.disconnect(
				"Failed to connect due to an invalid player. Please try again.",
				DisconnectReason.InvalidPlayer
			);

		const type = packet.type;

		switch (type) {
			default: {
				this.serenity.logger.debug(
					`Unhandled NPC request type: ${NpcRequestType[type]}`
				);
				break;
			}

			case NpcRequestType.ExecuteAction: {
				return this.executeAction(packet, player);
			}

			case NpcRequestType.ExecuteOpeningCommands: {
				return this.executeOpeningCommands(packet, player);
			}

			case NpcRequestType.SetName: {
				return this.setName(packet, player);
			}

			case NpcRequestType.ExecuteClosingCommands: {
				return this.ExecuteClosingCommands(packet, player);
			}
		}
	}

	public static executeAction(packet: NpcRequestPacket, player: Player): void {
		// Separate the packet into variables
		const { runtimeActorId, scene, index } = packet;

		// Get the entity from the packet.
		const entity = player.dimension.getEntityByRuntime(runtimeActorId);
		if (!entity) throw new Error("Failed to find the entity.");

		// Check if the entity has the npc component
		const npc = entity.getComponent("minecraft:npc");
		if (!npc) throw new Error("Failed to find the npc component.");

		// Close the npc dialogue
		npc.close(player);

		// Get the scene from the packet
		const fScene = npc.getScene(scene);
		if (!fScene) throw new Error("Failed to find the scene.");

		// Get the button from the scene
		const button = [...fScene.buttons][index];
		if (!button) throw new Error("Failed to find the button.");

		// TODO: Maybe emit on the component for repsonses?
		// Iterate over the commands in the button
		for (const command of button.commands) {
			// Execute the command on the player
			player.executeCommand(command);
		}
	}

	public static executeOpeningCommands(
		packet: NpcRequestPacket,
		player: Player
	): void {
		// Separate the packet into variables
		const { runtimeActorId } = packet;

		// Get the entity from the packet.
		const entity = player.dimension.getEntityByRuntime(runtimeActorId);
		if (!entity) throw new Error("Failed to find the entity.");

		// Sync the entity data
		entity.updateActorData();
	}

	public static setName(packet: NpcRequestPacket, player: Player): void {
		// Get the entity from the packet
		const entity = player.dimension.getEntityByRuntime(packet.runtimeActorId);
		if (!entity) throw new Error("Failed to find the entity.");

		// Check if the entity has the npc component
		const npc = entity.getComponent("minecraft:npc");
		if (!npc) throw new Error("Failed to find the npc component.");

		// Set the nametag of the entity
		entity.setNametag(packet.actions);
	}

	public static ExecuteClosingCommands(
		packet: NpcRequestPacket,
		player: Player
	): void {
		// Separate the packet into variables
		const { runtimeActorId } = packet;

		// Get the entity from the packet.
		const entity = player.dimension.getEntityByRuntime(runtimeActorId);
		if (!entity) throw new Error("Failed to find the entity.");

		// Sync the entity data
		entity.updateActorData();
	}
}

export { NpcRequest };
