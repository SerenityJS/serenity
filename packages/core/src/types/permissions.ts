interface IPermissionMember {
  /**
   * The uuid of the member.
   */
  readonly uuid: string;

  /**
   * The permissions of the member.
   */
  readonly permissions: Array<string>;
}

interface IPermissionDefinition {
  /**
   * The identifier of the permission.
   */
  readonly identifier: string;

  /**
   * The commands of the permission.
   */
  readonly commands: Array<string>;
}

interface IPermissionGroup<T = Array<IPermissionDefinition>> {
  /**
   * The identifier of the permission group.
   */
  readonly identifier: string;

  /**
   * The permissions within the group.
   */
  readonly permissions: T;
}

interface IPermissions<G = IPermissionGroup, M = IPermissionMember> {
  /**
   * The permission groups.
   */
  readonly groups: Array<G>;

  /**
   * The permission members.
   */
  readonly members: Array<M>;
}

export {
  IPermissionMember,
  IPermissionDefinition,
  IPermissionGroup,
  IPermissions
};
