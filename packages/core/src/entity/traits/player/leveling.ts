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
   * @returns The current experience progress of the player (0-1).
   */
  public getExperienceProgress(): number {
    return this.player.nbt.get<FloatTag>("PlayerLevelProgress")?.valueOf() ?? 0;
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
    this.player.nbt.set("PlayerLevelProgress", new FloatTag(value));
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
    return levelXp + experience
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
   * Adds an amount of experience points to the player.
   * This will automatically calculate and set the player's level and experience progress.
   * @param amount The amount of experience points to add.
   * @returns The total amount of experience points the player has.
   */
  public addExperience(amount: number): number {
    // Get the current experience and level
    let currentXp = this.getExperience();
    currentXp += amount;

    let currentLevel = this.getLevel();
    let xpForNextLevel = 0;

    if (currentLevel >= 31) {
      xpForNextLevel = 9 * currentLevel - 158;
    } else if (currentLevel >= 16) {
      xpForNextLevel = 5 * currentLevel - 38;
    } else {
      xpForNextLevel = 2 * currentLevel + 7;
    }

    while (currentXp >= xpForNextLevel) {
      currentXp -= xpForNextLevel;
      currentLevel++;

      if (currentLevel >= 31) {
        xpForNextLevel = 9 * currentLevel - 158;
      } else if (currentLevel >= 16) {
        xpForNextLevel = 5 * currentLevel - 38;
      } else {
        xpForNextLevel = 2 * currentLevel + 7;
      }
    }

    // Set the new level and experience progress
    this.setLevel(currentLevel);
    this.player.nbt.set("PlayerLevelProgress", new FloatTag(xpForNextLevel > 0 ? currentXp / xpForNextLevel : 0))
    this.refreshAttributes()
    return currentXp
  }

  /**
   * Adds an amount of experience points to the player.
   * This will automatically calculate and set the player's level and experience progress.
   * @param amount The amount of experience points to add.
   *    * @returns The total amount of experience points the player has.
   */
  public removeExperience(amount: number): number {
    // Get the current experience and level
    let currentXp = this.getExperience();
    currentXp -= amount;

    let currentLevel = this.getLevel();

    while (currentXp < 0) {
      currentLevel--;

      if (currentLevel < 0) {
        currentLevel = 0;
        currentXp = 0;
        break;
      }

      let xpForPreviousLevel = 0;
      if (currentLevel >= 31) {
        xpForPreviousLevel = 9 * currentLevel - 158;
      } else if (currentLevel >= 16) {
        xpForPreviousLevel = 5 * currentLevel - 38;
      } else {
        xpForPreviousLevel = 2 * currentLevel + 7;
      }

      currentXp += xpForPreviousLevel;
    }

    // Set the new level and experience progress
    this.setLevel(currentLevel);

    let xpForNextLevel = 0;
    if (currentLevel >= 31) {
      xpForNextLevel = 9 * currentLevel - 158;
    } else if (currentLevel >= 16) {
      xpForNextLevel = 5 * currentLevel - 38;
    } else {
      xpForNextLevel = 2 * currentLevel + 7;
    }

    // Set the new level and experience progress
    this.setLevel(currentLevel);
    this.player.nbt.set("PlayerLevelProgress", new FloatTag(xpForNextLevel > 0 ? currentXp / xpForNextLevel : 0))
    this.refreshAttributes()
    return currentXp
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
  public refreshAttributes(): void {
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
      attribute.current = this.getExperienceProgress();

      // Update the PlayerExperience attribute in the player's attributes
      this.player.attributes.update(attribute);
    } else {
      // Create a new PlayerExperience attribute
      const attribute = Attribute.create(AttributeName.PlayerExperience, 0, 1);

      // Set the current value to the player's experience
      attribute.current = this.getExperienceProgress();

      // Add the PlayerExperience attribute to the player's attributes
      this.player.attributes.add(attribute);
    }
  }
}

export { PlayerLevelingTrait };
