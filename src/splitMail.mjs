// -*- coding: utf-8, tab-width: 2 -*-

import muMix from 'parse-multipart-mixed-mail-pmb';
import vTry from 'vtry';
import promisedFs from 'nofs';
import sortedJson from 'safe-sortedjson';


import saveAttachment from './saveAttachment';
import parseDataAutoDetect from './parseDataAutoDetect';


const EX = async function splitMail(rawMail, opt) {
  if (!opt) { return splitMail(rawMail, true); }
  const dpx = (opt.destPrefix || '');
  const mail = muMix(rawMail);
  const unclaimedBodyParts = mail.body;

  function ifHeader(h, f) {
    const v = mail.firstHeader(h);
    return v && f(v);
  }

  const msgFmt = mail.firstHeader('x-mailsplit-msgfmt', '');
  if (msgFmt !== 'absent') {
    const msgPart = unclaimedBodyParts.shift();
    await vTry.pr(promisedFs.writeFile, 'Save the message content part'
    )(dpx + 'msg.txt', msgPart);
  }

  const dataPartRaw = unclaimedBodyParts.shift();
  const dataAtt = (await vTry.pr(saveAttachment, 'Save the data file'
  )(dataPartRaw, {
    ...ifHeader('x-mailsplit-datafilename', n => ({ saveAs: n })),
    ...opt,
  }));
  ifHeader('x-mailsplit-datafilefmt', (fmt) => { dataAtt.fileFormat = fmt; });

  function saveFiles(up, idx) {
    return vTry.pr(saveAttachment, 'Save upload file #' + idx)(up, opt);
  }
  await Promise.all(unclaimedBodyParts.map(saveFiles));

  const dataDict = await parseDataAutoDetect(dataAtt);
  Object.keys(dataDict).forEach(function refine(k) {
    const v = dataDict[k];
    const t = typeof v;
    if (t === 'string') {
      dataDict[k] = v.trim().replace(/[ \t\r]+\n/g, '\n');
    }
  });
  await vTry.pr(promisedFs.writeFile, 'Save JSON data'
  )(dpx + 'data.json', sortedJson(dataDict, null, -2));
};










export default EX;
