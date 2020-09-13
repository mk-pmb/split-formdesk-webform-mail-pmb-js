// -*- coding: utf-8, tab-width: 2 -*-

import promisedFs from 'nofs';
import mAtt from 'parse-mail-attachment-pmb';
import mustBe from 'typechecks-pmb/must-be';


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


export default saveAttachment;
