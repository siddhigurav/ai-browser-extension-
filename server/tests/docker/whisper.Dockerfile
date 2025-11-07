# Placeholder for whisper.Dockerfile

FROM python:3.9-slim-buster

WORKDIR /app

RUN pip install faster-whisper

CMD ["bash"]
