package com.hackathon.summer.faf.infrastructure.broadcast

import io.ktor.client.HttpClient
import io.ktor.client.call.*
import io.ktor.client.engine.cio.CIO
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

@Serializable
data class BeachBroadcastPayload(
    val activity_id: String,
    val activity_name: String,
    val remaining: Int
)

class BroadcastClient {

    private val broadcastServiceUrl = System.getenv("BROADCAST_SERVICE_URL")

    private val client = HttpClient(CIO) {
        install(ContentNegotiation) {
            json(Json { ignoreUnknownKeys = true })
        }
    }

    suspend fun publishActivityFull(activityId: String, activityName: String) {
        publish("full", activityId, activityName, remaining = 0)
    }

    suspend fun publishActivityAvailable(activityId: String, activityName: String, remaining: Int) {
        publish("available", activityId, activityName, remaining)
    }

    private suspend fun publish(path: String, activityId: String, activityName: String, remaining: Int) {

        val url = broadcastServiceUrl ?: return

        try {
            client.post("$url/beach/$path") {
                contentType(ContentType.Application.Json)
                setBody(
                    BeachBroadcastPayload(
                        activity_id = activityId,
                        activity_name = activityName,
                        remaining = remaining
                    )
                )
            }
        } catch (e: Exception) {
            // не блокируем основной флоу бронирования если broadcast недоступен
            println("Failed to publish broadcast event: ${e.message}")
        }
    }
}
