
import * as mysql from "mysql2/promise";
import { EventEmitter } from "events";
import * as utils from '../util/utils';

export class QueryResult<T extends mysql.RowDataPacket> {
    constructor(public results: Array<T>, public error:any = undefined) {}
}

export class ExecResult {
    constructor(public result: mysql.ResultSetHeader | undefined, public error:any = undefined) {}
}

export class MySqlModule extends EventEmitter {
    config!: any;
    connect_pool!: mysql.Pool
    constructor() {
        super();

        this.on("error", function (error, sql, params, client) {
            console.log("mysql : " + sql + " " + error.stack !== null ? error.stack : error);
        });

        this.on("success", function (result, sql, params, client) {
            console.log("mysql : " + sql);
        });
    }

    async HeartBeat() {
        while(true) {
            try {
                await this.QueryPromise(`SELECT 1;`);
            }
            catch (error) {
                await this.Connect(this.config);
            }
            finally {
                await utils.Sleep(5 * 1000);
            }
        }
    }

    async Connect(config: any) {
        this.config = config;
        this.connect_pool = mysql.createPool(config);

        var connection = await this.connect_pool.getConnection();
        if (connection === undefined) {
            console.log("connection === undefined");
            return false;
        }
        connection.release();

        console.log(`mysql connect done`);
        this.HeartBeat();
        return true;
    }

    async QueryPromise<T extends mysql.RowDataPacket>(query: string, params: Array<any> = []) : Promise<QueryResult<T>>{
        try {
            const [results] = await this.connect_pool.execute<Array<T>>(query, params);
            return new QueryResult(results);
        }
        catch (error) {
            return new QueryResult(new Array<T>, error);
        }
    }

    async ExecPromise(query: string, params: Array<any> = []): Promise<ExecResult> {
        try {
            const [result] = await this.connect_pool.execute<mysql.ResultSetHeader>(query, params);
            return new ExecResult(result);
        }
        catch (error) {
            return new ExecResult(undefined, error);
        }
    }

    async MultiQueryPromise(query_array: Array<string>) {
        try {
            var connection = await this.connect_pool.getConnection();
        }
        catch (error) {
            return error;
        }

        try {
            await connection.beginTransaction();

            for (const query of query_array) {
                await connection.query(query);
            }

            await connection.commit();
        }
        catch (error) {
            await connection.rollback();
        }
        finally {
            connection.release();
        }

        
        return true;
    }
}


