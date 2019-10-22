const Koa = require('koa')
const Router = require('koa-router')
const queryString = require('querystring')
const bodyParser = require('koa-bodyparser')
const axios = require('axios')

const app = new Koa()
const router = new Router()

const service = {
	search: async () => {
		return axios
			.get(
				'https://m.toutiao.com/list/?tag=__all__&ac=wap&count=20&format=json_raw&as=A1353D8ACEFF1DD&cp=5DAE4F51FDADCE1&min_behot_time=0&_signature=MsyXcQAAb2g7gO1kRnLdLTLMl2&i='
			)
			.then((res) => res.data)
	}
}

router.get('/api/dataList', async (ctx, next) => {
	const data = await service.search()
	ctx.body = data
})

app.use(router.routes()).use(router.allowedMethods())

app.listen(3000, () => {
	console.log('3000端口已监听')
})
