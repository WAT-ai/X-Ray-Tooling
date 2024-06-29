import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Typography,
    Button,
    AppBar, Toolbar, Card, CardContent, Paper, Select, MenuItem
} from '@mui/material';
import Logo from './Logo.svg'

const NavBar = () => {

    let navigate = useNavigate();

    const handleBeginConsultation = () => {
        navigate('/Main')
    }

    return (
        <AppBar sx={{ position: "sticky", backgroundColor: 'white', height: '60px', width: '100%', borderBottom: 'none', boxShadow: 'none', boxSizing: 'border-box' }}>
            <Toolbar variant="dense" sx={{ justifyContent: 'space-between', borderBottom: 'none', height: '100%', width: '100%', paddingLeft: '25px', paddingRight: '25px', boxSizing: 'border-box' }}>
                <img src={Logo} class="h-1/2" alt="Logo" />

                <div>
                    <Button color="inherit" sx={{ marginRight: '20px', color: 'black' }}>How it works</Button>
                    <Button color="inherit" sx={{ marginRight: '20px', color: 'black' }} onClick={handleBeginConsultation}>Consultation</Button>
                </div>
                <button class="text-black">Log In</button>
            </Toolbar>
        </AppBar>
    );
};

export default NavBar;