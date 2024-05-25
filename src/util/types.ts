
import { RowDataPacket } from "mysql2/promise";

export interface ServerDBConfig {
    connectionLimit: number;
    host: string;
    port: number;
    database: string;
    user: string;
    datpasswordabase: string;
}

export interface ServerConfig {
    service_type: string;
    port: number;
    account_db: ServerDBConfig;
}


export interface WorkerInitData {
}

export enum Master2WorkerEnum {
    Init = 1,
}

export enum Worker2MasterEnum {
    WorkerCreateDone = 1,
}

export enum AccountSocialTypeEnum {
    Guest = 1,
    Google = 2,
    Apple = 3,
    Facebook = 4,
}



////////////////////////////////////////////////////////////////
export interface UserIndexResult extends RowDataPacket {
    user_index: number;
}

export interface SocialTypeResult extends RowDataPacket {
    account_type: number;
}

export interface AccountResult extends UserIndexResult, SocialTypeResult {
}