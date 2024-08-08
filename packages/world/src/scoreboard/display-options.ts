import type { Player } from "../player";
import type { ScoreboardObjective } from "./objective";
import type { ObjectiveSortOrder } from "@serenityjs/protocol";

interface ScoreboardObjectiveDisplayOptions {
	/**
	 * The objective to display.
	 */
	objective: ScoreboardObjective;

	/**
	 * The sorting order to display the scores of the objective.
	 */
	sortOrder: ObjectiveSortOrder;

	/**
	 * Whether or not to display to a specific player.
	 * If not specified, the display will be global.
	 */
	player?: Player;
}

export { ScoreboardObjectiveDisplayOptions };
