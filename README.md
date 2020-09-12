
<!--#echo json="package.json" key="name" underline="=" -->
split-formdesk-webform-mail-pmb
===============================
<!--/#echo -->

<!--#echo json="package.json" key="description" -->
Split email from a FormDesk web form into separate files.
<!--/#echo -->



API
---

This module exports one function:

### splitMail(rawMail[, opt])

Read one single raw email from buffer or string `rawMail` and
save its parts to files. Returns a promise for completion.

`opts` is an optional options object that supports these keys:

* `destPrefix`: Path prefix to in front of output filenames.
  Default: empty string.
* `defuseFileName`: A function that sanitizes the filenames,
  or false (default) for a rather strict built-in filter.






<!--#toc stop="scan" -->



Known issues
------------

* Needs more/better tests and docs.




&nbsp;


License
-------
<!--#echo json="package.json" key=".license" -->
ISC
<!--/#echo -->
