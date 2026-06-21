package com.hackathon.summer.faf.application.usecase

import com.hackathon.summer.faf.domain.repository.ActivityRepository
import com.hackathon.summer.faf.infrastructure.broadcast.BroadcastClient
import domain.error.ActivityErrors

class CancelActivityUseCase(
    private val activityRepository: ActivityRepository,
    private val broadcastClient: BroadcastClient
) {

    suspend fun execute(activityId: String, visitorId: String): String? {

        val activity = activityRepository.findById(activityId)
            ?: return ActivityErrors.ACTIVITY_NOT_FOUND

        if (!activity.bookedVisitors.contains(visitorId)) {
            return ActivityErrors.ACTIVITY_NOT_BOOKED
        }

        val wasFull = activity.isFull()

        activity.bookedVisitors.remove(visitorId)
        activityRepository.save(activity)

        if (wasFull) {
            val updated = activityRepository.findById(activityId)
            if (updated != null) {
                broadcastClient.publishActivityAvailable(
                    updated.id,
                    updated.name,
                    updated.remaining()
                )
            }
        }

        return null
    }
}
