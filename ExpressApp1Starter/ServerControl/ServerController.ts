
//import stylus = require('stylus'); 
import sass = require('node-sass');
import sass_middleware = require('node-sass-middleware');
export enum GameStatus { running, paused };

export default class ServerController {
    private m_app;
    private m_server;
    private m_socket;
    
    private m_sass;

    private m_express;
    private m_routes;
    private m_http;
    private m_path;
    private m_open;
    static m_path: string;
    private rt = 0;

    private static ms_instance: ServerController;

    constructor(p_path: string) {
        ServerController.m_path = p_path;
        this.m_express = require('express');
        this.m_routes = require('../routes/index');
        this.m_http = require('http');
        this.m_path = require('path');
        this.m_open = require('opn');
        this.m_http.globalAgent.maxSockets = 100;
        this.m_http.Agent.maxSockets = 100;
        //this.m_sass = require('node-sass-middleware');
        this.m_app = this.m_express();
        this.m_server = this.createServer();
        this.m_socket = require('socket.io')(this.m_server, { path: '/game11/socket.io' });
        this.m_server.listen(this.m_app.get('port'), () => {
            console.log('Express opn server listening on port ' + this.m_app.get('port'));
            //this.m_open('http://localhost:' + this.m_app.get('port'));
        });
        //this.m_server.on('request', (request, response) => {
        //    if (request.url.substring(7, 13) != '/socke' && request.url.substring(7, 13) != 's-publ')
        //    console.log("Request received with url: " + request.url);
        //});
    }
    public static getInstance(p_path: string = ""): ServerController {
        var u = 0;
        if (ServerController.ms_instance)
            return ServerController.ms_instance;
        else {
            ServerController.ms_instance = new ServerController(p_path);
            return ServerController.ms_instance;
        }
    }

    //Create Server
    createServer(): any {
        this.m_app.set('port', process.env.PORT || 6011);
        this.m_app.set('views', this.m_path.join(__dirname, '../views'));
        this.m_app.set('view engine', 'jade');
        this.m_app.use(this.m_express.favicon());
        this.m_app.use(this.m_express.logger('dev'));
        this.m_app.use(this.m_express.json());
        this.m_app.use(this.m_express.urlencoded());
        //this.m_app.use(bodyParser.urlencoded({ extended: true }));
        this.m_app.use(this.m_express.methodOverride());
        this.m_app.use(this.m_app.router);
        console.log("__dirname: " + __dirname);
        this.m_app.use(this.m_express.static(this.m_path.join(__dirname, '../public')));

        // development only
        //if ('production' == this.m_app.get('env')) {
        if ('development' == this.m_app.get('env')) {
            this.m_app.use(this.m_express.errorHandler());
        }
        console.log("befoe routes");
        


        this.m_app.get(ServerController.m_path + 'worlds', this.m_routes.listOfWorlds);
        this.m_app.get(ServerController.m_path + '/worlds', this.m_routes.listOfWorlds);
        this.m_app.get(ServerController.m_path + '/worlds/', this.m_routes.listOfWorlds);
        this.m_app.post(ServerController.m_path + 'backToMain', this.m_routes.backToMain);
        this.m_app.post(ServerController.m_path + '/backToMain', this.m_routes.backToMain);
        
        

        //local login
        this.m_app.get(ServerController.m_path + '/', this.m_routes.localLoginStartPage);
        this.m_app.get(ServerController.m_path + '', this.m_routes.localLoginStartPage); 
        this.m_app.post(ServerController.m_path + '/login', this.m_routes.login);
        this.m_app.post(ServerController.m_path + 'login', this.m_routes.login); 
        
        this.m_app.get(ServerController.m_path + 'REEEMbrowser', this.m_routes.REEEMbrowser)
        this.m_app.get(ServerController.m_path + '/REEEMbrowser', this.m_routes.REEEMbrowser)

        this.m_app.post(ServerController.m_path + 'facilitatorRemovePlayingWorld', this.m_routes.facilitatorRemovePlayingWorld);
        this.m_app.post(ServerController.m_path + '/facilitatorRemovePlayingWorld', this.m_routes.facilitatorRemovePlayingWorld);
        this.m_app.post(ServerController.m_path + 'createWorld', this.m_routes.createWorld);
        this.m_app.post(ServerController.m_path + '/createWorld', this.m_routes.createWorld);
        this.m_app.post(ServerController.m_path + 'facilitatorNewWorld', this.m_routes.newWorld);
        this.m_app.post(ServerController.m_path + '/facilitatorNewWorld', this.m_routes.newWorld);
        this.m_app.post(ServerController.m_path + 'facilitatorWorldView', this.m_routes.facilitatorWorldView);
        this.m_app.post(ServerController.m_path + '/facilitatorWorldView', this.m_routes.facilitatorWorldView);
        this.m_app.post(ServerController.m_path + 'playerWorldView', this.m_routes.playerWorldView);
        this.m_app.post(ServerController.m_path + '/playerWorldView', this.m_routes.playerWorldView);
        this.m_app.post(ServerController.m_path + 'deleteWorld', this.m_routes.deleteWorld);
        this.m_app.post(ServerController.m_path + '/deleteWorld', this.m_routes.deleteWorld);

        this.m_app.use(function (req, res) {
            res.render('defaultRoute', { title: 'Seek and thee shall find' });
        });


        return this.m_http.createServer(this.m_app);
    }

    //handle Conn
    getServer() {
        return this.m_server;
    }
    getSocket() {
        return this.m_socket;
    }

}
