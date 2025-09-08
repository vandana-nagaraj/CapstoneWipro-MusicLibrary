# Music Library - Sprint 1

A microservices-based music library application built with Spring Boot and Spring Cloud.

## Architecture

This project follows a microservices architecture with the following services:

1. **Eureka Server** (Port 8761) - Service discovery and registration
2. **Config Server** (Port 8888) - Centralized configuration management
3. **User Service** (Port 8081) - User and playlist management
4. **Admin Service** (Port 8082) - Admin and song management

## Features Implemented (Sprint 1)

### Database Schema
- **User Entity**: User registration and authentication
- **Admin Entity**: Admin registration and authentication
- **Song Entity**: Song information with visibility controls
- **Playlist Entity**: User playlists
- **PlaylistSong Entity**: Many-to-many relationship between playlists and songs

### Microservices
- **Eureka Server**: Service discovery for all microservices
- **Spring Cloud Config**: Centralized configuration management
- **User Service**: Complete CRUD operations for users and playlists
- **Admin Service**: Complete CRUD operations for admins and songs

### Frontend
- **HTML/CSS/JavaScript**: Modern, responsive web interface
- **User Authentication**: Login and registration for both users and admins
- **Song Browsing**: View and search songs
- **Playlist Management**: Create and manage playlists

## Technology Stack

- **Backend**: Spring Boot 3.2.0, Spring Cloud 2023.0.0
- **Database**: H2 (in-memory)
- **Service Discovery**: Netflix Eureka
- **Configuration**: Spring Cloud Config
- **API Documentation**: Swagger/OpenAPI 3
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)

## Getting Started

### Prerequisites
- Java 17 or higher
- Maven 3.6 or higher

### Running the Application

1. **Start Eureka Server**:
   ```bash
   cd eureka-server
   mvn spring-boot:run
   ```

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

5. **Open Frontend**:
   Open `frontend/index.html` in your web browser

### Service URLs

- **Eureka Server**: http://localhost:8761
- **Config Server**: http://localhost:8888
- **User Service**: http://localhost:8081
- **Admin Service**: http://localhost:8082
- **User Service Swagger**: http://localhost:8081/swagger-ui.html
- **Admin Service Swagger**: http://localhost:8082/swagger-ui.html
- **H2 Console (User Service)**: http://localhost:8081/h2-console
- **H2 Console (Admin Service)**: http://localhost:8082/h2-console

## API Endpoints

### User Service (Port 8081)

#### Users
- `POST /api/users` - Create user
- `GET /api/users/{id}` - Get user by ID
- `GET /api/users/email/{email}` - Get user by email
- `GET /api/users/username/{username}` - Get user by username
- `GET /api/users` - Get all users
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user
- `POST /api/users/authenticate` - Authenticate user

#### Playlists
- `POST /api/playlists/user/{userId}` - Create playlist
- `GET /api/playlists/{id}` - Get playlist by ID
- `GET /api/playlists/user/{userId}` - Get playlists by user
- `GET /api/playlists/user/{userId}/search` - Search playlists
- `PUT /api/playlists/{id}` - Update playlist
- `DELETE /api/playlists/{id}` - Delete playlist

### Admin Service (Port 8082)

#### Admins
- `POST /api/admins` - Create admin
- `GET /api/admins/{id}` - Get admin by ID
- `GET /api/admins/email/{email}` - Get admin by email
- `GET /api/admins/username/{username}` - Get admin by username
- `GET /api/admins` - Get all admins
- `PUT /api/admins/{id}` - Update admin
- `DELETE /api/admins/{id}` - Delete admin
- `POST /api/admins/authenticate` - Authenticate admin

#### Songs
- `POST /api/songs` - Create song
- `GET /api/songs/{id}` - Get song by ID
- `GET /api/songs` - Get all songs
- `GET /api/songs/visible` - Get visible songs
- `GET /api/songs/search` - Search songs
- `GET /api/songs/search/name` - Search by name
- `GET /api/songs/search/singer` - Search by singer
- `GET /api/songs/search/music-director` - Search by music director
- `GET /api/songs/search/album` - Search by album
- `PUT /api/songs/{id}` - Update song
- `PUT /api/songs/{id}/toggle-visibility` - Toggle visibility
- `DELETE /api/songs/{id}` - Delete song

## Database Schema

### User Service Database
- **users**: User information (id, username, email, phone_number, password, created_at, updated_at)
- **playlists**: User playlists (id, name, description, user_id, created_at, updated_at)
- **playlist_songs**: Playlist-song relationships (id, playlist_id, song_id, song_name, added_at)

### Admin Service Database
- **admins**: Admin information (id, username, email, phone_number, password, admin_level, created_at, updated_at)
- **songs**: Song information (id, name, singer, music_director, release_date, album_name, duration_minutes, file_path, is_visible, created_at, updated_at)

## Sprint 1 Objectives Completed

✅ **Database Schema**: All tables created with proper relationships
✅ **Spring Entities**: Complete entity classes with JPA annotations
✅ **Microservice Structure**: Eureka Server, Config Server, User Service, Admin Service
✅ **CRUD Operations**: Complete CRUD for User and Admin entities
✅ **HTML/CSS Templates**: Modern, responsive frontend interface
✅ **Service Discovery**: Eureka Server for microservice registration
✅ **Configuration Management**: Spring Cloud Config for centralized configuration
✅ **API Documentation**: Swagger integration for all services
✅ **Exception Handling**: Custom exceptions for each microservice
✅ **Validation**: Input validation using Bean Validation

## Next Steps (Sprint 2)

- Implement search functionality for songs and playlists
- Add song CRUD operations for admin
- Implement visibility restrictions for songs
- Add playlist CRUD operations for users
- Add songs CRUD in playlists for users
- Implement Spring Security and JWT authentication

## Development Notes

- Each microservice has its own H2 database instance
- Services communicate through REST APIs
- Frontend uses Fetch API for backend integration
- All services are registered with Eureka Server
- Configuration is managed centrally through Config Server
- Swagger documentation is available for all services
