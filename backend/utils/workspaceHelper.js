const Workspace = require('../models/Workspace');
const mongoose = require('mongoose');

function memberRole(workspace, userId) {
    if (!workspace || !userId) return null;
    const uid = userId.toString();
    if (workspace.owner && workspace.owner.toString() === uid) {
        return 'owner';
    }
    const m = workspace.members.find((x) => x.user.toString() === uid);
    return m ? m.role : null;
}

async function findWorkspaceForUser(workspaceId, userId) {
    if (!mongoose.isValidObjectId(workspaceId)) return null;
    const ws = await Workspace.findById(workspaceId);
    if (!ws) return null;
    const role = memberRole(ws, userId);
    if (!role) return null;
    return { workspace: ws, role };
}

async function workspaceIdsForUser(userId) {
    const uid = userId.toString();
    const owned = await Workspace.find({ owner: uid }).select('_id');
    const memberWs = await Workspace.find({ 'members.user': uid }).select('_id');
    const ids = new Set([...owned.map((d) => d._id.toString()), ...memberWs.map((d) => d._id.toString())]);
    return [...ids];
}

module.exports = {
    memberRole,
    findWorkspaceForUser,
    workspaceIdsForUser,
};
