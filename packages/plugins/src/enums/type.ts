/**
 * The plugin type declares the use case of the plugin.
 */
enum PluginType {
  /**
   * An addon plugin type adds additional functionality to the server, without an exposed API.
   */
  Addon,

  /**
   * An API plugin type adds additional functionality to the server, with an exposed API for other plugins to use.
   */
  Api
}

export { PluginType };
