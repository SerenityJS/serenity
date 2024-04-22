import { ValidEnum, StringEnum } from "@serenityjs/command";

import { Entity } from "../../entity";
import { Player } from "../../player";

import type { Dimension } from "../../world";
import type { CommandExecutionState } from "@serenityjs/command";

class TargetEnum extends ValidEnum {
	/**
	 * The type of the enum.
	 */
	public static readonly name = "target";

	/**
	 * The symbol of the enum.
	 */
	public static readonly symbol = (this.type << 16) | 0x0a;

	/**
	 * The result of the enum.
	 */
	public readonly result: Array<Entity>;

	public constructor(result: Array<Entity>) {
		super();
		this.result = result;
	}

	public static extract<O = Entity | Dimension>(
		state: CommandExecutionState<O>
	): TargetEnum | undefined {
		// Read next argument in slice array.
		const stringValue = StringEnum.extract(state as never);
		if (!stringValue) throw new Error("Invalid target.");

		// Separate the target from the arguments.
		const target = stringValue.result;

		// Get the origin of the command.
		const origin =
			state.origin instanceof Entity
				? state.origin.dimension
				: (state.origin as Dimension);

		// Check if the target starts with @.
		// This means we are querying for a target.
		if (target.startsWith("@")) {
			// TODO: implement target queries... [name=foo,tag=bar]
			// Get the query symbol. (e.g. a, e, p, r, s)
			const symbol = target.slice(1)[0];

			// Check if the symbol is a valid query.
			switch (symbol) {
				// Get all players.
				case "a": {
					return new TargetEnum(origin.getPlayers());
				}

				// Get all entities.
				case "e": {
					return new TargetEnum(origin.getEntities());
				}

				// Get the nearest player.
				case "p": {
					if (state.origin instanceof Player) {
						return new TargetEnum([state.origin]);
					} else {
						throw new TypeError(
							"Nearest player is not available in this context."
						);
					}
				}

				// Get a random player.
				case "r": {
					const players = origin.getPlayers();
					const player = players[
						Math.floor(Math.random() * players.length)
					] as Player;
					return new TargetEnum([player]);
				}

				// Get the source player.
				case "s": {
					if (state.origin instanceof Entity) {
						return new TargetEnum([state.origin]);
					} else {
						throw new TypeError(
							"Source player is not available in this context."
						);
					}
				}
			}
		} else {
			// Filter players by username.
			const players = origin
				.getPlayers()
				.filter((player) => player.username === target);

			// Check if the player was found.
			if (players.length === 0) {
				throw new Error(
					`Player "${target}" was not found in the current dimension.`
				);
			}

			// Return the player.
			return new TargetEnum(players);
		}
	}
}

export { TargetEnum };
