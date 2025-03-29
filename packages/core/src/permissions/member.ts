import { Player, PlayerCommandExecutorTrait } from "../entity";
import { IPermissionMember } from "../types";

class PermissionMember implements IPermissionMember {
  public readonly uuid: string;

  public permissions: Array<string>;

  /**
   * The instance of the player if they are present.
   */
  public player: Player | null = null;

  /**
   * Create a new permission member instance.
   * @param uuid The uuid of the member.
   * @param permissions The permissions of the member.
   */
  public constructor(uuid: string, permissions?: Array<string>) {
    // Assign the uuid and permissions
    this.uuid = uuid;
    this.permissions = permissions ?? [];
  }

  /**
   * Check if the member has a permission.
   * @param query The permission to check.
   * @returns True if the member has the permission.
   */
  public has(query: string): boolean {
    return this.permissions.includes(query);
  }

  /**
   * Add a permission to the member.
   * @param permission The permission to add.
   */
  public async add(permission: string): Promise<void> {
    // Add the permission if it does not exist
    if (!this.has(permission)) this.permissions.push(permission);

    // Send the available commands to the player
    const executor = this.player?.getTrait(PlayerCommandExecutorTrait);
    if (executor) await executor.sendAvailableCommands();
  }

  /**
   * Remove a permission from the member.
   * @param permission The permission to remove.
   */
  public async remove(permission: string): Promise<void> {
    // Remove the permission from the member
    this.permissions = this.permissions.filter((x) => x !== permission);

    // Send the available commands to the player
    const executor = this.player?.getTrait(PlayerCommandExecutorTrait);
    if (executor) await executor.sendAvailableCommands();
  }

  public static toObject(member: PermissionMember): IPermissionMember {
    return {
      uuid: member.uuid,
      permissions: member.permissions
    };
  }

  public static fromObject(member: IPermissionMember): PermissionMember {
    return new PermissionMember(member.uuid, member.permissions);
  }
}

export { PermissionMember };
