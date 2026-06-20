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
            jdbcUrl = System.getenv("JDBC_URL")?.replace("^postgresql://".toRegex(), "jdbc:postgresql://")
                ?: config.property("database.jdbcUrl").getString()
            driverClassName = config.property("database.driverClassName").getString()
            username = System.getenv("DB_USER") 
                ?: config.property("database.username").getString()
            password = System.getenv("DB_PASSWORD") 
                ?: config.property("database.password").getString()
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