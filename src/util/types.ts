
export interface ServerConfig {
    port: number;
    game_db: string
}

export enum Master2WorkerEnum {
    Init = 1,
}

export enum Worker2MasterEnum {
    WorkerCreateDone = 1,
}
