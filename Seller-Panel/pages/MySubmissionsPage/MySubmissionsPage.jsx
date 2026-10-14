import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import BackButton from '../../src/components/Common/BackButton/BackButton';
import Layout from '../../src/components/Layouts/Layout';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Button, IconButton, Container, Box, Chip } from '@mui/material';
import { Delete, Visibility } from '@mui/icons-material';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

const BASE_URL = import.meta.env.VITE_API_URL;

const MySubmissionsPage = () => {
  const [requests, setRequests] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const { seller: user } = useSelector((state) => state.auth);

  const fetchRequests = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/contact?email=${user.email}`);
      setRequests(response.data);
    } catch (error) {
      console.error('Failed to fetch requests', error);
    }
  };

  useEffect(() => {
    if (user && user.email) {
      fetchRequests();
    }
  }, [user]);

  const handleOpen = (message) => {
    setSelectedMessage(message);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedMessage(null);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/contact/${id}`);
      fetchRequests();
    } catch (error) {
      console.error('Failed to delete request', error);
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
    <Layout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <BackButton to="/contact" label="Back to Support" />
        <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                My Submissions
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Track the status of your support requests and messages.
              </Typography>
            </Box>
            <Button component={Link} to="/contact" variant="contained" color="primary">
              New Request
            </Button>
          </Box>

          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Admin Response</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request._id}>
                    <TableCell>{new Date(request.createdAt).toLocaleString()}</TableCell>
                    <TableCell>{request.subject}</TableCell>
                    <TableCell>{getStatusChip(request.status)}</TableCell>

                    <TableCell>
                      {request.response ? (
                        <Typography variant="body2">
                          {request.response.length > 50
                            ? `${request.response.substring(0, 50)}...`
                            : request.response}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">No response yet</Typography>
                      )}
                    </TableCell>

                    <TableCell align="right">
                      <IconButton onClick={() => handleOpen(request)}>
                        <Visibility />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(request._id)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>

            </Table>
          </TableContainer>
        </Paper>

        {selectedMessage && (
          <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>Contact Message Details</DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">Subject:</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedMessage.subject}</Typography>

                <Typography variant="subtitle2" color="text.secondary">Your Message:</Typography>
                <Paper variant="outlined" sx={{ p: 2, mb: 2, backgroundColor: 'grey.50' }}>
                  <Typography variant="body2">{selectedMessage.message}</Typography>
                </Paper>

                <Typography variant="subtitle2" color="text.secondary">Status:</Typography>
                <Box sx={{ mb: 2 }}>{getStatusChip(selectedMessage.status)}</Box>

                {selectedMessage.response ? (
                  <>
                    <Typography variant="subtitle2" color="text.secondary">Admin Response:</Typography>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="body2">{selectedMessage.response}</Typography>
                    </Paper>
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No response from admin yet.
                  </Typography>
                )}
              </Box>
            </DialogContent>

            <DialogActions>
              <Button onClick={handleClose}>Close</Button>
            </DialogActions>
          </Dialog>
        )}

      </Container>
    </Layout>
  );
};

export default MySubmissionsPage;
