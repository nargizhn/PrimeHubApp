# Add these environment variables to your Cloud Run deployment

# If using a service account key file
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json

# Or better - use Cloud Run's built-in service account
# Make sure your Cloud Run service has the following IAM roles:
# - Cloud Datastore User
# - Firebase Admin SDK Service Agent