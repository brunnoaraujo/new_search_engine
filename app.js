var express = require ('express');
var app = module.exports = express();
var bodyParser = require('body-parser')
var port = '3000';
var util = require('util');
var events = require('events');
var eventEmitter = new events.EventEmitter();

app.listen(port);
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(function(req, res, next){
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,DELETE');
	res.setHeader('Access-Control-Allow-Headers','X-Requested-With, content-type, Authorization');
	next();
})


var elastic = require('./elasticsearch');


app.get('/', function(req,res){

	res.end('Seja bem-vindo ao bsearch');

});

app.get('/entities', function(req,res){
	console.log(req.query.q);
	
	var conteudo;
	
	elastic.getSuggestions(req.query.q).then(
		function (result) {
		
		res.json(result);
		
		console.log(result);
	});
});

app.post('/entities', function(req, res){
	var conteudo;
	elastic.addDocument(req.body).then(function (result) {res.json(result) });

});

app.get('/buscar', function(req,res){
	console.log(req.query.q);
	//elastic.procura(req.query.q);
	res.end("teste");
});





elastic.indexExists().then(function (exists) {
  if (exists) {
    return elastic.deleteIndex();
  }
})
.then(function () {
  return elastic.initIndex().then(elastic.initMapping).then(function () {
    var promises = [
      'Raspberry pi'
    ].map(function (inicio) {
      return elastic.addDocument({
        title: inicio,
        content: "qualquer",
        metadata: {
          titleLength: inicio.length
        }
      });
    });
    return Promise.all(promises);
  });
});
