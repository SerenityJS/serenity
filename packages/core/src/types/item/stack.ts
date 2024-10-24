import { World } from "../../world";
import { ItemStackEntry } from "../world";

interface ItemStackProperties {
  amount: number;
  auxillary: number;
  world?: World;
  entry?: ItemStackEntry;
}

export { ItemStackProperties };
