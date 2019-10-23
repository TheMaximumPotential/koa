const Koa = require('koa')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')
const multer = require('@koa/multer')
const path = require('path')
const fs = require('fs')

const app = new Koa()
const router = new Router()

const upload = multer({
	dest: 'uploads/'
})
const types = upload.single('avatar')

router.get('/', async (ctx, next) => {
	ctx.response.body = [
		'<!DOCTYPE html>',
		'<html lang="en">',
		'<head>',
		'<meta charset="UTF-8">',
		'<title>Upload File</title>',
		'</head>',
		'<body>',
		'<form method="post" action="/profile" enctype="multipart/form-data">',
		'选择图片：<input name="avatar" id="upfile" type="file" /><br>',
		'<input type="submit" value="提交" />',
		'</form>',
		'</body>',
		'</html>'
	].join('')
})

router.post('/profile', types, (ctx) => {
	const { originalname, path: out_path, mimetype } = ctx.file
	let newName = out_path + path.parse(originalname).ext
	let err = fs.renameSync(out_path, newName)
	let result = ''
	if (err) result = JSON.stringify(err)
	else result = '<h1>uploda success!</h1>'
	ctx.body = result
})
app.use(bodyParser())
	.use(router.routes())
	.use(router.allowedMethods())

app.listen(3000, () => {
	console.log('3000端口已监听')
})
