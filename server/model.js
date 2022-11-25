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
            console.log("Connected db!");
        });
    }
}

class ModelContent extends Model {
    // con.query(sql, function (err, result) {
    //     if (err) throw err;
    //     console.log("Result: " + result);
    // });

    createTable() {
        var sql = `CREATE TABLE chat_content (
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

    insertInto({data}) {
        let content = data['content'] || '';
        let send_date = data['date'] || Date.now();
        let conversion_id = data['conversion_id'] || '';
        let user_id = data['user_id'] || '';
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

    selectAllInConversionTime({conversionId, date}) {
        let conversion_id = conversionId || '';
        var sql = 'SELECT * FROM chat_content WHERE conversion_id = ? AND send_date > ?';
        this.db.query(sql, [conversion_id, date], function (err, result) {
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
    // con.query(sql, function (err, result) {
    //     if (err) throw err;
    //     console.log("Result: " + result);
    // });

    createTable() {
        var sql = `CREATE TABLE chat_user (
            id INT(11) AUTO_INCREMENT PRIMARY KEY,
            name varchar(255),
            log_out_date datetime,
            params INT(11)
        )`;
        this.db.query(sql, function (err, result) {
            if (err) throw err;
            console.log("Table created");
        });
    }

    insertInto({data}) {
        let name = data['name'] || '';
        let log_out_date = Date.now();
        let params = data['params'] || JSON.stringify({});
        let b={name:name,log_out_date:log_out_date, params:params};
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

    selectAllInConversionTime({conversionId, date}) {
        let conversion_id = conversionId || '';
        var sql = 'SELECT * FROM chat_content WHERE conversion_id = ? AND send_date > ?';
        this.db.query(sql, [conversion_id, date], function (err, result) {
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

module.exports = {
    ModelContent, ModelUser, ModelConversion
};
