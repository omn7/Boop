const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Post = require('./models/Post');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection (Simulated or Real)
// For MVP, we'll try to connect, but handle errors gracefully if no DB is present
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/boop';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Connection Error:', err));

// Routes

// GET all posts
app.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new post
app.post('/posts', async (req, res) => {
  const post = new Post({
    petName: req.body.petName,
    breed: req.body.breed,
    humanName: req.body.humanName,
    bio: req.body.bio,
    imageUrl: req.body.imageUrl
  });

  try {
    const newPost = await post.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST (Boop action) - Increment boop count
app.post('/boop/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.boopCount += 1;
    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Seed Route for Demo Data (Optional)
app.get('/seed', async (req, res) => {
    try {
        await Post.deleteMany({});
        const seedPosts = [
            {
                petName: "Barnaby",
                breed: "Golden Retriever",
                humanName: "Sarah",
                bio: "I love socks and sunshine.",
                imageUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                boopCount: 12
            },
            {
                petName: "Luna",
                breed: "Siamese Cat",
                humanName: "Mike",
                bio: "Queen of the castle.",
                imageUrl: "https://images.unsplash.com/photo-1513245543132-31f507417b26?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                boopCount: 45
            },
            {
                petName: "Cooper",
                breed: "French Bulldog",
                humanName: "Emily",
                bio: "Snorting is my love language.",
                imageUrl: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                boopCount: 8
            }
        ];
        await Post.insertMany(seedPosts);
        res.json({ message: "Database seeded!" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
