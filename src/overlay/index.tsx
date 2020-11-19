import nowPlaying from './overlays/nowPlaying';

type OverlayType = typeof registeredOverlays[number]['type'];

type OverlayMeta = {
  type: string;
  config: any;
};

type OverlayConfigMap = {
  [K in OverlayType]: typeof registeredOverlays[number] & {type: K};
};

/**
 * Defines an available overlays.
 */
export type OverlayDescriptor<T extends OverlayMeta = any> = {
  /**
   * the type is the unique key for the overlay
   */
  type: T['type'];
  /**
   * The name of the overlay. This will be displayed when the user is adding a new
   * overlay to their configuration.
   */
  name: string;
  /**
   * The component to render for this overlay
   */
  component: React.ComponentType<{config: T['config']}>;
  /**
   * The example overlay item to render to give a visual idea of what the
   * overlay does.
   */
  example: React.ComponentType<{config?: T['config']}>;
  /**
   * Provides a default configuration for the overlay
   */
  defaultConfig: Partial<T['config']>;
  /**
   * Renders the settings UI for the overlay component
   */
  configInterface: React.ComponentType<{config: T['config']}>;
};

/**
 * Represents a configurable instance of an overlay.
 */
export type OverlayInstance<T extends OverlayType = any> = {
  type: T;
  /**
   * The unique key for this overlay. This will be used to route to the overlay
   * and lookup the configuration.
   */
  key: string;
  /**
   * The users configuration of instance of the overlay
   */
  config: OverlayConfigMap[T];
};

/**
 * Contains the list of available overlays.
 *
 * Add new entries here to register new overlays
 */
export const registeredOverlays = [nowPlaying] as const;
