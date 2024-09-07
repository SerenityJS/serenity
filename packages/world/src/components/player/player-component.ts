import { EntityComponent } from "../entity";

import type { Gamemode } from "@serenityjs/protocol";
import type { Player } from "../../player";

abstract class PlayerComponent extends EntityComponent {
	/**
	 * The entity the component is binded to.
	 */
	protected readonly player: Player;

	/**
	 * Creates a new entity component.
	 *
	 * @param entity The entity the component is binded to.
	 * @returns A new entity component.
	 */
	public constructor(player: Player, identifier: string) {
		super(player, identifier);
		this.player = player;
	}

	/**
	 * Called when a player's gamemode is changed.
	 * @param pervious The previous gamemode of the player.
	 * @param current The current gamemode of the player.
	 */
	public onGamemodeChange?(pervious: Gamemode, current: Gamemode): void;
}

export { PlayerComponent };
