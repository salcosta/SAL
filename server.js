var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var port = process.env.PORT || 5000;
var collections = {};
var natural = require('natural');
var fs = require('fs');
var configFile = './collections.js';
var jf = require('jsonfile')
var collectionList = jf.readFileSync(configFile);
var _ = require('underscore');

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());


var router = express.Router(); // get an instance of the express Router

router.post('/:collection', function(req, res) {
    var collection = req.params.collection;
    var text = req.body.text;
    var dimensions = JSON.parse( req.body.dimensions );

  
    if( collections[collection] === undefined ){
    	createCollection(collection, dimensions);
    }

    trainDimensions(collection, dimensions, text);

    res.send({ "status" : "trained"})
});

router.delete('/:collection',function(req,res){
    var collection = req.params.collection;

    deleteCollection(collection)
    
    res.send({ "status" : "deleted"})
});

router.get('/:collection', function(req, res) {
    var collection = req.params.collection;
    var text = req.query.text;
    
    res.send( classifyText(collection, text));
    
});

app.use('/api', router);
loadCollections();
app.listen(port);

console.log('Magic happens on port ' + port);

function deleteCollection(collection){
    _.each(collectionList[collection].dimensions, function(dimension){
        console.log(dimension)
        fs.unlinkSync(collection + '.' + dimension + '.json')
    });  

    delete collections[collection];
    delete collectionList[collection];
    saveConfig();
}

function classifyText(collection, text){
    console.log(text)
	var result = {};

	_.each(collections[collection].dimensions, function(classifier, key){

		result[key] = classifier.classify(text);
		
	});

	return result
}

function createCollection(collection, dimensions){
	collections[collection] = {
		name : collection,
		dimensions : {}
	};
	collectionList[collection] = {
		name : collection,
		dimensions : []
	};

	_.each(dimensions, function(dimension, index){
		console.log(dimension)

		collections[collection].dimensions[index] = new natural.BayesClassifier();
		collectionList[collection].dimensions.push(index);
	});

	saveConfig();
}

function trainDimensions(collection, dimensions, text){
	_.each(dimensions, function(dimension,index){
		collections[collection].dimensions[index].addDocument(text, dimension );
	});	

	_.each(dimensions, function(dimension,index){
		collections[collection].dimensions[index].train();
		collections[collection].dimensions[index].save(collection + '.' + index + '.json', function(err, classifier) { } );
    
	});	
	

}

function saveConfig(){
	jf.writeFileSync(configFile, collectionList);
	console.log("Saved config")
}

function loadCollections(){

	_.each(collectionList, function(collection, key, list){
		collections[key] = { name: key, dimensions : {} };

		_.each(collection.dimensions, function(dimension, index){
			natural.BayesClassifier.load( key + '.' + dimension + '.json', null, function(err, classifier) { 
                console.log("Loading " + key + " " + dimension);
				collections[key].dimensions[dimension] = classifier;
			} );

		});
	});	

}