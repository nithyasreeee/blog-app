import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Box,
    Avatar,
    Button,
    TextField,
    Card,
    CardContent,
    CardMedia,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const Profile = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [posts, setPosts] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState({
        username: user?.username || '',
        bio: user?.bio || '',
        profilePicture: user?.profilePicture || ''
    });
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserPosts();
    }, []);

    const fetchUserPosts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/posts', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPosts(response.data.filter(post => post.author._id === user._id));
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };

    const handleEditSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.patch(
                'http://localhost:5000/api/users/profile',
                editData,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
            setEditMode(false);
            toast.success('Profile updated successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        }
    };

    const handleDeletePost = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5000/api/posts/${selectedPost._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPosts(posts.filter(post => post._id !== selectedPost._id));
            setDeleteDialogOpen(false);
            toast.success('Post deleted successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete post');
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Grid container spacing={4}>
                <Grid item xs={12} md={4}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Avatar
                                src={user?.profilePicture}
                                sx={{ width: 120, height: 120, mb: 2 }}
                            />
                            {editMode ? (
                                <Box sx={{ width: '100%' }}>
                                    <TextField
                                        fullWidth
                                        label="Username"
                                        value={editData.username}
                                        onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                                        sx={{ mb: 2 }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Bio"
                                        multiline
                                        rows={4}
                                        value={editData.bio}
                                        onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                                        sx={{ mb: 2 }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Profile Picture URL"
                                        value={editData.profilePicture}
                                        onChange={(e) => setEditData({ ...editData, profilePicture: e.target.value })}
                                        sx={{ mb: 2 }}
                                    />
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={handleEditSubmit}
                                        sx={{ mb: 1 }}
                                    >
                                        Save Changes
                                    </Button>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        onClick={() => setEditMode(false)}
                                    >
                                        Cancel
                                    </Button>
                                </Box>
                            ) : (
                                <>
                                    <Typography variant="h5" gutterBottom>
                                        {user?.username}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" paragraph>
                                        {user?.bio || 'No bio yet'}
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        startIcon={<EditIcon />}
                                        onClick={() => setEditMode(true)}
                                    >
                                        Edit Profile
                                    </Button>
                                </>
                            )}
                        </Box>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={8}>
                    <Typography variant="h4" gutterBottom>
                        My Posts
                    </Typography>
                    <Grid container spacing={3}>
                        {posts.map(post => (
                            <Grid item xs={12} key={post._id}>
                                <Card>
                                    {post.image && (
                                        <CardMedia
                                            component="img"
                                            height="200"
                                            image={post.image}
                                            alt={post.title}
                                        />
                                    )}
                                    <CardContent>
                                        <Typography variant="h5" gutterBottom>
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
                                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="caption" color="text.secondary">
                                                {format(new Date(post.createdAt), 'MMM d, yyyy')}
                                            </Typography>
                                            <Box>
                                                <IconButton
                                                    onClick={() => navigate(`/edit/${post._id}`)}
                                                    color="primary"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => {
                                                        setSelectedPost(post);
                                                        setDeleteDialogOpen(true);
                                                    }}
                                                    color="error"
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            </Grid>

            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>Delete Post</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete this post?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeletePost} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Profile; 