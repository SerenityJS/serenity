import { Vector3f } from "@serenityjs/protocol";
import { IntTag } from "@serenityjs/nbt";

import { Player } from "../player";
import { EntityIdentifier } from "../../enums";

import { EntityTrait } from "./trait";

class EntityXpOrbTrait extends EntityTrait {
  public static readonly identifier = "xp_orb";

  public static readonly types = [EntityIdentifier.XpOrb];

  /**
   * Gets the amount of experience points the orb is worth.
   * @returns The experience points the orb is worth.
   */
  public getExperienceValue(): number {
    // Fetch the "ExperienceValue" tag from the entity's NBT data
    return this.entity.nbt.get<IntTag>("ExperienceValue")?.valueOf() ?? 1;
  }

  /**
   * Sets the amount of experience points the orb is worth.
   * @param value The experience points to set the orb to be worth.
   */
  public setExperienceValue(value: number): void {
    // Set the "ExperienceValue" tag in the entity's NBT data
    this.entity.nbt.set("ExperienceValue", new IntTag(value));
  }

  public onTick(): void {
    // Get the position of the orb
    const position = this.entity.position;

    // Get the players closest to the orb within 8 blocks
    const players = this.dimension.getPlayers({ position, maxDistance: 3 });
    if (players.length === 0 || !players[0]) return;

    // Get the closest player
    const player = players[0] as Player;

    // Check if the player is alive
    if (!player.isAlive) return;

    // Calculate the motion vector towards the player
    const motion = new Vector3f(
      (player.position.x - position.x) * 0.1,
      (player.position.y + player.getCollisionHeight() - position.y) * 0.1,
      (player.position.z - position.z) * 0.1
    );

    // Reduce the speed of the orb
    motion.x *= 0.75;
    motion.y *= 0.75;
    motion.z *= 0.75;

    // Update the entity's motion to move towards the player
    this.entity.addMotion(motion);

    // Check if the orb is within 0.25 blocks of the player
    const distance = position.distance(player.position);
    if (distance < 0.3) {
      // Add the experience to the player
      player.addExperience(this.getExperienceValue());

      // Despawn the orb
      this.entity.despawn();
    }
  }

  public onAdd(): void {
    // Check if the entity has a "ExperienceValue" tag
    if (this.entity.nbt.has("ExperienceValue")) return;

    // Set the "ExperienceValue" tag to 1
    this.entity.nbt.add(new IntTag(1, "ExperienceValue"));
  }

  public onRemove(): void {
    // Remove the "ExperienceValue" tag from the entity
    this.entity.nbt.delete("ExperienceValue");
  }
}

export { EntityXpOrbTrait };
