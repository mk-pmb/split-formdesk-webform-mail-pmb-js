// -*- coding: utf-8, tab-width: 2 -*-

import mustBe from 'typechecks-pmb/must-be';
import vTry from 'vtry';
import parseFlatXmlDict from 'parse-flat-xml-dict-pmb';

import extractUniqueNameOnlyXmlTag from './extractUniqueNameOnlyXmlTag';


const dataTagName = 'exp_results';


function parseDataXml(origXml) {
  let xml = mustBe('str | buf', 'XML attachment body'
  )(origXml).toString('UTF-8');
  const tail = xml.slice(-64).replace(/\s/g, '');
  if (!tail.endsWith('</' + dataTagName + '></VFPData>')) {
    throw new Error('Unsupported XML schema or incomplete data file.');
  }
  xml = extractUniqueNameOnlyXmlTag(xml, dataTagName);
  return vTry(parseFlatXmlDict, 'parseFlatXmlDict')(xml);
}


export default parseDataXml;
