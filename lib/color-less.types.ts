import { Config } from './types';

export interface ColorLessConfig extends Config {
  /** Specify the node_modules directory, default: `node_modules` */
  nodeModulesPath?: string;
  /**
   * Specify the name of the theme variables to be changed, default is `[ '@primary-color' ]`
   * Can be set all antd & ng-alain custom theme variables
   */
  variables?: string[];
  /**
   * Specify the ng-zorro-antd directory, defualt: `./node_modules/ng-zorro-antd/`
   */
  ngZorroAntd?: string;
  /**
   * Project style entry, default: `./src/styles.less`
   */
  styleFilePath?: string;
  /**
   * Theme variable entry (muse includes `ng-zorro-antd` and user custom), default: `./src/styles/theme.less`
   */
  themeFilePath?: string;
  /**
   * Specify output file path, default: `./src/assets/color.less`
   */
  outputFilePath?: string;
  /**
   * Specify third-party libraries, default: `['@delon', 'ng-zorro-antd']`
   */
  thirdLibaryNames?: string[];
}

export interface ColorLessKV {
  [key: string]: string;
}
