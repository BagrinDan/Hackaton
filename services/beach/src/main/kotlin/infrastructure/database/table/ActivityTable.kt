package com.hackathon.summer.faf.infrastructure.database.table

import org.jetbrains.exposed.sql.Table

object ActivityTable : Table("activities") {

    val id = varchar("id", 50)

    val name = varchar("name", 255)

    val description = text("description").nullable()

    val capacity = integer("capacity")

    override val primaryKey = PrimaryKey(id)
}