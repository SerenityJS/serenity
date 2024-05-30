import {
	BossEventAdd,
	BossEventColor,
	BossEventPacket,
	BossEventUpdate,
	BossEventUpdateType
} from "@serenityjs/protocol";

import type { Entity, Player } from "@serenityjs/world";

/**
 * Represents a bossbar that can be displayed to players, and is which binded to a specific entity/player. The bossbar shows a title, percent, and color. The bossbar can also be shown to multiple players at once. The bossbar can also be dynamically updated to change the title, percent, and color.
 *
 * **Example Usage**
 * ```ts
 * import { Bossbar } from "@serenityjs/server-ui";
 * import { BossEventColor } from "@serenityjs/protocol";
 * import { Entity } from "@serenityjs/world";
 *
 * // Note: This is a simple example, and does not include the proper setup for an entity.
 * // Entities are usually spawned using the .spawnEntity method a Dimension instance.
 * const boss = new Entity();
 *
 * // Create a new bossbar.
 * const bossbar = new Bossbar(boss, "Example Bar", 0.75, BossEventColor.Red);
 *
 * // Note: Serenity is the instance given in the Plugin api.
 * serenity.on("PlayerSpawned", (event) => {
 *   // Show the bossbar to the player.
 *   bossbar.show(event.player);
 * })
 * ```
 */
class Bossbar {
	/**
	 * The boss entity the bar is associated with.
	 */
	public readonly boss: Entity;

	/**
	 * A set of players that are viewing the boss bar.
	 */
	public readonly occupants: Set<Player>;

	/**
	 * The current title of the boss bar.
	 */
	public title: string;

	/**
	 * The current percent of the boss bar.
	 */
	public percent: number;

	/**
	 * The current color of the boss bar.
	 */
	public color: BossEventColor;

	/**
	 * Constructs a new bossbar ui element.
	 * @param boss The boss entity the bar is associated with. This entity can be the player itself.
	 * @param title The title of the bossbar.
	 * @param percent The percent of the bossbar.
	 * @param color The color of the bossbar.
	 */
	public constructor(
		boss: Entity,
		title?: string,
		percent?: number,
		color?: BossEventColor
	) {
		this.boss = boss;
		this.occupants = new Set();
		this.title = title ?? boss.type.identifier;
		this.percent = percent ?? 1;
		this.color = color ?? BossEventColor.Pink;
	}

	/**
	 * Shows the bossbar to a specific player.
	 * @param player The player to show the boss bar to.
	 */
	public show(player: Player): void {
		// Create a boss event packet.
		const packet = new BossEventPacket();

		// Assign the packet properties.
		packet.targetUniqueId = this.boss.unique;
		packet.type = BossEventUpdateType.Add;
		packet.add = new BossEventAdd(this.title, this.percent, 0, this.color, 0);

		// Send the packet to the player.
		player.session.send(packet);

		// Add the player to the occupants set.
		this.occupants.add(player);
	}

	/**
	 * Hides the boss bar from a specific player.
	 * @note If no player is provided, the bossbar will be hidden from all occupants.
	 * @param player The player to hide the bossbar from.
	 */
	public hide(player?: Player): void {
		// Create a boss event packet.
		const packet = new BossEventPacket();

		// Assign the packet properties.
		packet.targetUniqueId = this.boss.unique;
		packet.type = BossEventUpdateType.Remove;

		// If a player is provided, send the packet to the player.
		// If a player is not provided, send the packet to all occupants.
		if (player) {
			player.session.send(packet);
			this.occupants.delete(player);
		} else {
			// Loop through all occupants and send the packet to each one.
			for (const occupant of this.occupants) {
				occupant.session.send(packet);
				this.occupants.delete(occupant);
			}
		}
	}

	/**
	 * Updates the boss bar for all occupants.
	 */
	public setTitle(title: string): void {
		// Create a boss event packet.
		const packet = new BossEventPacket();

		// Assign the packet properties.
		packet.targetUniqueId = this.boss.unique;
		packet.type = BossEventUpdateType.UpdateName;
		packet.update = new BossEventUpdate(null, null, title);

		// Send the packet to all occupants.
		for (const occupant of this.occupants) {
			occupant.session.send(packet);
		}

		// Update the title.
		this.title = title;
	}

	/**
	 * Updates the boss bar for all occupants.
	 */
	public setPercent(percent: number): void {
		// Create a boss event packet.
		const packet = new BossEventPacket();

		// Assign the packet properties.
		packet.targetUniqueId = this.boss.unique;
		packet.type = BossEventUpdateType.UpdatePercent;
		packet.update = new BossEventUpdate(null, percent);

		// Send the packet to all occupants.
		for (const occupant of this.occupants) {
			occupant.session.send(packet);
		}

		// Update the percent.
		this.percent = percent;
	}

	/**
	 * Updates the boss bar for all occupants.
	 */
	public setColor(color: BossEventColor): void {
		// Create a boss event packet.
		const packet = new BossEventPacket();

		// Assign the packet properties.
		packet.targetUniqueId = this.boss.unique;
		packet.type = BossEventUpdateType.UpdateStyle;
		packet.update = new BossEventUpdate(null, null, null, 0, color, 0);

		// Send the packet to all occupants.
		for (const occupant of this.occupants) {
			occupant.session.send(packet);
		}

		// Update the color.
		this.color = color;
	}
}

export { Bossbar };
