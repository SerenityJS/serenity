import { ActorFlag } from "@serenityjs/protocol";

import { EntityTrait } from "../trait";

class EntityFlagTrait extends EntityTrait {
  /**
   * The actor flag associated with the traits
   */
  public flag!: ActorFlag;

  /**
   * The default value of the flag
   */
  public defaultValue!: boolean;

  /**
   * Get the current value of the flag
   * @returns Whether the flag is enabled or not
   */
  public get(): boolean {
    // Get the component value from the entity
    return this.entity.components.get(this.identifier) as boolean;
  }

  /**
   * Set the current value of the flag
   * @param value Whether the flag is enabled or not
   * @param update Whether to update the entity's actor data; default is true
   */
  public set(value: boolean, update = true): void {
    // Update the component value
    this.entity.components.set(this.identifier, value);

    // Update the entity flag
    this.entity.flags.set(this.flag, value);

    // Update the entity's actor data
    if (update) this.entity.updateActorData();
  }

  public onSpawn(): void {
    // Check if the entity has the component
    if (this.entity.components.has(this.identifier)) {
      // Get the component value from the entity
      const enabled = this.entity.components.get(this.identifier) as boolean;

      // Set the entity flag
      this.set(enabled, false);
    } else {
      // Set the component value to the default value
      this.set(this.defaultValue, false);
    }
  }
}

export { EntityFlagTrait };
