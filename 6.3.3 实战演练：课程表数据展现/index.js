/**
 * @author jinxing
 * @date 2020-01-23 14:54
 */
const Koa = require('koa')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')
const mongoose = require('mongoose')

const app = new Koa()
const router = new Router()

async function connect() {
    mongoose.connect('mongodb://localhost/course', { useNewUrlParser: true, useUnifiedTopology: true })
}

async function close() {
    await mongoose.connection.close()
}

const timeRangeSchema = new mongoose.Schema({
    hour: {
        type: Number,
        max: 24,
        min: 8
    },
    minute: {
        type: Number,
        max: 59,
        min: 0
    },
    time: {
        type: Number,
        get() {
            return this.get('hour') * 100 + this.get('minute')
        }
    }
})

const courseSchema = new mongoose.Schema({
    name: String,
    startTime: timeRangeSchema,
    endTime: timeRangeSchema,
    weekday: Number
})

const Course = mongoose.model('Course', courseSchema)

async function getCourseList() {
    return await Course.find().sort({
        'startTime.time': 1
    })
}

async function addCourse(course) {
    // for (let key in course) {
    //     parseInt(course[key]) && (course[key] = parseInt(course[key]))
    // }
    console.log(course)

    // const name = 'c++'
    // const startTime = 8
    // const endTime = 10
    // const weekday = 1
    // const item = await getCourseByTime(startTime, endTime, weekday)
    // if (item) {
    //     throw new Error('当前时间已经安排了课程')
    // }
    return await Course.create({
        name: course.name,
        startTime: { hour: course.startTimeHour, minute: course.startTimeMinute },
        endTime: { hour: course.endTimeHour, minute: course.endTimeMinute },
        weekday: course.weekday
    })
}

// async function getCourseById(id) {
//     return await Course.findById(id)
// }
//

// async function getCourseByTime(start, end, weekday) {
//     return await Course.find({
//         weekday: weekday
//     })
//         .where('startTime.time').gte(start.hour * 100 + start.minute)
//         .where('endTime.time').lte(end.hour * 100 + end.minute)
// }

const JSON_MIME = 'application/json'

router.get('/', async context => {
    context.body = [
        '<!DOCTYPE html>',
        '<html lang="en">',
        '<head>',
        '<meta charset="UTF-8">',
        '<title>Upload File</title>',
        '</head>',
        '<body>',
        '<form method="post" action="/course">',
        '<p>name<input type="text" name="name" id="name" /></p>',
        '<p>startTime',
        '<input type="number" name="startTimeHour" id="startTimeHour" />',
        '<input type="number" name="startTimeMinute" id="startTimeMinute" />',
        '</p>',
        '<p>endTime',
        '<input type="number" name="endTimeHour" id="endTimeHour" />',
        '<input type="number" name="endTimeMinute" id="endTimeMinute" />',
        '</p>',
        '<p>weekday<input type="number" name="weekday" id="weekday" /></p>',
        '<p><input type="submit"></p>',
        '</form>',
        '</body>',
        '</html>'
    ].join('')
})

router.get('/course', async context => {
    context.type = JSON_MIME
    context.body = {
        status: 0,
        data: await getCourseList()
    }
})

router.post('/course', async context => {
    await addCourse(context.request.body)
    context.type = JSON_MIME
    context.body = {
        status: 0
    }
})

app
    .use(bodyParser())
    .use(async (context, next) => {
        await connect()
        await next()
        await close()
    })
    .use(router.routes())
    .use(router.allowedMethods())
    .listen(3000, () => {
        console.log('3000端口已监听')
    })
