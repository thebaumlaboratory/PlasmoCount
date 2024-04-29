set -e

# TODO(kanecunningham): Migrate build and deploy to Cloud Build using a cloudbuild.yaml config.

# Build Docker image
docker build -t gcr.io/myplasmocountinstance/app:latest .

# Push image to container repository
docker push gcr.io/myplasmocountinstance/app:latest

# Deploy to Cloud Run
gcloud run deploy app --image gcr.io/myplasmocountinstance/app:latest --region australia-southeast1 --platform managed --allow-unauthenticated
