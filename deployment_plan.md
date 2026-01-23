# Deployment Implementation Plan

This plan outlines the steps to deploy the PixelTeamSNS application to Google Cloud (Cloud Run & Cloud SQL) and Firebase Hosting.

## 1. Prerequisites
- [ ] Google Cloud Project ID: `pixelshopsns`
- [ ] Firebase Project ID: `pixelshopsns`
- [ ] Google Cloud SDK (`gcloud`) installed and authenticated.
- [ ] Firebase CLI (`firebase`) installed and authenticated.

## 2. Backend Deployment (Cloud Run + Cloud SQL)

### Phase 1: Database Setup (One-time)
1. Create a Cloud SQL (PostgreSQL) instance.
2. Create a database (e.g., `pixelshop_db`).
3. Create a user (e.g., `django_user`) and a strong password.
4. Note the **Connection Name** (e.g., `pixelshopsns:us-central1:mysqlinstance`).

### Phase 2: Deploy to Cloud Run
Run these commands in the `backend/` directory:

```bash
# 1. Build and push the image to Artifact Registry
gcloud builds submit --tag gcr.io/pixelshopsns/pixelshop-backend

# 2. Deploy to Cloud Run
gcloud run deploy pixelshop-backend \
  --image gcr.io/pixelshopsns/pixelshop-backend \
  --platform managed \
  --region us-central1 \
  --add-cloudsql-instances <YOUR_CLOUDSQL_CONNECTION_NAME> \
  --set-env-vars "DB_NAME=pixelshop_db,DB_USER=django_user,DB_PASSWORD=YOUR_PASSWORD,DB_HOST=/cloudsql/<YOUR_CLOUDSQL_CONNECTION_NAME>" \
  --allow-unauthenticated
```

## 3. Frontend Deployment (Firebase Hosting)

Run these commands in the `frontend/` directory:

```bash
# 1. Login to Firebase (if needed)
npx firebase login --reauth

# 2. Build the project
npm run build

# 3. Deploy to Firebase Hosting
npx firebase deploy --only hosting
```

## 4. Post-Deployment
1. Update `CSRF_TRUSTED_ORIGINS` in `backend/pixelshop_backend/settings.py` if the Cloud Run URL changes.
2. Ensure the Cloud Run Service Account has the following roles:
   - `Cloud SQL Client`
   - `Firebase Admin` (or specific roles for Auth and Messaging)
