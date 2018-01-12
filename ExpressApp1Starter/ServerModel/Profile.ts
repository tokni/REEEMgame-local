
export class Profile {
    private m_nickName: string;
    //private m_pin: string;
    //private m_profileType: string;
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
    //getPin() {
    //    return this.m_pin;
    //}
    //setPin(p_pin) {
    //    this.m_pin = p_pin;
    //}
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
    //getProfileType() {
    //    return this.m_profileType;
    //}
    //setProfileType(p_profileType) {
    //    this.m_profileType = p_profileType;
    //}
    unasignRole() {
        this.m_currentRole = undefined;
    }
}
