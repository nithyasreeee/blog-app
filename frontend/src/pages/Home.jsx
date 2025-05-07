import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Typography,
    TextField,
    Box,
    Chip,
    CircularProgress,
    Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';

const Home = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTag, setSelectedTag] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/posts');
            setPosts(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching posts:', error);
            setLoading(false);
        }
    };

    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTag = !selectedTag || post.tags.includes(selectedTag);
        return matchesSearch && matchesTag;
    });

    const allTags = [...new Set(posts.flatMap(post => post.tags))];

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Box sx={{ mb: 4 }}>
                <TextField
                    fullWidth
                    label="Search posts"
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {allTags.map(tag => (
                        <Chip
                            key={tag}
                            label={tag}
                            onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                            color={selectedTag === tag ? 'primary' : 'default'}
                            sx={{ m: 0.5 }}
                        />
                    ))}
                </Box>
            </Box>

            <Grid container spacing={4}>
                {filteredPosts.map(post => (
                    <Grid item xs={12} sm={6} md={4} key={post._id}>
                        <Card 
                            sx={{ 
                                height: '100%', 
                                display: 'flex', 
                                flexDirection: 'column',
                                cursor: 'pointer'
                            }}
                            onClick={() => navigate(`/post/${post._id}`)}
                        >
                            {post.image && (
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={post.image}
                                    alt={post.title}
                                />
                            )}
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography gutterBottom variant="h5" component="h2">
                                    {post.title}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical',
                                    }}
                                >
                                    {post.content}
                                </Typography>
                                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {post.tags.map(tag => (
                                        <Chip key={tag} label={tag} size="small" />
                                    ))}
                                </Box>
                                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="caption" color="text.secondary">
                                        By {post.author.username}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {format(new Date(post.createdAt), 'MMM d, yyyy')}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default Home; 