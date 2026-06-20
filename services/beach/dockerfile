FROM gradle:8-jdk21-alpine AS builder

WORKDIR /app
COPY gradle gradle
COPY gradlew gradlew.bat build.gradle.kts settings.gradle.kts gradle.properties ./
RUN chmod +x gradlew

# Кешируем зависимости отдельным слоем
RUN ./gradlew dependencies --no-daemon || true

COPY src ./src
RUN ./gradlew buildFatJar --no-daemon

# ── Runtime ──────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app
COPY --from=builder /app/build/libs/*-all.jar app.jar

EXPOSE 8080
CMD ["java", "-jar", "app.jar"]