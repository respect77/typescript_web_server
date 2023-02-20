'use strict';
import express, { Express, Request, Response, NextFunction } from 'express';
import { MySqlModule } from '../util/mysql_modules';
import * as utils from '../util/utils';
import { Master2WorkerEnum, ServerConfig, Worker2MasterEnum } from '../util/types';
import { MongodbModule } from '../util/mongodb_modules';
import { LoginProc } from '../procedure/login';

export class WorkerContext {
    private static instance: WorkerContext;
    config!: ServerConfig;
    
    account_db: MySqlModule;
    game_db: MongodbModule;

    master_message_func_map: Map<Master2WorkerEnum, (msg: any) => any>;

    private constructor() {
        let self = this;
        this.account_db = new MySqlModule();
        this.game_db = new MongodbModule();
        this.master_message_func_map = new Map<Master2WorkerEnum, (msg: any) => any>();
        this.master_message_func_map.set(Master2WorkerEnum.Init, (msg: any) => {
            self.StartServer();
        });

        process.on("message", (data: any) => {
            if (data === undefined) {
                console.log("process.on : data == undefined");
                return;
            }

            if (data["type"] === undefined) {
                console.log(`type == undefined : ${JSON.stringify(data)}`);
                return;
            }

            let func = self.master_message_func_map.get(data["type"]);
            if(func === undefined) {
                console.log(`func === undefined`);
                return;
            }

            var return_value = func(data["value"]);
            if (return_value !== undefined) {
                self.MessageToMaster(return_value.type, return_value.value);
            }
        });
    }
    
    async Init(config: ServerConfig, init_info: any) {
        this.config = config;

        //GlobalLogSetting(config["log_config"]["worker"]);

        try {
            //todo all game_db connect
            let game_db_connect_result = await this.game_db.Connect(config.game_db);
            if(game_db_connect_result === false) {
                console.log(`game_db_connect_result === false`);
                process.exit(0);
            }
        }
        catch (err) {
            console.log(`error : ${err}`);
            process.exit(0);
        }

        this.MessageToMaster(Worker2MasterEnum.WorkerCreateDone, '');
    }

    static getInstance() {
        if (!WorkerContext.instance) {
            WorkerContext.instance = new WorkerContext();
        }
        return WorkerContext.instance;
    }

    MessageToMaster(type: number, value: any) {
        if(process.send === undefined) {
            return;
        }
        process.send({ type, value });
    }

    async StartServer() {
        let self = this;
        var app = express();
    
        var body_parser = require('body-parser');
        //var session = require('express-session');
        //const MongoStore = require('connect-mongo')(session);
    
        app.use(body_parser.json({ limit: '3mb' }));
        app.use(body_parser.urlencoded({ limit: '3mb', extended: true }));
    
        //app.use(SessionBefore);
    
    
        app.use(ConnectStart);
        self.RequestMapping(app);
        var server = app;
    
        const port = self.config.port|80
        server.listen(port, function () {
            console.log(`Start Server port : ${port}`);
        });
        return;
    
        //점검에 따른 접속유무 체크
        async function ConnectStart(request: Request, response: Response, next: NextFunction) {
            console.log(`request`);
            do {
                try {
                    if (['/server_info', '/data_version_info'].includes(request.url) === true) {
                        break;
                    }
                }
                catch (error) {
                    console.log(error);
                    //request.client_context.Error();
                    return;
                }
    
            } while (false);
    
    
            next();
        }
    }

    RequestMapping(app: Express) {
        var Wrapper = function (func: (req: Request, res: Response) => Promise<void>) {
            return async function (req: Request, res: Response) {
                try {
                    await func(req, res);
                }
                catch (error) {
                    console.log(`Wrapper error`);
                    res.status(400).send();
                }
            };
        };
    
        ////////////////////////////    ///////////////////////////////////
        app.post('/login', Wrapper(LoginProc));
        
        app.get('/elb_heart_beat', function (req: Request, res: Response, next: NextFunction) {
            res.status(200).send("ok");
        });
    
        app.post('*', function (req: Request, res: Response, next: NextFunction) {
            console.log(`post *`);
            res.status(400).send();
        });
    
        app.get('*', function (req: Request, res: Response, next: NextFunction) {
            console.log(`get *`);
            res.status(400).send();
        });
    
        app.delete('*', function (req: Request, res: Response, next: NextFunction) {
            console.log(`delete *`);
            res.status(400).send();
        });
    }
    
};