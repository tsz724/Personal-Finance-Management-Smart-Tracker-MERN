const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const workspaceController = require('../controllers/workspaceController');
const jobController = require('../controllers/jobController');
const projectController = require('../controllers/projectController');
const workItemController = require('../controllers/workItemController');
const emailController = require('../controllers/emailController');
const employeeController = require('../controllers/employeeController');
const calendarController = require('../controllers/calendarController');
const { getBusinessSummary, getFullDashboard } = require('../controllers/businessSummaryController');

const router = express.Router();

router.get('/summary', protect, getBusinessSummary);
router.get('/dashboard', protect, getFullDashboard);

router.get('/workspaces', protect, workspaceController.listWorkspaces);
router.post('/workspaces', protect, workspaceController.createWorkspace);
router.get('/workspaces/:id', protect, workspaceController.getWorkspace);
router.put('/workspaces/:id', protect, workspaceController.updateWorkspace);
router.delete('/workspaces/:id', protect, workspaceController.deleteWorkspace);
router.post('/workspaces/:id/members', protect, workspaceController.addMember);
router.delete('/workspaces/:id/members/:userId', protect, workspaceController.removeMember);

router.get('/jobs', protect, jobController.listJobs);
router.post('/jobs', protect, jobController.createJob);
router.put('/jobs/:id', protect, jobController.updateJob);
router.delete('/jobs/:id', protect, jobController.deleteJob);

router.get('/projects', protect, projectController.listProjects);
router.get('/projects/:id', protect, projectController.getProject);
router.post('/projects', protect, projectController.createProject);
router.put('/projects/:id', protect, projectController.updateProject);
router.delete('/projects/:id', protect, projectController.deleteProject);

router.get('/work-items', protect, workItemController.listWorkItems);
router.post('/work-items', protect, workItemController.createWorkItem);
router.put('/work-items/:id', protect, workItemController.updateWorkItem);
router.delete('/work-items/:id', protect, workItemController.deleteWorkItem);

router.get('/emails/unread-count', protect, emailController.unreadCount);
router.get('/emails', protect, emailController.listEmails);
router.post('/emails', protect, emailController.createEmail);
router.put('/emails/:id', protect, emailController.updateEmail);
router.delete('/emails/:id', protect, emailController.deleteEmail);

router.get('/employees', protect, employeeController.listEmployees);
router.post('/employees', protect, employeeController.upsertEmployee);
router.delete('/employees/:id', protect, employeeController.deleteEmployee);

router.get('/calendar', protect, calendarController.listEvents);
router.post('/calendar', protect, calendarController.createEvent);
router.put('/calendar/:id', protect, calendarController.updateEvent);
router.delete('/calendar/:id', protect, calendarController.deleteEvent);

module.exports = router;
