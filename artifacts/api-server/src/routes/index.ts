import { Router, type IRouter } from "express";
import healthRouter from "./health";
import quotesRouter from "./quotes";
import newsRouter from "./news";
import ohlcRouter from "./ohlc";
import finvizRouter from "./finviz";

const router: IRouter = Router();

router.use(healthRouter);
router.use(quotesRouter);
router.use(newsRouter);
router.use(ohlcRouter);
router.use(finvizRouter);

export default router;
