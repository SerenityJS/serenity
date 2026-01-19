import { Player } from "../../entity";

interface ItemStackHotbarDetails {
  /**
   * The player whose hotbar this item stack is in.
   */
  player: Player;

  /**
   * The slot index of the item stack in the hotbar.
   */
  slot: number;
}

export { ItemStackHotbarDetails };
