import {
  ByteTag,
  CompoundTag,
  FloatTag,
  IntTag,
  ListTag,
  StringTag
} from "@serenityjs/nbt";
import { AbilityIndex, Vector3f } from "@serenityjs/protocol";

import { Player } from "../player";

import { EntityLevelStorage } from "./entity";

class PlayerLevelStorage extends EntityLevelStorage {
  public constructor(player: Player, source?: CompoundTag) {
    super(player); // Pass the player as the entity

    // If a source is provided, copy its contents
    if (source) this.push(...source.values());

    // Load dynamic properties from the source if available
    const properties = this.get<ListTag<CompoundTag>>(
      EntityLevelStorage.DYNAMIC_PROPERTIES_KEY
    );

    // Check if properties exist
    if (properties) {
      // Populate the dynamic properties map
      for (const property of properties.values()) {
        // Get the identifier of the property
        const identifier = property.get<StringTag>("identifier");

        // If the identifier exists, add the property to the map
        if (identifier)
          this.dynamicProperties.set(identifier.valueOf(), property);
      }
    }
  }

  /**
   * Set the position of the player.
   * @param position The new position to set for the player.
   */
  public override setPosition(position: Vector3f): void {
    // Create a new ListTag for the position
    const posTag = new ListTag<FloatTag>(
      [
        new FloatTag(position.x),
        new FloatTag(position.y),
        new FloatTag(position.z)
      ],
      "Pos"
    );

    // Set the Pos tag in the storage
    this.set("Pos", posTag);
  }

  public getAbilities(): Array<[AbilityIndex, boolean]> {
    // Get the abilities list from the storage
    const abilities = this.get<ListTag<CompoundTag>>("abilities");

    // If the abilities list does not exist, return an empty array
    if (!abilities) return [];

    // Prepare an array to hold the ability tuples
    const abilityTuples: Array<[AbilityIndex, boolean]> = [];

    // Iterate through each ability in the list
    for (const ability of abilities) {
      // Get the ability index and value from the ability tag
      const index = ability.get<IntTag>("index");
      const value = ability.get<ByteTag>("value");

      // If both index and value exist, add them as a tuple to the array
      if (index && value) {
        abilityTuples.push([index.valueOf(), value.valueOf() === 1]);
      }
    }

    // Return the array of ability tuples
    return abilityTuples;
  }

  public setAbilities(abilities: Array<[AbilityIndex, boolean]>): void {
    // Create a new list tag for abilities
    const abilityList = new ListTag<CompoundTag>([], "abilities");

    // Iterate through each ability tuple
    for (const [index, value] of abilities) {
      // Create a new compound tag for the ability
      const abilityTag = new CompoundTag();

      // Set the index and value in the ability tag
      abilityTag.set("index", new IntTag(index, "index"));
      abilityTag.set("value", new ByteTag(value ? 1 : 0, "value"));

      // Add the ability tag to the list
      abilityList.push(abilityTag);
    }

    // Set the abilities list in the storage
    this.set("abilities", abilityList);
  }
}

export { PlayerLevelStorage };
