import { ContainerId, ContainerType, EquipmentSlot } from "@serenityjs/protocol";
import { EntityContainer } from "../../container";
import { EntityComponent } from "./entity-component";
import type { Entity } from "../../entity";
import { ItemStack } from "../../item";
import { ItemIdentifier } from "@serenityjs/item";

class EntityArmorComponent extends EntityComponent {
  public static readonly identifier = "minecraft:armor";
  public readonly container: EntityContainer;

  public constructor(entity: Entity) {
    super(entity, EntityArmorComponent.identifier);
    this.container = new EntityContainer(entity, ContainerType.Armor, ContainerId.Armor, 4);
  }

  public getAll(): ItemStack[] {
    return this.container.storage.map((item) => (!item ? new ItemStack(ItemIdentifier.Air, 1) : item));
  }

  public setEquipment(slot: EquipmentSlot, itemStack: ItemStack): void {
    return this.container.setItem(slot, itemStack);
  }

  public getEquipment(slot: EquipmentSlot): ItemStack | null {
    return this.container.getItem(slot);
  }
}

export { EntityArmorComponent };
