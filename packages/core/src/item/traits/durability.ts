import { IntTag } from "@serenityjs/nbt";
import { LevelSoundEvent, LevelSoundEventPacket } from "@serenityjs/protocol";

import { ItemStack, ItemTrait, ItemUseOptions, Player } from "../..";
import { ItemIdentifier, ItemToolTier } from "../../enums";

class ItemDurabilityTrait<T extends ItemIdentifier> extends ItemTrait<T> {
  public static readonly identifier = "durability";
  public static readonly tag = "minecraft:is_tool";

  /**
   * The maximum durability of the item stack.
   */
  public maxDurability: number = 50;

  /**
   * The remaining durability of the item stack.
   */
  public get remainingDurability(): number {
    return this.maxDurability - this.damage;
  }

  /**
   * The amount of damage that the item stack has taken.
   */
  public get damage(): number {
    // Get the Damage tag from the item stack's NBT
    const damage = this.item.nbt.get<IntTag>("Damage");

    // Return the damage value if it exists; otherwise, 0
    return damage?.value ?? 0;
  }

  /**
   * The amount of damage that the item stack has taken.
   */
  public set damage(value: number) {
    // Get the Damage tag from the item stack's NBT
    const damage = this.item.nbt.get<IntTag>("Damage");

    // Set the damage value if the tag exists
    if (damage) {
      // Update the Damage tag with the specified value
      damage.value = value;

      // Update the item stack's NBT
      this.item.nbt.set("Damage", damage);
    } else {
      // Create the Damage tag with the specified value
      this.item.nbt.add(new IntTag({ name: "Damage", value }));
    }
  }

  /**
   * Creates a new instance of the item durability trait.
   * @param item The item stack that this trait will be attached to.
   */
  public constructor(item: ItemStack<T>) {
    super(item);

    // Check for vanilla tool tiers and set the max durability
    switch (item.type.tier) {
      case ItemToolTier.Wooden:
        this.maxDurability = 59;
        break;
      case ItemToolTier.Stone:
        this.maxDurability = 131;
        break;
      case ItemToolTier.Iron:
        this.maxDurability = 250;
        break;
      case ItemToolTier.Gold:
        this.maxDurability = 32;
        break;
      case ItemToolTier.Diamond:
        this.maxDurability = 1561;
        break;
      case ItemToolTier.Netherite:
        this.maxDurability = 2031;
    }
  }

  public onAdd(): void {
    // Check if the item has the Damage tag
    if (!this.item.nbt.has("Damage")) {
      // Create the Damage tag with an initial value of 0
      const damage = new IntTag({ name: "Damage", value: 0 });

      // Set the Damage tag on the item stack's NBT
      this.item.nbt.add(damage);
    }
  }

  public onRemove(): void {
    // Remove the Damage tag from the item stack's NBT
    this.item.nbt.delete("Damage");
  }

  public onUse(
    player: Player,
    options: Partial<ItemUseOptions>
  ): boolean | void {
    // Check if a predicted durability was provided
    if (options.predictedDurability === undefined) return;

    // Check if the predicted durability is less than the current damage
    if (options.predictedDurability === this.damage + 1)
      this.damage = options.predictedDurability;

    // Check if the item stack has reached its maximum durability
    if (this.damage >= this.maxDurability) {
      // Create a new LevelSoundEventPacket for the item stack breaking
      const packet = new LevelSoundEventPacket();
      packet.event = LevelSoundEvent.Break;
      packet.position = player.position;
      packet.actorIdentifier = this.item.identifier;
      packet.data = -1;
      packet.isBabyMob = false;
      packet.isGlobal = false;

      // Broadcast the sound event packet to the player's dimension
      player.dimension.broadcast(packet);

      // Decrement the item stack's amount
      this.item.decrement();
    }
  }
}

export { ItemDurabilityTrait };
