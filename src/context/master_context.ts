'use strict';
import { Worker } from 'cluster';

import * as utils from '../util/utils';
import * as types from '../util/types';
import { MongodbModule } from '../util/mongodb_modules';
import { MySqlModule } from '../util/mysql_modules';

export class MasterContext {
    private static instance: MasterContext;
    config!: types.ServerConfig;
    account_db: MySqlModule;
    game_db: MongodbModule;

    worker_list: Array<Worker>;
    //worker_message_func_map: Map<types.Worker2MasterEnum, (msg: any) => any>;

    private constructor() {
        this.account_db = new MySqlModule();
        this.game_db = new MongodbModule()
        this.worker_list = new Array<Worker>();
        /*
        this.worker_message_func_map = new Map<types.Worker2MasterEnum, (msg: any) => any>();
        this.worker_message_func_map.set(types.Worker2MasterEnum.WorkerCreateDone, (msg: any) => {
            return { type: types.Master2WorkerEnum.Init, value: { a: 1 } };
        });
        */
    }

    async Init(config: types.ServerConfig): Promise<types.WorkerInitData> {
        
        this.config = config;

        try {
            let account_db_connect_result = await this.account_db.Connect(config.account_db);
            if (account_db_connect_result === false) {
                console.log(`account_db_connect_result === false`);
                process.exit(0);
            }
        }
        catch (err) {
            console.log(`error : ${err}`);
            process.exit(0);
        }

        //worker에 보낼 초기 데이터를 디비에서 받아온다

        //let r = await this.account_db.QueryPromise<types.AccountResult>("SELECT * FROM account_info_table;")
        
        return "";
    }

    static getInstance() {
        if (!MasterContext.instance) {
            MasterContext.instance = new MasterContext();
        }
        return MasterContext.instance;
    }

    AddWorker(worker: Worker) {
        var self = this;
        self.worker_list.push(worker);

        //worker 부터 메시지를 받는다.
        worker.on('message', (data: any) => {
            /*
            if (data === undefined) {
                console.log("data == undefined");
                return;
            }

            if (data["topic"] === "log4js:message") {
                return;
            }

            if (data["type"] === undefined) {
                console.log(`type == undefined : ${JSON.stringify(data)}`);
                return;
            }

            let func = self.worker_message_func_map.get(data["type"]);
            if (func === undefined) {
                console.log(`func === undefined`);
                return;
            }

            var return_value = func(data["value"]);
            if (return_value !== undefined) {
                worker.send(return_value);
            }*/

        });

        worker.on('exit', (code, signal) => {
            console.log(`죽은 워커의 exit code : ${code}`);
            console.log(`죽은 워커의 signal : ${signal}`);
            //todo fork를 통한 워커를 살릴 필요가 있다
        });

    }
};