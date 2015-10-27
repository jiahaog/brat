# Brat

Annotate data from brat offline painlessly

## Introduction

Selecting and annotating the corpus on brat is annoying an painful. With this, you can do it in the text editor of your choice. A result of laziness together with [Glen](https://github.com/gleniam).

**Even though care has been taken to minimize errors, I take no responsibility for any loss of data or errors to your corpus if you choose to use this tool.**

## Installation

With [Node](https://nodejs.org/en/) installed, run

```bash
$ npm install -g brat
```

## Usage

Download the plain text corpus by going to the page with the data assigned to you.
Mouseover on the top bar and click `Data` > Export (Document Data) > `txt`

With this file, you can add annotations in plain text, by separating noun phrases with `{` and `}`.

```bash
$ brat <username> <path>
```

Example

```bash
$ brat 1000000 /dropbox/annotated.txt
```

### Parameters

**username**: Username for brat. Password is assumed to be the same
**path** Path to the annotated file

## Annotation

Note that the tags can be nested:

```
18958 Meet {{u} outside} coop later
```

Make sure that your parenthesis matches, and **do not add in any additional characters/whitespaces other than the `{` and `}` brackets**. Just don't.  
