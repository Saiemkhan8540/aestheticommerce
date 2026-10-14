import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button
} from "@mui/material";

const Confirm = ({ confirmDelete, close, confirm, cancle}) => {
    return (
        <Dialog open={confirmDelete.open} onClose={close}>
            <DialogTitle>Delete Product?</DialogTitle>
            <DialogContent>
                <Typography>
                    Are you sure you want to delete this product? This action cannot be undone.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={cancle} color="secondary">
                    Cancel
                </Button>
                <Button
                    color="error"
                    onClick={confirm}
                >
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default Confirm