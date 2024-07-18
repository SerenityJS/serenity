import {
	DisconnectReason,
	NpcRequestType,
	Packet,
	type NpcRequestPacket
} from "@serenityjs/protocol";
import { NetworkBound, type NetworkPacketEvent } from "@serenityjs/network";

import { EventSignal } from "./event-signal";
import { EventPriority } from "./priority";

import type { Serenity } from "../serenity";
import type {
	DialogueButton,
	DialogueScene,
	Entity,
	EntityNpcComponent,
	Player
} from "@serenityjs/world";

class DialogueResponseSignal extends EventSignal {
	/**
	 * The serenity instance.
	 */
	public static serenity: Serenity;

	/**
	 * The packet of the event signal.
	 */
	public static readonly hook = Packet.NpcRequest;

	/**
	 * The priority of the event signal.
	 */
	public static readonly priority = EventPriority.Before;

	/**
	 * The player that chated in the world.
	 */
	public readonly player: Player;

	/**
	 * The entity that the player is interacting with.
	 */
	public readonly entity: Entity;

	/**
	 * The scene that the player is interacting with.
	 */
	public readonly scene: DialogueScene;

	/**
	 * The button that the player clicked.
	 */
	public readonly button: DialogueButton;

	/**
	 * The index of the button that the player clicked.
	 */
	public readonly index: number;

	/**
	 * The npc component of the entity.
	 */
	public readonly npc: EntityNpcComponent;

	/**
	 * Constructs a new player dialogue response signal instance.
	 * @param player The player that responded to the dialogue.
	 * @param entity The entity that the player is interacting with.
	 * @param scene The scene that the player is interacting with.
	 * @param button The button that the player clicked.
	 * @param index The index of the button that the player clicked.
	 * @param npc The npc component of the entity.
	 */
	public constructor(
		player: Player,
		entity: Entity,
		scene: DialogueScene,
		button: DialogueButton,
		index: number,
		npc: EntityNpcComponent
	) {
		super();
		this.player = player;
		this.entity = entity;
		this.scene = scene;
		this.button = button;
		this.index = index;
		this.npc = npc;
	}

	public static logic(data: NetworkPacketEvent<NpcRequestPacket>): boolean {
		// Separate the data into variables.
		const { session, bound, packet } = data;

		// Also check if the packet is outgoing. Meaning the packet is being sent to the client.
		if (bound !== NetworkBound.Server) return true;

		// Get the player from the session.
		// If there is no player, then disconnect the session.
		const player = this.serenity.getPlayer(session);
		if (!player) {
			session.disconnect(
				"Failed to connect due to an invalid player. Please try again.",
				DisconnectReason.InvalidPlayer
			);

			return false;
		}

		// Check if the packet is executing an action.
		if (packet.type !== NpcRequestType.ExecuteAction) return true;

		// Separate the packet into variables
		const { runtimeActorId, scene, index } = packet;

		// Get the entity from the packet.
		const entity = player.dimension.getEntityByRuntime(runtimeActorId);
		if (!entity) throw new Error("Failed to find the entity.");

		// Check if the entity has the npc component
		const npc = entity.getComponent("minecraft:npc");
		if (!npc) throw new Error("Failed to find the npc component.");

		// Get the scene from the packet
		const fScene = npc.getScene(scene);
		if (!fScene) throw new Error("Failed to find the scene.");

		// Get the button from the scene
		const button = [...fScene.buttons][index];
		if (!button) throw new Error("Failed to find the button.");

		// Create a new instance of the event signal.
		const signal = new this(player, entity, fScene, button, index, npc);

		// Emit the event signal.
		const value = this.serenity.emit("DialogueResponse", signal);

		// Return the value of the event.
		return value;
	}
}

export { DialogueResponseSignal };
