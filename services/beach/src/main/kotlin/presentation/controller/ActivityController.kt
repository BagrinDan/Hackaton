package com.hackathon.summer.faf.presentation.controller

import com.hackathon.summer.faf.plugins.requireAdmin
import com.hackathon.summer.faf.application.usecase.AddActivityUseCase
import com.hackathon.summer.faf.application.usecase.BookActivityUseCase
import com.hackathon.summer.faf.application.usecase.CancelActivityUseCase
import com.hackathon.summer.faf.application.usecase.RemoveActivityUseCase
import com.hackathon.summer.faf.domain.repository.ActivityRepository
import com.hackathon.summer.faf.presentation.request.ActivityRequest
import com.hackathon.summer.faf.presentation.request.VisitorRequest
import com.hackathon.summer.faf.presentation.response.ActivityResponse
import com.hackathon.summer.faf.presentation.response.ErrorResponse
import domain.error.ActivityErrors
import domain.error.VisitorErrors
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*


class ActivityController(
    private val activityRepository: ActivityRepository,
    private val bookActivityUseCase: BookActivityUseCase,
    private val cancelActivityUseCase: CancelActivityUseCase,
    private val addActivityUseCase: AddActivityUseCase,
    private val removeActivityUseCase: RemoveActivityUseCase
) {

    suspend fun book(call: ApplicationCall) {

        val activityId = call.parameters["activity_id"]
            ?: return call.respond(
                HttpStatusCode.BadRequest,
                ErrorResponse(ActivityErrors.MISSING_ACTIVITY_ID)
            )

        val request = call.receive<VisitorRequest>()

        if (request.id.isBlank()) {
            return call.respond(
                HttpStatusCode.BadRequest,
                ErrorResponse(VisitorErrors.VISITOR_MISSING_ID)
            )
        }

        val error = bookActivityUseCase.execute(
            activityId = activityId,
            visitorId = request.id
        )

        if (error != null) {
            return call.respond(
                statusCodeFor(error),
                ErrorResponse(error)
            )
        }

        call.respond(
            HttpStatusCode.OK,
            mapOf("status" to "booked")
        )
    }

    suspend fun cancel(call: ApplicationCall) {

        val activityId = call.parameters["activity_id"]
            ?: return call.respond(
                HttpStatusCode.BadRequest,
                ErrorResponse(ActivityErrors.MISSING_ACTIVITY_ID)
            )

        val request = call.receive<VisitorRequest>()

        if (request.id.isBlank()) {
            return call.respond(
                HttpStatusCode.BadRequest,
                ErrorResponse(VisitorErrors.VISITOR_MISSING_ID)
            )
        }

        val error = cancelActivityUseCase.execute(
            activityId = activityId,
            visitorId = request.id
        )

        if (error != null) {
            return call.respond(
                statusCodeFor(error),
                ErrorResponse(error)
            )
        }

        call.respond(
            HttpStatusCode.OK,
            mapOf("status" to "cancelled")
        )
    }

    suspend fun getActivity(call: ApplicationCall) {

        val activityId = call.parameters["activity_id"]
            ?: return call.respond(
                HttpStatusCode.BadRequest,
                ErrorResponse(ActivityErrors.MISSING_ACTIVITY_ID)
            )

        val activity = activityRepository.findById(activityId)
            ?: return call.respond(
                HttpStatusCode.NotFound,
                ErrorResponse(ActivityErrors.ACTIVITY_NOT_FOUND)
            )

        call.respond(
            HttpStatusCode.OK,
            ActivityResponse(
                activity_id = activity.id,
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

    suspend fun addActivity(call: ApplicationCall) {

        if (!call.requireAdmin()) return
        val request = call.receive<ActivityRequest>()

        val activity = addActivityUseCase.execute(
            id = request.id,
            name = request.name,
            description = request.description,
            capacity = request.capacity
        )

        call.respond(
            HttpStatusCode.Created,
            ActivityResponse(
                activity_id = activity.id,
                activity_name = activity.name,
                description = activity.description,
                capacity = activity.capacity,
                remaining = activity.remaining()
            )
        )
    }

    suspend fun removeActivity(call: ApplicationCall) {

        if (!call.requireAdmin()) return

        val activityId = call.parameters["activity_id"]
            ?: return call.respond(
                HttpStatusCode.BadRequest,
                ErrorResponse(ActivityErrors.MISSING_ACTIVITY_ID)
            )

        val removed = removeActivityUseCase.execute(activityId)

        if (!removed) {
            return call.respond(
                HttpStatusCode.NotFound,
                ErrorResponse(ActivityErrors.ACTIVITY_NOT_FOUND)
            )
        }

        call.respond(HttpStatusCode.OK, mapOf("status" to "removed"))
    }

    private fun statusCodeFor(error: String): HttpStatusCode {
        return when (error) {
            ActivityErrors.ACTIVITY_NOT_FOUND -> HttpStatusCode.NotFound
            VisitorErrors.VISITOR_NOT_FOUND -> HttpStatusCode.NotFound
            VisitorErrors.VISITOR_NOT_CHECKED_IN -> HttpStatusCode.Forbidden
            ActivityErrors.ACTIVITY_FULL -> HttpStatusCode.Conflict
            ActivityErrors.ACTIVITY_ALREADY_BOOKED -> HttpStatusCode.Conflict
            ActivityErrors.ACTIVITY_NOT_BOOKED -> HttpStatusCode.Conflict
            else -> HttpStatusCode.BadRequest
        }
    }
}
