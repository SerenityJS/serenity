import { BinaryStream } from "@serenityjs/binarystream";
import { CompoundTag, ListTag, TagType } from "@serenityjs/nbt";
import { DataType } from "@serenityjs/raknet";

import type { ItemStack } from "@serenityjs/core";

class TradeOffer extends DataType {
  public buyA: ItemStack;
  public sell: ItemStack;
  public buyB: ItemStack | null;
  public maxUses: number;
  public experienceReward: number;
  public tier: number;
  public traderExperience: number;
  public uses: number;

  public constructor(
    buyA: ItemStack,
    buyB: ItemStack | null,
    sell: ItemStack,
    maxUses: number,
    experienceReward: number,
    tier: number,
    traderExperience: number
  ) {
    super();
    this.buyA = buyA;
    this.buyB = buyB;
    this.sell = sell;
    this.maxUses = maxUses;
    this.experienceReward = experienceReward;
    this.tier = tier;
    this.traderExperience = traderExperience;
    this.uses = 0;
  }

  public static write(stream: BinaryStream, value: Array<TradeOffer>): void {
    const parentTag = new CompoundTag({ name: "offers" });
    const recipesTag = new ListTag({
      listType: TagType.Compound,
      name: "Recipes"
    });

    for (const offer of value) {
      const offerTag = new CompoundTag();
      offerTag.createCompoundTag(this.serializeItem(offer.buyA, "buyA"));
      offerTag.createIntTag({ name: "maxUses", value: offer.maxUses });

      if (offer.buyB) {
        offerTag.addTag(this.serializeItem(offer.buyB, "buyB"));
      }
      offerTag.createByteTag({
        name: "rewardExp",
        value: offer.experienceReward
      });
      offerTag.addTag(this.serializeItem(offer.sell, "sell"));
      offerTag.createIntTag({ name: "tier", value: offer.tier });

      offerTag.createIntTag({
        name: "traderExp",
        value: offer.traderExperience
      });

      offerTag.createIntTag({ name: "uses", value: offer.uses });

      recipesTag.value.push(offerTag);
    }
    parentTag.addTag(recipesTag);
    CompoundTag.write(stream, parentTag, true);
  }

  private static serializeItem(item: ItemStack, tagName: string) {
    const itemTag = new CompoundTag({ name: tagName });
    itemTag.createByteTag({ name: "Count", value: item.amount });
    itemTag.createByteTag({ name: "WasPickedUp", value: 0 });
    itemTag.createShortTag({ name: "Damage", value: 0 });
    itemTag.createStringTag({ name: "Name", value: item.identifier });
    return itemTag;
  }
}

export { TradeOffer };
