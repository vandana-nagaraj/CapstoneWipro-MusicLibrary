# Music Library - Microservices Application

A comprehensive microservices-based music library application built with Spring Boot and Spring Cloud, featuring JWT authentication, role-based access control, and a modern web interface.

## Architecture

This project follows a microservices architecture with the following services:

1. **Eureka Server** (Port 8761) - Service discovery and registration
2. **Config Server** (Port 8888) - Centralized configuration management
3. **User Service** (Port 9002) - User and playlist management with JWT authentication
4. **Admin Service** (Port 9001) - Admin and song management with JWT authentication
5. **Notification Service** (Port 9003) - Notification handling (future implementation)

## Features Implemented

### Authentication & Security
- **JWT Authentication**: Secure token-based authentication for both users and admins
- **Role-Based Access Control**: Admin and user roles with appropriate permissions
- **Security Configuration**: Protected endpoints with proper authorization
- **Password Encryption**: Secure password storage using BCrypt

### Database Schema
- **User Entity**: User registration and authentication with JWT support
- **Admin Entity**: Admin registration and authentication with role management
- **Song Entity**: Song information with visibility controls and admin management
- **Playlist Entity**: User playlists with full CRUD operations
- **PlaylistSong Entity**: Many-to-many relationship between playlists and songs

### Microservices
- **Eureka Server**: Service discovery for all microservices
- **Spring Cloud Config**: Centralized configuration management
- **User Service**: Complete CRUD operations for users and playlists with JWT authentication
- **Admin Service**: Complete CRUD operations for admins and songs with JWT authentication
- **Notification Service**: Infrastructure ready for future notification features

### Frontend
- **Modern Web Interface**: Responsive HTML/CSS/JavaScript frontend
- **User Authentication**: Secure login and registration for both users and admins
- **Admin Dashboard**: Complete song management interface with create, edit, delete functionality
- **User Dashboard**: Playlist management and song browsing
- **Song Management**: Admin can add, edit, delete, and toggle song visibility
- **Search Functionality**: Search songs by name, singer, album, or music director

## Technology Stack

- **Backend**: Spring Boot 3.2.0, Spring Cloud 2023.0.0
- **Security**: Spring Security with JWT authentication
- **Database**: H2 (in-memory) with JPA/Hibernate
- **Service Discovery**: Netflix Eureka
- **Configuration**: Spring Cloud Config
- **API Documentation**: Swagger/OpenAPI 3
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Build Tool**: Maven
- **Java Version**: 17+

## Getting Started

### Prerequisites
- Java 17 or higher
- Maven 3.6 or higher

### Running the Application

**Important**: Start services in the following order to ensure proper service discovery and configuration:

1. **Start Eureka Server**:
   ```bash
   cd eureka-server
   mvn spring-boot:run
   ```
   Wait for Eureka to fully start before proceeding.

2. **Start Config Server**:
   ```bash
   cd config-server
   mvn spring-boot:run
   ```

3. **Start User Service**:
   ```bash
   cd user-service
   mvn spring-boot:run
   ```

4. **Start Admin Service**:
   ```bash
   cd admin-service
   mvn spring-boot:run
   ```

5. **Access the Application**:
   - Admin Interface: http://localhost:9001
   - User Interface: http://localhost:9002 (when available)

### Service URLs

- **Eureka Server**: http://localhost:8761
- **Config Server**: http://localhost:8888
- **User Service**: http://localhost:9002
- **Admin Service**: http://localhost:9001
- **User Service Swagger**: http://localhost:9002/swagger-ui.html
- **Admin Service Swagger**: http://localhost:9001/swagger-ui.html
- **H2 Console (User Service)**: http://localhost:9002/h2-console
- **H2 Console (Admin Service)**: http://localhost:9001/h2-console

### Default Credentials

**Admin Login**:
- Username: admin
- Password: admin123

**Test User** (can be created via registration):
- Any valid email and password combination

## API Endpoints

### User Service (Port 9002)

#### Authentication
- `POST /api/users` - Register new user (public)
- `POST /api/users/authenticate` - User login with JWT token response

#### Users (JWT Protected)
- `GET /api/users/{id}` - Get user by ID
- `GET /api/users/email/{email}` - Get user by email (public for admin access)
- `GET /api/users/username/{username}` - Get user by username
- `GET /api/users` - Get all users
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

#### Playlists (JWT Protected)
- `POST /api/playlists/user/{userId}` - Create playlist
- `GET /api/playlists/{id}` - Get playlist by ID
- `GET /api/playlists/user/{userId}` - Get playlists by user
- `GET /api/playlists/user/{userId}/search` - Search playlists
- `PUT /api/playlists/{id}` - Update playlist
- `DELETE /api/playlists/{id}` - Delete playlist

### Admin Service (Port 9001)

#### Authentication
- `POST /api/admins` - Register new admin (public)
- `POST /api/admins/authenticate` - Admin login with JWT token response

#### Admins (JWT Protected)
- `GET /api/admins/{id}` - Get admin by ID
- `GET /api/admins/email/{email}` - Get admin by email
- `GET /api/admins/username/{username}` - Get admin by username
- `GET /api/admins` - Get all admins
- `PUT /api/admins/{id}` - Update admin
- `DELETE /api/admins/{id}` - Delete admin

#### Songs (JWT Protected for Admin)
- `POST /api/songs` - Create song (Admin only)
- `GET /api/songs/{id}` - Get song by ID
- `GET /api/songs` - Get all songs (Admin only)
- `GET /api/songs/visible` - Get visible songs (public)
- `GET /api/songs/search` - Search songs
- `GET /api/songs/search/name` - Search by name
- `GET /api/songs/search/singer` - Search by singer
- `GET /api/songs/search/music-director` - Search by music director
- `GET /api/songs/search/album` - Search by album
- `PUT /api/songs/{id}` - Update song (Admin only)
- `PUT /api/songs/{id}/toggle-visibility` - Toggle visibility (Admin only)
- `DELETE /api/songs/{id}` - Delete song (Admin only)

## Database Schema

### User Service Database
- **users**: User information (id, username, email, phone_number, password, created_at, updated_at)
- **playlists**: User playlists (id, name, description, user_id, created_at, updated_at)
- **playlist_songs**: Playlist-song relationships (id, playlist_id, song_id, song_name, added_at)

### Admin Service Database
- **admins**: Admin information (id, username, email, phone_number, password, admin_level, created_at, updated_at)
- **songs**: Song information (id, name, singer, music_director, release_date, album_name, duration_minutes, file_path, is_visible, created_at, updated_at)

## Troubleshooting

### Common Issues

**Service Startup Issues**:
- Ensure services are started in the correct order (Eureka → Config → User → Admin)
- Check that ports 8761, 8888, 9001, and 9002 are available
- Wait for each service to fully register with Eureka before starting the next

**Authentication Issues**:
- Both admin and user services require service restart after configuration changes
- JWT tokens include proper role claims for authorization
- Some endpoints are configured for public access (registration, login, song visibility)

**403 Errors**:
- Restart both user-service and admin-service if experiencing 403 errors
- Check that JWT tokens are properly included in request headers
- Verify that the user has appropriate roles for protected endpoints

### H2 Database Access

**User Service Database**:
- URL: `jdbc:h2:mem:userdb`
- Username: `sa`
- Password: (leave blank)

**Admin Service Database**:
- URL: `jdbc:h2:mem:admindb`
- Username: `sa`
- Password: (leave blank)

## Features Completed

✅ **JWT Authentication**: Secure token-based authentication system
✅ **Role-Based Security**: Admin and user role management
✅ **Database Schema**: All tables with proper relationships
✅ **Microservice Architecture**: Complete service discovery and configuration
✅ **Admin Dashboard**: Full song management interface
✅ **User Registration**: Secure user registration and authentication
✅ **Song Management**: Complete CRUD operations with visibility controls
✅ **Search Functionality**: Multi-criteria song search
✅ **Frontend Integration**: Modern responsive web interface
✅ **API Documentation**: Swagger integration for all services
✅ **Exception Handling**: Comprehensive error handling
✅ **Security Configuration**: Protected endpoints with proper authorization

## Development Notes

- Each microservice has its own H2 database instance
- Services communicate through REST APIs with JWT authentication
- Frontend uses Fetch API for backend integration
- All services are registered with Eureka Server for service discovery
- Configuration is managed centrally through Spring Cloud Config
- Swagger documentation available at `/swagger-ui.html` for each service
- Song visibility is controlled by admin and defaults to visible for user access
- JWT tokens expire after configured time and need to be refreshed
