package com.hackathon.summer.faf.presentation.response

import kotlinx.serialization.Serializable

@Serializable
data class ErrorResponse(
    val error: String?
)