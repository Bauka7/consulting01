FROM gradle:8.14.3-jdk17 AS builder
WORKDIR /app

# Copy build files first so dependency resolution can be cached
COPY build.gradle.kts settings.gradle.kts ./
RUN gradle dependencies --no-daemon || true

# Copy source files and build the jar
COPY src src
RUN gradle bootJar --no-daemon

# ===== STAGE 2: Run the built application =====
FROM eclipse-temurin:17-jre
WORKDIR /app

COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
