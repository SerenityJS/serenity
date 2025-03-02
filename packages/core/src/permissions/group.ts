import { IPermissionDefinition, IPermissionGroup } from "../types";

class PermissionGroup implements IPermissionGroup<Map<string, Array<string>>> {
  /**
   * The identifier of the permission group.
   */
  public readonly identifier: string;

  /**
   * The permissions within the group and their commands.
   */
  public readonly permissions: Map<string, Array<string>> = new Map();

  /**
   * Create a new permission group instance.
   * @param identifier The identifier of the group.
   * @param permissions The permissions of the group.
   */
  public constructor(
    identifier: string,
    permissions?: Array<IPermissionDefinition>
  ) {
    // Assign the identifier of the group
    this.identifier = identifier;

    // Check if the permissions are defined
    if (permissions) {
      // Iterate over the permissions and add them to the group
      for (const permission of permissions)
        this.permissions.set(permission.identifier, permission.commands);
    }
  }

  /**
   * Create a new permission within the group.
   * @param identifier The identifier of the permission.
   * @param commands The commands that the permission allows.
   * @returns The commands that the permission allows.
   */
  public createPermission(
    identifier: string,
    commands: Array<string> = []
  ): Array<string> {
    // Check if the permission already exists within the group
    if (this.permissions.has(identifier))
      // Throw an error if the permission already exists
      throw new Error(
        `Failed to create permission "${identifier}" as it already exists in the group "${this.identifier}"`
      );

    // Add the permission to the group
    this.permissions.set(identifier, commands);

    // Return the commands
    return commands;
  }

  public static toObject(group: PermissionGroup): IPermissionGroup {
    return {
      identifier: group.identifier,
      permissions: Array.from(group.permissions.entries()).map(
        ([identifier, commands]) => ({
          identifier,
          commands
        })
      )
    };
  }

  public static fromObject(group: IPermissionGroup): PermissionGroup {
    return new PermissionGroup(group.identifier, group.permissions);
  }
}

export { PermissionGroup };
