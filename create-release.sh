#!/bin/bash

if [ "$2" != "-cl" ]
then
    echo "You must remember to update the changelog first!"
    exit
fi

# Update package.json with the new version number
sed -i "s/\"version\": .*,/echo -n \"  \\\\\"version\\\\\": \\\\\"$1\\\\\",\"/ge" package.json

# Build new version
grunt build

# Copy to release
cp dist/qc-ext.min.user.js /var/www/html/questionablecontentextensions/web/releases/qc-ext.$1.user.js
cp dist/qc-ext.min.user.js /var/www/html/questionablecontentextensions/web/releases/qc-ext.latest.user.js
printf "<?php\n\$p=json_decode(file_get_contents('package.json'));echo(str_replace('<%%= pkg.version %%>', '$1', \$p->userscriptBanner));" | php > /var/www/html/questionablecontentextensions/web/releases/qc-ext.latest.meta.js

# Don't forget to publish!
echo
echo "==========================="
echo "Don't forget to publish! :)"
echo "==========================="

