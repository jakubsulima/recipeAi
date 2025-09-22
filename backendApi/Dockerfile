# Stage 1: Build the application with Gradle
FROM eclipse-temurin:17-jdk-jammy AS builder

WORKDIR /app

# Copy Gradle wrapper and build files first (for dependency caching)
COPY gradlew .
COPY gradle ./gradle
COPY build.gradle .
COPY settings.gradle .

RUN chmod +x gradlew

# Pre-download dependencies without triggering bootJar
RUN ./gradlew compileJava -x test --no-daemon -Dorg.gradle.vfs.watch=false || true

# Copy source code
COPY src ./src

# Build the application, skipping tests
# Add memory settings + disable file watcher to avoid freezes
ENV JAVA_TOOL_OPTIONS="-Xmx1g -XX:+UseContainerSupport"
RUN java -version && javac -version && \
    ./gradlew bootJar --no-daemon -x test -Dorg.gradle.vfs.watch=false --stacktrace --info

# Stage 2: Create the final runtime image
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy the built JAR from the builder stage
COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
