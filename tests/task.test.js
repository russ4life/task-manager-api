const request = require('supertest')
const { app } = require('../source/app')
const Task = require('../source/models/task')
const User = require('../source/models/user')
const { 
    userOne,
    userTwo,
    setupDatabase,
    taskOne,
    taskTwo,
    taskThree
} = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should create task for a user', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'Test description'
        })
        .expect(201)

    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toEqual(false)
})

test('Should get all tasks for a user', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    expect(response.body.length).toEqual(2)
})

test('Should NOT delete User Task', async () => {
    const response = await request(app)
        .delete('/tasks/' + taskOne._id)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404)
    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull() 
})

test('Should not create task with invalid description', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: ''
        })
        .expect(400)
})

test('Should not create task with invalid completed', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'Test description',
            completed: 'BooM'
        })
        .expect(400)
})

test('Should not update task with invalid description', async () => {
    const response = await request(app)
        .patch('/tasks/' + taskOne._id)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: ''
        })
        .expect(400)
})

test('Should not update task with invalid completed', async () => {
    const response = await request(app)
        .patch('/tasks/' + taskOne._id)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            completed: 'BOOM'
        })
        .expect(400)
})

test('Should delete user task', async () => {
    const response = await request(app)
        .delete('/tasks/' + taskOne._id)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    const task = await Task.findById(response.body._id)
    expect(task).toBeNull() 
})

test('Should not delete task if unauthenticated', async () => {
    const response = await request(app)
        .delete('/tasks/' + taskOne._id)
        .send()
        .expect(401)
    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})

test('Should not update other users task', async () => {
    const response = await request(app)
        .patch('/tasks/' + taskOne._id)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send({
            completed: !taskOne.completed
        })
        .expect(404)
    const task = await Task.findById(taskOne._id)
    expect(task.completed).toEqual(taskOne.completed)
})

test('Should fetch user task by id', async () => {
    const response = await request(app)
        .get('/tasks/' + taskOne._id)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    expect(response.body).toMatchObject({
        description: taskOne.description,
        completed: taskOne.completed
    })
})

test('Should not fetch user task by id if unauthenticated', async () => {
    const response = await request(app)
        .get('/tasks/' + taskOne._id)
        .send()
        .expect(401)
})

test('Should not fetch other users task by id', async () => {
    const response = await request(app)
        .get('/tasks/' + taskThree._id)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(404)
})

test('Should fetch only completed tasks', async () => {
    const response = await request(app)
        .get('/tasks?completed=true')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    expect(response.body.length).toEqual(1)
})

test('Should fetch only incomplete tasks', async () => {
    const response = await request(app)
        .get('/tasks?completed=false')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    expect(response.body.length).toEqual(1)
})

test('Should sort tasks by description', async () => {
    const response = await request(app)
        .get('/tasks?sortBy=description:asc')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    expect(response.body[0].description).toEqual('First task')
})

test('Should sort tasks by completed', async () => {
    const response = await request(app)
        .get('/tasks?sortBy=completed:desc')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    expect(response.body[0].description).toEqual('Second task')
})

test('Should sort tasks by createdAt', async () => {
    const response = await request(app)
        .get('/tasks?sortBy=createdAt:desc')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    expect(response.body[0].description).toEqual('Second task')
})

test('Should sort tasks by updatedAt', async () => {
    const response = await request(app)
        .get('/tasks?sortBy=updatedAt:asc')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
    expect(response.body[0].description).toEqual('First task')
})

test('Should fetch page of tasks', async () => {
    const response = await request(app)
        .get("/tasks")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .expect(200);
    expect(response.body).toEqual(expect.any(Array));
})
