import { ItemUseOnEntityInventoryTransactionType } from "@serenityjs/protocol";

enum EntityInteractMethod {
  Interact = ItemUseOnEntityInventoryTransactionType.Interact,
  Attack = ItemUseOnEntityInventoryTransactionType.Attack
}

export { EntityInteractMethod };
