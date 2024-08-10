import { EntityIdentifier } from "@serenityjs/entity";

import { PlayerComponent } from "./player-component";

import type { Player } from "../../player";

class PlayerEntityRenderingComponent extends PlayerComponent {
	public static readonly identifier = "minecraft:entity_rendering";

	public static readonly types = [EntityIdentifier.Player];

	/**
	 * A collective map of all the entities that have been rendered for the player.
	 */
	public readonly entities: Set<bigint> = new Set();

	public constructor(player: Player) {
		super(player, PlayerEntityRenderingComponent.identifier);
	}

	public onTick(): void {
		// Get all the entities in the player's dimension
		const entities = this.player.dimension.entities;

		// Iterate over the entities
		for (const [unique, entity] of entities) {
			// Check if the entity is the player or if the entity has already been rendered
			if (entity === this.player || this.entities.has(unique)) continue;

			// Add the entity to the rendered entities
			this.entities.add(unique);

			// Spawn the entity for the player
			entity.spawn(this.player);
		}
	}
}

export { PlayerEntityRenderingComponent };
