export abstract class Dialog {
    protected m_id: string;
    constructor() { }
    abstract open(p_data): void; 
    abstract update(p_data): void;
    public getID(): string {
        return this.m_id;
    }
}