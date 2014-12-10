var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index');
});

/* handle search request. */
router.get('/search', function(req, res) {
  res.render('index');
});


/* handle search post request. */
router.post('/search', function(req, res) {
	var keys = req.body.title.trim();
	if(!keys || !/^[0-9a-zA-Z ]+$/.test(keys)){ res.render('index');return;}
	
    var connectionpool = req.connectionpool;
    var current_page = 1;
    if (typeof req.body.current_page != 'undefined'){
    	current_page = req.body.current_page;
    }
    var items_per_page = 20;
    var start_index = (current_page-1) * items_per_page;
    var total_pages = 0;
    
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
    		var where = "where 1=1";
    		for(i=0;i<titles.length;i++){
    			where += " and title regexp '"+titles[i]+"'";
    		}
    		
    		//query the count of records that matches searching key words
    		connection.query("select count(*) as count from books "+where,
     		  function(err,rows){
    			if(err){
    				throw err;
    			}else{
    				total_pages = Math.ceil(rows[0].count/items_per_page);
    			}
    		});
    		
    		//query one page of records according to page num
    		connection.query("select title,price from books "+where+" limit "+start_index+","+items_per_page,
     		  function(err,rows){
    			if(err){
    				throw err;
    			}else{
    				res.render('list', { current_page: current_page, 
    									total_pages:total_pages, 
    									titles: req.body.title, 
    									rows: rows });
    			}
    		});
    		connection.release();
    	}
    });
    
});

module.exports = router;
