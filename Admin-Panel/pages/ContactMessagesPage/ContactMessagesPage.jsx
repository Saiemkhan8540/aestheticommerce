import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Button, Modal, Box, TextField, MenuItem, Select, Container, Chip, Stack, Grid } from '@mui/material';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 500 },
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

const ContactMessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState('Pending');
  const [open, setOpen] = useState(false);

  const fetchMessages = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/contact');
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch contact messages', error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleOpen = (message) => {
    setSelectedMessage(message);
    setResponse(message.response || '');
    setStatus(message.status || 'Pending');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedMessage(null);
  };

  const handleSubmit = async () => {
    try {
      await axios.put(`http://localhost:5001/api/contact/${selectedMessage._id}`, { response, status });
      fetchMessages();
      handleClose();
    } catch (error) {
      console.error('Failed to submit response', error);
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'Pending':
        return <Chip label={status} color="warning" size="small" />;
      case 'In Progress':
        return <Chip label={status} color="info" size="small" />;
      case 'Resolved':
        return <Chip label={status} color="success" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Contact Messages
        </Typography>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="contact messages table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {messages.map((message) => (
                <TableRow key={message._id} hover>
                  <TableCell>{message.name}</TableCell>
                  <TableCell>{message.email}</TableCell>
                  <TableCell>{message.subject}</TableCell>
                  <TableCell>{getStatusChip(message.status)}</TableCell>
                  <TableCell>{new Date(message.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <Button variant="outlined" size="small" onClick={() => handleOpen(message)}>View & Respond</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Stack spacing={2}>
            <Typography variant="h6" component="h2">Respond to Message</Typography>
            <Box>
              <Typography variant="body2" color="text.secondary"><strong>From:</strong> {selectedMessage?.name} ({selectedMessage?.email})</Typography>
              <Typography variant="body2" color="text.secondary"><strong>Subject:</strong> {selectedMessage?.subject}</Typography>
              <Paper variant="outlined" sx={{ p: 2, mt: 1, maxHeight: 150, overflow: 'auto' }}>
                <Typography variant="body2">{selectedMessage?.message}</Typography>
              </Paper>
            </Box>
            <TextField
              label="Your Response"
              multiline
              rows={5}
              fullWidth
              value={response}
              onChange={(e) => setResponse(e.target.value)}
            />
            <Select value={status} onChange={(e) => setStatus(e.target.value)} fullWidth>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Resolved">Resolved</MenuItem>
            </Select>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
              <Button onClick={handleClose}>Cancel</Button>
              <Button variant="contained" onClick={handleSubmit}>Submit Response</Button>
            </Box>
          </Stack>
        </Box>
      </Modal>
    </Container>
  );
};

export default ContactMessagesPage;