const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { 
    addProduct, 
    editProduct, 
    deleteProduct, 
    viewOrders, 
    updateOrderStatus, 
    cancelOrder, 
    filterOrdersByStatus 
} = require('../Controller/adminController');


router.post('/addProduct', 
    verifyAdmin,
    upload.single('file'),  // 'file' to match Postman
    addProduct
);

router.put('/editProduct/:id', 
    verifyAdmin, 
    upload.single('image'),  // 'imageUrl' to match Postman
    editProduct
);


router.delete('/products/:id', 
    verifyAdmin, 
    deleteProduct
);

// Order management routes
router.get('/orders', 
    verifyAdmin, 
    viewOrders
);

router.put('/orders/:id/status', 
    verifyAdmin, 
    updateOrderStatus
);

router.put('/orders/:id/cancel', 
    verifyAdmin, 
    cancelOrder
);

router.get('/orders/filter', 
    verifyAdmin, 
    filterOrdersByStatus
);

module.exports = router;