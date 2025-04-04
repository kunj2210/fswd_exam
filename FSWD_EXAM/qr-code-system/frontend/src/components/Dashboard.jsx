import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { QrReader } from 'react-qr-reader';
import { ContentCopy, Share, Download } from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';

const Dashboard = () => {
  const [content, setContent] = useState('');
  const [type, setType] = useState('url');
  const [qrCodes, setQrCodes] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [scanDialogOpen, setScanDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedQRCode, setSelectedQRCode] = useState(null);
  const [shareEmail, setShareEmail] = useState('');

  useEffect(() => {
    fetchQRCodes();
  }, [page, rowsPerPage, startDate, endDate]);

  const fetchQRCodes = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/qr/history`, {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          startDate,
          endDate,
        },
      });
      setQrCodes(response.data.qrCodes);
    } catch (error) {
      console.error('Error fetching QR codes:', error);
    }
  };

  const handleGenerateQR = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/qr/generate', {
        content,
        type,
      });
      setQrCodes([response.data.qrCode, ...qrCodes]);
      setContent('');
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const handleScan = async (data) => {
    if (data) {
      try {
        await axios.post(`http://localhost:5000/api/qr/scan/${data}`);
        setScanDialogOpen(false);
        fetchQRCodes();
      } catch (error) {
        console.error('Error scanning QR code:', error);
      }
    }
  };

  const handleShare = async () => {
    try {
      await axios.post(`http://localhost:5000/api/qr/share/${selectedQRCode._id}`, {
        email: shareEmail,
      });
      setShareDialogOpen(false);
      setShareEmail('');
    } catch (error) {
      console.error('Error sharing QR code:', error);
    }
  };

  const handleCopyToClipboard = (content) => {
    navigator.clipboard.writeText(content);
  };

  const handleDownload = (imageUrl) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'qr-code.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Generate QR Code
            </Typography>
            <TextField
              label="Content"
              fullWidth
              margin="normal"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <TextField
              select
              label="Type"
              fullWidth
              margin="normal"
              value={type}
              onChange={(e) => setType(e.target.value)}
              SelectProps={{
                native: true,
              }}
            >
              <option value="url">URL</option>
              <option value="text">Text</option>
            </TextField>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleGenerateQR}
              sx={{ mt: 2 }}
            >
              Generate QR Code
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Scan QR Code
            </Typography>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => setScanDialogOpen(true)}
            >
              Open Scanner
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              QR Code History
            </Typography>
            <Box sx={{ mb: 2 }}>
              <TextField
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ mr: 2 }}
              />
              <TextField
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Content</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {qrCodes.map((qrCode) => (
                    <TableRow key={qrCode._id}>
                      <TableCell>{qrCode.content}</TableCell>
                      <TableCell>{qrCode.type}</TableCell>
                      <TableCell>
                        {format(new Date(qrCode.createdAt), 'PPpp')}
                      </TableCell>
                      <TableCell>
                        {qrCode.scanned ? 'Scanned' : 'Not Scanned'}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleCopyToClipboard(qrCode.content)}
                        >
                          <ContentCopy />
                        </IconButton>
                        <IconButton
                          onClick={() => {
                            setSelectedQRCode(qrCode);
                            setShareDialogOpen(true);
                          }}
                        >
                          <Share />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDownload(qrCode.imageUrl)}
                        >
                          <Download />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={-1}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={scanDialogOpen} onClose={() => setScanDialogOpen(false)}>
        <DialogTitle>Scan QR Code</DialogTitle>
        <DialogContent>
          <QrReader
            constraints={{ facingMode: 'environment' }}
            onResult={(result, error) => {
              if (result) {
                handleScan(result?.text);
              }
              if (error) {
                console.error(error);
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScanDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
        <DialogTitle>Share QR Code</DialogTitle>
        <DialogContent>
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleShare} variant="contained">
            Share
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Dashboard; 