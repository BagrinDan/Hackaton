# Beach Activity Service

## Overview

The Beach Activity Service manages hotel guests participating in beach activities.

Guests can:

* View available activities
* Book an activity
* Cancel an activity booking

Activities have limited capacity and are only available to checked-in hotel guests.

---

## Business Rules

### Current Rules

* Activities have a maximum capacity.
* A guest must be checked in to book an activity.
* A guest can cancel an existing booking.
* Remaining spots are calculated dynamically.

### Checkout Behavior

When a guest checks out of the hotel, their activity bookings should be removed to free capacity.

---

## Architecture

The service follows **Clean Architecture**:

* **Presentation Layer**

  * Ktor Routing
  * Controllers
  * Request/Response DTOs

* **Application Layer**

  * Use Cases
  * Business Logic

* **Domain Layer**

  * Entities
  * Repository Interfaces

* **Infrastructure Layer**

  * PostgreSQL
  * Exposed ORM
  * Repository Implementations

---

## Technology Stack

* Kotlin
* Ktor
* PostgreSQL
* Exposed
* Docker
* Docker Compose

---

# API Endpoints

## Get All Activities

### Request

```http
GET /activities
```

### Response

```json
{
  "activities": [
    {
      "activity_id": "ACT001",
      "activity_name": "Beach Volleyball",
      "description": "Competitive beach volleyball tournament.",
      "capacity": 20,
      "remaining": 12
    }
  ]
}
```

---

## Get Activity Details

### Request

```http
GET /activity/{activity_id}
```

### Example

```http
GET /activity/ACT001
```

### Response

```json
{
  "activity_id": "ACT001",
  "activity_name": "Beach Volleyball",
  "description": "Competitive beach volleyball tournament.",
  "capacity": 20,
  "remaining": 12
}
```

---

## Book Activity

### Request

```http
POST /activity/book/{activity_id}
```

### Body

```json
{
  "id": "guest-123"
}
```

### Success Response

```json
{
  "status": "booked"
}
```

### Error Response

```json
{
  "error": "Activity is full"
}
```


---

## Cancel Activity Booking

### Request

```http
POST /activity/cancel/{activity_id}
```

### Body

```json
{
  "id": "guest-123"
}
```

### Success Response

```json
{
  "status": "cancelled"
}
```

### Error Response

```json
{
  "error": "Activity not booked"
}
```

---
## Error Handling

All errors follow the same format:

```json
{
  "error": "Activity not found"
}
```

### Error Codes

| Code | HTTP Status | Description |
|--------|--------|--------|
| ACTIVITY_NOT_FOUND | 404 | Activity does not exist |
| ACTIVITY_FULL | 409 | Activity reached capacity |
| ACTIVITY_ALREADY_BOOKED | 409 | Visitor already booked the activity |
| ACTIVITY_NOT_BOOKED | 409 | Visitor is not booked into the activity |
| VISITOR_NOT_FOUND | 404 | Visitor does not exist |
| VISITOR_NOT_CHECKED_IN | 403 | Visitor is not checked in |
| VISITOR_MISSING_ID | 400 | Required visitor id is missing |
---

## Broadcast Service Integration

The Beach Activity Service is expected to publish activity inventory updates to the Broadcast Service whenever activity availability changes (for example, after a booking or cancellation).

### Broadcast Payload

```json
{
  "eventId": "9c39d15f-2ec8-4c6f-a9cb-63d4f4b4c8cb",
  "activityId": "ACT001",
  "activityName": "Beach Volleyball",
  "capacity": 20,
  "remaining": 1,
  "updatedAt": "2025-07-05T14:32:11Z",
  "occupancyPercentage": 40
}
```

# Running Locally

## Prerequisites

Install:

* Java 21
* Gradle 8.x (or use the Gradle Wrapper)
* PostgreSQL 16+
* Git

Verify installation:

```bash
java --version
```

Expected output:

```text
21
```

---

## Create PostgreSQL Database

Connect to PostgreSQL:

```bash
psql -U postgres
```

Create the database:

```sql
CREATE DATABASE beach;
```

---

## Configure Environment Variables

Create a `.env` file in the project root as per the .env.example provided:

---

## Create Tables

Start the application once:

```bash
./gradlew run
```

or on Windows:

```powershell
gradlew.bat run
```

The application will create the required tables automatically through Exposed.

Stop the application after startup.

---

## Seed Activities

Execute the seed script:

```bash
psql -U postgres -d beach -f db/init/seed_activities.sql
```

Verify:

```sql
SELECT COUNT(*) FROM activities;
```

Expected result:

```text
20
```

---

## Run the Application

Linux / macOS:

```bash
./gradlew run
```

Windows:

```powershell
gradlew.bat run
```

The API will be available at:

```text
http://localhost:8080
```

---

## Build Executable JAR

```bash
./gradlew build
```

Generated artifact:

```text
build/libs/
```

Run manually:

```bash
java -jar build/libs/<generated-jar>.jar
```
