import { type EntityTrait, CustomEntityType } from "@serenityjs/core";

class PluginEntityRegistry {
  /**
   * The registered custom entity types of the plugin.
   */
  public readonly types: Array<CustomEntityType> = [];

  /**
   * The registered custom entity traits of the plugin.
   */
  public readonly traits: Array<typeof EntityTrait> = [];

  /**
   * Registers a custom entity type.
   * @param type The custom entity type to register.
   * @returns The plugin entity registry.
   * @note Only register types during the `onInitialize` event.
   */
  public registerType(...types: Array<CustomEntityType>): this {
    // Push the type to the types array.
    this.types.push(...types);

    // Return this instance.
    return this;
  }

  /**
   * Unregisters a custom entity type.
   * @param type The custom entity type to unregister.
   * @returns The plugin entity registry.
   */
  public unregisterType(type: CustomEntityType): this {
    // Find the index of the type in the types array.
    const index = this.types.indexOf(type);

    // If the index is not -1, remove the type from the types
    if (index !== -1) this.types.splice(index, 1);

    // Return this instance.
    return this;
  }

  /**
   * Registers a custom entity trait.
   * @param trait The custom entity trait to register.
   * @returns The plugin entity registry.
   * @note Only register traits during the `onInitialize` event.
   */
  public registerTrait(...traits: Array<typeof EntityTrait>): this {
    // Push the trait to the traits array.
    this.traits.push(...traits);

    // Return this instance.
    return this;
  }

  /**
   * Unregisters a custom entity trait.
   * @param trait The custom entity trait to unregister.
   * @returns The plugin entity registry.
   */
  public unregisterTrait(trait: typeof EntityTrait): this {
    // Find the index of the trait in the traits array.
    const index = this.traits.indexOf(trait);

    // If the index is not -1, remove the trait from the traits
    if (index !== -1) this.traits.splice(index, 1);

    // Return this instance.
    return this;
  }
}

export { PluginEntityRegistry };
