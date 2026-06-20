package com.hackathon.summer.faf.presentation.controller


import com.hackathon.summer.faf.application.usecase.BookActivityUseCase
import com.hackathon.summer.faf.application.usecase.CancelActivityUseCase
import com.hackathon.summer.faf.domain.repository.ActivityRepository
import com.hackathon.summer.faf.presentation.request.VisitorRequest
import com.hackathon.summer.faf.presentation.response.ActivityResponse
import com.hackathon.summer.faf.presentation.response.ErrorResponse
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*


class ActivityController(
    private val activityRepository: ActivityRepository,
    private val bookActivityUseCase: BookActivityUseCase,
    private val cancelActivityUseCase: CancelActivityUseCase
) {

    suspend fun book(call: ApplicationCall) {

        val activityId = call.parameters["activity_id"]


        val request = call.receive<VisitorRequest>()

        val error = bookActivityUseCase.execute(
            activityId = activityId!!,
            visitorId = request.id
        )

        println(error)

        call.respond(
            HttpStatusCode.OK,
            mapOf("status" to "booked")
        )
    }

    suspend fun cancel(call: ApplicationCall) {

        val activityId = call.parameters["activity_id"]


        val request = call.receive<VisitorRequest>()

        val error = cancelActivityUseCase.execute(
            activityId = activityId!!,
            visitorId = request.id
        )

        println(error)


        call.respond(
            HttpStatusCode.OK,
            mapOf("status" to "cancelled")
        )
    }

    suspend fun getActivity(call: ApplicationCall) {

        val activityId = call.parameters["activity_id"]


        val activity = activityRepository.findById(activityId!!)

        call.respond(
            HttpStatusCode.OK,
            ActivityResponse(
                activity_id = activity!!.id,
                activity_name = activity.name,
                description = activity.description,
                capacity = activity.capacity,
                remaining = activity.remaining()
            )
        )
    }

    suspend fun getActivities(call: ApplicationCall) {

        val activities = activityRepository.findAll()

        val response = activities.map { activity ->

            ActivityResponse(
                activity_id = activity.id,
                activity_name = activity.name,
                description = activity.description,
                capacity = activity.capacity,
                remaining = activity.remaining()
            )
        }

        call.respond(
            HttpStatusCode.OK,
            mapOf("activities" to response)
        )
    }
}