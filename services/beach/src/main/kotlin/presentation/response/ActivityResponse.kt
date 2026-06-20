package com.hackathon.summer.faf.presentation.response

import kotlinx.serialization.Serializable

@Serializable
data class ActivityResponse(
    val activity_id: String,
    val activity_name: String,
    val description: String?,
    val capacity: Int,
    val remaining: Int
)