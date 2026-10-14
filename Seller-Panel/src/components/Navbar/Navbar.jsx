import React from 'react';
import './Navbar.css';
import Badge from '@mui/material/Badge';
import { styled } from '@mui/material/styles';
import { FaUserCircle } from 'react-icons/fa';
import Notifications from '../Notifications/Notifications';
import IconButton from '@mui/material/IconButton';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import { Link, useNavigate } from 'react-router-dom';
import logo from "../../Images/Asset9.png";
import { logoutSeller } from '../../Redux/authSlice';
import { useDispatch } from 'react-redux';

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 13,
    border: `2px solid ${(theme.vars ?? theme).palette.background.paper}`,
    padding: '0 4px',
  },
}));

const Navbar = () => {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleToggle = () => setOpen(prev => !prev);

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) return;
    setOpen(false);
  };

  const handleListKeyDown = (event) => {
    if (event.key === 'Tab' || event.key === 'Escape') {
      setOpen(false);
    }
  };

  const prevOpen = React.useRef(open);
  React.useEffect(() => {
    if (prevOpen.current && !open) {
      anchorRef.current?.focus();
    }
    prevOpen.current = open;
  }, [open]);

  const handlerLogout = () => {
    dispatch(logoutSeller());
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/home" className="navbar-logo-link">
          <img src={logo} alt="Aestheticommerce" className="navbar-logo-img-seller" />
          <h2 className="navbar-logo-text-seller">estheticommerce</h2>
        </Link>
      </div>

      <ul className="navbar-links">
        <li><Link to="/home">Dashboard</Link></li>
        <li><Link to="/products">Products</Link></li>
        <li><Link to="/orders">Orders</Link></li>
        <li><Link to="/inventory">Inventory</Link></li>
        <li><Link to="/contact">Contact</Link></li>
        <li><Link to="/my-products">My-Product</Link></li>
      </ul>

      <div className="navbar-right">
        <Notifications />

        <IconButton
          ref={anchorRef}
          aria-controls={open ? 'profile-menu' : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
        >
          <StyledBadge badgeContent={0} color="secondary">
            <img src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png" alt="Avatar" className="avatar-image" />
          </StyledBadge>
        </IconButton>

        <Popper
          open={open}
          anchorEl={anchorRef.current}
          role={undefined}
          placement="bottom-end"
          transition
          disablePortal
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{ transformOrigin: placement === 'bottom-end' ? 'right top' : 'right bottom' }}
            >
              <Paper>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList
                    autoFocusItem={open}
                    id="profile-menu"
                    aria-labelledby="profile-button"
                    onKeyDown={handleListKeyDown}
                  >
                    <MenuItem onClick={(e) => { navigate('/seller/profile'); handleClose(e); }}>
                      Profile
                    </MenuItem>
                    <MenuItem onClick={(e) => { handlerLogout(); handleClose(e); }}>
                      Logout
                    </MenuItem>
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </div>
    </nav>
  );
};

export default Navbar;