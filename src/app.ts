import cluster from 'cluster';
import os from 'os';
import { MasterContext } from './context/master_context';
import { WorkerContext } from './context/worker_context';
import { ServerConfig } from './util/types';

async function Start() {
    process.on("uncaughtException", (error: Error) => {
        if (error.stack !== undefined) {
            console.log(error.stack);
        }
        else {
            console.log(error);
        }

    });

    process.on('warning', (error: Error) => {
        /*
        if (error.code === "DEP0016") {
            return;
        }*/
        console.log(error.stack);
    });

    let args = process.argv.splice(0);

    if (cluster.isPrimary) {
        if (args.length < 2) {
            console.log("usage : [config path] ");
            process.exit(0);
        }

        let config = require(args[2]) as ServerConfig;

        //master의 인자를 worker에 넘긴다.
        cluster.setupPrimary({ exec: args[1], args: [args[2]] });

        const master_context = MasterContext.getInstance();

        let init_info = await master_context.Init(config);

        for (let i = 0; i < os.cpus().length; ++i) {
            let worker = cluster.fork(init_info);
            master_context.AddWorker(worker);
        }
    }
    else {
        let init_info = process.env['init_info'];
        if (init_info !== undefined) {
            init_info = JSON.parse(init_info);
        }

        let config = require(args[2]) as ServerConfig;

        let worker_context = WorkerContext.getInstance();
        await worker_context.Init(config, init_info);
    }
}

Start();