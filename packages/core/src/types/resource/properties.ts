interface ResourcePackEntry {
  path: string;
  subPack?: string;
}

interface ResourcePacksProperties {
  path: string | null;
  mustAcceptPacks: boolean;
  resources: Array<ResourcePackEntry>;
}

export { ResourcePackEntry, ResourcePacksProperties };
