const express = require('express');
const router = express.Router();
const { getUsers, addUser, login, promoteUserToRenter, isfaceMatched, validateUser, userJob, isValidCred } = require('../controllers/userController');
const { userLoginValidation, userRegistrationValidation } = require('../middlewear/validator');
const protect = require('../middlewear/auth');
const compare = require('../middlewear/faceComparision');


// http://localhost:8000/api/v1/users

router.route(`/test`)
      .get(compare, isfaceMatched);

router.route(`/validatetoken`)
      .get(protect, (req,res)=> {
            res.status(200).json({Success:true,Message : 'Token in Valid', responseCode : 200});
      });

router.route(`/isvalidcred`)
      .post(isValidCred);

router.route(`/`)
      .get(protect, getUsers)
      .post(addUser);

router.route(`/validateuserinfo`)
      .post(userRegistrationValidation, validateUser);

router.route(`/job`)
      .post(userJob);

router.route(`/:id`)
      .get(getUsers);

router.route(`/login`)
      .post(userLoginValidation, login);

router.route(`promotetorenter/:id`)
      .put(protect, promoteUserToRenter);



module.exports = router;