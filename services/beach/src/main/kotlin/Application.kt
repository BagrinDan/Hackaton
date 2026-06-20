package com.hackathon.summer.faf

import com.hackathon.summer.faf.infrastructure.database.DatabaseFactory
import com.hackathon.summer.faf.plugins.configureRouting
import com.hackathon.summer.faf.plugins.configureSerialization
import io.ktor.server.application.*

fun main(args: Array<String>) {
    io.ktor.server.netty.EngineMain.main(args)
}

fun Application.module() {
    DatabaseFactory.init(environment.config)

    configureSerialization()
    configureRouting()
}
