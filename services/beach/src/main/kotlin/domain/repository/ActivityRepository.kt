package com.hackathon.summer.faf.domain.repository

import com.hackathon.summer.faf.domain.model.Activity

interface ActivityRepository {

    fun findAll(): List<Activity>

    fun findById(id: String): Activity?

    fun save(activity: Activity)

    fun delete(id: String)

    fun tryBook(activityId: String, visitorId: String): BookingResult

    fun removeVisitorFromAllActivities(visitorId: String)
}

enum class BookingResult {
    SUCCESS,
    ACTIVITY_NOT_FOUND,
    ALREADY_BOOKED,
    FULL
}
