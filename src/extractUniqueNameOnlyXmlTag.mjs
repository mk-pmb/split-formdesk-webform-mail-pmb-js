// -*- coding: utf-8, tab-width: 2 -*-

import splitOnce from 'split-string-or-buffer-once-pmb';


function extract(xml, tagName) {
  let [clip, data] = splitOnce('<' + tagName + '>', xml);
  if (!data) { throw new Error('Cannot find opening tag named ' + tagName); }
  [data, clip] = splitOnce({ sep: '</' + tagName + '>', last: true }, data);
  if (clip !== undefined) { return data; }
  throw new Error('Cannot find closing tag named ' + tagName);
}


export default extract;
