package com.hackathon.summer.faf.infrastructure.database

import com.hackathon.summer.faf.infrastructure.database.table.ActivityTable
import com.hackathon.summer.faf.infrastructure.database.table.VisitorsTable
import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import io.ktor.server.config.*
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.transactions.transaction

object DatabaseFactory {
    fun init(config: ApplicationConfig) {
        val rawUrl = System.getenv("JDBC_URL") ?: config.property("database.jdbcUrl").getString()

        val jdbcUrl: String
        val username: String
        val password: String

        if (rawUrl.startsWith("postgresql://") || rawUrl.startsWith("postgres://")) {
            val withoutScheme = rawUrl.removePrefix("postgresql://").removePrefix("postgres://")
            val atIdx = withoutScheme.lastIndexOf("@")
            val userInfo = withoutScheme.substring(0, atIdx).split(":", limit = 2)
            val hostAndDb = withoutScheme.substring(atIdx + 1)
            val slashIdx = hostAndDb.indexOf("/")
            val hostPort = hostAndDb.substring(0, slashIdx)
            val db = hostAndDb.substring(slashIdx + 1)
            username = userInfo[0]
            password = userInfo.getOrElse(1) { "" }
            jdbcUrl = "jdbc:postgresql://$hostPort:5432/$db"
        } else {
            jdbcUrl = rawUrl
            username = System.getenv("DB_USER") ?: config.property("database.username").getString()
            password = System.getenv("DB_PASSWORD") ?: config.property("database.password").getString()
        }

        val hikariConfig = HikariConfig().apply {
            this.jdbcUrl = jdbcUrl
            driverClassName = config.property("database.driverClassName").getString()
            this.username = username
            this.password = password
            maximumPoolSize = config.property("database.maximumPoolSize").getString().toInt()
            isAutoCommit = false
            transactionIsolation = "TRANSACTION_REPEATABLE_READ"
            validate()
        }
        val dataSource = HikariDataSource(hikariConfig)
        Database.connect(dataSource)
        transaction {
            SchemaUtils.create(ActivityTable, VisitorsTable)
        }
    }
}