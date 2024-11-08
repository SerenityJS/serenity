export interface ResourceManifest {
  format_version: number;
  header: {
    description: string;
    min_engine_version: [number, number, number];
    name: string;
    pack_scope?: "world" | "global" | "any";
    uuid: string;
    version: [number, number, number] | string;
  };
  modules: Array<
    {
      description: string;
      type: "resources" | "data" | "world_template";
      uuid: string;
      version: [number, number, number] | string;
    } & { type: "script"; language: "javascript" }
  >;
  dependencies: Array<{
    uuid: string;
    module_name: string;
    version: [number, number, number] | string;
  }>;
  capabilities: Array<
    "chemistry" | "editorExtension" | "experimental_custom_ui" | "raytraced"
  >;
  metadata: {
    authors: Array<string>;
    license: string;
    generated_with?: { [key: string]: [string, string] };
    product_type?: "addon";
    url: string;
  };
  subpacks: Array<{
    folder_name: string;
    name: string;
    memory_tier: number;
  }>;
}
