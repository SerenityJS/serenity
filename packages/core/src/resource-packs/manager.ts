import { ResourceManifest } from "../types";

class ResourcePackManager {
  private readonly resourcePacks = new Map<string, any>();

  public constructor(
    public readonly packFolder: string,
    public readonly mustAccept: boolean,
  ) {}
}
