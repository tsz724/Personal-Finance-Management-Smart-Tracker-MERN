exports.adminOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authorized' });
    }
    if ((req.user.role || 'employee') !== 'admin') {
        return res.status(403).json({ message: 'Administrator access required' });
    }
    next();
};

exports.managerOrAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authorized' });
    }
    const r = req.user.role || 'employee';
    if (r !== 'admin' && r !== 'manager') {
        return res.status(403).json({ message: 'Manager or administrator access required' });
    }
    next();
};
