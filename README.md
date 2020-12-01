# PlasmoCount

## Development

The React server runs on port `3000` and starts with:

```
yarn start
```

The Flask server runs on port `5000` and starts with:

```
cd api
flask run
```

## Deployment

You can run the app on a single server for testing by compiling the front-end:

```
yarn build
```

The self-contained app then runs on port `5000` with:

```
cd api
flask run
```
