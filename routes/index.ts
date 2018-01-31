import ServerController from "../ServerControl/ServerController";
import MainController from "../ServerControl/MainController";
import ModelDev from "../ServerModel/ModelDev";
import GCDev from "../ServerControl/GameControllerDev";
import { Scenario } from "../ServerModel/Scenario";
import Role from "../ServerModel/Role"
import { Indicator } from "../ServerModel/Indicator"
import { Decision } from "../ServerModel/Decision"
import { GameLogic } from "../ServerModel/gamelogic/mainGameLogic";
import { GameView } from "../ServerView/GameView";
import { Profile } from "../ServerModel/Profile";
import { GameStatus } from "../ServerControl/ServerTimeController";

import express = require('express');//for access to types Response and Request
var csv = require("fast-csv");
var util = require('util');

//For the JSON database
var lowdb = require('lowdb');
var FileSync = require('lowdb/adapters/FileSync');
//Users file
var usersAdapter = new FileSync('./data/users.json');
var usersDB = lowdb(usersAdapter);
//Worlds file
var worldsAdapter = new FileSync('./data/worlds.json');
var worldsDB = lowdb(worldsAdapter);

function makeScenario(): Scenario {
    var ret: Scenario;
    var dec1: Decision = new Decision("SubEast", "Heating subsidies", 0, 0, 100, "E", 'Dec1 describe');
    var dec2: Decision = new Decision("ResEast", "Renewable investments", 0, 0, 100, "F", 'Dec2 describe');
    var dec3: Decision = new Decision("SubWest", "Heating subsidies", 0, 0, 100, "E", 'Dec1 describe');
    var dec4: Decision = new Decision("ResWest", "Renewable investments", 0, 0, 100, "F", 'Dec2 describe');

    //For a new decision
    var newDecision1 = new Decision("newDec1", "New Decision", 0, 0, 100, "D", "New decision description");
    var newDecision2 = new Decision("newDec2", "New Decision", 0, 0, 100, "D", "New decision description");

    var ind1: Indicator = new Indicator("CO<sub>2</sub>", 'CO2Emission', 't/person', 7.56, 2, 'Click to see the CO2 emissions (in annual tonnes per person) in the countries', 2);
    var ind2: Indicator = new Indicator("Comfort", 'comfort', "scale (0-100)", 12, 0, 'Descrip Comfort',2);
    var ind3: Indicator = new Indicator("Air Temperature", 'airtemperature', ' &#x2103;', 13, 0, 'Air Temperature description',2);
    var ind4: Indicator = new Indicator("GDP", 'gdp', "USD/person", 14, 0, 'Describe GDP', 2);
    var ind5: Indicator = new Indicator("CO<sub>2</sub>", 'CO2Emission', 't/person', 7.56, 2, 'Click to see the CO2 emissions (in annual tonnes per person) in the countries', 21);
    var ind6: Indicator = new Indicator("Comfort", 'comfort', "scale (0-100)", 12, 0, 'Descrip Comfort', 21);
    var ind7: Indicator = new Indicator("Air Temperature", 'airtemperature', ' &#x2103;', 13, 0, 'Air Temperature description', 21);
    var ind8: Indicator = new Indicator("GDP", 'gdp', "USD/person", 14, 0, 'Describe GDP', 21);

    var role1: Role = new Role("East", [dec1, dec2], [ind2, ind3, ind4], 'AA3939');
    var role2: Role = new Role("West", [dec3, dec4], [ind5, ind7, ind8], 'AA6C39');
    var role3: Role = new Role("Observer", [], [ind1, ind2, ind3, ind4], '226666');

    //For a new role
    var newRole: Role = new Role("NewRole", [], [ind1, ind4], '226666');

    var ret: Scenario = new Scenario([role1, role2,role3], 2017, 100, 396, 2500, new GameLogic(2), "Scenario 2p","scenario2");
    return ret;
}

var path = ServerController.m_path;
var mainController: MainController = MainController.getInstance();
var scenario = makeScenario();
var view;
var model;

var scenarios: Scenario[] = [scenario];
var scenariosToSendtoClient: { id: string, name: string }[] = [{ id: scenario.getID(), name: scenario.getName() }];

export function backToMain(req: express.Request, res: express.Response) {
    var user = usersDB.get('users').find({ id: parseInt(req.body.id) }).value();
    openFacilitatorMain(user, res, req);
}
export function createWorld(req: express.Request, res: express.Response) {
    var facilitatorID = req.body.facilitatorID;
    var facilitatorName = req.body.facilitatorName;
    var facilitatorPassword = req.body.facilitatorPassword;
    res.render('facilitatorCreateWorld', { title: 'Create new World', year: new Date().getFullYear(), facilitatorID, facilitatorName, facilitatorPassword, path });   
}
export function newWorld(req: express.Request, res: express.Response) {
    var userID = req.body.facilitatorID;
    var user = usersDB.get('users').find({ id: parseInt(userID) }).value();
    var worldName = req.body.newWorldName;
    createNewWorld(user, worldName);
    openFacilitatorMain(user, res, req);
}
export function playerWorldView(req: express.Request, res: express.Response) {
    var worldID: number = parseInt(req.body.worldIdCode);
    var username = req.body.facilitatorName;
    var user = usersDB.get('users').find({ id: parseInt(req.body.facilitatorID) }).value();
    enterWorldAsPlayer(worldID, user, res, req);
}
export function facilitatorWorldView(req: express.Request, res: express.Response) {
    openWorld(parseInt(req.body.worldIdCode), { id: req.body.userID, username: req.body.username }, { player: req.body.permissionsPlayer, controller: req.body.permissionsController }, res);
    
}
export function deleteWorld(req: express.Request, res: express.Response) {
    var worldID: number = parseInt(req.body.worldIdCode);
    var facilitatorID = req.body.userID;

    var newWorldsOwned: number[] = [];
    var user = usersDB.get('users').find({ id: parseInt(facilitatorID) }).value();
    for (var i = 0; i < user.worlds_owned.length; i++) {
        var userWorldID = user.worlds_owned[i];
        if (worldID != userWorldID) {
            newWorldsOwned.push(userWorldID);
        }
    }
    usersDB.get('users').find({ id: parseInt(facilitatorID) }).set("worlds_owned", newWorldsOwned).write();
    //Remove this world from worlds_playing for all users
    var allUsers = usersDB.get('users').value();
    for (var i = 0; i < allUsers.length; i++) {
        var u = allUsers[i];
        var worldsPlaying: number[] = u.worlds_playing;
        var newWorldsPlaying: number[] = [];
        for (var j = 0; j < worldsPlaying.length; j++) {
            var world: number = worldsPlaying[j];
            if (world != worldID) {
                newWorldsPlaying.push(world);
            }
        }
        if (worldsPlaying.length != newWorldsPlaying.length) {
            usersDB.get('users').find({ id: parseInt(u.id) }).set("worlds_playing", newWorldsPlaying).write();
        }
    }
    //Remove world from worlds file
    worldsDB.get('worlds').remove({ idcode: worldID }).write();
    var forceOpenMainScreen = true; //We want to open the main screen even if this player does not have any world now
    openFacilitatorMain(user, res, req, forceOpenMainScreen);
}

export function listOfWorlds(req: express.Request, res: express.Response) {
    var worlds = [];
    var worldsFromJSON = worldsDB.get('worlds').value();
    for (var i = 0; i < worldsFromJSON.length; i++) {
        var world: {
            idcode: number,
            name: string,
            owner: number,
            date: string,
            dateactive: string,
            highscore: number,
            startYear: number
        } = worldsFromJSON[i];

        var gameController = mainController.getGameController(world.idcode);
        if (!gameController && world.idcode != undefined) {
            var score = 49
            var highscore = world.highscore;
            if (!highscore) {
                highscore = 0;
            }
            var statusString = "Paused"
            var time = 0;
            var startYear = world.startYear;
        } else {
            var score = Math.round(gameController.getModel().getScores().c);
            var highscore = Math.round(gameController.getModel().getHighscore());
            var status = gameController.getModel().getView().getStatus();
            var statusString: string;
            switch (status) {
                case GameStatus.running:
                    statusString = "Running";
                    break;
                case GameStatus.finished:
                    statusString = "Finished";
                    break;
                default:
                    statusString = "Paused";
                    break;
            }
            var time = gameController.getModel().getTime();
            var startYear = gameController.getModel().getStartYear();
        }
        var monthNames = ["June", "July", "August", "September", "October", "November", "December", "January", "February", "March", "April", "May"];
        var year = startYear + Math.floor(time / 12);
        var month = Math.floor((time % 12));
        var monthName = monthNames[month];
        var created: Date = new Date(world.date);
        var createdString = created.getDate() + "/" + (created.getMonth() + 1) + "/" + created.getFullYear();
        var lastActive: Date = new Date(world.dateactive);
        var lastActiveString = lastActive.getDate() + "/" + (lastActive.getMonth() + 1) + "/" + lastActive.getFullYear();

        var w = { name: "", idcode: 0, status: "0", month: "", year: 0, score: 0, highscore: 0, speed: 0, scenario: "", lastActive: lastActiveString, created: createdString };
        w.score = score;
        w.highscore = highscore;
        w.status = statusString;
        w.month = monthName;
        w.year = year;
        w.name = world.name;
        w.idcode = world.idcode;
        worlds.push(w);
    }
    res.render('listOfWorlds', { title: 'Worlds', worlds, path });
}
export function facilitatorRemovePlayingWorld(req: express.Request, res: express.Response) {
    var worldID: number = parseInt( req.body.worldIdCode );
    var username = req.body.facilitatorName;
    var facilitatorID = req.body.facilitatorID;
    var gameController = mainController.getGameController(worldID);
    gameController.playerLeaveGame(worldID, username);

    var newWorldsPlaying: number[] = [];
    var user = usersDB.get('users').find({ id: parseInt(facilitatorID) }).value();
    for (var i = 0; i < user.worlds_playing.length; i++) {
        var userWorldID = user.worlds_playing[i];
        if (worldID != userWorldID) {
            newWorldsPlaying.push(userWorldID);
        }
    }
    usersDB.get('users').find({ id: parseInt(facilitatorID) }).set("worlds_playing", newWorldsPlaying).write();
    var forceOpenMainScreen = true; //We want to open the main screen even if this player does not have any world now
    openFacilitatorMain(user, res, req, forceOpenMainScreen);
 }


export function localLoginStartPage(req: express.Request, res: express.Response) {
    res.render('localLogin', {
        title: 'Login',
        path,
        worldID: parseInt(req.param('worldPassword'))
    });
};

export function login(req: express.Request, res: express.Response) {
    var username: string = req.body.userName;
    var password: string = req.body.password;
    var worldID: number = parseInt(req.param('worldID'));
    
    var user = usersDB.get('users').find({ username: username, password: password }).value();
    if (user) {
        console.log("successfully logged in");
        enterWorldAsPlayer(worldID, user, res, req);
    } else {
        res.render('localLoginFail', {
            title: 'Login', path, username, msg: "We did not recognize that user. Please try again."
        });
    }
};
function enterWorldAsPlayer(p_worldID: number, p_user: { id: number, username: string, worlds_owned: number[], worlds_playing: number[] }, p_res, p_req) {
    if (p_worldID) {//If there has been provided a world ID (meaning that this player has been invited to a world)
        var permissions: { player: boolean, controller: boolean } = { player: true, controller: false };
        //If this world is not already registered as a world that the user is playing or that the user owns
        if (p_user.worlds_playing.indexOf(p_worldID) < 0 && p_user.worlds_owned.indexOf(p_worldID) < 0) {
            p_user.worlds_playing.push(p_worldID);
            //Update the worlds_playing list
            usersDB.get('users').find({ id: p_user.id }).set('worlds_playing', p_user.worlds_playing).write();
        } //If this world is owned by the user
        else if (p_user.worlds_owned.indexOf(p_worldID) > -1) {
            permissions = { player: true, controller: true };
        }
        openWorld(p_worldID, p_user, permissions, p_res);
    } else {
        //If no worldID has been provided, just open en the main screen
        openFacilitatorMain(p_user, p_res, p_req);
    }
}
function openFacilitatorMain(p_user: { id: number, username: string, worlds_owned: number[], worlds_playing: number[] }, res: express.Response, req: express.Request, p_forceOpenMainScreen?:boolean) {

    var worlds = [];
    var worlds_playing = [];
    //Create a world for each world the user owns
    for (var i = 0; i < p_user.worlds_owned.length;i++) {
        var id = p_user.worlds_owned[i];
        var world: { idcode: number, name: string, owner: number, date: string, dateactive: string, highscore: number } = worldsDB.get('worlds').find({ idcode: id }).value();
        var gameController = mainController.getGameController(id);
        if (!gameController && id != undefined) {
            view = new GameView(scenario, id, ServerController.getInstance(path).getSocket());
            model = new ModelDev(scenario, view, scenarios);
            if (world.highscore) {
                model.setHighscore(world.highscore)
            }
            view.setModel(model);
            gameController = mainController.createGameController(ServerController.getInstance().getSocket(), id, model, usersDB, worldsDB);
        }
        var w = { name: "", idcode: 0, status: "0", time: 0, score: 0, highscore: 0, speed: 0, scenario: "", startYear: 0 };
        w.score = gameController.getModel().getScores().c;
        w.highscore = gameController.getModel().getHighscore();
        w.speed = gameController.getTimeController().getCurrentSpeed();
        w.status = gameController.getModel().getView().getStatus().toString();
        w.time = gameController.getModel().getTime();
        w.name = world.name;
        w.idcode = id;
        w.scenario = gameController.getModel().getScenario().getName();
        w.startYear = gameController.getModel().getStartYear();
        worlds.push(w);
    }
    //Create a world for each world the user is playing
    for (var i = 0; i < p_user.worlds_playing.length; i++) {
        var id = <number>p_user.worlds_playing[i];
        var world: { idcode: number, name: string, owner: number, date: string, dateactive: string, highscore: number } = worldsDB.get('worlds').find({ idcode: id }).value();
        var gameController = mainController.getGameController(id);
        if (!gameController && i != undefined) {
            view = new GameView(scenario, id, ServerController.getInstance(path).getSocket());
            model = new ModelDev(scenario, view, scenarios);

            console.log("create modelDev " + i + " for " + p_user.username + " for playing");
            view.setModel(model);
            gameController = mainController.createGameController(ServerController.getInstance().getSocket(), id, model, usersDB, worldsDB);
        }
        var w = { name: "", idcode: 0, status: "0", time: 0, score: 0, highscore: 0, speed: 0, scenario: "", startYear: 0  };
        w.score = gameController.getModel().getScores().c;
        w.highscore = world.highscore;
        w.speed = gameController.getTimeController().getCurrentSpeed();
        w.status = gameController.getModel().getView().getStatus().toString();
        w.time = gameController.getModel().getTime();
        w.name = world.name;
        w.idcode = id;
        w.scenario = gameController.getModel().getScenario().getName();
        w.startYear = gameController.getModel().getStartYear();
        worlds_playing.push(w);
    }
    //If the participant has at least one world then open the main screen
    if (p_forceOpenMainScreen || worlds.length || worlds_playing.length) {
        var facilitatorID = p_user.id;
        var facilitatorName = p_user.username;
        var permissions = { player: true, controller: true };

        res.render('facilitatorMain', { title: 'World Coordination', year: new Date().getFullYear(), worlds, worlds_playing, facilitatorID, facilitatorName, path, scenarios: scenariosToSendtoClient, permissions: permissions }, );

    }//If the user has no world then create a new world for the user and take the user directly to this world
    else {
        var worldID = createNewWorld(p_user);
        var permissions = { player: true, controller: true };
        openWorld(worldID, p_user, permissions, res);
    }
}
function createNewWorld(p_owner: { id: number, username: string, worlds_owned: number[], worlds_playing: number[] }, p_worldName?): number {
    var idcodes = [];
    var worlds = worldsDB.get('worlds').value();
    for (var i = 0; i < worlds.length; i++) {
        idcodes.push(worlds[i].idcode);
    }
    //Find an ID that has not been used
    do {
        var free = true;
        var id = Math.floor((Math.random() * 90000) + 10001)
        for (var idc of idcodes) {
            if (idc == id) {
                free = false;
                break;
            }
        }
    } while (free == false);
    var worldName;
    if (p_worldName)
        worldName = p_worldName;
    else
        worldName = "World" + id.toString();
    //Save the world
    worldsDB.get('worlds').push({
        "idcode": id,
        "name": worldName,
        "owner": p_owner.id,
        "date": new Date(Date.now()),
        "dateactive": new Date(Date.now()),
        "highscore": 0,
        "startYear": scenario.getSimulationStart()
    }).write();
    //Update the worlds_owned list
    p_owner.worlds_owned.push(id);
    usersDB.get('users').find({ id: p_owner.id }).set('worlds_owned', p_owner.worlds_owned).write();
    return id;
}

function openWorld(p_worldID, p_user: { id: number, username: string, }, p_permissions, p_res) {
    var gameController = mainController.getGameController(p_worldID);
    if (!gameController) {
        view = new GameView(scenario, p_worldID, ServerController.getInstance(path).getSocket());
        model = new ModelDev(scenario, view, scenarios);
        view.setModel(model);
        gameController = mainController.createGameController(ServerController.getInstance().getSocket(), p_worldID, model, usersDB, worldsDB);
    }
    var profile = gameController.getModel().getProfileFromNickName(p_user.username);
    var newProfile;
    var role;
    var currentRole;
    if (!profile) {
        newProfile = new Profile(p_user.username);
        newProfile.setCurrentRole(gameController.getModel().assignRoleToProfile(newProfile));
        currentRole = newProfile.getCurrentRole();
    }
    else {
        currentRole = profile.getCurrentRole();
        console.log("Player " + profile.getNickName() + " re - entered, retained role: " + profile.getCurrentRole());
    }
    var participants = gameController.getModel().getProfiles();
    var allParticipants = JSON.parse(participants).concat(JSON.parse(gameController.getModel().getOffLineProfiles()));
    var decisions = gameController.getModel().getCurrentDecisions();
    var time = gameController.getModel().getTime();
    var indicators = gameController.getModel().getIndicators(currentRole);
    var overlays = gameController.getModel().getIndicatorData();
    var scores = gameController.getModel().getScores();
    var roles = gameController.getModel().getRoles();
    var clientScenario = gameController.getModel().getClientScenario();
    var status = gameController.getModel().getView().getStatus();
    for (var rol of roles) {
        if (rol.getName() == currentRole)
            currentRole = rol;
    }
    p_res.render('worldView', {
        title: 'PCon',
        username: p_user.username,
        permissions: p_permissions,
        worldID: p_worldID,
        path,
        participants: participants,
        newParticipant: true,
        currentRole: currentRole,
        roles: roles,
        clientScenario: clientScenario,
        overlays: overlays,
        time: time,
        scores: scores,
        status: status,
        allParticipants: allParticipants,
        userID: p_user.id,
        startYear: clientScenario.start
    });
}