var MongoClient = require('mongodb').MongoClient;
var setting = require('../setting.js');
var crypto = require('crypto');

function _connectDB (callBack) {
    MongoClient.connect(setting.dbURL, function (err, db) {
        callBack(err, db);
    });
};

_init();
//创建索引
function _init () {
    _connectDB(function (err, db) {
        if (err) {
            console.log(err);
            db.close();
            return;
        }
        db.collection('userInfo').createIndex({"name": 1}, null, function (err, result) {
            if (err) {
                console.log(err);
                return;
            }
            console.log('索引创建成功');
        });
    })
}

//查找到与条件匹配的数据
exports.find = function (collectionName, json, C, D) {
    if (arguments.length == 3) {
        //那么参数C就是callback，参数D没有传。
        var callBack = C;
        var skipnumber = 0;
        //数目限制
        var limit = 0;
    } else if (arguments.length == 4) {
        var callBack = D;
        var argums = C;
        //应该省略的条数
        var skipnumber = argums.pageamount * (argums.page - 1) || 0;
        //数目限制
        var limit = argums.pageamount || 0;
        //排序方式
        var sort = argums.sort || {};
    } else {
        throw new Error("find函数的参数个数，必须是3个，或者4个。");
        return;
    }

    _connectDB(function (err, db) {
        if (err) {
            callBack("连接失败",null);
            db.close();
            return;
        }
        var result = [];
        var cursor = db.collection(collectionName).find(json).skip(skipnumber).limit(limit).sort(sort);
        cursor.each(function (err, doc) {
            if (err) {
                callBack("连接失败",null);
                db.close();
                return;
            }
            if (doc != null) {
                result.push(doc);
            } else {
                callBack(null, result);
                db.close();
            }
        });
    });
};

//插入数据库
exports.insertOne = function (collectionName, json, callBack) {
    _connectDB(function (err, db) {
        db.collection(collectionName).insertOne(json, function (err, result) {
            callBack(err, result);
            db.close();
        });
    });
};

//数据更新
exports.updateMany = function (collectionName, json1, json2, callBack) {
    _connectDB(function (err, db) {
        db.collection(collectionName).updateMany(json1, json2, function (err, result) {
            callBack(err, result);
            db.close();
        });
    });
}

//md5加密
exports.md5 = function(pwd) {
    var md5 = crypto.createHash('md5');
    return md5.update(pwd).digest('base64');
};




























