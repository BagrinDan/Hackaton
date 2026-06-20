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

        val hikariConfig = HikariConfig().apply {

            jdbcUrl = config.property("database.jdbcUrl").getString()

            driverClassName =
                config.property("database.driverClassName").getString()

            username =
                config.property("database.username").getString()

            password =
                config.property("database.password").getString()

            maximumPoolSize =
                config.property("database.maximumPoolSize").getString().toInt()

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