const Koa = require('koa')
const Router = require('koa-router')
const bodyParser = require('koa-bodyparser')
const Sequelize = require('sequelize')

const sequelize = new Sequelize('custom', 'root', 'zyx990807', {
    dialect: 'mysql'
})

sequelize
    .authenticate()
    .then(() => {
        console.log('Connected')
    })
    .catch((err) => {
        console.error('Connect failed')
    })

const Customer = sequelize.define('customer', {
    id: {
        type: Sequelize.UUID,
        unqiue: true,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    sex: {
        type: Sequelize.ENUM(['男', '女']),
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    phone: {
        type: Sequelize.STRING
    },
    country: {
        type: Sequelize.STRING
    },
    city: {
        type: Sequelize.STRING
    },
    address: {
        type: Sequelize.STRING
    },
    fullAddress: {
        type: Sequelize.STRING,
        get() {
            return `${this.getDataValue('country')}${this.getDataValue('city')}${this.getDataValue('address')}`
        }
    }
})

async function getAllCustomers() {
    return Customer.findAndCountAll({
        attributes: [
            'id',
            'name',
            'sex',
            'phone',
            'country',
            'city',
            'address',
            'fullAddress',
            'createdAt',
            'updatedAt'
        ],
        order: ['updatedAt']
    })
}

async function getCustomerById(id) {
    return Customer.findOne({
        where: { id }
    })
}

async function getCustomerByName(name) {
    return Customer.findAll({
        where: {
            name: {
                [Sequelize.Op.like]: `${name}%`
            }
        }
    })
}

async function updateCustomer(id, customer) {
    const item = await getCustomerById(id)
    if (item) {
        return item.update(customer)
    } else {
        throw new Error(`the customer with id ${id} is not exit`)
    }
}

async function createCustomer(customer) {
    return Customer.create(customer)
}

async function deleteCustomer(id) {
    const customer = await getCustomerById(id)
    if (customer) {
        return customer.destroy()
    }
}

const router = new Router()
const app = new Koa()

router.get('/customer', async (ctx) => {
    const customers = await getAllCustomers()
    ctx.type = 'jsonMIME'
    ctx.body = {
        status: 0,
        data: customers
    }
})

router.get('/customer/:id', async (ctx) => {
    const customer = await getCustomerById(ctx.params.id)
    ctx.type = 'jsonMIME'
    ctx.body = {
        status: 0,
        data: customer
    }
})

router.get('/customer/name/:name', async (ctx) => {
    const customer = await getCustomerByName(ctx.params.name)
    ctx.type = 'jsonMIME'
    ctx.body = {
        status: 0,
        data: customer
    }
})

router.post('/customer', async (ctx) => {
    const customer = ctx.request.body
    await createCustomer(customer)
    ctx.type = 'jsonMIME'
    ctx.body = {
        status: 0
    }
})

router.put('/customer/:id', async (ctx) => {
    const id = ctx.params.id
    const oCustomer = await getCustomerById(id)
    const nCustomer = Object.assign({}, oCustomer, ctx.request.body)
    await updateCustomer(id, nCustomer)
    ctx.type = 'jsonMIME'
    ctx.body = {
        status: 0
    }
})

router.delete('/customer/:id', async (ctx) => {
    await deleteCustomer(ctx.params.id)
    ctx.type = 'jsonMIME'
    ctx.body = {
        status: 0
    }
})

app.use(bodyParser())
    .use(async (ctx, next) => {
        try {
            await next()
        } catch (e) {
            ctx.type = 'jsonMIME'
            ctx.body = {
                status: -1,
                message: e.message
            }
        }
    })
    .use(router.routes())
    .use(router.allowedMethods())

sequelize
    .sync({ alter: true })
    .then(() => {
        app.listen(3000, () => {
            console.log('3000端口已监听')
        })
    })
    .catch((err) => {
        console.error('Unable to connect to the database:', err)
    })
