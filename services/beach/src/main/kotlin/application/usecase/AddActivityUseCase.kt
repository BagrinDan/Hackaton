package com.hackathon.summer.faf.application.usecase

import com.hackathon.summer.faf.domain.model.Activity
import com.hackathon.summer.faf.domain.repository.ActivityRepository

class AddActivityUseCase(
    private val activityRepository: ActivityRepository
) {

    fun execute(id: String, name: String, description: String?, capacity: Int): Activity {

        val activity = Activity(
            id = id,
            name = name,
            description = description,
            capacity = capacity
        )

        activityRepository.save(activity)

        return activity
    }
}
