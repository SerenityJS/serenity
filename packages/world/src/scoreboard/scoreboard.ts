import {
	RemoveObjectivePacket,
	ScoreboardActionType,
	SetDisplayObjectivePacket,
	SetScorePacket,
	type DisplaySlotType
} from "@serenityjs/protocol";

import { ScoreboardObjective } from "./objective";

import type { ScoreboardObjectiveDisplayOptions } from "./display-options";
import type { World } from "../world";

class Scoreboard {
	/**
	 * The world the scoreboard is binded to.
	 */
	protected readonly world: World;

	/**
	 * The objectives of the scoreboard.
	 */
	public readonly objectives = new Set<ScoreboardObjective>();

	/**
	 * The current objectives in the display slots.
	 */
	public readonly slots = new Map<DisplaySlotType, ScoreboardObjective>();

	/**
	 * Creates a new scoreboard.
	 * @param world The world the scoreboard will be binded to.
	 */
	public constructor(world: World) {
		this.world = world;
	}

	/**
	 * Gets the objective with the specified name.
	 * @param name The name of the objective.
	 * @returns The objective with the specified name, or undefined if no objective was found.
	 */
	public getObjective(name: string): ScoreboardObjective | undefined {
		// Iterate through the objectives and return the objective with the matching name.
		for (const objective of this.objectives) {
			// Check if the objective name matches the name.
			if (objective.objectiveName === name) return objective;
		}

		// Return undefined if no objective
		return undefined;
	}

	/**
	 * Adds a new objective to the scoreboard.
	 * @param name The name of the objective.
	 * @param display The display name of the objective.
	 * @returns The objective that was added.
	 */
	public addObjective(name: string, display?: string): ScoreboardObjective {
		// Check if the objective already exists.
		if (this.getObjective(name))
			throw new Error(`Objective with name '${name}' already exists`);

		// Create a new objective and add it to the scoreboard.
		const objective = new ScoreboardObjective(this.world, name, display);

		// Add the objective to the scoreboard.
		this.objectives.add(objective);

		// Return the objective.
		return objective;
	}

	/**
	 * Removes the objective from the scoreboard.
	 * @param objective The objective to remove.
	 */
	public removeObjective(objective: string | ScoreboardObjective): void {
		// Get the objective by name if it is a string
		if (typeof objective === "string") {
			const dObjective = this.getObjective(objective);

			// Check if the objective exists
			if (!dObjective) throw new Error("Objective does not exist");

			// Remove the objective from the scoreboard
			this.objectives.delete(dObjective);
		} else {
			// Remove the objective from the scoreboard
			this.objectives.delete(objective);
		}
	}

	/**
	 * Gets the objective at the display slot.
	 * @param slot The display slot to get the objective at.
	 * @returns The objective at the display slot, or undefined if no objective was found.
	 */
	public getObjectiveAtDisplaySlot(
		slot: DisplaySlotType
	): ScoreboardObjective | undefined {
		return this.slots.get(slot);
	}

	/**
	 * Sets the objective at the display slot.
	 * @param slot The display slot to set the objective at.
	 * @param options The options to set the objective with.
	 * @returns The objective that was set.
	 */
	public setObjectiveAtDisplaySlot(
		slot: DisplaySlotType,
		options: ScoreboardObjectiveDisplayOptions
	): ScoreboardObjective {
		// Seperate the options into objective, sortOrder, and player
		const { objective, sortOrder, player } = options;

		// Create a new display objective packet
		const display = new SetDisplayObjectivePacket();
		display.displaySlot = slot;
		display.objectiveName = objective.objectiveName;
		display.displayName = objective.displayName;
		display.criteriaName = "dummy";
		display.sortOrder = sortOrder;

		// Create a new set score packet
		const scores = new SetScorePacket();
		scores.type = ScoreboardActionType.Change;
		scores.entries = [...objective.participants].map(([identity, score]) => {
			return {
				scoreboardId: identity.identifier,
				objectiveName: objective.objectiveName,
				score,
				identityType: identity.type,
				actorUniqueId: identity.entity?.unique ?? null,
				customName: identity.displayName
			};
		});

		// Send the display and scores to the player if specified, otherwise broadcast it to the world
		player
			? player.session.send(display, scores)
			: this.world.broadcast(display, scores);

		// Set the objective at the display slot
		this.slots.set(slot, objective);

		// Return the objective that was set
		return objective;
	}

	/**
	 * Clears the objective at the display slot.
	 * @param slot The display slot to clear the objective at.
	 * @param options The options to clear the objective with.
	 * @returns The objective that was cleared.
	 */
	public clearObjectiveAtDisplaySlot(
		slot: DisplaySlotType,
		options?: ScoreboardObjectiveDisplayOptions
	): ScoreboardObjective | undefined {
		// Get the objective at the display slot
		const objective = this.slots.get(slot);

		// Check if the objective exists
		if (!objective) return undefined;

		// Create a new remove objective packet
		const packet = new RemoveObjectivePacket();
		packet.objectiveName = objective.objectiveName;

		if (options?.player) {
			// Send the packet to the player
			options.player.session.send(packet);
		} else {
			// Broadcast the packet to the world
			this.world.broadcast(packet);

			// Delete the objective from the display slot
			this.slots.delete(slot);
		}

		// Remove the objective from the display slot
		return objective;
	}
}

export { Scoreboard };
