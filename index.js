var express = require('express');
var bodyParser = require('body-parser');
var validator = require('validator');
var app = express();
var event_arr = [];

app.set('port', (process.env.PORT || 5000));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

// enable CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var mongoUri = process.env.MONGODB_URI || process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/lit-savannah-48405';
var MongoClient = require('mongodb').MongoClient, format = require('util').format;
var db = MongoClient.connect(mongoUri, function(error, databaseConnection) {
	db = databaseConnection;
});

app.use(express.static(__dirname + '/public'));


app.post('/sendData', function(request, response) {
	
	response.set('Content-Type', 'application/json');
	
	var facebook_id = request.body.facebook_id;
	
	var event_name = request.body.event_name;
	
	var event_address = request.body.event_address;
	
	var lat = parseFloat(request.body.lat);
	
	var lng = parseFloat(request.body.lng);
	
	var event_description = request.body.event_description;
	
	var date = request.body.date;

	var starttime = request.body.starttime;
	
	var endtime = request.body.endtime;
	
	var created_by = request.body.created_by;
	
	var created_at = new Date();
	
		
	
		var toInsert = {
				"facebook_id": facebook_id,
				"event_name": event_name,
				"event_address": event_address,
				"lat": lat,
				"lng": lng,
				"event_description": event_description,
				"date": date,
				"starttime": starttime,
				"endtime": endtime,
				"created_by": created_by,
				"created_at": created_at, 
		};
		
		db.collection('event_checkins',function(error,coll) {
			var id = coll.insert(toInsert, function(error, saved) {
					if (error){
						response.send(500);
					}else{
						coll.find().toArray(function(err, event_cursor) {
							event_arr = event_cursor;
							response.send(event_arr);										
						});
					}	
				});	
		});		
		
});	

app.get('/myEvents', function(request,response) {
	
	response.set('Content-Type','application/json');
	var user_query = request.query.facebook_id;
	db.collection('event_checkins').find({"facebook_id":user_query}).toArray(function(err,query_cursor) {
			response.send(query_cursor);
	});
});




app.get('/getEvents', function(request,response) {
	response.set('Content-Type','application/json');
	var current_time = new Date();

	db.collection('event_checkins',function(err,collection){
			if (err){
				response.send(500);
			}else{
				collection.find().toArray(function(er, cursor) {
					for (var count = 0; count < cursor.length; count++){
						var event_date = new Date(cursor[count].date);	
						if (event_date < current_time){
							collection.remove(cursor[count]);
						}
					}
					response.send(cursor);
						
				});
			}
	});
});


app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


