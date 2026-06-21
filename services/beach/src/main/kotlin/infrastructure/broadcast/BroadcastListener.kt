package com.hackathon.summer.faf.infrastructure.broadcast

import com.hackathon.summer.faf.infrastructure.database.table.VisitorsTable
import io.ktor.client.HttpClient
import io.ktor.client.engine.cio.CIO
import io.ktor.client.plugins.HttpTimeout
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.utils.io.*
import kotlinx.coroutines.*
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update

class BroadcastListener {

    private val broadcastServiceUrl = System.getenv("BROADCAST_SERVICE_URL")

    private val client = HttpClient(CIO) {
        install(HttpTimeout) {
            requestTimeoutMillis = Long.MAX_VALUE
        }
    }

    fun start(scope: CoroutineScope) {

        val url = broadcastServiceUrl ?: return

        scope.launch(Dispatchers.IO) {
            while (isActive) {
                try {
                    listen(url)
                } catch (e: Exception) {
                    println("Broadcast listener disconnected: ${e.message}, retrying in 5s")
                    delay(5000)
                }
            }
        }
    }

    private suspend fun listen(url: String) {

        client.prepareGet("$url/events") {
            timeout { requestTimeoutMillis = Long.MAX_VALUE }
        }.execute { response ->

            val channel = response.bodyAsChannel()

            while (!channel.isClosedForRead) {

                val line = channel.readUTF8Line() ?: continue

                if (line.startsWith("data:")) {
                    val jsonText = line.removePrefix("data:").trim()
                    handleEvent(jsonText)
                }
            }
        }
    }

    private fun handleEvent(jsonText: String) {

        try {
            val event = Json.parseToJsonElement(jsonText).jsonObject
            val type = event["type"]?.jsonPrimitive?.content ?: return

            if (type == "hotel.reservation_confirmed") {

                val payload = event["payload"]?.jsonObject ?: return
                val body = payload["body"]?.jsonObject ?: payload

                val guestId = body["guest_id"]?.jsonPrimitive?.content ?: return

                markVisitorCheckedIn(guestId)
            }

        } catch (e: Exception) {
            println("Failed to process broadcast event: ${e.message}")
        }
    }

    private fun markVisitorCheckedIn(visitorId: String) {

        transaction {

            val exists = VisitorsTable
                .select { VisitorsTable.id eq visitorId }
                .count() > 0

            if (exists) {
                VisitorsTable.update({ VisitorsTable.id eq visitorId }) {
                    it[checkedIn] = true
                }
            } else {
                VisitorsTable.insert {
                    it[id] = visitorId
                    it[checkedIn] = true
                }
            }
        }
    }
}
