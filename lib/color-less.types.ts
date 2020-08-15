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
   * Specify the styles directory, default: `./src/styles`
   */
  stylesDir?: string;
  /**
   * Theme Less entry, default: `./src/styles/theme.less`
   */
  varFile?: string;
}
