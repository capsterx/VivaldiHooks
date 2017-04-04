#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
UNINSTALL="0"

while [[ $# -ge 1 ]]
do
key="$1"
echo $key
case $key in
    -h|--help)
    echo "Usage $0 <--uninstall|-u> <vivali dir>"
    exit 1
    ;;
    -u|--uninstall)
    UNINSTALL="1"
    shift # past argument
    ;;
    *)
			# unknown option
    ;;
esac
done

if [ $# -eq 1 ]
then
  VIVALDI_DIR=$1
else
  if [ "`uname`" = "Darwin" ]
  then
    VIVALDI_DIR='/Applications/Vivaldi.app/Contents/Versions/'
    if [ -e  "$VIVALDI_DIR" ]
    then
      pushd $VIVALDI_DIR >/dev/null
      VERSION=`echo * | tr ' ' '\n' | sort -nr | head -n 1`
      popd >/dev/null
      VIVALDI_DIR="$VIVALDI_DIR/$VERSION/Vivaldi Framework.framework/Resources"
    fi
  else
    VIVALDI_DIR="/opt/vivaldi/resources" 
    if [ ! -e "$VIVALDI_DIR" ] 
    then
      VIVALDI_DIR="/opt/vivaldi-snapshot/resources"
    fi
  fi
fi
  
if [ ! -e "$VIVALDI_DIR" ]
then
  echo "Unable to find vivaldi"
  exit 1
fi
    
echo "Found Vivaldi: $VIVALDI_DIR"

if [ ! -e "$VIVALDI_DIR/vivaldi/browser.html" ]
then
  echo "Unable to find '$VIVALDI_DIR/vivaldi/browser.html'"
  exit 1
fi

cat "$VIVALDI_DIR/vivaldi/browser.html" | grep jdhooks >/dev/null
if [ $? -eq 0 ]
then
  if [ "$UNINSTALL" -eq 1 ]
  then
		sed -i  -e '/<script src="jdhooks.js"><\/script>/d' "$VIVALDI_DIR/vivaldi/browser.html"
		echo "browser.html hooks removed"
  else
		echo "browser.html hooks already modified"
	fi
else
  if [ "$UNINSTALL" -eq 1 ]
	then
    echo "browser.html hooks already removed"
  else
		sed -i  -e '/<script src="bundle.js"><\/script>/i \
					 <script src="jdhooks.js"></script>
		' "$VIVALDI_DIR/vivaldi/browser.html"
		echo "browser.html hooks installed"
  fi
fi

if [ "$UNINSTALL" -ne 1 ]
then
	cp "$SCRIPT_DIR/vivaldi/jdhooks.js" "$VIVALDI_DIR/vivaldi"
	cp -r "$SCRIPT_DIR/vivaldi/hooks" "$VIVALDI_DIR/vivaldi"
fi
