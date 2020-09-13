// -*- coding: utf-8, tab-width: 2 -*-

import muMix from 'parse-multipart-mixed-mail-pmb';
import vTry from 'vtry';
import mustBe from 'typechecks-pmb/must-be';
import promisedFs from 'nofs';
import parseCsv from 'csv-parse/lib/sync';
import sortedJson from 'safe-sortedjson';


import saveAttachment from './saveAttachment';


const EX = async function splitMail(rawMail, opt) {
  if (!opt) { return splitMail(rawMail, true); }
  const dpx = (opt.destPrefix || '');
  const mail = muMix(rawMail);
  const [msg, csvPartRaw, ...uploads] = mail.body;
  await vTry.pr(promisedFs.writeFile, 'Save the message content part'
  )(dpx + 'msg.txt', msg);

  const csvDataAtt = (await vTry.pr(saveAttachment, 'Save the CSV data file'
  )(csvPartRaw, opt));

  function saveFiles(up, idx) {
    return vTry.pr(saveAttachment, 'Save upload file #' + idx)(up, opt);
  }
  await Promise.all(uploads.map(saveFiles));

  console.debug(csvDataAtt);

  // fileName: 'Testformular_75938611.xml', cType: 'text/xml',
  // fileName: 'Testformular_75938611.csv', cType: 'application/octet-stream',


  const csvTextUCS2 = csvDataAtt.body; // :TODO: Actually convert.
  const csvParsed = vTry(parseCsv, 'Parse the CSV data')(csvTextUCS2, {
    bom: true,
    columns: true,
    delimiter: ';',
    skip_empty_lines: true,
  });
  mustBe('ary ofLength:1', 'Parsed CSV data')(csvParsed);
  await vTry.pr(promisedFs.writeFile, 'Save JSON data'
  )(dpx + 'data.json', sortedJson(csvParsed[0], null, -2));
};









export default EX;
