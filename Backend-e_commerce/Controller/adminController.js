const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

const addProduct = async (req, res) => {
    try {
        console.log('File:', req.file);
        console.log('Body:', req.body);

      
        const { name, description, category, price, rating, seller, stock, adminId, image } = req.body;

        if (!name || !price || !adminId) {
           
            return res.status(400).json({ error: 'Name, price, and adminId are required' });
        }

        const fileContent = Buffer.from(image, 'base64')


        const newProduct = await prisma.product.create({
            data: {
                name,
                description,
                category,
                price: parseFloat(price),
                rating: rating ? parseFloat(rating) : null,
                seller,
                stock: parseInt(stock),
                image: fileContent,
                admin: {
                    connect: {
                        id: parseInt(adminId),
                    },
                },
            },
        });


        res.status(201).json(newProduct);
    } catch (error) {
        
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Failed to create product', details: error.message });
    }
};



const editProduct = async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        
        const existingProduct = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!existingProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const { name, description, category, price, rating, seller, stock, image } = req.body;

        // Prepare the data to be updated
        const updateData = { 
            name, 
            description, 
            category, 
            price: price ? parseFloat(price) : undefined, 
            rating: rating ? parseFloat(rating) : undefined, 
            seller, 
            stock: stock ? parseInt(stock) : undefined 
        }; 

        // Handle image update if provided
        if (image) {
            const fileContent = Buffer.from(image, 'base64');
            updateData.image = fileContent;
        }

        const updatedProduct = await prisma.product.update({
            where: { id: productId },
            data: updateData,
        });

        res.json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product', details: error.message });
    }
};

    
  

const deleteProduct = async (req, res) => {
  const { id } = req.params; 
  const adminId = req.adminId;

  if (!id || !adminId) {
      return res.status(400).json({ message: 'Product ID and admin ID are required' });
  }

  try {
      
      const product = await prisma.product.findUnique({
          where: { id: parseInt(id) },
      });

      if (!product || product.adminId !== adminId) {
          return res.status(403).json({ message: 'Unauthorized to delete this product' });
      }

      
      await prisma.product.delete({
          where: { id: parseInt(id) },
      });

      console.log('Product deleted:', id);
      res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
};



const viewOrders = async (req, res) => {
    try {
        
        const orders = await prisma.order.findMany({
            include: {
                customer: true, 
                products: true, 
            },
        });

        res.status(200).json({ message: 'Orders retrieved successfully', orders });
    } catch (error) {
        console.error('Error retrieving orders:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateOrderStatus = async (req, res) => {
    const { id } = req.params; 
    const { status } = req.body; 

    if (!id || !status) {
        return res.status(400).json({ message: 'Order ID and status are required' });
    }

    try {
        
        const updatedOrder = await prisma.order.update({
            where: { id: parseInt(id) },
            data: { status },
        });

        res.status(200).json({ message: 'Order status updated successfully', order: updatedOrder });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const cancelOrder = async (req, res) => {
    const { id } = req.params; 

    if (!id) {
        return res.status(400).json({ message: 'Order ID is required' });
    }

    try {
        
        const canceledOrder = await prisma.order.update({
            where: { id: parseInt(id) },
            data: { status: 'Cancelled' },
        });

        res.status(200).json({ message: 'Order cancelled successfully', order: canceledOrder });
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const filterOrdersByStatus = async (req, res) => {
    const { status } = req.query; 

    if (!status) {
        return res.status(400).json({ message: 'Status is required for filtering' });
    }

    try {
       
        const filteredOrders = await prisma.order.findMany({
            where: { status },
            include: {
                customer: true,
                products: true,
            },
        });

        res.status(200).json({ message: 'Orders filtered by status', orders: filteredOrders });
    } catch (error) {
        console.error('Error filtering orders:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


module.exports = { addProduct, editProduct, deleteProduct, viewOrders, updateOrderStatus, cancelOrder, filterOrdersByStatus };

