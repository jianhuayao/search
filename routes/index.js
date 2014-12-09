var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index');
});

/* handle search request. */
router.get('/search', function(req, res) {
  res.render('list',{ rows: '' });
});


/* handle search post request. */
router.post('/search', function(req, res) {
    var connectionpool = req.connectionpool;
    connectionpool.getConnection(function(err, connection){
    	if(err){
    		console.error('CONNECTION error: ',err);
    		res.statusCode = 503;
    		res.send({
    			result: 'error',
    			err:    err.code
    		});
    	}else{
    		var titles = req.body.title.split(' ');
    		var where = " where 1=1";
    		for(i=0;i<titles.length;i++){
    			where += " and title regexp '"+titles[i]+"'";
    		}
    		connection.query("select title,price from books"+where, function(err,rows){
    			if(err){
    				throw err;
    			}else{
    				/*console.log( rows );
    				res.send({
    					result: 'success',
    					json:   rows,
    					length: rows.length
    				});*/
    				res.render('list', { rows: rows });
    			}
    		});
    		connection.release();
    	}
    });
    
});

module.exports = router;
