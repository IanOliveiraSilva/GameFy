const router = require('express').Router();

const routes = [
  { path: '/', view: 'index' },
  { path: '/games', view: 'search-game' },
  { path: '/game/:id', view: 'getGameById' },
  { path: '/create-review/:id', view: 'createReview' },
  { path: '/profile', view: 'profile'},
  { path: '/updateProfile', view: 'updateProfile'},
  { path: '/game-reviews/:id', view: 'getReviewsByGame'},
  { path: '/review/:id', view: 'getReviewById'},
  { path: '/profile/reviews/', view: 'getAllReviews'}
];

routes.forEach((route) => {
  router.get(route.path, (req, res, next) => {
    res.render(route.view);
  });
});

module.exports = router;
