# Firebase readiness report

Generated: 2026-08-01T23:20:12.302Z

Mode: static

Summary: 14 pass, 8 warning, 0 failure.

| Status | Check | Critical | Message |
|---|---|:---:|---|
| warn | runtime:VITE_FIREBASE_API_KEY | no | VITE_FIREBASE_API_KEY is missing locally and was not found in GitHub Actions secrets. |
| warn | runtime:VITE_FIREBASE_AUTH_DOMAIN | no | VITE_FIREBASE_AUTH_DOMAIN is missing locally and was not found in GitHub Actions secrets. |
| warn | runtime:VITE_FIREBASE_PROJECT_ID | no | VITE_FIREBASE_PROJECT_ID is missing locally and was not found in GitHub Actions secrets. |
| warn | runtime:VITE_FIREBASE_STORAGE_BUCKET | no | VITE_FIREBASE_STORAGE_BUCKET is missing locally and was not found in GitHub Actions secrets. |
| warn | runtime:VITE_FIREBASE_MESSAGING_SENDER_ID | no | VITE_FIREBASE_MESSAGING_SENDER_ID is missing locally and was not found in GitHub Actions secrets. |
| warn | runtime:VITE_FIREBASE_APP_ID | no | VITE_FIREBASE_APP_ID is missing locally and was not found in GitHub Actions secrets. |
| pass | initialization:VITE_FIREBASE_API_KEY | yes | Firebase initialization references VITE_FIREBASE_API_KEY. |
| pass | initialization:VITE_FIREBASE_AUTH_DOMAIN | yes | Firebase initialization references VITE_FIREBASE_AUTH_DOMAIN. |
| pass | initialization:VITE_FIREBASE_PROJECT_ID | yes | Firebase initialization references VITE_FIREBASE_PROJECT_ID. |
| pass | initialization:VITE_FIREBASE_STORAGE_BUCKET | yes | Firebase initialization references VITE_FIREBASE_STORAGE_BUCKET. |
| pass | initialization:VITE_FIREBASE_MESSAGING_SENDER_ID | yes | Firebase initialization references VITE_FIREBASE_MESSAGING_SENDER_ID. |
| pass | initialization:VITE_FIREBASE_APP_ID | yes | Firebase initialization references VITE_FIREBASE_APP_ID. |
| pass | initialization:guard | yes | Firebase initialization is guarded by complete configuration. |
| pass | production:local-fallback | yes | Local LMS fallback is limited to development or explicit opt-in. |
| pass | workflow:pages | yes | .github\workflows\deploy-pages.yml exists. |
| pass | workflow:firestore | yes | .github\workflows\deploy-firestore.yml exists. |
| pass | production:fallback-env | yes | Production deployment explicitly disables local fallback. |
| pass | admin:emails | no | Admin-email configuration is present without exposing its value. |
| warn | actions:service-account | no | FIREBASE_SERVICE_ACCOUNT was not found in GitHub Actions secrets. |
| pass | firestore:indexes | yes | firestore.indexes.json is valid JSON with deployable top-level arrays. |
| pass | firestore:rules | yes | firestore.rules passes structural validation. |
| warn | firestore:cli | no | Firebase CLI is not a local package; this check is structural. Emulator evidence is reported separately. |
