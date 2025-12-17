/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

// Controllers
const AuthController = () => import('#controllers/auth_controller')
const DashboardController = () => import('#controllers/dashboard_controller')
const UsersController = () => import('#controllers/users_controller')
const VillesController = () => import('#controllers/villes_controller')
const ArrondissementsController = () => import('#controllers/arrondissements_controller')
const MairiesController = () => import('#controllers/mairies_controller')
const MariagesController = () => import('#controllers/mariages_controller')
const ActesMariageController = () => import('#controllers/actes_mariage_controller')

// Route de test
router.get('/', async () => {
  return {
    name: 'API Gestion Mariage',
    version: '1.0.0',
    status: 'running',
  }
})

// ============================================
// ROUTES PUBLIQUES (sans authentification)
// ============================================
router.group(() => {
  router.post('/login', [AuthController, 'login'])
  router.post('/forgot-password', [AuthController, 'forgotPassword'])
}).prefix('/api/auth')

// ============================================
// ROUTES PROTÉGÉES (authentification requise)
// ============================================
router.group(() => {
  // ---------- AUTHENTIFICATION ----------
  router.group(() => {
    router.post('/logout', [AuthController, 'logout'])
    router.get('/me', [AuthController, 'me'])
    router.post('/change-password', [AuthController, 'changePassword'])
  }).prefix('/auth')

  // ---------- DASHBOARD ----------
  router.group(() => {
    router.get('/', [DashboardController, 'index'])
    router.get('/stats', [DashboardController, 'stats'])
  }).prefix('/dashboard')

  // ---------- UTILISATEURS ----------
  router.group(() => {
    router.get('/', [UsersController, 'index'])
    router.post('/', [UsersController, 'store'])
    router.get('/:id', [UsersController, 'show'])
    router.put('/:id', [UsersController, 'update'])
    router.delete('/:id', [UsersController, 'destroy'])
    router.post('/:id/toggle-status', [UsersController, 'toggleStatus'])
  }).prefix('/users')

  // ---------- VILLES (Super Admin) ----------
  router.group(() => {
    router.get('/', [VillesController, 'index'])
    router.post('/', [VillesController, 'store'])
    router.get('/:id', [VillesController, 'show'])
    router.put('/:id', [VillesController, 'update'])
    router.delete('/:id', [VillesController, 'destroy'])
  }).prefix('/villes')

  // ---------- ARRONDISSEMENTS (Super Admin) ----------
  router.group(() => {
    router.get('/', [ArrondissementsController, 'index'])
    router.post('/', [ArrondissementsController, 'store'])
    router.get('/:id', [ArrondissementsController, 'show'])
    router.put('/:id', [ArrondissementsController, 'update'])
    router.delete('/:id', [ArrondissementsController, 'destroy'])
  }).prefix('/arrondissements')

  // ---------- MAIRIES ----------
  router.group(() => {
    router.get('/', [MairiesController, 'index'])
    router.post('/', [MairiesController, 'store'])
    router.get('/:id', [MairiesController, 'show'])
    router.put('/:id', [MairiesController, 'update'])
    router.delete('/:id', [MairiesController, 'destroy'])
    router.get('/:id/stats', [MairiesController, 'stats'])
  }).prefix('/mairies')

  // ---------- MARIAGES ----------
  router.group(() => {
    router.get('/', [MariagesController, 'index'])
    router.post('/', [MariagesController, 'store'])
    router.get('/:id', [MariagesController, 'show'])
    router.put('/:id', [MariagesController, 'update'])
    router.delete('/:id', [MariagesController, 'destroy'])
    router.post('/:id/validate', [MariagesController, 'validate'])
  }).prefix('/mariages')

  // ---------- ACTES DE MARIAGE ----------
  router.group(() => {
    router.get('/', [ActesMariageController, 'index'])
    router.post('/generate', [ActesMariageController, 'generate'])
    router.get('/:id', [ActesMariageController, 'show'])
    router.post('/:id/validate', [ActesMariageController, 'validate'])
    router.post('/:id/print', [ActesMariageController, 'markPrinted'])
    router.post('/:id/cancel', [ActesMariageController, 'cancel'])
  }).prefix('/actes')

}).prefix('/api').use(middleware.auth())
