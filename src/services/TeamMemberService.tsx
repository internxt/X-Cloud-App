import { getHeaders } from '../lib/auth';


const getTeamMembersByIdTeam = (idTeam: number) => {
    return new Promise((resolve, reject) => {
        fetch(`/api/teams-members/team/${idTeam}`, {
            method: 'get',
            headers: getHeaders(true, false)
        }).then((result: Response) => {
            if (result.status !== 200) { throw result }
            return result.json();
        }).then(result => {
            resolve(result);
        }).catch(err => {
            reject(err);
        });
    });
}

const getTeamMembersByUser = (user: string) => {
    return new Promise((resolve, reject) => {
        fetch(`/api/teams-members/${user}`, {
            method: 'get',
            headers: getHeaders(true, false)
        }).then((result: Response) => {
            if (result.status !== 200) { throw result }
            return result.json();
        }).then(result => {
            resolve(result);
        }).catch(err => {
            reject(err);
        });
    });
}

export {
    getTeamMembersByIdTeam,
    getTeamMembersByUser
};