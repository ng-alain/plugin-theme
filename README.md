# ng-alain-plugin-theme

NG-ALAIN theme plugin.

[![NPM version](https://img.shields.io/npm/v/ng-alain-plugin-theme.svg?style=flat-square)](https://www.npmjs.com/package/ng-alain-plugin-theme)
![Ci](https://github.com/ng-alain/ng-alain-plugin-theme/workflows/Ci/badge.svg)

## Usage

1. Install `ng-alain-plugin-theme` to `devDependencies`.

```bash
# via npm
npm i ng-alain-plugin-theme --save-dev
# via yarn
yarn add -D ng-alain-plugin-theme
```

2. Add `ng-alain.json` file in root path:

```json
{
  "theme": {
    "list": [
      {
        "theme": "dark"
      },
      {
        "key": "dust",
        "modifyVars": {
          "@primary-color": "#F5222D"
        }
      }
    ]
  }
}
```

3. Execute the following command through `npx`:

```bash
npx ng-alain-plugin-theme
```

> The above configuration will generate two css (`style.dark.css`, `style.dust.css`) files in `src/assets`.

4. Add switching theme code where you need it:

```ts
changeTheme(theme: 'default' | 'dark' | 'dust'): void {
  if (theme !== 'default') {
    const style = document.createElement('link');
    style.type = 'text/css';
    style.rel = 'stylesheet';
    style.id = 'dark-theme';
    style.href = `assets/style.${theme}.css`;
  } else {
    const dom = document.getElementById('dark-theme');
    if (dom) {
      dom.remove();
    }
  }
}
```

## License

MIT
