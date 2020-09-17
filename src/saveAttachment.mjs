// -*- coding: utf-8, tab-width: 2 -*-

import promisedFs from 'nofs';
import mAtt from 'parse-mail-attachment-pmb';
import mustBe from 'typechecks-pmb/must-be';


function defuseFileName(orig, opt) {
  if (!opt) { return defuseFileName(orig, true); }
  let sane = String(orig);
  sane = sane.match(/[A-Za-z0-9_\.\-]+/g).join('_');
  sane = sane.replace(/^\.+/, '').replace(/\.+/g, '.');
  sane = sane.slice(0, (+opt.maxlen || 96));
  sane = sane.toLowerCase();
  return (sane || opt.ifEmpty || '_');
}


async function saveAttachment(raw, opt) {
  if (!opt) { return saveAttachment(raw, true); }
  const att = mAtt.parseAttachment(raw);
  const origFn = mustBe.nest('Attachment filename', opt.saveAs || att.fileName);
  const untrustedFilename = ((opt.untrustedFilenamePrefix || '') + origFn);
  const dpx = (opt.destPrefix || '');
  const defuseFunc = (opt.defuseFileName || defuseFileName);
  const defuseOpt = (opt.fileNameDefuserOpt || false);
  const destFn = dpx + defuseFunc(untrustedFilename, defuseOpt);
  await promisedFs.writeFile(destFn, att.body);
  return att;
}


export default saveAttachment;
