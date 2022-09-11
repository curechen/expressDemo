const express = require('express')
const app = express()

// 响应数据的中间件
app.use(function (req, res, next) {
  // status = 0 为成功； status = 1 为失败； 默认将 status 的值设置为 1，方便处理失败的情况
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

// 引入跨域中间件
const cors = require('cors')
app.use(cors())

app.use(express.urlencoded({ extended: false }))

const userRouter = require('./router/user')
app.use('/api', userRouter)

app.listen(3007, function() {
  console.log('api server running at http://127.0.0.1:3007')
})