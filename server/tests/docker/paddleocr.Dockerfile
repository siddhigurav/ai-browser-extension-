# Placeholder for paddleocr.Dockerfile

FROM python:3.9-slim-buster

WORKDIR /app

RUN pip install paddlepaddle paddleocr

CMD ["bash"]
