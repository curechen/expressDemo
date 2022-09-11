// 引入数据库连接
const db = require('../db')
// 引入加密模块
const bcrypt = require('bcryptjs')

/**
 * 注册的处理函数
 * 1. 检测表单数据是否合法
 * 2. 检测数据库中是否已经有该对象
 * 3. 对密码进行加密
 * 4. 插入新用户
 */
exports.regUser = (req, res) => {
  // 接收表单数据
  const userinfo = req.body
  // 判断数据是否合法
  if (!userinfo.username || !userinfo.password) {
    return res.send({ status: 1, message: '用户名或密码不能为空！' })
  }
  const sql = 'select * from ev_users where username = ?'
  db.query(sql, [userinfo.username], function (err, results) {
    if (err) {
      return res.cc(err.message)
    }
    // 用户名被占用
    if (results.length > 0) {
      // return res.send({ status: 1, message: '用户名被占用啦！' })
      return res.cc('用户名被占用啦！')
    }
    // 对用户的密码,进行 bcrype 加密，返回值是加密之后的密码字符串
    userinfo.password = bcrypt.hashSync(userinfo.password, 10)
    // 定义插入新用户的 SQL 语句
    const sql = 'insert into ev_users (username, password) values (?, ?)'
    // 调用 db.query() 执行 SQL 语句
    db.query(sql, [userinfo.username, userinfo.password], (err, results) => {
      // 判断 SQL 语句是否执行成功
      if (err) return res.cc(err)
      // 判断影响行数是否为 1
      if (results.affectedRows !== 1) return res.cc('注册用户失败，请稍后再试！')
      // 注册用户成功
      res.cc('注册成功！', 0)
    })
  })

}

// 登录的处理函数
exports.login = (req, res) => {
  res.send('login OK')
}