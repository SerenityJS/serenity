import { type BlockTrait, CustomBlockType } from "@serenityjs/core";

class PluginBlockRegistry {
  /**
   * The registered custom block types of the plugin.
   */
  public readonly types: Array<CustomBlockType> = [];

  /**
   * The registered custom block traits of the plugin.
   */
  public readonly traits: Array<typeof BlockTrait> = [];

  /**
   * Registers a custom block type.
   * @param type The custom block type to register.
   * @returns The plugin block registry.
   * @note Only register types during the `onInitialize` event.
   */
  public registerType(...types: Array<CustomBlockType>): this {
    // Push the type to the types array.
    this.types.push(...types);

    // Return this instance.
    return this;
  }

  /**
   * Unregisters a custom block type.
   * @param type The custom block type to unregister.
   * @returns The plugin block registry.
   */
  public unregisterType(type: CustomBlockType): this {
    // Find the index of the type in the types array.
    const index = this.types.indexOf(type);

    // If the index is not -1, remove the type from the types
    if (index !== -1) this.types.splice(index, 1);

    // Return this instance.
    return this;
  }

  /**
   * Registers a custom block trait.
   * @param trait The custom block trait to register.
   * @returns The plugin block registry.
   * @note Only register traits during the `onInitialize` event.
   */
  public registerTrait(...traits: Array<typeof BlockTrait>): this {
    // Push the trait to the traits array.
    this.traits.push(...traits);

    // Return this instance.
    return this;
  }

  /**
   * Unregisters a custom block trait.
   * @param trait The custom block trait to unregister.
   * @returns The plugin block registry.
   */
  public unregisterTrait(trait: typeof BlockTrait): this {
    // Find the index of the trait in the traits array.
    const index = this.traits.indexOf(trait);

    // If the index is not -1, remove the trait from the traits
    if (index !== -1) this.traits.splice(index, 1);

    // Return this instance.
    return this;
  }
}

export { PluginBlockRegistry };
