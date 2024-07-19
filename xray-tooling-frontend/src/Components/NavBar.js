import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
    Typography,
    Button,
    AppBar, Toolbar, Card, CardContent, Paper, Select, MenuItem, Drawer, List, ListItem, ListItemText
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Logo from '../Assets/Logo.svg'

const NavBar = () => {

    let navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [mobileOpen, setMobileOpen] = useState(false);


    const handleSignUp = () => {
        navigate('/Signup')
    }

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const drawer = (
        <div>
            <List>
                <ListItem button onClick={handleSignUp}>
                    <ListItemText primary="How it works" />
                </ListItem>
                <ListItem button onClick={handleSignUp}>
                    <ListItemText primary="Consultation" />
                </ListItem>
                <ListItem button onClick={handleSignUp}>
                    <ListItemText primary="Sign Up" />
                </ListItem>
            </List>
        </div>
    );

    return (
        <AppBar sx={{ position: "sticky", backgroundColor: 'white', height: '60px', width: '100%', borderBottom: 'none', boxShadow: 'none', boxSizing: 'border-box' }}>
            <Toolbar variant="dense" sx={{ justifyContent: 'space-between', borderBottom: 'none', height: '100%', width: '100%', paddingLeft: '25px', paddingRight: '25px', boxSizing: 'border-box' }}>
                {!isMobile ? (
                    <>
                        <img src={Logo} class="h-1/2" alt="Logo" />
                        <div>
                            <Button color="inherit" sx={{ marginRight: '20px', color: 'black' }}>How it works</Button>
                            <Button color="inherit" sx={{ marginRight: '20px', color: 'black' }} onClick={handleSignUp}>Consultation</Button>
                        </div>
                        <button onClick={handleSignUp} class="text-black">Sign Up</button>
                    </>
                ) : (
                    <>
                        <img src={Logo} class="h-1/2" alt="Logo" />
                        <Button color="inherit" aria-label="open drawer" edge="end" onClick={handleDrawerToggle}>
                            <MenuIcon color="action" />
                        </Button>
                        <Drawer
                            variant="temporary"
                            anchor="top"
                            open={mobileOpen}
                            onClose={handleDrawerToggle}
                            ModalProps={{
                                keepMounted: true, // Better open performance on mobile.
                            }}
                        >
                            {drawer}
                        </Drawer>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default NavBar;