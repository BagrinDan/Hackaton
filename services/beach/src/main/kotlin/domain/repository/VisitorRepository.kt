package com.hackathon.summer.faf.domain.repository

import com.hackathon.summer.faf.domain.model.Visitor


interface VisitorRepository {

    fun findById(id: String): Visitor?
}