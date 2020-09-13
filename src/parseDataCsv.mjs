// -*- coding: utf-8, tab-width: 2 -*-

import vTry from 'vtry';
import mustBe from 'typechecks-pmb/must-be';
import parseCsv from 'csv-parse/lib/sync';


function parseDataCsv(dataAtt) {
  const csvText = dataAtt.body.toString('latin1');
  // :TODO: Determine the real charset and actually convert from that.
  // In one test form, Notepad2 said "ANSI" and "file" said "non-ISO".

  const delim = (csvText.slice(0, 32).match(/^"\w+"(;|,|\t)"/) || false)[1];
  mustBe.nest('Auto-detected cell delimiter', delim);

  const parsed = vTry(parseCsv, 'Parse the CSV data')(csvText, {
    bom: true,
    columns: true,
    delimiter: delim,
    skip_empty_lines: true,
  });
  mustBe('ary ofLength:1', 'Parsed CSV data')(parsed);
  return parsed[0];
}


export default parseDataCsv;
