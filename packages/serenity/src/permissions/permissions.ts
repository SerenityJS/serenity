import { resolve } from "node:path";
import { readFileSync, writeFileSync } from "node:fs";

import { PermissionLevel } from "@serenityjs/protocol";

import { exists } from "../utils/exists";

import type { Player } from "@serenityjs/world";

type PermissionLevelString = "owner" | "member" | "operator" | "custom";

interface PermissionEntry {
	xuid: string;
	username: string;
	permission: PermissionLevelString | PermissionLevel;
}

class Permissions {
	public readonly path: string;

	public readonly entries: Array<PermissionEntry>;

	public constructor() {
		this.path = resolve(process.cwd(), "permissions.json");
		this.entries = [];

		// Check if the permissions.json file exists.
		if (exists(this.path)) {
			// Read the permissions from the permissions.json file.
			this.entries = JSON.parse(readFileSync(this.path, "utf8"));
		} else {
			// Create the permissions.json file.
			writeFileSync(this.path, JSON.stringify(this.entries, null, 2));
		}
	}

	/**
	 * Get the permission level of a player.
	 * @param player The player to get the permission level of.
	 * @returns The permission level of the player.
	 */
	public get(player: Player | string, name?: string): PermissionLevel {
		// Get the xuid of the player.
		const xuid = typeof player === "string" ? player : player.xuid;

		// Get the permission level of the player.
		const entry = this.entries.find((entry) => entry.xuid === xuid);

		// Check if the player has a permission level.
		if (entry) {
			// Check if the permission entry is a string.
			if (typeof entry.permission === "string") {
				// Convert the permission level to a numeric permission level.
				entry.permission = this.symbolicToNumeric(entry.permission);
			}

			// Return the permission level of the player.
			return entry.permission;
		} else {
			// Set the permission level of the player to member.
			this.set(player, PermissionLevel.Member, name);

			// Return the permission level of the player.
			return PermissionLevel.Member;
		}
	}

	/**
	 * Set the permission level of a player.
	 * @param player The player to set the permission level of.
	 * @param permission The permission level to set.
	 */
	public set(
		player: Player | string,
		permissions: PermissionLevel,
		name?: string
	): void {
		// Get the xuid, name, and permission level of the player.
		const xuid = typeof player === "string" ? player : player.xuid;
		const username = typeof player === "string" ? name : player.username;
		if (!username) {
			throw new Error("Username is undefined.");
		}
		const permission = this.numericToSymbolic(permissions);

		// Get the index of the player in the entries array. If the player is not found, the index will be -1.
		// Set the permission level of the player.
		const index = this.entries.findIndex((entry) => entry.xuid === xuid);
		if (index === -1) {
			this.entries.push({ xuid, username, permission });
		} else {
			this.entries[index] = { xuid, username, permission };
		}

		// Write the permissions to the permissions.json file.
		writeFileSync(this.path, JSON.stringify(this.entries, null, 2));
	}

	/**
	 * Convert a numeric permission level to a symbolic permission level.
	 * @param permission The permission level to convert.
	 */
	private numericToSymbolic(
		permission: PermissionLevel
	): PermissionLevelString {
		switch (permission) {
			case PermissionLevel.Visitor: {
				return "owner";
			}

			case PermissionLevel.Member: {
				return "member";
			}

			case PermissionLevel.Operator: {
				return "operator";
			}

			default:
			case PermissionLevel.Custom: {
				return "custom";
			}
		}
	}

	/**
	 * Convert a symbolic permission level to a numeric permission level.
	 * @param permission The permission level to convert.
	 */
	private symbolicToNumeric(permission: string): PermissionLevel {
		switch (permission.toLowerCase()) {
			case "owner": {
				return PermissionLevel.Visitor;
			}

			case "member": {
				return PermissionLevel.Member;
			}

			case "operator": {
				return PermissionLevel.Operator;
			}

			default:
			case "custom": {
				return PermissionLevel.Custom;
			}
		}
	}
}

export { Permissions, PermissionEntry };
