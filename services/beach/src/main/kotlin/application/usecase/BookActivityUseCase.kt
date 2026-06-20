package com.hackathon.summer.faf.application.usecase

import com.hackathon.summer.faf.domain.repository.ActivityRepository
import com.hackathon.summer.faf.domain.repository.VisitorRepository


class BookActivityUseCase(
    private val activityRepository: ActivityRepository,
    private val visitorRepository: VisitorRepository
) {

    fun execute(activityId: String, visitorId: String): String? {

        val activity = activityRepository.findById(activityId)

        activity?.bookedVisitors?.add(visitorId)

        activityRepository.save(activity!!)

        return null
    }
}