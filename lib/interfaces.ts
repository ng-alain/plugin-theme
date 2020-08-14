export interface ConfigTheme {
  /** Project entry style file path, default: `src/styles.less` */
  projectStylePath?: string;
  /** List of additional library style entries */
  extraLibraries?: string[];
  /** Whether to compress, default: `true` */
  min?: boolean;
  /** Theme list */
  list?: ConfigThemeItem[];
}

export interface ConfigThemeItem {
  /**
   * Unique identifier
   */
  key?: string;
  /**
   * Save path after generation, default: `src/assets/style.{key}.css`
   */
  filePath?: string;
  /**
   * Theme type, can be set `dark` and `compact`, must choose between `theme` and `modifyVars`
   */
  theme?: 'dark' | 'compact';
  /**
   * Project theme less variables, except for `ng-zorro-antd`, `@delon/*`, and the specified `projectStylePath` file
   */
  projectThemeVar?: string[];
  /**
   * Custom Less variables, must choose between `theme` and `modifyVars`
   */
  modifyVars?: { [key: string]: string };
}

export interface BuildCssOptions {
  content: string;
  /** 是否压缩，默认：`true` */
  min?: boolean;
  modifyVars?: { [key: string]: string };
}
