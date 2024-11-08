import { PackType } from "@serenityjs/protocol";
import { ResourceManifest } from "../types";

class ResourcePack {
  // TODO: Make this configurable
  public static readonly MAX_CHUNK_SIZE = 1024 * 256; // 256 bytes for now

  public compressedData!: Buffer; // The compressed ZIP file
  public originalSize!: bigint; // The original combined size of the resource pack

  // These could all be replaced by JS getters, but it's shorter this way
  public readonly version: string;
  public readonly name: string;
  public readonly packType: PackType = PackType.Resources;
  public readonly isRtx: boolean;
  public readonly hasScripts: boolean = false;

  // Encryption key for contents.json
  public readonly contentKey: string = "";

  public constructor(
    public readonly uuid: string,
    public readonly path: string,
    public readonly manifest: ResourceManifest,
    public readonly selectedSubpack: string,
    //private readonly zippedPack:
  ) {
    this.name = this.manifest.header.name;
    this.isRtx = this.manifest.capabilities?.includes("raytraced") ?? false;

    this.version =
      typeof this.manifest.header.version === "string"
        ? this.manifest.header.version
        : this.manifest.header.version.join(".");
  }

  // Compresses the
  public compress(): void {}
}
