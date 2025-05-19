#!/bin/sh

vars=$(printenv | grep '^VITE_' | awk -F= '{print $1}')
find "/usr/share/nginx/html" -type f -name "*.js" | while read file; do
    for var in $vars; do
        repvar=$(printenv "$var")
        echo "Replacing $var with $repvar in $file"
        sed -i -r "s;$var;$repvar;g" $file
    done
done

exec "$@"
