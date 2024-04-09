import {
	existsSync,
	mkdirSync,
	readFileSync,
	readdirSync,
	statSync
} from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

import { Logger, LoggerColors } from "@serenityjs/logger";
import { PackType } from "@serenityjs/protocol";

import { ResourcePackZip } from "./resource-pack-zip";

import type { ResourcePackManifest } from "./manifest";

class ResourcePack {
	// Maybe make this configurable?
	public static readonly MAX_CHUNK_SIZE = 1024 * 256;

	public compressedData!: Buffer;
	public compressedSize!: bigint;

	public originalSize!: bigint;

	public readonly version: string;
	public readonly name: string;
	public readonly packType: PackType;
	public readonly isRtx: boolean;
	public readonly hasScripts: boolean = false;

	// This is for encryption, which serenity doesn't support
	public readonly contentKey: string = "";

	public constructor(
		public readonly uuid: string,
		public readonly path: string,
		public readonly manifest: ResourcePackManifest,
		public readonly selectedSubpack: string,
		private readonly packZip: ResourcePackZip,
		private readonly manager: ResourcePackManager
	) {
		this.name = this.manifest.header.name;
		this.packType = PackType.Resources;
		this.isRtx = this.manifest.capabilities?.includes?.("raytraced") ?? false;

		// According to official documentation, the version field can be a semver string or a vec3
		this.version =
			typeof manifest.header.version === "string"
				? manifest.header.version
				: manifest.header.version.join(".");

		this.compress();
	}

	/** Compress the resource pack folder into a zip file. */
	public compress(): void {
		this.manager.logger.debug(
			`Attempting to compress resource pack '${this.name}' (${this.uuid})...`
		);

		const { data, originalSize } = this.packZip.compressPack();
		this.compressedData = data;
		this.compressedSize = BigInt(data.byteLength);
		this.originalSize = originalSize;

		this.manager.logger.debug(
			`Compressed resource pack '${this.name}' (${this.uuid}).`
		);
	}

	/** Get the SHA256 hash of the resource pack zip */
	public getHash(): Buffer {
		return createHash("sha256").update(this.compressedData).digest();
	}

	/** Get the amount of chunks that need to be sent to the client for this pack. */
	public getChunkCount(): number {
		return Math.ceil(
			this.compressedData.byteLength / ResourcePack.MAX_CHUNK_SIZE
		);
	}

	/** Get a specific chunk of the zip file to send to the client. */
	public getChunk(index: number) {
		const start = ResourcePack.MAX_CHUNK_SIZE * index;
		const end = Math.min(
			start + ResourcePack.MAX_CHUNK_SIZE,
			this.compressedData.byteLength
		);

		return this.compressedData.subarray(start, end);
	}
}

class ResourcePackManager {
	private readonly resourcePacks: Map<string, ResourcePack>;
	public readonly logger = new Logger("Resource Packs", LoggerColors.RedBright);

	public constructor(
		public readonly resourcePacksFolderPath: string,
		public readonly selectedResourcePacks: Array<{
			uuid: string;
			subpack?: string;
		}>,
		public readonly mustAcceptResourcePacks: boolean
	) {
		this.resourcePacks = new Map();

		if (!existsSync(this.resourcePacksFolderPath)) {
			mkdirSync(this.resourcePacksFolderPath);

			this.logger.success(
				`Created resource_packs folder at "${this.resourcePacksFolderPath}"`
			);
		} else if (!statSync(this.resourcePacksFolderPath).isDirectory()) {
			this.logger.error(
				`Specified resource packs folder path ${this.resourcePacksFolderPath} exists and is not a folder.`
			);

			return;
		}

		// No need to continue if there are no resource packs selected
		if (this.selectedResourcePacks.length === 0) return;

		// First get the UUIDs of all installed resource packs
		const installedFolders = readdirSync(this.resourcePacksFolderPath);
		const installedPacks = new Map<
			string,
			{ path: string; manifest: ResourcePackManifest }
		>();

		for (const folder of installedFolders) {
			const folderPath = join(this.resourcePacksFolderPath, folder);
			const manifestPath = join(folderPath, "manifest.json");

			if (!existsSync(manifestPath)) {
				this.logger.error(
					`Pack at ${folderPath} does not contain a manifest. Skipping...`
				);

				continue;
			}

			const manifest = JSON.parse(
				readFileSync(manifestPath, "utf8")
			) as ResourcePackManifest;

			installedPacks.set(manifest.header.uuid, {
				path: folderPath,
				manifest
			});
		}

		// Then loop over the selected ones, making sure all of them are installed, and compressing them.
		for (const { uuid, subpack } of this.selectedResourcePacks) {
			const installedPack = installedPacks.get(uuid);

			if (!installedPack) {
				this.logger.error(
					`Pack ${uuid} is not installed. Add it to ${this.resourcePacksFolderPath} to use it.`
				);

				continue;
			}

			const packZip = new ResourcePackZip(installedPack.path);

			this.resourcePacks.set(
				uuid,
				new ResourcePack(
					uuid,
					installedPack.path,
					installedPack.manifest,
					subpack ?? "", // Subpack is not required in server.properties
					packZip,
					this
				)
			);
		}

		this.logger.success("Compressed resource packs.");
	}

	/** Returns an array of installed, enabled resource packs. */
	public getPacks(): Array<ResourcePack> {
		return [...this.resourcePacks.values()];
	}

	/** Get a pack by its ID (with or without version suffix) */
	public getPack(uuid: string): ResourcePack | undefined {
		const isVersionUuid = uuid.includes("_");
		uuid = isVersionUuid ? uuid.split("_")[0]! : uuid;

		return this.resourcePacks.get(uuid);
	}

	/**
	 * ### Add a pack to the enabled resource packs list.
	 *
	 * - Any players that join the server afterwards will be sent this pack.
	 * - Players already on the server will have to **relog** to get the pack.
	 *
	 * Using this function does not modify the server.properties file, so
	 * the pack list change will not persist after a server restart.
	 */
	public addPack(pack: ResourcePack): void {
		this.resourcePacks.set(pack.uuid, pack);
	}

	/**
	 * ### Remove a pack from the enabled resource packs list.
	 *
	 * - Any players that join the server afterwards will not be sent this pack.
	 * - Players already on the server will have to **relog** to disable the pack,
	 * but it will still be in their cache. This means if this pack is ever
	 * re-added, they won't have to download it again.
	 *
	 * Using this function does not modify the server.properties file, so
	 * the pack list change will not persist after a server restart.
	 */
	public removePack(uuid: string): void {
		this.resourcePacks.delete(uuid);
	}
}

export { ResourcePackManager, ResourcePack };
