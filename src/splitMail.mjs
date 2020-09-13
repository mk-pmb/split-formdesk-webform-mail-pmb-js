// -*- coding: utf-8, tab-width: 2 -*-

import muMix from 'parse-multipart-mixed-mail-pmb';
import mAtt from 'parse-mail-attachment-pmb';
import vTry from 'vtry';
import mustBe from 'typechecks-pmb/must-be';
import promisedFs from 'nofs';
import parseCsv from 'csv-parse/lib/sync';
import sortedJson from 'safe-sortedjson';


function defuseFileName(orig) {
  let sane = String(orig);
  sane = sane.match(/[A-Za-z0-9_\.\-]+/g).join('_');
  sane = sane.toLowerCase();
  return (sane || '_');
}


async function saveAttachment(raw, opt) {
  if (!opt) { return saveAttachment(raw, true); }
  const att = mAtt.parseAttachment(raw);
  const origFn = mustBe.nest('Attachment filename', att.fileName);
  const destFn = ((opt.destPrefix || '')
    + (opt.defuseFileName || defuseFileName)(origFn));
  await promisedFs.writeFile(destFn, att.body);
  return att;
}


const EX = async function splitMail(rawMail, opt) {
  if (!opt) { return splitMail(rawMail, true); }
  const dpx = (opt.destPrefix || '');
  const mail = muMix(rawMail);
  const [msg, csvPartRaw, ...uploads] = mail.body;
  await vTry.pr(promisedFs.writeFile, 'Save the message content part'
  )(dpx + 'msg.txt', msg);

  const csvDataRaw = (await vTry.pr(saveAttachment, 'Save the CSV data file'
  )(csvPartRaw, opt)).body;

  function saveFiles(up, idx) {
    return vTry.pr(saveAttachment, 'Save upload file #' + idx)(up, opt);
  }
  await Promise.all(uploads.map(saveFiles));

  const csvTextUCS2 = csvDataRaw; // :TODO: Actually convert.
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
