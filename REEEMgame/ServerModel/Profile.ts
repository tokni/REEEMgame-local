export class Profile {
    private m_nickName: string;
    private m_currentRole: string;
    private m_permissions: { player: boolean, controller: boolean };

    constructor(p_nickName) {
        this.m_nickName = p_nickName;
    }
    getNickName() {
        return this.m_nickName;
    }
    setNickname(p_nickName) {
        this.m_nickName = p_nickName;
    }
    getCurrentRole() {
        return this.m_currentRole;
    }
    setCurrentRole(p_currentRole) {
        this.m_currentRole = p_currentRole;
    }
    getPermissions(): { player: boolean, controller: boolean } {
        return this.m_permissions;
    }
    setPermissions(player: boolean, controller: boolean) {
        this.m_permissions.player = player;
        this.m_permissions.controller = controller;
    }
    unasignRole() {
        this.m_currentRole = undefined;
    }
}
