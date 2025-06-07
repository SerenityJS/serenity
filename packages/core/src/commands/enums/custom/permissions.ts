import { CustomEnum } from ".";

class PermissionsEnum extends CustomEnum {
  public static readonly identifier = "permission_operation";
  public static readonly options = ["add", "remove", "list"];
}

export { PermissionsEnum };
