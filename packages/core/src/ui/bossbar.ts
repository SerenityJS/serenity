import {
  BossEventAdd,
  BossEventColor,
  BossEventPacket,
  BossEventUpdate,
  BossEventUpdateType
} from "@serenityjs/protocol";

import { Entity, Player } from "../entity";

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
    packet.targetUniqueId = this.boss.uniqueId;
    packet.type = BossEventUpdateType.Add;
    packet.add = new BossEventAdd(this.title, this.percent, 0, this.color, 0);

    // Send the packet to the player.
    player.send(packet);

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
    packet.targetUniqueId = this.boss.uniqueId;
    packet.type = BossEventUpdateType.Remove;

    // If a player is provided, send the packet to the player.
    // If a player is not provided, send the packet to all occupants.
    if (player) {
      player.send(packet);
      this.occupants.delete(player);
    } else {
      // Loop through all occupants and send the packet to each one.
      for (const occupant of this.occupants) {
        occupant.send(packet);
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
    packet.targetUniqueId = this.boss.uniqueId;
    packet.type = BossEventUpdateType.UpdateName;
    packet.update = new BossEventUpdate(null, null, title);

    // Send the packet to all occupants.
    for (const occupant of this.occupants) {
      occupant.send(packet);
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
    packet.targetUniqueId = this.boss.uniqueId;
    packet.type = BossEventUpdateType.UpdatePercent;
    packet.update = new BossEventUpdate(null, percent);

    // Send the packet to all occupants.
    for (const occupant of this.occupants) {
      occupant.send(packet);
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
    packet.targetUniqueId = this.boss.uniqueId;
    packet.type = BossEventUpdateType.UpdateStyle;
    packet.update = new BossEventUpdate(null, null, null, 0, color, 0);

    // Send the packet to all occupants.
    for (const occupant of this.occupants) {
      occupant.send(packet);
    }

    // Update the color.
    this.color = color;
  }
}

export { Bossbar };
