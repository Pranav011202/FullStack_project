const express = require('express');
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');
const fs = require('fs');

// image upload
var storage = multer.diskStorage({
    destination: function(req,file ,cb){
        cb(null,'./uploads');
    },
    filename: function(req, file , cb ){
        cb(null, file.fieldname+"_"+Date.now()+"_"+file.originalname);
    },

});

var upload = multer({
    storage: storage,
}).single('image');

//insert an user into database route
router.post('/add', upload,async(req,res)=>{
   
    const user =new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: req.file.filename,
    });
    let output = await user.save();
    console.log(output);
    req.session.message = {
        type: 'success',
        message: 'user added successfully'
    };
    res.redirect("/");
    
});
//get all users route
router.get('/',async(req,res)=>{
   let output = await User.find().exec();
//    console.log(output);
   res.render('index',{
    title: 'Home Page',
    users: output,

})
});
router.get('/add',(req,res)=>{
    res.render('add-users',{title: "Add Users"});
});

//edit an user route
router.get('/edit/:id',async(req,res)=>{
    let id = req.params.id;
    let output = await User.findById(id );
        
            if(output == null){
                res.redirect('/');
            }else{
                res.render('edit_users',{
                    title: "Edit User",
                    user : output,
                });
            
        }
    
});



router.post('/update/:id', upload, async (req, res) => {
    try {
        let id = req.params.id;
        let new_image = '';

        if (req.file) {
            new_image = req.file.filename;
            try {
                fs.unlinkSync('./uploads/' + req.body.old_image);
            } catch (err) {
                console.log(err);
            }
        } else {
            new_image = req.body.old_image;
        }

        await User.findByIdAndUpdate(id, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: new_image,
        });

        req.session.message = {
            type: 'success',
            message: 'User updated successfully',
        };
        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});

//delete User route
// router.get('/delete/:id',(req,res)=>{
//     let id = req.params.id;
//     User.findByIdAndDelete(id,(err,result)=>{
//         if(result.image != ''){
//             try{
//                 fs.unlinkSync('./uploads/'+ results.image);
//             }catch(err){
//                 console.log(err);
//             }
//         }
//         if(err){
//             res.json({message:err.message});
//         } else{
//             req.session.message = {
//                 type: 'success',
//                 message: 'User deleted Successfully!'
//             };
//             res.redirect('/');

//         }
//     })
// });
router.get('/delete/:id', async (req, res) => {
    try {
        let id = req.params.id;
        const result = await User.findByIdAndDelete(id);

        if (result.image !== '') {
            try {
                await fs.promises.unlink('./uploads/' + result.image);
            } catch (err) {
                console.log(err);
            }
        }

        req.session.message = {
            type: 'success',
            message: 'User deleted Successfully!'
        };
        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message });
    }
});

module.exports = router;