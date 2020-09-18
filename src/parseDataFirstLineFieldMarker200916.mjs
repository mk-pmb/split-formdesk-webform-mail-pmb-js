// -*- coding: utf-8, tab-width: 2 -*-

import splitOnce from 'split-string-or-buffer-once-pmb';
import mustBe from 'typechecks-pmb/must-be';

const hasOwn = Object.prototype.hasOwnProperty;


function parseDataFLFM(origText) {
  let [fmark, body] = splitOnce('\n', mustBe('str | buf',
    'Data attachment body')(origText).toString('UTF-8'));
  mustBe.nest('Field marker', fmark);

  let pair;
  // Discard the potential dummy value of the first pseudo-field:
  [pair, body] = (splitOnce(fmark, body) || []);
  // … and ensure there are real fields after that:
  mustBe.nest('Data section', body);
  fmark = '\n' + fmark;
  const data = {};

  function learn(p) {
    if (!p) { return; }
    const [k, v] = p;
    if (!k) { return; }
    if (!v) { return; }
    if (hasOwn.call(data, k)) {
      data[k] += '\n' + v;
    } else {
      data[k] = v;
    }
  }

  while (body) {
    [pair, body] = (splitOnce(fmark, body) || [body]);
    learn(splitOnce('\n', pair));
  }
  return data;
}


export default parseDataFLFM;
