# Runs .preview/e2e.html in headless Edge and prints the check results
W="$(cd "$(dirname "$0")" && pwd -W)"
"/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" --headless=new --disable-gpu --allow-file-access-from-files --blink-settings=preferredColorScheme=0 --virtual-time-budget=8000 --dump-dom "file:///$W/e2e.html" 2>/dev/null | grep -o 'data-m="[^"]*"' | sed 's/&quot;/"/g; s/&lt;/</g; s/&gt;/>/g; s/&amp;/\&/g; s/^data-m="\[//; s/\]"$//' | sed 's/","/\n/g; s/^"//; s/"$//'
