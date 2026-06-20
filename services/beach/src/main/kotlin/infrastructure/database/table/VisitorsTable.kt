package com.hackathon.summer.faf.infrastructure.database.table

import org.jetbrains.exposed.sql.Table

object VisitorsTable : Table("visitors") {

    val id = varchar("id", 50)

    val checkedIn = bool("checked_in")

    override val primaryKey = PrimaryKey(id)
}