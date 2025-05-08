import React, { useState } from 'react';
import {
    Container,
    TextField,
    Button,
    Box,
    Typography,
    Paper,
    IconButton
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import { toast } from 'react-toastify';

const CreatePost = () => {
    const [formData, setFormData] = useState({
        title: '',
        content: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formDataToSend = new FormData();
            
            // Append text fields
            formDataToSend.append('title', formData.title);
            formDataToSend.append('content', formData.content);
            
            // Append image if selected
            if (selectedFile) {
                formDataToSend.append('image', selectedFile);
            }

            await api.post('/posts', formDataToSend, {
                headers: { 
                    'Content-Type': 'multipart/form-data'
                }
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
                    
                    <Box sx={{ mb: 2 }}>
                        <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="image-upload"
                            type="file"
                            onChange={handleFileChange}
                        />
                        <label htmlFor="image-upload">
                            <Button
                                variant="outlined"
                                component="span"
                                startIcon={<PhotoCamera />}
                                sx={{ mb: 2 }}
                            >
                                Upload Image
                            </Button>
                        </label>
                        {previewUrl && (
                            <Box sx={{ mt: 2, mb: 2 }}>
                                <img 
                                    src={previewUrl} 
                                    alt="Preview" 
                                    style={{ maxWidth: '100%', maxHeight: '300px' }} 
                                />
                            </Box>
                        )}
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
                            required
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