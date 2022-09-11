// 引入数据库连接
const db = require('../db')
// 引入加密模块
const bcrypt = require('bcryptjs')
// 用这个包来生成 Token 字符串
const jwt = require('jsonwebtoken')
// 导入配置文件
const config = require('../config')

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
  const userinfo = req.body
  const sql = `select * from ev_users where username = ?`
  db.query(sql, [userinfo.username], function (err, results) {
    // 执行 SQL 语句失败
    if (err) return res.cc(err)
    // 执行 SQL 语句成功，但是查询到数据条数不等于 1
    if (results.length !== 1) return res.cc('登录失败！')
    // TODO：判断用户输入的登录密码是否和数据库中的密码一致
    // 拿着用户输入的密码,和数据库中存储的密码进行对比，结果返回一个布尔值
    // 需要注意的是这里拿到的用户输入密码是未加密的，而数据库中的密码是加密过的
    const compareResult = bcrypt.compareSync(userinfo.password, results[0].password)

    // 如果对比的结果等于 false, 则证明用户输入的密码错误
    if (!compareResult) {
      return res.cc('登陆密码错误！')
    }

    // TODO：登录成功，生成 Token 字符串
    // 注意注意注意！在生成 Token 字符串的时候，一定要剔除 密码 和 头像 的值
    // 剔除完毕之后，user 中只保留了用户的 id, username, nickname, email 这四个属性的值
    const user = { ...results[0], password: '', user_pic: '' }
    // 生成 Token 字符串
    const tokenStr = jwt.sign(user, config.jwtSecretKey, {
      expiresIn: config.expiresIn,
    })
    res.send({
      status: 0,
      message: '登录成功！',
      // 为了方便客户端使用 Token，在服务器端直接拼接上 Bearer 的前缀
      token: 'Bearer ' + tokenStr,
    })
  })
}