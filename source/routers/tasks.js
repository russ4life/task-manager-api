const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/tasks', auth, async (req, res) => {
    const { user, body } = req
    const { _id: owner } = user
    const task = new Task({
        ...body,
        owner
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/tasks', auth, async (req, res) => {
    try {
        const { user, query } = req
        const { completed, limit, skip, sortBy } = query
        const match = (completed) ? {
            completed: completed === 'true'
        } : {}
        const sort = {}
        if (sortBy){
            const parts = sortBy.split(':')
            sort[parts[0]] = (parts[1] === 'desc') ? -1 : 1;
        }
        const options = {
            limit: parseInt(limit),
            skip: parseInt(skip),
            sort
        }

        await user.populate({
            path: 'tasks',
            match,
            options
        }).execPopulate()
        const tasks = user.tasks
        res.send(tasks)
    } catch (error) {
        res.status(500).send()
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const { params, user } = req
    const { id: _id } = params
    const { _id: owner } = user
    try {
        const task = await Task.findOne({ _id, owner })
        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch (error) {
        res.status(500).send()
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const { body, params, user } = req
    const { id: _id } = params
    const { _id: owner } = user
    const updates = Object.keys(body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates to task' })
    }
    try {
        const task = await Task.findOne({ _id, owner })
        if (!task) {
            return res.status(404).send()
        }
        updates.forEach((update) => task[update] = body[update])
        await task.save()
        res.send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    const { params, user } = req
    const { id: _id } = params
    const { _id: owner } = user
    try {
        const task = await Task.findOneAndDelete({ _id, owner })
        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

module.exports = router