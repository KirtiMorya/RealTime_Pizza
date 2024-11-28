
const homecontroller = require('../app/http/controllers/homecontroller')
const authcontroller = require('../app/http/controllers/authcontroller')
const cartcontroller = require('../app/http/controllers/customers/cartcontroller.js')
const ordercontroller = require('../app/http/controllers/customers/ordercontroller')
const adminOrderController = require('../app/http/controllers/admin/orderController')
const statusController = require('../app/http/controllers/admin/statusController')


const guest = require('../app/http/middleware/guest')
const auth = require('../app/http/middleware/auth')
const admin = require('../app/http/middleware/admin')

function initRoutes(app) {
    app.get('/', homecontroller().index)
    
    app.get('/login',guest, authcontroller().login)
    app.post('/login',authcontroller().postLogin)
    
    app.get('/register',guest, authcontroller().register)
    app.post('/register',authcontroller().postRegister)

    app.post('/logout', authcontroller().logout)

    app.get('/cart',cartcontroller().index)
    app.post('/update-cart',cartcontroller().update)

    app.post('/orders',auth , ordercontroller().store) 
    app.get('/customer/orders',auth, ordercontroller().index) 
    app.get('/customer/orders/:id', auth, ordercontroller().show)

    // Admin routes
    app.get('/admin/orders', admin, adminOrderController().index)
    app.post('/admin/order/status', admin, statusController().update)
    
}

module.exports = initRoutes