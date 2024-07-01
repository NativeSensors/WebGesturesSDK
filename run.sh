# uglifyjs templates/sdk/eyeGest.js templates/sdk/eyeTiles.js -c -o templates/sdk/eyeTiles.min.js;
# uglifyjs templates/sdk/eyeGest.js templates/sdk/eyeMagnet.js -c -o templates/sdk/eyeMagnet.min.js;
# uglifyjs templates/sdk/eyeGest.js templates/sdk/eyeTiles.js templates/sdk/eyeMagnet.js -c -o templates/sdk/eyeGest.min.js;
python3 -m gunicorn -k gevent -w 1 app:flask_app