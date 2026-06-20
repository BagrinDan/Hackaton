package com.hackathon.summer.faf.presentation.routing

import com.hackathon.summer.faf.presentation.controller.ActivityController
import com.hackathon.summer.faf.presentation.response.ErrorResponse
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Route.activityRoutes(
    controller: ActivityController
) {
    get("/") {
        call.respond(
            HttpStatusCode.OK,
            "Hello"
        )
    }
    route("/activity") {

        post("/book/{activity_id}") {
            controller.book(call)
        }

        post("/cancel/{activity_id}") {
            controller.cancel(call)
        }

        get("/{activity_id}") {
            controller.getActivity(call)
        }
    }

    get("/activities") {
        controller.getActivities(call)
    }
}