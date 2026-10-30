# Eventora – Event Management System

Eventora is a full-stack Event Management System developed as part of the CodeNova project. It provides a platform where users can explore upcoming events and register for them, while administrators can manage events and monitor registrations through an admin dashboard.

## Features

### User Features
- Browse all available events.
- Search events by title.
- Filter events by category.
- View event details, date, time, venue, and availability.
- Register for events using personal details.
- Prevent duplicate registrations using email validation.

### Admin Features
- Secure admin access using an admin key.
- Create new events.
- Edit existing event details.
- Delete events.
- View all event registrations.
- Update registration status.
- Manage event and registration records.

## Tech Stack

**Frontend**
- React.js
- Vite
- CSS3
- Axios
- Lucide React

**Backend**
- Node.js
- Express.js
- REST API

**Database**
- MongoDB
- Mongoose

## Project Structure

```text
CodeNova_Eventora/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── .env
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
├── .gitignore
└── README.md
```

*Note: The folder structure may vary depending on the final project setup.*

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/CodeNova_Eventora.git
cd CodeNova_Eventora
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
ADMIN_KEY=your_admin_secret_key
```

Start the backend server:

```bash
npm run dev
```

The backend will run at:

`http://localhost:5000`

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite, usually:

`http://localhost:5173`

## API Endpoints

### Events

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/events` | Get all events |
| POST | `/api/events` | Create an event (Admin) |
| PUT | `/api/events/:id` | Update an event (Admin) |
| DELETE | `/api/events/:id` | Delete an event (Admin) |

### Registrations

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/registrations` | Register for an event |
| GET | `/api/registrations` | Get registrations (Admin) |
| PUT | `/api/registrations/:id` | Update registration (Admin) |
| DELETE | `/api/registrations/:id` | Delete a registration (Admin) |

Admin requests require the `x-admin-key` header.

## Event Categories

- Technology
- Workshop
- Seminar
- Cultural
- Sports
- Other

## Security

- Admin operations are protected using an admin key.
- MongoDB connection details and secret keys are stored in environment variables.
- The `.env` file should never be committed to GitHub.

## Future Enhancements

- User authentication and profiles.
- Online payment integration.
- Email confirmation for event registrations.
- Event QR code generation.
- Event analytics and reporting.

## Author

**Suresh Chavan**

- GitHub: [sureshchavn](https://github.com/sureshchavn)
- LinkedIn: [sureshchavan](https://www.linkedin.com/in/suresh-chavan/)

## License

This project is developed for educational and internship purposes.