import { Vector3f } from "@serenityjs/protocol";

import { Entity, Player } from "../../../entity";

import { ValidEnum } from ".";

import type { Dimension } from "../../../world";
import type { CommandArgumentPointer } from "../../execution-state";

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

  /**
   * Validates the target enum.
   * @param error Whether to throw an error if the validation fails.
   * @returns Whether the target enum is valid.
   */
  public validate(error = false): boolean {
    // Check if we should throw an error if the result is null.
    if (error && !this.result)
      throw new Error("No targets matched the selector.");

    // Check if the result is null.
    if (!this.result) return false;

    // Check if the result is an array.
    return true;
  }

  /**
   * Extracts a target enum from the command argument pointer.
   * @param pointer The command argument pointer.
   * @returns The extracted target enum or null if no valid target was found.
   */
  public static extract(pointer: CommandArgumentPointer): TargetEnum | null {
    // Peek the next value from the pointer.
    const target = pointer.next() as string;

    // Check if the target is null.
    if (!target) return new TargetEnum(null);

    // Check if the target can be a number or a float.
    if (+target >= 0 || +target <= 0) return new TargetEnum(null);

    // Check if the target can be a boolean.
    if (target === "true" || target === "false") return new TargetEnum(null);

    // Get the dimension where the command is being executed.
    const dimension =
      pointer.state.origin instanceof Entity
        ? pointer.state.origin.dimension
        : (pointer.state.origin as Dimension);

    // Get an array of all players in the dimension.
    const dimensionPlayers = dimension.getPlayers();

    // Check if the target is a player or starts with @.
    const isSelector = target.startsWith("@");
    const isPlayer = dimensionPlayers.some((x) => x.username === target);

    // If the target is neither a selector nor a player name, return null.
    if (!isSelector && !isPlayer) return new TargetEnum(null);

    if (isPlayer) {
      // Filter players by username.
      const players = dimensionPlayers.filter(
        (player) => player.username === target
      );

      // Check if any players were found.
      if (players.length === 0)
        throw new Error(
          `Player "${target}" was not found in the current dimension.`
        );

      // Return the filtered players.
      return new TargetEnum(players);
    } else if (isSelector) return this.parseSelector(target, pointer);
  }

  /**
   * Parses a target selector string.
   * @param selector The target selector string.
   * @param pointer The command argument pointer.
   * @returns The parsed target enum.
   */
  public static parseSelector(
    selector: string,
    pointer: CommandArgumentPointer
  ): TargetEnum {
    // Get the dimension where the command is being executed.
    const dimension =
      pointer.state.origin instanceof Entity
        ? pointer.state.origin.dimension
        : (pointer.state.origin as Dimension);

    // Get the query symbol. (e.g. a, e, p, r, s)
    const symbol = selector.charAt(1);
    const query = selector.slice(2);

    // Validate the query format.
    if (query.length > 0)
      if (!query.startsWith("[") || !query.endsWith("]"))
        throw new Error(
          `Invalid selector query. Expected format: [key=value,...]`
        );

    // Determine if the selector contains any queries.
    const hasQuery = query.length > 2; // At least "[]" is required for a valid query.

    // Parse the queries from the selector.
    const queries: Array<{ key: string; value: string }> = query
      .slice(1, -1) // Remove the enclosing brackets.
      .split(",") // Split by comma to get individual key-value pairs.
      .filter((data) => data.includes("=")) // Ensure valid key-value pairs.
      .map((data) => {
        const [key, value] = data.split("=");
        if (!key || !value)
          throw new Error(
            `Invalid query format: "${data}". Expected key=value.`
          );

        return { key: key.trim(), value: value.trim() };
      });

    // Handle the selector based on its symbol.
    switch (symbol) {
      // Handle "all players" selector.
      case "a": {
        // Get all players in the dimension.
        const players = dimension.getPlayers();

        // If there are no queries, return all players.
        if (!hasQuery) return new TargetEnum(players);

        // Parse the queries.
        const results = this.parseQueries(queries, players, pointer);
        return new TargetEnum(results);
      }

      // Handle "all entities" selector.
      case "e": {
        // Get all entities in the dimension.
        const entities = dimension.getEntities();

        // If there are no queries, return all entities.
        if (queries.length === 0) return new TargetEnum(entities);

        if (!hasQuery) return new TargetEnum(entities);

        // Parse the queries.
        const results = this.parseQueries(queries, entities, pointer);
        return new TargetEnum(results);
      }

      // Handle "nearest player" selector.
      case "p": {
        const commandPosition = new Vector3f(0, 0, 0);
        if (pointer.state.origin instanceof Entity)
          commandPosition.set(pointer.state.origin.position);

        // Get all players in the dimension.
        const players = dimension.getPlayers();

        // Get the nearest player to the command origin.
        const nearest = players.reduce((prev, curr) => {
          const prevPos = prev.position;
          const currPos = curr.position;
          const prevDist = TargetEnum.calculateDistance(
            prevPos,
            commandPosition
          );
          const currDist = TargetEnum.calculateDistance(
            currPos,
            commandPosition
          );

          if (prevDist === currDist) return Math.random() < 0.5 ? prev : curr;
          return prevDist < currDist ? prev : curr;
        });

        if (!hasQuery) return new TargetEnum(nearest ? [nearest] : null);

        // Parse the queries.
        const results = this.parseQueries(queries, [nearest], pointer);
        return new TargetEnum(results);
      }

      // Handle "nearest entity" selector.
      case "n": {
        const commandPosition = new Vector3f(0, 0, 0);
        if (pointer.state.origin instanceof Entity)
          commandPosition.set(pointer.state.origin.position);

        // Get all entities in the dimension.
        const entities = dimension.getEntities();

        // Get the nearest entity to the command origin.
        const nearest = entities.reduce((prev, curr) => {
          const prevPos = prev.position;
          const currPos = curr.position;
          const prevDist = TargetEnum.calculateDistance(
            prevPos,
            commandPosition
          );
          const currDist = TargetEnum.calculateDistance(
            currPos,
            commandPosition
          );

          if (prevDist === currDist) return Math.random() < 0.5 ? prev : curr;
          return prevDist < currDist ? prev : curr;
        });

        if (!hasQuery) return new TargetEnum(nearest ? [nearest] : null);

        // Parse the queries.
        const results = this.parseQueries(queries, [nearest], pointer);
        return new TargetEnum(results);
      }

      // Parse "random player" selector.
      case "r": {
        // Get all players in the dimension.
        const players = dimension.getPlayers();

        // If there are no queries, return all players.
        if (queries.length === 0) return new TargetEnum(players);

        // Get a random player from the list.
        const randomPlayer =
          players[Math.floor(Math.random() * players.length)];
        if (!randomPlayer) return new TargetEnum(null);

        if (!hasQuery) return new TargetEnum([randomPlayer]);

        // Parse the queries.
        const results = this.parseQueries(queries, [randomPlayer], pointer);
        return new TargetEnum(results);
      }

      // Parse "self" selector.
      case "s": {
        if (pointer.state.origin instanceof Entity) {
          if (!hasQuery) return new TargetEnum([pointer.state.origin]);

          // Parse the queries.
          const results = this.parseQueries(
            queries,
            [pointer.state.origin],
            pointer
          );
          return new TargetEnum(results);
        } else
          throw new TypeError(
            "Command source is not an entity and cannot be used as a target selector in this context."
          );
      }

      // Handle invalid selector symbols.
      default: {
        throw new Error(`Invalid selector symbol "@${symbol}"`);
      }
    }
  }

  /**
   * Parses the target selector queries.
   * @param queries The queries to parse.
   * @param entities The entities to filter.
   * @param pointer The command argument pointer.
   * @returns The filtered entities.
   */
  public static parseQueries(
    queries: Array<{ key: string; value: string }>,
    entities: Array<Entity>,
    pointer: CommandArgumentPointer
  ): Array<Entity> {
    const results: Array<Entity> = [];

    // Get the position of the command execution.
    const commandPosition = new Vector3f(0, 0, 0);
    if (pointer.state.origin instanceof Entity)
      commandPosition.set(pointer.state.origin.position);

    for (const entity of entities) {
      let match = true;
      for (const { key, value } of queries) {
        // If already not a match, break early.
        if (!match) break;

        const isNegated = value.startsWith("!");
        const queryValue = isNegated ? value.slice(1) : value;

        // Loop through each query and check if the entity matches.
        switch (key) {
          // Handle name query.
          case "name":
            if (entity instanceof Player) {
              if (isNegated) {
                if (entity.username === queryValue) match = false;
              } else {
                if (entity.username !== queryValue) match = false;
              }
            } else {
              if (isNegated) {
                if (entity.nameTag === queryValue) match = false;
              } else {
                if (entity.nameTag !== queryValue) match = false;
              }
            }
            break;

          // Handle tag query.
          case "tag":
            if (isNegated) {
              if (entity.hasTag(queryValue)) match = false;
            } else {
              if (!entity.hasTag(queryValue)) match = false;
            }
            break;

          // Handle range query.
          case "r": {
            const range = Number.parseFloat(queryValue);
            const entityPos = entity.position;

            const distance = TargetEnum.calculateDistance(
              entityPos,
              commandPosition
            );

            // If entity is out of range, it's not a match.
            if (distance > range) match = false;
            break;
          }

          // Handle minimum range query.
          case "rm": {
            const range = Number.parseFloat(queryValue);
            const entityPos = entity.position;
            const distance = TargetEnum.calculateDistance(
              entityPos,
              commandPosition
            );
            // If entity is within minimum range, it's not a match.
            if (distance < range) match = false;
            break;
          }

          // Handle count query.
          case "c": {
            const count = Number.parseInt(queryValue);
            if (results.length >= count) match = false;
            break;
          }

          // Handle type query.
          case "type": {
            const type = queryValue;
            const entityType = entity.type.identifier;

            if (isNegated) {
              if (entityType === type) match = false;
            } else {
              if (entityType !== type) match = false;
            }
            break;
          }

          // Handle mode query.
          case "m": {
            if (!(entity instanceof Player))
              throw new SyntaxError(
                `Mode query can only be used with players.`
              );

            // List of valid gamemodes and their corresponding numeric values.
            const gamemodeMap: Record<string, number> = {
              survival: 0,
              s: 0,
              creative: 1,
              c: 1,
              adventure: 2,
              a: 2,
              spectator: 3,
              sp: 3,
            };

            // Get the expected gamemode from the map.
            const expectedGamemode = gamemodeMap[queryValue.toLowerCase()];
            if (expectedGamemode === undefined)
              throw new SyntaxError(
                `Invalid mode value "${queryValue}". Expected one of: ${Object.keys(
                  gamemodeMap
                ).join(", ")}.`
              );

            // Check if the player's gamemode matches the expected gamemode.
            if (isNegated) {
              if (entity.gamemode === expectedGamemode) match = false;
            } else {
              if (entity.gamemode !== expectedGamemode) match = false;
            }
            break;
          }

          // Handle level query.
          case "l": {
            if (!(entity instanceof Player))
              throw new SyntaxError(
                `Level query can only be used with players.`
              );

            // Get the player's level.
            const level = entity.getLevel();
            const expectedLevel = Number.parseInt(queryValue);

            if (isNegated) {
              if (level === expectedLevel) match = false;
            } else {
              if (level !== expectedLevel) match = false;
            }
            break;
          }

          // Handle minimum level query.
          case "lm": {
            if (!(entity instanceof Player))
              throw new SyntaxError(
                `LevelMin query can only be used with players.`
              );

            // Get the player's level.
            const level = entity.getLevel();
            const expectedLevel = Number.parseInt(queryValue);

            if (isNegated) {
              if (level >= expectedLevel) match = false;
            } else {
              if (level < expectedLevel) match = false;
            }
            break;
          }

          // Default case for invalid query keys.
          default:
            throw new SyntaxError(`Invalid query key "${key}"`);
        }
      }

      if (match) results.push(entity);
    }
    return results;
  }

  /**
   * Calculates the Euclidean distance between two points in 3D space.
   * @param a The first point.
   * @param b The second point.
   * @returns The distance between the two points.
   */
  private static calculateDistance(a: Vector3f, b: Vector3f): number {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
  }
}

export { TargetEnum };
