import {
	ActorDataId,
	ActorDataType,
	DataItem,
	Gamemode,
	NpcDialogueAction,
	NpcDialoguePacket
} from "@serenityjs/protocol";
import { EntityIdentifier } from "@serenityjs/entity";

import { DialogueScene } from "../../dialogue";
import { EntityInteractType } from "../../enums";

import { EntityComponent } from "./entity-component";

import type { Player } from "../../player";
import type { Entity } from "../../entity";

class EntityNpcComponent extends EntityComponent {
	public static readonly identifier = "minecraft:npc";

	/**
	 * The scenes for the npc component.
	 */
	public readonly scenes = new Set<DialogueScene>();

	/**
	 * Construct a new npc component.
	 * @param entity The entity to construct the npc component for.
	 */
	public constructor(entity: Entity) {
		super(entity, EntityNpcComponent.identifier);

		// Check if the entirt has the npc metadata
		if (!entity.isNpc()) {
			// Create the npc metadata
			const npc = new DataItem(ActorDataId.HasNpc, ActorDataType.Byte, 1);

			// Add the npc metadata to the entity
			entity.metadata.add(npc);

			// Sync the entity with the npc metadata
			entity.updateActorData();
		}

		// Check if the entity has a nametag component
		if (!entity.hasComponent("minecraft:nametag")) {
			// Set the nametag of the entity
			entity.setNametag("NPC", true);
		}

		// Create a default scene for the npc component
		const scene = new DialogueScene("default", "Hello, world!");

		// Add the default scene to the npc component
		this.addScene(scene);
	}

	/**
	 * Get the scene by name.
	 * @param name The name of the scene.
	 * @returns The scene if found, otherwise undefined.
	 */
	public getScene(name?: string): DialogueScene {
		return (
			[...this.scenes].find((scene) => scene.name === name) ??
			([...this.scenes][0] as DialogueScene)
		);
	}

	/**
	 * Add a scene to the npc component.
	 * @param scene The scene to add.
	 */
	public addScene(scene: DialogueScene): void {
		this.scenes.add(scene);
	}

	/**
	 * Remove a scene from the npc component.
	 * @param scene The scene to remove.
	 */
	public removeScene(scene: DialogueScene): void {
		this.scenes.delete(scene);
	}

	/**
	 * Set the default scene for the npc component.
	 * @param scene The default scene to set.
	 */
	public setDefaultScene(scene: DialogueScene): void {
		// Check if the component has any scenes
		if (this.scenes.size === 0) this.addScene(scene);

		// Prepare the scenes
		const scenes = [scene, ...this.scenes];

		// Clear the scenes
		this.scenes.clear();

		// Add the scenes to the component
		for (const scene of scenes) this.addScene(scene);
	}

	/**
	 * Show the npc dialogue to the player.
	 * @param player The player to show the dialogue to.
	 */
	public show(player: Player, scene?: string): void {
		// Check if the component has any scenes
		if (this.scenes.size === 0) throw new Error("No scenes available.");

		// Get the provided scene for dialogue, if not provided, get the first scene
		const scenes = [...this.scenes];
		const fScene =
			scenes.find((x) => x.name === scene) ?? (scenes[0] as DialogueScene);

		const buttons = [...fScene.buttons].map((button) => {
			const commands = [...button.commands].map((command) => {
				return { cmd_line: command, cmd_ver: 39 };
			});

			return {
				button_name: button.text,
				text: button.text,
				mode: 0,
				type: 1,
				data: commands
			};
		});

		// Create a new NpcDialoguePacket
		const packet = new NpcDialoguePacket();

		// Assign the packet properties
		packet.uniqueEntityId = this.entity.unique;
		packet.action = NpcDialogueAction.Open;
		packet.dialogue = fScene.dialogue;
		packet.scene = fScene.name;
		packet.name = this.entity.getNametag() ?? "NPC";
		packet.json = JSON.stringify(buttons);

		// Send the packet to the player
		player.session.send(packet);
	}

	/**
	 * Close the npc dialogue for the player.
	 * @param player The player to close the dialogue for.
	 */
	public close(player: Player): void {
		// Create a new NpcDialoguePacket
		const packet = new NpcDialoguePacket();

		// Assign the packet properties
		packet.uniqueEntityId = this.entity.unique;
		packet.action = NpcDialogueAction.Close;
		packet.dialogue = String();
		packet.scene = String();
		packet.name = this.entity.getNametag() ?? "NPC";
		packet.json = String();

		// Send the packet to the player
		player.session.send(packet);
	}

	public onInteract(player: Player, type: EntityInteractType): void {
		// Check if the player is interacting with the npc
		if (type === EntityInteractType.Interact) return this.show(player);

		// Check if the entity is an npc, if not return
		if (this.entity.type.identifier !== EntityIdentifier.Npc) return;

		// Despawn the entity if the player is in creative mode
		if (player.gamemode === Gamemode.Creative) this.entity.despawn();
	}
}

export { EntityNpcComponent };
