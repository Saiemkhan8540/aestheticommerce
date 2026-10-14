import React, { useState } from 'react';
import Layout from '../src/components/Layouts/Layout';
import { Button, TextField, Typography, Container, Paper, Box, Stack } from '@mui/material';
import './seller-support/SellerSupportPage.css';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_API_URL;

const ContactPage = () => {
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
  });
  const { seller: user } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to send a message.');
      return;
    }
    
    const submissionData = { 
      ...formData, 
      name: user.sellerName, 
      email: user.email,
      isFromSeller: true,
      sellerId: user._id
    };
    
    console.log('Sending contact message data:', submissionData);
    
    try {
      await axios.post(`${BASE_URL}/api/contact`, submissionData);
      toast.success('Message sent successfully!');
      setFormData({ subject: '', message: '' });
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message.');
    }
  };

  return (
    <Layout>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Contact Us
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Have a question or need help? Fill out the form below and our team will get back to you as soon as possible.
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Want to check the status of your previous submissions? <Link to="/my-submissions">View your submissions</Link>
            </Typography>
          </Box>

          <form onSubmit={handleSubmit} noValidate autoComplete="off">
            <Stack spacing={3}>
              <TextField label="Your Name" value={user?.sellerName || ''} disabled fullWidth />
              <TextField label="Your Email" value={user?.email || ''} disabled fullWidth />
              <TextField 
                label="Subject" 
                name="subject" 
                value={formData.subject} 
                onChange={handleChange} 
                variant="outlined" 
                fullWidth 
                required 
              />
              <TextField 
                label="Message" 
                name="message" 
                value={formData.message} 
                onChange={handleChange} 
                variant="outlined" 
                fullWidth 
                required 
                multiline 
                rows={4} 
              />
              <Button type="submit" variant="contained" color="primary" size="large" sx={{ mt: 2, width: 'fit-content' }}>
                Submit Message
              </Button>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Layout>
  );
};

export default ContactPage;
