import { expect } from 'chai';
import { readFileSync, existsSync } from 'fs';
import { generator } from '../lib/generator';

const filePath = 'src/custom.css';
const TIMEOUT = 1000 * 20;

describe('generator', () => {
  function expectIncludeCss(css: string): void {
    expect(existsSync(filePath)).eq(true);
    const all = readFileSync(filePath, 'utf-8');
    expect(all.includes(css)).eq(true);
  }

  it(`should be dark theme`, async () => {
    await generator({ list: [{ theme: 'dark', filePath }] });
    expectIncludeCss(`background:#1f1f1f;`);
  }).timeout(TIMEOUT);

  it(`should be #f50 to #f60 via modifyVars`, async () => {
    await generator({ list: [{ key: 'custom', modifyVars: { '@a': '#f60' }, filePath }] });
    expectIncludeCss(`.a{color:#f60}`);
  }).timeout(TIMEOUT);

  it(`should be not clean css`, async () => {
    await generator({ min: false, list: [{ key: 'custom', modifyVars: { '@a': '#f60' }, filePath }] });
    expectIncludeCss(`.a {`);
  }).timeout(TIMEOUT);

  it(`should be throw error 'Not found valid theme configuration'`, async () => {
    try {
      await generator({});
      expect(true).eq(true);
    } catch (ex) {
      expect(ex.message).eq(`Not found valid theme configuration`);
    }
  });
});
