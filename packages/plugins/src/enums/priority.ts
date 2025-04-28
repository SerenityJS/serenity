/**
 * The priority of a plugin determines when it will be loaded in relation to other plugins.
 * A plugin with a higher priority will be loaded before a plugin with a lower priority.
 * This is useful for plugins that need to be loaded before or after other plugins.
 * For example, a library plugin may need to be loaded before a plugin that uses it,
 * or a plugin that modifies the behavior of serenity's APIs may need to be loaded after it.
 * The default priority is Normal.
 */
enum PluginPriority {

  /**
   * A low priority plugin will be loaded after other plugins.
   * Useful for reacting to changes or final adjustments.
   */
  Low,

  /**
   * The default priority for a plugin.
   * Suitable for standard plugin behavior.
   */
  Normal,

  /**
   * A high priority plugin will be loaded before other plugins.
   * Useful for early setup or overriding behavior.
   */
  High
}


export { PluginPriority };
