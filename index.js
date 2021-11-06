const apm = require('elastic-apm-node').start({
    // Override service name from package.json
    // Allowed characters: a-z, A-Z, 0-9, -, _, and space
    serviceName: 'apm-node',

    // Set custom APM Server URL (default: http://localhost:8200)
    serverUrl: 'http://localhost:8200',
    centralConfig: false
})

const winston = require('winston');
const { Client } = require('@elastic/elasticsearch')
const { ElasticsearchTransport } = require('winston-elasticsearch');
const { ElasticsearchTransformer } = require('winston-elasticsearch');
const os = require("os");
const hostname = os.hostname();

const esTransportOpts = {
    apm,
    level: 'debug',
    // dataStream: true,
    // client: new Client({
    //     node: 'http://localhost:9200',
    // auth: {
    //     username: 'elastic',
    //     password: 'changeme'
    // },
    //     maxRetries: 5,
    //     requestTimeout: 1000,
    //     sniffOnStart: true
    // }),
    clientOpts: {
        node: 'http://localhost:9200',
        auth: {
            username: 'elastic',
            password: 'changeme'
        }
    },
    transformer: (logData) => {
        // console.log(logData)

        let transformed
        try {
            transformed = ElasticsearchTransformer(logData);
        } catch (err) {
            // console.log(err)
        }
        console.log('Transformed: ', transformed, apm)
        transformed["fields"]["transaction.id"] = apm.currentTraceIds["transaction.id"]
        transformed["fields"]["trace.id"] = apm.currentTraceIds["trace.id"]
        transformed["fields"]["service.name"] = 'apm-node'
        transformed["host.name"] = hostname
        return transformed;
    }
};

const esTransport = new ElasticsearchTransport(esTransportOpts);
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        esTransport
    ]
});

logger.on('error', (error) => {
    console.error('Error in logger caught', error);
});
esTransport.on('error', (error) => {
    console.error('Error in logger caught', error);
});

const app = require('express')()



app.get('/', function (req, res) {
    var err = new Error('Ups, something broke!')
    // logger.error({ level: "error", message: 'err' });
    // logger.info({ level: "error", message: 'err' });
    logger.error('teste1')
    logger.info('teste2')
    throw Error('bvlahhhhh')
    // console.log('aaaaaaa')
    // apm.captureError(err)
    // console.log('aaaaa')
    res.send('Hello World!')

})

app.listen(3000)

//ecs.version:1.11.0 diferenca 1.6.0