// const express = require('express');
// const app = express();
// require('dotenv').config();
// const authRoutes = require('./router/authRoutes');
// const adminRoutes = require('./router/adminRoutes');
// const customerRoutes = require('./router/customerRoutes');
// const multer = require('multer');
// const path = require('path');


// app.use(express.json());
// app.use(express.urlencoded({ extended: true })); 



// app.use('/api/auth', authRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/api/customers', customerRoutes);


// app.use(express.static(path.join(__dirname, 'images'))); 


// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });


const express = require('express');
const app = express();
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const authRoutes = require('./router/authRoutes');
const adminRoutes = require('./router/adminRoutes');
const customerRoutes = require('./router/customerRoutes');


dotenv.config();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const fs = require('fs');
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and JPG are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, 
    }
});


app.post('/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        res.status(200).json({
            message: 'File uploaded successfully',
            file: {
                ...req.file,
                fileUrl
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'File upload failed', details: err.message });
    }
});


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);  
app.use('/api/customers', customerRoutes);


app.use((req, res, next) => {
    res.status(404).json({ error: 'Route not found' });
});


app.use((err, req, res, next) => {
    console.error('Error:', err.message || err);

    
    if (req.file) {
        fs.unlink(req.file.path, (unlinkError) => {
            if (unlinkError) {
                console.error('Error deleting file:', unlinkError);
            }
        });
    }

   
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'File size too large. Maximum size is 5MB'
            });
        }
        return res.status(400).json({
            error: 'File upload error',
            details: err.message
        });
    }

    
    if (err.message === 'Invalid file type') {
        return res.status(400).json({
            error: 'Invalid file type. Only JPEG, PNG, and JPG are allowed.'
        });
    }

 
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error'
    });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});