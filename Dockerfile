FROM node:15.12.0-buster-slim

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH
ENV NODE_OPTIONS --max_old_space_size=4096
COPY package.json ./
COPY package-lock.json ./
COPY yarn.lock ./
COPY public ./public
COPY src ./src
RUN npm install yarn
RUN yarn build
RUN rm -rf src
FROM python:3.11.8
WORKDIR /app/api
ENV PYTHONPATH "${PYTHONPATH}:/app"
COPY --from=0 app/build ../build
COPY --from=0 app/node_modules ../node_modules
RUN apt-get clean && apt-get update && apt-get install -y python3-opencv build-essential
COPY api/models ./models
COPY api/requirements.txt .
RUN pip install --no-cache-dir  torch==2.2.2 torchvision==0.17.2
RUN pip install --no-cache-dir  -r requirements.txt

COPY api/app.py .
COPY api/config.py .
COPY api/example ./example
COPY api/programs ./programs
ENV PORT=8080
EXPOSE 8080
CMD exec gunicorn --bind :$PORT app:app --workers 1 --threads 8 --timeout 0