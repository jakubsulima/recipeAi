# Stage 1: Build the application with Maven
FROM eclipse-temurin:17-jdk-jammy AS builder

# Install Maven
RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B --no-transfer-progress

# Copy source code and build
COPY src ./src
RUN mvn clean package -DskipTests -B --no-transfer-progress

# Stage 2: Create the final runtime image
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy the built JAR from the builder stage
COPY --from=builder /app/target/*.jar app.jar

# Expose port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
