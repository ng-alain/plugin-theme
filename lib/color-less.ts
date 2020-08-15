import { join } from 'path';
import { ColorLessConfig } from './color-less.types';
import { deepMergeKey } from './utils';
import { generateTheme } from './color-antd-theme-generator';
import { existsSync, unlinkSync } from 'fs';

const root = process.cwd();
const primaryColorVariable = '@primary-color';

function fixConfig(config: ColorLessConfig): ColorLessConfig {
  config = deepMergeKey(
    {
      variables: [],
      outputFilePath: `./src/assets/color.less`,
      stylesDir: `./src/styles`,
      varFile: `./src/styles/theme.less`,
    } as ColorLessConfig,
    false,
    config,
  );

  if (!Array.isArray(config.variables)) {
    config.variables = [];
  }

  if (!config.variables.includes(primaryColorVariable)) {
    config.variables.push(primaryColorVariable);
  }

  return config;
}

export async function genColorLess(config: ColorLessConfig): Promise<void> {
  config = fixConfig(config);
  // const options = {
  //   antDir: path.join(__dirname, './node_modules/antd'),
  //   stylesDir: path.join(__dirname, './src/styles'),
  //   varFile: path.join(__dirname, './src/styles/variables.less'), // default path is Ant Design default.less file
  //   themeVariables: ['@primary-color'],
  //   outputFilePath: path.join(__dirname, './public/color.less') // if provided, file will be created with generated less/styles
  //   customColorRegexArray: [/^fade\(.*\)$/], // An array of regex codes to match your custom color variable values so that code can identify that it's a valid color. Make sure your regex does not adds false positives.
  // }
  const options = {
    antDir: join(root, './node_modules/ng-zorro-antd'),
    antdStylesDir: join(root, './node_modules/ng-zorro-antd'),
    stylesDir: join(root, config.stylesDir!),
    varFile: join(root, config.varFile!),
    themeVariables: config.variables,
    outputFilePath: config.outputFilePath,
  };

  if (existsSync(config.outputFilePath!)) {
    unlinkSync(config.outputFilePath!);
  }

  await generateTheme(options);
}
