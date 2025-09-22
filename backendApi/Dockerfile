# Stage 1: Build the application with Gradle
FROM eclipse-temurin:17-jdk-jammy AS builder

WORKDIR /app

# Copy Gradle wrapper and build files first (for dependency caching)
COPY gradlew .
COPY gradle ./gradle
COPY build.gradle .
COPY settings.gradle .

RUN chmod +x gradlew

# Download dependencies only (avoid bootJar)
RUN ./gradlew compileJava -x test --no-daemon || true

# Copy source code
COPY src ./src

# Build the application, skipping tests
RUN ./gradlew bootJar --no-daemon -x test

# Stage 2: Create the final runtime image
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy the built JAR from the builder stage
COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
