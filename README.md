#NoteMax-API

An API to manage notes in a web application.

## Facility

Make sure you have Node.js and npm installed. Then, run:

```bash
npm install
```

# setting
```
PORT=your_port
ENCRYPTED_KEY=your_32bit_encryption_cave
SECRETKEY=your_32bit_secretkey
HOST=your_host
DB_USER=your_db_user
PASSWORD=your_bd_password
DATABASE=your_db_name
```

# Use

To start the API, run:
```
npm run dev
```


# Endpoints

The main API endpoints are detailed below:

### Get all notes

- **Method:** `GET`
- **Path:** `/api/notes`
- **Description:** Gets all the notes.

### Get a note by ID

- **Method:** `GET`
- **Path:** `/api/notes/:id`
- **Description:** Gets a specific note for its ID.

### Create a new note

- **Method:** `POST`
- **Path:** `/api/notes`
- **Description:** Create a new note.

### Delete a note

- **Method:** `DELETE`
- **Path:** `/api/notes/:id`
- **Description:** Deletes a specific note by its ID.

### Create a new user

- **Method:** `POST`
- **Path:** `/api/users`
- **Description:** Create a new user.

### Log in

- **Method:** `POST`
- **Path:** `/api/login`
- **Description:** Sign in and get an authentication token.

### Change a user's role

- **Method:** `PATCH`
- **Path:** `/api/users/:id`
- **Description:** Changes the role of a specific user.

### Delete a user

- **Method:** `DELETE`
- **Path:** `/api/users/:id`
- **Description:** Delete a specific user by their ID.

### Request Example (using cURL)
- **curl http://localhost:3000/api/notes**


