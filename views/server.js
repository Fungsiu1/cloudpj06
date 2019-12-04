const http = require('http');

const url  = require('url');
const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const ObjectId = require('mongodb').ObjectID;
const mongodburl = 'mongodb://123:123@cluster0-shard-00-00-ebdqh.mongodb.net:27017,cluster0-shard-00-01-ebdqh.mongodb.net:27017,cluster0-shard-00-02-ebdqh.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority';
const dbName = 'test';
const fs = require('fs');
const formidable = require('formidable');
const mongoose = require('mongoose');
const restSchema = require('./schema/restaurant');
mongoose.connect(mongodburl,{useMongoClient: true,});
const session = require('cookie-session');
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extened:false}));
const abc = [{
	id:'1',
	name:'mc',
	borough:'tsing_yi',
	cuisine:'hk_food',
	owner:'me'
			}];
app.set('view engine', 'ejs');
////////////////////////////////////////////////////////
///////////////////////////////////////////////////////
app.use(session({
	name: 'username',
	keys: ['dont tell anyone']
  }));

  app.get('/', (req,res) => {
	if (!req.session.name) {  // no name, ask user!
	  res.status(200).render('name.ejs');  // send input form
	} else {
		
		res.redirect('/welcome');// name available, greet user
	}
  })
  app.get('/getname', (req,res) => {

	if (req.query.name.length == 0 ) { // user didn't enter name
	  res.redirect('/');              // ask user again!
	} else if(req.query.name=="demo01"||req.query.name=="demo02"&&req.query.password=="") {
	  
  req.session.name = req.query.name;          // name available
	  res.redirect('/welcome');      
	 
	 // name available
			// greet user
	}
  })
  
  app.get('/welcome', (req,res) => {
	if (req.session.name) {
		res.status(200).render('index.ejs'); 
	  //res.status(200).end(`Hi!  Welcome back ${req.session.name}`);
	} else {
	  res.redirect('/');
	}
  });
  app.get('/getlogout' ,(req,res) => {
	//res.status(200).render('index.ejs'); 
  //res.status(200).end(`Hi!  Welcome back ${req.session.name}`);
//req.session.name.destroy();
res.clearCookie("session");

res.status(200).render('name.ejs'); 
});
 
	 

/////////////////////////////////new
///////////////////////////////////

app.get('/create',(req,res)=>{
	res.render("upload.ejs");
});	
	
	
///////////////////////////////////////////////
////////////////////////////////////////////////
app.post('/uploadrest',(req,res)=>{
	
	let form = new formidable.IncomingForm();
	//let mimetype = "images/jpeg";
	form.parse(req, (err, fields, files) => {
		console.log(JSON.stringify(files));
		if (files.filetoupload.size == 0) {
			res.status(500).end("No file uploaded!");  
		  }
		let restaurantname = files.filetoupload.path;
		if(fields.name){
			var name=(fields.name.length>0)? fields.name:"unname";
			console.log(`name= ${name}`);
		}
		if(fields.borough){
			var borough=(fields.borough.length>0)? fields.borough:"unborough";
			console.log(`borough= ${borough}`);
		}
		if(fields.cuisine){
			var cuisine=(fields.cuisine.length>0)? fields.cuisine:"uncuisine";
			console.log(`cuisine= ${cuisine}`);
		}
		if(fields.street){
			var street=(fields.street.length>0)? fields.street:"unstreet";
			console.log(`street= ${street}`);
		}
		if(fields.building){
			var building=(fields.building.length>0)? fields.building:"N/A";
			console.log(`building= ${building}`);
		}
		if(fields.zipcode){
			var zipcode=(fields.zipcode.length>0)? fields.zipcode:"N/A";
			console.log(`zipcode= ${zipcode}`);
		}
		if(fields.coord_1){
			var coord_1=(fields.coord_1.length>0)? fields.coord_1:"N/A";
			console.log(`coord_1= ${coord_1}`);
		}if(fields.coord_2){
			var coord_2=(fields.coord_2.length>0)? fields.coord_2:"N/A";
			console.log(`coord_2= ${coord_2}`);
		}if(fields.user){
			var user=(fields.user.length>0)? fields.user:"N/A";
			console.log(`user= ${user}`);
		}
		if(fields.score){
			var score=(fields.score.length>0)? fields.score:"N/A";
			console.log(`score= ${score}`);
		}
		if(fields.owner){
			var owner=(fields.owner.length>0)? fields.owner:"N/A";
			console.log(`owner= ${owner}`);
		}
		if (files.filetoupload.photo_mimetype) {
			var photo_mimetype = files.filetoupload.photo_mimetype;
			console.log(`photo_mimetype = ${photo_mimetype}`);
		  }
		/*if (!photo_mimetype.match(/^image/)) {
			res.status(500).end("Upload file not image!");
			return;
		  }*/
		  fs.readFile(restaurantname, (err,data) => {
			let client = new MongoClient(mongodburl);
			let Schema= mongoose.model('rest',restSchema);
			//let mimetype = "images/jpeg";
			
			client.connect((err) => {
			  try {
				assert.equal(err,null);
			  } catch (err) {
				res.status(500).end("MongoClient connect() failed!");
			  }
			  const db = client.db(dbName);
			  let new_r = {};
			  new_r['name'] = name;
			  new_r['borough'] = borough;
			  new_r['cuisine'] = cuisine;
			  new_r['street'] = street;
			  new_r['building'] = building;
			  new_r['zipcode'] = zipcode;
			  new_r['coord_1'] = coord_1;
			  new_r['coord_2'] = coord_2;
			  new_r['user'] = user;
			  new_r['score'] = score;
			  new_r['owner'] = owner;
			 // new_r['photo_mimetype'] = photo_mimetype;
			  new_r['image'] = new Buffer.from(data).toString('base64');
			  insertrestaurant(db,new_r,(result) => {
				client.close();
				res.status(200).end('Photo was inserted into MongoDB!');
				//res.render('back.ejs');
				//res.redirect('/');
				//res.render('listrestaurant.ejs');
			  });
			});
		  });

});
});

app.get('/edit',(req,res)=>{
	
	res.render("edit.ejs");
});
app.post('/updatedit',(req,res,parsedurl,db)=>{
	
	mongoose.connect(mongodburl,{useMongoClient: true,});
	db = mongoose.connection;
	updateDoc(res,parsedurl.query.id,rest);
	
	res.render("edit.ejs");
	/*db.once('open',function(callback){
		var rest = mongoose.model('rest', restSchema);
		rest.findOne({_id: ObjectId(_id)},(err, result)=>{
			result.save(function(err){
				if(err) throw err
				console.log("Updated");
	
			})
			console.log(result);
			result.toArray((docs)=>{
				assert.equal(err,null);
				callback(docs);
				
			});
	
		})
	})*/
	
	
});

  /////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////

app.get('/restaurant', (req,res) => {
	
	let client = new MongoClient(mongodburl);
	client.connect((err) => {
	  try {
		assert.equal(err,null);
	  } catch (err) {
		res.status(500).end("MongoClient connect() failed!");
	  }
	  console.log('Connected to MongoDB');
	  const db = client.db(dbName);
	  findRestaurants(db,{},(rest) => {
		client.close();
		console.log('Disconnected MongoDB');
		res.render("listrestaurant.ejs",{rest:rest});
	  });
	});
  });


  app.get('/showdetails', (req,res) => {
	let client = new MongoClient(mongodburl);
	client.connect((err) => {
	  try {
		assert.equal(err,null);
	  } catch (err) {
		res.status(500).end("MongoClient connect() failed!");
	  }      
	  console.log('Connected to MongoDB');
	  const db = client.db(dbName);
	  let criteria = {};
	  criteria['_id'] = ObjectId(req.query._id);
	  showdetails(db,res,criteria={},req.query._id,(rest) =>{
		client.close();
		console.log('Disconnected MongoDB');
		res.render("listdetail.ejs",{rest:rest});
		let image = new Buffer.from(rest[0].image,'base64');        
        let contentType = {};
		contentType['Content-Type'] = rest[0].mimetype;
		res.end(image);
		console.log('many bugssssssssssssss');
	  });
	 

	});
});

const updateDoc = (res,newDoc,rest,db) => {
	console.log(`updateDoc() - ${JSON.stringify(newDoc)}`);
	if (Object.keys(newDoc).length > 0) {
		const client = new MongoClient(mongodburl);
		client.connect((err) => {
			assert.equal(null,err);
			console.log("Connected successfully to server");
			const db = client.db(dbName);
			let criteria = {};
			criteria['_id'] = ObjectId(newDoc._id);
			delete newDoc._id;
			
			//req.query.rest[i].borough=req.query.borough;
			console.log();
			db.collection('rest').replaceOne(criteria,newDoc,(err,result) => {
				assert.equal(err,null);
				console.log(JSON.stringify(result));
				//res.writeHead(200, {"Content-Type": "text/html"});
				//res.write('<html><body>');
				//res.write(`Updated ${result.modifiedCount} document(s).\n`);
				//.end('<br><a href=/read?max=5>Home</a>');				
			});
		});
	}}



app.get('/delete',(req,res)=>{
	//let parsedURL = url.parse(req.url,true);
	let client = new MongoClient(mongodburl);
	client.connect((err) => {
	  try {
		assert.equal(err,null);
	  } catch (err) {
		res.status(500).end("MongoClient connect() failed!");
	  }
	  console.log('Connected to MongoDB');
	  const db = client.db(dbName);
	  console.log('Connected to MongoDB');
	  deleteDoc(db,criteria={},req.query._id,(rest)=>{
		client.close();
		console.log('Disconnected MongoDB');
		//res.render("deletesucess.ejs",{rest:rest});
		res.render("index.ejs");
	  });
	});
});




  const findRestaurants = (db, criteria, callback) => {
	console.log(`findRestaurants(), criteria = ${JSON.stringify(criteria)}`);
	let criteriaObj = {};
	try {
		criteriaObj = JSON.parse(criteria);
	} catch (err) {
		console.log('Invalid criteria!  Default to {}');
	}
	cursor = db.collection('rest').find(criteriaObj).sort({name: -1}); 
	cursor.toArray((err,docs) => {
		assert.equal(err,null);
		//console.log(docs);
		callback(docs);
	});
}


const showdetails = (res,req,criteria,_id,callback) => {
	const client = new MongoClient(mongodburl);
	client.connect((err) => {
		assert.equal(null,err);
		console.log("Connected successfully to server");		
		const db = client.db(dbName);
		//let criteriaObj = {};
		//criteriaObj = JSON.parse(criteria);
		cursor = db.collection('rest').find({_id: ObjectId(_id)});

		cursor.toArray((err,docs) => {
			assert.equal(err,null);
			client.close();
			console.log('Disconnected MongoDB');
			console.log('many bugs');
			callback(docs);
			
		});
	});
}

const deleteDoc = (res,criteria,_id,callback,req,url,parse) => {
	
	let criteriaObj = {};
	try {
		criteriaObj = JSON.parse(criteria);
	} catch (err) {
		console.log(`${criteria} : Invalid criteria!`);
	}
	//if (Object.keys(criteriaObj).length > 0)	
	try{
		console.log("get_delete_fun");
		//let parsedURL = url.parse(req.url,true);
		//let Schema= mongoose.model('restaurantSchema',restSchema);
		//Schema.remove(parsedURL.query.id);
		const client = new MongoClient(mongodburl);
		//console.log(1);
		client.connect((err) => {
			assert.equal(null,err);
			console.log("Connected successfully to server");
			const db = client.db(dbName);
			db.collection('rest').deleteOne({_id: ObjectId(_id)}, (err, result)=>{
				//cursor.deleteOne();
				assert.equal(err,null);
				console.log(result);
				client.close();
				console.log('Disconnected MongoDB');
				callback();		
			
			}
			
			);

				cursor = db.collection('rest').deleteOne({_id: ObjectId(_id)}, (err, result)=>{
				assert.equal(err,null);
				console.log(result);
				client.close();
				console.log('Disconnected MongoDB');
				callback(result);		
			
			});
			/*	res.writeHead(200, {"Content-Type": "text/html"});
				res.write('<html><body>');
				res.write(`Deleted ${result.deletedCount} document(s)\n`);
				res.end('<br><a href=/read?max=5>Home</a>');	
	*/
		});
	} 
	catch(e){

	}
}






function insertrestaurant(db,r,callback) {
	db.collection('rest').insertOne(r,function(err,result) {
	  assert.equal(err,null);
	  console.log("insert was successful!");
	  console.log(JSON.stringify(result));
	  callback(result);
	})
  }


/////////////////////////PhotoUpload///////////////////////

/*app.post('/fileupload', (req,res) => {
  let form = new formidable.IncomingForm();
  form.parse(req, (err, fields, files) => {
    console.log(JSON.stringify(files));
    if (files.filetoupload.size == 0) {
      res.status(500).end("No file uploaded!");  
    }
    let filename = files.filetoupload.path;
    if (fields.title) {
      var title = (fields.title.length > 0) ? fields.title : "untitled";
      console.log(`title = ${title}`);
    }
    if (fields.description) {
      var description = (fields.description.length > 0) ? fields.description : "n/a";
      console.log(`description = ${description}`);
    }
    if (files.filetoupload.type) {
      var mimetype = files.filetoupload.type;
      console.log(`mimetype = ${mimetype}`);
    }

    if (!mimetype.match(/^image/)) {
      res.status(500).end("Upload file not image!");
      return;
    }

    fs.readFile(filename, (err,data) => {
      let client = new MongoClient(mongodburl);
      client.connect((err) => {
        try {
          assert.equal(err,null);
        } catch (err) {
          res.status(500).end("MongoClient connect() failed!");
        }
        const db = client.db(dbName);
        let new_r = {};
        new_r['title'] = title;
        new_r['description'] = description;
        new_r['mimetype'] = mimetype;
        new_r['image'] = new Buffer.from(data).toString('base64');
        insertPhoto(db,new_r,(result) => {
          client.close();
          res.status(200).end('Photo was inserted into MongoDB!');
        });
      });
    });
  });
});
*/

/*
app.get('/photos', (req,res) => {
  let client = new MongoClient(mongodburl);
  client.connect((err) => {
    try {
      assert.equal(err,null);
    } catch (err) {
      res.status(500).end("MongoClient connect() failed!");
    }
    console.log('Connected to MongoDB');
    const db = client.db(dbName);
    findPhoto(db,{},(photos) => {
      client.close();
      console.log('Disconnected MongoDB');
      res.render("photolist.ejs",{photos:photos});
    });
  });
});

app.get('/display', (req,res) => {
  let client = new MongoClient(mongodburl);
  client.connect((err) => {
    try {
      assert.equal(err,null);
    } catch (err) {
      res.status(500).end("MongoClient connect() failed!");
    }      
    console.log('Connected to MongoDB');
    const db = client.db(dbName);
    let criteria = {};
    criteria['_id'] = ObjectId(req.query._id);
    findPhoto(db,criteria,(photo) => {
      client.close();
      console.log('Disconnected MongoDB');
      console.log('Photo returned = ' + photo.length);
      let image = new Buffer(photo[0].image,'base64');     
      console.log(photo[0].mimetype);
      if (photo[0].mimetype.match(/^image/)) {
        res.render('photo.ejs',{photo:photo});
      } else {
        res.status(500).end("Not JPEG format!!!");  
      }
    });
  });
});


function insertPhoto(db,r,callback) {
	db.collection('photo').insertOne(r,function(err,result) {
	  assert.equal(err,null);
	  console.log("insert was successful!");
	  console.log(JSON.stringify(result));
	  callback(result);
	});
  }
  
  const findPhoto = (db,criteria,callback) => {
	const cursor = db.collection("photo").find(criteria);
	let photos = [];
	cursor.forEach((doc) => {
	  photos.push(doc);
	}, (err) => {
	  // done or error
	  assert.equal(err,null);
	  callback(photos);
	})
  }

*/


///////////////////////PhotoUpload/////////////////////////////////////
/*
const findRestaurants = (db, max, criteria, callback) => {
	//console.log(`findRestaurants(), criteria = ${JSON.stringify(criteria)}`);
	let criteriaObj = {};
	try {
		criteriaObj = JSON.parse(criteria);
	} catch (err) {
		console.log('Invalid criteria!  Default to {}');
	}
	cursor = db.collection('restaurant').find(criteriaObj).sort({name: -1}).limit(max); 
	cursor.toArray((err,docs) => {
		assert.equal(err,null);
		//console.log(docs);
		callback(docs);
	});
}

const read_n_print = (res,max,criteria={}) => {
	const client = new MongoClient(mongodburl);
	client.connect((err) => {
		assert.equal(null,err);
		console.log("Connected successfully to server");
		
		const db = client.db(dbName);
		findRestaurants(db, max, criteria, (restaurants) => {
			client.close();
			console.log('Disconnected MongoDB');
			//res.writeHead(200, {"Content-Type": "text/html"});
			//res.write('<html><head><title>Restaurant</title></head>');
		//	res.write('<body><H1>Restaurants</H1>');
			//res.write('<H2>Showing '+restaurants.length+' document(s)</H2>');
			//res.write('<ol>');
			for (r of restaurants) {
				//console.log(r._id);
				//res.write(`<li><a href='/showdetails?_id=${r._id}'>${r.name}</a></li>`)
			}
			//res.write('</ol>');
			//res.end('</body></html>');
		});
	});
}


*/


//app.get('*', (req,res) => {
//	res.redirect('/read');
//});


/*
const server = http.createServer((req,res) => {
	let timestamp = new Date().toISOString();
	console.log(`Incoming request ${req.method}, ${req.url} received at ${timestamp}`);

	let parsedURL = url.parse(req.url,true); // true to get query as object 
	let max = (parsedURL.query.max) ? parsedURL.query.max : 30;

/////////////////////////////////////////////////////


/*	dbb.on('error', console.error.bind(console, 'connection error:'));
	dbb.once('open', (callback) => {
		let Kitten = mongoose.model('Kitten', kittySchema);
		let fluffy = new Kitten({name: 'fluffy', age: 0});
	
		fluffy.save((err) => {
			if (err) throw err
			console.log('Kitten created!')
			dbb.close();
		});
	});
*/
///////////////////////////////////////////////////////
//const server = http.createServer((req,res) => {
	//const parsedURL = url.parse(req.url,true); //true to get query as object

	/*switch(parsedURL.pathname) {
		case '/':
				res.writeHead(200,{"Content-Type": "text/html"});
				res.write('<html><body>');
				res.write('<h2>Welcome</h2>')
				res.write('<form action="/create">');
				//res.write()
				res.write('<button value="Create"></button>')
				res.end('</form></body></html>')
				break;
		case '/create':
			mongoose.connect(mongodburl,{useMongoClient: true,});
			db = mongoose.connection;
			db.on('error', console.error.bind(console, 'connection error:'));
			db.on('error',() => {
				console.error.bind(console, 'connection error:');
				res.writeHead(500,{"Content-Type":"text/plain"});
				res.end('MongoDB connection error!');				
			});
			db.once('open', () => {
				var restaurant = mongoose.model('restaurant', restaurantSchema);
				var new_k = {};
				//new_k['id']= Math.floor(Math.random()*100);
				new_k['street'] = parsedURL.query.street;
				new_k['zipcode'] =parsedURL.query.zipcode;
				new_k['building'] = parsedURL.query.building;
				new_k['coord']=parsedURL.query.coord;
				new_k['borough']=parsedURL.query.borough;
				new_k['cuisine']=parsedURL.query.cuisine;
				//new_k['date']= Date.date(parsedURL.query.date);
				new_k['user']=parsedURL.query.user;
				new_k['score']= parsedURL.query.score;
				new_k['owner']= parsedURL.query.owner;
				new_k['name'] = parsedURL.query.name;
				//new_k['age'] = parsedURL.query.age;
				//new_k['']
				//console.log(new_k['id']);
				var fluffy = new restaurant(new_k);
				// consider calling fluffy.validate() before save()
				fluffy.save(function(err) {
					//if (err) throw err
					if (err) {
						console.log('save() error ' + err.name);
						res.writeHead(500,{"Content-Type":"text/plain"});
						res.end(JSON.stringify(err.name));
					} else {
						console.log('restaurant created!')
						res.writeHead(200,{"Content-Type":"text/plain"});
						res.end("Created: " + JSON.stringify(new_k));
					}
					db.close();
				});
			});
			break;
		case '/delete':
			mongoose.connect(mongodburl,{useMongoClient: true,});
			db = mongoose.connection;
			db.on('error', console.error.bind(console, 'connection error:'));
			db.on('error',() => {
				console.error.bind(console, 'connection error:');
				res.writeHead(500,{"Content-Type":"text/plain"});
				res.end('MongoDB connection error!');				
			});
			db.once('open',() => {
				var Kitten = mongoose.model('restaurant', restaurantSchema);
				Kitten.remove(parsedURL.query,function(err) {
					if (err) throw err
					console.log('documents deleted!')
					dbb.close();
					res.writeHead(200,{"Content-Type":"text/plain"});
					res.end("documents deleted!");
				});
			});
			break;
		default:
			res.writeHead(404,{"Content-Type":"text/plain"});
			res.end("Error: " + parsedURL.pathname + " not implemented!");
	}
});


*/








//////////////////////////////////////////////////////
/*	switch(parsedURL.pathname) {
	/*	case '/imageupload':
			imageupload(res,parsedURL.query.criteria);
			const form = new formidable.IncomingForm();
			form.parse(req, (err, fields, files) => {
			  // console.log(JSON.stringify(files));
			  if (files.filetoupload.size == 0) {
				res.writeHead(500,{"Content-Type":"text/plain"});
				res.end("No file uploaded!");  
			  }
			  const filename = files.filetoupload.path;
			  let title = "untitled";
			  let mimetype = "images/jpeg";
			  if (fields.title && fields.title.length > 0) {
				title = fields.title;
			  }
			  if (files.filetoupload.type) {
				mimetype = files.filetoupload.type;
			  }
			  fs.readFile(files.filetoupload.path, (err,data) => {
				let client = new MongoClient(mongourl);
				client.connect((err) => {
				  try {
					  assert.equal(err,null);
					} catch (err) {
					  res.writeHead(500,{"Content-Type":"text/plain"});
					  res.end("MongoClient connect() failed!");
					  return(-1);
				  }
				  const db = client.db(dbName);
				  let new_r = {};
				  new_r['title'] = title;
				  new_r['mimetype'] = mimetype;
				  new_r['image'] = new Buffer.from(data).toString('base64');
				  insertPhoto(db,new_r,(result) => {
					client.close();
					res.writeHead(200, {"Content-Type": "text/html"});
					res.write('<html><body>Photo was inserted into MongoDB!<br>');
					res.end('<a href="/photos">Back</a></body></html>')
				  })
				});
			  })
			});


			break;
		case '/read':
			read_n_print(res,parseInt(max));
			break;
		case '/showdetails':
			showdetails(res,parsedURL.query._id);
			break;
		case '/search':
			read_n_print(res,parseInt(max),parsedURL.query.criteria);
			break;
		case '/create1':
			insertDoc(res,parsedURL.query.criteria);
			break;
		case '/delete':
			deleteDoc(res,parsedURL.query.criteria);
			break;
		case '/edit':
			res.writeHead(200,{"Content-Type": "text/html"});
			res.write('<html><body>');
			res.write('<form action="/update">');
			res.write(`<input type="text" name="name" value="${parsedURL.query.name}"><br>`);
			res.write(`<input type="text" name="borough" value="${parsedURL.query.borough}"><br>`);
			res.write(`<input type="text" name="cuisine" value="${parsedURL.query.cuisine}"><br>`);
			res.write(`<input type="hidden" name="_id" value="${parsedURL.query._id}"><br>`);
			res.write('<input type="submit" value="Update">')
			res.end('</form></body></html>');
			break;
		case '/update':
			updateDoc(res,parsedURL.query);
			break;
		default:
			res.writeHead(404, {"Content-Type": "text/html"});
			res.write('<html><body>');
			
			//res.write("404 Not Found \n");
			res.end('<br><a href=read?=max>Give this a try instend?</a>');
	}
});*/
/*
const findRestaurants = (db, max, criteria, callback) => {
	//console.log(`findRestaurants(), criteria = ${JSON.stringify(criteria)}`);
	let criteriaObj = {};
	try {
		criteriaObj = JSON.parse(criteria);
	} catch (err) {
		console.log('Invalid criteria!  Default to {}');
	}
	cursor = db.collection('restaurant').find(criteriaObj).sort({name: -1}).limit(max); 
	cursor.toArray((err,docs) => {
		assert.equal(err,null);
		//console.log(docs);
		callback(docs);
	});
}

const read_n_print = (res,max,criteria={}) => {
	const client = new MongoClient(mongodburl);
	client.connect((err) => {
		assert.equal(null,err);
		console.log("Connected successfully to server");
		
		const db = client.db(dbName);
		findRestaurants(db, max, criteria, (restaurants) => {
			client.close();
			console.log('Disconnected MongoDB');
			res.writeHead(200, {"Content-Type": "text/html"});
			res.write('<html><head><title>Restaurant</title></head>');
			res.write('<body><H1>Restaurants</H1>');
			res.write('<H2>Showing '+restaurants.length+' document(s)</H2>');
			res.write('<ol>');
			for (r of restaurants) {
				//console.log(r._id);
				res.write(`<li><a href='/showdetails?_id=${r._id}'>${r.name}</a></li>`)
			}
			res.write('</ol>');
			res.end('</body></html>');
		});
	});
}

const showdetails = (res,_id) => {
	const client = new MongoClient(mongodburl);
	client.connect((err) => {
		assert.equal(null,err);
		console.log("Connected successfully to server");
		
		const db = client.db(dbName);

		cursor = db.collection('restaurant').find({_id: ObjectId(_id)});
		cursor.toArray((err,docs) => {
			assert.equal(err,null);
			client.close();
			console.log('Disconnected MongoDB');
			res.writeHead(200, {"Content-Type": "text/html"});
			res.write(`<html><head><title>${docs[0].name}</title></head>`);
			res.write('<h3>')
			res.write(`<p>Name: ${docs[0].name}</p>`);
			res.write(`<p>Location: ${docs[0].borough}</p>`);
			res.write(`<p>Cuisine: ${docs[0].cuisine}</p>`);
			res.write('</h3>')
			res.write(`<br><a href="/edit?_id=${_id}&name=${docs[0].name}&borough=${docs[0].borough}&cuisine=${docs[0].cuisine}">Edit</a>`)
			res.write('<br>')
			res.write('<br><a href="/read?max=19">Home</a>')
			res.write('<br><a href="/read?max=19">Home</a>')
			res.end('</body></html>');
		});
	});
}

const insertDoc = (res,doc) => {
	let docObj = {};
	try {
		docObj = JSON.parse(doc);
		//console.log(Object.keys(docObj).length);
	} catch (err) {
		console.log(`${doc} : Invalid document!`);
	}
	if (Object.keys(docObj).length > 0) {  // document has at least 1 name/value pair
		const client = new MongoClient(mongodburl);
		client.connect((err) => {
			assert.equal(null,err);
			console.log("Connected successfully to server");
			const db = client.db(dbName);
			db.collection('restaurant').insertOne(docObj,(err,result) => {
				assert.equal(err,null);
				res.writeHead(200, {"Content-Type": "text/html"});
				res.write('<html><body>');
				res.write(`Inserted ${result.insertedCount} document(s) \n`);
				res.end('<br><a href=/read?max=6>Home</a>');					
			});
		});
	} else {
		res.writeHead(404, {"Content-Type": "text/html"});
		res.write('<html><body>');
		res.write(`${doc} : Invalid document!\n`);
		res.end('<br><a href=/read?max=7>Home</a>');	
	}
}

const deleteDoc = (res,criteria) => {
	let criteriaObj = {};
	try {
		criteriaObj = JSON.parse(criteria);
	} catch (err) {
		console.log(`${criteria} : Invalid criteria!`);
	}
	if (Object.keys(criteriaObj).length > 0) {
		const client = new MongoClient(mongodburl);
		client.connect((err) => {
			assert.equal(null,err);
			console.log("Connected successfully to server");
			const db = client.db(dbName);
			db.collection('restaurant').deleteOne(criteriaObj,(err,result) => {
				console.log(result);
				assert.equal(err,null);
				res.writeHead(200, {"Content-Type": "text/html"});
				res.write('<html><body>');
				res.write(`Deleted ${result.deletedCount} document(s)\n`);
				res.end('<br><a href=/read?max=8>Home</a>');					
			});
		});
	} else {
		res.writeHead(404, {"Content-Type": "text/html"});
		res.write('<html><body>');
		res.write("Invalid criteria!\n");
		res.write(criteria);
		res.end('<br><a href=/read?max=9>Home</a>');	
	}
}

const updateDoc = (res,newDoc) => {
	console.log(`updateDoc() - ${JSON.stringify(newDoc)}`);
	if (Object.keys(newDoc).length > 0) {
		const client = new MongoClient(mongodburl);
		client.connect((err) => {
			assert.equal(null,err);
			console.log("Connected successfully to server");
			const db = client.db(dbName);
			let criteria = {};
			criteria['_id'] = ObjectId(newDoc._id);
			delete newDoc._id;
			db.collection('restaurant').replaceOne(criteria,newDoc,(err,result) => {
				assert.equal(err,null);
				console.log(JSON.stringify(result));
				res.writeHead(200, {"Content-Type": "text/html"});
				res.write('<html><body>');
				res.write(`Updated ${result.modifiedCount} document(s).\n`);
				res.end('<br><a href=/read?max=10>Home</a>');				
			});
		});
	} else {
		res.writeHead(404, {"Content-Type": "text/html"});
		res.write('<html><body>');
		res.write("Updated failed!\n");
		res.write(newDoc);
		res.end('<br><a href=/read?max=11>Home</a>');	
	}
}
*/
app.listen(process.env.PORT || 8099);
