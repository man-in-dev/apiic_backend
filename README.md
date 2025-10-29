# APIIC Backend API

Backend API for APIIC (AIIMS Patna Incubation Center) Management System built with Node.js, Express, MongoDB, and Joi validation.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Pre-Incubation Applications**: Complete CRUD operations for pre-incubation applications
- **Incubation Applications**: Complete CRUD operations for incubation applications
- **Data Validation**: Comprehensive validation using Joi
- **Security**: Helmet, CORS, rate limiting, and input sanitization
- **Database**: MongoDB with Mongoose ODM
- **API Documentation**: RESTful API with clear endpoints

## 📋 Prerequisites

- Node.js (>= 16.0.0)
- MongoDB (>= 4.4)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp env.example .env
   ```

   Update the `.env` file with your configuration:

   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/apiic
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Start the server**

   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## 📚 API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/password` - Update password

### Pre-Incubation Applications

- `POST /api/pre-incubation` - Create pre-incubation application
- `GET /api/pre-incubation` - Get all applications (with filtering & pagination)
- `GET /api/pre-incubation/:id` - Get single application
- `PUT /api/pre-incubation/:id` - Update application
- `DELETE /api/pre-incubation/:id` - Delete application (Admin only)
- `GET /api/pre-incubation/stats/overview` - Get statistics

### Incubation Applications

- `POST /api/incubation` - Create incubation application
- `GET /api/incubation` - Get all applications (with filtering & pagination)
- `GET /api/incubation/:id` - Get single application
- `PUT /api/incubation/:id` - Update application
- `DELETE /api/incubation/:id` - Delete application (Admin only)
- `GET /api/incubation/stats/overview` - Get statistics

### Health Check

- `GET /health` - Server health check
- `GET /` - API information

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 👥 User Roles

- **admin**: Full access to all operations
- **reviewer**: Can view and update applications
- **applicant**: Can create and view their own applications

## 📊 Database Models

### User

- Basic user information with authentication
- Role-based access control
- Password hashing with bcrypt

### PreIncubationApplication

- Complete pre-incubation application data
- Team members and shareholders
- Business and technical details
- Application status tracking

### IncubationApplication

- Complete incubation application data
- Innovation and business details
- Team and IP information
- Compliance and financial data

## 🛡️ Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Prevent abuse
- **Input Validation**: Joi schema validation
- **Password Hashing**: bcrypt with salt
- **JWT Authentication**: Secure token-based auth

## 📝 Validation

All input data is validated using Joi schemas:

- Required field validation
- Data type validation
- Length and format validation
- Custom business rules

## 🚦 Error Handling

Consistent error responses with:

- HTTP status codes
- Success/failure indicators
- Detailed error messages
- Development stack traces (in dev mode)

## 📈 Performance

- Database indexing for faster queries
- Pagination for large datasets
- Compression middleware
- Query optimization

## 🧪 Testing

```bash
npm test
```

## 📦 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests

## 🔧 Configuration

Environment variables in `.env`:

- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRE` - JWT expiration time
- `CORS_ORIGIN` - Allowed CORS origin
- `NODE_ENV` - Environment (development/production)

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support and questions, please contact the APIIC development team.
