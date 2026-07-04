import express from "express";
import cicloAvicolaController from "../controllers/cicloAvicolaController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", cicloAvicolaController.getAll);
router.get("/:id", cicloAvicolaController.getById);
router.post("/", cicloAvicolaController.create);
router.put("/:id", cicloAvicolaController.update);

router.get("/:id/calendario", cicloAvicolaController.listCalendario);
router.post("/:id/calendario", cicloAvicolaController.createCalendario);
router.put("/:id/calendario/:itemId", cicloAvicolaController.updateCalendario);
router.delete("/:id/calendario/:itemId", cicloAvicolaController.deleteCalendario);

router.get("/:id/gastos", cicloAvicolaController.listGastos);
router.post("/:id/gastos", cicloAvicolaController.createGasto);
router.put("/:id/gastos/:itemId", cicloAvicolaController.updateGasto);
router.delete("/:id/gastos/:itemId", cicloAvicolaController.deleteGasto);

router.get("/:id/ventas", cicloAvicolaController.listVentas);
router.post("/:id/ventas", cicloAvicolaController.createVenta);
router.put("/:id/ventas/:itemId", cicloAvicolaController.updateVenta);
router.delete("/:id/ventas/:itemId", cicloAvicolaController.deleteVenta);

router.get("/:id/biometrias", cicloAvicolaController.listBiometrias);
router.post("/:id/biometrias", cicloAvicolaController.createBiometria);
router.put("/:id/biometrias/:itemId", cicloAvicolaController.updateBiometria);
router.delete("/:id/biometrias/:itemId", cicloAvicolaController.deleteBiometria);

router.get("/:id/mortalidad", cicloAvicolaController.listMortalidad);
router.post("/:id/mortalidad", cicloAvicolaController.createMortalidad);
router.put("/:id/mortalidad/:itemId", cicloAvicolaController.updateMortalidad);
router.delete("/:id/mortalidad/:itemId", cicloAvicolaController.deleteMortalidad);

router.get("/:id/alimento", cicloAvicolaController.listAlimento);
router.post("/:id/alimento", cicloAvicolaController.createAlimento);
router.put("/:id/alimento/:itemId", cicloAvicolaController.updateAlimento);
router.delete("/:id/alimento/:itemId", cicloAvicolaController.deleteAlimento);

router.get("/:id/consumo-estimado", cicloAvicolaController.listConsumoEstimado);
router.post("/:id/consumo-estimado", cicloAvicolaController.createConsumoEstimado);
router.put("/:id/consumo-estimado/:itemId", cicloAvicolaController.updateConsumoEstimado);
router.delete("/:id/consumo-estimado/:itemId", cicloAvicolaController.deleteConsumoEstimado);

router.get("/:id/sanidad", cicloAvicolaController.listSanidad);
router.post("/:id/sanidad", cicloAvicolaController.createSanidad);
router.put("/:id/sanidad/:itemId", cicloAvicolaController.updateSanidad);
router.delete("/:id/sanidad/:itemId", cicloAvicolaController.deleteSanidad);

export default router;
