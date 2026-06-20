package com.hackathon.summer.faf.infrastructure.repository

import com.hackathon.summer.faf.domain.model.Activity
import com.hackathon.summer.faf.domain.repository.ActivityRepository
import com.hackathon.summer.faf.infrastructure.database.table.ActivityTable
import com.hackathon.summer.faf.infrastructure.database.table.BookingTable
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.transactions.transaction

class PostgresActivityRepository : ActivityRepository {

    override fun findAll(): List<Activity> {

        return transaction {

            ActivityTable.selectAll().map { row ->

                val activityId = row[ActivityTable.id]

                val bookedVisitors = BookingTable
                    .select { BookingTable.activityId eq activityId }
                    .map { it[BookingTable.visitorId] }
                    .toMutableSet()

                Activity(
                    id = activityId,
                    name = row[ActivityTable.name],
                    description = row[ActivityTable.description],
                    capacity = row[ActivityTable.capacity],
                    bookedVisitors = bookedVisitors
                )
            }
        }
    }

    override fun findById(id: String): Activity? {

        return transaction {

            ActivityTable
                .select { ActivityTable.id eq id }
                .map { row ->

                    val bookedVisitors = BookingTable
                        .select { BookingTable.activityId eq id }
                        .map { it[BookingTable.visitorId] }
                        .toMutableSet()

                    Activity(
                        id = id,
                        name = row[ActivityTable.name],
                        description = row[ActivityTable.description],
                        capacity = row[ActivityTable.capacity],
                        bookedVisitors = bookedVisitors
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

            val existingBookings = BookingTable
                .select { BookingTable.activityId eq activity.id }
                .map { it[BookingTable.visitorId] }
                .toSet()

            val toAdd = activity.bookedVisitors - existingBookings
            val toRemove = existingBookings - activity.bookedVisitors

            toAdd.forEach { visitorId ->
                BookingTable.insert {
                    it[BookingTable.activityId] = activity.id
                    it[BookingTable.visitorId] = visitorId
                }
            }

            toRemove.forEach { visitorId ->
                BookingTable.deleteWhere {
                    (BookingTable.activityId eq activity.id) and (BookingTable.visitorId eq visitorId)
                }
            }
        }
    }
}

override fun tryBook(activityId: String, visitorId: String): com.hackathon.summer.faf.domain.repository.BookingResult {

    return transaction {

        val activityRow = ActivityTable
            .select { ActivityTable.id eq activityId }
            .forUpdate()
            .singleOrNull()
            ?: return@transaction com.hackathon.summer.faf.domain.repository.BookingResult.ACTIVITY_NOT_FOUND

        val capacity = activityRow[ActivityTable.capacity]

        val currentBookingsCount = BookingTable
            .select { BookingTable.activityId eq activityId }
            .count()

        val alreadyBooked = BookingTable
            .select { (BookingTable.activityId eq activityId) and (BookingTable.visitorId eq visitorId) }
            .count() > 0

        if (alreadyBooked) {
            return@transaction com.hackathon.summer.faf.domain.repository.BookingResult.ALREADY_BOOKED
        }

        if (currentBookingsCount >= capacity) {
            return@transaction com.hackathon.summer.faf.domain.repository.BookingResult.FULL
        }

        BookingTable.insert {
            it[BookingTable.activityId] = activityId
            it[BookingTable.visitorId] = visitorId
        }

        com.hackathon.summer.faf.domain.repository.BookingResult.SUCCESS
    }
}
