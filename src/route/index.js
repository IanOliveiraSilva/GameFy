const router = require('express').Router();

const routes = [
  { path: '/', view: 'index' },
  { path: '/games', view: 'search-game' },
  { path: '/game/:id', view: 'getGameById' },
  { path: '/create-review/:id', view: 'createReview' },
  { path: '/create-list/', view: 'createList'},
  { path: '/profile', view: 'profile'},
  { path: '/updateProfile', view: 'updateProfile'},
  { path: '/game-reviews/:id', view: 'getReviewsByGame'},
  { path: '/review/:id', view: 'getReviewById'},
  { path: '/profile/reviews/', view: 'getAllReviews'},
  { path: '/search-users/', view: 'search-users'},
  { path: '/reviews/:id', view: 'getUserReview'},
  { path: '/lists/:id', view: 'getUserList'},
  { path: '/user/:id', view: 'getUserProfile'},
  { path: '/profile/lists/', view: 'getAllLists'},
  { path: '/list/:id/', view: 'getListById'}
];

routes.forEach((route) => {
  router.get(route.path, (req, res, next) => {
    res.render(route.view);
  });
});

module.exports = router;
