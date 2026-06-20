package com.hackathon.summer.faf.presentation.request

import kotlinx.serialization.Serializable

@Serializable
data class ActivityRequest(
    val id: String,
    val name: String,
    val description: String? = null,
    val capacity: Int
)
