package com.hackathon.summer.faf.plugins

import io.ktor.http.HttpStatusCode
import io.ktor.server.application.*
import io.ktor.server.response.*

private val adminKey: String? = System.getenv("BEACH_ADMIN_KEY")

suspend fun ApplicationCall.requireAdmin(): Boolean {

    if (adminKey.isNullOrBlank()) {
        respond(HttpStatusCode.InternalServerError, mapOf("error" to "Admin key not configured"))
        return false
    }

    val providedKey = request.headers["X-Admin-Key"]

    if (providedKey != adminKey) {
        respond(HttpStatusCode.Forbidden, mapOf("error" to "Admin access required"))
        return false
    }

    return true
}
