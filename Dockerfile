FROM node:15.12.0-alpine3.10
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

FROM python:3.8.8-slim-buster
WORKDIR /app/api
ENV PYTHONPATH "${PYTHONPATH}:/app"
COPY --from=0 app/build ../build
COPY --from=0 app/node_modules ../node_modules
RUN apt-get update && apt-get install -y build-essential
COPY api/requirements.txt .
RUN pip --no-cache-dir install torch==1.7.0
RUN pip install -r requirements.txt

COPY api .
COPY public ../public
COPY src ../src
ENV PORT=8080
EXPOSE 8080
CMD exec gunicorn --bind :$PORT app:app --workers 1 --threads 1 --timeout 60