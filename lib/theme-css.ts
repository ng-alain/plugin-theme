import { join } from 'path';
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import less from 'less';
const LessPluginCleanCSS = require('less-plugin-clean-css');
const LessPluginNpmImport = require('less-plugin-npm-import');
const lessToJs = require('less-vars-to-js');

import { ThemeCssItem, BuildThemeCSSOptions, ThemeCssConfig } from './theme-css.types';
import { deepMergeKey } from './utils';

const root = process.cwd();
let node_modulesPath = '';

function fixConfig(config: ThemeCssConfig): ThemeCssConfig {
  config = deepMergeKey(
    {
      additionalLibraries: [],
      additionalThemeVars: [],
      list: [],
      min: true,
      projectStylePath: 'src/styles.less',
    } as ThemeCssConfig,
    true,
    config,
  );

  const list: ThemeCssItem[] = [];
  config.list!.forEach(item => {
    if (!item.theme && !item.modifyVars) {
      return;
    }
    if (!item.key) {
      item.key = item.theme || 'invalid-key';
    }
    if (!item.filePath) {
      item.filePath = `src/assets/style.${item.key || 'invalid-name'}.css`;
    }
    list.push({ projectThemeVar: [], ...item });
  });

  if (list.length === 0) {
    throw new Error(`Not found valid theme configuration`);
  }

  config.list = list;

  return config;
}

function genThemeVars(type: 'default' | 'dark' | 'compact', extraThemeVars: string[]): { [key: string]: string } {
  const contents: string[] = [];
  // ng-zorro-antd
  const ngZorroAntdStylePath = join(root, node_modulesPath, 'ng-zorro-antd', 'style');
  if (existsSync(ngZorroAntdStylePath)) {
    contents.push(readFileSync(join(ngZorroAntdStylePath, 'color', 'colors.less'), 'utf-8'));
    contents.push(readFileSync(join(ngZorroAntdStylePath, 'themes', `${type}.less`), 'utf-8'));
  }
  // @delon
  const delonPath = join(root, node_modulesPath, '@delon');
  // @delon/theme/system
  const delonSystem = join(delonPath, 'theme');
  if (existsSync(delonSystem)) {
    contents.push(readFileSync(join(delonSystem, 'system', `theme-${type}.less`), 'utf-8'));
    contents.push(readFileSync(join(delonSystem, 'layout', 'default', `theme-${type}.less`), 'utf-8'));
    contents.push(readFileSync(join(delonSystem, 'layout', 'fullscreen', `theme-${type}.less`), 'utf-8'));
  }
  // @delon/abc
  const delonABC = join(delonPath, 'abc');
  if (existsSync(delonABC)) {
    contents.push(readFileSync(join(delonABC, `theme-${type}.less`), 'utf-8'));
  }
  // @delon/chart
  const delonChart = join(delonPath, 'chart');
  if (existsSync(delonChart)) {
    contents.push(readFileSync(join(delonChart, `theme-${type}.less`), 'utf-8'));
  }

  // 外部样式 extraThemeVars
  if (Array.isArray(extraThemeVars) && extraThemeVars.length > 0) {
    contents.push(
      ...extraThemeVars.map(path => {
        // 自动处理 src/app/layout/name/styles/theme-#NAME#.less之类的
        const lessFilePath = join(root, path.replace(`#NAME#`, type));
        if (!existsSync(lessFilePath)) {
          return '';
        }
        return readFileSync(lessFilePath, 'utf-8');
      }),
    );
  }

  return lessToJs(contents.join(''), {
    stripPrefix: true,
    resolveVariables: false,
  });
}

function genVar(config: ThemeCssConfig, item: ThemeCssItem): { [key: string]: string } {
  const fileContent = item.projectThemeVar?.map(path => readFileSync(join(root, path), 'utf-8'))!;
  // add project theme
  fileContent.push(readFileSync(join(root, config.projectStylePath!), 'utf-8'));
  let projectTheme: { [key: string]: string } = {};
  if (fileContent) {
    projectTheme = lessToJs(fileContent.join(''), {
      stripPrefix: true,
      resolveVariables: false,
    });
  }
  const modifyVars = item.modifyVars || {};
  const stripPrefixOfModifyVars: { [key: string]: string } = {};
  Object.keys(modifyVars).forEach(key => {
    const newKey = key.startsWith('@') ? key.substr(1) : key;
    stripPrefixOfModifyVars[newKey] = modifyVars[key];
  });
  const additionalThemeVars = config.additionalThemeVars!;
  return {
    ...genThemeVars('default', additionalThemeVars),
    ...(item.theme === 'dark' ? genThemeVars('dark', additionalThemeVars) : null),
    ...(item.theme === 'compact' ? genThemeVars('compact', additionalThemeVars) : null),
    ...projectTheme,
    ...stripPrefixOfModifyVars,
  };
}

async function buildCss(options: BuildThemeCSSOptions): Promise<string> {
  const plugins = [new LessPluginNpmImport({ prefix: '~' })];
  if (options.min === true) {
    plugins.push(new LessPluginCleanCSS({ advanced: true }));
  }
  return less
    .render(options.content, {
      javascriptEnabled: true,
      plugins,
      modifyVars: {
        ...options.modifyVars,
      },
    })
    .then(res => res.css);
}

export async function buildThemeCSS(config: ThemeCssConfig): Promise<void> {
  node_modulesPath = config.nodeModulesPath || 'node_modules';
  config = fixConfig(config);

  const promises = config.list?.map(item => {
    const modifyVars = genVar(config, item);
    const content = [
      // 如果项目入口样子已经包含 【@import '~@delon/theme/system/index';】 所以则无须增加
      // 否则部分 javascript less 变量会无法找到，例如：
      // message:'error evaluating function `color`: JavaScript evaluation error: 'ReferenceError: colorPalette is not defined''
      // `@import '${join(node_modulesPath + 'ng-zorro-antd/style/color/colors.less')}'`,
      `@import '${config.projectStylePath}';`,
      ...config.additionalLibraries!.map(v => `@import '${v}';`),
    ].join('');
    const options: BuildThemeCSSOptions = {
      min: config.min,
      content,
      modifyVars,
    };
    if (existsSync(item.filePath!)) {
      unlinkSync(item.filePath!);
    }
    return buildCss(options).then(css => {
      writeFileSync(item.filePath!, css);
      console.log(`✅ Style '${item.key}' generated successfully. Output: ${item.filePath!}`);
    });
  });

  await Promise.all(promises!);
}
