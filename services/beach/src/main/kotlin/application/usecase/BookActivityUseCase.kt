package com.hackathon.summer.faf.application.usecase

import com.hackathon.summer.faf.domain.repository.ActivityRepository
import com.hackathon.summer.faf.domain.repository.BookingResult
import com.hackathon.summer.faf.domain.repository.VisitorRepository
import domain.error.ActivityErrors
import domain.error.VisitorErrors

class BookActivityUseCase(
    private val activityRepository: ActivityRepository,
    private val visitorRepository: VisitorRepository
) {

    fun execute(activityId: String, visitorId: String): String? {

        val visitor = visitorRepository.findById(visitorId)
            ?: return VisitorErrors.VISITOR_NOT_FOUND

        if (!visitor.checkedIn) {
            return VisitorErrors.VISITOR_NOT_CHECKED_IN
        }

        return when (activityRepository.tryBook(activityId, visitorId)) {
            BookingResult.SUCCESS -> null
            BookingResult.ACTIVITY_NOT_FOUND -> ActivityErrors.ACTIVITY_NOT_FOUND
            BookingResult.ALREADY_BOOKED -> ActivityErrors.ACTIVITY_ALREADY_BOOKED
            BookingResult.FULL -> ActivityErrors.ACTIVITY_FULL
        }
    }
}
