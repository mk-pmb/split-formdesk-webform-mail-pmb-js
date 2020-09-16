// -*- coding: utf-8, tab-width: 2 -*-

import 'p-fatal';
import 'usnam-pmb';

import pathLib from 'path';

import promisedFs from 'nofs';

import splitMail from '.';

(async function main() {
  const inputFile = String(process.argv[2] || '');
  const destPrefix = pathLib.basename(inputFile).split(/,|\.eml$/)[0] + '.';
  const opt = {
    destPrefix,
  };
  const rawMail = await promisedFs.readFile(inputFile);
  await splitMail(rawMail, opt);
}());
