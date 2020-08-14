export class ColorLessConfig {
  /**
   * Specify the name of the theme variables to be changed, default is `@primary-color`
   * Can be set all antd & ng-alain custom theme variables
   */
  variables?: string[];
  /**
   * Specify output file path, default: `./src/assets/color.less`
   */
  outputFilePath?: string;
  /**
   * Specify the styles directory, default: `src`
   */
  stylesDir?: string;
  /**
   * Project entry style file path, default: `./src/styles.less`
   */
  mainLessFile?: string;
  /**
   * Theme Less entry, default: `./src/styles/theme.less`
   */
  varFile?: string;
}
