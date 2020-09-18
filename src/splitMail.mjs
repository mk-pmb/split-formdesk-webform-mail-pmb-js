// -*- coding: utf-8, tab-width: 2 -*-

import muMix from 'parse-multipart-mixed-mail-pmb';
import mustBe from 'typechecks-pmb/must-be';
import vTry from 'vtry';
import promisedFs from 'nofs';
import sortedJson from 'safe-sortedjson';


import saveAttachment from './saveAttachment';
import parseDataAutoDetect from './parseDataAutoDetect';


const EX = async function splitMail(rawMail, opt) {
  if (!opt) { return splitMail(rawMail, true); }
  const dpx = (opt.destPrefix || '');
  const mail = muMix(rawMail, { acceptJustText: true });
  const unclaimedBodyParts = mustBe('nonEmpty ary', 'Body parts')(mail.body);

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

  const uplOpt = { ...opt };
  ifHeader('x-mailsplit-upfiles-nameprefix',
    (p) => { uplOpt.untrustedFilenamePrefix = p; });
  function saveUploadedFile(up, idx) {
    return vTry.pr(saveAttachment, 'Save uploaded file #' + idx)(up, uplOpt);
  }
  await Promise.all(unclaimedBodyParts.map(saveUploadedFile));

  const dataDict = await parseDataAutoDetect(dataAtt);
  Object.keys(dataDict).forEach(function refine(k) {
    const v = dataDict[k];
    const t = typeof v;
    if (t === 'string') {
      dataDict[k] = v.trim().replace(/[ \t\r]+\n/g, '\n');
    }
  });
  await vTry.pr(promisedFs.writeFile, 'Save JSON data'
  )(dpx + 'data.json', sortedJson(dataDict, null, -2) + '\n');
};










export default EX;
