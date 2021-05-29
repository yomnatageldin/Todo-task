const express = require('express')
const app = express()
const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/todosDB', {useNewUrlParser: true, useUnifiedTopology: true})
const db = mongoose.connection
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: true}))

const todos = [
    {task: 'Meet my students.', isDone: true},
    {task: 'Pray.', isDone: false},
    {task: 'Do some work.', isDone: true},
]




db.on('error', function(err) {
    console.log(err)
})

db.on('open', function() {
    console.log('Connection Established.')

    app.listen(80, function() {
        console.log('Running ...')
    })
})

const todoSchema = new mongoose.Schema({
    task: String,
    isDone: Boolean
})

const Todo = mongoose.model('Todo', todoSchema)
/*
app.get('/', function(req, res) {
    res.send(`
        <form action="/save">
            <input name="task">
            <button>Add</button>
        </form>
    `)
}) */
app.get('/', function(req, res) {
    const todosDom = todos.map(function(todo, index) {
        let selected = ''
        if (todo['isDone'] === true) {
            selected = 'checked'
        }
        return `
            <div>
                <input type="checkbox" ${selected} onclick="window.location.href= './toggle?index=${index}'">
                <span style="display: inline-block; width: 150px">${todo['task']}</span>
                <svg onclick="window.location.href= './edit?index=${index}'" style="fill: #0000ff" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512.035 512.035"><path d="M308.296 76.933l126.933 126.933 35.627-35.584L343.922 41.349zM485.945 26.272C456.185-3.488 410.638-7.712 376.1 13.195l122.923 122.923c20.884-34.518 16.703-80.064-13.078-109.846zM36.511 348.442a21.332 21.332 0 00-5.675 10.133L.586 485.594a21.26 21.26 0 005.675 20.011 21.373 21.373 0 0015.083 6.251c1.643 0 3.307-.192 4.928-.576l127.019-30.251a21.417 21.417 0 0010.133-5.675l241.62-241.344-126.933-126.933-241.6 241.365zm277.248-150.336c8.341 8.341 8.341 21.824 0 30.165l-85.333 85.333a21.275 21.275 0 01-15.083 6.251 21.277 21.277 0 01-15.083-6.251c-8.341-8.341-8.341-21.824 0-30.165l85.333-85.333c8.342-8.341 21.825-8.341 30.166 0z"/></svg>
                <svg onclick="window.location.href= './remove?index=${index}'" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#e21b1b" d="M404.176 0L256 148.176 107.824 0 0 107.824 148.176 256 0 404.176 107.824 512 256 363.824 404.176 512 512 404.176 363.824 256 512 107.824z"/></svg>
            </div>
        `
    })
    res.send(`
        <style>
            div svg {
                display: none
            }
            div:hover svg {
                display: inline-block
            }
        </style>
        <h1>My Todos</h1>
        <form method="post" action="/save">
            <input type="text" name="task">
            <button>Add</button>
        </form>
        <p>${todosDom.join('')}</p>
    `)
})

app.get('/save', function(req, res) {
    const newTask = req.query.task
    const newTodo = new Todo({task: newTask, isDone: false})
    newTodo.save().then(function(result) {
        console.log(result)
        res.redirect('/')
    })
    .catch(function(err) {
        console.log(err)
    })
})
app.post('/save', function(req, res) {
    const newTask = req.body.task.trim()
    if (newTask.length === 0) {
        res.redirect('/')
        return
    }
    const newTodo = {
        task: newTask,
        isDone: false
    }
    todos.push(newTodo)
    res.redirect('/')
})
app.get('/toggle', function(req, res) {
    const todoIndex = req.query.index
    todos[todoIndex]['isDone'] = !todos[todoIndex]['isDone']
    res.redirect('/')
})

app.get('/remove', function(req, res) {
    const todoIndex = req.query.index
    todos.splice(todoIndex, 1)
    res.redirect('/')
})

app.get('/edit', function(req, res) {
    const todoIndex = req.query.index
    const todo = todos[todoIndex]
    res.send(`
        <form method="post" action="/update">
            <input name="task" value="${todo['task']}">
            <input type="hidden" name="index" value="${todoIndex}">
            <button>Save</button>
        </form>
    `)
})

app.post('/update', function(req, res) {
    const todoIndex = req.body.index
    const todoTask = req.body.task
    todos[todoIndex]['task'] = todoTask
    res.redirect('/')
})