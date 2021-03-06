# Brat

Annotate data from [brat](http://brat.nlplab.org) in your text editor painlessly.

## Introduction

Selecting and annotating the corpus on brat is annoying and painful. With this, you can do it in the your [favourite](http://www.sublimetext.com) [text](https://atom.io) [editor](https://www.jetbrains.com/idea/) of your choice. A result of laziness together with [Glen](https://github.com/gleniam). 

Instead of using your mouse to select the noun phrases, waiting for the box to appear, pressing ok, waiting 10 seconds for the AJAX response to be processed, you can simply edit the tags offline, and automatically post them to the corpus.

**Even though care has been taken to minimize errors, I take no responsibility for any loss of data or errors to your corpus if you choose to use this tool.**

### Constraints 

- Currently coded to `http://brat.statnlp.com/main/#/sms_corpus/students/XXXXXXXX/sms_corpus` where `XXXXXXXX` is your username. 
- Your username the same as your password
- All tags are `noun-phrases`

## Installation

With [Node.js](https://nodejs.org/en/) installed, run in your command line

```bash
$ npm install -g brat
```

## Usage - Command Line

Download the plain text corpus by going to the page with the data assigned to you. Mouseover on the top bar and click `Data` > `Export (Document Data)` > `txt`

With this file, you can add annotations in plain text, by separating noun phrases with `{` and `}`.

```bash
$ brat <username> <path>
```

Example:

```bash
$ brat 1000000 /dropbox/annotated.txt
```

Don't worry about running the command multiple times and polluting the corpus, the script will intelligently ignore duplicated tags.

### Parameters

**username**: Username for brat. Password is assumed to be the same

**path**: Path to the annotated file

## Annotations

Note that the tags can be nested:

```
18958 Meet {{u} outside} coop later
```

IntelliJ users might be interested in `ctrl`+`alt`+`t` which wraps selected text with `{}`. [Similarly](http://stackoverflow.com/questions/19278057/how-to-wrap-selection-in-curly-brackets-in-sublime-text-2-with-correct-indentati) for Sublime Text users.

Make sure that parenthesis used are all closed, and **do not add in any additional characters/whitespaces other than the `{` and `}` annotation markers**. Just don't.

## Usage - Node.js

You can use the functions with as a node module as well. The following code is synonymous with the command line command above.

Add the dependency first:

```bash
$ npm install --save brat
```

Example code

```javascript
var brat = require('brat');
brat.saveToBrat(USER_ID, ANNOTATED_FILE);
```

### API

`callback` is a standard Node.js callback function, with one parameter as the error.

---
 
**saveToBrat(userId, path, callback)**

*Same as above*

---

**deleteSpans(userId, start, end, callback)**

Mouseover the tags on the corpus and you will see something like `ID:T35`. This tag is tag number `35`.
 
This function will remove all tags numbers ranging from `start` to the `end`.

`userId`: User Id

`start`: Integer, inclusive
 
`end`: Integer, exclusive

---

**fixProblems(userId, callback)**

Fixes problems with the corpus by detecting and deleting problematic tags

`userId`: User Id

---

**removeDuplicates(userId, callback)**

Checks and removes any duplicate tags from the online corpus

`userId`: User Id

---

### Todo

- [ ] CLI for other useful Node.js functions
- [ ] Better checking of the annotated file
