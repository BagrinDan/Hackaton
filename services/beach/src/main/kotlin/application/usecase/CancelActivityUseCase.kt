package com.hackathon.summer.faf.application.usecase

import com.hackathon.summer.faf.domain.repository.ActivityRepository
import domain.error.ActivityErrors

class CancelActivityUseCase(
    private val activityRepository: ActivityRepository
) {

    fun execute(activityId: String, visitorId: String): String? {

        val activity = activityRepository.findById(activityId)
            ?: return ActivityErrors.ACTIVITY_NOT_FOUND

        if (!activity.bookedVisitors.contains(visitorId)) {
            return ActivityErrors.ACTIVITY_NOT_BOOKED
        }

        activity.bookedVisitors.remove(visitorId)
        activityRepository.save(activity)

        return null
    }
}
