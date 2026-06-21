package com.hackathon.summer.faf.application.usecase

import com.hackathon.summer.faf.domain.repository.ActivityRepository
import com.hackathon.summer.faf.domain.repository.BookingResult
import com.hackathon.summer.faf.domain.repository.VisitorRepository
import com.hackathon.summer.faf.infrastructure.broadcast.BroadcastClient
import domain.error.ActivityErrors
import domain.error.VisitorErrors

class BookActivityUseCase(
    private val activityRepository: ActivityRepository,
    private val visitorRepository: VisitorRepository,
    private val broadcastClient: BroadcastClient
) {

    suspend fun execute(activityId: String, visitorId: String): String? {

        val visitor = visitorRepository.findById(visitorId)
            ?: return VisitorErrors.VISITOR_NOT_FOUND

        if (!visitor.checkedIn) {
            return VisitorErrors.VISITOR_NOT_CHECKED_IN
        }

        val result = activityRepository.tryBook(activityId, visitorId)

        if (result == BookingResult.SUCCESS) {

            val activity = activityRepository.findById(activityId)

            if (activity != null && activity.isFull()) {
                broadcastClient.publishActivityFull(activity.id, activity.name)
            }
        }

        return when (result) {
            BookingResult.SUCCESS -> null
            BookingResult.ACTIVITY_NOT_FOUND -> ActivityErrors.ACTIVITY_NOT_FOUND
            BookingResult.ALREADY_BOOKED -> ActivityErrors.ACTIVITY_ALREADY_BOOKED
            BookingResult.FULL -> ActivityErrors.ACTIVITY_FULL
        }
    }
}
