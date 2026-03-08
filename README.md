# RecipeAI 🍳

A full-stack web application that helps users discover and manage recipes using AI-powered recipe generation. The app features a virtual fridge to track ingredients, personalized dietary preferences, and smart recipe suggestions based on what you have available.

## 🌟 Features

### Core Functionality
- **AI Recipe Generation**: Generate custom recipes using Google's Gemini AI based on available ingredients and preferences
- **Virtual Fridge Management**: Track your ingredients with expiration dates, quantities, and categories
- **Smart Recipe Search**: Find recipes by name, ingredients, cuisine type, meal type, and preparation time
- **Dietary Preferences**: Set dietary restrictions (Vegan, Vegetarian, Gluten-Free, etc.) and ingredient dislikes
- **Recipe Management**: Create, view, edit, and delete your own recipes
- **Admin Panel**: Administrative dashboard for user and recipe management

### User Features
- Browse and search through recipe database
- Generate recipes based on fridge contents
- Filter by cuisine (Italian, Mexican, Indian, Chinese)
- Filter by meal type (Breakfast, Lunch, Dinner, Snack)
- Filter by preparation time (Quick, Moderate, Slow)
- Save favorite recipes to your personal collection
- Track ingredient expiration dates

## 🛠️ Technology Stack

### Frontend
- **React 19** with TypeScript
- **React Router 7** for navigation
- **Tailwind CSS 4** for styling
- **Vite 6** for build tooling
- **Axios** for API communication
- **React Hook Form + Yup** for form validation
- **Vitest + Testing Library** for testing

### Backend
- **Spring Boot 3.1** (Java 17)
- **Spring Security** with JWT authentication
- **Spring Data JPA** with Hibernate
- **PostgreSQL** database
- **Flyway** for database migrations
- **MapStruct** for object mapping
- **Lombok** for boilerplate reduction
- **Google Gemini AI** integration

### DevOps & Infrastructure
- **Docker** & **Docker Compose** for containerization
- **Nginx** as reverse proxy
- **Let's Encrypt/Certbot** for SSL certificates
- **Render.com** deployment configuration included

## 📁 Project Structure

```
recipeAi/
├── backendApi/              # Spring Boot backend
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/org/jakub/backendapi/
│   │   │   │   ├── config/          # Security, CORS, JWT config
│   │   │   │   ├── controllers/     # REST API endpoints
│   │   │   │   ├── dto/             # Data Transfer Objects
│   │   │   │   ├── entities/        # JPA entities
│   │   │   │   ├── exceptions/      # Custom exceptions
│   │   │   │   ├── mappers/         # MapStruct mappers
│   │   │   │   ├── repositories/    # JPA repositories
│   │   │   │   └── services/        # Business logic
│   │   │   └── resources/
│   │   │       ├── application.yml           # Development config
│   │   │       ├── application-prod.yml      # Production config
│   │   │       └── db/migration/            # Flyway migrations
│   │   └── test/                    # Unit & integration tests
│   ├── build.gradle                 # Gradle build config
│   └── Dockerfile                   # Backend container config
│
├── frontend/recipeai/       # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React Context providers
│   │   ├── lib/             # Utility functions
│   │   ├── pages/           # Page components
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # Entry point
│   ├── tests/               # Component tests
│   ├── package.json         # NPM dependencies
│   ├── vite.config.ts       # Vite configuration
│   ├── Dockerfile           # Frontend container config
│   └── nginx.conf.template  # Nginx config for SPA
│
├── postgres/                # PostgreSQL setup
│   ├── Dockerfile
│   ├── init.sql
│   ├── init-admin.sh
│   └── init-user.sh
│
├── nginx/                   # Nginx reverse proxy
│   └── nginx.conf
│
├── docker-compose.yml       # Multi-container orchestration
└── render.yaml             # Render.com deployment config
```

## 🚀 Getting Started

### Prerequisites
- **Docker** and **Docker Compose** installed
- **Java 17** or higher (for local backend development)
- **Node.js 18+** and **npm** (for local frontend development)
- **Google Gemini API Key** (get it from [Google AI Studio](https://makersuite.google.com/app/apikey))

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
POSTGRES_DB=recipeai
POSTGRES_USER=recipe_user
POSTGRES_PASSWORD=your_secure_password_here

# Backend Configuration
GEMINI_API_KEY=your_gemini_api_key_here
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:80

# Frontend Configuration
BACKEND_URL=http://backend:8080
```

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd recipeAi
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:80
   - Backend API: http://localhost:8080 (via Nginx proxy)
   - Database: localhost:5434

5. **Create an admin user** (optional)
   ```bash
   docker exec -it recipeai-db psql -U recipe_user -d recipeai
   # Then run SQL to update a user's role to ADMIN
   ```

### Local Development

#### Backend Development

```bash
cd backendApi

# Run with H2 in-memory database (for testing)
./gradlew bootRun

# Run with PostgreSQL (ensure PostgreSQL is running)
SPRING_PROFILES_ACTIVE=prod ./gradlew bootRun

# Run tests
./gradlew test

# Build JAR
./gradlew build
```

The backend will be available at http://localhost:8080

#### Frontend Development

```bash
cd frontend/recipeai

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

The frontend will be available at http://localhost:5173

## 📊 Database Schema

### Main Entities

- **User**: User accounts with authentication
  - Fields: id, email, password, role (USER/ADMIN)
  - Relationships: UserPreferences, Recipes, FridgeIngredients

- **Recipe**: Recipe information
  - Fields: id, name, description, instructions, timeToPrepare
  - Relationships: RecipeIngredients, User

- **FridgeIngredient**: User's fridge inventory
  - Fields: id, name, amount, unit, category, expirationDate
  - Relationships: User

- **UserPreferences**: Dietary preferences
  - Fields: id, diet (VEGAN, VEGETARIAN, etc.), dislikedIngredients
  - Relationships: User

- **RecipeIngredient**: Ingredients in recipes with quantities
  - Relationships: Recipe, Ingredient

- **Ingredient**: Master ingredient list

## 🔌 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### Recipes
- `GET /recipes/getAllRecipes` - Get all recipes (paginated)
- `GET /recipes/getRecipe/{id}` - Get recipe by ID
- `GET /recipes/searchRecipes/{searchTerm}` - Search recipes
- `POST /recipes/addRecipe` - Create new recipe
- `POST /recipes/generateRecipe` - AI-generate recipe
- `POST /recipes/updateRecipe/{id}` - Update recipe
- `POST /recipes/deleteRecipe/{id}` - Delete recipe
- `GET /recipes/getUserRecipes/{userId}` - Get user's recipes

### Fridge Management
- `GET /fridge/getFridgeIngredients` - Get user's fridge items
- `POST /fridge/addFridgeIngredient` - Add ingredient to fridge
- `POST /fridge/updateFridgeIngredient/{id}` - Update ingredient
- `POST /fridge/deleteFridgeIngredient/{id}` - Remove ingredient

### User Preferences
- `GET /preferences/user/getPreferences` - Get user preferences
- `POST /preferences/user/changeDiet` - Update diet preference
- `POST /preferences/user/addDislikedIngredient` - Add disliked ingredient
- `POST /preferences/user/removeDislikedIngredient` - Remove disliked ingredient
- `GET /preferences/user/getDiets` - Get available diets

### Admin
- `GET /admin/users` - Get all users
- `GET /admin/users/{id}` - Get user by ID
- `PUT /admin/users/{id}/role` - Update user role
- `POST /admin/users/delete/{id}` - Delete user
- `PUT /admin/recipes/{id}` - Update any recipe
- `POST /admin/deleteRecipe/{id}` - Delete any recipe

## 🔒 Security

- **JWT Authentication**: Stateless token-based authentication
- **Password Encryption**: BCrypt password hashing
- **CORS Configuration**: Configurable allowed origins
- **Role-Based Access Control**: User and Admin roles
- **SQL Injection Prevention**: JPA with parameterized queries
- **XSS Protection**: React's built-in XSS protection

## 🌐 Deployment

### Docker Compose (Production)

The project includes a production-ready `docker-compose.yml` with:
- Nginx reverse proxy with SSL support
- Certbot for automatic SSL certificate renewal
- Health checks for all services
- Persistent PostgreSQL storage

```bash
# Deploy to production
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🧪 Testing

### Backend Tests
```bash
cd backendApi
./gradlew test
```

### Frontend Tests
```bash
cd frontend/recipeai
npm test              # Run tests once
npm test -- --watch   # Watch mode
npm test -- --ui      # UI mode
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- Jakub - Initial work

## 🙏 Acknowledgments

- Google Gemini AI for recipe generation
- Spring Boot community
- React community
- All open-source contributors

**Built with ❤️ using Spring Boot, React, and AI**
