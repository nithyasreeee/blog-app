import React, { useState } from 'react';
import {
    Container,
    TextField,
    Button,
    Box,
    Typography,
    Paper,
    Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const CreatePost = () => {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        tags: [],
        image: ''
    });
    const [tagInput, setTagInput] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleTagInputKeyPress = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!formData.tags.includes(tagInput.trim())) {
                setFormData({
                    ...formData,
                    tags: [...formData.tags, tagInput.trim()]
                });
            }
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter(tag => tag !== tagToRemove)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/posts', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Post created successfully!');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create post');
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Create New Post
                </Typography>
                <Box component="form" onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        fullWidth
                        label="Featured Image URL"
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                    />
                    <Box sx={{ mb: 2 }}>
                        <TextField
                            fullWidth
                            label="Add Tags (Press Enter)"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyPress={handleTagInputKeyPress}
                            sx={{ mb: 1 }}
                        />
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {formData.tags.map(tag => (
                                <Chip
                                    key={tag}
                                    label={tag}
                                    onDelete={() => handleRemoveTag(tag)}
                                />
                            ))}
                        </Box>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Content
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            minRows={8}
                            label="Content"
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            sx={{ mb: 2 }}
                        />
                    </Box>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                    >
                        Publish Post
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default CreatePost; 