
export interface ServerConfig {
    game_db: string
}

export enum Master2WorkerEnum {
    Init = 1,
}

export enum Worker2MasterEnum {
    WorkerCreateDone = 1,
    Hair = 2,
    Eyebrow = 3,
    Eye = 4,
    Mouse = 5,
    Skin = 6
}
