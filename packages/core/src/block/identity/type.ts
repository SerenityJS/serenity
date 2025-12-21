import { CompoundTag, ListTag, StringTag } from "@serenityjs/nbt";
import { NetworkBlockTypeDefinition } from "@serenityjs/protocol";
import {
  BLOCK_DROPS,
  BLOCK_METADATA,
  BLOCK_PERMUTATIONS,
  BLOCK_TYPES
} from "@serenityjs/data";

import { BlockIdentifier, BlockMaterialSound } from "../../enums";
import { BlockTypeDefinition, BlockTypeProperties } from "../../types";
import { BlockState } from "../types";

import { ItemDrop } from "./drops";
import { BlockTypeComponentCollection } from "./collection";
import { BlockPermutation } from "./permutation";

import type { BlockTrait } from "../traits";

/**
 * BlockType represents a block type in the game, which hold all possible permutations the block can have.
 * 
 * **Example Usage**
 * ```typescript
	import { BlockType, BlockIdentifier } from "@serenityjs/block"

	// Get the block type for dirt
	const dirtType = BlockType.get(BlockIdentifier.Dirt)

	// Get the identifier of the type
	dirtType.identifier // Expected to be "minecraft:dirt"
 * ```
 */
class BlockType {
  /**
   * A collective registry of all block types.
   */
  public static readonly types = new Map<string, BlockType>();

  // Register all the vanilla block types.
  static {
    // Iterate over the block types.
    for (const type of BLOCK_TYPES) {
      // Check if the block type is already registered.
      if (this.types.has(type.identifier as BlockIdentifier)) {
        throw new Error(`Block type ${type.identifier} is already registered`);
      }

      // Find the block drops for the block type.
      const drop = BLOCK_DROPS.find(
        (drop) => drop.identifier === type.identifier
      );

      // Register the block type.
      const instance = new this(type.identifier as BlockIdentifier, {
        loggable: false,
        air: type.air,
        liquid: type.liquid,
        solid: type.solid,
        tags: type.tags
      });

      // Check if the block type has drops.
      if (drop) {
        for (const entry of drop?.drops ?? []) {
          // Separate the drop information.
          const { identifier, min, max, chance } = entry;

          // Create a new item drop.
          const itemDrop = new ItemDrop(identifier, min, max, chance);

          // Register the item drop to the block type.
          instance.drops.push(itemDrop);
        }
      }
      // Register the default drop for the block type.
      else instance.drops.push(new ItemDrop(type.identifier, 1, 1, 1));

      // Set the block type in the registry.
      this.types.set(type.identifier as BlockIdentifier, instance);
    }

    // Iterate over the block permutations.
    for (const permutation of BLOCK_PERMUTATIONS) {
      // Get the block type from the registry.
      const type = BlockType.types.get(
        permutation.identifier as BlockIdentifier
      );

      // Check if the block type exists.
      if (!type) {
        throw new Error(`Block type ${permutation.identifier} does not exist`);
      }

      // Find the metadata for the block type.
      const metadata = BLOCK_METADATA.find(
        (meta) => meta.identifier === type.identifier
      ) ?? { hardness: 0, friction: 0, mapColor: "" };

      // Create a new block permutation.
      const instance = BlockPermutation.create(type, permutation.state);

      // Assign the block permutation properties.
      instance.components.setHardness(metadata.hardness);
      instance.components.setFriction(metadata.friction);

      // Register the block permutation in the registry.
      BlockPermutation.permutations.set(instance.networkId, instance);
    }
  }

  /**
   * The identifier of the block type.
   */
  public readonly identifier: BlockIdentifier | string;

  /**
   * Whether the block type is loggable.
   */
  public readonly loggable: boolean;

  /**
   * Whether the block type is air.
   */
  public readonly air: boolean;

  /**
   * Whether the block type is liquid.
   */
  public readonly liquid: boolean;

  /**
   * Whether the block type is solid.
   */
  public readonly solid: boolean;

  /**
   * The default item drops of the block type.
   */
  public readonly drops: Array<ItemDrop> = [];

  /**
   * The default permutations of the block type.
   */
  public readonly permutations: Array<BlockPermutation> = [];

  /**
   * The state values of the block type.
   */
  public readonly states: Array<string> = [];

  /**
   * The nbt properties definition of the block type.
   * This contains the vanilla component definitions.
   */
  public readonly properties: BlockTypeDefinition;

  /**
   * The traitsthat are bound to the block type.
   * These traits are used to define custom behavior for the block type.
   */
  public readonly traits = new Map<string, typeof BlockTrait>();

  /**
   * The vanilla components of the block permutation. (hardness, friction, lighting, etc.)
   * These components are active on the client-end when the query condition is met.
   * These components will be used gobally for all permutations, unless a permutation has a definition that overrides it.
   */
  public get components(): BlockTypeComponentCollection {
    // Check if the block type contains the components tag.
    if (this.properties.has("components")) {
      // Get the components tag from the block type.
      const components = this.properties.get<CompoundTag>("components");

      // Check if the components is instance of the component collection.
      if (components instanceof BlockTypeComponentCollection) return components;

      // Create the new component collection.
      const collection = new BlockTypeComponentCollection(this);

      // Assign the components to the collection.
      collection.push(...(components?.values() ?? []));

      // Set the components tag to the block type.
      this.properties.set("components", collection);

      // Return the component collection.
      return collection;
    }

    // Create the components tag.
    const collection = new BlockTypeComponentCollection(this);

    // Add the components tag to the block type.
    this.properties.add(collection);

    // Return the components tag.
    return collection;
  }

  /**
   * Whether the block type is component based.
   * This is determined by the presence of any components in the block type.
   */
  public get isComponentBased(): boolean {
    return this.components.size > 0;
  }

  /**
   * Create a new block type.
   * @param identifier The identifier of the block type.
   * @param properties The properties of the block type.
   */
  public constructor(
    identifier: BlockIdentifier | string,
    properties?: Partial<BlockTypeProperties>
  ) {
    // Assign the identifier of the block type.
    this.identifier = identifier;

    // Assign the properties to the block type.
    this.loggable = properties?.loggable ?? false;
    this.air = properties?.air ?? false;
    this.liquid = properties?.liquid ?? false;
    this.solid = properties?.solid ?? false;
    this.properties = properties?.properties ?? new CompoundTag();

    // Assign the block type tags to the block type.
    if (properties?.tags) this.setTags(properties.tags);
  }

  /**
   * Get the permutation of the block type.
   * @param state The state of the block type.
   */
  public getPermutation(state?: BlockState): BlockPermutation {
    // Iterate over the permutations.
    for (const permutation of this.permutations) {
      // Check if the permutation matches the state.
      if (!state || permutation.matches(state as BlockState)) {
        return permutation as BlockPermutation;
      }
    }

    // Return the default permutation if the state is not found.
    return this.permutations[0] as BlockPermutation;
  }

  /**
   * Gets the network definition of the block type, which is used to send the block type to the client.
   * @returns The network block type definition.
   */
  public getNetworkDefinition(): NetworkBlockTypeDefinition {
    return new NetworkBlockTypeDefinition(this.identifier, this.properties);
  }

  /**
   * Register a trait to the block type.
   * @param trait The trait to register.
   * @returns The block type instance.
   */
  public registerTrait(trait: typeof BlockTrait): this {
    // Check if the trait is already registered.
    if (this.traits.has(trait.identifier)) return this;

    // Add the trait to the block type.
    this.traits.set(trait.identifier, trait);

    // Return this instance.
    return this;
  }

  /**
   * Unregister a trait from the block type.
   * @param trait The trait to unregister.
   * @returns The block type instance.
   */
  public unregisterTrait(trait: string | typeof BlockTrait): this {
    // Get the identifier of the trait.
    const identifier = typeof trait === "string" ? trait : trait.identifier;

    // Check if the trait is not registered.
    if (!this.traits.has(identifier)) return this;

    // Remove the trait from the block type.
    this.traits.delete(identifier);

    // Return this instance.
    return this;
  }

  /**
   * Get the tags of the block type.
   * @returns An array of tags.
   */
  public getTags(): Array<string> {
    // Check if the block type properties has the block tags tag.
    if (!this.properties.has("blockTags")) {
      // If not, create the block tags tag.
      const blockTags = new ListTag<StringTag>([], "blockTags");

      // Add the block tags tag to the properties.
      this.properties.add(blockTags);
    }

    // Get the block tags tag from the block type properties.
    const tags = this.properties.get<ListTag<StringTag>>("blockTags") ?? [];

    // Map the tags to the list.
    return tags.map((tag) => tag.valueOf());
  }

  /**
   * Set the tags of the block type.
   * @param tags The tags to set.
   * @returns The block type instance.
   */
  public setTags(tags: Array<string>): this {
    // Create the block tags tag for the properties.
    const blockTags = new ListTag<StringTag>([], "blockTags");

    // Iterate over the tags and add them to the block tags tag.
    for (const tag of tags) blockTags.push(new StringTag(tag));

    // Set the block tags tag to the block type properties.
    this.properties.set("blockTags", blockTags);

    // Return this instance.
    return this;
  }

  /**
   * Add tags to the block type.
   * @param tags The tags to add.
   * @returns The block type instance.
   */
  public addTag(...tags: Array<string>): this {
    // Check if the block type properties has the block tags tag.
    if (!this.properties.has("blockTags")) {
      // Create the block tags tag.
      const blockTags = new ListTag<StringTag>([], "blockTags");

      // Add the block tags tag to the properties.
      this.properties.add(blockTags);
    }

    // Get the block tags tag from the block type properties.
    const tagsList = this.properties.get<ListTag<StringTag>>("blockTags")!;

    // Add the tags to the list.
    for (const tag of tags) {
      // Check if the tag is already in the list.
      if (tagsList.some((t) => t.valueOf() === tag)) continue;

      // Add the tag to the list.
      tagsList.push(new StringTag(tag));
    }

    // Return this instance.
    return this;
  }

  /**
   * Remove tags from the block type.
   * @param tags The tags to remove.
   * @returns The block type instance.
   */
  public removeTag(...tags: Array<string>): this {
    // Check if the block type properties has the block tags tag.
    if (!this.properties.has("blockTags")) {
      // If not, create the block tags tag.
      const blockTags = new ListTag<StringTag>([], "blockTags");

      // Add the block tags tag to the properties.
      this.properties.add(blockTags);
    }

    // Get the block tags tag from the block type properties.
    const tagsList = this.properties.get<ListTag<StringTag>>("blockTags")!;

    // Filter our the tags that are not in the list.
    const filteredTags = tagsList.filter(
      (tag) => !tags.some((t) => t === tag.valueOf())
    );

    // Set the filtered tags to the block tags tag.
    this.properties.set(
      "blockTags",
      new ListTag<StringTag>(filteredTags, "blockTags")
    );

    // Return this instance.
    return this;
  }

  /**
   * Check if the block type has a tag.
   * @param tag The tag to check.
   * @returns True if the block type has the tag, false otherwise.
   */
  public hasTag(tag: string): boolean {
    // Check if the block type properties has the block tags tag.
    return this.getTags().includes(tag);
  }

  /**
   * Checks if the block type requires a pickaxe to be mined.
   * @note This method evaluates if the block type has the "*_pick_diggable" tag.
   * @returns True if the block type requires a pickaxe, false otherwise.
   */
  public requiresPickaxe(): boolean {
    // Get the tags of the block type.
    const tags = this.getTags();

    // Check if the block type has the pickaxe diggable tags.
    return (
      tags.includes("stone") ||
      tags.includes("wooden_pick_diggable") ||
      tags.includes("stone_pick_diggable") ||
      tags.includes("copper_pick_diggable") ||
      tags.includes("iron_pick_diggable") ||
      tags.includes("gold_pick_diggable") ||
      tags.includes("diamond_pick_diggable") ||
      tags.includes("netherite_pick_diggable")
    );
  }

  /**
   * Checks if the block type is destructible with a pickaxe.
   * This applies a speed boost to the pickaxe when mining the block.
   * @note This method evaluates if the block type has the "minecraft:is_pickaxe_item_destructible" tag.
   * @returns True if the block type is destructible with a pickaxe, false otherwise.
   */
  public destructibleWithPickaxe(): boolean {
    // Check if the block type has the pickaxe destructible tag.
    return this.getTags().includes("minecraft:is_pickaxe_item_destructible");
  }

  /**
   * Checks if the block type requires a shovel to be mined.
   * @note This method evaluates if the block type has the "*_shovel_diggable" tag.
   * @returns True if the block type requires a shovel, false otherwise.
   */
  public requiresShovel(): boolean {
    // Get the tags of the block type.
    const tags = this.getTags();

    // Check if the block type has the shovel diggable tags.
    return (
      tags.includes("wooden_shovel_diggable") ||
      tags.includes("stone_shovel_diggable") ||
      tags.includes("copper_shovel_diggable") ||
      tags.includes("iron_shovel_diggable") ||
      tags.includes("gold_shovel_diggable") ||
      tags.includes("diamond_shovel_diggable") ||
      tags.includes("netherite_shovel_diggable")
    );
  }

  /**
   * Checks if the block type is destructible with a shovel.
   * This applies a speed boost to the shovel when mining the block.
   * @note This method evaluates if the block type has the "minecraft:is_shovel_item_destructible" tag.
   * @returns True if the block type is destructible with a shovel, false otherwise.
   */
  public destructibleWithShovel(): boolean {
    // Check if the block type has the shovel destructible tag.
    return this.getTags().includes("minecraft:is_shovel_item_destructible");
  }

  /**
   * Checks if the block type requires an axe to be mined.
   * @note This method evaluates if the block type has the "*_axe_diggable" tag.
   * @returns True if the block type requires an axe, false otherwise.
   */
  public requiresAxe(): boolean {
    // Get the tags of the block type.
    const tags = this.getTags();

    // Check if the block type has the axe diggable tags.
    return (
      tags.includes("wooden_axe_diggable") ||
      tags.includes("stone_axe_diggable") ||
      tags.includes("copper_axe_diggable") ||
      tags.includes("iron_axe_diggable") ||
      tags.includes("gold_axe_diggable") ||
      tags.includes("diamond_axe_diggable") ||
      tags.includes("netherite_axe_diggable")
    );
  }

  /**
   * Checks if the block type is destructible with an axe.
   * This applies a speed boost to the axe when mining the block.
   * @note This method evaluates if the block type has the "minecraft:is_axe_item_destructible" tag.
   * @returns True if the block type is destructible with an axe, false otherwise.
   */
  public destructibleWithAxe(): boolean {
    // Check if the block type has the axe destructible tag.
    return this.getTags().includes("minecraft:is_axe_item_destructible");
  }

  /**
   * Checks if the block type requires a hoe to be mined.
   * @note This method evaluates if the block type has the "*_hoe_diggable" tag.
   * @returns True if the block type requires a hoe, false otherwise.
   */
  public requiresHoe(): boolean {
    // Get the tags of the block type.
    const tags = this.getTags();

    // Check if the block type has the hoe diggable tags.
    return (
      tags.includes("wooden_hoe_diggable") ||
      tags.includes("stone_hoe_diggable") ||
      tags.includes("copper_hoe_diggable") ||
      tags.includes("iron_hoe_diggable") ||
      tags.includes("gold_hoe_diggable") ||
      tags.includes("diamond_hoe_diggable") ||
      tags.includes("netherite_hoe_diggable")
    );
  }

  /**
   * Checks if the block type is destructible with a hoe.
   * This applies a speed boost to the hoe when mining the block.
   * @note This method evaluates if the block type has the "minecraft:is_hoe_item_destructible" tag.
   * @returns True if the block type is destructible with a hoe, false
   */
  public destructibleWithHoe(): boolean {
    // Check if the block type has the hoe destructible tag.
    return this.getTags().includes("minecraft:is_hoe_item_destructible");
  }

  /**
   * Checks if the block type requires a sword to be mined.
   * @note This method evaluates if the block type has the "*_sword_diggable" tag.
   * @returns True if the block type requires a sword, false otherwise.
   */
  public requiresSword(): boolean {
    // Get the tags of the block type.
    const tags = this.getTags();

    // Check if the block type has the sword diggable tags.
    return (
      tags.includes("wooden_sword_diggable") ||
      tags.includes("stone_sword_diggable") ||
      tags.includes("copper_sword_diggable") ||
      tags.includes("iron_sword_diggable") ||
      tags.includes("gold_sword_diggable") ||
      tags.includes("diamond_sword_diggable") ||
      tags.includes("netherite_sword_diggable")
    );
  }

  /**
   * Checks if the block type is destructible with a sword.
   * This applies a speed boost to the sword when mining the block.
   * @note This method evaluates if the block type has the "minecraft:is_sword_item_destructible" tag.
   * @returns True if the block type is destructible with a sword, false otherwise.
   */
  public destructibleWithSword(): boolean {
    // Check if the block type has the sword destructible tag.
    return this.getTags().includes("minecraft:is_sword_item_destructible");
  }

  /**
   * Check if the block type has any requirements to be mined.
   * @returns True if the block type has any requirements, false otherwise.
   */
  public hasRequirements(): boolean {
    return (
      this.requiresPickaxe() ||
      this.requiresShovel() ||
      this.requiresAxe() ||
      this.requiresHoe() ||
      this.requiresSword()
    );
  }

  /**
   * Gets the material sound of the block type.
   * @returns The material sound of the block type.
   */
  public getMaterialSound(): BlockMaterialSound {
    // Get the "vanilla_block_data" compound tag.
    const data = this.properties.get<CompoundTag>("vanilla_block_data");

    // Check if the data tag exists.
    if (!data) {
      throw new Error(
        "Custom block type does not have a vanilla block data tag."
      );
    }

    // Get the material sound from the data tag.
    const material = data.get<StringTag>("material");

    // Check if the material sound exists.
    if (!material) {
      throw new Error("Custom block type does not have a material sound.");
    }

    // Return the material sound as a BlockMaterialSound enum value.
    return material.valueOf() as BlockMaterialSound;
  }

  /**
   * Get the material sound of the block type.
   * @param sound The material sound to set for the block type.
   */
  public setMaterialSound(sound: BlockMaterialSound): void {
    // Get the "vanilla_block_data" compound tag.
    const data = this.properties.get<CompoundTag>("vanilla_block_data");

    // Check if the data tag exists.
    if (!data) {
      throw new Error(
        "Custom block type does not have a vanilla block data tag."
      );
    }

    // Set the material sound in the data tag.
    data.add(new StringTag(sound, "material"));
  }

  /**
   * Get the block type from the registry.
   */
  public static get(identifier: BlockIdentifier | string): BlockType {
    // Get the block type from the registry.
    const type = BlockType.types.get(identifier as BlockIdentifier);

    // Check if the block type exists.
    if (!type) return this.get(BlockIdentifier.Air) as BlockType;

    // Return the block type.
    return type as BlockType;
  }

  /**
   * Get all block types from the registry.
   */
  public static getAll(): Array<BlockType> {
    return [...BlockType.types.values()];
  }
}

export { BlockType };
