set -e

# TODO(kanecunningham): Migrate build and deploy to Cloud Build using a cloudbuild.yaml config.

# Build Docker image
docker build -t gcr.io/eastern-academy-198411/app:latest .

# Push image to container repository
docker push gcr.io/eastern-academy-198411/app:latest

# Deploy to Cloud Run
gcloud run deploy app --image gcr.io/eastern-academy-198411/app:latest --region europe-west1 --platform managed --allow-unauthenticated
