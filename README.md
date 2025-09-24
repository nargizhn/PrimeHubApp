# PrimeHubApp – Full Project Flow

PrimeHubApp is a small vendor management platform with vendor listings, admin CRUD, and crowd-based ratings. It’s a two-part app:

- Frontend: React (Create React App) in `frontend/`
- Backend: Spring Boot in `backend/`

Authentication is done with Firebase. The frontend retrieves a Firebase ID token and calls the backend with `Authorization: Bearer <token>`. The backend validates the token and exposes business APIs (vendors, ratings, profiles).


## High-level architecture

- React SPA (CRA)
	- Pages/components: Dashboard, Vendor List, Add Vendor, Edit Vendor, Rate Vendors, Profile, Login/Signup
	- Firebase Web SDK for auth (email/password or provider, based on your Firebase setup)
	- Calls backend REST APIs via `fetch` with a Firebase ID token
	- Optional file attachments per vendor shown via InfoTooltip (download from Firebase Storage)

- Spring Boot API
	- Validates Firebase tokens (see `FirebaseTokenFilter` and `SecurityConfig`)
	- Endpoints for auth handshakes, vendor CRUD, and rating updates
	- CORS is configured to allow the frontend origin

- Firebase (Cloud)
	- Firebase Authentication (users sign in; ID tokens used by the API)
	- Firebase Storage/Firestore for per-vendor attachments metadata and files


## Frontend flow (React)

The frontend lives in `frontend/`. Key files:

- `src/firebase.js`: Firebase app initialization
- `src/auth-context.js`: Auth context to get the current user and token
- `src/config/api.js`: API base URL and endpoints; `formatRating` helper; `apiCall`/`getAuthHeaders`
- `src/components/VendorList.js`: List/search vendors; InfoTooltip shows extra fields and attachment download
- `src/components/RateVendors.js`: Star-based rating per vendor; computes average locally and sends to backend
- `src/components/addVendor.js` / `EditVendor.js`: Admin CRUD for vendors
- `src/components/LoginSignup.js`: User signup and login form using Firebase Auth

Auth/token usage:
1. User signs in with Firebase in the frontend.
2. `getAuth().currentUser.getIdToken(true)` gets a fresh ID token.
3. Frontend sends requests with `Authorization: Bearer <token>`.
4. On 401/403, the frontend surfaces an error and can prompt re-login.

API calling pattern (simplified example):

```js
const user = getAuth().currentUser;
const token = user ? await user.getIdToken(true) : localStorage.getItem("token");
const res = await fetch(`${API_BASE}/api/vendors`, {
	headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
});
```

Attachments flow:
- On VendorList, for each vendor we try to resolve an attachment metadata via `getVendorAttachment(v.id)`.
- If found, a download link/button calls `downloadFile(url, name)` to fetch from Firebase Storage.


## Backend flow (Spring Boot)

The backend lives in `backend/` and exposes REST APIs. Notable packages:

- `config/`
	- `FirebaseInitialization`: bootstraps Firebase Admin SDK with a service account
	- `FirebaseTokenFilter`: extracts and validates the `Bearer` token; sets security context
	- `SecurityConfig`: configures Spring Security to enforce auth and register the filter
	- `CorsFilterConfig` / `WebConfig`: enables CORS for the frontend
- `controller/`
	- `AuthController`: login/signup bridging when needed
	- `VendorController`: CRUD endpoints for vendors (`/api/vendors`)
	- `RatingController`: rating updates (`PUT /api/vendors/{id}/rating`)
	- `ProfileController`: profile data
- `service/`, `repository/`, `model/`: standard layered design for business logic, persistence, and DTOs

Typical request path:
1. Frontend sends a request with `Authorization: Bearer <Firebase_ID_Token>`.
2. `FirebaseTokenFilter` verifies the token using Firebase Admin.
3. Security context is populated with the user identity.
4. Controller handles the request, services perform logic, repository persists data.
5. JSON response returned to the frontend.

Key endpoints used by the frontend (see `frontend/src/config/api.js`):

- `POST /api/auth/login` – optional fallback; Firebase is primary auth provider on the client
- `POST /api/auth/signup` – optional fallback
- `GET /api/vendors` – list vendors
- `DELETE /api/vendors/{id}` – delete vendor (admin)
- `PUT /api/vendors/{id}/rating` – update a vendor’s aggregate rating (backend persists and recalculates counts)


## Data model (practical subset)

Based on what the UI uses:

- Vendor
	- `id`: string/number
	- `name`, `category`, `city`, `representative`, `contact`
	- `price` (optional)
	- `agreementNumber`, `bankAccount`, `notes` (for details tooltip)
	- `rating` (number), `ratingCount` (number)
	- `attachment` metadata (stored externally in Firebase Storage; resolved by `getVendorAttachment(id)`)

- Rating update (client → server)
	- Payload: `{ rating: number }`
	- The UI locally computes an average from 3 criteria (price, time management, quality) then sends a single `rating` number. The backend persists and may combine with existing counts.


## Configuration

Frontend (`frontend/.env`):

```
REACT_APP_API_URL=https://your-backend-host
REACT_APP_FIREBASE_API_KEY=...  # if you externalize Firebase config
```

By default, the repo uses a deployed backend URL in `src/config/api.js`. Override with `.env` in local development.

Backend (`backend/src/main/resources/application.properties`):

- Points to the Firebase service account JSON (committed here for dev or injected via secret in prod)
- Configures CORS and security filter order


## Local development (Windows PowerShell)

Open two terminals: one for backend, one for frontend.

Backend (runs on port 8080 by default):

```powershell
# From the backend folder
./mvnw spring-boot:run
```

Frontend (runs on port 3000):

```powershell
# From the frontend folder
npm install
npm start
```

Set `REACT_APP_API_URL` to `http://localhost:8080` in `frontend/.env` for local dev.


## Deployment

Frontend – GitHub Pages:

- `package.json` contains a `homepage` and scripts: `predeploy` and `deploy`
- Build and deploy:

```powershell
cd frontend
npm run build
npm run deploy
```

Backend – cloud (example: Cloud Run):

- The sample `API_BASE_URL` in the frontend points to a Cloud Run URL. You can deploy the Spring Boot app to any platform (VM, App Service, Cloud Run, etc.).
- Ensure the service account (or runtime) has access to Firebase Admin and that allowed origins include your frontend domain.


## UX flows in the app

- Login/Signup → Dashboard
- Vendor List
	- Search by name/city/category/representative
	- View details via InfoTooltip (agreement, bank account, notes, attachment)
	- Admin-only actions: Add, Edit, Delete
- Rate Vendors
	- For each vendor, select 1–5 stars for Price/Time/Quality
	- The UI calculates a simple average and submits `{ rating }` to the backend
	- The list updates to show formatted rating: `x.xx (N ratings)` or `Not rated yet`
- Profile
	- Shows authenticated user’s info (depending on backend implementation)


## Error handling and edge cases

- Missing/expired token → backend returns 401 → frontend shows an alert and may prompt re-login
- Network/server errors → user-facing alerts
- Vendors list empty → UI shows friendly "No vendors found"
- Search with no matches → UI shows "No vendors match your search"
- Attachments missing → UI shows an em dash (—)


## Folder structure

```
PrimeHubApp/
	backend/
		src/main/java/com/example/vendorbackend/
			config/            # Security, CORS, Firebase
			controller/        # REST controllers (Auth, Vendor, Rating, Profile)
			service/, repository/, model/
		src/main/resources/  # application.properties, firebase-service-account.json
	frontend/
		src/
			components/        # React views/components (VendorList, RateVendors, Add/Edit Vendor, etc.)
			config/api.js      # API endpoints and helpers
			firebase.js        # Firebase client init
			auth-context.js    # Auth provider/hooks
```


## Try it locally

1. Set up Firebase project (Auth + Storage) and service account for the backend.
2. Update backend `application.properties` with the service account JSON path.
3. Create `frontend/.env` with `REACT_APP_API_URL=http://localhost:8080`.
4. Start backend, then frontend (see Local development).
5. Sign up/log in; add a vendor; rate vendors; verify ratings update.


## Troubleshooting

- 401 Unauthorized from API
	- Ensure user is logged in and token exists; refresh token with `getIdToken(true)`
	- Check CORS allowed origins on the backend
- Attachment not downloading
	- Confirm Firebase Storage rules and the URL in metadata
- GitHub Pages deploy doesn’t show latest
	- Confirm `homepage` is set in `frontend/package.json`
	- Clear cache/hard refresh; verify `npm run deploy` finished without errors


## Tech stack

- Frontend: React 18, react-router-dom, Firebase Web SDK
- Backend: Spring Boot, Spring Security, Firebase Admin SDK
- Hosting: GitHub Pages (frontend) + cloud of your choice (backend)
