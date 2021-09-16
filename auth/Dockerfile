FROM tiangolo/uvicorn-gunicorn-fastapi:python3.7-alpine3.8
RUN apk add redis gcc musl-dev linux-headers libffi-dev
COPY ./app /app
WORKDIR /app
RUN python -m pip install -r requirements.txt