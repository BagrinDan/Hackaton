package com.hackathon.summer.faf.application.usecase

import com.hackathon.summer.faf.domain.repository.ActivityRepository
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

        val activity = activityRepository.findById(activityId)
            ?: return ActivityErrors.ACTIVITY_NOT_FOUND

        if (activity.bookedVisitors.contains(visitorId)) {
            return ActivityErrors.ACTIVITY_ALREADY_BOOKED
        }

        if (activity.isFull()) {
            return ActivityErrors.ACTIVITY_FULL
        }

        activity.bookedVisitors.add(visitorId)
        activityRepository.save(activity)

        return null
    }
}
