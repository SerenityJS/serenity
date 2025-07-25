import { BinaryStream } from "@serenityjs/binarystream";
import { CompoundTag, ListTag, TagType } from "@serenityjs/nbt";
import { DataType } from "@serenityjs/raknet";

class TradeOffer extends DataType {
  public buyA: CompoundTag;
  public sell: CompoundTag;
  public buyB: CompoundTag | null;
  public maxUses: number;
  public experienceReward: number;
  public tier: number;
  public traderExperience: number;
  public uses: number;

  public constructor(
    buyA: CompoundTag,
    buyB: CompoundTag | null,
    sell: CompoundTag,
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

  public static write(stream: BinaryStream, _value: Array<TradeOffer>): void {
    const parentTag = new CompoundTag("offers");
    const _recipesTag = new ListTag<CompoundTag>([], "Recipes");

    // for (const offer of value) {
    //   const offerTag = new CompoundTag();
    //   offerTag.createCompoundTag(offer.buyA);
    //   offerTag.createIntTag({ name: "maxUses", value: offer.maxUses });

    //   if (offer.buyB) {
    //     offerTag.addTag(offer.buyB);
    //   }
    //   offerTag.createByteTag({
    //     name: "rewardExp",
    //     value: offer.experienceReward
    //   });
    //   offerTag.addTag(offer.sell);
    //   offerTag.createIntTag({ name: "tier", value: offer.tier });

    //   offerTag.createIntTag({
    //     name: "traderExp",
    //     value: offer.traderExperience
    //   });

    //   offerTag.createIntTag({ name: "uses", value: offer.uses });

    //   recipesTag.value.push(offerTag);
    // }
    // parentTag.addTag(recipesTag);
    CompoundTag.write(stream, parentTag, {
      name: true,
      type: true,
      varint: true
    });
  }
}

export { TradeOffer };
