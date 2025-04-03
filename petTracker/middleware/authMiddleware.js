// Authentication middleware

/**
 * Check if user is authenticated
 */
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    
    // For API endpoints, return JSON response
    if (req.path.startsWith('/api/')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Please log in to access this resource' 
      });
    }
    
    // For web pages, redirect to login
    res.redirect('/login.html');
  };
  
  /**
   * Check if user is a superuser
   */
  const isSuperUser = (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        success: false, 
        message: 'Please log in to access this resource' 
      });
    }
    
    if (req.user.role === 'superuser') {
      return next();
    }
    
    res.status(403).json({ 
      success: false, 
      message: 'You do not have permission to access this resource' 
    });
  };
  
  /**
   * Check if user owns the specified pet
   */
  const isPetOwner = async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ 
          success: false, 
          message: 'Please log in to access this resource' 
        });
      }
      
      // Superusers can access any pet
      if (req.user.role === 'superuser') {
        return next();
      }
      
      const petId = req.params.id || req.params.petId;
      
      // If creating a new resource, just attach the user ID
      if (!petId) {
        req.body.userId = req.user.id;
        return next();
      }
      
      // Get the pet to check ownership
      const Pet = require('../models/petModel');
      const pet = await Pet.findById(petId);
      
      if (!pet) {
        return res.status(404).json({ 
          success: false, 
          message: 'Pet not found' 
        });
      }
      
      // Check if the user owns this pet
      if (pet.userId.toString() === req.user.id) {
        return next();
      }
      
      res.status(403).json({ 
        success: false, 
        message: 'You can only manage your own pets' 
      });
    } catch (err) {
      console.error('❌ Error in isPetOwner middleware:', err);
      res.status(500).json({ 
        success: false, 
        message: 'Server error checking pet ownership' 
      });
    }
  };
  
  /**
   * Attach user ID to the request body
   */
  const attachUserId = (req, res, next) => {
    if (req.isAuthenticated()) {
      req.body.userId = req.user.id;
    }
    next();
  };
  
  module.exports = {
    isAuthenticated,
    isSuperUser,
    isPetOwner,
    attachUserId
  };