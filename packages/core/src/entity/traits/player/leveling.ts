import { Attribute, AttributeName } from "@serenityjs/protocol";
import { FloatTag, IntTag } from "@serenityjs/nbt";

import { PlayerDropExperienceSignal } from "../../../events";

import { PlayerTrait } from "./trait";

class PlayerLevelingTrait extends PlayerTrait {
  public static readonly identifier = "leveling";

  /**
   * Get the current xp level of the player.
   * @returns The current level of the player.
   */
  public getLevel(): number {
    // Get the PlayerLevel tag from the player's NBT
    return this.player.getStorageEntry<IntTag>("PlayerLevel")?.valueOf() ?? 0;
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
    this.player.setStorageEntry("PlayerLevel", new IntTag(value));

    // Refresh the player's attributes after setting the level
    this.refreshAttributes();
  }

  /**
   * Get the current experience progress of the player.
   * @returns The current experience progress of the player (0-1).
   */
  public getExperienceProgress(): number {
    return (
      this.player.getStorageEntry<FloatTag>("PlayerLevelProgress")?.valueOf() ??
      0
    );
  }

  /**
   * Set the current experience progress of the player.
   * @param value The new experience progress to set for the player.
   * @throws Experience progress value must be between 0-1.
   */
  public setExperienceProgress(value: number): void {
    if (value < 0 || value > 1) {
      throw new Error("Experience progress must be between 0 and 1.");
    }
    this.player.setStorageEntry("PlayerLevelProgress", new FloatTag(value));
    this.refreshAttributes();
  }

  /**
   * Gets the amount of experience points the player has in their current level.
   * @returns The amount of experience points.
   */
  public getExperience(): number {
    const currentLevel = this.getLevel();
    const progress = this.getExperienceProgress();
    let xpForNextLevel = 0;

    if (currentLevel >= 31) {
      xpForNextLevel = 9 * currentLevel - 158;
    } else if (currentLevel >= 16) {
      xpForNextLevel = 5 * currentLevel - 38;
    } else {
      xpForNextLevel = 2 * currentLevel + 7;
    }

    return Math.round(progress * xpForNextLevel);
  }

  /**
   * Gets the total amount of experience points the player has.
   * @returns The total amount of experience points.
   */
  public getTotalXp(): number {
    const levelXp = this.getTotalExperienceForLevel(this.getLevel());
    const experience = this.getExperience();

    // Level XP + experience = total experience.
    return levelXp + experience;
  }

  /**
   * Sets the total experience points of the player.
   * This will automatically calculate and set the player's level and experience progress.
   * @param amount The total amount of experience points to set.
   */
  public setExperience(amount: number): void {
    if (amount < 0) {
      throw new Error("Experience points cannot be negative.");
    }

    // Prepare variables for level calculation.
    let level = 0;

    // Find the player's level based on the total experience points.
    while (this.getTotalExperienceForLevel(level + 1) <= amount) {
      level++;
    }

    // Get the total XP required for the calculated level.
    const xpForCurrentLevel = this.getTotalExperienceForLevel(level);

    // Get the remaining XP points.
    const remainingXp = amount - xpForCurrentLevel;

    // Calculate how much XP is needed for the next level up.
    let xpForNextLevel = 0;
    if (level >= 31) {
      xpForNextLevel = 9 * level - 158;
    } else if (level >= 16) {
      xpForNextLevel = 5 * level - 38;
    } else {
      xpForNextLevel = 2 * level + 7;
    }

    // Set the player's level.
    this.setLevel(level);

    // Calculate and set the experience progress.
    const progress = xpForNextLevel > 0 ? remainingXp / xpForNextLevel : 0;
    this.setExperienceProgress(progress);
  }

  /**
   * Calculates the total experience needed to reach a certain level.
   * @param level The level to calculate the total experience for.
   * @returns Total xp required.
   */
  private getTotalExperienceForLevel(level: number): number {
    if (level <= 16) {
      return level ** 2 + 6 * level;
    } else if (level <= 31) {
      return 2.5 * level ** 2 - 40.5 * level + 360;
    } else {
      return 4.5 * level ** 2 - 162.5 * level + 2220;
    }
  }

  public onAdd(): void {
    // Check if the player has a PlayerLevel tag
    if (!this.player.hasStorageEntry("PlayerLevel"))
      // Create a new PlayerLevel tag with default value 0
      this.player.addStorageEntry(new IntTag(0, "PlayerLevel"));

    // Check if the player has a PlayerLevelProgress tag
    if (!this.player.hasStorageEntry("PlayerLevelProgress"))
      // Create a new PlayerLevelProgress tag with default value 0
      this.player.addStorageEntry(new FloatTag(0, "PlayerLevelProgress"));
  }

  public onRemove(): void {
    // Remove the PlayerLevel and PlayerLevelProgress tags from the player's NBT
    this.player.removeStorageEntry("PlayerLevel");
    this.player.removeStorageEntry("PlayerLevelProgress");
  }

  public onDeath(): void {
    // Check if keep inventory is enabled, if so, do not reset level or experience
    if (this.player.world.gamerules.keepInventory === true) return;

    // Calculate the amount of xp orbs to spawn
    let experience =
      this.getTotalExperienceForLevel(this.getLevel()) + this.getExperience();

    // Calculate the number of orbs to spawn (based on 150 xp per orb)
    const orbCount = Math.floor(experience / 150) + 1;

    // Get the player's position
    const position = this.player.position;

    // Iterate and spawn the xp orbs
    for (let i = 0; i < orbCount; i++) {
      // Calculate the amount of xp for the orb (maximum 150 xp per orb)
      const xp = Math.min(150, experience);

      // Create a new PlayerDropExperienceSignal
      const signal = new PlayerDropExperienceSignal(this.player, xp);

      // Emit the signal and check if it was cancelled
      if (!signal.emit()) continue;

      // Spawn the xp orb entity in the dimension
      this.dimension.spawnExperienceOrb(signal.amount, position);

      // Decrement the remaining experience
      experience -= signal.amount;
    }

    // Reset the players level and progress
    this.setLevel(0);
    this.setExperienceProgress(0);

    // Set the player's level and experience to 0
    this.setExperience(experience);
  }

  /**
   * Refreshes the player's attributes based on the current level and experience.
   */
  private refreshAttributes(): void {
    // Check if the player has a PlayerLevel attribute
    if (this.player.attributes.hasAttribute(AttributeName.PlayerLevel)) {
      // Get the PlayerLevel attribute
      const attribute = this.player.attributes.getAttribute(
        AttributeName.PlayerLevel
      ) as Attribute;

      // Update the PlayerLevel attribute with the current level
      attribute.current = this.getLevel();

      // Update the PlayerLevel attribute in the player's attributes
      this.player.attributes.setAttribute(attribute);
    } else {
      // Create a new PlayerLevel attribute
      const attribute = Attribute.create(AttributeName.PlayerLevel, 0, 3.4e38);

      // Set the current value to the player's level
      attribute.current = this.getLevel();

      // Add the PlayerLevel attribute to the player's attributes
      this.player.attributes.setAttribute(attribute);
    }

    // Check if the player has a PlayerExperience attribute
    if (this.player.attributes.hasAttribute(AttributeName.PlayerExperience)) {
      // Get the PlayerExperience attribute
      const attribute = this.player.attributes.getAttribute(
        AttributeName.PlayerExperience
      ) as Attribute;

      // Update the PlayerExperience attribute with the current experience
      attribute.current = this.getExperienceProgress();

      // Update the PlayerExperience attribute in the player's attributes
      this.player.attributes.setAttribute(attribute);
    } else {
      // Create a new PlayerExperience attribute
      const attribute = Attribute.create(AttributeName.PlayerExperience, 0, 1);

      // Set the current value to the player's experience
      attribute.current = this.getExperienceProgress();

      // Add the PlayerExperience attribute to the player's attributes
      this.player.attributes.setAttribute(attribute);
    }
  }
}

export { PlayerLevelingTrait };
