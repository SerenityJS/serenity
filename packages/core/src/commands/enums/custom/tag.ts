import { CustomEnum } from ".";

class TagEnum extends CustomEnum {
  public static readonly identifier = "tag_operation";
  public static readonly options = ["add", "remove", "list"];
}

export { TagEnum };
