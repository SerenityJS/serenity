import { type ItemStackTrait, CustomItemType } from "@serenityjs/core";

class PluginItemRegistry {
  /**
   * The registered custom item types of the plugin.
   */
  public readonly types: Array<CustomItemType> = [];

  /**
   * The registered custom item traits of the plugin.
   */
  public readonly traits: Array<typeof ItemStackTrait> = [];

  /**
   * Registers a custom item type.
   * @param type The custom item type to register.
   * @returns The plugin item registry.
   * @note Only register types during the `onInitialize` event.
   */
  public registerType(...types: Array<CustomItemType>): this {
    // Push the type to the types array.
    this.types.push(...types);

    // Return this instance.
    return this;
  }

  /**
   * Unregisters a custom item type.
   * @param type The custom item type to unregister.
   * @returns The plugin item registry.
   */
  public unregisterType(type: CustomItemType): this {
    // Find the index of the type in the types array.
    const index = this.types.indexOf(type);

    // If the index is not -1, remove the type from the types
    if (index !== -1) this.types.splice(index, 1);

    // Return this instance.
    return this;
  }

  /**
   * Registers a custom item trait.
   * @param trait The custom item trait to register.
   * @returns The plugin item registry.
   * @note Only register traits during the `onInitialize` event.
   */
  public registerTrait(...traits: Array<typeof ItemStackTrait>): this {
    // Push the trait to the traits array.
    this.traits.push(...traits);

    // Return this instance.
    return this;
  }

  /**
   * Unregisters a custom item trait.
   * @param trait The custom item trait to unregister.
   * @returns The plugin item registry.
   */
  public unregisterTrait(trait: typeof ItemStackTrait): this {
    // Find the index of the trait in the traits array.
    const index = this.traits.indexOf(trait);

    // If the index is not -1, remove the trait from the traits
    if (index !== -1) this.traits.splice(index, 1);

    // Return this instance.
    return this;
  }
}

export { PluginItemRegistry };
