# Troubleshooting

This section covers common issues that may arise during development or deployment and how to resolve them.

---

### 1. Frontend Shows a 404 Error on Page Refresh

*   **Symptom:** When running the application (especially in a production-like environment), the homepage loads correctly, but refreshing the browser on any other route (e.g., `/login`, `/client/dashboard`) results in a 404 "Not Found" error from the web server.

*   **Cause:** This is a common issue with Single-Page Applications (SPAs) like React. The client-side router handles navigation, but when you refresh the page, the browser sends a direct request to the server for that specific URL path. If the server isn't configured to handle SPA routing, it looks for a file at that path and returns a 404 if it doesn't find one.

*   **Solution:** The web server (Nginx, in the case of our production Docker container) must be configured to redirect all non-asset requests to the `index.html` file. The React router then takes over and displays the correct page. The `frontend/nginx.conf` file in this project is already configured to do this:
    ```nginx
    location / {
        try_files $uri $uri/ /index.html;
    }
    ```
    If you encounter this issue in a different deployment environment, you need to apply a similar configuration to your web server.

---

### 2. CORS Error in the Browser Console

*   **Symptom:** The frontend fails to fetch data from the backend, and the browser's developer console shows an error similar to: `Access to XMLHttpRequest at 'http://localhost:5000/api/...' from origin 'http://localhost:3000' has been blocked by CORS policy.`

*   **Cause:** Cross-Origin Resource Sharing (CORS) is a security feature that prevents web pages from making requests to a different domain than the one that served the page. By default, the backend (running on port 5000) will block requests from the frontend (running on port 3000).

*   **Solution:** The backend server must be configured to explicitly allow requests from the frontend's origin. This is handled in `backend/server.js` using the `cors` middleware:
    ```javascript
    const cors = require('cors');
    // ...
    app.use(cors()); // Enable CORS for all routes
    ```
    If this error appears, ensure this line is present and that the `cors` package is correctly installed in the backend's `node_modules`.

---

### 3. Database Connection Error (`database "user" does not exist`)

*   **Symptom:** The backend server fails to start or crashes on the first database query, with an error message like `database "w1l" does not exist` or `password authentication failed for user "..."`.

*   **Cause:** The backend is unable to connect to the PostgreSQL database because the connection credentials are incorrect or not being read properly. This often happens when the environment variables are misconfigured.

*   **Solution:**
    1.  **Check Environment Variables:** Ensure you have a `.env` file in the `backend` directory for local development or a root `.env` file for Docker deployment.
    2.  **Verify Credentials:** Double-check that the `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` variables in your environment file exactly match the credentials the PostgreSQL server is expecting.
    3.  **Docker Volume Issues:** If using Docker, a corrupted or outdated database volume can sometimes cause issues. If you are certain your credentials are correct, you can try completely resetting the database by running `docker-compose down -v` (Warning: This will permanently delete all data in the database volume) and then `docker-compose up`.

---

### 4. Backend crashes silently during User Registration

*   **Symptom:** When you try to register a new user, the API request fails, and checking the Docker logs (`docker-compose logs backend`) shows that the backend container has stopped or restarted. The error log might mention a `NOT NULL` constraint violation.

*   **Cause:** This specific issue was traced to a missing `PasswordHash` column in the `Client` table definition in `schema.sql`. The application code expects the column to exist, but the database schema is out of sync.

*   **Solution:**
    1.  **Correct the Schema:** Ensure the `Client` table in `backend/schema.sql` includes the `PasswordHash TEXT NOT NULL` column.
    2.  **Recreate the Database:** Because the table was created incorrectly when the database volume was first initialized, you must delete the volume to allow Docker to recreate it with the corrected schema.
        *   `docker-compose down -v` (This will delete all existing data).
        *   `docker-compose up --build -d` to restart the services with a fresh database.
