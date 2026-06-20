package com.hackathon.summer.faf.domain.repository

import com.hackathon.summer.faf.domain.model.Activity

interface ActivityRepository {

    fun findAll(): List<Activity>

    fun findById(id: String): Activity?

    fun save(activity: Activity)
}