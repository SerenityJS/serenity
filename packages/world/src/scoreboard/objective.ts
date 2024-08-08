import { ScoreboardActionType, SetScorePacket } from "@serenityjs/protocol";

import { Entity } from "../entity";

import { ScoreboardIdentity } from "./identity";

import type { World } from "../world";
import type { Scoreboard } from "./scoreboard";

class ScoreboardObjective {
	/**
	 * The world the objective is binded to.
	 */
	protected readonly world: World;

	/**
	 * The scoreboard the objective is binded to.
	 */
	protected readonly scoreboard: Scoreboard;

	/**
	 * The participants of the objective.
	 */
	public readonly participants = new Map<ScoreboardIdentity, number>();

	/**
	 * The name of the objective.
	 */
	public readonly objectiveName: string;

	/**
	 * The display name of the objective.
	 */
	public displayName: string;

	public constructor(
		world: World,
		objectiveName: string,
		displayName?: string
	) {
		this.world = world;
		this.scoreboard = world.scoreboard;
		this.objectiveName = objectiveName;
		this.displayName = displayName ?? objectiveName;
	}

	/**
	 * Checks if the specified identity is a participant in the objective.
	 * @param participant The identity to check.
	 * @returns True if the identity is a participant in the objective, false otherwise.
	 */
	public hasParticipant(
		participant: Entity | string | ScoreboardIdentity
	): boolean {
		// Iterate through the participants and return the identity with the matching participant.
		for (const [identity] of this.participants) {
			// Check if the participant is scoreboard identity
			// And check if the scoreboard identity is the same as the participant
			if (participant instanceof ScoreboardIdentity && identity === participant)
				return true;

			// Check if the participant is a entity
			// And check if the entity identity is the same as the participant
			if (participant instanceof Entity && identity.entity === participant)
				return true;

			// Check if the participant is a string
			// And check if the display name of the identity is the same as the participant
			if (
				typeof participant === "string" &&
				identity.displayName === participant
			)
				return true;
		}

		// Return null if no identity was found.
		return false;
	}

	/**
	 * Gets the specified identity from the objective.
	 * @param participant The identity to get.
	 * @returns The identity if found, undefined otherwise.
	 */
	public getPaticipant(
		participant: Entity | string | ScoreboardIdentity
	): ScoreboardIdentity | null {
		// Iterate through the participants and return the identity with the matching participant.
		for (const [identity] of this.participants) {
			// Check if the participant is scoreboard identity
			// And check if the scoreboard identity is the same as the participant
			if (participant instanceof ScoreboardIdentity && identity === participant)
				return identity;

			// Check if the participant is a entity
			// And check if the entity identity is the same as the participant
			if (participant instanceof Entity && identity.entity === participant)
				return identity;

			// Check if the participant is a string
			// And check if the display name of the identity is the same as the participant
			if (
				typeof participant === "string" &&
				identity.displayName === participant
			)
				return identity;
		}

		// Return null if no identity was found.
		return null;
	}

	/**
	 * Get all the participants in the objective.
	 */
	public getParticipants(): Array<ScoreboardIdentity> {
		return [...this.participants.keys()];
	}

	/**
	 * Adds a participant to the objective.
	 * @param participant The identity of the participant to add.
	 * @param initialScore The initial score of the participant.
	 */
	public addParticipant(
		participant: Entity | string | ScoreboardIdentity,
		initialScore = 0
	): ScoreboardIdentity {
		// Check if the participant is already in the objective.
		if (this.hasParticipant(participant))
			throw new Error("Participant is already in the objective.");

		// Get or create the identity of the participant.
		const identity =
			participant instanceof ScoreboardIdentity
				? participant
				: participant instanceof Entity
					? participant.scoreboardIdentity
					: new ScoreboardIdentity(participant);

		// Set the participant in the objective.
		this.participants.set(identity, initialScore);

		// Return the identity of the participant.
		return identity;
	}

	/**
	 * Removes a participant from the objective using the specified identity.
	 * @param participant The identity of the participant to remove.
	 * @returns True if the participant was removed, false otherwise.
	 */
	public removeParticipant(
		participant: Entity | string | ScoreboardIdentity
	): boolean {
		// Get the identity of the participant.
		const identity = this.getPaticipant(participant);

		// Check if the identity is null.
		if (!identity) return false;

		// Remove the participant from the objective.
		this.participants.delete(identity);

		// Create a new packet to remove the score.
		const packet = new SetScorePacket();
		packet.type = ScoreboardActionType.Remove;
		packet.entries = [
			{
				scoreboardId: identity.identifier,
				objectiveName: this.objectiveName,
				score: 0,
				identityType: identity.type,
				actorUniqueId: null,
				customName: null
			}
		];

		// Broadcast the packet to the world.
		this.world.broadcast(packet);

		// Return true if the participant was removed.
		return true;
	}

	/**
	 * Sets the score of the participant in the objective.
	 * @param participant The identity of the participant.
	 * @param score The new score of the participant.
	 */
	public setScore(
		participant: Entity | string | ScoreboardIdentity,
		score: number
	): void {
		// Initialize the identity of the participant.
		const identity =
			this.getPaticipant(participant) ?? this.addParticipant(participant);

		// Set the score of the participant in the objective.
		this.participants.set(identity, score);

		// Create a new packet to set the score.
		const packet = new SetScorePacket();
		packet.type = ScoreboardActionType.Change;
		packet.entries = [
			{
				scoreboardId: identity.identifier,
				objectiveName: this.objectiveName,
				score,
				identityType: identity.type,
				actorUniqueId: identity.entity?.unique ?? null,
				customName: identity.displayName
			}
		];

		// Broadcast the packet to the world.
		this.world.broadcast(packet);
	}

	/**
	 * Adds a score to the participant in the objective.
	 * @param participant The identity of the participant.
	 * @param score The score to add.
	 * @returns The new score of the participant.
	 */
	public addScore(
		participant: Entity | string | ScoreboardIdentity,
		score: number
	): number {
		// Check if the participant is already in the objective.
		const identity =
			this.getPaticipant(participant) ?? this.addParticipant(participant);

		// Get the current score of the participant.
		const currentScore = this.participants.get(identity) ?? 0;

		// Calculate the new score of the participant.
		const newScore = currentScore + score;

		// Set the new score of the participant.
		this.setScore(identity, newScore);

		// Return the new score.
		return newScore;
	}

	/**
	 * Gets the score of the participant in the objective.
	 * @param participant The identity of the participant.
	 * @returns The score of the participant, null if the participant is not in the objective.
	 */
	public getScore(
		participant: Entity | string | ScoreboardIdentity
	): number | null {
		// Check if the participant is already in the objective.
		const identity = this.getPaticipant(participant);

		// Check if the identity is null.
		if (!identity) return null;

		// Get the current score of the participant.
		return this.participants.get(identity) as number;
	}

	/**
	 * Clears the scores of all the participants in the objective.
	 */
	public clearScores(): void {
		// Create a new packet to remove the score.
		const packet = new SetScorePacket();
		packet.type = ScoreboardActionType.Remove;
		packet.entries = [...this.participants.keys()].map((identity) => {
			return {
				scoreboardId: identity.identifier,
				objectiveName: this.objectiveName,
				score: 0,
				identityType: identity.type,
				actorUniqueId: null,
				customName: null
			};
		});

		// Broadcast the packet to the world.
		this.world.broadcast(packet);

		// Clear the participants of the objective.
		this.participants.clear();
	}
}

export { ScoreboardObjective };
