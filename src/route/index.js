const router = require('express').Router();

const routes = [
  { path: '/', title: 'CritiX' },
  { path: '/search-game', title: 'Get a game'},
  { path: '/createReview', title: 'Create a game review'}
];

routes.forEach((route) => {
  router.get(route.path, (req, res, next) => {
    res.render(route.path.slice(1), { title: route.title });
  });
});

module.exports = router;
