FROM gradle:8.7-jdk21 AS builder

WORKDIR /app
COPY build.gradle.kts settings.gradle.kts gradle.properties ./
COPY src ./src

RUN gradle buildFatJar --no-daemon

# ── Runtime ──────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app
COPY --from=builder /app/build/libs/*-all.jar app.jar

RUN printf '#!/bin/sh\n\
if [ -n "$JDBC_URL" ]; then\n\
  export JDBC_URL=$(echo "$JDBC_URL" | sed "s|^postgresql://|jdbc:postgresql://|")\n\
fi\n\
exec java -jar app.jar\n' > /start.sh && chmod +x /start.sh

EXPOSE 10000
CMD ["/start.sh"]