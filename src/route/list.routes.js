const router = require("express-promise-router")();
const listController = require("../controllers/list.controller");
const { UserMiddleware } = require("../middlewares/auth-middleware");

const userMiddleware = new UserMiddleware();

router.post("/list/create", userMiddleware.auth, listController.createList);

router.get("/profile/lists", userMiddleware.auth, listController.getAllLists);

router.get("/list/:id", userMiddleware.auth, listController.getListById);

router.get(
  "/user/list/:userProfile",
  userMiddleware.auth,
  listController.getListByUser
);

module.exports = router;
