# Stage 1: Build the application with Gradle
FROM eclipse-temurin:17-jdk-jammy AS builder

WORKDIR /app

# Copy Gradle wrapper and build files first for dependency caching
COPY gradlew .
COPY gradle ./gradle
COPY build.gradle .
COPY settings.gradle .

# Make gradlew executable and build the application
RUN chmod +x gradlew
RUN ./gradlew build --no-daemon

# Copy source code
COPY src ./src

# Build the application, skipping tests
RUN ./gradlew build --no-daemon -x test

# Stage 2: Create the final runtime image
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy the built JAR from the builder stage
COPY --from=builder /app/build/libs/*.jar app.jar

# Expose port
EXPOSE 8080

# Use the standard Java command to run the JAR
ENTRYPOINT ["java", "-jar", "app.jar"]
