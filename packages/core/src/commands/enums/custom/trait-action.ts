import { CustomEnum } from "./custom";

class TraitActionEnum extends CustomEnum {
  public static readonly identifier = "trait-action";
  public static readonly options = ["add", "remove", "list"];
}

export { TraitActionEnum };
