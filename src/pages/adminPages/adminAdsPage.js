import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
  Card,
  CardContent,
  CardActions,
  Box,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Typography,
  Skeleton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

function AdminAdsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { user } = useSelector(state => state.auth);

  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [form, setForm] = useState({
    title: '',
    link: '',
    startDate: null,
    endDate: null,
  });
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const fetchAds = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/admin/getAds`);
      setAds(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const openCreate = () => {
    setEditingAd(null);
    setForm({ title: '', link: '', startDate: null, endDate: null });
    setFile(null);
    setPreviewUrl('');
    setDialogOpen(true);
  };

  const openEdit = ad => {
    setEditingAd(ad);
    setForm({
      title: ad.title,
      link: ad.link || '',
      startDate: ad.startDate ? new Date(ad.startDate) : null,
      endDate: ad.endDate ? new Date(ad.endDate) : null,
    });
    setFile(null);
    setPreviewUrl(ad.imageUrl);
    setDialogOpen(true);
  };

  const handleFileChange = e => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    if (f.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(f));
    } else {
      setPreviewUrl('');
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this ad?')) return;
    await axios.delete(`${API_URL}/api/admin/deleteAd/${id}`, { headers: { Authorization: `Bearer ${user?.token}` }});
    fetchAds();
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('title', form.title);
    if (form.link) formData.append('link', form.link);
    if (form.startDate) formData.append('startDate', form.startDate.toISOString());
    if (form.endDate) formData.append('endDate', form.endDate.toISOString());
    if (file) {
      formData.append('poster', file);
    }

    try {
      if (editingAd) {
        await axios.put(
          `${API_URL}/api/admin/updateAd/${editingAd._id}`,
          formData,
          { headers: { 'Authorization': `Bearer ${user?.token}`, 'Content-Type': 'multipart/form-data'} }
        );
      } else {
        await axios.post(
          `${API_URL}/api/admin/createAd`,
          formData,
          { headers: { 'Authorization': `Bearer ${user?.token}`, 'Content-Type': 'multipart/form-data'} }
        );
      }
      setDialogOpen(false);
      fetchAds();
    } catch (err) {
      console.error(err);
      alert('Failed to save ad.');
    }
  };
  
  const ROW_COUNT = 5;
  if (loading) return (
    <Box p={4}>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Skeleton variant="text" width={200} height={40} />
        <Skeleton variant="rectangular" width={120} height={36} />
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            {['Title', 'Image URL', 'Link', 'Start Date', 'End Date', 'Actions'].map((col, i) => (
              <TableCell key={i}>
                <Skeleton variant="text" width={col.length * 10} />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {Array.from({ length: ROW_COUNT }).map((_, row) => (
            <TableRow key={row}>
              {Array.from({ length: 6 }).map((__, col) => (
                <TableCell key={col}>
                  <Skeleton variant="rectangular" height={24} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  )

  return (
    <Box p={4}>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h5">Manage Advertisements</Typography>
        <Button variant="contained" onClick={openCreate}>Create Ad</Button>
      </Box>

      {isMobile
        ?
        ads.map(ad => (
          <Card key={ad._id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                {ad.title}
              </Typography>
              <Box 
                component="img"
                src={ad.imageUrl}
                alt={ad.title}
                sx={{ width: '100%', maxHeight: 200, objectFit: 'cover', mb: 1 }}
              />
              <Typography variant="body2">
                Link: {ad.link ? <a href={ad.link} target="_blank" rel="noopener noreferrer">Visit</a> : '—'}
              </Typography>
              <Typography variant="body2">
                {ad.startDate ? `Starts: ${new Date(ad.startDate).toLocaleDateString()}` : ''}
              </Typography>
              <Typography variant="body2">
                {ad.endDate ? `Ends: ${new Date(ad.endDate).toLocaleDateString()}` : ''}
              </Typography>
            </CardContent>
            <CardActions>
              <IconButton onClick={() => openEdit(ad)}><EditIcon/></IconButton>
              <IconButton onClick={() => handleDelete(ad._id)}><DeleteIcon/></IconButton>
            </CardActions>
          </Card>
        ))
        :
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Image</TableCell>
              <TableCell>Link</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ads.map(ad => (
              <TableRow key={ad._id}>
                <TableCell>{ad.title}</TableCell>
                <TableCell>
                  <a href={ad.imageUrl} target="_blank" rel="noopener noreferrer">Preview</a>
                </TableCell>
                <TableCell>
                  {ad.link ? <a href={ad.link} target="_blank" rel="noopener noreferrer">Go</a> : '—'}
                </TableCell>
                <TableCell>
                  {ad.startDate ? new Date(ad.startDate).toLocaleDateString() : '—'}
                </TableCell>
                <TableCell>
                  {ad.endDate ? new Date(ad.endDate).toLocaleDateString() : '—'}
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => openEdit(ad)}><EditIcon/></IconButton>
                  <IconButton onClick={() => handleDelete(ad._id)}><DeleteIcon/></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      }

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingAd ? 'Edit Ad' : 'Create Ad'}</DialogTitle>
        <DialogContent sx={{ display: 'grid', gap: 2, mt: 1 }}>
          <TextField
            label="Title"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            fullWidth
          />

          <Button variant="outlined" component="label">
            {file || editingAd ? 'Change Poster' : 'Upload Poster'}
            <input hidden type="file" accept="image/*,.pdf" onChange={handleFileChange} />
          </Button>
          {previewUrl ? (
              /\.(jpe?g|png|gif|bmp|webp)$/i.test(previewUrl) ? (
                <Box
                  component="img"
                  src={previewUrl}
                  alt="Preview"
                  sx={{
                    width: '100%',
                    maxHeight: 200,
                    objectFit: 'contain',
                    border: '1px solid #ddd',
                    borderRadius: 1,
                  }}
                />
              ) : (
                <Typography>
                  Uploaded file: <a href={previewUrl} target="_blank" rel="noopener noreferrer">View</a>
                </Typography>
              )
            ) : (
              <Typography>No preview available</Typography>
            )}

          <TextField
            label="Link (optional)"
            value={form.link}
            onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
            fullWidth
          />

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={form.startDate}
              onChange={date => setForm(f => ({ ...f, startDate: date }))}
              renderInput={props => <TextField {...props} fullWidth />}
            />
            <DatePicker
              label="End Date"
              value={form.endDate}
              onChange={date => setForm(f => ({ ...f, endDate: date }))}
              renderInput={props => <TextField {...props} fullWidth />}
            />
          </LocalizationProvider>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editingAd ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminAdsPage;