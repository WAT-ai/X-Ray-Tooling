import React from 'react';
import {
    Typography,
    Button,
    AppBar, Toolbar, Card, CardContent, Paper, Select, MenuItem
} from '@mui/material';

const NavBar = () => {
    return (
        <AppBar sx={{ position: "sticky", backgroundColor: '#2C71D9', height: '60px', width: '100%', borderBottom: 'none', boxShadow: 'none', boxSizing: 'border-box' }}>
            <Toolbar variant="dense" sx={{ justifyContent: 'space-between', borderBottom: 'none', height: '100%', width: '100%', paddingLeft: '25px', paddingRight: '25px', boxSizing: 'border-box' }}>
                <Typography variant="h6" component="div" sx={{ color: 'black', marginTop: '5px', fontWeight: 'bold' }}>
                    <span style={{ color: '#4686ee', fontSize: 28 }}>X</span><span style={{ color: 'black', fontSize: 28 }}>Care</span>
                </Typography>
                <div sx={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Button color="inherit" sx={{ color: 'black' }}>Results</Button>
                    <Button color="inherit" sx={{ color: 'black' }}>Rehabilitation</Button>
                </div>
                <Button color="inherit" sx={{ color: 'white', backgroundColor: '#4686ee', borderRadius: '20px', width: '100px', '&:hover': { backgroundColor: 'grey' } }} >Log In</Button>
            </Toolbar>
        </AppBar>
    );
};

export default NavBar;