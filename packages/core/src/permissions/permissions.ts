import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { PermissionLevel } from "@serenityjs/protocol";

import { Serenity } from "../serenity";

interface PermissionEntry {
  uuid: string;
  level: PermissionLevel;
}

interface PermissionProperties {
  path: string | null;
  permissions: Array<PermissionEntry>;
}

const DefaultPermissionProperties: PermissionProperties = {
  path: null,
  permissions: []
};

class Permissions extends Map<string, PermissionLevel> {
  /**
   * The serenity instance of the server.
   */
  protected readonly serenity: Serenity;

  /**
   * The path to the permissions file; if it exists.
   */
  public readonly path: string | null = null;

  /**
   * Create a new permissions map.
   * @param serenity The serenity instance of the server.
   * @param path The path to the permissions file.
   */
  public constructor(
    serenity: Serenity,
    permissions: Partial<PermissionProperties>
  ) {
    super();
    this.serenity = serenity;

    // Spread the properties
    const props = { ...DefaultPermissionProperties, ...permissions };

    // Assign the permissions
    for (const permission of props.permissions) {
      this.set(permission.uuid, permission.level);
    }

    // Set the path if it exists
    if (props.path) this.path = props.path;
  }

  public get(key: string): PermissionLevel {
    // Call the original get method
    return super.get(key) ?? PermissionLevel.Member;
  }

  public set(key: string, value: PermissionLevel): this {
    // Call the original set method
    super.set(key, value);

    // Save the permissions to the file
    if (this.path) {
      // Map the permissions
      const permissions = Array.from(this.entries()).map(([uuid, level]) => ({
        uuid,
        level
      }));

      // Write the permissions to the file
      writeFileSync(this.path, JSON.stringify(permissions, null, 2));
    }

    // Return the map
    return this;
  }

  /**
   * Create a new permissions map from a path.
   * @param serenity The serenity instance of the server.
   * @param path The path to the permissions file.
   * @returns
   */
  public static fromPath(serenity: Serenity, path: string): Permissions {
    console.log(resolve(path));

    // Check if the path exists
    if (!existsSync(resolve(path))) {
      // Create a new permissions.json file
      writeFileSync(resolve(path), JSON.stringify([]));
    }

    // Read the permissions file
    const permissions = JSON.parse(
      readFileSync(resolve(path), "utf-8")
    ) as Array<PermissionEntry>;

    // Create a new permissions map
    const map = new Permissions(serenity, { path, permissions });

    // Return the map
    return map;
  }
}

export { Permissions, PermissionEntry };
