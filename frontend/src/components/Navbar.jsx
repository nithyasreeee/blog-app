import React from 'react';
import {
    AppBar,
    Box,
    Toolbar,
    Typography,
    Button,
    IconButton,
    useTheme,
    Switch,
    FormControlLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../redux/themeSlice';

const Navbar = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const dispatch = useDispatch();
    const isDarkMode = useSelector((state) => state.theme.isDarkMode);
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 1, cursor: 'pointer' }}
                        onClick={() => navigate('/')}
                    >
                        Blog App
                    </Typography>
                    
                    <FormControlLabel
                        control={
                            <Switch
                                checked={isDarkMode}
                                onChange={() => dispatch(toggleTheme())}
                                color="default"
                            />
                        }
                        label={isDarkMode ? "Dark" : "Light"}
                    />

                    {user ? (
                        <>
                            <Button color="inherit" onClick={() => navigate('/')}>
                                Home
                            </Button>
                            <Button color="inherit" onClick={() => navigate('/create')}>
                                Create Post
                            </Button>
                            <Button color="inherit" onClick={() => navigate('/profile')}>
                                Profile
                            </Button>
                            <Button color="inherit" onClick={handleLogout}>
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button color="inherit" onClick={() => navigate('/login')}>
                                Login
                            </Button>
                            <Button color="inherit" onClick={() => navigate('/register')}>
                                Register
                            </Button>
                        </>
                    )}
                </Toolbar>
            </AppBar>
        </Box>
    );
};

export default Navbar; 