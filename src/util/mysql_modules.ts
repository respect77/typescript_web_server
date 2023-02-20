
import * as mysql from "mysql2/promise";
import { EventEmitter } from "events";
import * as utils from '../util/utils';
export class QueryResult {
    constructor(public result: Array<any>, public error:any = undefined) {}
}

function ErrorReturn(error: any) {
    return new QueryResult([], error);
}

function Return(result: Array<any>) {
    if(Array.isArray(result) === false) {
        return ErrorReturn(`Array.isArray(result) === false`);
    }
    if(result.length === 1 && result[0]["error_code"] !== undefined) {
        return ErrorReturn(`error_code:${result[0]["error_code"]}`);
    }

    return new QueryResult(result);
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
            await utils.Sleep(5 * 1000);
        }
    }

    async Connect(config: any) {
        var self = this;
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

    async QueryPromise(query: string, values: Array<any> = []) {
        try {
            const [rows, fields] = await this.connect_pool.query<Array<any>>(query, values);
            return new QueryResult(rows);
        }
        catch (error) {
            return ErrorReturn(error);
        }
    }
/*
    //todo 처리해야함
    async MultiQueryReturnPromise(query_array: Array<string>) {
        try {
            let connection = await this.connect_pool.getConnection();
            connection.beginTransaction();
            try {
                for (var i in query_array) {
                    await connection.query(query_array[i]);
                }

                await connection.commit();
            }
            catch (error) {
                await connection.rollback();
                throw (error);
            }
            //todo release가 안될 수 있음
            connection.release();
        }
        catch (error) {

            //return ErrorReturn(error);
        }

        //return Return();
    }
*/
    async ProcedurePromise(procedure: string, params: Array<any>) {
        try {
            const [rows, fields] = await this.connect_pool.query<Array<any>>(procedure, params);
            return Return(rows[0]);
        }
        catch (error) {
            return ErrorReturn(error);
        }
    }

    async MultiQueryPromise(query_array: Array<string>) {
        var self = this;

        try {
            var connection = await self.connect_pool.getConnection();
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


