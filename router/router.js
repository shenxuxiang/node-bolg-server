var formidable = require('formidable');
var db = require('../model');
var fs = require('fs');
var path = require('path');
var gm = require('gm');
var dt = require('silly-datetime');
//首页
exports.showIndex = function (req, resp, next) {
    resp.render('index.ejs');
};
//首页处理
exports.doIndex = function (req, resp, next) {
    if (req.session.login == '1') {
        db.find('userInfo', {"name": req.session.userName}, function (err, result) {
            if (err) {
                resp.send({
                    code: '0000',
                    content: {
                        'name': req.session.userName,
                        'avatar': 'moren.jpg'
                    }
                })
                return;
            }
            resp.send({
                code: '0000',
                content: {
                    'name': req.session.userName,
                    'avatar': result[0].avatar
                }
            });
        });
    } else {
        resp.send({
            code: '1111',
            content: null
        });
    }
};
//注册页面
exports.showRegiest = function (req, resp, next) {
    resp.render('regist.ejs');
};
//注册助理
exports.doRegist = function (req, resp, next) {
    var form  = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if (err) {
            resp.send({
                code: '1111',
                content: "request_error"
            });
            return;
        }
        var name = fields.userName;
        var password = db.md5(fields.userPassword);
        db.find('userInfo', {
            "name": name,
        }, function (err, result) {
            if (err) {
                resp.send({
                    code: '1111',
                    content: "request_error"
                });
                return;
            }
            if (result.length != 0) {
                resp.send({
                    code: '2222',
                    content: '该用户名已被注册'
                });
            } else if (result.length == 0) {
                db.insertOne("userInfo", {
                    "name": name,
                    "password": password,
                    'avatar': 'moren.jpg'
                }, function (err, result) {
                    req.session.login = '1';
                    req.session.userName = name;
                    req.session.avatar = 'moren.jpg';
                    var hours = 3600000;
                    req.session.cookie.expires = new Date(Date.now() + hours);
                    req.session.cookie.maxAge = hours;
                    resp.send({
                        code: '0000',
                        content: '注册成功'
                    });
                });
            }
        });
    });
};
//登录页面
exports.showLogin = function (req, resp, next) {
    resp.render('login.ejs');
};
//登录处理
exports.doLogin = function (req, resp, next) {
    var form  = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if (err) {
            resp.send({
                code: '1111',
                content: "request_error"
            });
            return;
        }
        var name = fields.userName;
        var password = db.md5(fields.userPassword);
        db.find('userInfo', {"name": name}, function (err, result) {
            if (err) {
                resp.send({
                    code: '1111',
                    content: 'request_error'
                });
                return;
            }
            if (result.length == 1) {
                if (password == result[0].password) {
                    var hours = 3600000;
                    req.session.login = '1';
                    req.session.userName = name;
                    req.session.avatar = 'moren.jpg';
                    req.session.cookie.expires = new Date(Date.now() + hours);
                    req.session.cookie.maxAge = hours;
                    resp.send({
                        code: '0000',
                        content: name
                    });
                } else {
                    resp.send({
                        code: '2222',
                        content: '密码输入不正确'
                    });
                }
            } else if (result.length == 0) {
                resp.send({
                    code: '1111',
                    content: '用户名不存在'
                });
            }
        });
    });
};
//个人设置，头像设置
exports.setInfo = function (req, resp, next) {
    if (req.session.login != '1') {
        resp.redirect('/login');
        return;
    }
    resp.render('setavatar.ejs');
};
//头像上传处理
exports.doSetInfo = function (req, resp, next) {
    var name = req.session.userName;
    var form  = new formidable.IncomingForm();
    form.uploadDir = __dirname + '/../avatar';
    form.parse(req, function (err, fields, files) {
        var oldPath = files.touxiang.path;
        var extName = path.extname(files.touxiang.name);
        var newPath = './avatar/' + name + extName;
        fs.rename(oldPath, newPath, function (err) {
            if (err) {
                resp.send('图片上传失败');
                return;
            }
            db.updateMany('userInfo', {"name": name}, {$set:{"avatar": name + extName}}, function (err, result) {
                if (err) {
                    if (err) {
                        resp.send('图片上传失败');
                        return;
                    }
                }
                req.session.login = '1';
                req.session.userName = name;
                req.session.avatar = name + extName;
                var hours = 3600000;
                req.session.cookie.expires = new Date(Date.now() + hours);
                req.session.cookie.maxAge = hours;
                resp.redirect('/cutpicture');
            })
        })
    })
};

//剪切头像
exports.cutPicture = function (req, resp, next) {
    if (req.session.login != '1') {
        resp.redirect('/login');
        return;
    }
    resp.render('cut.ejs');
};
//剪切头像处理
exports.doCut =  function (req, resp, next) {
    var form  = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var w = +fields.w;
        var h = +fields.h;
        var x = +fields.x;
        var y = +fields.y;
        gm('./avatar/' + req.session.avatar)
        .crop(w, h, x, y)
        .resize(150,150,'!')
        .write('./avatar/' + req.session.avatar, function (err) {
            if (err) {
                resp.send({
                    code: '1111',
                    content: "图片剪切失败"
                });
                return;
            }
            resp.send({
                code: '0000',
                content: "图片剪切成功"
            });
        })
    })
};

//说说页面
exports.shuoShuo = function (req, resp, next) {
    if (req.session.login != '1') {
        resp.send("您还没有登录，快去登陆吧");
        return;
    }
    resp.render('shuoshuo.ejs');
};
//发表说说
exports.faBiao = function (req, resp, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if (err) {
            resp.send({
                code: "1111",
                content: "request_error"
            });
            return;
        }
        insertData = {
            "name": fields.name,
            "comment": fields.comment,
            "avatar": fields.avatar,
            "time": dt.format(new Date(fields.time), 'YYYY-MM-DD HH:mm:ss')
        };
        db.insertOne('comment', insertData, function (err, result) {
            if (err) {
                resp.send({
                    code: "1111",
                    content: "request_error"
                });
                return;
            }
            resp.send({
                code: "0000",
                content: "发表成功"
            });
        })
    });
};
//获取说说
exports.listAll = function (req, resp, next) {

    db.find('comment', {}, {
        "page": 0,
        "pageamount": 0,
        "sort": {"time": -1}
    }, function (err, result) {
        if (err) {
            resp.send({
                code: "1111",
                content: "request_error"
            });
            return;
        }
        resp.send({
            code: '0000',
            content: result
        });
    });
};
























