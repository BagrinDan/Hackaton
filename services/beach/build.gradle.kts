plugins {
    kotlin("jvm") version "1.9.24"
    id("io.ktor.plugin") version "2.3.12"
    kotlin("plugin.serialization") version "1.9.24"
    application
}

group = "com.hackathon.summer.faf"
version = "1.0.0-SNAPSHOT"

application {
    mainClass = "io.ktor.server.netty.EngineMain"
}


repositories {
    mavenCentral()
    gradlePluginPortal()
    maven("https://jitpack.io") // IMPORTANT for ucasoft libs
    maven("https://maven.pkg.jetbrains.space/public/p/exposed/maven")

}

kotlin {
    jvmToolchain(21)
}

dependencies {

    // Ktor
    implementation("io.ktor:ktor-serialization-kotlinx-json-jvm:2.3.12")
    implementation("io.ktor:ktor-server-config-yaml:2.3.12")
    implementation("io.ktor:ktor-server-content-negotiation-jvm:2.3.12")
    implementation("io.ktor:ktor-server-core-jvm:2.3.12")
    implementation("io.ktor:ktor-server-cors-jvm:2.3.12")
    implementation("io.ktor:ktor-server-netty-jvm:2.3.12")
    implementation("io.ktor:ktor-server-openapi-jvm:2.3.12")
    implementation("io.ktor:ktor-server-swagger-jvm:2.3.12")

    implementation("io.ktor:ktor-client-core:2.3.12")
    implementation("io.ktor:ktor-client-cio:2.3.12")
    implementation("io.ktor:ktor-client-content-negotiation:2.3.12")

    // Exposed
    implementation("org.jetbrains.exposed:exposed-core:0.50.1")
    implementation("org.jetbrains.exposed:exposed-dao:0.50.1")
    implementation("org.jetbrains.exposed:exposed-jdbc:0.50.1")

    // H2
    implementation("com.h2database:h2:2.2.224")
    implementation("io.r2dbc:r2dbc-h2:1.0.0.RELEASE")

    // Logging
    implementation("ch.qos.logback:logback-classic:1.5.6")


    // Postgres
    implementation("org.postgresql:postgresql:42.7.3")
    implementation("com.zaxxer:HikariCP:5.1.0")

    // Tests
    testImplementation(kotlin("test"))
    testImplementation("io.ktor:ktor-server-test-host-jvm:2.3.12")
}
