package com.hackathon.summer.faf.application.usecase

import com.hackathon.summer.faf.domain.repository.ActivityRepository

class RemoveActivityUseCase(
    private val activityRepository: ActivityRepository
) {

    fun execute(id: String): Boolean {

        activityRepository.findById(id) ?: return false

        activityRepository.delete(id)

        return true
    }
}
