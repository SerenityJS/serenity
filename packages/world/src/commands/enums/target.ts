import { ValidEnum } from "@serenityjs/command";

import { Entity } from "../../entity";
import { Player } from "../../player";

import type { Dimension } from "../../world";
import type { CommandArgumentPointer } from "@serenityjs/command";

class TargetEnum extends ValidEnum {
	/**
	 * The type of the enum.
	 */
	public static readonly identifier = "target";

	/**
	 * The symbol of the enum.
	 */
	public static readonly symbol = (this.type << 16) | 0x0a;

	/**
	 * The result of the enum.
	 */
	public readonly result: Array<Entity> | null;

	public constructor(result: Array<Entity> | null) {
		super();
		this.result = result;
	}

	public validate(error = false): boolean {
		// Check if we should throw an error if the result is null.
		if (error && !this.result)
			throw new Error("No targets matched the selector.");

		// Check if the result is null.
		if (!this.result) return false;

		// Check if the result is an array.
		return true;
	}

	public static extract<O = Entity | Dimension>(
		pointer: CommandArgumentPointer<O>
	): TargetEnum | null {
		// Peek the next value from the pointer.
		const target = pointer.next() as string;

		// Check if the target is null.
		if (!target) return new TargetEnum(null);

		// Check if the target can be a number or a float.
		if (+target >= 0 || +target <= 0) return new TargetEnum(null);

		// Check if the target can be a boolean.
		if (target === "true" || target === "false") return new TargetEnum(null);

		// Get the origin of the command.
		const origin =
			pointer.state.origin instanceof Entity
				? pointer.state.origin.dimension
				: (pointer.state.origin as Dimension);

		// Check if the target is a player or starts with @.
		if (
			!target.startsWith("@") &&
			!origin.getPlayers().some((x) => x.username === target)
		)
			return new TargetEnum(null);

		// Check if the target starts with @.
		// This means we are querying for a target.
		if (target.startsWith("@")) {
			// Get the query symbol. (e.g. a, e, p, r, s)
			const symbol = target.slice(1)[0];
			const query = target.slice(2);

			// Check if the query is valid.
			if (query.length > 0 && (!query.startsWith("[") || !query.endsWith("]")))
				throw new Error("Invalid query."); // TODO: more specific error

			// Parse the query.
			const queries =
				query.length > 0
					? query
							.slice(1, -1)
							.split(",")
							.flatMap((data) => {
								const [key, value] = data.split("=");
								return { key, value };
							})
					: [];

			// Check if the symbol is a valid query.
			switch (symbol) {
				// Get all players.
				case "a": {
					const players = origin.getPlayers().filter((player) => {
						// Check if there are any queries.
						if (queries.length === 0) return true;

						// Check if the player matches the query.
						for (const { key, value } of queries) {
							switch (key) {
								// Check if the player name matches the query.
								case "name": {
									// Get the name query.
									let name = value as string;

									// Check if the query is negated.
									const negate = name.startsWith("!");
									if (negate) name = name.slice(1);

									// Check if the player name matches the query.
									if (
										negate ? player.username === name : player.username !== name
									)
										return false;
									break;
								}

								// Check if the player tag matches the query.
								case "tag": {
									// Get the tag query.
									let tag = value as string;

									// Check if the query is negated.
									const negate = tag.startsWith("!");
									if (negate) tag = tag.slice(1);

									// Check if the player has the tag.
									if (negate ? player.hasTag(tag) : !player.hasTag(tag))
										return false;
									break;
								}

								default: {
									throw new TypeError(`Invalid query key "${key}"`);
								}
							}
						}

						return true;
					});

					return new TargetEnum(players);
				}

				// Get all entities.
				case "e": {
					// Filter entities by query.
					const entities = origin.getEntities().filter((entity) => {
						// Check if there are any queries.
						if (queries.length === 0) return true;

						// Check if the entity matches the query.
						for (const { key, value } of queries) {
							switch (key) {
								// Check if the entity name matches the query.
								case "name": {
									if (entity.hasComponent("minecraft:nametag")) {
										// Get the name from the query.
										let name = value as string;

										const negate = name.startsWith("!");
										if (negate) name = name.slice(1);

										// Get the nametag component.
										const nametag = entity.getComponent("minecraft:nametag");

										// Check if the nametag matches the query.
										if (
											negate
												? nametag.getCurrentValue() === name
												: nametag.getCurrentValue() !== name
										)
											return false;
									} else {
										return false;
									}
									break;
								}

								// Check if the entity type matches the query.
								case "type": {
									// Get the type query.
									let type = value as string;

									// Check if the query is negated.
									const negate = type.startsWith("!");
									if (negate) type = type.slice(1);

									// Parse the entity type.
									const parsed = type.includes(":")
										? value
										: `minecraft:${value}`;

									// Check if the entity type matches the query.
									if (
										negate
											? entity.type.identifier === parsed
											: entity.type.identifier !== parsed
									)
										return;
									break;
								}

								// Check if the entity tag matches the query.
								case "tag": {
									// Get the tag query.
									let tag = value as string;

									// Check if the query is negated.
									const negate = tag.startsWith("!");
									if (negate) tag = tag.slice(1);

									// Check if the player has the tag.
									if (negate ? entity.hasTag(tag) : !entity.hasTag(tag))
										return false;
									break;
								}

								default: {
									throw new TypeError(`Invalid query key "${key}"`);
								}
							}
						}

						return true;
					});

					return new TargetEnum(entities);
				}

				// Get the nearest player.
				case "p": {
					if (pointer.state.origin instanceof Player) {
						return new TargetEnum([pointer.state.origin]);
					} else {
						throw new TypeError(
							"Nearest player is not available in this context."
						);
					}
				}

				// Get a random player.
				case "r": {
					// Get all players that match the query.
					const players = origin.getPlayers().filter((player) => {
						// Check if there are any queries.
						if (queries.length === 0) return true;

						// Check if the player matches the query.
						for (const { key, value } of queries) {
							switch (key) {
								// Check if the player name matches the query.
								case "name": {
									// Get the name query.
									let name = value as string;

									// Check if the query is negated.
									const negate = name.startsWith("!");
									if (negate) name = name.slice(1);

									// Check if the player name matches the query.
									if (
										negate ? player.username === name : player.username !== name
									)
										return false;
									break;
								}

								// Check if the entity tag matches the query.
								case "tag": {
									// Get the tag query.
									let tag = value as string;

									// Check if the query is negated.
									const negate = tag.startsWith("!");
									if (negate) tag = tag.slice(1);

									// Check if the player has the tag.
									if (negate ? player.hasTag(tag) : !player.hasTag(tag))
										return false;
									break;
								}

								default: {
									throw new TypeError(`Invalid query key "${key}"`);
								}
							}
						}

						return true;
					});

					// Get a random player from the list.
					const player = players[
						Math.floor(Math.random() * players.length)
					] as Player;

					// Return the random player.
					return new TargetEnum([player]);
				}

				// Get the source player.
				case "s": {
					if (pointer.state.origin instanceof Entity) {
						return new TargetEnum([pointer.state.origin]);
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

		// Return null if no target was found
		return new TargetEnum(null);
	}
}

export { TargetEnum };
