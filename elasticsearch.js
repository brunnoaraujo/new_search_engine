var elasticsearch = require('elasticsearch');

var Cliente = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'info'
});

var indexName = "randomindex";

/**
* Delete an existing index
*/
function deleteIndex() {
    return Cliente.indices.delete({
        index: indexName
    });
}
exports.deleteIndex = deleteIndex;

/**
* create the index
*/
function initIndex() {
    return Cliente.indices.create({
        index: indexName
    });
}
exports.initIndex = initIndex;

/**
* check if the index exists
*/
function indexExists() {
    return Cliente.indices.exists({
        index: indexName
    });
}
exports.indexExists = indexExists;




function initMapping() {
    return Cliente.indices.putMapping({
        index: indexName,
        type: "document",
        body: {
            properties: {
                title: { type: "string" },
                content: { type: "string" },
                suggest: {
                    type: "completion",
                    analyzer: "simple",
                    search_analyzer: "simple",
                    payloads: true
                }
            }
        }
    });
}
exports.initMapping = initMapping;
var conteudo=0;
function addDocument(document) {
    return Cliente.index({
        index: indexName,
        type: "document",
        body: {
            title: document.title,
            content: document.content,
            suggest: {
                input: document.title.split(" "),
                output: document.title,
                //outro: document.content,
                //output2: document.content
                payload: document.metadata || {}
            }
        }

    });
}
exports.addDocument = addDocument;

function getSuggestions(input) {
    
    return Cliente.suggest({
        index: indexName,
        type: "document",
        body: {
            docsuggest: {
                text: input,
                completion: {
                    //field: "suggest",
                    field:"suggest",
                    fuzzy: true
                }
            }
        }   
    });
}
exports.getSuggestions = getSuggestions;


function procura(q){
    Cliente.search({
        q: q,
    }).then(function (body) {
        //eventEmitter.emit('doOutput', {message:'okay', hits:body.hits.hits});
      output({message:'okay', hits:body.hits.hits});

    }, function (error) {
        console.trace(error.message);
    });
}
exports.procura=procura;



function output(data) {

    if(data.hits) {
        str = '';
        for(i=0; i<data.hits.length; i++) {
            var hit = data.hits[i];

            var D = new Date(hit._source.published_at*1000);
            var published = util.format('%s-%s-%s',
                D.getFullYear(), D.getMonth(), D.getDate());

            str += util.format('%s - %s (Score: %s, ID: %s)',
                hit._source.title, published, hit._score, hit._id);
        }
        console.log("str:"+str);
        return str;
        } else {
        return;
    } 
}