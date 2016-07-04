var elasticsearch = require('elasticsearch');

var Cliente = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'info'
});

var indexName = "myindex";

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


function add(document) {
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
                payload: document.payload || {}
            }
        }

    });
}
exports.add = add;

function autoComplete(input) {
    
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
exports.autoComplete = autoComplete;

