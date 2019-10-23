const Koa = require('koa')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')

const app = new Koa()
const router = new Router()

router
	.get('/', async (ctx) => {
		ctx.body = [
			'<form method="post">',
			'<input type="text" name="username"><br>',
			'<input type="password" name="password"><br>',
			'<button>提交</button>',
			'</form>'
		].join('')
	})
	.post('/', async (ctx) => {
		const { username, password } = ctx.request.body
		ctx.body = {
			username,
			password
		}
	})

app.use(bodyParser())
	.use(router.routes())
	.use(router.allowedMethods())
	.listen(3000, () => {
		console.log('3000端口已监听')
	})
