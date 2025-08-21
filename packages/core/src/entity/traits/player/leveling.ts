import { Attribute, AttributeName } from "@serenityjs/protocol";
import { FloatTag, IntTag } from "@serenityjs/nbt";

import { PlayerTrait } from "./trait";

class PlayerLevelingTrait extends PlayerTrait {
  public static readonly identifier = "leveling";

  /**
   * Get the current xp level of the player.
   * @returns The current level of the player.
   */
  public getLevel(): number {
    // Get the PlayerLevel tag from the player's NBT
    return this.player.nbt.get<IntTag>("PlayerLevel")?.valueOf() ?? 0;
  }

  /**
   * Set the current xp level of the player.
   * @param value The new level to set for the player.
   * @throws Will throw an error if the level is not a non-negative integer.
   */
  public setLevel(value: number): void {
    // Ensure the level value is a non-negative integer
    if (value < 0 || !Number.isInteger(value)) {
      throw new Error("Level value must be a non-negative integer.");
    }

    // Set the PlayerLevel tag in the player's NBT
    this.player.nbt.set("PlayerLevel", new IntTag(value));

    // Refresh the player's attributes after setting the level
    this.refreshAttributes();
  }

  /**
   * Get the current experience progress of the player.
   * @returns The current experience progress of the player.
   */
  public getExperience(): number {
    // Get the PlayerLevelProgress tag from the player's NBT
    return this.player.nbt.get<FloatTag>("PlayerLevelProgress")?.valueOf() ?? 0;
  }

  /**
   * Set the current experience progress of the player.
   * @param value The new experience progress to set for the player.
   * @throws Will throw an error if the experience value is not between 0 and 1.
   */
  public setExperience(value: number): void {
    // Ensure the experience value is between 0 and 1
    if (value < 0 || value > 1) {
      throw new Error("Experience value must be between 0 and 1.");
    }

    // Set the PlayerLevelProgress tag in the player's NBT
    this.player.nbt.set("PlayerLevelProgress", new FloatTag(value));

    // Refresh the player's attributes after setting the experience
    this.refreshAttributes();
  }

  public onAdd(): void {
    // Check if the player has a PlayerLevel tag
    if (!this.player.nbt.has("PlayerLevel"))
      // Create a new PlayerLevel tag with default value 0
      this.player.nbt.add(new IntTag(0, "PlayerLevel"));

    // Check if the player has a PlayerLevelProgress tag
    if (!this.player.nbt.has("PlayerLevelProgress"))
      // Create a new PlayerLevelProgress tag with default value 0
      this.player.nbt.add(new FloatTag(0, "PlayerLevelProgress"));
  }

  public onRemove(): void {
    // Remove the PlayerLevel and PlayerLevelProgress tags from the player's NBT
    this.player.nbt.delete("PlayerLevel");
    this.player.nbt.delete("PlayerLevelProgress");
  }

  /**
   * Refreshes the player's attributes based on the current level and experience.
   */
  private refreshAttributes(): void {
    // Check if the player has a PlayerLevel attribute
    if (this.player.attributes.has(AttributeName.PlayerLevel)) {
      // Get the PlayerLevel attribute
      const attribute = this.player.attributes.get(
        AttributeName.PlayerLevel
      ) as Attribute;

      // Update the PlayerLevel attribute with the current level
      attribute.current = this.getLevel();

      // Update the PlayerLevel attribute in the player's attributes
      this.player.attributes.update(attribute);
    } else {
      // Create a new PlayerLevel attribute
      const attribute = Attribute.create(AttributeName.PlayerLevel, 0, 3.4e38);

      // Set the current value to the player's level
      attribute.current = this.getLevel();

      // Add the PlayerLevel attribute to the player's attributes
      this.player.attributes.add(attribute);
    }

    // Check if the player has a PlayerExperience attribute
    if (this.player.attributes.has(AttributeName.PlayerExperience)) {
      // Get the PlayerExperience attribute
      const attribute = this.player.attributes.get(
        AttributeName.PlayerExperience
      ) as Attribute;

      // Update the PlayerExperience attribute with the current experience
      attribute.current = this.getExperience();

      // Update the PlayerExperience attribute in the player's attributes
      this.player.attributes.update(attribute);
    } else {
      // Create a new PlayerExperience attribute
      const attribute = Attribute.create(AttributeName.PlayerExperience, 0, 1);

      // Set the current value to the player's experience
      attribute.current = this.getExperience();

      // Add the PlayerExperience attribute to the player's attributes
      this.player.attributes.add(attribute);
    }
  }
}

export { PlayerLevelingTrait };
