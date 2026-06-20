package com.hackathon.summer.faf.application.usecase

import com.hackathon.summer.faf.domain.repository.ActivityRepository


class CancelActivityUseCase(
    private val activityRepository: ActivityRepository
) {

    fun execute(activityId: String, visitorId: String): String? {

        val activity = activityRepository.findById(activityId)

        activity?.bookedVisitors?.remove(visitorId)

        activityRepository.save(activity!!)

        return null
    }
}