
export default class ServerTimeController {
    private m_serverSocket;
    private m_worldID;
    private usersDB;
    private worldsDB;

    constructor(p_serverSocket, p_worldID, p_usersDB, p_worldsDB) {
        this.m_worldID = p_worldID;
        this.m_serverSocket = p_serverSocket;
        this.usersDB = p_usersDB;
        this.worldsDB = p_worldsDB;
    }

    public updateLastActiveInDatabase = () => {
        var date = new Date(Date.now());
        this.worldsDB.get('worlds').find({ idcode: this.m_worldID }).set('dateactive', date).write();
        var data: { worldID: number, date: Date } = { date: date, worldID: this.m_worldID };
        this.m_serverSocket.emit("lastActiveChangedFromServer" + this.m_worldID, data);
    }

    public updateHighScore = (p_highscore: number) => {
        var world = this.worldsDB.get('worlds').find({ idcode: this.m_worldID }).value();
        if (p_highscore > world.highscore) {
            this.worldsDB.get('worlds').find({ idcode: this.m_worldID }).set('highscore', p_highscore).write();
        }
    }
}