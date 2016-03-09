# Questionable Content Extensions for Greasemonkey [![Build Status](https://travis-ci.org/Questionable-Content-Extensions/client.svg?branch=master)](https://travis-ci.org/Questionable-Content-Extensions/client) [![Dependency Status](https://www.versioneye.com/user/projects/56e06979df573d004c95f841/badge.svg?style=flat)](https://www.versioneye.com/user/projects/56e06979df573d004c95f841) [![Built with Grunt](https://cdn.gruntjs.com/builtwith.svg)](http://gruntjs.com/)

## Getting Started

This project requires [Node.js®](https://nodejs.org/en/). Install it on your system in whatever manner is appropriate for your operating system, and then open a terminal and run the following commands after cloning this repository:

```shell
npm install -g grunt-cli # If you don't have grunt installed already
npm install # To get all the grunt plugins we use
grunt build # To build our script
```

After having ran the commands above, you should have files created at `dist\qc-ext.user.js` and `dist\qc-ext.min.user.js`. These files can be opened in Greasemonkey or Tampermonkey directly.

Whenever you've made changes and want to incorporate them into the user script, simply run `grunt build` again.
