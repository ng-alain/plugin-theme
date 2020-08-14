import { join } from 'path';
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import less from 'less';
const LessPluginCleanCSS = require('less-plugin-clean-css');
const LessPluginNpmImport = require('less-plugin-npm-import');
const lessToJs = require('less-vars-to-js');
const defaultVar = require('@delon/theme/theme-default');
const darkVar = require('@delon/theme/theme-dark');
const compactVar = require('@delon/theme/theme-compact');

import { ThemeCssItem, BuildThemeCSSOptions, ThemeCssConfig } from './theme-css.types';
import { deepMergeKey } from './utils';

const root = process.cwd();

function fixConfig(config: ThemeCssConfig): ThemeCssConfig {
  config = deepMergeKey(
    {
      extraLibraries: [],
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

function genVar(projectStylePath: string, item: ThemeCssItem): { [key: string]: string } {
  const fileContent = item.projectThemeVar?.map(path => readFileSync(join(root, path), 'utf-8'))!;
  // add project theme
  fileContent.push(readFileSync(join(root, projectStylePath), 'utf-8'));
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
  return {
    ...defaultVar,
    ...(item.theme === 'dark' ? darkVar : null),
    ...(item.theme === 'compact' ? compactVar : null),
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
  config = fixConfig(config);

  const promises = config.list?.map(item => {
    const content = [
      // 如果项目入口样子已经包含 【@import '~@delon/theme/system/index';】 所以则无须增加
      // 否则部分 javascript less 变量会无法找到，例如：
      // message:'error evaluating function `color`: JavaScript evaluation error: 'ReferenceError: colorPalette is not defined''
      // `@import '${join('node_modules/ng-zorro-antd/style/color/colors.less')}'`,
      `@import '${config.projectStylePath}';`,
      ...config.extraLibraries!.map(v => `@import '${v}';`),
    ].join('');
    const modifyVars = genVar(config.projectStylePath!, item);
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
    });
  });

  await Promise.all(promises!);
}
