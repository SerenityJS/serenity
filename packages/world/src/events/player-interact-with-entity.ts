import { type EntityInteractType, WorldEvent } from "../enums";

import { WorldEventSignal } from "./signal";

import type { ItemStack } from "../item";
import type { Entity } from "../entity";
import type { Player } from "../player";

class PlayerInteractWithEntitySignal extends WorldEventSignal {
	public static readonly identifier = WorldEvent.PlayerInteractWithEntity;

	/**
	 * The player interacting with the entity.
	 */
	public readonly player: Player;

	/**
	 * The entity being interacted with.
	 */
	public readonly target: Entity;

	/**
	 * The item stack that is being used to interact with the entity, or null if empty hand.
	 */
	public readonly itemStack: ItemStack | null;

	/**
	 * The type of interaction.
	 */
	public readonly type: EntityInteractType;

	/**
	 * Creates a new player interact with entity signal.
	 * @param player The player interacting with the entity.
	 * @param target The entity being interacted with.
	 * @param itemStack The item stack that is being used to interact with the entity, or null if empty hand.
	 * @param type The type of interaction.
	 */
	public constructor(
		player: Player,
		target: Entity,
		itemStack: ItemStack | null,
		type: EntityInteractType
	) {
		super(player.dimension.world);
		this.player = player;
		this.target = target;
		this.itemStack = itemStack;
		this.type = type;
	}
}

export { PlayerInteractWithEntitySignal };
