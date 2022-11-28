var mysql = require('mysql');

class Model {
    constructor() {
        this.db = mysql.createConnection ({
            host: 'localhost',
            user: 'root',
            password: 'password',
            database: 'chat_nodejs'  //tên database muốn kết nối
        });

        this.db.connect(function(err) {
            if (err) throw err;
            console.log("Connected db!" + Date.now());
        });
    }

    runningQuery (db, sql, callBack) {
        db.query(sql , (err, result) => {
            if (err) return 'dmdmdmdmdm';

            return callBack(result)
        })
    }
}

class ModelContent extends Model {
    // con.query(sql, function (err, result) {
    //     if (err) throw err;
    //     console.log("Result: " + result);
    // });

    createTable() {
        var sql = `CREATE TABLE IF NOT EXISTS chat_content (
            id INT(11) AUTO_INCREMENT PRIMARY KEY,
            content TEXT, 
            send_date datetime,
            conversion_id INT(11), 
            user_id INT(11)
        )`;
        this.db.query(sql, function (err, result) {
            if (err) throw err;
            console.log("Table created");
        });
    }

    insertInto({content, date, conversion_id, user_id}) {
        content = content || '';
        let send_date = date || Date.now();
        conversion_id = conversion_id || '';
        user_id = user_id || '';
        let b={content:content,send_date:send_date, conversion_id:conversion_id, user_id:user_id};
        this.db.query('insert into chat_content SET ?', b , function(err, result) {
            if (err) throw err;

            console.log("1 record inserted");

            return result;
        });
    }

    selectAllInConversion({conversionId}) {
        let conversion_id = conversionId || '';
        let sql = 'SELECT * FROM chat_content WHERE conversion_id = ' + mysql.escape(conversion_id);
        this.db.query(sql , function(err, result) {
            if (err) throw err;

            return result;
        });
    }

    selectAllInConversionLimit({conversionId, limit}) {
        let conversion_id = conversionId || '';
        let sql = 'SELECT * FROM chat_content WHERE conversion_id = ' + mysql.escape(conversion_id) + ' order by send_date DESC LIMIT ' + mysql.escape(limit);
        this.db.query(sql , function(err, result) {
            if (err) throw err;

            return result;
        });
    }

    selectAllInConversionTime({conversionId, date, minDate}) {
        let conversion_id = conversionId || '';
        let data = [conversion_id, date]
        var sql = 'SELECT * FROM chat_content WHERE conversion_id = ? AND send_date >= ?';
        if (minDate !== '') {
            sql += ' AND send_date <= ?'
            data.push(minDate)
        }
        this.db.query(sql, data, function (err, result) {
            if (err) throw err;

            return result;
        });
    }

    deleteConversion({conversionId}) {
        let conversion_id = conversionId || '';
        var sql = 'DELETE FROM chat_content WHERE conversion_id = ?';
        this.db.query(sql, conversion_id, function (err, result) {
            if (err) throw err;
            console.log("Number of records deleted: " + result.affectedRows);
        });
    }

}

class ModelUser extends Model {
    createTable() {
        var sql = `CREATE TABLE IF NOT EXISTS chat_user (
            id INT(11) AUTO_INCREMENT PRIMARY KEY,
            username varchar(255),
            password varchar(255),
            log_out_date datetime,
            params TEXT
        )`;
        this.db.query(sql, function (err, result) {
            if (err) throw err;
            console.log("Table created");
        });
    }

    insertInto({userName, params, password}) {
        let username = userName || '';
        let log_out_date = Date.now();
        params = params || JSON.stringify({});
        let b={username:username,password:password,log_out_date:log_out_date, params:params};
        this.db.query('insert into chat_user SET ?', b , function(err, result) {
            if (err) throw err;

            console.log("1 record inserted");

            return result;
        });
    }

    updateInto({data}) {
        let sql = 'UPDATE chat_user SET '
        let b=[]

        if (typeof data.username !== 'undefined') {
            sql += 'username=?'
            b.push(data.username)
        }
        if (typeof data.log_out_date !== 'undefined') {
            sql += ',log_out_date=?'
            b.push(data.log_out_date)
        }
        if (typeof data.password !== 'undefined') {
            sql += ',password=?'
            b.push(data.password)
        }
        if (typeof data.params !== 'undefined') {
            sql += ',params=?'
            b.push(data.params)
        }
        b.push(data.id)

        this.db.query(sql + ' WHERE id = ?', b , function(err, result) {
            if (err) throw err;

            console.log("1 record inserted");

            return result;
        });
    }

    selectUser({userId, userName, callback}) {
        var sql = ''
        if (userName !== '') {
            sql = 'SELECT * FROM chat_user WHERE username = ' + mysql.escape(userName);
        } else if (userId) {
            sql = 'SELECT * FROM chat_user WHERE id = ' + mysql.escape(userId);
        }
        if (sql !== '') {
            var db = this.db
            return new Promise(function(resolve) {
                this.runningQuery(db, sql, (data) => {

                })
                db.query(sql , (err, result) => {
                    if (err) return 'dmdmdmdmdm';

                    return result

                }).then((data) => {
                    return data
                });
            });

        } else {
            return 'dm'
        }
    }
}
class ModelConversion extends Model {
    createTable() {
        var sql = `CREATE TABLE IF NOT EXISTS chat_conversion (
            id INT(11) AUTO_INCREMENT PRIMARY KEY,
            name varchar(255),
            users TEXT
        )`;
        this.db.query(sql, function (err, result) {
            if (err) throw err;
            console.log("Table created");
        });
    }

    insertInto({data}) {
        let name = data['name'] || '';
        let users = data['users'] || JSON.stringify({});
        let b={name:name, users:users};
        this.db.query('insert into chat_conversion SET ?', b , function(err, result) {
            if (err) throw err;

            console.log("1 record inserted");

            return result;
        });
    }

    updateInto({data}) {
        let sql = 'UPDATE chat_conversion SET '
        let b=[]

        if (typeof data['name'] !== 'undefined') {
            sql += 'name=?'
            b.push(data['name'])
        }
        if (typeof data['users'] !== 'undefined') {
            sql += ',users=?'
            b.push(data['users'])
        }
        b.push(data['id'])

        this.db.query(sql + ' WHERE id = ?', b , function(err, result) {
            if (err) throw err;

            console.log("1 record inserted");

            return result;
        });
    }

    selectConversion({id}) {
        let sql = 'SELECT * FROM chat_conversion WHERE id = ' + mysql.escape(id || '');
        this.db.query(sql , function(err, result) {
            if (err) throw err;

            return result;
        });
    }
}

module.exports = {
    ModelContent, ModelUser, ModelConversion
};
