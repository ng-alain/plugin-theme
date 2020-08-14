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
      stylesDir: `src`,
      mainLessFile: `./src/styles.less`,
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

  const options = {
    stylesDir: join(root, config.stylesDir!),
    antDir: join(root, './node_modules/ng-zorro-antd'),
    antdStylesDir: join(root, './node_modules/ng-zorro-antd'),
    varFile: join(root, config.varFile!),
    mainLessFile: join(root, config.mainLessFile!),
    themeVariables: config.variables,
    outputFilePath: config.outputFilePath,
  };

  if (existsSync(config.outputFilePath!)) {
    unlinkSync(config.outputFilePath!);
  }

  await generateTheme(options);
}
