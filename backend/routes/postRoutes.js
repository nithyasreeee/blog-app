const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// Create a new post
router.post('/', auth, upload.single('image'), async (req, res) => {
    try {
        let imageUrl = '';
        
        if (req.file) {
            try {
                // Create uploads directory if it doesn't exist
                const uploadsDir = path.join(__dirname, '../uploads');
                if (!fs.existsSync(uploadsDir)) {
                    fs.mkdirSync(uploadsDir, { recursive: true });
                }

                // Save file to uploads directory
                const fileName = `${Date.now()}-${req.file.originalname}`;
                const filePath = path.join(uploadsDir, fileName);
                fs.writeFileSync(filePath, req.file.buffer);
                
                // Set the image URL to the local path
                imageUrl = `/uploads/${fileName}`;
            } catch (error) {
                console.error('Error saving file:', error);
                return res.status(500).json({ message: 'Error saving image' });
            }
        }

        // Validate required fields
        if (!req.body.title || !req.body.content) {
            return res.status(400).json({ message: 'Title and content are required' });
        }

        const post = new Post({
            title: req.body.title,
            content: req.body.content,
            author: req.user._id,
            image: imageUrl
        });
        
        await post.save();
        res.status(201).json(post);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(400).json({ message: error.message });
    }
});

// Get all posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('author', 'username profilePicture')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a specific post
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('author', 'username profilePicture')
            .populate('comments.author', 'username profilePicture');
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a post
router.patch('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findOne({ _id: req.params.id, author: req.user._id });
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const updates = Object.keys(req.body);
        const allowedUpdates = ['title', 'content', 'tags', 'image'];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ message: 'Invalid updates' });
        }

        updates.forEach(update => post[update] = req.body[update]);
        await post.save();
        res.json(post);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a post
router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findOneAndDelete({ _id: req.params.id, author: req.user._id });
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Like/Unlike a post
router.post('/:id/like', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const likeIndex = post.likes.indexOf(req.user._id);
        
        if (likeIndex === -1) {
            post.likes.push(req.user._id);
        } else {
            post.likes.splice(likeIndex, 1);
        }

        await post.save();
        res.json(post);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Add a comment
router.post('/:id/comments', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        post.comments.push({
            text: req.body.text,
            author: req.user._id
        });

        await post.save();
        await post.populate('comments.author', 'username profilePicture');
        res.json(post);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router; 