const express = require('express');
const router = express.Router();
const  Centercontroller = require('../controllers/Centercontroller');
const Eventcontroller = require('../controllers/Eventcontroller');
const userController = require('../controllers/userController')
const authController = require('../controllers/authController')
const verifyToken = require('../controllers/verifyToken')
const admincontroller = require('../controllers/admincontroller')
const { catchErrors } = require('../handlers/errorhandler')
const bookingcontroller = require('../controllers/bookingController')


const user = require('../models/User')
const multer = require('multer')
const path = require('path')


//CENTER ROUTER
//router.post('/centers',  catchErrors(Centercontroller.createNewCenter));
router.get('/centers/get',  catchErrors(Centercontroller.getAllCenter));
router.get('/centers/get/:id',  catchErrors(Centercontroller.getSingleCenter));
router.delete('/centers/delete/:id',  Centercontroller.deleteSingleCenter)
router.put('/available/:id', catchErrors(Centercontroller.updateSingleCenter))



//EVENT ROUTER
router.post('/events',  catchErrors(Eventcontroller.postNewEvent));
router.get('/events/get', catchErrors(Eventcontroller.getAllEvent));
router.get('/events/get/:id',  catchErrors(Eventcontroller.getSingleEvent));
router.delete('/events/delete/:id', verifyToken, (Eventcontroller.deleteSingleEvent));
router.put('/events/update/:id', verifyToken, catchErrors(Eventcontroller.updateSingleEvent))

//USER ROUTER
router.get('/user/get', catchErrors(userController.getAllUser));

router.get('/user/get/:id', catchErrors(userController.getSingleUser));
router.put('/user/update/:id', verifyToken, catchErrors(userController.updateUser));
router.delete('/user/delete/:id', verifyToken, catchErrors(userController.deleteUser))

//AUTH ROUTES
router.post('/register', catchErrors(authController.encodePassword));
router.post('/login', authController.loginUser)
router.get('/gettokens',  catchErrors(authController.decodePassword));

//FORGOT PASSWORD ROUTES
router.post('/forgot', authController.forgotPassword)
//router.post('/reset', authController.updatePassword)
router.put('/reset/:email', authController.resetPassword)
router.post('/message', catchErrors(authController.reportProblem))

//Admin routes
router.post('/admin', catchErrors(admincontroller.createSuperUser))
router.post('/admin/login', admincontroller.loginAdmin)
router.get('/admin', catchErrors(admincontroller.getAllAdmin))
router.delete('/admin/:id', catchErrors(admincontroller.deleteAdmin))
router.put('/admin/:id', catchErrors(admincontroller.updateProfile))

//router.post('/upload', userController.uploadImages)
router.post('/search', userController.searchUser)

//booking route
router.post('/book', catchErrors(bookingcontroller.bookCenter))
router.get('/booking', catchErrors(bookingcontroller.getAllBooking))
router.get('/booking/:id', catchErrors(bookingcontroller.getASingleBooking))


//Using cloudinary
const storage = multer.diskStorage({
    filename:function(req, file, cb){
        cb(null, Date.now()+file.originalname)
    }
})
const imageFilter = function(req, file, cb){
    if(!file.originalname.match(/\.(jpeg|jpg|png)$/i)){
        return cb('Only image files are allowed', false)
    }
    else{
        cb(null,true)
    }
}
var upload = multer({
    storage:storage,
    fileFilter:imageFilter
})
var config = require('../config')
var cloudinary = require('cloudinary')
cloudinary.config({
    cloud_name: config.cloud_name,
    api_key : config.api_key,
    api_secret : config.api_secret
})
const center = require('../models/Center')
router.put('/centerimage/:id', upload.single('photo'), async(req, res) => {
    
    if(req.file == undefined || req.file == ''){
        res.json({message:`Error: No file selected`})
    }
    else{
        var image = req.file.path
        const result = await cloudinary.uploader.upload(image)
        let imgUrl = result.secure_url
        const Center = await center.findByIdAndUpdate(req.params.id,{
            photo:imgUrl
        }, {new:true})
        res.json({
            center:Center,
            message:'Message: Picture uploaded successfully'
        })
    }
    
})
router.post('/centers', upload.single('photo'), async (req, res) => {
    const body = req.body;
  if (!body.name || !body.address || !body.capacity) {
    res.json({
      message: `Please fill in the required inputs`
    });
  } else if (body.name.length > 35 || body.address.length > 35) {
    res.json({
      message: `Name or Address is too long`
    });
  } else if(req.file == undefined || req.file == ''){
    res.json({message:`Error: No file selected`})
    }
   else {
            var image = req.file.path
            const result = await cloudinary.uploader.upload(image)
            let imgUrl = result.secure_url
            const newCenter = await center.create(body)
            newCenter.photo = imgUrl
            await newCenter.save()
      res.json({info:newCenter, message: 'center created successfully'});
  }
})
module.exports = router;