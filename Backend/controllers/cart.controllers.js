const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const { toClientProduct } = require('../utils/productForClient');

const PRODUCT_POPULATE_SELECT = 'name images sellerId sellerName storeName sellingPrice platformFee logisticsFee transactionFee discountPercentage';

function toCartItemForClient(item) {
  const obj = item.toObject ? item.toObject() : { ...item };
  if (obj.product) obj.product = toClientProduct(obj.product);
  return obj;
}

// ================= Cart =================
// All cart data is stored in the Cart collection only. We never read or write
// cart data on the User model (User has favorites, not cart).

// Get cart (from Cart model only)
module.exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: 'items.product',
        select: PRODUCT_POPULATE_SELECT,
      });

    if (!cart) return res.status(200).json({ cart: [] });
    const items = (cart.items || []).map(toCartItemForClient);
    res.status(200).json({ cart: items });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add to cart (Cart model only – never User)
module.exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId) return res.status(400).json({ message: 'productId required' });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Find or create cart in Cart collection only
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if product already exists in cart
    const existingItem = cart.items.find((item) => item.product.toString() === productId);

    if (existingItem) {
      // Increase quantity if already exists
      existingItem.quantity += quantity || 1;
    } else {
      // Add new product to cart
      cart.items.push({
        product: productId,
        quantity: quantity || 1,
      });
    }

    await cart.save(); // Save the cart

    // Populate product details for response
    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: 'items.product',
        select: PRODUCT_POPULATE_SELECT,
      });

    const items = (populatedCart.items || []).map(toCartItemForClient);
    res.status(200).json({ message: 'Added to cart', cart: items });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

 


// Update cart item quantity
module.exports.updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    if (typeof quantity !== 'number' || quantity<1) {
      return res.status(400).json({ message: 'quantity must be a positive  number' });
    }
   const updatedCart = await Cart.findOneAndUpdate(
    {user:req.user._id,"items._id":itemId},
    {$set:{'items.$.quantity':quantity}},
    {new :true}
  ).populate({
    path:'items.product',
    select: PRODUCT_POPULATE_SELECT,
  });
  if(!updatedCart) return res.status(404).json({message:'Cart or item not found'});

  const items = (updatedCart.items || []).map(toCartItemForClient);
  res.status(200).json({
    message: 'Cart updated',
    cart: items,
  });
    
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
};




//remove item 
module.exports.removeCartItem = async(req,res)=>{
  try{
    const{itemId}=req.params;
    //remove the item using ${pull} and update  the cart
    const updatedCart = await Cart.findOneAndUpdate(
      { user: req.user._id, "items._id": itemId },
      { $pull: { items: { _id: itemId } } },
      { new: true }
    ).populate({
      path: 'items.product',
      select: PRODUCT_POPULATE_SELECT,
    });

    if (!updatedCart) return res.status(404).json({ message: 'Cart or item not found' });

    const items = (updatedCart.items || []).map(toCartItemForClient);
    res.status(200).json({ message: 'Removed from cart', cart: items });
  } catch(error){
     console.error('Error removing cart item:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

 // To clear a cart 

module.exports.clearCart = async (req, res) => {
  try {
    // Clear items directly in the DB without fetching full cart first
    const clearedCart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: [] },
      { new: true } // return the updated cart
    )

    if (!clearedCart) return res.status(404).json({ message: 'Cart not found' });

    res.status(200).json({ message: 'Cart cleared', cart: [] });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
};