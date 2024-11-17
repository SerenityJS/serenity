interface ResourcePackEntry {
  path: string;
  subPack?: string;
}

interface ResourcePacksProperties {
  path: string | null;
  mustAcceptPacks: boolean;
  resourcePacks: Array<ResourcePackEntry>;
}

export { ResourcePackEntry, ResourcePacksProperties };
