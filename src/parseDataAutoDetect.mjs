// -*- coding: utf-8, tab-width: 2 -*-

import vTry from 'vtry';
import mustBe from 'typechecks-pmb/must-be';

import parseDataXml from './parseDataXml';
import parseDataCsv from './parseDataCsv';
import firstLineFieldMarker200916 from './parseDataFirstLineFieldMarker200916';


const parsersByFext = {
  csv: parseDataCsv,    // cType: 'application/octet-stream'
  xml: parseDataXml,    // cType: 'text/xml'
  firstLineFieldMarker200916,
};


async function parseDataAutoDetect(dataAtt) {
  // Async because in the future, we might support file formats for which
  // we might need to communicate to decode them.
  const fext = (dataAtt.fileFormat
    || (/\.(\w+)$/.exec(dataAtt.fileName || '') || false)[1]
    || '');
  const parse = mustBe.tProp('Parser for filename extension ',
    parsersByFext, 'fun', fext);
  return vTry.pr(parse, 'Parse data file in format ' + fext)(dataAtt.body);
}


export default parseDataAutoDetect;
