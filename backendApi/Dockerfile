# Stage 1: Build the application with Maven
FROM eclipse-temurin:17-jdk-jammy AS builder
WORKDIR /app
COPY mvnw .
RUN chmod +x mvnw
COPY .mvn .mvn
COPY pom.xml .
RUN ./mvnw dependency:go-offline
COPY src ./src
RUN ./mvnw clean install -DskipTests

# Stage 2: Extract the layered JAR
FROM builder AS layered
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
RUN java -Djarmode=layertools -jar app.jar extract

# Stage 3: Create the final, smaller image
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy the layers
COPY --from=layered /app/dependencies/ ./
COPY --from=layered /app/spring-boot-loader/ ./
COPY --from=layered /app/snapshot-dependencies/ ./
COPY --from=layered /app/application/ ./

EXPOSE 8080
ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]

