package com.hackathon.summer.faf.presentation.request

import kotlinx.serialization.Serializable

@Serializable
data class VisitorRequest(
    val id: String
)