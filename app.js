const express = require('express')
const app = express()

// 引入跨域中间件
const cors = require('cors')
app.use(cors())

app.use(express.urlencoded({ extended: false }))

// 响应数据的中间件，要放到路由和 jwt 的前面，因为 jwt 报错直接就到最后接受错误的地方了
app.use(function (req, res, next) {
  // status = 0 为成功； status = 1 为失败； 默认将 status 的值设置为 1，这个函数是为了方便处理失败的情况
  res.cc = function (err, status = 1) {
    res.send({
      // 状态
      status,
      // 状态描述，判断 err 是 错误对象 还是 字符串
      message: err instanceof Error ? err.message : err,
    })
  }
  next()
})

const config = require('./config')
// 解析 token 的中间件
const expressJWT = require('express-jwt')
// 使用 .unless({ path: [/^\/api\//] }) 指定哪些接口不需要进行 Token 的身份认证 这里是指登录和注册的接口不需要 token 认证
app.use(expressJWT({ secret: config.jwtSecretKey }).unless({ path: [/^\/api\//] }))




// 路由从这里开始
const userRouter = require('./router/user')
app.use('/api', userRouter)
// 导入并使用用户信息路由模块
const userinfoRouter = require('./router/userinfo')
// 注意：以 /my 开头的接口，都是有权限的接口，需要进行 Token 身份认证
app.use('/my', userinfoRouter)



const joi = require('joi')
// 错误中间件
app.use(function (err, req, res, next) {
  // 数据验证失败
  if (err instanceof joi.ValidationError) return res.cc(err)
  // 捕获身份认证失败的错误
  if (err.name === 'UnauthorizedError') return res.cc('身份认证失败！')
  // 未知错误
  res.cc(err)
})

app.listen(3007, function () {
  console.log('api server running at http://127.0.0.1:3007')
})