#!/bin/bash
service redis-server start ;
gunicorn -b "0.0.0.0:5000" --certfile "/app/certs/fullchain.pem" --keyfile "/app/certs/privkey.pem" -k gevent app:flask_app & celery -A app.celery worker --loglevel=info