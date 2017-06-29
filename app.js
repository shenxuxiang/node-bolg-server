var express = require('express');
var ejs = require('ejs');
var router = require('./router');
var session = require('express-session');
var app = express();
//设置模板引擎
app.set('view engine', 'ejs');
//设置中间件
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));
app.use(express.static('./public'));
app.use(express.static('./avatar'));

//首页
app.get('/', router.showIndex);
//首页请求
app.post('/do', router.doIndex);

//注册页面
app.get('/regist', router.showRegiest);
//用户注册
app.post('/doregist', router.doRegist);

//登录页面
app.get('/login', router.showLogin);
//用户登录
app.post('/dologin', router.doLogin);

//个人设置页面,头像上传
app.get('/setinfo',router.setInfo);
//个人设置页面,头像上传处理
app.post('/dosetinfo',router.doSetInfo);

//头像截切页面
app.get('/cutpicture', router.cutPicture);
//头像剪切处理
app.post('/docut', router.doCut);

//说说页面
app.get('/shuoshuo', router.shuoShuo);
//发表说说
app.post('/fabiao', router.faBiao);
//获取所有说说
app.post('/listall',router.listAll);

app.listen(3000);



































































