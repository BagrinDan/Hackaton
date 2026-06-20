package com.hackathon.summer.faf.infrastructure.repository

import com.hackathon.summer.faf.domain.model.Activity
import com.hackathon.summer.faf.domain.repository.ActivityRepository
import com.hackathon.summer.faf.infrastructure.database.table.ActivityTable
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction

class PostgresActivityRepository : ActivityRepository {

    override fun findAll(): List<Activity> {

        return transaction {

            ActivityTable.selectAll().map {

                Activity(
                    id = it[ActivityTable.id],
                    name = it[ActivityTable.name],
                    description = it[ActivityTable.description],
                    capacity = it[ActivityTable.capacity]
                )
            }
        }
    }

    override fun findById(id: String): Activity? {

        return transaction {

            ActivityTable
                .select { ActivityTable.id eq id }
                .map {

                    Activity(
                        id = it[ActivityTable.id],
                        name = it[ActivityTable.name],
                        description = it[ActivityTable.description],
                        capacity = it[ActivityTable.capacity]
                    )
                }
                .singleOrNull()
        }
    }

    override fun save(activity: Activity) {

        transaction {

            val exists =
                ActivityTable.select {
                    ActivityTable.id eq activity.id
                }.count() > 0

            if (exists) {

                ActivityTable.update({
                    ActivityTable.id eq activity.id
                }) {

                    it[name] = activity.name
                    it[description] = activity.description
                    it[capacity] = activity.capacity
                }

            } else {

                ActivityTable.insert {

                    it[id] = activity.id
                    it[name] = activity.name
                    it[description] = activity.description
                    it[capacity] = activity.capacity
                }
            }
        }
    }
}